const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { execSync } = require('child_process');

puppeteer.use(StealthPlugin());

const PuppeteerService = {
  fetchWithBrowser: async (url) => {
    let browser;
    try {
      console.log('🚀 Launching Puppeteer...');

      let executablePath;
      try {
        executablePath = execSync('which chromium').toString().trim();
        console.log(`📍 Found Chromium at: ${executablePath}`);
      } catch {
        executablePath = undefined;
        console.log('⚠️ Using bundled Chromium');
      }

      browser = await puppeteer.launch({
        headless: 'new',
        executablePath,
        protocolTimeout: 120000, // ⬅️ FIX UTAMA
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });

      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await page.setViewport({ width: 1366, height: 768 });

      // ⛔ BLOCK RESOURCE BERAT
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`🌐 Navigating: ${url}`);

      await page.goto(url, {
        waitUntil: 'domcontentloaded', // ⬅️ FIX
        timeout: 60000
      });

      // Tunggu elemen utama ATAU timeout ringan
      await Promise.race([
        page.waitForSelector('.jdlrx h1', { timeout: 10000 }),
        page.waitForTimeout(8000)
      ]);

      const html = await page.content();

      console.log('✅ HTML fetched:', html.length);

      await browser.close();

      return {
        status: 200,
        data: html
      };

    } catch (err) {
      if (browser) await browser.close().catch(() => {});
      console.error('❌ Puppeteer Error:', err.message);
      throw err;
    }
  }
};

module.exports = PuppeteerService;
