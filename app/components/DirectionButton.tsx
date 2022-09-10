import clsx from "clsx";
import { useState, forwardRef } from "react";
import { primaryButton } from "~/routes/swap";
import type { ButtonHTMLAttributes } from "react";

export const DirectionButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, className, ...props }, ref) => {
  const [rotated, setRotated] = useState(false);
  const arrowStyles = clsx(
    "transition-all duration-200",
    rotated ? "rotate-180" : ""
  );

  return (
    <button
      ref={ref}
      className={clsx(
        "w-8 h-6 text-xs flex items-center justify-center rounded",
        props.disabled ? "" : primaryButton.pseudo,
        primaryButton.element,
        className
      )}
      onClick={(e) => {
        onClick && onClick(e);
        setRotated(!rotated);
      }}
      {...props}
    >
      <span className={arrowStyles}>&#8595;</span>
      <span className={arrowStyles}>&#8593;</span>
    </button>
  );
});

DirectionButton.displayName = "DirectionButton";
