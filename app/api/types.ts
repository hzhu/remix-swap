// https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-price#request
export interface PriceRequest {
  sellToken: string;
  buyToken: string;
  sellAmount?: string;
  buyAmount?: string;
  takerAddress?: string;
  slippagePercentage?: string;
  gasPrice?: string;
  excludedSources?: string[];
  includedSources?: string[];
  skipValidation?: boolean;
  feeRecipient?: string;
  buyTokenPercentageFee?: string;
  affiliateAddress?: string;
  enableSlippageProtection?: boolean;
}

// https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-quote#request
export interface QuoteRequest extends PriceRequest {
  intentOnFilling?: boolean;
}

// https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-price#response
export interface PriceResponse {
  chainId: number;
  price: string;
  estimatedPriceImpact: string;
  value: string;
  gasPrice: string;
  gas: string;
  estimatedGas: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyTokenAddress: string;
  buyAmount: string;
  sellTokenAddress: string;
  sellAmount: string;
  sources: any[];
  allowanceTarget: string;
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
  expectedSlippage: string | null;
}

// https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-quote#response
export interface QuoteResponse {
  chainId: number;
  price: string;
  guaranteedPrice: string;
  estimatedPriceImpact: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  estimatedGas: string;
  gasPrice: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  buyAmount: string;
  sellAmount: string;
  sources: any[];
  orders: any[];
  allowanceTarget: string;
  decodedUniqueId: string;
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
  expectedSlippage: string | null;
}

// https://docs.0x.org/0x-api-swap/api-references#errors
export interface ZeroExServerError {
  code: number;
  reason: string;
  values?: { message: string };
  validationErrors: ValidationError[];
}

export interface ValidationError {
  field: string;
  code: number;
  reason: string;
  description: string;
}

export interface ZeroExClientError extends ZeroExServerError {
  msg?: string;
}
