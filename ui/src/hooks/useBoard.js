export default function arrayToFEN(board) {
  const rows = [];
  
  for (let row of board) {
    let fenRow = "";
    let emptyCount = 0;
    
    for (let square of row) {
      if (square === null) {
        // Count consecutive empty squares
        emptyCount++;
      } else {
        // If we had empty squares before this piece, add the count
        if (emptyCount > 0) {
          fenRow += emptyCount.toString();
          emptyCount = 0;
        }
        // Add the piece
        fenRow += square;
      }
    }
    
    // If the row ends with empty squares, add the count
    if (emptyCount > 0) {
      fenRow += emptyCount.toString();
    }
    
    rows.push(fenRow);
  }
  
  return rows.join("/");
}
