// ============================================
// ANIVORA API — Cloudflare Worker
// اکانت کاربران + لیست انیمه‌ها
// ============================================

const ALLOWED_ORIGINS = [
  'https://rez4-sourcee.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get('Origin') || '';

    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    try {
      if (path === '/api/health' && method === 'GET') {
        return json({ ok: true, time: new Date().toISOString() }, 200, cors);
      }

      if (path === '/api/signup' && method === 'POST') {
        const body = await request.json();
        const { email, password, username } = body || {};

        if (!email || !email.includes('@')) {
          return json({ error: 'Invalid email' }, 400, cors);
        }
        if (!password || password.length < 6) {
          return json({ error: 'Password must be at least 6 characters' }, 400, cors);
        }

        const existing = await env.DB.prepare(
          'SELECT id FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();

        if (existing) {
          return json({ error: 'This email is already registered' }, 400, cors);
        }

        const passwordHash = await hashPassword(password);
        const userId = 'u_' + crypto.randomUUID();
        const finalUsername = username || email.split('@')[0];
        const now = new Date().toISOString();

        await env.DB.prepare(
          'INSERT INTO users (id, email, password_hash, username, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(userId, email.toLowerCase(), passwordHash, finalUsername, null, now).run();

        const token = await createToken(userId, env);

        return json({
          success: true,
          token,
          user: {
            id: userId,
            email: email.toLowerCase(),
            username: finalUsername,
            avatar: null,
            createdAt: now
          }
        }, 200, cors);
      }

      if (path === '/api/login' && method === 'POST') {
        const body = await request.json();
        const { email, password } = body || {};

        if (!email || !password) {
          return json({ error: 'Email and password required' }, 400, cors);
        }

        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();

        if (!user) {
          return json({ error: 'Invalid email or password' }, 401, cors);
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
          return json({ error: 'Invalid email or password' }, 401, cors);
        }

        const token = await createToken(user.id, env);

        return json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            createdAt: user.created_at
          }
        }, 200, cors);
      }

      if (path === '/api/me' && method === 'GET') {
        const userId = await getAuthUserId(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401, cors);

        const user = await env.DB.prepare(
          'SELECT id, email, username, avatar, created_at FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!user) return json({ error: 'User not found' }, 404, cors);

        return json({
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            createdAt: user.created_at
          }
        }, 200, cors);
      }

      if (path === '/api/profile' && method === 'PUT') {
        const userId = await getAuthUserId(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401, cors);

        const body = await request.json();
        const { username, avatar } = body || {};

        if (username) {
          await env.DB.prepare(
            'UPDATE users SET username = ? WHERE id = ?'
          ).bind(username, userId).run();
        }
        if (avatar !== undefined) {
          await env.DB.prepare(
            'UPDATE users SET avatar = ? WHERE id = ?'
          ).bind(avatar, userId).run();
        }

        return json({ success: true }, 200, cors);
      }

      if (path === '/api/list' && method === 'POST') {
        const userId = await getAuthUserId(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401, cors);

        const body = await request.json();
        const { animeId, status, progress, lastEp, lastSeason, dropped } = body || {};

        if (!animeId) return json({ error: 'animeId required' }, 400, cors);

        await env.DB.prepare(`
          INSERT INTO user_anime (user_id, anime_id, status, progress, last_ep, last_season, dropped, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, anime_id) DO UPDATE SET
            status = excluded.status,
            progress = excluded.progress,
            last_ep = excluded.last_ep,
            last_season = excluded.last_season,
            dropped = excluded.dropped,
            updated_at = excluded.updated_at
        `).bind(
          userId,
          animeId,
          status || null,
          progress || 0,
          lastEp || 0,
          lastSeason || 1,
          dropped ? 1 : 0,
          new Date().toISOString()
        ).run();

        return json({ success: true }, 200, cors);
      }

      if (path === '/api/list' && method === 'GET') {
        const userId = await getAuthUserId(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401, cors);

        const { results } = await env.DB.prepare(
          'SELECT * FROM user_anime WHERE user_id = ? ORDER BY updated_at DESC'
        ).bind(userId).all();

        return json({ list: results || [] }, 200, cors);
      }

      if (path === '/api/list' && method === 'DELETE') {
        const userId = await getAuthUserId(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401, cors);

        const animeId = url.searchParams.get('animeId');
        if (!animeId) return json({ error: 'animeId required' }, 400, cors);

        await env.DB.prepare(
          'DELETE FROM user_anime WHERE user_id = ? AND anime_id = ?'
        ).bind(userId, parseInt(animeId)).run();

        return json({ success: true }, 200, cors);
      }

      return json({ error: 'Not found', path, method }, 404, cors);

    } catch (e) {
      console.error('Worker error:', e);
      return json({ error: e.message || 'Internal error' }, 500, cors);
    }
  }
};

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return `pbkdf2$100000$${buf2hex(salt)}$${buf2hex(new Uint8Array(hash))}`;
}

async function verifyPassword(password, stored) {
  try {
    const parts = stored.split('$');
    if (parts.length !== 4) return false;
    const [, iterations, saltHex, expectedHash] = parts;
    const salt = hex2buf(saltHex);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const hash = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: parseInt(iterations), hash: 'SHA-256' },
      keyMaterial, 256
    );
    const hashHex = buf2hex(new Uint8Array(hash));
    if (hashHex.length !== expectedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < hashHex.length; i++) {
      diff |= hashHex.charCodeAt(i) ^ expectedHash.charCodeAt(i);
    }
    return diff === 0;
  } catch(e) { return false; }
}

function buf2hex(buf) {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}
function hex2buf(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));
}

async function createToken(userId, env) {
  const secret = env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const sig = await hmacSign(data, secret);
  return `${data}.${sig}`;
}

async function verifyToken(token, env) {
  try {
    const secret = env.JWT_SECRET;
    if (!secret) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sig] = parts;
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = await hmacSign(data, secret);

    if (sig !== expectedSig) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.userId;
  } catch(e) { return null; }
}

async function hmacSign(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncode(sig);
}

function base64UrlEncode(input) {
  let bytes;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function getAuthUserId(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  return verifyToken(token, env);
}