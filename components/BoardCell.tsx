import React from 'react';
import { Player } from '../types';

interface BoardCellProps {
  index: number;
  player: Player | null;
  isLastMove: boolean;
  isWinningStone: boolean;
  onClick: (index: number) => void;
  disabled: boolean;
}

const BoardCell: React.FC<BoardCellProps> = ({ 
  index, 
  player, 
  isLastMove, 
  isWinningStone, 
  onClick, 
  disabled 
}) => {
  const x = index % 15;
  const y = Math.floor(index / 15);

  // Grid line logic
  const isLeftEdge = x === 0;
  const isRightEdge = x === 14;
  const isTopEdge = y === 0;
  const isBottomEdge = y === 14;

  // Center dot points (star points) for standard 15x15 board
  // Usually at 3,3 (D4), 3,11 (D12), 7,7 (H8), 11,3 (L4), 11,11 (L12)
  const isStarPoint = 
    (x === 3 && y === 3) || 
    (x === 11 && y === 3) || 
    (x === 7 && y === 7) || 
    (x === 3 && y === 11) || 
    (x === 11 && y === 11);

  return (
    <div 
      className="relative w-full pb-[100%] cursor-pointer group select-none"
      onClick={() => !disabled && onClick(index)}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Horizontal Line */}
        <div 
          className={`absolute bg-stone-800 h-[1px] 
            ${isLeftEdge ? 'left-1/2 w-1/2' : ''} 
            ${isRightEdge ? 'right-1/2 w-1/2' : ''}
            ${!isLeftEdge && !isRightEdge ? 'w-full' : ''}
          `} 
        />
        
        {/* Vertical Line */}
        <div 
          className={`absolute bg-stone-800 w-[1px] 
            ${isTopEdge ? 'top-1/2 h-1/2' : ''} 
            ${isBottomEdge ? 'bottom-1/2 h-1/2' : ''}
            ${!isTopEdge && !isBottomEdge ? 'h-full' : ''}
          `} 
        />

        {/* Star Point Dot */}
        {isStarPoint && !player && (
          <div className="absolute w-1.5 h-1.5 bg-stone-800 rounded-full z-0" />
        )}

        {/* Hover Placeholder (Ghost Stone) */}
        {!player && !disabled && (
          <div className="absolute w-[80%] h-[80%] rounded-full opacity-0 group-hover:opacity-40 transition-opacity z-10 bg-stone-500/50 transform scale-90" />
        )}

        {/* Actual Stone */}
        {player && (
          <div 
            className={`
              absolute w-[85%] h-[85%] rounded-full z-20 transition-all duration-300
              ${player === 'Black' ? 'stone-black' : 'stone-white'}
              ${isLastMove ? 'ring-2 ring-red-500 ring-offset-1 ring-offset-transparent' : ''}
              ${isWinningStone ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-transparent scale-105' : ''}
            `} 
          />
        )}
        
        {/* Last Move Indicator (Small dot on stone) */}
        {player && isLastMove && !isWinningStone && (
          <div className={`absolute w-1.5 h-1.5 rounded-full z-30 ${player === 'Black' ? 'bg-white/50' : 'bg-black/50'}`} />
        )}
      </div>
    </div>
  );
};

export default BoardCell;