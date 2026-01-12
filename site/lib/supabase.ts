import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Trade = {
  id: string;
  token_id: string;
  tipo: 'buy' | 'sell';
  valor_sol: number;
  preco: number;
  pnl_sol?: number;
  tx_signature?: string;
  narrative_score?: number;
  ticker_score?: number;
  image_score?: number;
  analysis_reason?: string;
  created_at: string;
  tokens?: {
    nome: string;
    simbolo: string;
    logo?: string;
  };
};

export type Token = {
  ca: string;
  nome: string;
  simbolo: string;
  logo?: string;
  market_cap?: number;
  preco?: number;
  holders?: number;
  liquidity?: number;
  score?: number;
  narrative_score?: number;
  ticker_score?: number;
  image_score?: number;
  analysis_reason?: string;
  status: string;
  created_at: string;
};

export type SystemStatus = {
  id: string;
  status: string;
  wallet_address?: string;
  balance_sol?: number;
  total_pnl?: number;
  total_trades?: number;
  wins?: number;
  losses?: number;
  win_rate?: number;
  updated_at: string;
};

export type WalletBalance = {
  wallet_address: string;
  sol_balance: number;
  updated_at: string;
};
