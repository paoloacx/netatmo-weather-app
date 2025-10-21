// src/services/netatmoApi.js

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
const USERNAME = process.env.REACT_APP_USERNAME;
const PASSWORD = process.env.REACT_APP_PASSWORD;

export async function getWeatherData() {
  try {
    // Paso 1: Obtener access token
    const tokenResponse = await fetch('https://api.netatmo.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: USERNAME,
        password: PASSWORD,
        scope: 'read_station',
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Paso 2: Obtener datos de estación
    const stationResponse = await fetch('https://api.netatmo.com/api/getstationsdata', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const stationData = await stationResponse.json();
    return stationData;
  } catch (error) {
    console.error('Error al obtener datos de Netatmo:', error);
    return null;
  }
}

