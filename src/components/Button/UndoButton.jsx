import React from "react";

import { useBoard } from "../../context/BoardContext";

const UndoButton = () => {
  const { boardState, setBoardState, prevBoardState } = useBoard();

  return (
    <button
      className="fixed bottom-10 left-10 p-2 rounded-lg bg-white"
      onClick={() => {
        setBoardState(prevBoardState)
      }}
    >
      Undo
    </button>
  );
};

export default UndoButton;
