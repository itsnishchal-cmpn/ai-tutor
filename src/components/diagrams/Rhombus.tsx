export default function Rhombus() {
  return (
    <svg viewBox="0 0 260 220" className="w-full max-w-[260px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape */}
      <polygon
        points="130,20 230,100 130,180 30,100"
        fill="#fce7f3"
        stroke="#db2777"
        strokeWidth="2.5"
      />
      {/* Equal side marks */}
      {/* AB */}
      <line x1="176" y1="56" x2="180" y2="64" stroke="#db2777" strokeWidth="2" />
      {/* BC */}
      <line x1="176" y1="144" x2="180" y2="136" stroke="#db2777" strokeWidth="2" />
      {/* CD */}
      <line x1="84" y1="136" x2="80" y2="144" stroke="#db2777" strokeWidth="2" />
      {/* DA */}
      <line x1="84" y1="64" x2="80" y2="56" stroke="#db2777" strokeWidth="2" />
      {/* Diagonals */}
      <line x1="130" y1="20" x2="130" y2="180" stroke="#db2777" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="30" y1="100" x2="230" y2="100" stroke="#db2777" strokeWidth="1" strokeDasharray="4,4" />
      {/* Right angle at center */}
      <rect x="130" y="92" width="8" height="8" fill="none" stroke="#db2777" strokeWidth="1.5" />
      {/* Labels */}
      <text x="126" y="14" fontSize="14" fontWeight="bold" fill="#9d174d">A</text>
      <text x="234" y="104" fontSize="14" fontWeight="bold" fill="#9d174d">B</text>
      <text x="126" y="198" fontSize="14" fontWeight="bold" fill="#9d174d">C</text>
      <text x="12" y="104" fontSize="14" fontWeight="bold" fill="#9d174d">D</text>
      {/* Properties */}
      <text x="130" y="214" fontSize="11" fill="#64748b" textAnchor="middle">
        All sides equal | Diagonals bisect at 90°
      </text>
    </svg>
  );
}
