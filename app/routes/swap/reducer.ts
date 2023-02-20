import { formatUnits } from "@ethersproject/units";
import { getTokenListBySymbol } from "~/constants";
import type { BySymbol } from "~/constants";
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
  account?: `0x${string}`;
  sellToken: string;
  buyToken: string;
  sellAmount?: string;
  buyAmount?: string;
  fetching: boolean;
  direction: TradeDirection;
  error?: ZeroExClientError;
}

export type ActionTypes =
  | { type: "reset" }
  | { type: "reverse trade direction" }
  | { type: "set direction"; payload: TradeDirection }
  | { type: "select network"; payload: string }
  | { type: "choose sell token"; payload: string }
  | { type: "choose buy token"; payload: string }
  | { type: "fetching quote"; payload: boolean }
  | { type: "fetching price"; payload: boolean }
  | { type: "set finalize order" }
  | { type: "set account"; payload: `0x${string}` }
  | { type: "set quote"; payload: QuoteResponse | undefined }
  | { type: "set price"; payload: PriceResponse | undefined }
  | { type: "set sell amount"; payload?: string }
  | { type: "set buy amount"; payload?: string }
  | { type: "error"; payload?: ZeroExClientError };

const initialState: IReducerState = {
  sellToken: "weth",
  buyToken: "dai",
  network: "ethereum",
  sellAmount: "",
  buyAmount: "",
  direction: "sell",
  fetching: false,
  account: undefined,
  error: undefined,
  finalize: false,
  price: undefined,
  quote: undefined,
};

const supportedTokens = new Set([
  "usdc",
  "dai",
  "matic",
  "weth",
  "wbtc",
  "uni",
]);

export const getInitialState = (
  searchParams: URLSearchParams
): IReducerState => {
  const sell = searchParams.get("sell") || initialState.sellToken;
  const buy = searchParams.get("buy") || initialState.buyToken;

  return {
    ...initialState,
    sellToken: supportedTokens.has(sell) ? sell : initialState.sellToken,
    buyToken: supportedTokens.has(buy) ? buy : initialState.buyToken,
  };
};

export const reducer = (
  state: IReducerState,
  action: ActionTypes
): IReducerState => {
  let tokensBySymbol: BySymbol;

  switch (action.type) {
    case "select network":
      return { ...state, network: action.payload };
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
      tokensBySymbol = getTokenListBySymbol(action.payload.chainId);
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
      tokensBySymbol = getTokenListBySymbol(action.payload.chainId);
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
