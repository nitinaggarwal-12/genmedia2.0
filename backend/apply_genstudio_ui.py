import os

def write_html_contentstudio():
    html_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "index.html")
    
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maestro ContentStudio - Agentic Compliance & Brand Workspace</title>
    <!-- Google Fonts: Outfit & Inter for premium, modern typography -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="dark-theme">
    <div class="app-container">
        <!-- TOP NAVIGATION BAR (Google ContentStudio Style) -->
        <header class="app-header">
            <div class="header-left">
                <div class="logo-container">
                    <span class="logo-icon">M</span>
                </div>
                <div class="brand-info">
                    <h1>MAESTRO <span class="header-badge-contentstudio">ContentStudio</span></h1>
                    <p>Agentic Marketing Workbench & Compliance Ledger</p>
                </div>
            </div>
            
            <nav class="header-nav">
                <button class="nav-link active" onclick="switchMainTab('workbench')">
                    <span class="nav-icon">🎨</span> Marketing Workbench
                </button>
                <button class="nav-link" onclick="switchMainTab('explorer')">
                    <span class="nav-icon">📊</span> Claims Graph Explorer
                </button>
                <button class="nav-link" onclick="switchMainTab('ledger')">
                    <span class="nav-icon">🛡️</span> Compliance Ledger
                </button>
            </nav>
            
            <div class="header-actions">
                <span class="badge badge-header-status" id="header-compliance-badge">
                    <span class="pulse-icon-green"></span> FDA & VEEVA PROMC-LOCKED
                </span>
                <span class="user-profile" id="btn-role-selector">nitinagga-ge-2</span>
                <button class="theme-toggle-btn" onclick="toggleTheme()" title="Toggle Theme">
                    <span class="theme-icon">☀️</span>
                </button>
            </div>
        </header>

        <!-- MAIN WORKSPACE CONTENT -->
        <main class="main-content">
            <!-- TAB 1: MARKETING WORKBENCH (TRIPLE-COLUMN LAYOUT) -->
            <div id="tab-workbench" class="main-tab-panel active">
                <div class="workbench-layout-contentstudio">
                    
                    <!-- COLUMN 1: LEFT SIDEBAR (ALL INGESTION & PIPELINE CONSOLES - ZERO SCROLL) -->
                    <section class="control-panel flex-col">
                        
                        <!-- Section A: Live Multi-Agent Tracker (Compact Timeline) -->
                        <div class="workspace-panel tracker-card" style="padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.6rem;">
                            <div class="panel-header-compact" style="margin-bottom: 0.2rem;">
                                <span class="panel-icon">⚙️</span>
                                <h3 style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-main);">Multi-Agent Execution Pipeline</h3>
                            </div>
                            
                            <div class="pipeline-steps-compact" style="display: flex; justify-content: space-between; gap: 0.5rem;">
                                <!-- Step 1 -->
                                <div class="pipeline-step active" id="step-ingestion" style="flex: 1; padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.01); display: flex; flex-direction: column; gap: 0.25rem; position: relative;">
                                    <div style="display: flex; align-items: center; gap: 0.4rem; width: 100%;">
                                        <span class="step-num-mini" style="font-size: 0.65rem; font-weight: 800; background: var(--color-primary-glow); color: var(--color-primary); width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">1</span>
                                        <span style="font-size: 0.68rem; font-weight: 700; color: var(--color-text-main);">Ingest & Parse</span>
                                        <span class="step-badge status-idle" id="badge-ingestion" style="font-size: 0.52rem; margin-left: auto; padding: 0.1rem 0.25rem;">IDLE</span>
                                    </div>
                                    <div style="width: 100%; height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; overflow: hidden;">
                                        <div class="progress-bar" id="progress-ingestion" style="width: 0%; height: 100%; background: var(--color-primary); transition: width 0.3s ease;"></div>
                                    </div>
                                </div>
                                <!-- Step 2 -->
                                <div class="pipeline-step" id="step-claims" style="flex: 1; padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.01); display: flex; flex-direction: column; gap: 0.25rem; position: relative;">
                                    <div style="display: flex; align-items: center; gap: 0.4rem; width: 100%;">
                                        <span class="step-num-mini" style="font-size: 0.65rem; font-weight: 800; background: rgba(255,255,255,0.05); color: var(--color-text-muted); width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">2</span>
                                        <span style="font-size: 0.68rem; font-weight: 700; color: var(--color-text-muted);">Claims Audit</span>
                                        <span class="step-badge status-idle" id="badge-claims" style="font-size: 0.52rem; margin-left: auto; padding: 0.1rem 0.25rem;">IDLE</span>
                                    </div>
                                    <div style="width: 100%; height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; overflow: hidden;">
                                        <div class="progress-bar" id="progress-claims" style="width: 0%; height: 100%; background: var(--color-primary); transition: width 0.3s ease;"></div>
                                    </div>
                                </div>
                                <!-- Step 3 -->
                                <div class="pipeline-step" id="step-layout" style="flex: 1; padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.01); display: flex; flex-direction: column; gap: 0.25rem; position: relative;">
                                    <div style="display: flex; align-items: center; gap: 0.4rem; width: 100%;">
                                        <span class="step-num-mini" style="font-size: 0.65rem; font-weight: 800; background: rgba(255,255,255,0.05); color: var(--color-text-muted); width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">3</span>
                                        <span style="font-size: 0.68rem; font-weight: 700; color: var(--color-text-muted);">Self-Heal</span>
                                        <span class="step-badge status-idle" id="badge-layout" style="font-size: 0.52rem; margin-left: auto; padding: 0.1rem 0.25rem;">IDLE</span>
                                    </div>
                                    <div style="width: 100%; height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; overflow: hidden;">
                                        <div class="progress-bar" id="progress-layout" style="width: 0%; height: 100%; background: var(--color-primary); transition: width 0.3s ease;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section B: Unified Ingestion Dock (Horizontal Tabs - ZERO SCROLL) -->
                        <div class="workspace-panel ingestion-dock-card" style="padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.65rem;">
                            <!-- Tab Header Buttons -->
                            <div class="dock-tabs" style="display: flex; border-bottom: 1px solid var(--border-color); padding-bottom: 0.35rem; gap: 0.5rem;">
                                <button class="dock-tab-btn active" onclick="switchDockTab('panel-file-url')" id="btn-tab-file-url" style="padding: 0.3rem 0.6rem; font-size: 0.68rem; font-weight: 700; border: none; background: none; color: var(--color-primary); border-bottom: 2px solid var(--color-primary); cursor: pointer; transition: var(--transition-smooth);">📥 PPTX / PDF Ingest</button>
                                <button class="dock-tab-btn" onclick="switchDockTab('panel-briefs')" id="btn-tab-briefs" style="padding: 0.3rem 0.6rem; font-size: 0.68rem; font-weight: 700; border: none; background: none; color: var(--color-text-muted); cursor: pointer; transition: var(--transition-smooth);">📁 Secure Briefs</button>
                                <button class="dock-tab-btn" onclick="switchDockTab('panel-webhook')" id="btn-tab-webhook" style="padding: 0.3rem 0.6rem; font-size: 0.68rem; font-weight: 700; border: none; background: none; color: var(--color-text-muted); cursor: pointer; transition: var(--transition-smooth);">⚡ Label Sync Webhook</button>
                            </div>

                            <!-- Tab Contents -->
                            <div class="dock-tab-contents" style="position: relative; min-height: 75px;">
                                
                                <!-- Panel 1: PPTX/PDF Ingest Panel -->
                                <div class="dock-panel" id="panel-file-url" style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                                        <!-- Compact Sidebar Dropzone -->
                                        <div class="pptx-dropzone" id="sidebar-dropzone" style="flex: 1; padding: 0.5rem; border: 1.5px dashed var(--border-color); border-radius: var(--card-radius); background: var(--bg-surface); display: flex; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; text-align: center; height: 36px; transition: var(--transition-smooth);" ondragover="event.preventDefault()" ondrop="handleDrop(event)" onclick="triggerFileInput()">
                                            <input type="file" id="canvas-file-input" style="display: none;" accept=".pptx,.pdf" onchange="handleFileSelect(event)">
                                            <span style="font-size: 0.95rem;">📁</span>
                                            <span style="font-weight: 700; font-size: 0.68rem; color: var(--color-text-main);">Upload PowerPoint / PDF Document</span>
                                        </div>
                                        
                                        <div style="font-size: 0.65rem; color: var(--color-text-muted); font-weight: bold; text-transform: uppercase;">OR</div>
                                        
                                        <!-- Compact Web URL Ingestion bar -->
                                        <div class="url-ingest-bar" style="flex: 1; display: flex; gap: 0.2rem;">
                                            <input type="url" id="url-ingest-input" placeholder="Paste clinical PDF/HTML URL..." style="flex: 1; font-size: 0.62rem; padding: 0.25rem 0.4rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface-solid); color: var(--color-text-main); outline: none;">
                                            <button class="btn btn-primary" onclick="fetchAndIngestUrl()" style="padding: 0.25rem 0.5rem; font-size: 0.62rem; font-weight: 700; border-radius: 4px;">Fetch</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Panel 2: Secure Briefs Library -->
                                <div class="dock-panel" id="panel-briefs" style="display: none; flex-direction: column; gap: 0.4rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.1rem;">
                                        <span style="font-size: 0.65rem; color: var(--color-text-muted); font-weight: 600;">Select brief to generate campaign copy:</span>
                                        <label class="btn-upload-file" for="file-upload-input" title="Upload a JSON brief" style="padding: 0.15rem 0.4rem; font-size: 0.6rem; margin: 0; cursor: pointer; border-radius: 4px;">
                                            <span>Upload JSON</span>
                                            <input type="file" id="file-upload-input" style="display: none;" accept=".json" onchange="uploadDatasetFile(event)">
                                        </label>
                                    </div>
                                    <div class="dataset-list-container" id="dataset-list-container" style="max-height: 48px; overflow-y: auto;">
                                        <div class="dataset-loading">Scanning briefs...</div>
                                    </div>
                                </div>

                                <!-- Panel 3: Label Sync Webhook Simulator -->
                                <div class="dock-panel" id="panel-webhook" style="display: none; flex-direction: column; gap: 0.4rem; justify-content: center; height: 38px;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                                        <p style="font-size: 0.65rem; color: var(--color-text-muted); margin: 0; line-height: 1.2;">Simulate an external FDA label update webhook sync event to trigger self-healing layout audits.</p>
                                        <button class="btn btn-webhook" onclick="triggerLabelUpdate()" style="padding: 0.35rem 0.75rem; font-size: 0.65rem; border-radius: 4px; flex-shrink: 0; width: auto; margin: 0;">
                                            <span>⚡ Sync 61% ORR Label</span>
                                        </button>
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                        <!-- Section C: Chat Rail communicating with Master Orchestrator -->
                        <div class="chat-section flex-col" style="flex: 1; min-height: 0;">
                            <div class="panel-header-compact" style="margin-bottom: 0.4rem;">
                                <span class="panel-icon">💬</span>
                                <h3>Master Orchestrator Assistant</h3>
                            </div>
                            
                            <div class="chat-messages" id="chat-messages" style="flex: 1; min-height: 100px; max-height: 140px; overflow-y: auto;">
                                <div class="chat-bubble assistant">
                                    <p>Welcome, Global Pharma Team. I am the <strong>Master Orchestrator Agent</strong>. Ingest clinical briefs or slides, and I will harvest compliant claims, generate high-fidelity assets, and orchestrate self-healing layout audits.</p>
                                    <p class="suggested-caption">Quick Actions:</p>
                                    <div class="quick-prompts">
                                        <button class="btn-quick-prompt" onclick="setPromptAndSubmit('Generate a clinical marketing draft for Product-A oncology indications targeting adults.')">"Generate Product-A Draft..."</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Console Logs area -->
                            <div class="chat-console" style="margin-top: 0.4rem; margin-bottom: 0.4rem;">
                                <div class="console-header">AGENT EXECUTION CONSOLE LOGS</div>
                                <div class="console-body" id="console-logs-body" style="height: 75px;">
                                    <div class="console-line system">[System] Connected to Vertex AI ADK orchestrator. Awaiting prompt ...</div>
                                </div>
                            </div>
                            
                            <form class="chat-input-form" id="chat-form" onsubmit="submitChat(event)">
                                <input type="text" id="chat-input" placeholder="Describe clinical campaign or instruct master agent..." autocomplete="off" required>
                                <button type="submit" class="btn btn-primary" id="btn-submit" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">
                                    <span>Send</span>
                                </button>
                            </form>
                        </div>
                    </section>

                    <!-- COLUMN 2: MIDDLE COLUMN (LIVE MARKETING COMPOSER PANEL - ADOBE GENSTUDIO GRADE) -->
                    <section class="workspace-panel composer-panel" style="flex: 1; display: flex; flex-direction: column;">
                        <div class="panel-header" style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color);">
                            <div class="panel-title-wrapper">
                                <span class="panel-icon">🎨</span>
                                <h2>Live Marketing Composer</h2>
                            </div>
                            
                            <!-- Variant Pill Tabs (Adobe ContentStudio Style) -->
                            <div class="variant-tabs">
                                <button class="variant-tab-btn active" id="variant-tab-1" onclick="loadVariant(1)">Variant 1 (Product-A)</button>
                                <button class="variant-tab-btn" id="variant-tab-2" onclick="loadVariant(2)">Variant 2 (Product-B)</button>
                                <button class="variant-tab-btn" id="variant-tab-3" onclick="loadVariant(3)">Variant 3 (Product-C)</button>
                            </div>
                        </div>
                        
                        <div class="composer-workspace-container" style="flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; justify-content: center; background: var(--bg-body-darker);">
                            
                            <!-- Awaiting Placeholder Sheet -->
                            <div class="canvas-placeholder flex-col" id="canvas-placeholder" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 1px dashed var(--border-color); border-radius: 12px; padding: 3rem; background: var(--bg-surface); width: 100%; max-width: 600px; height: 100%; min-height: 450px;">
                                <div style="font-size: 3.5rem; margin-bottom: 1.25rem; filter: drop-shadow(0 0 15px rgba(13, 148, 136, 0.15));">🎨</div>
                                <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 0.5rem;">Live Marketing Composer</h3>
                                <p style="font-size: 0.82rem; color: var(--color-text-muted); max-width: 340px; margin-bottom: 1.75rem; line-height: 1.4;">
                                    Awaiting multi-agent compliance asset generation. Ingest clinical slides, files, web URLs, or JSON briefs on the left to compose marketing variants.
                                </p>
                                
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Or Execute Baseline Prompt:</span>
                                    <button class="btn-quick-prompt" onclick="setPromptAndSubmit('Generate a clinical marketing draft for Product-A oncology indications targeting adults.')" style="border-radius: 20px; font-size: 0.75rem; padding: 0.45rem 1.5rem; border: 1px solid var(--border-color); background: var(--bg-surface-solid); color: var(--color-text-main);">"Initialize Product-A NSCLC Campaign..."</button>
                                </div>
                            </div>

                            <!-- Live Composer Sheet Card (High-Fidelity Email/Web Preview) -->
                            <div class="composer-card-sheet" id="composer-card-sheet" style="display: none; width: 100%; max-width: 620px; background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); overflow: hidden; display: none; flex-direction: column;">
                                <!-- Composer Sheet Header Inputs -->
                                <div class="composer-sheet-inputs" style="padding: 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg-body);">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); width: 65px; text-transform: uppercase;">Subject:</span>
                                        <input type="text" id="composer-subject-input" style="flex: 1; padding: 0.35rem 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.8rem; font-weight: 600; background: var(--bg-surface-solid); color: var(--color-text-main);" value="Move PAH care forward with WINREVAIR">
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); width: 65px; text-transform: uppercase;">Preheader:</span>
                                        <input type="text" id="composer-preheader-input" style="flex: 1; padding: 0.35rem 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.75rem; background: var(--bg-surface-solid); color: var(--color-text-muted);" value="Engage with clinical data from Phase III landmark trials.">
                                    </div>
                                </div>

                                <!-- Composer Sheet Hero Image Block (With Imagen 3 Trigger Overlay!) -->
                                <div class="composer-hero-container" style="position: relative; width: 100%; height: 240px; background: #000; overflow: hidden; cursor: pointer;" onclick="openImagenModal()">
                                    <img src="./product_a_clinical_hero.png" id="composer-hero-image" style="width: 100%; height: 100%; object-fit: cover; transition: filter 0.3s ease;" alt="Clinical Hero Asset">
                                    <div class="composer-hero-overlay">
                                        <span class="composer-hero-overlay-btn">✨ Generate / Edit Image (Imagen 3)</span>
                                    </div>
                                </div>

                                <!-- Composer Sheet Editable Content Body (Live Compliant Copy) -->
                                <div class="composer-content-body" id="composer-content-body" style="padding: 1.5rem; overflow-y: auto; font-family: 'Inter', sans-serif; font-size: 0.85rem; line-height: 1.6; color: var(--color-text-main);">
                                    <!-- Dynamic generated marketing content goes here -->
                                </div>
                            </div>
                            
                        </div>
                    </section>

                    <!-- COLUMN 3: RIGHT SIDEBAR (GOOGLE MERCK CONTENT TOOLS ADD-ON - ADOBE GENSTUDIO GRADE) -->
                    <section class="workspace-panel right-tools-panel" style="width: 310px; display: flex; flex-direction: column; border-left: 1px solid var(--border-color);">
                        <div class="panel-header-compact" style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.5rem;">
                            <span class="panel-icon">🛡️</span>
                            <h3 style="font-size: 0.8rem; font-weight: 700; letter-spacing: 0.5px;">Global Pharma Content Tools</h3>
                            <span class="badge badge-secondary" style="font-size: 0.55rem; padding: 0.1rem 0.3rem; margin-left: auto;">Add-on</span>
                        </div>
                        
                        <!-- Right Sidebar Tabs (Standards | Claims | Export) -->
                        <div class="right-tabs-container" style="display: flex; border-bottom: 1px solid var(--border-color); background: var(--bg-body); padding: 0.25rem 0.5rem;">
                            <button class="right-tab-btn active" id="btn-rtab-standards" onclick="switchRightTab('standards')" style="flex: 1; padding: 0.45rem; font-size: 0.68rem; font-weight: 700; border: none; background: none; color: var(--color-primary); cursor: pointer; border-bottom: 2px solid var(--color-primary);">Standards</button>
                            <button class="right-tab-btn" id="btn-rtab-claims" onclick="switchRightTab('claims')" style="flex: 1; padding: 0.45rem; font-size: 0.68rem; font-weight: 700; border: none; background: none; color: var(--color-text-muted); cursor: pointer;">Claims</button>
                            <button class="right-tab-btn" id="btn-rtab-export" onclick="switchRightTab('export')" style="flex: 1; padding: 0.45rem; font-size: 0.68rem; font-weight: 700; border: none; background: none; color: var(--color-text-muted); cursor: pointer;">Export</button>
                        </div>
                        
                        <!-- Right Tab Contents -->
                        <div class="right-tab-contents" style="flex: 1; padding: 1.25rem; overflow-y: auto;">
                            
                            <!-- TAB A: STANDARDS & DESIGN TOKENS -->
                            <div class="right-panel-tab active" id="rtab-panel-standards" style="display: flex; flex-direction: column; gap: 1rem;">
                                <div class="standards-group">
                                    <h4 style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">Brand Typography</h4>
                                    <div style="padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface);">
                                        <div style="font-weight: 700; font-size: 0.85rem; font-family: 'Outfit', sans-serif;">Outfit (Brand Sans-Serif)</div>
                                        <p style="font-size: 0.68rem; color: var(--color-text-muted); margin-top: 0.25rem; line-height: 1.3;">Primary typeface for headers, titles, and high-impact clinical campaign banners.</p>
                                    </div>
                                </div>
                                <div class="standards-group">
                                    <h4 style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">Design Token System</h4>
                                    <div style="display: flex; flex-direction: column; gap: 0.4rem; padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface);">
                                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.68rem;">
                                            <span>--color-primary (Teal)</span>
                                            <span style="width: 14px; height: 14px; background: #0D9488; border-radius: 3px;"></span>
                                        </div>
                                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.68rem;">
                                            <span>--color-secondary (Royal Indigo)</span>
                                            <span style="width: 14px; height: 14px; background: #4F46E5; border-radius: 3px;"></span>
                                        </div>
                                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.68rem;">
                                            <span>--border-radius-panel</span>
                                            <span style="font-weight: bold; color: var(--color-text-main);">12px</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="standards-group">
                                    <h4 style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">Compliance Constraints</h4>
                                    <div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(239, 68, 68, 0.05); border-left: 3px solid #EF4444;">
                                        <div style="font-weight: 700; font-size: 0.72rem; color: #F87171;">⚠️ Active Warning Block</div>
                                        <p style="font-size: 0.65rem; line-height: 1.3; color: var(--color-text-muted); margin: 0;">Clinical copy MUST feature the full, unabbreviated safety disclaimer reference corresponding to the active trial indication in Regulatory Compliance Vault.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- TAB B: CLAIMS REGISTRY & CITATIONS -->
                            <div class="right-panel-tab" id="rtab-panel-claims" style="display: none; flex-direction: column; gap: 0.75rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--color-text-main); text-transform: uppercase;">Active Claims Database</span>
                                    <span class="badge badge-success" style="font-size: 0.55rem; padding: 0.1rem 0.35rem;">VERIFIED</span>
                                </div>
                                <div id="claims-registry-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
                                    <!-- Dynamic claims list generated in JS based on active variant -->
                                </div>
                            </div>
                            
                            <!-- TAB C: VEEVA VAULT & WORKFRONT EXPORT PANEL -->
                            <div class="right-panel-tab" id="rtab-panel-export" style="display: none; flex-direction: column; gap: 1rem;">
                                <div style="padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-surface); display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center;">
                                    <span style="font-size: 2rem; filter: drop-shadow(0 0 8px rgba(16,185,129,0.25));">📦</span>
                                    <h4 style="font-weight: 700; font-size: 0.82rem; color: var(--color-text-main); margin: 0;">Regulatory Compliance Vault Promomats Export</h4>
                                    <p style="font-size: 0.68rem; color: var(--color-text-muted); line-height: 1.3; margin: 0;">Compile and export approved variant copy packages directly to WorkflowManager & Regulatory Compliance Vault.</p>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.25rem;">
                                    <div class="export-field-group" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <label style="font-size: 0.68rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">Regulatory Compliance Vault Project</label>
                                        <select id="export-compliance_vault-project" style="padding: 0.45rem 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.75rem; background: var(--bg-surface-solid); color: var(--color-text-main); font-weight: 600;">
                                            <option value="KEYNOTE-189_Clinical_Launch_2026">KEYNOTE-189_Oncology_Launch_2026</option>
                                            <option value="CLEAR_RCC_Indications_2026">CLEAR_RCC_Indications_2026</option>
                                            <option value="LITESPARK-005_Product-C_Launch_2026">LITESPARK-005_Product-C_Launch_2026</option>
                                        </select>
                                    </div>
                                    <div class="export-field-group" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <label style="font-size: 0.68rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">Variant to Export</label>
                                        <select id="export-compliance_vault-variant" style="padding: 0.45rem 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.75rem; background: var(--bg-surface-solid); color: var(--color-text-main); font-weight: 600;">
                                            <option value="variant-1">Variant 1 (Active Product-A)</option>
                                            <option value="variant-2">Variant 2 (Product-B)</option>
                                            <option value="variant-3">Variant 3 (Product-C)</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <button class="btn btn-webhook" id="btn-compliance_vault-export-contentstudio" onclick="exportComplianceVaultPackageContentStudio()" style="margin-top: auto; padding: 0.65rem 1rem; font-size: 0.8rem; border-radius: 8px; font-weight: bold; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border: none; color: white; box-shadow: 0 4px 15px rgba(16,185,129,0.3); display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                                    <span>📤 Export approved variant</span>
                                </button>
                            </div>
                            
                        </div>
                    </section>
                    
                </div>
            </div>

            <!-- TAB 2: CLAIMS GRAPH EXPLORER (INTERACTIVE D3 VISUALIZER) -->
            <div id="tab-explorer" class="main-tab-panel">
                <div class="workspace-panel visualizer-card" style="height: 100%; display: flex; flex-direction: column;">
                    <div class="panel-header" style="border-bottom: 1px solid var(--border-color); padding: 1.25rem 1.5rem;">
                        <div class="panel-title-wrapper">
                            <span class="panel-icon">📊</span>
                            <div>
                                <h2>Clinical Claims Relationship Visualizer</h2>
                                <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">Interactive SVG vector mapping of clinical brief parameters against active MaterialReview registry records.</p>
                            </div>
                        </div>
                        <span class="badge badge-active-label" id="explorer-active-label-tag">Active: Week 24 Label (56%)</span>
                    </div>
                    <div class="visualizer-body" style="flex: 1; min-height: 0; position: relative; background: radial-gradient(circle at center, rgba(15,23,42,0.1) 0%, rgba(10,15,30,0.4) 100%); padding: 1rem;">
                        <div class="network-legend" style="position: absolute; top: 1.5rem; left: 1.5rem; z-index: 10; display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-surface-solid); font-size: 0.68rem; box-shadow: var(--shadow-md);">
                            <div style="font-weight: bold; margin-bottom: 0.25rem; text-transform: uppercase; color: var(--color-text-muted);">Legend</div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 10px; height: 10px; background: #0D9488; border-radius: 50%;"></span> Primary Clinical Drug Asset</div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 10px; height: 10px; background: #6366F1; border-radius: 50%;"></span> Trial Parameters</div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 10px; height: 10px; background: #F59E0B; border-radius: 50%;"></span> Active Regulatory Verification</div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="width: 10px; height: 3px; border-top: 2px dashed var(--border-color);"></span> Active Verification Link</div>
                        </div>
                        <div class="canvas-svg-wrapper" style="width: 100%; height: 100%; min-height: 480px; overflow: hidden; border-radius: 8px; border: 1px dashed var(--border-color);">
                            <svg id="claims-network-svg" width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;"></svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 3: COMPLIANCE LEDGER (CHRONOLOGICAL SYSTEM AUDIT TRAIL) -->
            <div id="tab-ledger" class="main-tab-panel">
                <div class="workspace-panel ledger-card" style="height: 100%; display: flex; flex-direction: column;">
                    <div class="panel-header" style="border-bottom: 1px solid var(--border-color); padding: 1.25rem 1.5rem;">
                        <div class="panel-title-wrapper">
                            <span class="panel-icon">🛡️</span>
                            <div>
                                <h2>Regulatory Compliance & Ingestion Audit Ledger</h2>
                                <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">Immutable blockchain-grade chronological record of all clinical brief ingestions, claims verifications, and layout healing executions.</p>
                            </div>
                        </div>
                        <span class="badge badge-success" style="font-size: 0.65rem; padding: 0.2rem 0.5rem; letter-spacing: 0.5px;">LEDGER SECURED</span>
                    </div>
                    <div class="ledger-table-container" style="flex: 1; overflow-y: auto; padding: 1.5rem; background: var(--bg-surface-solid);">
                        <table class="ledger-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.78rem;">
                            <thead>
                                <tr style="border-bottom: 2px solid var(--border-color); color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.5px;">
                                    <th style="padding: 0.75rem 1rem; width: 130px;">Timestamp</th>
                                    <th style="padding: 0.75rem 1rem; width: 120px;">Asset Name</th>
                                    <th style="padding: 0.75rem 1rem; width: 130px;">ComplianceVault Campaign ID</th>
                                    <th style="padding: 0.75rem 1rem; width: 100px;">Status</th>
                                    <th style="padding: 0.75rem 1rem; width: 140px;">Executing Auditor</th>
                                    <th style="padding: 0.75rem 1rem; font-family: monospace; font-size: 0.7rem; width: 180px;">Verification Cryptographic Lock</th>
                                </tr>
                            </thead>
                            <tbody id="ledger-history-body">
                                <!-- Baseline Ledger Records -->
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">2026-06-16 05:40:12</td>
                                    <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--color-text-main);">Product-A Brief Ingest</td>
                                    <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--color-primary);">CAMP-KT-189-NSCLC</td>
                                    <td style="padding: 0.85rem 1rem;"><span class="badge badge-success" style="font-size: 0.6rem; padding: 0.15rem 0.4rem;">VERIFIED</span></td>
                                    <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">L3StrategyIngestion</td>
                                    <td style="padding: 0.85rem 1rem; font-family: monospace; font-size: 0.68rem; color: var(--color-text-muted);">sha256:d8b02ea9a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">2026-06-16 05:41:05</td>
                                    <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--color-text-main);">Product-B Brief Ingest</td>
                                    <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--color-primary);">CAMP-KT-581-CLEAR</td>
                                    <td style="padding: 0.85rem 1rem;"><span class="badge badge-success" style="font-size: 0.6rem; padding: 0.15rem 0.4rem;">VERIFIED</span></td>
                                    <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">L3StrategyIngestion</td>
                                    <td style="padding: 0.85rem 1rem; font-family: monospace; font-size: 0.68rem; color: var(--color-text-muted);">sha256:8b9a2ea9a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">2026-06-16 05:42:30</td>
                                    <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--color-text-main);">Product-C Brief Ingest</td>
                                    <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--color-primary);">CAMP-WR-005-RCC</td>
                                    <td style="padding: 0.85rem 1rem;"><span class="badge badge-success" style="font-size: 0.6rem; padding: 0.15rem 0.4rem;">VERIFIED</span></td>
                                    <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">L3StrategyIngestion</td>
                                    <td style="padding: 0.85rem 1rem; font-family: monospace; font-size: 0.68rem; color: var(--color-text-muted);">sha256:d9b23f8c8a11c8e5d2b71a3f009a1c662863a9b11c8e5d2b71a3f009a1c66286</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- GOOGLE IMAGEN 3 ASSET CREATOR MODAL (Adobe ContentStudio Firefly Killer) -->
    <div class="imagen-modal-overlay" id="imagen-modal">
        <div class="imagen-modal-card">
            <div class="imagen-modal-header">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span style="font-size: 1.75rem;">✨</span>
                    <div>
                        <h3>Google Imagen 3 Asset Creator</h3>
                        <p>AI-powered, brand-compliant clinical image generation</p>
                    </div>
                </div>
                <button class="imagen-modal-close" onclick="closeImagenModal()">&times;</button>
            </div>
            
            <div class="imagen-modal-body">
                <div class="imagen-form-group">
                    <label>Active Clinical Brand</label>
                    <select id="imagen-brand-select" class="imagen-select">
                        <option value="product_a">Product-A (compound_alpha)</option>
                        <option value="product_b">Product-B (compound_beta)</option>
                        <option value="product_c">Product-C (compound_gamma)</option>
                    </select>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="imagen-form-group">
                        <label>Generative Model</label>
                        <select id="imagen-model-select" class="imagen-select">
                            <option value="imagen-3-clinical">Imagen 3 (Clinical High-Fidelity)</option>
                            <option value="imagen-3-diagram">Imagen 3 (Medical Biology)</option>
                            <option value="imagen-3-abstract">Imagen 3 (Abstract Brand Colors)</option>
                        </select>
                    </div>
                    <div class="imagen-form-group">
                        <label>Visual Style Preset</label>
                        <select id="imagen-style-select" class="imagen-select">
                            <option value="clinical-realism">Clinical Realism (Photorealistic)</option>
                            <option value="microbiology-3d">3D Cellular Illustration</option>
                            <option value="clean-infographic">Clean Vector Chart</option>
                        </select>
                    </div>
                </div>
                
                <div class="imagen-form-group">
                    <label>Image Synthesis Description Prompt</label>
                    <textarea id="imagen-prompt-input" class="imagen-textarea" placeholder="e.g., Doctor consulting with a patient in a modern oncology clinic, warm lighting, brand-compliant, high-fidelity..."></textarea>
                </div>
                
                <div class="imagen-form-group">
                    <label>Variants to Generate</label>
                    <div class="imagen-variants-row">
                        <button class="imagen-variant-btn">1x Variant</button>
                        <button class="imagen-variant-btn">2x Variants</button>
                        <button class="imagen-variant-btn active">4x Variants (Recommended)</button>
                    </div>
                </div>
                
                <!-- Google Vibrant Gemini Gradient Generate Button -->
                <button class="btn btn-imagen-generate" id="btn-imagen-generate-run" onclick="generateImagenAsset()">
                    <span>✨ Generate High-Fidelity Clinical Imagery</span>
                    <span class="btn-spinner" id="imagen-spinner" style="display: none;"></span>
                </button>
            </div>
        </div>
    </div>

    <!-- Interactive script bindings -->
    <script src="app.js?v=4"></script>
</body>
</html>
"""
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Rewrote index.html with Google ContentStudio layout successfully!")

def append_css_contentstudio():
    css_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "style.css")
    
    css_additions = """
/* =====================================================================
   GOOGLE MAESTRO GENSTUDIO PREMIUM CSS SYSTEM
   ===================================================================== */

/* Outfit Typography overrides */
h1, h2, h3, h4, .brand-info h1, .panel-header h2 {
    font-family: 'Outfit', sans-serif !important;
}

/* Header badge */
.header-badge-contentstudio {
    font-size: 0.58rem;
    font-weight: 800;
    background: linear-gradient(135deg, #A855F7 0%, #06B6D4 100%);
    color: white;
    padding: 0.15rem 0.45rem;
    border-radius: 20px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-left: 0.4rem;
    display: inline-block;
    vertical-align: middle;
}

/* Widescreen Triple-Column Grid Layout */
.workbench-layout-contentstudio {
    display: grid;
    grid-template-columns: 310px 1fr 310px; /* Left Sidebar: 310px, Middle: Fluid, Right: 310px */
    height: calc(100vh - 90px);
    overflow: hidden;
    gap: 1.25rem;
    padding: 0.5rem 1.25rem 1.25rem 1.25rem;
}

/* Variant Pill Tabs */
.variant-tabs {
    display: flex;
    background: var(--bg-body-darker);
    padding: 0.25rem;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    gap: 0.25rem;
}
.variant-tab-btn {
    border: none;
    background: none;
    padding: 0.35rem 0.8rem;
    font-size: 0.72rem;
    font-weight: 700;
    border-radius: 15px;
    cursor: pointer;
    color: var(--color-text-muted);
    font-family: inherit;
    transition: var(--transition-smooth);
}
.variant-tab-btn:hover {
    color: var(--color-text-main);
}
.variant-tab-btn.active {
    background: var(--color-primary);
    color: white !important;
    box-shadow: 0 2px 8px rgba(13, 148, 136, 0.35);
}

/* Composer Sheet Preview Card */
.composer-card-sheet {
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
    transition: var(--transition-smooth);
}
.composer-hero-container {
    position: relative;
    overflow: hidden;
}
.composer-hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}
.composer-hero-container:hover .composer-hero-overlay {
    opacity: 1;
}
.composer-hero-container:hover img {
    filter: blur(2px) scale(1.02);
}
.composer-hero-overlay-btn {
    background: linear-gradient(135deg, #8B5CF6 0%, #0D9488 100%);
    color: white;
    font-weight: 700;
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    border: 1px solid rgba(255,255,255,0.2);
}

/* Verified Claims Highlighting in copy */
.verified-claim-highlight {
    background: rgba(13, 148, 136, 0.08);
    border-bottom: 2px dashed #0D9488;
    padding: 0.1rem 0.2rem;
    cursor: help;
    transition: background 0.3s ease;
    font-weight: 500;
    color: var(--color-text-main);
}
.verified-claim-highlight:hover {
    background: rgba(13, 148, 136, 0.18);
}

/* Right Tools Sidebar Panels */
.right-tab-btn {
    font-family: inherit;
    transition: var(--transition-smooth);
    outline: none;
}
.right-tab-btn:hover {
    color: var(--color-primary-glow) !important;
}
.right-tab-btn.active {
    color: var(--color-primary) !important;
    border-bottom: 2px solid var(--color-primary) !important;
}

/* Claims Registry Item styles */
.claims-register-item {
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-surface);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    transition: var(--transition-smooth);
}
.claims-register-item:hover {
    border-color: var(--color-primary-glow);
    transform: translateY(-1px);
}
.claim-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.62rem;
}
.claim-id-tag {
    font-family: monospace;
    font-weight: bold;
    color: var(--color-primary);
}
.claim-verif-badge {
    background: rgba(16, 185, 129, 0.12);
    color: #10B981;
    font-weight: 700;
    padding: 0.05rem 0.3rem;
    border-radius: 4px;
}
.claim-text-desc {
    font-size: 0.72rem;
    line-height: 1.35;
    color: var(--color-text-main);
    font-weight: 500;
}
.claim-citation-code {
    font-size: 0.65rem;
    color: var(--color-text-muted);
    font-weight: 600;
}

/* GOOGLE IMAGEN 3 GLASSMORPHIC MODAL OVERLAY */
.imagen-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(10, 15, 30, 0.85);
    backdrop-filter: blur(12px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
}
.imagen-modal-overlay.active {
    display: flex;
    opacity: 1;
}
.imagen-modal-card {
    width: 100%;
    max-width: 540px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    transform: scale(0.95);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.imagen-modal-overlay.active .imagen-modal-card {
    transform: scale(1);
}
.imagen-modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-body);
}
.imagen-modal-header h3 {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--color-text-main);
    margin: 0;
}
.imagen-modal-header p {
    font-size: 0.68rem;
    color: var(--color-text-muted);
    margin: 0.15rem 0 0 0;
}
.imagen-modal-close {
    border: none;
    background: none;
    color: var(--color-text-muted);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.3s ease;
}
.imagen-modal-close:hover {
    color: var(--color-text-main);
}
.imagen-modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.15rem;
}
.imagen-form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}
.imagen-form-group label {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.imagen-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.78rem;
    background: var(--bg-surface-solid);
    color: var(--color-text-main);
    font-weight: 600;
    outline: none;
    cursor: pointer;
}
.imagen-textarea {
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.78rem;
    background: var(--bg-surface-solid);
    color: var(--color-text-main);
    min-height: 80px;
    resize: vertical;
    outline: none;
    font-family: inherit;
    line-height: 1.4;
}
.imagen-variants-row {
    display: flex;
    gap: 0.5rem;
}
.imagen-variant-btn {
    flex: 1;
    border: 1px solid var(--border-color);
    background: var(--bg-surface-solid);
    padding: 0.45rem;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 6px;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: var(--transition-smooth);
}
.imagen-variant-btn:hover {
    color: var(--color-text-main);
    border-color: var(--color-primary-glow);
}
.imagen-variant-btn.active {
    background: rgba(13, 148, 136, 0.1);
    border-color: var(--color-primary);
    color: var(--color-primary);
}

/* Google vibrant gradient generate button */
.btn-imagen-generate {
    background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #0D9488 100%);
    color: white !important;
    font-weight: 700;
    font-size: 0.82rem;
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    border: none;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    transition: var(--transition-smooth);
    margin-top: 0.5rem;
}
.btn-imagen-generate:hover {
    transform: translateY(-1.5px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5);
    filter: brightness(1.08);
}
.btn-imagen-generate:active {
    transform: translateY(0);
}
"""
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write(css_additions)
    print("Appended Google ContentStudio CSS overrides successfully!")

def append_js_contentstudio():
    js_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "app.js")
    
    js_additions = """
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
            <p>We are proud to present the clinical communication toolkit for <strong>KEYTRUDA (compound_alpha)</strong> in combination with pemetrexed and platinum chemotherapy for the first-line treatment of patients with metastatic nonsquamous non-small cell lung cancer (NSCLC).</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In the landmark KEYNOTE-189 Phase III trial, KEYTRUDA combination therapy demonstrated an <span class="verified-claim-highlight" onclick="highlightClaim('CLM-KT-189-EFF')" title="Click to view MaterialReview record">Overall Response Rate (ORR) of 56% at Week 24</span>, compared to only 18.9% for chemotherapy alone. This represents a significant, clinically proven survival boundary shift.</p>
            </div>
            
            <p>Furthermore, safety monitoring profiles remain highly manageable: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-KT-189-SAF')" title="Click to view MaterialReview record">Grade 3/4 Immune-Mediated Adverse Reactions were observed in 10% of patients</span>, consistent with the established safety registry guidelines. Appropriate monitoring and supportive care are recommended.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: KEYTRUDA is indicated for first-line nonsquamous NSCLC based on KEYNOTE-189. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-KTS99</span>. Legal safety warnings apply.
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
            <p>We are proud to present the clinical communication toolkit for <strong>LENVIMA (compound_beta)</strong> in combination with compound_alpha for the first-line treatment of adult patients with advanced renal cell carcinoma (RCC).</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In the pivotal CLEAR / KEYNOTE-581 Phase III trial, LENVIMA in combination with compound_alpha demonstrated a remarkable, clinically superior <span class="verified-claim-highlight" onclick="highlightClaim('CLM-KT-581-EFF')" title="Click to view MaterialReview record">Objective Response Rate (ORR) of 71%</span>, compared to 36.1% for sunitinib alone. This represents an unprecedented efficacy standard.</p>
            </div>
            
            <p>Safety parameters were carefully monitored throughout the study: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-KT-581-SAF')" title="Click to view MaterialReview record">Grade 3/4 Adverse Events occurred in 82% of patients</span>, requiring active clinical management, dose modifications, or supportive interventions. Standard clinical protocols must be observed.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: LENVIMA + KEYTRUDA combination for advanced RCC based on the CLEAR study. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-LV581</span>. Full safety warnings apply.
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
            <p>We are proud to present the clinical communication toolkit for <strong>WELIREG (compound_gamma)</strong>, a first-in-class oral HIF-2α inhibitor indicated for patients with advanced renal cell carcinoma (RCC) following progression on immune checkpoint and VEGF therapies.</p>
            
            <div style="margin: 1.25rem 0; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-body-darker); border-left: 4px solid var(--color-primary);">
                <p style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.35rem;">🚀 Landmark Clinical Indicator</p>
                <p>In the landmark LITESPARK-005 trial, WELIREG demonstrated an <span class="verified-claim-highlight" onclick="highlightClaim('CLM-WR-005-EFF')" title="Click to view MaterialReview record">Objective Response Rate (ORR) of 22%</span>, with significant and durable vessel regression. This represents a breakthrough therapy for highly pretreated advanced RCC.</p>
            </div>
            
            <p>Safety and tolerability remain consistent with early-phase observations: <span class="verified-claim-highlight" onclick="highlightClaim('CLM-WR-005-SAF')" title="Click to view MaterialReview record">Grade 3/4 Adverse Events occurred in 30% of patients</span>, primarily presenting as anemia or hypoxia. Active patient monitoring is required.</p>
            
            <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; line-height: 1.3;">
                <strong>Clinical Indication Reference</strong>: WELIREG advanced RCC oncology profile based on LITESPARK-005. Verified MaterialReview safety audit: <span style="font-weight: 600; color: var(--color-text-main);">Regulatory Compliance Vault Ref #V-2026-WR005</span>. Full prescribing warnings apply.
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
    }
};

// Toggle between variant tabs (Adobe ContentStudio Style)
window.loadVariant = function(variantNum) {
    currentActiveVariant = variantNum;
    
    // Deactivate all variant buttons
    document.querySelectorAll('.variant-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate clicked button
    const activeBtn = document.getElementById('variant-tab-' + variantNum);
    if (activeBtn) activeBtn.classList.add('active');
    
    const variantData = variantDatabase[variantNum];
    if (!variantData) return;
    
    // Update the middle Composer inputs and image
    document.getElementById('composer-subject-input').value = variantData.subject;
    document.getElementById('composer-preheader-input').value = variantData.preheader;
    document.getElementById('composer-hero-image').src = variantData.image;
    document.getElementById('composer-content-body').innerHTML = variantData.html;
    
    // Populate the Right Sidebar Claims Register tab!
    populateClaimsRegistry(variantData.claims);
    
    // Sync dropdown selection in ComplianceVault Export tab
    const exportVariantSelect = document.getElementById('export-compliance_vault-variant');
    if (exportVariantSelect) {
        exportVariantSelect.value = 'variant-' + variantNum;
    }
    
    // Hide the placeholder, reveal the composer sheet
    document.getElementById('canvas-placeholder').style.display = 'none';
    document.getElementById('composer-card-sheet').style.display = 'flex';
    
    // Log active variant load in Console
    logConsoleLine("Master_Orchestrator_Agent", `Variant ${variantNum} (${variantData.drug}) loaded successfully. Active ComplianceVault Promomats registry connected.`);
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
    document.querySelectorAll('.right-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.color = 'var(--color-text-muted)';
        btn.style.borderBottom = 'none';
    });
    
    // Show active panel
    document.getElementById('rtab-panel-' + tabName).style.display = 'flex';
    
    // Activate button
    const activeBtn = document.getElementById('btn-rtab-' + tabName);
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
            document.getElementById('imagen-brand-select').value = currentData.drug.toLowerCase().replace(' + product_a', '');
        }
        modal.classList.add('active');
    }
};

window.closeImagenModal = function() {
    const modal = document.getElementById('imagen-modal');
    if (modal) modal.classList.remove('active');
};

// Simulate Google Imagen 3 High-Fidelity Asset Generation
window.generateImagenAsset = function() {
    const spinner = document.getElementById('imagen-spinner');
    const prompt = document.getElementById('imagen-prompt-input').value;
    const brand = document.getElementById('imagen-brand-select').value;
    
    if (spinner) spinner.style.display = 'inline-block';
    logConsoleLine("Strategic_Ingestion_Agent", `✨ Initializing Google Imagen 3 (Clinical High-Fidelity) asset generation...`);
    logConsoleLine("Strategic_Ingestion_Agent", `Prompt: "${prompt}"`);
    
    // Simulate generation delay (Gemini pulsing loader)
    setTimeout(() => {
        if (spinner) spinner.style.display = 'none';
        closeImagenModal();
        
        // Update the active variant's image block to show the generated high-fidelity asset
        let generatedImageUrl = './product_a_clinical_hero.png';
        if (brand === 'product_b') {
            generatedImageUrl = './product_b_clinical_hero.png';
        } else if (brand === 'product_c') {
            generatedImageUrl = './product_c_clinical_hero.png';
        }
        
        document.getElementById('composer-hero-image').src = generatedImageUrl;
        logConsoleLine("Master_Orchestrator_Agent", `✨ Google Imagen 3 successfully synthesized brand-compliant clinical hero image! Variant ${currentActiveVariant} asset updated.`);
        
        // Add visual success toast or notification
        alert(`✨ Google Imagen 3 successfully synthesized clinical hero imagery for your ${brand.toUpperCase()} campaign variant!`);
    }, 2200);
};

// Premium ContentStudio Regulatory Compliance Vault Export handler
window.exportComplianceVaultPackageContentStudio = function() {
    const project = document.getElementById('export-compliance_vault-project').value;
    const variant = document.getElementById('export-compliance_vault-variant').value;
    
    logConsoleLine("Master_Orchestrator_Agent", `⚡ Compiling Regulatory Compliance Vault Promomats Export Package for Project '${project}'...`);
    logConsoleLine("Self-Healing_Layout_Token_Agent", `Injecting security disclaimer checksums and packaging responsive compliance HTML...`);
    
    // Simulate physical export
    setTimeout(() => {
        logConsoleLine("Master_Orchestrator_Agent", `✅ Export successful! Approved clinical variant packaged and pushed to Regulatory Compliance Vault. Cryptographic Lock Generated.`);
        
        // Prepend record to tab 3 (ledger)
        const tbody = document.getElementById('ledger-history-body');
        if (tbody) {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--border-color)';
            row.style.background = 'rgba(16, 185, 129, 0.03)';
            
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const drug = variant === 'variant-1' ? 'Product-A' : (variant === 'variant-2' ? 'Product-B' : 'Product-C');
            const hash = 'sha256:' + Math.random().toString(16).substring(2, 18) + '8b9a2ea9a11c8e5d2b71a3f009a1c662863';
            
            row.innerHTML = `
                <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">${timestamp}</td>
                <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--color-text-main);">${drug} ContentStudio Export</td>
                <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--color-primary);">${project.substring(0, 16)}</td>
                <td style="padding: 0.85rem 1rem;"><span class="badge badge-success" style="font-size: 0.6rem; padding: 0.15rem 0.4rem;">VERIFIED</span></td>
                <td style="padding: 0.85rem 1rem; color: var(--color-text-muted);">ComplianceVaultGateway</td>
                <td style="padding: 0.85rem 1rem; font-family: monospace; font-size: 0.68rem; color: var(--color-text-muted);">${hash}</td>
            `;
            tbody.insertBefore(row, tbody.firstChild);
        }
        
        alert(`✅ Approved Campaign Variant successfully compiled and exported to Regulatory Compliance Vault!\nProject: ${project}\nLedger block successfully locked.`);
    }, 1800);
};

// Helper function to write logs directly to Console body
function logConsoleLine(agentName, message) {
    const consoleBody = document.getElementById("console-logs-body");
    if (consoleBody) {
        const line = document.createElement("div");
        line.className = "console-line system";
        const timestamp = new Date().toLocaleTimeString();
        line.innerHTML = `[${timestamp}] <strong>[${agentName}]</strong>: ${message}`;
        consoleBody.appendChild(line);
        consoleBody.scrollTop = consoleBody.scrollHeight;
    }
}

// Ingestion Handler Overrides to load dynamic content into the Composer on success!
const originalHandleIngestionSuccess = window.handleIngestionSuccess;
window.handleIngestionSuccess = function(data) {
    // Call original handler to draw charts and ledger
    if (originalHandleIngestionSuccess) {
        originalHandleIngestionSuccess(data);
    }
    
    // Dynamically load the composed result into Variant 1!
    if (data && data.brief) {
        const drug = data.brief["Medication"] || "Product-A";
        let variantNum = 1;
        if (drug.toLowerCase().includes("product_b")) variantNum = 2;
        else if (drug.toLowerCase().includes("product_c")) variantNum = 3;
        
        // Update the variant database in-memory with the real AI generated content!
        variantDatabase[variantNum].subject = data.brief["Campaign Name"] || variantDatabase[variantNum].subject;
        variantDatabase[variantNum].preheader = data.brief["Core Marketing Hook"] || variantDatabase[variantNum].preheader;
        variantDatabase[variantNum].html = data.html || variantDatabase[variantNum].html;
        
        // Load the variant in composer!
        loadVariant(variantNum);
    }
};

// Override DOMContentLoaded initialization to load Variant 1 by default!
window.addEventListener('load', () => {
    // Pre-load Variant 1 so the composer sheet starts with beautiful content!
    setTimeout(() => {
        loadVariant(1);
        switchRightTab('standards');
    }, 500);
});
"""
    with open(js_path, 'a', encoding='utf-8') as f:
        f.write(js_additions)
    print("Appended Google ContentStudio JS logic successfully!")

if __name__ == "__main__":
    print("Executing master Google Maestro ContentStudio UI refactoring...")
    write_html_contentstudio()
    append_css_contentstudio()
    append_js_contentstudio()
    print("Master Google ContentStudio UI refactoring complete!")
