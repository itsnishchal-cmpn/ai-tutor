export default function PolygonIntro() {
  return (
    <svg viewBox="0 0 360 200" className="w-full max-w-[360px]" xmlns="http://www.w3.org/2000/svg">
      {/* Triangle */}
      <polygon
        points="45,90 85,20 125,90"
        fill="#dbeafe"
        stroke="#2563eb"
        strokeWidth="2"
      />
      <text x="85" y="110" fontSize="11" fill="#1e40af" textAnchor="middle" fontWeight="600">Triangle</text>
      <text x="85" y="123" fontSize="10" fill="#64748b" textAnchor="middle">3 sides</text>

      {/* Square (Quadrilateral) */}
      <polygon
        points="145,25 215,25 215,90 145,90"
        fill="#dcfce7"
        stroke="#16a34a"
        strokeWidth="2"
      />
      <text x="180" y="110" fontSize="11" fill="#16a34a" textAnchor="middle" fontWeight="600">Quadrilateral</text>
      <text x="180" y="123" fontSize="10" fill="#64748b" textAnchor="middle">4 sides</text>

      {/* Pentagon */}
      <polygon
        points="275,22 310,58 296,95 254,95 240,58"
        fill="#fef3c7"
        stroke="#d97706"
        strokeWidth="2"
      />
      <text x="275" y="110" fontSize="11" fill="#d97706" textAnchor="middle" fontWeight="600">Pentagon</text>
      <text x="275" y="123" fontSize="10" fill="#64748b" textAnchor="middle">5 sides</text>

      {/* Hexagon - below row */}
      {/* Not needed, 3 is enough for a clean layout */}

      {/* Divider line */}
      <line x1="30" y1="138" x2="330" y2="138" stroke="#e2e8f0" strokeWidth="1" />

      {/* Key insight */}
      <text x="180" y="158" fontSize="12" fill="#334155" textAnchor="middle" fontWeight="600">
        Polygon = Closed shape made of straight lines
      </text>
      <text x="180" y="175" fontSize="11" fill="#64748b" textAnchor="middle">
        Convex: all angles &lt; 180° | Concave: at least one angle &gt; 180°
      </text>
    </svg>
  );
}
