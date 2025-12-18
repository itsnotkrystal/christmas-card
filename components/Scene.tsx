import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { TreeState } from '../types';
import { COLORS, TREE_CONFIG } from '../constants';

interface SceneProps {
  treeState: TreeState;
}

const MovingCamera = ({ treeState }: { treeState: TreeState }) => {
  const ref = useRef<THREE.PerspectiveCamera>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    
    // Gentle camera sway
    const time = state.clock.elapsedTime;
    const radius = 30;
    
    // When Scattered, camera is further away? No, keep it cinematic.
    // Just a slow orbit.
    const x = Math.sin(time * 0.1) * 2;
    ref.current.position.x += (x - ref.current.position.x) * 0.01;
    ref.current.lookAt(0, 0, 0);
  });

  return (
      <PerspectiveCamera 
        makeDefault 
        ref={ref} 
        position={[0, 2, 35]} 
        fov={45} 
      />
  );
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, // Postprocessing handles AA or we disable for performance with Bloom
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2
      }}
      shadows
    >
      <color attach="background" args={[COLORS.BACKGROUND]} />
      
      <MovingCamera treeState={treeState} />
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={10} 
        maxDistance={60}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* Lighting System for Luxury Feel */}
      <ambientLight intensity={0.2} color="#001100" />
      
      {/* Golden Highlight Light */}
      <spotLight 
        position={[20, 30, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={800} 
        color={COLORS.RICH_GOLD} 
        castShadow 
      />
      
      {/* Rim Light for Emeralds */}
      <pointLight position={[-20, 10, -10]} intensity={400} color={COLORS.BRIGHT_EMERALD} />
      
      {/* Warm fill */}
      <pointLight position={[0, -10, 20]} intensity={100} color="#ffaa00" />

      {/* Environment for reflections */}
      <Environment preset="city" background={false} />
      
      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <group position={[0, -2, 0]}>
        <Foliage treeState={treeState} />
        <Ornaments treeState={treeState} />
        
        {/* Floor Reflection */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -TREE_CONFIG.HEIGHT/2 - 2, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#000000" 
            roughness={0.1} 
            metalness={0.8} 
          />
        </mesh>
      </group>

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.5} // Only very bright things glow
          luminanceSmoothing={0.9} 
          intensity={1.5} 
          radius={0.7}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  );
};