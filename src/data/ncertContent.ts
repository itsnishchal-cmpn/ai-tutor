// NCERT Class 8 Mathematics — Chapter 3: Understanding Quadrilaterals
// Source: https://ncert.nic.in/textbook/pdf/hemh103.pdf (Reprint 2024-25)
// Content extracted verbatim from the actual NCERT textbook, organized by section.
// Each topic maps to one or more NCERT sections.

export const ncertChapter3: Record<string, string> = {

'polygons-basics': `
NCERT Section 3.1: Introduction

A simple closed curve made up of only line segments is called a polygon.
The word "polygon" comes from Greek — "poly" means many, "gon" means angle/corner.

NOT A POLYGON: Shapes with curves, open figures, or self-intersecting lines are not polygons.

3.1.1 Convex and Concave Polygons:
- Convex polygon: All interior angles are less than 180 degrees. All diagonals lie completely inside. Any line segment joining two interior points lies wholly inside.
- Concave polygon: At least one interior angle is greater than 180 degrees. Some diagonals may go outside. Has a "dent" or "cave" inward.

3.1.2 Regular and Irregular Polygons:
- A regular polygon is both "equiangular" (all angles equal) AND "equilateral" (all sides equal).
- Example: A square has sides of equal length and angles of equal measure — it is regular.
- A rectangle is equiangular but NOT equilateral — it is NOT a regular polygon.
- An equilateral triangle is a regular polygon (3 equal sides, 3 equal 60 degree angles).

Classification by number of sides:
- Triangle: 3 sides
- Quadrilateral: 4 sides
- Pentagon: 5 sides
- Hexagon: 6 sides
- Heptagon: 7 sides
- Octagon: 8 sides

Diagonals of a polygon:
- A diagonal connects two non-adjacent vertices.
- Number of diagonals in n-sided polygon = n(n-3)/2
- Triangle: 0 diagonals, Quadrilateral: 2, Pentagon: 5, Hexagon: 9
`,

'angle-sum-property': `
NCERT Section 3.2: Sum of the Measures of the Exterior Angles of a Polygon

Key Activity from NCERT (Walking around a polygon):
Draw a polygon on the floor using chalk. Start at vertex A. Walk along side AB. At B, turn through exterior angle 1 to walk along BC. Continue turning at each vertex until you return to AB. You would have made one complete turn (360 degrees).
Therefore: m angle 1 + m angle 2 + m angle 3 + ... = 360 degrees.
This is true whatever the number of sides.

THE SUM OF EXTERIOR ANGLES OF ANY POLYGON IS 360 DEGREES.

Interior Angle Sum:
At each vertex: interior angle + exterior angle = 180 degrees (linear pair).
For n-sided polygon: Sum of interior angles = (n - 2) x 180 degrees.
- Triangle (n=3): 180 degrees
- Quadrilateral (n=4): 360 degrees
- Pentagon (n=5): 540 degrees
- Hexagon (n=6): 720 degrees

For Regular Polygons:
- Each exterior angle = 360/n degrees
- Each interior angle = (n-2) x 180 / n degrees

NCERT Example 1: Find x if angles of a quadrilateral are x, 90, 50, 110.
Solution: x + 90 + 50 + 110 = 360, so x = 110 degrees.

NCERT Example 2: Find sides of regular polygon with exterior angle 45 degrees.
Solution: Number of sides = 360/45 = 8. The polygon has 8 sides (octagon).

NCERT TRY THESE: For a regular hexagon:
1. Sum of exterior angles = 360 degrees.
2. All exterior angles are equal (since it is regular).
3. Each exterior angle = 360/6 = 60 degrees. Each interior = 180 - 60 = 120 degrees.
`,

'quadrilateral-basics': `
NCERT Section 3.3: Kinds of Quadrilaterals (Introduction)

A quadrilateral has:
- 4 sides: AB, BC, CD, DA
- 4 vertices: A, B, C, D
- 4 angles: angle A, angle B, angle C, angle D
- 2 diagonals: AC and BD

Angle sum of a quadrilateral = 360 degrees.
Proof: Draw diagonal AC. It divides the quadrilateral into 2 triangles (ABC and ACD). Each has 180 degrees. Total = 2 x 180 = 360 degrees.

Adjacent sides: sides sharing a vertex (AB and BC share vertex B).
Opposite sides: sides not sharing a vertex (AB and CD).
Adjacent angles: angles sharing a side.
Opposite angles: angles not sharing a side (angle A and angle C).

Types of quadrilaterals based on parallel sides:
- Trapezium: exactly one pair of parallel sides
- Kite: two pairs of consecutive equal sides (NOT a parallelogram)
- Parallelogram: both pairs of opposite sides parallel
  - Rectangle: parallelogram with all right angles
  - Rhombus: parallelogram with all sides equal
  - Square: both rectangle and rhombus
`,

'parallelogram': `
NCERT Section 3.3.3-3.3.6: Parallelogram

Definition: A parallelogram is a quadrilateral whose opposite sides are parallel.
AB parallel to DC, and AD parallel to BC.

PROPERTY 1 — Opposite sides are equal (Section 3.3.4):
AB = DC and AD = BC.
NCERT Proof: Draw diagonal AC. By ASA congruency, triangle ABC is congruent to triangle CDA.
(angle 1 = angle 2 as alternate angles, angle 3 = angle 4 as alternate angles, AC is common)
Therefore AB = DC and BC = AD.

NCERT Example 3: Parallelogram PQRS with PQ = 12 cm, QR = 7 cm.
Perimeter = 12 + 7 + 12 + 7 = 38 cm (opposite sides are equal).

PROPERTY 2 — Opposite angles are equal (Section 3.3.5):
m angle A = m angle C and m angle B = m angle D.
NCERT proof uses ASA congruency on triangles formed by diagonal.

NCERT Example 4: In parallelogram BEST, angle B = 100 degrees.
x = 100 (opposite angle), y = 100 (corresponding), z = 80 (linear pair with y).

PROPERTY 3 — Adjacent angles are supplementary:
angle A + angle B = 180 degrees (co-interior angles, AB parallel to DC, transversal AB).
Similarly angle B + angle C = 180, angle C + angle D = 180, angle D + angle A = 180.

NCERT Example 5: In parallelogram RING, m angle R = 70 degrees.
m angle N = 70 (opposite), m angle I = 110 (supplementary to R), m angle G = 110 (opposite to I).

PROPERTY 4 — Diagonals bisect each other (Section 3.3.6):
If diagonals AC and BD meet at O, then AO = OC and BO = OD.
NCERT proof: By ASA, triangle AOB is congruent to triangle COD. So AO = CO, BO = DO.
IMPORTANT: Diagonals are NOT necessarily equal and do NOT cross at 90 degrees.

NCERT Example 6: Parallelogram HELP, OE = 4, HL = PE + 5.
OE = 4, so OP = 4 (diagonals bisect), PE = 8. HL = 8 + 5 = 13. OH = 13/2 = 6.5 cm.
`,

'rhombus': `
NCERT Section 3.4.1: Rhombus

Definition from NCERT: A rhombus is a quadrilateral with sides of equal length. Since opposite sides are equal, it is also a parallelogram.

How NCERT introduces it: Start with a kite (two pairs of consecutive equal sides). If you make AB = BC (both pairs the same length), the kite becomes a rhombus. So a rhombus is a special case of a kite where all four sides are equal.

A rhombus has ALL properties of a parallelogram:
- Opposite sides parallel
- Opposite sides equal (all four sides equal)
- Opposite angles equal
- Adjacent angles supplementary
- Diagonals bisect each other

ADDITIONAL PROPERTY — Diagonals are perpendicular bisectors:
The diagonals of a rhombus are perpendicular bisectors of one another.

NCERT Proof outline:
ABCD is a rhombus, so it is a parallelogram. Diagonals bisect each other: OA = OC, OB = OD.
Since AO = CO, AD = CD (all sides equal), OD = OD (common):
By SSS, triangle AOD is congruent to triangle COD.
Therefore angle AOD = angle COD.
Since they form a linear pair: angle AOD = angle COD = 90 degrees.

NCERT Example 7: Rhombus RICE, find x, y, z.
x = OE = 5 (diagonals bisect), y = OR = 12 (diagonals bisect), z = side = 13 (all sides equal).

Also from kite property: Diagonals bisect vertex angles.
`,

'rectangle': `
NCERT Section 3.4.2: A Rectangle

NCERT Definition: A rectangle is a parallelogram with equal angles.
Since there are 4 angles and they are all equal: 4x = 360, so x = 90 degrees.
Thus each angle of a rectangle is a right angle (90 degrees).

A rectangle has ALL properties of a parallelogram:
- Opposite sides parallel and equal
- Diagonals bisect each other

ADDITIONAL PROPERTY — Diagonals are equal:
NCERT Proof: In rectangle ABCD, look at triangles ABC and ABD.
AB = AB (common), BC = AD (opposite sides of parallelogram), angle A = angle B = 90 degrees.
By SAS congruency: triangle ABC is congruent to triangle ABD.
Therefore AC = BD. The diagonals are equal.

IMPORTANT from NCERT: In a rectangle, diagonals bisect each other AND are equal in length. But they do NOT cross at 90 degrees (unless it is also a square).

NCERT Example 8: Rectangle RENT, diagonals meet at O. OR = 2x + 4, OT = 3x + 1.
Diagonals are equal, so their halves are equal: 3x + 1 = 2x + 4, so x = 3.
`,

'square': `
NCERT Section 3.4.3: A Square

NCERT Definition: A square is a rectangle with equal sides.
This means a square has ALL properties of a rectangle PLUS all sides are equal.

A square is BOTH a rectangle AND a rhombus.

Diagonal properties of a square (combining rectangle and rhombus):
(i) Diagonals bisect one another (from parallelogram property)
(ii) Diagonals are of equal length (from rectangle property)
(iii) Diagonals are perpendicular to one another (from rhombus property)

NCERT states: "The diagonals of a square are perpendicular bisectors of each other."

NCERT verification activity: Take a square sheet PQRS. Fold along both diagonals. Check if mid-points are the same. Check if the angle at O is 90 degrees using a set-square.

NCERT logical justification: ABCD is a square with diagonals meeting at O.
OA = OC (parallelogram property). By SSS: triangle AOD is congruent to triangle COD.
Therefore angle AOD = angle COD. Being a linear pair, each = 90 degrees.

From NCERT "What Have We Discussed" summary:
Square has ALL properties of parallelogram, rhombus, and rectangle combined.
`,

'kite': `
NCERT Section 3.3.2: Kite

NCERT Definition: A kite is a special quadrilateral with exactly two distinct consecutive pairs of sides of equal length. For example, AB = AD and BC = CD.

NCERT Activity (making a kite):
Take a thick white sheet. Fold the paper once. Draw two line segments of different lengths. Cut along the line segments and open up. You get a kite shape.

Properties from NCERT activity:
- A kite has a line symmetry (along the longer diagonal).
- The diagonals cut at right angles (perpendicular).
- The diagonals are NOT equal in length.
- Only ONE diagonal is bisected by the other (the shorter one is bisected).
- One pair of opposite angles are equal (the angles between unequal sides).

From NCERT summary table:
(1) The diagonals are perpendicular to one another.
(2) One of the diagonals bisects the other.
(3) In kite ABCD: m angle B = m angle D but m angle A is NOT equal to m angle C.

IMPORTANT: A kite is NOT a parallelogram (opposite sides are not parallel or equal).

NCERT also notes: Check whether a square is a kite. (Yes, a square satisfies the kite definition since it has two pairs of consecutive equal sides — in fact all four sides are equal.)
`,

'trapezium': `
NCERT Section 3.3.1: Trapezium

NCERT Definition: Trapezium is a quadrilateral with a pair of parallel sides.
(The arrow marks in NCERT figures indicate parallel lines.)

The parallel sides are called bases.
The non-parallel sides are called legs.

NCERT Activity:
Take identical cut-outs of congruent triangles of sides 3 cm, 4 cm, 5 cm. Arrange them to form a trapezium. The non-parallel sides need NOT be equal.

Isosceles Trapezium:
If the non-parallel sides (legs) of a trapezium are of equal length, it is called an isosceles trapezium.

IMPORTANT: A trapezium is NOT a parallelogram — it has only one pair of parallel sides.

From NCERT Exercise 3.3:
- Example with AB parallel to DC: If angle B = 120, then angle A = 180 - 120 = 60 (co-interior angles).
- If SP parallel to RQ with angle R = 90, angle Q = 130: then angle S = 180 - 130 = 50, angle P = 180 - 90 = 90.
`,

'diagonal-properties': `
NCERT: Diagonal Properties (compiled from Sections 3.3.6, 3.4.1, 3.4.2, 3.4.3 and Summary)

From NCERT "What Have We Discussed" summary table:

PARALLELOGRAM:
(1) Opposite sides are equal.
(2) Opposite angles are equal.
(3) Diagonals bisect one another.

RHOMBUS (all parallelogram properties plus):
(1) All sides are equal.
(2) Diagonals are perpendicular to each other.

RECTANGLE (all parallelogram properties plus):
(1) Each angle is a right angle (90 degrees).
(2) Diagonals are equal.

SQUARE (all properties of parallelogram, rhombus, and rectangle):
(1) All sides equal AND all angles 90 degrees.
(2) Diagonals are perpendicular bisectors of each other.
(3) Diagonals are equal.

KITE:
(1) Diagonals are perpendicular to one another.
(2) One of the diagonals bisects the other (only one, not both).
(3) One pair of opposite angles are equal (not both pairs).

KEY INSIGHT from NCERT:
- Parallelogram: diagonals bisect each other (but not equal, not perpendicular).
- Rhombus adds: perpendicularity.
- Rectangle adds: equality of diagonals.
- Square gets BOTH: equal AND perpendicular diagonals.
`,

'quadrilateral-family': `
NCERT: Quadrilateral Family Tree (from Section 3.4, Exercise 3.4, and Summary)

From NCERT Exercise 3.4 True/False:
(a) All rectangles are squares — FALSE
(b) All rhombuses are parallelograms — TRUE
(c) All squares are rhombuses and also rectangles — TRUE
(d) All squares are not parallelograms — FALSE (all squares ARE parallelograms)
(e) All kites are rhombuses — FALSE
(f) All rhombuses are kites — TRUE (a rhombus has two pairs of consecutive equal sides)
(g) All parallelograms are trapeziums — TRUE (they have at least one pair of parallel sides)
(h) All squares are trapeziums — TRUE

NCERT Exercise 3.4 Question 3: Explain how a square is:
(i) a quadrilateral — it has 4 sides
(ii) a parallelogram — opposite sides are parallel
(iii) a rhombus — all four sides are equal
(iv) a rectangle — all four angles are 90 degrees

NCERT "Think, Discuss, Write":
1. A square was defined as a rectangle with all sides equal. Can we define it as a rhombus with equal angles? YES — both definitions are equivalent.
2. Can a trapezium have all angles equal? If yes, all angles = 90, making it a rectangle/parallelogram, contradicting "exactly one pair of parallel sides." So NO for a strict trapezium.
3. Can a trapezium have all sides equal? If all sides equal and one pair parallel, it becomes a rhombus (which has two pairs parallel). So NO for a strict trapezium.

HIERARCHY:
Quadrilateral (most general)
  - Trapezium (one pair parallel sides)
    - Isosceles Trapezium (equal legs)
  - Kite (two pairs consecutive equal sides)
  - Parallelogram (both pairs opposite sides parallel)
    - Rhombus (parallelogram + all sides equal)
    - Rectangle (parallelogram + all angles 90)
    - Square (rectangle + rhombus = all sides equal + all angles 90)
`,
};

export function getNCERTContent(topicId: string): string {
  return ncertChapter3[topicId] ?? '';
}
