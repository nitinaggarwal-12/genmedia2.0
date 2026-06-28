# 🤖 Workspace Agent Rules & Quality Constraints

## 🚨 CRITICAL RULE: Independent Deployment Verification & E2E Polling

### 1. The Constraint
You must **never** declare a frontend or backend deployment successful, "complete", or "live" based solely on CLI pipeline exit codes (`railway up` or similar) or dashboard status indicators showing a green online state. 

When writing automated E2E polling scripts that wait for a new deployment to go live, you **must never** hardcode the expected compiled JS/CSS bundle hash (e.g., `index-BuYIgGBi.js`).

### 2. The Verification Protocol
Before wrapping up your turn or notifying the user that a change is live, you **MUST** perform an independent, direct verification of the served assets:

1. **Perform an HTTP Request:** Query the public or local URL (via `curl` or fetch) to check if the server is online and responding.
2. **Capture the Initial Hash (Zero-Hardcoding):** At the start of any E2E polling script, query the live URL and extract the active JS/CSS bundle filename currently being served.
   ```javascript
   const initialHash = await page.evaluate(() => {
     const script = document.querySelector('script[src*="assets/index-"]');
     return script ? script.src : null;
   });
   ```
3. **Poll for Change:** Poll the URL and extract the active bundle filename. Declare the deployment live ONLY when the served bundle filename **differs** from the initial bundle filename captured at startup:
   ```javascript
   const currentHash = await page.evaluate(() => {
     const script = document.querySelector('script[src*="assets/index-"]');
     return script ? script.src : null;
   });
   if (currentHash && currentHash !== initialHash) {
     // The new deployment is officially live!
   }
   ```
4. **Fallback to DOM Indicators:** Alternatively, poll the page until a **unique new DOM element or class** (e.g., `#onboard-member-btn` or a specific new class) that only exists in the new version is successfully rendered. This guarantees that the new frontend is active and interactive without relying on file hashes.
5. **Verify Content Delivery:** Verify that the server is physically delivering the new content, not a cached CDN asset or a rolled-back container image, by checking that the new features are fully interactive.

---

## 🚫 RULE: Railway CLI is Blocked on macOS (Santa Security)

### 1. The Constraint
You must **never** attempt to execute the `railway` CLI binary (e.g. `railway up`, `railway variables`, etc.) on the user's macOS system. The system runs **Google Santa binary authorization**, which permanently blocks the execution of the `railway` CLI as an untrusted application.

### 2. The Protocol
* **No Railway CLI Commands:** Do not propose, run, or rely on any terminal commands involving the `railway` CLI.
* **Alternative Configuration:** If environment variables or deployments need to be managed on Railway, instruct the user to set them manually via the Railway web dashboard, or provide the exact key-value pairs they need to input.

