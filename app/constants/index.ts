export const DEFAULT_CHAIN_ID = 1;

// https://docs.0x.org/introduction/0x-cheat-sheet#exchange-proxy-addresses
// https://github.com/0xProject/protocol/blob/development/packages/contract-addresses/addresses.json
export const ZERO_EX_PROXY: Record<string, `0x${string}`> = {
  "1": "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  "5": "0xf91bb752490473b8342a3e964e855b9f9a2a668e",
  "137": "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  "31337": "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
};

export const initialPairByNetwork = {
  ethereum: ["weth", "dai"],
  matic: ["weth", "dai"],
  goerli: ["weth", "uni"],
  hardhat: ["weth", "dai"],
} as const;

export const initialPairByChainId: Record<string, ("weth" | "dai" | "uni")[]> = {
  "1": ["weth", "dai"],
  "5": ["weth", "uni"],
  "137": ["weth", "uni"],
  "31337": ["weth", "uni"],
};

export const CHAIN_IDS: Record<string, number> = {
  mainnet: 1,
  ethereum: 1,
  polygon: 137,
  goerli: 5,
  hardhat: 31337,
};

// https://docs.0x.org/0x-api-swap/api-references
export const ENDPOINTS: Record<number, string> = {
  1: "https://api.0x.org",
  5: "https://goerli.api.0x.org",
  137: "https://polygon.api.0x.org",
  31337: "https://api.0x.org", // hardhat mainnet fork
};

interface Token {
  name: string;
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
}

export const GOERLI_TOKENS: Token[] = [
  {
    name: "Wrapped Ether",
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    symbol: "WETH",
    decimals: 18,
    chainId: 5,
    logoURI: "https://wallet-asset.matic.network/img/tokens/weth.svg",
  },
  {
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    symbol: "UNI",
    decimals: 18,
    chainId: 5,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
  },
];

export const POLYGON_TOKENS: Token[] = [
  {
    chainId: 137,
    name: "Wrapped Matic",
    symbol: "WMATIC",
    decimals: 18,
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    logoURI:
      "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png",
  },
  {
    chainId: 137,
    name: "Wrapped ETH",
    symbol: "WETH",
    decimals: 18,
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    logoURI: "https://wallet-asset.matic.network/img/tokens/weth.svg",
  },
  {
    chainId: 137,
    name: "Uniswap",
    symbol: "UNI",
    decimals: 18,
    address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
    logoURI: "https://wallet-asset.matic.network/img/tokens/uni.svg",
  },
  {
    chainId: 137,
    name: "Wrapped BTC",
    symbol: "WBTC",
    decimals: 8,
    address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    logoURI: "https://wallet-asset.matic.network/img/tokens/wbtc.svg",
  },
  {
    chainId: 137,
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    logoURI: "https://wallet-asset.matic.network/img/tokens/usdc.svg",
  },
  {
    chainId: 137,
    name: "Dai - PoS",
    symbol: "DAI",
    decimals: 18,
    address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    logoURI: "https://wallet-asset.matic.network/img/tokens/dai.svg",
  },
];

export const MAINNET_TOKENS: Token[] = [
  {
    name: "Wrapped Ether",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "WETH",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  {
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
  },
  {
    chainId: 1,
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    name: "Polygon",
    symbol: "MATIC",
    decimals: 18,
    logoURI:
      "https://wallet-asset.matic.network/img/tokens/matic.svg",
  },
  {
    name: "USDCoin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    decimals: 6,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
  {
    name: "Wrapped BTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    symbol: "WBTC",
    decimals: 8,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  },
  {
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    symbol: "UNI",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://bafybeien7mnoult3iphc7pxzufehfrrlntzr6x2f4lplqdub4mrh3bwah4.ipfs.dweb.link/",
  },
];

export const GOERLI_TOKENS_BY_SYMBOL: Record<string, Token> =
  GOERLI_TOKENS.reduce((acc, curr) => {
    const { symbol } = curr;
    return {
      ...acc,
      [symbol.toLowerCase()]: curr,
    };
  }, {});

const MATIC_TOKENS_BY_SYMBOL: Record<string, Token> = POLYGON_TOKENS.reduce(
  (acc, curr) => {
    const { symbol } = curr;
    return {
      ...acc,
      [symbol.toLowerCase()]: curr,
    };
  },
  {}
);

const MAINNET_TOKENS_BY_SYMBOL: Record<string, Token> = MAINNET_TOKENS.reduce(
  (acc, curr) => {
    const { symbol } = curr;
    return {
      ...acc,
      [symbol.toLowerCase()]: curr,
    };
  },
  {}
);

export const TOKEN_LISTS_BY_NETWORK: Record<string, Token[]> = {
  "5": GOERLI_TOKENS,
  "1": MAINNET_TOKENS,
  "137": POLYGON_TOKENS,
  "31337": MAINNET_TOKENS,
};

export type BySymbol = Record<string, Token>;

// add supported networks or explodes :(
export const TOKEN_LISTS_MAP_BY_NETWORK: Record<string, BySymbol> = {
  "5": GOERLI_TOKENS_BY_SYMBOL,
  "1": MAINNET_TOKENS_BY_SYMBOL,
  "137": MATIC_TOKENS_BY_SYMBOL,
  "31337": MAINNET_TOKENS_BY_SYMBOL, // We fork mainnet for hardhat so this is okay
};

// map
export const getTokenListBySymbol = (chainId: number) => {
  return TOKEN_LISTS_MAP_BY_NETWORK[chainId];
};
