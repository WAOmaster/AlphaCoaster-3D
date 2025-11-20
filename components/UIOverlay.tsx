import React from 'react';
import { AlphabetItem, GameState } from '../types';
import { ArrowRight, Play, Volume2, Sparkles, RotateCcw } from 'lucide-react';

interface UIOverlayProps {
  gameState: GameState;
  currentItem: AlphabetItem;
  birdMessage: string;
  onNext: () => void;
  onStart: () => void;
  onReplayAudio: () => void;
  onRestart: () => void;
  isLoading: boolean;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  gameState,
  currentItem,
  birdMessage,
  onNext,
  onStart,
  onReplayAudio,
  onRestart,
  isLoading
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-8 z-10">
      {/* Top Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-xl border-b-4 border-blue-300">
          <h1 className="text-2xl sm:text-3xl text-blue-600 font-extrabold tracking-wider flex items-center gap-2">
             AlphaCoaster <span className="text-3xl">🎢</span>
          </h1>
        </div>
        <button onClick={onRestart} className="bg-white/80 p-2 rounded-full hover:bg-white transition">
           <RotateCcw className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Center Content based on State */}
      <div className="flex-1 flex items-center justify-center pointer-events-auto">
        
        {gameState === GameState.INTRO && (
          <div className="bg-white/95 p-8 rounded-[2rem] shadow-2xl text-center max-w-md border-4 border-yellow-400 transform hover:scale-105 transition duration-300">
            <div className="text-6xl mb-4 animate-bounce">🐦</div>
            <h2 className="text-3xl font-bold text-purple-600 mb-4">Ready to Learn?</h2>
            <p className="text-gray-600 text-lg mb-8 font-bold">
              Hop on the roller coaster and meet new friends with the Alphabet Bird!
            </p>
            <button 
              onClick={onStart}
              className="bg-gradient-to-b from-green-400 to-green-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-green-300/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mx-auto w-full"
            >
              <Play fill="currentColor" /> START RIDE
            </button>
          </div>
        )}

        {gameState === GameState.LEARNING && (
          <div className="flex flex-col items-center animate-fade-in-up">
            {/* Bird Message Bubble */}
            <div className="bg-white/95 p-6 rounded-3xl shadow-xl mb-6 max-w-lg border-4 border-yellow-400 relative">
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-r-4 border-b-4 border-yellow-400 rotate-45"></div>
              <p className="text-xl sm:text-2xl text-gray-700 font-bold text-center leading-relaxed">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="animate-spin text-yellow-500" /> Thinking...
                  </span>
                ) : (
                  `"${birdMessage}"`
                )}
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex gap-4">
              <button 
                onClick={onReplayAudio}
                className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-full shadow-lg transition transform hover:scale-110"
                aria-label="Replay Sound"
              >
                <Volume2 className="w-8 h-8" />
              </button>
              <button 
                onClick={onNext}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full shadow-lg text-2xl font-bold transition transform hover:scale-105 flex items-center gap-2"
              >
                Next <ArrowRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.COMPLETED && (
          <div className="bg-white/95 p-8 rounded-[2rem] shadow-2xl text-center">
             <div className="text-6xl mb-4">🎉</div>
             <h2 className="text-4xl font-bold text-purple-600 mb-4">Great Job!</h2>
             <p className="text-xl text-gray-600 mb-8">You finished the whole alphabet!</p>
             <button 
              onClick={onRestart}
              className="bg-blue-500 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition"
            >
              Play Again
            </button>
          </div>
        )}

      </div>

      {/* Bottom Info */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl mx-auto mb-4 border-2 border-white/50 shadow-sm pointer-events-none">
        <div className="flex gap-8 text-lg font-bold text-gray-600">
           <span>Letter: <span className="text-blue-600 text-2xl">{currentItem.letter}</span></span>
           <span>Word: <span className="text-purple-600 text-2xl">{currentItem.word}</span></span>
        </div>
      </div>
    </div>
  );
};