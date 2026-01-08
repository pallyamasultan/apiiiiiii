const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const PuppeteerService = {
  fetchWithBrowser: async (url) => {
    let browser;
    try {
      console.log('🚀 Launching Puppeteer...');
      
      // Jika ada BROWSERLESS_API_KEY env, gunakan browserless
      const browserWSEndpoint = process.env.BROWSERLESS_WS_ENDPOINT;
      
      if (browserWSEndpoint) {
        console.log('📡 Using Browserless service');
        browser = await puppeteer.connect({
          browserWSEndpoint: browserWSEndpoint
        });
      } else {
        // Local/Railway without browserless
        browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--disable-gpu'
          ]
        });
      }

      console.log('✅ Browser connected');

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log(`🌐 Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const html = await page.content();
      await browser.close();
      
      console.log(`✅ Success - ${html.length} chars`);
      
      return { status: 200, data: html };

    } catch (error) {
      if (browser) await browser.close();
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
};

module.exports = PuppeteerService;