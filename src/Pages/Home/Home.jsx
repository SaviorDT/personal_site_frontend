import React from 'react';
import AnimatedBackground from 'Components/AnimatedBackground/AnimatedBackground';
import Navigation from 'Components/Navigation/Navigation';
import HeroSection from 'Pages/Home/HeroSection/HeroSection';
import PreviewSections from 'Pages/Home/PreviewSections/PreviewSections';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <AnimatedBackground />
      <Navigation />
      <main className="home-content">
        <HeroSection />
        <PreviewSections />
      </main>
    </div>
  );
};

export default Home;