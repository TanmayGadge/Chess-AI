import React, { useRef, useState, useEffect } from "react";
import useFEN from "../../hooks/useFEN";
import Tile from "../tile/tile";
import dropSound from "../../sound-effect/drop.mp3";
import captureSound from "../../sound-effect/capture.mp3";

import useSound from "use-sound";

import { useBoard } from "../../context/BoardContext";

const ChessBoard = () => {
  let activePiece = null;
  let originalPosition = { row: -1, col: -1 };

  const chessBoardRef = useRef(null);

  const {
    boardState,
    setBoardState,
    prevBoardState,
    setPrevBoardState,
    capturedPieces,
    setCapturedPieces,
    currentPlayer,
    setCurrentPlayer,
  } = useBoard();

  // Add states for tracking castling rights and pawn promotion
  const [castlingRights, setCastlingRights] = useState({
    white: {
      kingMoved: false,
      kingSideRookMoved: false,
      queenSideRookMoved: false,
    },
    black: {
      kingMoved: false,
      kingSideRookMoved: false,
      queenSideRookMoved: false,
    },
  });

  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionPosition, setPromotionPosition] = useState(null);
  const [promotionColor, setPromotionColor] = useState(null);
  const [pendingPlayerSwitch, setPendingPlayerSwitch] = useState(false);

  console.log(`Current Player: ${currentPlayer}`);

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

    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      return { row, col };
    }
    return null;
  };

  const getPiecePosition = (element) => {
    const row = parseInt(element.dataset.row);
    const col = parseInt(element.dataset.col);
    return { row, col };
  };

  function updateBoardState(from, to, promotionPiece = null) {
    setPrevBoardState(boardState);

    setBoardState((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      const piece = newBoard[from.row][from.col];
      newBoard[from.row][from.col] = null;

      // Handle pawn promotion
      if (promotionPiece) {
        newBoard[to.row][to.col] = promotionPiece;
      } else {
        newBoard[to.row][to.col] = piece;
      }

      return newBoard;
    });

    // Update castling rights when king or rook moves
    updateCastlingRights(from, to);
  }

  function updateCastlingRights(from, to) {
    const piece = boardState[from.row][from.col];
    if (!piece) return;

    setCastlingRights((prev) => {
      const newRights = { ...prev };

      // If king moves
      if (piece.toLowerCase() === "k") {
        const color = piece === piece.toUpperCase() ? "white" : "black";
        newRights[color].kingMoved = true;
      }

      // If rook moves from starting position
      if (piece.toLowerCase() === "r") {
        const color = piece === piece.toUpperCase() ? "white" : "black";
        const startRow = color === "white" ? 7 : 0;

        if (from.row === startRow) {
          if (from.col === 0) {
            // Queen side rook
            newRights[color].queenSideRookMoved = true;
          } else if (from.col === 7) {
            // King side rook
            newRights[color].kingSideRookMoved = true;
          }
        }
      }

      return newRights;
    });
  }

  function isPathClear(from, to, board = boardState) {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row || currentCol !== to.col) {
      if (board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  function canCastle(color, side, board = boardState) {
    const rights = castlingRights[color];
    const row = color === "white" ? 7 : 0;
    const king = color === "white" ? "K" : "k";

    // Check if king or relevant rook has moved
    if (rights.kingMoved) return false;
    if (side === "king" && rights.kingSideRookMoved) return false;
    if (side === "queen" && rights.queenSideRookMoved) return false;

    // Check if king is currently in check
    if (isKingInCheck(color, board)) return false;

    // Check if pieces are in correct positions
    if (board[row][4] !== king) return false;

    if (side === "king") {
      const rook = color === "white" ? "R" : "r";
      if (board[row][7] !== rook) return false;

      // Check if squares between king and rook are empty
      if (board[row][5] !== null || board[row][6] !== null) return false;

      // Check if king would pass through or land on a square under attack
      const tempBoard1 = board.map((r) => [...r]);
      tempBoard1[row][4] = null;
      tempBoard1[row][5] = king;
      if (isKingInCheck(color, tempBoard1)) return false;

      const tempBoard2 = board.map((r) => [...r]);
      tempBoard2[row][4] = null;
      tempBoard2[row][6] = king;
      if (isKingInCheck(color, tempBoard2)) return false;
    } else {
      // queen side
      const rook = color === "white" ? "R" : "r";
      if (board[row][0] !== rook) return false;

      // Check if squares between king and rook are empty
      if (
        board[row][1] !== null ||
        board[row][2] !== null ||
        board[row][3] !== null
      )
        return false;

      // Check if king would pass through or land on a square under attack
      const tempBoard1 = board.map((r) => [...r]);
      tempBoard1[row][4] = null;
      tempBoard1[row][3] = king;
      if (isKingInCheck(color, tempBoard1)) return false;

      const tempBoard2 = board.map((r) => [...r]);
      tempBoard2[row][4] = null;
      tempBoard2[row][2] = king;
      if (isKingInCheck(color, tempBoard2)) return false;
    }

    return true;
  }

  function performCastle(color, side) {
    const row = color === "white" ? 7 : 0;
    const king = color === "white" ? "K" : "k";
    const rook = color === "white" ? "R" : "r";

    setBoardState((prevBoard) => {
      const newBoard = prevBoard.map((r) => [...r]);

      if (side === "king") {
        // King side castling
        newBoard[row][4] = null; // Remove king
        newBoard[row][7] = null; // Remove rook
        newBoard[row][6] = king; // Place king
        newBoard[row][5] = rook; // Place rook
      } else {
        // Queen side castling
        newBoard[row][4] = null; // Remove king
        newBoard[row][0] = null; // Remove rook
        newBoard[row][2] = king; // Place king
        newBoard[row][3] = rook; // Place rook
      }

      return newBoard;
    });

    // Mark that castling has occurred
    setCastlingRights((prev) => ({
      ...prev,
      [color]: { ...prev[color], kingMoved: true },
    }));
  }

  function isPawnPromotion(from, to, piece) {
    if (piece.toLowerCase() !== "p") return false;

    const isWhite = piece === piece.toUpperCase();
    const promotionRow = isWhite ? 0 : 7;

    return to.row === promotionRow;
  }

  function handlePawnPromotion(position, color) {
    setPromotionPosition(position);
    setPromotionColor(color);
    setShowPromotionModal(true);
    setPendingPlayerSwitch(true);
  }

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

  function isValidMove(from, to) {
    if (from.row === to.row && from.col === to.col) {
      return false;
    }

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

    const movingPiece = boardState[from.row][from.col];
    if (!movingPiece) {
      return false;
    }

    const targetPiece = boardState[to.row][to.col];
    const movingPieceColor =
      movingPiece === movingPiece.toLowerCase() ? "black" : "white";

    // Check for castling
    if (movingPiece.toLowerCase() === "k") {
      const colDiff = to.col - from.col;
      if (Math.abs(colDiff) === 2) {
        const side = colDiff > 0 ? "king" : "queen";
        return canCastle(movingPieceColor, side);
      }
    }

    if (targetPiece) {
      const targetPieceColor =
        targetPiece === targetPiece.toLowerCase() ? "black" : "white";

      if (movingPieceColor === targetPieceColor) {
        return false;
      } else {
        playCapture();
        setCapturedPieces((prev) => {
          return [...prev, targetPiece];
        });
      }
    }

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

  function isLegalMove(from, to) {
    if (!isValidMove(from, to)) {
      console.log("Invalid basic move");
      return false;
    }

    const movingPiece = boardState[from.row][from.col];
    const movingPieceColor =
      movingPiece === movingPiece.toLowerCase() ? "black" : "white";

    // Handle castling
    if (
      movingPiece.toLowerCase() === "k" &&
      Math.abs(to.col - from.col) === 2
    ) {
      return true; // Castling validity already checked in isValidMove
    }

    let tempBoard = makeTempMove(from, to);
    console.log("Temp board created");

    const kingStillInCheck = isKingInCheck(currentPlayer, tempBoard);
    console.log("King still in check after move:", kingStillInCheck);

    if (kingStillInCheck) return false;

    return true;
  }

  function makeTempMove(from, to) {
    const tempBoard = boardState.map((row) => [...row]);

    const piece = tempBoard[from.row][from.col];
    tempBoard[from.row][from.col] = null;
    tempBoard[to.row][to.col] = piece;

    return tempBoard;
  }

  function isKingInCheck(currentPlayer, board) {
    const kingPosition = { row: null, col: null };
    const king = currentPlayer === "white" ? "K" : "k";

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const piece = board[row][col];
        if (piece) {
          if (piece == king) {
            kingPosition.row = row;
            kingPosition.col = col;
          }
        } else continue;
      }
    }

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const element = board[row][col];

        if (element) {
          const elementPosition = {
            row: row,
            col: col,
          };

          const upperCaseRegEx = /^[A-Z]$/;
          const lowerCaseRegEx = /^[a-z]$/;

          if (
            (upperCaseRegEx.test(element) && lowerCaseRegEx.test(king)) ||
            (lowerCaseRegEx.test(element) && upperCaseRegEx.test(king))
          ) {
            let canAttacking = false;

            switch (element.toLowerCase()) {
              case "r":
                canAttacking = isValidRookMove(
                  elementPosition,
                  kingPosition,
                  board
                );
                break;
              case "n":
                canAttacking = isValidKnightMove(elementPosition, kingPosition);
                break;
              case "b":
                canAttacking = isValidBishopMove(
                  elementPosition,
                  kingPosition,
                  board
                );
                break;
              case "q":
                canAttacking = isValidQueenMove(
                  elementPosition,
                  kingPosition,
                  board
                );
                break;
              case "k":
                canAttacking = isValidKingMove(elementPosition, kingPosition);
                break;
              case "p":
                canAttacking = isValidPawnAttack(
                  elementPosition,
                  kingPosition,
                  element
                );
                break;
            }
            if (canAttacking) {
              return canAttacking;
            }
          }
        } else continue;
      }
    }

    return false;
  }

  function isValidPawnAttack(from, to, movingPiece) {
    const isWhite = movingPiece === movingPiece.toUpperCase();
    const direction = isWhite ? -1 : 1;

    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);

    return colDiff === 1 && rowDiff === direction;
  }

  function isValidRookMove(from, to, board = boardState) {
    if (from.row !== to.row && from.col !== to.col) {
      return false;
    }
    return isPathClear(from, to, board);
  }

  function isValidKingMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    // Normal king move (one square in any direction)
    if (rowDiff <= 1 && colDiff <= 1) {
      return true;
    }

    // Castling move (handled in isValidMove)
    return false;
  }

  function isValidKnightMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  function isValidQueenMove(from, to, board = boardState) {
    return (
      isValidRookMove(from, to, board) || isValidBishopMove(from, to, board)
    );
  }

  function isValidBishopMove(from, to, board = boardState) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    if (rowDiff !== colDiff) {
      return false;
    }

    return isPathClear(from, to, board);
  }

  function isValidPawnMove(from, to, movingPiece, board = boardState) {
    const isWhite = movingPiece === movingPiece.toUpperCase();
    const direction = isWhite ? -1 : 1;

    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);

    const targetPiece = board[to.row][to.col];

    if (colDiff === 0 && !targetPiece) {
      if (rowDiff === direction) {
        return true;
      }

      const startingRow = isWhite ? 6 : 1;
      if (from.row === startingRow && rowDiff === 2 * direction) {
        return true;
      }
    }

    if (colDiff === 1 && rowDiff === direction && targetPiece) {
      return true;
    }

    return false;
  }

  const getTileSize = () => {
    if (chessBoardRef.current) {
      return chessBoardRef.current.offsetWidth / 8;
    }
    return 70;
  };

  const getPixelPosition = (row, col) => {
    const chessboard = chessBoardRef.current;
    if (!chessboard) return { x: 0, y: 0 };

    const rect = chessboard.getBoundingClientRect();
    const tileSize = getTileSize();

    const x = col * tileSize + tileSize / 2 - 35;
    const y = row * tileSize + tileSize / 2 - 35;

    return { x: x + rect.left, y: y + rect.top };
  };

  function getAllPieces(color, board) {
    const pieces = [];
    const isWhite = color === "white";

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const piece = board[row][col];
        if (piece) {
          const pieceIsWhite = piece === piece.toUpperCase();
          if (pieceIsWhite === isWhite) {
            pieces.push({
              piece,
              position: { row, col },
            });
          }
        }
      }
    }
    return pieces;
  }

  function getPossibleMoves(pieceData, board) {
    const { piece, position } = pieceData;
    const moves = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const targetSquare = { row, col };

        if (position.row === row && position.col === col) continue;

        if (isValidMoveForPiece(piece, position, targetSquare, board)) {
          moves.push(targetSquare);
        }
      }
    }

    return moves;
  }

  function isValidMoveForPiece(piece, from, to, board) {
    if (to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) {
      return false;
    }

    const targetPiece = board[to.row][to.col];

    if (targetPiece) {
      const movingPieceColor =
        piece === piece.toLowerCase() ? "black" : "white";
      const targetPieceColor =
        targetPiece === targetPiece.toLowerCase() ? "black" : "white";
      if (movingPieceColor === targetPieceColor) {
        return false;
      }
    }

    switch (piece.toLowerCase()) {
      case "r":
        return isValidRookMove(from, to, board);
      case "n":
        return isValidKnightMove(from, to);
      case "b":
        return isValidBishopMove(from, to, board);
      case "q":
        return isValidQueenMove(from, to, board);
      case "k":
        return isValidKingMove(from, to);
      case "p":
        return isValidPawnMove(from, to, piece, board);
      default:
        return false;
    }
  }

  function hasLegalMoves(color, board) {
    const pieces = getAllPieces(color, board);

    for (const pieceData of pieces) {
      const possibleMoves = getPossibleMoves(pieceData, board);

      for (const move of possibleMoves) {
        const tempBoard = board.map((row) => [...row]);
        const piece = tempBoard[pieceData.position.row][pieceData.position.col];
        tempBoard[pieceData.position.row][pieceData.position.col] = null;
        tempBoard[move.row][move.col] = piece;

        if (!isKingInCheck(color, tempBoard)) {
          return true;
        }
      }
    }

    return false;
  }

  function isCheckmate(color, board) {
    if (!isKingInCheck(color, board)) {
      return false;
    }
    return !hasLegalMoves(color, board);
  }

  function isStalemate(color, board) {
    if (isKingInCheck(color, board)) {
      return false;
    }
    return !hasLegalMoves(color, board);
  }

  function grabPiece(e) {
    const element = e.target;

    if (element.classList.contains("chess-piece")) {
      element.classList.add("grabbed-piece");

      const piecePosition = getPiecePosition(element);
      const piece = boardState[piecePosition.row][piecePosition.col];

      const isPieceWhite = piece === piece.toUpperCase();

      if (
        (isPieceWhite && currentPlayer === "black") ||
        (!isPieceWhite && currentPlayer === "white")
      ) {
        return;
      }

      originalPosition = getPiecePosition(element);

      const x = e.clientX - 35;
      const y = e.clientY - 35;

      element.style.position = "fixed";
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

      if (targetSquare && isLegalMove(originalPosition, targetSquare)) {
        const movingPiece =
          boardState[originalPosition.row][originalPosition.col];
        const movingPieceColor =
          movingPiece === movingPiece.toLowerCase() ? "black" : "white";

        // Check for castling
        if (
          movingPiece.toLowerCase() === "k" &&
          Math.abs(targetSquare.col - originalPosition.col) === 2
        ) {
          const side =
            targetSquare.col > originalPosition.col ? "king" : "queen";
          performCastle(movingPieceColor, side);

          // Clean up and switch player
          activePiece.classList.remove("grabbed-piece");
          activePiece.style.position = "static";
          activePiece.style.left = "";
          activePiece.style.top = "";
          activePiece.style.zIndex = "";
          activePiece = null;
          originalPosition = { row: -1, col: -1 };

          setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
          playDrop();
          return;
        }

        // Check for pawn promotion
        if (isPawnPromotion(originalPosition, targetSquare, movingPiece)) {
          // Move the piece first
          const pixelPos = getPixelPosition(targetSquare.row, targetSquare.col);
          activePiece.style.position = "fixed";
          activePiece.style.left = `${pixelPos.x}px`;
          activePiece.style.top = `${pixelPos.y}px`;

          updateBoardState(originalPosition, targetSquare);

          // Clean up
          activePiece.classList.remove("grabbed-piece");
          activePiece.style.zIndex = "";
          activePiece = null;
          originalPosition = { row: -1, col: -1 };

          // Show promotion modal
          handlePawnPromotion(targetSquare, movingPieceColor);

          playDrop();
          return;
        }

        // Regular move
        const moveFrom = { ...originalPosition };
        const moveTo = { ...targetSquare };
        const nextPlayer = currentPlayer === "white" ? "black" : "white";

        const pixelPos = getPixelPosition(targetSquare.row, targetSquare.col);

        activePiece.style.position = "fixed";
        activePiece.style.left = `${pixelPos.x}px`;
        activePiece.style.top = `${pixelPos.y}px`;

        updateBoardState(originalPosition, targetSquare);
        setCurrentPlayer(nextPlayer);
        playDrop();

        activePiece.dataset.row = targetSquare.row;
        activePiece.dataset.col = targetSquare.col;

        setTimeout(() => {
          const newBoardState = boardState.map((row) => [...row]);
          const piece = newBoardState[moveFrom.row][moveFrom.col];
          newBoardState[moveFrom.row][moveFrom.col] = null;
          newBoardState[moveTo.row][moveTo.col] = piece;

          if (isCheckmate(nextPlayer, newBoardState)) {
            alert(`Checkmate! ${currentPlayer} wins!`);
          } else if (isStalemate(nextPlayer, newBoardState)) {
            alert("Stalemate! It's a draw!");
          } else if (isKingInCheck(nextPlayer, newBoardState)) {
            alert(`Check! ${nextPlayer} king is under attack.`);
          }
        }, 100);
      } else {
        activePiece.style.position = "static";
        activePiece.style.left = "";
        activePiece.style.top = "";
        activePiece.style.transform = "";
      }

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

  // Promotion Modal Component
  const PromotionModal = () => {
    if (!showPromotionModal) return null;

    const pieces = [
      { type: "q", name: "Queen" },
      { type: "r", name: "Rook" },
      { type: "b", name: "Bishop" },
      { type: "n", name: "Knight" },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-center">
            Promote your pawn to:
          </h3>
          <div className="flex gap-4">
            {pieces.map((piece) => {
              const pieceImage = `${promotionColor}-${piece.name.toLowerCase()}`;
              return (
                <button
                  key={piece.type}
                  onClick={() => completePawnPromotion(piece.type)}
                  className="flex flex-col items-center p-3 border-2 border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <img
                    src={`/${pieceImage}.svg`}
                    alt={piece.name}
                    className="w-12 h-12 mb-2"
                  />
                  <span className="text-sm font-medium">{piece.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
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
      <PromotionModal />
    </>
  );
};

export default ChessBoard;
