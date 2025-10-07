'use client';

import { useEffect, useState } from 'react';
import GalaxyParticles from '../components/galaxy/GalaxyParticles';
import { WireframeSphere } from '../components/WireframeSphere';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate scroll progress (0 to 1) - disappear after half viewport height
  const halfViewportHeight = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;
  const scrollProgress = Math.min(scrollY / halfViewportHeight, 1);
  
  // Calculate sphere and image position and opacity
  const sphereTransformY = scrollProgress * -100; // Move up 100vh
  const sphereOpacity = 1 - scrollProgress; // Fade out completely

  return (
    <div className="relative">
      {/* Galaxy Background - Fixed */}
      <GalaxyParticles />
      
      {/* Wireframe Sphere - Scroll animated */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2,
          transform: `translateY(${sphereTransformY}vh)`,
          opacity: sphereOpacity,
          transition: scrollProgress === 0 ? 'none' : 'opacity 0.1s ease-out',
          pointerEvents: 'none'
        }}
      >
        <WireframeSphere />
      </div>
      
      {/* Center Image - Scroll animated on top of the sphere */}
      <div 
        className="fixed pointer-events-none"
        style={{ 
          zIndex: 10,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, calc(-50% + ${sphereTransformY}vh))`,
          opacity: sphereOpacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: scrollProgress === 0 ? 'none' : 'opacity 0.1s ease-out'
        }}
      >
        <img 
          src="/assets/Landing page website (7).png"
          alt="DATANYX Logo"
          style={{
            width: '56vw',
            height: 'auto',
            minWidth: '420px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 40px rgba(190, 255, 255, 0.2))'
          }}
        />
      </div>
      
      {/* Empty sections for scrolling animation */}
      <section className="relative z-10 min-h-screen"></section>
      <section className="relative z-10 min-h-screen"></section>
      <section className="relative z-10 min-h-screen"></section>
      <section className="relative z-10 min-h-screen"></section>
    </div>
  );
}
