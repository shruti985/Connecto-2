/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ideaStore } from "@/stores/ideaStore";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  MessageCircle,
  Users,
  Send,
  ArrowLeft,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import axios from "axios";

const IdeaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinSkills, setJoinSkills] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const token = localStorage.getItem("token");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  // Fetch Idea Details from Backend
  useEffect(() => {
    const fetchIdea = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://connecto-2.onrender.com/api/startup/idea/${id}`,
          {
            headers: {
              // Token bhejna zaroori hai taaki backend like status check kar sake
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );

        const data = response.data;

        setIdea({
          ...data,
          // Skills parsing (MySQL often returns strings)
          skills:
            typeof data.skills === "string"
              ? JSON.parse(data.skills)
              : data.skills || [],
          authorAvatar: data.author ? data.author[0].toUpperCase() : "U",
          comments: data.comments || [],
          members: data.members || [],
          joinRequests: data.joinRequests || [],
          likes: data.likes_count || 0,
          createdAt: data.created_at
            ? new Date(data.created_at).toLocaleDateString()
            : "Just now",
        });
        setIsLiked(data.isLiked || false);
      } catch (error) {
        console.error("Error fetching idea:", error);
        toast({
          title: "Error",
          description: "Could not load idea details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchIdea();
  }, [id, toast]);
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `https://connecto-2.onrender.com/api/startup/idea/${id}/comments`,
      );

      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (id) fetchComments();
  }, [id]);
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-startup font-medium">
          Loading Idea Details...
        </div>
      </div>
    );

  // 2. handleLike function
  const handleLike = async () => {
    if (!token) {
      toast({ title: "Please login to like", variant: "destructive" });
      return;
    }

    try {
      const response = await axios.post(
        `https://connecto-2.onrender.com/api/startup/idea/${id}/like`,
        {}, // 2nd argument 'data' hota hai, ise khali {} rakho
        {
          headers: {
            // Check karo backend 'Bearer ' prefix maang raha hai ya nahi
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setIsLiked(response.data.liked);
      setIdea((prev: any) => ({
        ...prev,
        likes: response.data.liked ? prev.likes + 1 : prev.likes - 1,
      }));

      toast({
        title: response.data.liked ? "Liked!" : "Removed Like",
        duration: 1500,
      });
    } catch (error) {
      console.error("Like error:", error);
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  // 3. JSX mein button ko update karo

  if (!idea) {
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
  }

  const handleComment = async () => {
    if (!comment.trim()) return;

    try {
      await axios.post(
        `https://connecto-2.onrender.com/api/startup/idea/${id}/comment`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComment("");

      fetchComments();

      setIdea((prev: any) => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinRequest = () => {
    if (!joinMessage.trim()) return;
    ideaStore.sendJoinRequest(
      idea.id,
      joinSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      joinMessage,
    );
    setShowJoinForm(false);
    setJoinSkills("");
    setJoinMessage("");
    toast({
      title: "Request Sent!",
      description: "Your join request has been sent to the idea owner.",
    });
  };

  const alreadyRequested =
    idea.joinRequests?.some((r: any) => r.user === "You") || false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/startup/ideas"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Ideas
          </Link>

          {/* Idea Header Card */}
          <motion.div
            className="glass-card p-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
              <div className="ml-auto flex gap-2">
                <Badge variant="outline">{idea.stage}</Badge>
                <Badge className="bg-startup/20 text-startup border-0">
                  {idea.category}
                </Badge>
              </div>
            </div>

            <h1 className="text-3xl font-display font-bold mb-6">
              {idea.title}
            </h1>

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
                  {idea.skills?.map((s: string) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                {idea.likes} Likes
              </button>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="w-5 h-5" /> {idea.comments_count}{" "}
                Comments
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="w-5 h-5" /> {idea.members.length} Members
              </span>
              <div className="ml-auto">
                <Button
                  className="btn-glow"
                  onClick={() => setShowJoinForm(!showJoinForm)}
                  disabled={alreadyRequested}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {alreadyRequested ? "Request Sent" : "Join Team"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Join Form Section */}
          <AnimatePresence>
            {showJoinForm && (
              <motion.div
                className="glass-card p-6 mb-6 overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="font-display font-semibold mb-4 text-lg">
                  Send Join Request
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Your Skills (Comma separated)
                    </label>
                    <Input
                      placeholder="e.g. React, UI Design, Marketing"
                      value={joinSkills}
                      onChange={(e) => setJoinSkills(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Motivation
                    </label>
                    <Textarea
                      placeholder="Tell the owner why you want to join..."
                      value={joinMessage}
                      onChange={(e) => setJoinMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleJoinRequest} className="btn-glow">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Comments */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-startup" /> Discussion
              </h2>

              <div className="glass-card p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Share your thoughts or ask a question..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  />
                  <Button onClick={handleComment} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {comments.map((c: any) => (
                  <motion.div key={c.id} className="glass-card p-4">
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
                ))}
                {idea.comments_count === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-10 glass-card">
                    No comments yet. Start the conversation!
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Team & Admin */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-startup" /> Team
                </h2>
                <div className="space-y-3">
                  {/* Default Owner */}
                  <div className="glass-card p-3 flex items-center gap-3 border-l-2 border-startup">
                    <div className="w-10 h-10 rounded-full bg-startup/10 flex items-center justify-center text-startup font-bold">
                      {idea.authorAvatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{idea.author}</p>
                      <p className="text-[10px] uppercase tracking-wider text-startup font-bold">
                        Founder
                      </p>
                    </div>
                  </div>

                  {/* Other Members */}
                  {idea.members.map((m: any, i: number) => (
                    <div
                      key={i}
                      className="glass-card p-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium">
                        {m.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Join Requests - Only visible if there are requests */}
              {idea.joinRequests.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-display font-semibold mb-4">
                    Pending Requests
                  </h3>
                  <div className="space-y-3">
                    {idea.joinRequests.map((r: any) => (
                      <div
                        key={r.id}
                        className="glass-card p-3 border-amber-500/20"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                            {r.avatar}
                          </div>
                          <p className="text-sm font-medium">{r.user}</p>
                          <Badge className="ml-auto text-[10px] h-5">
                            {r.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 italic">
                          "{r.message}"
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-3 h-3 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1 border-red-500/50 text-red-500"
                          >
                            <X className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IdeaDetail;
