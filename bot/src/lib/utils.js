// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function formatSOL(amount) {
    return parseFloat(amount).toFixed(4);
}

export function formatMarketCap(value) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return `${value.toFixed(2)}`;
}

export function truncateAddress(addr, chars = 4) {
    if (!addr) return '';
    return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function isValidSolanaAddress(address) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// ═══════════════════════════════════════════════════════════════
// RETRY LOGIC (para APIs que falham às vezes)
// ═══════════════════════════════════════════════════════════════
export async function withRetry(fn, options = {}) {
    const { retries = 3, delay = 1000, backoff = 2, onRetry = null } = options;
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === retries) break;

            const waitTime = delay * Math.pow(backoff, attempt - 1);

            if (onRetry) {
                onRetry(attempt, retries, error, waitTime);
            } else {
                console.log(`[RETRY] Tentativa ${attempt}/${retries} falhou. Aguardando ${waitTime}ms...`);
            }

            await sleep(waitTime);
        }
    }

    throw lastError;
}

// ═══════════════════════════════════════════════════════════════
// IPFS GATEWAYS (fallback)
// ═══════════════════════════════════════════════════════════════
export async function fetchImageFromIPFS(metadataUri) {
    if (!metadataUri) return null;
    try {
        let url = metadataUri;
        const ipfsMatch = metadataUri.match(/ipfs[./]+(Qm[a-zA-Z0-9]+|bafk[a-zA-Z0-9]+)/i);
        if (ipfsMatch) url = `https://nftstorage.link/ipfs/${ipfsMatch[1]}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) return null;

        const json = await response.json();
        let imageUrl = json.image || json.imageUrl || null;

        if (imageUrl) {
            const imgMatch = imageUrl.match(/ipfs[./]+(Qm[a-zA-Z0-9]+|bafk[a-zA-Z0-9]+)/i);
            if (imgMatch) imageUrl = `https://nftstorage.link/ipfs/${imgMatch[1]}`;
        }
        return imageUrl;
    } catch { return null; }
}
