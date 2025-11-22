import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MessageCircle } from 'lucide-react';

interface ElfProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    onChatStart: () => void;
    onChatEnd: () => void;
}

export const Elf: React.FC<ElfProps> = ({ position, rotation = [0, 0, 0], onChatStart }) => {
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  
  // Animation refs
  const headRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Idle Animation
    if (group.current) {
        // Gentle breathing scale
        group.current.scale.y = 1 + Math.sin(t * 2) * 0.02;
        group.current.scale.x = 1 + Math.cos(t * 2) * 0.01;
        group.current.scale.z = 1 + Math.cos(t * 2) * 0.01;
    }

    if (headRef.current) {
        // Look around slowly
        headRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
        headRef.current.rotation.x = Math.cos(t * 0.3) * 0.05;
    }

    // Wave arms slightly
    if (leftArmRef.current) leftArmRef.current.rotation.z = -0.5 + Math.sin(t * 3) * 0.1;
    if (rightArmRef.current) rightArmRef.current.rotation.z = 0.5 - Math.sin(t * 3 + 1) * 0.1;

    // Bounce on hover
    if (hovered) {
        group.current.position.y = position[1] + Math.abs(Math.sin(t * 10)) * 0.1;
    } else {
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, position[1], 0.1);
    }
  });

  return (
    <group 
        ref={group} 
        position={position} 
        rotation={new THREE.Euler(...rotation)}
        onClick={(e) => {
            e.stopPropagation();
            onChatStart();
        }}
        onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHovered(true);
        }}
        onPointerOut={() => {
            document.body.style.cursor = 'default';
            setHovered(false);
        }}
    >
      {/* --- IMPROVED 3D ELF MODEL --- */}
      
      {/* Feet/Boots */}
      <mesh position={[-0.2, 0.1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial color="#1f2937" /> {/* Dark Grey Boots */}
      </mesh>
      <mesh position={[0.2, 0.1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6]} />
        <meshStandardMaterial color="#dc2626" /> {/* Red tights */}
      </mesh>
       <mesh position={[0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Tunic Body */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 0.8]} />
        <meshStandardMaterial color="#16a34a" /> {/* Green Tunic */}
      </mesh>

      {/* Belt */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.1]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, 0.9, 0.24]}>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#facc15" metalness={0.8} /> {/* Gold Buckle */}
      </mesh>

      {/* Arms Group */}
      <group position={[-0.35, 1.3, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.5]} />
            <meshStandardMaterial color="#16a34a" />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial color="#dc2626" /> {/* Red Mitten */}
        </mesh>
      </group>

      <group position={[0.35, 1.3, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.5]} />
            <meshStandardMaterial color="#16a34a" />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial color="#dc2626" /> {/* Red Mitten */}
        </mesh>
      </group>

      {/* Collar */}
      <mesh position={[0, 1.52, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.2, 0.08, 8, 16]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>

      {/* Head Group */}
      <group position={[0, 1.75, 0]} ref={headRef}>
        {/* Face */}
        <mesh castShadow>
            <sphereGeometry args={[0.32, 32, 32]} />
            <meshStandardMaterial color="#fca5a5" />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.3, 0.05, -0.05]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.1, 0.3, 16]} />
            <meshStandardMaterial color="#fca5a5" />
        </mesh>
        <mesh position={[0.3, 0.05, -0.05]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.1, 0.3, 16]} />
            <meshStandardMaterial color="#fca5a5" />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.1, 0.05, 0.28]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[0.1, 0.05, 0.28]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="black" />
        </mesh>

        {/* Smile */}
        <mesh position={[0, -0.1, 0.28]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.06, 0.01, 4, 12, Math.PI]} />
            <meshBasicMaterial color="#9f1239" />
        </mesh>

        {/* Hat */}
        <group position={[0, 0.25, 0]} rotation={[-0.2, 0, 0]}>
            <mesh position={[0, 0.3, 0]}>
                <coneGeometry args={[0.34, 0.8, 32]} />
                <meshStandardMaterial color="#dc2626" />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                 <torusGeometry args={[0.32, 0.06, 16, 32]} />
                 <meshStandardMaterial color="#f1f5f9" />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
                <sphereGeometry args={[0.08]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
      </group>

      {/* Shadow Blob */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>

      {/* Floating Label */}
      <Html position={[0, 2.6, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className={`bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-bold text-green-800 shadow-lg flex items-center gap-1 transition-all duration-300 ${hovered ? 'opacity-100 scale-110' : 'opacity-70 scale-100'}`}>
              <MessageCircle size={14} /> 
              <span className="whitespace-nowrap">Hablar con Jingle</span>
          </div>
      </Html>

    </group>
  );
};