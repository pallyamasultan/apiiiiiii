const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { execSync } = require('child_process');

puppeteer.use(StealthPlugin());

const PuppeteerService = {
  fetchWithBrowser: async (url) => {
    let browser;
    try {
      console.log('🚀 Launching Puppeteer...');
      
      // Detect Chromium path di Railway (Nix)
      let executablePath;
      try {
        executablePath = execSync('which chromium').toString().trim();
        console.log(`📍 Found Chromium at: ${executablePath}`);
      } catch (e) {
        console.log('⚠️ Chromium not found in PATH, using bundled');
        executablePath = undefined;
      }
      
      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ]
      });

      console.log('✅ Browser launched');

      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      console.log(`🌐 Navigating to: ${url}`);
      
      // Navigate dengan networkidle0 untuk memastikan semua resource loaded
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      console.log('⏳ Waiting for content to render...');
      
      // Tunggu selector penting muncul
      try {
        await page.waitForSelector('.jdlrx h1', { timeout: 10000 });
        console.log('✅ Title selector found');
      } catch (e) {
        console.log('⚠️ Title selector not found, continuing...');
      }

      // Extra wait untuk memastikan JS selesai execute
      await new Promise(resolve => setTimeout(resolve, 3000));

      const html = await page.content();
      
      // Debug: cek apakah HTML contain keyword penting
      const hasChainsaw = html.includes('Chainsaw');
      const hasEpisode = html.includes('Episode');
      console.log(`🔍 HTML Check: Chainsaw=${hasChainsaw}, Episode=${hasEpisode}, Length=${html.length}`);
      
      await browser.close();
      
      console.log(`✅ Success - HTML length: ${html.length}`);
      
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
      console.error('Stack:', error.stack);
      throw error;
    }
  }
};

module.exports = PuppeteerService;