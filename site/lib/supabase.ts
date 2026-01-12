import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════
// LAZY INITIALIZATION (evita erro no build do Vercel)
// ═══════════════════════════════════════════════════════════════
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (supabaseInstance) return supabaseInstance;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        if (typeof window === 'undefined') {
            console.warn('[SUPABASE] Env vars not available during build');
            return createClient('https://placeholder.supabase.co', 'placeholder');
        }
        throw new Error('Missing Supabase environment variables');
    }

    supabaseInstance = createClient(url, key);
    return supabaseInstance;
}

export const supabase = typeof window !== 'undefined' ? getSupabase() : null;

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════
export interface Token {
    id: string;
    ca: string;
    nome: string;
    simbolo: string;
    logo: string | null;
    market_cap: number;
    preco: number;
    holders: number;
    liquidity: number;
    claude_score: number | null;
    claude_decision: string | null;
    status: string;
    criado_em: string;
}

export interface Trade {
    id: string;
    token_id: string;
    tipo: 'buy' | 'sell';
    valor_sol: number;
    preco: number;
    pnl_sol: number | null;
    tx_signature: string;
    data: string;
    tokens?: Token;
}

export interface Position {
    id: string;
    token_id: string;
    status: 'open' | 'closed';
    valor_sol: number;
    entry_price: number;
    current_price: number;
    pnl_percent: number;
    pnl_sol: number;
    aberto_em: string;
    tokens?: Token;
}

export interface SystemStatus {
    id: number;
    status: string;
    wallet_address: string | null;
    balance_sol: number;
    total_pnl: number;
    total_trades: number;
    wins: number;
    losses: number;
    win_rate: number;
    updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// HOOKS DE REALTIME
// ═══════════════════════════════════════════════════════════════
export function subscribeToTokens(callback: (token: Token) => void) {
    const client = getSupabase();
    return client
        .channel('tokens')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, (payload) => {
            callback(payload.new as Token);
        })
        .subscribe();
}

export function subscribeToStatus(callback: (status: SystemStatus) => void) {
    const client = getSupabase();
    return client
        .channel('status')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, (payload) => {
            callback(payload.new as SystemStatus);
        })
        .subscribe();
}

export function subscribeToTrades(callback: (trade: Trade) => void) {
    const client = getSupabase();
    return client
        .channel('trades')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trades' }, (payload) => {
            callback(payload.new as Trade);
        })
        .subscribe();
}

export function subscribeToPositions(callback: (position: Position) => void) {
    const client = getSupabase();
    return client
        .channel('positions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'positions' }, (payload) => {
            callback(payload.new as Position);
        })
        .subscribe();
}
