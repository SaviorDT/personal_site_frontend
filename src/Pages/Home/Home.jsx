import React from 'react';
import AnimatedBackground from 'Components/AnimatedBackground/AnimatedBackground';
import Navigation from 'Components/Navigation/Navigation';
import HeroSection from 'Components/HeroSection/HeroSection';
import PreviewSections from 'Components/PreviewSections/PreviewSections';
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