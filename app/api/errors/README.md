# Errors

## Just recording what errors are encountered.

### Insufficient liquidity

```json
// https://api.0x.org/swap/v1/price?sellToken=dai&buyToken=wbtc&buyAmount=10000000000000
// https://api.0x.org/swap/v1/price?sellToken=0x2279461b7e8fbf31c975f3e104083a447735129b&buyToken=matic&buyAmount=100000000000000000000
{
  "code": 100,
  "reason": "Validation Failed",
  "validationErrors": [
    {
      "field": "buyAmount",
      "code": 1004,
      "reason": "INSUFFICIENT_ASSET_LIQUIDITY",
      "description": "We are not able to fulfill an order for this token pair at the requested amount due to a lack of liquidity"
    }
  ],
  "msg": "Validation Failed"
}
```

### Gas Estimation Failed

Taker does not own sufficient amount of the sell token.

```json
// https://avalanche.api.0x.org/swap/v1/quote?sellToken=0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7&buyToken=0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e&sellAmount=784901535476498100&slippagePercentage=0.03&feeRecipient=0x43a2a720cd0911690c248075f4a29a5e7716f758&buyTokenPercentageFee=0.005&takerAddress=0x5b76f5b8fc9d700624f78208132f91ad4e61a1f0
{
  "code": 111,
  "reason": "Gas estimation failed"
}
```

### Bad Taker Address Format

```json
// https://api.0x.org/swap/v1/price?sellToken=weth&buyToken=dai&sellAmount=1000000000000000000&takerAddress=hello.eth
{
  "code": 100,
  "reason": "Validation Failed",
  "validationErrors": [
    {
      "field": "takerAddress",
      "code": 1001,
      "reason": "should match pattern \"^0x[0-9a-fA-F]{40}$\""
    }
  ]
}
```

### Bad Sell Amount Format

```json
// https://api.0x.org/swap/v1/price?sellToken=weth&buyToken=dai&sellAmount=ten&takerAddress=0x5b76f5B8fc9D700624F78208132f91AD4e61a1f0
{
  "code": 100,
  "reason": "Validation Failed",
  "validationErrors": [
    {
      "field": "sellAmount",
      "code": 1001,
      "reason": "should match pattern \"^\\d+$\""
    },
    {
      "field": "sellAmount",
      "code": 1001,
      "reason": "should be integer"
    },
    {
      "field": "sellAmount",
      "code": 1001,
      "reason": "should match some schema in anyOf"
    }
  ]
}
```

### Sender Not Authorized

Taker does not own sufficient amount of the sell token.

```json
// https://api.0x.org/swap/v1/quote?sellToken=0x6B175474E89094C44Da98b954EedeAC495271d0F&buyToken=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&sellAmount=25000000000000000000&takerAddress=0x2279461b7e8fbf31c975f3e104083a447735129b
{
  "code": 105,
  "reason": "SenderNotAuthorizedError",
  "values": {
    "sender": "0xdef1c0ded9bec7f1a1670819833240f027b25eff"
  }
}
```
