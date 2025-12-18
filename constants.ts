import * as THREE from 'three';

// Aesthetic Palette
export const COLORS = {
  DEEP_EMERALD: new THREE.Color('#022b1c'),
  BRIGHT_EMERALD: new THREE.Color('#005c3e'),
  RICH_GOLD: new THREE.Color('#D4AF37'),
  PALE_GOLD: new THREE.Color('#F9E5BC'),
  GIFT_RED: new THREE.Color('#8a1c26'), // Slightly richer red
  BACKGROUND: '#000502',
};

// Tree Dimensions
export const TREE_CONFIG = {
  HEIGHT: 14,
  RADIUS_BASE: 5.5,
  PARTICLE_COUNT: 15000,
  ORNAMENT_COUNT: 600, // Increased count
  SCATTER_RADIUS: 25,
};

// Animation settings
export const ANIMATION_SPEED = 1.5; // Seconds to transition