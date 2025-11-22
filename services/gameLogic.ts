import { Player } from '../types';

export const BOARD_SIZE = 15;

export const checkWin = (board: (Player | null)[], lastMoveIndex: number, player: Player): number[] | null => {
  if (lastMoveIndex < 0) return null;

  const x = lastMoveIndex % BOARD_SIZE;
  const y = Math.floor(lastMoveIndex / BOARD_SIZE);

  const directions = [
    [1, 0],   // Horizontal
    [0, 1],   // Vertical
    [1, 1],   // Diagonal Down-Right
    [1, -1]   // Diagonal Up-Right
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    const line = [lastMoveIndex];

    // Check forward direction
    for (let i = 1; i < 5; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
      const index = ny * BOARD_SIZE + nx;
      if (board[index] === player) {
        count++;
        line.push(index);
      } else {
        break;
      }
    }

    // Check backward direction
    for (let i = 1; i < 5; i++) {
      const nx = x - dx * i;
      const ny = y - dy * i;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
      const index = ny * BOARD_SIZE + nx;
      if (board[index] === player) {
        count++;
        line.push(index);
      } else {
        break;
      }
    }

    if (count >= 5) {
      return line;
    }
  }

  return null;
};
