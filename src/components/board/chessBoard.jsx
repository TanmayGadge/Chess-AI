import React, { useRef, useState } from "react";
import useFEN from "../../hooks/useFen";
import Tile from "../tile/tile";

const ChessBoard = ({ fen }) => {
  let activePiece = null;
  let originalPosition = { row: -1, col: -1 };

  const chessBoardRef = useRef(null);
  const [boardState, setBoardState] = useState(() => useFEN(fen));

  // Calculate tile size (assuming square tiles)
  const getTileSize = () => {
    if (chessBoardRef.current) {
      return chessBoardRef.current.offsetWidth / 8;
    }
    return 70; // fallback
  };

  // Convert mouse coordinates to board position
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

  // Get piece position from board state
  const getPiecePosition = (element) => {
    // You'll need to add data attributes to track position
    const row = parseInt(element.dataset.row);
    const col = parseInt(element.dataset.col);
    return { row, col };
  };

  // Convert board position to pixel coordinates (center of tile)
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
      
      // Store original position
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
        
        // Update piece data attributes
        activePiece.dataset.row = targetSquare.row;
        activePiece.dataset.col = targetSquare.col;
        
      } else {
        // Invalid move - snap back to original position
        const originalPixelPos = getPixelPosition(originalPosition.row, originalPosition.col);
        
        activePiece.style.position = "fixed";
        activePiece.style.left = `${originalPixelPos.x}px`;
        activePiece.style.top = `${originalPixelPos.y}px`;
      }
      
      // Clean up
      activePiece.classList.remove("grabbed-piece");
      activePiece.style.zIndex = "";
      activePiece = null;
      originalPosition = { row: -1, col: -1 };
    }
  }

  // Basic validation - you can expand this with chess rules
  function isValidMove(from, to) {
    // Don't allow moving to the same square
    if (from.row === to.row && from.col === to.col) {
      return false;
    }
    
    // Check if target square is empty or contains opponent piece
    const targetPiece = boardState[to.row][to.col];
    const movingPiece = boardState[from.row][from.col];
    
    if (targetPiece) {
      // Check if it's an opponent piece (different case = different color)
      const movingPieceColor = movingPiece === movingPiece.toLowerCase() ? 'black' : 'white';
      const targetPieceColor = targetPiece === targetPiece.toLowerCase() ? 'black' : 'white';
      
      if (movingPieceColor === targetPieceColor) {
        return false; // Can't capture own piece
      }
    }
    
    return true; // For now, allow all other moves
  }

  function updateBoardState(from, to) {
    setBoardState(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      const piece = newBoard[from.row][from.col];
      newBoard[from.row][from.col] = null;
      newBoard[to.row][to.col] = piece;
      return newBoard;
    });
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