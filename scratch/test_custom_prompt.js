const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_custom_prompt');

if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runCustomE2E() {
    console.log('🚀 Launching Chrome to test custom prompt image generation...');
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('✨ Opening Imagen 3 Creator modal...');
        await page.$eval('.composer-hero-container', el => el.click());
        await page.waitForSelector('#imagen-modal.active', { timeout: 5000 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Define a completely new, custom prompt
        const customPrompt = 'A futuristic oncology scientific illustration, green immunotherapy molecules neutralizing cancer cells in 3D, glowing organic structures, dark space background, highly detailed clinical render.';
        console.log(`📝 Injecting completely new custom prompt: "${customPrompt}"`);
        
        // Clear existing input and type the custom prompt
        await page.evaluate(() => {
            const input = document.getElementById('imagen-prompt-input');
            input.value = '';
        });
        await page.type('#imagen-prompt-input', customPrompt);
        
        console.log('📸 Screenshotting modal with custom prompt...');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_custom_prompt_inputted.png') });
        
        console.log('⚡ Clicking Generate button...');
        await page.$eval('#btn-imagen-generate-run', el => el.click());
        
        console.log('⏳ Waiting for image synthesis to complete (up to 20s)...');
        let success = false;
        for (let i = 0; i < 40; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const isModalActive = await page.evaluate(() => {
                const modal = document.getElementById('imagen-modal');
                return modal && modal.classList.contains('active');
            });
            if (!isModalActive) {
                console.log('🎉 Generation completed! Modal closed.');
                success = true;
                break;
            }
        }
        
        if (!success) {
            throw new Error('Timeout waiting for custom image generation.');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('📸 Screenshotting composer with the completely new custom-generated image...');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_custom_image_generated.png') });
        
        console.log('✅ Custom prompt E2E test completed successfully!');
    } catch (err) {
        console.error('❌ E2E Failed:', err.message);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error.png') });
    } finally {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

runCustomE2E();
