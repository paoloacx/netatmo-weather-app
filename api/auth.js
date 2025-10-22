// api/auth.js
export default async function handler(req, res) {
  const redirectUri = 'https://netatmo-weather-app.vercel.app/api/auth';

  // Si Netatmo nos devuelve un "code", lo intercambiamos por tokens
  if (req.query && req.query.code) {
    const code = req.query.code;
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NETATMO_CLIENT_ID,
        client_secret: process.env.NETATMO_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri
      });

      const tokenResp = await fetch('https://api.netatmo.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      const data = await tokenResp.json();
      if (!tokenResp.ok) {
        console.error('Netatmo token error:', data);
        return res.status(500).json({ error: 'Error obtaining token', details: data });
      }

      return res.status(200).json(data);
    } catch (err) {
      console.error('Error exchanging code:', err);
      return res.status(500).json({ error: 'Server error', message: err.message });
    }
  }

  // Si no hay "code", redirige al login de Netatmo
  const authUrl = `https://auth.netatmo.com/oauth2/authorize?client_id=${encodeURIComponent(process.env.NETATMO_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read_station&state=1234&response_type=code`;
  
  return res.redirect(authUrl);
}
