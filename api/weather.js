export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { cityCode } = req.query;

  if (!cityCode) {
    return res.status(400).json({ error: 'cityCode es requerido' });
  }

  try {
    // Tu clave API de AEMET (regístrate en https://opendata.aemet.es/)
    const API_KEY = process.env.AEMET_API_KEY; // Configura esta variable en Vercel

    if (!API_KEY) {
      return res.status(500).json({ error: 'API key no configurada' });
    }

    // Paso 1: Obtener la URL de los datos
    const apiUrl = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${cityCode}?api_key=${API_KEY}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error en AEMET API: ${response.status}`);
    }

    const data = await response.json();

    if (!data.datos) {
      throw new Error('No se encontraron datos');
    }

    // Paso 2: Obtener los datos reales
    const forecastResponse = await fetch(data.datos);
    if (!forecastResponse.ok) {
      throw new Error(`Error al obtener pronóstico: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Devolver los datos
    res.status(200).json(forecastData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}