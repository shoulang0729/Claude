// portfolio-proxy — Cloudflare Worker
//
// ルート一覧:
//   GET  /yahoo?url=<encoded>     Yahoo Finance プロキシ（CORS 回避）
//   GET  /finnhub?path=<path>&<params>  Finnhub プロキシ（APIキー隠蔽）
//   POST /ai/openai               OpenAI (ChatGPT) プロキシ
//   POST /ai/gemini               Gemini プロキシ
//   POST /ai/grok                 Grok プロキシ
//   POST /ai/deepseek             DeepSeek プロキシ
//   POST /ai/claude               Claude (Anthropic) プロキシ
//
// 環境変数（Cloudflare Secrets に設定）:
//   FINNHUB_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY,
//   GROK_API_KEY, DEEPSEEK_API_KEY, ANTHROPIC_API_KEY

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

// ── CORS ──────────────────────────────────────────────
function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  const allowed = env.ALLOWED_ORIGIN || 'https://shoulang0729.github.io';
  if (origin === allowed) return true;
  // ローカル開発用
  if (origin.startsWith('http://localhost:')) return true;
  if (origin.startsWith('http://127.0.0.1:')) return true;
  return false;
}

// ── レスポンスヘルパー ─────────────────────────────────
function jsonRes(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function errRes(msg, status, origin) {
  return jsonRes({ error: msg }, status, origin);
}

// ── Yahoo Finance プロキシ ────────────────────────────
async function handleYahoo(url, origin) {
  const target = url.searchParams.get('url');
  if (!target) return errRes('url パラメータが必要です', 400, origin);

  const decoded = decodeURIComponent(target);
  if (!decoded.includes('finance.yahoo.com')) {
    return errRes('Yahoo Finance 以外の URL は許可されていません', 400, origin);
  }

  try {
    const res = await fetch(decoded, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; portfolio-proxy/1.0)' },
    });
    const data = await res.json();
    return jsonRes(data, res.status, origin);
  } catch (e) {
    return errRes(`取得失敗: ${e.message}`, 502, origin);
  }
}

// ── Finnhub プロキシ ──────────────────────────────────
async function handleFinnhub(url, env, origin) {
  const apiKey = env.FINNHUB_API_KEY;
  if (!apiKey) return errRes('Finnhub APIキーが未設定です', 500, origin);

  const path = url.searchParams.get('path') || '/quote';
  const params = new URLSearchParams(url.searchParams);
  params.delete('path');
  params.set('token', apiKey);

  try {
    const res = await fetch(`${FINNHUB_BASE}${path}?${params}`);
    const data = await res.json();
    return jsonRes(data, res.status, origin);
  } catch (e) {
    return errRes(`取得失敗: ${e.message}`, 502, origin);
  }
}

// ── AI プロキシ ───────────────────────────────────────
async function handleAI(request, path, env, origin) {
  if (request.method !== 'POST') return errRes('POST のみ許可', 405, origin);

  let body;
  try { body = await request.json(); } catch { return errRes('JSON が不正です', 400, origin); }

  const provider = path.split('/')[2]; // /ai/<provider>
  let upstreamUrl, headers;

  switch (provider) {
    case 'openai': {
      if (!env.OPENAI_API_KEY) return errRes('OpenAI キー未設定', 500, origin);
      upstreamUrl = 'https://api.openai.com/v1/chat/completions';
      headers = { 'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' };
      break;
    }
    case 'gemini': {
      if (!env.GEMINI_API_KEY) return errRes('Gemini キー未設定', 500, origin);
      const model = body.model || 'gemini-2.0-flash';
      upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      headers = { 'Content-Type': 'application/json' };
      break;
    }
    case 'grok': {
      if (!env.GROK_API_KEY) return errRes('Grok キー未設定', 500, origin);
      upstreamUrl = 'https://api.x.ai/v1/chat/completions';
      headers = { 'Authorization': `Bearer ${env.GROK_API_KEY}`, 'Content-Type': 'application/json' };
      break;
    }
    case 'deepseek': {
      if (!env.DEEPSEEK_API_KEY) return errRes('DeepSeek キー未設定', 500, origin);
      upstreamUrl = 'https://api.deepseek.com/v1/chat/completions';
      headers = { 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' };
      break;
    }
    case 'claude': {
      if (!env.ANTHROPIC_API_KEY) return errRes('Claude キー未設定', 500, origin);
      upstreamUrl = 'https://api.anthropic.com/v1/messages';
      headers = {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      };
      break;
    }
    default:
      return errRes(`未知のプロバイダー: ${provider}`, 400, origin);
  }

  try {
    const res = await fetch(upstreamUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return jsonRes(data, res.status, origin);
  } catch (e) {
    return errRes(`AI 呼び出し失敗: ${e.message}`, 502, origin);
  }
}

// ── メインハンドラー ──────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = isAllowedOrigin(origin, env);

    // CORS プリフライト
    if (request.method === 'OPTIONS') {
      if (!allowed) return new Response('Forbidden', { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Origin チェック（ブラウザからのリクエストのみ）
    if (origin && !allowed) return new Response('Forbidden', { status: 403 });
    const org = allowed ? origin : '*';

    const path = url.pathname;
    if (path === '/')               return new Response('portfolio-proxy OK', { status: 200 });
    if (path === '/yahoo')          return handleYahoo(url, org);
    if (path === '/finnhub')        return handleFinnhub(url, env, org);
    if (path.startsWith('/ai/'))    return handleAI(request, path, env, org);

    return errRes('Not Found', 404, org);
  },
};
