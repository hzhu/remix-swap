import puppeteer from "puppeteer";
import type { Browser, Page } from "puppeteer";

describe("dark mode", () => {
  let page: Page;
  let browser: Browser;

  async function getBodyStyles() {
    const [body] = await page.$$("body");

    const computedStyles = await body.evaluate((domElement) => {
      return JSON.parse(JSON.stringify(getComputedStyle(domElement)));
    });

    return computedStyles;
  }

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:3000/swap");
  });

  it("toggles dark mode on and off", async () => {
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: "dark" },
    ]);
    const [html] = await page.$$("html");
    const isDark = async () =>
      (await html.getProperty("className")).toString() === "JSHandle:dark";

    let bodyStyles = await getBodyStyles();

    if (await isDark()) {
      expect(bodyStyles.backgroundColor).toBe("rgb(17, 24, 39)");
    } else {
      expect(bodyStyles.backgroundColor).toBe("rgb(248, 250, 252)");
    }

    await page.click("#dark-mode-toggle");

    await pause(0.5);

    bodyStyles = await getBodyStyles();

    if (await isDark()) {
      expect(bodyStyles.backgroundColor).toBe("rgb(17, 24, 39)");
    } else {
      expect(bodyStyles.backgroundColor).toBe("rgb(248, 250, 252)");
    }

    await browser.close();
  });
});

function pause(seconds: number) {
  return new Promise((res) => setTimeout(res, 1000 * seconds));
}
