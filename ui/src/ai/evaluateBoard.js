export default function evaluateBoard(board) {
  const materialScore = countMaterial(board);
  const positionalScore = evaluatePositions(board);
  
  
  return materialScore + positionalScore;
}

// function countMaterial(board){

//     let whiteScore = 0;
//     let blackScore = 0;

//     values = {
//         pawn: 1,
//         knight: 3,
//         bishop: 3,
//         rook: 5,
//         queen: 9,
//         king: 1000
//     }

//    for(row of board){
//     for(col of board){
//         const piece = board[row][col];
//         switch(piece){
//             case 'p':
//                 blackScore += values.pawn
//                 break;
//             case 'n':
//                 blackScore += values.knight
//                 break;
//             case 'b':
//                 blackScore += values.bishop
//                 break;
//             case 'r':
//                 blackScore += values.rook;
//                 break;
//             case 'q':
//                 blackScore += values.queen;
//                 break;
//             case 'k':
//                 blackScore += values.king;
//                 break;
//             case 'P':
//                 whiteScore += values.pawn
//                 break;
//             case 'N':
//                 whiteScore += values.knight
//                 break;
//             case 'B':
//                 whiteScore += values.bishop
//                 break;
//             case 'R':
//                 whiteScore += values.rook;
//                 break;
//             case 'Q':
//                 whiteScore += values.queen;
//                 break;
//             case 'K':
//                 whiteScore += values.king;
//                 break;
            
//         }
//     }
//    }

//    return whiteScore - blackScore
// }   

// Piece-Square Tables for positional evaluation
// Values are from white's perspective (positive = good for white)
// For black pieces, we'll flip the tables vertically

const PIECE_SQUARE_TABLES = {
  // Pawn table - encourages center control and advancement
  p: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
  ],

  // Knight table - prefers center, avoids edges
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],

  // Bishop table - likes long diagonals
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],

  // Rook table - likes open files and 7th rank
  r: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ],

  // Queen table - slightly prefers center
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],

  // King table for middlegame - wants to stay safe
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ],

  // King table for endgame - wants to be active
  k_endgame: [
    [-50,-40,-30,-20,-20,-30,-40,-50],
    [-30,-20,-10,  0,  0,-10,-20,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-30,  0,  0,  0,  0,-30,-30],
    [-50,-30,-30,-30,-30,-30,-30,-50]
  ]
};

// Material values for basic material counting
const PIECE_VALUES = {
  p: 100,   // pawn
  n: 320,   // knight
  b: 330,   // bishop
  r: 500,   // rook
  q: 900,   // queen
  k: 20000  // king
};

// Function to flip piece-square table for black pieces
function flipTable(table) {
  return table.slice().reverse();
}

// Function to determine if we're in endgame
function isEndgame(board) {
  let queens = 0;
  let minorPieces = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceType = piece.toLowerCase();
        if (pieceType === 'q') queens++;
        if (pieceType === 'n' || pieceType === 'b') minorPieces++;
      }
    }
  }
  
  // Endgame if no queens or very few pieces remaining
  return queens === 0 || (queens === 2 && minorPieces <= 2);
}

// Main material counting function
function countMaterial(board) {
  let materialScore = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceType = piece.toLowerCase();
        const pieceValue = PIECE_VALUES[pieceType] || 0;
        
        if (piece === piece.toUpperCase()) {
          // White piece
          materialScore += pieceValue;
        } else {
          // Black piece
          materialScore -= pieceValue;
        }
      }
    }
  }
  
  return materialScore;
}

// Main positional evaluation function using piece-square tables
function evaluatePositions(board) {
  let positionalScore = 0;
  const endgame = isEndgame(board);
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceType = piece.toLowerCase();
        const isWhite = piece === piece.toUpperCase();
        
        // Get the appropriate piece-square table
        let table;
        if (pieceType === 'k') {
          // Use different king table for endgame
          table = endgame ? PIECE_SQUARE_TABLES.k_endgame : PIECE_SQUARE_TABLES.k;
        } else {
          table = PIECE_SQUARE_TABLES[pieceType];
        }
        
        if (table) {
          let pieceSquareValue;
          
          if (isWhite) {
            // White pieces use table as-is
            pieceSquareValue = table[row][col];
            positionalScore += pieceSquareValue;
          } else {
            // Black pieces use flipped table
            const flippedRow = 7 - row;
            pieceSquareValue = table[flippedRow][col];
            positionalScore -= pieceSquareValue;
          }
        }
      }
    }
  }
  
  return positionalScore;
}



// Helper function to get piece-square value for a specific piece (useful for debugging)
function getPieceSquareValue(piece, row, col, endgame = false) {
  const pieceType = piece.toLowerCase();
  const isWhite = piece === piece.toUpperCase();
  
  let table;
  if (pieceType === 'k') {
    table = endgame ? PIECE_SQUARE_TABLES.k_endgame : PIECE_SQUARE_TABLES.k;
  } else {
    table = PIECE_SQUARE_TABLES[pieceType];
  }
  
  if (!table) return 0;
  
  if (isWhite) {
    return table[row][col];
  } else {
    const flippedRow = 7 - row;
    return -table[flippedRow][col];
  }
}