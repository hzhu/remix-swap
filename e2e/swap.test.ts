import { allChains } from "wagmi";
import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import { parseUnits } from "@ethersproject/units";
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getDocument, queries } from "pptr-testing-library";
import ERC20_ABI from "../app/abis/ERC20_ABI.json";
import type { Browser, Page } from "puppeteer";
import type { Dappeteer } from "@chainsafe/dappeteer";

const [hardhat] = allChains.filter((chain) => chain.network === "hardhat");
const { id: chainId, name: networkName, rpcUrls } = hardhat;
const TEST_WALLET = "0xcba18C0e0BbcC57C70fdeC4451293a27Bd00f50e";
const TEST_WALLET_PRIVATE_KEY =
  "02d1336e3a503a98033fd76bfc7ccea616eb816a5cbac77d9ed46d71497f160c";
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WETH_WHALE = "0x4918fc71BD92F262c4D2F73804fa805de8602743";
const ETH_WHALE = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const { getByText, findAllByText, getByLabelText } = queries;

let metamask: Dappeteer;
let browser: Browser;
let testPage: Page;

async function fundTestAccount() {
  const PROVIDER = new JsonRpcProvider("http://127.0.0.1:8545/");
  await PROVIDER.send("hardhat_setNextBlockBaseFeePerGas", ["0x2540be400"]);
  await PROVIDER.send("hardhat_impersonateAccount", [ETH_WHALE]);
  await PROVIDER.send("eth_sendTransaction", [
    {
      from: ETH_WHALE,
      to: TEST_WALLET,
      gas: "0x76c0",
      gasPrice: "0x9184e72a000",
      value: "0x21e16f6b7d6f5e618a",
    },
  ]);

  const erc20 = new Contract(WETH_ADDRESS, ERC20_ABI, PROVIDER);
  await PROVIDER.send("hardhat_impersonateAccount", [WETH_WHALE]);
  await PROVIDER.send("eth_sendTransaction", [
    {
      from: WETH_WHALE,
      to: WETH_ADDRESS,
      gas: "0xebf0",
      gasPrice: "0x9184e72a000",
      data: erc20.interface.encodeFunctionData("transfer", [
        TEST_WALLET,
        parseUnits("400"),
      ]),
    },
  ]);

  await PROVIDER.send("hardhat_stopImpersonatingAccount", [ETH_WHALE]);
}

const options = {
  metamaskVersion:
    process.env.METAMASK_VERSION || dappeteer.RECOMMENDED_METAMASK_VERSION,
  defaultViewport: null,
};

describe("swap", () => {
  beforeAll(async () => {
    await fundTestAccount();

    browser = await dappeteer.launch(puppeteer, options);

    testPage = await browser.newPage();

    metamask = await dappeteer.setupMetamask(browser, {
      seed: "pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog",
      password: "password1234",
    });

    await metamask.addNetwork({
      chainId,
      networkName,
      symbol: "GO",
      rpc: rpcUrls.default,
    });
    await metamask.switchNetwork("Ethereum Mainnet");
    await metamask.importPK(TEST_WALLET_PRIVATE_KEY);
    await testPage.goto("http://localhost:3000/swap");
    await testPage.bringToFront();
    const document = await getDocument(testPage);
    const [connect] = await findAllByText(document, "Connect Wallet");
    await connect.click();
    await testPage.waitForXPath('//div[contains(text(), "MetaMask")]');
    const metaMaskBtn = await getByText(document, /MetaMask/i);
    await pause(0.5);
    await metaMaskBtn.click();
    await metamask.approve();
    await metamask.switchNetwork("Hardhat");
    await testPage.bringToFront();
  });

  it("completes a swap transaction", async () => {
    const docElement = await getDocument(testPage);
    const sellAmountInput = await getByLabelText(docElement, /Sell Amount/i);
    await sellAmountInput.type("1");
    await testPage.waitForFunction(() => {
      const [btn] = [...document.getElementsByTagName("button")].filter(
        (node) => node.innerText === "Place Order"
      );
      return btn.disabled === false ? btn : false;
    });
    const placeOrder = await getByText(docElement, /Place Order/i);
    await placeOrder.press("Enter");
    await pause(0.25);
    await metamask.confirmTransaction();
    await pause(0.5);
    await metamask.confirmTransaction();
    await testPage.waitForXPath('//div[contains(text(), "Confirmed")]');
    await testPage.bringToFront();
  });

  afterAll(async () => {
    await browser.close();
  });
});

function pause(seconds: number) {
  // It seems like dAppeteer in CI needs more time for simulations to happen
  if (process.env.CI) {
    return new Promise((res) => setTimeout(res, 1000 * seconds * 4));
  }

  return new Promise((res) => setTimeout(res, 1000 * seconds));
}
