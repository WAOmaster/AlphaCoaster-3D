export enum GameState {
  INTRO = 'INTRO',
  RIDING = 'RIDING',
  LEARNING = 'LEARNING',
  COMPLETED = 'COMPLETED'
}

export interface AlphabetItem {
  letter: string;
  word: string;
  emoji: string;
  color: string;
}

export interface BirdMessage {
  text: string;
  isLoading: boolean;
}

// Props for the main scene
export interface ExperienceProps {
  targetIndex: number;
  setGameState: (state: GameState) => void;
  gameState: GameState;
  onReachStation: (index: number) => void;
}