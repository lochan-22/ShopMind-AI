import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9223;
const USER_DATA_DIR = path.join(process.env.TEMP || "C:\\Temp", "chrome_card_test_" + Date.now());

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

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log("Launching headless Chrome for Mobile Product Card Layout verification...");
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let browserClient = null;
  let pageClient = null;

  try {
    const wsUrl = await getDebuggerUrl();
    browserClient = new CDPClient(wsUrl);
    await browserClient.connect();

    // Create a new target/page
    const { targetId } = await browserClient.send("Target.createTarget", { url: "about:blank" });
    const pageWsUrl = `ws://127.0.0.1:${PORT}/devtools/page/${targetId}`;
    pageClient = new CDPClient(pageWsUrl);
    await pageClient.connect();

    await pageClient.send("Page.enable");
    await pageClient.send("DOM.enable");
    await pageClient.send("Runtime.enable");

    // Test multiple routes: Search Results, Categories, Deals
    const testUrl = "http://localhost:5173/search?q=boat%20headphones";
    console.log(`Navigating to Search Results (${testUrl})...`);
    await pageClient.send("Page.navigate", { url: testUrl });
    
    // Wait for cards to load (up to 15s)
    let cardCount = 0;
    for (let i = 0; i < 30; i++) {
      const check = await pageClient.send("Runtime.evaluate", {
        expression: `document.querySelectorAll('[role="link"].group').length`,
        returnByValue: true,
      });
      cardCount = check.result.value || 0;
      if (cardCount > 0) break;
      await sleep(500);
    }
    console.log(`Found ${cardCount} cards on search results page.`);

    const testWidths = [
      { name: "Narrow Phone (320px)", width: 320, height: 600, isMobile: true },
      { name: "Standard Phone (375px)", width: 375, height: 667, isMobile: true },
      { name: "Modern Phone (390px)", width: 390, height: 844, isMobile: true },
      { name: "Large Phone (430px)", width: 430, height: 932, isMobile: true },
      { name: "Desktop (1280px)", width: 1280, height: 800, isMobile: false },
    ];

    for (const tw of testWidths) {
      console.log(`\nTesting viewport: ${tw.name} (${tw.width}x${tw.height})`);

      // Set device emulation viewport
      await pageClient.send("Emulation.setDeviceMetricsOverride", {
        width: tw.width,
        height: tw.height,
        deviceScaleFactor: 2,
        mobile: tw.isMobile,
      });
      await sleep(600);

      // Measure product cards layout
      const evaluation = await pageClient.send("Runtime.evaluate", {
        expression: `
          (() => {
            const cards = Array.from(document.querySelectorAll('[role="link"].group'));
            if (cards.length === 0) return { error: "No product cards found" };

            const docScrollWidth = document.documentElement.scrollWidth;
            const docClientWidth = document.documentElement.clientWidth;
            const hasHorizontalOverflow = docScrollWidth > docClientWidth + 1;

            const cardStats = cards.slice(0, 3).map((card, i) => {
              const rect = card.getBoundingClientRect();
              const style = window.getComputedStyle(card);
              const imgBox = card.querySelector('div:first-child');
              const img = card.querySelector('img');
              const infoBox = card.querySelector('div:nth-child(2)');
              const btn = card.querySelector('button');
              const title = card.querySelector('h3');
              const price = card.querySelector('span.font-bold');

              const imgRect = imgBox ? imgBox.getBoundingClientRect() : null;
              const imgStyle = img ? window.getComputedStyle(img) : null;
              const infoRect = infoBox ? infoBox.getBoundingClientRect() : null;

              return {
                index: i,
                flexDirection: style.flexDirection,
                cardWidth: Math.round(rect.width),
                cardHeight: Math.round(rect.height),
                imgWidth: imgRect ? Math.round(imgRect.width) : 0,
                imgHeight: imgRect ? Math.round(imgRect.height) : 0,
                imgObjectFit: imgStyle ? imgStyle.objectFit : null,
                imgRatio: imgRect ? Math.round((imgRect.width / rect.width) * 100) : 0,
                infoWidth: infoRect ? Math.round(infoRect.width) : 0,
                hasTitle: Boolean(title && title.textContent.trim()),
                hasPrice: Boolean(price && price.textContent.trim()),
                hasViewButton: Boolean(btn && btn.textContent.includes("View Product")),
              };
            });

            return {
              hasHorizontalOverflow,
              docScrollWidth,
              docClientWidth,
              cardCount: cards.length,
              cards: cardStats,
            };
          })()
        `,
        returnByValue: true,
      });

      const res = evaluation.result.value;
      if (res.error) {
        console.error("Error evaluating:", res.error);
        continue;
      }

      console.log(`  Cards evaluated: ${res.cards.length} of ${res.cardCount}`);
      console.log(`  Horizontal overflow: ${res.hasHorizontalOverflow ? "YES (FAILED)" : "NO (Clean)"}`);
      assert.equal(res.hasHorizontalOverflow, false, `Horizontal overflow detected at ${tw.width}px`);

      for (const card of res.cards) {
        if (tw.isMobile) {
          console.log(`  [Card #${card.index + 1}]`);
          console.log(`    - Direction: ${card.flexDirection} (expected: row)`);
          console.log(`    - Dimensions: ${card.cardWidth}px width × ${card.cardHeight}px height`);
          console.log(`    - Image Box: ${card.imgWidth}px (${card.imgRatio}% of card, expected ~30-35%)`);
          console.log(`    - Object Fit: ${card.imgObjectFit} (expected: contain)`);
          console.log(`    - Title visible: ${card.hasTitle}, Price: ${card.hasPrice}, View Button: ${card.hasViewButton}`);

          assert.equal(card.flexDirection, "row", `Card must be flex-direction: row on ${tw.width}px`);
          assert.equal(card.imgObjectFit, "contain", `Image must be object-fit: contain`);
          assert(card.cardHeight <= 220, `Card height must be compact (was ${card.cardHeight}px)`);
          assert(card.imgRatio >= 25 && card.imgRatio <= 40, `Image ratio should be ~30-35% (was ${card.imgRatio}%)`);
          assert(card.hasViewButton, `Must have full-width View Product button in info column`);
        } else {
          console.log(`  [Desktop Card #${card.index + 1}]`);
          console.log(`    - Direction: ${card.flexDirection} (expected: column)`);
          console.log(`    - Dimensions: ${card.cardWidth}px width × ${card.cardHeight}px height`);
          assert.equal(card.flexDirection, "column", `Card must be flex-direction: column on desktop`);
        }
      }
      console.log(`✓ ${tw.name} layout passed.`);
    }

    // Test product link navigation on mobile
    console.log("\nTesting View Product button click on 375px mobile...");
    await pageClient.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(400);

    const clickEval = await pageClient.send("Runtime.evaluate", {
      expression: `
        (() => {
          const firstCard = document.querySelector('[role="link"].group');
          const btn = firstCard.querySelector('button');
          if (btn) {
            btn.click();
            return { clicked: true };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true,
    });
    assert.equal(clickEval.result.value.clicked, true, "View Product button was clicked");

    await sleep(1500);

    const navEval = await pageClient.send("Runtime.evaluate", {
      expression: `window.location.pathname`,
      returnByValue: true,
    });
    const currentPath = navEval.result.value;
    console.log(`Navigated to: ${currentPath}`);
    assert(currentPath.startsWith("/products/"), `Path must start with /products/ (was ${currentPath})`);
    console.log("✓ Product navigation from mobile card succeeded!");

    console.log("\nALL MOBILE SCREEN SIZES & DESKTOP PASSED VERIFICATION!");
  } finally {
    if (browserClient) browserClient.close();
    if (pageClient) pageClient.close();
    chromeProcess.kill();
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
