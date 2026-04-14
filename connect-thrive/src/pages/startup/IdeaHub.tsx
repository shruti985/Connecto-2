/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { useState, useEffect } from "react"; // 1. useEffect add kiya
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Heart,
  MessageCircle,
  Users,
  Lightbulb,
  Filter,
  ArrowRight,
  Rocket,
} from "lucide-react";
import axios from "axios"; // 2. Axios import kiya

const categories = [
  "All",
  "EdTech",
  "AI/ML",
  "SaaS",
  "CleanTech",
  "FinTech",
  "HealthTech",
];
const stages = ["All", "Idea", "MVP", "Prototype", "Launched"];

const IdeaHub = () => {
  const [ideas, setIdeas] = useState([]); // Real ideas state
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stage, setStage] = useState("All");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  // 3. Backend se data fetch karne ka function
  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://connecto-2.onrender.com/api/startup/ideas",
      );

      // Backend se jo skills string (JSON) aayegi use parse karna padega
      const parsedIdeas = response.data.map((idea: any) => ({
        ...idea,
        skills:
          typeof idea.skills === "string"
            ? JSON.parse(idea.skills)
            : idea.skills,
        authorAvatar: idea.author ? idea.author[0].toUpperCase() : "U", // Avatar logic
        likes: idea.likes || 0,
        comments: idea.comments || [],
        members: idea.members || [],
      }));

      setIdeas(parsedIdeas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  // Filter logic same rahegi
  const filtered = ideas
    .filter((i: any) => {
      if (
        search &&
        !i.title.toLowerCase().includes(search.toLowerCase()) &&
        !i.skills.some((s: string) =>
          s.toLowerCase().includes(search.toLowerCase()),
        )
      )
        return false;
      if (category !== "All" && i.category !== category) return false;
      if (stage !== "All" && i.stage !== stage) return false;
      return true;
    })
    .sort((a: any, b: any) => (sortBy === "popular" ? b.likes - a.likes : 0));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header Section (Same as your code) */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-startup/10 text-startup mb-4">
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm font-medium">Startup Idea Hub</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-3">
              Share & Discover Ideas
            </h1>
            <div className="flex justify-center gap-3 mt-6">
              <Link to="/startup/post-idea">
                <Button className="btn-glow">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Post Your Idea
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Filters Section (Same as your code) */}
          {/* ... (Search bar, Categories, Stages badges) ... */}

          {/* Ideas Grid */}
          {loading ? (
            <div className="text-center py-20">
              Loading ideas from database...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((idea: any, index: number) => (
                <motion.div
                  key={idea.id}
                  className="glass-card p-6 hover:border-startup/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-medium">
                        {idea.authorAvatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{idea.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(idea.created_at).toLocaleDateString()}{" "}
                          {/* MySQL timestamp format */}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {idea.stage}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-display font-semibold mb-2">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {idea.problem}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {idea.skills.map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                    <Badge className="bg-startup/20 text-startup border-0 text-xs">
                      {idea.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      {/* Like/Comment placeholder - Backend functionality needed for these */}
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        {idea.likes}
                      </button>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />
                        {idea.comments_count || 0}
                      </span>
                    </div>
                    <Link to={`/startup/idea/${idea.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-startup hover:text-startup"
                      >
                        View <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No ideas found. Be the first to post one!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IdeaHub;
