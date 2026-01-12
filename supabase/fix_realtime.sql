-- Remover e re-adicionar
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tokens;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.system_status;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.trades;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.positions;

-- REPLICA IDENTITY (obrigatorio para UPDATE/DELETE realtime)
ALTER TABLE public.tokens REPLICA IDENTITY FULL;
ALTER TABLE public.system_status REPLICA IDENTITY FULL;
ALTER TABLE public.trades REPLICA IDENTITY FULL;
ALTER TABLE public.positions REPLICA IDENTITY FULL;

-- Adicionar ao realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.positions;

-- RLS
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read" ON public.tokens;
DROP POLICY IF EXISTS "public_read" ON public.system_status;
DROP POLICY IF EXISTS "public_read" ON public.trades;
DROP POLICY IF EXISTS "public_read" ON public.positions;

CREATE POLICY "public_read" ON public.tokens FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.system_status FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.trades FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.positions FOR SELECT USING (true);
