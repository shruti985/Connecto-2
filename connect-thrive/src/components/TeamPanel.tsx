/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  UserMinus,
  Clock,
  Crown,
} from "lucide-react";
import axios from "axios";

const API = "https://connecto-2.onrender.com"; // Change to your backend URL
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

interface Member {
  id: number;
  user_id: number;
  username: string;
  role: string;
  joined_at: string;
}

interface JoinRequest {
  id: number;
  user_id: number;
  username: string;
  skills: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

interface Props {
  ideaId: number;
  founderId: number;
  founderName: string;
  founderAvatar: string;
  currentUserId: number | null;
  isFounder: boolean;
}

const TeamPanel = ({
  ideaId,
  founderId,
  founderName,
  founderAvatar,
  currentUserId,
  isFounder,
}: Props) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showRequests, setShowRequests] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ── fetch members ───────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);
      const res = await axios.get(`${API}/api/team/idea/${ideaId}/members`);
      setMembers(res.data);
    } catch {
      /* silent */
    } finally {
      setLoadingMembers(false);
    }
  }, [ideaId]);

  // ── fetch requests (founder only) ────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    if (!isFounder) return;
    try {
      setLoadingRequests(true);
      const res = await axios.get(
        `${API}/api/team/idea/${ideaId}/join-requests`,
        { headers: authHeader() },
      );
      setRequests(res.data.filter((r: JoinRequest) => r.status === "pending"));
    } catch {
      /* silent */
    } finally {
      setLoadingRequests(false);
    }
  }, [ideaId, isFounder]);

  useEffect(() => {
    fetchMembers();
    fetchRequests();
  }, [fetchMembers, fetchRequests]);

  // ── accept / reject ──────────────────────────────────────────────────────
  const handleRequestAction = async (
    requestId: number,
    action: "accepted" | "rejected",
  ) => {
    setActionLoading(requestId);
    try {
      await axios.patch(
        `${API}/api/team/join-request/${requestId}`,
        { action },
        { headers: authHeader() },
      );
      toast({
        title: action === "accepted" ? "Member added! 🎉" : "Request declined",
        duration: 2000,
      });
      await fetchRequests();
      await fetchMembers();
    } catch (err: any) {
      toast({
        title: "Action failed",
        description: err.response?.data?.error || "Try again",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ── remove member ────────────────────────────────────────────────────────
  const handleRemoveMember = async (memberUserId: number) => {
    if (!confirm("Remove this member from your team?")) return;
    try {
      await axios.delete(
        `${API}/api/team/idea/${ideaId}/member/${memberUserId}`,
        { headers: authHeader() },
      );
      toast({ title: "Member removed", duration: 2000 });
      fetchMembers();
    } catch {
      toast({ title: "Failed to remove member", variant: "destructive" });
    }
  };

  const pendingCount = requests.length;

  return (
    <div className="space-y-6">
      {/* ── My Team / Team section ───────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-startup" />
          {isFounder ? "My Team" : "Team"}
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {members.length + 1} member{members.length !== 0 ? "s" : ""}
          </span>
        </h2>

        <div className="space-y-3">
          {/* Founder card */}
          <motion.div
            className="glass-card p-3 flex items-center gap-3 border-l-2 border-startup"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 rounded-full bg-startup/10 flex items-center justify-center text-startup font-bold">
              {founderAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{founderName}</p>
              <p className="text-[10px] uppercase tracking-wider text-startup font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" /> Founder
              </p>
            </div>
          </motion.div>

          {/* Members */}
          {loadingMembers ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3 glass-card">
              No team members yet.
            </p>
          ) : (
            <AnimatePresence>
              {members.map((m, i) => (
                <motion.div
                  key={m.id}
                  className="glass-card p-3 flex items-center gap-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium text-sm">
                    {m.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.username}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                  {/* Founder can remove members (but not themselves) */}
                  {isFounder && m.user_id !== founderId && (
                    <button
                      onClick={() => handleRemoveMember(m.user_id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors ml-auto"
                      title="Remove member"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                  {/* Show "You" badge if viewing own entry */}
                  {m.user_id === currentUserId && !isFounder && (
                    <Badge className="ml-auto text-[10px] h-5 bg-startup/20 text-startup border-0">
                      You
                    </Badge>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Pending Requests (founder only) ──────────────────────────────── */}
      {isFounder && (
        <div className="pt-4 border-t border-border/50">
          <button
            onClick={() => setShowRequests(!showRequests)}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-base font-display font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Pending Requests
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-[10px] text-black font-bold">
                  {pendingCount}
                </span>
              )}
            </h3>
            {showRequests ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>

          <AnimatePresence>
            {showRequests && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 overflow-hidden"
              >
                {loadingRequests ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : requests.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3 glass-card">
                    No pending requests.
                  </p>
                ) : (
                  requests.map((r) => (
                    <motion.div
                      key={r.id}
                      className="glass-card p-3 border border-amber-500/20"
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      {/* Requester info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-bold">
                          {r.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {r.username}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      {r.skills && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {r.skills
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="text-[10px] h-4 px-1.5"
                              >
                                {s}
                              </Badge>
                            ))}
                        </div>
                      )}

                      {/* Message */}
                      <p className="text-xs text-muted-foreground italic mb-3 line-clamp-3">
                        "{r.message}"
                      </p>

                      {/* Accept / Reject */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs flex-1 bg-green-600 hover:bg-green-700"
                          disabled={actionLoading === r.id}
                          onClick={() => handleRequestAction(r.id, "accepted")}
                        >
                          {actionLoading === r.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-3 h-3 mr-1" /> Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                          disabled={actionLoading === r.id}
                          onClick={() => handleRequestAction(r.id, "rejected")}
                        >
                          <X className="w-3 h-3 mr-1" /> Decline
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TeamPanel;
