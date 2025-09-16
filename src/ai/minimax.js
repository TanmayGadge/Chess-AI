import evaluateBoard from "./evaluateBoard";
export default function minimax(board, depth, isMaximizingPlayer) {
    if (depth === 0) {
        return evaluateBoard(board);
    }

    if(isMaximizingPlayer){
        maxEval = -Infinity;
        
    }
}