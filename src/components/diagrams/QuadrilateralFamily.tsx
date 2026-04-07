export default function QuadrilateralFamily() {
  // Family tree: Quadrilateral → Parallelogram/Trapezium/Kite
  //              Parallelogram → Rectangle/Rhombus
  //              Rectangle + Rhombus → Square
  return (
    <svg viewBox="0 0 340 240" className="w-full max-w-[340px]" xmlns="http://www.w3.org/2000/svg">
      {/* Connection lines — drawn first so boxes appear on top */}
      {/* Quadrilateral → Parallelogram */}
      <line x1="170" y1="32" x2="110" y2="68" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Quadrilateral → Trapezium */}
      <line x1="170" y1="32" x2="250" y2="68" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Quadrilateral → Kite */}
      <line x1="170" y1="32" x2="310" y2="68" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Parallelogram → Rectangle */}
      <line x1="110" y1="92" x2="65" y2="128" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Parallelogram → Rhombus */}
      <line x1="110" y1="92" x2="160" y2="128" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Rectangle → Square */}
      <line x1="65" y1="152" x2="110" y2="188" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Rhombus → Square */}
      <line x1="160" y1="152" x2="110" y2="188" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Level 0: Quadrilateral */}
      <rect x="110" y="10" width="120" height="24" rx="6" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
      <text x="170" y="27" fontSize="11" fontWeight="bold" fill="#334155" textAnchor="middle">Quadrilateral</text>

      {/* Level 1: Parallelogram, Trapezium, Kite */}
      <rect x="48" y="68" width="124" height="24" rx="6" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" />
      <text x="110" y="85" fontSize="11" fontWeight="bold" fill="#1e40af" textAnchor="middle">Parallelogram</text>

      <rect x="195" y="68" width="110" height="24" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
      <text x="250" y="85" fontSize="11" fontWeight="bold" fill="#92400e" textAnchor="middle">Trapezium</text>

      <rect x="282" y="68" width="56" height="24" rx="6" fill="#fce7f3" stroke="#db2777" strokeWidth="1.5" />
      <text x="310" y="85" fontSize="11" fontWeight="bold" fill="#9d174d" textAnchor="middle">Kite</text>

      {/* Level 2: Rectangle, Rhombus */}
      <rect x="10" y="128" width="110" height="24" rx="6" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
      <text x="65" y="145" fontSize="11" fontWeight="bold" fill="#166534" textAnchor="middle">Rectangle</text>

      <rect x="104" y="128" width="110" height="24" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
      <text x="159" y="145" fontSize="11" fontWeight="bold" fill="#92400e" textAnchor="middle">Rhombus</text>

      {/* Level 3: Square */}
      <rect x="60" y="188" width="100" height="24" rx="6" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
      <text x="110" y="205" fontSize="11" fontWeight="bold" fill="#5b21b6" textAnchor="middle">Square</text>

      {/* Annotation */}
      <text x="170" y="234" fontSize="10" fill="#64748b" textAnchor="middle">
        Square = Rectangle + Rhombus (most special quadrilateral)
      </text>
    </svg>
  );
}
