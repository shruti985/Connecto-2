import { motion } from "framer-motion";
import { useState } from "react";
import {
  Code,
  BookOpen,
  ExternalLink,
  Trophy,
  Star,
  Zap,
  GitBranch,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart2,
  Youtube,
  Globe,
} from "lucide-react";

// --- Types ---
interface DSATopic {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problems: number;
  subtopics: string[];
  gradient: string;
}

interface CodingResource {
  title: string;
  type: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  link?: string;
  tag?: string;
  tagColor?: string;
}

interface ChecklistItem {
  topic: string;
  done: boolean;
}

// --- Data ---
const dsaTopics: DSATopic[] = [
  {
    name: "Arrays & Strings",
    difficulty: "Easy",
    problems: 45,
    subtopics: ["Two Pointers", "Sliding Window", "Prefix Sum", "Sorting"],
    gradient: "from-green-500 to-emerald-600",
  },
  {
    name: "Linked Lists",
    difficulty: "Easy",
    problems: 25,
    subtopics: ["Reversal", "Cycle Detection", "Merge", "Fast & Slow Pointer"],
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    name: "Trees & Graphs",
    difficulty: "Medium",
    problems: 60,
    subtopics: ["BFS", "DFS", "Binary Search Tree", "Trie", "Dijkstra"],
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    name: "Dynamic Programming",
    difficulty: "Hard",
    problems: 50,
    subtopics: ["Memoization", "Tabulation", "Knapsack", "LCS", "DP on Trees"],
    gradient: "from-red-500 to-rose-600",
  },
  {
    name: "Recursion & Backtracking",
    difficulty: "Medium",
    problems: 30,
    subtopics: ["N-Queens", "Subsets", "Permutations", "Maze Problems"],
    gradient: "from-orange-500 to-amber-600",
  },
  {
    name: "Heap / Priority Queue",
    difficulty: "Medium",
    problems: 20,
    subtopics: ["Min Heap", "Max Heap", "Top K Elements", "Median Stream"],
    gradient: "from-pink-500 to-fuchsia-600",
  },
];

const codingResources: CodingResource[] = [
  {
    title: "LeetCode",
    type: "Practice Platform",
    description: "Industry standard for interview prep. Focus on Top 150 problems.",
    icon: Code,
    gradient: "from-yellow-500 to-orange-500",
    link: "https://leetcode.com",
    tag: "Must Do",
    tagColor: "bg-yellow-500/20 text-yellow-400",
  },
  {
    title: "Striver's SDE Sheet",
    type: "Study Plan",
    description: "180 handpicked problems — the gold standard for placement prep in India.",
    icon: Star,
    gradient: "from-purple-500 to-pink-600",
    link: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems",
    tag: "India Favorite",
    tagColor: "bg-purple-500/20 text-purple-400",
  },
  {
    title: "NeetCode.io",
    type: "Visual Learning",
    description: "Roadmap + video explanations for every major DSA topic.",
    icon: Youtube,
    gradient: "from-red-500 to-rose-600",
    link: "https://neetcode.io",
    tag: "Free",
    tagColor: "bg-green-500/20 text-green-400",
  },
  {
    title: "GeeksForGeeks",
    type: "Articles & Problems",
    description: "Comprehensive articles, company-wise problems, and interview experiences.",
    icon: Globe,
    gradient: "from-green-500 to-teal-600",
    link: "https://geeksforgeeks.org",
    tag: "Free",
    tagColor: "bg-green-500/20 text-green-400",
  },
  {
    title: "Codeforces",
    type: "Competitive Programming",
    description: "Level up with rated contests. Great for improving problem-solving speed.",
    icon: Zap,
    gradient: "from-blue-500 to-cyan-600",
    link: "https://codeforces.com",
    tag: "CP",
    tagColor: "bg-blue-500/20 text-blue-400",
  },
  {
    title: "GitHub Repos",
    type: "Community Resources",
    description: "Curated repos: interview-questions, system-design-primer, awesome-algorithms.",
    icon: GitBranch,
    gradient: "from-gray-500 to-slate-600",
    link: "https://github.com",
    tag: "Open Source",
    tagColor: "bg-gray-500/20 text-gray-400",
  },
];

const placementChecklist: ChecklistItem[] = [
  { topic: "Complete Arrays & Strings (45 problems)", done: false },
  { topic: "Learn Time & Space Complexity", done: false },
  { topic: "Solve 20 Linked List problems", done: false },
  { topic: "Master BFS & DFS patterns", done: false },
  { topic: "Do 15 DP problems (start easy)", done: false },
  { topic: "Attempt 2 LeetCode contests", done: false },
  { topic: "Read 5 company interview experiences", done: false },
  { topic: "Practice mock interview (with buddy)", done: false },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-500/20 text-green-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Hard: "bg-red-500/20 text-red-400",
};

// --- Main Component ---
const CodingResources = () => {
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<boolean[]>(new Array(placementChecklist.length).fill(false));

  const toggleCheck = (i: number) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const completedCount = checklist.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="space-y-8">

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: "🧩", label: "Total Topics", value: "6 Core" },
          { icon: "📋", label: "Curated Problems", value: "230+" },
          { icon: "🏆", label: "Members", value: "456" },
          { icon: "✅", label: "Placement Prep", value: `${completedCount}/${placementChecklist.length}` },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 text-center border border-white/10"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-bold text-sm">{stat.value}</div>
            <div className="text-[11px] text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* DSA Topics */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Code className="w-4 h-4 text-purple-400" /> DSA Topic Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dsaTopics.map((topic, i) => {
            const isOpen = expandedTopic === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card border border-white/10 overflow-hidden"
              >
                <button
                  className="w-full p-5 text-left flex items-start gap-4"
                  onClick={() => setExpandedTopic(isOpen ? null : i)}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shrink-0`}>
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{topic.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${difficultyColor[topic.difficulty]}`}>
                        {topic.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{topic.problems} problems · Click to expand</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground mt-1 shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />}
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-5 pb-5"
                  >
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs text-muted-foreground mb-3 font-medium">Key Subtopics:</p>
                      <div className="flex flex-wrap gap-2">
                        {topic.subtopics.map((sub, si) => (
                          <span
                            key={si}
                            className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${topic.gradient} text-white font-medium opacity-90`}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Placement Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" /> Placement Prep Checklist
          </h2>
          <div className="text-sm text-muted-foreground">
            <span className="text-purple-400 font-bold">{completedCount}</span>/{placementChecklist.length} done
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-white/10 rounded-full mb-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-5">
          <span>Starting out</span>
          <span className="text-purple-400 font-semibold">{progressPercent}% ready</span>
          <span>Placement Ready 🚀</span>
        </div>

        <div className="space-y-2">
          {placementChecklist.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCheck(i)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm ${
                checklist[i]
                  ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
              }`}
            >
              {checklist[i]
                ? <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                : <Circle className="w-4 h-4 shrink-0" />}
              <span className={checklist[i] ? "line-through opacity-70" : ""}>{item.topic}</span>
            </motion.button>
          ))}
        </div>

        {completedCount === placementChecklist.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 text-center text-sm text-purple-400 font-semibold"
          >
            🚀 You're placement ready! Go crack that interview!
          </motion.div>
        )}
      </motion.div>

      {/* Resources Grid */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" /> Top Coding Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {codingResources.map((res, i) => {
            const RIcon = res.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-5 border border-white/10 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${res.gradient} flex items-center justify-center shrink-0`}>
                    <RIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">{res.title}</p>
                      {res.tag && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${res.tagColor}`}>
                          {res.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{res.type}</p>
                    <p className="text-xs text-foreground/70">{res.description}</p>
                  </div>
                  {res.link && (
                    <a
                      href={res.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default CodingResources;