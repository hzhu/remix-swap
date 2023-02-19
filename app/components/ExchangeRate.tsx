import { formatUnits } from "@ethersproject/units";
import type { FC } from "react";
import { getTokenListBySymbol } from "~/constants";

interface ExchangeRateProps {
  chainId: number;
  sellAmount: string;
  buyAmount: string;
  sellToken: string;
  buyToken: string;
}

export const ExchangeRate: FC<ExchangeRateProps> = ({
  chainId,
  sellToken,
  buyToken,
  sellAmount,
  buyAmount,
}) => {
  const tokensBySymbol = getTokenListBySymbol(chainId);

  const buyAmountInt = parseFloat(
    formatUnits(buyAmount, tokensBySymbol[buyToken].decimals)
  );

  const sellAmountInt = parseFloat(
    formatUnits(sellAmount, tokensBySymbol[sellToken].decimals)
  );

  let buyTokenRate = sellAmountInt / buyAmountInt;

  buyTokenRate = parseFloat(buyTokenRate.toFixed(buyTokenRate < 1 ? 6 : 2));

  return (
    <div>
      {`1 ${buyToken.toUpperCase()} = ${buyTokenRate} ${sellToken.toUpperCase()}`}
    </div>
  );
};
