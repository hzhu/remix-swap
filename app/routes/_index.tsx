import { Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/session.server";
import { getTranslations } from "../translations.server";
import { DarkModeToggle, LanguageSelect } from "~/components";

import type { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const lang = session.getLang();
  const translations = getTranslations(lang, [
    "Home page",
    "Start trading",
    "Select a language",
    "As more assets become tokenized",
    "Switch between light and dark mode",
  ]);
  const data = { lang, translations };

  return json(data);
}

export default function Index() {
  const { lang, translations } = useLoaderData<typeof loader>();

  return (
    <>
      <header className="flex items-end justify-end flex-col p-3 sm:p-6">
        <DarkModeToggle
          label={translations["Switch between light and dark mode"]}
        />
        <LanguageSelect lang={lang} label={translations["Select a language"]} />
      </header>
      <div className="p-3">
        <h1 className="text-4xl">{translations["Home page"]}</h1>
        <p className="my-3">
          {translations["As more assets become tokenized"]}.
        </p>
        <Link
          to="/swap"
          className="py-1 px-2 mt-3 text-slate-50 bg-blue-600 dark:bg-blue-500 active:bg-blue-600 disabled:text-slate-500 disabled:bg-blue-300"
        >
          {translations["Start trading"]}
        </Link>
      </div>
    </>
  );
}
