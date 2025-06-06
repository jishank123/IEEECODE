const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let requests = [];

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK", region: process.env.REGION || "default" });
});

app.post("/log", (req, res) => {
  const { status, region, timestamp } = req.body;
  requests.push({ status, region, timestamp });
  res.json({ message: "Logged" });
});

app.get("/logs", (req, res) => {
  res.json({ requests });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
