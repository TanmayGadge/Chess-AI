import ChessBoard from "./components/board/chessBoard";
import React from "react";
import LogButton from "./components/Button/LogButton";
import UndoButton from "./components/Button/UndoButton";

import { BoardProvider } from "./context/BoardContext";
import Captured from "./components/capturedPieces/Captured";
import ConnectButton from "./components/Button/ConnectButton";
import AiButton from "./components/Button/AiButton";
import { useBoard } from "./context/BoardContext";

function App() {
  const { depth, setDepth } = useBoard();
  const [depthInput, setDepthInput] = React.useState(depth);

  return (
    <div className="bg-[#242424] ">
      {/* <Captured /> */}
      <ChessBoard />
      <div className="fixed top-10 left-10 flex flex-col gap-5">
        <LogButton />
        <UndoButton />
        <AiButton />
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Enter depth"
            className="p-2 rounded-lg bg-white"
            onChange={(e) => setDepthInput(e.target.value)}
          />
          <button
            className="p-2 rounded-lg bg-white"
            onClick={() => {
              setDepth(depthInput);
            }}
          >
            Go
          </button>
        </div>
        {/* <ConnectButton/> */}
      </div>
    </div>
  );
}

export default App;
