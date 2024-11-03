import express from "express";

export default function setupKeepAlive() {
  const app = express();
  const port = process.env.PORT || 10000;

  app.get("/", (req, res) => {
    res.send("Bot is running!");
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  app.listen(port, () => {
    console.log(`✅ Keep-alive server running on port ${port}`);
  });
}
