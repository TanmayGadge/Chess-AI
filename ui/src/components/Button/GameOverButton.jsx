import React from "react";
import { useBoard } from "../../context/BoardContext";

const GameOverButton = () => {
  const { gameState, setGameState } = useBoard();
  React.useEffect(() => {
    console.log(`Game State: ${gameState}`);
  }, [gameState]);

  return (
    <button
      className=" top-10 right-10 p-2 rounded-lg bg-white"
      onClick={() => {
        if(gameState.toLowerCase() == 'playing'){
            setGameState("checkmate");
        }else if(gameState.toLowerCase() == 'checkmate'){
            setGameState("playing");
        }
      }}
    >
      Simulate Checkmate
    </button>
  );
};

export default GameOverButton;
