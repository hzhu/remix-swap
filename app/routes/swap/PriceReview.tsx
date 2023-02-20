import clsx from "clsx";
import { useCallback } from "react";
import { useSearchParams } from "@remix-run/react";
import { MaxInt256 } from "@ethersproject/constants";
import { parseUnits } from "@ethersproject/units";
import {
  erc20ABI,
  useSigner,
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { primaryButton } from "./index";
import { validateResponseData } from "~/api";
import { useFetchDebouncePrice } from "~/hooks";
import {
  ZERO_EX_PROXY,
  DEFAULT_CHAIN_ID,
  TOKEN_LISTS_BY_NETWORK,
  TOKEN_LISTS_MAP_BY_NETWORK,
} from "~/constants";
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
  const { chain } = useNetwork();

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

  const zeroExExchangeProxy = ZERO_EX_PROXY[chain?.id.toString() || 1];
  const tokensBySymbol = TOKEN_LISTS_MAP_BY_NETWORK[chain?.id || 1];

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

  const chainId = chain?.id || DEFAULT_CHAIN_ID;
  const tokens = TOKEN_LISTS_BY_NETWORK[chainId];

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
          src={tokensBySymbol[state.sellToken].logoURI}
        />
        <div className="h-14 sm:w-full sm:mr-2">
          <select
            name="sell"
            id="sell-select"
            value={state.sellToken}
            className={clsx(selectStyles, "mr-2", "w-50", "sm:w-full", "h-9")}
            onChange={(e) => {
              onSellTokenSelect(e, state, dispatch, chainId);
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
            {tokens.map((token) => {
              return (
                <option key={token.address} value={token.symbol.toLowerCase()}>
                  {token.symbol}
                </option>
              );
            })}
          </select>
          {address ? (
            <Max
              state={state}
              dispatch={dispatch}
              address={address}
              chainId={chainId}
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
                onSellAmountChange({ e, state, dispatch, fetchPrice, chainId })
              }
            />
          ) : (
            <Input
              id="sell-amount"
              value={state.sellAmount || ""}
              className={clsx(selectStyles, "h-9", "pl-2")}
              onChange={(e) =>
                onSellAmountChange({ e, state, dispatch, fetchPrice, chainId })
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
              onDirectionChange(state, dispatch, chainId, signer as Signer);
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
          src={tokensBySymbol[state.buyToken].logoURI}
        />
        <select
          name="buy"
          id="buy-select"
          value={state.buyToken}
          className={clsx(selectStyles, "mr-2", "w-50", "sm:w-full", "h-9")}
          onChange={(e) => {
            onBuyTokenSelect(e, state, dispatch, chainId);
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
          {tokens.map((token) => {
            return (
              <option key={token.address} value={token.symbol.toLowerCase()}>
                {token.symbol}
              </option>
            );
          })}
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
              chainId,
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
            chainId={chainId}
            sellToken={state.sellToken}
            buyToken={state.buyToken}
            sellAmount={state.price?.sellAmount}
            buyAmount={state.price?.buyAmount}
          />
        ) : null}
      </div>
      {isConnected && state.account && address ? (
        <Submit
          state={state}
          chainId={chainId}
          dispatch={dispatch}
          takerAddress={address}
          translations={translations}
          zeroExExchangeProxy={zeroExExchangeProxy}
        />
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
  takerAddress,
  zeroExExchangeProxy,
  chainId,
}: {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  translations: SwapTranslations;
  takerAddress: `0x${string}`;
  zeroExExchangeProxy: `0x${string}`;
  chainId: number;
}) {
  let approvalRequired;
  const tokensBySymbol = TOKEN_LISTS_MAP_BY_NETWORK[chainId];
  const { address: sellTokenAddress, decimals } =
    tokensBySymbol[state.sellToken];

  const { data: balance } = useContractRead({
    address: sellTokenAddress,
    functionName: "balanceOf",
    args: [state.account!],
    abi: erc20ABI,
  });

  const { data: allowance, refetch } = useContractRead({
    abi: erc20ABI,
    address: sellTokenAddress,
    functionName: "allowance",
    args: [takerAddress, zeroExExchangeProxy],
  });

  if (state.sellAmount) {
    const sellAmount = parseUnits(state.sellAmount, decimals);
    approvalRequired = !allowance?.gte(sellAmount);
    allowance?.gte(sellAmount);
  }

  const zeroBalance = balance ? balance["_hex"] === "0x00" : undefined;

  const { config } = usePrepareContractWrite({
    address: sellTokenAddress,
    abi: erc20ABI,
    functionName: "approve",
    args: [zeroExExchangeProxy, balance || MaxInt256],
  });

  const { isLoading: isApproving, writeAsync: approveAsync } =
    useContractWrite(config);

  if (approvalRequired) {
    return (
      <button
        type="button"
        onClick={async () => {
          approveAsync && (await approveAsync());
          await refetch();
        }}
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
      onClick={() => onFetchQuote({ state, dispatch, chainId })}
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
