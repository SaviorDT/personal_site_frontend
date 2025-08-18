import React from 'react';
import HeroSection from '@/Pages/Home/HeroSection/HeroSection';
import PreviewSections from '@/Pages/Home/PreviewSections/PreviewSections';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <main className="home-content">
        <HeroSection />
        <PreviewSections />
      </main>
    </div>
  );
};

export default Home;