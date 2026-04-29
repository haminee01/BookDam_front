export default async function handler(req: any, res: any) {
  const endpoint = req.query.endpoint;
  if (!endpoint || typeof endpoint !== "string") {
    res.status(400).json({ error: "Missing endpoint query parameter" });
    return;
  }

  const apiKey = process.env.ALADIN_API_KEY || process.env.VITE_ALADDIN_TTB_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing ALADIN_API_KEY on server" });
    return;
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "endpoint") continue;
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    } else if (value != null) {
      query.set(key, String(value));
    }
  }
  query.set("ttbkey", apiKey);
  query.set("output", "js");
  query.set("Version", "20131101");

  const url = `https://www.aladin.co.kr/ttb/api/${endpoint}?${query.toString()}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
    res.status(response.status).send(text);
  } catch {
    res.status(502).json({ error: "Failed to reach Aladin API" });
  }
}
