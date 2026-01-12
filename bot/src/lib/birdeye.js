import { config } from '../config.js';
import { withRetry } from './utils.js';

const HEADERS = { 'X-API-KEY': config.BIRDEYE_API_KEY, 'x-chain': 'solana' };

let solPriceUsd = 0;
let solPriceLastUpdate = 0;

// Fetch com retry automático
async function fetchWithRetry(url, options = {}) {
    return withRetry(async () => {
        const r = await fetch(url, { headers: HEADERS, ...options });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
    }, { retries: 3, delay: 1000 });
}

export async function getSolPrice() {
    const now = Date.now();
    if (solPriceUsd > 0 && now - solPriceLastUpdate < 60000) return solPriceUsd;
    try {
        const json = await fetchWithRetry(`${config.BIRDEYE_PRICE}?address=So11111111111111111111111111111111111111112`);
        if (json.success && json.data?.value) {
            solPriceUsd = json.data.value;
            solPriceLastUpdate = now;
        }
    } catch (e) { console.error('[BIRDEYE] SOL price error:', e.message); }
    return solPriceUsd > 0 ? solPriceUsd : 200;
}

export async function getTokenMetadata(ca) {
    try {
        const json = await fetchWithRetry(`${config.BIRDEYE_META}?list_address=${ca}`);
        if (json.success && json.data?.[ca]) {
            const d = json.data[ca];
            return { name: d.name, symbol: d.symbol, logo: d.logo_uri, decimals: d.decimals };
        }
    } catch (e) { console.error('[BIRDEYE] Metadata error:', e.message); }
    return null;
}

export async function getTokenMarket(ca) {
    try {
        const json = await fetchWithRetry(`${config.BIRDEYE_MARKET}?list_address=${ca}`);
        if (json.success && json.data?.[ca]) {
            const d = json.data[ca];
            return {
                price: d.price || 0,
                mc: d.marketCap || d.realMc || 0,
                liquidity: d.liquidity || 0,
                volume24h: d.v24hUSD || 0,
                holders: d.holder || 0
            };
        }
    } catch (e) { console.error('[BIRDEYE] Market error:', e.message); }
    return null;
}

export async function getTokenInfo(ca) {
    const [metadata, market] = await Promise.all([getTokenMetadata(ca), getTokenMarket(ca)]);
    if (!metadata && !market) return null;
    return {
        name: metadata?.name || 'Unknown',
        symbol: metadata?.symbol || '???',
        logo: metadata?.logo || null,
        decimals: metadata?.decimals || 9,
        price: market?.price || 0,
        mc: market?.mc || 0,
        liquidity: market?.liquidity || 0,
        volume24h: market?.volume24h || 0,
        holders: market?.holders || 0
    };
}

// Token Overview completo (inclui socials)
export async function getTokenOverview(ca) {
    try {
        const json = await fetchWithRetry(`${config.BIRDEYE_OVERVIEW}?address=${ca}`);
        if (json.success && json.data) {
            const d = json.data;
            return {
                name: d.name,
                symbol: d.symbol,
                logo: d.logoURI,
                price: d.price,
                mc: d.mc,
                liquidity: d.liquidity,
                holders: d.holder,
                twitter: d.extensions?.twitter || null,
                telegram: d.extensions?.telegram || null,
                website: d.extensions?.website || null,
                description: d.extensions?.description || null
            };
        }
    } catch (e) { console.error('[BIRDEYE] Overview error:', e.message); }
    return null;
}
