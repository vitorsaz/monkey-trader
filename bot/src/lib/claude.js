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
                max_tokens: 1500,
                messages: [{
                    role: 'user',
                    content: `You are Tom, a monkey trader analyzing memecoins on Solana.

Analyze this token:

Name: ${tokenInfo.name}
Symbol/Ticker: ${tokenInfo.symbol}
Market Cap: $${tokenInfo.mc?.toLocaleString() || 0}
Liquidity: $${tokenInfo.liquidity?.toLocaleString() || 0}
Holders: ${tokenInfo.holders || 0}
Price: $${tokenInfo.price || 0}
Description: ${tokenInfo.description || 'None'}
Image URL: ${tokenInfo.imageUrl || 'None'}

Evaluate these criteria:

1. NARRATIVE (0-100): How strong is the meme/story? Is it trendy? Does it tap into current events, crypto culture, or viral potential?

2. TICKER (0-100): Is the symbol catchy? Easy to remember? Does it match the narrative well?

3. IMAGE (0-100): Based on the name/concept, would the token likely have good branding? Memorable mascot potential?

4. OVERALL SCORE (0-100): Combined assessment

5. DECISION: BUY if score >= 65, AVOID otherwise

Respond ONLY in valid JSON format:
{
  "score": number,
  "narrative_score": number,
  "ticker_score": number,
  "image_score": number,
  "decision": "BUY" | "AVOID",
  "analysis_reason": "2-3 sentences explaining why you would or wouldn't buy this token. Be specific about narrative strength, ticker appeal, and overall vibe.",
  "red_flags": ["list", "of", "concerns"]
}`
                }]
            })
        });

        const data = await response.json();

        if (!data.content || !data.content[0]) {
            throw new Error('Invalid response from Claude');
        }

        const text = data.content[0].text;

        // Try to extract JSON from the response
        let jsonStr = text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        const result = JSON.parse(jsonStr);

        return {
            score: result.score || 0,
            narrative_score: result.narrative_score || 0,
            ticker_score: result.ticker_score || 0,
            image_score: result.image_score || 0,
            decision: result.decision || 'AVOID',
            analysis_reason: result.analysis_reason || 'No analysis provided',
            red_flags: result.red_flags || []
        };
    } catch (e) {
        console.error('[CLAUDE] Error:', e.message);
        return {
            score: 0,
            narrative_score: 0,
            ticker_score: 0,
            image_score: 0,
            decision: 'AVOID',
            analysis_reason: 'Analysis failed: ' + e.message,
            red_flags: ['Analysis error']
        };
    }
}
