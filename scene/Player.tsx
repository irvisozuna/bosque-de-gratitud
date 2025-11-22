import React, { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SPEED = 5.0;
const keys = {
  KeyW: false,
  KeyS: false,
  KeyA: false,
  KeyD: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

export const Player: React.FC<{ active: boolean }> = ({ active }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code as keyof typeof keys] = true;
        }
    };
    const onKeyUp = (e: KeyboardEvent) => {
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code as keyof typeof keys] = false;
        }
    };
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!active) return;

    // Get forward vector from camera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    // Flatten to XZ plane (ignore looking up/down for movement direction)
    forward.y = 0;
    forward.normalize();

    // Get side vector (Cross product of Forward and Up)
    const side = new THREE.Vector3();
    side.crossVectors(forward, camera.up).normalize();

    // Determine movement direction based on keys
    const direction = new THREE.Vector3();
    
    // W/Up = Forward (+), S/Down = Backward (-)
    const forwardInput = Number(keys.KeyW || keys.ArrowUp) - Number(keys.KeyS || keys.ArrowDown);
    if (forwardInput !== 0) {
        direction.addScaledVector(forward, forwardInput);
    }

    // A/Left = Left (-), D/Right = Right (+)
    // Side vector is "Right".
    const sideInput = Number(keys.KeyD || keys.ArrowRight) - Number(keys.KeyA || keys.ArrowLeft);
    if (sideInput !== 0) {
        direction.addScaledVector(side, sideInput);
    }

    // Normalize and move
    if (direction.lengthSq() > 0) {
        direction.normalize().multiplyScalar(SPEED * delta);
        camera.position.add(direction);
    }

    // Head Bobbing & Height Management
    const isMoving = forwardInput !== 0 || sideInput !== 0;
    if (isMoving) {
        const time = state.clock.getElapsedTime();
        // Bob frequency: 10, Amplitude: 0.05
        camera.position.y = 2 + Math.sin(time * 12) * 0.08;
    } else {
        // Smooth return to default height
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2, delta * 5);
    }
  });

  return null;
};