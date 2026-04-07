export default function Kite() {
  return (
    <svg viewBox="0 0 240 260" className="w-full max-w-[240px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape */}
      <polygon
        points="120,20 200,100 120,220 40,100"
        fill="#e0e7ff"
        stroke="#4f46e5"
        strokeWidth="2.5"
      />
      {/* Equal marks — top pair (AB = AD) */}
      <line x1="157" y1="56" x2="163" y2="64" stroke="#4f46e5" strokeWidth="2" />
      <line x1="77" y1="64" x2="83" y2="56" stroke="#4f46e5" strokeWidth="2" />
      {/* Equal marks — bottom pair (BC = DC) — double mark */}
      <line x1="157" y1="156" x2="163" y2="164" stroke="#4f46e5" strokeWidth="2" />
      <line x1="160" y1="152" x2="166" y2="160" stroke="#4f46e5" strokeWidth="2" />
      <line x1="77" y1="164" x2="83" y2="156" stroke="#4f46e5" strokeWidth="2" />
      <line x1="74" y1="160" x2="80" y2="152" stroke="#4f46e5" strokeWidth="2" />
      {/* Diagonals */}
      <line x1="120" y1="20" x2="120" y2="220" stroke="#4f46e5" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="40" y1="100" x2="200" y2="100" stroke="#4f46e5" strokeWidth="1" strokeDasharray="4,4" />
      {/* Right angle at intersection */}
      <rect x="120" y="92" width="8" height="8" fill="none" stroke="#4f46e5" strokeWidth="1.5" />
      {/* Labels */}
      <text x="116" y="14" fontSize="14" fontWeight="bold" fill="#3730a3">A</text>
      <text x="204" y="104" fontSize="14" fontWeight="bold" fill="#3730a3">B</text>
      <text x="116" y="238" fontSize="14" fontWeight="bold" fill="#3730a3">C</text>
      <text x="22" y="104" fontSize="14" fontWeight="bold" fill="#3730a3">D</text>
      {/* Properties */}
      <text x="120" y="254" fontSize="11" fill="#64748b" textAnchor="middle">
        AB = AD, BC = DC | One diagonal bisected at 90°
      </text>
    </svg>
  );
}
