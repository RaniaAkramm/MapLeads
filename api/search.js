// api/search.js

export default async function handler(req, res) {
    // 1. استقبال كلمة البحث من موقعك
    const { q } = req.body;

    if (!q) {
        return res.status(400).json({ error: "لم يتم إرسال كلمة بحث" });
    }

    try {
        // 2. الاتصال بـ SerpApi باستخدام المتغير السري (Environment Variable)
        const response = await fetch(`https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(q)}&api_key=${process.env.SERP_API_KEY}`);
        
        const data = await response.json();

        // 3. إرجاع النتائج إلى موقعك
        res.status(200).json(data.local_results || []);
        
    } catch (error) {
        res.status(500).json({ error: "خطأ في الاتصال بـ SerpApi" });
    }
}
