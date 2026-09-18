// Client side service for OpenRouter API streaming and non-streaming calls
import { OPENROUTER_MODEL_IDS } from '../data/models';

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: any) => void;
}

const getOpenRouterKey = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any).VITE_OPENROUTER_API_KEY) {
    return (import.meta.env as any).VITE_OPENROUTER_API_KEY;
  }
  try {
    return atob('c2stb3ItdjEtYzU5ZjlhNjYyODhlZjkxOGViYjZlYmU2MWQxYmQxNDlhM2U0N2JkMDhmY2JmN2U5OTc2ZjE1ZjIxYWIxMDcyOA==');
  } catch {
    return '';
  }
};

/**
 * Sends chat prompt to OpenRouter and streams chunks back
 */
export async function streamOpenRouterChat(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  modelId?: string,
  callbacks?: StreamCallbacks
) {
  // Determine exact model identifier for OpenRouter
  let targetModel = 'openai/gpt-4o-mini';
  if (modelId && OPENROUTER_MODEL_IDS[modelId]) {
    targetModel = OPENROUTER_MODEL_IDS[modelId];
  }

  const messages = [
    {
      role: 'system',
      content:
        'You are AI Ashokra, an intelligent, helpful, and highly articulate AI assistant. Format your responses with high professional rigor using GitHub-flavored Markdown. When presenting comparative data, structured lists, or metrics, format them as clean Markdown tables with header rows and dividers. Use bold text for key concepts, bullet lists for enumerations, and syntax-highlighted code blocks where applicable. Ensure your Markdown formatting is clean, readable, and properly closed.',
    },
    ...history,
    { role: 'user', content: prompt },
  ];

  try {
    const apiKey = getOpenRouterKey();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Ashokra',
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('OpenRouter direct stream returned status:', response.status, errText);
      throw new Error(`OpenRouter error (${response.status}): ${errText}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        if (trimmed === 'data: [DONE]') continue;

        try {
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            callbacks?.onChunk(delta);
          }
        } catch (e) {
          // ignore parsing error for fragmented SSE events
        }
      }
    }

    callbacks?.onDone(fullText);
    return fullText;
  } catch (err) {
    console.error('streamOpenRouterChat error:', err);
    callbacks?.onError(err);
    throw err;
  }
}
