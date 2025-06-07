require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");  

const metrics = require("./controllers/metrics");
const api = require("./controllers/api");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB before starting the server
connectDB()
  .then(() => {
    // Health check endpoint
    app.get("/check", (req, res) => {
      res.status(200).json({
        message: "OK",
        region: process.env.REGION || "default",
      });
    });

    // Use metrics routes
    app.use("/", metrics.router);

    // Use api routes for Q&A
    app.use("/api", api);

    app.listen(port, () => {
      console.log(`API server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
  });
