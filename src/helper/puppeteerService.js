const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const PuppeteerService = {
  fetchWithBrowser: async (url) => {
    let browser;
    try {
      // Detect if running in Railway/production
      const isProduction = process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';
      
      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--window-size=1920x1080',
          '--single-process', // Important for Railway
          '--no-zygote' // Important for Railway
        ]
      };

      // Add executablePath for production if needed
      if (isProduction) {
        // Railway biasanya punya chromium di system
        launchOptions.executablePath = '/usr/bin/chromium-browser' || '/usr/bin/chromium';
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
        timeout: 30000
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const html = await page.content();
      
      await browser.close();
      
      console.log('✅ Success fetching with Puppeteer');
      
      return {
        status: 200,
        data: html
      };

    } catch (error) {
      if (browser) await browser.close();
      console.error('❌ Puppeteer error:', error.message);
      throw error;
    }
  }
};

module.exports = PuppeteerService;