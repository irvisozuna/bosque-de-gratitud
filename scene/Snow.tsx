import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Snow: React.FC<{ count?: number }> = ({ count = 1000 }) => {
  const mesh = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 40;
      const speed = 0.02 + Math.random() * 0.05;
      temp.push({ x, y, z, speed, initialY: y });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Vector3(), []);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.y -= particle.speed;
      if (particle.y < 0) {
        particle.y = 20;
      }
      
      positions[i * 3] = particle.x;
      positions[i * 3 + 1] = particle.y;
      positions[i * 3 + 2] = particle.z;
    });
    
    if (mesh.current) {
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
