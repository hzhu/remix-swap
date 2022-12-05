import clsx from "clsx";
import { useCallback } from "react";
import { useSearchParams } from "@remix-run/react";
import { MaxInt256 } from "@ethersproject/constants";
import {
  erc20ABI,
  useSigner,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { primaryButton } from "./index";
import { validateResponseData } from "~/api";
import { useFetchDebouncePrice } from "~/hooks";
import { TOKENS, ZERO_EX_PROXY } from "~/constants";
import {
  onFetchQuote,
  onBuyTokenSelect,
  onDirectionChange,
  onSellTokenSelect,
  onSellAmountChange,
  onBuyAmountChange,
} from "./handlers";
import {
  Max,
  Input,
  Spinner,
  ExchangeRate,
  CustomConnect,
  DirectionButton,
} from "~/components";

import type { Dispatch } from "react";
import type { Signer } from "@wagmi/core";
import type { SuccessFn } from "~/hooks";
import type { SwapTranslations } from "./index";
import type { IReducerState, ActionTypes } from "./reducer";
import type { PriceResponse } from "../../api/types";
import type { ZeroExApiErrorMessages } from "../../translations.server";

const selectStyles = `border rounded-md text-xl transition-[background] dark:transition-[background] duration-500 dark:duration-500 bg-slate-50 dark:text-slate-50 dark:bg-slate-900`;

export function PriceReview({
  state,
  dispatch,
  address,
  translations,
}: {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  translations: SwapTranslations;
  address: `0x${string}` | undefined;
}) {
  const { data: signer } = useSigner();
  const { isConnected } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();

  const onPriceSuccess = useCallback<SuccessFn>(
    (data) => {
      const dataOrError = validateResponseData(data);
      if ("msg" in dataOrError) {
        dispatch({ type: "error", payload: dataOrError });
      } else {
        dispatch({ type: "set price", payload: data as PriceResponse });
      }
    },
    [dispatch]
  );

  const fetchPrice = useFetchDebouncePrice(onPriceSuccess);

  useContractRead({
    address: address ? TOKENS[state.sellToken].address : undefined,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address || "0x", ZERO_EX_PROXY],
    onSuccess: (data) => {
      if (data["_hex"] === "0x00") {
        dispatch({ type: "set approval required", payload: true });
      } else {
        dispatch({ type: "set approval required", payload: false });
      }
    },
  });

  let errorMessage = state.error
    ? translations[state.error.msg as ZeroExApiErrorMessages]
        .replace("[[token]]", state.sellToken.toUpperCase())
        .replace("[[code]]", state.error.code.toString())
    : "";

  // Temporary insufficient liquidity error message
  if (state.error?.validationErrors.length) {
    const [firstValidationError] = state.error?.validationErrors;
    const { reason, description } = firstValidationError;
    if (reason === "INSUFFICIENT_ASSET_LIQUIDITY") {
      errorMessage = `Insufficient liquidity to fulfill this order`;
    } else {
      errorMessage = description;
    }
  }

  return (
    <form>
      <div className="mt-4 flex items-start justify-center">
        <label htmlFor="sell-select" className="sr-only">
          {translations["Sell"]}
          <span role="presentation">:</span>
        </label>
        <img
          alt={state.sellToken}
          className="h-9 w-9 mr-2 rounded-md"
          src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${
            TOKENS[state.sellToken].address
          }/logo.png`}
        />
        <div className="h-14 sm:w-full sm:mr-2">
          <select
            name="sell"
            id="sell-select"
            value={state.sellToken}
            className={clsx(selectStyles, "mr-2", "w-50", "sm:w-full", "h-9")}
            onChange={(e) => {
              onSellTokenSelect(e, state, dispatch);
              if (e.target.value === state.buyToken) {
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  sell: state.buyToken,
                  buy: state.sellToken,
                });
              } else {
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  sell: e.target.value,
                });
              }
            }}
          >
            {/* <option value="">--Choose a token--</option> */}
            <option value="usdc">USDC</option>
            <option value="dai">DAI</option>
            <option value="matic">MATIC</option>
            <option value="weth">WETH</option>
            <option value="wbtc">WBTC</option>
          </select>
          {address ? (
            <Max
              state={state}
              dispatch={dispatch}
              address={address}
              fetchPrice={fetchPrice}
              translations={translations}
            />
          ) : null}
        </div>
        <label htmlFor="sell-amount" className="sr-only">
          {translations["Sell Amount"]}
        </label>
        <div className="w-full">
          {address ? (
            <Input
              id="sell-amount"
              value={state.sellAmount || ""}
              className={clsx(selectStyles, "h-9", "pl-2")}
              onChange={(e) =>
                onSellAmountChange({ e, state, dispatch, fetchPrice })
              }
            />
          ) : (
            <Input
              id="sell-amount"
              value={state.sellAmount || ""}
              className={clsx(selectStyles, "h-9", "pl-2")}
              onChange={(e) =>
                onSellAmountChange({ e, state, dispatch, fetchPrice })
              }
            />
          )}
        </div>
      </div>
      <div className="flex justify-center mt-4 mb-8">
        <DirectionButton
          type="button"
          aria-label={translations["switch trading direction"]}
          disabled={state.error?.hasOwnProperty("msg") || state.fetching}
          onClick={() => {
            dispatch({ type: "reverse trade direction" });
            if (state.buyAmount || state.sellAmount) {
              onDirectionChange(state, dispatch, signer as Signer);
            }
            setSearchParams({
              ...Object.fromEntries(searchParams),
              sell: state.buyToken,
              buy: state.sellToken,
            });
          }}
        />
      </div>

      <div className="mt-5 flex items-start justify-center">
        <label htmlFor="buy-select" className="sr-only">
          {translations["Buy"]}
          <span role="presentation">:</span>
        </label>
        <img
          alt={state.buyToken}
          className="h-9 w-9 mr-2 rounded-md"
          src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${
            TOKENS[state.buyToken].address
          }/logo.png`}
        />
        <select
          name="buy"
          id="buy-select"
          value={state.buyToken}
          className={clsx(selectStyles, "mr-2", "w-50", "sm:w-full", "h-9")}
          onChange={(e) => {
            onBuyTokenSelect(e, state, dispatch);
            if (e.target.value === state.sellToken) {
              setSearchParams({
                ...Object.fromEntries(searchParams),
                sell: state.buyToken,
                buy: state.sellToken,
              });
            } else {
              setSearchParams({
                ...Object.fromEntries(searchParams),
                buy: e.target.value,
              });
            }
          }}
        >
          {/* <option value="">--Choose a token--</option> */}
          <option value="usdc">USDC</option>
          <option value="dai">DAI</option>
          <option value="matic">MATIC</option>
          <option value="weth">WETH</option>
          <option value="wbtc">WBTC</option>
        </select>
        <label htmlFor="buy-amount" className="sr-only">
          {translations["Buy Amount"]}
        </label>
        <input
          type="text"
          id="buy-amount"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          inputMode="decimal"
          value={state.buyAmount || ""}
          pattern="^[0-9]*[.,]?[0-9]*$"
          className={clsx(selectStyles, "w-full", "h-9", "pl-2")}
          onChange={(e) => {
            onBuyAmountChange({
              e,
              state,
              dispatch,
              fetchPrice,
            });
          }}
        />
      </div>
      <div
        role="region"
        aria-live="assertive"
        className="my-3 h-5 text-center sm:my-4"
      >
        {state.error?.msg ? (
          <span className="text-red-600 dark:text-red-400">{errorMessage}</span>
        ) : state.fetching ? (
          <span className="flex items-center justify-center">
            <Spinner />
            <span className="mx-2 font-normal">
              {translations["Fetching best price"]}…
            </span>
          </span>
        ) : state.price ? (
          <ExchangeRate
            sellToken={state.sellToken}
            buyToken={state.buyToken}
            sellAmount={state.price?.sellAmount}
            buyAmount={state.price?.buyAmount}
          />
        ) : null}
      </div>
      {isConnected && state.account ? (
        <Submit state={state} dispatch={dispatch} translations={translations} />
      ) : (
        <CustomConnect label={translations["Connect Wallet"]} />
      )}
    </form>
  );
}

function Submit({
  state,
  dispatch,
  translations,
}: {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  translations: SwapTranslations;
}) {
  const { data: balance } = useContractRead({
    address: TOKENS[state.sellToken].address,
    functionName: "balanceOf",
    args: [state.account!],
    abi: erc20ABI,
  });

  const zeroBalance = balance ? balance["_hex"] === "0x00" : undefined;

  const { config } = usePrepareContractWrite({
    address: TOKENS[state.sellToken].address,
    abi: erc20ABI,
    functionName: "approve",
    args: [ZERO_EX_PROXY, MaxInt256],
  });

  const { write, isLoading: isApproving } = useContractWrite({
    ...config,
    onSuccess() {
      dispatch({ type: "set approval required", payload: false });
    },
  });

  if (state.approvalRequired) {
    return (
      <button
        type="button"
        onClick={() => write && write()}
        className={clsx(
          primaryButton.element,
          !(state.fetching || state.quote === undefined)
            ? primaryButton.pseudo
            : "",
          "py-1 px-2 w-full"
        )}
      >
        {isApproving
          ? `${translations["Approving"]}…`
          : translations["Approve"]}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={state.fetching || state.price === undefined || zeroBalance}
      onClick={() => onFetchQuote({ state, dispatch })}
      className={clsx(
        primaryButton.element,
        !(state.fetching || state.quote === undefined)
          ? primaryButton.pseudo
          : "",
        "py-1 px-2 w-full h-8"
      )}
    >
      {translations["Review Order"]}
    </button>
  );
}
