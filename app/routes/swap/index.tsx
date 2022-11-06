import clsx from "clsx";
import { json } from "@remix-run/node";
import { useReducer, useCallback } from "react";
import {
  useSigner,
  useAccount,
  WagmiConfig,
  useSendTransaction,
  usePrepareSendTransaction,
} from "wagmi";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  lightTheme,
  darkTheme,
  ConnectButton,
  RainbowKitProvider,
  useAddRecentTransaction,
} from "@rainbow-me/rainbowkit";
import { TOKENS, ZERO_EX_PROXY } from "~/constants";
import { useTheme } from "~/utils/theme-provider";
import { getInitialState, reducer } from "./reducer";
import { getSession } from "~/session.server";
import {
  getTranslations,
  zeroExApiErrorMessages,
} from "../../translations.server";
import {
  useSetupWagmi,
  useNetworkUrlSync,
  useFetchDebounceQuote,
} from "~/hooks";
import {
  onBuyTokenSelect,
  onDirectionChange,
  onSellTokenSelect,
  onSellAmountChange,
  onBuyAmountChange,
  placeOrder,
} from "./handlers";
import {
  Spinner,
  ExchangeRate,
  CustomConnect,
  LanguageSelect,
  DarkModeToggle,
  DirectionButton,
} from "~/components";
import { shorten, validateResponseData } from "./utils";
import type { FC } from "react";
import type { LoaderArgs, LinksFunction } from "@remix-run/node";
import type {
  Language,
  PickTranslations,
  ZeroExApiErrorMessages,
} from "../../translations.server";
import type { SuccessFn } from "~/hooks";
import type { Quote } from "~/hooks/useFetchDebounceQuote";

import spinnerUrl from "~/styles/spinner.css";

type SwapTranslations = PickTranslations<
  | "Buy"
  | "Sell"
  | "Buy Amount"
  | "Sell Amount"
  | "Place Order"
  | "Processing"
  | "Connect Wallet"
  | "Select a language"
  | "Fetching best price"
  | "sip a coffee and trade"
  | "switch trading direction"
  | "Switch between light and dark mode"
  | ZeroExApiErrorMessages
>;

interface SwapProps {
  lang: Language;
  translations: SwapTranslations;
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: spinnerUrl },
];

// Only abstract out for long, shared classes — doing so maybe D.R.Y, but removes the benefits of Tailwind + Intelisense.
const selectStyles = `border rounded-md text-xl transition-[background] dark:transition-[background] duration-500 dark:duration-500 bg-slate-50 dark:text-slate-50 dark:bg-slate-900`;
export const primaryButton = {
  element: `rounded-sm text-slate-50 transition-all duration-200 bg-blue-500 dark:bg-blue-500 disabled:text-slate-100 disabled:opacity-50`,
  pseudo: `hover:bg-blue-600 active:bg-blue-700 dark:hover:bg-blue-500/75 dark:active:bg-blue-500/50`,
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request);
  const lang = session.getLang();
  const translations = getTranslations(lang, [
    "Buy",
    "Sell",
    "Buy Amount",
    "Sell Amount",
    "Place Order",
    "Processing",
    "Connect Wallet",
    "Select a language",
    "Fetching best price",
    "sip a coffee and trade",
    "switch trading direction",
    "Switch between light and dark mode",
    ...zeroExApiErrorMessages,
  ]);

  const data = {
    lang,
    translations,
    ENV: {
      ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  return json(data, {
    headers: { "Cache-Control": "max-age=60, stale-while-revalidate=86400" },
  });
};

function Swap({ lang, translations }: SwapProps) {
  const { isConnected, address } = useAccount();
  const { data: signer } = useSigner();
  const addRecentTransaction = useAddRecentTransaction();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useReducer(
    reducer,
    getInitialState(searchParams, address)
  );

  useNetworkUrlSync(dispatch);

  const onQuoteSuccess = useCallback<SuccessFn>((data) => {
    const dataOrError = validateResponseData(data);
    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set quote", payload: data as Quote });
    }
  }, []);

  const fetchQuote = useFetchDebounceQuote(onQuoteSuccess);

  const gasLimit = state.quote?.gas
    ? Math.round(Number(state.quote.gas) * 1.2).toString()
    : undefined;

  const params = new URLSearchParams(window.location.search);
  const isHardhat = params.get("network") === "hardhat";

  const { config } = usePrepareSendTransaction({
    chainId: isHardhat ? 31337 : state.quote?.chainId,
    request: {
      to: state.quote?.to || ZERO_EX_PROXY,
      from: address,
      data: state.quote?.data,
      chainId: isHardhat ? 31337 : state.quote?.chainId,
      gasLimit,
      gasPrice: state.quote?.gasPrice,
    },
  });

  const { isLoading, sendTransaction } = useSendTransaction({
    ...config,
    onSettled: (_, error) => {
      if (error === null) {
        const btn = document.querySelector<HTMLButtonElement>(
          "body > div > header > div > button:nth-child(2)"
        );
        if (btn) {
          btn.click();
        }
        dispatch({ type: "set sell amount", payload: "" });
        dispatch({ type: "set buy amount", payload: "" });
      }
    },
    onSuccess: ({ hash }) => {
      addRecentTransaction({ hash, description: shorten(hash) });
    },
  });

  const errorMessage = state.error
    ? translations[state.error.msg as ZeroExApiErrorMessages]
        .replace("[[token]]", state.sellToken.toUpperCase())
        .replace("[[code]]", state.error.code.toString())
    : "";

  return (
    <>
      <header className="flex items-end justify-end flex-col p-3 sm:p-6">
        <ConnectButton label={translations["Connect Wallet"]} />
        <DarkModeToggle
          label={translations["Switch between light and dark mode"]}
        />
        <LanguageSelect lang={lang} label={translations["Select a language"]} />
      </header>
      <div className="p-3 mx-auto max-w-screen-sm ">
        <Link to="/">
          <span
            role="img"
            aria-label={translations["sip a coffee and trade"]}
            className="inline-block my-3 sm:text-5xl"
          >
            ☕
          </span>
        </Link>
        <hr />
        <form>
          <div className="mt-12 flex items-center">
            <label htmlFor="sell-select" className="sr-only">
              {translations["Sell"]}
              <span role="presentation">:</span>
            </label>
            <img
              alt={state.sellToken}
              className="h-7 w-7 mr-2 rounded-md"
              src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${
                TOKENS[state.sellToken].address
              }/logo.png`}
            />
            <select
              name="sell"
              id="sell-select"
              value={state.sellToken}
              className={clsx(selectStyles, "mr-2", "w-1/3", "sm:w-2/5")}
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
            </select>
            <label htmlFor="sell-amount" className="sr-only">
              {translations["Sell Amount"]}
            </label>
            <input
              type="text"
              id="sell-amount"
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              value={state.sellAmount || ""}
              className={clsx(selectStyles, "w-2/3", "sm:w-3/5")}
              onChange={(e) =>
                onSellAmountChange({ e, state, dispatch, fetchQuote })
              }
            />
          </div>
          <div className="mt-3 flex justify-center">
            <DirectionButton
              type="button"
              disabled={state.error?.hasOwnProperty("msg") || state.fetching}
              aria-label={translations["switch trading direction"]}
              onClick={() => {
                dispatch({ type: "reverse trade direction" });
                if (state.buyAmount || state.sellAmount) {
                  onDirectionChange(state, dispatch);
                }
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  sell: state.buyToken,
                  buy: state.sellToken,
                });
              }}
            />
          </div>

          <div className="mt-3 flex items-center">
            <label htmlFor="buy-select" className="sr-only">
              {translations["Buy"]}
              <span role="presentation">:</span>
            </label>
            <img
              alt={state.buyToken}
              className="h-7 w-7 mr-2 rounded-md"
              src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${
                TOKENS[state.buyToken].address
              }/logo.png`}
            />
            <select
              name="buy"
              id="buy-select"
              value={state.buyToken}
              className={clsx(selectStyles, "mr-2", "w-1/3", "sm:w-2/5")}
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
              className={clsx(selectStyles, "w-2/3", "sm:w-3/5")}
              onChange={(e) => {
                onBuyAmountChange({ e, state, dispatch, fetchQuote });
              }}
            />
          </div>
          <div
            role="region"
            aria-live="assertive"
            className="my-3 h-5 text-center sm:my-4"
          >
            {state.error?.msg ? (
              <span className="text-red-600 dark:text-red-400">
                {errorMessage}
              </span>
            ) : state.fetching ? (
              <span className="flex items-center justify-center">
                <Spinner />
                <span className="mx-2 font-normal">
                  {translations["Fetching best price"]}…
                </span>
              </span>
            ) : (
              <ExchangeRate
                quote={state.quote}
                sellToken={state.sellToken}
                buyToken={state.buyToken}
              />
            )}
          </div>
          {isConnected ? (
            <button
              type="button"
              disabled={state.fetching || state.quote === undefined}
              className={clsx(
                primaryButton.element,
                !(state.fetching || state.quote === undefined)
                  ? primaryButton.pseudo
                  : "",
                "py-1 px-2 w-full"
              )}
              onClick={() =>
                placeOrder({
                  signer,
                  sendTransaction,
                  sellTokenAddress: state.quote?.sellTokenAddress,
                })
              }
            >
              {isLoading
                ? translations["Processing"]
                : translations["Place Order"]}
            </button>
          ) : (
            <CustomConnect label={translations["Connect Wallet"]} />
          )}
        </form>
      </div>
    </>
  );
}

const WithRainbowKit: FC = () => {
  const [theme] = useTheme();
  const { lang, translations, ENV } = useLoaderData<typeof loader>();
  const { client, chains } = useSetupWagmi({
    appName: "remix-swap",
    alchemyId: ENV.ALCHEMY_API_KEY,
    enablePublicTestnets: ENV.NODE_ENV === "development",
  });

  return client && chains.length ? (
    <WagmiConfig client={client}>
      <RainbowKitProvider
        coolMode
        chains={chains}
        theme={
          theme === "light"
            ? lightTheme({ accentColor: "#3b83f6", borderRadius: "none" })
            : darkTheme({ accentColor: "#3b83f6", borderRadius: "none" })
        }
        showRecentTransactions
      >
        <Swap lang={lang} translations={translations} />
      </RainbowKitProvider>
    </WagmiConfig>
  ) : null;
};

export default WithRainbowKit;
