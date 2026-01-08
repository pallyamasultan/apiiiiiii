const axios = require('axios');

// Fungsi delay untuk rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const Service = {
  fetchService: async (url, res) => {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Tambahkan delay sebelum request (kecuali attempt pertama)
        if (attempt > 1) {
          const delayTime = 1000 * attempt; // increasing delay: 2s, 3s
          console.log(`⏳ Retry ${attempt}/${maxRetries} after ${delayTime}ms...`);
          await delay(delayTime);
        }

        const response = await axios.get(url, {
          timeout: 15000, // naikkan timeout jadi 15 detik
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
            'Referer': 'https://www.google.com/'
          },
          // Tambahkan ini untuk handle redirect
          maxRedirects: 5,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept 2xx and 3xx
          }
        });

        console.log(`✅ Success fetching: ${url}`);
        return response;

      } catch (error) {
        console.error(`❌ Attempt ${attempt}/${maxRetries} failed for URL:`, url);

        // Jika ini bukan attempt terakhir, coba lagi
        if (attempt < maxRetries) {
          continue;
        }

        // Log error details di attempt terakhir
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          
          // Return error response yang lebih informatif
          return res.status(503).json({
            status: false,
            code: 'SERVICE_UNAVAILABLE',
            message: `Website target tidak dapat diakses (${error.response.status}). Coba lagi nanti.`,
            details: {
              statusCode: error.response.status,
              url: url
            }
          });
        } else if (error.request) {
          console.error("No response received");
          return res.status(503).json({
            status: false,
            code: 'NO_RESPONSE',
            message: 'Tidak ada response dari server target. Coba lagi nanti.'
          });
        } else {
          console.error("Error:", error.message);
          return res.status(500).json({
            status: false,
            code: error.code || 'INTERNAL_ERROR',
            message: error.message || 'Internal Server Error'
          });
        }
      }
    }
  }
};

module.exports = Service;
