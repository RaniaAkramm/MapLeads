export default async function handler(req, res) {
    // Receive the search query from the frontend
    const { q } = req.body;

    if (!q) {
        return res.status(400).json({ error: "No search query provided" });
    }

    try {
        let allResults = [];
        const maxPages = 10; // 10 pages * 20 results = 200 results

        // Loop to fetch pages from SerpApi
        for (let i = 0; i < maxPages; i++) {
            const start = i * 20; 
            
            // Construct the URL with the start parameter for pagination
            const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(q)}&start=${start}&api_key=${process.env.SERP_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            // If results exist, add them to our master list
            if (data.local_results && data.local_results.length > 0) {
                allResults = [...allResults, ...data.local_results];
            } else {
                // If no more results are found, exit the loop
                break;
            }

            // Small delay to prevent hitting API rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Return the gathered data to your website
        res.status(200).json(allResults);
        
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to connect to SerpApi" });
    }
}
