export interface QuadProperty {
  name: string;
  sides: string;
  angles: string;
  diagonals: string;
  specialNote: string;
}

export const quadrilateralProperties: Record<string, QuadProperty> = {
  parallelogram: {
    name: 'Parallelogram',
    sides: 'Opposite sides parallel & equal',
    angles: 'Opposite angles equal, consecutive supplementary',
    diagonals: 'Bisect each other',
    specialNote: 'AB ∥ CD, AD ∥ BC; AB = CD, AD = BC',
  },
  rhombus: {
    name: 'Rhombus',
    sides: 'All four sides equal, opposite sides parallel',
    angles: 'Opposite angles equal',
    diagonals: 'Bisect each other at right angles (90°)',
    specialNote: 'A parallelogram with all sides equal',
  },
  rectangle: {
    name: 'Rectangle',
    sides: 'Opposite sides equal & parallel',
    angles: 'All angles = 90°',
    diagonals: 'Equal in length, bisect each other',
    specialNote: 'A parallelogram with all angles 90°',
  },
  square: {
    name: 'Square',
    sides: 'All four sides equal, all sides parallel to opposite',
    angles: 'All angles = 90°',
    diagonals: 'Equal, bisect each other at 90°',
    specialNote: 'Both a rectangle and a rhombus!',
  },
  kite: {
    name: 'Kite',
    sides: 'Two pairs of consecutive equal sides',
    angles: 'One pair of opposite angles equal',
    diagonals: 'One diagonal bisects the other at 90°',
    specialNote: 'Not a parallelogram — only 1 pair of equal opposite angles',
  },
  trapezium: {
    name: 'Trapezium',
    sides: 'One pair of parallel sides (called bases)',
    angles: 'Co-interior angles between parallel sides are supplementary',
    diagonals: 'No special bisection property in general',
    specialNote: 'Isosceles trapezium has equal non-parallel sides and equal diagonals',
  },
};
