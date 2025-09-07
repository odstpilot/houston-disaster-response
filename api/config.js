export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const config = {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
    // Do not expose server-only keys to the client
    MISTRAL_API_KEY: '',
    TAVILY_API_KEY: '',
    APP_ENV: 'production',
    DEBUG_MODE: 'false'
  };

  return res.status(200).json(config);
}


