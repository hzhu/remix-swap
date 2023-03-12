import { useFetcher, useSearchParams } from "@remix-run/react";
import type { FC } from "react";

import type { Language } from "~/translations.server";

// TODO: support RTL
export const LanguageSelect: FC<{ lang: Language; label: string }> = ({
  lang,
  label,
}) => {
  const fetcher = useFetcher();
  const [_, setSearchParams] = useSearchParams();

  return (
    <>
      <label htmlFor="language-select" hidden>
        {label}
        <span role="presentation">:</span>
      </label>
      <select
        value={lang}
        id="language-select"
        className="mt-3 border text-sm transition-[background] dark:transition-[background] duration-500 dark:duration-500 bg-slate-50 dark:text-slate-50 dark:bg-slate-900"
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          const network = params.get("network");

          setSearchParams({
            ...Object.fromEntries(params),
            network: network ? network : "",
            lang: e.target.value,
          });

          fetcher.submit(
            { lang: e.target.value },
            { action: "set-lang", method: "post" }
          );
        }}
      >
        <option value="en">🇺🇸 English</option>
        <option value="es">🇪🇸 Español</option>
        <option value="fr">🇫🇷 Français</option>
        <option value="ko">🇰🇷 한국어</option>
      </select>
    </>
  );
};
