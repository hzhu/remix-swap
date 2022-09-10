import {
  Meta,
  Links,
  Outlet,
  Scripts,
  LiveReload,
  useLoaderData,
  ScrollRestoration,
} from "@remix-run/react";
import clsx from "clsx";
import { json } from "@remix-run/node";
import {
  useTheme,
  ThemeProvider,
  NonFlashOfWrongThemeEls,
} from "~/utils/theme-provider";
import { getSession } from "~/session.server";
import type {
  MetaFunction,
  LinksFunction,
  LoaderArgs,
} from "@remix-run/node";
import type { Language } from "./translations.server";
import tailwindUrl from "./tailwind.css";
import rainbowStylesUrl from "@rainbow-me/rainbowkit/styles.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: rainbowStylesUrl },
  { rel: "stylesheet", href: tailwindUrl },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "remix-swap",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const session = await getSession(request);
  const lang = (url.searchParams.get("lang") as Language) || session.getLang();
  const data = { lang, theme: session.getTheme() };

  return json(data);
}

function App() {
  const [theme] = useTheme();
  const data = useLoaderData<typeof loader>();
  const { lang } = data; 

  return (
    <html lang={lang} className={clsx(theme)}>
      <head>
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(data.theme)} />
      </head>
      <body className="bg-slate-50 text-gray-800 dark:text-gray-100 dark:bg-gray-900 transition duration-500">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
  );
}
