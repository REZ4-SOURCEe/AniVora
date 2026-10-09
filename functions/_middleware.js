// CORS برای اینکه سایتی که روی GitHub Pages هست بتونه به API این پروژه وصل بشه
const ALLOWED_ORIGINS = [
  'https://rez4-sourcee.github.io',
  'http://localhost:8788',
  'http://127.0.0.1:5500',
];

export async function onRequest(context) {
  const { request } = context;
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin.toLowerCase());

  const cors = {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  const response = await context.next();
  const res = new Response(response.body, response);
  for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
  return res;
}
