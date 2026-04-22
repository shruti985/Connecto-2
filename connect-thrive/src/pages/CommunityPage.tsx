/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { socket } from "@/socket";
import HackathonTab from "../components/hackathon/Hackathontab";
import TravelResources from "@/pages/TravelResources"; // ✅ From File 1
import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react";
import {
  Send,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Users,
  MapPin,
  BookOpen,
  Coffee,
  Utensils,
  Mountain,
  Target,
  Lightbulb,
  Dumbbell,
  Brain,
  Plus,
  Plane,
  Code,
  Rocket,
} from "lucide-react";

// --- Types ---
interface Post {
  id: number;
  username: string;
  avatar_url?: string;
  content: string;
  image_url?: string;
  likes: number;
  created_at: string;
  user_id: number;
}

interface Community {
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  color: string;
  members: number;
  resources: {
    title: string;
    icon: React.ElementType;
    description: string;
    link?: string;
  }[];
}

// --- Community Configuration ---
const communityData: Record<string, Community> = {
  travel: {
    name: "Travel & Explore",
    description:
      "Discover nearby campus places, cafes, weekend getaways, and find travel buddies.",
    icon: Plane,
    gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
    color: "text-travel",
    members: 234,
    resources: [
      {
        title: "Nearby Cafes",
        icon: Coffee,
        description: "Best cafes near campus for study sessions",
      },
      {
        title: "Weekend Getaways",
        icon: Mountain,
        description: "Popular spots within 100km",
      },
      {
        title: "Food Spots",
        icon: Utensils,
        description: "Must-try restaurants and street food",
      },
      {
        title: "Campus Places",
        icon: MapPin,
        description: "Hidden gems around campus",
      },
    ],
  },

  dsa: {
    name: "DSA & Coding",
    description:
      "Master Data Structures & Algorithms together. Share resources and crack placements!",
    icon: Code,
    gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
    color: "text-dsa",
    members: 456,
    resources: [
      {
        title: "LeetCode Roadmap",
        icon: Target,
        description: "Curated problem sets by topic",
      },
      {
        title: "Interview Prep",
        icon: BookOpen,
        description: "Company-wise question banks",
      },
      {
        title: "Study Resources",
        icon: BookOpen,
        description: "Best tutorials and courses",
      },
      {
        title: "Contest Calendar",
        icon: Target,
        description: "Upcoming coding competitions",
      },
    ],
  },

  "mental-wellness": {
    name: "Mental Wellness",
    description:
      "Your safe space for mental health. Join meditation sessions and support each other.",
    icon: Brain,
    gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
    color: "text-wellness",
    members: 189,
    resources: [
      {
        title: "Guided Meditation",
        icon: Brain,
        description: "Daily meditation sessions",
      },
      {
        title: "Wellness Articles",
        icon: BookOpen,
        description: "Mental health resources",
      },
      {
        title: "Support Circle",
        icon: Users,
        description: "Peer support groups",
      },
      {
        title: "Self-Care Tips",
        icon: Heart,
        description: "Daily wellness practices",
      },
    ],
  },

  startup: {
    name: "Startup Hub",
    description:
      "Connect with aspiring entrepreneurs, share ideas, and find co-founders.",
    icon: Rocket,
    gradient: "bg-gradient-to-br from-orange-500 to-amber-600",
    color: "text-startup",
    members: 312,
    resources: [
      {
        title: "Idea Hub",
        icon: Lightbulb,
        description: "Post ideas, find collaborators & get feedback",
        link: "/startup/ideas",
      },
      {
        title: "Mentor Connect",
        icon: Users,
        description: "Book sessions with alumni mentors",
        link: "/startup/mentors",
      },
      {
        title: "Funding & Opportunities",
        icon: Target,
        description: "Grants, competitions & incubation programs",
        link: "/startup/funding",
      },
      {
        title: "Post Your Idea",
        icon: BookOpen,
        description: "Share your startup idea with the community",
        link: "/startup/post-idea",
      },
    ],
  },

  gym: {
    name: "Fitness & Gym",
    description:
      "Find gym buddies, share routines, and stay motivated on your fitness journey!",
    icon: Dumbbell,
    gradient: "bg-gradient-to-br from-red-500 to-rose-600",
    color: "text-gym",
    members: 278,
    resources: [
      {
        title: "Workout Plans",
        icon: Dumbbell,
        description: "Beginner to advanced routines",
      },
      {
        title: "Nutrition Guide",
        icon: Utensils,
        description: "Meal plans and diet tips",
      },
      {
        title: "Gym Buddies",
        icon: Users,
        description: "Find workout partners",
      },
      {
        title: "Progress Tracker",
        icon: Target,
        description: "Track your fitness goals",
      },
    ],
  },
};

const CommunityPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const idToSlug: Record<string, string> = {
    "1": "travel",
    "2": "dsa",
    "3": "mental-wellness",
    "4": "startup",
    "5": "gym",
  };

  const slug = idToSlug[id || "1"];
  const community = communityData[slug];
  const Icon = community.icon;

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCommentBox, setActiveCommentBox] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Join State
  const [isJoined, setIsJoined] = useState(false);
  const [membersCount, setMembersCount] = useState(0);

  // Chat State
  const [chatMessages, setChatMessages] = useState<
    {
      is_read: unknown;
      created_at: string | number | Date;
      sender_name: string;
      message_text: string;
    }[]
  >([]);
  const currentUser = localStorage.getItem("username") || "Anonymous";

  interface Comment {
    username: string;
    content: string;
    created_at: string;
  }
  const [comments, setComments] = useState<Record<number, Comment[]>>({});

  // --- Join / Members ---

  const fetchJoinStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://connecto-2.onrender.com/api/communities/my-communities",
        { headers: { Authorization: token } },
      );
      const joinedIds = res.data?.communities || [];
      setIsJoined(joinedIds.includes(Number(id)));
    } catch (err) {
      console.error("Join Status Error:", err);
    }
  };

  const fetchMembersCount = async () => {
    try {
      const res = await axios.get(
        `https://connecto-2.onrender.com/api/communities/${id}/members-count`,
      );
      setMembersCount(res.data.membersCount);
    } catch (err) {
      console.error("Members count error:", err);
    }
  };

  const handleToggleJoin = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!id) return;

      if (isJoined) {
        await axios.delete(
          `https://connecto-2.onrender.com/api/communities/${id}/leave`,
          { headers: { Authorization: token } },
        );
        setIsJoined(false);
        setMembersCount((prev) => prev - 1);
        toast({ title: "Left Community" });
      } else {
        await axios.post(
          `https://connecto-2.onrender.com/api/communities/${id}/join`,
          {},
          { headers: { Authorization: token } },
        );
        setIsJoined(true);
        setMembersCount((prev) => prev + 1);
        toast({ title: "Joined Community 🎉" });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  // --- Posts ---

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `https://connecto-2.onrender.com/api/posts/${slug}`,
        { headers: { Authorization: token } },
      );
      setPosts(response.data);
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load posts.",
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://connecto-2.onrender.com/api/posts/create",
        { community_id: slug, content: newPost },
        { headers: { Authorization: token } },
      );
      toast({ title: "Success!", description: "Post shared with community." });
      setNewPost("");
      fetchPosts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Post Failed",
        description: "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://connecto-2.onrender.com/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: token } },
      );
      fetchPosts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not like the post.",
      });
    }
  };

  const handleFetchComments = async (postId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://connecto-2.onrender.com/api/posts/${postId}/comments`,
        { headers: { Authorization: token } },
      );
      setComments((prev) => ({ ...prev, [postId]: res.data }));
      setActiveCommentBox(postId);
    } catch (err) {
      console.error("Failed to fetch comments");
    }
  };

  const handlePostComment = async (postId: number) => {
    if (!commentText.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://connecto-2.onrender.com/api/posts/${postId}/comments`,
        { content: commentText },
        { headers: { Authorization: token } },
      );
      setCommentText("");
      handleFetchComments(postId);
      toast({ title: "Comment added!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to comment" });
    }
  };

  const toggleComments = (postId: number) => {
    if (activeCommentBox === postId) {
      setActiveCommentBox(null);
    } else {
      handleFetchComments(postId);
    }
  };

  // --- Chat ---

  const markAsRead = () => {
    if (slug && currentUser) {
      socket.emit("mark_messages_read", {
        communityId: slug,
        userId: currentUser,
      });
    }
  };

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (isFirstLoad.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto", block: "end" });
      isFirstLoad.current = false;
    } else {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!socket) return;
    socket.on("messages_marked_read", () => {
      setChatMessages((prev) => prev.map((msg) => ({ ...msg, is_read: 1 })));
    });
    return () => {
      socket.off("messages_marked_read");
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    socket.emit("join_community", slug);
    socket.off("receive_message");
    socket.on("receive_message", (data) => {
      setChatMessages((prev) => [...prev, data]);
    });
    return () => {
      socket.off("receive_message");
    };
  }, [slug]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(
          `https://connecto-2.onrender.com/api/messages/${slug}`,
          { headers: { Authorization: token } },
        );
        setChatMessages(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    if (slug) loadMessages();
  }, [slug]);

  // --- Initial Data Load ---

  useEffect(() => {
    fetchPosts();
    fetchJoinStatus();
    fetchMembersCount();
  }, [id]);

  // --- Chat Input Component ---

  const ChatInput = ({ onSend }: { onSend: (msg: string) => void }) => {
    const [text, setText] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const emojiRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
      if (text.trim()) {
        onSend(text);
        setText("");
      }
    };

    const onEmojiClick = (emojiData: any) => {
      setText((prev) => prev + emojiData.emoji);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          emojiRef.current &&
          !emojiRef.current.contains(event.target as Node)
        ) {
          setShowEmoji(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="p-4 bg-background/50 border-t border-white/10 flex gap-2 relative">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          <Smile className="w-5 h-5" />
        </Button>

        {showEmoji && (
          <div ref={emojiRef} className="absolute bottom-16 left-2 z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        <Input
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="bg-black/20"
        />

        <Button onClick={handleSend} className="btn-glow">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* --- Header Section --- */}
          <motion.div
            className="glass-card p-8 mb-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <motion.div
                className={`w-20 h-20 rounded-2xl ${community.gradient} flex items-center justify-center`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-display font-bold mb-2">
                  {community.name}
                </h1>
                <p className="text-muted-foreground mb-4">
                  {community.description}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {membersCount} members
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Active
                    now
                  </span>
                </div>
              </div>
              <Button onClick={handleToggleJoin} className="btn-glow">
                {isJoined ? "Leave Community" : "Join Community"}
              </Button>
            </div>
          </motion.div>

          {/* --- Tabs --- */}
          <Tabs
            defaultValue="posts"
            className="space-y-6"
            onValueChange={(value) => {
              if (value === "chat") markAsRead();
            }}
          >
            <TabsList className="glass-card p-1">
              <TabsTrigger value="posts">
                <ImageIcon className="w-4 h-4 mr-2" /> Posts
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </TabsTrigger>
              <TabsTrigger value="resources">
                <BookOpen className="w-4 h-4 mr-2" /> Resources
              </TabsTrigger>
              {slug === "dsa" && (
                <TabsTrigger value="hackathon">
                  <Rocket className="w-4 h-4 mr-2" /> Hackathon Team
                </TabsTrigger>
              )}
            </TabsList>

            {/* --- Posts Tab --- */}
            <TabsContent value="posts">
              <div className="space-y-6">
                <motion.div className="glass-card p-6">
                  <Textarea
                    placeholder={`What's happening in ${community.name}?`}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="mb-4"
                  />
                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={isLoading}
                      className="btn-glow"
                    >
                      {isLoading ? (
                        "Posting..."
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" /> Post
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {post.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{post.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-foreground/90">{post.content}</p>

                      <div className="flex gap-4 mt-4 pt-4 border-t border-border/40">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 ${post.likes > 0 ? "fill-red-500 text-red-500" : ""}`}
                          />
                          {post.likes}
                        </button>

                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {comments[post.id]?.length || 0} Comments
                        </button>

                        <AnimatePresence>
                          {activeCommentBox === post.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-4 pt-4 border-t border-border/20 overflow-hidden"
                            >
                              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                                {comments[post.id]?.map((c, i) => (
                                  <div
                                    key={i}
                                    className="bg-muted/30 p-2 rounded-lg text-sm"
                                  >
                                    <span className="font-bold text-primary mr-2">
                                      {c.username}:
                                    </span>
                                    <span className="text-foreground/80">
                                      {c.content}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Write a comment..."
                                  value={commentText}
                                  onChange={(e) =>
                                    setCommentText(e.target.value)
                                  }
                                  className="h-8 text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handlePostComment(post.id)}
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* --- Resources Tab --- */}
            {/* ✅ Travel community gets live TravelResources, others get static cards */}
            <TabsContent value="resources">
              {slug === "travel" ? (
                <TravelResources />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {community.resources.map((resource, index: number) => {
                    const ResIcon = resource.icon;

                    const CardContent = (
                      <motion.div
                        className="glass-card p-6 h-full hover:border-primary/50 cursor-pointer border border-white/10"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg ${community.gradient} flex items-center justify-center mb-4`}
                        >
                          <ResIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-display font-semibold mb-2">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </motion.div>
                    );

                    return resource.link ? (
                      <button
                        key={index}
                        onClick={() => navigate(resource.link!)}
                        className="text-left w-full h-full"
                      >
                        {CardContent}
                      </button>
                    ) : (
                      <div key={index}>{CardContent}</div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* --- Chat Tab --- */}
            <TabsContent value="chat">
              <div className="glass-card flex flex-col h-[550px] overflow-hidden border-primary/20">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/10">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground mt-20 opacity-50">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => {
                      const isMe = msg.sender_name === currentUser;
                      const timeStr = msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";

                      return (
                        <motion.div
                          key={`msg-${index}`}
                          initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[10px] text-muted-foreground mb-1 px-1">
                            {isMe ? "You" : msg.sender_name}
                          </span>
                          <div
                            className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm relative min-w-[90px] ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted text-foreground rounded-tl-none"
                            }`}
                          >
                            <p className="pr-14 break-words">
                              {msg.message_text}
                            </p>
                            <div
                              className={`absolute bottom-1 right-2 flex items-center gap-1 opacity-70 text-[9px] ${
                                isMe
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <span>{timeStr}</span>
                              {isMe && (
                                <span className="text-[11px] leading-none">
                                  {msg.is_read ? (
                                    <span className="text-blue-400 font-bold">
                                      ✓✓
                                    </span>
                                  ) : (
                                    <span>✓</span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={scrollRef} />
                </div>

                <ChatInput
                  onSend={(msg) => {
                    const mysqlDate = new Date()
                      .toISOString()
                      .slice(0, 19)
                      .replace("T", " ");

                    const msgData = {
                      communityId: slug,
                      sender_name: currentUser,
                      message_text: msg,
                      created_at: mysqlDate,
                      is_read: 0,
                    };

                    socket.emit("send_message", msgData);
                  }}
                />
              </div>
            </TabsContent>

            {/* --- Hackathon Tab (DSA only) --- */}
            {slug === "dsa" && (
              <TabsContent value="hackathon">
                <HackathonTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityPage;
