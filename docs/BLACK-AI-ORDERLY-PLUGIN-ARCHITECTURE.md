# BLACK DEX AI + Orderly Plugin Architecture

## Product role

BLACK DEX AI is the exchange-native trading assistant. It should feel like an information and decision-support layer inside the terminal, not a generic chatbot.

Its primary job is to help a trader understand what is already in front of them: market structure, order types, risk controls, positions, orders, funding, rewards and Black DEX workflows.

It must never replace Orderly as the source of truth or silently execute a trade.

## What BLACK DEX AI should offer

### 1. Terminal copilot

- Explain the current screen and active symbol.
- Explain Market, Limit, Stop, TP/SL, Reduce-Only and other supported order settings.
- Explain leverage, margin, liquidation and funding using live Orderly values when available.
- Answer "what am I looking at?" questions without forcing the trader to leave the terminal.

### 2. Live account copilot

When authenticated and authorized, provide read-only answers from Orderly data:

- equity and available balance
- open positions
- unrealized/realized PnL
- open orders
- recent executions
- funding paid/received
- liquidation and margin-risk state

The assistant must distinguish live values from estimates and show the timestamp/source where practical.

### 3. Market intelligence

With reliable data sources, surface:

- mark/index price relationship
- funding and funding history
- open-interest changes
- volume and volatility
- orderbook imbalance
- relevant market events

No fabricated sentiment, whale activity, liquidation heatmaps or predictions.

### 4. Risk copilot

Before an order is prepared, BLACK DEX AI can summarize:

- leverage
- margin impact
- liquidation distance
- TP/SL distance
- position concentration
- reduce-only implications

It should flag obvious risk conditions, but it must not present itself as a financial adviser or guarantee outcomes.

### 5. Order preparation

The AI may turn a natural-language request into a structured proposal, for example:

"Prepare a 25% BTC long with 5x leverage and a 2% stop."

The response should become a confirmation card containing:

- symbol
- side
- order type
- quantity
- leverage
- estimated price when applicable
- margin impact
- TP/SL
- warnings

The user must explicitly confirm through the normal Orderly-authenticated trading flow.

### 6. Trader knowledge center

The AI should be able to explain and link to:

- keyboard shortcuts
- Orderly trading documentation
- Black DEX trading guides
- risk/liquidation guide
- order-type guide
- rewards/Black Season rules
- affiliate documentation
- user-added strategy notes and helper links

The terminal's Help panel also allows traders to save custom links locally.

## Orderly plugin capabilities

Orderly SDK v3 introduced a plugin system. Plugins can register interceptors at target paths in the SDK rendering pipeline and enhance, wrap or replace existing components.

Orderly publishes `@orderly.network/fast-place-order-plugin`, a reference implementation for Quick Trade. It supports market buy/sell, quantity percentages, max-quantity confirmation and TradingView desktop-menu integration, and is registered through the `plugins` prop on `OrderlyAppProvider`.

The current PR does not install a new dependency. The repository uses a frozen Yarn lockfile and production is deployed as a static site. A dependency-controlled pass should add and validate the official plugin rather than bypassing the package manager.

## Current browser architecture

The assistant accepts:

```ts
{
  symbol: string;
  mode: "pro";
  page: string;
}
```

When `VITE_BLACK_AI_ENDPOINT` is configured, the browser sends the user message and context to a server-side adapter. The browser must never contain a model API secret.

## Recommended BLACK DEX AI backend

Use a server-side AI gateway with authenticated tool access. Recommended first-stage tools are read-only:

- `get_account_summary`
- `get_positions`
- `get_open_orders`
- `get_order_history`
- `get_market_metadata`
- `get_orderbook_snapshot`
- `get_mark_index_price`
- `get_funding`
- `get_risk_state`
- `get_rewards`
- `get_black_season`
- `get_trader_help`

Execution tools can be introduced only after the read-only layer is reliable:

- `prepare_market_order`
- `prepare_limit_order`
- `prepare_tp_sl`
- `prepare_reduce_position`
- `prepare_close_position`

There must be no direct `execute_trade` capability exposed to the model. The UI owns confirmation and the existing Orderly-authenticated flow owns execution.

## Developer tooling

Orderly's MCP server and agent skills can be used by developers to access Orderly documentation, SDK patterns, API references, workflows, indexer information, contract addresses and component guides. They are developer tooling and should not be treated as a public browser trading endpoint.

## Security rules

1. Never put an AI provider secret in Vite client code.
2. Never let the AI invent balances, prices, positions, funding or liquidation values.
3. Orderly remains the source of truth for account and execution state.
4. Never allow an AI message alone to submit an order.
5. Require explicit confirmation for every execution proposal.
6. Keep wallet signatures and Orderly authentication in the existing frontend flow.
7. Log AI-generated proposals separately from actual Orderly executions.
8. Rate-limit and authorize the AI gateway server-side.
9. Clearly label estimates, external data and live Orderly data.
10. Fail closed if required trading/account data cannot be verified.
