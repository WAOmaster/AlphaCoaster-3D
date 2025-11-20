import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { ALPHABET_DATA } from './constants';
import { GameState } from './types';
import { generateBirdFunFact } from './services/geminiService';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [birdMessage, setBirdMessage] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  const currentItem = ALPHABET_DATA[currentIndex];

  // Speech Synthesis Setup
  const speak = useCallback((text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop previous
        const utterance = new SpeechSynthesisUtterance(text);
        // Try to find a cheerful voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.pitch = 1.2; // Slightly higher pitch for "cute bird"
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error("Speech synthesis error:", e);
    }
  }, []);

  const handleStart = () => {
    setGameState(GameState.RIDING);
    // Initial ride start audio
    speak("Here we go! Hold on tight!");
  };

  const handleNext = () => {
    if (currentIndex < ALPHABET_DATA.length - 1) {
      setGameState(GameState.RIDING);
      setCurrentIndex(prev => prev + 1);
      // Clear message while moving
      setBirdMessage(''); 
    } else {
      setGameState(GameState.COMPLETED);
      speak("We did it! We learned the whole alphabet!");
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setGameState(GameState.INTRO);
    setBirdMessage('');
    window.speechSynthesis.cancel();
  };

  const handleReachStation = async (index: number) => {
    if (gameState !== GameState.RIDING) return; // Prevent double triggers
    
    setGameState(GameState.LEARNING);
    const item = ALPHABET_DATA[index];
    
    setIsGeminiLoading(true);
    
    // 1. Immediate feedback
    const intro = `${item.letter} is for ${item.word}.`;
    speak(intro);

    // 2. Fetch fun fact
    const funFact = await generateBirdFunFact(item);
    setBirdMessage(funFact);
    setIsGeminiLoading(false);
    
    // 3. Speak fun fact
    speak(funFact);
  };

  const handleReplayAudio = () => {
    const item = ALPHABET_DATA[currentIndex];
    const text = birdMessage || `${item.letter} is for ${item.word}.`;
    speak(text);
  };

  // Preload voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Trigger voice loading
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <div className="w-full h-screen relative bg-sky-300">
      {/* 3D Canvas */}
      <Canvas shadows className="w-full h-full">
        <Experience 
          targetIndex={currentIndex} 
          gameState={gameState}
          setGameState={setGameState}
          onReachStation={handleReachStation}
          birdMessage={birdMessage}
        />
      </Canvas>
      <Loader />

      {/* UI Layer */}
      <UIOverlay 
        gameState={gameState}
        currentItem={currentItem}
        birdMessage={birdMessage}
        onNext={handleNext}
        onStart={handleStart}
        onReplayAudio={handleReplayAudio}
        onRestart={handleRestart}
        isLoading={isGeminiLoading}
      />
    </div>
  );
};

export default App;