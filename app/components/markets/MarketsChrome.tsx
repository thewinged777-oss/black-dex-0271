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

function lists(root: Element) {
  return Array.from(root.querySelectorAll("[role='tablist']")) as HTMLElement[];
}

function isCryptoTab(root: Element) {
  const active = Array.from(
    root.querySelectorAll("[role='tab'][aria-selected='true'], [role='tab'][data-state='active'], [role='tablist'] button[aria-selected='true']"),
  ) as HTMLElement[];
  return active.some((node) => {
    const label = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    return label === "crypto";
  });
}

function categoryList(root: Element) {
  return lists(root).find((list) => /all markets|crypto|tradfi/i.test(list.textContent || ""));
}

function tradfiList(root: Element) {
  return lists(root).find((list) => /\bFX\b|\bHK\b/.test(list.textContent || ""));
}

export default function MarketsChrome() {
  const [tag, setTag] = useState<Tag>("ALL");
  const [crypto, setCrypto] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const sync = () => {
      const root = document.querySelector(".bd-markets-list");
      if (!root) return;
      const onCrypto = isCryptoTab(root);
      setCrypto(onCrypto);
      if (!onCrypto && tag !== "ALL") setTag("ALL");

      const sub = tradfiList(root);
      const cat = categoryList(root);
      let host = root.querySelector(".bd-markets-filters-slot") as HTMLElement | null;
      if (!host) {
        host = document.createElement("div");
        host.className = "bd-markets-filters-slot";
      }
      if (onCrypto) {
        if (sub) {
          sub.style.display = "none";
          sub.parentElement?.insertBefore(host, sub);
        } else if (cat) {
          cat.parentElement?.insertBefore(host, cat.nextSibling);
        } else {
          root.appendChild(host);
        }
        setSlot(host);
      } else {
        if (sub) sub.style.display = "";
        host.remove();
        setSlot(null);
      }
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

  if (!crypto || !slot) return null;

  return createPortal(
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
    </div>,
    slot,
  );
}
