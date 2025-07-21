import ChessBoard from "./components/board/chessBoard";
import React from "react";

function App() {
  let startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/";

  const [isWhiteTurn, setIsWhiteTurn] = React.useState(true);

  function handleDataFromChild(data){
    setIsWhiteTurn(data);
  }

  return (
    <div className="bg-[#242424]">
      {/* <div className="flex justify-center">
        <div className={`fixed top-0 left- bg-gradient-to-b from-[#242424] ${!isWhiteTurn ? "to-green-600": "to-red-700"} w-[100vh] h-3`} /> */}
        <ChessBoard fen={startingFEN} onDataSend={handleDataFromChild}/>
        {/* <div className={`fixed bottom-0 bg-gradient-to-t from-[#242424] ${isWhiteTurn ? "to-green-600": "to-red-700"} w-[100vh] h-3`} />
      </div> */}
    </div>
  );
}

export default App;
