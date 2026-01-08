const axios = require('axios');

const Service = {
  fetchService: async (url, res) => {
    try {
      console.log(`🔄 Fetching: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Connection': 'keep-alive',
          'Referer': 'https://www.google.com/'
        }
      });

      console.log(`✅ Success: ${response.data.length} chars`);
      return response;

    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
};

module.exports = Service;