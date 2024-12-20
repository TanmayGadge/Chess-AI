import "./tile.css";

export default function Tile({
  number,
  verticalAxis,
  horizontalAxis,
  i,
  j,
  image,
}) {
  return (
    <div className={`tile ${number % 2 == 1 ? "white-tile" : "black-tile"}`}>
      {/* [{horizontalAxis[i]}
      {verticalAxis[j]}] */}
      {image && <img src={image} alt="chess piece" className="piece" />}
    </div>
  );
}
