import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { GratitudeTree } from './GratitudeTree';
import { Forest } from './Forest';
import { Snow } from './Snow';
import { Envelope } from './Envelope';
import { Player } from './Player';
import { Elf } from './Elf';
import { Message } from '../types';

interface ExperienceProps {
  messages: Message[];
  onOpenMessage: (msg: Message) => void;
  isLocked: boolean; // Controls if mouse is captured
  onElfChatToggle: (isOpen: boolean) => void;
}

export const Experience: React.FC<ExperienceProps> = ({ messages, onOpenMessage, isLocked, onElfChatToggle }) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={60} />
        
        {/* FPS Controls: Only active when "locked" into the game */}
        {/* This enables Mouse Look automatically when locked */}
        {isLocked && <PointerLockControls makeDefault selector="#root" />}
        
        {/* Handle WASD Movement */}
        <Player active={isLocked} />

        {/* Lighting */}
        <ambientLight intensity={0.2} color="#1e293b" />
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={2} 
          castShadow 
          shadow-mapSize={[1024, 1024]} 
          color="#e2e8f0"
        />
        
        {/* Warm light from the tree area */}
        <pointLight position={[0, 2, 0]} intensity={1} color="#fcd34d" distance={10} decay={2} />

        <Suspense fallback={null}>
          <GratitudeTree />
          <Forest />
          <Snow count={800} />

          {/* AI Guide Elf - Positioned to the right of the spawn */}
          <Elf 
             position={[2.5, 0, 4]} 
             rotation={[0, -0.5, 0]} 
             onChatStart={() => onElfChatToggle(true)}
             onChatEnd={() => onElfChatToggle(false)}
          />
          
          {/* Environment for reflections */}
          <Environment preset="night" />
          
          {/* Render Messages */}
          {messages.map((msg) => (
            <Envelope key={msg.id} message={msg} onOpen={onOpenMessage} />
          ))}
        </Suspense>

        {/* Fog for depth */}
        <fog attach="fog" args={['#0f172a', 5, 25]} />
      </Canvas>
    </div>
  );
};