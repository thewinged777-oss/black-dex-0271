import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

export default function MarketsChrome() {
  const [tag, setTag] = useState<Tag>("ALL");
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const place = () => {
      const root = document.querySelector(".bd-markets-list");
      const tablist = root?.querySelector("[role='tablist']");
      if (!root || !tablist) return;
      let host = root.querySelector(".bd-markets-filters-slot") as HTMLElement | null;
      if (!host) {
        host = document.createElement("div");
        host.className = "bd-markets-filters-slot";
        tablist.parentElement?.insertBefore(host, tablist.nextSibling);
      }
      setSlot(host);
    };
    place();
    const id = window.setInterval(place, 400);
    const stop = window.setTimeout(() => window.clearInterval(id), 8000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, []);

  useEffect(() => {
    const apply = () => {
      const root = document.querySelector(".bd-markets-list");
      if (!root) return;
      root.querySelectorAll("tbody tr").forEach((row) => {
        const hide = !matches((row as HTMLElement).innerText || "", tag);
        (row as HTMLElement).style.display = hide ? "none" : "";
      });
    };
    apply();
    const root = document.querySelector(".bd-markets-list");
    const observer = root ? new MutationObserver(apply) : null;
    if (root && observer) observer.observe(root, { childList: true, subtree: true });
    return () => observer?.disconnect();
  }, [tag]);

  const bar = (
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

  return slot ? createPortal(bar, slot) : bar;
}
