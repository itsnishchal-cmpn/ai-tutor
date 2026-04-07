export default function Rectangle() {
  return (
    <svg viewBox="0 0 300 200" className="w-full max-w-[300px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape */}
      <rect
        x="40" y="30" width="220" height="120"
        fill="#dcfce7"
        stroke="#16a34a"
        strokeWidth="2.5"
        rx="2"
      />
      {/* Right angle marks */}
      {[
        [40, 30], [260, 30], [260, 150], [40, 150]
      ].map(([x, y], i) => {
        const dx = i === 0 || i === 3 ? 10 : -10;
        const dy = i === 0 || i === 1 ? 10 : -10;
        return (
          <path
            key={i}
            d={`M${x + dx},${y} L${x + dx},${y + dy} L${x},${y + dy}`}
            fill="none"
            stroke="#16a34a"
            strokeWidth="1.5"
          />
        );
      })}
      {/* Diagonals */}
      <line x1="40" y1="30" x2="260" y2="150" stroke="#16a34a" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="260" y1="30" x2="40" y2="150" stroke="#16a34a" strokeWidth="1" strokeDasharray="4,4" />
      {/* Labels */}
      <text x="28" y="24" fontSize="14" fontWeight="bold" fill="#15803d">A</text>
      <text x="264" y="24" fontSize="14" fontWeight="bold" fill="#15803d">B</text>
      <text x="264" y="168" fontSize="14" fontWeight="bold" fill="#15803d">C</text>
      <text x="28" y="168" fontSize="14" fontWeight="bold" fill="#15803d">D</text>
      {/* Properties */}
      <text x="150" y="192" fontSize="11" fill="#64748b" textAnchor="middle">
        All angles 90° | Diagonals equal & bisect each other
      </text>
    </svg>
  );
}
