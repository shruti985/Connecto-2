import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dumbbell,
  Flame,
  Target,
  Utensils,
  Clock,
  ChevronDown,
  ChevronUp,
  Trophy,
  Zap,
  Apple,
  BarChart2,
  Users,
  ExternalLink,
  CheckCircle,
  Circle,
} from "lucide-react";

// --- Types ---
interface WorkoutPlan {
  level: string;
  days: string;
  goal: string;
  gradient: string;
  exercises: { name: string; sets: string; rest: string }[];
}

interface MealPlan {
  time: string;
  meal: string;
  calories: string;
  icon: string;
}

interface FitnessResource {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  link?: string;
  tag?: string;
  tagColor?: string;
}

const workoutPlans: WorkoutPlan[] = [
  {
    level: "Beginner",
    days: "3 days/week",
    goal: "Build Foundation",
    gradient: "from-green-500 to-emerald-600",
    exercises: [
      { name: "Push-ups", sets: "3 × 10 reps", rest: "60s rest" },
      { name: "Bodyweight Squats", sets: "3 × 15 reps", rest: "60s rest" },
      { name: "Plank Hold", sets: "3 × 20 sec", rest: "45s rest" },
      { name: "Jumping Jacks", sets: "3 × 30 sec", rest: "30s rest" },
      { name: "Glute Bridge", sets: "3 × 12 reps", rest: "60s rest" },
    ],
  },
  {
    level: "Intermediate",
    days: "4 days/week",
    goal: "Build Muscle",
    gradient: "from-orange-500 to-red-600",
    exercises: [
      { name: "Pull-ups", sets: "4 × 8 reps", rest: "90s rest" },
      { name: "Dips", sets: "4 × 10 reps", rest: "90s rest" },
      { name: "Bulgarian Split Squat", sets: "3 × 10/leg", rest: "75s rest" },
      { name: "Pike Push-ups", sets: "4 × 12 reps", rest: "60s rest" },
      { name: "L-sit Hold", sets: "3 × 15 sec", rest: "60s rest" },
    ],
  },
  {
    level: "Advanced",
    days: "5 days/week",
    goal: "Peak Performance",
    gradient: "from-red-500 to-rose-700",
    exercises: [
      { name: "Weighted Pull-ups", sets: "5 × 6 reps", rest: "2 min rest" },
      { name: "Pistol Squats", sets: "4 × 8/leg", rest: "90s rest" },
      { name: "Handstand Push-ups", sets: "4 × 6 reps", rest: "2 min rest" },
      { name: "Muscle-ups", sets: "3 × 5 reps", rest: "2 min rest" },
      { name: "Dragon Flag", sets: "3 × 8 reps", rest: "90s rest" },
    ],
  },
];

const mealPlan: MealPlan[] = [
  {
    time: "7:00 AM",
    meal: "Oats + Banana + Peanut Butter",
    calories: "~450 kcal",
    icon: "🌅",
  },
  {
    time: "10:00 AM",
    meal: "Boiled Eggs (2) + Fruit",
    calories: "~200 kcal",
    icon: "🥚",
  },
  {
    time: "1:00 PM",
    meal: "Dal + Rice + Salad + Curd",
    calories: "~600 kcal",
    icon: "🍱",
  },
  {
    time: "4:00 PM",
    meal: "Protein Shake / Sprouts",
    calories: "~250 kcal",
    icon: "💪",
  },
  {
    time: "8:00 PM",
    meal: "Chapati + Sabzi + Paneer",
    calories: "~550 kcal",
    icon: "🌙",
  },
];

const fitnessResources: FitnessResource[] = [
  {
    title: "MyFitnessPal",
    description:
      "Track calories, macros, and workouts. Best free nutrition tracker.",
    icon: Apple,
    gradient: "from-blue-500 to-cyan-600",
    link: "https://myfitnesspal.com",
    tag: "Free",
    tagColor: "bg-green-500/20 text-green-400",
  },
  {
    title: "Jefit",
    description:
      "Workout planner and tracker with 1300+ exercises and routines.",
    icon: Dumbbell,
    gradient: "from-red-500 to-rose-600",
    link: "https://jefit.com",
    tag: "App",
    tagColor: "bg-blue-500/20 text-blue-400",
  },
  {
    title: "Campus Gym Buddy Finder",
    description:
      "Post your schedule here and find someone to train with on campus.",
    icon: Users,
    gradient: "from-purple-500 to-pink-600",
    tag: "Community",
    tagColor: "bg-purple-500/20 text-purple-400",
  },
  {
    title: "Nike Training Club",
    description: "Hundreds of free guided workouts from beginner to advanced.",
    icon: Zap,
    gradient: "from-orange-500 to-amber-600",
    link: "https://www.nike.com/ntc-app",
    tag: "Free",
    tagColor: "bg-green-500/20 text-green-400",
  },
];

const habits = [
  "Morning Walk",
  "Protein Goal",
  "8 Glasses Water",
  "No Junk Food",
  "Stretching",
  "Sleep by 11PM",
  "Workout Done",
];

const FitnessResources = () => {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [checkedHabits, setCheckedHabits] = useState<boolean[]>(
    new Array(habits.length).fill(false),
  );

  const toggleHabit = (i: number) => {
    setCheckedHabits((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const completedCount = checkedHabits.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);

  return (
    <div className="space-y-8">
      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: "🔥", label: "Calories Burned", value: "~450/session" },
          { icon: "💪", label: "Members Active", value: "278" },
          { icon: "⏱️", label: "Avg Workout", value: "45 mins" },
          {
            icon: "🏆",
            label: "Daily Habits",
            value: `${completedCount}/${habits.length}`,
          },
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
            <div className="text-[11px] text-muted-foreground">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Workout Plans */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-red-400" /> Workout Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workoutPlans.map((plan, i) => {
            const isOpen = selectedPlan === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card border border-white/10 overflow-hidden"
              >
                <button
                  className="w-full p-5 text-left"
                  onClick={() => setSelectedPlan(isOpen ? null : i)}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3`}
                  >
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm">{plan.level}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {plan.days} · {plan.goal}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground mt-1" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-5 pb-5"
                  >
                    <div className="border-t border-white/10 pt-4 space-y-3">
                      {plan.exercises.map((ex, ei) => (
                        <div
                          key={ei}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-foreground/90">
                            {ex.name}
                          </span>
                          <div className="flex gap-2 text-muted-foreground">
                            <span
                              className={`bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent font-semibold`}
                            >
                              {ex.sets}
                            </span>
                            <span>·</span>
                            <span>{ex.rest}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Daily Habit Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" /> Today's Habits
          </h2>
          <div className="text-sm text-muted-foreground">
            <span className="text-orange-400 font-bold">{completedCount}</span>/
            {habits.length} done
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {habits.map((habit, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleHabit(i)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm ${
                checkedHabits[i]
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-300"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
              }`}
            >
              {checkedHabits[i] ? (
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 shrink-0" />
              )}
              <span
                className={checkedHabits[i] ? "line-through opacity-70" : ""}
              >
                {habit}
              </span>
            </motion.button>
          ))}
        </div>
        {completedCount === habits.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 text-center text-sm text-orange-400 font-semibold"
          >
            🏆 Beast mode activated! All habits crushed today!
          </motion.div>
        )}
      </motion.div>

      {/* Meal Plan */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-amber-400" /> Sample Indian Meal
          Plan
        </h2>
        <div className="glass-card border border-white/10 overflow-hidden">
          {mealPlan.map((meal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-4 px-5 py-4 ${i !== mealPlan.length - 1 ? "border-b border-white/10" : ""}`}
            >
              <span className="text-xl w-8 shrink-0">{meal.icon}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground w-20 shrink-0">
                <Clock className="w-3 h-3" />
                {meal.time}
              </div>
              <div className="flex-1 text-sm font-medium text-foreground/90">
                {meal.meal}
              </div>
              <div className="text-xs text-amber-400 font-semibold shrink-0">
                {meal.calories}
              </div>
            </motion.div>
          ))}
          <div className="px-5 py-3 bg-amber-500/5 border-t border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart2 className="w-3 h-3" /> Total Daily Intake
            </div>
            <span className="text-sm font-bold text-amber-400">~2050 kcal</span>
          </div>
        </div>
      </div>

      {/* Tools & Apps */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" /> Fitness Tools & Apps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fitnessResources.map((res, i) => {
            const RIcon = res.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-5 border border-white/10 hover:border-red-500/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${res.gradient} flex items-center justify-center shrink-0`}
                  >
                    <RIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">{res.title}</p>
                      {res.tag && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${res.tagColor}`}
                        >
                          {res.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/70">
                      {res.description}
                    </p>
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

export default FitnessResources;
