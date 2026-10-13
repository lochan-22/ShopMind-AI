import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9224;
const USER_DATA_DIR = path.join(process.env.TEMP || "C:\\Temp", "chrome_hero_test_" + Date.now());

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
  console.log("================================================================================");
  console.log("ShopMind AI — Mobile Hero & Persistent Voice Button Verification");
  console.log("================================================================================");

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

    const { targetId } = await browserClient.send("Target.createTarget", { url: "about:blank" });
    const pageWsUrl = `ws://127.0.0.1:${PORT}/devtools/page/${targetId}`;
    pageClient = new CDPClient(pageWsUrl);
    await pageClient.connect();

    await pageClient.send("Page.enable");
    await pageClient.send("DOM.enable");
    await pageClient.send("Runtime.enable");

    const homeUrl = "http://localhost:5173/";
    console.log(`Navigating to ShopMind AI Home: ${homeUrl}`);
    await pageClient.send("Page.navigate", { url: homeUrl });

    // Wait for page to mount
    let homeLoaded = false;
    for (let i = 0; i < 30; i++) {
      const check = await pageClient.send("Runtime.evaluate", {
        expression: `Boolean(document.getElementById("hero-search-input") && document.getElementById("hero-mascot-image"))`,
        returnByValue: true,
      });
      if (check.result.value) {
        homeLoaded = true;
        break;
      }
      await sleep(400);
    }
    assert.ok(homeLoaded, "Homepage failed to load within 12 seconds");
    console.log("Homepage loaded successfully with search input and mascot.\n");

    const testViewports = [
      { name: "Narrow Mobile", width: 320, height: 640, isMobile: true },
      { name: "Standard Mobile (iPhone SE/8)", width: 375, height: 667, isMobile: true },
      { name: "Modern Mobile (iPhone 14/15)", width: 390, height: 844, isMobile: true },
      { name: "Large Mobile (Pro Max / Plus)", width: 430, height: 932, isMobile: true },
      { name: "Desktop (Standard HD)", width: 1280, height: 800, isMobile: false },
    ];

    for (const vp of testViewports) {
      console.log(`>>> Testing Viewport: ${vp.name} (${vp.width}px x ${vp.height}px)`);

      await pageClient.send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.isMobile,
      });
      await sleep(600);

      // Scroll to top
      await pageClient.send("Runtime.evaluate", { expression: `window.scrollTo(0, 0);` });
      await sleep(200);

      const metrics = await pageClient.send("Runtime.evaluate", {
        expression: `
          (() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const hasHorizontalOverflow = docWidth > winWidth + 1; // 1px subpixel tolerance

            // 1. Navbar logo verification
            const header = document.querySelector("header");
            const headerLogo = header ? (header.querySelector('button[aria-label="ShopMind AI home"]') || header.querySelector("a")) : null;
            const heroSection = document.querySelector("section.bg-section-hero");
            // Check if logo is duplicated inside hero
            const heroLogos = heroSection ? heroSection.querySelectorAll('img[alt*="ShopMind Logo"], [data-logo="true"]') : [];

            // 2. Search form elements
            const searchForm = document.getElementById("hero-search");
            const searchInput = document.getElementById("hero-search-input");
            const micBtn = searchForm ? searchForm.querySelector('button[aria-label="Search by voice"]') : null;
            const searchSubmitBtn = searchForm ? searchForm.querySelector('button[type="submit"]') : null;

            const inputRect = searchInput ? searchInput.getBoundingClientRect() : null;
            const micRect = micBtn ? micBtn.getBoundingClientRect() : null;
            const submitRect = searchSubmitBtn ? searchSubmitBtn.getBoundingClientRect() : null;

            // Check if mic button and submit button are on a row below input on mobile
            const isButtonRowBelowInput = micRect && inputRect ? micRect.top >= inputRect.bottom - 2 : false;
            const isButtonsRowSideBySide = micRect && submitRect ? Math.abs(micRect.top - submitRect.top) < 6 : false;

            // 3. Workflow pill verification
            const visiblePill = Array.from(document.querySelectorAll('[data-workflow-pill]')).find(el => {
              const style = window.getComputedStyle(el);
              return style.display !== 'none' && el.offsetWidth > 0;
            });
            const pillRect = visiblePill ? visiblePill.getBoundingClientRect() : null;

            // 4. Mascot artwork verification
            const mascotImg = document.getElementById("hero-mascot-image");
            const mascotRect = mascotImg ? mascotImg.getBoundingClientRect() : null;
            const mascotOrbit = mascotImg ? mascotImg.closest('.relative.flex.items-center.justify-center') : null;

            // 5. Persistent Voice Button verification (at scroll top)
            const globalMicAside = document.querySelector('aside[aria-label="Global Voice Control"]');
            const globalMicBtn = globalMicAside ? globalMicAside.querySelector('button[aria-label="Voice Control"]') : null;
            const globalAsideRect = globalMicAside ? globalMicAside.getBoundingClientRect() : null;
            const globalBtnRect = globalMicBtn ? globalMicBtn.getBoundingClientRect() : null;
            const globalBtnCenter = globalBtnRect ? globalBtnRect.left + globalBtnRect.width / 2 : null;
            const viewportCenter = document.documentElement.clientWidth / 2;
            const centeringDiff = globalBtnCenter ? Math.abs(globalBtnCenter - viewportCenter) : 999;

            return {
              docWidth,
              winWidth,
              hasHorizontalOverflow,
              headerLogoPresent: Boolean(headerLogo),
              heroLogoDuplicated: heroLogos.length > 0,
              searchForm: {
                inputWidth: inputRect ? inputRect.width : 0,
                inputHeight: inputRect ? inputRect.height : 0,
                micWidth: micRect ? micRect.width : 0,
                micHeight: micRect ? micRect.height : 0,
                submitWidth: submitRect ? submitRect.width : 0,
                submitHeight: submitRect ? submitRect.height : 0,
                isButtonRowBelowInput,
                isButtonsRowSideBySide,
              },
              workflowPill: {
                width: pillRect ? pillRect.width : 0,
                height: pillRect ? pillRect.height : 0,
                fitsInViewport: pillRect ? pillRect.width <= winWidth : false,
                text: visiblePill ? visiblePill.textContent.replace(/\\s+/g, ' ').trim() : "",
              },
              mascot: {
                width: mascotRect ? mascotRect.width : 0,
                height: mascotRect ? mascotRect.height : 0,
                visible: Boolean(mascotRect && mascotRect.width > 0),
              },
              globalVoice: {
                buttonWidth: globalBtnRect ? globalBtnRect.width : 0,
                buttonHeight: globalBtnRect ? globalBtnRect.height : 0,
                isFixed: globalMicAside ? window.getComputedStyle(globalMicAside).position === "fixed" : false,
                centeringDiff,
                bottom: globalBtnRect ? winWidth : 0,
                asideRect: globalAsideRect,
                btnRect: globalBtnRect,
                computedTransform: globalMicAside ? window.getComputedStyle(globalMicAside).transform : null,
                computedTranslate: globalMicAside ? window.getComputedStyle(globalMicAside).translate : null,
              }
            };
          })()
        `,
        returnByValue: true,
      });

      const r = metrics.result.value;
      console.log(`  - Document width vs viewport: ${r.docWidth}px vs ${r.winWidth}px (Overflow: ${r.hasHorizontalOverflow})`);
      assert.equal(r.hasHorizontalOverflow, false, `Horizontal overflow detected at ${vp.width}px!`);

      console.log(`  - Navbar logo present at top: ${r.headerLogoPresent}, Hero logo duplicated: ${r.heroLogoDuplicated}`);
      assert.ok(r.headerLogoPresent, "Navbar logo must be present");
      assert.equal(r.heroLogoDuplicated, false, "Logo must NOT be duplicated in hero section");

      console.log(`  - Search Input: ${r.searchForm.inputWidth.toFixed(1)}px x ${r.searchForm.inputHeight.toFixed(1)}px`);
      console.log(`  - Hero Mic Button: ${r.searchForm.micWidth.toFixed(1)}px x ${r.searchForm.micHeight.toFixed(1)}px`);
      console.log(`  - Search Submit Button: ${r.searchForm.submitWidth.toFixed(1)}px x ${r.searchForm.submitHeight.toFixed(1)}px`);

      if (vp.isMobile) {
        // Assert >= 48px on mobile
        assert.ok(r.searchForm.micWidth >= 48, `Hero mic button width < 48px (${r.searchForm.micWidth})`);
        assert.ok(r.searchForm.micHeight >= 48, `Hero mic button height < 48px (${r.searchForm.micHeight})`);
        assert.ok(r.searchForm.submitHeight >= 48, `Hero search submit button height < 48px (${r.searchForm.submitHeight})`);
        assert.ok(r.searchForm.isButtonRowBelowInput, "Hero mic and search button should be below input on mobile");
        assert.ok(r.searchForm.isButtonsRowSideBySide, "Hero mic and search button should be in a row side-by-side on mobile");
      } else {
        // Desktop check
        assert.ok(r.searchForm.micHeight >= 60, "Desktop mic button height >= 60px");
        assert.ok(r.searchForm.submitHeight >= 60, "Desktop submit button height >= 60px");
        assert.ok(r.searchForm.inputHeight >= 60, "Desktop input height >= 60px");
      }

      console.log(`  - Workflow Pill: ${r.workflowPill.width.toFixed(1)}px x ${r.workflowPill.height.toFixed(1)}px (Fits: ${r.workflowPill.fitsInViewport})`);
      assert.ok(r.workflowPill.fitsInViewport, "Workflow pill must fit in viewport without overflowing");
      assert.ok(r.workflowPill.text.includes("User Intent"), "Pill contains User Intent");
      assert.ok(r.workflowPill.text.includes("Best Offer"), "Pill contains Best Offer");

      console.log(`  - Robot Mascot Artwork: ${r.mascot.width.toFixed(1)}px x ${r.mascot.height.toFixed(1)}px (Visible: ${r.mascot.visible})`);
      assert.ok(r.mascot.visible, "Mascot must remain visible");
      if (vp.isMobile) {
        // Reduced footprint on mobile: ~128px vs desktop ~224px
        assert.ok(r.mascot.width <= 160, `Mobile mascot width should be reduced (${r.mascot.width}px)`);
      } else {
        // Desktop intact
        assert.ok(r.mascot.width >= 200, `Desktop mascot width should remain large (${r.mascot.width}px)`);
      }

      console.log(`  - Aside Rect:`, r.globalVoice.asideRect, `Button Rect:`, r.globalVoice.btnRect);
      console.log(`  - Computed transform:`, r.globalVoice.computedTransform, `translate:`, r.globalVoice.computedTranslate);
      console.log(`  - Persistent Voice Button: ${r.globalVoice.buttonWidth.toFixed(1)}px x ${r.globalVoice.buttonHeight.toFixed(1)}px, Center Diff: ${r.globalVoice.centeringDiff.toFixed(2)}px, Fixed: ${r.globalVoice.isFixed}`);
      assert.ok(r.globalVoice.isFixed, "Persistent voice button must be position: fixed");
      assert.ok(r.globalVoice.buttonWidth >= 48, "Persistent voice button width >= 48px");
      assert.ok(r.globalVoice.buttonHeight >= 48, "Persistent voice button height >= 48px");
      assert.ok(r.globalVoice.centeringDiff <= 1.0, `Persistent voice button must be horizontally centered (diff: ${r.globalVoice.centeringDiff}px)`);

      // 6. Test scrolling down to footer
      await pageClient.send("Runtime.evaluate", {
        expression: `window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });`,
      });
      await sleep(300);

      const footerCheck = await pageClient.send("Runtime.evaluate", {
        expression: `
          (() => {
            const footer = document.querySelector("footer");
            const footerRect = footer ? footer.getBoundingClientRect() : null;
            const globalMicAside = document.querySelector('aside[aria-label="Global Voice Control"]');
            const globalBtn = globalMicAside ? globalMicAside.querySelector('button[aria-label="Voice Control"]') : null;
            const globalBtnRect = globalBtn ? globalBtn.getBoundingClientRect() : null;
            const winWidth = window.innerWidth;
            const globalBtnCenter = globalBtnRect ? globalBtnRect.left + globalBtnRect.width / 2 : null;
            const centeringDiff = globalBtnCenter ? Math.abs(globalBtnCenter - document.documentElement.clientWidth / 2) : 999;

            // Verify bottom links/copyright are not obstructed
            const copyright = footer ? footer.querySelector('p') : null;
            const copyrightRect = copyright ? copyright.getBoundingClientRect() : null;

            return {
              footerVisible: Boolean(footerRect && footerRect.top < window.innerHeight),
              centeringDiffScrolled: centeringDiff,
              hasHorizontalOverflowScrolled: document.documentElement.scrollWidth > winWidth + 1,
            };
          })()
        `,
        returnByValue: true,
      });

      const fc = footerCheck.result.value;
      console.log(`  - Footer reached: ${fc.footerVisible}, Scrolled center diff: ${fc.centeringDiffScrolled.toFixed(2)}px, Scrolled overflow: ${fc.hasHorizontalOverflowScrolled}`);
      assert.ok(fc.footerVisible, "Footer must be visible after scrolling");
      assert.ok(fc.centeringDiffScrolled <= 1.0, "Persistent button must remain horizontally centered when scrolled");
      assert.equal(fc.hasHorizontalOverflowScrolled, false, "No horizontal overflow after scrolling");
      console.log(`  ✓ Viewport ${vp.name} (${vp.width}px) passed all layout and positioning checks.\n`);
    }

    // Interactive functionality test at 375px
    console.log(">>> Testing Interactive Search and Voice-Control Functionality at 375px...");
    await pageClient.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await pageClient.send("Runtime.evaluate", { expression: `window.scrollTo(0, 0);` });
    await sleep(300);

    // 1. Click Hero voice search button
    await pageClient.send("Runtime.evaluate", {
      expression: `document.querySelector('#hero-search button[aria-label="Search by voice"]')?.click();`,
    });
    await sleep(200);

    const heroVoiceFeedback = await pageClient.send("Runtime.evaluate", {
      expression: `document.body.textContent.includes("Voice search coming soon")`,
      returnByValue: true,
    });
    console.log(`  - Hero mic button click feedback displayed: ${heroVoiceFeedback.result.value}`);
    assert.ok(heroVoiceFeedback.result.value, "Hero voice feedback tooltip must appear when clicked");

    // 2. Click Persistent Voice button
    await pageClient.send("Runtime.evaluate", {
      expression: `document.querySelector('aside[aria-label="Global Voice Control"] button')?.click();`,
    });
    await sleep(200);

    const globalVoiceFeedback = await pageClient.send("Runtime.evaluate", {
      expression: `document.body.textContent.includes("Voice Control (Coming Soon)")`,
      returnByValue: true,
    });
    console.log(`  - Persistent global voice button click feedback displayed: ${globalVoiceFeedback.result.value}`);
    assert.ok(globalVoiceFeedback.result.value, "Persistent global voice feedback tooltip must appear when clicked");

    // 3. Enter query and submit search
    console.log("  - Submitting query 'gaming mouse' via hero search input...");
    await pageClient.send("Runtime.evaluate", {
      expression: `
        (() => {
          const input = document.getElementById("hero-search-input");
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          nativeInputValueSetter.call(input, "gaming mouse");
          input.dispatchEvent(new Event('input', { bubbles: true }));
        })()
      `,
    });
    await sleep(200);
    await pageClient.send("Runtime.evaluate", {
      expression: `document.querySelector('#hero-search button[type="submit"]')?.click();`,
    });
    await sleep(1500);

    const searchUrl = await pageClient.send("Runtime.evaluate", {
      expression: `window.location.href`,
      returnByValue: true,
    });
    console.log(`  - Result URL after search: ${searchUrl.result.value}`);
    assert.ok(
      searchUrl.result.value.includes("/search?q=gaming+mouse") || searchUrl.result.value.includes("/search?q=gaming%20mouse"),
      "Search navigation must succeed"
    );
    console.log("  ✓ Search interaction test passed!\n");

    console.log("================================================================================");
    console.log("ALL VIEWPORT AND INTERACTION CHECKS PASSED SUCCESSFULLY!");
    console.log("================================================================================");
  } finally {
    if (pageClient) pageClient.close();
    if (browserClient) browserClient.close();
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
