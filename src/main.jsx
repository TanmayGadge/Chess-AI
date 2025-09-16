import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BoardProvider } from "./context/BoardContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
  </StrictMode>
);
