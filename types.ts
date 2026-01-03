export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WON = 'WON'
}

export interface Item {
  id: number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  type: string;
  kind: 'good' | 'bad';
  speed: number;
}

export interface Player {
  x: number; // Percentage 0-100
}