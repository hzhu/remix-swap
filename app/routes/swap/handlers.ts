import qs from "qs";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { MaxInt256 } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import ERC20_ABI from "~/abis/ERC20_ABI.json";
import { TOKENS, ENDPOINTS, CHAIN_IDS, ZERO_EX_PROXY } from "~/constants";
import { fetchQuote, validateResponseData } from "./utils";
import type {
  FetchSignerResult,
  SendTransactionUnpreparedRequest,
} from "@wagmi/core";
import type { Dispatch, ChangeEvent } from "react";
import type { ActionTypes } from "./reducer";
import type { IReducerState } from "./reducer";
import type {
  Quote,
  DebouncedFetch,
  ZeroExServerError,
} from "~/hooks/useFetchDebounceQuote";

type UseSendTransactionMutationArgs = {
  recklesslySetUnpreparedRequest: SendTransactionUnpreparedRequest["request"];
};

type SendTransactionFn = (
  overrideConfig?: UseSendTransactionMutationArgs
) => void;

const getTakerAddress = (state: IReducerState) => {
  return state.network === "hardhat" ? undefined : state.account;
};

export async function onSellTokenSelect(
  e: ChangeEvent<HTMLSelectElement>,
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>
) {
  dispatch({ type: "choose sell token", payload: e.target.value });
  if (state.sellAmount === "") return;
  if (e.target.value === state.buyToken) {
    const params = {
      sellToken: e.target.value,
      buyToken: state.sellToken,
      buyAmount: parseUnits(
        state.sellAmount || "",
        TOKENS[state.sellToken].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching quote", payload: true });
    dispatch({ type: "set buy amount", payload: state.sellAmount });
    dispatch({ type: "set sell amount", payload: "" });
    dispatch({ type: "set direction", payload: "buy" });
    // TODO: check if user has enough tokens to sell; otherwise app crashes
    const quote = await fetchQuote(ENDPOINTS[CHAIN_IDS[state.network]], params);
    dispatch({ type: "set quote", payload: quote });
  } else {
    const params = {
      sellToken: e.target.value,
      buyToken: state.buyToken,
      sellAmount: parseUnits(
        state.sellAmount || "",
        TOKENS[e.target.value].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching quote", payload: true });
    const quote = await fetchQuote(ENDPOINTS[CHAIN_IDS[state.network]], params);
    dispatch({ type: "set quote", payload: quote });
  }
}

export async function onBuyTokenSelect(
  e: ChangeEvent<HTMLSelectElement>,
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>
) {
  dispatch({ type: "choose buy token", payload: e.target.value });
  if (state.buyAmount === "") return;
  if (e.target.value === state.sellToken) {
    const params = {
      buyToken: e.target.value,
      sellToken: state.buyToken,
      sellAmount: parseUnits(
        state.buyAmount || "",
        TOKENS[state.buyToken].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching quote", payload: true });
    dispatch({ type: "set sell amount", payload: state.buyAmount });
    dispatch({ type: "set buy amount", payload: "" });
    dispatch({ type: "set direction", payload: "sell" });
    const quote = await fetchQuote(ENDPOINTS[CHAIN_IDS[state.network]], params);
    dispatch({ type: "set quote", payload: quote });
  } else {
    const params = {
      sellToken: state.sellToken,
      buyToken: e.target.value,
      buyAmount: parseUnits(
        state.buyAmount || "0",
        TOKENS[e.target.value].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching quote", payload: true });
    const quote = await fetchQuote(ENDPOINTS[CHAIN_IDS[state.network]], params);
    dispatch({ type: "set quote", payload: quote });
  }
}

export async function onDirectionChange(
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>
) {
  if (state.direction === "sell") {
    const params = {
      sellToken: state.buyToken,
      buyToken: state.sellToken,
      buyAmount: parseUnits(
        state.sellAmount || "0",
        TOKENS[state.sellToken].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };

    const endpoint = ENDPOINTS[CHAIN_IDS[state.network]];
    dispatch({ type: "fetching quote", payload: true });
    const response = await fetch(
      `${endpoint}/swap/v1/quote?${qs.stringify(params)}`
    );
    const data: Quote | ZeroExServerError = await response.json();
    const dataOrError = validateResponseData(data);
    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set quote", payload: data as Quote });
      dispatch({
        type: "set sell amount",
        payload: Number(
          formatUnits(
            (data as Quote).sellAmount,
            TOKENS[state.buyToken].decimal
          )
        ).toFixed(6),
      });
    }
  } else {
    const params = {
      sellToken: state.buyToken,
      buyToken: state.sellToken,
      sellAmount: parseUnits(
        state.buyAmount || "0",
        TOKENS[state.buyToken].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };

    const endpoint = ENDPOINTS[CHAIN_IDS[state.network]];
    dispatch({ type: "fetching quote", payload: true });
    const response = await fetch(
      `${endpoint}/swap/v1/quote?${qs.stringify(params)}`
    );
    const data: Quote | ZeroExServerError = await response.json();
    const dataOrError = validateResponseData(data);

    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set quote", payload: data as Quote });
      dispatch({
        type: "set buy amount",
        payload: Number(
          formatUnits(
            (data as Quote).buyAmount,
            TOKENS[state.sellToken].decimal
          )
        ).toFixed(6),
      });
    }
  }
}

export function onSellAmountChange({
  e,
  state,
  dispatch,
  fetchQuote,
}: {
  e: ChangeEvent<HTMLInputElement>;
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  fetchQuote?: DebouncedFetch;
}) {
  if (e.target.validity.valid) {
    dispatch({ type: "set sell amount", payload: e.target.value });
    dispatch({ type: "set direction", payload: "sell" });

    const value = parseFloat(e.target.value || "0").toString();

    if (value && value !== "0") {
      const { sellToken, buyToken, network } = state;
      const decimal = TOKENS[sellToken].decimal;
      const sellAmount = parseUnits(value, decimal).toString();
      const takerAddress = getTakerAddress(state);
      const params = { sellToken, buyToken, sellAmount, takerAddress };

      if (fetchQuote) {
        dispatch({ type: "fetching quote", payload: true });
        fetchQuote(params, network);
      }
    }
  }
}

export function onBuyAmountChange({
  e,
  state,
  dispatch,
  fetchQuote,
}: {
  e: ChangeEvent<HTMLInputElement>;
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  fetchQuote?: DebouncedFetch;
}) {
  if (e.target.validity.valid) {
    dispatch({ type: "set buy amount", payload: e.target.value });
    dispatch({ type: "set direction", payload: "buy" });

    const value = parseFloat(e.target.value || "0").toString();

    if (value && value !== "0") {
      const { sellToken, buyToken, network } = state;
      const decimal = TOKENS[buyToken].decimal;
      const buyAmount = parseUnits(value, decimal).toString();
      const takerAddress = getTakerAddress(state);
      const params = { sellToken, buyToken, buyAmount, takerAddress };

      if (fetchQuote) {
        dispatch({ type: "fetching quote", payload: true });
        fetchQuote(params, network);
      }
    }
  }
}

export async function placeOrder({
  signer,
  sendTransaction,
  sellTokenAddress,
}: {
  signer?: FetchSignerResult;
  sendTransaction?: SendTransactionFn;
  sellTokenAddress?: string;
}) {
  const owner = await signer?.getAddress();

  if (sellTokenAddress && signer) {
    const erc20 = new Contract(sellTokenAddress, ERC20_ABI, signer);
    const allowance = await erc20.allowance(owner, ZERO_EX_PROXY);

    if (allowance.toString() === "0") {
      await erc20.approve(ZERO_EX_PROXY, MaxInt256);
    }

    sendTransaction && sendTransaction();
  }
}
