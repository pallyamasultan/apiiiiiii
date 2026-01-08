const puppeteerService = require('./puppeteerService');

const Service = {
  fetchService: async (url, res) => {
    try {
      console.log(`📦 Fetching with Puppeteer: ${url}`);
      const response = await puppeteerService.fetchWithBrowser(url);
      console.log('✅ Fetch completed');
      return response;
    } catch (error) {
      console.error('❌ Fetch error:', error.message);
      throw error;
    }
  }
};

module.exports = Service;