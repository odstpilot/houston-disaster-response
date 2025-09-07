export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ status: 'ok', timestamp: Date.now() });
}


