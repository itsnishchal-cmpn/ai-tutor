import type { LessonTemplate } from '../types/lesson';

export const lessonTemplates: Record<string, LessonTemplate> = {
  'polygons-basics': {
    topicId: 'polygons-basics',
    videoId: 'JPrc70c7OqM',
    cards: [
      { id: 'poly-1', type: 'hook', subConcept: 'real-life-polygons-around-us' },
      { id: 'poly-2', type: 'concept', subConcept: 'answer-the-hook-what-is-a-polygon', diagramConfig: { shape: 'polygon-intro', showLabels: true } },
      { id: 'poly-3', type: 'concept', subConcept: 'what-is-NOT-a-polygon-curves-and-open-figures' },
      { id: 'poly-4', type: 'concept', subConcept: 'naming-by-sides-triangle-to-octagon', diagramConfig: { shape: 'polygon-intro', showLabels: true } },
      { id: 'poly-5', type: 'concept', subConcept: 'convex-polygon-all-angles-less-than-180' },
      { id: 'poly-6', type: 'concept', subConcept: 'concave-polygon-has-a-dent-angle-more-than-180' },
      { id: 'poly-7', type: 'concept', subConcept: 'regular-polygon-equal-sides-AND-equal-angles' },
      { id: 'poly-8', type: 'concept', subConcept: 'diagonal-formula-n-times-n-minus-3-over-2' },
    ],
    quizzes: [
      { id: 'poly-quiz-1', subConcept: 'polygon-definition-and-not-polygon', type: 'mcq', maxAttempts: 3 },
      { id: 'poly-quiz-2', subConcept: 'convex-vs-concave', type: 'mcq', maxAttempts: 3 },
      { id: 'poly-quiz-3', subConcept: 'regular-polygon-and-classification', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 5 },
  },

  'angle-sum-property': {
    topicId: 'angle-sum-property',
    videoId: '0QhGHIV61XA',
    cards: [
      { id: 'angle-1', type: 'hook', subConcept: 'why-do-tiles-fit-perfectly-on-floor' },
      { id: 'angle-2', type: 'concept', subConcept: 'triangle-angles-sum-to-180' },
      { id: 'angle-3', type: 'concept', subConcept: 'any-polygon-can-be-split-into-triangles', diagramConfig: { shape: 'angle-sum', showLabels: true, showAngles: true } },
      { id: 'angle-4', type: 'formula', subConcept: 'interior-angle-sum-formula-n-minus-2-times-180' },
      { id: 'angle-5', type: 'example', subConcept: 'calculate-for-quadrilateral-pentagon-hexagon' },
      { id: 'angle-6', type: 'concept', subConcept: 'exterior-angles-always-sum-to-360' },
      { id: 'angle-7', type: 'concept', subConcept: 'regular-polygon-each-angle-formula' },
    ],
    quizzes: [
      { id: 'angle-quiz-1', subConcept: 'interior-angle-sum-formula', type: 'mcq', maxAttempts: 3 },
      { id: 'angle-quiz-2', subConcept: 'exterior-angles-sum-360', type: 'mcq', maxAttempts: 3 },
      { id: 'angle-quiz-3', subConcept: 'regular-polygon-angle-calculation', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'quadrilateral-basics': {
    topicId: 'quadrilateral-basics',
    videoId: 'NLzElLjzvBg',
    cards: [
      { id: 'quad-1', type: 'hook', subConcept: 'quadrilaterals-all-around-us' },
      { id: 'quad-2', type: 'concept', subConcept: 'what-is-a-quadrilateral-4-sides-4-angles', diagramConfig: { shape: 'generic-quadrilateral', showLabels: true, showAngles: true } },
      { id: 'quad-3', type: 'concept', subConcept: 'angle-sum-is-360-and-why' },
      { id: 'quad-4', type: 'concept', subConcept: 'adjacent-vs-opposite-sides-and-angles' },
      { id: 'quad-5', type: 'concept', subConcept: 'diagonals-connect-non-adjacent-vertices', diagramConfig: { shape: 'generic-quadrilateral', showDiagonals: true, showLabels: true } },
      { id: 'quad-6', type: 'concept', subConcept: 'types-overview-trapezium-kite-parallelogram' },
    ],
    quizzes: [
      { id: 'quad-quiz-1', subConcept: 'angle-sum-360', type: 'mcq', maxAttempts: 3 },
      { id: 'quad-quiz-2', subConcept: 'adjacent-vs-opposite', type: 'mcq', maxAttempts: 3 },
      { id: 'quad-quiz-3', subConcept: 'diagonals-and-types', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'parallelogram': {
    topicId: 'parallelogram',
    videoId: 'DzXiWgT_hpE',
    cards: [
      { id: 'para-1', type: 'hook', subConcept: 'tilted-door-or-leaning-bookshelf' },
      { id: 'para-2', type: 'concept', subConcept: 'definition-both-pairs-opposite-sides-parallel', diagramConfig: { shape: 'parallelogram', highlight: 'opposite-sides', showLabels: true } },
      { id: 'para-3', type: 'concept', subConcept: 'property-1-opposite-sides-are-equal' },
      { id: 'para-4', type: 'concept', subConcept: 'property-2-opposite-angles-are-equal', diagramConfig: { shape: 'parallelogram', highlight: 'angles', showLabels: true, showAngles: true } },
      { id: 'para-5', type: 'concept', subConcept: 'property-3-adjacent-angles-supplementary-180' },
      { id: 'para-6', type: 'concept', subConcept: 'property-4-diagonals-bisect-each-other', diagramConfig: { shape: 'parallelogram', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
      { id: 'para-7', type: 'concept', subConcept: 'important-diagonals-NOT-equal-NOT-perpendicular' },
    ],
    quizzes: [
      { id: 'para-quiz-1', subConcept: 'opposite-sides-and-angles', type: 'mcq', maxAttempts: 3 },
      { id: 'para-quiz-2', subConcept: 'adjacent-angles-supplementary', type: 'mcq', maxAttempts: 3 },
      { id: 'para-quiz-3', subConcept: 'diagonal-properties', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'rhombus': {
    topicId: 'rhombus',
    videoId: 'UYbpWzasIHg',
    cards: [
      { id: 'rhom-1', type: 'hook', subConcept: 'diamond-on-playing-cards-or-patang' },
      { id: 'rhom-2', type: 'concept', subConcept: 'definition-parallelogram-with-all-sides-equal', diagramConfig: { shape: 'rhombus', highlight: 'all-sides', showLabels: true } },
      { id: 'rhom-3', type: 'concept', subConcept: 'it-is-a-parallelogram-so-all-those-properties-apply' },
      { id: 'rhom-4', type: 'concept', subConcept: 'extra-property-diagonals-perpendicular-at-90', diagramConfig: { shape: 'rhombus', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
      { id: 'rhom-5', type: 'concept', subConcept: 'diagonals-bisect-vertex-angles' },
      { id: 'rhom-6', type: 'concept', subConcept: 'common-mistake-rhombus-does-NOT-have-90-degree-angles' },
    ],
    quizzes: [
      { id: 'rhom-quiz-1', subConcept: 'all-sides-equal-and-parallelogram', type: 'mcq', maxAttempts: 3 },
      { id: 'rhom-quiz-2', subConcept: 'perpendicular-diagonals', type: 'mcq', maxAttempts: 3 },
      { id: 'rhom-quiz-3', subConcept: 'common-mistake-angles-not-90', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'rectangle': {
    topicId: 'rectangle',
    videoId: 'I_z7fDIh-SU',
    cards: [
      { id: 'rect-1', type: 'hook', subConcept: 'doors-books-screens-all-rectangles' },
      { id: 'rect-2', type: 'concept', subConcept: 'definition-parallelogram-with-all-angles-90', diagramConfig: { shape: 'rectangle', highlight: 'right-angles', showLabels: true, showAngles: true } },
      { id: 'rect-3', type: 'concept', subConcept: 'has-all-parallelogram-properties' },
      { id: 'rect-4', type: 'concept', subConcept: 'extra-property-diagonals-are-equal', diagramConfig: { shape: 'rectangle', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
      { id: 'rect-5', type: 'concept', subConcept: 'diagonals-bisect-but-NOT-at-90-degrees' },
      { id: 'rect-6', type: 'concept', subConcept: 'opposite-sides-equal-but-not-all-four-equal' },
    ],
    quizzes: [
      { id: 'rect-quiz-1', subConcept: 'all-angles-90-and-parallelogram', type: 'mcq', maxAttempts: 3 },
      { id: 'rect-quiz-2', subConcept: 'equal-diagonals', type: 'mcq', maxAttempts: 3 },
      { id: 'rect-quiz-3', subConcept: 'rectangle-vs-square-distinction', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'square': {
    topicId: 'square',
    videoId: '3hlk2ds74fM',
    cards: [
      { id: 'sq-1', type: 'hook', subConcept: 'carrom-board-chessboard-tiles' },
      { id: 'sq-2', type: 'concept', subConcept: 'definition-all-sides-equal-AND-all-angles-90', diagramConfig: { shape: 'square', highlight: 'all-sides', showLabels: true, showAngles: true } },
      { id: 'sq-3', type: 'concept', subConcept: 'it-is-both-rectangle-AND-rhombus' },
      { id: 'sq-4', type: 'concept', subConcept: 'gets-equal-diagonals-from-rectangle', diagramConfig: { shape: 'square', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
      { id: 'sq-5', type: 'concept', subConcept: 'gets-perpendicular-diagonals-from-rhombus' },
      { id: 'sq-6', type: 'concept', subConcept: 'diagonals-bisect-vertex-angles-into-45-plus-45' },
      { id: 'sq-7', type: 'concept', subConcept: 'the-most-special-quadrilateral-has-every-property' },
    ],
    quizzes: [
      { id: 'sq-quiz-1', subConcept: 'definition-and-properties', type: 'mcq', maxAttempts: 3 },
      { id: 'sq-quiz-2', subConcept: 'rectangle-plus-rhombus', type: 'mcq', maxAttempts: 3 },
      { id: 'sq-quiz-3', subConcept: 'diagonal-properties-combined', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'kite': {
    topicId: 'kite',
    videoId: '5qSeSwNA0QM',
    cards: [
      { id: 'kite-1', type: 'hook', subConcept: 'patang-during-makar-sankranti' },
      { id: 'kite-2', type: 'concept', subConcept: 'definition-two-pairs-consecutive-equal-sides', diagramConfig: { shape: 'kite', highlight: 'all-sides', showLabels: true } },
      { id: 'kite-3', type: 'concept', subConcept: 'NOT-a-parallelogram-opposite-sides-not-equal' },
      { id: 'kite-4', type: 'concept', subConcept: 'one-pair-opposite-angles-equal', diagramConfig: { shape: 'kite', highlight: 'angles', showLabels: true, showAngles: true } },
      { id: 'kite-5', type: 'concept', subConcept: 'diagonals-perpendicular-but-only-one-bisected', diagramConfig: { shape: 'kite', highlight: 'diagonals', showDiagonals: true } },
      { id: 'kite-6', type: 'concept', subConcept: 'main-diagonal-is-axis-of-symmetry' },
    ],
    quizzes: [
      { id: 'kite-quiz-1', subConcept: 'consecutive-equal-sides-not-parallelogram', type: 'mcq', maxAttempts: 3 },
      { id: 'kite-quiz-2', subConcept: 'angle-and-diagonal-properties', type: 'mcq', maxAttempts: 3 },
      { id: 'kite-quiz-3', subConcept: 'only-one-diagonal-bisected', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'trapezium': {
    topicId: 'trapezium',
    videoId: 'JYWIg5jtP-4',
    cards: [
      { id: 'trap-1', type: 'hook', subConcept: 'bucket-from-side-or-lamp-shade' },
      { id: 'trap-2', type: 'concept', subConcept: 'definition-one-pair-parallel-sides-called-bases', diagramConfig: { shape: 'trapezium', highlight: 'parallel-marks', showLabels: true } },
      { id: 'trap-3', type: 'concept', subConcept: 'non-parallel-sides-called-legs' },
      { id: 'trap-4', type: 'concept', subConcept: 'isosceles-trapezium-equal-legs-equal-diagonals', diagramConfig: { shape: 'trapezium', highlight: 'all-sides', showLabels: true, showAngles: true } },
      { id: 'trap-5', type: 'concept', subConcept: 'NOT-a-parallelogram-only-one-pair-parallel' },
      { id: 'trap-6', type: 'concept', subConcept: 'co-interior-angles-between-parallel-sides-sum-180' },
    ],
    quizzes: [
      { id: 'trap-quiz-1', subConcept: 'definition-and-parts', type: 'mcq', maxAttempts: 3 },
      { id: 'trap-quiz-2', subConcept: 'isosceles-trapezium-properties', type: 'mcq', maxAttempts: 3 },
      { id: 'trap-quiz-3', subConcept: 'not-a-parallelogram-why', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'diagonal-properties': {
    topicId: 'diagonal-properties',
    videoId: 'CNO3vHQGkBA',
    cards: [
      { id: 'diag-1', type: 'hook', subConcept: 'draw-X-inside-shapes-what-happens' },
      { id: 'diag-2', type: 'concept', subConcept: 'parallelogram-diagonals-bisect-each-other', diagramConfig: { shape: 'parallelogram', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
      { id: 'diag-3', type: 'concept', subConcept: 'rhombus-adds-perpendicularity-at-90', diagramConfig: { shape: 'rhombus', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
      { id: 'diag-4', type: 'concept', subConcept: 'rectangle-adds-equal-length-diagonals', diagramConfig: { shape: 'rectangle', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
      { id: 'diag-5', type: 'concept', subConcept: 'square-gets-BOTH-equal-AND-perpendicular', diagramConfig: { shape: 'square', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
      { id: 'diag-6', type: 'concept', subConcept: 'kite-perpendicular-but-only-one-bisected' },
      { id: 'diag-7', type: 'concept', subConcept: 'pattern-more-special-shape-more-diagonal-properties' },
    ],
    quizzes: [
      { id: 'diag-quiz-1', subConcept: 'parallelogram-vs-rhombus-diagonals', type: 'mcq', maxAttempts: 3 },
      { id: 'diag-quiz-2', subConcept: 'rectangle-vs-square-diagonals', type: 'mcq', maxAttempts: 3 },
      { id: 'diag-quiz-3', subConcept: 'identify-shape-from-diagonal-properties', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 5 },
  },

  'quadrilateral-family': {
    topicId: 'quadrilateral-family',
    videoId: 'NLzElLjzvBg',
    cards: [
      { id: 'fam-1', type: 'hook', subConcept: 'shapes-have-a-family-tree-like-people' },
      { id: 'fam-2', type: 'concept', subConcept: 'quadrilateral-is-the-parent-of-all', diagramConfig: { shape: 'quadrilateral-family', showLabels: true } },
      { id: 'fam-3', type: 'concept', subConcept: 'parallelogram-branch-two-pairs-parallel' },
      { id: 'fam-4', type: 'concept', subConcept: 'rectangle-and-rhombus-are-children-of-parallelogram' },
      { id: 'fam-5', type: 'concept', subConcept: 'square-is-child-of-BOTH-rectangle-and-rhombus' },
      { id: 'fam-6', type: 'concept', subConcept: 'every-square-is-rectangle-but-not-vice-versa' },
      { id: 'fam-7', type: 'concept', subConcept: 'kite-and-trapezium-are-separate-branches' },
    ],
    quizzes: [
      { id: 'fam-quiz-1', subConcept: 'hierarchy-relationships', type: 'mcq', maxAttempts: 3 },
      { id: 'fam-quiz-2', subConcept: 'true-false-every-X-is-a-Y', type: 'mcq', maxAttempts: 3 },
      { id: 'fam-quiz-3', subConcept: 'most-specific-name-for-a-shape', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },
};

export function getTemplate(topicId: string): LessonTemplate | null {
  return lessonTemplates[topicId] ?? null;
}
