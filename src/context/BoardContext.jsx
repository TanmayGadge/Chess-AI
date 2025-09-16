import { createContext, useContext, useState, useRef } from "react";
import useFEN from "../hooks/useFEN";

const BoardContext = createContext();

export const useBoard = () => {
  return useContext(BoardContext);
};

export const BoardProvider = ({ children }) => {
  const startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  const [boardState, setBoardState] = useState(() => useFEN(startingFEN));
  const [prevBoardState, setPrevBoardState] = useState(null);
  const [capturedPieces, setCapturedPieces] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("white");
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionPosition, setPromotionPosition] = useState(null);
  const [promotionColor, setPromotionColor] = useState(null);
  const [pendingPlayerSwitch, setPendingPlayerSwitch] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [isAIGame, setIsAIGame] = useState(true);
  const [depth, setDepth] = useState(4);

  const numberOfMoves = useRef(0);

  function completePawnPromotion(pieceType) {
    if (!promotionPosition || !promotionColor) return;

    const promotedPiece =
      promotionColor === "white"
        ? pieceType.toUpperCase()
        : pieceType.toLowerCase();

    setBoardState((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      newBoard[promotionPosition.row][promotionPosition.col] = promotedPiece;
      return newBoard;
    });

    setShowPromotionModal(false);
    setPromotionPosition(null);
    setPromotionColor(null);

    // Now switch the player after promotion is complete
    if (pendingPlayerSwitch) {
      setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
      setPendingPlayerSwitch(false);
    }

    // Check for game end conditions after promotion
    setTimeout(() => {
      const nextPlayer = currentPlayer === "white" ? "black" : "white";
      const newBoardState = [...boardState];
      newBoardState[promotionPosition.row][promotionPosition.col] =
        promotedPiece;

      if (isCheckmate(nextPlayer, newBoardState)) {
        alert(`Checkmate! ${currentPlayer} wins!`);
      } else if (isStalemate(nextPlayer, newBoardState)) {
        alert("Stalemate! It's a draw!");
      } else if (isKingInCheck(nextPlayer, newBoardState)) {
        alert(`Check! ${nextPlayer} king is under attack.`);
      }
    }, 100);
  }

  return (
    <BoardContext.Provider
      value={{
        boardState,
        setBoardState,
        prevBoardState,
        setPrevBoardState,
        capturedPieces,
        setCapturedPieces,
        currentPlayer,
        setCurrentPlayer,
        showPromotionModal,
        setShowPromotionModal,
        promotionPosition,
        setPromotionPosition,
        promotionColor,
        setPromotionColor,
        pendingPlayerSwitch,
        setPendingPlayerSwitch,
        completePawnPromotion,
        numberOfMoves,
        moveHistory,
        setMoveHistory,
        gameState,
        setGameState,
        isAIGame,
        setIsAIGame,
        depth,
        setDepth
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
