"use client";
import React, { useState, useEffect } from "react";

export function NavbarDemo() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap');
        
        .navbar-container {
          position: fixed;
          top: 10px;
          left: 50%;
          z-index: 1000;
          width: 95%;
          max-width: 1400px;
          padding: 0 10px;
          transition: opacity 0.8s ease-in-out, visibility 0.8s ease-in-out, transform 0.8s ease-in-out;
        }
        
        .navbar {
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          border-radius: 50px;
          padding: 8px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        
        .navbar-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          margin-right: 32px;
        }
        
        .navbar-logo img {
          height: 48px;
          width: auto;
          filter: brightness(1.2) drop-shadow(0 0 8px rgba(7, 208, 248, 0.4));
          transition: all 0.3s ease;
        }
        
        .navbar-logo img:hover {
          filter: brightness(1.5) drop-shadow(0 0 12px rgba(7, 208, 248, 0.8));
          transform: scale(1.05);
        }
        
        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          flex: 1;
          margin-left: 16px;
        }
        
        .nav-button {
          background: transparent;
          border: none;
          color: white;
          font-family: 'Orbitron', monospace;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          outline: none;
          white-space: nowrap;
          flex-shrink: 0;
          text-shadow: 0 0 5px rgba(7, 208, 248, 0.3);
        }
        
        .nav-button:hover {
          color: #07d0f8ff;
          background: rgba(255, 255, 255, 0.1);
          text-shadow: 0 0 10px rgba(7, 208, 248, 0.8), 0 0 20px rgba(7, 208, 248, 0.4);
          transform: translateY(-1px);
        }

        /* Desktop styles */
        @media (min-width: 1024px) {
          .navbar-container {
            top: 20px;
            width: auto;
            max-width: none;
            padding: 0;
          }
          
          .navbar {
            padding: 16px 32px;
            width: auto;
          }
          
          .navbar-menu {
            gap: 24px;
            flex-wrap: nowrap;
          }
          
          .navbar-logo {
            margin-right: 48px;
          }
          
          .navbar-logo img {
            height: 56px;
          }
          
          .navbar-menu {
            margin-left: 24px;
          }
          
          .nav-button {
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1.2px;
            padding: 8px 16px;
            border-radius: 25px;
          }
        }

        /* Tablet styles */
        @media (min-width: 768px) and (max-width: 1023px) {
          .navbar-container {
            top: 15px;
            width: 90%;
          }
          
          .navbar {
            padding: 14px 24px;
          }
          
          .navbar-menu {
            gap: 16px;
          }
          
          .navbar-logo {
            margin-right: 32px;
          }
          
          .navbar-logo img {
            height: 50px;
          }
          
          .navbar-menu {
            margin-left: 16px;
          }
          
          .nav-button {
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 1px;
            padding: 7px 14px;
          }
        }

        /* Mobile styles */
        @media (max-width: 767px) {
          .navbar-container {
            top: 5px;
            width: 98%;
            padding: 0 5px;
          }
          
          .navbar {
            padding: 8px 12px;
            border-radius: 25px;
          }
          
          .navbar-menu {
            gap: 4px;
          }
          
          .navbar-logo {
            margin-right: 20px;
          }
          
          .navbar-logo img {
            height: 40px;
          }
          
          .navbar-menu {
            margin-left: 12px;
          }
          
          .nav-button {
            font-size: 10px;
            font-weight: 500;
            letter-spacing: 0.8px;
            padding: 4px 8px;
            border-radius: 15px;
          }
        }

        /* Very small mobile */
        @media (max-width: 480px) {
          .navbar {
            padding: 6px 8px;
          }
          
          .navbar-menu {
            gap: 2px;
          }
          
          .navbar-logo {
            margin-right: 16px;
          }
          
          .navbar-logo img {
            height: 36px;
          }
          
          .navbar-menu {
            margin-left: 8px;
          }
          
          .nav-button {
            font-size: 9px;
            font-weight: 400;
            letter-spacing: 0.5px;
            padding: 3px 6px;
          }
        }
      `}</style>
      
      <div 
        className={`navbar-container ${isVisible ? 'visible' : ''}`}
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-20px)'
        }}
      >
        <nav className="navbar">
          {/* Logo on the left */}
          <div className="navbar-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="assets/Navbar logo (400 x 200 px).png" 
              alt="DATANYX Logo"
            />
          </div>
          
          {/* Navigation menu in the center */}
          <div className="navbar-menu">
            <button className="nav-button">HOME</button>
            <button className="nav-button">ABOUT</button>
            <button className="nav-button">DOMAINS</button>
            <button className="nav-button">SCHEDULE</button>
            <button className="nav-button">PRIZES</button>
            <button className="nav-button">SPONSORS</button>
            <button className="nav-button">FAQS</button>
          </div>
        </nav>
      </div>
    </>
  );
}
