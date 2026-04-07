export default function Trapezium() {
  return (
    <svg viewBox="0 0 300 200" className="w-full max-w-[300px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape */}
      <polygon
        points="100,40 220,40 260,150 40,150"
        fill="#fef3c7"
        stroke="#d97706"
        strokeWidth="2.5"
      />
      {/* Parallel marks on AB and DC */}
      <line x1="155" y1="36" x2="165" y2="36" stroke="#d97706" strokeWidth="2" />
      <line x1="155" y1="32" x2="165" y2="32" stroke="#d97706" strokeWidth="2" />
      <line x1="145" y1="146" x2="155" y2="146" stroke="#d97706" strokeWidth="2" />
      <line x1="145" y1="142" x2="155" y2="142" stroke="#d97706" strokeWidth="2" />
      {/* Labels */}
      <text x="92" y="30" fontSize="14" fontWeight="bold" fill="#92400e">A</text>
      <text x="224" y="30" fontSize="14" fontWeight="bold" fill="#92400e">B</text>
      <text x="262" y="168" fontSize="14" fontWeight="bold" fill="#92400e">C</text>
      <text x="24" y="168" fontSize="14" fontWeight="bold" fill="#92400e">D</text>
      {/* Properties */}
      <text x="150" y="190" fontSize="11" fill="#64748b" textAnchor="middle">
        AB ∥ DC (one pair of parallel sides)
      </text>
    </svg>
  );
}
