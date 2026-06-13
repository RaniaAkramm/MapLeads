// /api/search.js
// Vercel Serverless Function — proxies to SerpAPI Google Maps engine
// Set SERPAPI_KEY in your Vercel project's Environment Variables.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.body || {};
  if (!q) {
    return res.status(400).json({ error: 'Missing query "q"' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SERPAPI_KEY is not configured' });
  }

  try {
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(q)}&type=search&api_key=${apiKey}`;
    const r = await fetch(url);
    const json = await r.json();

    const results = (json.local_results || []).slice(0, 200).map(item => ({
      name: item.title || '',
      location: item.address || '',
      phone: item.phone || '',
      website: item.website || '',
      email: '', // SerpAPI doesn't return emails; left empty for manual enrichment
      lat: item.gps_coordinates ? item.gps_coordinates.latitude : null,
      lng: item.gps_coordinates ? item.gps_coordinates.longitude : null
    }));

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
}
