export default async function handler(req, res) {
  const redirectUri = 'https://netatmo-weather-app.vercel.app/api/auth';

  // Si Netatmo nos envía el código de autorización
  if (req.query.code) {
    try {
      const response = await fetch('https://api.netatmo.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.NETATMO_CLIENT_ID,
          client_secret: process.env.NETATMO_CLIENT_SECRET,
          code: req.query.code,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      // Devolvemos el token a la app
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error autenticando con Netatmo:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Si no hay código, redirigimos al login de Netatmo
  const authUrl = `https://auth.netatmo.com/oauth2/authorize?client_id=${process.env.NETATMO_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read_station&state=1234&response_type=code`;
  return res.redirect(authUrl);
}
