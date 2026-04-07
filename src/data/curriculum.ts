import type { Chapter } from '../types/curriculum';

export const chapters: Chapter[] = [
  {
    id: 'ch8-3',
    number: 3,
    title: 'Understanding Quadrilaterals',
    className: 8,
    subject: 'Mathematics',
    sections: [
      {
        id: 'ch8-3-intro',
        title: 'Introduction',
        topics: [
          {
            id: 'polygons-basics',
            title: 'Polygons & Classification',
            description: 'What are polygons? Convex vs concave, regular vs irregular.',
          },
          {
            id: 'angle-sum-property',
            title: 'Angle Sum Property',
            description: 'Sum of interior angles of a polygon = (n-2) × 180°',
          },
        ],
      },
      {
        id: 'ch8-3-types',
        title: 'Types of Quadrilaterals',
        topics: [
          {
            id: 'quadrilateral-basics',
            title: 'Quadrilateral Basics',
            description: 'Angle sum = 360°, exterior angles, diagonals.',
          },
          {
            id: 'parallelogram',
            title: 'Parallelogram',
            description: 'Opposite sides parallel & equal, opposite angles equal, diagonals bisect.',
          },
          {
            id: 'rhombus',
            title: 'Rhombus',
            description: 'All sides equal, diagonals bisect at 90°.',
          },
          {
            id: 'rectangle',
            title: 'Rectangle',
            description: 'All angles 90°, diagonals equal & bisect each other.',
          },
          {
            id: 'square',
            title: 'Square',
            description: 'All sides equal + all angles 90°. Rectangle + Rhombus.',
          },
          {
            id: 'kite',
            title: 'Kite',
            description: 'Two pairs of consecutive equal sides, one diagonal bisected.',
          },
          {
            id: 'trapezium',
            title: 'Trapezium',
            description: 'One pair of parallel sides.',
          },
        ],
      },
      {
        id: 'ch8-3-special',
        title: 'Special Properties',
        topics: [
          {
            id: 'diagonal-properties',
            title: 'Diagonal Properties',
            description: 'How diagonals behave in different quadrilaterals.',
          },
          {
            id: 'quadrilateral-family',
            title: 'Quadrilateral Family Tree',
            description: 'How all quadrilaterals are related to each other.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch8-1',
    number: 1,
    title: 'Rational Numbers',
    className: 8,
    subject: 'Mathematics',
    locked: true,
    sections: [],
  },
  {
    id: 'ch8-2',
    number: 2,
    title: 'Linear Equations in One Variable',
    className: 8,
    subject: 'Mathematics',
    locked: true,
    sections: [],
  },
  {
    id: 'ch8-4',
    number: 4,
    title: 'Data Handling',
    className: 8,
    subject: 'Mathematics',
    locked: true,
    sections: [],
  },
];

export function getTopicById(topicId: string) {
  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      for (const topic of section.topics) {
        if (topic.id === topicId) {
          return { chapter, section, topic };
        }
      }
    }
  }
  return null;
}

export function getAllTopicIds(): string[] {
  const ids: string[] = [];
  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      for (const topic of section.topics) {
        ids.push(topic.id);
      }
    }
  }
  return ids;
}

export function getNextTopicId(currentTopicId: string): string | null {
  const ids = getAllTopicIds();
  const idx = ids.indexOf(currentTopicId);
  if (idx === -1 || idx === ids.length - 1) return null;
  return ids[idx + 1];
}
