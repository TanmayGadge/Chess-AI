import ChessBoard from "./components/board/chessBoard";

function App() {
  let startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/";
  return (
    <div className="bg-[#242424]">
      <ChessBoard fen={startingFEN}/>
    </div>
  );
}

export default App;