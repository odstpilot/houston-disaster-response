export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userMessage, context, searchResults } = req.body || {};
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        message: "I'm unable to access the AI service right now. Please try again later or use the built-in guidance.",
      });
    }

    const systemPrompt = buildSystemPrompt(context, searchResults);

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage || '' }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ message: assistantMessage });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}

function buildSystemPrompt(context = {}, searchResults) {
  let prompt = `You are an expert Houston Disaster Response Assistant. Provide accurate, actionable guidance with clear, simple language.`;
  if (searchResults?.results?.length) {
    prompt += `\n\nRecent info:`;
    for (const r of searchResults.results.slice(0, 3)) {
      prompt += `\n- ${r.title || ''}: ${(r.content || '').slice(0, 160)}...`;
    }
  }
  if (context?.userProfile) {
    prompt += `\n\nUser context: ${JSON.stringify(context.userProfile).slice(0, 300)}`;
  }
  return prompt;
}


