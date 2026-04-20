import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CommunitiesSection from "@/components/CommunitiesSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const [showSplash, setShowSplash] = useState(
    !localStorage.getItem("app_visited")
  );
  
  const handleSplashComplete = () => {
    localStorage.setItem("app_visited", "true");
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      <div className={showSplash ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        <Navbar />
        <main>
          <HeroSection />
          <CommunitiesSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
