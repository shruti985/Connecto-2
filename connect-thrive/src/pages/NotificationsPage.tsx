/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCheck,
  Rocket,
  UserPlus,
  Handshake,
  MessageSquare,
  FileText,
  ArrowRight,
  Loader2,
  InboxIcon,
  X,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import axios from "axios";
import { useConnectionStore, type Buddy } from "@/stores/connectionStore";
import { useToast } from "@/hooks/use-toast";

const API = "https://connecto-2.onrender.com";
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface AppNotif {
  id: number;
  type: string;
  message: string;
  is_read: number;
  created_at: string;
  idea_id: number | null;
  request_id: number | null;
  sender_name: string | null;
}

// ─── Type config ──────────────────────────────────────────────────────────────
const typeConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bg: string; border: string }
> = {
  join_request: {
    icon: <Rocket className="w-4 h-4" />,
    label: "Join Request",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-l-amber-400/60",
  },
  request_accepted: {
    icon: <Handshake className="w-4 h-4" />,
    label: "Request Accepted",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-l-green-400/60",
  },
  request_rejected: {
    icon: <X className="w-4 h-4" />,
    label: "Request Declined",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-l-red-400/60",
  },
  connection_request: {
    icon: <UserPlus className="w-4 h-4" />,
    label: "Connection Request",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-l-blue-400/60",
  },
  connection_accepted: {
    icon: <Handshake className="w-4 h-4" />,
    label: "Connection Accepted",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-l-primary/60",
  },
  new_post: {
    icon: <FileText className="w-4 h-4" />,
    label: "New Post",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-l-purple-400/60",
  },
  new_comment: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: "New Comment",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-l-sky-400/60",
  },
};

const fallbackConfig = {
  icon: <Bell className="w-4 h-4" />,
  label: "Notification",
  color: "text-muted-foreground",
  bg: "bg-muted/40",
  border: "border-l-border/40",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Connection Request Card ──────────────────────────────────────────────────
// Uses respondToRequest(buddyId, action) — exactly what the store exposes
const ConnectionCard = ({
  buddy,
  onAction,
}: {
  buddy: Buddy;
  onAction: () => void;
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { respondToRequest } = useConnectionStore();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  const handle = async (type: "accept" | "reject") => {
    setLoading(type);
    const action = type === "accept" ? "accepted" : "rejected";
    // respondToRequest takes (buddyId: number, action) — store handles the API call
    const success = await respondToRequest(buddy.id, action);
    setLoading(null);
    if (success) {
      toast({
        title: type === "accept" ? "Connected! 🎉" : "Request removed",
        description:
          type === "accept"
            ? `You are now connected with ${buddy.name}`
            : `Request from ${buddy.name} removed`,
      });
      onAction(); // re-fetch connections to update the list
    } else {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again.",
      });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card p-5 border-l-2 border-l-blue-400/60 hover:border-l-blue-400 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base font-bold text-primary-foreground">
            {buddy.avatar || buddy.name?.[0] || "?"}
          </div>
          {buddy.online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="font-semibold text-sm">{buddy.name}</p>
            <Badge
              variant="outline"
              className="text-[10px] h-4 text-blue-400 border-blue-400/30"
            >
              Connection Request
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {buddy.course} · {buddy.year}
          </p>
          {buddy.hometown && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {buddy.hometown}
            </p>
          )}
          {buddy.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {buddy.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            size="sm"
            className="h-8 text-xs btn-glow"
            onClick={() => handle("accept")}
            disabled={!!loading}
          >
            {loading === "accept" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Accept
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => handle("reject")}
            disabled={!!loading}
          >
            {loading === "reject" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <X className="w-3 h-3 mr-1" />
                Decline
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Footer link */}
      <button
        onClick={() => navigate("/connection-requests")}
        className="mt-3 pt-3 border-t border-border/30 w-full text-left text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
      >
        View all connection requests
        <ArrowRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

// ─── App Notification Card ────────────────────────────────────────────────────
const NotifCard = ({
  notif,
  onMarkRead,
}: {
  notif: AppNotif;
  onMarkRead: (id: number) => void;
}) => {
  const navigate = useNavigate();
  const cfg = typeConfig[notif.type] ?? fallbackConfig;
  const isUnread = !notif.is_read;

  const isClickable = !!(
    notif.idea_id ||
    notif.type === "connection_request" ||
    notif.type === "connection_accepted"
  );

  const handleClick = () => {
    if (!isClickable) return;
    if (isUnread) onMarkRead(notif.id);
    if (notif.idea_id) {
      navigate(`/startup/idea/${notif.idea_id}`);
    } else {
      navigate("/connection-requests");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={handleClick}
      className={`glass-card p-4 border-l-2 transition-all ${cfg.border} ${
        isUnread ? "bg-primary/[0.02]" : ""
      } ${isClickable ? "cursor-pointer hover:scale-[1.005]" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.color} flex-shrink-0 mt-0.5`}>
          {cfg.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge
              variant="outline"
              className={`text-[10px] h-4 px-1.5 ${cfg.color} border-current/25 flex-shrink-0`}
            >
              {cfg.label}
            </Badge>
            {isUnread && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p
            className={`text-sm leading-snug ${
              isUnread ? "text-foreground font-medium" : "text-muted-foreground"
            }`}
          >
            {notif.message}
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            {timeAgo(notif.created_at)}
          </p>
        </div>

        {isClickable && (
          <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-1" />
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const navigate = useNavigate();

  // getIncomingRequests() → number[] (list of buddy IDs who sent requests)
  const { buddies, fetchBuddies, fetchConnections, getIncomingRequests } =
    useConnectionStore();

  const [appNotifs, setAppNotifs] = useState<AppNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Map buddy IDs → full Buddy objects for the ConnectionCard
  const incomingIds = getIncomingRequests(); // number[]
  const connectionBuddies: Buddy[] = buddies.filter((b) =>
    incomingIds.includes(b.id)
  );

  // ── fetch ───────────────────────────────────────────────────────────────
  const fetchAppNotifs = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/notifications`, {
        headers: authHeader(),
      });
      setAppNotifs(res.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchAppNotifs();
    fetchBuddies();
    fetchConnections();
  }, [fetchAppNotifs, fetchBuddies, fetchConnections, navigate]);

  // ── mark single read ────────────────────────────────────────────────────
  const markRead = useCallback(async (id: number) => {
    try {
      await axios.patch(
        `${API}/api/notifications/${id}/read`,
        {},
        { headers: authHeader() }
      );
      setAppNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch {
      /* silent */
    }
  }, []);

  // ── mark all read ───────────────────────────────────────────────────────
  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await axios.patch(`${API}/api/notifications/read-all`, {}, {
        headers: authHeader(),
      });
      setAppNotifs((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } finally {
      setMarkingAll(false);
    }
  };

  // ── derived ─────────────────────────────────────────────────────────────
  const unreadCount = appNotifs.filter((n) => !n.is_read).length;
  const totalCount = connectionBuddies.length + appNotifs.length;
  const displayedNotifs =
    activeTab === "unread" ? appNotifs.filter((n) => !n.is_read) : appNotifs;
  const isEmpty =
    activeTab === "all"
      ? totalCount === 0
      : unreadCount === 0 && connectionBuddies.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold">
                    Notifications
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {totalCount === 0
                      ? "You're all caught up"
                      : `${totalCount} notification${totalCount !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllRead}
                  disabled={markingAll}
                  className="text-xs gap-1.5"
                >
                  {markingAll ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3 h-3" />
                  )}
                  Mark all read
                </Button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-5 p-1 bg-muted/40 rounded-lg w-fit">
              {(["all", "unread"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                  {tab === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-[9px] text-primary-foreground font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Loading ──────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* ── Connection Requests — only in "all" tab ──────────────── */}
              {connectionBuddies.length > 0 && activeTab === "all" && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      Connection Requests
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-400/20 text-blue-400 text-[9px] font-bold">
                        {connectionBuddies.length}
                      </span>
                    </h2>
                    <button
                      onClick={() => navigate("/connection-requests")}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View all <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                      {connectionBuddies.slice(0, 3).map((buddy) => (
                        <ConnectionCard
                          key={buddy.id}
                          buddy={buddy}
                          onAction={fetchConnections}
                        />
                      ))}
                    </div>
                  </AnimatePresence>

                  {connectionBuddies.length > 3 && (
                    <button
                      onClick={() => navigate("/connection-requests")}
                      className="mt-3 w-full py-2.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-lg transition-colors"
                    >
                      +{connectionBuddies.length - 3} more — View all requests
                    </button>
                  )}
                </section>
              )}

              {/* ── App Notifications ─────────────────────────────────────── */}
              {displayedNotifs.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    {activeTab === "unread" ? "Unread" : "Recent Activity"}
                  </h2>
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                      {displayedNotifs.map((n) => (
                        <NotifCard key={n.id} notif={n} onMarkRead={markRead} />
                      ))}
                    </div>
                  </AnimatePresence>
                </section>
              )}

              {/* ── Empty State ───────────────────────────────────────────── */}
              {isEmpty && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 gap-4 text-center"
                >
                  <div className="p-5 rounded-2xl bg-muted/30">
                    <InboxIcon className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      {activeTab === "unread"
                        ? "No unread notifications"
                        : "No notifications yet"}
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      {activeTab === "unread"
                        ? "You're all caught up! 🎉"
                        : "Activity will show up here"}
                    </p>
                  </div>
                </motion.div>
              )}

            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;