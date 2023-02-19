import qs from "qs";
import { erc20ABI } from "wagmi";
import { Contract } from "@ethersproject/contracts";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { fetchPrice, fetchQuote, validateResponseData } from "~/api";
import {
  ENDPOINTS,
  CHAIN_IDS,
  ZERO_EX_PROXY,
  getTokenListBySymbol,
} from "~/constants";

import type { Signer } from "@wagmi/core";
import type { Dispatch, ChangeEvent } from "react";
import type { ActionTypes } from "./reducer";
import type { IReducerState } from "./reducer";
import type { DebouncedFetch } from "~/hooks/useFetchDebouncePrice";
import type { QuoteRequest, PriceResponse, QuoteResponse } from "~/api/types";

const getTakerAddress = (state: IReducerState) => {
  return state.network === "hardhat" ? undefined : state.account;
};

export async function onSellTokenSelect(
  e: ChangeEvent<HTMLSelectElement>,
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>,
  chainId: number
) {
  const tokensBySymbol = getTokenListBySymbol(chainId);
  dispatch({ type: "choose sell token", payload: e.target.value });
  if (!state.buyAmount || !state.sellAmount) return;
  if (e.target.value === state.buyToken) {
    const params = {
      sellToken: e.target.value,
      buyToken: state.sellToken,
      buyAmount: parseUnits(
        state.sellAmount || "",
        tokensBySymbol[state.sellToken].decimals
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching quote", payload: true });
    dispatch({ type: "set buy amount", payload: state.sellAmount });
    dispatch({ type: "set sell amount", payload: "" });
    dispatch({ type: "set direction", payload: "buy" });

    const data = await fetchPrice(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData<PriceResponse>(data);
    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set price", payload: dataOrError as PriceResponse });
    }
  } else {
    const amount: { buyAmount?: string; sellAmount?: string } = {};
    if (state.direction === "sell") {
      amount.sellAmount = parseUnits(
        state.sellAmount,
        tokensBySymbol[e.target.value].decimals
      ).toString();
    } else {
      amount.buyAmount = parseUnits(
        state.buyAmount,
        tokensBySymbol[state.buyToken].decimals
      ).toString();
    }

    const params = {
      sellToken: e.target.value,
      buyToken: state.buyToken,
      takerAddress: getTakerAddress(state),
      ...amount,
    };

    dispatch({ type: "fetching quote", payload: true });
    const data = await fetchPrice(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData<PriceResponse>(data);
    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set price", payload: dataOrError as PriceResponse });
    }
  }
}

export async function onBuyTokenSelect(
  e: ChangeEvent<HTMLSelectElement>,
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>,
  chainId: number
) {
  const tokensBySymbol = getTokenListBySymbol(chainId);
  dispatch({ type: "choose buy token", payload: e.target.value });
  if (!state.buyAmount || !state.sellAmount) return;
  if (e.target.value === state.sellToken) {
    const params = {
      buyToken: e.target.value,
      sellToken: state.buyToken,
      sellAmount: parseUnits(
        state.buyAmount || "",
        tokensBySymbol[state.buyToken].decimals
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching price", payload: true });
    dispatch({ type: "set sell amount", payload: state.buyAmount });
    dispatch({ type: "set buy amount", payload: "" });
    dispatch({ type: "set direction", payload: "sell" });
    const data = await fetchPrice(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData<PriceResponse>(data);
    dispatch({ type: "set price", payload: dataOrError as PriceResponse });
  } else {
    const amount: { buyAmount?: string; sellAmount?: string } = {};
    if (state.direction === "sell") {
      amount.sellAmount = parseUnits(
        state.sellAmount,
        tokensBySymbol[state.sellToken].decimals
      ).toString();
    } else {
      amount.buyAmount = parseUnits(
        state.buyAmount,
        tokensBySymbol[state.buyToken].decimals
      ).toString();
    }

    const params = {
      sellToken: state.sellToken,
      buyToken: e.target.value,
      takerAddress: getTakerAddress(state),
      ...amount,
    };

    dispatch({ type: "fetching price", payload: true });
    const data = await fetchPrice(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData<PriceResponse>(data);
    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set price", payload: dataOrError as PriceResponse });
    }
  }
}

async function checkAllowance({
  state,
  dispatch,
  signer,
  contractAddress,
}: {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  signer: Signer;
  contractAddress?: string;
}) {
  if (contractAddress && state.account) {
    const erc20 = new Contract(contractAddress, erc20ABI, signer);
    const allowance = await erc20.allowance(state.account, ZERO_EX_PROXY);

    if (allowance["_hex"] === "0x00") {
      dispatch({ type: "set approval required", payload: true });
    } else {
      dispatch({ type: "set approval required", payload: false });
    }
  }
}

export async function onDirectionChange(
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>,
  chainId: number,
  signer?: Signer
) {
  const tokensBySymbol = getTokenListBySymbol(chainId);
  const contractAddress = tokensBySymbol[state.buyToken].address;
  const takerAddress = getTakerAddress(state);
  if (state.direction === "sell") {
    signer &&
      checkAllowance({
        state,
        dispatch,
        signer,
        contractAddress,
      });

    const params = {
      sellToken: state.buyToken,
      buyToken: state.sellToken,
      buyAmount: parseUnits(
        state.sellAmount || "0",
        tokensBySymbol[state.sellToken].decimals
      ).toString(),
      ...(takerAddress ? { takerAddress } : {}),
    };

    const endpoint = ENDPOINTS[CHAIN_IDS[state.network]];
    dispatch({ type: "fetching quote", payload: true });
    const response = await fetch(
      `${endpoint}/swap/v1/price?${qs.stringify(params)}`
    );
    const data = await response.json();
    const dataOrError = validateResponseData<PriceResponse>(data);
    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set price", payload: data as PriceResponse });
      dispatch({
        type: "set sell amount",
        payload: Number(
          formatUnits(
            (dataOrError as PriceResponse).sellAmount,
            tokensBySymbol[state.buyToken].decimals
          )
        ).toFixed(6),
      });
    }
  } else {
    signer &&
      checkAllowance({
        state,
        dispatch,
        signer,
        contractAddress,
      });

    const params = {
      sellToken: state.buyToken,
      buyToken: state.sellToken,
      sellAmount: parseUnits(
        state.buyAmount || "0",
        tokensBySymbol[state.buyToken].decimals
      ).toString(),
      ...(takerAddress ? { takerAddress } : {}),
    };

    const endpoint = ENDPOINTS[CHAIN_IDS[state.network]];
    dispatch({ type: "fetching price", payload: true });
    const response = await fetch(
      `${endpoint}/swap/v1/price?${qs.stringify(params)}`
    );
    const data = await response.json();
    const dataOrError = validateResponseData<PriceResponse>(data);

    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set price", payload: dataOrError as PriceResponse });
      dispatch({
        type: "set buy amount",
        payload: Number(
          formatUnits(
            (data as PriceResponse).buyAmount,
            tokensBySymbol[state.sellToken].decimals
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
  fetchPrice,
  chainId
}: {
  e: ChangeEvent<HTMLInputElement>;
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  fetchPrice?: DebouncedFetch;
  chainId: number;
}) {
  if (e.target.validity.valid) {
    dispatch({ type: "set sell amount", payload: e.target.value });
    dispatch({ type: "set direction", payload: "sell" });

    const value = parseFloat(e.target.value || "0").toString();

    if (value && value !== "0") {
      const { sellToken, buyToken, network } = state;
      const tokensBySymbol = getTokenListBySymbol(chainId);
      const decimal = tokensBySymbol[sellToken].decimals;
      const sellAmount = parseUnits(value, decimal).toString();
      const takerAddress = getTakerAddress(state);
      const params = {
        sellToken,
        buyToken,
        sellAmount,
        ...(takerAddress ? { takerAddress } : {}),
      };

      if (fetchPrice) {
        dispatch({ type: "fetching price", payload: true });
        fetchPrice(params, network);
      }
    }
  }
}

export function onBuyAmountChange({
  e,
  state,
  dispatch,
  fetchPrice,
  chainId
}: {
  e: ChangeEvent<HTMLInputElement>;
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  fetchPrice?: DebouncedFetch;
  chainId: number;
}) {
  if (e.target.validity.valid) {
    dispatch({ type: "set buy amount", payload: e.target.value });
    dispatch({ type: "set direction", payload: "buy" });

    const value = parseFloat(e.target.value || "0").toString();

    if (value && value !== "0") {
      const { sellToken, buyToken, network } = state;
      const tokensBySymbol = getTokenListBySymbol(chainId);
      const decimal = tokensBySymbol[buyToken].decimals;
      const buyAmount = parseUnits(value, decimal).toString();
      const takerAddress = getTakerAddress(state);
      const params = { sellToken, buyToken, buyAmount, takerAddress };

      if (fetchPrice) {
        dispatch({ type: "fetching quote", payload: true });
        fetchPrice(params, network);
      }
    }
  }
}

export async function onFetchQuote({
  state,
  dispatch,
  chainId
}: {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  chainId: number;
}) {
  const { buyToken, sellToken } = state;
  const takerAddress = getTakerAddress(state);
  const tokensBySymbol = getTokenListBySymbol(chainId);

  if (fetchQuote) {
    dispatch({ type: "fetching quote", payload: true });
    let params: QuoteRequest = { buyToken, sellToken };

    if (state.direction === "buy") {
      params = {
        sellToken,
        buyToken,
        buyAmount: parseUnits(
          state.buyAmount || "",
          tokensBySymbol[state.buyToken].decimals
        ).toString(),
        takerAddress,
      };
    } else {
      params = {
        sellToken,
        buyToken,
        sellAmount: parseUnits(
          state.sellAmount || "",
          tokensBySymbol[state.sellToken].decimals
        ).toString(),
        takerAddress,
      };
    }
    const data = await fetchQuote(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData(data);

    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set price", payload: undefined });
      dispatch({ type: "set quote", payload: data as QuoteResponse });
      dispatch({ type: "set finalize order" });
    }

    dispatch({ type: "fetching quote", payload: false });
    dispatch({ type: "fetching price", payload: false });

    return data;
  }
}
