/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import TeamPanel from "@/components/TeamPanel";
import {
  Heart,
  MessageCircle,
  Users,
  Send,
  ArrowLeft,
  UserPlus,
  Loader2,
} from "lucide-react";
import axios from "axios";

const API = "https://connecto-2.onrender.com";

// ─── helpers ────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// Decode JWT payload without a library
function decodeUserId(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id ?? payload.userId ?? null;
  } catch {
    return null;
  }
}

// ─── types ──────────────────────────────────────────────────────────────────
interface Comment {
  id: number;
  user: string;
  comment: string;
  created_at: string;
}

interface Idea {
  id: number;
  title: string;
  problem: string;
  solution: string;
  skills: string[];
  category: string;
  stage: string;
  author: string;
  authorAvatar: string;
  user_id: number;
  likes: number;
  comments_count: number;
  createdAt: string;
  isLiked: boolean;
}

// ────────────────────────────────────────────────────────────────────────────

const IdeaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const currentUserId = decodeUserId();

  // ── idea state ──────────────────────────────────────────────────────────
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // ── comment state ───────────────────────────────────────────────────────
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  // ── join form state ─────────────────────────────────────────────────────
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinSkills, setJoinSkills] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // ── request status for current user ────────────────────────────────────
  const [myRequestStatus, setMyRequestStatus] = useState<
    "pending" | "accepted" | "rejected" | null
  >(null);

  // ── is founder ──────────────────────────────────────────────────────────
  const isFounder = idea ? idea.user_id === currentUserId : false;

  // ── fetch idea ──────────────────────────────────────────────────────────
  const fetchIdea = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/startup/idea/${id}`, {
        headers: getToken() ? authHeader() : {},
      });
      const data = res.data;
      console.log(data);
      setIdea({
        id: data.id,
        title: data.title,
        problem: data.problem,
        solution: data.solution,
        skills:
          typeof data.skills === "string"
            ? JSON.parse(data.skills)
            : data.skills || [],
        category: data.category,
        stage: data.stage,
        author: data.author || "Anonymous",
        authorAvatar: data.author ? data.author[0].toUpperCase() : "U",
        user_id: data.user_id,
        likes: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        createdAt: data.created_at
          ? new Date(data.created_at).toLocaleDateString()
          : "Just now",
        isLiked: data.isLiked || false,
      });
      setIsLiked(data.isLiked || false);
    } catch {
      toast({
        title: "Error",
        description: "Could not load idea details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  // ── fetch comments ──────────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      const res = await axios.get(`${API}/api/startup/idea/${id}/comments`);
      setComments(res.data);
    } catch {
      /* silent */
    }
  }, [id]);

  // ── fetch my request status ─────────────────────────────────────────────
  const fetchMyRequestStatus = useCallback(async () => {
    if (!id || !getToken()) return;
    try {
      const res = await axios.get(`${API}/api/team/idea/${id}/my-request`, {
        headers: authHeader(),
      });
      setMyRequestStatus(res.data.status);
    } catch {
      /* silent */
    }
  }, [id]);

  useEffect(() => {
    fetchIdea();
    fetchComments();
    fetchMyRequestStatus();
  }, [fetchIdea, fetchComments, fetchMyRequestStatus]);

  // ── like ────────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!getToken()) {
      toast({ title: "Please login to like", variant: "destructive" });
      return;
    }
    try {
      const res = await axios.post(
        `${API}/api/startup/idea/${id}/like`,
        {},
        { headers: authHeader() },
      );
      setIsLiked(res.data.liked);
      setIdea((prev) =>
        prev
          ? {
              ...prev,
              likes: res.data.liked ? prev.likes + 1 : prev.likes - 1,
            }
          : prev,
      );
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  // ── comment ─────────────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!comment.trim()) return;
    if (!getToken()) {
      toast({ title: "Please login to comment", variant: "destructive" });
      return;
    }
    try {
      setSubmittingComment(true);
      await axios.post(
        `${API}/api/startup/idea/${id}/comment`,
        { comment },
        { headers: authHeader() },
      );
      setComment("");
      fetchComments();
      setIdea((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev,
      );
    } catch {
      toast({ title: "Comment failed", variant: "destructive" });
    } finally {
      setSubmittingComment(false);
    }
  };

  // ── join request ─────────────────────────────────────────────────────────
  const handleJoinRequest = async () => {
    if (!joinMessage.trim()) {
      toast({
        title: "Please add a motivation message",
        variant: "destructive",
      });
      return;
    }
    if (!getToken()) {
      toast({ title: "Please login first", variant: "destructive" });
      return;
    }
    try {
      setSubmittingJoin(true);
      await axios.post(
        `${API}/api/team/idea/${id}/join-request`,
        { skills: joinSkills, message: joinMessage },
        { headers: authHeader() },
      );
      setShowJoinForm(false);
      setJoinSkills("");
      setJoinMessage("");
      setMyRequestStatus("pending");
      toast({
        title: "Request Sent! 🚀",
        description: "The founder will review your request.",
      });
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmittingJoin(false);
    }
  };

  // ── join button label ───────────────────────────────────────────────────
  const joinButtonLabel = () => {
    if (myRequestStatus === "pending") return "Request Pending ⏳";
    if (myRequestStatus === "accepted") return "You're a Member ✓";
    if (myRequestStatus === "rejected") return "Re-apply";
    return "Join Team";
  };

  const joinButtonDisabled =
    myRequestStatus === "pending" || myRequestStatus === "accepted";

  // ── loading / not found ─────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-startup" />
          <p className="text-muted-foreground font-medium">Loading Idea...</p>
        </div>
      </div>
    );

  if (!idea)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Idea not found</p>
          <Link to="/startup/ideas">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ideas
            </Button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back link */}
          <Link
            to="/startup/ideas"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Ideas
          </Link>

          {/* ── Idea Header Card ─────────────────────────────────────────── */}
          <motion.div
            className="glass-card p-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Author row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                {idea.authorAvatar}
              </div>
              <div>
                <p className="font-medium">{idea.author}</p>
                <p className="text-sm text-muted-foreground">
                  {idea.createdAt}
                </p>
              </div>
              <div className="ml-auto flex gap-2 flex-wrap justify-end">
                <Badge variant="outline">{idea.stage}</Badge>
                <Badge className="bg-startup/20 text-startup border-0">
                  {idea.category}
                </Badge>
                {isFounder && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-0">
                    👑 Your Idea
                  </Badge>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-display font-bold mb-6">
              {idea.title}
            </h1>

            {/* Problem / Solution / Skills */}
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-startup mb-1">
                  🔴 Problem
                </h3>
                <p className="text-muted-foreground">{idea.problem}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-1">
                  ✅ Solution
                </h3>
                <p className="text-muted-foreground">{idea.solution}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">
                  🛠 Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {idea.skills?.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions bar */}
            <div className="flex items-center gap-4 pt-4 border-t border-border/50 flex-wrap">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  isLiked
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                {idea.likes} Likes
              </button>

              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="w-5 h-5" /> {idea.comments_count}{" "}
                Comments
              </span>

              {/* Show Join button only to non-founders */}
              {!isFounder && (
                <div className="ml-auto">
                  <Button
                    className="btn-glow"
                    onClick={() => setShowJoinForm(!showJoinForm)}
                    disabled={joinButtonDisabled}
                    variant={
                      myRequestStatus === "rejected" ? "outline" : "default"
                    }
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {joinButtonLabel()}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Join Form ──────────────────────────────────────────────────── */}
          <AnimatePresence>
            {showJoinForm && !isFounder && (
              <motion.div
                className="glass-card p-6 mb-6 overflow-hidden border border-startup/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="font-display font-semibold mb-1 text-lg">
                  🚀 Send Join Request
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Tell the founder why you're the right fit.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Your Skills (comma separated)
                    </label>
                    <Input
                      placeholder="e.g. React, UI Design, Marketing"
                      value={joinSkills}
                      onChange={(e) => setJoinSkills(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Motivation <span className="text-red-400">*</span>
                    </label>
                    <Textarea
                      placeholder="Why do you want to join this project? What will you bring?"
                      value={joinMessage}
                      onChange={(e) => setJoinMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleJoinRequest}
                      className="btn-glow"
                      disabled={submittingJoin}
                    >
                      {submittingJoin ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Request
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowJoinForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Grid ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Discussion */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-startup" /> Discussion
              </h2>

              {/* Comment input */}
              <div className="glass-card p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Share your thoughts or ask a question..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  />
                  <Button
                    onClick={handleComment}
                    size="icon"
                    disabled={submittingComment}
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10 glass-card">
                    No comments yet. Start the conversation!
                  </p>
                ) : (
                  comments.map((c) => (
                    <motion.div
                      key={c.id}
                      className="glass-card p-4"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {c.user[0]}
                        </div>
                        <p className="font-medium text-sm">{c.user}</p>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-10">
                        {c.comment}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Team Panel (handles both founder view + member view) */}
            <TeamPanel
              ideaId={idea.id}
              founderId={idea.user_id}
              founderName={idea.author}
              founderAvatar={idea.authorAvatar}
              currentUserId={currentUserId}
              isFounder={isFounder}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IdeaDetail;
