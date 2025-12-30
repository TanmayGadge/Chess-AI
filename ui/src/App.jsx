import ChessBoard from "./components/board/chessBoard";
import React from "react";
import LogButton from "./components/Button/LogButton";
import UndoButton from "./components/Button/UndoButton";

import { BoardProvider } from "./context/BoardContext";
import Captured from "./components/capturedPieces/Captured";
import ConnectButton from "./components/Button/ConnectButton";
import AiButton from "./components/Button/AiButton";
import DepthButton from "./components/Button/DepthButton";
import AlphaBetaButton from "./components/Button/AlphaBetaButton";

function App() {
  return (
    <div className="bg-[#242424] ">
      {/* <Captured /> */}
      <ChessBoard />
      <div className="fixed top-10 left-10 flex flex-col gap-5">
        <LogButton />
        <UndoButton />
        <AiButton />
        <DepthButton/>
        <AlphaBetaButton/>
        {/* <ConnectButton/> */}
      </div>
    </div>
  );
}

export default App;
