import React from "react";
import MainLayout from "../layouts/MainLayout";
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/common/HeroSection";
import Footer from "../components/common/Footer";
import AIFeatures from "../components/common/AIFeatures";
import HowItWorks from "../components/common/HowItWorks";

const Home: React.FC = () => {
  return (
    <MainLayout>
      <Navbar />
      <HeroSection />
      <AIFeatures />
      <HowItWorks />
      <Footer />
    </MainLayout>
  );
};

export default Home;