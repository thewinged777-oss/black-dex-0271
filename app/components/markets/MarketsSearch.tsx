import { useEffect, useState } from "react";

function nativeInput() {
  const root = document.querySelector(".bd-markets-list");
  if (!root) return null;
  return Array.from(root.querySelectorAll("input[type='search'], input[type='text'], [role='searchbox']")).find(
    (node) => !node.closest(".bd-markets-search"),
  ) as HTMLInputElement | undefined;
}

export default function MarketsSearch() {
  const [value, setValue] = useState("");

  useEffect(() => {
    const hide = () => {
      const input = nativeInput();
      if (input) input.classList.add("bd-markets-native-input");
    };
    hide();
    const id = window.setInterval(hide, 800);
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
