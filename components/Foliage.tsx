import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { TREE_CONFIG, COLORS, ANIMATION_SPEED } from '../constants';

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  
  attribute vec3 aScatterPosition;
  attribute vec3 aTreePosition;
  attribute float aRandom;
  
  varying float vAlpha;
  varying float vRandom;

  // Cubic Ease In Out function for smoother transitions
  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  void main() {
    vRandom = aRandom;
    
    // Morph logic
    float easedProgress = easeInOutCubic(uProgress);
    vec3 targetPos = mix(aScatterPosition, aTreePosition, easedProgress);

    // Add some "breathing" / wind noise
    float noise = sin(uTime * 2.0 + aRandom * 10.0) * 0.1;
    // Only breathe when fully assembled to keep scatter chaos clean, or reduce it
    float breathingStrength = mix(0.2, 0.05, easedProgress); 
    
    targetPos.x += noise * breathingStrength;
    targetPos.y += noise * breathingStrength;
    targetPos.z += noise * breathingStrength;

    vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
    
    // Size attenuation
    gl_PointSize = (40.0 * aRandom + 20.0) * (1.0 / -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColorGreen;
  uniform vec3 uColorGold;
  
  varying float vRandom;

  void main() {
    // Create a soft circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

    if (alpha < 0.01) discard;

    // Mix green and gold based on randomness to create texture
    vec3 finalColor = mix(uColorGreen, uColorGold, step(0.9, vRandom));
    
    // Add a glowing core
    finalColor += vec3(0.2) * (1.0 - dist * 2.0);

    gl_FragColor = vec4(finalColor, alpha * 0.9); // Slightly transparent
  }
`;

interface FoliageProps {
  treeState: TreeState;
}

export const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Data Generation
  const { positions, scatterPositions, randoms } = useMemo(() => {
    const count = TREE_CONFIG.PARTICLE_COUNT;
    const positions = new Float32Array(count * 3); // Tree Shape
    const scatterPositions = new Float32Array(count * 3); // Chaos Shape
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 1. Tree Cone Logic
      // Normalized height (0 bottom, 1 top)
      const h = Math.random(); 
      // Radius at this height (Cone tapers to 0 at top)
      const r = TREE_CONFIG.RADIUS_BASE * (1 - h) + (Math.random() * 0.5); 
      const theta = Math.random() * Math.PI * 2;
      
      const x = r * Math.cos(theta);
      const y = (h * TREE_CONFIG.HEIGHT) - (TREE_CONFIG.HEIGHT / 2); // Center y
      const z = r * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 2. Scatter Sphere Logic
      // Random point inside a sphere
      const sr = TREE_CONFIG.SCATTER_RADIUS * Math.cbrt(Math.random());
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);

      scatterPositions[i * 3] = sr * Math.sin(sPhi) * Math.cos(sTheta);
      scatterPositions[i * 3 + 1] = sr * Math.sin(sPhi) * Math.sin(sTheta);
      scatterPositions[i * 3 + 2] = sr * Math.cos(sPhi);

      // 3. Random attribute
      randoms[i] = Math.random();
    }
    
    return { positions, scatterPositions, randoms };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColorGreen: { value: COLORS.BRIGHT_EMERALD },
    uColorGold: { value: COLORS.RICH_GOLD },
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const targetProgress = treeState === TreeState.TREE_SHAPE ? 1.0 : 0.0;
      const currentProgress = materialRef.current.uniforms.uProgress.value;
      
      // Linear approach to target
      const step = delta / ANIMATION_SPEED;
      if (currentProgress < targetProgress) {
        materialRef.current.uniforms.uProgress.value = Math.min(targetProgress, currentProgress + step);
      } else if (currentProgress > targetProgress) {
        materialRef.current.uniforms.uProgress.value = Math.max(targetProgress, currentProgress - step);
      }
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // This acts as the base position, though shader uses the custom attributes
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePosition"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPosition"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};