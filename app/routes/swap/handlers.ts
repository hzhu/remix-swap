import { parseUnits } from "@ethersproject/units";
import { fetchQuote, validateResponseData } from "~/api";
import { ENDPOINTS, CHAIN_IDS, getTokenListBySymbol } from "~/constants";

import type { Dispatch, ChangeEvent } from "react";
import type { ActionTypes } from "./reducer";
import type { IReducerState } from "./reducer";
import type { DebouncedFetch } from "~/hooks/useFetchDebouncePrice";
import type { QuoteRequest, QuoteResponse } from "~/api/types";

const getTakerAddress = (state: IReducerState) => {
  return state.network === "hardhat" ? undefined : state.account;
};

export async function onSellTokenSelect(
  e: ChangeEvent<HTMLSelectElement>,
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>,
  chainId: number,
  fetchPrice?: DebouncedFetch
) {
  const tokensBySymbol = getTokenListBySymbol(chainId);
  const sellToken = tokensBySymbol[state.sellToken];
  const buyToken = tokensBySymbol[state.buyToken];
  const selectedToken = tokensBySymbol[e.target.value];

  dispatch({ type: "choose sell token", payload: e.target.value });
  if (!state.buyAmount || !state.sellAmount) return;
  if (e.target.value === buyToken.symbol) {
    const params = {
      sellToken: selectedToken.address,
      buyToken: sellToken.address,
      buyAmount: parseUnits(
        state.sellAmount || "",
        sellToken.decimals
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching quote", payload: true });
    dispatch({ type: "set buy amount", payload: state.sellAmount });
    dispatch({ type: "set sell amount", payload: "" });
    dispatch({ type: "set direction", payload: "buy" });

    if (fetchPrice) {
      dispatch({ type: "fetching price", payload: true });
      fetchPrice(params, CHAIN_IDS[state.network]);
    }
  } else {
    const amount: { buyAmount?: string; sellAmount?: string } = {};
    if (state.direction === "sell") {
      amount.sellAmount = parseUnits(
        state.sellAmount,
        selectedToken.decimals
      ).toString();
    } else {
      amount.buyAmount = parseUnits(
        state.buyAmount,
        buyToken.decimals
      ).toString();
    }

    const params = {
      sellToken: selectedToken.address,
      buyToken: buyToken.address,
      takerAddress: getTakerAddress(state),
      ...amount,
    };

    dispatch({ type: "fetching quote", payload: true });
    if (fetchPrice) {
      dispatch({ type: "fetching price", payload: true });
      fetchPrice(params, CHAIN_IDS[state.network]);
    }
  }
}

export async function onBuyTokenSelect(
  e: ChangeEvent<HTMLSelectElement>,
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>,
  chainId: number,
  fetchPrice?: DebouncedFetch
) {
  const tokensBySymbol = getTokenListBySymbol(chainId);
  const sellToken = tokensBySymbol[state.sellToken];
  const buyToken = tokensBySymbol[e.target.value];

  dispatch({ type: "choose buy token", payload: e.target.value });
  if (!state.buyAmount || !state.sellAmount) return;
  if (e.target.value === state.sellToken) {
    const params = {
      buyToken: buyToken.address,
      sellToken: sellToken.address,
      sellAmount: parseUnits(
        state.buyAmount || "",
        buyToken.decimals
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching price", payload: true });
    dispatch({ type: "set sell amount", payload: state.buyAmount });
    dispatch({ type: "set buy amount", payload: "" });
    dispatch({ type: "set direction", payload: "sell" });
    if (fetchPrice) {
      dispatch({ type: "fetching price", payload: true });
      fetchPrice(params, CHAIN_IDS[state.network]);
    }
  } else {
    const amount: { buyAmount?: string; sellAmount?: string } = {};
    if (state.direction === "sell") {
      amount.sellAmount = parseUnits(
        state.sellAmount,
        sellToken.decimals
      ).toString();
    } else {
      amount.buyAmount = parseUnits(
        state.buyAmount,
        buyToken.decimals
      ).toString();
    }

    const params = {
      sellToken: sellToken.address,
      buyToken: buyToken.address,
      takerAddress: getTakerAddress(state),
      ...amount,
    };

    if (fetchPrice) {
      dispatch({ type: "fetching price", payload: true });
      fetchPrice(params, CHAIN_IDS[state.network]);
    }
  }
}

export async function onDirectionChange(
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>,
  chainId: number,
  fetchPrice?: DebouncedFetch
) {
  const tokensBySymbol = getTokenListBySymbol(chainId);

  const sellToken = tokensBySymbol[state.sellToken];
  const buyToken = tokensBySymbol[state.buyToken];

  const takerAddress = getTakerAddress(state);
  if (state.direction === "sell") {
    const params = {
      sellToken: buyToken.address,
      buyToken: sellToken.address,
      buyAmount: parseUnits(
        state.sellAmount || "0",
        sellToken.decimals
      ).toString(),
      ...(takerAddress ? { takerAddress } : {}),
    };

    if (fetchPrice) {
      dispatch({ type: "fetching price", payload: true });
      fetchPrice(params, CHAIN_IDS[state.network]);
    }
  } else {
    const params = {
      sellToken: buyToken.address,
      buyToken: sellToken.address,
      sellAmount: parseUnits(
        state.buyAmount || "0",
        buyToken.decimals
      ).toString(),
      ...(takerAddress ? { takerAddress } : {}),
    };

    if (fetchPrice) {
      dispatch({ type: "fetching price", payload: true });
      fetchPrice(params, CHAIN_IDS[state.network]);
    }
  }
}

export function onSellAmountChange({
  e,
  state,
  dispatch,
  fetchPrice,
  chainId,
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
      const { network } = state;
      const tokensBySymbol = getTokenListBySymbol(chainId);
      const sellToken = tokensBySymbol[state.sellToken];
      const buyToken = tokensBySymbol[state.buyToken];
      const sellAmount = parseUnits(value, sellToken.decimals).toString();
      const takerAddress = getTakerAddress(state);
      const params = {
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount,
        ...(takerAddress ? { takerAddress } : {}),
      };

      if (fetchPrice) {
        dispatch({ type: "fetching price", payload: true });
        fetchPrice(params, CHAIN_IDS[network]);
      }
    }
  }
}

export function onBuyAmountChange({
  e,
  state,
  dispatch,
  fetchPrice,
  chainId,
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
      const { network } = state;
      const tokensBySymbol = getTokenListBySymbol(chainId);
      const sellToken = tokensBySymbol[state.sellToken];
      const buyToken = tokensBySymbol[state.buyToken];
      const buyAmount = parseUnits(value, buyToken.decimals).toString();
      const takerAddress = getTakerAddress(state);
      const params = {
        buyAmount,
        takerAddress,
        buyToken: buyToken.address,
        sellToken: sellToken.address,
      };

      if (fetchPrice) {
        dispatch({ type: "fetching quote", payload: true });
        fetchPrice(params, CHAIN_IDS[network]);
      }
    }
  }
}

export async function onFetchQuote({
  state,
  dispatch,
  chainId,
}: {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  chainId: number;
}) {
  const tokensBySymbol = getTokenListBySymbol(chainId);
  const sellToken = tokensBySymbol[state.sellToken];
  const buyToken = tokensBySymbol[state.buyToken];
  const takerAddress = getTakerAddress(state);

  if (fetchQuote) {
    dispatch({ type: "fetching quote", payload: true });
    let params: QuoteRequest = {
      buyToken: buyToken.address,
      sellToken: sellToken.address,
    };

    if (state.direction === "buy") {
      params = {
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        buyAmount: parseUnits(
          state.buyAmount || "",
          tokensBySymbol[state.buyToken].decimals
        ).toString(),
        takerAddress,
      };
    } else {
      params = {
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount: parseUnits(
          state.sellAmount || "",
          sellToken.decimals
        ).toString(),
        takerAddress,
      };
    }
    // TODO: use api key
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
