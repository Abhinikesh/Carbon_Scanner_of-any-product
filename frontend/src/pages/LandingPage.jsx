import React from 'react';
import PublicNavbar from '../components/landing/PublicNavbar.jsx';
import Hero from '../components/landing/Hero.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import Features from '../components/landing/Features.jsx';
import Footer from '../components/landing/Footer.jsx';

export default function LandingPage() {
  return (
    <div className="bg-paper min-h-screen text-ink antialiased">
      <PublicNavbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Footer />
    </div>
  );
}
