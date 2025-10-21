import axios from 'axios';
import qs from 'querystring';

export default async function handler(req, res) {
  const redirectUri = 'https://netatmo-api.vercel.app/api/auth/callback';

  if (req.query.code) {
    const payload = {
      grant_type: 'authorization_code',
      client_id: process.env.NETATMO_CLIENT_ID,
      client_secret: process.env.NETATMO_CLIENT_SECRET,
      code: req.query.code,
      redirect_uri: redirectUri,
    };

    try {
      const tokenResponse = await axios.post(
        'https://api.netatmo.com/oauth2/token',
        qs.stringify(payload),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      return res.status(200).json(tokenResponse.data);
    } catch (error) {
      return res.status(500).json({ error: error.response?.data || error.message });
    }
  }

  const authUrl = `https://auth.netatmo.com/oauth2/authorize?client_id=${process.env.NETATMO_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read_station&state=1234&response_type=code`;
  return res.redirect(authUrl);
}
