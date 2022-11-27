import { formatUnits } from "@ethersproject/units";
import { erc20ABI, useContractRead } from "wagmi";
import { TOKENS } from "~/constants";

import type { Dispatch, ReactNode } from "react";
import type { DebouncedFetch } from "~/hooks/useFetchDebouncePrice";
import type { ActionTypes, IReducerState } from "../routes/swap/reducer";

interface MaxArgs {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  address: `0x${string}`;
  fetchPrice?: DebouncedFetch;
  children?: ReactNode;
}

export function Max({
  state,
  dispatch,
  address,
  fetchPrice,
  children,
}: MaxArgs) {
  const { data: balance } = useContractRead({
    address: TOKENS[state.sellToken].address,
    functionName: "balanceOf",
    args: [address],
    abi: erc20ABI,
  });

  const sellBalance = balance
    ? formatUnits(balance.toString(), TOKENS[state.sellToken].decimal)
    : "";

  const sellBalanceText = sellBalance
    .split(".")
    .map((s, i) => (i === 1 ? s.slice(0, 2) : s))
    .join(".");

  const onMaxSell = () => {
    dispatch({
      type: "set sell amount",
      payload: sellBalance,
    });
    const { sellToken, buyToken, network } = state;
    const sellAmount = balance?.toString();
    const params = {
      sellToken,
      buyToken,
      sellAmount,
      takerAddress: address,
    };
    dispatch({ type: "fetching quote", payload: true });
    dispatch({ type: "set direction", payload: "sell" });
    fetchPrice && fetchPrice(params, network);
  };

  return sellBalance ? (
    <div className="flex">
      <div className="text-xs mr-1">{sellBalanceText}</div>
      {sellBalance !== "0.0" ? (
        <button
          type="button"
          onClick={onMaxSell}
          className="text-xs italic hover:bg-blue-600 hover:underline hover:text-slate-50 active:underline active:text-slate-50"
        >
          {children}
        </button>
      ) : null}
    </div>
  ) : null;
}
