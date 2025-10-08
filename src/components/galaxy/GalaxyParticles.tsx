'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GalaxyParticles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    animationId?: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 100, 0); // Start from top
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Galaxy parameters
    const parameters = {
      count: 450000,  // Much denser particle field
      size: 0.03,
      radius: 80,
      branches: 6,    // More branches for denser coverage
      spin: 5,
      randomness: 0.01, // Reduced randomness for denser core
      randomnessPower: 2,
      insideColor: '#ffffff',  // Pure white
      outsideColor: '#ffffff'  // Pure white
    };

    // Generate galaxy
    const generateGalaxy = () => {
      const geometry = new THREE.BufferGeometry();
      
      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);

      // Colors for potential future use
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const colorInside = new THREE.Color(parameters.insideColor);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const colorOutside = new THREE.Color(parameters.outsideColor);

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Create multiple density layers for more immersive effect
        const densityFactor = Math.random();
        let radius;
        
        if (densityFactor < 0.6) {
          // 60% of particles in dense core
          radius = Math.random() * parameters.radius * 0.3;
        } else if (densityFactor < 0.9) {
          // 30% in medium density ring
          radius = parameters.radius * 0.3 + Math.random() * parameters.radius * 0.4;
        } else {
          // 10% in outer sparse ring
          radius = parameters.radius * 0.7 + Math.random() * parameters.radius * 0.3;
        }

        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius * 0.2;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = (Math.random() - 0.5) * 150 + randomY; // Denser vertical distribution
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // All particles are white with slight opacity variation based on density
        const opacity = densityFactor < 0.6 ? 1.0 : (densityFactor < 0.9 ? 0.8 : 0.6);
        
        colors[i3] = opacity;     // R
        colors[i3 + 1] = opacity; // G  
        colors[i3 + 2] = opacity; // B
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Create a circular texture for round particles
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d')!;
      
      // Create radial gradient for circular particle
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
      
      const texture = new THREE.CanvasTexture(canvas);

      // Material
      const material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent: true,
        opacity: 1.0, // Full opacity for brighter white particles
        map: texture,
        alphaTest: 0.001
      });

      // Points
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      return points;
    };

    const particles = generateGalaxy();

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles
    };

    // Scroll handler
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    // Animation
    const animate = () => {
      if (!sceneRef.current) return;

      const { scene, camera, renderer, particles } = sceneRef.current;

      // Update camera position based on scroll
      const scrollProgress = scrollYRef.current / (document.body.scrollHeight - window.innerHeight);
      const cameraY = 100 - (scrollProgress * 200); // Move from Y=100 to Y=-100
      const cameraZ = scrollProgress * 50; // Move forward as we scroll
      
      camera.position.set(0, cameraY, cameraZ);
      camera.lookAt(0, cameraY - 20, 0); // Look slightly ahead

      // Rotate the galaxy slowly
      particles.rotation.y += 0.001;

      // Render
      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!sceneRef.current) return;

      const { camera, renderer } = sceneRef.current;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (sceneRef.current) {
        if (sceneRef.current.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
        
        // Use stored container reference to avoid stale closure
        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
        
        sceneRef.current.renderer.dispose();
        sceneRef.current.particles.geometry.dispose();
        (sceneRef.current.particles.material as THREE.Material).dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full"
      style={{ background: 'radial-gradient(ellipse at center, #000000ff 0%, #000000ff 100%)' }}
    />
  );
};

export default GalaxyParticles;