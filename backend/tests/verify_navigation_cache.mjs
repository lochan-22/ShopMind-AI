import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const USER_DATA_DIR = path.join(process.env.TEMP || "C:\\Temp", "chrome_test_profile_" + Date.now());

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDebuggerUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const data = await res.json();
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
    } catch {
      await sleep(500);
    }
  }
  throw new Error("Could not connect to Chrome debugging port");
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.eventHandlers = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method) {
        const handlers = this.eventHandlers.get(msg.method) || [];
        handlers.forEach((h) => h(msg.params));
      }
    };
  }

  on(method, handler) {
    if (!this.eventHandlers.has(method)) {
      this.eventHandlers.set(method, []);
    }
    this.eventHandlers.get(method).push(handler);
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runTest() {
  console.log("Starting Headless Chrome...");
  const chromeProcess = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1280,900",
  ]);

  try {
    const wsUrl = await getDebuggerUrl();
    console.log("Connected to Chrome via CDP:", wsUrl);

    // Create a new target/page
    const client = new CDPClient(wsUrl);
    await client.connect();

    const target = await client.send("Target.createTarget", { url: "about:blank" });
    const targetWsUrl = `ws://127.0.0.1:${PORT}/devtools/page/${target.targetId}`;

    const pageClient = new CDPClient(targetWsUrl);
    await pageClient.connect();

    await pageClient.send("Page.enable");
    await pageClient.send("Network.enable");
    await pageClient.send("Runtime.enable");

    const networkRequests = [];
    pageClient.on("Network.requestWillBeSent", (params) => {
      networkRequests.push({
        url: params.request.url,
        method: params.request.method,
        timestamp: Date.now(),
      });
    });

    console.log("\n=======================================================");
    console.log("STEP 1: Navigate to Search Results with query 'camera'");
    console.log("=======================================================");
    await pageClient.send("Page.navigate", { url: "http://localhost:5173/search?q=camera" });

    // Wait for the decision to load (top recommendations present)
    console.log("Waiting for search results and AI recommendations to load...");
    let loaded = false;
    for (let i = 0; i < 60; i++) {
      const state = await pageClient.eval(`(() => {
        const topRecs = document.querySelectorAll(".grid .group[role='link']");
        const analysisCard = document.querySelector(".rounded-3xl.border");
        const heading = document.querySelector("h1")?.innerText || "";
        return {
          recCount: topRecs.length,
          hasAnalysis: Boolean(analysisCard),
          heading,
        };
      })()`);

      if (state && state.recCount >= 3) {
        console.log(`Loaded! Found ${state.recCount} product cards.`);
        loaded = true;
        break;
      }
      await sleep(1000);
    }

    if (!loaded) {
      throw new Error("Timed out waiting for initial search results to load");
    }

    // Capture initial network decision calls
    const initialApiRequests = networkRequests.filter((r) =>
      r.url.includes("/api/products/decision") || r.url.includes("/api/products/search")
    );
    console.log(`Initial API requests count: ${initialApiRequests.length}`);
    initialApiRequests.forEach((r) => console.log(` - [${r.method}] ${r.url}`));

    // Get the title of the 3rd recommended product
    const thirdProductTitle = await pageClient.eval(`(() => {
      const cards = document.querySelectorAll(".grid .group[role='link']");
      if (cards.length >= 3) {
        return cards[2].innerText.split("\\n")[0] || "3rd Product";
      }
      return null;
    })()`);
    console.log(`3rd product card info: "${thirdProductTitle}"`);

    // Record scroll position before navigating
    await pageClient.eval(`window.scrollTo(0, 350)`);
    await sleep(500);

    console.log("\n=======================================================");
    console.log("STEP 2: Open 3rd Recommended Product Details page");
    console.log("=======================================================");
    const initialNetworkReqCount = networkRequests.length;
    await pageClient.eval(`(() => {
      const cards = document.querySelectorAll(".grid .group[role='link']");
      if (cards.length >= 3) {
        cards[2].click();
      }
    })()`);

    // Wait for product details page to render
    let onDetailsPage = false;
    for (let i = 0; i < 30; i++) {
      const url = await pageClient.eval(`window.location.href`);
      if (url.includes("/products/")) {
        console.log(`Successfully navigated to product details URL: ${url}`);
        onDetailsPage = true;
        break;
      }
      await sleep(500);
    }
    if (!onDetailsPage) {
      throw new Error("Failed to navigate to product details page");
    }

    await sleep(1000);

    console.log("\n=======================================================");
    console.log("STEP 3: Click in-app Back button to return to Search Results");
    console.log("=======================================================");
    const requestsBeforeBack = networkRequests.length;

    // Click Back button
    await pageClient.eval(`(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const backBtn = buttons.find(b => b.innerText.includes("Back"));
      if (backBtn) backBtn.click();
      else window.history.back();
    })()`);

    // Wait for Search Results to reappear
    await sleep(800);

    const backCheck = await pageClient.eval(`(() => {
      const url = window.location.href;
      const recCards = document.querySelectorAll(".grid .group[role='link']").length;
      const spinner = document.querySelector(".animate-spin");
      const heading = document.querySelector("h1")?.innerText || "";
      const scrollY = window.scrollY;
      return {
        url,
        recCards,
        hasSpinner: Boolean(spinner),
        heading,
        scrollY,
      };
    })()`);

    console.log("Search Results status after in-app Back:", backCheck);

    // Verify Network Requests made during Back navigation
    const backApiRequests = networkRequests.slice(requestsBeforeBack).filter((r) =>
      r.url.includes("/api/products/decision") || r.url.includes("/api/products/search")
    );

    console.log(`API requests triggered during Back navigation: ${backApiRequests.length}`);
    if (backApiRequests.length === 0) {
      console.log(">>> SUCCESS: Zero API requests made! Instant cache restoration verified.");
    } else {
      console.error(">>> ERROR: Unexpected API request made during back navigation:", backApiRequests);
      throw new Error("Redundant API request triggered on back navigation");
    }

    if (backCheck.recCards < 3) {
      throw new Error(`Expected at least 3 cards restored, found ${backCheck.recCards}`);
    }

    console.log("\n=======================================================");
    console.log("STEP 4: Test Browser Back Navigation");
    console.log("=======================================================");
    // Click 3rd product again
    await pageClient.eval(`(() => {
      const cards = document.querySelectorAll(".grid .group[role='link']");
      if (cards.length >= 3) cards[2].click();
    })()`);
    await sleep(1000);

    const detailsUrl2 = await pageClient.eval(`window.location.href`);
    console.log(`On product details again: ${detailsUrl2}`);

    const requestsBeforeBrowserBack = networkRequests.length;

    // Use browser history.back()
    await pageClient.eval(`window.history.back()`);
    await sleep(800);

    const browserBackCheck = await pageClient.eval(`(() => {
      const url = window.location.href;
      const recCards = document.querySelectorAll(".grid .group[role='link']").length;
      const spinner = document.querySelector(".animate-spin");
      return {
        url,
        recCards,
        hasSpinner: Boolean(spinner),
      };
    })()`);
    console.log("Search Results status after browser back:", browserBackCheck);

    const browserBackApiRequests = networkRequests.slice(requestsBeforeBrowserBack).filter((r) =>
      r.url.includes("/api/products/decision") || r.url.includes("/api/products/search")
    );
    console.log(`API requests triggered during browser back navigation: ${browserBackApiRequests.length}`);
    if (browserBackApiRequests.length === 0) {
      console.log(">>> SUCCESS: Zero API requests made on browser back navigation!");
    } else {
      throw new Error("Redundant API request triggered on browser back navigation");
    }

    console.log("\n=======================================================");
    console.log("STEP 5: Initiate a genuinely new search ('running shoes')");
    console.log("=======================================================");
    const requestsBeforeNewSearch = networkRequests.length;

    await pageClient.eval(`(() => {
      const input = document.querySelector("input[type='text'], input[placeholder*='Search']");
      if (input) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(input, "running shoes");
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        const form = input.closest("form");
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    })()`);

    console.log("Waiting for new search results for 'running shoes'...");
    let newSearchCompleted = false;
    for (let i = 0; i < 40; i++) {
      await sleep(1000);
      const url = await pageClient.eval(`window.location.href`);
      const hasShoesInUrl = url.includes("running") || url.includes("shoes");
      const recCards = await pageClient.eval(`document.querySelectorAll(".grid .group[role='link']").length`);
      if (hasShoesInUrl && recCards > 0) {
        console.log(`New search results rendered with ${recCards} cards on ${url}`);
        newSearchCompleted = true;
        break;
      }
    }

    const newSearchApiRequests = networkRequests.slice(requestsBeforeNewSearch).filter((r) =>
      r.url.includes("/api/products/decision") || r.url.includes("/api/products/search")
    );
    console.log(`API requests triggered for genuinely new search: ${newSearchApiRequests.length}`);
    newSearchApiRequests.forEach((r) => console.log(` - [${r.method}] ${r.url}`));

    if (newSearchApiRequests.length > 0) {
      console.log(">>> SUCCESS: Fresh live search properly triggered for genuinely new search!");
    } else {
      throw new Error("Expected fresh API request for new query, but none was sent");
    }

    console.log("\n=======================================================");
    console.log("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
    console.log("=======================================================");

    pageClient.close();
    client.close();
  } finally {
    chromeProcess.kill();
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }
}

runTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
