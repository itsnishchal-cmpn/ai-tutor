export default function GenericQuadrilateral() {
  // Vertices: A(60,30) B(230,50) C(240,160) D(40,150)
  // Angle arcs should trace the interior angle at each vertex
  const r = 22; // arc radius

  return (
    <svg viewBox="0 0 280 220" className="w-full max-w-[280px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape */}
      <polygon
        points="60,30 230,50 240,160 40,150"
        fill="#f1f5f9"
        stroke="#475569"
        strokeWidth="2.5"
      />
      {/* Diagonal 1 */}
      <line x1="60" y1="30" x2="240" y2="160" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" />
      {/* Diagonal 2 */}
      <line x1="230" y1="50" x2="40" y2="150" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" />

      {/* Angle arc at A — between sides AD and AB */}
      <path
        d={`M ${60 + 0.97 * r},${30 + 0.12 * r} A ${r},${r} 0 0,1 ${60 - 0.16 * r},${30 + 0.99 * r}`}
        fill="none" stroke="#ef4444" strokeWidth="1.5"
      />
      <text x="68" y="55" fontSize="10" fill="#ef4444">A</text>

      {/* Angle arc at B — between sides AB and BC */}
      <path
        d={`M ${230 - 0.99 * r},${50 - 0.12 * r} A ${r},${r} 0 0,1 ${230 + 0.09 * r},${50 + 0.99 * r}`}
        fill="none" stroke="#ef4444" strokeWidth="1.5"
      />
      <text x="222" y="76" fontSize="10" fill="#ef4444">B</text>

      {/* Angle arc at C — between sides BC and CD */}
      <path
        d={`M ${240 - 0.09 * r},${160 - 0.99 * r} A ${r},${r} 0 0,1 ${240 - 0.99 * r},${160 - 0.05 * r}`}
        fill="none" stroke="#ef4444" strokeWidth="1.5"
      />
      <text x="222" y="152" fontSize="10" fill="#ef4444">C</text>

      {/* Angle arc at D — between sides CD and DA */}
      <path
        d={`M ${40 + 0.99 * r},${150 + 0.05 * r} A ${r},${r} 0 0,1 ${40 + 0.16 * r},${150 - 0.99 * r}`}
        fill="none" stroke="#ef4444" strokeWidth="1.5"
      />
      <text x="48" y="142" fontSize="10" fill="#ef4444">D</text>

      {/* Labels */}
      <text x="50" y="20" fontSize="14" fontWeight="bold" fill="#334155">A</text>
      <text x="234" y="42" fontSize="14" fontWeight="bold" fill="#334155">B</text>
      <text x="244" y="176" fontSize="14" fontWeight="bold" fill="#334155">C</text>
      <text x="20" y="166" fontSize="14" fontWeight="bold" fill="#334155">D</text>
      {/* Properties */}
      <text x="140" y="206" fontSize="11" fill="#64748b" textAnchor="middle">
        ∠A + ∠B + ∠C + ∠D = 360°
      </text>
    </svg>
  );
}
