#!/usr/bin/env node
/**
 * Testa todas as conexoes antes de rodar o bot
 * Uso: node scripts/test-connections.js
 */

import 'dotenv/config';

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              TESTANDO CONEXOES                             ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

const results = {
    supabase: false,
    birdeye: false,
    helius: false,
    pumpportal: false,
    claude: false
};

// Test Supabase
async function testSupabase() {
    console.log('[1/5] Testando Supabase...');
    try {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.log('      ERRO - SUPABASE_URL ou SUPABASE_ANON_KEY nao configurado');
            return;
        }

        const response = await fetch(`${url}/rest/v1/`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        if (response.ok || response.status === 404) {
            console.log('      OK - Supabase conectado!');
            results.supabase = true;
        } else {
            console.log(`      ERRO - Supabase: ${response.status}`);
        }
    } catch (e) {
        console.log(`      ERRO - Supabase: ${e.message}`);
    }
}

// Test Birdeye
async function testBirdeye() {
    console.log('[2/5] Testando Birdeye...');
    try {
        const apiKey = process.env.BIRDEYE_API_KEY;

        if (!apiKey) {
            console.log('      ERRO - BIRDEYE_API_KEY nao configurado');
            return;
        }

        const response = await fetch(
            'https://public-api.birdeye.so/defi/price?address=So11111111111111111111111111111111111111112',
            { headers: { 'X-API-KEY': apiKey, 'x-chain': 'solana' } }
        );

        const data = await response.json();

        if (data.success) {
            console.log(`      OK - Birdeye! (SOL = $${data.data.value.toFixed(2)})`);
            results.birdeye = true;
        } else {
            console.log(`      ERRO - Birdeye: ${data.message || 'Unknown'}`);
        }
    } catch (e) {
        console.log(`      ERRO - Birdeye: ${e.message}`);
    }
}

// Test Helius
async function testHelius() {
    console.log('[3/5] Testando Helius RPC...');
    try {
        const apiKey = process.env.HELIUS_API_KEY;

        if (!apiKey) {
            console.log('      ERRO - HELIUS_API_KEY nao configurado');
            return;
        }

        const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getHealth'
            })
        });

        const data = await response.json();

        if (data.result === 'ok') {
            console.log('      OK - Helius RPC!');
            results.helius = true;
        } else {
            console.log(`      ERRO - Helius: ${JSON.stringify(data.error)}`);
        }
    } catch (e) {
        console.log(`      ERRO - Helius: ${e.message}`);
    }
}

// Test PumpPortal WebSocket
async function testPumpPortal() {
    console.log('[4/5] Testando PumpPortal WebSocket...');
    try {
        const WebSocket = (await import('ws')).default;

        await new Promise((resolve, reject) => {
            const ws = new WebSocket('wss://pumpportal.fun/api/data');
            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('Timeout'));
            }, 5000);

            ws.on('open', () => {
                clearTimeout(timeout);
                console.log('      OK - PumpPortal WebSocket!');
                results.pumpportal = true;
                ws.close();
                resolve();
            });

            ws.on('error', (e) => {
                clearTimeout(timeout);
                reject(e);
            });
        });
    } catch (e) {
        console.log(`      ERRO - PumpPortal: ${e.message}`);
    }
}

// Test Claude (opcional)
async function testClaude() {
    console.log('[5/5] Testando Claude AI...');
    try {
        const apiKey = process.env.CLAUDE_API_KEY;

        if (!apiKey) {
            console.log('      AVISO - CLAUDE_API_KEY nao configurado (opcional)');
            return;
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Say "OK"' }]
            })
        });

        if (response.ok) {
            console.log('      OK - Claude AI!');
            results.claude = true;
        } else {
            const data = await response.json();
            console.log(`      ERRO - Claude: ${data.error?.message || response.status}`);
        }
    } catch (e) {
        console.log(`      ERRO - Claude: ${e.message}`);
    }
}

// Run all tests
async function runTests() {
    await testSupabase();
    await testBirdeye();
    await testHelius();
    await testPumpPortal();
    await testClaude();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('RESULTADO:');
    console.log('');

    const required = ['supabase', 'birdeye', 'helius', 'pumpportal'];
    const allRequiredOk = required.every(k => results[k]);

    Object.entries(results).forEach(([name, ok]) => {
        const status = ok ? 'OK' : 'ERRO';
        const optional = name === 'claude' ? ' (opcional)' : '';
        console.log(`  [${status}] ${name}${optional}`);
    });

    console.log('');

    if (allRequiredOk) {
        console.log('Tudo OK! Pode rodar: npm start');
    } else {
        console.log('AVISO: Corrija os erros acima antes de rodar o bot.');
    }

    console.log('═══════════════════════════════════════════════════════════════');
}

runTests().catch(console.error);
