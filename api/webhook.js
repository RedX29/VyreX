export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const hooks = {
    partner:  process.env.P_HOOK,
    reseller: process.env.R_HOOK,
    order:    process.env.O_HOOK,
  };

  const hookUrl = hooks[req.query.type];
  if (!hookUrl) return res.status(400).end();

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  try {
    const r = await fetch(hookUrl, {
      method: 'POST',
      headers: req.headers['content-type']
        ? { 'Content-Type': req.headers['content-type'] }
        : {},
      body,
    });
    res.status(r.ok ? 200 : r.status).end();
  } catch {
    res.status(500).end();
  }
}
