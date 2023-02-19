// https://docs.0x.org/introduction/0x-cheat-sheet#exchange-proxy-addresses
// https://github.com/0xProject/protocol/blob/development/packages/contract-addresses/addresses.json
export const ZERO_EX_PROXY: Record<string, `0x${string}`> = {
  "1": "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  "5": "0xf91bb752490473b8342a3e964e855b9f9a2a668e",
};

type s = "1" | "5" | "137" | "31337";

export const initialPairByChainId: Record<string, string[]> = {
  "1": ["weth", "dai"],
  "5": ["weth", "uni"],
  "137": ["weth", "uni"],
  "31337": ["weth", "uni"],
};

export const CHAIN_IDS: Record<string, number> = {
  mainnet: 1,
  ethereum: 1,
  polygon: 142,
  ropsten: 3,
  goerli: 5,
  hardhat: 31337,
};

// https://docs.0x.org/0x-api-swap/api-references
export const ENDPOINTS: Record<number, string> = {
  1: "https://api.0x.org",
  142: "https://polygon.api.0x.org",
  3: "https://ropsten.api.0x.org",
  5: "https://goerli.api.0x.org",
  31337: "https://api.0x.org", // hardhat mainnet fork
};

interface ITokenDetail {
  chainId?: number;
  decimal: number;
  address?: string;
}

interface Token {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
  extensions?: {
    bridgeInfo: object;
  };
}

export const GOERLI_TOKENS: Token[] = [
  {
    name: "Wrapped Ether",
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    symbol: "WETH",
    decimals: 18,
    chainId: 5,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
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

export const MAINNET_TOKENS: Token[] = [
  {
    name: "Wrapped Ether",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "WETH",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    extensions: {
      bridgeInfo: {
        "10": {
          tokenAddress: "0x4200000000000000000000000000000000000006",
        },
        "42161": {
          tokenAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        },
        "137": {
          tokenAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        },
        "42220": {
          tokenAddress: "0x2DEf4285787d58a2f811AF24755A8150622f4361",
        },
      },
    },
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
      "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912",
    extensions: {
      bridgeInfo: {
        "137": {
          tokenAddress: "0x0000000000000000000000000000000000001010",
        },
      },
    },
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
    logoURI: "ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg",
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

export const TOKEN_LISTS_BY_NETWORK: Record<string, any> = {
  "5": GOERLI_TOKENS,
  "1": MAINNET_TOKENS,
  "31337": MAINNET_TOKENS,
};

type BySymbol = Record<string, Token>;

// add supported networks or explodes :( lol
export const TOKEN_LISTS_MAP_BY_NETWORK: Record<string, BySymbol> = {
  "5": GOERLI_TOKENS_BY_SYMBOL,
  "1": MAINNET_TOKENS_BY_SYMBOL,
  // "137": MATIC_TOKENS_BY_SYMBOL, // implement me
  "31337": MAINNET_TOKENS_BY_SYMBOL, // We fork mainnet for hardhat so this is okay
};

// map
export const getTokenListBySymbol = (chainId: number) => {
  return TOKEN_LISTS_MAP_BY_NETWORK[chainId];
};

const TOKENS: Record<string, ITokenDetail> = {
  zrx: {
    decimal: 18,
    chainId: 1,
    address: "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
  },
  "1inch": { decimal: 18 },
  bal: { decimal: 18 },
  bnt: { decimal: 18 },
  crv: { decimal: 18 },
  comp: { decimal: 18 },
  dai: {
    decimal: 18,
    chainId: 1,
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  ens: { decimal: 18 },
  link: { decimal: 18 },
  aave: { decimal: 18 },
  sushi: { decimal: 18 },
  sos: { decimal: 18 },
  snx: { decimal: 18 },
  uni: { decimal: 18 },
  usdt: { decimal: 6 },
  usdc: {
    decimal: 6,
    chainId: 1,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  wbtc: {
    decimal: 8,
    chainId: 1,
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  weth: {
    decimal: 18,
    chainId: 1,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  matic: {
    decimal: 18,
    chainId: 1,
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
};
