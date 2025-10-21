// api/auth.js
// Maneja tanto la redirección para autorizar como el intercambio del code por tokens.
// No necesita axios ni dependencias externas.

export default async function handler(req, res) {
  const redirectUri = 'https://netatmo-weather-app.vercel.app/api/auth/callback'; // debe coincidir EXACTAMENTE con lo registrado en Netatmo
  const clientId = process.env.NETATMO_CLIENT_ID;
  const clientSecret = process.env.NETATMO_CLIENT_SECRET;

  // Si llega el code en la URL: intercambiar por tokens
  if (req.query && req.query.code) {
    const code = req.query.code;

    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId || '',
        client_secret: clientSecret || '',
        code,
        redirect_uri: redirectUri,
      });

      const tokenResp = await fetch('https://api.netatmo.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const tokenData = await tokenResp.json();

      if (!tokenResp.ok) {
        // Mostrar el error que venga de Netatmo
        console.error('Token exchange error:', tokenData);
        return res.status(tokenResp.status || 500).json({ error: tokenData });
      }

      // tokenData incluye refresh_token, access_token, expires_in...
      // MOSTRAR refresh_token para que lo copies (pegarás ese valor en Vercel)
      console.log('NETATMO refresh_token:', tokenData.refresh_token);

      return res.status(200).json({
        message:
          'Autorización completada. Copia el refresh_token que aparece abajo y pégalo en Vercel en NETATMO_REFRESH_TOKEN.',
        tokenData,
      });
    } catch (err) {
      console.error('Callback / token exchange error:', err);
      return res.status(500).json({ error: 'Error interno al intercambiar el code.' });
    }
  }

  // Si NO hay code: redirigimos al usuario al autorizador de Netatmo
  if (!clientId) {
    return res
      .status(500)
      .send('Falta NETATMO_CLIENT_ID en las variables de entorno del proyecto.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read_station',
    state: 'netatmo_state_123',
    response_type: 'code',
  });

  const authUrl = `https://auth.netatmo.com/oauth2/authorize?${params.toString()}`;

  return res.redirect(authUrl);
}
