// server.ts - Full stack Express proxy for OpenRouter API and SPA serving
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// OpenRouter API key fallback
const FALLBACK_KEY = Buffer.from(
  'c2stb3ItdjEtYzU5ZjlhNjYyODhlZjkxOGViYjZlYmU2MWQxYmQxNDlhM2U0N2JkMDhmY2JmN2U5OTc2ZjE1ZjIxYWIxMDcyOA==',
  'base64'
).toString('utf-8');
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || FALLBACK_KEY;

// Proxy endpoint for chat completions via OpenRouter with streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, stream = true } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Default fast intelligent model or user requested model
    const targetModel = model || 'openai/gpt-4o-mini';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Ashokra',
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        stream: Boolean(stream),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'OpenRouter API error',
        details: errorText,
      });
    }

    if (stream && response.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'Failed to communicate with OpenRouter',
      message: error?.message || 'Unknown error',
    });
  }
});

// Serve frontend SPA or Vite middleware
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Ashokra server listening on port ${PORT}`);
  });
}

setupViteOrStatic();
