// src/components/onboarding/OnboardingFlow.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API = "https://connecto-2.onrender.com/api/users";

const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgrad / M.Tech",
  "PhD",
];
const DEPT_OPTIONS = [
  "Computer Science",
  "Electronics & Comm.",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Mathematics",
  "Physics",
  "Management",
];
const GENDER_OPTIONS = [
  { icon: "♂", label: "Male", value: "M" },
  { icon: "♀", label: "Female", value: "F" },
  { icon: "⚧", label: "Non-binary", value: "NB" },
  { icon: "🔒", label: "Prefer not to say", value: "X" },
];
const VIBE_OPTIONS = [
  { icon: "🦋", label: "Extrovert", value: "E" },
  { icon: "🌙", label: "Introvert", value: "I" },
  { icon: "⚡", label: "Ambivert", value: "A" },
];
const FIELD_OPTIONS = [
  "Software Dev",
  "AI & ML",
  "Entrepreneurship",
  "Research",
  "Design & UX",
  "Finance & Banking",
  "Product Management",
  "Consulting",
  "Gaming",
  "Content Creation",
  "Law & Policy",
  "Healthcare",
  "Teaching",
  "Marketing",
  "DevOps & Cloud",
  "Robotics",
];
const PLACE_OPTIONS = [
  "Mountains & Trekking",
  "Beach & Coastal",
  "Historical & Heritage",
  "Cities & Urban",
  "Forests & Wildlife",
  "Deserts & Offbeat",
  "Spiritual & Religious",
  "Adventure Parks",
  "Road Trips",
  "International Travel",
];
const SPORTS_OPTIONS = [
  "Cricket",
  "Football",
  "Basketball",
  "Badminton",
  "Tennis",
  "Volleyball",
  "Chess",
  "Table Tennis",
  "Swimming",
  "Athletics",
  "Gym & Fitness",
  "Yoga",
  "Cycling",
  "Martial Arts",
  "E-Sports",
  "No sports",
];
const FOOD_OPTIONS = [
  "North Indian",
  "South Indian",
  "Street Food",
  "Chinese",
  "Italian",
  "Continental",
  "Vegan",
  "Vegetarian",
  "Junk Food Lover",
  "Healthy Eater",
  "Baker & Cooker",
  "Midnight Snacker",
];
const HOBBY_OPTIONS = [
  "Reading",
  "Photography",
  "Music",
  "Gaming",
  "Coding",
  "Painting & Art",
  "Dancing",
  "Singing",
  "Writing",
  "Cooking",
  "Podcasts",
  "Movies & OTT",
  "Anime",
  "Memes & Reels",
  "Volunteering",
  "Gardening",
];
const WEEKEND_OPTIONS = [
  "Go out & explore",
  "Binge shows at home",
  "Hit the gym",
  "Study & upskill",
  "Travel somewhere",
  "Attend events",
  "Cook & chill",
  "Sports & games",
];

const STEPS = [
  {
    id: "basics",
    name: "About You",
    icon: "👤",
    title: "A bit about you",
    subtitle: "Help us understand who you are.",
  },
  {
    id: "field",
    name: "Interests",
    icon: "🎯",
    title: "What fields excite you?",
    subtitle: "Pick up to 5 areas you're passionate about.",
  },
  {
    id: "personality",
    name: "Your Vibe",
    icon: "✨",
    title: "Your vibe & personality",
    subtitle: "Helps match you with the right people.",
  },
  {
    id: "travel",
    name: "Travel",
    icon: "✈️",
    title: "Where does your heart wander?",
    subtitle: "Find travel buddies who match your style.",
  },
  {
    id: "sports",
    name: "Sports",
    icon: "🏅",
    title: "Sports & fitness",
    subtitle: "Find gym partners & team players.",
  },
  {
    id: "food",
    name: "Food & Hobbies",
    icon: "🍜",
    title: "Food & lifestyle",
    subtitle: "Foodies find their people faster.",
  },
  {
    id: "summary",
    name: "Done!",
    icon: "🚀",
    title: "You're all set!",
    subtitle: "Hit Finish to start your journey.",
  },
];

const INIT = {
  gender: "",
  year: "",
  dept: "",
  personality: "",
  fieldPref: [],
  placePref: [],
  sports: [],
  food: [],
  hobbies: [],
  weekendPref: [],
};

// ── Chip ───────────────────────────────────────────────────────
function Chip({ label, selected, onToggle, accent }) {
  const accents = {
    cyan: "border-cyan-400 bg-cyan-400/10 text-cyan-400",
    green: "border-green-400 bg-green-400/10 text-green-400",
    orange: "border-orange-400 bg-orange-400/10 text-orange-400",
    purple: "border-purple-400 bg-purple-400/10 text-purple-400",
    pink: "border-pink-400 bg-pink-400/10 text-pink-400",
  };
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
        selected
          ? accents[accent] || accents.cyan
          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/30 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

// ── Gender / Vibe card button ──────────────────────────────────
function CardBtn({ icon, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
        selected
          ? "border-cyan-400 bg-cyan-400/10"
          : "border-white/10 bg-white/5 hover:border-white/30"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
}

// ── Styled select — fixes the white-on-white dropdown bug ──────
// The native <select> options inherit the OS/browser default
// background (white) when Tailwind's bg classes don't apply to
// Native <select> + <option> elements ignore CSS variables in most browsers.
// We use hardcoded dark hex values so options are always readable.
function StyledSelect({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        background: "#1a1a2e",
        color: value ? "#e2e8f0" : "#94a3b8",
        border: "1px solid #334155",
        outline: "none",
        cursor: "pointer",
        appearance: "auto",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
      onBlur={(e) => (e.target.style.borderColor = "#334155")}
    >
      <option
        value=""
        disabled
        style={{ background: "#1a1a2e", color: "#94a3b8" }}
      >
        {placeholder}
      </option>
      {options.map((o) => (
        <option
          key={o}
          value={o}
          style={{ background: "#1a1a2e", color: "#e2e8f0" }}
        >
          {o}
        </option>
      ))}
    </select>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  function toggleArr(key, val, max) {
    const limit = max || 99;
    setProfile((prev) => {
      const arr = prev[key] || [];
      if (arr.includes(val))
        return { ...prev, [key]: arr.filter((v) => v !== val) };
      if (arr.length >= limit) return prev;
      return { ...prev, [key]: [...arr, val] };
    });
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await axios.post(
        `${API}/onboarding`,
        {
          gender: profile.gender,
          year: profile.year,
          dept: profile.dept,
          personality: profile.personality,
          fieldPref: profile.fieldPref,
          sports: profile.sports,
          food: profile.food,
          hobbies: profile.hobbies,
          placePref: profile.placePref,
          weekendPref: profile.weekendPref,
        },
        { headers },
      );

      // ── Mark onboarding done ───────────────────────────────
      localStorage.setItem("onboardingDone", "true");

      // ── Cache answers locally so Profile page shows them ──
      // Profile.tsx reads this cache on mount so data appears
      // instantly without waiting for a new API round-trip.
      localStorage.setItem(
        "onboardingProfile",
        JSON.stringify({
          year: profile.year,
          dept: profile.dept,
          gender: profile.gender,
          personality: profile.personality,
          fieldPref: profile.fieldPref,
          sports: profile.sports,
          food: profile.food,
          hobbies: profile.hobbies,
          placePref: profile.placePref,
          weekendPref: profile.weekendPref,
        }),
      );

      toast({
        title: "Welcome to Connecto! 🎉",
        description: "Your profile is all set.",
      });

      // ── Go to HOME (not find-match) ────────────────────────
      navigate("/");
    } catch (err) {
      console.error("Onboarding save error:", err);
      // Don't trap the user — mark done and continue
      localStorage.setItem("onboardingDone", "true");
      toast({
        title: "Almost there!",
        description: "You can update your interests from your profile anytime.",
      });
      navigate("/");
    }
    setSaving(false);
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const current = STEPS[step];

  function renderStep() {
    switch (current.id) {
      case "basics":
        return (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                I identify as
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GENDER_OPTIONS.map((g) => (
                  <CardBtn
                    key={g.value}
                    icon={g.icon}
                    label={g.label}
                    selected={profile.gender === g.value}
                    onClick={() => setProfile({ ...profile, gender: g.value })}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Academic Year
              </p>
              {/* Use StyledSelect — fixes invisible options bug */}
              <StyledSelect
                value={profile.year}
                onChange={(v) => setProfile({ ...profile, year: v })}
                placeholder="Select your year…"
                options={YEAR_OPTIONS}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Department</p>
              <StyledSelect
                value={profile.dept}
                onChange={(v) => setProfile({ ...profile, dept: v })}
                placeholder="Select your department…"
                options={DEPT_OPTIONS}
              />
            </div>
          </div>
        );

      case "field":
        return (
          <div>
            <p className="text-xs text-cyan-400 font-medium mb-3">
              ✦ Select up to 5
            </p>
            <div className="flex flex-wrap gap-2">
              {FIELD_OPTIONS.map((o) => (
                <Chip
                  key={o}
                  label={o}
                  accent="cyan"
                  selected={profile.fieldPref.includes(o)}
                  onToggle={() => toggleArr("fieldPref", o, 5)}
                />
              ))}
            </div>
          </div>
        );

      case "personality":
        return (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                I'm more of a…
              </p>
              <div className="grid grid-cols-3 gap-3">
                {VIBE_OPTIONS.map((v) => (
                  <CardBtn
                    key={v.value}
                    icon={v.icon}
                    label={v.label}
                    selected={profile.personality === v.value}
                    onClick={() =>
                      setProfile({ ...profile, personality: v.value })
                    }
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Typical weekend for me…{" "}
                <span className="text-purple-400 text-xs">(pick up to 3)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {WEEKEND_OPTIONS.map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    accent="purple"
                    selected={profile.weekendPref.includes(o)}
                    onToggle={() => toggleArr("weekendPref", o, 3)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "travel":
        return (
          <div>
            <p className="text-xs text-green-400 font-medium mb-3">
              ✦ Select all that apply
            </p>
            <div className="flex flex-wrap gap-2">
              {PLACE_OPTIONS.map((o) => (
                <Chip
                  key={o}
                  label={o}
                  accent="green"
                  selected={profile.placePref.includes(o)}
                  onToggle={() => toggleArr("placePref", o)}
                />
              ))}
            </div>
          </div>
        );

      case "sports":
        return (
          <div>
            <p className="text-xs text-orange-400 font-medium mb-3">
              ✦ Select all you enjoy
            </p>
            <div className="flex flex-wrap gap-2">
              {SPORTS_OPTIONS.map((o) => (
                <Chip
                  key={o}
                  label={o}
                  accent="orange"
                  selected={profile.sports.includes(o)}
                  onToggle={() => toggleArr("sports", o)}
                />
              ))}
            </div>
          </div>
        );

      case "food":
        return (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Food preferences
              </p>
              <div className="flex flex-wrap gap-2">
                {FOOD_OPTIONS.map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    accent="pink"
                    selected={profile.food.includes(o)}
                    onToggle={() => toggleArr("food", o)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Hobbies & passions{" "}
                <span className="text-cyan-400 text-xs">(up to 6)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {HOBBY_OPTIONS.map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    accent="cyan"
                    selected={profile.hobbies.includes(o)}
                    onToggle={() => toggleArr("hobbies", o, 6)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "summary": {
        const sections = [
          {
            title: "About",
            values: [profile.year, profile.dept].filter(Boolean),
            color: "text-cyan-400",
          },
          {
            title: "Interests",
            values: profile.fieldPref,
            color: "text-cyan-400",
          },
          {
            title: "Travel",
            values: profile.placePref,
            color: "text-green-400",
          },
          { title: "Sports", values: profile.sports, color: "text-orange-400" },
          { title: "Food", values: profile.food, color: "text-pink-400" },
          { title: "Hobbies", values: profile.hobbies, color: "text-cyan-400" },
        ].filter((s) => s.values.length > 0);

        return (
          <div>
            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                You skipped most steps — that's okay! You can update your
                profile anytime.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {sections.map(({ title, values, color }) => (
                  <div
                    key={title}
                    className="bg-white/5 border border-white/10 rounded-xl p-3"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      {title}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {values.slice(0, 4).map((v) => (
                        <span
                          key={v}
                          className={`text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${color}`}
                        >
                          {v}
                        </span>
                      ))}
                      {values.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                          +{values.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={handleFinish}
              disabled={saving}
              className="w-full btn-glow font-bold py-3 text-base"
            >
              {saving ? "Saving…" : "✦ Go to Connecto →"}
            </Button>
          </div>
        );
      }

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text">
            Connecto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Let's build your perfect profile ✦
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{current.name}</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))",
            }}
          />
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="glass-card p-6 md:p-8"
          >
            <span className="text-3xl mb-3 block">{current.icon}</span>
            <h2 className="text-xl font-display font-bold mb-1">
              {current.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {current.subtitle}
            </p>

            {renderStep()}

            {current.id !== "summary" && (
              <div className="flex items-center gap-3 mt-6 justify-end">
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    ← Back
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
                >
                  Skip
                </button>
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  className="btn-glow font-semibold"
                >
                  Continue →
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 6,
                background:
                  i < step
                    ? "#4ade80"
                    : i === step
                      ? "hsl(var(--primary))"
                      : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
