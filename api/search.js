export default async function handler(req, res) {
    // 1. Validate method and input
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed, use POST" });
    }

    const { q } = req.body;
    if (!q) {
        return res.status(400).json({ error: "No search query provided" });
    }

    try {
        let allResults = [];
        const maxPages = 10; 
        const apiKey = process.env.SERP_API_KEY;

        if (!apiKey) {
            throw new Error("SERP_API_KEY is not defined in environment variables");
        }

        // 2. Loop to fetch pages from SerpApi
        for (let i = 0; i < maxPages; i++) {
            const start = i * 20; 
            const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(q)}&start=${start}&api_key=${apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`API request failed at page ${i + 1}`);
                break;
            }

            const data = await response.json();
            
            // 3. Extract results and ensure valid structure
            if (data.local_results && Array.isArray(data.local_results)) {
                allResults = [...allResults, ...data.local_results];
            } else {
                // If no more results are found or structure changes, break
                break;
            }

            // 4. Rate limiting: Wait to avoid being blocked by the provider
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        // 5. Remove duplicates (in case of overlap) and return
        const uniqueResults = Array.from(new Set(allResults.map(a => a.data_id)))
            .map(id => allResults.find(a => a.data_id === id));

        res.status(200).json(uniqueResults);
        
    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: "Failed to fetch data from source" });
    }
}
