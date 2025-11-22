import { GoogleGenAI } from "@google/genai";
import { BOARD_SIZE } from "./gameLogic";
import { Player } from "../types";

export const analyzeBoard = async (board: (Player | null)[], currentPlayer: Player): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "API Key not found. Cannot perform AI analysis.";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Construct a simple text representation of the board
    // Only include occupied cells to save tokens and keep it concise
    const moves: string[] = [];
    board.forEach((cell, index) => {
      if (cell) {
        const x = index % BOARD_SIZE;
        const y = Math.floor(index / BOARD_SIZE);
        // Convert to chess-like notation (e.g., A1, B2)
        const col = String.fromCharCode(65 + x);
        const row = 15 - y;
        moves.push(`${cell} at ${col}${row}`);
      }
    });

    if (moves.length === 0) {
      return "The board is empty. Go ahead and make the first move!";
    }

    const prompt = `
      You are a grandmaster referee of Gomoku (Five-in-a-Row).
      Analyze the current board state.
      Current Player to move: ${currentPlayer}.
      
      Occupied positions:
      ${moves.join(', ')}
      
      Provide a brief, 2-sentence commentary. 
      1. Who has the initiative/advantage?
      2. A subtle strategic tip for the current player without giving the exact coordinate.
      Keep it Zen, wise, and encouraging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "The spirits of the board are silent.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "The sage is currently meditating (AI service unavailable).";
  }
};
