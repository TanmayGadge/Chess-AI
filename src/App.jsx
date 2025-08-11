import ChessBoard from "./components/board/chessBoard";
import React from "react";
import LogButton from "./components/Button/LogButton";
import UndoButton from "./components/Button/UndoButton";

import { BoardProvider } from "./context/BoardContext";
import Captured from "./components/capturedPieces/Captured";

function App() {
  return (
    <BoardProvider>
      <div className="bg-[#242424] ">
        {/* <Captured /> */}
        <ChessBoard />
        <div className="fixed top-10 left-10 flex flex-col gap-5">
          <LogButton />
          <UndoButton />
        </div>
      </div>
    </BoardProvider>
  );
}

export default App;
