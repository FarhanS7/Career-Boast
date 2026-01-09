import "dotenv/config";

async function test() {
  const apiKey = process.env.QDRANT_API_KEY;
  const baseUrl = process.env.QDRANT_URL.replace(":6333", "");
  
  const ports = ["443", "6333"];
  
  for (const port of ports) {
    const url = `${baseUrl}:${port}/collections`;
    console.log(`\nTesting URL: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: { "api-key": apiKey }
      });
      console.log(`Status: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Success! Collections:", JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error(`Error with ${url}:`, err.message);
    }
  }
}

test();
