import { formatUnits } from "@ethersproject/units";
import { TOKENS } from "~/constants";
import type { FC } from "react";
import type { Quote } from "~/hooks/useFetchDebounceQuote";

interface ExchangeRateProps {
  quote?: Quote;
  sellToken: string;
  buyToken: string;
}

export const ExchangeRate: FC<ExchangeRateProps> = ({
  quote,
  sellToken,
  buyToken,
}) => {
  if (quote === undefined) return null;

  const buyAmount = parseFloat(
    formatUnits(quote.buyAmount, TOKENS[buyToken].decimal)
  );

  const sellAmount = parseFloat(
    formatUnits(quote.sellAmount, TOKENS[sellToken].decimal)
  );

  let buyTokenRate = sellAmount / buyAmount;

  buyTokenRate = parseFloat(buyTokenRate.toFixed(buyTokenRate < 1 ? 6 : 2));

  return (
    <div>
      {`1 ${buyToken.toUpperCase()} = ${buyTokenRate} ${sellToken.toUpperCase()}`}
    </div>
  );
};
