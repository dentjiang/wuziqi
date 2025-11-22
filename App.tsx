import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BOARD_SIZE, checkWin } from './services/gameLogic';
import { Player } from './types';
import BoardCell from './components/BoardCell';
import { analyzeBoard } from './services/geminiService';
import { 
  RefreshCw, 
  RotateCcw, 
  BrainCircuit, 
  Trophy, 
  Info,
  Circle,
  CircleDot
} from 'lucide-react';

const App: React.FC = () => {
  // Game State
  const [board, setBoard] = useState<(Player | null)[]>(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('Black');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Audio refs
  const placeSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize simple oscillator sounds if desired, or just placeholders.
    // For this implementation, we will skip actual audio file loading to keep it self-contained
    // and just use visual feedback.
  }, []);

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    const newHistory = [...history, index];
    setHistory(newHistory);

    // Check for win
    const winLine = checkWin(newBoard, index, currentPlayer);
    
    if (winLine) {
      setWinner(currentPlayer);
      setWinningLine(winLine);
      setAiAnalysis(null); // Clear previous analysis
    } else {
      setCurrentPlayer(currentPlayer === 'Black' ? 'White' : 'Black');
    }
  }, [board, currentPlayer, winner, history]);

  const handleRestart = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setCurrentPlayer('Black');
    setWinner(null);
    setWinningLine([]);
    setHistory([]);
    setAiAnalysis(null);
  };

  const handleUndo = () => {
    if (history.length === 0 || winner) return;
    
    const lastMoveIndex = history[history.length - 1];
    const newBoard = [...board];
    newBoard[lastMoveIndex] = null;
    
    setBoard(newBoard);
    setHistory(history.slice(0, -1));
    setCurrentPlayer(currentPlayer === 'Black' ? 'White' : 'Black');
    setAiAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (isAnalyzing || history.length === 0) return;
    
    setIsAnalyzing(true);
    setAiAnalysis("Consulting the sage...");
    
    const analysis = await analyzeBoard(board, currentPlayer);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const lastMoveIndex = history.length > 0 ? history[history.length - 1] : -1;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 font-sans selection:bg-amber-200">
      
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-stone-800 mb-2 tracking-tight">Zen Gomoku</h1>
        <p className="text-stone-500 text-sm">Five-in-a-Row • 2 Players</p>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 items-start px-4 w-full max-w-6xl justify-center">
        
        {/* Left Panel: Status & AI */}
        <div className="flex flex-col gap-4 w-full lg:w-64 shrink-0 order-2 lg:order-1">
          
          {/* Player Status Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
             {winner ? (
                <div className="text-center animate-bounce-slow">
                  <div className="flex justify-center mb-2 text-amber-500">
                    <Trophy size={48} />
                  </div>
                  <h2 className="text-xl font-bold text-stone-800">{winner} Wins!</h2>
                  <p className="text-stone-500 text-sm mt-1">A masterful victory.</p>
                </div>
             ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Current Turn</span>
                  <div className={`flex items-center gap-3 text-2xl font-bold transition-colors duration-300
                    ${currentPlayer === 'Black' ? 'text-stone-900' : 'text-stone-500'}
                  `}>
                    <div className={`w-4 h-4 rounded-full shadow-sm ${currentPlayer === 'Black' ? 'stone-black' : 'stone-white ring-1 ring-stone-200'}`}></div>
                    {currentPlayer}
                  </div>
                </div>
             )}
          </div>

          {/* AI Advisor Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 overflow-hidden relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-stone-700 flex items-center gap-2">
                <BrainCircuit size={18} className="text-amber-600"/>
                Sage's Advice
              </h3>
            </div>
            
            <div className="bg-stone-50 rounded-lg p-3 text-sm text-stone-600 min-h-[80px] leading-relaxed italic border border-stone-100">
               {aiAnalysis || "Click the button below to ask the AI for a situation analysis."}
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !!winner || history.length === 0}
              className="mt-3 w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <span className="animate-pulse">Thinking...</span>
              ) : (
                <>Analyze Board</>
              )}
            </button>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={handleUndo} 
               disabled={history.length === 0 || !!winner}
               className="flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 py-3 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               title="Undo Last Move"
             >
               <RotateCcw size={18} />
               <span>Undo</span>
             </button>
             <button 
               onClick={handleRestart}
               className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 text-white py-3 rounded-xl shadow-lg transition-all active:scale-95"
               title="Restart Game"
             >
               <RefreshCw size={18} />
               <span>Reset</span>
             </button>
          </div>

        </div>

        {/* Center: The Board */}
        <div className="relative order-1 lg:order-2">
           {/* Wood Texture Background container */}
           <div className="bg-[#eecfa1] p-4 md:p-8 rounded shadow-2xl relative select-none">
              
              {/* Decorative border inset */}
              <div className="absolute inset-2 border border-[#dcb386] rounded pointer-events-none"></div>

              {/* The Grid */}
              <div 
                className="grid grid-cols-[repeat(15,minmax(0,1fr))] bg-[#eecfa1] w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[540px] md:h-[540px]"
                style={{ width: 'min(90vw, 540px)', height: 'min(90vw, 540px)' }}
              >
                {board.map((cellState, index) => (
                  <BoardCell
                    key={index}
                    index={index}
                    player={cellState}
                    isLastMove={index === lastMoveIndex}
                    isWinningStone={winningLine.includes(index)}
                    onClick={handleCellClick}
                    disabled={!!winner}
                  />
                ))}
              </div>
           </div>

           {/* Mobile Only: Game Info beneath board */}
           <div className="lg:hidden mt-4 text-center text-stone-500 text-sm flex items-center justify-center gap-2">
              <Info size={14} />
              <span>Black plays first. Align 5 to win.</span>
           </div>
        </div>

        {/* Right Panel: History (Desktop Only) */}
        <div className="hidden lg:flex flex-col w-48 shrink-0 h-[600px] order-3">
           <div className="bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-stone-100 bg-stone-50">
                <h3 className="font-semibold text-stone-700">Move History</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-stone-200">
                {history.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-sm">
                    No moves yet
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-stone-500 uppercase bg-stone-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 font-medium">#</th>
                        <th className="px-4 py-2 font-medium">Player</th>
                        <th className="px-4 py-2 font-medium text-right">Pos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((moveIndex, i) => {
                         const x = moveIndex % BOARD_SIZE;
                         const y = Math.floor(moveIndex / BOARD_SIZE);
                         const col = String.fromCharCode(65 + x);
                         const row = 15 - y;
                         return (
                           <tr key={i} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                             <td className="px-4 py-2 text-stone-400 font-mono text-xs">{i + 1}</td>
                             <td className="px-4 py-2">
                               <div className="flex items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-black' : 'bg-stone-200 ring-1 ring-stone-400'}`}></div>
                                 <span className="font-medium text-stone-700">{i % 2 === 0 ? 'Black' : 'White'}</span>
                               </div>
                             </td>
                             <td className="px-4 py-2 text-right font-mono text-stone-600">{col}{row}</td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;