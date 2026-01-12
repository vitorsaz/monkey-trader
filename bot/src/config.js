import 'dotenv/config';

export const config = {
    // PumpPortal
    PUMPPORTAL_WS: 'wss://pumpportal.fun/api/data',
    PUMPPORTAL_TRADE: 'https://pumpportal.fun/api/trade-local',

    // Birdeye (do .env)
    BIRDEYE_API_KEY: process.env.BIRDEYE_API_KEY,
    BIRDEYE_META: 'https://public-api.birdeye.so/defi/v3/token/meta-data/multiple',
    BIRDEYE_MARKET: 'https://public-api.birdeye.so/defi/v3/token/market-data/multiple',
    BIRDEYE_OVERVIEW: 'https://public-api.birdeye.so/defi/token_overview',
    BIRDEYE_PRICE: 'https://public-api.birdeye.so/defi/price',

    // Helius (do .env)
    HELIUS_API_KEY: process.env.HELIUS_API_KEY,
    HELIUS_RPC: `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
    HELIUS_API: 'https://api.helius.xyz/v0',

    // Claude (do .env)
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,

    // Supabase (do .env)
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,

    // Wallet (do .env)
    WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY,

    // Server
    PORT: parseInt(process.env.PORT) || 3001
};

// Validação
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'BIRDEYE_API_KEY', 'HELIUS_API_KEY'];
const missing = required.filter(k => !config[k] && !process.env[k]);
if (missing.length > 0) {
    console.error('❌ Variáveis faltando:', missing.join(', '));
    process.exit(1);
}
