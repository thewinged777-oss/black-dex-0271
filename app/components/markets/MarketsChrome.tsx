import { useEffect, useState } from "react";
import { profileFor } from "@/utils/funding-desk";

const TAGS = ["ALL", "L1", "MEME", "DEX"] as const;
type Tag = (typeof TAGS)[number];

function rowTicker(text: string) {
  const token = (text.split(/\s+/)[0] || "").replace(/USDC|USDT/gi, "");
  return token.replace(/[^A-Za-z0-9]/g, "");
}

function matches(text: string, tag: Tag) {
  if (tag === "ALL") return true;
  const ticker = rowTicker(text);
  const sleeve = profileFor(ticker).sleeve.toLowerCase();
  if (tag === "L1") return /l1|l2/.test(sleeve);
  if (tag === "MEME") return /meme/.test(sleeve);
  return /defi|dex|venue/.test(sleeve) || ["UNI", "CAKE", "RAY", "JUP", "CRV", "PENDLE", "JOE"].includes(ticker);
}

function isCryptoTab() {
  const root = document.querySelector(".bd-markets-list");
  if (!root) return false;
  const active = Array.from(
    root.querySelectorAll("[role='tab'][aria-selected='true'], [role='tab'][data-state='active'], [role='tablist'] button[aria-selected='true']"),
  ) as HTMLElement[];
  return active.some((node) => {
    const label = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    return label === "crypto" || label.includes("crypto");
  });
}

export default function MarketsChrome() {
  const [tag, setTag] = useState<Tag>("ALL");
  const [crypto, setCrypto] = useState(false);

  useEffect(() => {
    const sync = () => {
      const onCrypto = isCryptoTab();
      setCrypto(onCrypto);
      if (!onCrypto && tag !== "ALL") setTag("ALL");
    };
    sync();
    const root = document.querySelector(".bd-markets-list");
    const observer = root ? new MutationObserver(sync) : null;
    if (root && observer) observer.observe(root, { childList: true, subtree: true, attributes: true });
    const id = window.setInterval(sync, 400);
    return () => {
      observer?.disconnect();
      window.clearInterval(id);
    };
  }, [tag]);

  useEffect(() => {
    const apply = () => {
      const root = document.querySelector(".bd-markets-list");
      if (!root) return;
      const liveTag = crypto ? tag : "ALL";
      root.querySelectorAll("tbody tr").forEach((row) => {
        const hide = !matches((row as HTMLElement).innerText || "", liveTag);
        (row as HTMLElement).style.display = hide ? "none" : "";
      });
    };
    apply();
    const root = document.querySelector(".bd-markets-list");
    const observer = root ? new MutationObserver(apply) : null;
    if (root && observer) observer.observe(root, { childList: true, subtree: true });
    return () => observer?.disconnect();
  }, [tag, crypto]);

  if (!crypto) return null;

  return (
    <div className="bd-markets-filters">
      {TAGS.map((item) => (
        <button
          key={item}
          type="button"
          className={tag === item ? "is-on" : ""}
          onClick={() => setTag(item)}
        >
          {item === "ALL" ? "All" : item}
        </button>
      ))}
    </div>
  );
}
