import ChessBoard from "./components/board/chessBoard";
import React from "react";
import LogButton from "./components/Button/LogButton";
import UndoButton from "./components/Button/UndoButton";

import { BoardProvider } from "./context/BoardContext";

function App() {
  
  return (
    <BoardProvider>
      <div className="bg-[#242424]">
        <ChessBoard/>
        <LogButton/>
        <UndoButton/>
      </div>
    </BoardProvider>
  );
}

export default App;
