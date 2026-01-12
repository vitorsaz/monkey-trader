import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_KEY || config.SUPABASE_ANON_KEY
);

export async function updateSystemStatus(data) {
    const { error } = await supabase
        .from('system_status')
        .upsert({ id: 1, ...data, updated_at: new Date().toISOString() });
    if (error) console.error('[SUPABASE] Status error:', error.message);
    return !error;
}

export async function upsertToken(token) {
    const { data, error } = await supabase
        .from('tokens')
        .upsert({ ...token, atualizado_em: new Date().toISOString() }, { onConflict: 'ca' })
        .select()
        .single();
    if (error) console.error('[SUPABASE] Token error:', error.message);
    return data;
}

export async function getToken(ca) {
    const { data } = await supabase.from('tokens').select('*').eq('ca', ca).single();
    return data;
}

export async function recordTrade(trade) {
    const { data, error } = await supabase.from('trades').insert(trade).select().single();
    if (error) console.error('[SUPABASE] Trade error:', error.message);
    return data;
}

export async function createPosition(position) {
    const { data, error } = await supabase.from('positions').insert(position).select().single();
    if (error) console.error('[SUPABASE] Position error:', error.message);
    return data;
}

export async function getOpenPositions() {
    const { data } = await supabase.from('positions').select('*, tokens(*)').eq('status', 'open');
    return data || [];
}

export async function closePosition(id, pnl) {
    const { data, error } = await supabase
        .from('positions')
        .update({ status: 'closed', pnl_sol: pnl, fechado_em: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) console.error('[SUPABASE] Close error:', error.message);
    return data;
}
