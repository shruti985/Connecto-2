import { motion } from "framer-motion";
import { Plane, Code, Brain, Rocket, Dumbbell } from "lucide-react";
import CommunityCard from "./CommunityCard";
import { useEffect, useState } from "react";
import axios from "axios";

const communities = [
  {
    id: 1,
    slug: "travel",
    name: "Travel & Explore",
    description:
      "Discover nearby campus places, cafes, weekend getaways, and find travel buddies.",
    icon: Plane,
    color: "text-travel",
    gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
  },
  {
    id: 2,
    slug: "dsa",
    name: "DSA & Coding",
    description:
      "Master Data Structures & Algorithms together and crack placements!",
    icon: Code,
    color: "text-dsa",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
  },
  {
    id: 3,
    slug: "mental-wellness",
    name: "Mental Wellness",
    description: "Your safe space for mental health and support.",
    icon: Brain,
    color: "text-wellness",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
  },
  {
    id: 4,
    slug: "startup",
    name: "Startup Hub",
    description: "Connect with entrepreneurs and build startups.",
    icon: Rocket,
    color: "text-startup",
    gradient: "bg-gradient-to-br from-orange-500 to-amber-600",
  },
  {
    id: 5,
    slug: "gym",
    name: "Fitness & Gym",
    description: "Find workout partners and stay motivated.",
    icon: Dumbbell,
    color: "text-gym",
    gradient: "bg-gradient-to-br from-red-500 to-rose-600",
  },
];
const CommunitiesSection = () => {
  const [membersMap, setMembersMap] = useState<Record<number, number>>({});
  const [joinedCommunities, setJoinedCommunities] = useState<number[]>([]);
  const handleToggleJoin = async (id: number) => {
    try {
      console.log("Clicked community:", id);
  
      if (joinedCommunities.includes(id)) {
        console.log("Leaving:", id);
  
        await axios.delete(`/api/communities/${id}/leave`);
  
        setJoinedCommunities((prev) => prev.filter((cid) => cid !== id));
      } else {
        console.log("Joining:", id);
  
        await axios.post(`/api/communities/${id}/join`);
  
        setJoinedCommunities((prev) => [...prev, id]);
      }
  
      fetchCommunities();
    } catch (err) {
      console.error("JOIN ERROR:", err);
  
      alert(err.response?.data?.message || "Something went wrong");
    }
  };
  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await axios.get(
        "https://connecto-2.onrender.com/api/communities/my-communities",
        {
          headers: { Authorization: token },
        }
      );
  
      const ids = res.data?.communities || [];
  
      const map: Record<number, number> = {};
  
      // fetch members count for each community
      await Promise.all(
        ids.map(async (id: number) => {
          const res = await axios.get(
            `https://connecto-2.onrender.com/api/communities/${id}/members-count`
          );
  
          map[id] = res.data.membersCount;
        })
      );
  
      console.log("FINAL MAP:", map);
      setMembersMap(map);
    } catch (err) {
      console.error("Fetch Communities Error:", err);
    }
  };
  useEffect(() => {
    fetchCommunities();
  }, []);
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Explore <span className="gradient-text">Communities</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join micro-communities that match your interests. Connect, chat, share, and grow together.
          </p>
        </motion.div>

        {/* Communities grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community, index) => (
              <CommunityCard
                key={community.id}
                {...community}
                index={index}
                members={membersMap[community.id] || 0}
              />
            ))}
          </div>
      </div>
    </section>
  );
};

export default CommunitiesSection;
