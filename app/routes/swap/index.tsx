import { json } from "@remix-run/node";
import { useReducer } from "react";
import { useAccount, useNetwork, WagmiConfig } from "wagmi";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import {
  lightTheme,
  darkTheme,
  ConnectButton,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "~/utils/theme-provider";
import { getInitialState, reducer } from "./reducer";
import { getSession } from "~/session.server";
import {
  getTranslations,
  zeroExApiErrorMessages,
} from "../../translations.server";
import { useSetupWagmi, useNetworkUrlSync } from "~/hooks";
import { LanguageSelect, DarkModeToggle } from "~/components";
import { PriceReview } from "./PriceReview";
import { QuoteReview } from "./QuoteReview";

import type { FC } from "react";
import type { LoaderArgs, LinksFunction } from "@remix-run/node";
import type {
  Language,
  PickTranslations,
  ZeroExApiErrorMessages,
} from "../../translations.server";

import { CHAIN_IDS } from "~/constants";

import spinnerUrl from "~/styles/spinner.css";

export type SwapTranslations = PickTranslations<
  | "Max"
  | "Buy"
  | "Sell"
  | "Buy Amount"
  | "Sell Amount"
  | "Place Order"
  | "Balance"
  | "Back"
  | "You pay"
  | "You receive"
  | "Submit Order"
  | "Review Order"
  | "Submitting"
  | "Approving"
  | "Approve"
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

export const primaryButton = {
  element:
    "rounded-sm text-slate-50 transition-all duration-200 bg-blue-500 dark:bg-blue-500 disabled:text-slate-100 disabled:opacity-50",
  pseudo:
    "hover:bg-blue-600 active:bg-blue-700 dark:hover:bg-blue-500/75 dark:active:bg-blue-500/50",
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request);
  const lang = session.getLang();
  const translations = getTranslations(lang, [
    "Max",
    "Buy",
    "Sell",
    "Back",
    "Balance",
    "You pay",
    "You receive",
    "Submit Order",
    "Submitting",
    "Approving",
    "Approve",
    "Buy Amount",
    "Sell Amount",
    "Place Order",
    "Review Order",
    "Processing",
    "Connect Wallet",
    "Select a language",
    "Fetching best price",
    "sip a coffee and trade",
    "switch trading direction",
    "Switch between light and dark mode",
    ...zeroExApiErrorMessages,
  ]);

  if (!process.env.ALCHEMY_API_KEY) {
    throw new Error("Alchemy API key is missing.");
  }

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
  const { chain } = useNetwork();
  const { address: takerAddress } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useReducer(
    reducer,
    getInitialState(searchParams, chain?.id)
  );

  useNetworkUrlSync({ dispatch, searchParams, setSearchParams });

  // Switching from CHAIN_IDS[state.network] to chain.id
  if (chain && CHAIN_IDS[state.network] !== chain.id) {
    return null;
  }

  return (
    <>
      <header className="flex items-end justify-end flex-col p-3 sm:p-6">
        <ConnectButton label={translations["Connect Wallet"]} />
        <DarkModeToggle
          label={translations["Switch between light and dark mode"]}
        />
        <LanguageSelect lang={lang} label={translations["Select a language"]} />
      </header>
      <div className="p-3 mx-auto max-w-screen-sm">
        <div className="flex justify-center">
          <span
            role="img"
            aria-label={translations["sip a coffee and trade"]}
            className="inline-block my-3 text-5xl select-none"
          >
            Remix Swap
          </span>
        </div>
        {state.finalize && state.quote ? (
          <QuoteReview
            state={state}
            dispatch={dispatch}
            translations={translations}
          />
        ) : (
          <PriceReview
            state={state}
            dispatch={dispatch}
            takerAddress={takerAddress}
            translations={translations}
          />
        )}
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
