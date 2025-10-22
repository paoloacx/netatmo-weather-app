export default async function handler(req, res) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Código de autorización no proporcionado' });
    }

    const CLIENT_ID = '68f68ae84adeece5450b0bf5';
    const CLIENT_SECRET = 'PJKKis6JcRW2eh3ZBHyF72b8Zph8glvVrAynSim7k';
    const REDIRECT_URI = `${req.headers.origin || 'https://netatmo-weather-app.vercel.app'}/callback`;

    try {
        // Intercambiar código por token
        const response = await fetch('https://api.netatmo.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI,
                scope: 'read_station'
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error de Netatmo:', errorData);
            throw new Error('Error al obtener token de Netatmo');
        }

        const data = await response.json();

        // Devolver tokens al cliente
        return res.status(200).json({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Error al autenticar con Netatmo',
            details: error.message 
        });
    }
}
