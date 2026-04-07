import Parallelogram from '../diagrams/Parallelogram';
import Rhombus from '../diagrams/Rhombus';
import Rectangle from '../diagrams/Rectangle';
import Square from '../diagrams/Square';
import Kite from '../diagrams/Kite';
import Trapezium from '../diagrams/Trapezium';
import GenericQuadrilateral from '../diagrams/GenericQuadrilateral';
import DiagonalDemo from '../diagrams/DiagonalDemo';
import PolygonIntro from '../diagrams/PolygonIntro';
import AngleSum from '../diagrams/AngleSum';
import QuadrilateralFamily from '../diagrams/QuadrilateralFamily';

const diagramMap: Record<string, React.FC> = {
  parallelogram: Parallelogram,
  rhombus: Rhombus,
  rectangle: Rectangle,
  square: Square,
  kite: Kite,
  trapezium: Trapezium,
  'generic-quadrilateral': GenericQuadrilateral,
  'diagonal-demo': DiagonalDemo,
  'polygon-intro': PolygonIntro,
  'angle-sum': AngleSum,
  'quadrilateral-family': QuadrilateralFamily,
};

interface Props {
  diagramId: string;
}

export default function DiagramRenderer({ diagramId }: Props) {
  const Diagram = diagramMap[diagramId];

  if (!Diagram) {
    return (
      <div className="my-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-400">
        Diagram not available: {diagramId}
      </div>
    );
  }

  return (
    <div className="my-3 flex justify-center bg-white rounded-xl p-3 border border-gray-100">
      <Diagram />
    </div>
  );
}
