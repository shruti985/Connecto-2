/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  X,
  UserCheck,
  Rocket,
  Code,
  Brain,
  Coffee,
  Target,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HackathonRoom {
  id: number;
  hackathon_name: string;
  description: string;
  required_skills: string[];
  team_size: number;
  deadline: string | null;
  creator_id: number;
  creator_name: string;
  current_members: number;
  is_full: boolean;
  is_creator: boolean;
  has_requested: boolean;
  is_member: boolean;
  created_at: string;
}

interface JoinRequest {
  id: number;
  user_id: number;
  username: string;
  skills: string[];
  created_at: string;
}

// ─── Skill badge colors ────────────────────────────────────────────────────
const SKILL_COLORS = [
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
];
const skillColor = (i: number) => SKILL_COLORS[i % SKILL_COLORS.length];

// const API = "https://connecto-2.onrender.com";
const API = "https://connecto-2.onrender.com";

// ─── Slot bar component ────────────────────────────────────────────────────
const SlotBar = ({ filled, total }: { filled: number; total: number }) => (
  <div className="flex gap-1 items-center">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
          i < filled
            ? "bg-gradient-to-r from-cyan-400 to-blue-500"
            : "bg-white/10"
        }`}
      />
    ))}
  </div>
);

// ─── Create Room Modal ─────────────────────────────────────────────────────
const CreateRoomModal = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    hackathon_name: "",
    description: "",
    team_size: 4,
    deadline: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput("");
  };

  const handleSubmit = async () => {
    if (!form.hackathon_name.trim())
      return toast({
        variant: "destructive",
        title: "Hackathon name required",
      });
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/hackathons/rooms`,
        { ...form, required_skills: skills },
        { headers: { Authorization: token } },
      );
      toast({
        title: "🚀 Room created!",
        description: "Your hackathon room is live.",
      });
      onCreated();
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err.response?.data?.message || "Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d1a] p-6 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">
                Create Hackathon Room
              </h2>
              <p className="text-xs text-white/40">Find your dream team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block uppercase tracking-wider">
              Hackathon Name *
            </label>
            <Input
              placeholder="e.g. Smart India Hackathon 2025"
              value={form.hackathon_name}
              onChange={(e) =>
                setForm({ ...form, hackathon_name: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="What are you building? What kind of teammates do you need?"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-md bg-white/5 border border-white/10 text-white placeholder:text-white/30 p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block uppercase tracking-wider">
                Team Size
              </label>
              <Input
                type="number"
                min={2}
                max={10}
                value={form.team_size}
                onChange={(e) =>
                  setForm({ ...form, team_size: parseInt(e.target.value) || 4 })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block uppercase tracking-wider">
                Deadline
              </label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block uppercase tracking-wider">
              Required Skills
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. React, ML, Node.js"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
              <Button
                onClick={addSkill}
                variant="outline"
                className="border-white/10 text-white/70 hover:bg-white/10 shrink-0"
              >
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((s, i) => (
                  <span
                    key={s}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${skillColor(i)}`}
                  >
                    {s}
                    <button
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold mt-2"
          >
            {loading ? "Creating..." : "🚀 Launch Room"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Room Card ─────────────────────────────────────────────────────────────
const RoomCard = ({
  room,
  onRefresh,
}: {
  room: HackathonRoom;
  onRefresh: () => void;
}) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);

  const token = localStorage.getItem("token");

  const handleJoinRequest = async () => {
    try {
      await axios.post(
        `${API}/api/hackathons/rooms/${room.id}/request`,
        {},
        {
          headers: { Authorization: token },
        },
      );
      toast({
        title: "✅ Request sent!",
        description: "Waiting for creator's approval.",
      });
      onRefresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err.response?.data?.message || "Failed",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/api/hackathons/rooms/${room.id}`, {
        headers: { Authorization: token },
      });
      toast({ title: "Room deleted" });
      onRefresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  const fetchRequests = async () => {
    setLoadingReqs(true);
    try {
      const res = await axios.get(
        `${API}/api/hackathons/rooms/${room.id}/requests`,
        {
          headers: { Authorization: token },
        },
      );
      setRequests(res.data);
    } catch {
      /* ignore if not creator */
    } finally {
      setLoadingReqs(false);
    }
  };

  const handleRequestAction = async (
    memberId: number,
    action: "accept" | "reject",
  ) => {
    try {
      await axios.patch(
        `${API}/api/hackathons/rooms/${room.id}/requests/${memberId}`,
        { action },
        { headers: { Authorization: token } },
      );
      toast({
        title:
          action === "accept" ? "✅ Member accepted!" : "❌ Request rejected",
      });
      fetchRequests();
      onRefresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err.response?.data?.message || "Failed",
      });
    }
  };

  const toggleExpand = () => {
    if (!expanded && room.is_creator) fetchRequests();
    setExpanded(!expanded);
  };

  const spotsLeft = room.team_size - room.current_members;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl border bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-300 ${
        room.is_full
          ? "border-white/5 opacity-70"
          : room.is_creator
            ? "border-cyan-500/30"
            : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1 w-full ${
          room.is_creator
            ? "bg-gradient-to-r from-cyan-500 to-blue-600"
            : room.is_full
              ? "bg-gradient-to-r from-gray-600 to-gray-700"
              : "bg-gradient-to-r from-purple-500 to-pink-600"
        }`}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-white text-base truncate">
                {room.hackathon_name}
              </h3>
              {room.is_creator && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold uppercase tracking-wider">
                  Your Room
                </span>
              )}
              {room.is_member && !room.is_creator && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  ✓ Member
                </span>
              )}
              {room.is_full && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-500/20 text-gray-400 border border-gray-500/30 font-semibold">
                  FULL
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 flex items-center gap-1">
              <Shield className="w-3 h-3" /> by {room.creator_name}
              {room.deadline && (
                <span className="ml-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(room.deadline).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {room.is_creator && (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Delete room"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={toggleExpand}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-white/50 mb-3 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Skills */}
        {room.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {room.required_skills.map((s, i) => (
              <span
                key={s}
                className={`px-2 py-0.5 rounded-full text-[11px] border ${skillColor(i)}`}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Slots bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-white/40 mb-1">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {room.current_members}/
              {room.team_size} members
            </span>
            {!room.is_full && (
              <span className="text-cyan-400">
                {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
              </span>
            )}
          </div>
          <SlotBar filled={room.current_members} total={room.team_size} />
        </div>

        {/* CTA */}
        {!room.is_creator && !room.is_member && (
          <Button
            onClick={handleJoinRequest}
            disabled={room.is_full || room.has_requested}
            className={`w-full h-8 text-xs font-semibold transition-all ${
              room.is_full
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : room.has_requested
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            }`}
          >
            {room.is_full ? (
              "Team Full"
            ) : room.has_requested ? (
              <span className="flex items-center gap-1 justify-center">
                <Clock className="w-3 h-3" /> Request Pending
              </span>
            ) : (
              <span className="flex items-center gap-1 justify-center">
                <Zap className="w-3 h-3" /> Request to Join
              </span>
            )}
          </Button>
        )}

        {/* Expanded: Join Requests (creator view) */}
        <AnimatePresence>
          {expanded && room.is_creator && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Join Requests
                  {loadingReqs && (
                    <span className="ml-1 text-cyan-400">Loading...</span>
                  )}
                </p>
                {requests.length === 0 ? (
                  <p className="text-xs text-white/30 italic">
                    No pending requests.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {requests.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-3 bg-white/5 rounded-xl p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {r.username}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.skills.slice(0, 4).map((s, i) => (
                              <span
                                key={s}
                                className={`px-1.5 py-0.5 rounded-full text-[10px] border ${skillColor(i)}`}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleRequestAction(r.id, "accept")}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                            title="Accept"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRequestAction(r.id, "reject")}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Skills Editor (for Profile) ──────────────────────────────────────────
export const SkillsEditor = () => {
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/hackathons/skills`, {
          headers: { Authorization: token },
        });
        setSkills(res.data.skills || []);
      } catch {}
    };
    fetchSkills();
  }, []);

  const addSkill = () => {
    const s = input.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setInput("");
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const saveSkills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/api/hackathons/skills`,
        { skills },
        {
          headers: { Authorization: token },
        },
      );
      toast({ title: "✅ Skills saved!" });
    } catch {
      toast({ variant: "destructive", title: "Failed to save skills" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Code className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Your Skills</h3>
          <p className="text-xs text-white/40">
            Used for hackathon team matching
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a skill (e.g. React, Python, ML...)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
        <Button
          onClick={addSkill}
          variant="outline"
          className="border-white/10 text-white/70 hover:bg-white/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <motion.span
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${skillColor(i)}`}
            >
              {s}
              <button
                onClick={() => removeSkill(s)}
                className="opacity-60 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </div>
      )}

      {skills.length === 0 && (
        <p className="text-xs text-white/30 italic text-center py-2">
          No skills added yet. Add some to appear in hackathon team searches!
        </p>
      )}

      <Button
        onClick={saveSkills}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
      >
        {loading ? "Saving..." : "Save Skills"}
      </Button>
    </div>
  );
};

// ─── Main HackathonTab Component ───────────────────────────────────────────
const HackathonTab = () => {
  const [rooms, setRooms] = useState<HackathonRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchSkill, setSearchSkill] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "mine">("all");

  const fetchRooms = async (skillFilter?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = skillFilter
        ? `?skill=${encodeURIComponent(skillFilter)}`
        : "";
      const res = await axios.get(`${API}/api/hackathons/rooms${params}`, {
        headers: { Authorization: token },
      });
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = () => fetchRooms(searchSkill.trim() || undefined);

  const filteredRooms = rooms.filter((r) => {
    if (filter === "open") return !r.is_full;
    if (filter === "mine") return r.is_creator || r.is_member;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden border border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2a] via-[#0a0a1a] to-[#1a0d2e]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,200,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                Hackathon Teams
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Find Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Dream Team
              </span>
            </h2>
            <p className="text-white/50 text-sm max-w-md">
              Create a room, specify required skills, and build the perfect
              hackathon squad. Or browse open teams looking for talent like
              yours.
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 h-11 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Room
          </Button>
        </div>
      </motion.div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Search by skill (e.g. React, ML, UI/UX...)"
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
          <Button
            onClick={handleSearch}
            variant="outline"
            className="border-white/10 text-white/70 hover:bg-white/10 shrink-0"
          >
            <Search className="w-4 h-4" />
          </Button>
          {searchSkill && (
            <Button
              onClick={() => {
                setSearchSkill("");
                fetchRooms();
              }}
              variant="ghost"
              className="text-white/40 hover:text-white shrink-0 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          {(["all", "open", "mine"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                filter === f
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {f === "all" ? "All Rooms" : f === "open" ? "Open" : "My Teams"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Rooms",
            value: rooms.length,
            icon: Rocket,
            color: "text-cyan-400",
          },
          {
            label: "Open Rooms",
            value: rooms.filter((r) => !r.is_full).length,
            icon: Users,
            color: "text-emerald-400",
          },
          {
            label: "My Teams",
            value: rooms.filter((r) => r.is_creator || r.is_member).length,
            icon: Target,
            color: "text-purple-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center"
          >
            <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
            <div className={`text-xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-[11px] text-white/30">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Room grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-white/[0.02] h-48 animate-pulse"
            />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-white/30"
        >
          <Rocket className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {filter === "mine"
              ? "You haven't joined or created any rooms yet."
              : searchSkill
                ? `No rooms found requiring "${searchSkill}".`
                : "No hackathon rooms yet. Be the first to create one!"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onRefresh={fetchRooms} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateRoomModal
            onClose={() => setShowCreate(false)}
            onCreated={fetchRooms}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HackathonTab;
