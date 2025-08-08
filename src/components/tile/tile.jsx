export default function Tile({
  number,
  verticalAxis,
  horizontalAxis,
  i,
  j,
  image,
  row,
  col
}) {
  return (
    <div className={`grid place-items-center ${number % 2 == 1 ? 'bg-[#ebecd0]' : 'bg-[#779556]'}`}>
      {image && (
        <div 
          className="chess-piece w-[70px] h-[70px] hover:cursor-grab active:cursor-grabbing bg-no-repeat bg-cover"
          style={{backgroundImage: `url(${image})`}}
          data-row={row}
          data-col={col}
        />
      )}
    </div>
  );
}