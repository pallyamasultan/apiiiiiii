const chromium = require('chrome-aws-lambda');
const puppeteerCore = require('puppeteer-core');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const PuppeteerService = {
  fetchWithBrowser: async (url) => {
    let browser;
    try {
      // Detect environment
      const isProduction = process.env.RAILWAY_ENVIRONMENT !== undefined || process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        console.log('🚀 Running in PRODUCTION - using chrome-aws-lambda');
        
        // Production: use chrome-aws-lambda
        browser = await puppeteerCore.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath,
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        });
      } else {
        console.log('🚀 Running in DEVELOPMENT - using puppeteer-extra');
        
        // Development: use puppeteer-extra
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920x1080'
          ]
        });
      }

      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      });

      console.log(`🌐 Fetching: ${url}`);
      
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      try {
        await page.waitForSelector('.jdlrx h1', { timeout: 10000 });
      } catch (e) {
        console.log('⚠️ Title selector not found, continuing...');
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