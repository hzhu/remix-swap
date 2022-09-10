import type { Browser } from "puppeteer";
import type { Dappeteer } from "@chainsafe/dappeteer";

declare global {
  var browser: Browser;
  var metamask: Dappeteer;
}
