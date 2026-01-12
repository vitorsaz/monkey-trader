import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { supabase, updateSystemStatus, upsertToken, recordTrade, createPosition, getOpenPositions, closePosition } from './lib/supabase.js';
import { getTokenInfo, getSolPrice } from './lib/birdeye.js';
import { fetchImageFromIPFS, sleep } from './lib/utils.js';
import { analyzeWithClaude } from './lib/claude.js';
import {
    logHeader, logToken, logBuy, logSell, logSkip, logAnalysis,
    logStatus, logWS, logError, logSuccess, logInfo, logWarning, logPosition, logStats
} from './lib/logger.js';
import {
    loadWallet,
    getWallet,
    getBalance,
    connectPumpPortal,
    subscribeNewTokens,
    isWsConnected,
    buyToken,
    sellToken,
    closeWebSocket
} from './lib/pumpportal.js';

// ═══════════════════════════════════════════════════════════════
// CONFIGURACOES DE TRADING
// ═══════════════════════════════════════════════════════════════
const TRADING_CONFIG = {
    MIN_SCORE_TO_BUY: 75,
    MAX_TRADE_SOL: 0.05,
    STOP_LOSS_PERCENT: -25,
    TAKE_PROFIT_PERCENT: 50,
    POSITION_CHECK_INTERVAL: 30000,
    SLIPPAGE: 10
};

// ═══════════════════════════════════════════════════════════════
// EXPRESS API
// ═══════════════════════════════════════════════════════════════
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
    const wallet = getWallet();
    const balance = await getBalance();
    res.json({
        status: 'ok',
        connected: isWsConnected(),
        wallet: wallet?.publicKey.toBase58() || null,
        balance,
        uptime: process.uptime()
    });
});

app.post('/buy', async (req, res) => {
    const { ca, amount, slippage } = req.body;
    const tx = await buyToken(ca, amount, slippage || TRADING_CONFIG.SLIPPAGE);
    res.json({ success: !!tx, signature: tx });
});

app.post('/sell', async (req, res) => {
    const { ca, percent, slippage } = req.body;
    const tx = await sellToken(ca, percent || 100, slippage || TRADING_CONFIG.SLIPPAGE);
    res.json({ success: !!tx, signature: tx });
});

app.get('/positions', async (req, res) => {
    const positions = await getOpenPositions();
    res.json(positions);
});

app.listen(config.PORT, () => {
    logInfo(`API rodando em http://localhost:${config.PORT}`);
});

// ═══════════════════════════════════════════════════════════════
// PROCESSAR NOVO TOKEN
// ═══════════════════════════════════════════════════════════════
async function processToken(msg) {
    const { mint: ca, name, symbol, uri, marketCapSol } = msg;

    logInfo(`Novo token detectado: ${name || 'Unknown'} (${symbol || '???'})`);

    // 1. Salvar inicial
    await upsertToken({
        ca,
        nome: name || 'Unknown',
        simbolo: symbol || '???',
        status: 'analyzing'
    });

    // 2. Buscar logo via IPFS
    let logo = null;
    if (uri) {
        logo = await fetchImageFromIPFS(uri);
    }

    // 3. Buscar dados Birdeye
    const info = await getTokenInfo(ca);

    // 4. Calcular market cap
    const solPrice = await getSolPrice();
    const mcapFromPump = (marketCapSol || 0) * solPrice;

    const tokenData = {
        name: name || info?.name || 'Unknown',
        symbol: symbol || info?.symbol || '???',
        logo: logo || info?.logo || null,
        mc: mcapFromPump > 0 ? mcapFromPump : (info?.mc || 0),
        price: info?.price || 0,
        holders: info?.holders || 0,
        liquidity: info?.liquidity || 0
    };

    // 5. Analisar com Claude
    const analysis = await analyzeWithClaude(tokenData);
    logAnalysis(tokenData.symbol, analysis.score, analysis.decision);

    // 6. Atualizar no DB
    await upsertToken({
        ca,
        nome: tokenData.name,
        simbolo: tokenData.symbol,
        logo: tokenData.logo,
        market_cap: tokenData.mc,
        preco: tokenData.price,
        holders: tokenData.holders,
        liquidity: tokenData.liquidity,
        claude_score: analysis.score,
        claude_decision: analysis.decision,
        claude_reasons: analysis.reasons,
        claude_red_flags: analysis.redFlags,
        status: analysis.decision === 'BUY' ? 'approved' : 'rejected'
    });

    // Log do token estilo pro
    logToken({
        action: analysis.decision === 'BUY' ? 'BUY' : 'SKIP',
        symbol: tokenData.symbol,
        mc: tokenData.mc,
        mcChange: 0,
        sol: 0,
        vol5m: info?.volume24h || 0,
        volTotal: tokenData.liquidity,
        volPercent: analysis.score,
        extra: `Score: ${analysis.score}`
    });

    // 7. Auto-buy se score >= MIN_SCORE
    if (analysis.score >= TRADING_CONFIG.MIN_SCORE_TO_BUY && analysis.decision === 'BUY') {
        const wallet = getWallet();
        if (wallet) {
            const balance = await getBalance();
            const amountToBuy = Math.min(TRADING_CONFIG.MAX_TRADE_SOL, balance * 0.1);

            if (amountToBuy >= 0.01) {
                const tx = await buyToken(ca, amountToBuy, TRADING_CONFIG.SLIPPAGE);

                if (tx) {
                    logBuy(tokenData.symbol, tokenData.mc, amountToBuy, `TX: ${tx.slice(0, 20)}...`);

                    await recordTrade({
                        token_id: ca,
                        tipo: 'buy',
                        valor_sol: amountToBuy,
                        preco: tokenData.price,
                        tx_signature: tx
                    });

                    await createPosition({
                        token_id: ca,
                        status: 'open',
                        valor_sol: amountToBuy,
                        entry_price: tokenData.price
                    });

                    await upsertToken({ ca, status: 'holding' });
                }
            } else {
                logWarning('Balance insuficiente para compra');
            }
        }
    } else if (analysis.decision !== 'BUY') {
        logSkip(tokenData.symbol, tokenData.mc, `Score: ${analysis.score}`);
    }

    return analysis;
}

// ═══════════════════════════════════════════════════════════════
// MONITORAR POSICOES (SL/TP)
// ═══════════════════════════════════════════════════════════════
async function monitorPositions() {
    const positions = await getOpenPositions();

    for (const position of positions) {
        const info = await getTokenInfo(position.token_id);
        if (!info) continue;

        const pnlPercent = ((info.price - position.entry_price) / position.entry_price) * 100;

        // Atualizar posicao
        await supabase.from('positions').update({
            current_price: info.price,
            pnl_percent: pnlPercent,
            pnl_sol: position.valor_sol * (pnlPercent / 100)
        }).eq('id', position.id);

        logPosition(
            position.tokens?.simbolo || '???',
            position.entry_price,
            info.price,
            pnlPercent,
            position.valor_sol
        );

        // Take Profit
        if (pnlPercent >= TRADING_CONFIG.TAKE_PROFIT_PERCENT) {
            const tx = await sellToken(position.token_id, 100, TRADING_CONFIG.SLIPPAGE);
            if (tx) {
                const pnlSol = position.valor_sol * (pnlPercent / 100);
                logSell(position.tokens?.simbolo, info.mc, position.valor_sol + pnlSol, pnlPercent, 'TP HIT');
                await closePosition(position.id, pnlSol);
                await recordTrade({
                    token_id: position.token_id,
                    tipo: 'sell',
                    valor_sol: position.valor_sol + pnlSol,
                    preco: info.price,
                    pnl_sol: pnlSol,
                    tx_signature: tx
                });
                await upsertToken({ ca: position.token_id, status: 'sold_tp' });
            }
        }

        // Stop Loss
        if (pnlPercent <= TRADING_CONFIG.STOP_LOSS_PERCENT) {
            const tx = await sellToken(position.token_id, 100, TRADING_CONFIG.SLIPPAGE);
            if (tx) {
                const pnlSol = position.valor_sol * (pnlPercent / 100);
                logSell(position.tokens?.simbolo, info.mc, position.valor_sol + pnlSol, pnlPercent, 'SL HIT');
                await closePosition(position.id, pnlSol);
                await recordTrade({
                    token_id: position.token_id,
                    tipo: 'sell',
                    valor_sol: position.valor_sol + pnlSol,
                    preco: info.price,
                    pnl_sol: pnlSol,
                    tx_signature: tx
                });
                await upsertToken({ ca: position.token_id, status: 'sold_sl' });
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// ATUALIZAR STATS
// ═══════════════════════════════════════════════════════════════
async function updateStats() {
    const wallet = getWallet();
    const balance = await getBalance();

    const { data: trades } = await supabase.from('trades').select('*').eq('tipo', 'sell');

    let totalPnl = 0;
    let wins = 0;
    let losses = 0;

    trades?.forEach(t => {
        if (t.pnl_sol) {
            totalPnl += t.pnl_sol;
            if (t.pnl_sol > 0) wins++;
            else losses++;
        }
    });

    const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

    await updateSystemStatus({
        status: 'ONLINE',
        wallet_address: wallet?.publicKey.toBase58() || null,
        balance_sol: balance,
        total_pnl: totalPnl,
        total_trades: (trades?.length || 0),
        wins,
        losses,
        win_rate: winRate
    });
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
    logHeader('MONKEY TRADER BOT INICIANDO...');

    // Carregar wallet
    const wallet = loadWallet();
    if (wallet) {
        const balance = await getBalance();
        logStatus('STARTING', balance, 0, 0, `Wallet: ${wallet.publicKey.toBase58().slice(0, 8)}...`);
    }

    // Status inicial
    await updateSystemStatus({
        status: 'STARTING',
        wallet_address: wallet?.publicKey.toBase58() || null,
        balance_sol: wallet ? await getBalance() : 0
    });

    // Conectar PumpPortal
    connectPumpPortal({
        onConnect: async () => {
            logWS('CONNECTED', 'PumpPortal WebSocket conectado');
            await updateSystemStatus({ status: 'ONLINE' });
            subscribeNewTokens();
        },
        onDisconnect: async () => {
            logWS('DISCONNECTED', 'Tentando reconectar...');
            await updateSystemStatus({ status: 'RECONNECTING' });
        },
        onToken: processToken
    });

    // Loop de monitoramento de posicoes
    setInterval(monitorPositions, TRADING_CONFIG.POSITION_CHECK_INTERVAL);

    // Loop de atualizacao de stats
    setInterval(async () => {
        await updateStats();
        const wallet = getWallet();
        const balance = await getBalance();
        const { data: trades } = await supabase.from('trades').select('*').eq('tipo', 'sell');

        let totalPnl = 0, wins = 0, losses = 0;
        trades?.forEach(t => {
            if (t.pnl_sol) {
                totalPnl += t.pnl_sol;
                if (t.pnl_sol > 0) wins++; else losses++;
            }
        });
        const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

        logStatus('ONLINE', balance, totalPnl, winRate, `${trades?.length || 0} trades`);
    }, 60000);

    logSuccess('Bot iniciado com sucesso!');
}

// ═══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════
async function shutdown(signal) {
    logInfo(`Recebido ${signal}, encerrando graciosamente...`);

    try {
        await updateSystemStatus({ status: 'OFFLINE' });
        logSuccess('Status atualizado para OFFLINE');

        closeWebSocket();
        logSuccess('WebSocket fechado');

        await new Promise(resolve => setTimeout(resolve, 1000));

        logHeader('BOT ENCERRADO');

        process.exit(0);
    } catch (error) {
        logError(`Erro durante shutdown: ${error.message}`);
        process.exit(1);
    }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', async (error) => {
    logError(`Uncaught Exception: ${error.message}`);
    await updateSystemStatus({ status: 'ERROR' });
    process.exit(1);
});
process.on('unhandledRejection', async (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
    await updateSystemStatus({ status: 'ERROR' });
    process.exit(1);
});

main().catch(console.error);
