-- Update schema to include analysis fields
-- Run this in Supabase SQL Editor

-- Add analysis columns to tokens table
ALTER TABLE public.tokens
ADD COLUMN IF NOT EXISTS narrative_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ticker_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analysis_reason TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add analysis columns to trades table
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS narrative_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ticker_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analysis_reason TEXT;

-- Create wallet_balance table for real-time balance tracking
CREATE TABLE IF NOT EXISTS public.wallet_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    sol_balance DECIMAL(20, 9) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial wallet record
INSERT INTO public.wallet_balance (wallet_address, sol_balance)
VALUES ('HGBcUnK1VaSfDvEozcggkkesDrraKujP9RCJFX4cxAF3', 0)
ON CONFLICT DO NOTHING;

-- Add REPLICA IDENTITY for realtime
ALTER TABLE public.wallet_balance REPLICA IDENTITY FULL;

-- Add to realtime publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_balance;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- RLS for wallet_balance
ALTER TABLE public.wallet_balance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read" ON public.wallet_balance;
CREATE POLICY "public_read" ON public.wallet_balance FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON public.trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tokens_score ON public.tokens(score DESC);
CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON public.tokens(created_at DESC);

SELECT 'Schema updated successfully!' as result;
