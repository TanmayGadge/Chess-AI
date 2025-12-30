import { useBoard } from "../../context/BoardContext";

const PromotionModal = () => {
  const { showPromotionModal, completePawnPromotion, promotionColor } =
    useBoard();

  if (!showPromotionModal) return null;

  const pieces = [
    { type: "q", name: "Queen" },
    { type: "r", name: "Rook" },
    { type: "b", name: "Bishop" },
    { type: "n", name: "Knight" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-center">
          Promote your pawn to:
        </h3>
        <div className="flex gap-4">
          {pieces.map((piece) => {
            const pieceImage = `${promotionColor}-${piece.name.toLowerCase()}`;
            return (
              <button
                key={piece.type}
                onClick={() => completePawnPromotion(piece.type)}
                className="flex flex-col items-center p-3 border-2 border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <img
                  src={`/${pieceImage}.svg`}
                  alt={piece.name}
                  className="w-12 h-12 mb-2"
                />
                <span className="text-sm font-medium">{piece.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
