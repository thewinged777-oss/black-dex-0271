function embedChartUrl(pairUrl: string | null): string | null {
  if (!pairUrl) return null;
  const clean = pairUrl.split("?")[0];
  if (!clean.includes("dexscreener.com")) return pairUrl;
  return `${clean}?embed=1&theme=dark&info=0&trades=0&chartLeftToolbar=0`;
}

export default function SwapChart({
  pairUrl,
  label,
}: {
  pairUrl: string | null;
  label: string;
}) {
  const src = embedChartUrl(pairUrl);

  return (
    <section className="bd-swap-chart" aria-label="Pair chart">
      <div className="bd-swap-intel-kicker">
        <span>Chart</span>
        <p>{label}</p>
      </div>
      <div className="bd-swap-chart-frame">
        {src ? (
          <iframe title="Pair chart" src={src} allow="clipboard-write" />
        ) : (
          <p className="bd-swap-chart-empty">No on-chain book for this pair yet.</p>
        )}
      </div>
    </section>
  );
}
