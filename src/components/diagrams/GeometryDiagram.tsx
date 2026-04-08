interface ShapeData {
  vertices: [number, number][];
  parallelSides?: [number, number][];
  equalSides?: [number, number][];
  rightAngles?: number[];
}

const shapes: Record<string, ShapeData> = {
  parallelogram: { vertices: [[80, 40], [250, 40], [220, 160], [50, 160]], parallelSides: [[0, 1], [3, 2]], equalSides: [[0, 3], [1, 2]] },
  rhombus: { vertices: [[150, 20], [270, 110], [150, 200], [30, 110]], parallelSides: [[0, 1], [2, 3]], equalSides: [[0, 1], [1, 2], [2, 3], [3, 0]] },
  rectangle: { vertices: [[50, 40], [250, 40], [250, 160], [50, 160]], parallelSides: [[0, 1], [3, 2]], equalSides: [[0, 3], [1, 2]], rightAngles: [0, 1, 2, 3] },
  square: { vertices: [[75, 25], [225, 25], [225, 175], [75, 175]], parallelSides: [[0, 1], [3, 2]], equalSides: [[0, 1], [1, 2], [2, 3], [3, 0]], rightAngles: [0, 1, 2, 3] },
  kite: { vertices: [[150, 20], [250, 100], [150, 200], [50, 100]], equalSides: [[0, 1], [0, 3]] },
  trapezium: { vertices: [[100, 40], [220, 40], [260, 160], [40, 160]], parallelSides: [[0, 1], [3, 2]] },
  'generic-quadrilateral': { vertices: [[80, 30], [240, 50], [230, 170], [60, 150]] },
};

const vertexLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

interface Props {
  shape: string;
  highlight?: string;
  showLabels?: boolean;
  showDiagonals?: boolean;
  showAngles?: boolean;
  width?: number;
  height?: number;
}

export default function GeometryDiagram({ shape: shapeName, highlight, showLabels = true, showDiagonals = false, showAngles = false, width = 300, height = 220 }: Props) {
  const shape = shapes[shapeName];
  if (!shape) return null;

  const { vertices } = shape;
  const points = vertices.map(v => v.join(',')).join(' ');
  const center: [number, number] = [
    vertices.reduce((s, v) => s + v[0], 0) / vertices.length,
    vertices.reduce((s, v) => s + v[1], 0) / vertices.length,
  ];

  const labelOffset = (v: [number, number]): [number, number] => {
    const dx = v[0] - center[0];
    const dy = v[1] - center[1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [v[0] + (dx / len) * 18, v[1] + (dy / len) * 18];
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[300px]" xmlns="http://www.w3.org/2000/svg">
      <polygon points={points} fill="#dbeafe" stroke="#2563eb" strokeWidth="2.5" />

      {highlight === 'opposite-sides' && shape.parallelSides?.map(([a, b], i) => (
        <line key={`hl-${i}`} x1={vertices[a][0]} y1={vertices[a][1]} x2={vertices[b][0]} y2={vertices[b][1]} stroke="#3b82f6" strokeWidth="4" opacity="0.6" />
      ))}

      {highlight === 'all-sides' && vertices.map((v, i) => {
        const next = vertices[(i + 1) % vertices.length];
        return <line key={`as-${i}`} x1={v[0]} y1={v[1]} x2={next[0]} y2={next[1]} stroke="#3b82f6" strokeWidth="4" opacity="0.6" />;
      })}

      {(highlight === 'parallel-marks' || highlight === 'opposite-sides') && shape.parallelSides?.map(([a, b], pairIdx) => {
        const mid = [(vertices[a][0] + vertices[b][0]) / 2, (vertices[a][1] + vertices[b][1]) / 2];
        return (
          <g key={`pm-${pairIdx}`}>
            {Array.from({ length: pairIdx + 1 }, (_, k) => (
              <line key={k} x1={mid[0] - 4 + k * 4} y1={mid[1] - 4} x2={mid[0] - 4 + k * 4} y2={mid[1] + 4} stroke="#2563eb" strokeWidth="2" />
            ))}
          </g>
        );
      })}

      {showDiagonals && vertices.length >= 4 && (
        <>
          <line x1={vertices[0][0]} y1={vertices[0][1]} x2={vertices[2][0]} y2={vertices[2][1]} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4" />
          <line x1={vertices[1][0]} y1={vertices[1][1]} x2={vertices[3][0]} y2={vertices[3][1]} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx={center[0]} cy={center[1]} r="3" fill="#ef4444" />
        </>
      )}

      {showAngles && shape.rightAngles?.map(idx => {
        const v = vertices[idx];
        return (
          <rect key={`ra-${idx}`}
            x={v[0] + (center[0] > v[0] ? 3 : -13)} y={v[1] + (center[1] > v[1] ? 3 : -13)}
            width="10" height="10" fill="none" stroke="#1e40af" strokeWidth="1.5" />
        );
      })}

      {showLabels && vertices.map((v, i) => {
        const [lx, ly] = labelOffset(v);
        return <text key={`l-${i}`} x={lx} y={ly} fontSize="14" fontWeight="bold" fill="#1e40af" textAnchor="middle" dominantBaseline="central">{vertexLabels[i]}</text>;
      })}
    </svg>
  );
}
