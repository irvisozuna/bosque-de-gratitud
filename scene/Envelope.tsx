import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Message } from '../types';
import { Mail } from 'lucide-react';

interface EnvelopeProps {
  message: Message;
  onOpen: (msg: Message) => void;
}

export const Envelope: React.FC<EnvelopeProps> = ({ message, onOpen }) => {
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHover] = useState(false);

  // Gentle floating animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Bobbing
    group.current.position.y = message.position[1] + Math.sin(t + message.position[0]) * 0.2;
    // Slow rotation
    group.current.rotation.y += 0.005;
    // Tilt based on hover
    if (hovered) {
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0.2, 0.1);
        group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, 1.2, 0.1));
    } else {
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, 0.1);
        group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, 1, 0.1));
    }
  });

  return (
    <group 
        ref={group} 
        position={[message.position[0], message.position[1], message.position[2]]}
        onClick={(e) => {
            e.stopPropagation();
            onOpen(message);
        }}
        onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHover(true);
        }}
        onPointerOut={() => {
            document.body.style.cursor = 'default';
            setHover(false);
        }}
    >
      {/* Envelope Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color={message.color} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Flap */}
      <mesh position={[0, 0.15, 0.026]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.4, 0.3, 4, 1, false, Math.PI * 0.25]} />
        <meshStandardMaterial color={new THREE.Color(message.color).multiplyScalar(0.8)} />
      </mesh>
      
      {/* Glow Effect when unread */}
      {!message.isRead && (
          <pointLight distance={2} intensity={0.5} color={message.color} />
      )}

      {/* Label (Billboarding) */}
      <Html position={[0, -0.4, 0]} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-opacity duration-300 ${hovered ? 'opacity-100 bg-white/90 text-slate-900' : 'opacity-60 bg-black/50 text-white'}`}>
          From: {message.senderName}
        </div>
      </Html>
    </group>
  );
};
