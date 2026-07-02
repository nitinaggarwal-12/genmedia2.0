# 📘 Agentic AI Project Engineering, Validation, and State Management Guidelines
### Unified Standards for Browser Automation, Relational Persistence, and Secure-Environment Orchestration

This guide provides a comprehensive blueprint of architectural patterns, state-management constraints, and automated validation protocols. It is designed to scale Agentic AI applications from dynamic, local prototypes to production-grade, enterprise-compliant platforms.

---

## 1. Core Tooling & Architectural Alternatives

In highly restricted corporate or clinical environments where external package downloads are blocked, advanced frameworks can be substituted with native libraries or pre-installed assets to maintain strict compliance.

| Category | Enterprise Standards | Zero-Install Secure Alternatives (Node.js / Web APIs) | Core Architecture & GxP Purpose |
| :--- | :--- | :--- | :--- |
| **E2E Browser Automation** | Playwright, Cypress | **Puppeteer (Pre-installed)** | Executes automated end-to-end user journeys and system qualifications. |
| **Visual Regression** | reg-suit, Percy.io | **Puppeteer Buffer Diffing (`buffer.equals()`)** | Compares screenshot buffers pixel-by-pixel to catch CSS layout regressions. |
| **Database & Persistence** | PostgreSQL, Prisma | **Built-in Node SQLite Driver (`node:sqlite`)** | Maintains unalterable records, audit logs, and persistent state across page reloads. |
| **State Caching** | React Query (TanStack) | **React Context Memory Cache Hook** | Prevents redundant API/LLM requests, reducing server load and token costs. |
| **Validation Reporting** | Cucumber (BDD) | **Programmatic Markdown Certificate Logger** | Generates auditable Installation and Operational Qualification (IQ/OQ) reports. |

---

## 2. Relational State Persistence & Caching Blueprints

### 🛠️ Blueprint 2.1: Native Zero-Dependency SQLite Persistence
Always use a local database instead of transient browser storage to ensure audit logs, user configurations, and data mutations persist securely.
```typescript
import { DatabaseSync } from 'node:sqlite';

// Initialize a persistent database file
const db = new DatabaseSync('agent_workspace.db');

// Execute SQL to establish audit trails and sections tables
db.exec(`
  CREATE TABLE IF NOT EXISTS compliance_audit_trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    actor_id TEXT,
    action_type TEXT,
    target_node TEXT,
    before_state TEXT,
    after_state TEXT
  );
`);

// Execute parameterized query safely
const insert = db.prepare(`
  INSERT INTO compliance_audit_trail (actor_id, action_type, target_node, before_state, after_state)
  VALUES (?, ?, ?, ?, ?)
`);
insert.run('system-agent', 'remediate_gap', 'Sec-3.2', 'pending', 'resolved');
```

### 🛠️ Blueprint 2.2: LLM Call Cache Prevention
Avoid duplicate, costly LLM or API requests by hashing input text and verifying against a local database cache before dispatching.
```typescript
import { createHash } from 'node:crypto';

function getCacheKey(text: string, targetRegion: string): string {
  return createHash('sha256').update(`${text}_${targetRegion}`).digest('hex');
}

// In-Memory or SQLite Caching check
function checkCache(cacheKey: string): string | null {
  const statement = db.prepare('SELECT output_text FROM api_cache WHERE hash_key = ?');
  const result = statement.get(cacheKey) as { output_text: string } | undefined;
  return result ? result.output_text : null;
}
```

---

## 3. State Management & Lifecycle Side-Effect Prevention

Dynamic agent applications often mutate global state (e.g. updating section trees, writing logs, or parsing metadata). Careless lifecycle implementations can cause UI state indicators to reset unexpectedly.

### ⚠️ The Trap: Over-Triggered Lifecycle Effects
Binding a global mutated array (like a list of files or sections) directly to a synchronization hook causes the hook to re-run on every minor data update, resetting independent user selections (like dropdowns, checkboxes, or sub-tabs) back to default values.

### 🌟 Best Practice: Scoped Identity Hooks
Only trigger synchronization hooks on specific identity changes (such as switching the active dossier/project ID) rather than tracking array changes, or implement a reference guard (`useRef`) to lock variables during inner data mutations:
```typescript
// Correct Approach: Lock updates to identity transitions
useEffect(() => {
  if (currentProject) {
    const targets = currentProject.regulatoryStandards;
    if (targets && targets.length > 0) {
      setTargetStandard(targets[0]); // Run once on fresh load
    }
  }
}, [selectedProjectId]); // Do NOT include the general 'projects' array here
```

---

## 4. Onboarding Tours & Automated E2E Coordination

Interactive guided tours are essential for demonstrating AI pipelines. However, synchronizing automation engines (like Puppeteer) with dynamic React components requires strict coordination rules.

### 📌 Constraint 4.1: Render Dependencies & Step Sequencing
* **The Issue:** Guided tours will crash if a step targets an element that is only conditionally rendered based on a prior click or API completion (e.g., trying to type into a field before clicking "Parse File").
* **The Rule:** The tour sequence must walk through every trigger action. E2E scripts must inject a settling timeout (minimum 800ms) after click transitions to allow the React state scheduler to update the DOM before querying downstream elements.

### 📌 Constraint 4.2: Parent-Child Tab Syncing
* **The Issue:** Forcing a parent layout state variable to a nested sub-tab value (e.g. setting parent tab state to `'diff'` when `'diff'` is actually a child tab inside a workspace component) crashes parent conditional rendering, producing empty/black viewports.
* **The Rule:** Ensure tour step tab targets always align with the parent's active page coordinate context. Use parent state indicators to render the workspace frame, and then highlight inner elements natively:
```typescript
// Keep parent grid rendered, letting child selectors manage internal tabs
{
  targetId: 'child-tab-diff',
  title: 'Inspect Diff',
  expectedSubTab: 'workspace' // Matches parent tab list
}
```

### 📌 Constraint 4.3: Auto-Closing Final Steps
* **The Issue:** Clicking the final action element of a tour (such as "Submit" or "Publish") automatically triggers the tour completion event, closing the card. If the automation script then tries to click an `#exit-tour-card-btn`, the script crashes because the element has disappeared.
* **The Rule:** E2E scripts must omit tour-closing click commands (like `#exit-tour-card-btn` or `#close-onboarding-btn`) on final step actions, allowing the tour to auto-dismiss natively.

---

## 5. Model Context Protocol (MCP) Integration

Interfacing Agentic systems with local file structures or tools requires conforming to the Model Context Protocol standards.

### ⚙️ Protocol Architecture
* **JSON-RPC Handshake:** Communication between clients and tools must adhere to standard JSON-RPC 2.0 specs.
* **Tool Schema Registration:** Tool input properties must define their JSON Schema explicitly, specifying all required values (e.g., `sectionCode`, `text`, `targetAuthority`).
* **Tool Dispatch:** Client dispatches must handle missing tool error callbacks and fall back gracefully to alternative tools in the orchestrator pipeline.

For detailed interface schema specifications, refer to the [Official Model Context Protocol Docs](https://modelcontextprotocol.io/).

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "compliance_analyzer",
    "arguments": {
      "sectionCode": "3.2.S.1.2",
      "text": "Active substance purity..."
    }
  },
  "id": 100
}
```

---

## 6. Multi-Agent Orchestration & Communication

Complex engineering tasks require specialized subagents working concurrently. Establishing transparent coordination guidelines prevents communication breakdown and infinite execution loops.

### 🤝 Subagent Orchestration Principles
* **Explicit Task Delegation:** When launching a subagent, provide a strict workspace directory boundary (e.g., inherit, branch, or share) and a clear, binary-definable mission scope.
* **Structured Messages:** Maintain a conversation database to log inter-agent JSON messages, preventing cyclic loop patterns where agents repeatedly ask each other the same query.
* **Traceability transcripts:** Log execution steps to standard jsonl format so human operators can trace reasoning paths (transcripts) post-campaign.

---

## 7. Enterprise Data Sanitization & PII Redaction

Sending data to external LLMs introduces risk of data leakages (clinical trial patient names, proprietary molecular structures, trademark designs).

### 🔒 Privacy Guard Protocols
* **PII Detection Engine:** Implement local regular expression filters to intercept and redact common identifiers (such as phone numbers, emails, addresses, and credit cards) before sending payloads.
* **Clinical Trial Masking:** Dynamically substitute clinical names (e.g., `"Jane Doe"`) with structured placeholders (e.g., `"[PATIENT_001]"`).
* **IP Anonymization:** Scrape molecular names or private identifiers and map them to local dictionary references (e.g., `"[COMPLEX_ALPHA]"`) before transmission.

---

## 8. Intelligent Offline & Key-Missing Fallbacks

AI applications must be highly reliable. If an external model is down or the system lacks API keys (like `GEMINI_API_KEY`), the app must continue to function.

### 🛠️ Offline Fallback Strategy
* **Pre-flight Check:** Intercept server start and test connectivity to external endpoints. If keys are missing, issue a clear warn log and switch the server to **Intelligent Fallback Mode**.
* **Mock Schema Generators:** Implement rule-based heuristics that analyze inputs (e.g. searching for spelling variations) and generate mock responses matching the LLM output schema, allowing testing suites and human testers to work seamlessly offline.

---

## 9. Google Developer AI Ecosystem (Latest Models, SDKs & APIs)

Implement Google's latest generative AI technologies to achieve state-of-the-art model reasoning and latency optimization.

### 🚀 Unified Google GenAI SDK
The unified `@google/genai` (Node.js/TypeScript) SDK unifies legacy APIs under a single client object. Refer to the [Google GenAI SDK GitHub Quickstart](https://github.com/googleapis/google-genai) and the [Gemini API Getting Started Guide](https://ai.google.dev/gemini-api/docs/quickstart) for installation blueprints.
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Analyze this document for compliance parameters...',
});
```

### 🧠 Model Tiers (Gemini 2.5 Family)
* **Gemini 2.5 Flash-Lite:** Highly optimized for cost-effective, ultra-low latency micro-actions (e.g., naming tags, structural checks).
* **Gemini 2.5 Flash:** Default model for standard multimodal tasks, offering a 1M+ token context window.
* **Gemini 2.5 Pro:** Reasoning model for advanced coding tasks, cross-border translations, and multi-agent coordination.

For active limits and model specifics, see the [Gemini Models Reference Guide](https://ai.google.dev/gemini-api/docs/models/gemini).

### 💎 Structured Outputs (`responseSchema`)
Enforce the Gemini model to output *strictly* matching JSON schemas, eliminating parsing errors. View the full implementation specs on the [Gemini API Structured Outputs Guide](https://ai.google.dev/gemini-api/docs/structured-output).
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'List identified spelling variations.',
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'object',
      properties: {
        variations: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['variations']
    }
  }
});
```

### ⚡ Server-Side Context Caching
Cache large static reference files (such as clinical trial source code or regional pharmacopoeias, up to 2M tokens) directly on Google's servers. Reduces input token latency and cost by up to 90% for subsequent requests. For setup commands, check the [Gemini API Context Caching Docs](https://ai.google.dev/gemini-api/docs/caching).

### 🔍 Grounding with Google Search
Natively integrate Google Search inside queries to retrieve real-time citations and prevent model hallucination. View configurations in the [Gemini API Grounding Guide](https://ai.google.dev/gemini-api/docs/grounding).
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'What is the current FDA guideline for clinical data protection?',
  config: {
    tools: [{ googleSearch: {} }]
  }
});
```

---

## 10. Pre-Project Research & Planning Protocols

To prevent redundant coding iterations, identify API shifts early, and coordinate architecture designs, the Agentic workflow must follow this **Pre-Project Validation-First Protocol**:

### 🔍 Phase 1: Real-time Web & Repository Search
Before formulating any implementation plan, perform a targeted web search to query the latest guidelines, framework schemas, or configuration options relating to the task technology.

### 🚨 Phase 2: Gotchas, Constraints, & Breaking Changes Review
Perform a community audit (e.g. GitHub issues, stack overflows, API warnings) to identify known bugs or compatibility constraints in similar code configurations.

### 💡 Phase 3: Workaround Mapping & Design Projections
List alternative workflows or local architectural workarounds to bypass each identified gotcha.

### 📋 Phase 4: Structured Alignment Proposal
Present a structured project plan to the human driver detailing:
1. The suggested technical choices.
2. Identified gotchas and recommended workarounds.
3. Step-by-step implementation phases.
**Do not write or edit any codebase files until this plan receives explicit confirmation.**

---

## 11. Automated GxP Validation Protocols

### 🛠️ Blueprint 11.1: Markdown Operational Qualification (OQ) Certificate Logger
Automate validation certification by generating structured, tamper-evident markdown logs directly from the test runner.
```javascript
const fs = require('fs');

function initializeValidationCertificate() {
  fs.writeFileSync('validation_report.md', `
# 📜 Operational Qualification (OQ) Certificate
**System Target:** production-v1.0
**Verification Agent:** Puppeteer Automation Engine
**Environment:** macOS Secure Sandbox

| Step | Operation Description | Status | Verification Timestamp |
| :--- | :--- | :--- | :--- |
`);
}

function assertStep(step, description, success) {
  const row = `| ${step} | ${description} | ${success ? '✅ PASS' : '❌ FAIL'} | ${new Date().toISOString()} |\n`;
  fs.appendFileSync('validation_report.md', row);
  if (!success) throw new Error(`Step ${step} failed validation check.`);
}
```

### 🛠️ Blueprint 11.2: Visual Layout Regression Diffing
Implement buffer comparisons on captured screens to immediately fail builds if layout elements shift.
```javascript
const fs = require('fs');

async function checkVisualBaseline(page, screenName) {
  const currentPath = `scratch/screenshots/${screenName}.png`;
  const baselinePath = `tests/baselines/${screenName}.png`;
  
  await page.screenshot({ path: currentPath });
  
  if (!fs.existsSync(baselinePath)) {
    // Save current as baseline if missing
    fs.copyFileSync(currentPath, baselinePath);
    return;
  }
  
  const baselineBuffer = fs.readFileSync(baselinePath);
  const currentBuffer = fs.readFileSync(currentPath);
  
  if (!baselineBuffer.equals(currentBuffer)) {
    throw new Error(`Visual regression detected on view: ${screenName}. Screen buffers do not match.`);
  }
}

---

## 12. Local Environment Gotchas & Recovery Playbook

When developing in shared, active local environments (especially on macOS under corporate security constraints), developers and AI agents must adhere to the following recovery protocols.

### 📌 Gotcha 12.1: Git Reset Deleting Untracked Virtual Environments
* **The Issue:** Force-updating a branch or executing a hard reset (`git reset --hard`) deletes any untracked local files, including the `.venv` directory. If the backend process was already running in-memory, it will continue to run but fail on new package checks, and will crash upon restart.
* **The Rule:** Always re-run the workspace initialization script (`./setup.sh`) to restore site-packages and agent registrations after a hard git clean/reset. Auto-detect missing virtual environments in `start.sh` to trigger auto-rebuilds.

### 📌 Gotcha 12.2: Google Santa Security Blocks
* **The Issue:** Security engines like Google Santa block untrusted test binaries, such as Puppeteer's default-downloaded `Google Chrome for Testing` executable.
* **The Rule:** Configure Puppeteer scripts to use the pre-approved system browser on macOS:
  ```javascript
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ```

### 📌 Gotcha 12.3: Port 3000 Collision
* **The Issue:** Port 3000 is a standard port frequently occupied by other running local applications (e.g. Next.js or React Dev Servers), causing our server to fail to bind or causing requests to route to incorrect applications.
* **The Rule:** Rather than debugging port collisions, leverage the backend uvicorn server's static mounting functionality to access the frontend directly on port 8000 (e.g., `http://localhost:8000/index.html`), unifying the endpoint.

```
