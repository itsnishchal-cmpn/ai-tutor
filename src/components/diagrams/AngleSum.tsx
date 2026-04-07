export default function AngleSum() {
  // Pentagon split into triangles from one vertex to show (n-2)×180°
  const A = [60, 30];
  const B = [230, 30];
  const C = [270, 120];
  const D = [180, 180];
  const E = [20, 120];

  return (
    <svg viewBox="0 0 300 230" className="w-full max-w-[300px]" xmlns="http://www.w3.org/2000/svg">
      {/* Pentagon outline */}
      <polygon
        points={`${A} ${B} ${C} ${D} ${E}`}
        fill="#f1f5f9"
        stroke="#475569"
        strokeWidth="2.5"
      />

      {/* Triangle diagonals from vertex A */}
      <line x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,3" />
      <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,3" />

      {/* Triangle number labels */}
      <text x="130" y="65" fontSize="16" fontWeight="bold" fill="#2563eb" textAnchor="middle">1</text>
      <text x="195" y="115" fontSize="16" fontWeight="bold" fill="#16a34a" textAnchor="middle">2</text>
      <text x="110" y="130" fontSize="16" fontWeight="bold" fill="#d97706" textAnchor="middle">3</text>

      {/* Triangle fills for clarity */}
      <polygon points={`${A} ${B} ${C}`} fill="#dbeafe" fillOpacity="0.4" stroke="none" />
      <polygon points={`${A} ${C} ${D}`} fill="#dcfce7" fillOpacity="0.4" stroke="none" />
      <polygon points={`${A} ${D} ${E}`} fill="#fef3c7" fillOpacity="0.4" stroke="none" />

      {/* Vertex labels */}
      <text x={A[0] - 2} y={A[1] - 8} fontSize="13" fontWeight="bold" fill="#334155" textAnchor="middle">A</text>
      <text x={B[0] + 4} y={B[1] - 8} fontSize="13" fontWeight="bold" fill="#334155" textAnchor="middle">B</text>
      <text x={C[0] + 12} y={C[1] + 4} fontSize="13" fontWeight="bold" fill="#334155">C</text>
      <text x={D[0]} y={D[1] + 16} fontSize="13" fontWeight="bold" fill="#334155" textAnchor="middle">D</text>
      <text x={E[0] - 12} y={E[1] + 4} fontSize="13" fontWeight="bold" fill="#334155">E</text>

      {/* Formula */}
      <text x="150" y="212" fontSize="12" fill="#334155" textAnchor="middle" fontWeight="600">
        Pentagon = 3 triangles = 3 × 180° = 540°
      </text>
      <text x="150" y="227" fontSize="11" fill="#64748b" textAnchor="middle">
        Sum of interior angles = (n−2) × 180°
      </text>
    </svg>
  );
}
