import chalk from 'chalk';
import fs from 'fs';

// ═══════════════════════════════════════════════════════════════
// LOGS EM ARQUIVO (salva sem cores)
// ═══════════════════════════════════════════════════════════════
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
const logFileName = `./logs/${new Date().toISOString().split('T')[0]}.log`;
const logStream = fs.createWriteStream(logFileName, { flags: 'a' });

function saveToFile(message) {
    const clean = message.replace(/\x1b\[[0-9;]*m/g, ''); // Remove ANSI colors
    logStream.write(clean + '\n');
}

// ═══════════════════════════════════════════════════════════════
// FORMATADORES
// ═══════════════════════════════════════════════════════════════
function padRight(str, len) {
    str = String(str);
    return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

function padLeft(str, len) {
    str = String(str);
    return str.length >= len ? str.slice(0, len) : ' '.repeat(len - str.length) + str;
}

function formatMC(value) {
    if (!value) return '0';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toFixed(2);
}

function formatPercent(value) {
    if (value === undefined || value === null) return '+0%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(0)}%`;
}

function formatSOL(value) {
    if (!value) return '0.00';
    return value.toFixed(2);
}

function formatVol(value) {
    if (!value) return '0';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toFixed(0);
}

function timestamp() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

// Barra de volume colorida
function volumeBar(percent, width = 5) {
    const p = Math.max(0, Math.min(100, percent || 0));
    const filled = Math.round((p / 100) * width);
    const empty = width - filled;

    let color;
    if (p >= 70) color = chalk.bgGreen;
    else if (p >= 40) color = chalk.bgYellow;
    else color = chalk.bgRed;

    return color(' '.repeat(filled)) + chalk.bgGray(' '.repeat(empty));
}

// ═══════════════════════════════════════════════════════════════
// LOG DE TOKEN COMPLETO (estilo pro)
// ═══════════════════════════════════════════════════════════════
export function logToken(data) {
    const {
        action,
        symbol,
        name,
        mc,
        mcChange,
        sol,
        vol5m,
        volTotal,
        volPercent,
        ath,
        athPercent,
        cw,
        vr,
        extra
    } = data;

    let badge;
    switch (action) {
        case 'BUY':
        case 'PURCH':
            badge = chalk.bgGreen.black(` ${padRight(action, 5)} `);
            break;
        case 'SELL':
            badge = chalk.bgRed.white(` ${padRight(action, 5)} `);
            break;
        case 'SKIP':
            badge = chalk.bgYellow.black(` ${padRight(action, 5)} `);
            break;
        default:
            badge = chalk.bgBlue.white(` ${padRight(action || 'INFO', 5)} `);
    }

    const symColor = action === 'BUY' || action === 'PURCH' ? chalk.green :
                     action === 'SELL' ? chalk.red :
                     action === 'SKIP' ? chalk.yellow : chalk.white;

    const mcChgColor = (mcChange || 0) >= 0 ? chalk.green : chalk.red;

    const parts = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        chalk.gray('[') + badge + chalk.gray(']'),
        symColor(padRight(symbol || name || '???', 14)),
        chalk.magenta('MC:'),
        chalk.white(padLeft(formatMC(mc), 9)),
        mcChgColor(padLeft(formatPercent(mcChange), 5)),
        chalk.gray('|'),
        chalk.cyan('SOL:'),
        chalk.white(padLeft(formatSOL(sol), 6)),
        chalk.gray('|'),
        volumeBar(volPercent || 50),
        chalk.gray('|'),
        chalk.gray('5m Vol:'),
        chalk.white(padLeft(formatVol(vol5m), 8)),
        chalk.gray('/'),
        chalk.white(padLeft(formatVol(volTotal), 8)),
        chalk.gray('|'),
    ];

    if (ath !== undefined) {
        parts.push(chalk.cyan('ATH:'));
        parts.push(chalk.white(padLeft(formatPercent(athPercent), 6)));
        parts.push(chalk.gray('|'));
    }

    if (cw !== undefined) {
        parts.push(chalk.cyan('CW:'));
        parts.push(chalk.white(padLeft(formatSOL(cw), 5)));
        parts.push(chalk.gray('|'));
    }

    if (vr !== undefined) {
        parts.push(chalk.cyan('VR:'));
        parts.push(chalk.white(padLeft(vr.toFixed(2), 5)));
        parts.push(chalk.gray('|'));
    }

    if (extra) {
        parts.push(chalk.gray(extra));
    }

    const line = parts.join(' ');
    console.log(line);
    saveToFile(line);
}

// ═══════════════════════════════════════════════════════════════
// LOGS SIMPLIFICADOS
// ═══════════════════════════════════════════════════════════════
export function logBuy(symbol, mc, sol, extra = '') {
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        chalk.bgGreen.black(' BUY   '),
        chalk.green(padRight(symbol, 14)),
        chalk.magenta('MC:'),
        chalk.white(formatMC(mc)),
        chalk.gray('|'),
        chalk.cyan('SOL:'),
        chalk.white(formatSOL(sol)),
        extra ? chalk.gray('| ' + extra) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logSell(symbol, mc, sol, pnl, extra = '') {
    const pnlColor = pnl >= 0 ? chalk.green : chalk.red;
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        chalk.bgRed.white(' SELL  '),
        chalk.red(padRight(symbol, 14)),
        chalk.magenta('MC:'),
        chalk.white(formatMC(mc)),
        chalk.gray('|'),
        chalk.cyan('PnL:'),
        pnlColor(formatPercent(pnl)),
        chalk.gray('|'),
        chalk.cyan('SOL:'),
        chalk.white(formatSOL(sol)),
        extra ? chalk.gray('| ' + extra) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logSkip(symbol, mc, reason) {
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        chalk.bgYellow.black(' SKIP  '),
        chalk.yellow(padRight(symbol, 14)),
        chalk.magenta('MC:'),
        chalk.white(formatMC(mc)),
        chalk.gray('|'),
        chalk.gray(reason)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logAnalysis(symbol, score, decision, thought = '') {
    const scoreColor = score >= 75 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;
    const decBadge = decision === 'BUY' ? chalk.bgGreen.black(' BUY ') : chalk.bgRed.white(' SKIP ');
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        chalk.bgMagenta.white('  AI   '),
        chalk.white(padRight(symbol, 14)),
        chalk.cyan('Score:'),
        scoreColor(padLeft(String(score), 3)),
        chalk.gray('|'),
        decBadge,
        thought ? chalk.gray('| ' + thought) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logTrade(type, symbol, sol, tx) {
    const badge = type === 'buy' ? chalk.bgGreen.black(' BUY   ') : chalk.bgRed.white(' SELL  ');
    const symColor = type === 'buy' ? chalk.green : chalk.red;
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        badge,
        symColor(padRight(symbol, 14)),
        chalk.cyan('SOL:'),
        chalk.white(formatSOL(sol)),
        chalk.gray('|'),
        chalk.gray('TX:'),
        chalk.blue(tx ? tx.slice(0, 20) + '...' : 'pending')
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logPosition(symbol, entryPrice, currentPrice, pnlPercent, sol) {
    const pnlColor = pnlPercent >= 0 ? chalk.green : chalk.red;
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        chalk.bgCyan.black(' POS   '),
        chalk.white(padRight(symbol, 14)),
        chalk.gray('Entry:'),
        chalk.white(entryPrice.toFixed(8)),
        chalk.gray('|'),
        chalk.gray('Now:'),
        chalk.white(currentPrice.toFixed(8)),
        chalk.gray('|'),
        chalk.cyan('PnL:'),
        pnlColor(formatPercent(pnlPercent)),
        chalk.gray('|'),
        chalk.cyan('SOL:'),
        chalk.white(formatSOL(sol))
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

// ═══════════════════════════════════════════════════════════════
// LOGS DE SISTEMA
// ═══════════════════════════════════════════════════════════════
export function logStatus(status, balance, pnl, winRate, extra = '') {
    const pnlColor = pnl >= 0 ? chalk.green : chalk.red;
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        chalk.bgCyan.black(' SYS   '),
        chalk.white(padRight(status, 12)),
        chalk.gray('|'),
        chalk.cyan('Bal:'),
        chalk.white(formatSOL(balance) + ' SOL'),
        chalk.gray('|'),
        chalk.cyan('PnL:'),
        pnlColor((pnl >= 0 ? '+' : '') + formatSOL(pnl) + ' SOL'),
        chalk.gray('|'),
        chalk.cyan('WR:'),
        chalk.white(winRate.toFixed(1) + '%'),
        extra ? chalk.gray('| ' + extra) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logWS(event, message = '') {
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        chalk.bgBlue.white('  WS   '),
        chalk.blue(padRight(event, 12)),
        message ? chalk.gray('| ' + message) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logError(message) {
    const line = [
        chalk.gray(timestamp()),
        chalk.red('[ERROR]'),
        chalk.bgRed.white(' ERR   '),
        chalk.red(message)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logSuccess(message) {
    const line = [
        chalk.gray(timestamp()),
        chalk.green('[INFO]'),
        chalk.bgGreen.black('  OK   '),
        chalk.green(message)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logInfo(message) {
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[INFO]'),
        chalk.bgGray.white(' INFO  '),
        chalk.white(message)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logWarning(message) {
    const line = [
        chalk.gray(timestamp()),
        chalk.yellow('[WARN]'),
        chalk.bgYellow.black(' WARN  '),
        chalk.yellow(message)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

// ═══════════════════════════════════════════════════════════════
// HEADERS E SEPARADORES
// ═══════════════════════════════════════════════════════════════
export function logHeader(title) {
    console.log('');
    console.log(chalk.cyan('═'.repeat(70)));
    console.log(chalk.cyan('  ' + title));
    console.log(chalk.cyan('═'.repeat(70)));
    console.log('');
    saveToFile(`\n${'═'.repeat(70)}\n  ${title}\n${'═'.repeat(70)}\n`);
}

export function logSeparator() {
    const line = chalk.gray('─'.repeat(70));
    console.log(line);
    saveToFile('─'.repeat(70));
}

export function logBox(lines, color = 'cyan') {
    const colorFn = chalk[color] || chalk.cyan;
    const maxLen = Math.max(...lines.map(l => l.length));
    const top = colorFn('╔' + '═'.repeat(maxLen + 2) + '╗');
    const bot = colorFn('╚' + '═'.repeat(maxLen + 2) + '╝');

    console.log(top);
    lines.forEach(line => {
        console.log(colorFn('║ ') + chalk.white(padRight(line, maxLen)) + colorFn(' ║'));
    });
    console.log(bot);
}

export function logStats(stats) {
    const { balance, pnl, winRate, wins, losses, totalTrades } = stats;
    const pnlColor = pnl >= 0 ? chalk.green : chalk.red;

    console.log('');
    console.log(chalk.cyan('╔════════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.white('                           STATS                                   ') + chalk.cyan('║'));
    console.log(chalk.cyan('╠════════════════════════════════════════════════════════════════════╣'));
    console.log(chalk.cyan('║') + `  Balance: ${chalk.white(formatSOL(balance) + ' SOL')}`.padEnd(69) + chalk.cyan('║'));
    console.log(chalk.cyan('║') + `  PnL:     ${pnlColor((pnl >= 0 ? '+' : '') + formatSOL(pnl) + ' SOL')}`.padEnd(78) + chalk.cyan('║'));
    console.log(chalk.cyan('║') + `  Win Rate: ${chalk.white(winRate.toFixed(1) + '%')} (${chalk.green(wins + 'W')} / ${chalk.red(losses + 'L')})`.padEnd(78) + chalk.cyan('║'));
    console.log(chalk.cyan('║') + `  Trades:  ${chalk.white(totalTrades)}`.padEnd(69) + chalk.cyan('║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝'));
    console.log('');
}
