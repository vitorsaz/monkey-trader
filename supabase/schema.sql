-- System Status
CREATE TABLE IF NOT EXISTS system_status (
    id INT PRIMARY KEY DEFAULT 1,
    status TEXT DEFAULT 'OFFLINE',
    wallet_address TEXT,
    balance_sol DECIMAL(20, 9) DEFAULT 0,
    total_pnl DECIMAL(20, 9) DEFAULT 0,
    total_trades INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_status (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Tokens
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ca TEXT UNIQUE NOT NULL,
    nome TEXT,
    simbolo TEXT,
    logo TEXT,
    market_cap DECIMAL(20, 2),
    preco DECIMAL(30, 18),
    holders INT,
    liquidity DECIMAL(20, 2),
    volume_24h DECIMAL(20, 2),
    claude_score INT,
    claude_decision TEXT,
    claude_reasons TEXT[],
    claude_red_flags TEXT[],
    status TEXT DEFAULT 'analyzing',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Trades
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id TEXT REFERENCES tokens(ca),
    tipo TEXT NOT NULL,
    valor_sol DECIMAL(20, 9),
    preco DECIMAL(30, 18),
    pnl_sol DECIMAL(20, 9),
    tx_signature TEXT,
    data TIMESTAMPTZ DEFAULT NOW()
);

-- Positions
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id TEXT REFERENCES tokens(ca),
    status TEXT DEFAULT 'open',
    valor_sol DECIMAL(20, 9),
    entry_price DECIMAL(30, 18),
    current_price DECIMAL(30, 18),
    pnl_percent DECIMAL(10, 2),
    pnl_sol DECIMAL(20, 9),
    aberto_em TIMESTAMPTZ DEFAULT NOW(),
    fechado_em TIMESTAMPTZ
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_tokens_ca ON tokens(ca);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
CREATE INDEX IF NOT EXISTS idx_trades_data ON trades(data DESC);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
