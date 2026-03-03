from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chess
import math
import time

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Global counter to track "thinking" effort
nodes_visited = 0

# --- 1. Evaluation Logic (Same as before) ---

PIECE_VALUES = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000
}

PIECE_SQUARE_TABLES = {
    'p': [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [ 5,  5, 10, 25, 25, 10,  5,  5],
        [ 0,  0,  0, 20, 20,  0,  0,  0],
        [ 5, -5,-10,  0,  0,-10, -5,  5],
        [ 5, 10, 10,-20,-20, 10, 10,  5],
        [ 0,  0,  0,  0,  0,  0,  0,  0]
    ],
    'n': [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    'b': [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    'r': [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [ 5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [ 0,  0,  0,  5,  5,  0,  0,  0]
    ],
    'q': [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [ -5,  0,  5,  5,  5,  5,  0, -5],
        [  0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    'k': [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [ 20, 20,  0,  0,  0,  0, 20, 20],
        [ 20, 30, 10,  0,  0, 10, 30, 20]
    ],
    'k_endgame': [
        [-50,-40,-30,-20,-20,-30,-40,-50],
        [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30],
        [-50,-30,-30,-30,-30,-30,-30,-50]
    ]
}

def is_endgame(board: chess.Board):
    queens = len(board.pieces(chess.QUEEN, chess.WHITE)) + len(board.pieces(chess.QUEEN, chess.BLACK))
    minor_pieces = (
        len(board.pieces(chess.KNIGHT, chess.WHITE)) + len(board.pieces(chess.KNIGHT, chess.BLACK)) +
        len(board.pieces(chess.BISHOP, chess.WHITE)) + len(board.pieces(chess.BISHOP, chess.BLACK))
    )
    return queens == 0 or (queens == 2 and minor_pieces <= 2)

def evaluate_board(board: chess.Board):
    material_score = 0
    positional_score = 0
    endgame = is_endgame(board)
    
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if not piece:
            continue
            
        piece_type_symbol = piece.symbol().lower()
        is_white = piece.color == chess.WHITE
        
        # Material Score
        value = PIECE_VALUES.get(piece_type_symbol, 0)
        material_score += value if is_white else -value
        
        # Positional Score
        rank = chess.square_rank(square)
        file = chess.square_file(square)
        
        table_row = 7 - rank 
        table_col = file
        
        table = None
        if piece_type_symbol == 'k':
            table = PIECE_SQUARE_TABLES['k_endgame'] if endgame else PIECE_SQUARE_TABLES['k']
        else:
            table = PIECE_SQUARE_TABLES.get(piece_type_symbol)
            
        if table:
            if is_white:
                positional_score += table[table_row][table_col]
            else:
                flipped_row = 7 - table_row
                positional_score -= table[flipped_row][table_col]

    return material_score + positional_score

# --- 2. Minimax Logic with Logging ---

def minimax(board: chess.Board, depth: int, alpha: float, beta: float, maximizing_player: bool):
    global nodes_visited
    nodes_visited += 1
    
    if depth == 0 or board.is_game_over():
        return evaluate_board(board)

    if maximizing_player:
        max_eval = -math.inf
        for move in board.legal_moves:
            board.push(move)
            eval = minimax(board, depth - 1, alpha, beta, False)
            board.pop()
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = math.inf
        for move in board.legal_moves:
            board.push(move)
            eval = minimax(board, depth - 1, alpha, beta, True)
            board.pop()
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return min_eval

def get_best_move(board: chess.Board, depth: int):
    global nodes_visited
    nodes_visited = 0  # Reset counter
    
    best_move = None
    max_eval = -math.inf
    min_eval = math.inf
    alpha = -math.inf
    beta = math.inf
    
    is_maximizing = board.turn == chess.WHITE
    
    print(f"\n[{'WHITE' if is_maximizing else 'BLACK'}] Thinking at depth {depth}...")
    start_time = time.time()
    
    moves = list(board.legal_moves)
    total_moves = len(moves)
    
    for i, move in enumerate(moves):
        board.push(move)
        
        # Log which move we are checking
        print(f"  > Checking {move.uci()} ({i+1}/{total_moves})... ", end="", flush=True)
        
        # Opponent's turn after we move
        eval = minimax(board, depth - 1, alpha, beta, not is_maximizing)
        board.pop()
        
        print(f"Score: {eval}")
        
        if is_maximizing:
            if eval > max_eval:
                max_eval = eval
                best_move = move
                print(f"    * New Best Move for White: {move.uci()} (Score: {eval})")
            alpha = max(alpha, eval)
        else:
            if eval < min_eval:
                min_eval = eval
                best_move = move
                print(f"    * New Best Move for Black: {move.uci()} (Score: {eval})")
            beta = min(beta, eval)
            
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"Done! Evaluated {nodes_visited} positions in {duration:.2f}s.")
    print(f"Chosen Move: {best_move.uci()} with final score: {max_eval if is_maximizing else min_eval}\n")
            
    return best_move

# --- 3. API Endpoint ---

class MoveRequest(BaseModel):
    fen: str
    depth: int = 3

@app.post("/predict")
async def predict_move(request: MoveRequest):
    try:
        board = chess.Board(request.fen)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid FEN string")

    if board.is_game_over():
        return {"move": None, "game_over": True}

    # Call the instrumented get_best_move
    best_move = get_best_move(board, request.depth)
    
    return {
        "move": best_move.uci() if best_move else None,
        "fen": request.fen
    }

if __name__ == "__main__":
    import uvicorn
    # Log level 'info' will show HTTP requests, our print statements show logic
    uvicorn.run(app, host="0.0.0.0", port=8000)