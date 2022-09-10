import type { FC } from "react";
import { useTheme, Theme } from "~/utils/theme-provider";

export const DarkModeToggle: FC<{ label: string }> = ({ label }) => {
  const [theme, setTheme] = useTheme();
  const toggleTheme = () => {
    setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };

  return (
    <div className="mt-3 flex items-center justify-end">
      <label
        htmlFor="dark-mode-toggle"
        className="inline-flex relative items-center cursor-pointer"
      >
        <div className="mx-2 text-2xl">
          {theme === "light" ? (
            <span role="presentation">☀️</span>
          ) : (
            <span role="presentation">🌙</span>
          )}
        </div>
        <span className="sr-only">{label}</span>
        <input
          type="checkbox"
          id="dark-mode-toggle"
          onChange={toggleTheme}
          onClick={toggleTheme}
          checked={theme === Theme.DARK}
        />
      </label>
    </div>
  );
};
