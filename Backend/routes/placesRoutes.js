
// routes/placesRoutes.js
// Google Places API proxy route — keeps API key secret on the server

const express = require("express");
const router = express.Router();

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_PLACES_API_KEY;

// GET /api/places?query=cafes+near+NIT+Kurukshetra&type=cafe
router.get("/", async (req, res) => {
  const { query, type } = req.query;

  if (!query) {
    return res.status(400).json({ error: "query param is required" });
  }

  if (!GOOGLE_API_KEY) {
    return res
      .status(500)
      .json({ error: "GOOGLE_PLACES_API_KEY not set in .env" });
  }

  try {
    const params = new URLSearchParams({
      query,
      key: GOOGLE_API_KEY,
      language: "en",
      region: "in",
    });

    if (type) params.append("type", type);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`,
    );
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Google Places API error:", error);
    res.status(500).json({ error: "Failed to fetch from Google Places" });
  }
});

module.exports = router;
