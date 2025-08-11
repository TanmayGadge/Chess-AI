import { createContext, useContext, useState } from "react";
import useFEN from "../hooks/useFEN";

const BoardContext = createContext();

export const useBoard = () => {
  return useContext(BoardContext);
};

export const BoardProvider = ({ children }) => {
  let startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  const [boardState, setBoardState] = useState(() => useFEN(startingFEN));
  const [prevBoardState, setPrevBoardState] = useState(null);
  // const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [capturedPieces, setCapturedPieces] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("white");

  return (
    <BoardContext.Provider
      value={{
        boardState,
        setBoardState,
        prevBoardState,
        setPrevBoardState,
        // isWhiteTurn,
        // setIsWhiteTurn,
        capturedPieces,
        setCapturedPieces,
        currentPlayer,
        setCurrentPlayer,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
