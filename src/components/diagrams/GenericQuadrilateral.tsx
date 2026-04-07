export default function GenericQuadrilateral() {
  // Vertices going clockwise
  const A = [60, 30];
  const B = [230, 50];
  const C = [240, 160];
  const D = [40, 150];

  const r = 20; // arc radius

  // Helper: get unit vector from point P toward point Q
  function unit(p: number[], q: number[]): [number, number] {
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    return [dx / len, dy / len];
  }

  // Helper: build a small arc path at vertex V between neighbors N1 and N2
  // Arc goes from V+r*dir(N1) to V+r*dir(N2) clockwise inside the polygon
  function angleArc(v: number[], n1: number[], n2: number[]) {
    const [ux1, uy1] = unit(v, n1);
    const [ux2, uy2] = unit(v, n2);
    const x1 = v[0] + r * ux1;
    const y1 = v[1] + r * uy1;
    const x2 = v[0] + r * ux2;
    const y2 = v[1] + r * uy2;
    // Use sweep=1 for clockwise arc (works for convex interior angles)
    // Cross product determines sweep direction
    const cross = ux1 * uy2 - uy1 * ux2;
    const sweep = cross > 0 ? 1 : 0;
    return `M ${x1.toFixed(1)},${y1.toFixed(1)} A ${r},${r} 0 0,${sweep} ${x2.toFixed(1)},${y2.toFixed(1)}`;
  }

  return (
    <svg viewBox="0 0 280 220" className="w-full max-w-[280px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape */}
      <polygon
        points="60,30 230,50 240,160 40,150"
        fill="#f1f5f9"
        stroke="#475569"
        strokeWidth="2.5"
      />
      {/* Diagonals */}
      <line x1="60" y1="30" x2="240" y2="160" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />
      <line x1="230" y1="50" x2="40" y2="150" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />

      {/* Interior angle arcs */}
      <path d={angleArc(A, D, B)} fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <path d={angleArc(B, A, C)} fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <path d={angleArc(C, B, D)} fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <path d={angleArc(D, C, A)} fill="none" stroke="#ef4444" strokeWidth="1.5" />

      {/* Vertex labels */}
      <text x="48" y="22" fontSize="14" fontWeight="bold" fill="#334155">A</text>
      <text x="234" y="42" fontSize="14" fontWeight="bold" fill="#334155">B</text>
      <text x="246" y="170" fontSize="14" fontWeight="bold" fill="#334155">C</text>
      <text x="22" y="162" fontSize="14" fontWeight="bold" fill="#334155">D</text>

      {/* Properties */}
      <text x="140" y="206" fontSize="11" fill="#64748b" textAnchor="middle">
        ∠A + ∠B + ∠C + ∠D = 360°
      </text>
    </svg>
  );
}
