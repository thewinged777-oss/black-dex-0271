# BLACK DEX

Premium perpetual futures trading interface powered by Orderly Network.

BLACK DEX is a professional trading frontend built on top of Orderly's trading infrastructure. The frontend owns the Black DEX experience, design system and trader tools; Orderly remains the source of truth for markets, balances, positions, orders, execution, funding, deposits and withdrawals.

## Production

- Production: https://black-dex.online
- Repository: https://github.com/thewinged777-oss/black-dex-0271

Production deployment is intentionally simple:

`main` → CI validation → production SPA build → GitHub Pages → `black-dex.online`

There is no PR preview deployment and no upstream-template synchronization in the production workflow.

## Development

Requirements:

- Node.js 20+
- Yarn

Install dependencies:

```sh
yarn install --frozen-lockfile
```

Run locally:

```sh
yarn dev
```

Validate:

```sh
yarn typecheck
yarn lint
yarn build:spa
```

## Orderly integration

The project uses Orderly SDK 3.x packages for the trading infrastructure. Do not replace working Orderly providers, authentication, wallet integration, market streams, order execution, balances or positions with mock/local implementations.

Environment values are supplied through the deployment environment and local `.env.local` configuration. Never commit private keys or secrets. Browser-exposed `VITE_*` values must be treated as public.

## Product architecture

The frontend is organized around these product areas:

- Trading terminal
- Portfolio
- Markets
- Leaderboard / Black Season
- Rewards / Points
- Affiliate
- Earn / Vaults
- Pro Trader tools
- BLACK DEX AI
- Trader Help / Knowledge Center

The design system should remain centralized and consistent. Black/graphite is the base interface; gold is a restrained Black DEX accent; green/red remain dedicated to trading state and PnL.

## Deployment

Deployment is handled by GitHub Actions. Every push to `main` runs the production validation/build pipeline and deploys the resulting SPA to GitHub Pages. A manual `workflow_dispatch` deployment is also available.

Do not add branch-specific production deployments or preview deployments unless the deployment architecture is intentionally changed and documented.

## Orderly documentation

- https://orderly.network/docs/sdks
- https://storybook.orderly.network/
