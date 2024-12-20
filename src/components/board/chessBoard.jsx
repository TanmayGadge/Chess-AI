import React from "react";
import useFEN from "../hooks/useFen";
import Tile from "../Tile/Tile";

const ChessBoard = ({ fen }) => {
  const board = useFEN(fen);
  console.log(board);
  let chessBoard = [];
  let key = 0;

  board.forEach((row, rowIndex) => {
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

          case null:
            type = null;
            break;
        }
      }

      pieceName = type && `${pieceColor}-${type}`;

      chessBoard.push(
        <Tile
          key={key}
          number={rowIndex + pieceIndex}
          image={pieceName && `/${pieceName}.svg`}
        />
      );
      key++;
    });
  });

  return (
    <div className="mx-auto bg-[#779556] w-[100vh] h-screen grid grid-cols-[repeat(8,1fr)] grid-rows-[repeat(8,1fr)] text-[black]">
      {chessBoard}
    </div>
  );
};

export default ChessBoard;
