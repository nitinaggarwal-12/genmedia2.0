const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_heatmap');

// Purge and recreate screenshot directory (Stale File Prevention Rule)
if (fs.existsSync(SCREENSHOT_DIR)) {
    console.log(`🧹 Purging stale screenshots from ${SCREENSHOT_DIR}...`);
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runE2E() {
    console.log('🚀 Starting Puppeteer E2E validation for dynamic heatmap...');
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1440, height: 900 });
    
    // Listen to console logs in the page
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser Page Error] ${err.toString()}`));

    try {
        console.log('🔗 Navigating to http://localhost:8000/#/home...');
        await page.goto('http://localhost:8000/#/home', { waitUntil: 'networkidle0' });
        
        console.log('Current URL:', page.url());
        
        console.log('⏳ Waiting for heatmap elements to populate...');
        await page.waitForSelector('#heatmap-thead tr', { timeout: 5000 });
        await page.waitForSelector('#heatmap-tbody tr', { timeout: 5000 });
        
        // Inject mandatory animation settling delay (E2E Testing Synchronization Rule)
        console.log('⏳ Injecting settling delay (2000ms)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔍 Auditing headers and rows in DOM...');
        const headers = await page.evaluate(() => {
            const ths = Array.from(document.querySelectorAll('#heatmap-thead th'));
            return ths.map(th => th.innerText.trim().replace(/\n/g, ' '));
        });
        
        console.log('Headers found:', headers);
        
        const rows = await page.evaluate(() => {
            const trs = Array.from(document.querySelectorAll('#heatmap-tbody tr'));
            return trs.map(tr => {
                const cells = Array.from(tr.querySelectorAll('td'));
                return {
                    indication: cells[0].innerText.trim(),
                    badges: cells.slice(1).map(c => {
                        const badge = c.querySelector('.heatmap-badge');
                        return badge ? badge.innerText.trim() : 'NO_BADGE';
                    })
                };
            });
        });
        
        console.log('Rows found:', rows);
        
        // Assertions
        if (headers.length === 0) {
            throw new Error('Assertion Failed: No headers found in heatmap!');
        }
        
        if (rows.length === 0) {
            throw new Error('Assertion Failed: No rows rendered in heatmap body!');
        }
        
        // Capture screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, 'dashboard_dynamic_heatmap.png');
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`📸 Screenshot captured successfully: ${screenshotPath}`);
        
        console.log('✅ Puppeteer E2E validation completed successfully with 100% assertions passed!');
    } catch (err) {
        console.error('❌ E2E Validation Failed:', err.message);
        
        // Dump some HTML for debugging
        const bodyHtml = await page.evaluate(() => document.body.innerHTML);
        console.log('\n--- Page Body HTML Dump ---');
        console.log(bodyHtml.substring(0, 1500) + '... (truncated)');
        
        process.exit(1);
    } finally {
        await browser.close();
    }
}

runE2E();
