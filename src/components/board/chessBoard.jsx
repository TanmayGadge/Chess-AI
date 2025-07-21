import React, { useRef, useState, useEffect } from "react";
import useFEN from "../../hooks/useFEN";
import Tile from "../tile/tile";
import dropSound from '../../sound-effect/drop.mp3';
import captureSound from '../../sound-effect/capture.mp3';

import useSound from "use-sound";

const ChessBoard = ({ fen, onDataSend }) => {
  let activePiece = null;
  let originalPosition = { row: -1, col: -1 };

  const chessBoardRef = useRef(null);
  const [boardState, setBoardState] = useState(() => useFEN(fen));
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);

  const sendDataToParent = ()=>{
    onDataSend(isWhiteTurn)
  }
  
  useEffect(()=>{
    sendDataToParent();
  }, [isWhiteTurn])

  //Capturing Pieces
  const [capturedPieces, setCapturedPieces] = useState({
    white: [],
    black: [],
  });

  const [playDrop] = useSound(dropSound);
  const [playCapture] = useSound(captureSound);

  const getSquareFromCoords = (x, y) => {
    const chessboard = chessBoardRef.current;
    if (!chessboard) return null;

    const rect = chessboard.getBoundingClientRect();
    const tileSize = getTileSize();

    const relativeX = x - rect.left;
    const relativeY = y - rect.top;

    const col = Math.floor(relativeX / tileSize);
    const row = Math.floor(relativeY / tileSize);

    // Check if within bounds
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      return { row, col };
    }
    return null;
  };

  const getPiecePosition = (element) => {
    // You'll need to add data attributes to track position
    const row = parseInt(element.dataset.row);
    const col = parseInt(element.dataset.col);
    return { row, col };
  };

  function updateBoardState(from, to) {
    setBoardState((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      const piece = newBoard[from.row][from.col];
      newBoard[from.row][from.col] = null;
      newBoard[to.row][to.col] = piece;
      return newBoard;
    });
  }

  function isPathClear(from, to) {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    // Get direction of movement
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    // Check each square along the path (excluding destination)
    while (currentRow !== to.row || currentCol !== to.col) {
      if (boardState[currentRow][currentCol] !== null) {
        return false; // Path is blocked
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }
  function isValidMove(from, to) {
    // Don't allow moving to the same square
    if (from.row === to.row && from.col === to.col) {
      return false;
    }

    // Check bounds
    if (
      from.row < 0 ||
      from.row > 7 ||
      from.col < 0 ||
      from.col > 7 ||
      to.row < 0 ||
      to.row > 7 ||
      to.col < 0 ||
      to.col > 7
    ) {
      return false;
    }

    // Check if there's a piece at the source position
    const movingPiece = boardState[from.row][from.col];
    if (!movingPiece) {
      return false;
    }

    // Check if target square is empty or contains opponent piece
    const targetPiece = boardState[to.row][to.col];

    if (targetPiece) {
      // Check if it's an opponent piece (different case = different color)
      const movingPieceColor =
        movingPiece === movingPiece.toLowerCase() ? "black" : "white";
      const targetPieceColor =
        targetPiece === targetPiece.toLowerCase() ? "black" : "white";

      if (movingPieceColor === targetPieceColor) {
        return false; // Can't capture own piece
      } else {
        
        playCapture();

        if (targetPieceColor === "black") {
          setCapturedPieces((prev) => {
            return {
              ...prev,
              black: [...prev.black, targetPiece],
            };
          });
        } else {
          setCapturedPieces((prev) => {
            return {
              ...prev,
              white: [...prev.white, targetPiece],
            };
          });
        }
      }
    }

    // console.log('Validating move:', { from, to, movingPiece, targetPiece });

    // Check if it's a valid move for the piece type
    switch (movingPiece.toLowerCase()) {
      case "r":
        return isValidRookMove(from, to);
      case "n":
        return isValidKnightMove(from, to);
      case "b":
        return isValidBishopMove(from, to);
      case "q":
        return isValidQueenMove(from, to);
      case "k":
        return isValidKingMove(from, to);
      case "p":
        return isValidPawnMove(from, to, movingPiece);
      default:
        return false;
    }
  }

  function isValidRookMove(from, to) {
    // Must move either horizontally or vertically, not both
    if (from.row !== to.row && from.col !== to.col) {
      return false;
    }

    // Check if path is clear
    return isPathClear(from, to);
  }

  function isValidKingMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    // King can move only one square in any direction
    return rowDiff <= 1 && colDiff <= 1;
  }

  function isValidKnightMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    // Knight moves in L-shape: 2 squares in one direction, 1 in perpendicular
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  function isValidQueenMove(from, to) {
    return isValidRookMove(from, to) || isValidBishopMove(from, to);
  }

  function isValidBishopMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    // Must move diagonally (equal row and column differences)
    if (rowDiff !== colDiff) {
      return false;
    }

    // Check if path is clear
    return isPathClear(from, to);
  }
  function isValidPawnMove(from, to, movingPiece) {
    const isWhite = movingPiece === movingPiece.toUpperCase();
    const direction = isWhite ? -1 : 1; // White moves up (decreasing row), black moves down (increasing row)

    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);

    const targetPiece = boardState[to.row][to.col];

    // Forward movement (no capture)
    if (colDiff === 0 && !targetPiece) {
      // One square forward
      if (rowDiff === direction) {
        return true;
      }

      // Two squares forward from starting position
      const startingRow = isWhite ? 6 : 1;
      if (from.row === startingRow && rowDiff === 2 * direction) {
        return true;
      }
    }

    // Diagonal capture
    if (colDiff === 1 && rowDiff === direction && targetPiece) {
      return true;
    }

    return false;
  }

  const getTileSize = () => {
    if (chessBoardRef.current) {
      return chessBoardRef.current.offsetWidth / 8;
    }
    return 70; // fallback
  };

  const getPixelPosition = (row, col) => {
    const chessboard = chessBoardRef.current;
    if (!chessboard) return { x: 0, y: 0 };

    const rect = chessboard.getBoundingClientRect();
    const tileSize = getTileSize();

    const x = col * tileSize + tileSize / 2 - 35; // -35 to center the piece
    const y = row * tileSize + tileSize / 2 - 35;

    return { x: x + rect.left, y: y + rect.top };
  };
  function grabPiece(e) {
    const element = e.target;

    if (element.classList.contains("chess-piece")) {
      element.classList.add("grabbed-piece");

      const piecePosition = getPiecePosition(element);
      const piece = boardState[piecePosition.row][piecePosition.col];

      const isPieceWhite = piece === piece.toUpperCase();

      if ((isPieceWhite && !isWhiteTurn) || (!isPieceWhite && isWhiteTurn)) {
        return;
      }

      originalPosition = getPiecePosition(element);

      const x = e.clientX - 35;
      const y = e.clientY - 35;

      element.style.position = "fixed"; // Use fixed instead of absolute
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.zIndex = "1000";
      activePiece = element;
    }
  }

  function movePiece(e) {
    if (activePiece) {
      const x = e.clientX - 35;
      const y = e.clientY - 35;

      activePiece.style.position = "fixed";
      activePiece.style.left = `${x}px`;
      activePiece.style.top = `${y}px`;
    }
  }

  function dropPiece(e) {
    if (activePiece) {
      const targetSquare = getSquareFromCoords(e.clientX, e.clientY);

      if (targetSquare && isValidMove(originalPosition, targetSquare)) {
        // Valid move - snap to center of target square
        const pixelPos = getPixelPosition(targetSquare.row, targetSquare.col);

        activePiece.style.position = "fixed";
        activePiece.style.left = `${pixelPos.x}px`;
        activePiece.style.top = `${pixelPos.y}px`;

        // Update board state
        updateBoardState(originalPosition, targetSquare);
        setIsWhiteTurn(!isWhiteTurn);
        playDrop()

        // Update piece data attributes
        activePiece.dataset.row = targetSquare.row;
        activePiece.dataset.col = targetSquare.col;
      } else {
        // Invalid move - reset piece to original tile position
        activePiece.style.position = "static";
        activePiece.style.left = "";
        activePiece.style.top = "";
        activePiece.style.transform = "";
      }

      // Always clean up regardless of move validity
      activePiece.classList.remove("grabbed-piece");
      activePiece.style.zIndex = "";
      activePiece = null;
      originalPosition = { row: -1, col: -1 };
    }
  }

  let chessBoard = [];
  let key = 0;

  boardState.forEach((row, rowIndex) => {
    row.forEach((piece, pieceIndex) => {
      let pieceName = null;
      let pieceColor = null;
      let type = null;

      if (piece) {
        if (piece == piece.toLowerCase()) {
          pieceColor = "black";
        } else {
          pieceColor = "white";
        }
        switch (piece.toLowerCase()) {
          case "r":
            type = "rook";
            break;
          case "n":
            type = "knight";
            break;
          case "b":
            type = "bishop";
            break;
          case "q":
            type = "queen";
            break;
          case "k":
            type = "king";
            break;
          case "p":
            type = "pawn";
            break;
        }
      }

      pieceName = type && `${pieceColor}-${type}`;

      chessBoard.push(
        <Tile
          key={key}
          number={rowIndex + pieceIndex}
          image={pieceName && `/${pieceName}.svg`}
          row={rowIndex}
          col={pieceIndex}
        />
      );
      key++;
    });
  });

  return (
    <div
      className="mx-auto w-[100vh] h-screen grid grid-cols-[repeat(8,1fr)] grid-rows-[repeat(8,1fr)] p-4"
      ref={chessBoardRef}
      onMouseDown={(e) => {
        grabPiece(e);
      }}
      onMouseMove={(e) => {
        movePiece(e);
      }}
      onMouseUp={(e) => {
        dropPiece(e);
      }}
    >
      {chessBoard}
    </div>
  );
};

export default ChessBoard;
