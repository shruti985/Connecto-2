import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ideaStore } from "@/stores/ideaStore";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const categoryOptions = [
  "EdTech",
  "AI/ML",
  "SaaS",
  "CleanTech",
  "FinTech",
  "HealthTech",
];
const stageOptions = ["Idea", "MVP", "Prototype", "Launched"];
const PostIdea = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [skills, setSkills] = useState("");
  const [category, setCategory] = useState("");
  const [stage, setStage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const handleSubmit = async () => {
    // 1. Validation
    if (
      !title.trim() ||
      !problem.trim() ||
      !solution.trim() ||
      !category ||
      !stage
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const currentUser = localStorage.getItem("username") || "Anonymous";

      const ideaData = {
        title,
        problem,
        solution,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        category,
        stage,
        author: currentUser,
      };

      // 2. Backend API Call (URL check kar lena apne hisab se)
      const response = await axios.post(
        "https://connecto-2.onrender.com/api/startup/post-idea",
        ideaData,
        { headers: { Authorization: token } },
      );

      if (response.status === 201) {
        toast({
          title: "Idea Published! 🎉",
          description: "Your startup idea is now live.",
        });
        navigate("/startup/ideas"); // Success ke baad redirect
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error posting idea:", error);
      toast({
        title: "Submission Failed",
        description:
          error.response?.data?.message ||
          "Something went wrong. Check backend.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/startup/ideas"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Ideas
          </Link>

          <motion.div
            className="glass-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">
                  Post Your Idea
                </h1>
                <p className="text-sm text-muted-foreground">
                  Share your startup idea with the community
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Idea Title *
                </label>
                <Input
                  placeholder="e.g. AI-Powered Campus Navigator"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Problem Statement *
                </label>
                <Textarea
                  placeholder="What problem does this solve?"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Proposed Solution *
                </label>
                <Textarea
                  placeholder="How will you solve it?"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Required Skills
                </label>
                <Input
                  placeholder="React, Python, UI/UX (comma separated)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Category *
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((c) => (
                    <Badge
                      key={c}
                      variant={category === c ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Stage *
                </label>
                <div className="flex flex-wrap gap-2">
                  {stageOptions.map((s) => (
                    <Badge
                      key={s}
                      variant={stage === s ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStage(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full btn-glow"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Publishing..."
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Publish Idea
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostIdea;
