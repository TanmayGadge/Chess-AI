import React, { useRef } from "react";
import useFEN from "../../hooks/useFen";
import Tile from "../tile/tile";

const ChessBoard = ({ fen }) => {
  let activePiece = null;

  const chessBoardRef = useRef(null);

  function grabPiece(e) {
    const element = e.target;

    if (element.classList.contains("bg-no-repeat")) {
      element.classList.add("grabbed-piece");

      const x = e.clientX - 35;
      const y = e.clientY - 35;

      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    }
    activePiece = element;
  }

  function movePiece(e) {

    const chessboard = chessBoardRef.current;
    
    if (activePiece &&chessboard) {
      const minX = chessboard.offsetLeft;
      const maxX = chessboard.offsetLeft + chessboard.offsetWidth - 70;

      const minY = chessboard.offsetTop;
      const maxY = chessboard.offsetTop + chessboard.offsetHeight -70 ;
      

      const x = e.clientX - 35;
      const y = e.clientY - 35;

      activePiece.style.position = "absolute";
      activePiece.style.left = (x > minX && x < maxX) && `${x}px`;
      activePiece.style.top = (y > minY && y < maxY) && `${y}px`;
    }
  }

  function dropPiece(e) {
    if (activePiece) {
      activePiece = null;
    }
  }
  const board = useFEN(fen);

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
