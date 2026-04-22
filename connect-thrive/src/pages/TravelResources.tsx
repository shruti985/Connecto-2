// src/pages/TravelResources.jsx
import "@/styles/travelResources.css";
import { useState, useEffect } from "react";
import {
  fetchPlaces,
  CATEGORY_QUERIES,
  getStars,
  getPriceLabel,
  openInMaps,
} from "@/services/placesService";
import PlaceCard from "@/components/PlaceCard";
import PlaceSkeleton from "@/components/PlaceSkeleton";
import SuggestPlaceModal from "@/components/SuggestPlaceModal";

const CATEGORIES = ["cafes", "getaways", "food", "campus"];

export default function TravelResources() {
  const [activeTab, setActiveTab] = useState("cafes");
  const [placesCache, setPlacesCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggest, setShowSuggest] = useState(false);

  useEffect(() => {
    if (placesCache[activeTab]) return;
    loadPlaces(activeTab);
  }, [activeTab]);

  async function loadPlaces(category) {
    setLoading(true);
    setError(null);
    try {
      const places = await fetchPlaces(category);
      setPlacesCache((prev) => ({ ...prev, [category]: places }));
    } catch (err) {
      setError(err.message || "Failed to load places. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentPlaces = placesCache[activeTab] || [];
  const currentConfig = CATEGORY_QUERIES[activeTab];

  return (
    <div className="travel-resources">
      {/* Tab Bar */}
      <div className="tab-bar">
        {CATEGORIES.map((cat) => {
          const config = CATEGORY_QUERIES[cat];
          return (
            <button
              key={cat}
              className={`tab-btn ${activeTab === cat ? "active" : ""}`}
              onClick={() => setActiveTab(cat)}
            >
              <span className="tab-icon">{config.icon}</span>
              <span className="tab-label">{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">{currentConfig.label}</h2>
          <p className="section-desc">
            {currentConfig.description} · Kurukshetra
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-suggest" onClick={() => setShowSuggest(true)}>
            + Suggest a Place
          </button>
          <button
            className="btn-refresh"
            title="Refresh"
            onClick={() => {
              setPlacesCache((prev) => ({ ...prev, [activeTab]: undefined }));
              loadPlaces(activeTab);
            }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={() => loadPlaces(activeTab)}>Retry</button>
        </div>
      )}

      {/* Grid */}
      <div className="places-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <PlaceSkeleton key={i} />)
          : currentPlaces.length > 0
            ? currentPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  getStars={getStars}
                  getPriceLabel={getPriceLabel}
                  onOpenMaps={() => openInMaps(place)}
                />
              ))
            : !loading && (
                <div className="empty-state">
                  <div className="empty-icon">{currentConfig.icon}</div>
                  <p>No places found yet.</p>
                  <button onClick={() => setShowSuggest(true)}>
                    Be the first to suggest one →
                  </button>
                </div>
              )}
      </div>

      {showSuggest && (
        <SuggestPlaceModal
          category={currentConfig.label}
          onClose={() => setShowSuggest(false)}
        />
      )}
    </div>
  );
}
