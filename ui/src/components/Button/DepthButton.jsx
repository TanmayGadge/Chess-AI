import React from "react";
import { useBoard } from "../../context/BoardContext";

const DepthButton = () => {
  const { depth, setDepth } = useBoard();
  const [depthInput, setDepthInput] = React.useState(depth);
  return (
    <div className="flex gap-4">
      <input
        type="number"
        placeholder="Enter depth (4)"
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
  );
};

export default DepthButton;
