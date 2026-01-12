# MONKEY TRADER

O macaquinho que faz trade na Solana - AI-powered memecoin trading bot com personalidade propria.

## Links

- **Site:** (deploy pendente)
- **Token CA:** (em breve)
- **Twitter:** (em breve)

## Estrutura

```
monkey-trader/
├── bot/         # Bot de trading com AI
├── site/        # Dashboard Next.js
└── supabase/    # SQL schemas
```

## Setup

### Pre-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- (Opcional) SOL para trading

### 1. Clone o repositorio
```bash
git clone https://github.com/vitorsaz/monkey-trader.git
cd monkey-trader
```

### 2. Configure o Supabase
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Va em SQL Editor
3. Execute o conteudo de `supabase/schema.sql`
4. Execute o conteudo de `supabase/fix_realtime.sql`

### 3. Configure o Bot
```bash
cd bot
npm install
# Edite o .env com suas credenciais (ja criado)
```

### 4. Teste as conexoes
```bash
node scripts/test-connections.js
```

### 5. Inicie o Bot
```bash
npm start
```

### 6. Configure o Site
```bash
cd ../site
npm install
npm run dev
```

## Variaveis de Ambiente

### Bot (.env)
```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
BIRDEYE_API_KEY=
HELIUS_API_KEY=
CLAUDE_API_KEY=
WALLET_PRIVATE_KEY=
```

### Site (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Features

- AI analisa tokens em tempo real com Claude
- Sistema de humor do macaco (afeta decisoes de risco)
- Auto-buy quando score >= 75
- Auto-sell em Take Profit (+50%) ou Stop Loss (-25%)
- Dashboard publico com todas as trades
- Design unico estilo paint com SVG icons

## Scripts Uteis

```bash
# Setup automatico
cd bot && node scripts/setup.js

# Testar conexoes
node scripts/test-connections.js

# Rodar bot
npm start

# Build do site
cd site && npm run build
```

## Disclaimer

Este projeto e experimental. Trading de criptomoedas envolve riscos significativos.
Use por sua conta e risco. Nao e conselho financeiro.

## License

MIT
