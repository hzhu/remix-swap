import { formatUnits } from "@ethersproject/units";
import { getTokenListBySymbol } from "~/constants";
import type { FC } from "react";

interface ExchangeRateProps {
  sellAmount: string;
  buyAmount: string;
  sellToken: string;
  buyToken: string;
  chainId: number;
}

export const ExchangeRate: FC<ExchangeRateProps> = ({
  sellToken,
  buyToken,
  sellAmount,
  buyAmount,
  chainId
}) => {
  const tokensBySymbol = getTokenListBySymbol(chainId)
  
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
