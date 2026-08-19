# Black AI + Orderly Plugin Architecture

## What was verified against current Orderly documentation

Orderly SDK v3 introduced a plugin system in v3.0.0. Plugins register interceptors at target paths in the SDK rendering pipeline and can enhance, wrap, or replace existing components. The current repository is on the Orderly 3.1.x SDK line.

Orderly also publishes an official `@orderly.network/fast-place-order-plugin`. It is the reference implementation for a Quick Trade experience: it mounts a draggable quick-order widget, supports market buy/sell, quantity percentages, max-quantity confirmation, and registers a TradingView desktop-menu toggle. It is registered through the `plugins` prop on `OrderlyAppProvider`.

## Important implementation decision

This PR does **not** install a new npm plugin dependency or modify the Orderly provider contract. The repository uses a frozen Yarn lockfile and the production site is a static GitHub Pages deployment. Adding an unpinned plugin dependency without regenerating the lockfile would create a deployment risk.

Instead, the Pro Trader layer is implemented as a Black DEX presentation/control layer around the existing Orderly `TradingPage`. This keeps Orderly as the source of truth and leaves a clean path to install the official Fast Place Order plugin in a later dependency-controlled pass.

## Black AI

The browser UI is implemented in `app/components/blackPro/BlackAIAssistant.tsx`.

The assistant accepts a context object:

```ts
{
  symbol: string;
  mode: "pro";
  page: string;
}
```

When `VITE_BLACK_AI_ENDPOINT` is configured, the UI sends:

```json
{
  "message": "user question",
  "context": {
    "symbol": "BTC-PERP",
    "mode": "pro",
    "page": "/perp/BTC-PERP"
  }
}
```

The endpoint should return:

```json
{ "answer": "..." }
```

No model API key belongs in the browser. The production implementation should use a server-side AI gateway that authenticates the user and exposes only safe, explicitly allowed tools.

## Recommended Black AI tool architecture

### Read-only tools first

- current account summary
- open positions
- open orders
- order history
- current market metadata
- orderbook snapshot
- mark/index price
- funding information
- liquidation/risk information
- Black Score / rewards information
- Orderly workflow explanations

### Execution tools later

Execution must require explicit user confirmation in the UI. Recommended tool boundaries:

- `prepare_market_order`
- `prepare_limit_order`
- `prepare_tp_sl`
- `prepare_reduce_position`
- `prepare_close_position`

The assistant must never silently execute a trade. A prepared action should be rendered as a confirmation card showing symbol, side, quantity, order type, estimated price, margin impact, TP/SL and applicable warnings. The user then confirms through the normal Orderly-authenticated trading flow.

## Orderly AI developer tooling

Orderly currently provides an official MCP server and agent skills for developers. The hosted MCP server is intended to expose Orderly documentation, SDK patterns, API references, workflows, indexer information, contract addresses and component guides to coding agents. It is useful for developing Black AI's backend/tool layer, but it is not itself a browser trading endpoint and should not be called directly from the public trading UI.

The recommended developer setup is the Orderly MCP server plus the relevant Orderly skills for authentication, orders, positions/TP-SL, WebSocket streaming, wallet, and SDK React components.

## Security rules

1. Never put an OpenAI/Anthropic/other model secret in Vite client code.
2. Never allow the AI model to invent balances, prices, positions, funding or liquidation values.
3. Orderly remains the source of truth for account and execution state.
4. Never allow an AI message alone to submit an order.
5. Require explicit user confirmation for every execution action.
6. Keep wallet signatures and Orderly authentication in the existing frontend flow.
7. Log AI-generated execution proposals separately from actual Orderly executions.
8. Rate-limit the AI gateway and enforce account/session authorization server-side.

## Next plugin pass

Once dependency installation and lockfile regeneration are available, evaluate the official Fast Place Order plugin first. It directly covers the Quick Trade requirement and is maintained for the Orderly SDK. Register it through `OrderlyAppProvider.plugins` and import its stylesheet.

Then evaluate additional official/community modules for TradingView controls, analytics, rewards and other extensions before creating custom replacements. The Black DEX custom UI should only replace a module when the existing Orderly component cannot provide the desired experience.
