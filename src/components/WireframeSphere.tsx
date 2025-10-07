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

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Sphere parameters
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.15;
    const points: { x: number; y: number; z: number }[] = [];
    const connections: [number, number][] = [];

    // Create sphere points (fibonacci sphere)
    const numPoints = 400;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < numPoints; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / numPoints);
      
      points.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
      });
    }

    // Create connections between nearby points
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dz = points[i].z - points[j].z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < radius * 0.4) {
          connections.push([i, j]);
        }
      }
    }

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
        const opacity = Math.max(0.1, Math.min(0.8, (avgZ + radius) / (radius * 2)));
        
        // Gradient based on position
        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(0, `hsla(190, 95%, 55%, ${opacity})`);
        gradient.addColorStop(1, `hsla(280, 85%, 65%, ${opacity})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw points
      projected.forEach((point, i) => {
        const opacity = Math.max(0.2, Math.min(1, (point.z + radius) / (radius * 2)));
        const size = 1.5 + (point.z + radius) / (radius * 2);
        
        // Alternate colors
        const hue = i % 2 === 0 ? 190 : 280;
        ctx.fillStyle = `hsla(${hue}, 95%, 65%, ${opacity})`;
        ctx.shadowBlur = 10;
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
