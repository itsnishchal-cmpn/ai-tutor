import type { LessonTemplate } from '../types/lesson';

export const lessonTemplates: Record<string, LessonTemplate> = {
  'polygons-basics': {
    topicId: 'polygons-basics',
    videoId: 'JPrc70c7OqM',
    cards: [
      { id: 'poly-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'poly-definition', type: 'concept', subConcept: 'polygon-definition', diagramConfig: { shape: 'polygon-intro', showLabels: true } },
      { id: 'poly-convex-concave', type: 'concept', subConcept: 'convex-vs-concave' },
      { id: 'poly-regular', type: 'concept', subConcept: 'regular-vs-irregular' },
      { id: 'poly-classification', type: 'concept', subConcept: 'classification-by-sides', diagramConfig: { shape: 'polygon-intro', showLabels: true } },
    ],
    quizzes: [
      { id: 'poly-quiz-1', subConcept: 'polygon-definition', type: 'mcq', maxAttempts: 3 },
      { id: 'poly-quiz-2', subConcept: 'convex-vs-concave', type: 'mcq', maxAttempts: 3 },
      { id: 'poly-quiz-3', subConcept: 'classification-by-sides', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },
  'angle-sum-property': {
    topicId: 'angle-sum-property',
    videoId: '0QhGHIV61XA',
    cards: [
      { id: 'angle-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'angle-triangle', type: 'concept', subConcept: 'triangle-angle-sum' },
      { id: 'angle-formula', type: 'formula', subConcept: 'n-minus-2-formula', diagramConfig: { shape: 'angle-sum', showLabels: true, showAngles: true } },
      { id: 'angle-exterior', type: 'concept', subConcept: 'exterior-angles-sum-360' },
      { id: 'angle-regular', type: 'concept', subConcept: 'regular-polygon-each-angle' },
    ],
    quizzes: [
      { id: 'angle-quiz-1', subConcept: 'n-minus-2-formula', type: 'mcq', maxAttempts: 3 },
      { id: 'angle-quiz-2', subConcept: 'exterior-angles-sum-360', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },
  'quadrilateral-basics': {
    topicId: 'quadrilateral-basics',
    videoId: 'NLzElLjzvBg',
    cards: [
      { id: 'quad-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'quad-angle-sum', type: 'concept', subConcept: 'angle-sum-360', diagramConfig: { shape: 'generic-quadrilateral', showLabels: true, showAngles: true } },
      { id: 'quad-exterior', type: 'concept', subConcept: 'exterior-angles' },
      { id: 'quad-diagonals', type: 'concept', subConcept: 'diagonals-intro', diagramConfig: { shape: 'generic-quadrilateral', showDiagonals: true, showLabels: true } },
    ],
    quizzes: [
      { id: 'quad-quiz-1', subConcept: 'angle-sum-360', type: 'mcq', maxAttempts: 3 },
      { id: 'quad-quiz-2', subConcept: 'diagonals-intro', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },
  'parallelogram': {
    topicId: 'parallelogram',
    videoId: 'DzXiWgT_hpE',
    cards: [
      { id: 'para-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'para-sides', type: 'concept', subConcept: 'opposite-sides-equal-parallel', diagramConfig: { shape: 'parallelogram', highlight: 'opposite-sides', showLabels: true } },
      { id: 'para-angles', type: 'concept', subConcept: 'opposite-angles-equal', diagramConfig: { shape: 'parallelogram', highlight: 'angles', showLabels: true, showAngles: true } },
      { id: 'para-consecutive', type: 'concept', subConcept: 'consecutive-angles-supplementary', diagramConfig: { shape: 'parallelogram', highlight: 'consecutive-angles', showAngles: true } },
      { id: 'para-diagonals', type: 'concept', subConcept: 'diagonals-bisect', diagramConfig: { shape: 'parallelogram', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
    ],
    quizzes: [
      { id: 'para-quiz-1', subConcept: 'opposite-sides-equal-parallel', type: 'mcq', maxAttempts: 3 },
      { id: 'para-quiz-2', subConcept: 'opposite-angles-equal', type: 'mcq', maxAttempts: 3 },
      { id: 'para-quiz-3', subConcept: 'diagonals-bisect', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },
  'rhombus': {
    topicId: 'rhombus',
    videoId: 'UYbpWzasIHg',
    cards: [
      { id: 'rhom-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'rhom-sides', type: 'concept', subConcept: 'all-sides-equal', diagramConfig: { shape: 'rhombus', highlight: 'all-sides', showLabels: true } },
      { id: 'rhom-parallelogram', type: 'concept', subConcept: 'is-a-parallelogram', diagramConfig: { shape: 'rhombus', highlight: 'opposite-sides', showLabels: true } },
      { id: 'rhom-diagonals', type: 'concept', subConcept: 'diagonals-bisect-at-90', diagramConfig: { shape: 'rhombus', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
    ],
    quizzes: [
      { id: 'rhom-quiz-1', subConcept: 'all-sides-equal', type: 'mcq', maxAttempts: 3 },
      { id: 'rhom-quiz-2', subConcept: 'diagonals-bisect-at-90', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },
  'rectangle': {
    topicId: 'rectangle',
    videoId: 'I_z7fDIh-SU',
    cards: [
      { id: 'rect-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'rect-angles', type: 'concept', subConcept: 'all-angles-90', diagramConfig: { shape: 'rectangle', highlight: 'right-angles', showLabels: true, showAngles: true } },
      { id: 'rect-parallelogram', type: 'concept', subConcept: 'is-a-parallelogram', diagramConfig: { shape: 'rectangle', highlight: 'opposite-sides', showLabels: true } },
      { id: 'rect-diagonals', type: 'concept', subConcept: 'diagonals-equal-bisect', diagramConfig: { shape: 'rectangle', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
    ],
    quizzes: [
      { id: 'rect-quiz-1', subConcept: 'all-angles-90', type: 'mcq', maxAttempts: 3 },
      { id: 'rect-quiz-2', subConcept: 'diagonals-equal-bisect', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },
  'square': {
    topicId: 'square',
    videoId: '3hlk2ds74fM',
    cards: [
      { id: 'sq-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'sq-definition', type: 'concept', subConcept: 'all-sides-equal-all-angles-90', diagramConfig: { shape: 'square', highlight: 'all-sides', showLabels: true, showAngles: true } },
      { id: 'sq-both', type: 'concept', subConcept: 'rectangle-plus-rhombus', diagramConfig: { shape: 'square', showLabels: true } },
      { id: 'sq-diagonals', type: 'concept', subConcept: 'diagonals-equal-perpendicular-bisect', diagramConfig: { shape: 'square', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
    ],
    quizzes: [
      { id: 'sq-quiz-1', subConcept: 'all-sides-equal-all-angles-90', type: 'mcq', maxAttempts: 3 },
      { id: 'sq-quiz-2', subConcept: 'rectangle-plus-rhombus', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },
  'kite': {
    topicId: 'kite',
    videoId: '5qSeSwNA0QM',
    cards: [
      { id: 'kite-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'kite-sides', type: 'concept', subConcept: 'two-pairs-consecutive-equal', diagramConfig: { shape: 'kite', highlight: 'all-sides', showLabels: true } },
      { id: 'kite-angles', type: 'concept', subConcept: 'one-pair-opposite-angles-equal', diagramConfig: { shape: 'kite', highlight: 'angles', showLabels: true, showAngles: true } },
      { id: 'kite-diagonals', type: 'concept', subConcept: 'diagonal-perpendicular-bisect', diagramConfig: { shape: 'kite', highlight: 'diagonals', showDiagonals: true } },
    ],
    quizzes: [
      { id: 'kite-quiz-1', subConcept: 'two-pairs-consecutive-equal', type: 'mcq', maxAttempts: 3 },
      { id: 'kite-quiz-2', subConcept: 'diagonal-perpendicular-bisect', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },
  'trapezium': {
    topicId: 'trapezium',
    videoId: 'JYWIg5jtP-4',
    cards: [
      { id: 'trap-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'trap-definition', type: 'concept', subConcept: 'one-pair-parallel-sides', diagramConfig: { shape: 'trapezium', highlight: 'parallel-marks', showLabels: true } },
      { id: 'trap-isosceles', type: 'concept', subConcept: 'isosceles-trapezium', diagramConfig: { shape: 'trapezium', highlight: 'all-sides', showLabels: true, showAngles: true } },
      { id: 'trap-not-parallelogram', type: 'concept', subConcept: 'not-a-parallelogram' },
    ],
    quizzes: [
      { id: 'trap-quiz-1', subConcept: 'one-pair-parallel-sides', type: 'mcq', maxAttempts: 3 },
      { id: 'trap-quiz-2', subConcept: 'isosceles-trapezium', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },
  'diagonal-properties': {
    topicId: 'diagonal-properties',
    videoId: 'CNO3vHQGkBA',
    cards: [
      { id: 'diag-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'diag-parallelogram', type: 'concept', subConcept: 'parallelogram-diagonals-bisect', diagramConfig: { shape: 'parallelogram', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
      { id: 'diag-rhombus', type: 'concept', subConcept: 'rhombus-diagonals-perpendicular', diagramConfig: { shape: 'rhombus', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
      { id: 'diag-rectangle', type: 'concept', subConcept: 'rectangle-diagonals-equal', diagramConfig: { shape: 'rectangle', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
      { id: 'diag-square', type: 'concept', subConcept: 'square-diagonals-all-properties', diagramConfig: { shape: 'square', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
    ],
    quizzes: [
      { id: 'diag-quiz-1', subConcept: 'parallelogram-diagonals-bisect', type: 'mcq', maxAttempts: 3 },
      { id: 'diag-quiz-2', subConcept: 'rhombus-diagonals-perpendicular', type: 'mcq', maxAttempts: 3 },
      { id: 'diag-quiz-3', subConcept: 'rectangle-diagonals-equal', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },
  'quadrilateral-family': {
    topicId: 'quadrilateral-family',
    videoId: 'NLzElLjzvBg',
    cards: [
      { id: 'fam-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'fam-hierarchy', type: 'concept', subConcept: 'family-tree-overview', diagramConfig: { shape: 'quadrilateral-family', showLabels: true } },
      { id: 'fam-square-special', type: 'concept', subConcept: 'square-is-everything' },
      { id: 'fam-relationships', type: 'concept', subConcept: 'every-square-is-rectangle-rhombus' },
    ],
    quizzes: [
      { id: 'fam-quiz-1', subConcept: 'family-tree-overview', type: 'mcq', maxAttempts: 3 },
      { id: 'fam-quiz-2', subConcept: 'every-square-is-rectangle-rhombus', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },
};

export function getTemplate(topicId: string): LessonTemplate | null {
  return lessonTemplates[topicId] ?? null;
}
