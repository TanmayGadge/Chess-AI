import { useBoard } from "../../context/BoardContext";

const Captured = () => {
  const { capturedPieces, setCapturedPieces } = useBoard();
  let type, color;

  return capturedPieces.map((piece, index) => {
    if (piece.toLowerCase() == piece) {
      color = "black";
    } else {
      color = "white";
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

    let pieceName = type && `${color}-${type}`;

    return (
      <div
        className={`w-20 fixed bottom-10 ${
          color == "white" ? "left-10" : "right-10"
        }`}
        key={index}
      >
        <div
          className="w-7 h-7"
          style={{
            backgroundImage: `url(/${pieceName}.svg)`,
            backgroundSize: "contain",
          }}
        />
      </div>
    );

    // if (color == "white") {
    //   return (
    //     <div className="w-20 fixed bottom-10 left-10" key={index}>

    //       <div
    //         className="w-7 h-7"
    //         style={{
    //           backgroundImage: `url(/${pieceName}.svg)`,
    //           backgroundSize: "contain",
    //         }}
    //       />
    //     </div>
    //   );
    // }
    //  else {
    //   return (
    //     <div className="w-fit fixed bottom-10 right-10" key={index}>
    //       <div
    //         className="w-7 h-7"
    //         style={{
    //           backgroundImage: `url(/${pieceName}.svg)`,
    //           backgroundSize: "contain",
    //         }}
    //       ></div>
    //     </div>
    //   );
    // }
  });
};

export default Captured;
