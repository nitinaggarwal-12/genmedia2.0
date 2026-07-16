const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_all_variants');

if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runAllVariantsGeneration() {
    console.log('🚀 Starting headed Chrome to generate new images for all drug variants...');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--start-maximized', '--disable-blink-features=AutomationControlled']
    });
    
    const page = await browser.newPage();
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser Page Error] ${err.toString()}`));

    try {
        console.log('🔗 Navigating to composer...');
        await page.goto('http://localhost:8000/#/composer/variant/1', { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Loop through Variant 1, 2, and 3
        const variants = [
            { id: 1, name: 'Variant A (Product-A)', buttonId: '#variant-tab-1' },
            { id: 2, name: 'Variant C (Product-B)', buttonId: '#variant-tab-2' },
            { id: 3, name: 'Variant B (Product-C)', buttonId: '#variant-tab-3' }
        ];
        
        for (const variant of variants) {
            console.log(`\n======================================================`);
            console.log(`👉 Processing: ${variant.name}`);
            console.log(`======================================================`);
            
            // 1. Switch to the target variant tab
            console.log(`Clicking tab ${variant.buttonId}...`);
            await page.$eval(variant.buttonId, el => el.click());
            await new Promise(resolve => setTimeout(resolve, 1500)); // settling delay for tab transition
            
            // 2. Open the Imagen modal
            console.log('Opening Imagen 3 Creator modal...');
            await page.$eval('.composer-hero-container', el => el.click());
            await page.waitForSelector('#imagen-modal.active', { timeout: 5000 });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 3. Click Generate button
            console.log('Clicking Generate button...');
            await page.$eval('#btn-imagen-generate-run', el => el.click());
            
            // 4. Poll for generation to complete
            console.log('⏳ Waiting for image synthesis (up to 20s)...');
            let success = false;
            for (let i = 0; i < 40; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const isModalActive = await page.evaluate(() => {
                    const modal = document.getElementById('imagen-modal');
                    return modal && modal.classList.contains('active');
                });
                if (!isModalActive) {
                    console.log(`🎉 Image generation for ${variant.name} completed successfully!`);
                    success = true;
                    break;
                }
            }
            
            if (!success) {
                throw new Error(`Timeout waiting for ${variant.name} image generation.`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 5. Capture screenshot of the newly generated image in composer
            const screenshotPath = path.join(SCREENSHOT_DIR, `generated_variant_${variant.id}.png`);
            await page.screenshot({ path: screenshotPath });
            console.log(`📸 Screenshot captured: ${screenshotPath}`);
        }
        
        console.log('\n✅ Successfully generated new clinical images for all variants!');
    } catch (err) {
        console.error('❌ E2E Execution Failed:', err.message);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_all_variants.png') });
    } finally {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

runAllVariantsGeneration();
