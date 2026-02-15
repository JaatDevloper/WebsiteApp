import express from "express";
import path from "path";
import cors from "cors";

const app = express();
const __dirname = path.resolve();

// ✅ Allow Telegram WebView + Koyeb
app.use(cors({ origin: "*" }));

// ✅ Telegram Content-Security Policy fix
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https://*.telegram.org https://telegram.org https://*.t.me https://*.koyeb.app; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.telegram.org https://telegram.org;"
  );
  next();
});

// ✅ Serve your built frontend
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`[server] running on port ${port}`));
