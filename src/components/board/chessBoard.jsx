import "./chessboard.css";
import pieceSVG from "../../../public/black-bishop.svg";
import Tile from "../tile/tile";

function ChessBoard({ fenString }) {
  const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

  // const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  const fen = "rnbqkbnr";

  // const piecesFen = {
  //   'r': '/black-rook.svg',
  //   'n': '/black-knight.svg',
  //   'b': '/black'
  // }

  let board = [];
  let key = 0;
  for (let j = verticalAxis.length - 1; j >= 0; j--) {
    for (let i = 0; i < fen.length; i++) {
      let number = i + j;
      let color = "";
      let type = "";
      
      if (fen[i] == fen[i].toLowerCase()) {
        color = "black";
      } else if (fen[i] == fen[i].toUpperCase()) {
        color = "white";
      }

      switch (fen[i].toLowerCase()) {
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

        case '/':
          i++;
          break;

        default:
          type = "";
          break;
      }

      const piecePath = `/${color}-${type}.svg`;
      color = type = "";
      board.push(
        <Tile
          number={number}
          key={key}
          verticalAxis={verticalAxis}
          horizontalAxis={horizontalAxis}
          i={i}
          j={j}
          image={piecePath}
        />
      );

      key++;
    }
  }

  return <div id="chessboard">{board}</div>;
}

export default ChessBoard;
