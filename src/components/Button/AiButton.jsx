import React from "react";
import { useBoard } from "../../context/BoardContext";

const AiButton = () => {

    const {isAIGame, setIsAIGame} = useBoard();

  return (
    <button
      className=" top-10 right-10 p-2 rounded-lg bg-white"
      onClick={() => {
        setIsAIGame((prev)=> {return !prev})
      }}
    >
      {isAIGame ? "Play against human" : "Play Against AI"}
    </button>
  );
};

export default AiButton;
