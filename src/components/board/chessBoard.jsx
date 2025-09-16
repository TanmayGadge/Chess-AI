import React, { useRef, useState, useEffect } from "react";
import Tile from "../tile/tile";
import dropSound from "../../sound-effect/drop.mp3";
import captureSound from "../../sound-effect/capture.mp3";
import PromotionModal from "../Modals/PromotionalModal";
import useSound from "use-sound";
import { useBoard } from "../../context/BoardContext";
import arrayToFEN from "../../hooks/useBoard";
import useFEN from "../../hooks/useFEN";

import evaluateBoard from "../../ai/evaluateBoard";

const socket = new WebSocket("ws://localhost:8080");

const ChessBoard = () => {
  let activePiece = null;
  let originalPosition = { row: -1, col: -1 };

  const chessBoardRef = useRef(null);
  // let isInitialRender = useRef(true);

  const {
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
    numberOfMoves,
    moveHistory,
    setMoveHistory,
    gameState,
    setGameState,
    isAIGame,
    depth,
    isAlphaBeta,
  } = useBoard();

  socket.onopen = () => {
    // alert("Connected to the server");
    console.log("Conneted to the server");
  };

  socket.onmessage = async (message) => {
    const recievedData = await message.data.text();
    const data = JSON.parse(recievedData);
    console.log(`recievedBoardState: ${recievedData}`);

    const recievedFenString = data.fen;
    const recievedCurrentPlayer = data.player;

    console.log(`Recieved FEN String: ${recievedFenString}`);
    console.log(`Recieved Current Player: ${recievedCurrentPlayer}`);

    let newBoardState = useFEN(recievedFenString);
    setBoardState(newBoardState);
    setCurrentPlayer(recievedCurrentPlayer);
  };

  socket.onclose = () => {
    console.log("Connection Terminated");
  };

  useEffect(() => {
    // if (isInitialRender) {
    //   isInitialRender.current = false;
    //   return;
    // } else {
    // }
    if (socket && socket.readyState == WebSocket.OPEN) {
      const fenString = arrayToFEN(boardState);
      const data = { fen: fenString, player: currentPlayer };
      // socket.send(fenString);
      socket.send(JSON.stringify(data));
    }
    console.log(`Number of Moves: ${numberOfMoves.current}`);
  }, [numberOfMoves.current]);

  useEffect(() => {
    numberOfMoves.current += 1;
  }, [boardState]);

  useEffect(() => {
    if (currentPlayer === "black" && isAIGame) {
      const aiMove = getAIMove(boardState, depth);

      if (aiMove) {
        // Apply the AI move to your game
        updateBoardState(aiMove.from, aiMove.to);
        setCurrentPlayer("white");
      } else {
        // Game over - no moves available
        console.log("AI has no legal moves - game over");
      }
      if (isCheckmate(currentPlayer, boardState)) {
        setGameState("checkmate");
        console.log("Checkmate");
      }
    }
  }, [boardState]);

  function minimax(board, depth, maximizingPlayer) {
    // Base case: if we've reached max depth or game is over
    if (depth === 0 || isGameOver(board)) {
      return evaluateBoard(board);
    }

    if (maximizingPlayer) {
      // White's turn - trying to maximize score
      let maxEval = -Infinity;

      // Get all possible moves for white
      const whiteMoves = getAllLegalMoves("white", board);

      // Try each possible move
      for (const move of whiteMoves) {
        // Make the move on a copy of the board
        const newBoard = makeMove(board, move);

        // Recursively evaluate this position (now it's black's turn)
        const evaluation = minimax(newBoard, depth - 1, false);

        // Keep track of the best (highest) score
        maxEval = Math.max(maxEval, evaluation);
      }

      return maxEval;
    } else {
      // Black's turn - trying to minimize score
      let minEval = +Infinity;

      // Get all possible moves for black
      const blackMoves = getAllLegalMoves("black", board);

      // Try each possible move
      for (const move of blackMoves) {
        // Make the move on a copy of the board
        const newBoard = makeMove(board, move);

        // Recursively evaluate this position (now it's white's turn)
        const evaluation = minimax(newBoard, depth - 1, true);

        // Keep track of the best (lowest) score
        minEval = Math.min(minEval, evaluation);
      }

      return minEval;
    }
  }

  function minimaxAlphaBeta(
    board,
    depth,
    maximizingPlayer,
    alpha = -Infinity,
    beta = +Infinity
  ) {
    if (depth === 0 || isGameOver(board)) {
      return evaluateBoard(board);
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity;

      const whiteMoves = getAllLegalMoves("white", board);

      for (const move of whiteMoves) {
        const newBoard = makeMove(board, move);
        const evaluation = minimaxAlphaBeta(
          newBoard,
          depth - 1,
          false,
          alpha,
          beta
        );
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          break;
        }
      }

      return maxEval;
    } else {
      let minEval = +Infinity;
      const blackMoves = getAllLegalMoves("black", board);

      for (const move of blackMoves) {
        const newBoard = makeMove(board, move);
        const evaluation = minimaxAlphaBeta(
          newBoard,
          depth - 1,
          true,
          alpha,
          beta
        );
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) {
          break;
        }
      }

      return minEval;
    }
  }

  function getBestMove(board, color, depth = 2) {
    const isMaximizing = color === "white";
    let bestMove = null;
    let bestValue = isMaximizing ? -Infinity : +Infinity;

    // Get all legal moves for the AI color
    const possibleMoves = getAllLegalMoves(color, board);

    // If no moves available, return null (checkmate or stalemate)
    if (possibleMoves.length === 0) {
      return null;
    }

    console.log(
      `AI evaluating ${possibleMoves.length} possible moves at depth ${depth}`
    );

    // Evaluate each possible move
    for (let i = 0; i < possibleMoves.length; i++) {
      const move = possibleMoves[i];

      // Make the move on a copy of the board
      const newBoard = makeMove(board, move);

      // Get the minimax value for this move
      let moveValue;
      if (isAlphaBeta) {
        moveValue = minimaxAlphaBeta(newBoard, depth - 1, !isMaximizing);
      }else{
        moveValue = minimax(newBoard, depth - 1, !isMaximizing);
      }

      console.log(
        `Move ${i + 1}/${possibleMoves.length}: ${move.piece} ${
          move.from.row
        },${move.from.col} -> ${move.to.row},${move.to.col} = ${moveValue}`
      );

      // Check if this is the best move so far
      if (isMaximizing) {
        // White wants maximum value
        if (moveValue > bestValue) {
          bestValue = moveValue;
          bestMove = move;
        }
      } else {
        // Black wants minimum value
        if (moveValue < bestValue) {
          bestValue = moveValue;
          bestMove = move;
        }
      }
    }

    console.log(
      `Best move found: ${bestMove.piece} ${bestMove.from.row},${bestMove.from.col} -> ${bestMove.to.row},${bestMove.to.col} with value ${bestValue}`
    );

    return bestMove;
  }

  function makeMove(board, move) {
    // Create a deep copy of the board
    const newBoard = board.map((row) => [...row]);

    // Clear the source square
    newBoard[move.from.row][move.from.col] = null;

    // Place the piece on the destination square
    newBoard[move.to.row][move.to.col] = move.piece;

    // Handle special moves
    if (
      move.piece.toLowerCase() === "k" &&
      Math.abs(move.to.col - move.from.col) === 2
    ) {
      // Castling - also move the rook
      // handleCastlingInMove(newBoard, move);
      const isWhite = move.piece === move.piece.toUpperCase();
      const row = isWhite ? 7 : 0;
      const rook = isWhite ? "R" : "r";

      if (move.to.col === 6) {
        // Kingside castling (king moves to g-file)
        newBoard[row][7] = null; // Remove rook from h-file
        newBoard[row][5] = rook; // Place rook on f-file
      } else if (move.to.col === 2) {
        // Queenside castling (king moves to c-file)
        newBoard[row][0] = null; // Remove rook from a-file
        newBoard[row][3] = rook; // Place rook on d-file
      }
    }

    // Handle pawn promotion (if needed)
    if (isPawnPromotionMove(move)) {
      // For AI, always promote to queen (simplest choice)
      const color = move.piece === move.piece.toUpperCase() ? "white" : "black";
      newBoard[move.to.row][move.to.col] = color === "white" ? "Q" : "q";
    }

    return newBoard;
  }

  function isPawnPromotionMove(move) {
    if (move.piece.toLowerCase() !== "p") return false;

    const isWhite = move.piece === move.piece.toUpperCase();
    const promotionRow = isWhite ? 0 : 7;

    return move.to.row === promotionRow;
  }

  function isGameOver(board) {
    // Check if either side has no legal moves
    const whiteMoves = getAllLegalMoves("white", board);
    const blackMoves = getAllLegalMoves("black", board);

    return whiteMoves.length === 0 || blackMoves.length === 0;
  }

  function getAIMove(currentBoard, difficulty = 4) {
    console.log("AI is thinking...");
    const startTime = Date.now();

    // AI always plays as black in this implementation
    const bestMove = getBestMove(currentBoard, "black", difficulty);

    const endTime = Date.now();
    console.log(`AI calculation took ${endTime - startTime}ms`);

    return bestMove;
  }

  function getAllLegalMoves(color, board = boardState) {
    const moves = [];
    const pieces = getAllPieces(color, board);

    for (const pieceData of pieces) {
      const pieceMoves = getLegalMovesForPiece(pieceData, board);
      moves.push(...pieceMoves);
    }

    return moves;
  }

  function getLegalMovesForPiece(pieceData, board) {
    const { piece, position } = pieceData;
    const moves = [];

    const possibleMoves = generatePossibleMoves(piece, position, board);

    for (const targetSquare of possibleMoves) {
      if (isLegalMoveForAI(position, targetSquare, board)) {
        moves.push({
          from: { ...position },
          to: { ...targetSquare },
          piece: piece,
          capturedPieces: board[targetSquare.row][targetSquare.col],
        });
      }
    }

    return moves;
  }

  function isLegalMoveForAI(from, to, board) {
    if (!isValidMoveOnBoard(from, to, board)) {
      return false;
    }

    const tempBoard = makeTempMove(from, to, board);

    const piece = board[from.row][from.col];
    const pieceColor = piece === piece.toLowerCase() ? "black" : "white";

    return !isKingInCheck(pieceColor, tempBoard);
  }

  function generatePossibleMoves(piece, position, board) {
    const moves = [];

    switch (piece.toLowerCase()) {
      case "p":
        moves.push(...generatePawnMoves(piece, position, board));
        break;
      case "r":
        moves.push(...generateRookMoves(position, board));
        break;
      case "n":
        moves.push(...generateKnightMoves(position));
        break;
      case "b":
        moves.push(...generateBishopMoves(position, board));
        break;
      case "q":
        moves.push(...generateQueenMoves(position, board));
        break;
      case "k":
        moves.push(...generateKingMoves(piece, position, board));
        break;
    }

    return moves;
  }

  function isValidSquare(square) {
    return (
      square.row >= 0 && square.row < 8 && square.col >= 0 && square.col < 8
    );
  }

  function generatePawnMoves(piece, position, board) {
    const moves = [];
    const isWhite = piece === piece.toUpperCase();
    const direction = isWhite ? -1 : 1;
    const { row, col } = position;

    // Forward move (1 square)
    const oneForward = { row: row + direction, col };
    if (isValidSquare(oneForward) && !board[oneForward.row][oneForward.col]) {
      moves.push(oneForward);

      // Double move from starting position
      const startingRow = isWhite ? 6 : 1;
      if (row === startingRow) {
        const twoForward = { row: row + 2 * direction, col };
        if (
          isValidSquare(twoForward) &&
          !board[twoForward.row][twoForward.col]
        ) {
          moves.push(twoForward);
        }
      }
    }

    // Diagonal captures
    for (const colOffset of [-1, 1]) {
      const captureSquare = { row: row + direction, col: col + colOffset };
      if (isValidSquare(captureSquare)) {
        const targetPiece = board[captureSquare.row][captureSquare.col];
        if (targetPiece) {
          // Check if it's an enemy piece
          const targetColor =
            targetPiece === targetPiece.toLowerCase() ? "black" : "white";
          const movingColor = isWhite ? "white" : "black";

          if (targetColor !== movingColor) {
            moves.push(captureSquare);
          }
        }
      }
    }

    return moves;
  }

  // Generate all possible rook moves
  function generateRookMoves(position, board) {
    const moves = [];
    const { row, col } = position;

    // Rook moves in 4 directions: up, down, left, right
    const directions = [
      [-1, 0], // up
      [1, 0], // down
      [0, -1], // left
      [0, 1], // right
    ];

    for (const [rowDir, colDir] of directions) {
      let currentRow = row + rowDir;
      let currentCol = col + colDir;

      while (isValidSquare({ row: currentRow, col: currentCol })) {
        const targetPiece = board[currentRow][currentCol];

        if (!targetPiece) {
          // Empty square - valid move
          moves.push({ row: currentRow, col: currentCol });
        } else {
          // Piece found - can capture if enemy, then stop
          const movingPiece = board[row][col];
          const movingColor =
            movingPiece === movingPiece.toLowerCase() ? "black" : "white";
          const targetColor =
            targetPiece === targetPiece.toLowerCase() ? "black" : "white";

          if (movingColor !== targetColor) {
            moves.push({ row: currentRow, col: currentCol });
          }
          break; // Stop sliding in this direction
        }

        currentRow += rowDir;
        currentCol += colDir;
      }
    }

    return moves;
  }

  // Generate all possible knight moves
  function generateKnightMoves(position) {
    const moves = [];
    const { row, col } = position;

    // Knight moves in L-shape: 8 possible moves
    const knightMoves = [
      [-2, -1],
      [-2, 1], // up 2, left/right 1
      [-1, -2],
      [-1, 2], // up 1, left/right 2
      [1, -2],
      [1, 2], // down 1, left/right 2
      [2, -1],
      [2, 1], // down 2, left/right 1
    ];

    for (const [rowOffset, colOffset] of knightMoves) {
      const targetSquare = { row: row + rowOffset, col: col + colOffset };

      if (isValidSquare(targetSquare)) {
        moves.push(targetSquare);
      }
    }

    return moves;
  }

  // Generate all possible bishop moves
  function generateBishopMoves(position, board) {
    const moves = [];
    const { row, col } = position;

    // Bishop moves diagonally in 4 directions
    const directions = [
      [-1, -1], // up-left
      [-1, 1], // up-right
      [1, -1], // down-left
      [1, 1], // down-right
    ];

    for (const [rowDir, colDir] of directions) {
      let currentRow = row + rowDir;
      let currentCol = col + colDir;

      while (isValidSquare({ row: currentRow, col: currentCol })) {
        const targetPiece = board[currentRow][currentCol];

        if (!targetPiece) {
          // Empty square - valid move
          moves.push({ row: currentRow, col: currentCol });
        } else {
          // Piece found - can capture if enemy, then stop
          const movingPiece = board[row][col];
          const movingColor =
            movingPiece === movingPiece.toLowerCase() ? "black" : "white";
          const targetColor =
            targetPiece === targetPiece.toLowerCase() ? "black" : "white";

          if (movingColor !== targetColor) {
            moves.push({ row: currentRow, col: currentCol });
          }
          break; // Stop sliding in this direction
        }

        currentRow += rowDir;
        currentCol += colDir;
      }
    }

    return moves;
  }

  // Generate all possible queen moves (combination of rook and bishop)
  function generateQueenMoves(position, board) {
    const rookMoves = generateRookMoves(position, board);
    const bishopMoves = generateBishopMoves(position, board);

    return [...rookMoves, ...bishopMoves];
  }

  // Generate all possible king moves
  function generateKingMoves(piece, position, board) {
    const moves = [];
    const { row, col } = position;

    // King moves one square in any direction
    const kingMoves = [
      [-1, -1],
      [-1, 0],
      [-1, 1], // up row
      [0, -1],
      [0, 1], // same row (left, right)
      [1, -1],
      [1, 0],
      [1, 1], // down row
    ];

    for (const [rowOffset, colOffset] of kingMoves) {
      const targetSquare = { row: row + rowOffset, col: col + colOffset };

      if (isValidSquare(targetSquare)) {
        moves.push(targetSquare);
      }
    }

    // Add castling moves (you'll need to implement castling logic)
    const isWhite = piece === piece.toUpperCase();
    const castlingMoves = generateCastlingMoves(
      isWhite ? "white" : "black",
      position,
      board
    );
    moves.push(...castlingMoves);

    return moves;
  }

  // Generate castling moves (you'll need to adapt this to use your existing castling logic)
  function generateCastlingMoves(color, position, board) {
    const moves = [];
    const { row, col } = position;

    // Only check castling if king is in starting position
    const startingRow = color === "white" ? 7 : 0;
    if (row !== startingRow || col !== 4) {
      return moves;
    }

    // Check kingside castling
    if (canCastle(color, "king", board)) {
      moves.push({ row: startingRow, col: 6 });
    }

    // Check queenside castling
    if (canCastle(color, "queen", board)) {
      moves.push({ row: startingRow, col: 2 });
    }

    return moves;
  }

  // Main function to generate all possible moves for a piece
  function generatePossibleMoves(piece, position, board) {
    const moves = [];

    switch (piece.toLowerCase()) {
      case "p":
        moves.push(...generatePawnMoves(piece, position, board));
        break;
      case "r":
        moves.push(...generateRookMoves(position, board));
        break;
      case "n":
        moves.push(...generateKnightMoves(position));
        break;
      case "b":
        moves.push(...generateBishopMoves(position, board));
        break;
      case "q":
        moves.push(...generateQueenMoves(position, board));
        break;
      case "k":
        moves.push(...generateKingMoves(piece, position, board));
        break;
    }

    return moves;
  }

  // Function to get all legal moves for a piece (filters out moves that leave king in check)
  function getLegalMovesForPiece(pieceData, board) {
    const { piece, position } = pieceData;
    const moves = [];

    // Generate all possible target squares for this piece type
    const possibleMoves = generatePossibleMoves(piece, position, board);

    // Filter to only legal moves (doesn't leave king in check)
    for (const targetSquare of possibleMoves) {
      if (isLegalMoveForAI(position, targetSquare, board)) {
        moves.push({
          from: { ...position },
          to: { ...targetSquare },
          piece: piece,
          capturedPiece: board[targetSquare.row][targetSquare.col],
        });
      }
    }

    return moves;
  }

  // Check if a move is legal (doesn't leave own king in check)
  function isLegalMoveForAI(from, to, board) {
    // First check if target square has own piece
    const movingPiece = board[from.row][from.col];
    const targetPiece = board[to.row][to.col];

    if (targetPiece) {
      const movingColor =
        movingPiece === movingPiece.toLowerCase() ? "black" : "white";
      const targetColor =
        targetPiece === targetPiece.toLowerCase() ? "black" : "white";

      if (movingColor === targetColor) {
        return false; // Can't capture own piece
      }
    }

    // Make temporary move
    const tempBoard = board.map((row) => [...row]);
    tempBoard[from.row][from.col] = null;
    tempBoard[to.row][to.col] = movingPiece;

    // Check if this move leaves own king in check
    const pieceColor =
      movingPiece === movingPiece.toLowerCase() ? "black" : "white";

    return !isKingInCheck(pieceColor, tempBoard);
  }

  // Main function to get all legal moves for a color
  function getAllLegalMoves(color, board) {
    const moves = [];
    const pieces = getAllPieces(color, board);

    for (const pieceData of pieces) {
      const pieceMoves = getLegalMovesForPiece(pieceData, board);
      moves.push(...pieceMoves);
    }

    return moves;
  }

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
          numberOfMoves.current += 1;

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
            setGameState("gameover");
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

    const latestMove = arrayToFEN(boardState);
    setMoveHistory((prevMoves) => {
      return [...[prevMoves, latestMove]];
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
