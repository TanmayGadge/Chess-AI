import React from "react";

import { useBoard } from "../../context/BoardContext";

const UndoButton = () => {
  const { setBoardState, prevBoardState, setIsWhiteTurn } = useBoard();

  return (
    <button
      className=" top-10 left-10 p-2 rounded-lg bg-white"
      onClick={() => {
        setBoardState(prevBoardState);
        setIsWhiteTurn((prev) => !prev);
      }}
    >
      Undo
    </button>
  );
};

export default UndoButton;
