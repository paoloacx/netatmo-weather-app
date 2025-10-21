import React, { useEffect, useState } from 'react';
import { getWeatherData } from '../services/netatmoApi';
import '../styles/WeatherCard.css';

function WeatherCard() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getWeatherData();
      console.log('Datos recibidos:', data); // 👈 Esto te ayuda a ver qué llega

      if (data && data.body && data.body.devices && data.body.devices.length > 0) {
        const mainModule = data.body.devices[0].dashboard_data;
        setTemperature(mainModule.Temperature);
        setHumidity(mainModule.Humidity);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="weather-card">
      <h2>Datos meteorológicos</h2>
      <p>Temperatura: {temperature !== null ? `${temperature} °C` : '-- °C'}</p>
      <p>Humedad: {humidity !== null ? `${humidity} %` : '-- %'}</p>
    </div>
  );
}

export default WeatherCard;
