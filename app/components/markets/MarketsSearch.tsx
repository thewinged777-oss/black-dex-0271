import { useEffect, useState } from "react";

function nativeInput() {
  return document.querySelector(
    ".bd-markets-list input[type='search'], .bd-markets-list input[type='text'], .bd-markets-list [role='searchbox']",
  ) as HTMLInputElement | null;
}

function hideNative() {
  const input = nativeInput();
  if (!input) return;
  const wrap = input.closest("div");
  wrap?.classList.add("bd-markets-native-search");
  input.classList.add("bd-markets-native-input");
}

export default function MarketsSearch() {
  const [value, setValue] = useState("");

  useEffect(() => {
    hideNative();
    const id = window.setInterval(hideNative, 500);
    return () => window.clearInterval(id);
  }, []);

  const onChange = (next: string) => {
    setValue(next);
    const input = nativeInput();
    if (!input) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <label className="bd-markets-search">
      <span className="bd-markets-search-icon" aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder="Search the market"
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </label>
  );
}
