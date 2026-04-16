/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Mail,
  Edit3,
  Camera,
  Plane,
  Code,
  Brain,
  Rocket,
  Dumbbell,
  MessageCircle,
  Settings,
  LogOut,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import FindMatchButton from "../components/FindMatch/FindMatchButton";

const API_BASE =
  window.location.hostname === "localhost"
    ? "https://connecto-2.onrender.com/api"
    : "https://connecto-2.onrender.com/api";
const API = `${API_BASE}/users`;

const COMMUNITY_DISPLAY: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  travel: { icon: Plane, color: "text-travel", bgColor: "bg-travel/10" },
  dsa: { icon: Code, color: "text-dsa", bgColor: "bg-dsa/10" },
  "mental-wellness": {
    icon: Brain,
    color: "text-wellness",
    bgColor: "bg-wellness/10",
  },
  startup: { icon: Rocket, color: "text-startup", bgColor: "bg-startup/10" },
  gym: { icon: Dumbbell, color: "text-gym", bgColor: "bg-gym/10" },
};

// ── Read cached onboarding data from localStorage ──────────────
// Saved by OnboardingFlow.jsx after the user completes onboarding.
// This lets Profile show year/dept/interests instantly without
// waiting for an API round-trip.
function getOnboardingCache() {
  try {
    const raw = localStorage.getItem("onboardingProfile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // ── Profile state ──────────────────────────────────────────
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    hometown: "",
    bio: "",
  });
  const [tempProfile, setTempProfile] = useState(profile);

  // ── Interest data (from onboarding cache + API) ────────────
  const cache = getOnboardingCache();
  const [year, setYear] = useState(cache?.year || "");
  const [dept, setDept] = useState(cache?.dept || "");
  const [fieldPrefs, setFieldPrefs] = useState<string[]>(
    cache?.fieldPref || [],
  );
  const [sports, setSports] = useState<string[]>(cache?.sports || []);
  const [hobbies, setHobbies] = useState<string[]>(cache?.hobbies || []);
  const [foodPrefs, setFoodPrefs] = useState<string[]>(cache?.food || []);
  const [travelPrefs, setTravelPrefs] = useState<string[]>(
    cache?.placePref || [],
  );

  // ── Dynamic data ───────────────────────────────────────────
  const [communities, setCommunities] = useState<any[]>([]);
  const [activity, setActivity] = useState({
    posts: 0,
    connections: 0,
    messages: 0,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch all profile data ─────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // 1. Basic profile
    axios
      .get(`${API}/profile`, { headers })
      .then((res) => {
        const p = res.data;
        const profileData = {
          name: p.username || p.name || "User",
          email: p.email || "",
          phone: p.phone || "",
          hometown: p.hometown || "",
          bio: p.bio || "",
        };
        setProfile(profileData);
        setTempProfile(profileData);

        // ── Update interest fields from API ────────────────────
        // Always overwrite with real DB values (even empty arrays)
        // so the UI stays in sync with what's actually stored.
        const safeArr = (val: any): string[] => {
          if (Array.isArray(val)) return val;
          try {
            return val ? JSON.parse(val) : [];
          } catch {
            return [];
          }
        };

        if (p.year !== undefined && p.year !== null) setYear(p.year);
        if (p.dept !== undefined && p.dept !== null) setDept(p.dept);
        setFieldPrefs(safeArr(p.field_prefs));
        setSports(safeArr(p.sports));
        setHobbies(safeArr(p.hobbies));
        setFoodPrefs(safeArr(p.food_prefs));
        setTravelPrefs(safeArr(p.place_prefs));
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load profile data",
        });
      })
      .finally(() => setLoadingProfile(false));

    // 2. Communities
    axios.get(
      `https://connecto-2.onrender.com/api/communities/my-communities/details`,
      { headers },
    );
    axios
      .get(`${API}/communities`, { headers })
      .then((res) => setCommunities(res.data))
      .catch((err) => console.warn("Communities fetch:", err))
      .finally(() => setLoadingCommunities(false));

    // 3. Activity stats
    axios
      .get(`${API}/activity`, { headers })
      .then((res) => setActivity(res.data))
      .catch((err) => console.warn("Activity fetch:", err))
      .finally(() => setLoadingActivity(false));
  }, []);

  // ── Save profile edits ─────────────────────────────────────
  const handleSave = async () => {
    try {
      await axios.put(`${API}/profile/update`, tempProfile, { headers });
      setProfile(tempProfile);
      setIsEditing(false);
      toast({ title: "Success", description: "Profile updated!" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Update failed",
      });
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("onboardingProfile");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone!",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/delete`, { headers });

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("onboardingProfile");

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      navigate("/signup");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete account",
      });
    }
  };
  // ── Interest tag section helper ────────────────────────────
  function InterestSection({
    title,
    items,
    colorClass,
  }: {
    title: string;
    items: string[];
    colorClass: string;
  }) {
    if (!items.length) return null;
    return (
      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${colorClass}`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* ── Profile Header ── */}
          <motion.div
            className="glass-card p-8 mb-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-display font-bold text-primary-foreground"
                  whileHover={{ scale: 1.05 }}
                >
                  {loadingProfile
                    ? "…"
                    : profile.name.charAt(0).toUpperCase() || "?"}
                </motion.div>
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 text-center md:text-left">
                {loadingProfile ? (
                  <div className="h-8 w-40 bg-muted/40 rounded-lg animate-pulse mb-2" />
                ) : (
                  <h1 className="text-3xl font-display font-bold mb-2">
                    {profile.name}
                  </h1>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {loadingProfile ? "…" : profile.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    {loadingProfile ? "…" : profile.hometown || "—"}
                  </span>
                </div>

                {/* Year + dept badges — shown instantly from cache */}
                {(year || dept) && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {year && (
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-medium">
                        {year}
                      </span>
                    )}
                    {dept && (
                      <span className="text-xs px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary font-medium">
                        {dept}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-muted-foreground">
                  {loadingProfile ? "Loading…" : profile.bio || "No bio yet."}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setTempProfile(profile);
                    setIsEditing(true);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ── Left column ── */}
            <motion.div
              className="md:col-span-2 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {isEditing ? (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-display font-semibold mb-6">
                    Edit Profile
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={tempProfile.name}
                          onChange={(e) =>
                            setTempProfile({
                              ...tempProfile,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="hometown">Hometown / City</Label>
                        <Input
                          id="hometown"
                          value={tempProfile.hometown}
                          placeholder="e.g., Panipat"
                          onChange={(e) =>
                            setTempProfile({
                              ...tempProfile,
                              hometown: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={tempProfile.phone}
                        onChange={(e) =>
                          setTempProfile({
                            ...tempProfile,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={tempProfile.bio}
                        rows={4}
                        placeholder="Tell us more about yourself!"
                        onChange={(e) =>
                          setTempProfile({
                            ...tempProfile,
                            bio: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={handleSave} className="btn-glow">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── My Communities ── */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-display font-semibold mb-4">
                      My Communities
                    </h2>
                    {loadingCommunities ? (
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-24 rounded-xl bg-muted/30 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : communities.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        You haven't joined any communities yet.{" "}
                        {/* <a href="/communities" className="text-primary underline">Browse communities</a> */}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {communities.map((community, index) => {
                          const display = COMMUNITY_DISPLAY[community.slug] ?? {
                            icon: User,
                            color: "text-primary",
                            bgColor: "bg-primary/10",
                          };
                          const Icon = display.icon;
                          return (
                            <motion.a
                              key={community.id}
                              className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <div
                                className={`w-12 h-12 rounded-lg ${display.bgColor} flex items-center justify-center`}
                              >
                                <Icon className={`w-6 h-6 ${display.color}`} />
                              </div>
                              <span className="text-sm font-medium">
                                {community.name}
                              </span>
                            </motion.a>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Interest Profile ── always visible ── */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-display font-semibold">
                        Interest Profile
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/onboarding")}
                      >
                        {fieldPrefs.length > 0 ||
                        sports.length > 0 ||
                        hobbies.length > 0 ||
                        foodPrefs.length > 0 ||
                        travelPrefs.length > 0
                          ? "Update Interests"
                          : "Add Interests"}
                      </Button>
                    </div>

                    {/* Empty state */}
                    {!loadingProfile &&
                    fieldPrefs.length === 0 &&
                    sports.length === 0 &&
                    hobbies.length === 0 &&
                    foodPrefs.length === 0 &&
                    travelPrefs.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-3">🎯</div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          No interests added yet
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Add your interests to get better matches and let
                          others know what you're into.
                        </p>
                        <Button
                          className="btn-glow"
                          size="sm"
                          onClick={() => navigate("/onboarding")}
                        >
                          Add Your Interests
                        </Button>
                      </div>
                    ) : loadingProfile ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-8 bg-muted/30 rounded-lg animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <InterestSection
                          title="Fields & Career"
                          items={fieldPrefs}
                          colorClass="bg-primary/10 text-primary border-primary/25"
                        />
                        <InterestSection
                          title="Sports & Fitness"
                          items={sports}
                          colorClass="bg-orange-500/10 text-orange-400 border-orange-500/25"
                        />
                        <InterestSection
                          title="Hobbies"
                          items={hobbies}
                          colorClass="bg-secondary/10 text-secondary border-secondary/25"
                        />
                        <InterestSection
                          title="Food"
                          items={foodPrefs}
                          colorClass="bg-pink-500/10 text-pink-400 border-pink-500/25"
                        />
                        <InterestSection
                          title="Travel"
                          items={travelPrefs}
                          colorClass="bg-green-500/10 text-green-400 border-green-500/25"
                        />
                      </>
                    )}
                  </div>

                  {/* ── Activity Stats ── */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-display font-semibold mb-4">
                      Activity
                    </h2>
                    {loadingActivity ? (
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-20 rounded-xl bg-muted/30 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: "Posts", value: activity.posts },
                          { label: "Connections", value: activity.connections },
                          { label: "Messages", value: activity.messages },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="text-center p-4 bg-muted/30 rounded-xl"
                          >
                            <div className="text-2xl font-display font-bold gradient-text">
                              {stat.value ?? 0}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {/* ── Right column ── */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Hometown */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Hometown</h3>
                    <p className="text-primary font-semibold">
                      {loadingProfile ? "…" : profile.hometown || "Not set"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/find-buddies")}
                >
                  Find Hometown Buddies
                </Button>
              </div>

              {/* Find your match */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-2">
                  Find Your People
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover students who share your communities and interests.
                </p>
                <FindMatchButton onClick={() => navigate("/find-match")} />
              </div>

              {/* Quick Links */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">Quick Links</h3>

                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate("/messages")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Messages
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate("/")}
                  >
                    <User className="w-4 h-4 mr-2" /> My Posts
                  </Button>

                  {/* Logout */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>

                  {/* 🔥 Delete Account */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
