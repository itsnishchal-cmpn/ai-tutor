export default function DiagonalDemo() {
  // Show a parallelogram with both diagonals bisecting each other
  const cx = 150, cy = 100; // center / intersection point
  return (
    <svg viewBox="0 0 300 220" className="w-full max-w-[300px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape */}
      <polygon
        points="70,40 250,40 230,160 50,160"
        fill="#f0fdf4"
        stroke="#16a34a"
        strokeWidth="2"
      />
      {/* Diagonal AC */}
      <line x1="70" y1="40" x2="230" y2="160" stroke="#dc2626" strokeWidth="2" />
      {/* Diagonal BD */}
      <line x1="250" y1="40" x2="50" y2="160" stroke="#2563eb" strokeWidth="2" />
      {/* Center point */}
      <circle cx={cx} cy={cy} r="4" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" />
      <text x={cx + 6} y={cy - 6} fontSize="12" fontWeight="bold" fill="#92400e">O</text>
      {/* Equal half marks — AO = OC (red diagonal) */}
      <line x1="106" y1="66" x2="114" y2="74" stroke="#dc2626" strokeWidth="2" />
      <line x1="186" y1="126" x2="194" y2="134" stroke="#dc2626" strokeWidth="2" />
      {/* Equal half marks — BO = OD (blue diagonal) */}
      <line x1="196" y1="74" x2="204" y2="66" stroke="#2563eb" strokeWidth="2" />
      <line x1="96" y1="134" x2="104" y2="126" stroke="#2563eb" strokeWidth="2" />
      {/* Labels */}
      <text x="60" y="30" fontSize="14" fontWeight="bold" fill="#334155">A</text>
      <text x="254" y="30" fontSize="14" fontWeight="bold" fill="#334155">B</text>
      <text x="232" y="178" fontSize="14" fontWeight="bold" fill="#334155">C</text>
      <text x="34" y="178" fontSize="14" fontWeight="bold" fill="#334155">D</text>
      {/* Properties */}
      <text x="150" y="202" fontSize="11" fill="#64748b" textAnchor="middle">
        AO = OC, BO = OD — Diagonals bisect each other
      </text>
    </svg>
  );
}
