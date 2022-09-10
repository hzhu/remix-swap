# remix-swap

## Development

To run the app locally, make sure the project's local dependencies are installed:

```sh
npm install
```

Afterwards, start the Remix development server like so:

```sh
npm run dev
```

Open up [http://localhost:3000](http://localhost:3000).

## Testing

The end-to-end (E2E) test command tests user flows from beginning to end using browser automation. First, Hardhat spins up a local node and forks Ethereum mainnet. A script sends JSON-RPC calls to the node in order to setup the test accounts. This involves impersonating an ERC-20 whale and moving an amount of ERC-20 tokens to the test account. Second, the test command launches up Chrome with Puppeteer, which configures & connects MetaMask with the test account. Finally, Puppeteer runs through user flow(s) from start to end. For example, from MetaMask wallet connection -> entering a trade amount -> submitting a trade.

```
npm run test:e2e
```

<img width="550" src=".github/e2e.gif" alt="end-to-end testing demonstration" />
