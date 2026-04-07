export default function Square() {
  return (
    <svg viewBox="0 0 240 220" className="w-full max-w-[240px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape */}
      <rect
        x="40" y="20" width="160" height="160"
        fill="#fef9c3"
        stroke="#ca8a04"
        strokeWidth="2.5"
        rx="2"
      />
      {/* Right angle marks */}
      {[
        [40, 20], [200, 20], [200, 180], [40, 180]
      ].map(([x, y], i) => {
        const dx = i === 0 || i === 3 ? 10 : -10;
        const dy = i === 0 || i === 1 ? 10 : -10;
        return (
          <path
            key={i}
            d={`M${x + dx},${y} L${x + dx},${y + dy} L${x},${y + dy}`}
            fill="none"
            stroke="#ca8a04"
            strokeWidth="1.5"
          />
        );
      })}
      {/* Equal side marks */}
      <line x1="116" y1="16" x2="124" y2="16" stroke="#ca8a04" strokeWidth="2" />
      <line x1="116" y1="176" x2="124" y2="176" stroke="#ca8a04" strokeWidth="2" />
      <line x1="36" y1="96" x2="36" y2="104" stroke="#ca8a04" strokeWidth="2" />
      <line x1="196" y1="96" x2="196" y2="104" stroke="#ca8a04" strokeWidth="2" />
      {/* Diagonals */}
      <line x1="40" y1="20" x2="200" y2="180" stroke="#ca8a04" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="200" y1="20" x2="40" y2="180" stroke="#ca8a04" strokeWidth="1" strokeDasharray="4,4" />
      {/* Right angle at center */}
      <rect x="120" y="92" width="8" height="8" fill="none" stroke="#ca8a04" strokeWidth="1.5" />
      {/* Labels */}
      <text x="28" y="16" fontSize="14" fontWeight="bold" fill="#a16207">A</text>
      <text x="204" y="16" fontSize="14" fontWeight="bold" fill="#a16207">B</text>
      <text x="204" y="196" fontSize="14" fontWeight="bold" fill="#a16207">C</text>
      <text x="28" y="196" fontSize="14" fontWeight="bold" fill="#a16207">D</text>
      {/* Properties */}
      <text x="120" y="212" fontSize="11" fill="#64748b" textAnchor="middle">
        All sides equal + All angles 90° | Diagonals equal, bisect at 90°
      </text>
    </svg>
  );
}
