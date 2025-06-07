const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let requests = [];

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "OK",
    region: process.env.REGION || "default",
  });
});

// Endpoint to log incoming request data
app.post("/log", (req, res) => {
  const { status, region, timestamp, latency, errorCode, clientRegion } = req.body;
  requests.push({ status, region, timestamp, latency, errorCode, clientRegion });
  res.json({ message: "Logged" });
});

// Get all logs
app.get("/logs", (req, res) => {
  res.json({ requests });
});

// Success rate by region
app.get("/metrics/success-rate", (req, res) => {
  const stats = {};
  requests.forEach((req) => {
    const region = req.region || "unknown";
    if (!stats[region]) {
      stats[region] = { success: 0, total: 0 };
    }
    stats[region].total++;
    if (req.status === "success") {
      stats[region].success++;
    }
  });

  const result = {};
  for (const region in stats) {
    const { success, total } = stats[region];
    result[region] = ((success / total) * 100).toFixed(2);
  }

  res.json(result);
});

// Average latency by region
app.get("/metrics/latency", (req, res) => {
  const latencyStats = {};
  requests.forEach((r) => {
    const region = r.region || "unknown";
    if (!latencyStats[region]) {
      latencyStats[region] = [];
    }
    if (r.latency) {
      latencyStats[region].push(Number(r.latency));
    }
  });

  const result = {};
  for (const region in latencyStats) {
    const values = latencyStats[region];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    result[region] = avg.toFixed(2);
  }

  res.json(result);
});

// Error distribution
app.get("/metrics/error-codes", (req, res) => {
  const errorStats = {};
  requests.forEach((r) => {
    const code = r.errorCode || "none";
    if (!errorStats[code]) {
      errorStats[code] = 0;
    }
    errorStats[code]++;
  });

  res.json(errorStats);
});

// Requests volume per client region
app.get("/metrics/client-region-distribution", (req, res) => {
  const clientStats = {};
  requests.forEach((r) => {
    const clientRegion = r.clientRegion || "unknown";
    if (!clientStats[clientRegion]) {
      clientStats[clientRegion] = 0;
    }
    clientStats[clientRegion]++;
  });

  res.json(clientStats);
});


app.get("/metrics/success-rate-by-hour", (req, res) => {
  const hourlyStats = {};
  requests.forEach(({ status, timestamp }) => {
    const hour = new Date(timestamp).toISOString().slice(0, 13); // e.g. "2025-06-06T14"
    if (!hourlyStats[hour]) hourlyStats[hour] = { success: 0, total: 0 };
    hourlyStats[hour].total++;
    if (status === "success") hourlyStats[hour].success++;
  });

  const result = {};
  for (const hour in hourlyStats) {
    const { success, total } = hourlyStats[hour];
    result[hour] = ((success / total) * 100).toFixed(2);
  }
  res.json(result);
});


// Delete all logs
app.delete("/logs", (req, res) => {
  requests = []; // clear the in-memory array
  res.json({ message: "All logs deleted successfully" });
});


// Start the server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
