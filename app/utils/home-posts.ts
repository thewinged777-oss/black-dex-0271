export type HomePost = {
  id: string;
  text: string;
  url: string;
  time: string;
};

function parseTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export async function loadBlackDexPosts(): Promise<HomePost[]> {
  try {
    const res = await fetch("https://r.jina.ai/http://x.com/BlackDexOnline");
    if (!res.ok) throw new Error("feed");
    const body = await res.text();
    const chunks = body
      .split(/\n{2,}/)
      .map((chunk) => chunk.replace(/\s+/g, " ").trim())
      .filter((chunk) => chunk.length > 40 && !/^title:/i.test(chunk) && !/^url source/i.test(chunk));
    return chunks.slice(0, 4).map((text, index) => ({
      id: `post-${index}`,
      text: text.slice(0, 220),
      url: "https://x.com/BlackDexOnline",
      time: "",
    }));
  } catch {
    return [
      {
        id: "x",
        text: "Follow @BlackDexOnline for desk notes, listings and raids.",
        url: "https://x.com/BlackDexOnline",
        time: parseTime(new Date().toISOString()),
      },
    ];
  }
}
