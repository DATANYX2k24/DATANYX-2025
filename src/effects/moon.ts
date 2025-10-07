import * as THREE from 'three';

// Types
interface MoonOptions {
  colorUrl?: string;
  normalUrl?: string;
  displacementUrl?: string;
  useGSAP?: boolean;
  container?: HTMLElement;
}

interface MoonInstance {
  disposeMoon: () => void;
}

// Default texture URLs (NASA textures - free for educational use)
const DEFAULT_TEXTURES = {
  colorUrl: '/assets/textures/moon_color.jpg',
  normalUrl: '/assets/textures/moon_normal.jpg',
  displacementUrl: '/assets/textures/moon_disp.jpg'
};

// Animation state
let moonMesh: THREE.Mesh | null = null;
let glowMesh: THREE.Mesh | null = null;
let moonGroup: THREE.Group | null = null;
let directionalLight: THREE.DirectionalLight | null = null;
let ambientLight: THREE.AmbientLight | null = null;
let pointLight: THREE.PointLight | null = null;

// Scroll and animation variables
let currentProgress = 0;
let targetProgress = 0;
let animationId: number | null = null;
let scrollListener: (() => void) | null = null;
let resizeListener: (() => void) | null = null;

// Performance and accessibility
let prefersReducedMotion = false;
let isDisposed = false;

// Smoothstep function for easing
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

// Power2 ease out
function easeOutPower2(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

// Calculate scroll progress
function getScrollProgress(container: HTMLElement): number {
  if (prefersReducedMotion) return 0;
  
  const scrollTop = container === document.documentElement 
    ? window.pageYOffset || document.documentElement.scrollTop
    : container.scrollTop;
  
  const scrollHeight = container === document.documentElement
    ? document.documentElement.scrollHeight - window.innerHeight
    : container.scrollHeight - container.clientHeight;
  
  return Math.max(0, Math.min(1, scrollTop / Math.max(1, scrollHeight)));
}

// Update moon position and rotation based on scroll progress
function updateMoonTransform(progress: number) {
  if (!moonGroup || isDisposed) return;
  
  const easedProgress = easeOutPower2(progress);
  
  // Position interpolation
  const startX = 2, endX = -1.5;
  const startY = 1.5, endY = 0.3;
  const startZ = -6, endZ = -4.2;
  
  const targetX = THREE.MathUtils.lerp(startX, endX, easedProgress);
  const targetY = THREE.MathUtils.lerp(startY, endY, easedProgress);
  const targetZ = THREE.MathUtils.lerp(startZ, endZ, easedProgress);
  
  // Spring lerp for smooth animation
  moonGroup.position.x += (targetX - moonGroup.position.x) * 0.08;
  moonGroup.position.y += (targetY - moonGroup.position.y) * 0.08;
  moonGroup.position.z += (targetZ - moonGroup.position.z) * 0.08;
  
  // Rotation
  const targetRotY = 1.25 * easedProgress * Math.PI;
  if (moonMesh) {
    moonMesh.rotation.y += (targetRotY - moonMesh.rotation.y) * 0.08;
  }
}

// Animation loop
function animate() {
  if (isDisposed) return;
  
  // Update scroll progress
  targetProgress = getScrollProgress(document.documentElement);
  currentProgress += (targetProgress - currentProgress) * 0.08;
  
  // Update moon transform
  updateMoonTransform(currentProgress);
  
  // Gentle idle rotation when reduced motion is preferred
  if (prefersReducedMotion && moonMesh) {
    moonMesh.rotation.y += 0.002;
  }
  
  animationId = requestAnimationFrame(animate);
}

// Load texture with fallback
async function loadTexture(url: string, loader: THREE.TextureLoader): Promise<THREE.Texture | null> {
  try {
    return await loader.loadAsync(url);
  } catch (error) {
    console.warn(`Failed to load texture: ${url}`, error);
    return null;
  }
}

// Create moon material
async function createMoonMaterial(options: MoonOptions): Promise<THREE.Material> {
  const loader = new THREE.TextureLoader();
  
  try {
    const colorTexture = await loadTexture(options.colorUrl || DEFAULT_TEXTURES.colorUrl, loader);
    const normalTexture = await loadTexture(options.normalUrl || DEFAULT_TEXTURES.normalUrl, loader);
    const displacementTexture = options.displacementUrl 
      ? await loadTexture(options.displacementUrl, loader) 
      : null;
    
    if (colorTexture) {
      colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
    }
    if (normalTexture) {
      normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    }
    if (displacementTexture) {
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
    }
    
    const materialConfig: any = {
      color: colorTexture ? 0xffffff : 0x999999,
    };
    
    if (colorTexture) materialConfig.map = colorTexture;
    if (normalTexture) materialConfig.normalMap = normalTexture;
    if (displacementTexture) {
      materialConfig.displacementMap = displacementTexture;
      materialConfig.displacementScale = 0.1;
    }
    
    return new THREE.MeshStandardMaterial(materialConfig);
  } catch (error) {
    console.warn('Failed to create textured material, using fallback', error);
    return new THREE.MeshStandardMaterial({ color: 0x999999 });
  }
}

// Create glow effect
function createGlow(): THREE.Mesh {
  const glowGeometry = new THREE.SphereGeometry(1.06, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending
  });
  
  return new THREE.Mesh(glowGeometry, glowMaterial);
}

// Setup lighting
function setupLighting(scene: THREE.Scene) {
  // Directional light (sun)
  directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);
  
  // Ambient light
  ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);
  
  // Optional point light near camera
  pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
  pointLight.position.set(0, 0, 10);
  scene.add(pointLight);
}

// Handle window resize
function handleResize(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Adjust moon size for mobile
  if (moonGroup) {
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? 0.8 : 1.1;
    moonGroup.scale.setScalar(scale);
  }
}

// Debug function
function exposeDebugFunction() {
  if (typeof window !== 'undefined') {
    (window as any).__moonSetProgress = (progress: number) => {
      targetProgress = Math.max(0, Math.min(1, progress));
      updateMoonTransform(targetProgress);
    };
  }
}

// Main initialization function
export async function initMoon(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  options: MoonOptions = {}
): Promise<MoonInstance> {
  
  // Check for reduced motion preference
  if (typeof window !== 'undefined') {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  // Performance settings
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  THREE.Cache.enabled = true;
  
  isDisposed = false;
  
  try {
    // Create moon group
    moonGroup = new THREE.Group();
    scene.add(moonGroup);
    
    // Create moon geometry
    const moonGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create moon material
    const moonMaterial = await createMoonMaterial(options);
    
    // Create moon mesh
    moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonGroup.add(moonMesh);
    
    // Create glow effect
    glowMesh = createGlow();
    moonGroup.add(glowMesh);
    
    // Set initial position
    moonGroup.position.set(2, 1.5, -6);
    
    // Adjust size for mobile
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? 0.8 : 1.1;
    moonGroup.scale.setScalar(scale);
    
    // Setup lighting
    setupLighting(scene);
    
    // Setup scroll listener
    if (!prefersReducedMotion) {
      scrollListener = () => {
        targetProgress = getScrollProgress(options.container || document.documentElement);
      };
      
      const container = options.container || window;
      container.addEventListener('scroll', scrollListener, { passive: true });
    }
    
    // Setup resize listener
    resizeListener = () => handleResize(camera, renderer);
    window.addEventListener('resize', resizeListener);
    
    // Start animation loop
    animate();
    
    // Expose debug function
    exposeDebugFunction();
    
    console.log('Moon effect initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize moon effect:', error);
  }
  
  // Return dispose function
  return {
    disposeMoon: () => {
      isDisposed = true;
      
      // Cancel animation
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      // Remove event listeners
      if (scrollListener) {
        const container = options.container || window;
        container.removeEventListener('scroll', scrollListener);
        scrollListener = null;
      }
      
      if (resizeListener) {
        window.removeEventListener('resize', resizeListener);
        resizeListener = null;
      }
      
      // Dispose geometries and materials
      if (moonMesh) {
        moonMesh.geometry.dispose();
        if (Array.isArray(moonMesh.material)) {
          moonMesh.material.forEach(mat => mat.dispose());
        } else {
          moonMesh.material.dispose();
        }
      }
      
      if (glowMesh) {
        glowMesh.geometry.dispose();
        if (Array.isArray(glowMesh.material)) {
          glowMesh.material.forEach(mat => mat.dispose());
        } else {
          glowMesh.material.dispose();
        }
      }
      
      // Remove from scene
      if (moonGroup) {
        scene.remove(moonGroup);
      }
      
      if (directionalLight) scene.remove(directionalLight);
      if (ambientLight) scene.remove(ambientLight);
      if (pointLight) scene.remove(pointLight);
      
      // Clear references
      moonMesh = null;
      glowMesh = null;
      moonGroup = null;
      directionalLight = null;
      ambientLight = null;
      pointLight = null;
      
      // Clear debug function
      if (typeof window !== 'undefined') {
        delete (window as any).__moonSetProgress;
      }
      
      console.log('Moon effect disposed');
    }
  };
}

// Export types
export type { MoonOptions, MoonInstance };