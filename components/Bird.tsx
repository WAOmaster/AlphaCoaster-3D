import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Html } from '@react-three/drei';

interface BirdProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isSpeaking: boolean;
  message: string;
}

export const Bird: React.FC<BirdProps> = ({ position, rotation = [0, 0, 0], isSpeaking, message }) => {
  const bodyRef = useRef<Mesh>(null);
  const wingLRef = useRef<Mesh>(null);
  const wingRRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bodyRef.current) {
      // Bobbing motion
      bodyRef.current.position.y = Math.sin(t * 3) * 0.1;
    }
    if (wingLRef.current && wingRRef.current) {
      // Flapping motion
      const flap = Math.sin(t * 15) * 0.5;
      wingLRef.current.rotation.z = flap;
      wingRRef.current.rotation.z = -flap;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Bird Body Group */}
      <group ref={bodyRef}>
        {/* Body */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* Beak */}
        <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.2, 16]} />
          <meshStandardMaterial color="#FF6B6B" />
        </mesh>

        {/* Eyes */}
        <mesh position={[0.1, 0.1, 0.22]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[-0.1, 0.1, 0.22]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>

        {/* Wings */}
        <group position={[0.25, 0, 0]} ref={wingLRef}>
          <mesh position={[0.15, 0, 0]}>
             <boxGeometry args={[0.3, 0.05, 0.2]} />
             <meshStandardMaterial color="#FBC02D" />
          </mesh>
        </group>
        <group position={[-0.25, 0, 0]} ref={wingRRef}>
           <mesh position={[-0.15, 0, 0]}>
             <boxGeometry args={[0.3, 0.05, 0.2]} />
             <meshStandardMaterial color="#FBC02D" />
          </mesh>
        </group>

        {/* Tail */}
        <mesh position={[0, 0, -0.25]} rotation={[-0.2, 0, 0]}>
           <coneGeometry args={[0.15, 0.4, 4]} />
           <meshStandardMaterial color="#FBC02D" />
        </mesh>

        {/* Message Bubble (Visual only, main UI handles text for readability) */}
        {isSpeaking && (
           <Html position={[0.5, 0.5, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
             <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-blue-400 w-32 text-xs text-center font-bold animate-pulse text-gray-800">
               Tweet!
             </div>
           </Html>
        )}
      </group>
    </group>
  );
};