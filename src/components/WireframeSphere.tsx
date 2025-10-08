'use client';

import { useEffect, useRef } from "react";

export const WireframeSphere = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollY = useRef(0);
  const animationFrame = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get responsive parameters based on screen size
    const getResponsiveParams = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const minDimension = Math.min(width, height);
      
      if (width <= 480) {
        // Very small mobile
        return {
          radius: minDimension * 0.12,
          numPoints: 200,
          connectionDistance: 0.5,
          lineWidth: 0.3,
          pointSize: 1,
          glowIntensity: 5
        };
      } else if (width <= 768) {
        // Mobile
        return {
          radius: minDimension * 0.13,
          numPoints: 250,
          connectionDistance: 0.45,
          lineWidth: 0.4,
          pointSize: 1.2,
          glowIntensity: 7
        };
      } else if (width <= 1024) {
        // Tablet
        return {
          radius: minDimension * 0.14,
          numPoints: 300,
          connectionDistance: 0.4,
          lineWidth: 0.5,
          pointSize: 1.5,
          glowIntensity: 8
        };
      } else {
        // Desktop
        return {
          radius: minDimension * 0.15,
          numPoints: 400,
          connectionDistance: 0.4,
          lineWidth: 0.5,
          pointSize: 1.5,
          glowIntensity: 10
        };
      }
    };

    let currentParams = getResponsiveParams();
    const points: { x: number; y: number; z: number }[] = [];
    const connections: [number, number][] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    // Function to regenerate sphere with current parameters
    const regenerateSphere = () => {
      points.length = 0;
      connections.length = 0;
      
      // Create sphere points (fibonacci sphere)
      for (let i = 0; i < currentParams.numPoints; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / currentParams.numPoints);
        
        points.push({
          x: currentParams.radius * Math.sin(phi) * Math.cos(theta),
          y: currentParams.radius * Math.sin(phi) * Math.sin(theta),
          z: currentParams.radius * Math.cos(phi),
        });
      }

      // Create connections between nearby points
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dz = points[i].z - points[j].z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance < currentParams.radius * currentParams.connectionDistance) {
            connections.push([i, j]);
          }
        }
      }
    };

    // Set canvas size and handle resize
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Check if responsive parameters need updating
      const newParams = getResponsiveParams();
      if (JSON.stringify(newParams) !== JSON.stringify(currentParams)) {
        currentParams = newParams;
        regenerateSphere();
      }
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Initial generation
    regenerateSphere();

    // Handle scroll
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Rotation based on scroll
      const rotationX = scrollY.current * 0.001;
      const rotationY = scrollY.current * 0.002;
      const autoRotation = Date.now() * 0.0001;

      // Project and draw
      const projected: { x: number; y: number; z: number }[] = [];

      points.forEach((point) => {
        // Rotate around Y axis (auto + scroll)
        let x = point.x;
        let y = point.y;
        let z = point.z;

        // Rotation Y
        const cosY = Math.cos(rotationY + autoRotation);
        const sinY = Math.sin(rotationY + autoRotation);
        const tempX = x * cosY - z * sinY;
        const tempZ = x * sinY + z * cosY;
        x = tempX;
        z = tempZ;

        // Rotation X
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const tempY = y * cosX - z * sinX;
        z = y * sinX + z * cosX;
        y = tempY;

        // Perspective projection
        const scale = 300 / (300 + z);
        projected.push({
          x: centerX + x * scale,
          y: centerY + y * scale,
          z: z,
        });
      });

      // Draw connections
      connections.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        
        // Calculate opacity based on z-depth
        const avgZ = (p1.z + p2.z) / 2;
        const opacity = Math.max(0.1, Math.min(0.8, (avgZ + currentParams.radius) / (currentParams.radius * 2)));
        
        // Gradient based on position
        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(0, `hsla(190, 95%, 55%, ${opacity})`);
        gradient.addColorStop(1, `hsla(280, 85%, 65%, ${opacity})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = currentParams.lineWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw points
      projected.forEach((point, i) => {
        const opacity = Math.max(0.2, Math.min(1, (point.z + currentParams.radius) / (currentParams.radius * 2)));
        const size = currentParams.pointSize + (point.z + currentParams.radius) / (currentParams.radius * 2);
        
        // Alternate colors
        const hue = i % 2 === 0 ? 190 : 280;
        ctx.fillStyle = `hsla(${hue}, 95%, 65%, ${opacity})`;
        ctx.shadowBlur = currentParams.glowIntensity;
        ctx.shadowColor = `hsla(${hue}, 95%, 65%, ${opacity})`;
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 2 }}
    />
  );
};
