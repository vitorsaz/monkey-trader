import { config } from '../config.js';

export async function analyzeWithClaude(tokenInfo) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': config.CLAUDE_API_KEY,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: `Analyze this memecoin for trading:

Name: ${tokenInfo.name}
Symbol: ${tokenInfo.symbol}
Market Cap: ${tokenInfo.mc?.toLocaleString() || 0}
Liquidity: ${tokenInfo.liquidity?.toLocaleString() || 0}
Holders: ${tokenInfo.holders || 0}
Price: ${tokenInfo.price || 0}

Give me:
1. Score 0-100
2. Decision: BUY or AVOID
3. 3 reasons max
4. Red flags if any

Respond ONLY in JSON:
{"score":number,"decision":"BUY"|"AVOID","reasons":["..."],"redFlags":["..."]}`
                }]
            })
        });
        const data = await response.json();
        const text = data.content[0].text;
        return JSON.parse(text);
    } catch (e) {
        console.error('[CLAUDE] Erro:', e.message);
        return { score: 0, decision: 'AVOID', reasons: ['Analysis failed'], redFlags: [] };
    }
}
