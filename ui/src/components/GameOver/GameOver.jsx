import React from "react";

import { useBoard } from "../../context/BoardContext";
import useFEN from "../../hooks/useFEN";

const GameOver = () => {
  const { gameState, setGameState, winner, setWinner, setBoardState, startingFEN } =
    useBoard();

  if (gameState?.toLowerCase() == "checkmate") {
    return (
      <div className="fixed left-[50%] top-[50%] w-[30%] h-[50%] border-black border-2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg ">
        <div className="flex flex-col items-center justify-evenly w-full h-full">
          <div className="">{`${winner} won by ${gameState}`}</div>
          <button
            className="p-3 border-2 border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
            onClick={() => {
              setBoardState(() => {
                return useFEN(startingFEN);
              });
              setGameState('playing');
              setWinner(null);
            }}
          >
            Restart
          </button>
        </div>
      </div>
    );
  }
};

export default GameOver;
