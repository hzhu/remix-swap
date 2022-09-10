import clsx from "clsx";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { primaryButton } from "~/routes/swap";

import type { FC } from "react";

export const CustomConnect: FC<{ label: string }> = ({ label }) => (
  <ConnectButton.Custom>
    {({ chain, account, mounted, openConnectModal }) => {
      return (
        <div
          {...(!mounted && {
            "aria-hidden": true,
            style: {
              opacity: 0,
              pointerEvents: "none",
              userSelect: "none",
            },
          })}
        >
          {(() => {
            if (!mounted || !account || !chain) {
              return (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className={clsx(
                    primaryButton.element,
                    primaryButton.pseudo,
                    "py-1 px-2 w-full"
                  )}
                >
                  {label}
                </button>
              );
            }
          })()}
        </div>
      );
    }}
  </ConnectButton.Custom>
);
