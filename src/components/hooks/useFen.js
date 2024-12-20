export default function useFEN(fen) {
  const rows = fen.split("/");
  
  const board = [];

  for (let row in rows) {
    
    const rowArray = [];
    for (let char in rows[row]) {
      if (isNaN((rows[row])[char])) {
        rowArray.push((rows[row])[char]);
      } else {
        for (let i = 0; i < parseInt((rows[row])[char]); i++) {
          rowArray.push(null);
        }
      }
    }
    board.push(rowArray);
  }
  return board;
}