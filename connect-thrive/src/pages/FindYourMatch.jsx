// src/pages/FindYourMatch.jsx
import { useState, useEffect } from "react";
import MatchCard from "../components/FindMatch/MatchCard";
import MatchModal from "../components/FindMatch/MatchModal";
import FindMatchButton from "../components/FindMatch/FindMatchButton";
import {
  FilterChips,
  TopMatchesSidebar,
  HowItWorks,
  LoadingOverlay,
} from "../components/FindMatch/OtherComponents";
import "../findmatch.css";

const API = "https://connecto-2.onrender.com/api/users";

function getToken() {
  return localStorage.getItem("token");
}

export default function FindYourMatch() {
  const [matches, setMatches] = useState([]);
  const [communities, setCommunities] = useState(["All"]);
  const [connected, setConnected] = useState({});
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // ── Fetch matches ──────────────────────────────────────────
  const handleFindMatch = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("You are not logged in. Please log in first.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${API}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch matches");
      const data = await res.json();
      const safeData = Array.isArray(data) ? data : [];
      setMatches(safeData);

      // Build filter chips from results
      const allComms = new Set();
      safeData.forEach((s) => {
        if (Array.isArray(s.communities)) {
          s.communities.forEach((c) => allComms.add(c));
        }
      });
      setCommunities(["All", ...Array.from(allComms).sort()]);
      setSearched(true);
    } catch (err) {
      setError("Could not load matches. Make sure your backend is running.");
    }
    setLoading(false);
  };

  // ── Send connection request ────────────────────────────────
  const handleConnect = async (id) => {
    try {
      await fetch(`${API}/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ receiverId: id }),
      });
      setConnected((prev) => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error("Connection request failed", err);
    }
  };

  const filteredMatches =
    activeFilter === "All"
      ? matches
      : matches.filter(
          (s) =>
            Array.isArray(s.communities) &&
            s.communities.includes(activeFilter),
        );

  return (
    <div className="fm-layout">
      {loading && <LoadingOverlay />}

      {selectedStudent && (
        <MatchModal
          student={selectedStudent}
          isConnected={!!connected[selectedStudent.id]}
          onConnect={() => handleConnect(selectedStudent.id)}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* ── Left Sidebar ── */}
      <aside className="fm-sidebar">
        <CommunitiesSidebar />
        <FindMatchButton onClick={handleFindMatch} />
      </aside>

      {/* ── Main ── */}
      <main className="fm-main">
        <div className="fm-match-header">
          <div>
            <h2>
              Your <span className="fm-teal">Perfect Matches</span> ✦
            </h2>
            <p>
              {searched
                ? `Found ${matches.length} students across your communities`
                : "Click Find Your Match to discover your people"}
            </p>
          </div>
          {searched && (
            <div className="fm-stats">
              <Stat num={matches.length} label="Students Found" />
              <Stat num={filteredMatches.length} label="Showing" />
              <Stat num={communities.length - 1} label="Communities" />
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "1rem",
              color: "#f87171",
              fontSize: "0.875rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <FilterChips
          options={communities}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {searched ? (
          filteredMatches.length > 0 ? (
            <div className="fm-grid">
              {filteredMatches.map((student, i) => (
                <MatchCard
                  key={student.id}
                  student={student}
                  index={i}
                  isConnected={!!connected[student.id]}
                  onConnect={() => handleConnect(student.id)}
                  onOpen={() => setSelectedStudent(student)}
                />
              ))}
            </div>
          ) : (
            <div className="fm-empty-state">
              <div className="fm-empty-icon">🔍</div>
              <h3>No matches for this community</h3>
              <p>Try selecting a different filter or join more communities</p>
            </div>
          )
        ) : (
          <div className="fm-empty-state">
            <div className="fm-empty-icon">✦</div>
            <h3>Find students who share your passion</h3>
            <p>
              Click "Find Your Match" to discover students across your
              communities
            </p>
          </div>
        )}
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="fm-right-sidebar">
        {searched && matches.length > 0 && (
          <TopMatchesSidebar matches={matches.slice(0, 4)} />
        )}
        <HowItWorks />
        <div className="fm-card fm-wellness-card">
          <div className="fm-wellness-icon">💙</div>
          <strong>You're not alone</strong>
          <p>
            Campus life can be overwhelming. Connecto helps you find your people
            — one connection at a time.
          </p>
        </div>
      </aside>
    </div>
  );
}

// ── Communities Sidebar ────────────────────────────────────────
function CommunitiesSidebar() {
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("https://connecto-2.onrender.com/api/users/communities", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCommunities(data);
        else setCommunities([]);
      })
      .catch(() => setCommunities([]));
  }, []);

  const ICON_MAP = {
    travel: "🌍",
    dsa: "💻",
    "mental-wellness": "🧘",
    startup: "🚀",
    gym: "💪",
  };

  return (
    <div className="fm-card">
      <h3>My Communities</h3>
      {communities.length === 0 ? (
        <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
          No communities joined yet
        </p>
      ) : (
        communities.map((c) => (
          <div key={c.id} className="fm-community-pill">
            <span>{ICON_MAP[c.slug] || "🏷"}</span>
            {c.name}
          </div>
        ))
      )}
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div className="fm-stat">
      <div className="fm-stat-num">{num}</div>
      <div className="fm-stat-label">{label}</div>
    </div>
  );
}
