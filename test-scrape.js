const puppeteerService = require('./src/helper/puppeteerService');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
    const url = 'https://otakudesu.best/anime/chaisaw-sub-indo/';
    
    try {
        const response = await puppeteerService.fetchWithBrowser(url);
        
        // Simpan HTML ke file untuk diperiksa
        fs.writeFileSync('debug.html', response.data);
        console.log('✅ HTML saved to debug.html');
        
        // Test parsing
        const $ = cheerio.load(response.data);
        
        console.log('\n=== DEBUGGING ===');
        console.log('Title (.jdlrx > h1):', $('.jdlrx > h1').text());
        console.log('Thumb (.fotoanime img):', $('.fotoanime img').attr('src'));
        console.log('Episode list count:', $('.episodelist li').length);
        console.log('Sinopsis count:', $('.sinopc > p').length);
        
        // Coba selector alternatif
        console.log('\n=== ALTERNATIVE SELECTORS ===');
        console.log('Title (h1):', $('h1').first().text());
        console.log('Title (.entry-title):', $('.entry-title').text());
        console.log('Images found:', $('img').length);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

test();