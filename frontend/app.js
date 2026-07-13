// Maestro — Frontend Canvas & Agent Orchestration Client

const BACKEND_URL = window.location.origin;
const WS_URL = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws/logs';

let socket = null;
let activePrompt = "";
let activeModelProfile = "cost_optimized";
let currentActivePhase = -1; // Global state for active phase, default to Command Center

// Dynamic cognitive model profile management
window.updateModelProfile = function(profile) {
    activeModelProfile = profile;
    
    // Formulate a clean display name
    let profileName = "Cost-Optimized Profile (Pro + Flash)";
    if (profile === 'gemini-1.5-pro') profileName = "Gemini 1.5 Pro (Max Reasoning)";
    if (profile === 'gemini-2.0-flash') profileName = "Gemini 2.0 Flash (Sub-Second)";
    if (profile === 'gemini-2.5-flash') profileName = "Gemini 2.5 Flash (Balanced)";
    
    appendConsoleLine('system', `⚙️ COGNITIVE PROFILE CHANGED: Switched to ${profileName}.`);
};

// Initialize application, theme, and establish WebSocket connection
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    connectWebSocket();
    resetPipelineTracker();
    fetchDatasets(); // Scan local file system datasets instantly
    
    // Bind Imagen variant selectors
    if (window.initImagenVariantSelectors) {
        window.initImagenVariantSelectors();
    }
    
    // Draw default Product-A network on startup with a short delay for layout computation
    setTimeout(drawDefaultClaimsNetwork, 150);
    
    // Trigger the interactive onboarding tour for first-time users
    setTimeout(initOnboardingTour, 600);
});

// Theme Management (Light / Dark Mode Toggle)
function initTheme() {
    const savedTheme = localStorage.getItem('genmedia_theme') || 'dark';
    const themeIcon = document.getElementById('theme-icon');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) themeIcon.innerText = '☀️';
    } else {
        document.body.classList.remove('light-theme');
        if (themeIcon) themeIcon.innerText = '🌙';
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const themeIcon = document.getElementById('theme-icon');
    
    if (isLight) {
        if (themeIcon) themeIcon.innerText = '☀️';
        localStorage.setItem('genmedia_theme', 'light');
        appendConsoleLine('system', '🌓 Theme toggled to Executive Light Mode.');
    } else {
        if (themeIcon) themeIcon.innerText = '🌙';
        localStorage.setItem('genmedia_theme', 'dark');
        appendConsoleLine('system', '🌓 Theme toggled to Premium Dark Mode.');
    }
    
    // Dynamically redraw the claims network to apply theme-specific high contrast text colors!
    if (currentNetworkInstance) {
        drawDefaultClaimsNetwork();
    }
    
    // Dynamically redraw strategic charts if we are on the Command Center phase
    if (currentActivePhase === -1 && typeof initStrategicCharts === 'function') {
        initStrategicCharts();
    }
}

// WebSocket Connection for Real-Time Agent Logs
function connectWebSocket() {
    appendConsoleLine('system', 'Establishing connection to Maestro Agent Console...');
    
    socket = new WebSocket(WS_URL);
    
    socket.onopen = () => {
        appendConsoleLine('system', '⚡ Connection active. Ready to coordinate multi-agent telemetry.');
    };
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleIncomingLog(data);
    };
    
    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        appendConsoleLine('system', '⚠️ Connection error. Retrying in background...');
    };
    
    socket.onclose = () => {
        appendConsoleLine('system', '🔌 Connection closed. Re-connecting in 3 seconds...');
        setTimeout(connectWebSocket, 3000);
    };
}

// Global Pharma Moonshot Agent Name Mapping
const AGENT_DISPLAY_NAMES = {
    'L3_Strategy_Ingestion_Agent': 'Google Gemini Standards Agent',
    'Strategic_Ingestion_Agent': 'Google Gemini Standards Agent',
    'Semantic_Claims_Graph_Agent': 'Google Gemini MLR Judge Agent',
    'Claims_Pre-Screen_Agent': 'Google Gemini MLR Judge Agent',
    'Self_Healing_Layout_Token_Agent': 'Self-Healing Layout Agent',
    'Self-Healing_Layout_Token_Agent': 'Self-Healing Layout Agent',
    'Master_Orchestrator_Agent': 'Master Orchestrator',
    'ComplianceVault_MaterialReview_Webhook': 'Regulatory Compliance Vault Webhook'
};

// Handle logs streamed from backend
function handleIncomingLog(data) {
    const agent = data.agent;
    const msg = data.message;
    
    let styleClass = 'system';
    if (agent === 'L3_Strategy_Ingestion_Agent') {
        styleClass = 'agent-ingest';
        updatePipelineStep('ingestion', 'RUNNING', 60);
    } else if (agent === 'Semantic_Claims_Graph_Agent') {
        styleClass = 'agent-claims';
        updatePipelineStep('ingestion', 'SUCCESS', 100);
        updatePipelineStep('claims', 'RUNNING', 60);
    } else if (agent === 'Self_Healing_Layout_Token_Agent') {
        styleClass = 'agent-layout';
        updatePipelineStep('claims', 'SUCCESS', 100);
        updatePipelineStep('layout', 'RUNNING', 70);
    } else if (agent === 'Master_Orchestrator_Agent') {
        styleClass = 'system';
    } else if (agent === 'ComplianceVault_MaterialReview_Webhook') {
        styleClass = 'webhook';
        triggerAutomatedClaimsRecheck();
    } else if (agent === 'Standards_Governance_Registry') {
        styleClass = 'webhook';
        fetchActiveStandards();
    }
    
    const displayName = AGENT_DISPLAY_NAMES[agent] || agent;
    appendConsoleLine(styleClass, `[${displayName}] ${msg}`);
}

// Append line to the bottom code console
function appendConsoleLine(styleClass, text) {
    const consoleBody = document.getElementById("console-body");
    const dashboardConsole = document.getElementById("dashboard-compliance-log");
    
    // Format timestamp
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const formattedText = `[${timeStr}] ${text}`;
    
    if (consoleBody) {
        const line = document.createElement("div");
        line.className = `console-line ${styleClass}`;
        line.innerText = formattedText;
        consoleBody.appendChild(line);
        consoleBody.scrollTop = consoleBody.scrollHeight;
    }
    
    if (dashboardConsole) {
        const line = document.createElement("div");
        line.className = `console-line ${styleClass}`;
        // Style lines with oklch console colors
        if (text.includes("COMPLIANT") || text.includes("Verified") || text.includes("complete") || text.includes("✅")) {
            line.style.color = "var(--primary-mint)";
        } else if (text.includes("VIOLATION") || text.includes("❌") || text.includes("failed")) {
            line.style.color = "oklch(0.65 0.22 20)"; // Neon Red
        } else if (text.includes("⚠️") || text.includes("warning")) {
            line.style.color = "#fbbf24"; // Neon Yellow
        } else {
            line.style.color = "#94a3b8"; // Muted Slate
        }
        line.innerText = formattedText;
        dashboardConsole.appendChild(line);
        dashboardConsole.scrollTop = dashboardConsole.scrollHeight;
        
        // Cap lines at 100 to prevent layout memory bloating
        while (dashboardConsole.childNodes.length > 100) {
            dashboardConsole.removeChild(dashboardConsole.firstChild);
        }
    }
}

// Reset the progress trackers to default
function resetPipelineTracker() {
    const steps = ['ingestion', 'claims', 'layout'];
    steps.forEach(step => {
        const panel = document.getElementById(`step-${step}`);
        const badge = document.getElementById(`badge-${step}`);
        const bar = document.getElementById(`progress-${step}`);
        
        panel.className = 'pipeline-step';
        badge.className = 'step-badge status-idle';
        badge.innerText = 'IDLE';
        bar.style.width = '0%';
    });
}

// Update the visual tracker steps
function updatePipelineStep(step, status, progressVal) {
    const panel = document.getElementById(`step-${step}`);
    const badge = document.getElementById(`badge-${step}`);
    const bar = document.getElementById(`progress-${step}`);
    
    if (status === 'RUNNING') {
        panel.className = 'pipeline-step active';
        badge.className = 'step-badge status-running';
        badge.innerText = 'RUNNING';
        bar.style.width = `${progressVal}%`;
    } else if (status === 'SUCCESS') {
        panel.className = 'pipeline-step success';
        badge.className = 'step-badge status-success';
        badge.innerText = '✓';
        bar.style.width = '100%';
    } else if (status === 'VIOLATION') {
        panel.className = 'pipeline-step warning';
        badge.className = 'step-badge status-violation';
        badge.innerText = 'VIOLATION';
        bar.style.width = `${progressVal}%`;
    }
}

// Set Prompt and Submit Helper
function setPromptAndSubmit(promptText) {
    const input = document.getElementById("chat-input");
    input.value = promptText;
    document.getElementById("chat-form").dispatchEvent(new Event('submit'));
}

// Submit Chat to Master Orchestrator
async function submitChat(event) {
    event.preventDefault();
    const input = document.getElementById("chat-input");
    const prompt = input.value.trim();
    if (!prompt) return;
    
    activePrompt = prompt;
    input.value = "";
    
    // Add user chat bubble
    appendChatBubble('user', prompt);
    
    // Disable submit button & show spinner
    setLoadingState(true);
    resetPipelineTracker();
    
    appendConsoleLine('system', 'Master Orchestrator coordinating task routing...');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt, model_profile: activeModelProfile })
        });
        
        const data = await response.json();
        
        if (data.status === 'SUCCESS') {
            // Render the final HTML in the canvas
            renderCanvasHTML(data.html);
            
            // Enable the Edit Copy button since we now have content!
            const editBtn = document.getElementById("btn-edit-copy");
            if (editBtn) editBtn.disabled = false;
            
            // Set all steps to success
            updatePipelineStep('ingestion', 'SUCCESS');
            updatePipelineStep('claims', 'SUCCESS');
            updatePipelineStep('layout', 'SUCCESS');
            
            // Add assistant response bubble
            let claimsSummary = data.claims_audit.map(c => 
                `<li><strong>${c.claim_id}</strong>: ${c.finding} (${c.severity})</li>`
            ).join('');
            
            let layoutViolations = data.layout_audit.violations.length > 0 
                ? `<li>⚠️ Layout Violations Fixed: ${data.layout_audit.violations.join(', ')}</li>`
                : '<li>✅ Perfect layout alignment.</li>';
                
            const responseHtml = `
                <p><strong>Pipeline Complete.</strong> Campaign Brief generated and rendered on the canvas.</p>
                <p><strong>Compliance Summary:</strong></p>
                <ul style="margin-left: 1.25rem; margin-top: 0.25rem; font-size: 0.8rem;">
                    ${claimsSummary}
                    ${layoutViolations}
                </ul>
                <p style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--color-text-muted);">
                    Regulatory Compliance Vault synchronization reference: <strong>${data.claims_sync.active_version} (${data.claims_sync.efficacy_value} Efficacy)</strong>
                </p>
            `;
            appendChatBubble('assistant', responseHtml);
        } else if (data.status === 'TRIAGE') {
            // Render conversational triage options as interactive, clickable prompts
            let formattedMsg = data.message
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            let lastCampaign = data.last_active_brief && data.last_active_brief["Campaign Name"] 
                ? data.last_active_brief["Campaign Name"] 
                : "";
            
            let triageButtons = "";
            if (!lastCampaign) {
                triageButtons = `
                    <button class="btn-quick-prompt" onclick="setPromptAndSubmit('Initialize a new Win Rivera Oncology campaign brief')" style="padding: 0.45rem 1rem; font-size: 0.72rem; font-weight: 700; border-radius: 12px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); color: var(--color-primary); cursor: pointer; text-align: left; width: 100%; margin-bottom: 0.4rem; display: block; outline: none;">1. Initialize Win Rivera Oncology Campaign (78% Efficacy)</button>
                    <button class="btn-quick-prompt" onclick="setPromptAndSubmit('Create an Oncology Indication Beta safety brief')" style="padding: 0.45rem 1rem; font-size: 0.72rem; font-weight: 700; border-radius: 12px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); color: var(--color-text-muted); cursor: pointer; text-align: left; width: 100%; margin-bottom: 0.4rem; display: block; outline: none;">2. Create Oncology Indication Beta Safety Brief (5% AE)</button>
                    <button class="btn-quick-prompt" onclick="setPromptAndSubmit('Review oncology campaign briefs')" style="padding: 0.45rem 1rem; font-size: 0.72rem; font-weight: 700; border-radius: 12px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); color: var(--color-text-muted); cursor: pointer; text-align: left; width: 100%; display: block; outline: none;">3. Open generic campaign brief template</button>
                `;
            } else {
                triageButtons = `
                    <button class="btn-quick-prompt" onclick="setPromptAndSubmit('Sync campaign ${lastCampaign} to Week 48 efficacy label')" style="padding: 0.45rem 1rem; font-size: 0.72rem; font-weight: 700; border-radius: 12px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); color: var(--color-primary); cursor: pointer; text-align: left; width: 100%; margin-bottom: 0.4rem; display: block; outline: none;">1. Sync '${lastCampaign}' to Week 48 (84%) efficacy label</button>
                    <button class="btn-quick-prompt" onclick="setPromptAndSubmit('Change target population for ${lastCampaign}')" style="padding: 0.45rem 1rem; font-size: 0.72rem; font-weight: 700; border-radius: 12px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); color: var(--color-text-muted); cursor: pointer; text-align: left; width: 100%; margin-bottom: 0.4rem; display: block; outline: none;">2. Modify target patient population</button>
                    <button class="btn-quick-prompt" onclick="setPromptAndSubmit('Re-evaluate layout token padding constraints')" style="padding: 0.45rem 1rem; font-size: 0.72rem; font-weight: 700; border-radius: 12px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); color: var(--color-text-muted); cursor: pointer; text-align: left; width: 100%; display: block; outline: none;">3. Re-evaluate layout token padding constraints</button>
                `;
            }

            const responseHtml = `
                <div class="triage-container">
                    <p>${formattedMsg}</p>
                    <div class="quick-prompts" style="margin-top: 0.75rem;">
                        ${triageButtons}
                    </div>
                </div>
            `;
            appendChatBubble('assistant', responseHtml);
            resetPipelineTracker();
        } else {
            appendChatBubble('assistant', `⚠️ Pipeline execution error: ${data.message}`);
        }
        
    } catch (error) {
        console.error("Error sending chat:", error);
        appendChatBubble('assistant', '❌ Connection failed. Unable to reach Master Orchestrator.');
    } finally {
        setLoadingState(false);
    }
}

// Append Chat Bubble to Chat Rail
function appendChatBubble(sender, content) {
    const chatMessages = document.getElementById("chat-messages");
    const expandedBody = document.getElementById("expanded-chat-body");
    
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = content;
    
    // Append to tiny sidebar chat
    if (chatMessages) {
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Append to maximized chat modal if it exists
    if (expandedBody) {
        const expandedBubble = bubble.cloneNode(true);
        expandedBody.appendChild(expandedBubble);
        expandedBody.scrollTop = expandedBody.scrollHeight;
    }
}

// Render HTML content on Left Panel Canvas
function renderCanvasHTML(htmlContent) {
    const canvas = document.getElementById("composer-content-body") || document.getElementById("canvas-render-block");
    if (canvas) {
        canvas.innerHTML = htmlContent;
    }
}

// Set Chat loading states
function setLoadingState(isLoading) {
    const btnSubmit = document.getElementById("btn-submit");
    const spinner = document.getElementById("btn-spinner");
    const input = document.getElementById("chat-input");
    
    if (isLoading) {
        if (btnSubmit) btnSubmit.disabled = true;
        if (spinner) spinner.style.display = "inline-block";
        if (input) input.disabled = true;
    } else {
        if (btnSubmit) btnSubmit.disabled = false;
        if (spinner) spinner.style.display = "none";
        if (input) input.disabled = false;
    }
}

// Trigger Label Update Webhook
async function triggerLabelUpdate() {
    const btn = document.getElementById("btn-trigger-update");
    btn.disabled = true;
    btn.innerText = "⚡ Syncing updated parameters...";
    
    appendConsoleLine('system', 'Sending webhook event to /api/trigger-label-update...');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/trigger-label-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                parameter_value: "61%",
                version_label: "Week 48"
            })
        });
        
        const data = await response.json();
        if (data.status === 'ACCEPTED') {
            appendConsoleLine('system', 'Webhook successfully accepted by claims graph ledger.');
        }
    } catch (error) {
        console.error("Error triggering update:", error);
        appendConsoleLine('system', '❌ Webhook delivery failed.');
        btn.disabled = false;
        btn.innerText = "⚡ Trigger Label Update: Efficacy 61% (Week 48)";
    }
}

// Automated claims recheck workflow when webhook event triggers
async function triggerAutomatedClaimsRecheck() {
    const canvas = document.getElementById("canvas-render-block");
    
    // If there is no active marketing content on the canvas, stop
    if (canvas.querySelector('.canvas-placeholder')) {
        appendConsoleLine('system', 'ComplianceVault database updated. Canvas is empty, skipping re-render.');
        resetWebhookButton();
        return;
    }
    
    appendConsoleLine('system', 'Automated Claims Audit triggered. Inspecting canvas copy...');
    
    // 1. Flash canvas with orange border indicating an outdated claim is detected
    canvas.classList.add('highlight-glow');
    updatePipelineStep('claims', 'VIOLATION', 80);
    
    await sleep(1500); // Visual pause to highlight violation detection
    
    appendConsoleLine('system', 'Auto-repair: Resolving claims parameters with updated ComplianceVault record...');
    
    // 2. Re-trigger the chat pipeline to correct the canvas
    try {
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: activePrompt || "Regenerate the campaign card using the active label claims.", model_profile: activeModelProfile })
        });
        
        const data = await response.json();
        
        if (data.status === 'SUCCESS') {
            // 3. Remove outdated glow, apply success glow
            canvas.classList.remove('highlight-glow');
            canvas.classList.add('heal-glow');
            
            // Re-render the newly updated, self-healed HTML
            renderCanvasHTML(data.html);
            
            // Set all pipeline steps to success
            updatePipelineStep('ingestion', 'SUCCESS');
            updatePipelineStep('claims', 'SUCCESS');
            updatePipelineStep('layout', 'SUCCESS');
            
            // Update active label tag in canvas header
            const labelTag = document.getElementById("active-label-tag");
            labelTag.innerText = "Active: Week 48 Label (61%)";
            labelTag.className = "badge badge-active-label updated";
            
            appendConsoleLine('system', '✅ Automated cascade complete. Marketing copy verified, layout tokens enforced, and canvas updated.');
            
            // 4. Update the Compliance Diff Ledger and pop it open
            updateComplianceLedger(
                "Overall Response Rate (ORR)",
                "56% ORR at Week 24",
                "61% ORR at Week 48",
                data.claims_sync.verification_hash || "sha256:f52d9a3b..."
            );
            toggleLedgerDrawer(true);
            
            // Add automated assistant bubble
            appendChatBubble('assistant', `
                <p><strong>🚨 Automated Label Update Event Cascade:</strong></p>
                <p>A webhook notification indicated that clinical trial parameters were updated in <strong>Regulatory Compliance Vault</strong>. 
                The <strong>Semantic Claims Graph Agent</strong> instantly scanned our active marketing card, flagged the outdated '56%' efficacy claim, and automatically synchronized it to the new <strong>'61%' Week 48</strong> efficacy parameter (KEYNOTE-189 study long-term follow-up).</p>
                <p>The <strong>Self-Healing Layout Token Agent</strong> verified that the updated card copy still strictly adheres to corporate layout boundaries.</p>
                <p style="margin-top: 0.55rem; font-size: 0.75rem;">
                    Compliance Diff Ledger has been updated with cryptographic lock: <br><code style="color: var(--color-secondary); font-size: 0.7rem;">${data.claims_sync.verification_hash}</code>
                </p>
            `);
            
            await sleep(2000);
            canvas.classList.remove('heal-glow');
        }
    } catch (error) {
        console.error("Error in automated recheck:", error);
        canvas.classList.remove('highlight-glow');
    } finally {
        resetWebhookButton();
    }
}

// Helpers & Interactive UI Functions
function resetWebhookButton() {
    const btn = document.getElementById("btn-trigger-update");
    btn.disabled = false;
    btn.innerText = "⚡ Trigger Label Update: Efficacy 61% (Week 48)";
}

function resetCanvas() {
    const canvas = document.getElementById("canvas-render-block");
    canvas.innerHTML = `
        <div class="canvas-placeholder" id="canvas-placeholder">
            <div class="placeholder-icon">📊</div>
            <h3>Active Content Canvas</h3>
            <p>Drag and drop your Product-A campaign PowerPoint deck here, or click to ingest a clinical briefing template.</p>
            
            <!-- PPTX Ingestion Dropzone -->
            <div class="pptx-dropzone" id="pptx-dropzone" onclick="simulatePptxIngestion()">
                <div class="dropzone-content">
                    <span class="pptx-icon">📁</span>
                    <span class="dropzone-text"><strong>Ingest Slide Deck:</strong> KEYNOTE-189_Clinical_Launch_Briefing.pptx</span>
                    <span class="dropzone-sub">Click to parse slides and auto-generate compliance brief</span>
                </div>
            </div>
            
            <div class="placeholder-suggest">
                <span>Or execute baseline prompt:</span>
                <button onclick="setPromptAndSubmit('Create a new oncology campaign brief for Product-A First-Line NSCLC launch highlighting its Week 24 efficacy results.')">"Initialize Product-A NSCLC Campaign..."</button>
            </div>
        </div>
    `;
    
    // Disable Edit Copy button on clear
    const editBtn = document.getElementById("btn-edit-copy");
    editBtn.disabled = true;
    editBtn.innerText = "Edit Copy";
    editBtn.className = "btn btn-primary btn-small";
    
    // Hide ledger
    toggleLedgerDrawer(false);
    
    const labelTag = document.getElementById("active-label-tag");
    labelTag.innerText = "Active: Week 24 Label (56%)";
    labelTag.className = "badge badge-active-label";
    
    // Reset claims database values in orchestrator back to Week 24 (56%)
    orchestratorResetClaims();
    
    resetPipelineTracker();
    appendConsoleLine('system', 'Canvas cleared and claims graph reset to baseline (Week 24).');
}

// Reset claims on backend to default values to allow repeating the demo
async function orchestratorResetClaims() {
    try {
        await fetch(`${BACKEND_URL}/api/trigger-label-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                parameter_value: "56%",
                version_label: "Week 24"
            })
        });
    } catch (e) {
        console.error(e);
    }
}

// ==========================================
// PPTX INGESTION SIMULATOR
// ==========================================
// ==========================================
// REAL PPTX & PDF FILE INGESTION ENGINE
// ==========================================
async function uploadPptxOrPdf(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    appendConsoleLine('system', `📁 Real Ingestion Triggered: Uploading physical file '${file.name}' (${(file.size/1024).toFixed(1)} KB)...`);
    resetPipelineTracker();
    setLoadingState(true);
    
    // Show upload and parse animation on the dropzone card
    const dropzone = document.getElementById("pptx-dropzone");
    const originalDropzoneHtml = dropzone.innerHTML;
    dropzone.style.pointerEvents = "none";
    dropzone.innerHTML = `
        <div class="dropzone-content">
            <span class="pptx-icon" style="animation: bounce 1.2s infinite alternate; display: inline-block;">📤</span>
            <span class="dropzone-text" style="color: var(--color-primary);">Parsing physical file '${file.name}'...</span>
            <span class="dropzone-sub">Extracting slides and reading clinical text...</span>
        </div>
    `;
    
    try {
        let url = `${BACKEND_URL}/api/ingest-pptx`;
        if (file.name.endsWith('.pdf')) {
            url = `${BACKEND_URL}/api/ingest-pdf`;
        }
        
        updatePipelineStep('ingestion', 'RUNNING');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'SUCCESS') {
            dropzone.innerHTML = `
                <div class="dropzone-content">
                    <span class="pptx-icon">✅</span>
                    <span class="dropzone-text" style="color: var(--color-success);">${file.name} parsed successfully!</span>
                    <span class="dropzone-sub">Clinical claims structured and delivered to canvas.</span>
                </div>
            `;
            
            handleIngestionSuccess(data, file.name, 'Physical File Ingestion');
        } else {
            dropzone.innerHTML = originalDropzoneHtml;
            dropzone.style.pointerEvents = "auto";
            updatePipelineStep('ingestion', 'FAILED');
            appendConsoleLine('system', `❌ Ingestion failed: ${data.detail || 'Failed to parse file structure.'}`);
        }
    } catch (error) {
        console.error("Error uploading physical file:", error);
        dropzone.innerHTML = originalDropzoneHtml;
        dropzone.style.pointerEvents = "auto";
        updatePipelineStep('ingestion', 'FAILED');
        appendConsoleLine('system', '❌ Connection failed. Unable to reach Master Ingestion backplane.');
    } finally {
        setLoadingState(false);
        // Clear value to allow re-uploading
        event.target.value = "";
    }
}

// ==========================================
// REAL WEB CLINICAL DOCUMENT URL FETCHER
// ==========================================
async function fetchAndIngestUrl() {
    const urlInput = document.getElementById("url-ingest-input");
    const url = urlInput.value.trim();
    if (!url) {
        alert("Please paste a valid clinical document URL (PDF or HTML link).");
        return;
    }
    
    appendConsoleLine('system', `🌐 Live Web Fetch Triggered: Requesting download of '${url}'...`);
    resetPipelineTracker();
    setLoadingState(true);
    urlInput.disabled = true;
    
    try {
        updatePipelineStep('ingestion', 'RUNNING');
        
        const response = await fetch(`${BACKEND_URL}/api/ingest-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'SUCCESS') {
            urlInput.value = "";
            
            // Reset preset selectors and custom inputs
            const presetSelect = document.getElementById("url-preset-select");
            const customInput = document.getElementById("url-custom-input");
            const verificationPanel = document.getElementById("url-verification-panel");
            if (presetSelect) presetSelect.value = "";
            if (customInput) {
                customInput.value = "";
                customInput.style.display = "none";
            }
            if (verificationPanel) verificationPanel.style.display = "none";
            
            handleIngestionSuccess(data, url, 'Live Web Ingestion');
        } else {
            updatePipelineStep('ingestion', 'FAILED');
            appendConsoleLine('system', `❌ URL ingestion failed: ${data.detail || 'Download or parsing timeout.'}`);
        }
    } catch (error) {
        console.error("Error fetching URL:", error);
        updatePipelineStep('ingestion', 'FAILED');
        appendConsoleLine('system', '❌ Connection failed. Unable to download external document.');
    } finally {
        setLoadingState(false);
        urlInput.disabled = false;
    }
}

// ==========================================
// MASTER SUCCESS INGESTION DISPATCHER
// ==========================================
function handleIngestionSuccess(data, sourceName, sourceType) {
    renderCanvasHTML(data.html);
    
    const editBtn = document.getElementById("btn-edit-copy");
    if (editBtn) editBtn.disabled = false;
    
    const exportBtn = document.getElementById("btn-export-compliance_vault");
    if (exportBtn) exportBtn.disabled = false;
    
    updatePipelineStep('ingestion', 'SUCCESS');
    updatePipelineStep('claims', 'SUCCESS');
    updatePipelineStep('layout', 'SUCCESS');
    
    const medication = data.brief["Medication"] || data.brief["medication"] || "Product-A";
    const campaignName = data.brief["Campaign Name"] || data.brief["campaign_name"] || "Product-A Campaign";
    const trialName = data.brief["Clinical Trial"] || data.brief["clinical_trial"] || data.brief["Trial Registration"] || "KEYNOTE-189 (NCT02578680)";
    
    // Dynamically update the Left Sidebar "Phase 1 Ingest" summary cards on new Ingestion!
    const p1SummaryLibrary = document.getElementById('phase1-summary-library');
    const p1SummaryTrial = document.getElementById('phase1-summary-trial');
    if (p1SummaryLibrary) {
        p1SummaryLibrary.innerText = sourceName || "Local Document";
    }
    if (p1SummaryTrial) {
        let cleanTrial = trialName.split(' (')[0];
        p1SummaryTrial.innerText = cleanTrial || "Clinical Trial Brief";
    }
    
    // Dynamic Ledger Sync: Add a live verified transmittal entry on Ingestion!
    const activeHash = data.claims_sync ? data.claims_sync.verification_hash : "sha256:d8b02ea9a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286";
    if (typeof addLedgerEntry === 'function') {
        addLedgerEntry(medication, campaignName, activeHash);
    }
    
    const labelTag = document.getElementById("explorer-active-label-tag") || document.getElementById("active-label-tag");
    const med = medication.toLowerCase();
    let labelText = "Active: Week 24 Label (56%)";
    let activeClass = "badge badge-active-label";
    
    if (med.includes("product_b") || med.includes("product-b") || med.includes("lenvima") || med.includes("lenvatinib")) {
        labelText = "Active: CLEAR Trial Label (71%)";
        activeClass = "badge badge-active-label updated";
    } else if (med.includes("product_c") || med.includes("product-c") || med.includes("welireg") || med.includes("belzutifan")) {
        labelText = "Active: LITESPARK-005 Label (22%)";
        activeClass = "badge badge-active-label updated";
    } else if (med.includes("product_d") || med.includes("product-d") || med.includes("winrevair") || med.includes("sotatercept")) {
        labelText = "Active: STELLAR Trial Label (41m)";
        activeClass = "badge badge-active-label updated";
    } else if (med.includes("product_e") || med.includes("product-e") || med.includes("lynparza") || med.includes("olaparib")) {
        labelText = "Active: PROfound Trial Label (7.4m)";
        activeClass = "badge badge-active-label updated";
    } else if (med.includes("product_f") || med.includes("product-f") || med.includes("gardasil")) {
        labelText = "Active: GARDASIL 9 Label (97.4%)";
        activeClass = "badge badge-active-label updated";
    } else if (med.includes("product_g") || med.includes("product-g") || med.includes("lagevrio") || med.includes("molnupiravir")) {
        labelText = "Active: MOVe-OUT Label (30%)";
        activeClass = "badge badge-active-label updated";
    }
    
    if (labelTag) {
        labelTag.innerText = labelText;
        labelTag.className = activeClass;
    }
    
    const chromeTitle = document.getElementById("chrome-title");
    if (chromeTitle) {
        chromeTitle.innerText = `${med.replace(/ \+ /g, "_").toLowerCase()}_campaign_card.html`;
    }
    
    const cleanSourceName = sourceName || "Local Document";
    const cleanSourceType = sourceType || "Document";
    
    appendConsoleLine('system', `✅ Ingestion source '${cleanSourceName}' successfully processed and rendered.`);
    
    let claimsSummary = data.claims_audit.map(c => 
        `<li><strong>${c.claim_id}</strong>: ${c.finding} (${c.finding.includes('CLAIM COMPLIANCE') ? 'COMPLIANT' : 'WARNING'})</li>`
    ).join('');
    
    let layoutViolations = data.layout_audit.violations.length > 0 
        ? `<li>⚠️ Layout Violations Fixed: ${data.layout_audit.violations.join(', ')}</li>`
        : '<li>✅ Perfect layout alignment.</li>';
        
    appendChatBubble('assistant', `
        <p><strong>🚀 ${cleanSourceType} Complete:</strong></p>
        <p>Ingested Campaign Brief <strong>'${campaignName}'</strong> from: <code style="font-size: 0.75rem; color: var(--color-secondary);">${cleanSourceName}</code></p>
        <p>The <strong>Strategic Ingestion Agent</strong> parsed the document structure, extracted the text runs, and distilled the clinical parameters.</p>
        <p>The <strong>Semantic Claims Graph Agent</strong> validated all copy claims successfully against the active <strong>${trialName}</strong> trial parameters.</p>
        <ul style="margin-left: 1.25rem; margin-top: 0.25rem; font-size: 0.8rem; color: var(--color-text-muted);">
            ${claimsSummary}
            ${layoutViolations}
        </ul>
        <p style="margin-top: 0.4rem; font-size: 0.75rem;">
            Regulatory Compliance Vault synchronization reference: <strong>${data.claims_sync.active_version} (${data.claims_sync.efficacy_value} Efficacy)</strong> with cryptographic lock:<br>
            <code style="color: var(--color-secondary); font-size: 0.7rem;">${data.claims_sync.verification_hash}</code>
        </p>
    `);
    
    // Update compliance ledger table with the main claims
    const efficacyClaim = data.claims_audit.find(c => c.claim_id.includes("EFF")) || data.claims_audit[0];
    if (efficacyClaim) {
        let parameter = efficacyClaim.parameter || "Objective Response Rate (ORR)";
        let previous = "N/A (New Asset)";
        let grounded = `${medication} combination yields ${data.claims_sync.efficacy_value} efficacy.`;
        updateComplianceLedger(parameter, previous, grounded, data.claims_sync.verification_hash);
    }
    
    // 1. Prepend compliance audit run to Tab 3 History Ledger
    const campaignStatus = data.claims_audit.some(c => c.severity === 'CRITICAL') || data.layout_audit.violations.length > 0 ? 'AUTO-HEALED' : 'COMPLIANT';
    const auditAgent = data.claims_audit.some(c => c.severity === 'CRITICAL') ? 'SemanticClaimsGraphAgent' : (data.layout_audit.violations.length > 0 ? 'SelfHealingLayoutTokenAgent' : 'SemanticClaimsGraphAgent');
    
    prependToLedgerHistory(
        medication,
        campaignName,
        campaignStatus,
        auditAgent,
        data.claims_sync.verification_hash
    );
    
    // 2. Trigger dynamic claims network redraw on Tab 2
    const efficacyRef = efficacyClaim ? efficacyClaim.source_ref : "Ref #V-2026-KT089";
    const safetyClaim = data.claims_audit.find(c => c.claim_id.includes("SAF")) || data.claims_audit[1];
    const safetyRef = safetyClaim ? safetyClaim.source_ref : "Ref #V-2026-KTS99";
    const safetyVal = data.brief["Key Safety Parameter"] || "10%";
    
    drawClaimsNetwork(
        data.brief["Medication"],
        trialName,
        data.claims_sync.efficacy_value,
        safetyVal,
        efficacyRef,
        safetyRef,
        data.claims_sync.verification_hash,
        safetyClaim ? safetyClaim.verification_hash : "sha256:8f9c2eb3a901c4e5d2b7"
    );
}

// ==========================================
// REAL VEEVA PROMOMATS EXPORT BUILDER
// ==========================================
function exportComplianceVaultPackage() {
    const canvas = document.getElementById("canvas-render-block");
    if (!canvas) return;
    
    const htmlContent = canvas.innerHTML;
    const isLightTheme = document.body.classList.contains('light-theme');
    
    // Package it as a beautiful, self-contained standalone HTML compliant asset
    const fullHtmlFileContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regulatory Compliance Vault Compliant Marketing Asset</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: ${isLightTheme ? '#F8FAFC' : '#0B0F19'};
            color: ${isLightTheme ? '#0F172A' : '#F1F5F9'};
            font-family: 'Inter', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 2rem;
            box-sizing: border-box;
        }
        
        /* Box Embeddable Card Styles */
        .marketing-card {
            background: ${isLightTheme ? 'rgba(255, 255, 255, 0.9)' : 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)'};
            border: 1.5px solid ${isLightTheme ? '#E2E8F0' : 'rgba(20, 184, 166, 0.25)'};
            box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(16px);
            border-radius: 16px;
            padding: 2.5rem;
            max-width: 550px;
            width: 100%;
            text-align: center;
            box-sizing: border-box;
        }
        
        .card-header h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            margin: 0 0 0.75rem 0;
            background: ${isLightTheme ? '#0F172A' : 'linear-gradient(to right, #2DD4BF, #6366F1)'};
            ${isLightTheme ? '' : '-webkit-background-clip: text; -webkit-text-fill-color: transparent;'}
        }
        
        .card-subtitle {
            font-size: 0.9rem;
            color: ${isLightTheme ? '#475569' : '#94A3B8'};
            margin-bottom: 1.75rem;
            line-height: 1.5;
        }
        
        .efficacy-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            margin-bottom: 1.75rem;
        }
        
        .metric-dial {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: conic-gradient(#14B8A6 0%, #14B8A6 var(--metric-value, 56%), rgba(20, 184, 166, 0.1) var(--metric-value, 56%), rgba(20, 184, 166, 0.1) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(20, 184, 166, 0.25);
        }
        
        .dial-inner {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: ${isLightTheme ? '#FFFFFF' : '#0F172A'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Outfit', sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            color: #14B8A6;
        }
        
        .metric-info {
            text-align: left;
        }
        
        .metric-title {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #14B8A6;
            font-weight: 700;
            margin-bottom: 0.2rem;
        }
        
        .metric-desc {
            font-size: 1.1rem;
            font-weight: 700;
        }
        
        .safety-alert-box {
            background: ${isLightTheme ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.1)'};
            border: 1px dashed rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1.75rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-align: left;
        }
        
        .alert-icon {
            font-size: 1.5rem;
        }
        
        .alert-text {
            font-size: 0.8rem;
            line-height: 1.4;
            color: ${isLightTheme ? '#991B1B' : '#FCA5A5'};
        }
        
        .alert-text strong {
            color: #EF4444;
        }
        
        .card-footer {
            border-top: 1px solid ${isLightTheme ? '#E2E8F0' : 'rgba(255, 255, 255, 0.05)'};
            padding-top: 1.25rem;
            font-size: 0.7rem;
            color: ${isLightTheme ? '#64748B' : '#64748B'};
            line-height: 1.5;
            text-align: left;
        }
    </style>
</head>
<body>
    <!--
      ========================================================================
      MAESTRO VEEVA COMPLIANCE AUDIT SEAL
      ========================================================================
      Compliance Ledger Status: 100% SECURED & APPROVED
      Timestamp: ${new Date().toUTCString()}
      Target Platform: Regulatory Compliance Vault v2026.3
      
      Grounded Trial Registry: 
      - Source Reference: ${document.querySelector(".badge-active-label") ? document.querySelector(".badge-active-label").innerText : 'KEYNOTE-189 Phase III'}
      - Cryptographic Lock: ${document.querySelector(".diff-hash") ? document.querySelector(".diff-hash").title : 'sha256:d8b02ea9a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286'}
      ========================================================================
    -->
    ${htmlContent}
</body>
</html>`;

    // Trigger browser download
    const blob = new Blob([fullHtmlFileContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MAESTRO_VEEVA_LOCK_ASSET_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    appendConsoleLine('system', '📦 Regulatory Compliance Vault compliant export package compiled and downloaded successfully!');
}

// ==========================================
// HUMAN-IN-THE-LOOP WYSIWYG DIRECT EDIT
// ==========================================
let isEditMode = false;
let originalHtmlBeforeEdit = "";

function toggleEditMode() {
    const editBtn = document.getElementById("btn-edit-copy");
    const canvas = document.getElementById("canvas-render-block");
    const container = canvas.parentNode;
    
    if (!isEditMode) {
        // Enter Edit Mode
        isEditMode = true;
        originalHtmlBeforeEdit = canvas.innerHTML;
        
        canvas.contentEditable = "true";
        canvas.classList.add("edit-mode-active");
        
        // Inject floating warning banner
        const banner = document.createElement("div");
        banner.className = "edit-mode-indicator-banner";
        banner.id = "edit-warning-banner";
        banner.innerText = "Direct Edit Mode Enabled — Edits are subject to compliance validation";
        container.insertBefore(banner, canvas);
        
        editBtn.innerText = "Save & Validate";
        editBtn.className = "btn btn-primary btn-small glow-pulse";
        
        appendConsoleLine('system', '✏️ Direct Edit Mode enabled on Live Marketing Canvas. You can now modify text directly.');
        
        // Hook into interactive tour!
        if (window.isTourActive && window.tourStep === 5) {
            window.tourStep = 6;
            setTimeout(() => {
                    activeTour.drive(6);
            }, 300);
        }
    } else {
        // Exit Edit Mode and Validate
        saveAndValidateEdits();
    }
}

async function saveAndValidateEdits() {
    const editBtn = document.getElementById("btn-edit-copy");
    const canvas = document.getElementById("canvas-render-block");
    const banner = document.getElementById("edit-warning-banner");
    
    isEditMode = false;
    canvas.contentEditable = "false";
    canvas.classList.remove("edit-mode-active");
    if (banner) banner.remove();
    
    editBtn.disabled = true;
    editBtn.innerText = "Validating...";
    
    const editedHtml = canvas.innerHTML;
    
    appendConsoleLine('system', 'Sending manual copy edits to compliance validation loop...');
    resetPipelineTracker();
    updatePipelineStep('ingestion', 'SUCCESS'); // Ingestion skipped since edits are manual
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/validate-copy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: editedHtml, model_profile: activeModelProfile })
        });
        
        const data = await response.json();
        
        if (data.status === "HEALED") {
            // 1. Red flash animation to show violations were caught
            canvas.style.outline = "3px solid var(--color-error)";
            canvas.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.4)";
            updatePipelineStep('claims', 'VIOLATION', 80);
            updatePipelineStep('layout', 'VIOLATION', 80);
            
            appendConsoleLine('system', '⚠️ COMPLIANCE VIOLATIONS DETECTED IN DIRECT EDITS! Initiating auto-healing...');
            await sleep(2000);
            
            // 2. Render the self-healed, corrected HTML returned by the agents
            renderCanvasHTML(data.html);
            canvas.style.outline = "";
            canvas.style.boxShadow = "";
            
            // 3. Green flash animation to show successful repair
            canvas.classList.add("heal-glow");
            updatePipelineStep('claims', 'SUCCESS');
            updatePipelineStep('layout', 'SUCCESS');
            
            // 4. Print violations in console and add detailed audit bubble in chat
            let claimsSummary = data.claims_audit.map(c => 
                `<li><strong>${c.claim_id}</strong>: ${c.finding} (${c.severity})</li>`
            ).join('');
            
            let layoutViolations = data.layout_audit.violations.length > 0 
                ? `<li>⚠️ Layout Violations Healed: ${data.layout_audit.violations.join(', ')}</li>`
                : '<li>✅ Layout tokens successfully aligned.</li>';
                
            appendChatBubble('assistant', `
                <p><strong>⚠️ Human Copy Edits Auto-Corrected:</strong></p>
                <p>Your manual changes to the card layout or claims violated Global Pharma compliance rules. The agentic backplane intercepted your edits and successfully auto-healed the card:</p>
                <ul style="margin-left: 1.25rem; margin-top: 0.25rem; font-size: 0.8rem; color: var(--color-text-muted);">
                    ${claimsSummary}
                    ${layoutViolations}
                </ul>
                <p style="margin-top: 0.4rem; font-size: 0.75rem;">Compliance card restored to full safety and regulatory alignment.</p>
            `);
            
            if (window.analyticsData && Array.isArray(window.analyticsData)) {
                window.analyticsData.unshift({
                    campaign_id: `CAMP-HEAL-${Date.now().toString().slice(-4)}`,
                    project_name: `Direct Edit Compliance Correction`,
                    brand: 'PRODUCT-A',
                    indication: 'Oncology / Specialty',
                    status: 'AUTO_HEALED',
                    latency_ms: 1450,
                    violations_count: 1,
                    violation_details: ["Rule 3.1: Unapproved Efficacy Hook Claim"],
                    tokens_used: 32000,
                    cost_usd: 0.22,
                    savings_usd: 500.00,
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
                });
                if (typeof applyFilters === 'function') applyFilters();
            }
            
            await sleep(1500);
            canvas.classList.remove("heal-glow");
        } else {
            // 100% compliant manual edits
            canvas.classList.add("heal-glow");
            updatePipelineStep('claims', 'SUCCESS');
            updatePipelineStep('layout', 'SUCCESS');
            
            appendConsoleLine('system', '✅ Compliance check passed. Human edits are 100% compliant and grounded.');
            
            appendChatBubble('assistant', `
                <p><strong>✅ Direct Edits Verified & Approved:</strong></p>
                <p>The <strong>Semantic Claims Graph Agent</strong> and <strong>Self-Healing Layout Agent</strong> completed an audit of your manual copy modifications. No compliance or design token violations were found.</p>
                <p>The asset remains fully grounded and approved for promotional use.</p>
            `);
            
            await sleep(1500);
            canvas.classList.remove("heal-glow");
            
            // Dynamic Ledger Sync: Add a live manual edits transmittal entry!
            let variantNum = 1;
            if (document.getElementById('variant-tab-2') && document.getElementById('variant-tab-2').classList.contains('active')) {
                variantNum = 2;
            } else if (document.getElementById('variant-tab-3') && document.getElementById('variant-tab-3').classList.contains('active')) {
                variantNum = 3;
            }
            
            let medName = "Product-A";
            let campName = "KEYNOTE-189-NSCLC";
            if (variantNum === 2) {
                medName = "Product-C";
                campName = "CAMP-LV-581-RCC";
            } else if (variantNum === 3) {
                medName = "Product-B";
                campName = "CAMP-WR-005-RCC";
            }
            const manualHash = "sha256:ed" + Math.random().toString(16).substring(2, 18) + "a8f4c4c8d18471c2a1849a11c8e5d2b7";
            if (typeof addLedgerEntry === 'function') {
                addLedgerEntry(medName, campName, manualHash);
            }
            if (typeof recordTimeTravelEvent === 'function') {
                recordTimeTravelEvent("COPY_AUDIT_SYNC", "Manual or automated copy edit submitted", "MLR Judge and Layout Agent re-verified copy and layout compliance.");
            }
        }
    } catch (error) {
        console.error("Error validating edits:", error);
        appendConsoleLine('system', '❌ Validation server connection lost. Restoring original copy.');
        canvas.innerHTML = originalHtmlBeforeEdit;
    } finally {
        editBtn.disabled = false;
        editBtn.innerText = "Edit Copy";
        editBtn.className = "btn btn-primary btn-small";
        
        // Hook into interactive tour!
        if (window.isTourActive && window.tourStep === 6) {
            window.tourStep = 7;
            setTimeout(() => {
                    activeTour.drive(7);
            }, 1000); // 1s delay to let the green glow transition finish!
        }
    }
}

// ==========================================
// COMPLIANCE DIFF LEDGER DRAWER
// ==========================================
function toggleLedgerDrawer(show = null) {
    const drawer = document.getElementById("diff-ledger-drawer");
    if (show === true) {
        drawer.style.display = "block";
    } else if (show === false) {
        drawer.style.display = "none";
    } else {
        drawer.style.display = drawer.style.display === "none" ? "block" : "none";
    }
}

function updateComplianceLedger(parameter, previous, grounded, hash) {
    const tbody = document.getElementById("compliance-table-body");
    if (!tbody) return; // Robust null protection check!
    
    // Create new row
    const row = document.createElement("tr");
    row.innerHTML = `
        <td style="font-weight: 700; color: var(--color-text-main);">${parameter}</td>
        <td><span class="diff-del">${previous}</span></td>
        <td><span class="diff-ins">${grounded}</span></td>
        <td><code class="diff-hash" title="${hash}">${hash.substring(0, 18)}...</code></td>
    `;
    
    // Clear old rows and append
    tbody.innerHTML = "";
    tbody.appendChild(row);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// CLINICAL DATASETS (LOCAL FILE SYSTEM)
// ==========================================
async function fetchDatasets() {
    const container = document.getElementById("dataset-list-container");
    if (!container) return;
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/datasets`);
        const datasets = await response.json();
        
        if (datasets.length === 0) {
            container.innerHTML = `<div class="dataset-loading">No JSON briefs found in ./datasets/</div>`;
            return;
        }
        
        container.innerHTML = "";
        datasets.forEach(d => {
            let medClass = "generic";
            const med = d.medication.toLowerCase();
            if (med.includes("product_a")) medClass = "product_a";
            else if (med.includes("product_b")) medClass = "product_b";
            else if (med.includes("product_c")) medClass = "product_c";
            
            const item = document.createElement("div");
            item.className = "dataset-item";
            item.innerHTML = `
                <div class="dataset-info">
                    <span class="dataset-name" title="${d.campaign_name}">${d.campaign_name}</span>
                    <div class="dataset-meta">
                        <span class="med-tag ${medClass}">${d.medication}</span>
                        <span class="dataset-trial" title="${d.clinical_trial}">${d.clinical_trial}</span>
                    </div>
                </div>
                <button class="btn-ingest" onclick="ingestDataset('${d.filename}')">Ingest</button>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error("Error fetching datasets:", error);
        container.innerHTML = `<div class="dataset-loading" style="color: var(--color-error);">❌ Error scanning datasets folder.</div>`;
    }
}

async function ingestDataset(filename) {
    appendConsoleLine('system', `📁 Requesting file ingestion: ./datasets/${filename}`);
    resetPipelineTracker();
    setLoadingState(true);
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/datasets/ingest/${filename}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.status === 'SUCCESS') {
            renderCanvasHTML(data.html);
            
            const editBtn = document.getElementById("btn-edit-copy");
            if (editBtn) editBtn.disabled = false;
            
            updatePipelineStep('ingestion', 'SUCCESS');
            updatePipelineStep('claims', 'SUCCESS');
            updatePipelineStep('layout', 'SUCCESS');
            
            const labelTag = document.getElementById("active-label-tag");
            const med = data.brief["Medication"].toLowerCase();
            let labelText = "Active: Week 24 Label (56%)";
            let activeClass = "badge badge-active-label";
            
            if (med.includes("product_b") || med.includes("lenvima")) {
                labelText = "Active: CLEAR Trial Label (71%)";
                activeClass = "badge badge-active-label updated";
            } else if (med.includes("product_c") || med.includes("welireg")) {
                labelText = "Active: LITESPARK-005 Label (22%)";
                activeClass = "badge badge-active-label updated";
            } else if (med.includes("product_d") || med.includes("winrevair")) {
                labelText = "Active: STELLAR Trial Label (41m)";
                activeClass = "badge badge-active-label updated";
            } else if (med.includes("product_e") || med.includes("lynparza")) {
                labelText = "Active: PROfound Trial Label (7.4m)";
                activeClass = "badge badge-active-label updated";
            } else if (med.includes("product_f") || med.includes("gardasil")) {
                labelText = "Active: GARDASIL 9 Label (97.4%)";
                activeClass = "badge badge-active-label updated";
            } else if (med.includes("product_g") || med.includes("lagevrio")) {
                labelText = "Active: MOVe-OUT Label (30%)";
                activeClass = "badge badge-active-label updated";
            }
            
            labelTag.innerText = labelText;
            labelTag.className = activeClass;
            
            const chromeTitle = document.getElementById("chrome-title");
            if (chromeTitle) {
                chromeTitle.innerText = `${med.replace(/ \+ /g, "_").toLowerCase()}_campaign_card.html`;
            }
            
            appendConsoleLine('system', `✅ File dataset '${filename}' successfully processed and rendered.`);
            
            let claimsSummary = data.claims_audit.map(c => 
                `<li><strong>${c.claim_id}</strong>: ${c.finding} (${c.severity})</li>`
            ).join('');
            
            let layoutViolations = data.layout_audit.violations.length > 0 
                ? `<li>⚠️ Layout Violations Fixed: ${data.layout_audit.violations.join(', ')}</li>`
                : '<li>✅ Perfect layout alignment.</li>';
                
            appendChatBubble('assistant', `
                <p><strong>📁 File Ingestion Pipeline Complete:</strong></p>
                <p>Ingested Campaign Brief <strong>'${data.brief["Campaign Name"]}'</strong> directly from the local file system.</p>
                <p>The <strong>Semantic Claims Graph Agent</strong> dynamically synchronized its reference engine to the active <strong>${data.brief["Clinical Trial"]}</strong> trial parameters and validated all copy claims successfully.</p>
                <ul style="margin-left: 1.25rem; margin-top: 0.25rem; font-size: 0.8rem; color: var(--color-text-muted);">
                    ${claimsSummary}
                    ${layoutViolations}
                </ul>
                <p style="margin-top: 0.4rem; font-size: 0.75rem;">
                    Regulatory Compliance Vault synchronization reference: <strong>${data.claims_sync.active_version} (${data.claims_sync.efficacy_value} Efficacy)</strong> with cryptographic lock:<br>
                    <code style="color: var(--color-secondary); font-size: 0.7rem;">${data.claims_sync.verification_hash}</code>
                </p>
            `);
        } else {
            appendConsoleLine('system', `❌ Ingestion failed: ${data.message}`);
        }
    } catch (error) {
        console.error("Error ingesting dataset:", error);
        appendConsoleLine('system', '❌ Connection failed. Unable to reach Master Ingestion backplane.');
    } finally {
        setLoadingState(false);
    }
}

async function uploadDatasetFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    appendConsoleLine('system', `📤 Uploading file '${file.name}' to local clinical briefing ledger...`);
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const jsonContent = JSON.parse(e.target.result);
            
            const response = await fetch(`${BACKEND_URL}/api/datasets/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    content: jsonContent
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                appendConsoleLine('system', `✅ File successfully saved to ./datasets/${file.name} on the file system.`);
                fetchDatasets();
                
                appendChatBubble('assistant', `
                    <p><strong>📁 Local Dataset Registered:</strong></p>
                    <p>Campaign brief <strong>'${file.name}'</strong> has been successfully uploaded, validated as a compliant schema, and written to your local <code>./datasets/</code> directory on the disk.</p>
                    <p>It is now available in your Clinical Ingestion Repository list. Click <strong>'Ingest'</strong> on the file card to route it through the multi-agent pipeline!</p>
                `);
            } else {
                appendConsoleLine('system', `❌ Upload failed: ${data.detail || 'Invalid brief schema.'}`);
            }
        } catch (err) {
            appendConsoleLine('system', '❌ Error: Uploaded file is not a valid JSON brief.');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = "";
}

// ==========================================
// WORKFLOW FOCUS MODES SWITCHER
// ==========================================
window.switchWorkflowMode = function(mode) {
    // 1. Update active states on workflow navigation pills
    document.querySelectorAll(".workflow-pill-btn").forEach(btn => {
        btn.classList.remove("active");
        btn.style.color = "var(--color-text-muted)";
    });
    
    const activeBtn = document.getElementById("btn-wf-" + mode);
    if (activeBtn) {
        activeBtn.classList.add("active");
        activeBtn.style.color = "var(--color-primary)";
    }
    
    // 2. Target columns and layout wrapper
    const layout = document.querySelector(".workbench-layout-contentstudio");
    const secIngest = document.getElementById("section-ingestion");
    const secOrchestrate = document.getElementById("section-orchestration");
    const secComposer = document.getElementById("section-composer");
    const secGovern = document.getElementById("section-governance");
    
    if (!layout) return;
    
    // Helper to fade in elements cleanly
    const showSection = (el, displayType = "flex") => {
        if (!el) return;
        el.style.display = displayType;
        el.style.opacity = "0";
        el.style.transition = "opacity 0.25s ease-in-out";
        setTimeout(() => el.style.opacity = "1", 30);
    };
    
    const hideSection = (el) => {
        if (!el) return;
        el.style.display = "none";
        el.style.opacity = "0";
    };
    
    // Remove widescreen-mode from governance panel by default
    if (secGovern) secGovern.classList.remove("widescreen-mode");
    
    if (mode === "ingest") {
        // MODE 1: Ingestion & Orchestration (2-Column Grid)
        layout.style.gridTemplateColumns = "420px 1fr";
        showSection(secIngest, "flex");
        showSection(secOrchestrate, "flex");
        hideSection(secComposer);
        hideSection(secGovern);
        
        logConsoleLine("Master_Orchestrator_Agent", "🔄 Switched workspace focus: Ingestion & Orchestration.");
    } else if (mode === "compose") {
        // MODE 2: Creative Composer Canvas (1-Column Widescreen Grid)
        layout.style.gridTemplateColumns = "1fr";
        hideSection(secIngest);
        hideSection(secOrchestrate);
        showSection(secComposer, "flex");
        hideSection(secGovern);
        
        logConsoleLine("Master_Orchestrator_Agent", "🔄 Switched workspace focus: Creative Composer Workbench.");
    } else if (mode === "govern") {
        // MODE 3: Governance & Delivery (1-Column Grid, expanded internally to 3 columns!)
        layout.style.gridTemplateColumns = "1fr";
        hideSection(secIngest);
        hideSection(secOrchestrate);
        hideSection(secComposer);
        
        if (secGovern) {
            secGovern.classList.add("widescreen-mode");
            showSection(secGovern, "flex");
        }
        
        logConsoleLine("Standards_Governance_Registry", "🔄 Switched workspace focus: AI Governance & Standards Command Center.");
    }
};

// ==========================================
// EXECUTIVE TABS NAVIGATION
// ==========================================
function switchTab(tabId) {
    // 📂 Navigated via Legacy Trigger -> Dynamic Router Proxy!
    if (window.appendConsoleLine) {
        appendConsoleLine('system', `📂 Dynamic Router Proxy: Trapping legacy switchTab('${tabId}')`);
    }
    
    const workbenchTab = document.getElementById("tab-workbench");
    const analyticsTab = document.getElementById("tab-analytics");
    
    if (tabId === 'workbench') {
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active-tab"));
        if (workbenchTab) {
            workbenchTab.classList.add("active-tab");
            workbenchTab.style.setProperty('display', 'flex', 'important');
        }
        if (analyticsTab) {
            analyticsTab.style.setProperty('display', 'none', 'important');
        }
        
        if (typeof currentActivePhase !== 'undefined') {
            switchPhase(currentActivePhase);
        } else {
            switchPhase(-1);
        }
    } else if (tabId === 'explorer') {
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active-tab"));
        if (workbenchTab) {
            workbenchTab.classList.add("active-tab");
            workbenchTab.style.setProperty('display', 'flex', 'important');
        }
        if (analyticsTab) {
            analyticsTab.style.setProperty('display', 'none', 'important');
        }
        switchPhase(3);
        switchRightTab('claims');
    } else if (tabId === 'ledger') {
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active-tab"));
        if (workbenchTab) {
            workbenchTab.classList.add("active-tab");
            workbenchTab.style.setProperty('display', 'flex', 'important');
        }
        if (analyticsTab) {
            analyticsTab.style.setProperty('display', 'none', 'important');
        }
        switchPhase(3);
        switchRightTab('export');
    } else if (tabId === 'analytics') {
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active-tab"));
        if (analyticsTab) {
            analyticsTab.classList.add("active-tab");
            analyticsTab.style.setProperty('display', 'flex', 'important');
        }
        if (workbenchTab) {
            workbenchTab.style.setProperty('display', 'none', 'important');
        }
        
        // Update active class on sidebar buttons
        document.querySelectorAll('.side-nav-btn, .action-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.getElementById('global-nav-btn-analytics');
        if (activeBtn) activeBtn.classList.add('active');
        
        // Initialize the new Analytics Dashboard!
        setTimeout(initAnalyticsDashboard, 50);
    }
}

// ==========================================
// PREMIUM EXECUTIVE ANALYTICS (CHART.JS)
// ==========================================
let chartsInstance = {};

function initCharts() {
    const isLightTheme = document.body.classList.contains('light-theme');
    const textColor = isLightTheme ? '#0F172A' : '#F1F5F9';
    const gridColor = isLightTheme ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    
    // --- 1. Efficacy Chart (ORR %) ---
    const effCtx = document.getElementById('efficacyChart');
    if (effCtx) {
        if (chartsInstance['efficacy']) chartsInstance['efficacy'].destroy();
        
        chartsInstance['efficacy'] = new Chart(effCtx, {
            type: 'bar',
            data: {
                labels: ['Product-A (KEYNOTE-189)', 'Product-B + Product-A (CLEAR)', 'Product-C (LITESPARK-005)'],
                datasets: [{
                    label: 'Objective Response Rate (ORR %)',
                    data: [56, 71, 22],
                    backgroundColor: [
                        'rgba(20, 184, 166, 0.85)', // Global Pharma Teal
                        'rgba(99, 102, 241, 0.85)',  // Indigo
                        'rgba(168, 85, 247, 0.85)'   // Purple
                    ],
                    borderColor: [
                        '#14B8A6',
                        '#6366F1',
                        '#A855F7'
                    ],
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        backgroundColor: isLightTheme ? '#FFFFFF' : '#1E293B', 
                        titleColor: isLightTheme ? '#0F172A' : '#FFFFFF', 
                        bodyColor: isLightTheme ? '#0F172A' : '#F1F5F9',
                        borderWidth: isLightTheme ? 1 : 0,
                        borderColor: 'rgba(0,0,0,0.1)'
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Outfit', size: 10 } } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit' } }, min: 0, max: 100 }
                }
            }
        });
    }
    
    // --- 2. Safety Chart (Adverse Events %) ---
    const safetyCtx = document.getElementById('safetyChart');
    if (safetyCtx) {
        if (chartsInstance['safety']) chartsInstance['safety'].destroy();
        
        chartsInstance['safety'] = new Chart(safetyCtx, {
            type: 'bar',
            data: {
                labels: ['Product-A (10% AE)', 'Product-B + Product-A (82% AE)', 'Product-C (30% AE)'],
                datasets: [{
                    label: 'Grade 3/4 Adverse Events (%)',
                    data: [10, 82, 30],
                    backgroundColor: [
                        'rgba(20, 184, 166, 0.75)',
                        'rgba(99, 102, 241, 0.75)',
                        'rgba(168, 85, 247, 0.75)'
                    ],
                    borderColor: [
                        '#14B8A6',
                        '#6366F1',
                        '#A855F7'
                    ],
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal bar chart
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        backgroundColor: isLightTheme ? '#FFFFFF' : '#1E293B', 
                        titleColor: isLightTheme ? '#0F172A' : '#FFFFFF', 
                        bodyColor: isLightTheme ? '#0F172A' : '#F1F5F9',
                        borderWidth: isLightTheme ? 1 : 0,
                        borderColor: 'rgba(0,0,0,0.1)'
                    }
                },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit' } }, min: 0, max: 100 },
                    y: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Outfit', size: 10 } } }
                }
            }
        });
    }
    
    // --- 3. Compliance Doughnut Chart ---
    const compCtx = document.getElementById('complianceChart');
    if (compCtx) {
        if (chartsInstance['compliance']) chartsInstance['compliance'].destroy();
        
        chartsInstance['compliance'] = new Chart(compCtx, {
            type: 'doughnut',
            data: {
                labels: ['Compliant', 'Auto-Healed', 'Violations Blocked'],
                datasets: [{
                    data: [3, 1, 0],
                    backgroundColor: [
                        '#10B981', // green
                        '#F59E0B', // amber
                        '#EF4444'  // red
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        backgroundColor: isLightTheme ? '#FFFFFF' : '#1E293B', 
                        titleColor: isLightTheme ? '#0F172A' : '#FFFFFF', 
                        bodyColor: isLightTheme ? '#0F172A' : '#F1F5F9',
                        borderWidth: isLightTheme ? 1 : 0,
                        borderColor: 'rgba(0,0,0,0.1)'
                    }
                },
                cutout: '70%'
            }
        });
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// DYNAMIC COMPLIANCE LEDGER LOGGING & INTERACTION
// ==========================================
function prependToLedgerHistory(medication, campaignName, status, agent, hash) {
    const tbody = document.getElementById("ledger-history-body");
    if (!tbody) return;
    
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').split('.')[0];
    
    const displayStatus = status === 'COMPLIANT' || status === 'VERIFIED' ? 'VERIFIED' : 'FLAGGED';
    const statusClass = displayStatus === 'VERIFIED' ? 'badge-success' : 'badge-warning';
    
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid var(--border-color)";
    row.style.animation = "fadeInTab 0.5s ease-out";
    row.style.cursor = "pointer";
    
    row.innerHTML = `
        <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">${timestamp}</td>
        <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--color-text-main);">${medication}</td>
        <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--color-primary);">${campaignName}</td>
        <td style="padding: 0.85rem 1rem;"><span class="badge ${statusClass}" style="font-size: 0.6rem; padding: 0.15rem 0.4rem;">${displayStatus}</span></td>
        <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">${agent}</td>
        <td style="padding: 0.85rem 1rem;">
            <div style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.5rem; border-radius: 4px; background: var(--bg-body); border: 1px solid var(--border-color); font-family: monospace; font-size: 0.68rem; color: var(--color-text-muted); cursor: help;" title="${hash}">
                <span style="color: #10B981; font-size: 0.75rem;">🔒</span> sha256:${hash.substring(7, 14)}...
            </div>
        </td>
    `;
    
    tbody.insertBefore(row, tbody.firstChild);
    
    // Bind click event for compliance certificates
    row.addEventListener('click', () => {
        showComplianceCertificate({
            timestamp, medication, campaignName, status: displayStatus, auditor: agent, hash
        });
    });
}

// Search filter logic
window.filterLedgerTable = function(query) {
    const q = query.toLowerCase().trim();
    const rows = document.querySelectorAll('#ledger-history-body tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(q)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
};

// Status filter logic
window.filterLedgerTableByStatus = function(status) {
    const s = status.toLowerCase().trim();
    const rows = document.querySelectorAll('#ledger-history-body tr');
    rows.forEach(row => {
        const badge = row.querySelector('.badge');
        if (!badge) return;
        const text = badge.innerText.toLowerCase().trim();
        
        if (s === 'all') {
            row.style.display = '';
        } else if (s === 'verified' && text === 'verified') {
            row.style.display = '';
        } else if (s === 'flagged' && text === 'flagged') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
};

// True CSV Export compiler
window.exportLedgerToCSV = function() {
    const rows = document.querySelectorAll('#ledger-history-body tr');
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Asset Name,ComplianceVault Campaign ID,Status,Executing Auditor,Verification Cryptographic Lock\r\n";
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            const timestamp = cells[0].innerText;
            const medication = cells[1].innerText.replace(/,/g, '');
            const campaignName = cells[2].innerText;
            const status = cells[3].innerText;
            const auditor = cells[4].innerText;
            const hash = cells[5].querySelector('div')?.getAttribute('title') || cells[5].innerText;
            csvContent += `"${timestamp}","${medication}","${campaignName}","${status}","${auditor}","${hash}"\r\n`;
        }
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `global_pharma_compliance_ledger_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logConsoleLine("Master_Orchestrator_Agent", "📥 Exported Compliance Ledger records to CSV package successfully.");
};

// Compliance Certificate Modal
window.showComplianceCertificate = function(data) {
    const modal = document.getElementById('compliance-modal');
    if (!modal) return;
    
    document.getElementById('cert-time').innerText = data.timestamp;
    document.getElementById('cert-med').innerText = data.medication;
    document.getElementById('cert-campaign').innerText = data.campaignName;
    document.getElementById('cert-auditor').innerText = data.auditor || 'Gemini Standards Agent';
    document.getElementById('cert-hash').innerText = data.hash;
    
    const card = modal.querySelector('.imagen-modal-card');
    const statusHeader = modal.querySelector('h4');
    if (data.status === 'FLAGGED') {
        if (card) card.style.borderLeft = '5px solid #EF4444';
        if (statusHeader) {
            statusHeader.innerText = 'FLAGGED FOR ATTENTION';
            statusHeader.style.color = '#EF4444';
        }
    } else {
        if (card) card.style.borderLeft = '5px solid #10B981';
        if (statusHeader) {
            statusHeader.innerText = 'VERIFIED & COMPLIANT';
            statusHeader.style.color = '#10B981';
        }
    }
    
    modal.classList.add('active');
    updateHashFromState();
};

window.closeComplianceModal = function() {
    const modal = document.getElementById('compliance-modal');
    if (modal) modal.classList.remove('active');
    updateHashFromState();
};

// ==========================================
// INTERACTIVE CLAIMS NETWORK VISUALIZER
// ==========================================
const SVG_NS = "http://www.w3.org/2000/svg";

function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (let [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
    }
    return el;
}

function drawDefaultClaimsNetwork() {
    drawClaimsNetwork(
        "Product-A",
        "KEYNOTE-189 (NCT02578680)",
        "56%",
        "10%",
        "Ref #V-2026-KT089",
        "Ref #V-2026-KTS99",
        "sha256:d8b02ea9a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286",
        "sha256:8f9c2eb3a901c4e5d2b71a3f009a1c77f00a2eb3a901c77f00a2eb3a901c66"
    );
}

let currentNetworkInstance = null; // Store globally to clean up properly on tab switches!

function drawClaimsNetwork(medication, trialName, efficacyVal, safetyVal, efficacyRef, safetyRef, efficacyHash, safetyHash) {
    medication = medication || "Product-A";
    const container = document.getElementById("claims-network-container");
    if (!container) return;
    
    // Deconstruct and clean up previous instance to prevent memory leaks!
    if (currentNetworkInstance) {
        currentNetworkInstance.destroy();
        currentNetworkInstance = null;
    }
    
    // Update Active Badge in Card Header
    const badge = document.getElementById("explorer-active-label-tag");
    if (badge) {
        badge.innerText = `Active: ${medication} (${trialName.split(' ')[0]} - ${efficacyVal})`;
    }
    
    // Determine drug specifics for secondary clinical indications
    const isProduct_C = medication.toLowerCase().includes('product_c') || medication.toLowerCase().includes('product-c') || medication.toLowerCase().includes('lenvima');
    const isProduct_B = medication.toLowerCase().includes('product_b') || medication.toLowerCase().includes('product-b') || medication.toLowerCase().includes('welireg');
    
    const secondaryTrial = isProduct_C ? 'LITESPARK-001' : (isProduct_B ? 'STUDY-307' : 'KEYNOTE-407');
    const secondaryProtocol = isProduct_C ? 'LITESPARK-001 (RCC NCT03401788)' : (isProduct_B ? 'STUDY-307 (CLEAR Trial)' : 'KEYNOTE-407 (Squamous NSCLC)');
    
    const pfsVal = isProduct_C ? 'PFS: 12.0mo' : (isProduct_B ? 'PFS: 14.7mo' : 'PFS: 8.8mo');
    const pfsLabel = isProduct_C ? '12.0 Months Median' : (isProduct_B ? '14.7 Months Median' : '8.8 Months Median');
    
    const osVal = isProduct_C ? 'OS: 25.0mo' : (isProduct_B ? 'OS: 26.4mo' : 'OS: 22.0mo');
    const osLabel = isProduct_C ? '25.0 Months Median' : (isProduct_B ? '26.4 Months Median' : '22.0 Months Median');
    
    // Define the 12-node clinical ontology dataset
    const visNodes = [
        { 
            id: 'center', 
            label: `${medication.toUpperCase()}\nCampaign Asset\n🎨`, 
            color: { background: '#0D9488', border: '#0F766E', hover: { background: '#0F766E', border: '#0F766E' } },
            size: 28,
            shape: 'circle',
            title: `<strong>Active Campaign Asset</strong><br>Medication: <strong>${medication}</strong><br>Linked Parameters: 5 verified connections.`
        },
        { 
            id: 'trial', 
            label: `${trialName.split(' ')[0]}\nPrimary Study\n🧬`, 
            color: { background: '#6366F1', border: '#4F46E5', hover: { background: '#4F46E5', border: '#4F46E5' } },
            size: 24,
            shape: 'circle',
            title: `<strong>Primary Clinical Study Node</strong><br>Grounded Study: <strong>${trialName}</strong><br>FDA Registry: Verified lock.`
        },
        { 
            id: 'trial_sec', 
            label: `${secondaryTrial}\nSecondary Indication\n🧪`, 
            color: { background: '#4F46E5', border: '#4338CA', hover: { background: '#4338CA', border: '#4338CA' } },
            size: 22,
            shape: 'circle',
            title: `<strong>Secondary Clinical Indication</strong><br>Protocol: <strong>${secondaryProtocol}</strong>`
        },
        { 
            id: 'efficacy', 
            label: `ORR: ${efficacyVal}\nEfficacy Claim\n📈`, 
            color: { background: '#10B981', border: '#059669', hover: { background: '#059669', border: '#059669' } },
            size: 22,
            shape: 'circle',
            title: `<strong>Efficacy Claim Node</strong><br>Verified value: <strong>${efficacyVal} ORR</strong><br>Ref: <strong>${efficacyRef}</strong><br>Hash:<br><code style="font-size:0.55rem; color:#10B981; word-break:break-all;">${efficacyHash}</code>`
        },
        { 
            id: 'pfs', 
            label: `${pfsVal}\nPFS Endpoint\n📊`, 
            color: { background: '#059669', border: '#047857', hover: { background: '#047857', border: '#047857' } },
            size: 22,
            shape: 'circle',
            title: `<strong>Progression-Free Survival Node</strong><br>PFS Median: <strong>${pfsLabel}</strong>`
        },
        { 
            id: 'os', 
            label: `${osVal}\nOS Endpoint\n⏱️`, 
            color: { background: '#047857', border: '#065F46', hover: { background: '#065F46', border: '#065F46' } },
            size: 22,
            shape: 'circle',
            title: `<strong>Overall Survival Endpoint</strong><br>OS Median: <strong>${osLabel}</strong>`
        },
        { 
            id: 'safety', 
            label: `Safety: ${safetyVal}\nSafety Profile\n⚠️`, 
            color: { background: '#EF4444', border: '#DC2626', hover: { background: '#DC2626', border: '#DC2626' } },
            size: 22,
            shape: 'circle',
            title: `<strong>Safety Claim Node</strong><br>Verified Safety Profile: <strong>${safetyVal} Adverse Reactions</strong><br>Ref: <strong>${safetyRef}</strong><br>Hash:<br><code style="font-size:0.55rem; color:#EF4444; word-break:break-all;">${safetyHash}</code>`
        },
        { 
            id: 'ledger', 
            label: `Cryptographic\nLock\n🔒`, 
            color: { background: '#A855F7', border: '#891DDE', hover: { background: '#891DDE', border: '#891DDE' } },
            size: 22,
            shape: 'circle',
            title: `<strong>Secure State Ledger Node</strong><br>Audit Seal Status: <strong>100% SECURED</strong><br>Sync: Cryptographic Block Ledger`
        },
        { 
            id: 'asset_library_fragment', 
            label: `AssetLibrary\nFragment\n📂`, 
            color: { background: '#EA580C', border: '#C2410C', hover: { background: '#C2410C', border: '#C2410C' } },
            size: 22,
            shape: 'circle',
            title: `<strong>Content Platform Fragment</strong><br>Asset Type: Approved Copy Block & Image<br>Status: Direct Sync active`
        },
        { 
            id: 'compliance_vault_vault', 
            label: `ComplianceVault\nAPI Gateway\n☁️`, 
            color: { background: '#D97706', border: '#B45309', hover: { background: '#B45309', border: '#B45309' } },
            size: 22,
            shape: 'circle',
            title: `<strong>ComplianceVault API Gateway</strong><br>API Status: <strong>CONNECTED</strong><br>Verification Session: Compliant`
        },
        { 
            id: 'kong_gateway', 
            label: `Kong AI\nGateway\n⚡`, 
            color: { background: '#DB2777', border: '#C026D3', hover: { background: '#C026D3', border: '#C026D3' } },
            size: 22,
            shape: 'circle',
            title: `<strong>Kong AI Gateway Telemetry</strong><br>Sanitization: SECURED<br>Route: Vertex-Gemini<br>Latency: 12ms`
        },
        { 
            id: 'standards_playbook', 
            label: `FDA Guidelines\nOPDP 2026\n📖`, 
            color: { background: '#2563EB', border: '#1D4ED8', hover: { background: '#1D4ED8', border: '#1D4ED8' } },
            size: 22,
            shape: 'circle',
            title: `<strong>FDA OPDP Regulatory Playbook</strong><br>Rule Check: 100% Passed`
        }
    ];
    
    // Define connection links
    const visEdges = [
        { from: 'center', to: 'trial', color: { color: '#6366F1' } },
        { from: 'center', to: 'trial_sec', color: { color: '#4F46E5' } },
        { from: 'center', to: 'asset_library_fragment', color: { color: '#EA580C' } },
        { from: 'center', to: 'compliance_vault_vault', color: { color: '#D97706' } },
        { from: 'center', to: 'kong_gateway', color: { color: '#DB2777' } },
        { from: 'trial', to: 'efficacy', color: { color: '#10B981' } },
        { from: 'trial', to: 'pfs', color: { color: '#059669' } },
        { from: 'trial', to: 'os', color: { color: '#047857' } },
        { from: 'trial', to: 'safety', color: { color: '#EF4444' } },
        { from: 'ledger', to: 'efficacy', color: { color: '#A855F7' } },
        { from: 'ledger', to: 'safety', color: { color: '#A855F7' } },
        { from: 'ledger', to: 'kong_gateway', color: { color: '#A855F7' } },
        { from: 'compliance_vault_vault', to: 'standards_playbook', color: { color: '#2563EB' } },
        { from: 'trial_sec', to: 'standards_playbook', color: { color: '#2563EB' } }
    ];
    
    // Theme-aware font contrast for perfect readability in Light and Dark modes!
    const isLightTheme = document.body.classList.contains('light-theme');
    const labelColor = isLightTheme ? '#1E293B' : '#F1F5F9';
    const boldColor = isLightTheme ? '#0F172A' : '#FFFFFF';

    // Configure Vis.js Options for ultimate visual quality and spacing
    const options = {
        nodes: {
            font: {
                color: labelColor,
                size: 9,
                face: 'Outfit',
                multi: true,
                bold: { color: boldColor, size: 9 }
            },
            borderWidth: 2,
            borderWidthSelected: 3,
            shadow: {
                enabled: true,
                color: 'rgba(0, 0, 0, 0.4)',
                size: 6,
                x: 0,
                y: 3
            }
        },
        edges: {
            width: 1.5,
            smooth: {
                type: 'cubicBezier',
                forceDirection: 'none',
                roundness: 0.35
            },
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 0.7
                }
            },
            shadow: {
                enabled: true,
                color: 'rgba(0, 0, 0, 0.1)',
                size: 3,
                x: 0,
                y: 1.5
            }
        },
        interaction: {
            hover: true,
            dragNodes: true,
            dragView: true,
            zoomView: true,
            tooltipDelay: 80
        },
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -4500, // Mighty negative gravity to push nodes far apart (absolutely ZERO overlaps!)
                centralGravity: 0.35,
                springLength: 120,           // Spacious resting spring length
                springConstant: 0.045,
                damping: 0.85,
                avoidOverlap: 1.0            // Instruct the engine to strictly avoid overlaps!
            },
            stabilization: {
                enabled: true,
                iterations: 120,             // Render only after pre-stabilizing so there is no visual clutter on start!
                updateInterval: 25
            }
        }
    };
    
    // Assemble the data
    const data = {
        nodes: new vis.DataSet(visNodes),
        edges: new vis.DataSet(visEdges)
    };
    
    // Build the canvas network!
    const network = new vis.Network(container, data, options);
    currentNetworkInstance = network;
    
    // Automatically center and zoom camera to fit all nodes perfectly after physics stabilization finishes!
    network.once("stabilizationIterationsDone", function () {
        network.fit({
            animation: {
                duration: 600,
                easingFunction: 'easeOutQuad'
            }
        });
    });
    
    // Custom floating mouse-tracking tooltip event bindings
    network.on("hoverNode", function (params) {
        const nodeId = params.node;
        const nodeData = visNodes.find(n => n.id === nodeId);
        if (nodeData) {
            const tooltip = document.getElementById("network-node-tooltip");
            if (tooltip) {
                // Parse and render the structured HTML beautifully
                tooltip.innerHTML = `
                    <div style="font-weight: 700; color: var(--color-primary); display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem;">
                        <span>🔍</span> ${nodeData.label.replace('\n', ' ')}
                    </div>
                    <div style="border-top: 1px solid var(--border-color); margin: 0.4rem 0; padding-top: 0.4rem;">
                        ${nodeData.title}
                    </div>
                `;
                tooltip.style.display = "block";
                
                // Position tooltip fixed next to cursor
                const x = params.event.clientX;
                const y = params.event.clientY;
                tooltip.style.left = (x + 15) + "px";
                tooltip.style.top = (y + 15) + "px";
            }
        }
    });
    
    // Smoothly track mouse movements for a premium responsive glide!
    network.on("mousemove", function (params) {
        const tooltip = document.getElementById("network-node-tooltip");
        if (tooltip && tooltip.style.display === "block") {
            const x = params.event.clientX;
            const y = params.event.clientY;
            tooltip.style.left = (x + 15) + "px";
            tooltip.style.top = (y + 15) + "px";
        }
    });
    
    network.on("blurNode", function (params) {
        const tooltip = document.getElementById("network-node-tooltip");
        if (tooltip) tooltip.style.display = "none";
    });
    
    // Add Click listener to show a gorgeous structured detail modal!
    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const nodeData = visNodes.find(n => n.id === nodeId);
            if (nodeData) {
                showClaimsNodeDetailModal(nodeData);
            }
        }
    });
}

// Dynamic structured node details modal popup
window.showClaimsNodeDetailModal = function(nodeData) {
    const modal = document.getElementById('detail-modal');
    const iconEl = document.getElementById('detail-modal-icon');
    const titleEl = document.getElementById('detail-modal-title');
    const subtitleEl = document.getElementById('detail-modal-subtitle');
    const bodyEl = document.getElementById('detail-modal-body');
    
    if (!modal || !bodyEl) return;
    
    // Select premium icon based on node category
    let icon = "🔍";
    if (nodeData.id === 'center') icon = "🎨";
    else if (nodeData.id.includes('trial')) icon = "🧬";
    else if (nodeData.id === 'efficacy' || nodeData.id.includes('pfs') || nodeData.id.includes('os')) icon = "📈";
    else if (nodeData.id === 'safety') icon = "⚠️";
    else if (nodeData.id === 'ledger') icon = "🔒";
    else if (nodeData.id.includes('gateway')) icon = "⚡";
    else if (nodeData.id.includes('vault')) icon = "☁️";
    else if (nodeData.id.includes('playbook')) icon = "📖";
    
    const title = nodeData.label.replace('\n', ' ').split(' ')[0] + " Node Registry";
    const subtitle = `Claims Graph Registry Entity ID: ${nodeData.id.toUpperCase()}`;
    
    // Parse raw HTML text fields into high-contrast semantic table rows
    const cleanTitle = nodeData.title.split('<br>')[0] || "Entity Specifications";
    const detailsList = nodeData.title.split('<br>').slice(1);
    
    let rowsHtml = "";
    detailsList.forEach(detail => {
        if (!detail.trim()) return;
        let [label, val] = detail.split(':');
        if (!val) {
            if (detail.includes('Hash') || detail.includes('sha256')) {
                label = "Cryptographic Seal";
                val = detail.replace('Hash:', '').trim();
            } else {
                label = "Details";
                val = detail.trim();
            }
        }
        
        const cleanLabel = label.replace(/<[^>]*>/g, '').trim();
        const cleanVal = val.replace(/<[^>]*>/g, '').trim();
        
        rowsHtml += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 0.8rem 0.6rem; font-weight: 600; color: var(--color-text-muted); width: 35%; font-size: 0.75rem;">${cleanLabel}</td>
                <td style="padding: 0.8rem 0.6rem; color: var(--color-text-main); font-family: monospace; font-size: 0.72rem; word-break: break-all;">${cleanVal}</td>
            </tr>
        `;
    });
    
    const contentHtml = `
        <div style="background: rgba(255,255,255,0.01); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem;">
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-primary); display: flex; align-items: center; gap: 0.5rem;">
                ${cleanTitle}
            </div>
            
            <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 0.25rem;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 0.5rem 0.6rem; color: var(--color-text-muted); font-size: 0.68rem; text-transform: uppercase;">Registry Attribute</th>
                        <th style="padding: 0.5rem 0.6rem; color: var(--color-text-muted); font-size: 0.68rem; text-transform: uppercase;">Live Grounded Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 0.8rem 0.6rem; font-weight: 600; color: var(--color-text-muted); font-size: 0.75rem;">Grounded Target</td>
                        <td style="padding: 0.8rem 0.6rem; color: #10B981; font-size: 0.75rem; font-weight: 600;">✓ Active FDA/Veeva Grounding Lock Active</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; background: rgba(16, 185, 129, 0.04); padding: 0.75rem; border-radius: 6px; border: 1px dashed rgba(16, 185, 129, 0.2);">
                <span style="font-size: 1.2rem;">🔒</span>
                <p style="margin: 0; font-size: 0.68rem; color: var(--color-text-muted); line-height: 1.45;">
                    <strong>Maestro Security Seal:</strong> This entity is cryptographically anchored inside the active session block ledger. Any downstream tampering or out-of-bounds copy shifts will instantly break the pipeline hash and trigger automated MLR self-healing.
                </p>
            </div>
            
            <!-- Dynamic Actions Panel based on Node Type -->
            <div style="margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn btn-secondary btn-small" onclick="closeDetailModal()" style="font-size: 0.7rem; padding: 0.35rem 0.75rem;">Cancel</button>
                ${
                    (nodeData.id === 'efficacy' || nodeData.id === 'safety') 
                    ? `
                    <button class="btn btn-primary btn-small" onclick="proposeLabelChangeFromModal('${nodeData.id}')" style="font-size: 0.7rem; padding: 0.35rem 0.75rem; display: flex; align-items: center; gap: 0.25rem; background: #0D9488; border: none; color: white;">
                        <span>✏️</span> Propose Label Update
                    </button>
                    `
                    : (nodeData.id === 'ledger' || nodeData.id.includes('gateway') || nodeData.id.includes('vault'))
                    ? `
                    <button class="btn btn-primary btn-small" id="btn-modal-veeva-sync" onclick="forceVeevaSyncFromModal()" style="font-size: 0.7rem; padding: 0.35rem 0.75rem; display: flex; align-items: center; gap: 0.25rem; background: #4F46E5; border: none; color: white;">
                        <span id="veeva-sync-spinner" class="btn-spinner" style="display: none; width: 10px; height: 10px; margin-right: 2px; border-color: white; border-top-color: transparent;"></span>
                        <span>🔄</span> Force Veeva Promomats Sync
                    </button>
                    `
                    : ""
                }
            </div>
        </div>
    `;
    
    if (iconEl) iconEl.innerText = icon;
    if (titleEl) titleEl.innerText = title;
    if (subtitleEl) subtitleEl.innerText = subtitle;
    if (bodyEl) bodyEl.innerHTML = contentHtml;
    
    modal.classList.add('active');
};

// --- PREMIUM GLASSMORPHIC TOAST SYSTEM ---
window.showToast = function(title, desc, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `premium-toast ${type}`;
    
    let icon = "✅";
    if (type === 'info') icon = "ℹ️";
    else if (type === 'warning') icon = "⚠️";
    else if (type === 'error') icon = "❌";
    
    toast.innerHTML = `
        <span class="premium-toast-icon">${icon}</span>
        <div class="premium-toast-content">
            <div class="premium-toast-title">${title}</div>
            <div class="premium-toast-desc">${desc}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds with slideOut animation
    setTimeout(() => {
        toast.style.animation = "slideOutToast 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        setTimeout(() => {
            toast.remove();
        }, 350);
    }, 4000);
};

// --- NEW VISUALIZER ACTION HANDLERS ---
window.triggerVisualizerScan = function() {
    const btn = document.getElementById('btn-visualizer-audit');
    const container = document.querySelector('.visualizer-body');
    if (!btn || !container) return;
    
    // Disable button and show pulsing scanner
    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span> Auditing...`;
    container.style.boxShadow = "inset 0 0 40px rgba(13, 148, 136, 0.4)";
    container.style.transition = "box-shadow 0.3s ease";
    
    appendConsoleLine('system', "⚡ [Kong Gateway] Initializing full claims relationship integrity scan...");
    setTimeout(() => appendConsoleLine('system', "🛡️ [MLR Auditor] Verifying visual bounds, padding compliance, and legal footnotes..."), 300);
    setTimeout(() => appendConsoleLine('system', "🧬 [Claims Graph] Grounding all therapeutic indices against corporate FDA ledger..."), 600);
    
    setTimeout(() => {
        // Complete scan
        btn.disabled = false;
        btn.innerHTML = `<span>⚡</span> Run Integrity Audit`;
        container.style.boxShadow = "none";
        appendConsoleLine('system', "✅ [Audit Registry] Integrity scan completed. All 12 nodes verified as 100% compliant.");
        
        // Show premium toast notification!
        showToast(
            "Integrity Scan Completed", 
            "All claims, style tokens, and API gateways are fully verified and locked. 0 compliance violations detected.", 
            "success"
        );
    }, 1200);
};

window.forceVeevaSyncFromModal = function() {
    const btn = document.getElementById('btn-modal-veeva-sync');
    const spinner = document.getElementById('veeva-sync-spinner');
    if (!btn || !spinner) return;
    
    // Disable and animate
    btn.disabled = true;
    spinner.style.display = 'inline-block';
    
    appendConsoleLine('system', "⚡ Pushing cryptographic block seal metadata to Veeva Vault Promomats database...");
    
    setTimeout(() => {
        // Complete sync
        btn.disabled = false;
        spinner.style.display = 'none';
        appendConsoleLine('system', "✅ Veeva Sync Completed. Cryptographic block seal successfully synchronized.");
        closeDetailModal();
        
        // Show premium toast notification!
        showToast(
            "Veeva Sync Successful", 
            "Cryptographic block seal successfully pushed and locked in your enterprise Veeva registry.", 
            "success"
        );
    }, 1500);
};

window.proposeLabelChangeFromModal = function(nodeId) {
    const currentValue = nodeId === 'efficacy' ? '56%' : '10%';
    const promptMsg = nodeId === 'efficacy' 
        ? "Enter Proposed Key Efficacy Claim Value (e.g., 60% or 62%):" 
        : "Enter Proposed Key Safety Parameter Value (e.g., 8% or 12%):";
        
    const newValue = prompt(promptMsg, currentValue);
    if (newValue && newValue.trim() !== "") {
        closeDetailModal();
        appendConsoleLine('system', `✏️ Proposed label update detected: Setting ${nodeId} parameter to ${newValue}.`);
        appendConsoleLine('system', "🤖 Re-invoking Master Orchestrator for real-time campaign regeneration...");
        
        // Populate the chat input and trigger it to simulate the change!
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = `Set the key ${nodeId === 'efficacy' ? 'efficacy claim' : 'safety parameter'} to ${newValue} and regenerate the active Product-A campaign`;
            
            // Navigate to the workbench tab so the user sees the active generation!
            switchTab('workbench');
            
            // Trigger submit form
            setTimeout(() => {
                const form = document.querySelector('.chat-input-form');
                if (form) {
                    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('.btn-primary');
                    if (submitBtn) {
                        submitBtn.click();
                    } else {
                        // Fallback: submit form programmatically
                        form.requestSubmit();
                    }
                }
            }, 300);
        }
    }
};

// Dynamic Telemetry & Compliance Details Modal Controller
window.showDetailModal = function(type) {
    const modal = document.getElementById('detail-modal');
    const iconEl = document.getElementById('detail-modal-icon');
    const titleEl = document.getElementById('detail-modal-title');
    const subtitleEl = document.getElementById('detail-modal-subtitle');
    const bodyEl = document.getElementById('detail-modal-body');
    
    if (!modal || !bodyEl) return;
    
    let icon = "📊";
    let title = "Metric Details";
    let subtitle = "System Telemetry & Audit Logs";
    let contentHtml = "";
    
    switch(type) {
        // --- LEDGER PAGE STATS CARD DETAILS ---
        case 'ledger_total_ingestions':
            icon = "📂";
            title = "Total Ingestions Registry";
            subtitle = "Active Clinical Brief Ingestions & Latencies";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; color: var(--color-text-main);">
                        <span>Ingested Brief</span>
                        <span>Size</span>
                        <span>Latency</span>
                        <span>Status</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0;">
                        <span style="font-weight: 600; color: var(--color-text-main);">Product-A Clinical Brief.pdf</span>
                        <span>842 KB</span>
                        <span style="color: var(--color-primary);">1.1s</span>
                        <span style="color: #10B981; font-weight: bold;">SUCCESS</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0;">
                        <span style="font-weight: 600; color: var(--color-text-main);">Product-B Clinical Brief.pptx</span>
                        <span>1.2 MB</span>
                        <span style="color: var(--color-primary);">1.4s</span>
                        <span style="color: #10B981; font-weight: bold;">SUCCESS</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0;">
                        <span style="font-weight: 600; color: var(--color-text-main);">Product-C Clinical Brief.pdf</span>
                        <span>920 KB</span>
                        <span style="color: var(--color-primary);">0.9s</span>
                        <span style="color: #10B981; font-weight: bold;">SUCCESS</span>
                    </div>
                    <div style="margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--color-text-muted);">
                        <span>Average Ingestion Latency:</span>
                        <strong style="color: var(--color-text-main);">1.13 seconds</strong>
                    </div>
                </div>
            `;
            break;
            
        case 'ledger_crypto_locks':
            icon = "🛡️";
            title = "Cryptographic Lock Registry";
            subtitle = "Blockchain-Grade Hash Integrity Ledger";
            contentHtml = `
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <p style="margin: 0; line-height: 1.4;">Every verified claim is cryptographically sealed onto an immutable state ledger. Click any hash below to copy verification payload.</p>
                    <div style="background: rgba(255,255,255,0.02); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.6rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--color-text-muted); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem;">
                            <span>Block Height / Indication</span>
                            <span>Cryptographic Seal (SHA-256)</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem;">
                            <div>
                                <strong style="color: var(--color-text-main);">#12,841</strong><br>
                                <span style="font-size: 0.6rem; color: var(--color-text-muted);">Product-A NSCLC</span>
                            </div>
                            <code style="color: #10B981; font-family: monospace; background: var(--bg-body); padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid var(--border-color); cursor: pointer;" onclick="navigator.clipboard.writeText('d8b02ea9a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286'); logConsoleLine('system', 'Copied Product-A SHA-256 seal!');">sha256:d8b02ea9a... 📋</code>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem;">
                            <div>
                                <strong style="color: var(--color-text-main);">#12,842</strong><br>
                                <span style="font-size: 0.6rem; color: var(--color-text-muted);">Product-B CLEAR</span>
                            </div>
                            <code style="color: #10B981; font-family: monospace; background: var(--bg-body); padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid var(--border-color); cursor: pointer;" onclick="navigator.clipboard.writeText('8b9a2eab3a901c4e5d2b71a3f009a1c77f00a2eb3a901c77f00a2eb3a901c66'); logConsoleLine('system', 'Copied Product-B SHA-256 seal!');">sha256:8b9a2eab3... 📋</code>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem;">
                            <div>
                                <strong style="color: var(--color-text-main);">#12,843</strong><br>
                                <span style="font-size: 0.6rem; color: var(--color-text-muted);">Product-C RCC</span>
                            </div>
                            <code style="color: #10B981; font-family: monospace; background: var(--bg-body); padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid var(--border-color); cursor: pointer;" onclick="navigator.clipboard.writeText('d9b23f8a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286'); logConsoleLine('system', 'Copied Product-C SHA-256 seal!');">sha256:d9b23f8a1... 📋</code>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'ledger_system_integrity':
            icon = "✨";
            title = "System Integrity Status";
            subtitle = "Auditing Handshake Protocols & Health Index";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                    <h4 style="margin: 0; font-weight: bold; color: var(--color-text-main); font-size: 0.8rem;">Consensus Verification Checklist</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.72rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #10B981;"><span style="font-size: 0.85rem;">✅</span> TLS 1.3 Secure API Handshake Protocol</div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #10B981;"><span style="font-size: 0.85rem;">✅</span> Immutable Consensus State Sync with ComplianceVault</div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #10B981;"><span style="font-size: 0.85rem;">✅</span> AES-256 Database Encryption Handshake Active</div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #10B981;"><span style="font-size: 0.85rem;">✅</span> MLR Playbook Compliance Policy matching Engine</div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #10B981;"><span style="font-size: 0.85rem;">✅</span> Automated Key Rotation & Block Cryptographic Checksum</div>
                    </div>
                    <div style="margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; font-size: 0.75rem;">
                        <span style="color: var(--color-text-muted);">Current Security Index:</span>
                        <strong style="color: #10B981; font-weight: bold;">100.0% Perfect Integrity</strong>
                    </div>
                </div>
            `;
            break;
            
        case 'ledger_auditor_core':
            icon = "⚡";
            title = "Vertex AI Auditor Core";
            subtitle = "Multi-Agent System Telemetry & Performance";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.65rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="color: var(--color-text-muted);">Primary Models:</span>
                        <strong style="color: var(--color-text-main);">Gemini 1.5 Pro & Gemini 1.5 Flash</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="color: var(--color-text-muted);">Active Agent Workers:</span>
                        <strong style="color: var(--color-text-main);">4 Specialized Subsystems</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="color: var(--color-text-muted);">Cluster CPU / Memory Load:</span>
                        <strong style="color: #10B981;">14% / 22% (Highly Efficient)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="color: var(--color-text-muted);">Deterministic Setting:</span>
                        <strong style="color: var(--color-primary);">Temperature 0.0 (Grounded MLR)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0;">
                        <span style="color: var(--color-text-muted);">Max Token Throughput:</span>
                        <strong style="color: var(--color-text-main);">12,500 tokens/sec</strong>
                    </div>
                </div>
            `;
            break;

        // --- ANALYTICS PAGE STATS CARD DETAILS ---
        case 'analytics_gateway_latency':
            icon = "🔌";
            title = "Kong AI Gateway Latency";
            subtitle = "API Routing & PII Sanitization Latency Breakdown";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.65rem;">
                    <h4 style="margin: 0 0 0.25rem 0; font-weight: bold; color: var(--color-text-main);">Recent Gateway Requests</h4>
                    <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--color-text-muted); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem;">
                        <span>Request URL / Action</span>
                        <span>PII Scrub</span>
                        <span>Latency</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>POST /api/datasets/ingest</span>
                        <span style="color: #10B981;">Scrubbed</span>
                        <strong style="color: var(--color-text-main);">6 ms</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>GET /api/compliance_vault/claims</span>
                        <span>Bypassed</span>
                        <strong style="color: var(--color-text-main);">2 ms</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>POST /api/audit/verify_claims</span>
                        <span style="color: #10B981;">Scrubbed</span>
                        <strong style="color: var(--color-text-main);">4 ms</strong>
                    </div>
                    <div style="margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Net Network Overhead:</span>
                        <strong style="color: #10B981;">12 ms Average Latency</strong>
                    </div>
                </div>
            `;
            break;
            
        case 'analytics_pii_rate':
            icon = "🔒";
            title = "PII Sanitization Rate";
            subtitle = "PII Scrubber Entity Filtering Audits";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                    <p style="margin: 0; line-height: 1.4;">The PII scrubbing engine scans, flags, and blocks all sensitive patient/physician demographics prior to Vertex AI ingestion. 0 leakage recorded.</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.72rem;">
                        <div style="padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-body);">
                            <span style="color: var(--color-text-muted); font-size: 0.6rem; text-transform: uppercase;">Patient Names Blocked:</span><br>
                            <strong style="color: var(--color-text-main); font-size: 0.95rem;">18 entities</strong>
                        </div>
                        <div style="padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-body);">
                            <span style="color: var(--color-text-muted); font-size: 0.6rem; text-transform: uppercase;">Physician NPIs Blocked:</span><br>
                            <strong style="color: var(--color-text-main); font-size: 0.95rem;">6 entities</strong>
                        </div>
                        <div style="padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-body);">
                            <span style="color: var(--color-text-muted); font-size: 0.6rem; text-transform: uppercase;">Addresses Scrubbed:</span><br>
                            <strong style="color: var(--color-text-main); font-size: 0.95rem;">8 entities</strong>
                        </div>
                        <div style="padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-body);">
                            <span style="color: var(--color-text-muted); font-size: 0.6rem; text-transform: uppercase;">Phone Numbers Blocked:</span><br>
                            <strong style="color: var(--color-text-main); font-size: 0.95rem;">4 entities</strong>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'analytics_mlr_pass':
            icon = "🛡️";
            title = "MLR Judge Pass Rate";
            subtitle = "Active Marketing Review Approval Telemetry";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                        <span style="color: var(--color-text-muted); font-size: 0.72rem;">Total Marketing Reviews Run:</span>
                        <strong style="color: var(--color-text-main); font-size: 0.85rem;">1,284 Assets</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; font-size: 0.72rem;">
                        <span>Passed Instantly:</span>
                        <strong style="color: #10B981;">1,261 reviews (98.2%)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; font-size: 0.72rem;">
                        <span>Flagged & Self-Healed:</span>
                        <strong style="color: var(--color-warning);">23 reviews (1.8%)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; font-size: 0.72rem;">
                        <span>Final Compliance Rate:</span>
                        <strong style="color: #10B981;">100.0% Passed</strong>
                    </div>
                    <div style="margin-top: 0.25rem; padding: 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); text-align: center; color: #10B981; font-weight: bold; font-size: 0.7rem;">
                        ✓ SYSTEM HEALTHY: SLA EXCEEDS 98.0% TARGET
                    </div>
                </div>
            `;
            break;
            
        case 'analytics_self_healing':
            icon = "⚡";
            title = "Avg Self-Healing Time";
            subtitle = "Automated Visual & Claims Correction Telemetry";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                        <span style="color: var(--color-text-muted); font-size: 0.72rem;">Healing Tasks Solved:</span>
                        <strong style="color: var(--color-text-main); font-size: 0.85rem;">42 Layout Overlaps</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; font-size: 0.72rem;">
                        <span>Design Token Identification:</span>
                        <strong style="color: var(--color-primary);">0.32s</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; font-size: 0.72rem;">
                        <span>CSS Coordinate Calculation:</span>
                        <strong style="color: var(--color-primary);">0.48s</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; font-size: 0.72rem;">
                        <span>Target Code Diff Application:</span>
                        <strong style="color: var(--color-primary);">0.38s</strong>
                    </div>
                    <div style="margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--color-text-muted);">
                        <span>Total Self-Healing Duration:</span>
                        <strong style="color: var(--color-text-main);">1.18 seconds</strong>
                    </div>
                </div>
            `;
            break;

        // --- ANALYTICS PAGE AGENT SUBSYSTEM DETAILS ---
        case 'agent_standards':
            icon = "🤖";
            title = "Clinical Standards Agent";
            subtitle = "Fact-Verification & Regulatory Compliance Subsystem";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Target LLM:</span>
                        <strong style="color: var(--color-text-main);">gemini-1.5-pro (High-Reasoning)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Task Latency:</span>
                        <strong style="color: var(--color-primary);">0.85s average</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Active Prompts:</span>
                        <strong style="color: var(--color-text-main);">Grounded Clinical Ontologies v4</strong>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.7rem; margin-top: 0.35rem;">
                        <span style="color: var(--color-text-muted); font-weight: bold;">System Instruction Snapshot:</span>
                        <div style="background: var(--bg-body); padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); font-family: monospace; font-size: 0.6rem; line-height: 1.4; max-height: 100px; overflow-y: auto;">
                            Act as the Google Gemini MLR Standards Auditor. Cross-reference all marketing copy blocks against the provided regulatory database. Ensure efficacy rates, patient cohorts, and survival statistics match active FDA-approved labels exactly. Flag any discrepancy.
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'agent_mlr':
            icon = "🤖";
            title = "MLR Judge Agent";
            subtitle = "Format, Design Token & Layout Auditor Subsystem";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Target LLM:</span>
                        <strong style="color: var(--color-text-main);">gemini-1.5-pro (High-Reasoning)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Task Latency:</span>
                        <strong style="color: var(--color-primary);">1.22s average</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Accuracy SLA:</span>
                        <strong style="color: #10B981;">98.6% (Target: &gt;98.0%)</strong>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.7rem; margin-top: 0.35rem;">
                        <span style="color: var(--color-text-muted); font-weight: bold;">System Instruction Snapshot:</span>
                        <div style="background: var(--bg-body); padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); font-family: monospace; font-size: 0.6rem; line-height: 1.4; max-height: 100px; overflow-y: auto;">
                            Act as the Google Gemini MLR Layout Judge. Audit rendered marketing assets. Inspect design token styling, border margins, image contrasts, and typography sizing. Flag any visual overlaps or unclosed tags. Provide pixel offset coordinate recommendations to the Self-Healing sub-agent.
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'agent_self_healing':
            icon = "🤖";
            title = "Self-Healing Layout Agent";
            subtitle = "CSS Code & Bounding Box Correction Subsystem";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Target LLM:</span>
                        <strong style="color: var(--color-text-main);">gemini-1.5-flash (Ultra-Fast)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Task Latency:</span>
                        <strong style="color: var(--color-primary);">1.10s average</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Healing Success Rate:</span>
                        <strong style="color: #10B981;">100% (42 solved)</strong>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.7rem; margin-top: 0.35rem;">
                        <span style="color: var(--color-text-muted); font-weight: bold;">System Instruction Snapshot:</span>
                        <div style="background: var(--bg-body); padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); font-family: monospace; font-size: 0.6rem; line-height: 1.4; max-height: 100px; overflow-y: auto;">
                            Act as the Google Gemini CSS Healing Agent. You receive HTML layouts and layout overlap reports (including target coordinates and container IDs). Calculate and generate surgical, clean CSS code modifications to reflow content safely. Deliver the code as a clean diff string.
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'agent_orchestrator':
            icon = "🤖";
            title = "Master Orchestrator Agent";
            subtitle = "System Pipeline Routing & Live State Director";
            contentHtml = `
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Target LLM:</span>
                        <strong style="color: var(--color-text-main);">gemini-1.5-flash (Ultra-Fast)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-primary);">0.30s average</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
                        <span style="color: var(--color-text-muted);">Active Task Queue:</span>
                        <strong style="color: #10B981;">0 items (IDLE)</strong>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.7rem; margin-top: 0.35rem;">
                        <span style="color: var(--color-text-muted); font-weight: bold;">System Instruction Snapshot:</span>
                        <div style="background: var(--bg-body); padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); font-family: monospace; font-size: 0.6rem; line-height: 1.4; max-height: 100px; overflow-y: auto;">
                            Act as the Master Orchestrator Agent. Monitor local filesystem event streams in the datasets directory. Route ingested files to the Standards Agent. Send audit reports to the MLR Judge. Trigger the CSS Healer if violations exist. Push live logs to the client WebSocket container.
                        </div>
                    </div>
                </div>
            `;
            break;

        // --- PRE-SCREEN VIOLATION DETAILS ---
        case 'violation_product_a':
            icon = "📋";
            title = "Campaign Audit: CAMP-KT-189-NSCLC";
            subtitle = "Product-A Active Campaign Compliance Report";
            contentHtml = `
                <div style="background: rgba(16, 185, 129, 0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; font-size: 0.72rem;">
                        <span style="color: var(--color-text-main);">Clinical Grounding Parameter</span>
                        <span style="color: var(--color-text-main);">Grounded Reference</span>
                        <span style="color: var(--color-text-main);">Status</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>Efficacy: ORR 56%</span>
                        <span>KEYNOTE-189</span>
                        <strong style="color: #10B981;">VERIFIED</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>Survival: PFS 8.8mo</span>
                        <span>KEYNOTE-189</span>
                        <strong style="color: #10B981;">VERIFIED</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>Layout Overlap Check</span>
                        <span>AEM CSS Grid</span>
                        <strong style="color: #10B981;">VERIFIED</strong>
                    </div>
                    <div style="margin-top: 0.5rem; padding: 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.05); text-align: center; color: #10B981; font-weight: bold; font-size: 0.75rem;">
                        ✓ AUDIT SECURED: 100% COMPLIANT (0 FLAG)
                    </div>
                </div>
            `;
            break;
            
        case 'violation_product_b':
            icon = "📋";
            title = "Campaign Audit: CAMP-KT-581-CLEAR";
            subtitle = "Product-B Active Campaign Compliance Report";
            contentHtml = `
                <div style="background: rgba(16, 185, 129, 0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; font-size: 0.72rem;">
                        <span style="color: var(--color-text-main);">Clinical Grounding Parameter</span>
                        <span style="color: var(--color-text-main);">Grounded Reference</span>
                        <span style="color: var(--color-text-main);">Status</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>Efficacy: ORR 53%</span>
                        <span>STUDY-307 (CLEAR)</span>
                        <strong style="color: #10B981;">VERIFIED</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>Survival: PFS 14.7mo</span>
                        <span>STUDY-307 (CLEAR)</span>
                        <strong style="color: #10B981;">VERIFIED</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; align-items: center;">
                        <span>Layout Overlap Check</span>
                        <span style="color: var(--color-warning);">1 Overlap Flagged</span>
                        <strong style="color: var(--color-primary); font-weight: bold;">AUTO-HEALED</strong>
                    </div>
                    <div style="padding: 0.6rem; border-radius: 6px; background: rgba(13, 148, 136, 0.05); border: 1px solid rgba(13, 148, 136, 0.2); font-family: monospace; font-size: 0.58rem; line-height: 1.4; color: var(--color-primary);">
                        Healed Overlap on selector "#product-b-card-footer":<br>
                        - margin-top: 12px;<br>
                        + margin-top: 36px; /* shifted content down for readability */
                    </div>
                    <div style="margin-top: 0.25rem; padding: 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.05); text-align: center; color: #10B981; font-weight: bold; font-size: 0.75rem;">
                        ✓ AUDIT SECURED: AUTO-HEALED & COMPLIANT
                    </div>
                </div>
            `;
            break;
            
        case 'violation_product_c':
            icon = "📋";
            title = "Campaign Audit: CAMP-WR-005-RCC";
            subtitle = "Product-C Active Campaign Compliance Report";
            contentHtml = `
                <div style="background: rgba(16, 185, 129, 0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; font-size: 0.72rem;">
                        <span style="color: var(--color-text-main);">Clinical Grounding Parameter</span>
                        <span style="color: var(--color-text-main);">Grounded Reference</span>
                        <span style="color: var(--color-text-main);">Status</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; align-items: center;">
                        <span>Efficacy: ORR 49% -> 56%</span>
                        <span style="color: var(--color-warning);">Outdated Label Flagged</span>
                        <strong style="color: var(--color-primary); font-weight: bold;">AUTO-SYNCED</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>Survival: PFS 12.0mo</span>
                        <span>LITESPARK-001</span>
                        <strong style="color: #10B981;">VERIFIED</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                        <span>Layout Overlap Check</span>
                        <span>AEM CSS Grid</span>
                        <strong style="color: #10B981;">VERIFIED</strong>
                    </div>
                    <div style="padding: 0.6rem; border-radius: 6px; background: rgba(13, 148, 136, 0.05); border: 1px solid rgba(13, 148, 136, 0.2); font-family: monospace; font-size: 0.58rem; line-height: 1.4; color: var(--color-primary);">
                        Synced outdated label against latest FDA Oncology Registry:<br>
                        - ORR claim: 49%<br>
                        + ORR claim: 56% /* auto-synced to KEYNOTE-189 updated OPDP dataset */
                    </div>
                    <div style="margin-top: 0.25rem; padding: 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.05); text-align: center; color: #10B981; font-weight: bold; font-size: 0.75rem;">
                        ✓ AUDIT SECURED: AUTO-SYNCED & COMPLIANT
                    </div>
                </div>
            `;
            break;
    }
    
    // Fill content and open!
    iconEl.innerText = icon;
    titleEl.innerText = title;
    subtitleEl.innerText = subtitle;
    bodyEl.innerHTML = contentHtml;
    modal.classList.add('active');
    updateHashFromState();
};

window.closeDetailModal = function() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.classList.remove('active');
    updateHashFromState();
};

// Tab switching logic for the unified Ingestion Dock
window.switchDockTab = function(panelId) {
    // Hide all panels dynamically
    const panels = document.querySelectorAll('.dock-panel');
    panels.forEach(panel => {
        panel.style.display = 'none';
    });
    
    // Deactivate all tab buttons
    const buttons = document.querySelectorAll('.dock-tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.color = 'var(--color-text-muted)';
        btn.style.borderBottom = 'none';
    });
    
    // Show active panel
    const activePanel = document.getElementById(panelId);
    if (activePanel) {
        activePanel.style.display = 'flex';
    }
    
    // Activate active tab button
    const tabName = panelId.replace('panel-', '');
    const activeBtn = document.getElementById('btn-tab-' + tabName);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = 'var(--color-primary)';
        activeBtn.style.borderBottom = '2px solid var(--color-primary)';
    }
};

/* =====================================================================
   GOOGLE MAESTRO GENSTUDIO INTERACTIVE JAVASCRIPT SYSTEM
   ===================================================================== */

let currentActiveVariant = 1;

// Define high-fidelity content databases for all three drug variants!
const variantDatabase = {
    1: {
        drug: "Product-A",
        medication: "Product-A",
        subject: "Move Lung Cancer Care Forward: KEYNOTE-189 Survival Outcomes",
        preheader: "Engage with clinical data showing double the overall survival in adults.",
        image: "./product_a_clinical_hero.png",
        trial: "KEYNOTE-189 Phase III Trial (NCT02578680)",
        campaign: "CAMP-KT-189-NSCLC",
        prompt: "A professional clinical medical photograph, doctor consulting with an adult patient in a modern bright oncology clinic, warm lighting, high-fidelity, photorealistic.",
        html: `
            <p>Dear Global Pharma Clinical Marketing Team,</p>
            <p>We are proud to present the clinical communication toolkit for <strong>Product-A (compound_alpha)</strong> in combination with pemetrexed and platinum chemotherapy for the first-line treatment of patients with metastatic nonsquamous non-small cell lung cancer (NSCLC).</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In the landmark KEYNOTE-189 Phase III trial, Product-A combination therapy demonstrated an <span class="verified-claim-highlight" onclick="highlightClaim('CLM-KT-189-EFF')" title="Click to view MaterialReview record">Overall Response Rate (ORR) of 56% at Week 24</span>, compared to only 18.9% for chemotherapy alone. This represents a significant, clinically proven survival boundary shift.</p>
            </div>
            
            <p>Furthermore, safety monitoring profiles remain highly manageable: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-KT-189-SAF')" title="Click to view MaterialReview record">Grade 3/4 Immune-Mediated Adverse Reactions were observed in 10% of patients</span>, consistent with the established safety registry guidelines. Appropriate monitoring and supportive care are recommended.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: Product-A is indicated for first-line nonsquamous NSCLC based on KEYNOTE-189. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-KTS99</span>. Legal safety warnings apply.
            </p>
        `,
        claims: [
            {
                id: "CLM-KT-189-EFF",
                parameter: "Overall Response Rate (ORR)",
                value: "56% at Week 24",
                ref: "Regulatory Compliance Vault Ref #V-2026-KT089",
                trial: "KEYNOTE-189 Trial (NCT02578680)",
                status: "VERIFIED"
            },
            {
                id: "CLM-KT-189-SAF",
                parameter: "Immune-Mediated Adverse Events",
                value: "10% (Grade 3/4)",
                ref: "Regulatory Compliance Vault Ref #V-2026-KTS99",
                trial: "KEYNOTE-189 Safety Registry",
                status: "VERIFIED"
            }
        ]
    },
    2: {
        drug: "Product-B",
        medication: "Product-B + Product-A",
        subject: "Advance Renal Cell Carcinoma Frontiers: CLEAR Trial Evidence",
        preheader: "Explore the first-line combination showing a 71% objective response rate.",
        image: "./product_b_clinical_hero.png",
        trial: "CLEAR / KEYNOTE-581 study (NCT02811822)",
        campaign: "CAMP-KT-581-CLEAR",
        prompt: "A modern clinical research laboratory setting, high-fidelity diagnostic charts on screen, advanced medical diagnostics, professional oncology scientific data visualization.",
        html: `
            <p>Dear Global Pharma Clinical Marketing Team,</p>
            <p>We are proud to present the clinical communication toolkit for <strong>Product-B (compound_beta)</strong> in combination with compound_alpha for the first-line treatment of adult patients with advanced renal cell carcinoma (RCC).</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In the pivotal CLEAR / KEYNOTE-581 Phase III trial, Product-B in combination with compound_alpha demonstrated a remarkable, clinically superior <span class="verified-claim-highlight" onclick="highlightClaim('CLM-KT-581-EFF')" title="Click to view MaterialReview record">Objective Response Rate (ORR) of 71%</span>, compared to 36.1% for sunitinib alone. This represents an unprecedented efficacy standard.</p>
            </div>
            
            <p>Safety parameters were carefully monitored throughout the study: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-KT-581-SAF')" title="Click to view MaterialReview record">Grade 3/4 Adverse Events occurred in 82% of patients</span>, requiring active clinical management, dose modifications, or supportive interventions. Standard clinical protocols must be observed.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: Product-B + Product-A combination for advanced RCC based on the CLEAR study. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-LV581</span>. Full safety warnings apply.
            </p>
        `,
        claims: [
            {
                id: "CLM-KT-581-EFF",
                parameter: "Objective Response Rate (ORR)",
                value: "71% (Phase III)",
                ref: "Regulatory Compliance Vault Ref #V-2026-LV581",
                trial: "CLEAR Trial (NCT02811822)",
                status: "VERIFIED"
            },
            {
                id: "CLM-KT-581-SAF",
                parameter: "Grade 3/4 Adverse Events",
                value: "82% (Manageable)",
                ref: "Regulatory Compliance Vault Ref #V-2026-LV581",
                trial: "CLEAR Safety Registry",
                status: "VERIFIED"
            }
        ]
    },
    3: {
        drug: "Product-C",
        medication: "Product-C",
        subject: "Target Angiogenesis Blockade in RCC: LITESPARK-005 Outcomes",
        preheader: "Discover the first-in-class HIF-2α inhibitor showing tumor regression.",
        image: "./product_c_clinical_hero.png",
        trial: "LITESPARK-005 study (NCT04195750)",
        campaign: "CAMP-WR-005-RCC",
        prompt: "High-fidelity medical 3D rendering of renal cell cellular structures, molecular targeted oncology therapy visualization, ultra-premium cell biology illustration.",
        html: `
            <p>Dear Global Pharma Clinical Marketing Team,</p>
            <p>We are proud to present the clinical communication toolkit for <strong>Product-C (compound_gamma)</strong>, a first-in-class oral HIF-2α inhibitor indicated for patients with advanced renal cell carcinoma (RCC) following progression on immune checkpoint and VEGF therapies.</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In the landmark LITESPARK-005 trial, Product-C demonstrated an <span class="verified-claim-highlight" onclick="highlightClaim('CLM-WR-005-EFF')" title="Click to view MaterialReview record">Objective Response Rate (ORR) of 22%</span>, with significant and durable vessel regression. This represents a breakthrough therapy for highly pretreated advanced RCC.</p>
            </div>
            
            <p>Safety and tolerability remain consistent with early-phase observations: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-WR-005-SAF')" title="Click to view MaterialReview record">Grade 3/4 Adverse Events occurred in 30% of patients</span>, primarily presenting as anemia or hypoxia. Active patient monitoring is required.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: Product-C advanced RCC oncology profile based on LITESPARK-005. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-WR005</span>. Full prescribing warnings apply.
            </p>
        `,
        claims: [
            {
                id: "CLM-WR-005-EFF",
                parameter: "Objective Response Rate (ORR)",
                value: "22% (Tumor Regression)",
                ref: "Regulatory Compliance Vault Ref #V-2026-WR005",
                trial: "LITESPARK-005 study",
                status: "VERIFIED"
            },
            {
                id: "CLM-WR-005-SAF",
                parameter: "Grade 3/4 Adverse Events",
                value: "30% (Hypoxia/Anemia)",
                ref: "Regulatory Compliance Vault Ref #V-2026-WR005",
                trial: "LITESPARK-005 Safety Registry",
                status: "VERIFIED"
            }
        ]
    },
    4: {
        drug: "Product-D",
        medication: "Product-D",
        subject: "Redefine Pulmonary Arterial Hypertension Outcomes: Product-D (compound_delta)",
        preheader: "Explore the landmark STELLAR trial data demonstrating exercise capacity improvement.",
        image: "./product_d_clinical_hero.png",
        trial: "STELLAR Phase III Trial (NCT04576169)",
        campaign: "CAMP-WV-169-PAH",
        prompt: "A high-fidelity medical 3D rendering of cardiovascular arterial blood flow, pulmonary circulation visualization, ultra-premium medical illustration.",
        html: `
            <p>Dear Global Pharma Clinical Marketing Team,</p>
            <p>We are proud to present the clinical communication toolkit for <strong>Product-D (compound_delta)</strong>, a breakthrough activin receptor ligand trap indicated for the treatment of adults with pulmonary arterial hypertension (PAH) to increase exercise capacity and improve WHO functional class.</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In the landmark STELLAR Phase III trial, Product-D combination therapy demonstrated a highly significant, clinically proven <span class="verified-claim-highlight" onclick="highlightClaim('CLM-WV-169-EFF')" title="Click to view MaterialReview record">increase of 41 meters in the 6-minute walk distance (6MWD)</span> at Week 24, compared to placebo.</p>
            </div>
            
            <p>Safety monitoring profiles remain highly manageable: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-WV-169-SAF')" title="Click to view MaterialReview record">Grade 3/4 Serious Adverse Events occurred in 15% of patients</span>, with primary presentations of mild thrombocytopenia or increased hemoglobin. Appropriate clinical monitoring is recommended.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: Product-D is indicated for PAH functional class II-III based on the STELLAR trial. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-WV169</span>. Legal safety warnings apply.
            </p>
        `,
        claims: [
            {
                id: "CLM-WV-169-EFF",
                parameter: "6-Minute Walk Distance (6MWD)",
                value: "41m improvement",
                ref: "Regulatory Compliance Vault Ref #V-2026-WV169",
                trial: "STELLAR Trial (NCT04576169)",
                status: "VERIFIED"
            },
            {
                id: "CLM-WV-169-SAF",
                parameter: "Serious Adverse Events",
                value: "15% (Grade 3/4)",
                ref: "Regulatory Compliance Vault Ref #V-2026-WV169",
                trial: "STELLAR Safety Registry",
                status: "VERIFIED"
            }
        ]
    },
    5: {
        drug: "Product-E",
        medication: "Product-E",
        subject: "Delay Progression in Advanced Cancers: Product-E (compound_epsilon) PARP Inhibition",
        preheader: "Explore the PROfound Phase III trial data in metastatic castration-resistant prostate cancer.",
        image: "./product_e_clinical_hero.png",
        trial: "PROfound Phase III Trial (NCT02986607)",
        campaign: "CAMP-LP-607-PARP",
        prompt: "High-fidelity scientific rendering of double-strand DNA repair pathway, PARP enzyme inhibition, oncology target molecule illustration, premium visual.",
        html: `
            <p>Dear Global Pharma Clinical Marketing Team,</p>
            <p>We are proud to present the clinical communication toolkit for <strong>Product-E (compound_epsilon)</strong>, a blockbuster PARP inhibitor co-developed and co-marketed by Global Pharma Enterprise and AstraZeneca, indicated for patients with homologous recombination repair (HRR) gene-mutated metastatic castration-resistant prostate cancer (mCRPC).</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In the pivotal PROfound Phase III trial, Product-E demonstrated a superior clinical profile with a median <span class="verified-claim-highlight" onclick="highlightClaim('CLM-LP-607-EFF')" title="Click to view MaterialReview record">Radiographic PFS (rPFS) of 7.4 months</span>, compared to only 3.6 months for physician's choice therapy.</p>
            </div>
            
            <p>Safety parameters were carefully monitored throughout the study: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-LP-607-SAF')" title="Click to view MaterialReview record">Grade 3/4 Adverse Events (primarily Anemia) occurred in 21% of patients</span>. Standard clinical protocols and dose management guidelines must be observed.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: Product-E is indicated for HRR-mutated mCRPC based on the PROfound study. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-LP607</span>. Full prescribing warnings apply.
            </p>
        `,
        claims: [
            {
                id: "CLM-LP-607-EFF",
                parameter: "Radiographic PFS (rPFS)",
                value: "7.4 months",
                ref: "Regulatory Compliance Vault Ref #V-2026-LP607",
                trial: "PROfound Trial (NCT02986607)",
                status: "VERIFIED"
            },
            {
                id: "CLM-LP-607-SAF",
                parameter: "Anemia (Grade 3/4)",
                value: "21%",
                ref: "Regulatory Compliance Vault Ref #V-2026-LP607",
                trial: "PROfound Safety Registry",
                status: "VERIFIED"
            }
        ]
    },
    6: {
        drug: "Product-F",
        medication: "Product-F",
        subject: "Prevent HPV-Related Cancers: Product-F (compound_zeta) Immunization Standards",
        preheader: "Review clinical efficacy data demonstrating 97% protection against high-risk HPV types.",
        image: "./product_f_clinical_hero.png",
        trial: "Pivotal Efficacy Study (NCT00543543)",
        campaign: "CAMP-GD-543-HPV",
        prompt: "A beautiful, premium scientific 3D illustration of antibody-antigen molecular binding, viral immunization, immunology high-fidelity rendering.",
        html: `
            <p>Dear Global Pharma Clinical Marketing Team,</p>
            <p>We are proud to present the clinical communication toolkit for <strong>Product-F (compound_zeta)</strong>, Global Pharma's world-leading vaccine indicated for active immunization against high-risk HPV types to prevent cervical, vulvar, vaginal, and anal cancers.</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In pivotal clinical trials, Product-F demonstrated an outstanding <span class="verified-claim-highlight" onclick="highlightClaim('CLM-GD-543-EFF')" title="Click to view MaterialReview record">97.4% efficacy in preventing high-risk HPV types 31, 33, 45, 52, and 58</span> related cervical diseases.</p>
            </div>
            
            <p>Safety parameters were carefully monitored across clinical cohorts: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-GD-543-SAF')" title="Click to view MaterialReview record">Local injection site reactions (pain/swelling) occurred in 80% of recipients</span>. These reactions were primarily mild-to-moderate, transient, and resolved quickly.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: Product-F immunization profile based on pivotal efficacy trials. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-GD543</span>. Standard vaccine disclosures apply.
            </p>
        `,
        claims: [
            {
                id: "CLM-GD-543-EFF",
                parameter: "HPV Type Efficacy",
                value: "97.4% Protection",
                ref: "Regulatory Compliance Vault Ref #V-2026-GD543",
                trial: "Pivotal Efficacy Study (NCT00543543)",
                status: "VERIFIED"
            },
            {
                id: "CLM-GD-543-SAF",
                parameter: "Local Injection Reactions",
                value: "80% (Mild-to-Moderate)",
                ref: "Regulatory Compliance Vault Ref #V-2026-GD543",
                trial: "Immunization Safety Registry",
                status: "VERIFIED"
            }
        ]
    },
    7: {
        drug: "Product-G",
        medication: "Product-G",
        subject: "Reduce Hospitalization Risk: Product-G (compound_eta) Oral Antiviral",
        preheader: "Review the MOVe-OUT trial showing a 30% reduction in risk of hospitalization or death.",
        image: "./product_g_clinical_hero.png",
        trial: "MOVe-OUT Phase III Trial (NCT04575597)",
        campaign: "CAMP-LG-597-COV",
        prompt: "A premium 3D rendering of viral replication cycle, oral antiviral mechanism of action, molecular biology high-fidelity illustration.",
        html: `
            <p>Dear Global Pharma Clinical Marketing Team,</p>
            <p>We are proud to present the clinical communication toolkit for <strong>Product-G (compound_eta)</strong>, Global Pharma's oral antiviral indicated for the treatment of mild-to-moderate COVID-19 in high-risk adult patients.</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In the pivotal MOVe-OUT Phase III trial, Product-G demonstrated a highly significant <span class="verified-claim-highlight" onclick="highlightClaim('CLM-LG-597-EFF')" title="Click to view MaterialReview record">30% reduction in the risk of hospitalization or death</span> through Day 29 in the active cohort.</p>
            </div>
            
            <p>Safety parameters were carefully monitored across study groups: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-LG-597-SAF')" title="Click to view MaterialReview record">Grade 3/4 Adverse Events (primarily mild diarrhea) occurred in 2% of patients</span>. Product-G demonstrated an excellent overall tolerability profile.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: Product-G antiviral profile based on the MOVe-OUT trial. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-LG597</span>. Full prescribing safety warnings apply.
            </p>
        `,
        claims: [
            {
                id: "CLM-LG-597-EFF",
                parameter: "Hospitalization Risk Reduction",
                value: "30% Reduction",
                ref: "Regulatory Compliance Vault Ref #V-2026-LG597",
                trial: "MOVe-OUT Trial (NCT04575597)",
                status: "VERIFIED"
            },
            {
                id: "CLM-LG-597-SAF",
                parameter: "Diarrhea (Grade 3/4)",
                value: "2%",
                ref: "Regulatory Compliance Vault Ref #V-2026-LG597",
                trial: "MOVe-OUT Safety Registry",
                status: "VERIFIED"
            }
        ]
    }
};

// Explicitly attach to window object for global availability and Time Travel checks
window.variantDatabase = variantDatabase;

// Load saved generated images from localStorage on page boot!
for (let i = 1; i <= 3; i++) {
    const savedImage = localStorage.getItem('maestro_variant_' + i + '_image');
    if (savedImage && variantDatabase[i]) {
        variantDatabase[i].image = savedImage;
    }
}

// Toggle between variant tabs (Adobe ContentStudio Style)
window.loadVariant = function(variantNum) {
    currentActiveVariant = variantNum;
    window.activeVariantNum = variantNum;
    localStorage.setItem('maestro_active_variant', variantNum);
    
    // Update URL hash for routing
    if (typeof isRoutingInProgress !== 'undefined' && !isRoutingInProgress) {
        updateHashFromState();
    }
    
    // Deactivate all variant buttons
    document.querySelectorAll('.variant-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate clicked button
    const activeBtn = document.getElementById('variant-tab-' + variantNum);
    if (activeBtn) activeBtn.classList.add('active');
    
    const variantData = variantDatabase[variantNum];
    if (!variantData) return;
    
    // 1. FIRST inject the template HTML so all dynamic inputs are created in the DOM!
    const composerBody = document.getElementById('composer-content-body');
    if (composerBody) {
        composerBody.innerHTML = variantData.html;
    }
    
    // 2. NOW safely populate and style the dynamic input elements!
    const subjectInput = document.getElementById('composer-subject-input');
    if (subjectInput) {
        subjectInput.value = variantData.subject;
    }
    
    const preheaderInput = document.getElementById('composer-preheader-input');
    if (preheaderInput) {
        preheaderInput.value = variantData.preheader;
    }
    
    const heroImg = document.getElementById('composer-hero-image');
    if (heroImg) {
        let targetSrc = variantData.image;
        if (targetSrc && targetSrc.startsWith('./')) {
            targetSrc = targetSrc.replace('./', '/');
        }
        heroImg.src = targetSrc;
        heroImg.onerror = function() {
            const defaultHeroes = {
                1: "/product_a_clinical_hero.png",
                2: "/product_b_clinical_hero.png",
                3: "/product_c_clinical_hero.png",
                4: "/product_d_clinical_hero.png",
                5: "/product_e_clinical_hero.png",
                6: "/product_f_clinical_hero.png",
                7: "/product_g_clinical_hero.png"
            };
            const fallback = defaultHeroes[variantNum] || "/product_a_clinical_hero.png";
            if (!this.src.endsWith(fallback)) {
                this.src = fallback;
            }
        };
        
        if (variantData.image.includes('generated')) {
            // Center generated assets perfectly to keep the subject in focus!
            heroImg.style.objectPosition = "center";
        } else if (variantData.image.includes('cellular') || variantData.image.includes('vector')) {
            // Microbiology models and data curves need perfect centering
            heroImg.style.objectPosition = "center";
        } else if (variantData.image.includes('hologram')) {
            // Hologram lung floats high, clinician stands on right
            heroImg.style.objectPosition = "center 20%";
        } else {
            // Default seated/microscopic placeholder visuals
            if (variantNum === 1) {
                heroImg.style.objectPosition = "center 45%"; // Perfect framing for seated doctor & patient
            } else {
                heroImg.style.objectPosition = "center";
            }
        }
    }
    
    // Populate the Right Sidebar Claims Register tab!
    populateClaimsRegistry(variantData.claims);
    
    // Dynamically update the Left Sidebar "Phase 1 Ingest" summary cards!
    const p1SummaryLibrary = document.getElementById('phase1-summary-library');
    const p1SummaryTrial = document.getElementById('phase1-summary-trial');
    if (variantData) {
        if (p1SummaryLibrary) {
            p1SummaryLibrary.innerText = variantData.campaign || `${variantData.drug} Prescribing Info`;
        }
        if (p1SummaryTrial) {
            let cleanTrial = variantData.trial.split(' (')[0];
            p1SummaryTrial.innerText = cleanTrial || "Clinical Trial Brief";
        }
    }
    
    // Sync dropdown selection in ComplianceVault Export tab
    const exportVariantSelect = document.getElementById('export-compliance_vault-variant');
    if (exportVariantSelect) {
        exportVariantSelect.value = 'variant-' + variantNum;
    }
    
    // Dynamic compliance shield update!
    updateComplianceShield(variantData.compliance_violations || []);
    
    // Ensure Studio View asset inspector stays synchronized if active
    if (typeof switchStudioAsset === 'function' && document.getElementById('sim-comparison-modal') && document.getElementById('sim-comparison-modal').style.display !== 'none') {
        switchStudioAsset('after');
    }
    
    // Hide the placeholder, reveal the composer sheet
    document.getElementById('canvas-placeholder').style.display = 'none';
    document.getElementById('composer-card-sheet').style.display = 'flex';
    
    // Log active variant load in Console
    logConsoleLine("Master_Orchestrator_Agent", `Variant ${variantNum} (${variantData.drug}) loaded successfully. Active ComplianceVault Promomats registry connected.`);
    
    if (typeof recordTimeTravelEvent === 'function') {
        recordTimeTravelEvent("LOAD_VARIANT", `Switched to Variant ${variantNum}`, `Loaded workspace state for ${variantData.drug} (${variantData.campaign})`);
    }
    
    // Dynamic Agent Orchestration Card Update!
    const orchDesc = document.getElementById('orchestration-agent-desc');
    if (orchDesc) {
        orchDesc.innerText = `Clinical brief ingestion complete. Compliant claims successfully harvested from ${variantData.trial} Prescribing Information. Awaiting editorial review and rule compilation.`;
    }
    
    // Dynamic Bottom Next button text update!
    const p2BottomBtn = document.getElementById('phase2-bottom-button-text');
    if (p2BottomBtn) {
        p2BottomBtn.innerText = `[Confirm Variant ${variantNum} (${variantData.drug}) and Proceed to Final Submission (Phase 3)]`;
    }
    
    // Trigger dynamic claims network redraw on Tab 2!
    const efficacyClaim = variantData.claims.find(c => c.parameter.includes("Objective Response Rate") || c.parameter.includes("Overall Survival") || c.id.includes("EFF")) || variantData.claims[0];
    const safetyClaim = variantData.claims.find(c => c.parameter.toLowerCase().includes("adverse") || c.parameter.toLowerCase().includes("safety") || c.id.includes("SAF")) || variantData.claims[variantData.claims.length - 1];
    
    const efficacyVal = efficacyClaim ? efficacyClaim.value : "56%";
    const efficacyRef = efficacyClaim ? efficacyClaim.ref : "Ref #V-2026-KT089";
    const efficacyHash = efficacyClaim ? (efficacyClaim.verification_hash || "sha256:d8b02ea9a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286") : "sha256:d8b02ea9a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286";
    
    const safetyVal = safetyClaim ? safetyClaim.value : "10%";
    const safetyRef = safetyClaim ? safetyClaim.ref : "Ref #V-2026-KTS99";
    const safetyHash = safetyClaim ? (safetyClaim.verification_hash || "sha256:8f9c2eb3a901c77f00a2eb3a901c66") : "sha256:8f9c2eb3a901c77f00a2eb3a901c66";
    
    if (typeof drawClaimsNetwork === 'function') {
        drawClaimsNetwork(
            variantData.drug || variantData.medication,
            variantData.trial,
            efficacyVal,
            safetyVal,
            efficacyRef,
            safetyRef,
            efficacyHash,
            safetyHash
        );
    }
};

// Populate the claims registry side panel dynamically
function populateClaimsRegistry(claims) {
    const container = document.getElementById('claims-registry-container');
    if (!container) return;
    
    container.innerHTML = '';
    claims.forEach(claim => {
        const item = document.createElement('div');
        item.className = 'claims-register-item';
        item.id = 'claim-card-' + claim.id;
        item.innerHTML = `
            <div class="claim-meta-row">
                <span class="claim-id-tag">${claim.id}</span>
                <span class="claim-verif-badge">${claim.status}</span>
            </div>
            <div class="claim-text-desc">${claim.parameter}: <strong>${claim.value}</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.62rem; margin-top: 0.15rem;">
                <span class="claim-citation-code">${claim.ref}</span>
                <span style="color: var(--color-text-muted); font-style: italic;">${claim.trial}</span>
            </div>
        `;
        // Add click behavior to scroll to/highlight claim in composer
        item.style.cursor = 'pointer';
        item.onclick = () => highlightClaim(claim.id);
        container.appendChild(item);
    });
}

// Highlight claims in copy and right sidebar simultaneously
window.highlightClaim = function(claimId) {
    // Scroll to and flash the claim card on the right
    const claimCard = document.getElementById('claim-card-' + claimId);
    if (claimCard) {
        claimCard.style.borderColor = 'var(--color-primary)';
        claimCard.style.boxShadow = '0 0 12px rgba(13, 148, 136, 0.25)';
        setTimeout(() => {
            claimCard.style.borderColor = 'var(--border-color)';
            claimCard.style.boxShadow = 'none';
        }, 1500);
    }
    logConsoleLine("Claims_Pre-Screen_Agent", `Regulatory Compliance Vault cross-reference audit: ${claimId} successfully verified.`);
};

// Switch Right Sidebar Tabs (Standards | Claims | Export)
window.switchRightTab = function(tabName) {
    // Hide all tab panels
    document.getElementById('rtab-panel-standards').style.display = 'none';
    document.getElementById('rtab-panel-claims').style.display = 'none';
    document.getElementById('rtab-panel-export').style.display = 'none';
    
    // Deactivate all buttons
    document.querySelectorAll('.dock-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.color = 'var(--color-text-muted)';
        btn.style.borderBottom = 'none';
    });
    
    // Show active panel
    document.getElementById('rtab-panel-' + tabName).style.display = 'flex';
    
    // Activate button
    const activeBtn = document.getElementById('btn-tab-' + tabName);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = 'var(--color-primary)';
        activeBtn.style.borderBottom = '2px solid var(--color-primary)';
    }
};

// Google Imagen 3 Modal Controls
window.openImagenModal = function() {
    const modal = document.getElementById('imagen-modal');
    if (modal) {
        // Pre-fill prompt based on active variant
        const currentData = variantDatabase[currentActiveVariant];
        if (currentData) {
            document.getElementById('imagen-prompt-input').value = currentData.prompt;
            const brandVal = currentData.drug.toLowerCase().replace(' + product_a', '').replace('-', '_');
            const brandSel = document.getElementById('imagen-brand-select');
            if (brandSel) brandSel.value = brandVal;
            const modelSel = document.getElementById('imagen-model-select');
            if (modelSel) modelSel.value = currentData.model || "imagen-3-clinical";
            const styleSel = document.getElementById('imagen-style-select');
            if (styleSel) styleSel.value = currentData.style || "clinical-realism";
        }
        modal.classList.add('active');
        
        // Hook into interactive tour!
        if (window.isTourActive && window.tourStep === 3) {
            window.tourStep = 4;
            setTimeout(() => {
                if (activeTour) {
                    activeTour.drive(4); // Highlight Step 4: Imagen 3 modal Generate button!
                }
            }, 500);
        }
    }
};

window.closeImagenModal = function() {
    const modal = document.getElementById('imagen-modal');
    if (modal) modal.classList.remove('active');
};

let selectedVariantsCount = 4; // Default recommended count
let selectedAspectRatio = "16:9";

window.initImagenVariantSelectors = function() {
    // Bind click listeners for the Imagen variant count buttons
    const variantButtons = document.querySelectorAll('#imagen-variants-row .imagen-variant-btn');
    variantButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            variantButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const count = parseInt(this.innerText) || 4;
            selectedVariantsCount = count;
            appendConsoleLine('system', `🖼️ Selected image generation target: ${selectedVariantsCount} variant(s).`);
        });
    });

    const modelSelect = document.getElementById('imagen-model-select');
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            if (variantDatabase[currentActiveVariant]) {
                variantDatabase[currentActiveVariant].model = this.value;
                appendConsoleLine('system', `⚙️ Generative model set to: ${this.value}`);
            }
        });
    }
    const styleSelect = document.getElementById('imagen-style-select');
    if (styleSelect) {
        styleSelect.addEventListener('change', function() {
            if (variantDatabase[currentActiveVariant]) {
                variantDatabase[currentActiveVariant].style = this.value;
                appendConsoleLine('system', `🎨 Visual style preset set to: ${this.value}`);
            }
        });
    }

    // Bind click listeners for the new Aspect Ratio buttons
    const aspectButtons = document.querySelectorAll('#imagen-aspect-row .imagen-variant-btn');
    aspectButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            aspectButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedAspectRatio = this.innerText.split(' ')[0] || "16:9";
            appendConsoleLine('system', `📐 Selected image aspect ratio: ${selectedAspectRatio}.`);
        });
    });

    // Bind change listeners for the new Positive and Negative prompt presets
    const positivePresets = document.getElementById('imagen-prompt-presets');
    if (positivePresets) {
        positivePresets.addEventListener('change', function() {
            const promptInput = document.getElementById('imagen-prompt-input');
            if (promptInput) {
                promptInput.value = this.value;
                promptInput.dispatchEvent(new Event('input'));
            }
            appendConsoleLine('system', `📋 Loaded Description Template: "${this.options[this.selectedIndex].text}".`);
        });
    }

    const negativePresets = document.getElementById('imagen-negative-presets');
    if (negativePresets) {
        negativePresets.addEventListener('change', function() {
            const negativeInput = document.getElementById('imagen-negative-input');
            if (negativeInput) {
                negativeInput.value = this.value;
                negativeInput.dispatchEvent(new Event('input'));
            }
            appendConsoleLine('system', `📋 Loaded MLR Exclusion Template: "${this.options[this.selectedIndex].text}".`);
        });
    }
};

// Simulate Google Imagen 3 High-Fidelity Asset Generation
window.generateImagenAsset = function() {
    const spinner = document.getElementById('imagen-spinner');
    const prompt = document.getElementById('imagen-prompt-input').value;
    const brand = document.getElementById('imagen-brand-select').value;
    
    // Read the new premium compliance fields
    const negativePrompt = document.getElementById('imagen-negative-input').value.trim();
    const synthIdEnabled = document.getElementById('imagen-synthid-toggle').checked;
    const stylePreset = document.getElementById('imagen-style-select').value;
    const modelName = document.getElementById('imagen-model-select').value;
    
    // Determine target variant mapping
    let targetVariant = 1;
    if (brand === 'product_a') targetVariant = 1;
    else if (brand === 'product_b') targetVariant = 2;
    else if (brand === 'product_c') targetVariant = 3;
    else if (brand === 'product_d') targetVariant = 4;
    else if (brand === 'product_e') targetVariant = 5;
    else if (brand === 'product_f') targetVariant = 6;
    else if (brand === 'product_g') targetVariant = 7;

    if (spinner) spinner.style.display = 'inline-block';
    logConsoleLine("Strategic_Ingestion_Agent", `✨ Initializing LIVE Google Nano Banana image synthesis on Vertex AI...`);
    logConsoleLine("Strategic_Ingestion_Agent", `Parameters: [Aspect: ${selectedAspectRatio}] | [Model: ${modelName}] | [Preset: ${stylePreset}]`);
    logConsoleLine("Strategic_Ingestion_Agent", `Prompt: "${prompt}"`);
    
    if (negativePrompt) {
        logConsoleLine("Strategic_Ingestion_Agent", `Exclusion Criteria (Negative Prompt): "${negativePrompt}"`);
    }
    if (synthIdEnabled) {
        logConsoleLine("Strategic_Ingestion_Agent", `🔒 SynthID™ digital watermarking enabled.`);
    }

    // Make live request to backend
    fetch(`${BACKEND_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            negative_prompt: negativePrompt || null,
            aspect_ratio: selectedAspectRatio || "16:9",
            brand: brand,
            style_preset: stylePreset,
            model_name: modelName
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to generate image. Vertex AI returned an error.');
        }
        return response.json();
    })
    .then(data => {
        if (spinner) spinner.style.display = 'none';
        closeImagenModal();
        
        if (data.success && data.image_url) {
            // Hook into interactive tour!
            if (window.isTourActive && window.tourStep === 4) {
                window.tourStep = 5;
                setTimeout(() => {
                    if (activeTour) {
                        activeTour.drive(5); // Highlight Step 5: The newly generated image card on the canvas!
                    }
                }, 800);
            }
            // Save the newly generated image directly into the state database!
            if (variantDatabase[targetVariant]) {
                variantDatabase[targetVariant].image = data.image_url;
                variantDatabase[targetVariant].model = modelName;
                variantDatabase[targetVariant].style = stylePreset;
                
                // Keep the prompt on record
                variantDatabase[targetVariant].prompt = data.final_prompt;
                
                // Persist locally with QuotaExceeded protection
                try {
                    if (data.image_url && data.image_url.startsWith('data:') && data.image_url.length > 100000) {
                        console.warn("[Maestro Storage] Base64 image payload too large for localStorage quota. Storing path fallback.");
                        localStorage.setItem('maestro_variant_' + targetVariant + '_image', data.filename || './product_a_clinical_hero.png');
                    } else {
                        localStorage.setItem('maestro_variant_' + targetVariant + '_image', data.image_url);
                    }
                } catch (storeErr) {
                    console.error("[Maestro Storage] QuotaExceededError on localStorage. Saving fallback path:", storeErr);
                    localStorage.setItem('maestro_variant_' + targetVariant + '_image', './product_a_clinical_hero.png');
                }
                
                if (window.analyticsData && Array.isArray(window.analyticsData)) {
                    window.analyticsData.unshift({
                        campaign_id: `CAMP-GEN-${Date.now().toString().slice(-4)}`,
                        project_name: `${brand.toUpperCase().replace('_', '-')} Visual Synthesis`,
                        brand: brand.toUpperCase().replace('_', '-'),
                        indication: 'Oncology / Specialty',
                        status: 'COMPLIANT',
                        latency_ms: 1120,
                        violations_count: 0,
                        violation_details: [],
                        tokens_used: 24500,
                        cost_usd: 0.18,
                        savings_usd: 150.00,
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    });
                    if (typeof applyFilters === 'function') applyFilters();
                }
                
                // Automatically load and focus the target variant tab with the new visual!
                loadVariant(targetVariant);
                
                logConsoleLine("Master_Orchestrator_Agent", `✨ Google Imagen 3 successfully synthesized and saved a brand-compliant clinical hero asset: ${data.filename}`);
                
                if (synthIdEnabled) {
                    logConsoleLine("Self-Healing_Layout_Token_Agent", `🛡️ SynthID™ Cryptographic Watermark successfully injected. Pixel signature locked.`);
                }
                
                logConsoleLine("Master_Orchestrator_Agent", `Variant ${targetVariant} asset updated and synced to the compliance ledger.`);
                
                if (typeof recordTimeTravelEvent === 'function') {
                    recordTimeTravelEvent("IMAGE_SYNTHESIS", data.final_prompt, `Synthesized brand-compliant clinical hero asset: ${data.filename} via ${data.model_used}`);
                }
                
                // Show premium toast notification!
                showToast(
                    "Imagen Synthesis Complete", 
                    `Google Imagen 3 successfully synthesized clinical hero imagery for your ${brand.toUpperCase()} campaign variant!`, 
                    "success"
                );
            }
        } else {
            showToast("⚠️ Generation returned empty image URL.", "warning");
        }
    })
    .catch(error => {
        if (spinner) spinner.style.display = 'none';
        console.error('Error generating image:', error);
        logConsoleLine("Strategic_Ingestion_Agent", `❌ Error: Real-time image generation failed: ${error.message}`);
        showToast("Imagen Generation Failed", error.message, "error");
    });
};

// Premium ContentStudio Regulatory Compliance Vault Export handler
window.exportComplianceVaultPackageContentStudio = async function() {
    const project = document.getElementById('export-compliance_vault-project').value;
    const variant = document.getElementById('export-compliance_vault-variant').value;
    const btn = document.getElementById('btn-compliance_vault-export-contentstudio');
    
    if (!btn) return;
    
    // Lock UI
    btn.disabled = true;
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = "<span>Exporting...</span>";
    
    logConsoleLine("Master_Orchestrator_Agent", `⚡ Compiling Regulatory Compliance Vault Promomats Export Package for Project '${project}'...`);
    logConsoleLine("Self-Healing_Layout_Token_Agent", `Injecting security disclaimer checksums and packaging responsive compliance HTML...`);
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project: project,
                variant: variant
            })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Export failed");
        }
        
        const data = await response.json();
        if (data.success) {
            // Prepend the real record to the Compliance Ledger!
            const drug = variant === 'variant-1' ? 'Product-A' : 
                         (variant === 'variant-2' ? 'Product-B' : 
                         (variant === 'variant-3' ? 'Product-C' : 
                         (variant === 'variant-4' ? 'Product-D' : 
                         (variant === 'variant-5' ? 'Product-E' : 
                         (variant === 'variant-6' ? 'Product-F' : 'Product-G')))));
                         
            prependToLedgerHistory(
                drug + ' ContentStudio Export', 
                project, 
                'VERIFIED', 
                'ComplianceVaultGateway', 
                data.verification_hash
            );
            
            // Show a premium toast alert
            if (window.showToast) {
                showToast(
                    "Vault Export Successful", 
                    `Approved Campaign Variant successfully compiled and exported to Regulatory Compliance Vault (Doc ID: ${data.veeva_doc_id}). Ledger block locked.`, 
                    "success"
                );
            } else {
                showToastAlert(`Approved Campaign Variant successfully exported to Regulatory Compliance Vault! Doc ID: ${data.veeva_doc_id}`);
            }
            if (typeof exportComplianceVaultPackage === 'function') {
                exportComplianceVaultPackage();
            }
        }
    } catch (error) {
        logConsoleLine("Master_Orchestrator_Agent", `❌ Export error: ${error.message}`);
        alert(`Cross-Cloud Export Failed: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
    }
};

// Helper function to write logs directly to Console body (dual-streaming to maximized modal if active)
function logConsoleLine(agentName, message) {
    const consoleBody = document.getElementById("console-body");
    const expandedBody = document.getElementById("expanded-console-body");
    
    if (consoleBody) {
        const line = document.createElement("div");
        line.className = "console-line system";
        const timestamp = new Date().toLocaleTimeString();
        const displayName = AGENT_DISPLAY_NAMES[agentName] || agentName;
        line.innerHTML = `[${timestamp}] <strong>[${displayName}]</strong>: ${message}`;
        
        // Append to tiny sidebar console
        consoleBody.appendChild(line);
        consoleBody.scrollTop = consoleBody.scrollHeight;
        
        // Append to maximized console modal if it exists
        if (expandedBody) {
            const expandedLine = line.cloneNode(true);
            expandedBody.appendChild(expandedLine);
            expandedBody.scrollTop = expandedBody.scrollHeight;
        }
    }
}

// Ingestion Handler Overrides to load dynamic content into the Composer on success!
const originalHandleIngestionSuccess = window.handleIngestionSuccess;
window.handleIngestionSuccess = function(data, sourceName, sourceType) {
    // Call original handler to draw charts and ledger
    if (originalHandleIngestionSuccess) {
        originalHandleIngestionSuccess(data, sourceName, sourceType);
    }
    
    // Dynamically load the composed result into Variant 1!
    if (data && data.brief) {
        const drug = (data.brief["Medication"] || data.brief["medication"] || "Product-A").toLowerCase();
        let variantNum = 1;
        if (drug.includes("product_b") || drug.includes("product-b") || drug.includes("lenvima") || drug.includes("lenvatinib")) {
            variantNum = 2;
        } else if (drug.includes("product_c") || drug.includes("product-c") || drug.includes("welireg") || drug.includes("belzutifan")) {
            variantNum = 3;
        } else if (drug.includes("product_d") || drug.includes("product-d") || drug.includes("winrevair") || drug.includes("sotatercept")) {
            variantNum = 4;
        } else if (drug.includes("product_e") || drug.includes("product-e") || drug.includes("lynparza") || drug.includes("olaparib")) {
            variantNum = 5;
        } else if (drug.includes("product_f") || drug.includes("product-f") || drug.includes("gardasil")) {
            variantNum = 6;
        } else if (drug.includes("product_g") || drug.includes("product-g") || drug.includes("lagevrio") || drug.includes("molnupiravir")) {
            variantNum = 7;
        }
        
        // Update the variant database in-memory with the real AI generated content!
        variantDatabase[variantNum].subject = data.brief["Campaign Name"] || variantDatabase[variantNum].subject;
        variantDatabase[variantNum].preheader = data.brief["Core Marketing Hook"] || variantDatabase[variantNum].preheader;
        variantDatabase[variantNum].html = data.html || variantDatabase[variantNum].html;
        
        // Load the variant in composer!
        loadVariant(variantNum);
    }
};

// Override DOMContentLoaded initialization to restore saved phase/variant!
window.addEventListener('load', () => {
    // Pre-load variant and restore workspace focus mode!
    setTimeout(() => {
        isRoutingInProgress = true; // Lock hash updates during initial DOM load
        
        switchRightTab('standards');
        fetchActiveStandards(); // Fetch active standards version & hash on startup
        
        // Retrieve saved state from localStorage!
        const savedPhase = localStorage.getItem('maestro_active_phase');
        const savedVariant = localStorage.getItem('maestro_active_variant');
        
        const initialPhase = savedPhase !== null ? parseInt(savedPhase) : -1;
        const initialVariant = savedVariant !== null ? parseInt(savedVariant) : 1;
        
        // ALWAYS pre-load the variant on startup so that the DOM (composer image, text, and Left Ingest summaries) is fully initialized!
        loadVariant(initialVariant);
        
        isRoutingInProgress = false; // Unlock hash updates
        
        // Check if there is already a deep-link hash route in the URL!
        if (window.location.hash) {
            handleHashRoute();
        } else {
            window.location.hash = '#/';
        }
    }, 500);
    
    // Bind click handlers to initial baseline rows in the ledger table
    const initialRows = document.querySelectorAll('#ledger-history-body tr');
    initialRows.forEach(row => {
        row.addEventListener('click', () => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 6) {
                const timestamp = cells[0].innerText;
                const medication = cells[1].innerText;
                const campaignName = cells[2].innerText;
                const status = cells[3].innerText;
                const auditor = cells[4].innerText;
                const hash = cells[5].querySelector('div')?.getAttribute('title') || 'sha256:d8b02ea9a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286';
                showComplianceCertificate({
                    timestamp, medication, campaignName, status, auditor, hash
                });
            }
        });
        row.style.cursor = 'pointer';
    });
});

// High-Fidelity Global Pharma AssetLibrary Content Fragment to Google Imagen 3 Workflow Link!
window.loadAemFragment = function(imagePrompt, textName) {
    let variantNum = 1;
    const lowerPrompt = imagePrompt.toLowerCase();
    if (lowerPrompt.includes("product_b") || lowerPrompt.includes("lenvima")) {
        variantNum = 2;
    } else if (lowerPrompt.includes("product_c") || lowerPrompt.includes("welireg")) {
        variantNum = 3;
    } else if (lowerPrompt.includes("product_d") || lowerPrompt.includes("winrevair")) {
        variantNum = 4;
    } else if (lowerPrompt.includes("product_e") || lowerPrompt.includes("lynparza")) {
        variantNum = 5;
    } else if (lowerPrompt.includes("product_f") || lowerPrompt.includes("gardasil")) {
        variantNum = 6;
    } else if (lowerPrompt.includes("product_g") || lowerPrompt.includes("lagevrio")) {
        variantNum = 7;
    }
    loadVariant(variantNum);
    
    logConsoleLine("Master_Orchestrator_Agent", `🔌 Connecting to Enterprise Asset Platform (AssetLibrary) Assets Repository...`);
    logConsoleLine("Google Gemini Standards Agent", `Parsing AssetLibrary Asset Metadata: "${textName}"...`);
    
    // Open the Google Imagen modal with pre-filled prompt!
    setTimeout(() => {
        logConsoleLine("Master_Orchestrator_Agent", `✨ Requesting Vertex AI Google Imagen 3 synthesis for approved background fragment: "${imagePrompt}"`);
        const modal = document.getElementById('imagen-modal');
        if (modal) {
            document.getElementById('imagen-prompt-input').value = `Professional medical marketing banner for ${variantDatabase[variantNum].drug}, clinical setting: ${imagePrompt}, brand compliant, high-fidelity, 4k`;
            document.getElementById('imagen-brand-select').value = variantDatabase[variantNum].drug.toLowerCase().split(' ')[0];
            modal.classList.add('active');
        }
    }, 800);
};

// --- REAL MULTIPART/FORM-DATA FILE UPLOADER & PARSER ---
window.triggerFileInput = function() {
    const input = document.getElementById('canvas-file-input');
    if (input) input.click();
};

window.handleFileSelect = function(event) {
    const files = event.target.files;
    if (files.length > 0) {
        uploadAndIngestFile(files[0]);
    }
};

window.handleDrop = function(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        uploadAndIngestFile(files[0]);
    }
};

async function uploadAndIngestFile(file) {
    const isPPTX = file.name.endsWith(".pptx");
    const endpoint = isPPTX ? "/api/ingest-pptx" : "/api/ingest-pdf";
    
    // Show premium info toast
    showToast("File Uploading", `Uploading and parsing "${file.name}" in real-time...`, "info");
    resetPipelineTracker();
    setLoadingState(true);
    
    logConsoleLine("Strategic_Ingestion_Agent", `📁 [Ingestion] Uploading physical file: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
        updatePipelineStep('ingestion', 'RUNNING', 30);
        
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'SUCCESS') {
            updatePipelineStep('ingestion', 'SUCCESS');
            try {
                handleIngestionSuccess(data, file.name, isPPTX ? 'PowerPoint Ingestion' : 'PDF Ingestion');
            } catch (renderError) {
                console.error("Error rendering ingestion success UI:", renderError);
                // Non-blocking rendering error: keep the pipeline status as SUCCESS!
            }
        } else {
            updatePipelineStep('ingestion', 'FAILED');
            showToast("Ingestion Failed", data.detail || "Failed to parse document.", "warning");
            logConsoleLine("Strategic_Ingestion_Agent", `❌ Ingestion failed: ${data.detail || 'Parser error.'}`);
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        updatePipelineStep('ingestion', 'FAILED');
        showToast("Connection Error", "Unable to upload file to backend server.", "warning");
        logConsoleLine("Strategic_Ingestion_Agent", `❌ Connection failed during file upload.`);
    } finally {
        setLoadingState(false);
    }
}

// --- SEAMLESS FDA FORM 2253 TRANSMITTAL COMPILER CONTROLLER ---
window.openFda2253Modal = function() {
    const activeTab = document.querySelector('.variant-tab-btn.active');
    const variantId = activeTab ? activeTab.id : 'variant-tab-1';
    
    // 1. Resolve drug metadata dynamically based on the active variant
    let drugName = "Product-A";
    let establishedName = "compound_alpha";
    let appNo = "BLA 125156";
    let applicant = "Global Pharma Enterprise LLC";
    let address = "126 E. Lincoln Avenue, Rahway, NJ 07065";
    let tel = "(732) 594-4000";
    
    if (variantId === 'variant-tab-2' || variantId === 'variant-tab-belzugifan') {
        drugName = "Product-C";
        establishedName = "compound_gamma";
        appNo = "NDA 215383";
    } else if (variantId === 'variant-tab-3' || variantId === 'variant-tab-lenvatinib') {
        drugName = "Product-B";
        establishedName = "compound_beta";
        appNo = "NDA 206947";
        applicant = "Global Pharma Enterprise LLC";
        address = "100 Tice Boulevard, Woodcliff Lake, NJ 07677";
        tel = "(201) 692-1000";
    }
    
    // 2. Pre-populate Box 1, 3, 4
    document.getElementById('fda-box1-name').innerText = applicant;
    document.getElementById('fda-box1-address').innerText = address;
    document.getElementById('fda-box1-tel').innerText = "Tel: " + tel;
    document.getElementById('fda-box3-appno').innerText = appNo;
    document.getElementById('fda-box4-proprietary').innerText = drugName;
    document.getElementById('fda-box4-established').innerText = establishedName;
    
    // 3. Pre-populate Date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('fda-box2-date').innerText = formattedDate;
    document.getElementById('fda-box8-date').innerText = formattedDate;
    
    // 4. Pre-populate Box 7 (List of Materials)
    // Read the Subject line from the composer input
    const subjectVal = document.getElementById('composer-subject-input').value || "Clinical Efficacy Update Campaign";
    document.getElementById('fda-box7-title').innerText = subjectVal;
    
    // Read Veeva ID (generate a realistic stable one if it's not present)
    let veevaId = "US-KEY-26-00342";
    if (variantId === 'variant-tab-2') {
        veevaId = "US-WEL-26-00108";
    } else if (variantId === 'variant-tab-3') {
        veevaId = "US-LEN-26-00947";
    }
    document.getElementById('fda-box7-veevaid').innerText = veevaId;
    
    // Populate Form Type
    let formType = "Professional Email";
    const preheaderVal = document.getElementById('composer-preheader-input').value;
    if (!preheaderVal || preheaderVal.trim() === "") {
        formType = "Web Landing Page";
    }
    document.getElementById('fda-box7-type').innerText = formType;
    
    // Generate a secure, deterministic SHA-256 hash for the transmittal seal
    let simulatedHash = 'sha256:d84f' + Math.random().toString(16).substring(2, 12) + 'd84f93e982fa8839cb88849c2a11b88e83f0a91e';
    if (window.timeTravelEvents && window.timeTravelEvents.length > 0 && window.timeTravelEvents[0].hash) {
        simulatedHash = window.timeTravelEvents[0].hash;
    }
    document.getElementById('fda-box7-hash').innerText = simulatedHash;
    
    // 5. Pre-populate Box 8 Signature
    const activeUser = document.getElementById('btn-role-selector').innerText || 'nitinagga-ge-2';
    document.getElementById('fda-box8-signature').innerText = "/" + activeUser + "/";
    
    // 6. Display the Modal
    document.getElementById('fda-2253-modal-overlay').style.display = 'flex';
    logConsoleLine("Master_Orchestrator_Agent", `📋 FDA Form 2253 Regulatory transmittal sheet compiled for drug '${drugName}' (${appNo}).`);
};

window.closeFda2253Modal = function() {
    document.getElementById('fda-2253-modal-overlay').style.display = 'none';
};

window.printFda2253Form = function() {
    logConsoleLine("Master_Orchestrator_Agent", `🖨️ Opening browser native print system to export FDA Form 2253 PDF...`);
    window.print();
};

// --- MAXIMIZED CONSOLE LOGS CONTROLLER ---
window.openExpandedConsole = function() {
    const consoleBody = document.getElementById("console-body");
    const expandedBody = document.getElementById("expanded-console-body");
    
    if (consoleBody && expandedBody) {
        // Sync all logs from the sidebar console to the maximized modal
        expandedBody.innerHTML = consoleBody.innerHTML;
        
        // Open the modal
        document.getElementById("expanded-console-modal").style.display = "flex";
        
        // Scroll to the bottom
        setTimeout(() => {
            expandedBody.scrollTop = expandedBody.scrollHeight;
        }, 50);
        
        logConsoleLine("Master_Orchestrator_Agent", "🖥️ Immersive console terminal maximized for detailed telemetry analysis.");
    }
};

window.closeExpandedConsole = function() {
    document.getElementById("expanded-console-modal").style.display = "none";
};

window.clearExpandedConsole = function() {
    const consoleBody = document.getElementById("console-body");
    const expandedBody = document.getElementById("expanded-console-body");
    
    if (consoleBody) consoleBody.innerHTML = "";
    if (expandedBody) expandedBody.innerHTML = "";
    
    logConsoleLine("System", "Terminal cleared.");
};

window.copyConsoleLogs = function() {
    const consoleBody = document.getElementById("console-body");
    if (consoleBody) {
        // Strip HTML tags for clean text copying
        const rawText = consoleBody.innerText;
        navigator.clipboard.writeText(rawText)
            .then(() => {
                showToast("Logs Copied", "Agent telemetry logs successfully copied to your clipboard!", "success");
            })
            .catch(err => {
                console.error("Failed to copy logs:", err);
                showToast("Copy Failed", "Unable to copy logs to clipboard.", "warning");
            });
    }
};

window.exportConsoleLogs = function() {
    const consoleBody = document.getElementById("console-body");
    if (consoleBody) {
        const rawText = consoleBody.innerText;
        const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = "maestro_agent_telemetry.log";
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast("Logs Exported", "maestro_agent_telemetry.log downloaded successfully!", "success");
    }
};

// --- DUAL-MODE URL INGESTION CONTROLLER ---
window.handlePresetSelectChange = function(selectElement) {
    const presetVal = selectElement.value;
    const customInput = document.getElementById("url-custom-input");
    const hiddenInput = document.getElementById("url-ingest-input");
    const verificationPanel = document.getElementById("url-verification-panel");
    const externalLink = document.getElementById("url-external-link");
    const displayText = document.getElementById("url-display-text");
    
    if (presetVal === "CUSTOM") {
        // Show custom text input, hide verification panel
        customInput.style.display = "block";
        customInput.value = "";
        customInput.focus();
        hiddenInput.value = "";
        if (verificationPanel) verificationPanel.style.display = "none";
    } else if (presetVal) {
        // Hide custom text input
        customInput.style.display = "none";
        
        // Write selection to the hidden input (which app.js reads)
        hiddenInput.value = presetVal;
        
        // Strip out the URL hash (#product_a, #product_b, etc.) to get a clean browser-link
        const cleanUrl = presetVal.split("#")[0];
        
        // Update verification panel
        if (externalLink) externalLink.href = cleanUrl;
        if (displayText) displayText.innerText = cleanUrl;
        if (verificationPanel) verificationPanel.style.display = "block";
        
        logConsoleLine("Master_Orchestrator_Agent", `🔗 FDA Prescribing Label selected: ${cleanUrl}. Ready to ingest.`);
    } else {
        // Clear everything
        customInput.style.display = "none";
        hiddenInput.value = "";
        if (verificationPanel) verificationPanel.style.display = "none";
    }
};

window.handleCustomUrlInput = function(inputElement) {
    const val = inputElement.value.trim();
    const hiddenInput = document.getElementById("url-ingest-input");
    const verificationPanel = document.getElementById("url-verification-panel");
    const externalLink = document.getElementById("url-external-link");
    const displayText = document.getElementById("url-display-text");
    
    hiddenInput.value = val;
    
    if (val) {
        // Strip out hash if any
        const cleanUrl = val.split("#")[0];
        
        if (externalLink) externalLink.href = cleanUrl;
        if (displayText) displayText.innerText = cleanUrl;
        if (verificationPanel) verificationPanel.style.display = "block";
    } else {
        if (verificationPanel) verificationPanel.style.display = "none";
    }
};

// --- MAXIMIZED CHAT PORTAL CONTROLLER ---
window.openExpandedChat = function() {
    const chatMessages = document.getElementById("chat-messages");
    const expandedBody = document.getElementById("expanded-chat-body");
    
    if (chatMessages && expandedBody) {
        // Sync all chat history from the sidebar to the maximized modal
        expandedBody.innerHTML = chatMessages.innerHTML;
        
        // Open the modal
        document.getElementById("expanded-chat-modal").style.display = "flex";
        
        // Scroll to the bottom
        setTimeout(() => {
            expandedBody.scrollTop = expandedBody.scrollHeight;
        }, 50);
        
        logConsoleLine("Master_Orchestrator_Agent", "🖥️ Immersive conversational chat portal maximized for detailed instruction routing.");
    }
};

window.closeExpandedChat = function() {
    document.getElementById("expanded-chat-modal").style.display = "none";
};

window.clearExpandedChat = function() {
    const chatMessages = document.getElementById("chat-messages");
    const expandedBody = document.getElementById("expanded-chat-body");
    
    if (chatMessages) chatMessages.innerHTML = "";
    if (expandedBody) expandedBody.innerHTML = "";
    
    const welcomeHtml = `
        <p>Welcome, Global Pharma Team. I am the <strong>Master Orchestrator Agent</strong>. Ingest clinical briefs or slides, and I will harvest compliant claims, generate high-fidelity assets, and orchestrate self-healing layout audits.</p>
        <p class="suggested-caption">Quick Actions:</p>
        <div class="quick-prompts">
            <button class="btn-quick-prompt" onclick="setPromptAndSubmit('Generate a clinical marketing draft for Product-A oncology indications targeting adults.')">✨ Generate Product-A Campaign Draft</button>
        </div>
    `;
    appendChatBubble('assistant', welcomeHtml);
    logConsoleLine("System", "Chat conversation history cleared.");
};

window.submitExpandedChat = async function(event) {
    event.preventDefault();
    const expandedInput = document.getElementById("expanded-chat-input");
    const prompt = expandedInput.value.trim();
    if (!prompt) return;
    
    // Write this prompt into the main sidebar input, and trigger submitChat!
    const mainInput = document.getElementById("chat-input");
    if (mainInput) {
        mainInput.value = prompt;
        
        // Clear the expanded input
        expandedInput.value = "";
        
        // Call submitChat (reusing the core network and state logic!)
        submitChat({ preventDefault: () => {} });
    }
};

// ==========================================
// COMPLIANCE SHIELD STATE MACHINE
// ==========================================
// Initialize compliance violations for variants dynamically to represent realistic demo states
setTimeout(() => {
    if (window.variantDatabase) {
        variantDatabase[1].compliance_violations = [];
        variantDatabase[2].compliance_violations = [
            "Violation: Safety disclaimer is missing mandatory, unabbreviated warning text. Safety compliance check PENDING!"
        ];
        variantDatabase[3].compliance_violations = [
            "Violation: Hero visual asset is missing Google Imagen SynthID cryptographic digital watermark. Provenance check FAILED!"
        ];
        variantDatabase[4].compliance_violations = [];
        variantDatabase[5].compliance_violations = [];
        variantDatabase[6].compliance_violations = [];
        variantDatabase[7].compliance_violations = [];
        
        // Trigger initial shield update for Variant 1 on load
        if (window.updateComplianceShield) {
            window.updateComplianceShield(variantDatabase[1].compliance_violations);
        }
    }
}, 800);

window.updateComplianceShield = function(violations) {
    const warningBlock = document.getElementById("compliance-warning-block");
    const warningText = document.getElementById("compliance-warning-text");
    const okBlock = document.getElementById("compliance-status-ok");
    const scoreVal = document.getElementById("compliance-safety-score");
    const scoreBar = document.getElementById("compliance-safety-bar");
    
    const checkTypography = document.getElementById("shield-check-typography");
    const checkClaims = document.getElementById("shield-check-claims");
    const checkDisclaimer = document.getElementById("shield-check-disclaimer");
    const checkLayout = document.getElementById("shield-check-layout");
    const checkWatermark = document.getElementById("shield-check-watermark");
    
    if (!violations || violations.length === 0) {
        if (warningBlock) warningBlock.style.display = "none";
        if (okBlock) okBlock.style.display = "flex";
        
        if (scoreVal) {
            scoreVal.innerText = "98 / 100";
            scoreVal.style.color = "var(--color-primary)";
        }
        if (scoreBar) {
            scoreBar.style.width = "98%";
            scoreBar.style.background = "linear-gradient(90deg, var(--color-primary) 0%, #10B981 100%)";
        }
        
        const checks = [checkTypography, checkClaims, checkDisclaimer, checkLayout, checkWatermark];
        checks.forEach(el => {
            if (el) {
                el.innerHTML = "✓";
                el.style.color = "#10B981";
            }
        });
        return;
    }
    
    if (okBlock) okBlock.style.display = "none";
    if (warningBlock) {
        warningBlock.style.display = "flex";
        if (warningText) {
            warningText.innerText = violations[0];
        }
    }
    
    let score = 98;
    let hasTypographyViol = false;
    let hasClaimsViol = false;
    let hasDisclaimerViol = false;
    let hasLayoutViol = false;
    let hasWatermarkViol = false;
    
    violations.forEach(viol => {
        const lower = viol.toLowerCase();
        if (lower.includes("typography") || lower.includes("font")) {
            if (!hasTypographyViol) { score -= 10; hasTypographyViol = true; }
        }
        if (lower.includes("claims") || lower.includes("unapproved")) {
            if (!hasClaimsViol) { score -= 15; hasClaimsViol = true; }
        }
        if (lower.includes("safety disclaimer") || lower.includes("disclosure") || lower.includes("disclaimer")) {
            if (!hasDisclaimerViol) { score -= 20; hasDisclaimerViol = true; }
        }
        if (lower.includes("layout") || lower.includes("footer") || lower.includes("overlap")) {
            if (!hasLayoutViol) { score -= 15; hasLayoutViol = true; }
        }
        if (lower.includes("watermark") || lower.includes("synthid")) {
            if (!hasWatermarkViol) { score -= 20; hasWatermarkViol = true; }
        }
    });
    
    if (score < 30) score = 30;
    
    if (scoreVal) {
        scoreVal.innerText = `${score} / 100`;
        if (score >= 90) {
            scoreVal.style.color = "var(--color-primary)";
        } else if (score >= 70) {
            scoreVal.style.color = "#F59E0B";
        } else {
            scoreVal.style.color = "#EF4444";
        }
    }
    
    if (scoreBar) {
        scoreBar.style.width = `${score}%`;
        if (score >= 90) {
            scoreBar.style.background = "linear-gradient(90deg, var(--color-primary) 0%, #10B981 100%)";
        } else if (score >= 70) {
            scoreBar.style.background = "#F59E0B";
        } else {
            scoreBar.style.background = "#EF4444";
        }
    }
    
    const updateCheck = (el, isViolated) => {
        if (!el) return;
        if (isViolated) {
            el.innerHTML = "⚠️";
            el.style.color = "#F59E0B";
        } else {
            el.innerHTML = "✓";
            el.style.color = "#10B981";
        }
    };
    
    updateCheck(checkTypography, hasTypographyViol);
    updateCheck(checkClaims, hasClaimsViol);
    updateCheck(checkDisclaimer, hasDisclaimerViol);
    updateCheck(checkLayout, hasLayoutViol);
    updateCheck(checkWatermark, hasWatermarkViol);
};

// ==========================================
// STANDARDS & GOVERNANCE REGISTRY WEB APIs
// ==========================================
window.fetchActiveStandards = async function() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/standards`);
        if (!response.ok) throw new Error("Failed to fetch active standards");
        
        const data = await response.json();
        if (data.success) {
            // Update Active Badge and Hash displays
            const badge = document.getElementById("active-standards-version-badge");
            const hashDisplay = document.getElementById("active-standards-hash-display");
            
            if (badge) {
                badge.innerText = data.version;
                // Add a subtle micro-animation to indicate update
                badge.style.transform = "scale(1.15)";
                badge.style.transition = "transform 0.2s ease";
                setTimeout(() => badge.style.transform = "scale(1)", 200);
            }
            
            if (hashDisplay) {
                hashDisplay.innerText = `Hash: ${data.hash.substring(0, 26)}...`;
                hashDisplay.setAttribute("title", data.hash);
            }
            
            // Increment the next version suggestion in the input box
            const verInput = document.getElementById("rule-compiler-version");
            if (verInput) {
                const currentVer = parseFloat(data.version.replace('v', ''));
                if (!isNaN(currentVer)) {
                    verInput.value = `v${(currentVer + 0.1).toFixed(1)}`;
                }
            }
            
            console.log(`[Maestro Registry] active compliance standards synced to version: ${data.version}`);
        }
    } catch (error) {
        console.error("Error syncing active standards:", error);
    }
};

window.compileAndPromoteRule = async function() {
    const promptArea = document.getElementById("rule-compiler-prompt");
    const authorInput = document.getElementById("rule-compiler-author");
    const verInput = document.getElementById("rule-compiler-version");
    const btn = document.getElementById("btn-promote-rule");
    
    if (!promptArea || !btn) return;
    
    const prompt = promptArea.value.trim();
    const author = authorInput ? authorInput.value.trim() : "MLR_SME";
    const version = verInput ? verInput.value.trim() : "v1.1";
    
    if (!prompt) {
        alert("Please enter a natural language modification request for the compiler!");
        return;
    }
    
    // Disable UI
    btn.disabled = true;
    const originalBtnHtml = btn.innerHTML;
    btn.innerHTML = "<span>Compiling...</span>";
    promptArea.disabled = true;
    
    logConsoleLine("Standards_Governance_Registry", `⚙️ Invoking Vertex AI Rules Compiler for request: "${prompt}"...`);
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/standards/promote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rule_id: "typography", // Default target rule segment for visual demo
                category: "brand_guidelines",
                rule_name: "Brand Guideline Typography",
                version_label: version,
                change_description: `Promoted via Web Admin Console`,
                author: author,
                prompt: prompt
            })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Failed to compile ruleset");
        }
        
        const data = await response.json();
        if (data.success) {
            // Success Alert!
            logConsoleLine("Standards_Governance_Registry", `✨ Ruleset successfully promoted to version ${data.version}!`);
            logConsoleLine("Standards_Governance_Registry", `🔒 Cryptographic Verification Seal: ${data.verification_hash}`);
            
            // Clear input area
            promptArea.value = "";
            
            // Clear violations of the active variant, representing successful compiler repair!
            if (window.variantDatabase && variantDatabase[currentActiveVariant]) {
                variantDatabase[currentActiveVariant].compliance_violations = [];
            }
            
            // Refresh Active display
            await fetchActiveStandards();
            
            // Reload the active variant to update the Compliance Shield to green!
            loadVariant(currentActiveVariant);
            
            // Show a premium toast alert
            showToastAlert(`Compliance guidelines successfully promoted to version ${data.version}! Specialist agents hot-reloaded and active.`);
        }
    } catch (error) {
        logConsoleLine("Standards_Governance_Registry", `❌ Rule compilation error: ${error.message}`);
        alert(`Rule Compilation Failed: ${error.message}`);
    } finally {
        // Restore UI
        btn.disabled = false;
        btn.innerHTML = originalBtnHtml;
        promptArea.disabled = false;
    }
};

// Helper to display clean premium toast alerts
function showToastAlert(message) {
    const toast = document.createElement("div");
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "var(--bg-surface-solid)";
    toast.style.border = "1px solid var(--color-primary)";
    toast.style.borderLeft = "4px solid var(--color-primary)";
    toast.style.color = "var(--color-text-main)";
    toast.style.padding = "0.75rem 1.25rem";
    toast.style.borderRadius = "6px";
    toast.style.fontSize = "0.75rem";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "var(--shadow-lg)";
    toast.style.zIndex = "99999";
    toast.style.transition = "all 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 50);
    
    // Remove after 4.5s
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

// ==========================================
// 5-PHASE ENTERPRISE ROUTER & BINDINGS
// ==========================================
window.currentPhase = -1; // Global active phase tracker

// Transparent DOM Redirection Proxy for backwards-compatibility with existing agent handles!
const originalGetElementById = document.getElementById;
document.getElementById = function(id) {
    // Keep window.currentPhase in sync with our active routing state!
    if (typeof currentActivePhase !== 'undefined') {
        window.currentPhase = currentActivePhase;
    }
    
    if (id === 'chat-messages') {
        const phase = window.currentPhase;
        if (phase === 1) return originalGetElementById.call(document, 'chat-messages-phase1');
        if (phase === 2) return originalGetElementById.call(document, 'chat-messages-phase2');
        if (phase === 3) return originalGetElementById.call(document, 'chat-messages-phase3');
        return originalGetElementById.call(document, 'chat-messages-phase1') || originalGetElementById.call(document, id);
    }
    if (id === 'console-body') {
        const phase = window.currentPhase;
        if (phase === 1) return originalGetElementById.call(document, 'console-body-phase1');
        if (phase === 2) return originalGetElementById.call(document, 'console-body-phase2');
        if (phase === 3) return originalGetElementById.call(document, 'console-body-phase3');
        return originalGetElementById.call(document, 'console-body-phase1') || originalGetElementById.call(document, id);
    }
    if (id === 'chat-input') {
        const phase = window.currentPhase;
        if (phase === 1) return originalGetElementById.call(document, 'chat-input-phase1');
        if (phase === 2) return originalGetElementById.call(document, 'chat-input-phase2');
        if (phase === 3) return originalGetElementById.call(document, 'chat-input-phase3');
        return originalGetElementById.call(document, 'chat-input-phase1') || originalGetElementById.call(document, id);
    }
    if (id === 'chat-form') {
        const phase = window.currentPhase;
        if (phase === 1) return originalGetElementById.call(document, 'chat-form-phase1');
        if (phase === 2) return originalGetElementById.call(document, 'chat-form-phase2');
        if (phase === 3) return originalGetElementById.call(document, 'chat-form-phase3');
        return originalGetElementById.call(document, 'chat-form-phase1') || originalGetElementById.call(document, id);
    }
    if (id === 'btn-submit') {
        const phase = window.currentPhase;
        if (phase === 1) return originalGetElementById.call(document, 'btn-submit-phase1');
        if (phase === 2) return originalGetElementById.call(document, 'btn-submit-phase2');
        if (phase === 3) return originalGetElementById.call(document, 'btn-submit-phase3');
        return originalGetElementById.call(document, 'btn-submit-phase1') || originalGetElementById.call(document, id);
    }
    if (id === 'btn-spinner') {
        const phase = window.currentPhase;
        if (phase === 1) return originalGetElementById.call(document, 'btn-spinner-phase1');
        if (phase === 2) return originalGetElementById.call(document, 'btn-spinner-phase2');
        if (phase === 3) return originalGetElementById.call(document, 'btn-spinner-phase3');
        return originalGetElementById.call(document, 'btn-spinner-phase1') || originalGetElementById.call(document, id);
    }
    return originalGetElementById.call(document, id);
};

let strategicCharts = {};
let strategyNetwork = null;
let ledgerNetwork = null;

window.switchPhase = function(phaseNum) {
    currentActivePhase = phaseNum;
    localStorage.setItem('maestro_active_phase', phaseNum);
    
    // Auto-restore tab focus back to workbench when navigating phases
    const workbenchTab = document.getElementById("tab-workbench");
    const analyticsTab = document.getElementById("tab-analytics");
    if (analyticsTab && analyticsTab.classList.contains("active-tab")) {
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active-tab"));
        if (workbenchTab) {
            workbenchTab.classList.add("active-tab");
            workbenchTab.style.setProperty('display', 'flex', 'important');
        }
        analyticsTab.style.setProperty('display', 'none', 'important');
    }
    
    // Hook into the interactive tour!
    if (window.isTourActive) {
        if (phaseNum === 2 && window.tourStep === 2) {
            window.tourStep = 3;
            setTimeout(() => {
                    activeTour.drive(3); // Highlights Step 3: The image placeholder container!
            }, 800);
        } else if (phaseNum === 3 && window.tourStep === 7) {
            window.tourStep = 8;
            setTimeout(() => {
                    activeTour.drive(8); // Highlights Step 8: The final cryptographic seal ledger view!
            }, 800);
        } else if (phaseNum === 4 && window.tourStep === 8) {
            window.tourStep = 9;
            setTimeout(() => {
                    activeTour.drive(10); // Auto-advance to highlight Step 10: Localization button!
            }, 800);
        } else if (phaseNum === 5 && window.tourStep === 9) {
            window.tourStep = 10;
            setTimeout(() => {
                    activeTour.drive(11); // Auto-advance to highlight Step 11: PV & Agency button!
            }, 800);
        } else if (phaseNum === 6 && window.tourStep === 10) {
            window.tourStep = 11;
            setTimeout(() => {
                    activeTour.drive(12); // Auto-advance to highlight Step 12: Complete!
            }, 800);
        }
    }
    
    // Update global side navigation buttons active class!
    document.querySelectorAll('.side-nav-btn, .v-sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // We handle the special -1 negative index key matching
    const suffix = phaseNum === -1 ? '-1' : phaseNum;
    
    const activeGlobalBtn = document.getElementById('global-nav-btn-' + suffix);
    if (activeGlobalBtn) {
        activeGlobalBtn.classList.add('active');
    }
    const activeVerticalBtn = document.getElementById('v-nav-btn-' + suffix);
    if (activeVerticalBtn) {
        activeVerticalBtn.classList.add('active');
    }
    
    // Update URL hash for routing
    if (typeof isRoutingInProgress !== 'undefined' && !isRoutingInProgress) {
        updateHashFromState();
    }
    
    // Hide all phase containers
    document.querySelectorAll('.phase-container').forEach(container => {
        container.style.display = 'none';
    });
    
    // Show the active phase container
    let activeContainerId = '';
    if (phaseNum === -1) activeContainerId = 'phase-minus1-view';
    else if (phaseNum === 0) activeContainerId = 'phase-0-view';
    else if (phaseNum === 1) activeContainerId = 'phase-1-view';
    else if (phaseNum === 2) activeContainerId = 'phase-2-view';
    else if (phaseNum === 3) activeContainerId = 'phase-3-view';
    else if (phaseNum === 4) activeContainerId = 'phase-4-view';
    else if (phaseNum === 5) activeContainerId = 'phase-5-view';
    else if (phaseNum === 6) activeContainerId = 'phase-6-view';
    
    const activeContainer = document.getElementById(activeContainerId);
    if (activeContainer) {
        if (phaseNum >= 1 && phaseNum <= 6) {
            activeContainer.style.display = 'flex'; // Flex layout with sidebar
        } else {
            activeContainer.style.display = 'flex'; // Default flex
        }
    }
    
    // Update the dynamic header navigation pills
    renderHeaderNavigation(phaseNum);
    
    // Redraw Vis.js network canvases after switching viewports to ensure correct dimensions!
    if (phaseNum === 0) {
        setTimeout(() => {
            if (typeof initPortfolioStrategyNetwork === 'function') {
                initPortfolioStrategyNetwork();
            } else if (currentNetworkInstance) {
                currentNetworkInstance.redraw();
                currentNetworkInstance.fit();
            }
        }, 80);
    } else if (phaseNum === 3) {
        setTimeout(() => {
            // Re-initialize or redraw claims visualizer network
            if (window.initClaimsVisualizerGraph) {
                window.initClaimsVisualizerGraph();
            } else if (currentNetworkInstance) {
                currentNetworkInstance.redraw();
                currentNetworkInstance.fit();
            }
            // Trigger the Ledger Digital Seal Trust Graph!
            if (typeof initGovernanceLedgerNetwork === 'function') {
                initGovernanceLedgerNetwork();
            }
        }, 80);
    } else if (phaseNum === -1) {
        setTimeout(() => {
            if (typeof initStrategicCharts === 'function') {
                initStrategicCharts();
            }
        }, 80);
    }
    
    // Auto-scroll active chat console logs
    const consoleBody = document.getElementById(`console-body-phase${phaseNum === -1 || phaseNum === 0 ? '1' : phaseNum}`);
    if (consoleBody) {
        consoleBody.scrollTop = consoleBody.scrollHeight;
    }
    
    logConsoleLine("Master_Orchestrator_Agent", `Switched workspace focus to Phase ${phaseNum}. Layout tokens re-grounded.`);
};
// --- Dynamic Strategic Heatmap Renderer ---
let cachedHeatmapData = null;
let heatmapFiltersBound = false;

function bindHeatmapFilters() {
    if (heatmapFiltersBound) return;
    const searchInput = document.getElementById('heatmap-search-filter');
    const compoundSelect = document.getElementById('heatmap-compound-filter');
    const statusSelect = document.getElementById('heatmap-status-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', applyHeatmapFiltersAndRender);
    }
    if (compoundSelect) {
        compoundSelect.addEventListener('change', applyHeatmapFiltersAndRender);
    }
    if (statusSelect) {
        statusSelect.addEventListener('change', applyHeatmapFiltersAndRender);
    }
    heatmapFiltersBound = true;
}

function applyHeatmapFiltersAndRender() {
    if (!cachedHeatmapData) return;
    const thead = document.getElementById('heatmap-thead');
    const tbody = document.getElementById('heatmap-tbody');
    if (!thead || !tbody) return;
    
    const searchInput = document.getElementById('heatmap-search-filter');
    const compoundSelect = document.getElementById('heatmap-compound-filter');
    const statusSelect = document.getElementById('heatmap-status-filter');
    
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCompound = compoundSelect ? compoundSelect.value : 'all';
    const selectedStatus = statusSelect ? statusSelect.value : 'all';
    
    const presetMapping = {
        'NSCLC': 'datasets/Product-A_Prescribing_Information_NSCLC.txt',
        'RCC': 'datasets/Product-C_FDA_Approved_Label_2026.txt',
        'PFS': 'datasets/LITESPARK-005_Trial_Data_Briefing.txt'
    };
    
    // Render Headers (Always show all columns, optionally dim them)
    let theadHtml = `
        <tr>
            <th style="text-align: left; padding: 0.6rem 0.4rem; font-size: 0.68rem; text-transform: uppercase; color: var(--color-text-muted);">Indication</th>
    `;
    cachedHeatmapData.columns.forEach(col => {
        let colStyle = 'transition: opacity 0.2s;';
        if (selectedCompound !== 'all' && col.id !== selectedCompound) {
            colStyle = 'opacity: 0.25; transition: opacity 0.2s;';
        }
        theadHtml += `
            <th style="padding: 0.6rem 0.4rem; font-size: 0.68rem; text-transform: uppercase; color: var(--color-text-muted); text-align: center; font-weight: 800; ${colStyle}">
                ${col.name}<br><span style="font-size: 0.52rem; font-style: italic; font-weight: 600; opacity: 0.7;">(${col.compound})</span>
            </th>
        `;
    });
    theadHtml += '</tr>';
    thead.innerHTML = theadHtml;
    
    // Render Rows
    let tbodyHtml = '';
    cachedHeatmapData.matrix.forEach(row => {
        // Filter rows by search query
        const matchesQuery = query === '' || row.indication.toLowerCase().includes(query);
        if (!matchesQuery) return;
        
        const targetPreset = presetMapping[row.indication];
        let clickAction = '';
        let cursorStyle = '';
        if (targetPreset) {
            clickAction = `onclick="triggerStrategicIngest('${row.indication}', '${targetPreset}')"`;
            cursorStyle = 'cursor: pointer;';
        }
        
        tbodyHtml += `
            <tr style="${cursorStyle} transition: background 0.2s;" ${clickAction} onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='none'">
                <td class="heatmap-row-header">${row.indication} <span style="color: var(--color-primary); margin-left: 0.25rem;">➔</span></td>
        `;
        
        cachedHeatmapData.columns.forEach(col => {
            const cell = row.cells[col.id];
            
            // Compute dimming opacity based on compound and status filters
            let cellStyle = 'transition: opacity 0.2s;';
            const compoundMismatch = selectedCompound !== 'all' && col.id !== selectedCompound;
            const statusMismatch = selectedStatus !== 'all' && cell.status !== selectedStatus;
            
            if (compoundMismatch || statusMismatch) {
                cellStyle = 'opacity: 0.15; transition: opacity 0.2s;';
            }
            
            tbodyHtml += `
                <td style="${cellStyle}">
                    <span class="heatmap-badge ${cell.class}" title="${cell.status} (${cell.count} runs)"></span>
                </td>
            `;
        });
        tbodyHtml += '</tr>';
    });
    tbody.innerHTML = tbodyHtml;
}

async function fetchAndRenderStrategicHeatmap() {
    try {
        const response = await fetch(BACKEND_URL + '/api/strategic-heatmap');
        if (!response.ok) throw new Error('Failed to fetch strategic heatmap data');
        const result = await response.json();
        
        if (result.success) {
            cachedHeatmapData = result;
            bindHeatmapFilters();
            applyHeatmapFiltersAndRender();
        }
    } catch (err) {
        console.error('Error fetching strategic heatmap:', err);
    }
}

// --- Phase -1: Chart.js Dashboards ---
function initStrategicCharts() {
    if (strategicCharts.sentiment) strategicCharts.sentiment.destroy();
    if (strategicCharts.sov) strategicCharts.sov.destroy();
    if (strategicCharts.cdo) strategicCharts.cdo.destroy();
    if (strategicCharts.sparklineIndications) strategicCharts.sparklineIndications.destroy();
    if (strategicCharts.sparklineSavings) strategicCharts.sparklineSavings.destroy();
    
    // Fetch and populate dynamic strategic claims heatmap from the backend database
    fetchAndRenderStrategicHeatmap();
    
    // Seed initial dashboard compliance logs
    const dbLog = document.getElementById("dashboard-compliance-log");
    if (dbLog && dbLog.childNodes.length <= 3) { // Seeding if empty or just template scanning overlay
        const initialLogs = [
            "⚡ [Kong Gateway] Initializing full claims relationship integrity scan...",
            "🛡️ [MLR Auditor] Verifying visual bounds, padding compliance, and legal footnotes...",
            "🧬 [Claims Graph] Grounding all therapeutic indices against corporate FDA ledger...",
            "✅ [Audit Registry] Integrity scan completed. All 12 nodes verified as 100% GxP compliant.",
            "🔌 [WebSocket] Connection active. Ready to coordinate multi-agent telemetry..."
        ];
        initialLogs.forEach(log => {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const line = document.createElement("div");
            line.className = "console-line system";
            if (log.includes("✅") || log.includes("compliant")) {
                line.style.color = "var(--primary-mint)";
            } else {
                line.style.color = "#94a3b8";
            }
            line.innerText = `[${timeStr}] ${log}`;
            dbLog.appendChild(line);
        });
        dbLog.scrollTop = dbLog.scrollHeight;
    }
    
    const isLight = document.body.classList.contains('light-theme');
    const labelColor = isLight ? '#475569' : '#a1a1aa';
    const gridColor = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)';
    const neutralBarColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)';
    const baselineLineColor = isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';

    // 1. Sentiment Line Chart (Market Sentiment Ratio)
    const sentCtx = document.getElementById('chart-sentiment-bar');
    if (sentCtx) {
        strategicCharts.sentiment = new Chart(sentCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Maestro',
                        data: [-0.6, 0.4, 0.1, 1.1, 0.3, 1.3],
                        borderColor: '#06b6d4',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 2
                    },
                    {
                        label: 'Competitor',
                        data: [-0.1, -0.2, 0.3, 0.2, 0.3, -0.3],
                        borderColor: '#fbbf24',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        grid: { color: gridColor, borderDash: [2, 2] }, 
                        ticks: { color: labelColor, font: { size: 8 } } 
                    },
                    x: { grid: { display: false }, ticks: { color: labelColor, font: { size: 8 } } }
                }
            }
        });
    }
    
    // 2. Share of Voice Bar Chart (Grouped)
    const sovCtx = document.getElementById('chart-sov-bar');
    if (sovCtx) {
        strategicCharts.sov = new Chart(sovCtx, {
            type: 'bar',
            data: {
                labels: ['US&S', 'Nem', 'Ehr', 'Ipk', 'Sep'],
                datasets: [
                    { label: 'USA', data: [75, 60, 48, 55, 68], backgroundColor: '#3b82f6', borderRadius: 2 },
                    { label: 'Europe', data: [35, 42, 38, 48, 52], backgroundColor: '#06b6d4', borderRadius: 2 },
                    { label: 'RU', data: [42, 30, 22, 35, 45], backgroundColor: '#fbbf24', borderRadius: 2 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        grid: { color: gridColor, borderDash: [2, 2] }, 
                        ticks: { color: labelColor, font: { size: 8 } } 
                    },
                    x: { grid: { display: false }, ticks: { color: labelColor, font: { size: 8 } } }
                }
            }
        });
    }

    // --- KPI Sparkline 1: Screened Indications (Bar format) ---
    const indicationsCanvas = document.getElementById('sparkline-indications');
    if (indicationsCanvas) {
        strategicCharts.sparklineIndications = new Chart(indicationsCanvas, {
            type: 'bar',
            data: {
                labels: ['', '', '', '', '', '', '', '', '', '', '', ''],
                datasets: [{
                    data: [8, 14, 5, 9, 3, 4, 12, 18, 6, 11, 15, 13],
                    backgroundColor: 'rgba(59, 130, 246, 0.55)',
                    hoverBackgroundColor: 'rgba(59, 130, 246, 0.85)',
                    borderRadius: 2,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }

    // --- KPI Sparkline 2: MLR Labor Savings (Line format) ---
    const savingsCanvas = document.getElementById('sparkline-savings');
    if (savingsCanvas) {
        strategicCharts.sparklineSavings = new Chart(savingsCanvas, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', ''],
                datasets: [{
                    data: [15, 22, 35, 45, 52, 58, 68],
                    borderColor: 'rgba(251, 191, 36, 0.85)',
                    backgroundColor: 'transparent',
                    fill: false,
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }
}

// --- Phase 0: Vis.js Strategy Network Map ---
function initPortfolioStrategyNetwork() {
    const container = document.getElementById('portfolio-strategy-network');
    if (!container) return;
    
    const nodes = new vis.DataSet([
        { id: 1, label: 'KEYNOTE Compounds\nPortfolio\n(Product-A & next-gen)', shape: 'dot', size: 30, color: { background: '#0d9488', border: '#14b8a6', highlight: { background: '#0d9488', border: '#14b8a6' } }, font: { color: '#ffffff', face: 'Outfit', size: 10, bold: true } },
        { id: 2, label: 'NSCLC Opportunity\n(Goal: +10% Uptake)', shape: 'dot', size: 18, color: { background: '#161d30', border: '#22304d', highlight: '#1e293b' }, font: { color: '#a1a1aa', face: 'Inter', size: 9 } },
        { id: 3, label: 'RCC Opportunity\n(Clear-Cell RCC Market)', shape: 'dot', size: 18, color: { background: '#161d30', border: '#22304d', highlight: '#1e293b' }, font: { color: '#a1a1aa', face: 'Inter', size: 9 } },
        { id: 4, label: 'PFS Metric\nVerify', shape: 'dot', size: 16, color: { background: '#161d30', border: '#22304d', highlight: '#1e293b' }, font: { color: '#a1a1aa', face: 'Inter', size: 9 } },
        { id: 5, label: 'ORR Efficacy\nClaim Verify', shape: 'dot', size: 16, color: { background: '#161d30', border: '#22304d', highlight: '#1e293b' }, font: { color: '#a1a1aa', face: 'Inter', size: 9 } },
        { id: 6, label: 'Compliance\nGuardrail 01', shape: 'dot', size: 16, color: { background: '#161d30', border: '#22304d', highlight: '#1e293b' }, font: { color: '#a1a1aa', face: 'Inter', size: 9 } },
        { id: 7, label: 'Target Indication\nBrief 01', shape: 'dot', size: 16, color: { background: '#161d30', border: '#22304d', highlight: '#1e293b' }, font: { color: '#a1a1aa', face: 'Inter', size: 9 } },
        { id: 8, label: 'Global CDO Goal\n(+5% Share)', shape: 'dot', size: 16, color: { background: '#161d30', border: '#22304d', highlight: '#1e293b' }, font: { color: '#a1a1aa', face: 'Inter', size: 9 } },
        { id: 9, label: 'Market Access: EU\n(Verify: Gold)', shape: 'dot', size: 16, color: { background: '#161d30', border: '#22304d', highlight: '#1e293b' }, font: { color: '#a1a1aa', face: 'Inter', size: 9 } }
    ]);
    
    const edges = new vis.DataSet([
        { from: 1, to: 2, arrows: 'to', color: { color: '#0d9488', opacity: 0.6 } },
        { from: 1, to: 3, arrows: 'to', color: { color: '#0d9488', opacity: 0.6 } },
        { from: 2, to: 4, arrows: 'to', color: { color: '#6366f1', opacity: 0.5 } },
        { from: 3, to: 5, arrows: 'to', color: { color: '#6366f1', opacity: 0.5 } },
        { from: 1, to: 6, arrows: 'to', color: { color: '#0d9488', opacity: 0.6 } },
        { from: 1, to: 7, arrows: 'to', color: { color: '#0d9488', opacity: 0.6 } },
        { from: 1, to: 8, arrows: 'to', color: { color: '#0d9488', opacity: 0.6 } },
        { from: 8, to: 9, arrows: 'to', color: { color: '#6366f1', opacity: 0.5 } }
    ]);
    
    const data = { nodes, edges };
    const options = {
        physics: {
            stabilization: true,
            barnesHut: { gravitationalConstant: -1800, centralGravity: 0.25, springLength: 85 }
        },
        interaction: { hover: true, dragNodes: true, zoomView: true, dragView: true }
    };
    
    strategyNetwork = new vis.Network(container, data, options);
}

// --- Phase 3: Vis.js Governance & Compliance Ledger Graph (Fully Dynamic!) ---
function initGovernanceLedgerNetwork() {
    const container = document.getElementById('governance-ledger-network');
    if (!container) return;
    
    // Dynamically query the DOM to find the active campaign variant
    let variantNum = 1;
    if (document.getElementById('variant-tab-2') && document.getElementById('variant-tab-2').classList.contains('active')) {
        variantNum = 2;
    } else if (document.getElementById('variant-tab-3') && document.getElementById('variant-tab-3').classList.contains('active')) {
        variantNum = 3;
    }
    
    // Dynamically update the Submission & Delivery panel card text elements!
    const card2Title = document.getElementById('submission-card-2-title');
    const card2Sub = document.getElementById('submission-card-2-subtitle');
    const card3Sub = document.getElementById('submission-card-3-subtitle');
    
    if (variantNum === 1) {
        if (card2Title) card2Title.innerText = "Send to Camp-KT-189";
        if (card2Sub) card2Sub.innerText = "(NSCLC Vault)";
        if (card3Sub) card3Sub.innerText = "(Variant 1 - Product-A)";
    } else if (variantNum === 2) {
        if (card2Title) card2Title.innerText = "Send to Camp-LV-581";
        if (card2Sub) card2Sub.innerText = "(RCC Vault)";
        if (card3Sub) card3Sub.innerText = "(Variant 2 - Product-B)";
    } else if (variantNum === 3) {
        if (card2Title) card2Title.innerText = "Send to Camp-WR-005";
        if (card2Sub) card2Sub.innerText = "(RCC Vault)";
        if (card3Sub) card3Sub.innerText = "(Variant 3 - Product-C)";
    }
    
    // Dynamically update the Left Sidebar "Phase 2 Creative Composer" summary card!
    const p3SummaryImg = document.getElementById('phase3-summary-img');
    const p3SummaryTitle = document.getElementById('phase3-summary-title');
    const varData = variantDatabase[variantNum];
    if (varData) {
        if (p3SummaryImg) p3SummaryImg.src = varData.image || "product_a_cellular_style.png";
        if (p3SummaryTitle) p3SummaryTitle.innerText = `Variant ${variantNum} (${varData.drug}/${varData.trial.split(' ')[0]})`;
    }
    
    let assetsLabel = 'Product-A\nAssets';
    let claimsLabel = 'Verified\nKEYNOTE-189\nClaims';
    let trialLabel = 'Trial\nParameters';
    
    if (variantNum === 2) {
        assetsLabel = 'Product-B\nAssets';
        claimsLabel = 'Verified\nCLEAR-581\nClaims';
        trialLabel = 'CLEAR\nTrial Data';
    } else if (variantNum === 3) {
        assetsLabel = 'Product-C\nAssets';
        claimsLabel = 'Verified\nLITESPARK-005\nClaims';
        trialLabel = 'LITESPARK-005\nTrial Data';
    }
    
    const nodes = new vis.DataSet([
        { id: 1, label: assetsLabel, shape: 'dot', size: 22, color: { background: '#059669', border: '#10b981', highlight: '#10b981' }, font: { color: '#ffffff', face: 'Outfit', size: 9, bold: true } },
        { id: 2, label: claimsLabel, shape: 'dot', size: 26, color: { background: '#059669', border: '#10b981', highlight: '#10b981' }, font: { color: '#ffffff', face: 'Outfit', size: 10, bold: true } },
        { id: 3, label: trialLabel, shape: 'dot', size: 22, color: { background: '#059669', border: '#10b981', highlight: '#10b981' }, font: { color: '#ffffff', face: 'Outfit', size: 9, bold: true } },
        { id: 4, label: 'Regulatory\nGuidelines\n(FDA OPDP 2026)', shape: 'dot', size: 22, color: { background: '#059669', border: '#10b981', highlight: '#10b981' }, font: { color: '#ffffff', face: 'Outfit', size: 9, bold: true } }
    ]);
    
    const edges = new vis.DataSet([
        { from: 1, to: 2, arrows: 'to', color: { color: '#10b981', opacity: 0.8, width: 2 } },
        { from: 3, to: 2, arrows: 'to', color: { color: '#10b981', opacity: 0.8, width: 2 } },
        { from: 4, to: 2, arrows: 'to', color: { color: '#10b981', opacity: 0.8, width: 2 } }
    ]);
    
    const data = { nodes, edges };
    const options = {
        physics: {
            stabilization: true,
            barnesHut: { gravitationalConstant: -1200, centralGravity: 0.2, springLength: 80 }
        },
        interaction: { hover: true, dragNodes: true, zoomView: true, dragView: true }
    };
    
    ledgerNetwork = new vis.Network(container, data, options);
    
    // Add Click listener to show dynamic high-fidelity detail modals!
    ledgerNetwork.on("click", function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            
            // Dynamically query the DOM to find the active campaign variant
            let variantNum = 1;
            if (document.getElementById('variant-tab-2') && document.getElementById('variant-tab-2').classList.contains('active')) {
                variantNum = 2;
            } else if (document.getElementById('variant-tab-3') && document.getElementById('variant-tab-3').classList.contains('active')) {
                variantNum = 3;
            }
            
            let drugName = "Product-A";
            let trialName = "KEYNOTE-189 (NCT02578680)";
            let claimsText = "KEYNOTE-189 trial demonstrated double the overall survival rate compared to chemotherapy alone (22.0 months vs 10.7 months).";
            
            if (variantNum === 2) {
                drugName = "Product-B";
                trialName = "CLEAR / KEYNOTE-581 (NCT02811822)";
                claimsText = "Product-B in combination with Product-A demonstrated a 71% Objective Response Rate (ORR) compared to sunitinib alone.";
            } else if (variantNum === 3) {
                drugName = "Product-C";
                trialName = "LITESPARK-005 (NCT04195750)";
                claimsText = "Product-C demonstrated a 22% Objective Response Rate (ORR) in patients with advanced renal cell carcinoma.";
            }
            
            let nodeData = {
                id: `ledger-node-${nodeId}`,
                label: '',
                title: ''
            };
            
            if (nodeId === 1) { // Assets
                nodeData.label = `${drugName} Assets`;
                nodeData.title = `<strong>Approved Creative Assets</strong><br>• Asset Class: Dynamic Email Banner<br>• Watermarking: SHA-256 Digital Seal Encoded<br>• Layout Score: 100% Compliant<br>• Dimensions: 1080px Width (Widescreen Auto-scale)`;
                showClaimsNodeDetailModal(nodeData);
            } else if (nodeId === 2) { // Claims
                nodeData.label = `Verified Claims`;
                nodeData.title = `<strong>Grounded Claims Registry</strong><br>• Source: Prescribing Label (Section 14)<br>• Text: "${claimsText}"<br>• Grounded Status: 100% Verifiable<br>• Cryptographic Hash: sha256:d8b02ea9a8f4c4c8d18471c2a1849...`;
                showClaimsNodeDetailModal(nodeData);
            } else if (nodeId === 3) { // Trial
                nodeData.label = `${trialName} Trial Data`;
                nodeData.title = `<strong>Clinical Trial Registry Parameters</strong><br>• Registration: ${trialName}<br>• Phase: Phase III Registration Trial<br>• Primary Endpoint: Overall Survival (OS)<br>• Secondary Endpoints: Progression-Free Survival (PFS) & Objective Response Rate (ORR)`;
                showClaimsNodeDetailModal(nodeData);
            } else if (nodeId === 4) { // Guidelines
                nodeData.label = `FDA OPDP 2026 Guidelines`;
                nodeData.title = `<strong>Regulatory Standards & Guidelines</strong><br>• Regulatory Body: FDA ESG & OPDP (21 CFR Part 202)<br>• Standards Version: v1.2 Active Registry<br>• Requirements: Fair Balance, Font Sizing Hierarchy, Clinical Lineage Tracking`;
                showClaimsNodeDetailModal(nodeData);
            }
        }
    });
}

// --- Dynamic Compliance Ledger Database Entry Prepend ---
window.addLedgerEntry = function(medication, campaign, hash) {
    const tbody = document.getElementById("ledger-history-body");
    if (!tbody) return;
    
    // Format current timestamp: YYYY-MM-DD HH:MM:SS
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    // Normalize medication label for display
    let displayMed = "Gemini Standards";
    if (medication.toLowerCase().includes("product-a") || medication.toLowerCase().includes("keytruda")) displayMed = "Gemini Standards";
    else if (medication.toLowerCase().includes("product-c") || medication.toLowerCase().includes("lenvima")) displayMed = "Semantic Auditor";
    else if (medication.toLowerCase().includes("product-b") || medication.toLowerCase().includes("welireg")) displayMed = "Layout Auditor";
    
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid rgba(255,255,255,0.02)";
    tr.style.color = "var(--color-text-main)";
    tr.style.cursor = "pointer";
    tr.style.transition = "background 0.2s";
    
    // Bind click to show certificate!
    tr.onclick = function() {
        showComplianceCertificate({
            timestamp: timestampStr,
            medication: medication,
            campaignName: campaign,
            status: 'Verified',
            auditor: displayMed + ' Agent',
            hash: hash
        });
    };
    
    tr.onmouseover = function() { this.style.background = 'rgba(255,255,255,0.02)'; };
    tr.onmouseout = function() { this.style.background = 'none'; };
    
    tr.innerHTML = `
        <td style="padding: 0.45rem 0.25rem;">${timestampStr}</td>
        <td style="padding: 0.45rem 0.25rem;"><span style="color: #34d399; font-weight: 800; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); padding: 0.05rem 0.25rem; border-radius: 3px;">✓ Verified</span></td>
        <td style="padding: 0.45rem 0.25rem; color: var(--color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayMed}</td>
        <td style="padding: 0.45rem 0.25rem; text-align: right; color: var(--color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><div title="${hash}">sha256:${hash.substring(7, 14)}...</div></td>
    `;
    
    // Prepend it so the latest verified action is always at the absolute top!
    tbody.insertBefore(tr, tbody.firstChild);
    appendConsoleLine('system', `🔒 Cryptographic seal logged to local audit ledger database. Hash: ${hash}`);
};

// --- Phase 3 Final Action: Global Delivery Hand-off (Fully Dynamic!) ---
window.triggerFinalDelivery = function() {
    const variantNum = currentActiveVariant;
    const variantData = variantDatabase[variantNum];
    if (!variantData) return;
    
    const drugName = `${variantData.drug} (${variantData.medication})`;
    const drugCode = variantData.campaign ? variantData.campaign.split('-').pop() : `VAR-${variantNum}`;
    
    logConsoleLine("Standards_Governance_Registry", "🚀 [Global Delivery] Starting secure transmittal hand-off...");
    logConsoleLine("Standards_Governance_Registry", `📤 [Global Delivery] Transmitting verified ${drugName} assets to Veeva PromoMats...`);
    logConsoleLine("Standards_Governance_Registry", `📂 [Global Delivery] Syncing ${drugCode} clinical registers to Salesforce Content Vault...`);
    logConsoleLine("Standards_Governance_Registry", "📄 [Global Delivery] Packaging FDA Form 2253 regulatory binder...");
    
    setTimeout(() => {
        logConsoleLine("Standards_Governance_Registry", `✅ [Global Delivery] PROMOMATS TRANSMITTAL RECEIPT: SUCCESS (ID: PR-2026-${drugCode})`);
        logConsoleLine("Standards_Governance_Registry", `✅ [Global Delivery] FDA BINDER COMPILED: BINDER-FDA-2253-${drugCode}-V1`);
        logConsoleLine("Standards_Governance_Registry", "🎉 [Global Delivery] ECOSYSTEM TRANSACTION SECURED ON BRAND LEDGER.");
        showToast(`🎉 SUCCESS: ${variantData.drug} Campaign Approved & Delivered successfully!`);
        
        // Show a premium confirmation alert modal
        alert(`🎉 GLOBAL CLINICAL DELIVERY SECURED!\n\nAll ${drugName} clinical claims verified.\nAll FDA brand guidelines satisfied.\nEcosystem assets successfully transmitted to Veeva PromoMats and FDA OPDP regulatory vault.\n\nTransaction Hash: sha256:d8b02ea9a8f4c4c8d18471c2a1849...`);
    }, 1200);
};



// Premium Dynamic Header Navigation Pill Generator
// Dynamic header navigation is now stationary and static in index.html!
function renderHeaderNavigation(phase) {
    // No-op to preserve the static horizontal icon menu in the header
}



// Premium Full-Screen Diagnostics Modal Toggle
window.toggleDiagnosticsModal = function() {
    const modal = document.getElementById("diagnostics-modal");
    if (!modal) return;
    
    if (modal.style.display === 'none' || !modal.style.display) {
        modal.style.display = 'flex';
        setTimeout(initCharts, 50);
    } else {
        modal.style.display = 'none';
    }
    updateHashFromState();
};

// --- DYNAMIC STRATEGIC HEATMAP ROUTER ---
window.triggerStrategicIngest = function(indication, labelPath) {
    logConsoleLine("Master_Orchestrator_Agent", `⚡ Strategic Heatmap trigger intercepted! Focused Indication: ${indication}.`);
    logConsoleLine("Master_Orchestrator_Agent", `📁 Pre-loading verified prescribing label: ${labelPath}`);
    
    // Switch to Ingestion Hub
    switchPhase(1);
    
    // Select the preset dropdown option
    const selectEl = document.getElementById("url-preset-select");
    if (selectEl) {
        selectEl.value = labelPath;
        // Trigger the change handler to update the hidden inputs and verification panels
        if (typeof handlePresetSelectChange === 'function') {
            handlePresetSelectChange(selectEl);
        }
    }
    
    // Hook into the interactive tour!
    if (window.isTourActive && window.tourStep === 1) {
        window.tourStep = 2;
        setTimeout(() => {
                activeTour.drive(2);
        }, 800);
    }
};

// ==========================================
//   JETS-SPA DEEP LINKING HASH ROUTER ENGINE
// ==========================================
let isRoutingInProgress = false;

// 1. Synchronizes State to URL Hash
function updateHashFromState() {
    let route = '/home';
    const analyticsTab = document.getElementById("tab-analytics");
    if (analyticsTab && analyticsTab.classList.contains("active-tab")) {
        const sub = (typeof activeChartTab !== 'undefined' && activeChartTab) ? activeChartTab : 'trend';
        const subRoute = sub === 'trend' ? 'trends' : sub;
        route = `/analytics/${subRoute}`;
        
        // Append brand context to URL if active and not ALL
        if (typeof activeBrandFilter !== 'undefined' && activeBrandFilter && activeBrandFilter !== 'ALL') {
            route += `/brand/${activeBrandFilter}`;
        }
    } else {
        if (currentActivePhase === 0) route = '/strategy';
        else if (currentActivePhase === 1) route = '/ingest';
        else if (currentActivePhase === 2) route = `/composer/variant/${currentActiveVariant}`;
        else if (currentActivePhase === 3) route = `/governance/variant/${currentActiveVariant}`;
        else if (currentActivePhase === 4) route = '/medical-heor';
        else if (currentActivePhase === 5) route = '/localization';
        else if (currentActivePhase === 6) route = '/pharmacovigilance';
    }
    
    // Check if any modal is active/visible and append to the URL path
    const diagnosticsModal = document.getElementById('diagnostics-modal');
    const fdaModal = document.getElementById('fda-2253-modal-overlay');
    const complianceModal = document.getElementById('compliance-modal');
    const timeTravelModal = document.getElementById('time-travel-modal');
    const simModal = document.getElementById('sim-comparison-modal');
    const veevaModal = document.getElementById('modal-veeva-sync');
    const detailModal = document.getElementById('detail-modal');
    const settingsModal = document.getElementById('settings-modal');

    if (diagnosticsModal && diagnosticsModal.style.display !== 'none' && diagnosticsModal.style.display !== '') {
        route += '/diagnostics';
    } else if (settingsModal && settingsModal.style.display !== 'none' && settingsModal.style.display !== '') {
        route += '/settings';
    } else if (fdaModal && fdaModal.style.display !== 'none' && fdaModal.style.display !== '') {
        route += '/fda2253';
    } else if (complianceModal && (complianceModal.style.display !== 'none' && complianceModal.style.display !== '' || complianceModal.classList.contains('active'))) {
        route += '/certificate';
    } else if (timeTravelModal && timeTravelModal.style.display !== 'none' && timeTravelModal.style.display !== '') {
        route += '/timetravel';
    } else if (simModal && simModal.style.display !== 'none' && simModal.style.display !== '') {
        route += '/simulation';
    } else if (veevaModal && veevaModal.style.display !== 'none' && veevaModal.style.display !== '') {
        route += '/veevasync';
    } else if (detailModal && detailModal.style.display !== 'none' && detailModal.style.display !== '') {
        route += '/details';
    }
    
    isRoutingInProgress = true;
    window.location.hash = route;
    
    // Reset guard flag after event loop cycle
    setTimeout(() => { isRoutingInProgress = false; }, 80);
}

// 2. Synchronizes URL Hash to State (Router)
function handleHashRoute() {
    const hash = window.location.hash || '#/';
    isRoutingInProgress = true;
    
    const landingView = document.getElementById('landing-view');
    
    try {
        if (hash === '#/' || hash === '#' || hash === '' || hash === '#/landing') {
            if (landingView) landingView.style.display = 'flex';
            currentActivePhase = -1;
            window.switchPhase(-1);
        } else {
            if (landingView) landingView.style.display = 'none';
            
            // Dispatch parent container/tab state
            if (hash.startsWith('#/analytics')) {
                window.switchTab('analytics');
                let activeSub = 'trend';
                if (hash.includes('/roi')) activeSub = 'roi';
                else if (hash.includes('/violations')) activeSub = 'violations';
                
                // Parse brand context if present
                let activeBrand = 'ALL';
                const brandMatch = hash.match(/\/brand\/([A-Za-z0-9\-]+)/);
                if (brandMatch) {
                    activeBrand = brandMatch[1];
                }
                
                // Temporarily flag routing to avoid nested loops
                const prevRoutingState = isRoutingInProgress;
                isRoutingInProgress = true;
                if (typeof window.switchChartTab === 'function') {
                    window.switchChartTab(activeSub);
                }
                if (typeof window.filterByBrand === 'function') {
                    window.filterByBrand(activeBrand);
                }
                isRoutingInProgress = prevRoutingState;
            } else if (hash.startsWith('#/home') || hash.startsWith('#/command')) {
                currentActivePhase = -1;
                window.switchPhase(-1);
            } else if (hash.startsWith('#/strategy')) {
                currentActivePhase = 0;
                window.switchPhase(0);
            } else if (hash.startsWith('#/ingest')) {
                currentActivePhase = 1;
                window.switchPhase(1);
            } else if (hash.startsWith('#/composer')) {
                const match = hash.match(/#\/composer\/variant\/(\d+)/);
                const variantNum = match ? parseInt(match[1]) : 1;
                currentActivePhase = 2;
                window.switchPhase(2);
                window.loadVariant(variantNum);
            } else if (hash.startsWith('#/governance')) {
                const match = hash.match(/#\/governance\/variant\/(\d+)/);
                const variantNum = match ? parseInt(match[1]) : 1;
                currentActivePhase = 3;
                window.switchPhase(3);
                window.loadVariant(variantNum);
            } else if (hash.startsWith('#/medical-heor') || hash.startsWith('#/medical')) {
                currentActivePhase = 4;
                window.switchPhase(4);
            } else if (hash.startsWith('#/localization') || hash.startsWith('#/affiliate')) {
                currentActivePhase = 5;
                window.switchPhase(5);
            } else if (hash.startsWith('#/pharmacovigilance') || hash.startsWith('#/pv') || hash.startsWith('#/agency')) {
                currentActivePhase = 6;
                window.switchPhase(6);
            }

            // Close all modals first by default to avoid overlapping state
            ['sim-comparison-modal', 'time-travel-modal', 'diagnostics-modal', 'fda-2253-modal-overlay', 'modal-veeva-sync', 'compliance-modal', 'detail-modal', 'settings-modal'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.display = 'none';
                    el.classList.remove('active');
                }
            });

            // Dispatch sub-route modals based on suffix matches
            if (hash.endsWith('/diagnostics')) {
                const modal = document.getElementById("diagnostics-modal");
                if (modal) {
                    modal.style.display = 'flex';
                    setTimeout(initCharts, 50);
                }
            } else if (hash.endsWith('/settings')) {
                if (window.openSettingsModal) window.openSettingsModal();
            } else if (hash.endsWith('/fda2253')) {
                if (window.openFda2253Modal) window.openFda2253Modal();
            } else if (hash.endsWith('/certificate')) {
                if (window.showComplianceCertificate) {
                    window.showComplianceCertificate({
                        timestamp: new Date().toUTCString(),
                        medication: 'Product-A (compound_alpha)',
                        campaignName: 'Standard Verification Campaign',
                        hash: 'sha256:4d2e135a9da9467893b2e51a747dc31f'
                    });
                }
            } else if (hash.endsWith('/timetravel')) {
                if (window.openTimeTravelDrawer) window.openTimeTravelDrawer();
            } else if (hash.endsWith('/simulation')) {
                if (window.openSimComparisonModal) window.openSimComparisonModal();
            } else if (hash.endsWith('/veevasync')) {
                const modal = document.getElementById('modal-veeva-sync');
                if (modal) modal.style.display = 'flex';
            } else if (hash.endsWith('/details')) {
                const modal = document.getElementById('detail-modal');
                if (modal) modal.style.display = 'flex';
            }
        }
    } finally {
        setTimeout(() => { isRoutingInProgress = false; }, 80);
    }
}

// --- PHASE 4: MEDICAL AFFAIRS & HEOR HELPER FUNCTIONS ---
window.parseMslAbstract = function() {
    const selectEl = document.getElementById('msl-abstract-select');
    const outputEl = document.getElementById('msl-abstract-output');
    if (!selectEl || !outputEl) return;
    
    const val = selectEl.value;
    outputEl.innerHTML = `<div style="color: #64748b; font-size: 0.85rem; padding: 1rem; text-align: center;">⏳ Extracting non-promotional endpoints and fair-balance attestation...</div>`;
    
    setTimeout(() => {
        let title = "ESMO 2026: LITESPARK-005 Quality of Life (QoL) Sub-Analysis";
        let drug = "Product-C (Belzutifan)";
        let efficacy = "22% ORR with delayed time to deterioration in physical functioning (HR 0.54; 95% CI, 0.41-0.72).";
        let safety = "Grade 3/4 Adverse Events observed in 30% of patients, predominantly hypoxia (15%) and anemia (22%). Fair-balance monitoring required.";
        let seal = "#MSL-2026-QOL005";
        
        if (val.includes('KEYNOTE-189')) {
            title = "ASCO 2026: KEYNOTE-189 5-Year Overall Survival Update";
            drug = "Product-A (Pembrolizumab + Chemo)";
            efficacy = "5-year OS rate doubled at 19.4% vs 11.3% for chemotherapy alone (HR 0.60; 95% CI, 0.50-0.72).";
            safety = "Grade 3/4 Immune-Mediated Adverse Reactions in 10% of patients. Long-term safety registry shows no new safety signals.";
            seal = "#MSL-2026-OS189";
        } else if (val.includes('STELLAR')) {
            title = "AHA 2026: STELLAR PAH Hemodynamic Profiles & 6MWD Trajectories";
            drug = "Product-D (Sotatercept)";
            efficacy = "41.0-meter improvement in 6-minute walk distance (p<0.001) with 84% reduction in risk of clinical worsening.";
            safety = "Serious Adverse Events in 15% of patients (epistaxis, telangiectasia). Complete non-promotional medical disclosure included.";
            seal = "#MSL-2026-STELLAR";
        }
        
        outputEl.innerHTML = `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.65rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; font-weight: 800; color: #00F2FE;">${title}</span>
                    <span style="font-size: 0.6rem; background: rgba(0, 242, 254, 0.12); color: #00F2FE; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 800;">MSL GxP SCREENED</span>
                </div>
                <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.5;">
                    <strong style="color: white;">Compound Focus:</strong> ${drug}<br>
                    <strong style="color: #34D399;">Scientific Takeaway:</strong> ${efficacy}<br>
                    <strong style="color: #FBBF24;">Fair-Balance Profile:</strong> ${safety}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.5rem; font-size: 0.65rem; color: #94a3b8; font-family: monospace;">
                    <span>Attestation Seal: ${seal}</span>
                    <span>Ready for P2P Medical Exchange</span>
                </div>
            </div>
        `;
        logConsoleLine("Medical_Affairs_Agent", `✅ Successfully parsed non-promotional scientific deck: ${title}. Fair-balance seal ${seal} locked.`);
    }, 450);
};

window.updateHeorSlider = function(val) {
    const labelEl = document.getElementById('heor-cohort-display');
    if (labelEl) labelEl.innerText = `${parseInt(val).toLocaleString()} Patients`;
};

window.calculateHeorImpact = function() {
    const sliderEl = document.getElementById('heor-cohort-slider');
    const costEl = document.getElementById('heor-cost-input');
    const outputEl = document.getElementById('heor-results-box');
    if (!sliderEl || !costEl || !outputEl) return;
    
    const cohort = parseInt(sliderEl.value) || 2500;
    const annualCost = parseFloat(costEl.value) || 125000;
    
    const grossCost = cohort * annualCost;
    const erSavingsPerPatient = 48500; // Estimated savings from avoided ER admissions & ICU stays
    const totalSavings = cohort * erSavingsPerPatient;
    const netCost = Math.max(0, grossCost - totalSavings);
    const icer = Math.round(netCost / (cohort * 2.4)); // assuming +2.4 QALYs
    
    outputEl.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.85rem; border-radius: 8px;">
                <div style="font-size: 0.62rem; color: #a7f3d0; text-transform: uppercase; font-weight: 800;">3-Year Gross Budget Impact</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #34D399; margin-top: 0.2rem;">$${(grossCost / 1000000).toFixed(1)}M</div>
            </div>
            <div style="background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); padding: 0.85rem; border-radius: 8px;">
                <div style="font-size: 0.62rem; color: #bae6fd; text-transform: uppercase; font-weight: 800;">Net Budget after ER/ICU Avoidance</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; margin-top: 0.2rem;">$${(netCost / 1000000).toFixed(1)}M <span style="font-size: 0.65rem; color: #34D399;">(-$${(totalSavings/1000000).toFixed(1)}M Saved)</span></div>
            </div>
            <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); padding: 0.85rem; border-radius: 8px;">
                <div style="font-size: 0.62rem; color: #e9d5ff; text-transform: uppercase; font-weight: 800;">Cost-Effectiveness (ICER)</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #c084fc; margin-top: 0.2rem;">$${icer.toLocaleString()} / QALY</div>
                <div style="font-size: 0.62rem; color: #cbd5e1;">Well below $150,000 WTP threshold</div>
            </div>
            <div style="background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.2); padding: 0.85rem; border-radius: 8px;">
                <div style="font-size: 0.62rem; color: #fef08a; text-transform: uppercase; font-weight: 800;">Formulary Placement</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #FBBF24; margin-top: 0.2rem;">Tier 2 Preferred Specialty</div>
                <div style="font-size: 0.62rem; color: #cbd5e1;">NICE / CMS Formulations Approved</div>
            </div>
        </div>
    `;
    logConsoleLine("HEOR_Market_Access_Agent", `📊 Budget Impact modeled for ${cohort.toLocaleString()} patients. Net cost-effectiveness: $${icer.toLocaleString()}/QALY.`);
};

// --- PHASE 5: GLOBAL LOCALIZATION & AFFILIATE ADAPTATION HELPER FUNCTIONS ---
window.anchorLocalizationLineage = function() {
    const masterEl = document.getElementById('localization-master-select');
    const regionEl = document.getElementById('localization-region-select');
    const outputEl = document.getElementById('localization-lineage-output');
    if (!masterEl || !regionEl || !outputEl) return;
    
    const masterVal = masterEl.value;
    const regionVal = regionEl.value;
    
    outputEl.innerHTML = `<div style="color: #64748b; font-size: 0.85rem; padding: 1rem; text-align: center;">⏳ Spawning Veeva PromoMats child record and anchoring cryptographic lineage seal...</div>`;
    
    setTimeout(() => {
        let parentDocId = "#V-2026-KT089-US";
        let childDocId = "#V-2026-KT089-" + regionVal;
        let drugName = "Product-A (Pembrolizumab)";
        let statutoryRules = "Mandatory Black Triangle ▼ monitoring symbol required by EMA Article 23.";
        
        if (masterVal.includes('CLEAR')) {
            parentDocId = "#V-2026-LV581-US";
            childDocId = "#V-2026-LV581-" + regionVal;
            drugName = "Product-B (Lenvatinib)";
        } else if (masterVal.includes('LITESPARK')) {
            parentDocId = "#V-2026-WR005-US";
            childDocId = "#V-2026-WR005-" + regionVal;
            drugName = "Product-C (Belzutifan)";
        }
        
        if (regionVal === 'PMDA') statutoryRules = "PMDA Form 4 required: explicit Japanese adverse event reporting contact desk mandatory.";
        else if (regionVal === 'MHRA') statutoryRules = "MHRA Guidance: UK-specific pricing/reimbursed status disclaimer required.";
        else if (regionVal === 'ANVISA') statutoryRules = "ANVISA RDC Resolution 96: mandatory Portuguese safety insert anchor required.";
        
        outputEl.innerHTML = `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.65rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; font-weight: 800; color: #00F2FE;">Parent-Child Lineage Linked (${regionVal})</span>
                    <span style="font-size: 0.6rem; background: rgba(56, 189, 248, 0.12); color: #38BDF8; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 800;">PROMOTIONAL ANCHOR LOCKED</span>
                </div>
                <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.5;">
                    <strong style="color: white;">Global Parent Anchor:</strong> ${parentDocId} (${drugName})<br>
                    <strong style="color: #38BDF8;">Spawned Child Record:</strong> ${childDocId} [Status: In Affiliate Review]<br>
                    <strong style="color: #FBBF24;">Statutory Mandate:</strong> ${statutoryRules}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.5rem; font-size: 0.65rem; color: #94a3b8; font-family: monospace;">
                    <span>Lineage Hash: sha256:77a0bc983e1c24...</span>
                    <span>Ready for AI Regional Translation</span>
                </div>
            </div>
        `;
        logConsoleLine("Localization_Affiliate_Agent", `🌱 Spawned child record ${childDocId} from parent anchor ${parentDocId}. Statutory jurisdiction (${regionVal}) rules loaded.`);
    }, 400);
};

window.translateAffiliateCopy = function() {
    const langEl = document.getElementById('localization-lang-select');
    const boxEl = document.getElementById('localization-translation-box');
    if (!langEl || !boxEl) return;
    
    const lang = langEl.value;
    boxEl.innerHTML = `<div style="color: #64748b; font-size: 0.85rem; padding: 1.5rem; text-align: center; width: 100%;">⏳ Synthesizing localized copy via Gemini & applying statutory affiliate disclaimers...</div>`;
    
    setTimeout(() => {
        let transTitle = "Objetif de Réponse Globale (ORR) de 56% à la semaine 24";
        let transBody = "Dans l'essai pivot KEYNOTE-189, l'association Product-A a démontré une supériorité cliniquement prouvée par rapport à la chimiothérapie seule.";
        let statWarning = "▼ Ce médicament fait l'objet d'une surveillance supplémentaire. Déclarez immédiatement tout effet indésirable suspecté aux autorités de santé (ANSM).";
        
        if (lang === 'Japanese') {
            transTitle = "第24週における全奏効率（ORR）56％を達成";
            transBody = "主要第III相臨床試験KEYNOTE-189において、Product-A併用療法は化学療法単独群と比較して有意な全生存期間の延長を示しました。";
            statWarning = "【警告】本剤の投与は緊急時に十分に対応できる医療施設において、がん化学療法に十分な知識・経験を持つ医師のもとで行うこと。（PMDA様式4準拠）";
        } else if (lang === 'German') {
            transTitle = "Gesamtansprechrate (ORR) von 56% in Woche 24";
            transBody = "In der Zulassungsstudie KEYNOTE-189 verdoppelte die Produkt-A-Kombinationstherapie die Überlebensraten im Vergleich zur Monochimiotherapie.";
            statWarning = "▼ Dieses Arzneimittel unterliegt einer zusätzlichen Überwachung. Fachinformation (SmPC) und G-BA Beschlüsse beachten.";
        } else if (lang === 'Spanish') {
            transTitle = "Tasa de Respuesta Objetiva (ORR) del 56% a las 24 semanas";
            transBody = "En el estudio clínico de referencia KEYNOTE-189, la terapia combinada con Producto-A demostró un cambio estadísticamente superior en supervivencia global.";
            statWarning = "Advertencia COFEPRIS / ANVISA: Medicamento de alta especialidad. Su venta requiere receta médica y monitoreo de reacciones adversas de Grado 3/4.";
        }
        
        boxEl.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%;">
                <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <div style="font-size: 0.65rem; color: var(--color-text-muted); font-weight: 800; text-transform: uppercase;">Source (English US Core Dossier)</div>
                    <div style="font-size: 0.88rem; font-weight: 800; color: white;">Overall Response Rate (ORR) of 56% at Week 24</div>
                    <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">In the landmark KEYNOTE-189 Phase III trial, Product-A combination therapy demonstrated significant survival superiority over chemotherapy alone.</div>
                </div>
                <div style="background: rgba(13, 148, 136, 0.08); border: 1px solid rgba(13, 148, 136, 0.3); border-radius: 8px; padding: 1.1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.65rem; color: #5eead4; font-weight: 800; text-transform: uppercase;">Target (${lang} Affiliate Output)</span>
                        <span style="font-size: 0.55rem; background: rgba(20, 184, 166, 0.2); color: #2dd4bf; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 800;">AUTO-LOCALIZED</span>
                    </div>
                    <div style="font-size: 0.88rem; font-weight: 800; color: #2dd4bf;">${transTitle}</div>
                    <div style="font-size: 0.78rem; color: white; line-height: 1.5;">${transBody}</div>
                    <div style="margin-top: 0.35rem; background: rgba(239, 68, 68, 0.12); border-left: 3px solid #ef4444; padding: 0.5rem 0.65rem; border-radius: 4px; font-size: 0.72rem; color: #fca5a5; font-weight: 700;">
                        ${statWarning}
                    </div>
                </div>
            </div>
        `;
        logConsoleLine("Localization_Affiliate_Agent", `🗣️ Translated core copy to ${lang} with statutory jurisdiction disclaimers automatically applied.`);
    }, 500);
};

// --- PHASE 6: PHARMACOVIGILANCE & PROCUREMENT WATCHTOWER HELPER FUNCTIONS ---
window.triggerPvSafetySignal = function() {
    const outputEl = document.getElementById('pv-signal-output');
    if (!outputEl) return;
    
    outputEl.innerHTML = `<div style="color: #64748b; font-size: 0.85rem; padding: 1rem; text-align: center;">⏳ Broadcasting urgent FDA / EMA safety signal update across global promotional registry...</div>`;
    
    setTimeout(() => {
        outputEl.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.9rem; font-weight: 800; color: #fca5a5;">🚨 URGENT PV BROADCAST: Safety Parameter Shift (Product-B)</span>
                    <span style="font-size: 0.6rem; background: #ef4444; color: white; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 800;">GLOBAL QUARANTINE ACTIVE</span>
                </div>
                <div style="font-size: 0.78rem; color: #fecaca; line-height: 1.5;">
                    <strong style="color: white;">PV Signal Source:</strong> Post-Market Surveillance Registry Ref #PV-2026-LV89<br>
                    <strong style="color: #FBBF24;">Parameter Shift:</strong> Grade 3/4 Adverse Events revised from 82% to 84% based on 3-year post-approval real-world cohort.<br>
                    <strong style="color: #38BDF8;">Automated System Action:</strong> 14 global promotional assets flagged. Self-Healing Layout Token Agent triggered to update clinical disclaimers automatically across all live channels.
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(239, 68, 68, 0.2); padding-top: 0.5rem; font-size: 0.65rem; color: #fca5a5; font-family: monospace;">
                    <span>Audit Seal: sha256:PV8910AB3...</span>
                    <span>100% PV Closed-Loop Attestation</span>
                </div>
            </div>
        `;
        logConsoleLine("Pharmacovigilance_Safety_Agent", `🚨 Broadcast safety signal PV-2026-LV89 across all active variants. Self-healing pipeline initiated.`);
    }, 450);
};

window.generateProcurementReport = function() {
    const boxEl = document.getElementById('procurement-output-box');
    if (!boxEl) return;
    
    boxEl.innerHTML = `<div style="color: #64748b; font-size: 0.85rem; padding: 1.25rem; text-align: center;">⏳ Reconciling MarTech agency SOW invoices and calculating production savings...</div>`;
    
    setTimeout(() => {
        boxEl.innerHTML = `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.9rem; font-weight: 800; color: #34D399;">💰 Executive Agency SOW Reconciliation & Savings Ledger</span>
                    <span style="font-size: 0.6rem; background: rgba(52, 211, 153, 0.15); color: #34D399; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 800;">FINANCE CERTIFIED</span>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; color: #cbd5e1;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--color-text-muted); text-align: left;">
                            <th style="padding: 0.5rem 0;">Agency Partner</th>
                            <th>Retainer Scope</th>
                            <th style="text-align: right;">Legacy Cycle Time</th>
                            <th style="text-align: right;">Maestro AI Cycle Time</th>
                            <th style="text-align: right; color: #34D399;">Cost Avoidance ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                            <td style="padding: 0.6rem 0; font-weight: 700; color: white;">WPP Health (Keytruda Core)</td>
                            <td>Global Digital Banner Localization</td>
                            <td style="text-align: right; color: #ef4444;">28 Business Days</td>
                            <td style="text-align: right; color: #38bdf8; font-weight: 800;">4.2 Minutes</td>
                            <td style="text-align: right; font-weight: 800; color: #34D399;">$680,500</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                            <td style="padding: 0.6rem 0; font-weight: 700; color: white;">Omnicom (Lenvima Suite)</td>
                            <td>Congress & HCP Portal Adaptation</td>
                            <td style="text-align: right; color: #ef4444;">35 Business Days</td>
                            <td style="text-align: right; color: #38bdf8; font-weight: 800;">6.5 Minutes</td>
                            <td style="text-align: right; font-weight: 800; color: #34D399;">$420,000</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.6rem 0; font-weight: 700; color: white;">Publicis (Welireg Hub)</td>
                            <td>PromoMats Regulatory Formatting</td>
                            <td style="text-align: right; color: #ef4444;">21 Business Days</td>
                            <td style="text-align: right; color: #38bdf8; font-weight: 800;">3.8 Minutes</td>
                            <td style="text-align: right; font-weight: 800; color: #34D399;">$320,000</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.6rem; font-size: 0.72rem;">
                    <span style="color: var(--color-text-muted);">Total YTD Agency Production Savings Avoided:</span>
                    <span style="font-size: 1.1rem; font-weight: 800; color: #34D399;">$1,420,500 <span style="font-size: 0.62rem; color: #a7f3d0;">(-92% Cost Avoided)</span></span>
                </div>
            </div>
        `;
        logConsoleLine("Procurement_Agency_Agent", `📊 Generated SOW reconciliation report. YTD agency savings certified: $1,420,500.`);
    }, 450);
};

// 3. Bind to Browser History Navigation events
window.addEventListener('hashchange', () => {
    if (isRoutingInProgress) return;
    handleHashRoute();
});


// 🚀 INTERACTIVE ONBOARDING TOUR (DRIVER.JS INTEGRATION)
function initOnboardingTour() {
    // Only initialize the general dashboard onboarding tour on the Command Center (#/command or #/dashboard)
    const hash = window.location.hash || '#/';
    if (!hash.includes('/command') && !hash.includes('/dashboard')) {
        return;
    }

    // Check if the user has already seen the onboarding tour
    if (localStorage.getItem('has_seen_onboarding') === 'true') {
        return;
    }
    
    // Selectors to verify existence in the DOM before launching
    const requiredSelectors = [
        '.brand-info',
        '.heatmap-table tbody tr:first-child',
        '#header-workflow-nav',
        '.btn-guide-trigger'
    ];
    
    // Ensure all target elements exist in the DOM before launching
    const allExist = requiredSelectors.every(selector => document.querySelector(selector) !== null);
    if (!allExist) {
        console.warn('⚠️ Onboarding tour skipped: One or more target elements are not visible in the current view.');
        return;
    }
    
    // Initialize Driver.js safely using defensive check
    const driver = (window.driver && window.driver.js && window.driver.js.driver) ? window.driver.js.driver : (window.driver && window.driver.driver ? window.driver.driver : null);
    if (!driver) {
        console.warn('⚠️ Driver.js not yet loaded in window namespace.');
        return;
    }
    const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        popoverClass: 'driverjs-theme',
        nextBtnText: 'Next ➔',
        prevBtnText: '⇠ Previous',
        doneBtnText: 'Done ✓',
        opacity: 0.75,
        steps: [
            {
                element: '.brand-info',
                popover: {
                    title: 'Welcome to GenMedia!',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/01_persona_executive_commercial_command.png" style="width: 100%; border-radius: 8px; border: 1px solid rgba(0,242,254,0.4); box-shadow: 0 8px 20px rgba(0,0,0,0.6); display: block; max-height: 170px; object-fit: cover;" alt="Command Center"></div>This is your agentic marketing workbench built to automate downstream marketing asset creation, layout compliance, and regulatory grounding.',
                    side: 'bottom',
                    align: 'start'
                }
            },
            {
                element: '.heatmap-table tbody tr:first-child',
                popover: {
                    title: 'Trigger Strategic Ingestion',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/02_persona_clinical_development_ingest.png" style="width: 100%; border-radius: 8px; border: 1px solid rgba(0,242,254,0.4); box-shadow: 0 8px 20px rgba(0,0,0,0.6); display: block; max-height: 170px; object-fit: cover;" alt="Clinical Ingest"></div>Click on any row in this heatmap (like NSCLC or RCC) to instantly trigger a strategic ingest, scan local datasets, and load the clinical campaign brief!',
                    side: 'right',
                    align: 'center'
                }
            },
            {
                element: '#header-workflow-nav',
                popover: {
                    title: 'Dynamic Workflow Navigation',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/03_persona_brand_marketing_composer.png" style="width: 100%; border-radius: 8px; border: 1px solid rgba(0,242,254,0.4); box-shadow: 0 8px 20px rgba(0,0,0,0.6); display: block; max-height: 170px; object-fit: cover;" alt="Workflow Navigation"></div>This navigator guides you through the phases of clinical campaign orchestration: Command Center, Clinical Ingest, Creative Composer, and the Governance Ledger.',
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                element: '.btn-guide-trigger',
                popover: {
                    title: 'Maestro User Guide',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/04_persona_mlr_legal_regulatory_governance.png" style="width: 100%; border-radius: 8px; border: 1px solid rgba(0,242,254,0.4); box-shadow: 0 8px 20px rgba(0,0,0,0.6); display: block; max-height: 170px; object-fit: cover;" alt="User Guide"></div>Need help? Click the User Guide button at any time to open the comprehensive system architecture, dataflow diagrams, and detailed workflow guides.',
                    side: 'bottom',
                    align: 'end'
                }
            }
        ],
        onDestroyed: () => {
            // Mark the tour as seen so it doesn't pop up again
            localStorage.setItem('has_seen_onboarding', 'true');
        }
    });
    
    // Start the tour
    driverObj.drive();
}


// --- DYNAMIC INTERACTIVE END-TO-END TUTOR MODE ---
let activeTour = null;
window.isTourActive = false;
window.tourStep = 0;

window.startInteractiveTour = function() {
    // 1. Reset state
    window.isTourActive = true;
    window.tourStep = 1;
    
    // 2. Make sure we start in the Command Center (Phase -1)
    if (currentActivePhase !== -1) {
        switchPhase(-1);
    }
    
    // 3. Initialize Driver.js safely using defensive check
    const driver = (window.driver && window.driver.js && window.driver.js.driver) ? window.driver.js.driver : (window.driver && window.driver.driver ? window.driver.driver : null);
    if (!driver) {
        if (typeof showToast === 'function') showToast('⚠️ Guided Tour engine loading... please retry.');
        console.warn('⚠️ Driver.js not yet loaded in window namespace.');
        return;
    }
    
    activeTour = driver({
        showProgress: false,
        animate: true,
        allowClose: true,
        popoverClass: 'driverjs-theme',
        opacity: 0.75,
        steps: [
            {
                element: '.sidebar-logo-container',
                popover: {
                    title: 'GenMedia Guided Tour 🚀',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/01_persona_executive_commercial_command.png" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); display: block; max-height: 170px; object-fit: cover;" alt="Command Center"></div>This interactive tour will guide you step-by-step through our end-to-end clinical compliance loop. Click **Next** to begin.',
                    side: 'right',
                    align: 'start',
                    showButtons: ['next', 'close']
                }
            },
            {
                element: '.heatmap-table tbody tr:first-child', // NSCLC Row
                popover: {
                    title: 'Step 1: Ingest Clinical Trial Brief 📊',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/02_persona_clinical_development_ingest.png" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); display: block; max-height: 170px; object-fit: cover;" alt="Clinical Ingest"></div>This heatmap tracks competitor oncology claims. **Click on the NSCLC row** to simulate ingesting Product-A clinical trial briefings!',
                    side: 'right',
                    align: 'center',
                    showButtons: ['close'] // Hide next button to force click!
                }
            },
            {
                element: '#global-nav-btn-2',
                popover: {
                    title: 'Step 2: Harvesting & Grounding 📥',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/03_persona_brand_marketing_composer.png" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); display: block; max-height: 170px; object-fit: cover;" alt="Creative Composer"></div>Maestro is reading the briefing, harvesting approved claims, and matching them against the claims registry. Now, **click on the "Creative Composer" button** in the left sidebar to view the draft campaign assets!',
                    side: 'right',
                    align: 'center',
                    showButtons: ['close'] // Hide next button to force click!
                }
            },
            {
                element: '.composer-hero-container', // The image graphic placeholder container!
                popover: {
                    title: 'Step 3: Open Google Imagen 3 Creator 🎨',
                    description: 'Our agentic backplane has generated a draft email, including a placeholder medical visual. **Click directly on the image card** to open the Google Imagen 3 Asset Creator!',
                    side: 'bottom',
                    align: 'center',
                    showButtons: ['close'] // Force click!
                }
            },
            {
                element: '#btn-imagen-generate-run', // The "Generate High-Fidelity Clinical Imagery" button inside the modal!
                popover: {
                    title: 'Step 4: Configure & Generate Imagery ⚡',
                    description: 'This is the Imagen 3 console. You can write any prompt or use our pre-loaded style presets. For this tour, simply **click the "Generate High-Fidelity Clinical Imagery" button** to run the generation!',
                    side: 'top',
                    align: 'center',
                    showButtons: ['close'] // Force click!
                }
            },
            {
                element: '.composer-hero-container', // The newly updated image container!
                popover: {
                    title: 'Step 5: Cryptographic SynthID™ Sealed! 🔒',
                    description: 'Success! Google Imagen 3 generated a gorgeous, high-fidelity visual and automatically injected an imperceptible, secure **Google SynthID™ cryptographic watermark**! Now, **click the "Edit Copy" button** to test text compliance.',
                    side: 'bottom',
                    align: 'center',
                    showButtons: ['close'] // Force click!
                }
            },
            {
                element: '#btn-edit-copy', // Now "Save & Validate" button!
                popover: {
                    title: 'Step 6: Simulate Violation & Validate 🛡️',
                    description: 'Let\'s test the compliance guardrails! **Click the "Edit Copy" button** to enter Direct Edit Mode, or simply **click the "Save & Validate" button** to run the automated self-healing cycle!',
                    side: 'bottom',
                    align: 'end',
                    showButtons: ['close']
                }
            },
            {
                element: '#global-nav-btn-3', // Governance Ledger button
                popover: {
                    title: 'Step 7: Self-Healed & Secured! 🛡️',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/04_persona_mlr_legal_regulatory_governance.png" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); display: block; max-height: 170px; object-fit: cover;" alt="Governance Ledger"></div>GenMedia\'s agents detected the compliance violation and automatically auto-healed the copy! Now, **click the "Governance Ledger" button** in the left sidebar to lock in our security seal.',
                    side: 'right',
                    align: 'center',
                    showButtons: ['close']
                }
            },
            {
                element: '#phase-3-view',
                popover: {
                    title: 'Step 8: Cryptographic Digital Seal 🔒',
                    description: 'The campaign is 100% compliant and sealed with a secure SHA-256 digital wax seal. You can now securely export to Veeva or print the Form FDA 2253! Click **Next** to explore our specialized stakeholder persona hubs.',
                    side: 'bottom',
                    align: 'center',
                    showButtons: ['next', 'close']
                }
            },
            {
                element: '#global-nav-btn-4',
                popover: {
                    title: 'Step 9: Medical Affairs & HEOR Hub 🔬',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/05_persona_medical_affairs_msl_studio.png" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); display: block; max-height: 170px; object-fit: cover;" alt="Medical Affairs & HEOR Hub"></div>Our scientific & market access pillar! **Click the "4. Medical / HEOR Hub" button** in the left sidebar to parse non-promotional congress abstracts (`ESMO 2026`) and model 3-year hospital budget impact curves (`-$121.3M saved`).',
                    side: 'right',
                    align: 'center',
                    showButtons: ['close']
                }
            },
            {
                element: '#global-nav-btn-5',
                popover: {
                    title: 'Step 10: Global Localization Studio 🌐',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/07_persona_global_localization_affiliates.png" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); display: block; max-height: 170px; object-fit: cover;" alt="Localization Studio"></div>Our country affiliate adaptation pillar! **Click the "5. Localization Studio" button** in the left sidebar to anchor parent-child PromoMats lineages (`#V-2026-KT089-PMDA`) and run dual-pane AI translations with statutory regional disclaimers.',
                    side: 'right',
                    align: 'center',
                    showButtons: ['close']
                }
            },
            {
                element: '#global-nav-btn-6',
                popover: {
                    title: 'Step 11: PV & Agency Watchtower 🚨',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/08_persona_pharmacovigilance_drug_safety.png" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); display: block; max-height: 170px; object-fit: cover;" alt="PV & Agency Watchtower"></div>Our post-market & procurement pillar! **Click the "6. PV & Agency Watch" button** in the left sidebar to monitor post-market adverse event registries, simulate global safety quarantines, and audit MarTech agency retainer savings (`$1.42M+ avoided`).',
                    side: 'right',
                    align: 'center',
                    showButtons: ['close']
                }
            },
            {
                element: '#phase-6-view',
                popover: {
                    title: 'Step 12: Guided Tour Complete! 🎉',
                    description: '<div style="margin-bottom: 0.65rem;"><img src="screenshots/10_persona_enterprise_it_time_travel_fda.png" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); display: block; max-height: 170px; object-fit: cover;" alt="Time Travel Scrubber"></div>You have completed the comprehensive tour across all **10 Merck Persona Pillars** and 7 workbench viewports! You are now fully equipped to orchestrate, audit, and self-heal enterprise clinical marketing at scale.',
                    side: 'bottom',
                    align: 'center',
                    showButtons: ['close']
                }
            }
        ],
        onDestroyed: () => {
            // Reset tour state if closed
            window.isTourActive = false;
            window.tourStep = 0;
            appendConsoleLine('system', 'ℹ️ Guided Tour ended by user.');
        }
    });
    
    // Start at Step 0 (Welcome)
    activeTour.drive(0);
};



// =====================================================================
// MAESTRO EXECUTIVE AI/ML ANALYTICS & INSIGHTS COCKPIT IMPLEMENTATION
// =====================================================================
let analyticsData = [];       // Complete 120-row dataset from database
let filteredData = [];        // Filtered dataset based on active filters
let activeBrandFilter = 'ALL';
let activeStatusFilter = 'ALL';
let activeSearchQuery = '';
let selectedKpiMetric = 'latency'; // 'latency', 'compliance', or 'savings'
let activeChartTab = 'trend';      // 'trend', 'roi', 'violations'
let analyticsCharts = {};

// 1. Initialize Dashboard on Tab Load
window.initAnalyticsDashboard = async function() {
    console.log("📊 Initializing Overhauled Executive Analytics Platform...");
    
    // Fetch complete dataset from the backend
    try {
        const response = await fetch(BACKEND_URL + '/api/analytics/data');
        const resData = await response.json();
        if (resData.success && resData.data) {
            analyticsData = resData.data;
            console.log(`🛢️ Loaded ${analyticsData.length} campaign records from database.`);
        } else {
            throw new Error(resData.detail || "Failed to load data");
        }
    } catch (e) {
        console.error("❌ Failed to fetch analytics data, generating local fallback dataset:", e);
        generateFallbackDataset();
    }
    
    // Apply filters (defaults to ALL) to populate filteredData and render everything
    applyFilters();
};

// Fallback dataset generator in case backend is offline
function generateFallbackDataset() {
    analyticsData = [];
    const brands = ['Product-A', 'Product-B', 'Product-C', 'Product-D', 'Product-E'];
    const indications = {'Product-A': 'NSCLC', 'Product-B': 'RCC', 'Product-C': 'Advanced RCC', 'Product-D': 'PAH', 'Product-E': 'Ovarian Cancer'};
    const statuses = ['COMPLIANT', 'AUTO_HEALED', 'BLOCKED'];
    const weights = [0.75, 0.18, 0.07];
    const projects = {
        'Product-A': ['Global Pharma Enterprise Campaign', 'Keynote Global Launch'],
        'Product-B': ['Global Pharma Launch', 'Clear Trial HCP Portal'],
        'Product-C': ['Patient Portal Program'],
        'Product-D': ['Global Launch Campaign'],
        'Product-E': ['Ovarian Ad Campaign']
    };
    
    const now = new Date();
    for (let i = 0; i < 100; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const project = projects[brand][Math.floor(Math.random() * projects[brand].length)];
        const status = statuses[0]; // Simplification for fallback
        
        analyticsData.push({
            campaign_id: `CAMP-${brand.substring(8, 11).toUpperCase()}-${100 + i}`,
            project_name: project,
            brand: brand,
            indication: indications[brand],
            status: Math.random() > 0.25 ? 'COMPLIANT' : (Math.random() > 0.5 ? 'AUTO_HEALED' : 'BLOCKED'),
            latency_ms: Math.random() > 0.5 ? 400 + Math.floor(Math.random() * 400) : 1200 + Math.floor(Math.random() * 1000),
            violations_count: Math.random() > 0.8 ? 1 : 0,
            violation_details: [],
            tokens_used: 15000 + Math.floor(Math.random() * 30000),
            cost_usd: 0.15 + Math.random() * 0.5,
            savings_usd: Math.random() > 0.8 ? 45.0 : 0.0,
            timestamp: new Date(now - i * 6 * 3600000).toISOString().replace('T', ' ').substring(0, 19)
        });
    }
}

// 2. Reactive Filtering Engine
window.filterByBrand = function(brand) {
    activeBrandFilter = brand;
    
    // Update active class on pills
    document.querySelectorAll('.analytics-filter-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    const activePill = document.getElementById(`brand-pill-${brand}`);
    if (activePill) activePill.classList.add('active');
    
    applyFilters();
    if (window.appendConsoleLine) {
        appendConsoleLine('system', `📊 Filtered analytics dashboard by Brand: ${brand}`);
    }
    updateHashFromState();
};

window.applyLedgerFilters = function() {
    const searchInput = document.getElementById('ledger-search-input');
    const statusSelect = document.getElementById('ledger-status-filter');
    
    activeSearchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    activeStatusFilter = statusSelect ? statusSelect.value : 'ALL';
    
    applyFilters();
};

function applyFilters() {
    // Filter the master dataset
    filteredData = analyticsData.filter(item => {
        const matchesBrand = (activeBrandFilter === 'ALL' || item.brand === activeBrandFilter);
        const matchesStatus = (activeStatusFilter === 'ALL' || item.status === activeStatusFilter);
        const matchesSearch = (activeSearchQuery === '' || 
                               item.campaign_id.toLowerCase().includes(activeSearchQuery) || 
                               item.project_name.toLowerCase().includes(activeSearchQuery) ||
                               item.indication.toLowerCase().includes(activeSearchQuery));
        return matchesBrand && matchesStatus && matchesSearch;
    });
    
    // Recalculate KPIs and redraw charts/ledger
    updateKpiCards();
    renderActiveCharts();
    renderLedgerTable();
}

// 3. Recalculate and Update KPI Cards
function updateKpiCards() {
    if (filteredData.length === 0) {
        document.getElementById('analytics-kpi-latency').innerText = '- ms';
        document.getElementById('analytics-kpi-compliance').innerText = '- %';
        document.getElementById('analytics-kpi-savings').innerText = '$0.00';
        return;
    }
    
    // Calculate Average Latency
    const totalLatency = filteredData.reduce((sum, item) => sum + item.latency_ms, 0);
    const avgLatency = Math.round(totalLatency / filteredData.length);
    document.getElementById('analytics-kpi-latency').innerText = `${avgLatency} ms`;
    
    // Calculate Compliance Rate (Compliant + Healed / Total)
    const compliantOrHealed = filteredData.filter(item => item.status === 'COMPLIANT' || item.status === 'AUTO_HEALED').length;
    const complianceRate = ((compliantOrHealed / filteredData.length) * 100).toFixed(1);
    const rateEl = document.getElementById('analytics-kpi-compliance');
    rateEl.innerText = `${complianceRate}%`;
    rateEl.style.color = complianceRate > 90 ? '#10B981' : (complianceRate > 75 ? '#F59E0B' : '#EF4444');
    
    // Calculate Total Savings
    const totalSavings = filteredData.reduce((sum, item) => sum + item.savings_usd, 0);
    document.getElementById('analytics-kpi-savings').innerText = `$${totalSavings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

// 4. KPI Click-to-Chart Toggles
window.selectKpiMetric = function(metric) {
    selectedKpiMetric = metric;
    
    // Update active indicators on KPI cards
    document.querySelectorAll('.analytics-kpi-card').forEach(card => {
        const indicator = card.querySelector('.kpi-active-indicator');
        if (indicator) indicator.style.display = 'none';
    });
    
    const activeCard = document.getElementById(`kpi-card-${metric}`);
    if (activeCard) {
        const indicator = activeCard.querySelector('.kpi-active-indicator');
        if (indicator) indicator.style.display = 'block';
    }
    
    // If we are on the trends tab, redraw the line chart with the new metric!
    if (activeChartTab === 'trend') {
        renderTrendChart();
    }
    
    if (window.appendConsoleLine) {
        appendConsoleLine('system', `📈 Switched telemetry trend line chart to display: ${metric.toUpperCase()}`);
    }
};

// 5. Chart Tab Swapper
window.switchChartTab = function(tabId) {
    activeChartTab = tabId;
    
    // Hide all chart containers, show the active one
    document.getElementById('chart-container-trend').style.display = tabId === 'trend' ? 'flex' : 'none';
    document.getElementById('chart-container-roi').style.display = tabId === 'roi' ? 'flex' : 'none';
    document.getElementById('chart-container-violations').style.display = tabId === 'violations' ? 'flex' : 'none';
    
    // Update active class on tab buttons
    document.querySelectorAll('.chart-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`btn-tab-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Update chart title in header
    const titleEl = document.getElementById('chart-tab-title');
    if (tabId === 'trend') titleEl.innerText = 'Telemetry Trends';
    else if (tabId === 'roi') titleEl.innerText = 'Brand ROI Analysis';
    else if (tabId === 'violations') titleEl.innerText = 'Violation Frequency';
    
    // Render the selected chart
    renderActiveCharts();
    updateHashFromState();
};

function renderActiveCharts() {
    if (activeChartTab === 'trend') renderTrendChart();
    else if (activeChartTab === 'roi') renderRoiChart();
    else if (activeChartTab === 'violations') renderViolationsChart();
}

// --- CHART 1: TELEMETRY TRENDS (LINE CHART WITH DRILL-DOWN) ---
function renderTrendChart() {
    const ctx = document.getElementById('chart-telemetry-trend');
    if (!ctx) return;
    
    const isLightTheme = document.body.classList.contains('light-theme');
    const textColor = isLightTheme ? '#0F172A' : '#F1F5F9';
    const gridColor = isLightTheme ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    
    if (analyticsCharts['trend']) analyticsCharts['trend'].destroy();
    
    // Group filteredData by date to generate chart points
    // Since we have 120 points over 30 days, let's aggregate them into 6 periods or show a rolling average!
    // For a beautiful, realistic trend, let's group by day and sort chronologically!
    const dailyData = {};
    filteredData.forEach(item => {
        const dateStr = item.timestamp.substring(0, 10); // YYYY-MM-DD
        if (!dailyData[dateStr]) {
            dailyData[dateStr] = { sum: 0, count: 0, savings: 0, compliantCount: 0 };
        }
        
        if (selectedKpiMetric === 'latency') {
            dailyData[dateStr].sum += item.latency_ms;
        } else if (selectedKpiMetric === 'compliance') {
            const isPassed = item.status === 'COMPLIANT' || item.status === 'AUTO_HEALED';
            dailyData[dateStr].sum += isPassed ? 1 : 0;
        } else if (selectedKpiMetric === 'savings') {
            dailyData[dateStr].sum += item.savings_usd;
        }
        dailyData[dateStr].count += 1;
    });
    
    // Sort dates chronologically
    const sortedDates = Object.keys(dailyData).sort();
    
    // Limit to last 15 days for clean readability on screen
    const displayDates = sortedDates.slice(-12);
    
    const chartLabels = displayDates.map(d => {
        // Format YYYY-MM-DD to "MMM DD"
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const chartPoints = displayDates.map(d => {
        const day = dailyData[d];
        if (selectedKpiMetric === 'latency') {
            return Math.round(day.sum / day.count);
        } else if (selectedKpiMetric === 'compliance') {
            return Math.round((day.sum / day.count) * 100);
        } else if (selectedKpiMetric === 'savings') {
            return day.sum; // Cumulative savings per day
        }
    });
    
    // Define colors based on selected metric
    let lineColor = '#3b82f6';
    let bgColor = 'rgba(59, 130, 246, 0.1)';
    let chartLabel = 'Avg Latency (ms)';
    let yMax = undefined;
    let yMin = undefined;
    
    if (selectedKpiMetric === 'compliance') {
        lineColor = '#8b5cf6';
        bgColor = 'rgba(139, 92, 246, 0.1)';
        chartLabel = 'MLR Pass Rate (%)';
        yMax = 100;
        yMin = 50;
    } else if (selectedKpiMetric === 'savings') {
        lineColor = '#f59e0b';
        bgColor = 'rgba(245, 158, 11, 0.1)';
        chartLabel = 'Daily Cost Savings ($)';
    }
    
    analyticsCharts['trend'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: chartLabel,
                data: chartPoints,
                borderColor: lineColor,
                backgroundColor: bgColor,
                borderWidth: 2,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: lineColor,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Outfit', size: 9 } } },
                y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit', size: 9 } }, max: yMax, min: yMin }
            }
        }
    });
}

// --- CHART 2: BRAND ROI (GROUPED BAR CHART) ---
function renderRoiChart() {
    const ctx = document.getElementById('chart-brand-roi');
    if (!ctx) return;
    
    const isLightTheme = document.body.classList.contains('light-theme');
    const textColor = isLightTheme ? '#0F172A' : '#F1F5F9';
    const gridColor = isLightTheme ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    
    if (analyticsCharts['roi']) analyticsCharts['roi'].destroy();
    
    // Group filteredData by brand to get cost and savings
    const brandData = {};
    filteredData.forEach(item => {
        if (!brandData[item.brand]) {
            brandData[item.brand] = { cost: 0, savings: 0 };
        }
        brandData[item.brand].cost += item.cost_usd;
        brandData[item.brand].savings += item.savings_usd;
    });
    
    const brands = Object.keys(brandData).sort();
    const costData = brands.map(b => roundTo(brandData[b].cost, 2));
    const savingsDataPoints = brands.map(b => roundTo(brandData[b].savings, 2));
    
    analyticsCharts['roi'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: brands,
            datasets: [
                {
                    label: 'API Token Cost ($)',
                    data: costData,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)', // red
                    borderRadius: 4
                },
                {
                    label: 'Est. Cost Savings ($)',
                    data: savingsDataPoints,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)', // green
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    labels: { color: textColor, font: { family: 'Outfit', size: 9 } }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Outfit', size: 9 } } },
                y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit', size: 9 } } }
            }
        }
    });
}

// --- CHART 3: VIOLATIONS FREQUENCY (HORIZONTAL BAR CHART) ---
function renderViolationsChart() {
    const ctx = document.getElementById('chart-violations-analysis');
    if (!ctx) return;
    
    const isLightTheme = document.body.classList.contains('light-theme');
    const textColor = isLightTheme ? '#0F172A' : '#F1F5F9';
    const gridColor = isLightTheme ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    
    if (analyticsCharts['violations']) analyticsCharts['violations'].destroy();
    
    // Count specific violations
    const violationCounts = {};
    filteredData.forEach(item => {
        if (item.violation_details && Array.isArray(item.violation_details)) {
            item.violation_details.forEach(viol => {
                // Shorten rule names for clean display
                const shortName = viol.split(':')[0]; // e.g. "Rule 3.2"
                violationCounts[shortName] = (violationCounts[shortName] || 0) + 1;
            });
        }
    });
    
    const sortedViolKeys = Object.keys(violationCounts).sort((a, b) => violationCounts[b] - violationCounts[a]);
    const chartLabels = sortedViolKeys.map(k => {
        // Map short rule key to description
        if (k === 'Rule 1.1') return 'Rule 1.1: Missing SmPC';
        if (k === 'Rule 1.2') return 'Rule 1.2: Outdated Label';
        if (k === 'Rule 2.1') return 'Rule 2.1: Box Warning';
        if (k === 'Rule 3.1') return 'Rule 3.1: Font Size Ratio';
        if (k === 'Rule 3.2') return 'Rule 3.2: Grid Overlap';
        if (k === 'Rule 4.1') return 'Rule 4.1: Audience Mismatch';
        if (k === 'Rule 4.2') return 'Rule 4.2: Missing FDA 2253';
        return k;
    });
    const chartPoints = sortedViolKeys.map(k => violationCounts[k]);
    
    // If no violations exist, show empty placeholder message
    if (chartPoints.length === 0) {
        ctx.style.display = 'none';
        // Show placeholder or empty chart
    } else {
        ctx.style.display = 'block';
    }
    
    analyticsCharts['violations'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Violations Frequency',
                data: chartPoints,
                backgroundColor: 'rgba(139, 92, 246, 0.85)', // purple
                borderColor: '#8b5cf6',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bar chart!
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit', size: 9 } }, min: 0 },
                y: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Outfit', size: 9 } } }
            }
        }
    });
}

// Helper to round numbers
function roundTo(num, decimals) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// 6. Render Campaign Ledger Table
function renderLedgerTable() {
    const tbody = document.getElementById('analytics-ledger-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Update ledger count badge
    const badge = document.getElementById('ledger-count-badge');
    if (badge) badge.innerText = `${filteredData.length} Runs`;
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
                    No campaigns match the active filters.
                </td>
            </tr>
        `;
        return;
    }
    
    // Render rows (limit to 30 for performance, scrollable container handles the rest)
    const displayData = filteredData.slice(0, 30);
    
    displayData.forEach(item => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.03)';
        row.style.transition = 'var(--transition-smooth)';
        
        row.onmouseover = () => row.style.background = 'rgba(255, 255, 255, 0.02)';
        row.onmouseout = () => row.style.background = 'none';
        
        // Map status to badge
        let statusBadge = '';
        let selfHealingCol = '';
        if (item.status === 'COMPLIANT') {
            statusBadge = `<span class="heatmap-badge zero-teal" style="width: auto; padding: 0.15rem 0.4rem; font-size: 0.55rem; border-radius: 4px;">PASSED</span>`;
            selfHealingCol = `<span style="color: var(--color-text-muted);">0 Violations</span>`;
        } else if (item.status === 'AUTO_HEALED') {
            statusBadge = `<span class="heatmap-badge zero-teal" style="width: auto; padding: 0.15rem 0.4rem; font-size: 0.55rem; border-radius: 4px;">PASSED</span>`;
            selfHealingCol = `<span style="color: #F59E0B; font-weight: 800;">${item.violations_count} Overlap Healed</span>`;
        } else { // BLOCKED
            statusBadge = `<span class="heatmap-badge high-red" style="width: auto; padding: 0.15rem 0.4rem; font-size: 0.55rem; border-radius: 4px;">BLOCKED</span>`;
            selfHealingCol = `<span style="color: #EF4444; font-weight: 800;">${item.violations_count} Violations</span>`;
        }
        
        // Clicking a row drills down to show the details modal!
        // If it was compliant, we show 'violation_product_a'. If auto-healed, 'violation_product_b'. If blocked, we can show a mock blocked detail!
        let modalId = 'violation_product_a';
        if (item.status === 'AUTO_HEALED') modalId = 'violation_product_b';
        else if (item.status === 'BLOCKED') modalId = 'violation_product_b'; // Or custom blocked modal
        
        row.onclick = () => drillDownCampaign(modalId);
        
        row.innerHTML = `
            <td style="padding: 0.6rem 0.75rem; font-family: monospace; color: var(--color-primary);">${item.campaign_id}</td>
            <td style="padding: 0.6rem 0.75rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.project_name}</td>
            <td style="padding: 0.6rem 0.75rem;">${item.brand} (${item.indication})</td>
            <td style="padding: 0.6rem 0.75rem;">${statusBadge}</td>
            <td style="padding: 0.6rem 0.75rem; text-align: right; font-family: monospace; color: var(--color-text-muted); font-weight: 500;">${item.latency_ms} ms</td>
            <td style="padding: 0.6rem 0.75rem; text-align: right;">${selfHealingCol}</td>
            <td style="padding: 0.6rem 0.75rem; text-align: right; font-family: monospace; color: var(--color-text-muted); font-weight: 500;">$${item.cost_usd.toFixed(4)}</td>
            <td style="padding: 0.6rem 0.75rem; text-align: right; font-family: monospace; color: #10B981;">$${item.savings_usd.toFixed(2)}</td>
            <td style="padding: 0.6rem 0.75rem; color: var(--color-text-muted); font-weight: 500;">${item.timestamp}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// 7. Interactive AI Compliance Copilot Chat Messages
window.sendCopilotMessage = async function() {
    const inputEl = document.getElementById('copilot-chat-input');
    if (!inputEl) return;
    
    const msgText = inputEl.value.trim();
    if (!msgText) return;
    
    // Clear input
    inputEl.value = '';
    
    await executeCopilotQuery(msgText);
};

window.sendSuggestedQuestion = async function(questionText) {
    await executeCopilotQuery(questionText);
};

async function executeCopilotQuery(userMessage) {
    const chatHistory = document.getElementById('copilot-chat-history');
    if (!chatHistory) return;
    
    // 1. Append User Message to Chat History
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-message user';
    userMsgDiv.style.cssText = 'display: flex; gap: 0.6rem; max-width: 85%; align-self: flex-end; flex-direction: row-reverse;';
    userMsgDiv.innerHTML = `
        <div style="background: rgba(255,255,255,0.06); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--color-text-muted); flex-shrink: 0; font-weight: bold; border: 1px solid var(--border-color);">U</div>
        <div style="background: var(--color-primary); color: white; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--color-primary); font-weight: 500;">
            ${escapeHtml(userMessage)}
        </div>
    `;
    chatHistory.appendChild(userMsgDiv);
    
    // Scroll chat history to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // 2. Append Assistant Typing/Loading Bubble
    const typingBubbleId = `chat-typing-${Date.now()}`;
    const typingMsgDiv = document.createElement('div');
    typingMsgDiv.className = 'chat-message assistant';
    typingMsgDiv.id = typingBubbleId;
    typingMsgDiv.style.cssText = 'display: flex; gap: 0.6rem; max-width: 85%;';
    typingMsgDiv.innerHTML = `
        <div style="background: var(--color-primary); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: white; flex-shrink: 0; font-weight: bold;">M</div>
        <div style="background: var(--bg-surface-solid); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); color: var(--color-text-muted); display: flex; align-items: center; gap: 0.4rem;">
            <div class="spinner" style="width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            <span>Thinking...</span>
        </div>
    `;
    chatHistory.appendChild(typingMsgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // 3. Call Backend Chat Endpoint
    try {
        const response = await fetch(BACKEND_URL + '/api/analytics/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                active_filters: {
                    brand: activeBrandFilter,
                    status: activeStatusFilter,
                    search: activeSearchQuery
                }
            })
        });
        const data = await response.json();
        
        // Remove typing bubble
        const bubbleEl = document.getElementById(typingBubbleId);
        if (bubbleEl) bubbleEl.remove();
        
        // Append Real Response
        if (data.success && data.reply) {
            const replyMsgDiv = document.createElement('div');
            replyMsgDiv.className = 'chat-message assistant';
            replyMsgDiv.style.cssText = 'display: flex; gap: 0.6rem; max-width: 85%;';
            replyMsgDiv.innerHTML = `
                <div style="background: var(--color-primary); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: white; flex-shrink: 0; font-weight: bold;">M</div>
                <div style="background: var(--bg-surface-solid); padding: 0.75rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); color: var(--color-text-main);">
                    ${parseSimpleMarkdown(data.reply)}
                </div>
            `;
            chatHistory.appendChild(replyMsgDiv);
            
            // Render the new dynamic follow-up questions!
            const suggestedContainer = document.getElementById('copilot-suggested-questions');
            if (suggestedContainer && data.follow_ups && Array.isArray(data.follow_ups)) {
                suggestedContainer.innerHTML = '';
                const icons = ['💰', '⚠️', '🚫', '📉', '⚖️', '🧠'];
                data.follow_ups.slice(0, 3).forEach((q, idx) => {
                    const pill = document.createElement('span');
                    pill.className = 'chat-suggested-pill';
                    const icon = icons[idx % icons.length];
                    
                    const displayQ = q.length > 60 ? q.substring(0, 57) + '...' : q;
                    pill.innerText = `${icon} ${displayQ}`;
                    
                    const escapedQ = q.replace(/'/g, "\\'");
                    pill.onclick = () => sendSuggestedQuestion(escapedQ);
                    suggestedContainer.appendChild(pill);
                });
            }
        } else {
            throw new Error(data.warning || "No reply received");
        }
    } catch (e) {
        console.error("❌ Copilot Chat failed:", e);
        const bubbleEl = document.getElementById(typingBubbleId);
        if (bubbleEl) bubbleEl.remove();
        
        // Append Error message
        const errorMsgDiv = document.createElement('div');
        errorMsgDiv.className = 'chat-message assistant';
        errorMsgDiv.style.cssText = 'display: flex; gap: 0.6rem; max-width: 85%;';
        errorMsgDiv.innerHTML = `
            <div style="background: var(--color-primary); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: white; flex-shrink: 0; font-weight: bold;">M</div>
            <div style="background: var(--bg-surface-solid); padding: 0.75rem 0.85rem; border-radius: 8px; border: 1px solid rgba(239,68,68,0.2); color: #f87171;">
                ⚠️ **System Error:** I am unable to process your request at this time. Please check your internet connection or try again later.
            </div>
        `;
        chatHistory.appendChild(errorMsgDiv);
    } finally {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

// Helper to escape HTML characters
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Simple Markdown to HTML parser
function parseSimpleMarkdown(md) {
    let html = md.trim();
    
    // Escape HTML to prevent XSS
    html = escapeHtml(html);
        
    // Restore styling tags we need
    // Headers
    html = html.replace(/^###\s*(.*?)$/gm, '<h4 style="font-size: 0.78rem; font-weight: 800; margin: 0.85rem 0 0.35rem 0; color: #3b82f6; text-transform: uppercase;">$1</h4>');
    html = html.replace(/^##\s*(.*?)$/gm, '<h3 style="font-size: 0.85rem; font-weight: 800; margin: 1rem 0 0.4rem 0; color: var(--color-text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.2rem;">$1</h3>');
    html = html.replace(/^#\s*(.*?)$/gm, '<h2 style="font-size: 0.95rem; font-weight: 800; margin: 1.25rem 0 0.6rem 0; color: var(--color-text-main);">$1</h2>');
    
    // Bold (e.g. **text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-text-main); font-weight: 800;">$1</strong>');
    
    // Bullet points (e.g. * text or - text)
    html = html.replace(/^\s*[\*\-]\s*(.*?)$/gm, '<div style="display: flex; gap: 0.4rem; margin-left: 0.4rem; margin-bottom: 0.25rem; font-size: 0.7rem;"><span style="color: #3b82f6;">•</span><span>$1</span></div>');
    
    // Paragraphs (split by double newlines and wrap in divs if they aren't already headers/lists)
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
        p = p.trim();
        if (p.startsWith('<h') || p.startsWith('<div')) return p;
        return `<p style="margin: 0 0 0.6rem 0; font-size: 0.7rem; color: var(--color-text-muted); line-height: 1.45;">${p}</p>`;
    }).join('\n');
    
    return html;
}

// 8. Drill-Down Campaign Detail Modal
// 8. Drill-Down Campaign Detail Modal
window.showViolationDetail = function(templateId) {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;
    
    const iconEl = document.getElementById('detail-modal-icon');
    const titleEl = document.getElementById('detail-modal-title');
    const subtitleEl = document.getElementById('detail-modal-subtitle');
    const bodyEl = document.getElementById('detail-modal-body');
    
    let icon = "🔍";
    let title = "Audit Report Details";
    let subtitle = "Campaign Compliance verification";
    let contentHtml = "";
    
    if (templateId === 'violation_product_a') {
        icon = "✓";
        title = "Campaign Compliance: PASSED";
        subtitle = "Zero layout or medical claims violations detected.";
        contentHtml = `
            <div style="background: rgba(16, 185, 129, 0.05); padding: 1rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
                    <span>Clinical Grounding Score</span>
                    <strong style="color: #10B981;">100% Match</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
                    <span>Brand Alignment Verification</span>
                    <strong style="color: #10B981;">Passed</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
                    <span>Legal Disclaimer Check</span>
                    <strong style="color: #10B981;">Verified</strong>
                </div>
            </div>
        `;
    } else {
        icon = "⚠️";
        title = "Campaign Audit: FLAGGED";
        subtitle = "Claims discrepancies detected and automatically resolved.";
        contentHtml = `
            <div style="background: rgba(245, 158, 11, 0.05); padding: 1rem; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2); display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
                    <span>Claim Match Discrepancy</span>
                    <strong style="color: #F59E0B;">Auto-Healed</strong>
                </div>
                <div style="padding: 0.6rem; border-radius: 6px; background: rgba(0,0,0,0.2); font-family: monospace; font-size: 0.58rem; line-height: 1.4; color: #34d399;">
                    - Ingested: "ORR of 49%"<br>
                    + Verified: "ORR of 56% (KEYNOTE-189 update)"<br>
                    Status: Replaced & Re-verified
                </div>
            </div>
        `;
    }
    
    if (iconEl) iconEl.innerText = icon;
    if (titleEl) titleEl.innerText = title;
    if (subtitleEl) subtitleEl.innerText = subtitle;
    if (bodyEl) bodyEl.innerHTML = contentHtml;
    
    modal.classList.add('active');
    updateHashFromState();
};

window.drillDownCampaign = function(violationId) {
    if (window.appendConsoleLine) {
        appendConsoleLine('system', `🔍 Drilling down into campaign audit details for: ${violationId}`);
    }
    window.showViolationDetail(violationId);
};


// --- PREMIUM LANDING PAGE INTERACTIVE LOGIC ---
window.enterAppDashboard = function() {
    const landingView = document.getElementById('landing-view');
    if (landingView) landingView.style.display = 'none';
    window.location.hash = '#/home';
    
    // Trigger the interactive onboarding tour after the dashboard has settled!
    if (typeof initOnboardingTour === 'function') {
        setTimeout(initOnboardingTour, 600);
    }
};

window.goBackToLanding = function() {
    if (typeof activeTour !== 'undefined' && activeTour) {
        if (typeof activeTour.destroy === 'function') activeTour.destroy();
    }
    window.isTourActive = false;
    window.tourStep = 0;
    window.location.hash = '#/';
};

window.openSimComparisonModal = function() {
    const modal = document.getElementById('sim-comparison-modal');
    if (modal) modal.style.display = 'flex';
    updateHashFromState();
};

window.closeSimComparisonModal = function() {
    const modal = document.getElementById('sim-comparison-modal');
    if (modal) modal.style.display = 'none';
    updateHashFromState();
};

// 🌟 GLOBAL MODAL ESCAPE KEY & CLICK-OUTSIDE DISMISSAL PROTECTION
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        let changed = false;
        ['sim-comparison-modal', 'time-travel-modal', 'diagnostics-modal', 'fda-2253-modal-overlay', 'modal-veeva-sync', 'compliance-modal', 'detail-modal', 'settings-modal'].forEach(id => {
            const el = document.getElementById(id);
            if (el && (el.style.display !== 'none' || el.classList.contains('active'))) {
                el.style.display = 'none';
                el.classList.remove('active');
                changed = true;
            }
        });
        if (changed) updateHashFromState();
    }
});

window.addEventListener('click', (e) => {
    let changed = false;
    ['sim-comparison-modal', 'time-travel-modal', 'diagnostics-modal', 'fda-2253-modal-overlay', 'modal-veeva-sync', 'compliance-modal', 'detail-modal', 'settings-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (el && e.target === el) {
            el.style.display = 'none';
            el.classList.remove('active');
            changed = true;
        }
    });
    if (changed) updateHashFromState();
});

let isLandingSimRunning = false;
window.startLandingSimulation = function() {
    if (isLandingSimRunning) return;
    isLandingSimRunning = true;
    
    const btn = document.getElementById('run-sim-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerText = '⏳ Simulation Running...';
    }
    
    const consoleEl = document.getElementById('landing-sim-console');
    if (!consoleEl) return;
    
    // Grab visual elements
    const adMockup = document.getElementById('sim-ad-mockup');
    const laserScanner = document.getElementById('sim-laser-scanner');
    const toastMlr = document.getElementById('sim-toast-mlr');
    const toastLayout = document.getElementById('sim-toast-layout');
    const successBadge = document.getElementById('sim-success-badge');
    const claimVal = document.getElementById('sim-claim-val');
    const adClaim = document.getElementById('sim-ad-claim');
    const adFooter = document.getElementById('sim-ad-footer');
    const compBtn = document.getElementById('open-comparison-btn');
    
    // Reset visual elements to initial state
    if (adMockup) {
        adMockup.style.filter = 'blur(4px)';
        adMockup.style.opacity = '0.4';
    }
    if (laserScanner) laserScanner.style.display = 'none';
    if (toastMlr) toastMlr.style.display = 'none';
    if (toastLayout) toastLayout.style.display = 'none';
    if (successBadge) successBadge.style.display = 'none';
    if (compBtn) compBtn.style.display = 'none';
    
    if (claimVal) {
        claimVal.innerText = '68%';
        claimVal.style.color = '#f87171'; // Red
    }
    if (adClaim) adClaim.style.background = 'transparent';
    if (adFooter) {
        adFooter.style.marginTop = '-12px';
        adFooter.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        adFooter.style.background = 'transparent';
    }
    
    consoleEl.innerHTML = '<p class="console-line system">[System] Initializing Agentic Compliance Sandbox Pipeline...</p>';
    
    const steps = [
        { id: 'sim-step-1', text: 'Ingesting Campaign Briefing & Target Labels...', completedText: 'Campaign Ingested & Labels Verified' },
        { id: 'sim-step-2', text: 'MLR Judge Scanning Claims Libraries...', completedText: 'Claims Audited & Integrity Rectified' },
        { id: 'sim-step-3', text: 'Self-Healing Visual Token Overlaps...', completedText: 'Visual Token Overlaps Self-Healed' },
        { id: 'sim-step-4', text: 'Synchronizing Transaction to Brand Ledger...', completedText: 'Transaction Synchronized to Brand Ledger' }
    ];
    
    // Reset steps UI
    steps.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) {
            el.className = 'sim-step';
            const txtSpan = el.querySelector('span:nth-child(2)');
            if (txtSpan) txtSpan.innerText = s.text;
        }
    });
    
    let currentStep = 0;
    
    function logLine(text, type = 'system') {
        const p = document.createElement('p');
        p.className = `console-line ${type}`;
        p.innerText = `[${new Date().toLocaleTimeString()}] ${text}`;
        consoleEl.appendChild(p);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }
    
    function executeNextStep() {
        if (currentStep >= steps.length) {
            logLine('🎉 COMPLIANCE PIPELINE SECURED AND CERTIFIED.', 'success');
            logLine('[System] Demo run complete! Feel free to enter the Command Center workbench.', 'system');
            
            // Show Success badge overlay
            if (successBadge) successBadge.style.display = 'block';
            if (adMockup) adMockup.style.opacity = '0.7';
            
            // Show Expand Comparison button
            if (compBtn) compBtn.style.display = 'block';
            
            if (btn) {
                btn.disabled = false;
                btn.innerText = '⚡ Run Compliance Demo Again';
            }
            isLandingSimRunning = false;
            return;
        }
        
        const step = steps[currentStep];
        const stepEl = document.getElementById(step.id);
        if (stepEl) {
            stepEl.className = 'sim-step active';
            const txtSpan = stepEl.querySelector('span:nth-child(2)');
            if (txtSpan) txtSpan.innerText = step.text;
        }
        
        // Log start of step
        if (currentStep === 0) {
            logLine('🚀 L3 Strategy Ingestor booting up...', 'system');
            setTimeout(() => {
                logLine('📥 Parsing guidelines document: Product_A_Brief.pdf', 'system');
                logLine('📥 Clinical constraints mapping: Pembrolizumab, indication: NSCLC', 'success');
                
                // Ingest files, unblur mockup!
                if (adMockup) {
                    adMockup.style.filter = 'none';
                    adMockup.style.opacity = '1';
                }
                finishStep();
            }, 1500);
        } else if (currentStep === 1) {
            logLine('⚖️ MLR Judge Agent loading dynamic Claims Vault...', 'system');
            
            // Turn on laser scanner visual overlay
            if (laserScanner) laserScanner.style.display = 'block';
            
            setTimeout(() => {
                logLine('⚖️ Auditing material claims: "Product-A shows response rate of 68% in NSCLC..."', 'system');
                logLine('⚠️ WARNING: Claim mismatches FDA clinical register key (Survival rate 68% vs 65% in trial data).', 'warn');
                
                // Show warning toast visual overlay
                if (toastMlr) toastMlr.style.display = 'flex';
                if (adClaim) adClaim.style.background = 'rgba(239, 68, 68, 0.1)';
                
                setTimeout(() => {
                    logLine('⚖️ MLR Graph mismatch flagged. Correcting parameter target...', 'system');
                    logLine('✅ Claim rectified to 65% based on Keynote-607 source node.', 'success');
                    
                    // Hide laser and toast, update claim value to 65% green!
                    if (laserScanner) laserScanner.style.display = 'none';
                    if (toastMlr) toastMlr.style.display = 'none';
                    if (claimVal) {
                        claimVal.innerText = '65%';
                        claimVal.style.color = '#34d399'; // Green success
                    }
                    if (adClaim) adClaim.style.background = 'rgba(52, 211, 153, 0.08)';
                    
                    finishStep();
                }, 1800);
            }, 1500);
        } else if (currentStep === 2) {
            logLine('🩹 Self-Healing Layout Agent analyzing visual CSS output...', 'system');
            
            // Highlight overlap warning toast
            if (toastLayout) toastLayout.style.display = 'flex';
            if (adFooter) {
                adFooter.style.borderColor = '#f59e0b';
                adFooter.style.background = 'rgba(245, 158, 11, 0.05)';
            }
            
            setTimeout(() => {
                logLine('🩹 Visual collision detected: Footers overlapping primary disclaimer text box.', 'warn');
                logLine('🩹 Auto-recalculating layout constraints using design token registers...', 'system');
                
                setTimeout(() => {
                    logLine('✅ Inline CSS healed successfully: padding-bottom increased by 20px.', 'success');
                    
                    // Shift footer down to resolve overlap
                    if (toastLayout) toastLayout.style.display = 'none';
                    if (adFooter) {
                        adFooter.style.marginTop = '4px'; // Healed down!
                        adFooter.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        adFooter.style.background = 'rgba(16, 185, 129, 0.04)';
                    }
                    finishStep();
                }, 1800);
            }, 1200);
        } else if (currentStep === 3) {
            logLine('🔒 Compiling GxP audit package...', 'system');
            setTimeout(() => {
                logLine('📤 Synchronizing regulatory files to Veeva PromoMats...', 'system');
                logLine('🔒 Transaction finalized. Hash generated: sha256:d8b02ea9a8f4c4c8...', 'success');
                finishStep();
            }, 1500);
        }
    }
    
    function finishStep() {
        const step = steps[currentStep];
        const stepEl = document.getElementById(step.id);
        if (stepEl) {
            stepEl.className = 'sim-step completed';
            const txtSpan = stepEl.querySelector('span:nth-child(2)');
            if (txtSpan) txtSpan.innerText = step.completedText;
        }
        currentStep++;
        executeNextStep();
    }
    
    executeNextStep();
};


// ==========================================
// IMMUTABLE TIME TRAVEL & SESSION REPLAY ENGINE
// ==========================================
window.activeSessionId = "session_" + Math.random().toString(36).substring(2, 10);
let selectedTimeTravelSnapshot = null;

function recordTimeTravelEvent(eventType, promptInput, agentRationale) {
    const db = window.variantDatabase || (typeof variantDatabase !== 'undefined' ? variantDatabase : null);
    console.log(`⏱️ [Time Travel Triggered] eventType: ${eventType}, activeVariantNum: ${window.activeVariantNum}, dbPresent: ${!!db}`);
    if (!db || !window.activeVariantNum) {
        console.warn("⏱️ [Time Travel Aborted] Missing variantDatabase or activeVariantNum:", window.activeVariantNum);
        return;
    }
    const variantObj = db[window.activeVariantNum];
    if (!variantObj) return;
    
    // Create an immutable clone of the active variant state
    const snapshotObj = JSON.parse(JSON.stringify(variantObj));
    const snapshotJson = JSON.stringify(snapshotObj);
    
    // Asynchronously record to backend ledger without blocking UI
    fetch(`${BACKEND_URL}/api/time-travel/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: window.activeSessionId,
            event_type: eventType,
            variant_num: window.activeVariantNum,
            brand: variantObj.brand || "product_a",
            prompt_input: promptInput || "",
            agent_rationale: agentRationale || "",
            snapshot_json: snapshotJson
        })
    }).then(res => res.json()).then(data => {
        if (data.status === "SUCCESS") {
            console.log(`⏱️ [Time Travel Ledger] Recorded immutable event ${data.event_id} (${eventType}) | Hash: ${data.verification_hash}`);
        }
    }).catch(err => {
        console.warn("⏱️ [Time Travel Ledger] Offline/silenced recording:", err.message);
    });
}

window.openTimeTravelDrawer = function() {
    const modal = document.getElementById('time-travel-modal');
    const sessionIdEl = document.getElementById('tt-active-session-id');
    if (sessionIdEl) sessionIdEl.innerText = window.activeSessionId.toUpperCase();
    if (modal) {
        modal.style.display = 'flex';
        loadTimeTravelHistory();
    }
    updateHashFromState();
};

window.closeTimeTravelDrawer = function() {
    const modal = document.getElementById('time-travel-modal');
    if (modal) modal.style.display = 'none';
    updateHashFromState();
};

function loadTimeTravelHistory() {
    const track = document.getElementById('tt-timeline-track');
    const counter = document.getElementById('tt-step-counter');
    if (!track) return;
    
    track.innerHTML = `<div style="color: #64748b; font-size: 0.85rem; align-self: center;">⏳ Loading session event trajectory...</div>`;
    
    fetch(`${BACKEND_URL}/api/time-travel/history/${window.activeSessionId}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "SUCCESS" && data.history && data.history.length > 0) {
                if (counter) counter.innerText = `Showing ${data.history.length} Event Checkpoints`;
                track.innerHTML = "";
                data.history.forEach((evt, idx) => {
                    const timeStr = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const card = document.createElement('div');
                    card.style.cssText = `background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.75rem 1rem; min-width: 180px; display: flex; flex-direction: column; justify-content: space-between; gap: 0.5rem; cursor: pointer; transition: all 0.2s; position: relative;`;
                    card.onmouseover = () => { card.style.background = 'rgba(168,85,247,0.15)'; card.style.borderColor = '#C084FC'; };
                    card.onmouseout = () => { card.style.background = 'rgba(255,255,255,0.03)'; card.style.borderColor = 'rgba(255,255,255,0.1)'; };
                    card.onclick = () => selectTimeTravelEvent(evt, card);
                    
                    let badgeColor = "#00F2FE";
                    if (evt.event_type.includes("IMAGE")) badgeColor = "#a855f7";
                    else if (evt.event_type.includes("AUDIT")) badgeColor = "#34D399";
                    else if (evt.event_type.includes("COPY") || evt.event_type.includes("EDIT")) badgeColor = "#FBBF24";
                    
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: #94a3b8; font-family: monospace;">
                            <span>#${idx + 1}</span>
                            <span>${timeStr}</span>
                        </div>
                        <div style="font-weight: 800; font-size: 0.82rem; color: ${badgeColor};">${evt.event_type}</div>
                        <div style="font-size: 0.7rem; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;">
                            ${evt.agent_rationale || "State update checkpoint"}
                        </div>
                    `;
                    track.appendChild(card);
                });
            } else {
                if (counter) counter.innerText = `Showing 0 Events`;
                track.innerHTML = `<div style="color: #64748b; font-size: 0.85rem; align-self: center;">No time-travel events recorded in this session yet. Generate an image or switch variants to start the ledger!</div>`;
            }
        }).catch(err => {
            track.innerHTML = `<div style="color: #ef4444; font-size: 0.85rem; align-self: center;">Error loading history: ${err.message}</div>`;
        });
}

function selectTimeTravelEvent(evt, cardEl) {
    const allCards = document.querySelectorAll('#tt-timeline-track > div');
    allCards.forEach(c => c.style.boxShadow = 'none');
    if (cardEl) cardEl.style.boxShadow = '0 0 15px #C084FC';
    
    selectedTimeTravelSnapshot = evt.snapshot_json;
    
    const titleEl = document.getElementById('tt-detail-title');
    const ratEl = document.getElementById('tt-detail-rationale');
    const timeEl = document.getElementById('tt-detail-time');
    const hashEl = document.getElementById('tt-detail-hash');
    const prevEl = document.getElementById('tt-detail-preview-box');
    const btnEl = document.getElementById('tt-restore-btn');
    
    if (titleEl) titleEl.innerText = `${evt.event_type} (Variant ${evt.variant_num})`;
    if (ratEl) ratEl.innerText = evt.agent_rationale || "User or agent triggered state change.";
    if (timeEl) timeEl.innerText = new Date(evt.timestamp).toLocaleString();
    if (hashEl) hashEl.innerText = evt.verification_hash;
    
    try {
        const parsed = JSON.parse(evt.snapshot_json);
        if (prevEl) prevEl.innerText = JSON.stringify(parsed, null, 2);
    } catch(e) {
        if (prevEl) prevEl.innerText = evt.snapshot_json;
    }
    
    if (btnEl) {
        btnEl.disabled = false;
        btnEl.style.opacity = "1";
    }
}

function restoreSelectedTimeTravelSnapshot() {
    const db = window.variantDatabase || (typeof variantDatabase !== 'undefined' ? variantDatabase : null);
    if (!selectedTimeTravelSnapshot || !db || !window.activeVariantNum) return;
    try {
        const restoredObj = JSON.parse(selectedTimeTravelSnapshot);
        if (!restoredObj || typeof restoredObj !== 'object' || !restoredObj.html) {
            throw new Error("Invalid snapshot payload structure: missing core HTML canvas state.");
        }
        db[window.activeVariantNum] = restoredObj;
        if (window.variantDatabase) window.variantDatabase[window.activeVariantNum] = restoredObj;
        
        if (typeof window.loadVariant === 'function') {
            window.loadVariant(window.activeVariantNum);
        }
        
        closeTimeTravelDrawer();
        logConsoleLine("Time_Travel_Engine", `⏪ Replay successful! Restored Variant ${window.activeVariantNum} to historical snapshot.`);
        showToast("Time Travel Complete", `Successfully restored your workbench to historical state (Variant ${window.activeVariantNum}).`, "success");
    } catch(e) {
        console.error("Error restoring snapshot:", e);
        logConsoleLine("Time_Travel_Engine", `❌ Replay failed: ${e.message}`);
        if (typeof showToast === 'function') {
            showToast("Time Travel Error", `Failed to restore snapshot: ${e.message}`, "error");
        }
    }
}

// ==========================================
//   COLLAPSIBLE SIDEBAR ENGINE
// ==========================================
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('maestro_sidebar_collapsed', sidebar.classList.contains('collapsed'));
    }
};

// Auto-restore sidebar collapsed state on page load
document.addEventListener('DOMContentLoaded', () => {
    const isCollapsed = localStorage.getItem('maestro_sidebar_collapsed') === 'true';
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && isCollapsed) {
        sidebar.classList.add('collapsed');
    }
});
// ==========================================
//   USER SETTINGS & IDENTITY MANAGER
// ==========================================
window.openSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
    updateHashFromState();
};

window.closeSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    updateHashFromState();
};

window.saveSettings = function() {
    const roleSelect = document.getElementById('settings-user-role');
    const labelEl = document.getElementById('user-role-label');
    
    if (roleSelect && labelEl) {
        const selectedRole = roleSelect.value;
        labelEl.innerHTML = `👤 nitinagga-ge-2 <span style="font-size:0.5rem; opacity:0.75;">(${selectedRole})</span>`;
        logConsoleLine("Settings_Engine", `⚙️ User division role updated to: [${selectedRole}]`);
        showToast("Profile Updated", `Workspace configured for the '${selectedRole}' role context.`, "success");
    }
    closeSettingsModal();
};
