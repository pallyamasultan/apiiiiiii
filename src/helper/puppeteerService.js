const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const PuppeteerService = {
  fetchWithBrowser: async (url) => {
    let browser;
    try {
      // Detect if running in Railway/production
      const isProduction = process.env.RAILWAY_ENVIRONMENT !== undefined;
      
      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled'
        ],
        timeout: 60000
      };

      // Untuk Railway, set executable path ke Chromium yang diinstall via nixpacks
      if (isProduction) {
        launchOptions.executablePath = '/nix/store/*-chromium-*/bin/chromium';
        console.log('🚀 Running in Railway environment');
      }

      browser = await puppeteer.launch(launchOptions);

      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      });

      console.log(`🌐 Fetching with Puppeteer: ${url}`);
      
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      try {
        await page.waitForSelector('.jdlrx h1', { timeout: 10000 });
      } catch (e) {
        console.log('⚠️ Title selector not found, but continuing...');
      }

      const html = await page.content();
      
      await browser.close();
      
      console.log('✅ Success fetching with Puppeteer');
      
      return {
        status: 200,
        data: html
      };

    } catch (error) {
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.error('Error closing browser:', e.message);
        }
      }
      console.error('❌ Puppeteer error:', error.message);
      throw error;
    }
  }
};

module.exports = PuppeteerService;