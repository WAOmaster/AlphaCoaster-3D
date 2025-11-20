import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  Text, 
  Float, 
  PerspectiveCamera, 
  Stars, 
  Cloud,
  Center
} from '@react-three/drei';
import * as THREE from 'three';
import { ALPHABET_DATA, SCENARIO_COLORS } from '../constants';
import { GameState } from '../types';
import { Bird } from './Bird';

interface ExperienceProps {
  targetIndex: number;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onReachStation: (index: number) => void;
  birdMessage: string;
}

const TRACK_RADIUS = 30;
const TUBE_RADIUS = 0.4;

export const Experience: React.FC<ExperienceProps> = ({ 
  targetIndex, 
  gameState, 
  setGameState, 
  onReachStation,
  birdMessage
}) => {
  // Start slightly before 0 (at 0.85 of the loop) so we approach 'A' instead of spawning on it
  const scrollRef = useRef(0.85);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  // Create a closed loop track
  const curve = useMemo(() => {
    const points = [];
    for (let i = 0; i < ALPHABET_DATA.length; i++) {
      const angle = (i / ALPHABET_DATA.length) * Math.PI * 2;
      // Add some height variation (sine wave)
      const y = Math.sin(angle * 5) * 5 + Math.cos(angle * 2) * 3; 
      const x = Math.cos(angle) * TRACK_RADIUS;
      const z = Math.sin(angle) * TRACK_RADIUS;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points, true);
  }, []);

  // Generate track geometry
  const trackGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 200, TUBE_RADIUS, 8, true);
  }, [curve]);

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const totalStops = ALPHABET_DATA.length;
    // Determine target "t" (0 to 1) based on targetIndex
    const targetT = (targetIndex / totalStops) % 1;
    
    const speed = 0.15 * delta; 
    const currentT = scrollRef.current;

    let dist = targetT - currentT;
    
    // Handle wrap-around logic for the loop
    if (dist < -0.5) dist += 1;
    if (dist > 0.5) dist -= 1;

    const isMoving = gameState === GameState.RIDING || gameState === GameState.INTRO;

    if (isMoving) {
      // Accelerate/Move towards target
      // We use a threshold > 0.001 to decide if we are "there" yet
      if (Math.abs(dist) > 0.002) {
         // Simple linear move for consistent speed
         const step = Math.sign(dist) * Math.min(Math.abs(dist), speed);
         scrollRef.current = (scrollRef.current + step) % 1;
         // Handle negative modulo
         if (scrollRef.current < 0) scrollRef.current += 1;
      } else {
         // Arrived
         if (gameState === GameState.RIDING) {
            // Ensure we snap to the spot exactly to avoid drift
            scrollRef.current = targetT;
            onReachStation(targetIndex);
         }
      }
    }

    // Update Camera Position along the curve
    const t = scrollRef.current;
    const position = curve.getPointAt(t);
    const lookAt = curve.getPointAt((t + 0.02) % 1); // Look slightly ahead
    
    // Offset camera slightly up and back to feel like a cart
    // Calculate tangent/binormal for proper orientation
    const tangent = curve.getTangentAt(t).normalize();
    const normal = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    
    // Cart position is exactly on the line, Camera is offset
    const camOffset = new THREE.Vector3(0, 1.5, 0); // Up
    
    cameraRef.current.position.copy(position).add(camOffset);
    cameraRef.current.lookAt(lookAt.add(new THREE.Vector3(0, 0.5, 0)));
    
    // Bank the camera slightly based on curve
    cameraRef.current.up.copy(normal.add(binormal.multiplyScalar(0.2)).normalize());
  });

  // Determine environment colors based on progress
  const colorIndex = Math.floor((targetIndex / ALPHABET_DATA.length) * SCENARIO_COLORS.length) % SCENARIO_COLORS.length;
  const [skyColor, groundColor] = SCENARIO_COLORS[colorIndex];

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} fov={60} near={0.1} far={1000} />
      
      {/* Lighting & Env */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow />
      <Environment preset="city" /> 
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 5, 60]} />

      {/* Clouds for depth */}
      <Cloud position={[-10, 10, -10]} opacity={0.5} speed={0.2} />
      <Cloud position={[10, 5, -20]} opacity={0.5} speed={0.2} />

      {/* The Track */}
      <mesh geometry={trackGeometry}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* The Stations (Letters & Objects) */}
      {ALPHABET_DATA.map((item, index) => {
        const t = index / ALPHABET_DATA.length;
        const pos = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);
        
        // Position object slightly to the side of the track
        const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0,1,0)).normalize();
        const offsetPos = pos.clone().add(binormal.multiplyScalar(4)); // Push out to right
        const textPos = pos.clone().add(binormal.multiplyScalar(-4)); // Push out to left

        // Make them face the track center roughly
        const lookAtPos = pos.clone();

        return (
          <group key={index}>
             {/* The Object (Represented by Emoji Sprite/BillBoard for cuteness + ease) */}
             <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
               <group position={offsetPos} lookAt={() => lookAtPos}>
                  <Text
                    fontSize={4}
                    color={item.color}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.1}
                    outlineColor="white"
                  >
                    {item.emoji}
                  </Text>
                  <Text
                     position={[0, -3, 0]}
                     fontSize={1}
                     color="white"
                     anchorX="center"
                     anchorY="middle"
                     outlineWidth={0.05}
                     outlineColor="black"
                  >
                    {item.word}
                  </Text>
               </group>
             </Float>

             {/* The Letter */}
             <group position={textPos} lookAt={() => lookAtPos}>
                <Center>
                  <Text
                    fontSize={3}
                    color={item.color}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.1}
                    outlineColor="white"
                  >
                    {item.letter}
                  </Text>
                </Center>
             </group>
             
             {/* Station Platform */}
             <mesh position={[pos.x, pos.y - 2, pos.z]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[3, 32]} />
                <meshStandardMaterial color={item.color} transparent opacity={0.8} />
             </mesh>
          </group>
        );
      })}

      {/* The Bird Helper */}
      <BirdWithCamera 
         cameraRef={cameraRef} 
         isSpeaking={gameState === GameState.LEARNING} 
         message={birdMessage}
      />

    </>
  );
};

// Helper component to keep bird attached to camera view
const BirdWithCamera: React.FC<{ cameraRef: React.RefObject<THREE.Camera>, isSpeaking: boolean, message: string }> = ({ cameraRef, isSpeaking, message }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (cameraRef.current && groupRef.current) {
      const cam = cameraRef.current;
      // Position: 2 units in front, slightly to the right, slightly down
      const offset = new THREE.Vector3(0.8, -0.3, -2); 
      offset.applyQuaternion(cam.quaternion);
      groupRef.current.position.copy(cam.position).add(offset);
      
      // Face the camera
      groupRef.current.lookAt(cam.position);
    }
  });

  return (
    <group ref={groupRef}>
      <Bird position={[0, 0, 0]} isSpeaking={isSpeaking} message={message} />
    </group>
  );
}