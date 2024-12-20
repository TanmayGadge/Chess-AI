export default function Tile({
  number,
  verticalAxis,
  horizontalAxis,
  i,
  j,
  image,
}) {
  return (
    <div className={`grid place-items-center ${number % 2 == 1 ? 'bg-[#ebecd0]' : 'bg-[#779556]'}`}>
      {/* [{horizontalAxis[i]}
      {verticalAxis[j]}] */}
      {image && <img src={image} alt="chess piece" className="w-3/4 h-3/4 hover:cursor-grab" />}
    </div>
  );
}
