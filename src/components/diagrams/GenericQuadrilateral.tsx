export default function GenericQuadrilateral() {
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
      {/* Angle arcs */}
      <path d="M80,35 A20,20 0 0,1 65,48" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <text x="82" y="52" fontSize="10" fill="#ef4444">α</text>
      <path d="M212,54 A20,20 0 0,1 232,68" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <text x="218" y="72" fontSize="10" fill="#ef4444">β</text>
      {/* Labels */}
      <text x="50" y="22" fontSize="14" fontWeight="bold" fill="#334155">A</text>
      <text x="234" y="42" fontSize="14" fontWeight="bold" fill="#334155">B</text>
      <text x="244" y="176" fontSize="14" fontWeight="bold" fill="#334155">C</text>
      <text x="24" y="166" fontSize="14" fontWeight="bold" fill="#334155">D</text>
      {/* Properties */}
      <text x="140" y="206" fontSize="11" fill="#64748b" textAnchor="middle">
        ∠A + ∠B + ∠C + ∠D = 360°
      </text>
    </svg>
  );
}
