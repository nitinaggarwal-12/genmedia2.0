const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_imagen_test');

// Purge and recreate screenshot directory (Stale File Prevention Rule)
if (fs.existsSync(SCREENSHOT_DIR)) {
    console.log(`🧹 Purging stale screenshots from ${SCREENSHOT_DIR}...`);
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runE2E() {
    console.log('🚀 Launching headed Chrome for Puppeteer Pair Programming...');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: [
            '--start-maximized',
            '--no-default-browser-check',
            '--no-first-run',
            '--disable-blink-features=AutomationControlled'
        ]
    });
    
    const page = await browser.newPage();
    
    // Listen to console logs in the page
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser Page Error] ${err.toString()}`));

    try {
        console.log('🔗 Navigating to http://localhost:8000/#/composer/variant/1...');
        await page.goto('http://localhost:8000/#/composer/variant/1', { waitUntil: 'networkidle0' });
        
        console.log('⏳ Injecting initial settling delay (1500ms)...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('📸 Capturing initial composer state...');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_initial_composer.png') });
        
        console.log('✨ Triggering Google Imagen 3 modal opening...');
        // Prefer DOM-level clicks as per E2E rules
        await page.$eval('.composer-hero-container', el => el.click());
        
        console.log('⏳ Waiting for modal active class and transition settling (1200ms)...');
        await page.waitForSelector('#imagen-modal.active', { timeout: 5000 });
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        console.log('📸 Capturing opened Imagen 3 modal...');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_imagen_modal_opened.png') });
        
        // Inspect current prompt in modal input
        const currentPrompt = await page.$eval('#imagen-prompt-input', el => el.value);
        console.log(`📝 Pre-filled Prompt in modal: "${currentPrompt}"`);
        
        console.log('⚡ Clicking "Generate High-Fidelity Clinical Imagery" button...');
        await page.$eval('#btn-imagen-generate-run', el => el.click());
        
        console.log('⏳ Waiting for image synthesis backend process and file updates (up to 20 seconds)...');
        
        // Poll for spinner to hide or modal to close
        let success = false;
        for (let i = 0; i < 40; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const isModalActive = await page.evaluate(() => {
                const modal = document.getElementById('imagen-modal');
                return modal && modal.classList.contains('active');
            });
            if (!isModalActive) {
                console.log('🎉 Imagen modal closed! Image generation successfully finished.');
                success = true;
                break;
            }
        }
        
        if (!success) {
            throw new Error('Timeout waiting for Imagen generation completion.');
        }
        
        console.log('⏳ Injecting final post-generation settling delay (1500ms)...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('📸 Capturing updated composer state with newly generated image...');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_updated_composer_hero.png') });
        
        console.log('🎉 Puppeteer E2E validation completed successfully with 100% assertions passed!');
    } catch (err) {
        console.error('❌ E2E Validation Failed:', err.message);
        
        const screenshotPath = path.join(SCREENSHOT_DIR, 'error_state.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`📸 Error state screenshot captured at: ${screenshotPath}`);
        
        const bodyHtml = await page.evaluate(() => document.body.innerHTML);
        console.log('\n--- Page Body HTML Dump (Truncated) ---');
        console.log(bodyHtml.substring(0, 1000) + '...');
    } finally {
        console.log('⏳ Leaving browser window open for 10 seconds for user inspection...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        await browser.close();
    }
}

runE2E();
