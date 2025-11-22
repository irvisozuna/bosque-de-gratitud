import React, { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';

export const Forest: React.FC = () => {
  // Generate random trees in the distance
  const trees = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 25; // Distance from center
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.5 + Math.random() * 1.5;
      temp.push({ x, z, scale });
    }
    return temp;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>

      {/* Background Trees (Instances for performance) */}
      <Instances range={40}>
        <coneGeometry args={[1, 3, 5]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
        {trees.map((data, i) => (
          <Instance
            key={i}
            position={[data.x, data.scale * 1.5, data.z]}
            scale={[data.scale, data.scale, data.scale]}
          />
        ))}
      </Instances>
    </group>
  );
};
