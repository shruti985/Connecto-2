import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  SlidersHorizontal,
  X,
  UserPlus,
  Check,
  Zap,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";

const API = "https://connecto-2.onrender.com/api/users";

const AVATAR_PALETTE = [
  { bg: "bg-travel/20", ring: "ring-travel/40", text: "text-travel" },
  { bg: "bg-startup/20", ring: "ring-startup/40", text: "text-startup" },
  { bg: "bg-wellness/20", ring: "ring-wellness/40", text: "text-wellness" },
  { bg: "bg-dsa/20", ring: "ring-dsa/40", text: "text-dsa" },
  { bg: "bg-gym/20", ring: "ring-gym/40", text: "text-gym" },
  { bg: "bg-primary/20", ring: "ring-primary/40", text: "text-primary" },
];

const COMMUNITY_FILTERS = [
  "All",
  "Startup",
  "Travel",
  "Wellness",
  "DSA",
  "Gym",
];
const SCORE_FILTERS = [
  { label: "All", min: 0 },
  { label: "70%+", min: 70 },
  { label: "80%+", min: 80 },
  { label: "90%+", min: 90 },
];

function scoreAccent(s) {
  if (s >= 85)
    return {
      text: "text-primary",
      barStyle:
        "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))",
      topStyle:
        "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))",
      badge: "bg-primary/20 text-primary border-primary/30",
    };
  if (s >= 70)
    return {
      text: "text-green-400",
      barStyle: "linear-gradient(90deg, #22c55e, #10b981)",
      topStyle: "linear-gradient(90deg, #22c55e, #10b981)",
      badge: "bg-green-500/15 text-green-400 border-green-500/30",
    };
  if (s >= 50)
    return {
      text: "text-yellow-400",
      barStyle: "linear-gradient(90deg, #eab308, #f97316)",
      topStyle: "linear-gradient(90deg, #eab308, #f97316)",
      badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    };
  return {
    text: "text-secondary",
    barStyle: "linear-gradient(90deg, hsl(var(--secondary)), #a855f7)",
    topStyle: "linear-gradient(90deg, hsl(var(--secondary)), #a855f7)",
    badge: "bg-secondary/15 text-secondary border-secondary/30",
  };
}

// ── Match card ─────────────────────────────────────────────────
function MatchCard({ match, index, onConnect, connected }) {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = match.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const accent = scoreAccent(match.score);

  const interestTags = [
    ...(match.fields || [])
      .slice(0, 1)
      .map((l) => ({ l, cls: "bg-primary/10 text-primary border-primary/25" })),
    ...(match.sports || []).slice(0, 1).map((l) => ({
      l,
      cls: "bg-orange-500/10 text-orange-400 border-orange-500/25",
    })),
    ...(match.hobbies || []).slice(0, 1).map((l) => ({
      l,
      cls: "bg-secondary/10 text-secondary border-secondary/25",
    })),
    ...(match.travel || []).slice(0, 1).map((l) => ({
      l,
      cls: "bg-green-500/10 text-green-400 border-green-500/25",
    })),
  ].slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card flex flex-col overflow-hidden group hover:border-primary/30 transition-colors duration-300"
    >
      {/* Thin top accent line */}
      <div
        className="h-0.5 w-full flex-shrink-0 opacity-70"
        style={{ background: accent.topStyle }}
      />

      <div className="p-6 flex flex-col flex-1">
        {/* ── ROW 1: Avatar + name + score badge ── */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className={`
            w-14 h-14 rounded-2xl flex items-center justify-center
            text-base font-black tracking-wide flex-shrink-0
            ring-2 ${palette.ring} ${palette.bg} ${palette.text}
          `}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-foreground text-base leading-snug truncate">
              {match.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {match.hometown || "NIT Kurukshetra"}
            </p>
          </div>
          <span
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border ${accent.badge}`}
          >
            {match.score}% match
          </span>
        </div>

        {/* ── ROW 2: Score bar ── */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Match Score
            </span>
            <span className={`text-xs font-bold ${accent.text}`}>
              {match.score}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: accent.barStyle }}
              initial={{ width: 0 }}
              animate={{ width: `${match.score}%` }}
              transition={{
                duration: 0.9,
                delay: index * 0.06 + 0.25,
                ease: "easeOut",
              }}
            />
          </div>
        </div>

        {/* ── ROW 3: Why match ── */}
        {match.why && (
          <div className="bg-muted/20 border border-border border-l-2 border-l-primary/50 rounded-xl px-4 py-3 mb-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {match.why}
            </p>
          </div>
        )}

        {/* ── ROW 4: Tags ── */}
        {((match.shared || []).length > 0 || interestTags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {(match.shared || []).map((s) => (
              <span
                key={s}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium ${accent.badge}`}
              >
                {s}
              </span>
            ))}
            {interestTags.map(({ l, cls }) => (
              <span
                key={l}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium ${cls}`}
              >
                {l}
              </span>
            ))}
          </div>
        )}

        {/* Spacer pushes button to bottom */}
        <div className="flex-1" />

        {/* ── ROW 5: Connect button ── */}
        <Button
          onClick={() => !connected && onConnect(match.id)}
          variant={connected ? "outline" : "default"}
          className={`w-full font-semibold ${
            connected
              ? "border-green-500/40 text-green-400 bg-green-500/10 hover:bg-green-500/10 cursor-default"
              : "btn-glow"
          }`}
        >
          {connected ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Connected
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" /> Connect
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card p-6 flex flex-col gap-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-muted/40 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted/40 rounded-lg w-3/4" />
          <div className="h-3 bg-muted/30 rounded-lg w-1/2" />
        </div>
        <div className="w-20 h-7 rounded-full bg-muted/30 flex-shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3 bg-muted/30 rounded w-24" />
          <div className="h-3 bg-muted/30 rounded w-8" />
        </div>
        <div className="h-2 bg-muted/30 rounded-full" />
      </div>
      <div className="h-14 bg-muted/20 rounded-xl" />
      <div className="flex gap-2">
        <div className="h-7 w-20 bg-muted/30 rounded-full" />
        <div className="h-7 w-16 bg-muted/30 rounded-full" />
      </div>
      <div className="h-10 bg-muted/30 rounded-lg mt-2" />
    </div>
  );
}

// ── Filter chip ─────────────────────────────────────────────────
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
        active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-muted/20 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ── Main page ───────────────────────────────────────────────────
export default function FindYourMatch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [community, setCommunity] = useState("All");
  const [minScore, setMinScore] = useState(0);
  const [sportFilter, setSportFilter] = useState("");
  const [hobbyFilter, setHobbyFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const params = {};
    if (community !== "All") params.community = community;
    if (sportFilter) params.sport = sportFilter;
    if (hobbyFilter) params.hobby = hobbyFilter;
    if (fieldFilter) params.field = fieldFilter;
    if (minScore > 0) params.minScore = String(minScore);

    setLoading(true);
    axios
      .get(`${API}/matches`, { headers, params })
      .then((r) => setMatches(r.data))
      .catch(() =>
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load matches",
        }),
      )
      .finally(() => setLoading(false));
  }, [community, minScore, sportFilter, hobbyFilter, fieldFilter]);

  const visible = useMemo(() => {
    if (!search.trim()) return matches;
    const q = search.toLowerCase();
    return matches.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.hometown || "").toLowerCase().includes(q) ||
        (m.communities || []).some((c) => c.toLowerCase().includes(q)) ||
        (m.fields || []).some((f) => f.toLowerCase().includes(q)) ||
        (m.hobbies || []).some((h) => h.toLowerCase().includes(q)) ||
        (m.sports || []).some((s) => s.toLowerCase().includes(q)),
    );
  }, [matches, search]);

  async function handleConnect(id) {
    if (connected.has(id)) return;
    try {
      await axios.post(`${API}/connect`, { receiverId: id }, { headers });
      setConnected((p) => new Set([...p, id]));
      toast({ title: "Request sent! 🎉", description: "They'll be notified." });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send request",
      });
    }
  }

  function clearFilters() {
    setCommunity("All");
    setMinScore(0);
    setSportFilter("");
    setHobbyFilter("");
    setFieldFilter("");
    setSearch("");
  }

  const hasFilters =
    community !== "All" ||
    minScore > 0 ||
    sportFilter ||
    hobbyFilter ||
    fieldFilter ||
    search;
  const topScore = matches.length
    ? Math.max(...matches.map((m) => m.score))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-display font-bold mb-2">
              Your <span className="gradient-text">Perfect Matches</span> ✦
            </h1>
            <p className="text-muted-foreground">
              {loading
                ? "Finding your people…"
                : `Found ${visible.length} student${visible.length !== 1 ? "s" : ""} matched to your interests`}
            </p>

            {!loading && matches.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-5">
                {[
                  {
                    icon: Users,
                    value: matches.length,
                    label: "Students",
                    cls: "text-primary",
                  },
                  {
                    icon: TrendingUp,
                    value: visible.length,
                    label: "Showing",
                    cls: "text-secondary",
                  },
                  {
                    icon: Star,
                    value: `${topScore}%`,
                    label: "Top score",
                    cls: "text-yellow-400",
                  },
                ].map(({ icon: Icon, value, label, cls }) => (
                  <div
                    key={label}
                    className="glass-card px-5 py-3 flex items-center gap-3"
                  >
                    <Icon className={`w-4 h-4 ${cls}`} />
                    <span className="font-display font-bold text-lg text-foreground">
                      {value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Search + filter bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="glass-card mb-8 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, interest, sport, hobby…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                className={`gap-2 ${showFilters || hasFilters ? "border-primary/50 text-primary bg-primary/10" : ""}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasFilters && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pt-1 pb-5 space-y-5 border-t border-border">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 mt-4">
                        Community
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {COMMUNITY_FILTERS.map((cf) => (
                          <FilterChip
                            key={cf}
                            label={cf}
                            active={community === cf}
                            onClick={() => setCommunity(cf)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                        Minimum match score
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SCORE_FILTERS.map(({ label, min }) => (
                          <FilterChip
                            key={label}
                            label={label}
                            active={minScore === min}
                            onClick={() => setMinScore(min)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Sport",
                          val: sportFilter,
                          set: setSportFilter,
                          ph: "e.g. Cricket",
                        },
                        {
                          label: "Hobby",
                          val: hobbyFilter,
                          set: setHobbyFilter,
                          ph: "e.g. Gaming",
                        },
                        {
                          label: "Field / Interest",
                          val: fieldFilter,
                          set: setFieldFilter,
                          ph: "e.g. AI & ML",
                        },
                      ].map(({ label, val, set, ph }) => (
                        <div key={label}>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                            {label}
                          </p>
                          <input
                            type="text"
                            placeholder={ph}
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            className="w-full bg-muted/20 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Grid ── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="glass-card w-24 h-24 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                🔍
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">
                No matches found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {hasFilters
                  ? "Try adjusting your filters."
                  : "Complete your interest profile to get better matches."}
              </p>
              {hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              ) : (
                <Button
                  className="btn-glow"
                  onClick={() => navigate("/onboarding")}
                >
                  <Zap className="w-4 h-4 mr-2" /> Complete your profile
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((match, i) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  index={i}
                  connected={connected.has(match.id)}
                  onConnect={handleConnect}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
