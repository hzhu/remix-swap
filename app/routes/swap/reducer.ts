import { formatUnits } from "@ethersproject/units";
import { TOKENS } from "~/constants";
import type { Quote } from "~/hooks/useFetchDebounceQuote";
import type { ZeroExClientError } from './utils'

type TradeDirection = "buy" | "sell";

export interface IReducerState {
  quote?: Quote;
  network: string;
  account?: string;
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
  | { type: "set quote"; payload: Quote }
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
  account: "",
  error: undefined,
};

const supportedTokens = new Set(["weth", "usdc", "dai", "matic"]);

export const getInitialState = (
  searchParams: URLSearchParams,
  account?: string
): IReducerState => {
  const sell = searchParams.get("sell") || initialState.sellToken;
  const buy = searchParams.get("buy") || initialState.buyToken;

  return {
    ...initialState,
    account,
    sellToken: supportedTokens.has(sell) ? sell : initialState.sellToken,
    buyToken: supportedTokens.has(buy) ? buy : initialState.buyToken,
  };
};

export const reducer = (
  state: IReducerState,
  action: ActionTypes
): IReducerState => {
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
    case "fetching quote":
      return { ...state, fetching: action.payload };
    case "set quote":
      if (state.direction === "buy") {
        return {
          ...state,
          fetching: false,
          quote: action.payload,
          sellAmount: Number(
            formatUnits(
              action.payload.sellAmount,
              TOKENS[state.sellToken].decimal
            )
          ).toString(),
          error: undefined
        };
      }

      return {
        ...state,
        fetching: false,
        quote: action.payload,
        buyAmount: Number(
          formatUnits(action.payload.buyAmount, TOKENS[state.buyToken].decimal)
        ).toString(),
        error: undefined
      };
    case "set sell amount":
      return { ...state, fetching: false, sellAmount: action.payload, error: undefined };
    case "set buy amount":
      return { ...state, fetching: false, buyAmount: action.payload, error: undefined };
    case "error":
      return { ...state, error: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
