import clsx from "clsx";
import { forwardRef } from "react";
import { erc20ABI, useContractRead } from "wagmi";

import type { InputHTMLAttributes } from "react";

interface InputWithAccountProps extends InputHTMLAttributes<HTMLInputElement> {
  address: `0x${string}`;
  contractAddress?: string;
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="text"
    autoCorrect="off"
    autoComplete="off"
    spellCheck="false"
    inputMode="decimal"
    pattern="^[0-9]*[.,]?[0-9]*$"
    className={clsx(
      className,
      "w-full",
      "disabled:bg-slate-200  dark:disabled:bg-slate-700  disabled:cursor-not-allowed"
    )}
    {...props}
  />
));

Input.displayName = "Input";

export const InputWithAccount = forwardRef<HTMLInputElement, InputWithAccountProps>(
  ({ contractAddress, address, ...props }, ref) => {
    const { data: balance } = useContractRead({
      address: contractAddress,
      functionName: "balanceOf",
      args: [address],
      abi: erc20ABI,
    });

    return (
      <Input
        ref={ref}
        disabled={balance?.toHexString() === "0x00"}
        {...props}
      />
    );
  }
);

InputWithAccount.displayName = "InputWithAccount";
