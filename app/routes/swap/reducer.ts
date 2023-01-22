import { formatUnits } from "@ethersproject/units";
import { getTokenListBySymbol } from "~/constants";
import { initialPairByChainId, CHAIN_IDS } from "~/constants";
import type { Chain } from "wagmi";
import type {
  PriceResponse,
  QuoteResponse,
  ZeroExClientError,
} from "~/api/types";

type TradeDirection = "buy" | "sell";

export interface IReducerState {
  quote?: QuoteResponse;
  price?: PriceResponse;
  finalize: boolean;
  network: string;
  chainId: number;
  account?: `0x${string}`;
  sellToken: string;
  buyToken: string;
  sellAmount?: string;
  buyAmount?: string;
  fetching: boolean;
  approvalRequired: boolean;
  direction: TradeDirection;
  error?: ZeroExClientError;
}

export type ActionTypes =
  | { type: "reset" }
  | { type: "reverse trade direction" }
  | { type: "set direction"; payload: TradeDirection }
  | { type: "select network"; payload: string }
  | { type: "select chain id"; payload: number }
  | { type: "set sell token"; payload: string }
  | { type: "set buy token"; payload: string }
  | { type: "choose sell token"; payload: string }
  | { type: "choose buy token"; payload: string }
  | { type: "fetching quote"; payload: boolean }
  | { type: "fetching price"; payload: boolean }
  | { type: "set finalize order" }
  | { type: "set account"; payload: `0x${string}` }
  | { type: "set approval required"; payload: boolean }
  | { type: "set quote"; payload: QuoteResponse | undefined }
  | { type: "set price"; payload: PriceResponse | undefined }
  | { type: "set sell amount"; payload?: string }
  | { type: "set buy amount"; payload?: string }
  | { type: "error"; payload?: ZeroExClientError };

const initialState: IReducerState = {
  sellToken: "weth",
  buyToken: "dai",
  network: "ethereum",
  chainId: 1,
  sellAmount: "",
  buyAmount: "",
  direction: "sell",
  fetching: false,
  account: undefined,
  error: undefined,
  finalize: false,
  approvalRequired: false,
  price: undefined,
  quote: undefined,
};

const DEFAULT_CHAIN_ID = 1;

export const getInitialState = (
  searchParams: URLSearchParams,
  chain?: Chain
): IReducerState => {
  const [sellToken, buyToken] =
    initialPairByChainId[chain?.id || DEFAULT_CHAIN_ID];

  const sellQuery = searchParams.get("sell");
  const buyQuery = searchParams.get("buy");

  return {
    ...initialState,
    chainId: chain?.id || DEFAULT_CHAIN_ID,
    sellToken: sellQuery || sellToken,
    buyToken: buyQuery || buyToken,
  };
};

export const reducer = (
  state: IReducerState,
  action: ActionTypes
): IReducerState => {
  const tokensBySymbol = getTokenListBySymbol(
    state.chainId || DEFAULT_CHAIN_ID
  );

  let sellToken;
  let buyToken;

  switch (action.type) {
    // move this out... otherwise when we refresh the URL hard resets to this :\
    case "select network":
      return {
        ...state,
        network: action.payload,
        chainId: CHAIN_IDS[action.payload],
      };
    case "select chain id":
      [sellToken, buyToken] = initialPairByChainId[action.payload];
      return { ...state, chainId: action.payload, sellToken, buyToken };
    case "set sell token":
      return {
        ...state,
        sellToken: action.payload,
      };
    case "set buy token":
      return {
        ...state,
        buyToken: action.payload,
      };
    case "choose sell token":
      if (state.buyToken === action.payload && state.sellToken === "") {
        return {
          ...state,
          sellToken: action.payload,
          buyToken: "",
        };
      }
      if (state.buyToken === action.payload) {
        return {
          ...state,
          sellToken: action.payload,
          buyToken: state.sellToken,
        };
      }
      return { ...state, sellToken: action.payload };
    case "choose buy token":
      if (state.sellToken === action.payload && state.buyToken === "") {
        return {
          ...state,
          sellToken: "",
          buyToken: action.payload,
        };
      }
      if (state.sellToken === action.payload) {
        return {
          ...state,
          sellToken: state.buyToken,
          buyToken: action.payload,
        };
      }
      return { ...state, buyToken: action.payload };
    case "set direction":
      return { ...state, direction: action.payload };
    case "reverse trade direction":
      if (state.direction === "sell") {
        return {
          ...state,
          buyToken: state.sellToken,
          sellToken: state.buyToken,
          sellAmount: "",
          buyAmount: state.sellAmount,
          direction: "buy",
        };
      } else if (state.direction === "buy") {
        return {
          ...state,
          buyToken: state.sellToken,
          sellToken: state.buyToken,
          buyAmount: "",
          sellAmount: state.buyAmount,
          direction: "sell",
        };
      } else {
        return {
          ...state,
          buyToken: state.sellToken,
          sellToken: state.buyToken,
        };
      }
    case "set quote":
      if (action.payload === undefined) {
        return { ...state, quote: undefined };
      }
      if (state.direction === "buy") {
        return {
          ...state,
          fetching: false,
          quote: action.payload,
          sellAmount: Number(
            formatUnits(
              action.payload.sellAmount,
              tokensBySymbol[state.sellToken].decimals
            )
          ).toString(),
          error: undefined,
        };
      }
      return {
        ...state,
        fetching: false,
        quote: action.payload,
        buyAmount: Number(
          formatUnits(
            action.payload.buyAmount,
            tokensBySymbol[state.buyToken].decimals
          )
        ).toString(),
        error: undefined,
      };
    case "set price":
      if (action.payload === undefined) {
        return { ...state, price: undefined };
      }
      if (state.direction === "buy") {
        return {
          ...state,
          fetching: false,
          price: action.payload,
          sellAmount: Number(
            formatUnits(
              action.payload.sellAmount,
              tokensBySymbol[state.sellToken].decimals
            )
          ).toString(),
          error: undefined,
        };
      }
      return {
        ...state,
        fetching: false,
        price: action.payload,
        buyAmount: Number(
          formatUnits(
            action.payload.buyAmount,
            tokensBySymbol[state.buyToken].decimals
          )
        ).toString(),
        error: undefined,
      };
    case "set sell amount":
      return {
        ...state,
        fetching: false,
        sellAmount: action.payload,
        error: undefined,
      };
    case "set buy amount":
      return {
        ...state,
        fetching: false,
        buyAmount: action.payload,
        error: undefined,
      };
    case "set approval required":
      return {
        ...state,
        approvalRequired: action.payload,
      };
    case "set finalize order":
      return {
        ...state,
        finalize: !state.finalize,
      };
    case "set account":
      return {
        ...state,
        account: action.payload,
      };
    case "fetching quote":
    case "fetching price":
      return { ...state, fetching: action.payload };
    case "error":
      return { ...state, error: action.payload };
    case "reset":
      return {
        ...initialState,
        account: state.account,
      };
    default:
      throw new Error(`Unhandled action: ${action}`);
  }
};
