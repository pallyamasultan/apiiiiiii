const axios = require('axios');

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const Service = {
  fetchService: async (url, res) => {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries}: ${url}`);
        
        // Random delay antar retry
        if (attempt > 1) {
          const delayTime = 2000 * attempt;
          console.log(`⏳ Waiting ${delayTime}ms...`);
          await delay(delayTime);
        }
        
        // Random User-Agent
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
        
        const response = await axios.get(url, {
          timeout: 20000,
          headers: {
            'User-Agent': randomUA,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://www.google.com/',
            'DNT': '1'
          },
          maxRedirects: 5,
          validateStatus: (status) => status >= 200 && status < 400
        });

        console.log(`✅ Success: ${response.data.length} chars`);
        return response;

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        // Jika ini attempt terakhir, throw error
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }
};

module.exports = Service;