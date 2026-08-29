import { embedChartUrl } from "@/utils/swap-token-intel";

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
          <iframe
            title="Pair chart"
            src={src}
            allow="clipboard-write"
          />
        ) : (
          <p className="bd-swap-chart-empty">Chart loads with the pair on the ticket.</p>
        )}
      </div>
    </section>
  );
}
