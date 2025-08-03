import ChessBoard from "./components/board/chessBoard";
import React from "react";
import LogButton from "./components/Button/LogButton";
import UndoButton from "./components/Button/UndoButton";

import { BoardProvider } from "./context/BoardContext";

function App() {
  

  const [boardState, SetBoardState] = React.useState([]);

  function handleDataFromChild(data) {
    SetBoardState(data);
  }

  function displayBoardState(boardState) {
    console.dir(boardState);
  }

  return (
    <BoardProvider>
      <div className="bg-[#242424]">
        <ChessBoard  onDataSend={handleDataFromChild} />
        <LogButton/>
        <UndoButton/>
      </div>
    </BoardProvider>
  );
}

export default App;
