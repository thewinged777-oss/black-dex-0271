import { useMemo, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  LockKeyhole,
  ShieldCheck,
  Zap,
} from "lucide-react";
import "./presale.css";

const PRESALE_PRICE = 0.01;

const allocations = [
  { name: "Ecosystem & development", pct: 25, tokens: "250M", color: "#d4af37" },
  { name: "Community & trading rewards", pct: 15, tokens: "150M", color: "#a98a43" },
  { name: "Liquidity & LP reserves", pct: 12, tokens: "120M", color: "#8b929d" },
  { name: "Public presale", pct: 8, tokens: "80M", color: "#6c9d88" },
  { name: "Team & founders", pct: 15, tokens: "150M", color: "#8e7ab4" },
  { name: "Treasury", pct: 15, tokens: "150M", color: "#6687b2" },
  { name: "Strategic partnerships", pct: 5, tokens: "50M", color: "#b77b62" },
  { name: "Market making", pct: 5, tokens: "50M", color: "#6f9697" },
];

const vesting = [
  ["Public presale", "10% at TGE", "90% linearly over 9 months"],
  ["Ecosystem & development", "No TGE unlock", "Linear release over 48 months"],
  ["Community & trading rewards", "No TGE unlock", "Linear release over 36 months"],
  ["Liquidity & LP reserves", "20M tokens for initial pool", "100M reserve staged over 24–36 months"],
  ["Team & founders", "12-month cliff", "36 months linear after cliff"],
  ["Treasury", "12-month initial lock", "Multisig-controlled, disclosed releases"],
  ["Strategic partnerships", "6-month cliff", "18 months linear after cliff"],
  ["Market making", "No automatic TGE unlock", "Contractual, staged inventory"],
];

const proceeds = [
  { label: "Product & technology", pct: 30, amount: "$240,000" },
  { label: "Liquidity provisioning", pct: 25, amount: "$200,000" },
  { label: "Marketing & user acquisition", pct: 20, amount: "$160,000" },
  { label: "Partnerships & expansion", pct: 15, amount: "$120,000" },
  { label: "Legal, security & operations", pct: 10, amount: "$80,000" },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const number = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="black-presale-kicker"><span />{children}</div>;
}

export default function PresalePage() {
  const [contribution, setContribution] = useState("1000");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const estimated = useMemo(() => {
    const parsed = Number(contribution);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.min(parsed, 10_000) / PRESALE_PRICE;
  }, [contribution]);

  const faq = [
    {
      q: "Is the presale open?",
      a: "No. This page is an advance information page. The presale is not accepting contributions, and there is no live purchase contract or payment address. Follow Black DEX for an official opening announcement.",
    },
    {
      q: "Which network will $BLACK use?",
      a: "The proposed launch network is Ethereum mainnet, using a fixed-supply ERC-20 token. The final contract address will be published only after deployment and independent verification.",
    },
    {
      q: "How does presale vesting work?",
      a: "The proposed schedule is 10% at token generation and the remaining 90% released linearly over nine months. Final terms will be set out in the sale documentation and enforced by the published vesting contract.",
    },
    {
      q: "Does the presale price guarantee the market price?",
      a: "No. The $0.01 figure is the proposed presale price and implies a $10 million fully diluted valuation. It does not guarantee a listing price, liquidity, returns or future market value.",
    },
    {
      q: "What will $BLACK be used for?",
      a: "The planned utility roadmap includes ecosystem incentives, trading-related benefits, community programmes and selected governance participation. Features will only be described as active once implemented and documented.",
    },
  ];

  return (
    <main className="black-presale">
      <Helmet>
        <title>$BLACK Presale | Black DEX</title>
        <meta name="description" content="Explore the proposed $BLACK public presale, token allocation, vesting and ecosystem roadmap from Black DEX." />
        <meta property="og:title" content="$BLACK Presale | Black DEX" />
        <meta property="og:description" content="The proposed ecosystem token of Black DEX. Review the public sale model, tokenomics and vesting." />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <header className="black-presale-header">
        <a className="black-presale-brand" href="/" aria-label="Black DEX home">
          <span className="black-presale-mark">B</span>
          <span>BLACK <i>DEX</i></span>
        </a>
        <nav aria-label="Presale navigation">
          <a href="#tokenomics">Tokenomics</a>
          <a href="#vesting">Vesting</a>
          <a href="#roadmap">Utility</a>
        </nav>
        <a className="black-presale-trade" href="/">Open exchange <ArrowUpRight size={15} /></a>
      </header>

      <section className="black-presale-hero">
        <div className="black-presale-orbit black-presale-orbit-one" />
        <div className="black-presale-orbit black-presale-orbit-two" />
        <div className="black-presale-hero-copy">
          <div className="black-presale-status"><span /> PRESALE PREPARATION · NOT OPEN</div>
          <SectionLabel>THE BLACK DEX ECOSYSTEM TOKEN</SectionLabel>
          <h1>Trade the market.<br /><em>Build the ecosystem.</em></h1>
          <p className="black-presale-lead">
            $BLACK is the proposed ecosystem token for Black DEX — a non-custodial perpetual trading venue powered by Orderly Network.
          </p>
          <div className="black-presale-hero-actions">
            <a className="black-presale-button black-presale-button-gold" href="https://x.com/BlackDexOnline" target="_blank" rel="noreferrer">
              Follow launch updates <ArrowUpRight size={16} />
            </a>
            <a className="black-presale-button black-presale-button-quiet" href="https://t.me/blackdexonlineadmin" target="_blank" rel="noreferrer">
              Join Telegram <ExternalLink size={15} />
            </a>
          </div>
          <div className="black-presale-hero-note"><LockKeyhole size={14} /> No contributions are being accepted on this page.</div>
        </div>
        <div className="black-presale-hero-panel">
          <div className="black-presale-token-emblem">
            <div className="black-presale-emblem-ring"><span>B</span></div>
            <div className="black-presale-emblem-caption">BLACK DEX · ERC-20</div>
          </div>
          <div className="black-presale-panel-bottom">
            <div><span>PROPOSED PRESALE PRICE</span><strong>$0.01 <small>/ BLACK</small></strong></div>
            <div className="black-presale-panel-tag">ETHEREUM MAINNET</div>
          </div>
        </div>
      </section>

      <section className="black-presale-stats" aria-label="Presale parameters">
        <div><span>MAXIMUM SUPPLY</span><strong>1,000,000,000</strong><small>$BLACK · fixed supply proposed</small></div>
        <div><span>PUBLIC PRESALE</span><strong>80,000,000</strong><small>8% of total supply</small></div>
        <div><span>FUNDRAISING TARGET</span><strong>$800,000</strong><small>Proposed hard cap</small></div>
        <div><span>IMPLIED FDV</span><strong>$10,000,000</strong><small>At proposed $0.01 price</small></div>
      </section>

      <section className="black-presale-section black-presale-sale" id="sale">
        <div className="black-presale-section-head">
          <div>
            <SectionLabel>PUBLIC PRESALE</SectionLabel>
            <h2>Clear terms.<br /><em>No hidden mechanics.</em></h2>
          </div>
          <div className="black-presale-not-open"><span /> NOT YET OPEN</div>
        </div>
        <div className="black-presale-sale-grid">
          <div className="black-presale-sale-card">
            <div className="black-presale-card-top"><span>PROPOSED SALE TERMS</span><ShieldCheck size={18} /></div>
            <div className="black-presale-sale-row"><span>Network</span><b>Ethereum mainnet</b></div>
            <div className="black-presale-sale-row"><span>Payment asset</span><b>USDC</b></div>
            <div className="black-presale-sale-row"><span>Token price</span><b>$0.01</b></div>
            <div className="black-presale-sale-row"><span>Soft cap</span><b>$400,000</b></div>
            <div className="black-presale-sale-row"><span>Hard cap</span><b>$800,000</b></div>
            <div className="black-presale-sale-row"><span>Minimum contribution</span><b>$100</b></div>
            <div className="black-presale-sale-row"><span>Maximum contribution</span><b>$10,000</b></div>
            <div className="black-presale-sale-row"><span>Presale vesting</span><b>10% TGE + 9 months</b></div>
            <p className="black-presale-fine">All sale terms are proposed and subject to final legal documentation, eligibility rules and smart-contract implementation.</p>
          </div>
          <div className="black-presale-calc-card">
            <div className="black-presale-card-top"><span>ALLOCATION ESTIMATOR</span><Zap size={18} /></div>
            <h3>Estimate your token allocation</h3>
            <p>Illustrative calculation using the proposed $0.01 presale price. This is not a reservation or offer to sell.</p>
            <label htmlFor="black-presale-contribution">Contribution amount (USD)</label>
            <div className="black-presale-input-wrap"><span>$</span><input id="black-presale-contribution" type="number" min="100" max="10000" step="50" value={contribution} onChange={(event) => setContribution(event.target.value)} /></div>
            <div className="black-presale-estimate"><span>Estimated tokens</span><strong>{number(estimated)}</strong></div>
            <div className="black-presale-estimate-detail"><span>At TGE (10%)</span><b>{number(estimated * 0.1)}</b></div>
            <div className="black-presale-estimate-detail"><span>Vested over 9 months (90%)</span><b>{number(estimated * 0.9)}</b></div>
            <div className="black-presale-calc-warning"><CircleHelp size={15} /> Final allocations depend on confirmed sale terms and eligibility.</div>
            <a className="black-presale-button black-presale-button-disabled" href="https://x.com/BlackDexOnline" target="_blank" rel="noreferrer" aria-label="Follow Black DEX for the presale opening announcement">
              Presale not open — follow updates <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <section className="black-presale-section" id="tokenomics">
        <div className="black-presale-section-head">
          <div><SectionLabel>FIXED SUPPLY</SectionLabel><h2>Tokenomics built<br /><em>for long-term alignment.</em></h2></div>
          <div className="black-presale-total"><strong>1B</strong><span>TOTAL $BLACK</span></div>
        </div>
        <div className="black-presale-allocation-layout">
          <div className="black-presale-allocation-chart">
            <div className="black-presale-donut"><div><strong>1B</strong><span>FIXED SUPPLY</span></div></div>
            <div className="black-presale-chart-caption">Allocation of the proposed maximum supply</div>
          </div>
          <div className="black-presale-allocation-list">
            {allocations.map((item) => (
              <div className="black-presale-allocation-item" key={item.name}>
                <div className="black-presale-allocation-line"><span><i style={{ background: item.color }} />{item.name}</span><b>{item.pct}% <small>{item.tokens}</small></b></div>
                <div className="black-presale-bar"><span style={{ width: item.pct + "%", background: item.color }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="black-presale-callout"><ShieldCheck size={19} /><p><strong>Fixed supply proposal.</strong> No additional minting is planned after initial issuance. Allocation wallets, vesting contracts and treasury controls should be publicly verifiable before the sale opens.</p></div>
      </section>

      <section className="black-presale-section" id="vesting">
        <div className="black-presale-section-head">
          <div><SectionLabel>UNLOCK TRANSPARENCY</SectionLabel><h2>Vesting that puts<br /><em>long-term holders first.</em></h2></div>
        </div>
        <div className="black-presale-table-wrap">
          <table className="black-presale-table">
            <thead><tr><th>Allocation</th><th>Initial unlock / cliff</th><th>Subsequent release</th></tr></thead>
            <tbody>{vesting.map((row) => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="black-presale-circulation">
          <div><span>PROPOSED TGE MARKET-ACCESSIBLE SUPPLY</span><strong>28,000,000 <small>2.8%</small></strong><p>8M presale unlock + 20M initial liquidity tokens. Other allocations have no TGE unlock in this model.</p></div>
          <div className="black-presale-circulation-note"><LockKeyhole size={18} /><span>Vesting schedules should be enforced by independently verifiable smart contracts, not manual promises.</span></div>
        </div>
      </section>

      <section className="black-presale-section" id="liquidity">
        <div className="black-presale-section-head">
          <div><SectionLabel>INITIAL MARKET LIQUIDITY</SectionLabel><h2>Launch liquidity.<br /><em>Managed reserves.</em></h2></div>
        </div>
        <div className="black-presale-liquidity-grid">
          <div className="black-presale-liquidity-main">
            <div className="black-presale-liquidity-number"><span>INITIAL USDC SIDE</span><strong>$200,000</strong></div>
            <div className="black-presale-liquidity-plus">+</div>
            <div className="black-presale-liquidity-number"><span>INITIAL $BLACK SIDE</span><strong>20,000,000</strong></div>
            <div className="black-presale-pool-result"><span>Illustrative initial pool TVL</span><strong>$400,000</strong><small>At $0.01 per token, before fees or price movement</small></div>
          </div>
          <div className="black-presale-liquidity-side">
            <div className="black-presale-reserve-icon"><LockKeyhole size={22} /></div>
            <SectionLabel>LIQUIDITY RESERVE</SectionLabel>
            <strong>100,000,000 <small>$BLACK</small></strong>
            <p>The remaining liquidity allocation is reserved for staged liquidity support and integrations over 24–36 months. It is not initial circulating liquidity.</p>
          </div>
        </div>
      </section>

      <section className="black-presale-section" id="proceeds">
        <div className="black-presale-section-head">
          <div><SectionLabel>USE OF PROCEEDS</SectionLabel><h2>Capital for<br /><em>building the product.</em></h2></div>
          <div className="black-presale-total"><strong>$800K</strong><span>MAXIMUM RAISE</span></div>
        </div>
        <div className="black-presale-proceeds">
          {proceeds.map((item) => (
            <div className="black-presale-proceeds-row" key={item.label}>
              <div><span>{item.label}</span><strong>{item.amount}</strong></div>
              <div className="black-presale-bar"><span style={{ width: item.pct + "%" }} /></div>
              <small>{item.pct}% of gross proceeds</small>
            </div>
          ))}
        </div>
        <p className="black-presale-fine">Budget shown at the full $800,000 hard cap. Actual spending must scale with funds raised and be subject to documented treasury controls.</p>
      </section>

      <section className="black-presale-section" id="roadmap">
        <div className="black-presale-section-head"><div><SectionLabel>ECOSYSTEM UTILITY</SectionLabel><h2>More than a ticker.<br /><em>A product roadmap.</em></h2></div></div>
        <div className="black-presale-utility-grid">
          <article><span>01</span><h3>Trading benefits</h3><p>Potential fee benefits for eligible holders or users, subject to implementation and a sustainable fee model.</p></article>
          <article><span>02</span><h3>Community incentives</h3><p>Transparent rewards for trading competitions, referrals, contributors and ecosystem participation.</p></article>
          <article><span>03</span><h3>Governance participation</h3><p>Community input on selected ecosystem priorities, with scope and voting mechanics defined before activation.</p></article>
          <article><span>04</span><h3>Partner ecosystem</h3><p>Incentives for integrations, affiliates and strategic partners under published programme rules.</p></article>
        </div>
        <div className="black-presale-callout"><Zap size={19} /><p><strong>Roadmap, not a promise.</strong> These are proposed utility directions. No fee discount, staking programme, governance right or financial return should be treated as active until officially implemented and documented.</p></div>
      </section>

      <section className="black-presale-section black-presale-faq-section">
        <div className="black-presale-section-head"><div><SectionLabel>QUESTIONS</SectionLabel><h2>Before you<br /><em>make a decision.</em></h2></div></div>
        <div className="black-presale-faq">{faq.map((item, index) => (
          <div className="black-presale-faq-item" key={item.q}>
            <button type="button" onClick={() => setFaqOpen(faqOpen === index ? null : index)} aria-expanded={faqOpen === index}>
              <span>{item.q}</span><ChevronDown size={18} className={faqOpen === index ? "is-open" : ""} />
            </button>
            {faqOpen === index && <p>{item.a}</p>}
          </div>
        ))}</div>
      </section>

      <section className="black-presale-final">
        <SectionLabel>BLACK DEX · ETHEREUM</SectionLabel>
        <h2>The next chapter<br /><em>starts with the ecosystem.</em></h2>
        <p>Follow the official channels. Sale dates, final documentation and verified contract details will be announced there.</p>
        <div className="black-presale-hero-actions">
          <a className="black-presale-button black-presale-button-gold" href="https://x.com/BlackDexOnline" target="_blank" rel="noreferrer">Follow Black DEX <ArrowUpRight size={16} /></a>
          <a className="black-presale-button black-presale-button-quiet" href="https://t.me/blackdexonlineadmin" target="_blank" rel="noreferrer">Telegram <ExternalLink size={15} /></a>
        </div>
      </section>

      <footer className="black-presale-footer">
        <a className="black-presale-brand" href="/"><span className="black-presale-mark">B</span><span>BLACK <i>DEX</i></span></a>
        <span>© 2026 Black DEX. Trading involves risk.</span>
        <a href="/">Return to exchange <ArrowUpRight size={14} /></a>
      </footer>
      <div className="black-presale-disclaimer">
        IMPORTANT: This page describes a proposed token offering and is for general information only. The presale is not open and no funds should be sent. No offer, solicitation, investment advice or guarantee of value or returns is made. Final terms, eligibility, token classification, offering documentation and smart-contract audits must be completed before any public sale. Digital assets are volatile and you may lose the entire amount contributed.
      </div>
    </main>
  );
}
