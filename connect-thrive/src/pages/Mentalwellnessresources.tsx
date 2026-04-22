import { motion } from "framer-motion";
import { useState } from "react";
import {
  Brain,
  Heart,
  BookOpen,
  Users,
  Wind,
  Moon,
  Sun,
  Headphones,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

const meditationSessions = [
  {
    title: "Morning Calm",
    duration: "5 min",
    type: "Breathing",
    icon: Sun,
    color: "from-amber-400 to-orange-500",
    link: "https://www.youtube.com/watch?v=inpok4MKVLM",
    description: "Start your day with clarity and peace",
  },
  {
    title: "Focus Flow",
    duration: "10 min",
    type: "Focus",
    icon: Brain,
    color: "from-violet-400 to-purple-600",
    link: "https://www.youtube.com/watch?v=ZToicYcHIOU",
    description: "Deep work preparation meditation",
  },
  {
    title: "Stress Relief",
    duration: "8 min",
    type: "Relaxation",
    icon: Wind,
    color: "from-cyan-400 to-teal-500",
    link: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
    description: "Let go of anxiety and tension",
  },
  {
    title: "Sleep Well",
    duration: "15 min",
    type: "Sleep",
    icon: Moon,
    color: "from-indigo-400 to-blue-600",
    link: "https://www.youtube.com/watch?v=aEqlQvczMJQ",
    description: "Drift into restful sleep",
  },
];

const articles = [
  {
    title: "5 Ways to Beat Exam Anxiety",
    tag: "Anxiety",
    readTime: "4 min read",
    color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    link: "https://www.healthline.com/health/test-anxiety",
  },
  {
    title: "Building Healthy Study Habits",
    tag: "Productivity",
    readTime: "6 min read",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    link: "https://www.verywellmind.com/study-tips-2795506",
  },
  {
    title: "How to Talk About Mental Health",
    tag: "Awareness",
    readTime: "5 min read",
    color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    link: "https://www.mind.org.uk/information-support/tips-for-everyday-living/",
  },
  {
    title: "Journaling for Emotional Clarity",
    tag: "Self-Care",
    readTime: "3 min read",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    link: "https://www.healthline.com/health/benefits-of-journaling",
  },
  {
    title: "Digital Detox: Why & How",
    tag: "Lifestyle",
    readTime: "5 min read",
    color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    link: "https://www.psychologytoday.com/us/blog/mental-wealth/201402/gray-matters-too-much-screen-time-damages-the-brain",
  },
  {
    title: "Sleep & Student Mental Health",
    tag: "Sleep",
    readTime: "7 min read",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    link: "https://www.sleepfoundation.org/mental-health",
  },
];

const selfCareTips = [
  { emoji: "💧", tip: "Drink 8 glasses of water daily" },
  { emoji: "🚶", tip: "Take a 10-min walk after meals" },
  { emoji: "📵", tip: "No phone 30 mins before bed" },
  { emoji: "🌿", tip: "Spend 15 mins in nature daily" },
  { emoji: "✍️", tip: "Write 3 things you're grateful for" },
  { emoji: "😮‍💨", tip: "Box breathing: 4-4-4-4 seconds" },
];

const faqs = [
  {
    q: "Is it normal to feel overwhelmed during college?",
    a: "Absolutely. College involves major transitions — academics, social life, and identity. Feeling overwhelmed is common and valid. Reaching out to peers or a counselor is a sign of strength.",
  },
  {
    q: "How do I find a peer support group?",
    a: "You can post in the community chat, or join our weekly virtual Support Circle (Fridays, 7 PM). All sessions are confidential and judgment-free.",
  },
  {
    q: "What if I need professional help?",
    a: "Consider reaching out to iCall (9152987821) — a free counseling service for students. Your college counselor is also a great first step.",
  },
];

const MentalWellnessResources = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/20"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-emerald-300">
            Your Wellness Toolkit
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Resources curated for student life — from quick meditations to
          real-talk articles. You've got this. 💚
        </p>
      </motion.div>

      {/* Meditation Sessions */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Headphones className="w-5 h-5 text-violet-400" /> Guided Meditation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meditationSessions.map((session, i) => {
            const SIcon = session.icon;
            return (
              <motion.a
                key={i}
                href={session.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-5 flex items-center gap-4 cursor-pointer hover:border-white/20 border border-white/10 group transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${session.color} flex items-center justify-center shrink-0`}
                >
                  <SIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium group-hover:text-emerald-300 transition-colors">
                    {session.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.description}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[11px] bg-white/10 rounded-full px-2 py-0.5">
                      {session.duration}
                    </span>
                    <span className="text-[11px] bg-white/10 rounded-full px-2 py-0.5">
                      {session.type}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 shrink-0 transition-colors" />
              </motion.a>
            );
          })}
        </div>
      </section>

      {/* Self-Care Tips */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400" /> Daily Self-Care Tips
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {selfCareTips.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-4 text-center hover:border-emerald-500/30 border border-white/10 transition-all"
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <p className="text-xs text-muted-foreground leading-snug">
                {item.tip}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" /> Wellness Articles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {articles.map((article, i) => (
            <motion.a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="glass-card p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-white/20 border border-white/10 group"
            >
              <div>
                <p className="text-sm font-medium group-hover:text-sky-300 transition-colors mb-1">
                  {article.title}
                </p>
                <div className="flex gap-2 items-center">
                  <span
                    className={`text-[10px] border px-2 py-0.5 rounded-full ${article.color}`}
                  >
                    {article.tag}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {article.readTime}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-sky-400 shrink-0 transition-colors" />
            </motion.a>
          ))}
        </div>
      </section>

      {/* Support Circle */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" /> Support Circle
        </h3>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6 border border-amber-500/20 bg-amber-500/5"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Join our anonymous peer support group. A safe, judgment-free space
            to share and listen.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Fridays 7 PM — Virtual Session</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <span>📞</span>
              <span>iCall Helpline: 9152987821</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" /> FAQs
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card border border-white/10 overflow-hidden"
            >
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-medium">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-4 pb-4 text-sm text-muted-foreground"
                >
                  {faq.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MentalWellnessResources;
