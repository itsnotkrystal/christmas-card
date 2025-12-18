import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, OrnamentData } from '../types';
import { TREE_CONFIG, COLORS, ANIMATION_SPEED } from '../constants';

interface OrnamentsProps {
  treeState: TreeState;
}

// Ease function for CPU animation
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  const sphereMeshRef = useRef<THREE.InstancedMesh>(null);
  const boxMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const currentProgress = useRef(0);

  // Data generation for ornaments
  const { spheres, boxes } = useMemo(() => {
    const spheres: OrnamentData[] = [];
    const boxes: OrnamentData[] = [];
    const count = TREE_CONFIG.ORNAMENT_COUNT;

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      
      // Tree Position logic
      const h = Math.random();
      const r = (TREE_CONFIG.RADIUS_BASE * (1 - h)) * 0.85; // Pull inside slightly
      const theta = Math.random() * Math.PI * 2;
      const treePos = new THREE.Vector3(
        r * Math.cos(theta),
        (h * TREE_CONFIG.HEIGHT) - (TREE_CONFIG.HEIGHT / 2),
        r * Math.sin(theta)
      );

      // Scatter Position logic
      const sr = TREE_CONFIG.SCATTER_RADIUS * (0.5 + Math.random() * 0.5);
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      const scatterPos = new THREE.Vector3(
        sr * Math.sin(sPhi) * Math.cos(sTheta),
        sr * Math.sin(sPhi) * Math.sin(sTheta),
        sr * Math.cos(sPhi)
      );

      const rotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      // --- LOGIC CHANGE ---
      // 40% Boxes (Gifts), 60% Spheres (Balls)
      if (rand > 0.6) {
        // BOXES (Gifts)
        // Mostly Red
        const color = Math.random() > 0.15 ? COLORS.GIFT_RED : COLORS.RICH_GOLD;
        boxes.push({
          id: i,
          scatterPosition: scatterPos,
          treePosition: treePos,
          rotation,
          scale: 0.3 + Math.random() * 0.3, // Boxes are substantial
          type: 'box',
          color: '#' + color.getHexString(),
        });
      } else {
        // SPHERES (Balls)
        // Mix of Gold and Green
        const color = Math.random() > 0.5 ? COLORS.RICH_GOLD : COLORS.BRIGHT_EMERALD;
        spheres.push({
          id: i,
          scatterPosition: scatterPos,
          treePosition: treePos,
          rotation,
          scale: 0.1 + Math.random() * 0.15, // Small balls (0.1 - 0.25)
          type: 'sphere',
          color: '#' + color.getHexString(),
        });
      }
    }
    return { spheres, boxes };
  }, []);

  // Update Colors
  useLayoutEffect(() => {
    const tempColor = new THREE.Color();

    if (sphereMeshRef.current) {
      spheres.forEach((data, i) => {
        tempColor.set(data.color);
        sphereMeshRef.current!.setColorAt(i, tempColor);
      });
      sphereMeshRef.current.instanceColor!.needsUpdate = true;
    }

    if (boxMeshRef.current) {
      boxes.forEach((data, i) => {
        tempColor.set(data.color);
        boxMeshRef.current!.setColorAt(i, tempColor);
      });
      boxMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [spheres, boxes]);

  useFrame((state, delta) => {
    // Smooth progress Update
    const dest = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    const step = delta / ANIMATION_SPEED;
    
    if (currentProgress.current < dest) {
      currentProgress.current = Math.min(dest, currentProgress.current + step);
    } else if (currentProgress.current > dest) {
      currentProgress.current = Math.max(dest, currentProgress.current - step);
    }

    const eased = easeInOutCubic(currentProgress.current);
    const dummy = new THREE.Object3D();
    const time = state.clock.elapsedTime;

    // Update Spheres
    if (sphereMeshRef.current) {
      spheres.forEach((data, i) => {
        const pos = new THREE.Vector3().lerpVectors(data.scatterPosition, data.treePosition, eased);
        
        dummy.position.copy(pos);
        // Spheres rotate slightly
        dummy.rotation.set(
          data.rotation.x + time * 0.5,
          data.rotation.y + time * 0.3,
          data.rotation.z
        );
        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        sphereMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sphereMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Boxes
    if (boxMeshRef.current) {
      boxes.forEach((data, i) => {
        const pos = new THREE.Vector3().lerpVectors(data.scatterPosition, data.treePosition, eased);
        
        dummy.position.copy(pos);
        // Boxes float more gently
        dummy.rotation.set(
          data.rotation.x + time * 0.2,
          data.rotation.y + time * 0.4,
          data.rotation.z
        );
        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        boxMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      boxMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* SPHERES MESH */}
      <instancedMesh
        ref={sphereMeshRef}
        args={[undefined, undefined, spheres.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial 
          roughness={0.1}
          metalness={0.9}
          color="#ffffff" // Tinted by instance color
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </instancedMesh>

      {/* BOXES MESH */}
      <instancedMesh
        ref={boxMeshRef}
        args={[undefined, undefined, boxes.length]}
        castShadow
        receiveShadow
      >
        {/* Beveled box for nicer lighting */}
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.2}
          metalness={0.6} // Less metallic than balls, more like glossy paper
          color="#ffffff" // Tinted by instance color
        />
      </instancedMesh>
    </group>
  );
};