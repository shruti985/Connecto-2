/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityCard from "@/components/CommunityCard";

import { Plane, Code, Brain, Rocket, Dumbbell, Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { useState, useEffect } from "react";
import axios from "axios";

//////////////////////////////////////////////////////
// DEFAULT COMMUNITIES (STATIC UI)
//////////////////////////////////////////////////////

const allCommunities = [
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

//////////////////////////////////////////////////////

const Communities = () => {
  const [search, setSearch] = useState("");

  const [membersMap, setMembersMap] = useState<Record<number, number>>({});

  const [joinedCommunities, setJoinedCommunities] = useState<number[]>([]);

  //////////////////////////////////////////////////////
  // FETCH MEMBERS
  //////////////////////////////////////////////////////

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
  //////////////////////////////////////////////////////
  // FETCH JOINED
  //////////////////////////////////////////////////////

  const fetchJoined = async () => {
    try {
      const res = await axios.get("/api/communities/my-communities");

      console.log("JOINED:", res.data);

      const ids = res.data?.communities?.map((c: any) => c.id) || [];

      setJoinedCommunities(ids);
    } catch (err) {
      console.error("Fetch Joined Error:", err);
    }
  };

  //////////////////////////////////////////////////////
  // TOGGLE JOIN / LEAVE
  //////////////////////////////////////////////////////

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
    } catch (err: any) {
      console.error("JOIN ERROR:", err);

      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  //////////////////////////////////////////////////////

  useEffect(() => {
    fetchCommunities();
    fetchJoined();
  }, []);

  //////////////////////////////////////////////////////

  const filteredCommunities = allCommunities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()),
  );

  //////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* SEARCH */}

          <div className="mb-8 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search communities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community, index) => (
              <CommunityCard
                key={community.id}
                {...community}
                index={index}
                members={membersMap[community.id] || 0}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Communities;
