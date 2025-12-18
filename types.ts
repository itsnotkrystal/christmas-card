import * as THREE from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface OrnamentData {
  id: number;
  scatterPosition: THREE.Vector3;
  treePosition: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  type: 'box' | 'sphere' | 'diamond';
  color: string;
}

export interface FoliageUniforms {
  uTime: { value: number };
  uProgress: { value: number };
  uColorGreen: { value: THREE.Color };
  uColorGold: { value: THREE.Color };
}