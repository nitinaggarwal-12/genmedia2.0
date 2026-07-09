import os
import re

# Paths
source_path = "/Users/nitinagga/.gemini/jetski/brain/190f490b-6c7a-4748-a693-ec279e06784a/.system_generated/steps/5/content.md"
target_dir = "/Users/nitinagga/Documents/genmedia2.0/public"
target_path = os.path.join(target_dir, "user_guide.html")

# Create target dir if it doesn't exist
os.makedirs(target_dir, exist_ok=True)

print(f"Reading source from: {source_path}")
with open(source_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Reconstruct clean HTML (skip metadata headers, start at line 9, which is index 8)
clean_html_lines = []
for idx, line in enumerate(lines):
    # Match line number prefix like "9: <!DOCTYPE html>" or "100: ... "
    match = re.match(r"^\d+:\s?(.*)", line)
    if match:
        clean_html_lines.append(match.group(1))
    elif idx >= 8:
        # Fallback if line number prefix is somehow missing on empty lines
        clean_html_lines.append(line)

original_html = "\n".join(clean_html_lines)

# Remove the "Return to Workbench" navigation button (not needed in standalone/clean views)
original_html = re.sub(r'<!-- Return to Main App Action Link -->.*?</a>', '', original_html, flags=re.DOTALL)


# ---------------------------------------------------------------------
# 1. SIDEBAR MENU INJECTION
# ---------------------------------------------------------------------
old_sidebar = '<li><a href="#gateway_architecture" onclick="activateMenu(this)">🛡️ Gateway & QC Flow</a></li>'
new_sidebar = """<li><a href="#gateway_architecture" onclick="activateMenu(this)">🛡️ Gateway & QC Flow</a></li>
                <li><a href="#google_target_architecture" onclick="activateMenu(this)">💎 Target State Agentic</a></li>
                <li><a href="#agentic_copilot" onclick="activateMenu(this)">🤖 Agentic Co-Pilot</a></li>"""

if old_sidebar in original_html:
    original_html = original_html.replace(old_sidebar, new_sidebar)
    print("✓ Injected sidebar links successfully.")
else:
    print("✗ Warning: Could not find sidebar hook in HTML.")

# ---------------------------------------------------------------------
# 2. CSS STYLES INJECTION
# ---------------------------------------------------------------------
new_styles = """
        /* --- CO-PILOT WORKSPACE MODAL & CHAT STYLING --- */
        .preset-pill:hover {
            background: rgba(124, 58, 237, 0.25) !important;
            transform: translateY(-1px);
        }
        .preset-pill:active {
            transform: translateY(0);
        }
        
        .chat-msg {
            display: flex;
            flex-direction: column;
            animation: fadeInMsg 0.3s ease-out forwards;
        }
        @keyframes fadeInMsg {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Interactive SVG Nodes & Edges Transitions */
        .copilot-node {
            transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            opacity: 0;
            transform: scale(0.7) translate(0, 50px);
            transform-origin: 695px 225px; /* Origin centered around the Slack node */
        }
        .copilot-node.active {
            opacity: 1;
            transform: scale(1) translate(0, 0);
        }
        
        .copilot-edge {
            transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
        }
        .copilot-edge.active {
            stroke-dashoffset: 0;
        }
        
        .copilot-shield {
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            opacity: 0;
            transform: scale(0.3);
            transform-origin: 235px 5px;
        }
        .copilot-shield.active {
            opacity: 1;
            transform: scale(1);
        }
        
        /* Pulsing Glow Animation */
        @keyframes pulse-glow-purple {
            0% { filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.4)); }
            50% { filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.8)); }
            100% { filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.4)); }
        }
        .glow-pulse-purple {
            animation: pulse-glow-purple 2s infinite;
        }
        
        @keyframes pulse-glow-blue {
            0% { filter: drop-shadow(0 0 2px rgba(56, 189, 248, 0.4)); }
            50% { filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.8)); }
            100% { filter: drop-shadow(0 0 2px rgba(56, 189, 248, 0.4)); }
        }
        .glow-pulse-blue {
            animation: pulse-glow-blue 2s infinite;
        }

        /* Typing Indicator Animation */
        .typing-indicator {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 0.5rem 1rem;
            background: #1E293B;
            border-radius: 12px;
            border: 1px solid #2D3748;
            width: fit-content;
        }
        .typing-dot {
            width: 6px;
            height: 6px;
            background: #94A3B8;
            border-radius: 50%;
            animation: bounceDot 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounceDot {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
        }

        /* Workspace Sidebar Tab Styling */
        .workspace-tab {
            flex: 1;
            padding: 0.75rem;
            background: #1E293B;
            color: #94A3B8;
            border: none;
            border-bottom: 2px solid transparent;
            font-family: var(--font-outfit);
            font-weight: 700;
            font-size: 0.82rem;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
        }
        .workspace-tab.active {
            background: #0B0F19;
            color: #F8FAFC;
            border-bottom: 2px solid var(--color-primary);
        }
        
        /* Node Hover Highlights in Inspector Mode */
        .inspector-active svg > g {
            cursor: grab;
        }
        .inspector-active svg > g:active {
            cursor: grabbing;
        }
        .inspector-active svg > g:hover rect {
            stroke-width: 2.5 !important;
            stroke: #A855F7 !important;
            filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.6)) !important;
        }
    </style>
"""

# Find the closing </style> tag and insert styles right before it
if "</style>" in original_html:
    original_html = original_html.replace("</style>", new_styles)
    print("✓ Injected custom styles successfully.")
else:
    print("✗ Warning: Could not find </style> in HTML.")

# ---------------------------------------------------------------------
# 3. NEW SECTION INJECTION (Section 1D: Agentic Diagram Co-Pilot)
# ---------------------------------------------------------------------
ui_guide_hook = "<!-- NEW SECTION: UI Guide -->"

new_section = """
            <!-- SECTION 1D: Agentic Diagram Co-Pilot & Natural Language Editing -->
            <section id="agentic_copilot" class="guide-section" style="border: 2px solid rgba(124, 58, 237, 0.25); background: linear-gradient(180deg, #FFFFFF 0%, rgba(124, 58, 237, 0.02) 100%);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
                    <h2 style="margin: 0; border: none; padding: 0; color: var(--accent-purple);"><span class="section-icon">🤖</span> Agentic Diagram Co-Pilot &amp; Interactive Workspace</h2>
                    
                    <!-- Version Dropdown Selector -->
                    <div style="display: flex; align-items: center; gap: 0.6rem; margin-left: auto; margin-right: 1.5rem;">
                        <span style="font-family: var(--font-outfit); font-size: 0.78rem; font-weight: 700; color: #64748B; letter-spacing: 0.5px;">LEDGER VERSION:</span>
                        <select id="copilot-version-select" onchange="loadSelectedVersion(this.value)" style="background: #1E293B; color: #F8FAFC; border: 1px solid #334155; border-radius: 6px; padding: 0.4rem 2rem 0.4rem 0.75rem; font-family: var(--font-outfit); font-size: 0.82rem; font-weight: 600; cursor: pointer; outline: none; appearance: none; background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" fill=\"white\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5z\"/></svg>'); background-repeat: no-repeat; background-position: right 8px center;">
                            <option value="1">Version 1 (Baseline)</option>
                        </select>
                    </div>

                    <!-- Open Workspace Button -->
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <button class="btn btn-secondary" onclick="openCopilotEditor()" style="display: flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, var(--accent-purple) 0%, #6D28D9 100%); color: white; border: none; border-radius: 6px; padding: 0.6rem 1.3rem; font-family: var(--font-outfit); font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25); border-radius: 8px;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(124, 58, 237, 0.35)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(124, 58, 237, 0.25)'">
                            <span>🤖</span> Open Interactive Workspace
                        </button>
                    </div>
                </div>
                <p>Maestro introduces the **Agentic Diagram Co-Pilot**, an industry-first natural language and tactile interface for system architecture modification. Instead of struggling with complex vector editors, architects can edit their designs in three powerful ways:</p>
                <ul>
                    <li><strong>AI-Driven Editing:</strong> Instruct the diagram agent in plain English (e.g. *"Add a Slack agent node"* or *"Make the gateway blue"*).</li>
                    <li><strong>Direct Drag-and-Drop:</strong> Click and drag any node card directly on the canvas. The connecting arrows **rubber-band and follow the boxes automatically** using professional orthogonal routing.</li>
                    <li><strong>Property Inspector:</strong> Click any node to open a Figma-style inspector, allowing you to edit text, change styles, or slide coordinates with 2D trackpads.</li>
                </ul>
                
                <!-- Static SVG Diagram representing the Agentic Modification Pipeline -->
                <!-- START_STATIC_COPILOT_SVG -->
                <div id="static-copilot-svg-container" style="width: 100%; padding: 1.5rem 0; background: #0B0F19; border: 1px solid #1E293B; border-radius: 8px; overflow: hidden; margin: 1.5rem 0; display: flex; justify-content: center; align-items: center;">
                    <svg viewBox="0 0 800 200" width="94%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <!-- Pipeline Connections -->
                        <path d="M 145,100 L 195,100" fill="none" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
                        <path d="M 335,100 L 385,100" fill="none" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
                        <path d="M 525,100 L 575,100" fill="none" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
                        
                        <!-- Pipeline Nodes -->
                        <!-- Step 1: User Request -->
                        <g transform="translate(15, 65)">
                            <rect width="130" height="70" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
                            <text x="65" y="28" font-family="var(--font-outfit)" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">1. User Request</text>
                            <text x="65" y="44" font-family="var(--font-inter)" font-size="9" fill="#94A3B8" text-anchor="middle">"Add a Slack agent</text>
                            <text x="65" y="56" font-family="var(--font-inter)" font-size="9" fill="#94A3B8" text-anchor="middle">to the Orchestrator"</text>
                        </g>
                        
                        <!-- Step 2: LLM Parser -->
                        <g transform="translate(195, 65)">
                            <rect width="140" height="70" rx="8" fill="rgba(124, 58, 237, 0.1)" stroke="#7C3AED" stroke-width="1.5" />
                            <text x="70" y="28" font-family="var(--font-outfit)" font-size="11" font-weight="700" fill="#C084FC" text-anchor="middle">2. Co-Pilot Parser</text>
                            <text x="70" y="44" font-family="var(--font-inter)" font-size="9" fill="#E2E8F0" text-anchor="middle">Gemini 1.5 Pro extracts</text>
                            <text x="70" y="56" font-family="var(--font-inter)" font-size="9" fill="#E2E8F0" text-anchor="middle">intent, nodes, &amp; edges</text>
                        </g>
                        
                        <!-- Step 3: Surgical Patch Engine -->
                        <g transform="translate(385, 65)">
                            <rect width="140" height="70" rx="8" fill="rgba(13, 148, 136, 0.1)" stroke="#0D9488" stroke-width="1.5" />
                            <text x="70" y="28" font-family="var(--font-outfit)" font-size="11" font-weight="700" fill="#2DD4BF" text-anchor="middle">3. Surgical Patch Engine</text>
                            <text x="70" y="44" font-family="var(--font-inter)" font-size="9" fill="#E2E8F0" text-anchor="middle">Computes XML diff &amp;</text>
                            <text x="70" y="56" font-family="var(--font-inter)" font-size="9" fill="#E2E8F0" text-anchor="middle">updates node coordinates</text>
                        </g>
                        
                        <!-- Step 4: Rendered Canvas -->
                        <g transform="translate(575, 65)">
                            <rect width="210" height="70" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
                            <text x="105" y="28" font-family="var(--font-outfit)" font-size="11" font-weight="700" fill="#F8FAFC" text-anchor="middle">4. Dynamic SVG Render</text>
                            <text x="105" y="44" font-family="var(--font-inter)" font-size="9" fill="#94A3B8" text-anchor="middle">Canvas animates new node inlet</text>
                            <text x="105" y="56" font-family="var(--font-inter)" font-size="9" fill="#94A3B8" text-anchor="middle">&amp; locks to Compliance Ledger</text>
                        </g>
                    </svg>
                </div>
                <!-- END_STATIC_COPILOT_SVG -->
                
                <div class="alert-box alert-note" style="margin-top: 1rem; border-left-color: var(--accent-purple); background-color: rgba(124, 58, 237, 0.02);">
                    <span class="alert-icon" style="color: var(--accent-purple);">💡</span>
                    <div>
                        <strong>Try the Interactive Demo:</strong> Click the **"Open Interactive Workspace"** button above. You can drag nodes, edit their texts, or chat with the AI Co-Pilot to surgically modify the architecture diagram with real-time arrow routing and ledger sealing!
                    </div>
                </div>
            </section>
""" + ui_guide_hook

if ui_guide_hook in original_html:
    original_html = original_html.replace(ui_guide_hook, new_section)
    print("✓ Injected new section successfully.")
else:
    print("✗ Warning: Could not find UI Guide hook in HTML.")

# ---------------------------------------------------------------------
# 4. MODAL HTML & JAVASCRIPT INJECTION
# ---------------------------------------------------------------------
modal_and_js = """
    <!-- ===================================================================== -->
    <!-- CO-PILOT WORKSPACE MODAL & INTERACTIVE CONTROLLER -->
    <!-- ===================================================================== -->
    <div id="copilot-editor-overlay" class="editor-modal-overlay">
        <div class="editor-modal-container" style="width: 96%; height: 94%; display: grid; grid-template-rows: auto 1fr; background: #0F172A; border: 1px solid #1E293B; color: #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <!-- Modal Header -->
            <div class="editor-modal-header" style="background: #1E293B; border-bottom: 1px solid #334155; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #F8FAFC; font-family: var(--font-outfit); font-size: 1.15rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 1.4rem;">🤖</span> Agentic Diagram Co-Pilot Workspace
                </h3>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 0.72rem; background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.25rem 0.75rem; border-radius: 30px; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; font-family: var(--font-outfit); letter-spacing: 0.5px;">
                        <span style="width: 6px; height: 6px; background: #10B981; border-radius: 50%; display: inline-block;"></span> CO-PILOT ONLINE
                    </span>
                    <button class="editor-modal-close-btn" onclick="closeCopilotEditor()" style="color: #94A3B8; font-size: 1.75rem; background: none; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%;">&times;</button>
                </div>
            </div>
            
            <!-- Modal Body (Split Screen) -->
            <div style="display: grid; grid-template-columns: 380px 1fr; overflow: hidden; height: 100%;">
                <!-- Left Panel: Tabs & Controls -->
                <div style="background: #0B0F19; border-right: 1px solid #1E293B; display: grid; grid-template-rows: auto 1fr; overflow: hidden; height: 100%;">
                    
                    <!-- Tab Header -->
                    <div style="display: flex; background: #1E293B; border-bottom: 1px solid #334155; height: 42px;">
                        <button id="tab-copilot" class="workspace-tab active" onclick="switchWorkspaceTab('copilot')">
                            <span>🤖</span> AI Co-Pilot
                        </button>
                        <button id="tab-inspector" class="workspace-tab" onclick="switchWorkspaceTab('inspector')">
                            <span>✏️</span> Property Inspector
                        </button>
                    </div>
                    
                    <!-- Tab Content 1: AI Co-Pilot Chat -->
                    <div id="panel-copilot" style="display: grid; grid-template-rows: 1fr auto; overflow: hidden; height: 100%;">
                        <!-- Chat Messages -->
                        <div id="copilot-chat-messages" style="padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem; scrollbar-width: thin;">
                            <!-- Agent Welcome Message -->
                            <div class="chat-msg agent">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                    <span style="font-size: 1rem;">🤖</span>
                                    <strong style="font-size: 0.8rem; color: var(--color-primary); font-family: var(--font-outfit);">MAESTRO CO-PILOT</strong>
                                    <span style="font-size: 0.7rem; color: #64748B;">Just now</span>
                                </div>
                                <div style="background: #1E293B; color: #F1F5F9; padding: 1.1rem; border-radius: 0 12px 12px 12px; font-size: 0.85rem; line-height: 1.6; border: 1px solid #2D3748; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 0.75rem;">
                                    <p style="margin: 0; font-weight: 600; color: #F8FAFC;">Hello! I am your Agentic Diagram Co-Pilot. I have loaded the live clinical architecture diagram.</p>
                                    
                                    <p style="margin: 0; color: #94A3B8;">You can <strong>click and drag any box</strong> on the canvas to move it—the arrows will follow automatically! For structural changes, type your instructions in the chat:</p>
                                    
                                    <div style="background: #0B0F19; border: 1px solid #1E293B; padding: 0.75rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.6rem; font-family: var(--font-inter);">
                                        <div>
                                            <strong style="color: #FF9F43; display: block; font-size: 0.72rem; letter-spacing: 0.5px; text-transform: uppercase;">➕ Add Node &amp; Arrow</strong>
                                            <code style="color: #E2E8F0; font-size: 0.78rem; display: block; margin-top: 0.15rem; background: rgba(255,255,255,0.03); padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">"Add a new database node called 'Clinical Cache' at the bottom, and connect it to the Master Orchestrator."</code>
                                        </div>
                                        <div>
                                            <strong style="color: #F87171; display: block; font-size: 0.72rem; letter-spacing: 0.5px; text-transform: uppercase;">❌ Delete Node &amp; Arrows</strong>
                                            <code style="color: #E2E8F0; font-size: 0.78rem; display: block; margin-top: 0.15rem; background: rgba(255,255,255,0.03); padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">"Delete the Cloud Run Serverless MCP node and remove all its arrows."</code>
                                        </div>
                                        <div>
                                            <strong style="color: #38BDF8; display: block; font-size: 0.72rem; letter-spacing: 0.5px; text-transform: uppercase;">🔗 Draw New Connection</strong>
                                            <code style="color: #E2E8F0; font-size: 0.78rem; display: block; margin-top: 0.15rem; background: rgba(255,255,255,0.03); padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">"Add a new dashed arrow connecting Cloud Storage directly to the Dossier Auditor."</code>
                                        </div>
                                        <div>
                                            <strong style="color: #C084FC; display: block; font-size: 0.72rem; letter-spacing: 0.5px; text-transform: uppercase;">🎨 Change Shape Style</strong>
                                            <code style="color: #E2E8F0; font-size: 0.78rem; display: block; margin-top: 0.15rem; background: rgba(255,255,255,0.03); padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">"Change the Cloud Spanner DB node into a cylinder database shape."</code>
                                        </div>
                                    </div>
                                    
                                    <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.15); padding: 0.6rem 0.8rem; border-radius: 8px; font-size: 0.78rem; color: #C084FC; line-height: 1.4; font-family: var(--font-inter);">
                                        🔮 <strong>What will happen:</strong> The AI will instantly rebuild the SVG structure (adding, deleting, or morphing shapes and lines). Once rendered, you can immediately drag the new shapes—the arrows will follow!
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Chat Input & Presets -->
                        <div style="padding: 1.25rem; background: #0F172A; border-top: 1px solid #1E293B;">
                            <!-- Preset Pills -->
                            <div style="margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                <button class="preset-pill" onclick="triggerPreset('add_slack')" style="background: rgba(124, 58, 237, 0.1); color: #C084FC; border: 1px solid rgba(124, 58, 237, 0.2); padding: 0.35rem 0.75rem; border-radius: 30px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: var(--font-outfit);">
                                    ⚡ Add Slack Alert Agent
                                </button>
                                <button class="preset-pill" onclick="triggerPreset('change_gateway')" style="background: rgba(14, 116, 144, 0.1); color: #22D3EE; border: 1px solid rgba(14, 116, 144, 0.2); padding: 0.35rem 0.75rem; border-radius: 30px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: var(--font-outfit);">
                                    🎨 Change Gateway to Ocean Blue
                                </button>
                                <button class="preset-pill" onclick="triggerPreset('add_waf')" style="background: rgba(220, 38, 38, 0.1); color: #F87171; border: 1px solid rgba(220, 38, 38, 0.2); padding: 0.35rem 0.75rem; border-radius: 30px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: var(--font-outfit);">
                                    🛡️ Add WAF Shield to Gateway
                                </button>
                                <button class="preset-pill" onclick="triggerPreset('reset')" style="background: rgba(148, 163, 184, 0.1); color: #94A3B8; border: 1px solid rgba(148, 163, 184, 0.2); padding: 0.35rem 0.75rem; border-radius: 30px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: var(--font-outfit);">
                                    🔄 Reset Diagram
                                </button>
                            </div>
                            
                            <!-- Text Input Form -->
                            <form id="copilot-chat-form" onsubmit="handleChatSubmit(event)" style="display: grid; grid-template-columns: 1fr auto; gap: 0.75rem;">
                                <input type="text" id="copilot-chat-input" placeholder="Ask the Co-Pilot to edit the diagram..." style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 8px; padding: 0.75rem 1rem; color: #F8FAFC; font-size: 0.88rem; outline: none; transition: border-color 0.2s; font-family: var(--font-inter);" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='#1E293B'">
                                <button type="submit" style="background: var(--color-primary); color: white; border: none; border-radius: 8px; padding: 0.75rem 1.25rem; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.25rem; font-family: var(--font-outfit);" onmouseover="this.style.background='var(--color-primary-hover)'" onmouseout="this.style.background='var(--color-primary)'">
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Tab Content 2: Property Inspector (Figma-Style) -->
                    <div id="panel-inspector" style="display: none; padding: 1.5rem; overflow-y: auto; height: 100%; font-family: var(--font-inter);">
                        <!-- Welcome / Instruction -->
                        <div id="inspector-welcome" style="color: #94A3B8; font-size: 0.88rem; line-height: 1.6; text-align: center; margin-top: 3rem;">
                            <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">🎯</span>
                            <strong style="color: #F8FAFC; font-family: var(--font-outfit);">Interactive Inspector Mode</strong>
                            <p style="margin-top: 0.5rem; font-size: 0.82rem; color: #64748B;">Click or drag any node in the diagram canvas on the right to inspect and edit its properties in real-time!</p>
                        </div>
                        
                        <!-- Form (hidden until node clicked) -->
                        <div id="inspector-form" style="display: none; flex-direction: column; gap: 1.25rem;">
                            <div style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); padding: 0.75rem 1rem; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-family: var(--font-outfit); font-size: 0.78rem; font-weight: 700; color: #C084FC; letter-spacing: 0.5px;">SELECTED NODE:</span>
                                <code id="inspector-node-id" style="font-family: monospace; font-size: 0.8rem; background: #1E293B; color: #F8FAFC; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; border: 1px solid #334155;">node-3</code>
                            </div>
                            
                            <!-- Header Input -->
                            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                                <label style="font-size: 0.72rem; font-weight: 700; color: #94A3B8; font-family: var(--font-outfit); letter-spacing: 0.5px;">HEADER TEXT</label>
                                <input type="text" id="inspector-header-input" oninput="updateSelectedNode()" style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 6px; padding: 0.6rem 0.85rem; color: #F8FAFC; font-size: 0.85rem; outline: none; font-family: var(--font-inter); transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='#1E293B'">
                            </div>
                            
                            <!-- Subtext Input -->
                            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                                <label style="font-size: 0.72rem; font-weight: 700; color: #94A3B8; font-family: var(--font-outfit); letter-spacing: 0.5px;">SUBTEXT / DESCRIPTION</label>
                                <textarea id="inspector-subtext-input" oninput="updateSelectedNode()" rows="3" style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 6px; padding: 0.6rem 0.85rem; color: #F8FAFC; font-size: 0.85rem; outline: none; font-family: var(--font-inter); resize: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='#1E293B'"></textarea>
                            </div>
                            
                            <!-- Style / Gradient Dropdown -->
                            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                                <label style="font-size: 0.72rem; font-weight: 700; color: #94A3B8; font-family: var(--font-outfit); letter-spacing: 0.5px;">NODE STYLE (BRAND GRADIENT)</label>
                                <select id="inspector-style-select" onchange="updateSelectedNode()" style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 6px; padding: 0.6rem 0.85rem; color: #F8FAFC; font-size: 0.85rem; outline: none; font-family: var(--font-inter); cursor: pointer; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='#1E293B'">
                                    <option value="url(#c-grad-orange)">Orange (Ingestion/Security)</option>
                                    <option value="url(#c-grad-purple)">Purple (Agentic/Writing)</option>
                                    <option value="url(#c-grad-blue)">Blue (Search/Publish)</option>
                                    <option value="url(#c-grad-green)">Green (Registry/Validation)</option>
                                    <option value="url(#c-grad-gray)">Gray (Downstream Connector)</option>
                                    <option value="url(#c-grad-ocean)">Ocean Blue (Glow Highlight)</option>
                                    <option value="url(#c-grad-slack)">Slack Brand Purple</option>
                                </select>
                            </div>
                            
                            <!-- Position Adjuster (X / Y side-by-side + 2D Trackpad) -->
                            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid #1E293B; padding-top: 1.25rem;">
                                <!-- Numeric X/Y Fields side-by-side -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <label style="font-size: 0.68rem; font-weight: 700; color: #64748B; font-family: var(--font-outfit); letter-spacing: 0.5px;">COORD X</label>
                                        <input type="number" id="inspector-x-input" oninput="syncXFromNumber()" style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 6px; padding: 0.4rem 0.6rem; color: #F8FAFC; font-size: 0.8rem; outline: none; font-family: var(--font-inter);">
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <label style="font-size: 0.68rem; font-weight: 700; color: #64748B; font-family: var(--font-outfit); letter-spacing: 0.5px;">COORD Y</label>
                                        <input type="number" id="inspector-y-input" oninput="syncYFromNumber()" style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 6px; padding: 0.4rem 0.6rem; color: #F8FAFC; font-size: 0.8rem; outline: none; font-family: var(--font-inter);">
                                    </div>
                                </div>

                                <!-- 2D Position Pad -->
                                <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                                    <label style="font-size: 0.68rem; font-weight: 700; color: #94A3B8; font-family: var(--font-outfit); letter-spacing: 0.5px; display: flex; justify-content: space-between;">
                                        <span>2D POSITION PAD</span>
                                        <span style="color: #64748B; font-size: 0.62rem;">Drag dot to move</span>
                                    </label>
                                    <div id="inspector-2d-pad" style="width: 100%; height: 140px; background: #0B0F19; border: 1px solid #1E293B; border-radius: 8px; position: relative; cursor: crosshair; overflow: hidden;">
                                        <!-- Grid Lines Background -->
                                        <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 14px 14px;"></div>
                                        
                                        <!-- Corner Labels -->
                                        <span style="position: absolute; top: 4px; left: 6px; font-size: 0.55rem; color: #334155; font-family: monospace; font-weight: 700; user-select: none;">(0,0)</span>
                                        <span style="position: absolute; bottom: 4px; right: 6px; font-size: 0.55rem; color: #334155; font-family: monospace; font-weight: 700; user-select: none;">(1000,1000)</span>
                                        
                                        <!-- Draggable Dot -->
                                        <div id="inspector-2d-handle" style="width: 12px; height: 12px; background: var(--color-primary); border: 2px solid #F8FAFC; border-radius: 50%; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); cursor: grab; box-shadow: 0 0 10px var(--color-primary); transition: background-color 0.2s;"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Arrow Warning Note -->
                            <p style="font-size: 0.75rem; color: #10B981; line-height: 1.4; margin-top: 0.75rem; font-family: var(--font-inter); margin-bottom: 0; background: rgba(16, 185, 129, 0.08); padding: 0.6rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.15);">
                                💡 <strong>Lucid-Style Connector Routing:</strong> As you drag nodes on the canvas, all connected arrows will automatically stretch, follow, and re-route in real-time!
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Right Panel: Dynamic Workspace Canvas -->
                <div style="background: #0B0F19; display: flex; flex-direction: column; overflow: hidden; height: 100%; position: relative; justify-content: center; align-items: center; padding: 2rem;">
                    <!-- Floating Toolbar -->
                    <div style="position: absolute; top: 1rem; left: 1rem; display: flex; gap: 0.5rem; z-index: 10;">
                        <span id="canvas-mode-indicator" style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); border: 1px solid #1E293B; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #94A3B8; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-outfit);">
                            <span style="width: 8px; height: 8px; background: #38BDF8; border-radius: 50%; box-shadow: 0 0 8px #38BDF8; display: inline-block; animation: pulse 1.5s infinite;"></span> Interactive SVG Canvas
                        </span>
                    </div>
                    
                    <div id="workspace-commit-btn-wrapper" style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.75rem; z-index: 10;">
                        <button id="copilot-commit-btn" onclick="commitCopilotChanges()" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 6px; padding: 0.5rem 1.25rem; font-family: var(--font-outfit); font-weight: 700; font-size: 0.82rem; cursor: pointer; opacity: 0.5; pointer-events: none; transition: all 0.3s; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
                            💾 Commit Changes
                        </button>
                    </div>
                    
                    <!-- SVG Diagram Container (Always visible in our native workspace) -->
                    <div id="interactive-diagram-container" style="width: 100%; max-width: 900px; height: auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 12px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); position: relative; overflow: visible; display: flex; justify-content: center; align-items: center;">
                        <!-- The SVG will be dynamically injected here -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- CO-PILOT CONTROLLER SCRIPT -->
    <script type="text/javascript">
        // Register Event Listeners for Version Ledger
        document.addEventListener('DOMContentLoaded', () => {
            loadDiagramVersions(true);
        });

        let allVersions = [];
        let currentVersionNum = 1;
        let copilotDiagramXml = ""; // Global variable to store fetched SVG
        let connections = []; // Track SVG paths and their nodes
        
        // Load Diagram Versions from Ledger
        function loadDiagramVersions(selectLatest = true) {
            fetch('/api/diagram-versions')
                .then(res => res.json())
                .then(data => {
                    allVersions = data;
                    const select = document.getElementById('copilot-version-select');
                    if (!select) return;
                    
                    select.innerHTML = '';
                    
                    if (data.length === 0) {
                        // Ledger is empty, initialize with baseline SVG
                        initializeLedger();
                        return;
                    }
                    
                    data.forEach(v => {
                        const opt = document.createElement('option');
                        opt.value = v.version;
                        const timeStr = new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
                        opt.textContent = `Version ${v.version} (${timeStr})`;
                        select.appendChild(opt);
                    });
                    
                    if (selectLatest) {
                        const latest = data[data.length - 1];
                        select.value = latest.version;
                        loadSelectedVersion(latest.version);
                    } else {
                        select.value = currentVersionNum;
                    }
                })
                .catch(err => console.error("Failed to load versions:", err));
        }

        // Initialize Ledger with Baseline SVG
        function initializeLedger() {
            const container = document.getElementById('static-copilot-svg-container');
            const svgElement = container.querySelector('svg');
            if (!svgElement) return;
            
            const baselineSvg = svgElement.outerHTML;
            
            fetch('/api/save-copilot-diagram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    svg: baselineSvg
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Failed to initialize ledger");
                return res.json();
            })
            .then(data => {
                console.log("Compliance Ledger initialized with Version 1 (Baseline).");
                loadDiagramVersions(true);
            })
            .catch(err => console.error("Failed to initialize ledger:", err));
        }

        // Load Selected Version SVG Content
        function loadSelectedVersion(versionNum) {
            const version = allVersions.find(v => v.version == versionNum);
            if (!version) return;
            
            currentVersionNum = versionNum;
            
            fetch(version.file)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch SVG file");
                    return res.text();
                })
                .then(svgCode => {
                    copilotDiagramXml = svgCode;

                    // Update static display container
                    const container = document.getElementById('static-copilot-svg-container');
                    if (container) {
                        container.innerHTML = svgCode;
                    }
                    
                    // Update interactive workspace container
                    const workspaceContainer = document.getElementById('interactive-diagram-container');
                    if (workspaceContainer) {
                        workspaceContainer.innerHTML = svgCode;
                        
                        const svgElement = workspaceContainer.querySelector('svg');
                        if (svgElement) {
                            // Enable direct drag and drop on the SVG!
                            makeCanvasInteractive(svgElement);
                        }
                    }
                })
                .catch(err => console.error("Failed to load SVG:", err));
        }

        // Switch Workspace Tabs
        function switchWorkspaceTab(tabName) {
            const tabs = ['copilot', 'inspector'];
            tabs.forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                const panel = document.getElementById(`panel-${t}`);
                if (t === tabName) {
                    btn.classList.add('active');
                    panel.style.display = (t === 'copilot') ? 'grid' : 'block';
                } else {
                    btn.classList.remove('active');
                    panel.style.display = 'none';
                }
            });
            
            const overlay = document.getElementById('copilot-editor-overlay');
            const modeIndicator = document.getElementById('canvas-mode-indicator');
            
            if (tabName === 'inspector') {
                overlay.classList.add('inspector-active');
                modeIndicator.innerHTML = '<span style="width: 8px; height: 8px; background: #10B981; border-radius: 50%; box-shadow: 0 0 8px #10B981; display: inline-block;"></span> Property Inspector Active';
            } else {
                overlay.classList.remove('inspector-active');
                modeIndicator.innerHTML = '<span style="width: 8px; height: 8px; background: #38BDF8; border-radius: 50%; box-shadow: 0 0 8px #38BDF8; display: inline-block; animation: pulse 1.5s infinite;"></span> Interactive SVG Canvas';
                
                // Reset inspector highlights
                document.querySelectorAll('#interactive-diagram-container rect').forEach(r => {
                    r.style.strokeWidth = '1.5';
                    r.style.strokeDasharray = 'none';
                });
            }
        }

        // Open/Close Workspace
        function openCopilotEditor() {
            const overlay = document.getElementById('copilot-editor-overlay');
            overlay.classList.add('active');
            
            // Switch to Co-Pilot tab by default
            switchWorkspaceTab('copilot');
            
            // Ensure workspace matches currently selected version
            loadSelectedVersion(currentVersionNum);
            
            // Focus on input
            setTimeout(() => {
                document.getElementById('copilot-chat-input').focus();
            }, 300);
        }
        
        function closeCopilotEditor() {
            const overlay = document.getElementById('copilot-editor-overlay');
            overlay.classList.remove('active');
            overlay.classList.remove('inspector-active');
            
            // Reset inspector selection
            selectedNodeG = null;
            document.querySelectorAll('#interactive-diagram-container rect').forEach(r => {
                r.style.strokeWidth = '1.5';
                r.style.strokeDasharray = 'none';
            });
            
            // Reset welcome panel
            document.getElementById('inspector-form').style.display = 'none';
            document.getElementById('inspector-welcome').style.display = 'block';
        }

        // =====================================================================
        // GEOMETRIC ARROW ROUTING & DIRECT DRAG-AND-DROP ENGINE (LUCID-STYLE)
        // =====================================================================
        let draggedElement = null;
        let dragOffset = { x: 0, y: 0 };
        
        function makeCanvasInteractive(svg) {
            // 1. Build the connection graph (maps paths to their closest nodes)
            buildConnectionGraph(svg);
            
            // 2. Bind click events to all nodes
            bindInteractiveNodeEvents(svg);
            
            // 3. Bind drag & drop event listeners
            svg.addEventListener('mousedown', startDrag);
            svg.addEventListener('mousemove', drag);
            window.addEventListener('mouseup', endDrag); // Bind to window in case they release outside SVG
            
            // Touch support for mobile/tablet
            svg.addEventListener('touchstart', startDrag, { passive: false });
            svg.addEventListener('touchmove', drag, { passive: false });
            window.addEventListener('touchend', endDrag);
            
            function startDrag(e) {
                // Find if we clicked inside a node group (<g> direct child of <svg> containing a <rect>)
                const target = e.target.closest('svg > g');
                if (!target || target.id === "" || e.target.tagName === 'svg') return;
                
                draggedElement = target;
                
                // Automatically switch to Inspector tab and select the node
                switchWorkspaceTab('inspector');
                selectNodeForInspector(target);
                
                // Get current translation
                let tx = 0, ty = 0;
                const transform = target.getAttribute('transform') || "";
                const match = transform.match(/translate\(([^,)]+)[, ]*([^)]*)\)/);
                if (match) {
                    tx = parseFloat(match[1]) || 0;
                    ty = parseFloat(match[2]) || 0;
                }
                
                // Get mouse/touch coordinates in SVG space
                const coords = getSVGCoords(e, svg);
                dragOffset.x = coords.x - tx;
                dragOffset.y = coords.y - ty;
                
                target.style.cursor = 'grabbing';
                e.preventDefault();
            }
            
            function drag(e) {
                if (!draggedElement) return;
                
                const coords = getSVGCoords(e, svg);
                let tx = Math.round(coords.x - dragOffset.x);
                let ty = Math.round(coords.y - dragOffset.y);
                
                // Constrain to canvas boundaries [0, 1000]
                tx = Math.max(0, Math.min(1000, tx));
                ty = Math.max(0, Math.min(1000, ty));
                
                // 1. Update node position in DOM
                draggedElement.setAttribute('transform', `translate(${tx}, ${ty})`);
                
                // 2. Update Inspector Inputs in real-time
                document.getElementById('inspector-x-input').value = tx;
                document.getElementById('inspector-y-input').value = ty;
                update2DHandleUI(tx / 1000, ty / 1000);
                
                // 3. Rubber-band all connected arrows in real-time!
                updateConnectedArrows(draggedElement.id, tx, ty);
                
                enableCommitButton();
                e.preventDefault();
            }
            
            function endDrag() {
                if (draggedElement) {
                    draggedElement.style.cursor = 'grab';
                    draggedElement = null;
                }
            }
        }
        
        // Convert screen coordinates to SVG viewport coordinates
        function getSVGCoords(e, svg) {
            const point = svg.createSVGPoint();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            point.x = clientX;
            point.y = clientY;
            
            // Apply the inverse of the Screen CTM to get exact coordinate projections
            const ctm = svg.getScreenCTM().inverse();
            return point.matrixTransform(ctm);
        }

        // Build the connection graph: maps SVG paths to their start/end nodes based on proximity
        function buildConnectionGraph(svg) {
            connections = [];
            const nodes = svg.querySelectorAll('svg > g');
            const paths = svg.querySelectorAll('svg > path');
            
            // Assign synthetic IDs to nodes if they don't have them
            nodes.forEach((node, idx) => {
                if (!node.id) {
                    // Try to extract header text to make a nice ID, or fallback to index
                    const texts = node.querySelectorAll('text');
                    if (texts.length > 0) {
                        const cleanName = texts[0].textContent.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                        node.id = `node_${cleanName}`;
                    } else {
                        node.id = `node_synthetic_${idx}`;
                    }
                }
            });
            
            paths.forEach(path => {
                // Skip background grid and empty paths
                const fill = path.getAttribute('fill') || "";
                const d = path.getAttribute('d') || "";
                if (fill.includes('grid') || d === "") return;
                
                const points = parsePathPoints(d);
                if (points.length < 2) return;
                
                const startPt = points[0];
                const endPt = points[points.length - 1];
                
                let startNode = null;
                let endNode = null;
                let startOffset = { x: 0, y: 0 };
                let endOffset = { x: 0, y: 0 };
                
                // Match path endpoints to nearest node boundaries
                nodes.forEach(node => {
                    const bbox = getNodeBBox(node);
                    
                    if (isPointNearBBox(startPt, bbox)) {
                        startNode = node;
                        startOffset.x = startPt.x - bbox.tx;
                        startOffset.y = startPt.y - bbox.ty;
                    }
                    if (isPointNearBBox(endPt, bbox)) {
                        endNode = node;
                        endOffset.x = endPt.x - bbox.tx;
                        endOffset.y = endPt.y - bbox.ty;
                    }
                });
                
                // Track this path if it connects to at least one node
                if (startNode || endNode) {
                    // Detect if the path was originally vertical or horizontal
                    let isVertical = false;
                    if (points.length >= 2) {
                        const dx = Math.abs(points[1].x - points[0].x);
                        const dy = Math.abs(points[1].y - points[0].y);
                        isVertical = dy > dx;
                    }
                    
                    connections.push({
                        pathElement: path,
                        originalD: d,
                        points: points,
                        isVertical: isVertical,
                        startNode: startNode,
                        endNode: endNode,
                        startOffset: startOffset,
                        endOffset: endOffset
                    });
                }
            });
            
            console.log(`✓ Connection Graph Built: Tracking ${connections.length} dynamic arrows.`);
        }
        
        // Parse all coordinate points out of an SVG path 'd' attribute
        function parsePathPoints(d) {
            const points = [];
            const matches = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
            if (matches) {
                for (let i = 0; i < matches.length - 1; i += 2) {
                    points.push({
                        x: parseFloat(matches[i]),
                        y: parseFloat(matches[i+1])
                    });
                }
            }
            return points;
        }
        
        // Get absolute bounding box of a node group
        function getNodeBBox(node) {
            let tx = 0, ty = 0;
            const transform = node.getAttribute('transform') || "";
            const match = transform.match(/translate\(([^,)]+)[, ]*([^)]*)\)/);
            if (match) {
                tx = parseFloat(match[1]) || 0;
                ty = parseFloat(match[2]) || 0;
            }
            
            const rect = node.querySelector('rect');
            const width = rect ? parseFloat(rect.getAttribute('width')) || 0 : 0;
            const height = rect ? parseFloat(rect.getAttribute('height')) || 0 : 0;
            
            return { tx, ty, width, height };
        }
        
        // Check if a point lies on or near the boundary of a node's bounding box
        function isPointNearBBox(point, bbox) {
            const margin = 18; // Tolerant boundary check
            const x = point.x;
            const y = point.y;
            
            const inXRange = x >= (bbox.tx - margin) && x <= (bbox.tx + bbox.width + margin);
            const inYRange = y >= (bbox.ty - margin) && y <= (bbox.ty + bbox.height + margin);
            
            if (inXRange && inYRange) {
                const distLeft = Math.abs(x - bbox.tx);
                const distRight = Math.abs(x - (bbox.tx + bbox.width));
                const distTop = Math.abs(y - bbox.ty);
                const distBottom = Math.abs(y - (bbox.ty + bbox.height));
                return Math.min(distLeft, distRight, distTop, distBottom) <= margin;
            }
            return false;
        }
        
        // Recalculate and redraw all arrows connected to a moved node
        function updateConnectedArrows(nodeId, tx, ty) {
            connections.forEach(conn => {
                let startMoved = false;
                let endMoved = false;
                
                if (conn.startNode && conn.startNode.id === nodeId) {
                    conn.points[0].x = tx + conn.startOffset.x;
                    conn.points[0].y = ty + conn.startOffset.y;
                    startMoved = true;
                }
                if (conn.endNode && conn.endNode.id === nodeId) {
                    conn.points[conn.points.length - 1].x = tx + conn.endOffset.x;
                    conn.points[conn.points.length - 1].y = ty + conn.endOffset.y;
                    endMoved = true;
                }
                
                if (startMoved || endMoved) {
                    const p1 = conn.points[0];
                    const p2 = conn.points[conn.points.length - 1];
                    let newD = "";
                    
                    if (conn.originalD.includes('C')) {
                        // Bezier Curve Connector: Shift control points proportionally to preserve curve shape
                        const matches = conn.originalD.match(/[-+]?[0-9]*\.?[0-9]+/g);
                        if (matches && matches.length === 8) {
                            const origX1 = parseFloat(matches[0]);
                            const origY1 = parseFloat(matches[1]);
                            const origCx1 = parseFloat(matches[2]);
                            const origCy1 = parseFloat(matches[3]);
                            const origCx2 = parseFloat(matches[4]);
                            const origCy2 = parseFloat(matches[5]);
                            const origX2 = parseFloat(matches[6]);
                            const origY2 = parseFloat(matches[7]);
                            
                            const dx1 = p1.x - origX1;
                            const dy1 = p1.y - origY1;
                            const dx2 = p2.x - origX2;
                            const dy2 = p2.y - origY2;
                            
                            const newCx1 = origCx1 + dx1;
                            const newCy1 = origCy1 + dy1;
                            const newCx2 = origCx2 + dx2;
                            const newCy2 = origCy2 + dy2;
                            
                            newD = `M ${p1.x},${p1.y} C ${newCx1},${newCy1} ${newCx2},${newCy2} ${p2.x},${p2.y}`;
                        } else {
                            newD = `M ${p1.x},${p1.y} L ${p2.x},${p2.y}`;
                        }
                    }
                    else if (conn.points.length === 2) {
                        // Straight Line Connector
                        newD = `M ${p1.x},${p1.y} L ${p2.x},${p2.y}`;
                    }
                    else {
                        // Orthogonal Elbow Connector: Re-route dynamically using orthogonal projections
                        if (conn.isVertical) {
                            const midY = (p1.y + p2.y) / 2;
                            newD = `M ${p1.x},${p1.y} L ${p1.x},${midY} L ${p2.x},${midY} L ${p2.x},${p2.y}`;
                        } else {
                            const midX = (p1.x + p2.x) / 2;
                            newD = `M ${p1.x},${p1.y} L ${midX},${p1.y} L ${midX},${p2.y} L ${p2.x},${p2.y}`;
                        }
                    }
                    
                    conn.pathElement.setAttribute('d', newD);
                }
            });
        }

        // =====================================================================
        // NATIVE FIGMA-STYLE PROPERTY INSPECTOR LOGIC
        // =====================================================================
        let selectedNodeG = null;

        // Bind click events to all SVG nodes
        function bindInteractiveNodeEvents(svg) {
            const nodes = svg.querySelectorAll('svg > g');
            nodes.forEach((nodeG) => {
                nodeG.style.cursor = 'grab';
                
                nodeG.addEventListener('click', (e) => {
                    // Always allow selecting on click
                    selectNodeForInspector(nodeG);
                    
                    // Highlight node in the UI
                    const overlay = document.getElementById('copilot-editor-overlay');
                    if (!overlay.classList.contains('inspector-active')) {
                        // If they are in chat mode, clicking a node highlights it and shows inspector
                        switchWorkspaceTab('inspector');
                    }
                    e.stopPropagation();
                });
            });
        }

        // Select a node and populate the inspector panel
        function selectNodeForInspector(nodeG) {
            selectedNodeG = nodeG;
            
            // 1. Reset all other node outlines, and highlight the selected one
            document.querySelectorAll('#interactive-diagram-container rect').forEach(r => {
                r.style.strokeWidth = '1.5';
                r.style.strokeDasharray = 'none';
            });
            
            const rect = nodeG.querySelector('rect');
            if (rect) {
                rect.style.strokeWidth = '3';
                rect.style.strokeDasharray = '4,4';
            }
            
            // 2. Extract text (Header and Subtext)
            const texts = nodeG.querySelectorAll('text');
            let header = "";
            let subtext = "";
            if (texts.length > 0) header = texts[0].textContent;
            if (texts.length > 1) subtext = texts[1].textContent;
            
            // 3. Populate inspector form fields
            document.getElementById('inspector-node-id').textContent = header || nodeG.id;
            document.getElementById('inspector-header-input').value = header;
            document.getElementById('inspector-subtext-input').value = subtext;
            
            // 4. Populate Style Select (matches the rect's fill attribute)
            if (rect) {
                const fill = rect.getAttribute('fill') || "";
                const select = document.getElementById('inspector-style-select');
                select.value = fill.includes('url') ? fill : 'url(#c-grad-orange)';
            }
            
            // 5. Parse current translate coordinates from group transform
            let currentTx = 0;
            let currentTy = 0;
            const transform = nodeG.getAttribute('transform') || "";
            const match = transform.match(/translate\(([^,)]+)[, ]*([^)]*)\)/);
            if (match) {
                currentTx = parseFloat(match[1]) || 0;
                currentTy = parseFloat(match[2]) || 0;
            }
            
            // Show absolute coordinates in number inputs
            document.getElementById('inspector-x-input').value = Math.round(currentTx);
            document.getElementById('inspector-y-input').value = Math.round(currentTy);
            
            // Position the 2D Pad Handle (0-1000 coordinate space mapped to percentages)
            const pctX = currentTx / 1000;
            const pctY = currentTy / 1000;
            update2DHandleUI(pctX, pctY);
            
            // 6. Toggle panels
            document.getElementById('inspector-welcome').style.display = 'none';
            document.getElementById('inspector-form').style.display = 'flex';
        }

        // Update the selected node's text & style in real-time
        function updateSelectedNode() {
            if (!selectedNodeG) return;
            
            const header = document.getElementById('inspector-header-input').value;
            const subtext = document.getElementById('inspector-subtext-input').value;
            const fillStyle = document.getElementById('inspector-style-select').value;
            
            // Update Text
            const texts = selectedNodeG.querySelectorAll('text');
            if (texts.length > 0) texts[0].textContent = header;
            if (texts.length > 1) texts[1].textContent = subtext;
            
            // Update Rect Gradient and Stroke
            const rect = selectedNodeG.querySelector('rect');
            if (rect) {
                rect.setAttribute('fill', fillStyle);
                
                // Maintain beautiful strokes based on selected gradient
                if (fillStyle.includes('orange')) rect.setAttribute('stroke', '#D79B00');
                else if (fillStyle.includes('purple')) rect.setAttribute('stroke', '#9673A6');
                else if (fillStyle.includes('blue')) rect.setAttribute('stroke', '#6C8EBF');
                else if (fillStyle.includes('green')) rect.setAttribute('stroke', '#82B366');
                else if (fillStyle.includes('gray')) rect.setAttribute('stroke', '#666666');
                else if (fillStyle.includes('ocean')) rect.setAttribute('stroke', '#0284C7');
                else if (fillStyle.includes('slack')) rect.setAttribute('stroke', '#7C3AED');
            }
            
            enableCommitButton();
        }

        // Update the selected node's position in real-time (from sliders)
        function updateSelectedNodePosition() {
            if (!selectedNodeG) return;
            
            const targetX = parseFloat(document.getElementById('inspector-x-input').value) || 0;
            const targetY = parseFloat(document.getElementById('inspector-y-input').value) || 0;
            
            // Update translation
            selectedNodeG.setAttribute('transform', `translate(${targetX}, ${targetY})`);
            
            // Update arrows!
            updateConnectedArrows(selectedNodeG.id, targetX, targetY);
            
            enableCommitButton();
        }

        // =====================================================================
        // FIGMA-STYLE 2D POSITION PAD INTERACTION LOGIC
        // =====================================================================
        let isDraggingPad = false;

        function init2DPad() {
            const pad = document.getElementById('inspector-2d-pad');
            if (!pad) return;

            // Mouse Events
            pad.addEventListener('mousedown', start2DPadDrag);
            window.addEventListener('mousemove', move2DPadDrag);
            window.addEventListener('mouseup', end2DPadDrag);

            // Touch Events
            pad.addEventListener('touchstart', start2DPadDrag, { passive: false });
            window.addEventListener('touchmove', move2DPadDrag, { passive: false });
            window.addEventListener('touchend', end2DPadDrag);
        }

        function start2DPadDrag(e) {
            if (!selectedNodeG) return;
            isDraggingPad = true;
            document.getElementById('inspector-2d-handle').style.cursor = 'grabbing';
            updatePositionFromPadEvent(e);
            e.preventDefault();
        }

        function move2DPadDrag(e) {
            if (!isDraggingPad || !selectedNodeG) return;
            updatePositionFromPadEvent(e);
            e.preventDefault();
        }

        function end2DPadDrag() {
            if (!isDraggingPad) return;
            isDraggingPad = false;
            document.getElementById('inspector-2d-handle').style.cursor = 'grab';
        }

        function updatePositionFromPadEvent(e) {
            const pad = document.getElementById('inspector-2d-pad');
            const rect = pad.getBoundingClientRect();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            let pctX = (clientX - rect.left) / rect.width;
            let pctY = (clientY - rect.top) / rect.height;

            pctX = Math.max(0, Math.min(1, pctX));
            pctY = Math.max(0, Math.min(1, pctY));

            const targetX = Math.round(pctX * 1000);
            const targetY = Math.round(pctY * 1000);

            document.getElementById('inspector-x-input').value = targetX;
            document.getElementById('inspector-y-input').value = targetY;

            update2DHandleUI(pctX, pctY);
            updateSelectedNodePosition();
        }

        function update2DHandleUI(pctX, pctY) {
            const handle = document.getElementById('inspector-2d-handle');
            if (handle) {
                handle.style.left = `${pctX * 100}%`;
                handle.style.top = `${pctY * 100}%`;
            }
        }

        function syncXFromNumber() {
            if (!selectedNodeG) return;
            const xInput = document.getElementById('inspector-x-input');
            let valX = parseFloat(xInput.value) || 0;
            valX = Math.max(0, Math.min(1000, valX));
            xInput.value = valX;
            
            const pctX = valX / 1000;
            const handle = document.getElementById('inspector-2d-handle');
            if (handle) handle.style.left = `${pctX * 100}%`;
            
            updateSelectedNodePosition();
        }

        function syncYFromNumber() {
            if (!selectedNodeG) return;
            const yInput = document.getElementById('inspector-y-input');
            let valY = parseFloat(yInput.value) || 0;
            valY = Math.max(0, Math.min(1000, valY));
            yInput.value = valY;
            
            const pctY = valY / 1000;
            const handle = document.getElementById('inspector-2d-handle');
            if (handle) handle.style.top = `${pctY * 100}%`;
            
            updateSelectedNodePosition();
        }
        
        // Initialize 2D trackpad on load
        document.addEventListener('DOMContentLoaded', () => {
            init2DPad();
        });

        // =====================================================================
        // AI CO-PILOT CHAT LOGIC
        // =====================================================================
        let isProcessing = false;
        let diagramState = {
            slackAdded: false,
            gatewayColored: false,
            wafAdded: false
        };
        
        function addChatMessage(sender, text) {
            const container = document.getElementById('copilot-chat-messages');
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-msg ${sender}`;
            
            const isAgent = sender === 'agent';
            const avatar = isAgent ? '🤖' : '👤';
            const name = isAgent ? 'MAESTRO CO-PILOT' : 'YOU';
            const nameColor = isAgent ? 'var(--color-primary)' : '#38BDF8';
            
            msgDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span style="font-size: 1rem;">${avatar}</span>
                    <strong style="font-size: 0.8rem; color: ${nameColor}; font-family: var(--font-outfit);">${name}</strong>
                    <span style="font-size: 0.7rem; color: #64748B;">Just now</span>
                </div>
                <div style="background: ${isAgent ? '#1E293B' : '#0F172A'}; color: #F1F5F9; padding: 0.85rem 1.1rem; border-radius: ${isAgent ? '0 12px 12px 12px' : '12px 0 12px 12px'}; font-size: 0.88rem; line-height: 1.5; border: 1px solid ${isAgent ? '#2D3748' : '#1E293B'}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 90%; align-self: ${isAgent ? 'flex-start' : 'flex-end'};">
                    ${text}
                </div>
            `;
            
            container.appendChild(msgDiv);
            container.scrollTop = container.scrollHeight;
        }
        
        function showTypingIndicator() {
            const container = document.getElementById('copilot-chat-messages');
            const indDiv = document.createElement('div');
            indDiv.id = 'copilot-typing-indicator';
            indDiv.className = 'chat-msg agent';
            indDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span style="font-size: 1rem;">🤖</span>
                    <strong style="font-size: 0.8rem; color: var(--color-primary); font-family: var(--font-outfit);">MAESTRO CO-PILOT</strong>
                </div>
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            `;
            container.appendChild(indDiv);
            container.scrollTop = container.scrollHeight;
        }
        
        function removeTypingIndicator() {
            const ind = document.getElementById('copilot-typing-indicator');
            if (ind) ind.remove();
        }
        
        function handleChatSubmit(e) {
            if (e) e.preventDefault();
            if (isProcessing) return;
            
            const input = document.getElementById('copilot-chat-input');
            const text = input.value.trim();
            if (!text) return;
            
            addChatMessage('user', text);
            input.value = '';
            
            processCommand(text);
        }
        
        function triggerPreset(type) {
            if (isProcessing) return;
            
            let text = "";
            if (type === 'add_slack') {
                text = "Add a new Slack Alert Agent connected to the Master Orchestrator, and style it in brand purple.";
            } else if (type === 'change_gateway') {
                text = "Change the color of the Kong AI Gateway to a premium ocean blue gradient.";
            } else if (type === 'add_waf') {
                text = "Add a WAF security shield badge to the Kong AI Gateway to indicate secure ingress.";
            } else if (type === 'reset') {
                text = "Reset the architecture diagram to its original baseline state.";
            }
            
            addChatMessage('user', text);
            processCommand(text);
        }
        
        function processCommand(text) {
            isProcessing = true;
            showTypingIndicator();
            
            const svgContainer = document.getElementById('interactive-diagram-container');
            const svgElement = svgContainer.querySelector('svg');
            if (!svgElement) {
                removeTypingIndicator();
                addChatMessage('agent', "❌ Error: Could not find the SVG element to modify.");
                isProcessing = false;
                return;
            }
            
            const currentSvg = svgElement.outerHTML;
            
            fetch('/api/edit-diagram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    svg: currentSvg,
                    prompt: text
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("API call returned error status");
                return res.json();
            })
            .then(data => {
                removeTypingIndicator();
                
                // Update SVG canvas
                svgContainer.innerHTML = data.svg;
                
                // Rebind interactive events to new SVG elements
                const newSvg = svgContainer.querySelector('svg');
                if (newSvg) {
                    makeCanvasInteractive(newSvg);
                }
                
                addChatMessage('agent', `✨ **Surgical Edit Complete!**<br><br>${data.explanation.replace(/\\n/g, '<br>')}<br><br>*The diagram has been updated. You can now **Commit Changes** to write this to the Compliance Ledger.*`);
                
                enableCommitButton();
                isProcessing = false;
            })
            .catch(err => {
                console.warn("Live API call failed, falling back to local simulation:", err);
                setTimeout(() => {
                    removeTypingIndicator();
                    runLocalSimulation(text);
                }, 1000);
            });
        }
        
        function runLocalSimulation(text) {
            const lowerText = text.toLowerCase();
            
            if (lowerText.includes('reset') || lowerText.includes('undo') || lowerText.includes('original')) {
                resetDiagram();
                addChatMessage('agent', "🔄 **Diagram Reset:** Reverted the architecture diagram back to the baseline production state.");
                isProcessing = false;
                return;
            }
            
            if (lowerText.includes('slack') || (lowerText.includes('add') && lowerText.includes('alert'))) {
                if (diagramState.slackAdded) {
                    addChatMessage('agent', "🤖 The **Slack Alert Agent** is already present in the topology.");
                } else {
                    addSlackNode();
                    addChatMessage('agent', "✨ **Surgical Edit Complete! (Simulation)**<br><br>1. Located the Orchestrator node.<br>2. Inserted the **Slack Alert Agent** node.<br>3. Established a new connector connection.<br><br>*The diagram has been updated. You can now **Commit Changes**.*");
                }
                isProcessing = false;
                return;
            }
            
            if (lowerText.includes('waf') || lowerText.includes('shield') || lowerText.includes('security')) {
                if (diagramState.wafAdded) {
                    addChatMessage('agent', "🤖 The **WAF Security Shield** is already active.");
                } else {
                    addWafShield();
                    addChatMessage('agent', "✨ **Surgical Edit Complete! (Simulation)**<br><br>1. Located the **Kong AI Gateway** node.<br>2. Injected a **WAF Security Shield** badge.<br><br>*The diagram has been updated. You can now **Commit Changes**.*");
                }
                isProcessing = false;
                return;
            }
            
            if (lowerText.includes('blue') || lowerText.includes('ocean') || (lowerText.includes('color') && lowerText.includes('gateway'))) {
                if (diagramState.gatewayColored) {
                    addChatMessage('agent', "🤖 The **Kong AI Gateway** is already styled in ocean blue.");
                } else {
                    colorGatewayBlue();
                    addChatMessage('agent', "✨ **Surgical Edit Complete! (Simulation)**<br><br>1. Located the **Kong AI Gateway** node.<br>2. Updated the style to the ocean blue gradient.<br><br>*The diagram has been updated. You can now **Commit Changes**.*");
                }
                isProcessing = false;
                return;
            }
            
            addChatMessage('agent', "🤖 **Instruction Received (Simulation):** \\"" + text + "\\" <br><br>Please use one of the quick-action pills or type a supported command.");
            isProcessing = false;
        }
        
        function addSlackNode() {
            diagramState.slackAdded = true;
            
            const edge = document.getElementById('copilot-edge-slack');
            if (edge) edge.classList.add('active');
            
            setTimeout(() => {
                const node = document.getElementById('copilot-node-slack');
                if (node) {
                    node.classList.add('active');
                    node.classList.add('glow-pulse-purple');
                }
            }, 500);
            
            enableCommitButton();
        }
        
        function colorGatewayBlue() {
            diagramState.gatewayColored = true;
            
            const rect = document.getElementById('copilot-node-gateway');
            if (rect) {
                rect.setAttribute('fill', 'url(#c-grad-ocean)');
                rect.setAttribute('stroke', '#0284C7');
                rect.classList.add('glow-pulse-blue');
            }
            
            const title = document.getElementById('copilot-text-gateway-title');
            if (title) title.setAttribute('fill', '#FFFFFF');
            
            const subtitle = document.getElementById('copilot-text-gateway-subtitle');
            if (subtitle) subtitle.setAttribute('fill', '#E0F2FE');
            
            enableCommitButton();
        }
        
        function addWafShield() {
            diagramState.wafAdded = true;
            
            const shield = document.getElementById('copilot-shield-waf');
            if (shield) shield.classList.add('active');
            
            enableCommitButton();
        }
        
        function resetDiagram() {
            diagramState.slackAdded = false;
            diagramState.gatewayColored = false;
            diagramState.wafAdded = false;
            
            const node = document.getElementById('copilot-node-slack');
            if (node) {
                node.classList.remove('active');
                node.classList.remove('glow-pulse-purple');
            }
            
            const edge = document.getElementById('copilot-edge-slack');
            if (edge) edge.classList.remove('active');
            
            const rect = document.getElementById('copilot-node-gateway');
            if (rect) {
                rect.setAttribute('fill', 'url(#c-grad-orange)');
                rect.setAttribute('stroke', '#D79B00');
                rect.classList.remove('glow-pulse-blue');
            }
            
            const title = document.getElementById('copilot-text-gateway-title');
            if (title) title.setAttribute('fill', '#0F172A');
            
            const subtitle = document.getElementById('copilot-text-gateway-subtitle');
            if (subtitle) subtitle.setAttribute('fill', '#475569');
            
            const shield = document.getElementById('copilot-shield-waf');
            if (shield) shield.classList.remove('active');
            
            disableCommitButton();
            
            // Reload original version to reset coordinates in DOM
            loadSelectedVersion(currentVersionNum);
        }
        
        function enableCommitButton() {
            const btn = document.getElementById('copilot-commit-btn');
            if (btn) {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'all';
            }
        }

        function disableCommitButton() {
            const btn = document.getElementById('copilot-commit-btn');
            if (btn) {
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
            }
        }
        
        // Save New Version to Compliance Ledger
        function commitCopilotChanges() {
            if (isProcessing) return;
            
            const svgContainer = document.getElementById('interactive-diagram-container');
            const svgElement = svgContainer.querySelector('svg');
            if (!svgElement) return;
            
            // Clean up temporary selection outlines before saving
            const cleanSvgElement = svgElement.cloneNode(true);
            cleanSvgElement.querySelectorAll('rect').forEach(r => {
                r.style.strokeWidth = '1.5';
                r.style.strokeDasharray = 'none';
            });
            
            const currentSvg = cleanSvgElement.outerHTML;
            
            isProcessing = true;
            showTypingIndicator();
            
            fetch('/api/save-copilot-diagram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    svg: currentSvg
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Failed to save diagram");
                return res.json();
            })
            .then(data => {
                removeTypingIndicator();
                
                addChatMessage('agent', `💾 **Changes Committed Successfully!**<br><br>1. Compiled the updated SVG geometry and node coordinates.<br>2. **Persisted to disk:** Saved new version to local ledger repository.<br>3. **Cryptographic Seal Applied:** Locked in the **Compliance Ledger** at block height <code>#${data.block_height}</code>.<br><br>Verification Hash:<br><code>${data.hash}</code>`);
                
                alert("✨ Changes committed as a new version!\\n\\nBlock Height: #" + data.block_height + "\\nHash: " + data.hash);
                
                disableCommitButton();
                isProcessing = false;
                
                // Refresh the versions dropdown and load the newly created version
                loadDiagramVersions(true);
                switchWorkspaceTab('copilot');
            })
            .catch(err => {
                console.error("Failed to save:", err);
                removeTypingIndicator();
                addChatMessage('agent', "❌ **Error committing changes:** Could not save the diagram to the backend server.");
                isProcessing = false;
            });
        }
    </script>
</body>
"""

# Find the closing </body> tag and insert modal/JS right before it
if "</body>" in original_html:
    original_html = original_html.replace("</body>", modal_and_js)
    print("✓ Injected modal and JS successfully.")
else:
    print("✗ Warning: Could not find </body> in HTML.")

# Write the final HTML to disk!
with open(target_path, "w", encoding="utf-8") as f:
    f.write(original_html)
print(f"✓ Successfully wrote updated HTML to: {target_path}")
