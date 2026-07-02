const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_landing');

// Purge and recreate screenshot directory (Stale File Prevention Rule)
if (fs.existsSync(SCREENSHOT_DIR)) {
    console.log(`🧹 Purging stale screenshots from ${SCREENSHOT_DIR}...`);
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runE2E() {
    console.log('🚀 Starting Puppeteer E2E validation for new landing page...');
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1440, height: 900 });
    
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser Page Error] ${err.toString()}`));

    try {
        console.log('🔗 Navigating to http://localhost:8000/ ...');
        await page.goto('http://localhost:8000/', { waitUntil: 'networkidle0' });
        
        console.log('Current URL:', page.url());
        
        console.log('⏳ Waiting for landing page header and hero title...');
        await page.waitForSelector('#landing-view', { visible: true, timeout: 5000 });
        
        // Retrieve Hero Title
        const heroTitle = await page.evaluate(() => {
            const h1 = document.querySelector('#landing-view .hero-title');
            return h1 ? h1.innerText.trim().replace(/\n/g, ' ') : null;
        });
        console.log('Hero Title found:', heroTitle);
        if (!heroTitle || !heroTitle.includes('Automating Pharmaceutical')) {
            throw new Error('Assertion Failed: Incorrect or missing Hero Title!');
        }
        
        // Take screenshot of landing page
        const landingScreenshot = path.join(SCREENSHOT_DIR, '01_landing_page.png');
        await page.screenshot({ path: landingScreenshot });
        console.log(`📸 Landing page screenshot captured: ${landingScreenshot}`);
        
        // Audit navigation links (ensure they do not trigger SPA redirects)
        console.log('🔍 Clicking Features navigation link...');
        await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('.landing-nav-links a'));
            const featuresLink = links.find(l => l.innerText.includes('Features'));
            if (featuresLink) featuresLink.click();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Current URL after Features click:', page.url());
        if (page.url().includes('home') || page.url().includes('command')) {
            throw new Error('Assertion Failed: Navigation link redirected to dashboard!');
        }
        
        // Trigger live simulation
        console.log('⚡ Triggering the Live Compliance Simulation...');
        await page.click('#run-sim-btn');
        
        // Wait 11000ms for simulation to run and log lines
        console.log('⏳ Waiting for agent simulation to finish (11 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 11000));
        
        // Verify simulation console logs
        const consoleContent = await page.evaluate(() => {
            const consoleEl = document.getElementById('landing-sim-console');
            return consoleEl ? consoleEl.innerText : '';
        });
        
        if (!consoleContent.includes('COMPLIANCE PIPELINE SECURED AND CERTIFIED')) {
            throw new Error('Assertion Failed: Simulation did not log successful completion!');
        }
        console.log('✅ Simulation verified successfully!');
        
        // Take screenshot of completed simulation
        const simScreenshot = path.join(SCREENSHOT_DIR, '02_simulation_completed.png');
        await page.screenshot({ path: simScreenshot });
        console.log(`📸 Completed simulation screenshot captured: ${simScreenshot}`);
        
        // Open Expanded comparison modal
        console.log('🔍 Clicking Expand Comparison View button...');
        await page.click('#open-comparison-btn');
        await page.waitForSelector('#sim-comparison-modal', { visible: true, timeout: 3000 });
        
        // Take screenshot of expanded modal comparison
        const modalScreenshot = path.join(SCREENSHOT_DIR, '02b_expanded_comparison_modal.png');
        await page.screenshot({ path: modalScreenshot });
        console.log(`📸 Expanded comparison modal screenshot captured: ${modalScreenshot}`);
        
        // Enter workbench dashboard via modal Launch button
        console.log('🚀 Entering the app Command Center workbench from comparison modal...');
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('#sim-comparison-modal button'));
            const launchBtn = buttons.find(b => b.innerText.includes('Launch Developer Workbench'));
            if (launchBtn) launchBtn.click();
        });
        
        // Wait for landing view to hide and heatmap table body to populate
        console.log('⏳ Waiting for dashboard Command Center to render...');
        await page.waitForSelector('#landing-view', { hidden: true, timeout: 5000 });
        await page.waitForSelector('#heatmap-tbody tr', { timeout: 5000 });
        
        console.log('⏳ Injecting settling delay (1000ms)...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Take screenshot of the Command Center
        const dashboardScreenshot = path.join(SCREENSHOT_DIR, '03_dashboard_entered.png');
        await page.screenshot({ path: dashboardScreenshot });
        console.log(`📸 Entered dashboard screenshot captured: ${dashboardScreenshot}`);
        
        // 1. Test Sidebar M logo link click back to landing
        console.log('🔄 Clicking sidebar M logo link to return to landing page...');
        await page.click('.sidebar-logo-container a');
        await page.waitForSelector('#landing-view', { visible: true, timeout: 3000 });
        console.log('✅ Returned to landing page via logo link successfully!');
        
        // Go back to dashboard to test the second button
        console.log('🚀 Re-entering the dashboard...');
        await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('#landing-view button')).find(b => b.innerText.includes('Launch Workbench'));
            if (btn) btn.click();
        });
        await page.waitForSelector('#landing-view', { hidden: true, timeout: 3000 });
        
        console.log('⏳ Injecting routing settling delay (300ms)...');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 2. Test Gradient Banner button click back to landing
        console.log('🔄 Clicking "Back to Landing Page" button above Command Center...');
        await page.evaluate(() => {
            const banners = Array.from(document.querySelectorAll('.gradient-banner'));
            console.log('[E2E evaluate] Total gradient banners found:', banners.length);
            banners.forEach((banner, idx) => {
                const buttons = Array.from(banner.querySelectorAll('button'));
                console.log(`[E2E evaluate] Banner #${idx} buttons count:`, buttons.length);
                buttons.forEach(b => console.log(`[E2E evaluate]   Button text: "${b.innerText}"`));
            });
            const btn = Array.from(document.querySelectorAll('.gradient-banner button')).find(b => b.innerText.includes('Back to Landing Page'));
            if (btn) {
                console.log('[E2E evaluate] Clicking "Back to Landing Page" button...');
                btn.click();
            } else {
                console.error('[E2E evaluate] ERROR: "Back to Landing Page" button not found!');
            }
        });
        await page.waitForSelector('#landing-view', { visible: true, timeout: 3000 });
        console.log('✅ Returned to landing page via banner button successfully!');
        
        console.log('✅ Puppeteer E2E Landing Page validation completed successfully with 100% assertions passed!');
    } catch (err) {
        console.error('❌ E2E Validation Failed:', err.message);
        
        // Dump some HTML for debugging
        const bodyHtml = await page.evaluate(() => document.body.innerHTML);
        console.log('\n--- Page Body HTML Dump ---');
        console.log(bodyHtml.substring(0, 1000) + '... (truncated)');
        
        process.exit(1);
    } finally {
        await browser.close();
    }
}

runE2E();
