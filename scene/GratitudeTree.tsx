import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const GratitudeTree: React.FC = () => {
  const treeRef = useRef<THREE.Group>(null!);

  return (
    <group ref={treeRef} position={[0, 0, 0]}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.6, 2, 8]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>

      {/* Leaves Layers */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[2, 3, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.5, 2.5, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 6, 0]} castShadow receiveShadow>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#16a34a" roughness={0.8} />
      </mesh>

      {/* Topper Star */}
      <mesh position={[0, 7.2, 0]}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} toneMapped={false} />
        <pointLight intensity={2} distance={10} color="#facc15" />
      </mesh>

      {/* Magic Sparkles around the tree */}
      <Sparkles 
        count={100} 
        scale={[6, 8, 6]} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color="#fbbf24" 
      />
    </group>
  );
};
