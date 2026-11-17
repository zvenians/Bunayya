import { readFile, writeFile } from "node:fs/promises";

const channelId = "UCqfeLanwndmEig6sq3pJl9Q";
const output = new URL("../assets/youtube-latest.json", import.meta.url);
const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

const decode = (value = "") =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
const match = (source, expression) => decode(source.match(expression)?.[1]?.trim());

const response = await fetch(feedUrl, { headers: { "user-agent": "BUNAYYA-site-updater/1.0" } });
if (!response.ok) throw new Error(`YouTube feed returned HTTP ${response.status}`);
const xml = await response.text();
const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 3);
const videos = entries.map(([, entry]) => {
  const id = match(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
  return {
    id,
    title: match(entry, /<title>([\s\S]*?)<\/title>/),
    publishedAt: match(entry, /<published>([^<]+)<\/published>/),
    url: match(entry, /<link rel="alternate" href="([^"]+)"\s*\/>/),
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
});

if (videos.length !== 3 || videos.some((video) => !/^[\w-]{11}$/.test(video.id))) {
  throw new Error("YouTube feed did not contain three valid public videos");
}

let previous = null;
try {
  previous = JSON.parse(await readFile(output, "utf8"));
} catch {}

if (JSON.stringify(previous?.videos) === JSON.stringify(videos)) {
  console.log("YouTube data is already current.");
  process.exit(0);
}

const data = {
  channelId,
  channelTitle: "SEKOLAH ISLAM TERPADU BUNAYYA TANGERANG",
  updatedAt: new Date().toISOString(),
  videos,
};
await writeFile(output, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Updated ${videos.length} YouTube videos.`);
