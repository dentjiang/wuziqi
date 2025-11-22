export type Player = 'Black' | 'White';

export interface CellState {
  x: number;
  y: number;
  player: Player | null;
}

export interface WinResult {
  winner: Player;
  line: number[]; // Indices of the winning stones
}

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  winner: Player | null;
  winningLine: number[] | null;
  history: number[]; // Indices of moves
}
