// api/search.js (Vercel serverless function)
export default async function handler(req, res) {
    const { query } = req.body;
    const apiKey = process.env.SERPAPI_KEY;
    const response = await fetch(`https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(query)}&api_key=${apiKey}`);
    const data = await response.json();
    
    // تحويل النتائج إلى شكل مبسط
    const results = data.local_results?.map(r => ({
        title: r.title,
        address: r.address,
        phone: r.phone,
        website: r.website,
        email: r.email || '',               // قد لا يتوفر دائماً
        latitude: r.gps_coordinates?.latitude,
        longitude: r.gps_coordinates?.longitude
    })) || [];
    
    res.status(200).json(results);
}
