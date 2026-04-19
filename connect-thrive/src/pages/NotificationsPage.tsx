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
  Heart,
  FileText,
  ArrowRight,
  Loader2,
  InboxIcon,
} from "lucide-react";
import axios from "axios";
import { useConnectionStore } from "@/stores/connectionStore";

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

interface ConnectionRequest {
  id: number;
  sender_id: number;
  sender_name: string;
  created_at?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  join_request: {
    icon: <Rocket className="w-4 h-4" />,
    label: "Join Request",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  request_accepted: {
    icon: <Handshake className="w-4 h-4" />,
    label: "Request Accepted",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  request_rejected: {
    icon: <Rocket className="w-4 h-4" />,
    label: "Request Declined",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  connection_request: {
    icon: <UserPlus className="w-4 h-4" />,
    label: "Connection Request",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  connection_accepted: {
    icon: <Handshake className="w-4 h-4" />,
    label: "Connection Accepted",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  new_post: {
    icon: <FileText className="w-4 h-4" />,
    label: "New Post",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  new_comment: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: "New Comment",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
};

const fallbackConfig = {
  icon: <Bell className="w-4 h-4" />,
  label: "Notification",
  color: "text-muted-foreground",
  bg: "bg-muted/40",
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
const ConnectionCard = ({
  req,
  onAction,
}: {
  req: ConnectionRequest;
  onAction: () => void;
}) => {
  const navigate = useNavigate();
  const { acceptConnection, rejectConnection } = useConnectionStore();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const cfg = typeConfig["connection_request"];

  const handle = async (type: "accept" | "reject") => {
    setLoading(type);
    try {
      if (type === "accept") await acceptConnection(req.id);
      else await rejectConnection(req.id);
      onAction();
    } finally {
      setLoading(null);
    }
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card p-4 border-l-2 border-blue-400/60"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.color} flex-shrink-0`}>
          {cfg.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <Badge
              variant="outline"
              className={`text-[10px] h-5 ${cfg.color} border-current/30`}
            >
              {cfg.label}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground">
            <span className="text-primary">{req.sender_name}</span> sent you a
            connection request
          </p>
          {req.created_at && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeAgo(req.created_at)}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="h-7 text-xs bg-primary hover:bg-primary/90"
              onClick={() => handle("accept")}
              disabled={!!loading}
            >
              {loading === "accept" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Accept"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-border/60"
              onClick={() => handle("reject")}
              disabled={!!loading}
            >
              {loading === "reject" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Decline"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground ml-auto"
              onClick={() => navigate("/connection-requests")}
            >
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
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

  const handleClick = () => {
    if (isUnread) onMarkRead(notif.id);
    if (notif.idea_id) navigate(`/startup/idea/${notif.idea_id}`);
    else if (
      notif.type === "connection_request" ||
      notif.type === "connection_accepted"
    )
      navigate("/connection-requests");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={handleClick}
      className={`glass-card p-4 cursor-pointer transition-all hover:scale-[1.01] border-l-2 ${
        isUnread ? "border-primary/70" : "border-border/30"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.color} flex-shrink-0`}>
          {cfg.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <Badge
              variant="outline"
              className={`text-[10px] h-5 ${cfg.color} border-current/30`}
            >
              {cfg.label}
            </Badge>
            {isUnread && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            )}
          </div>
          <p
            className={`text-sm leading-snug ${
              isUnread ? "text-foreground font-medium" : "text-muted-foreground"
            }`}
          >
            {notif.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {timeAgo(notif.created_at)}
          </p>
        </div>

        {/* Arrow hint if clickable */}
        {(notif.idea_id || notif.type.includes("connection")) && (
          <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-1" />
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const navigate = useNavigate();
  const { getIncomingRequests, fetchConnections } = useConnectionStore();

  const [appNotifs, setAppNotifs] = useState<AppNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const connectionRequests = getIncomingRequests();

  // ── fetch ───────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
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
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAll();
    fetchConnections();
  }, [fetchAll, fetchConnections, navigate]);

  // ── mark single read ────────────────────────────────────────────────────
  const markRead = useCallback(async (id: number) => {
    try {
      await axios.patch(
        `${API}/api/notifications/${id}/read`,
        {},
        { headers: authHeader() },
      );
      setAppNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
      );
    } catch {
      /* silent */
    }
  }, []);

  // ── mark all read ───────────────────────────────────────────────────────
  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await axios.patch(
        `${API}/api/notifications/read-all`,
        {},
        { headers: authHeader() },
      );
      setAppNotifs((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } finally {
      setMarkingAll(false);
    }
  };

  // ── filter ──────────────────────────────────────────────────────────────
  const displayed =
    activeTab === "unread" ? appNotifs.filter((n) => !n.is_read) : appNotifs;

  const unreadCount = appNotifs.filter((n) => !n.is_read).length;
  const totalCount = connectionRequests.length + appNotifs.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* ── Header ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
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
              <p className="text-sm text-muted-foreground">
                Loading notifications...
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ── Connection Requests Section ────────────────────────── */}
              {connectionRequests.length > 0 && activeTab === "all" && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Connection Requests
                      <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-400/20 text-blue-400 text-[9px] font-bold">
                        {connectionRequests.length}
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
                      {connectionRequests.slice(0, 3).map((req: any) => (
                        <ConnectionCard
                          key={req.id}
                          req={req}
                          onAction={fetchConnections}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                  {connectionRequests.length > 3 && (
                    <button
                      onClick={() => navigate("/connection-requests")}
                      className="mt-3 w-full py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-lg transition-colors"
                    >
                      +{connectionRequests.length - 3} more connection request
                      {connectionRequests.length - 3 !== 1 ? "s" : ""}
                    </button>
                  )}
                </section>
              )}

              {/* ── App Notifications Section ──────────────────────────── */}
              {displayed.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    {activeTab === "unread" ? "Unread" : "Recent Activity"}
                  </h2>
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                      {displayed.map((n) => (
                        <NotifCard key={n.id} notif={n} onMarkRead={markRead} />
                      ))}
                    </div>
                  </AnimatePresence>
                </section>
              )}

              {/* ── Empty state ────────────────────────────────────────── */}
              {totalCount === 0 ||
              (activeTab === "unread" &&
                unreadCount === 0 &&
                connectionRequests.length === 0) ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 gap-4 text-center"
                >
                  <div className="p-5 rounded-2xl bg-muted/30">
                    <InboxIcon className="w-10 h-10 text-muted-foreground/40" />
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
              ) : null}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;
