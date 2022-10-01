# remix-swap

## Overview

A simple ERC-20 swap application built on [Remix](https://remix.run/) using the [0x API](https://docs.0x.org/introduction/introduction-to-0x).

## Quick start

1) Create an `.env` file and setup the required [environment variables](.env.example)

| ENV Variable  | Description |
| ------------- | ------------- |
| `ALCHEMY_API_KEY`  | Alchemy API key (create one [here](https://docs.alchemy.com/docs/alchemy-quickstart-guide#1key-create-an-alchemy-key))  |
| `SESSION_SECRET`  | Used to [sign cookies](https://remix.run/docs/en/v1/api/remix#signing-cookies) and can be any string  |
| `RPC_TEST_URL`  | RPC URL for E2E testing e.g. `https://eth-mainnet.alchemyapi.io/v2/<alchemy-api-key-here>`  |

2) Install the project dependencies

```sh
npm install
```

3) Start the Remix development server

```sh
npm run dev
```

4) Navigate to [http://localhost:3000](http://localhost:3000)

```sh
open http://localhost:3000
```

## Testing

The end-to-end (E2E) test command tests user flows from beginning to end using browser automation. First, Hardhat spins up a local node and forks Ethereum mainnet. A script sends JSON-RPC calls to the node in order to setup the test accounts. This involves impersonating an ERC-20 whale and moving an amount of ERC-20 tokens to the test account. Second, the test command launches up Chrome with Puppeteer, which configures & connects MetaMask with the test account. Finally, Puppeteer runs through user flow(s) from start to end. For example, from MetaMask wallet connection -> entering a trade amount -> submitting a trade.

A GitHub Action [runs the tests](https://github.com/hzhu/remix-swap/blob/main/.github/workflows/end-to-end-tests.yml#L18-L25) in a headless browser using xvfb.

```
npm run test:e2e
```

<img width="550" src=".github/e2e.gif" alt="end-to-end testing demonstration" />
