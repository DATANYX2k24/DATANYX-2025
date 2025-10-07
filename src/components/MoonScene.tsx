'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MoonScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moonRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup - positioned to center the moon
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Enhanced lighting for realism (based on lunar-dance repo)
    const ambientLight = new THREE.AmbientLight(0x222244, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Subtle rim light for depth
    const rimLight = new THREE.DirectionalLight(0x6688ff, 0.5);
    rimLight.position.set(-5, 0, -5);
    scene.add(rimLight);

    // Starfield background
    const starCount = window.devicePixelRatio > 2 ? 5000 : 10000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 100;
      starPositions[i + 1] = (Math.random() - 0.5) * 100;
      starPositions[i + 2] = (Math.random() - 0.5) * 100;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create Moon with realistic materials (like lunar-dance repo)
    const createMoon = async () => {
      const moonGeometry = new THREE.SphereGeometry(1.5, 128, 128); // High resolution for smoothness
      
      // Try to load moon texture, fallback to procedural material if it fails
      const textureLoader = new THREE.TextureLoader();
      let moonMaterial: THREE.Material;
      
      try {
        const moonTextureMap = await new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(
            '/textures/moon.jpg', // You can add your moon texture here
            (texture) => {
              texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
              resolve(texture);
            },
            undefined,
            reject
          );
        });
        
        // Realistic moon material with texture
        moonMaterial = new THREE.MeshStandardMaterial({
          map: moonTextureMap,
          roughness: 0.95,
          metalness: 0.05,
          bumpMap: moonTextureMap,
          bumpScale: 0.015,
        });
      } catch (error) {
        console.log('Moon texture not found, using procedural material');
        // Fallback to procedural moon-like material
        moonMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xcccccc,
          roughness: 0.95,
          metalness: 0.05,
        });
      }

      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      
      // Position moon at center (0, 0, 0) so it stays centered
      moon.position.set(0, 0, 0);
      
      scene.add(moon);
      moonRef.current = moon;
    };

    // Initialize moon
    createMoon();

    // Scroll handler for moon rotation (stays centered, only rotates)
    const handleScroll = () => {
      if (!moonRef.current || prefersReducedMotion) return;
      
      const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
      
      // Only rotate the moon, don't change position
      const rotationY = scrollPercent * Math.PI * 4; // 4 full rotations over full scroll
      const rotationX = scrollPercent * Math.PI * 2; // 2 full rotations on X axis for variety
      
      moonRef.current.rotation.y = rotationY;
      moonRef.current.rotation.x = rotationX * 0.3; // Slower X rotation
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Render function
    const render = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Gentle idle rotation when reduced motion is preferred
        if (prefersReducedMotion && moonRef.current) {
          moonRef.current.rotation.y += 0.005; // Very slow rotation
        }
        
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      render();
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Handle visibility change (pause when tab hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      starGeometry.dispose();
      starMaterial.dispose();
      
      if (moonRef.current) {
        moonRef.current.geometry.dispose();
        if (Array.isArray(moonRef.current.material)) {
          moonRef.current.material.forEach(mat => mat.dispose());
        } else {
          moonRef.current.material.dispose();
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-label="Interactive 3D moon scene - scroll to rotate"
      />
    </div>
  );
};

export default MoonScene;