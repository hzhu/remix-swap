import { formatUnits } from "@ethersproject/units";
import { TOKENS } from "~/constants";
import type { FC } from "react";

interface ExchangeRateProps {
  sellAmount: string;
  buyAmount: string;
  sellToken: string;
  buyToken: string;
}

export const ExchangeRate: FC<ExchangeRateProps> = ({
  sellToken,
  buyToken,
  sellAmount,
  buyAmount,
}) => {
  const buyAmountInt = parseFloat(
    formatUnits(buyAmount, TOKENS[buyToken].decimal)
  );

  const sellAmountInt = parseFloat(
    formatUnits(sellAmount, TOKENS[sellToken].decimal)
  );

  let buyTokenRate = sellAmountInt / buyAmountInt;

  buyTokenRate = parseFloat(buyTokenRate.toFixed(buyTokenRate < 1 ? 6 : 2));

  return (
    <div>
      {`1 ${buyToken.toUpperCase()} = ${buyTokenRate} ${sellToken.toUpperCase()}`}
    </div>
  );
};
