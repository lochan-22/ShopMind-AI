import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const USER_DATA_DIR = path.join(process.env.TEMP || "C:\\Temp", "chrome_scroll_test_" + Date.now());

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

async function runScrollTests() {
  console.log("Launching Headless Chrome for Scrolling QA Suite...");
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
    const client = new CDPClient(wsUrl);
    await client.connect();

    const target = await client.send("Target.createTarget", { url: "about:blank" });
    const targetWsUrl = `ws://127.0.0.1:${PORT}/devtools/page/${target.targetId}`;

    const pageClient = new CDPClient(targetWsUrl);
    await pageClient.connect();

    await pageClient.send("Page.enable");
    await pageClient.send("Runtime.enable");
    await pageClient.send("Input.enable").catch(() => {});

    const testRoutes = [
      { name: "Home / Landing", path: "/" },
      { name: "Categories (Level 1)", path: "/categories" },
      { name: "SubCategories (Level 2)", path: "/categories/electronics" },
      { name: "CategoryProducts (Level 3)", path: "/categories/electronics/laptops" },
      { name: "Search Results", path: "/search?q=camera" },
      { name: "Product Details", path: "/products/external/12927381651840752437" },
      { name: "Compare Products", path: "/compare" },
      { name: "Shopping Cart", path: "/cart" },
      { name: "Agent Dashboard", path: "/agent" },
      { name: "404 Not Found", path: "/non-existent-page-test-404" },
    ];

    console.log("\n=======================================================");
    console.log("PHASE 1: VERIFYING SINGLE VERTICAL SCROLLER ACROSS ALL ROUTES");
    console.log("=======================================================");

    for (const route of testRoutes) {
      console.log(`\nTesting Route: ${route.name} (${route.path})`);
      await pageClient.send("Page.navigate", { url: `http://localhost:5173${route.path}` });
      await sleep(2500);

      const audit = await pageClient.eval(`(() => {
        const html = document.documentElement;
        const body = document.body;
        const root = document.getElementById("root");

        // Scan all DOM elements for unintended vertical scroll containers
        const allElements = Array.from(document.querySelectorAll("*"));
        const nestedScrollers = [];

        for (const el of allElements) {
          if (el === html || el === body) continue;
          const style = window.getComputedStyle(el);
          const hasScrollableHeight = el.scrollHeight > el.clientHeight + 2;
          const isScrollableY = ["auto", "scroll"].includes(style.overflowY) || ["auto", "scroll"].includes(style.overflow);

          // Ignore legitimately contained components (e.g., chat message list, dropdowns)
          const isChatPanel = el.closest("aside") !== null;
          const isTableCarousel = el.classList.contains("overflow-x-auto");

          if (hasScrollableHeight && isScrollableY && !isChatPanel && !isTableCarousel) {
            nestedScrollers.push({
              tag: el.tagName,
              className: (typeof el.className === "string" ? el.className : "").slice(0, 60),
              scrollHeight: el.scrollHeight,
              clientHeight: el.clientHeight,
              overflowY: style.overflowY,
            });
          }
        }

        const isHorizontalOverflow = html.scrollWidth > html.clientWidth + 2;

        return {
          htmlScrollHeight: html.scrollHeight,
          htmlClientHeight: html.clientHeight,
          htmlOverflowY: window.getComputedStyle(html).overflowY,
          htmlOverflowX: window.getComputedStyle(html).overflowX,
          bodyOverflowX: window.getComputedStyle(body).overflowX,
          nestedScrollers,
          isHorizontalOverflow,
        };
      })()`);

      console.log(` - Document scroll height: ${audit.htmlScrollHeight}px (Client height: ${audit.htmlClientHeight}px)`);
      console.log(` - HTML overflow-y: ${audit.htmlOverflowY}, overflow-x: ${audit.htmlOverflowX}`);
      console.log(` - Unintended nested scrollers found: ${audit.nestedScrollers.length}`);
      console.log(` - Horizontal overflow present: ${audit.isHorizontalOverflow}`);

      if (audit.nestedScrollers.length > 0) {
        console.error("FAILED: Found unexpected nested scrollers:", audit.nestedScrollers);
        throw new Error(`Nested scroll container detected on route ${route.path}`);
      }
      if (audit.isHorizontalOverflow) {
        console.error("FAILED: Horizontal overflow detected on route " + route.path);
        throw new Error(`Horizontal overflow on route ${route.path}`);
      }
      console.log(" -> Route PASSED (Clean single vertical scroller)");
    }

    console.log("\n=======================================================");
    console.log("PHASE 2: VERIFYING IMMEDIATE WHEEL SCROLLING ON HOME PAGE");
    console.log("=======================================================");

    await pageClient.send("Page.navigate", { url: "http://localhost:5173/" });
    await sleep(2000);

    // Ensure we start at top
    await pageClient.eval(`window.scrollTo(0, 0)`);
    await sleep(400);

    const startY = await pageClient.eval(`window.scrollY`);
    console.log(`Starting scroll position: ${startY}px`);
    if (startY !== 0) throw new Error("Did not start at scrollY = 0");

    // Dispatch mouse wheel event at (640, 300)
    console.log("Dispatching mouse wheel event from top of Home page...");
    await pageClient.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x: 640,
      y: 300,
      deltaX: 0,
      deltaY: 150,
    });
    await sleep(600);

    const afterWheelY = await pageClient.eval(`window.scrollY`);
    console.log(`Scroll position immediately after single mouse wheel: ${afterWheelY}px`);

    if (afterWheelY <= 0) {
      console.error("FAILED: Scroll stuck or blocked! window.scrollY did not advance.");
      throw new Error("Initial wheel scrolling got stuck or blocked");
    }
    console.log(">>> SUCCESS: Window scrolled immediately without sticking or resistance!");

    console.log("\n=======================================================");
    console.log("PHASE 3: VERIFYING FULL-PAGE SCROLLING TO FOOTER");
    console.log("=======================================================");

    await pageClient.eval(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })`);
    await sleep(500);

    const footerCheck = await pageClient.eval(`(() => {
      const footer = document.querySelector("footer");
      if (!footer) return { found: false };
      const rect = footer.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      return {
        found: true,
        inView,
        scrollY: window.scrollY,
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
      };
    })()`);

    console.log("Footer visibility check:", footerCheck);
    if (!footerCheck.found || !footerCheck.inView) {
      throw new Error("Could not scroll all the way to footer");
    }
    console.log(">>> SUCCESS: Long page can scroll completely to the footer!");

    console.log("\n=======================================================");
    console.log("PHASE 4: VERIFYING FLOATING AI CHAT PANEL & NO SCROLL LOCK LEAK");
    console.log("=======================================================");

    // Find and click the floating AI button
    console.log("Opening Floating AI Assistant...");
    const btnDiag = await pageClient.eval(`(() => {
      const btn = document.querySelector("button.z-\\\\[70\\\\]") || document.querySelector("button[aria-label*='assistant'].fixed");
      if (!btn) return { found: false };
      const rect = btn.getBoundingClientRect();
      return {
        found: true,
        ariaLabel: btn.getAttribute("aria-label"),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      };
    })()`);
    console.log("Floating AI Button diag:", btnDiag);

    if (btnDiag.found) {
      // Use CDP mouse click at the button's exact coordinates
      await pageClient.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: btnDiag.rect.x + btnDiag.rect.width / 2,
        y: btnDiag.rect.y + btnDiag.rect.height / 2,
        button: "left",
        clickCount: 1,
      });
      await pageClient.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: btnDiag.rect.x + btnDiag.rect.width / 2,
        y: btnDiag.rect.y + btnDiag.rect.height / 2,
        button: "left",
        clickCount: 1,
      });
    }

    await sleep(1000);

    const chatState = await pageClient.eval(`(() => {
      const panel = document.querySelector("aside");
      const isVisible = panel && !panel.classList.contains("pointer-events-none");
      const messagesContainer = panel?.querySelector(".overflow-y-auto");
      const hasIndependentScroll = Boolean(messagesContainer);
      const ariaHidden = panel?.getAttribute("aria-hidden");
      return {
        panelFound: Boolean(panel),
        isVisible,
        hasIndependentScroll,
        ariaHidden,
        classes: panel?.className?.slice(0, 80),
      };
    })()`);

    console.log("AI Chat Panel state after click:", chatState);
    if (!chatState.isVisible || !chatState.hasIndependentScroll) {
      throw new Error("AI Chat Panel failed to open or missing internal scroller");
    }

    // Close the chat panel
    console.log("Closing Floating AI Assistant...");
    await pageClient.eval(`(() => {
      const closeBtn = document.querySelector("button[aria-label*='Close']") || document.querySelector("button[aria-label*='AI assistant']");
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(600);

    const postCloseBodyOverflow = await pageClient.eval(`document.body.style.overflow`);
    console.log(`Body style.overflow after closing panel: "${postCloseBodyOverflow}"`);
    if (postCloseBodyOverflow === "hidden") {
      throw new Error("Body scroll lock leaked after closing chat panel!");
    }
    console.log(">>> SUCCESS: AI Chat panel works and no scroll lock leaked!");

    console.log("\n=======================================================");
    console.log("PHASE 5: VERIFYING IN-PAGE ANCHOR NAVIGATION");
    console.log("=======================================================");

    // Scroll to top
    await pageClient.eval(`window.scrollTo(0, 0)`);
    await sleep(400);

    // Click "About" (#how-it-works) in Navbar
    await pageClient.eval(`(() => {
      const buttons = Array.from(document.querySelectorAll("nav button"));
      const aboutBtn = buttons.find(b => b.innerText.includes("About"));
      if (aboutBtn) aboutBtn.click();
    })()`);
    await sleep(1000);

    const anchorScrollY = await pageClient.eval(`window.scrollY`);
    console.log(`Scroll position after clicking '#how-it-works' anchor: ${anchorScrollY}px`);
    if (anchorScrollY <= 200) {
      throw new Error("In-page anchor navigation failed to scroll to target section");
    }
    console.log(">>> SUCCESS: In-page anchor navigation scrolled smoothly to section!");

    console.log("\n=======================================================");
    console.log("PHASE 6: VERIFYING BROWSER BACK & FORWARD NAVIGATION");
    console.log("=======================================================");

    // Navigate / -> /categories -> /cart
    await pageClient.send("Page.navigate", { url: "http://localhost:5173/categories" });
    await sleep(1500);
    await pageClient.send("Page.navigate", { url: "http://localhost:5173/cart" });
    await sleep(1500);

    // Browser back to /categories
    await pageClient.eval(`window.history.back()`);
    await sleep(1200);
    const backUrl = await pageClient.eval(`window.location.pathname`);
    console.log(`URL after browser back: ${backUrl}`);
    if (backUrl !== "/categories") throw new Error("Browser back navigation failed");

    // Browser back to /
    await pageClient.eval(`window.history.back()`);
    await sleep(1200);
    const homeUrl = await pageClient.eval(`window.location.pathname`);
    console.log(`URL after second browser back: ${homeUrl}`);
    if (homeUrl !== "/") throw new Error("Browser back to home failed");

    console.log(">>> SUCCESS: Browser history navigation functions normally without glitches!");

    console.log("\n=======================================================");
    console.log("ALL SCROLLING & NAVIGATION AUDIT PHASES PASSED 100%!");
    console.log("=======================================================");

    pageClient.close();
    client.close();
  } finally {
    chromeProcess.kill();
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch {}
  }
}

runScrollTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});

