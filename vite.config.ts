import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const aladinApiKey = env.VITE_ALADDIN_TTB_KEY;

  return {
    plugins: [
      react(),
      {
        name: "aladin-proxy-middleware",
        configureServer(server) {
          server.middlewares.use("/api/aladin", async (req, res) => {
            if (!aladinApiKey) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Missing VITE_ALADDIN_TTB_KEY in local env" })
              );
              return;
            }

            const url = new URL(req.url ?? "", "http://localhost");
            const endpoint = url.searchParams.get("endpoint");
            if (!endpoint) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing endpoint query parameter" }));
              return;
            }

            const proxyParams = new URLSearchParams(url.searchParams);
            proxyParams.delete("endpoint");
            proxyParams.set("ttbkey", aladinApiKey);
            proxyParams.set("output", "js");
            proxyParams.set("Version", "20131101");

            const proxyUrl = `https://www.aladin.co.kr/ttb/api/${endpoint}?${proxyParams.toString()}`;

            try {
              const response = await fetch(proxyUrl);
              const data = await response.text();
              res.statusCode = response.status;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(data);
            } catch {
              res.statusCode = 502;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Failed to reach Aladin API" }));
            }
          });
        },
      },
    ],
  };
});
