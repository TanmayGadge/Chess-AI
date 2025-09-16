# ♟️ React Chess AI

A feature-rich Chess AI game built with React.js and Vite. This project implements a powerful chess engine using the minimax algorithm with alpha-beta pruning for intelligent move-making. Play against the AI, or connect with another player for a multiplayer match.

---

## 📜 Table of Contents

* [✨ Features](#-features)
* [🧠 How It Works](#-how-it-works)
    * [The AI Engine](#the-ai-engine)
    * [Frontend with React](#frontend-with-react)
* [🛠️ Tech Stack](#️-tech-stack)
* [🚀 Installation & Setup](#-installation--setup)
* [📁 Project Structure](#-project-structure)
* [🔮 Future Enhancements](#-future-enhancements)
* [🤝 Contributing](#-contributing)
* [📝 License](#-license)

---

## ✨ Features

* **Intelligent AI Opponent**: Play against a challenging AI that uses the minimax algorithm.
* **Alpha-Beta Pruning**: The AI's decision-making is optimized for performance and speed.
* **Move Validation**: All moves are validated according to the official rules of chess.
* **Interactive UI**: A clean, responsive, and user-friendly interface built with React.
* **Real-time Multiplayer**: (If applicable) Connect and play against another person over the internet using Socket.io.
* **Undo Moves**: Take back your last move.
* **Captured Pieces Display**: See all the pieces captured by each player.
* **Pawn Promotion**: Promote your pawns to any piece when they reach the end of the board.

---

## 🧠 How It Works

The project is divided into two main parts: the AI chess engine that decides the computer's moves, and the React frontend that provides the user interface.

### The AI Engine

The core of the AI is the **Minimax algorithm**, a decision-making algorithm used in two-player games. It explores a tree of possible future moves to find the optimal one.

1.  **Minimax Algorithm**: The algorithm simulates games several moves deep. It assumes the opponent will always play their best move (minimizing the AI's score) and tries to find a move that leads to the best possible outcome for itself (maximizing its score).

2.  **Alpha-Beta Pruning**: To make the search faster, we use **alpha-beta pruning**. This technique safely cuts off branches of the search tree that won't lead to a better result, drastically reducing the number of calculations needed.
    http://googleusercontent.com/image_generation_content/1

3.  **Evaluation Function**: To score a board position, the AI uses a sophisticated **heuristic evaluation function**. This function assigns a numerical value to a position based on several factors:
    * **Material Advantage**: The total value of pieces on the board (Queen = 9, Rook = 5, etc.).
    * **Piece-Square Tables (PSTs)**: Pieces are more valuable on certain squares. For example, a knight in the center of the board is more powerful than one in a corner. The AI uses tables to reward good piece placement.
        http://googleusercontent.com/image_generation_content/2

### Frontend with React

The user interface is built as a modern single-page application using **React.js** and bundled with **Vite** for a fast development experience.

* **Component-Based Architecture**: The UI is broken down into reusable components like `ChessBoard`, `Tile`, and `CapturedPieces`, making the code clean and maintainable.
* **State Management**: React's `Context API` and custom hooks (`useBoard`) are used to manage the game's state, such as the board position, current turn, and game history.
* **Interactive Board**: The chessboard is rendered dynamically. Clicking on a piece highlights its legal moves, and pieces can be moved with a simple click interface.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS
* **Build Tool**: Vite
* **Real-time Communication**: Websocket API (Client & Server)
* **Backend**: Node.js, Express (for the socket server)

---

## 🚀 Installation & Setup

Follow these steps to get the project running on your local machine.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/chess-ai.git](https://github.com/your-username/chess-ai.git)
    cd chess-ai
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Navigate to the server directory and install its dependencies:**
    ```bash
    cd src/server
    npm install
    ```

4.  **Start the backend server:** (only for multiplayer)
    * From the `src/server` directory, run:
    ```bash
    node server.js
    ```
    * The server will start, typically on `http://localhost:3001`.

5.  **Start the frontend development server:**
    * Go back to the root directory (`cd ../..`).
    * Run the Vite development server:
    ```bash
    npm run dev
    ```
    * Open your browser and navigate to `http://localhost:5173` (or the URL provided in your terminal).

---

## 📁 Project Structure

├── public/               # Static assets (piece images, favicon)
├── src/
│   ├── ai/               # Core AI logic
│   │   ├── evaluateBoard.js # Heuristic evaluation function
│   │   └── minimax.js       # Minimax with alpha-beta pruning
│   ├── components/         # Reusable React components
│   │   ├── Board/
│   │   ├── Button/
│   │   └── ...
│   ├── context/            # React Context for state management
│   ├── hooks/              # Custom React hooks (e.g., useBoard)
│   ├── server/             # Backend Socket.io server
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Entry point of the React app
├── .gitignore
├── package.json
├── README.md
└── vite.config.js        # Vite configuration

---

## 🔮 Future Enhancements

* **Transposition Tables**: Cache previously calculated board positions to speed up AI calculations.
* **Opening Book**: Use a database of standard openings for faster and more standard initial moves.
* **More Game Modes**: Implement different time controls (Blitz, Rapid) and puzzle modes.
* **UI/UX Improvements**: Add animations for moves, better visual feedback, and sound effects.
* **AI Algorithms**: Explore different alternatives for the minimax algorithm such as Monte Carlo Tree Search (MCTS) opimised with neural networks.
---

## 🤝 Contributing

Contributions are always welcome! If you have suggestions or want to add a new feature, please:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
