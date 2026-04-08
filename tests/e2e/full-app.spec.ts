import { test, expect, type Page } from '@playwright/test';

// Mock lesson JSON that Claude would return
const mockLessonJSON = {
  cards: [
    { id: 'para-hook', type: 'hook', text: 'Arjun, kabhi notice kiya hai ki door thoda tilt ho jaye toh kaisi shape banti hai?' },
    { id: 'para-sides', type: 'concept', text: 'Isme opposite sides hamesha equal AUR parallel hoti hain — matlab AB = CD aur AD = BC!' },
    { id: 'para-angles', type: 'concept', text: 'Aur opposite angles bhi equal hote hain! Angle A = Angle C aur Angle B = Angle D.' },
    { id: 'para-consecutive', type: 'concept', text: 'Consecutive angles ka sum hamesha 180 degrees hota hai.' },
    { id: 'para-diagonals', type: 'concept', text: 'Diagonals ek dusre ko bisect karti hain — matlab beech mein se kaatti hain!' },
  ],
  quizzes: [
    {
      id: 'para-quiz-1',
      question: 'Parallelogram mein opposite sides kaise hoti hain?',
      options: ['Perpendicular', 'Equal & Parallel', 'Only Equal', 'Curved'],
      correctAnswer: 'B',
      hints: ['Door ko tilt karke dekho.', 'Parallel matlab wo kabhi nahi milti.'],
      explanation: 'Parallelogram mein opposite sides equal AND parallel hoti hain.',
    },
    {
      id: 'para-quiz-2',
      question: 'Opposite angles kaise hote hain?',
      options: ['Different', 'Equal', 'Supplementary', 'Complementary'],
      correctAnswer: 'B',
      hints: ['Socho angles ke baare mein.', 'Opposite ka matlab kya hai?'],
      explanation: 'Opposite angles hamesha equal hote hain.',
    },
    {
      id: 'para-quiz-3',
      question: 'Diagonals kya karti hain?',
      options: ['Perpendicular hoti hain', 'Bisect karti hain', 'Equal hoti hain', 'Parallel hoti hain'],
      correctAnswer: 'B',
      hints: ['Beech mein kya hota hai?', 'Bisect ka matlab samjho.'],
      explanation: 'Diagonals bisect karti hain.',
    },
  ],
  summary: {
    keyPoints: [
      'Opposite sides equal & parallel',
      'Opposite angles equal',
      'Consecutive angles supplementary (180°)',
      'Diagonals bisect each other',
    ],
  },
};

// Helper: intercept the chat API to return mock lesson content
async function mockLessonAPI(page: Page) {
  await page.route('**/.netlify/functions/chat', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();
    const systemPrompt: string = postData?.systemPrompt ?? '';

    // Check if this is a lesson generation request
    if (systemPrompt.includes('lesson content generator')) {
      const json = JSON.stringify(mockLessonJSON);
      const sseBody = json
        .split('')
        .reduce((chunks: string[], char, i) => {
          const chunkIndex = Math.floor(i / 50);
          if (!chunks[chunkIndex]) chunks[chunkIndex] = '';
          chunks[chunkIndex] += char;
          return chunks;
        }, [])
        .map((chunk) => `data: ${JSON.stringify({ type: 'content', text: chunk })}\n\n`)
        .join('');

      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
        body: sseBody + 'data: [DONE]\n\n',
      });
    } else {
      // Doubt chat or regular chat — return a simple response
      const response = 'Haan bolo, kya doubt hai? Main help kar sakta hoon!';
      const body = `data: ${JSON.stringify({ type: 'content', text: response })}\n\ndata: [DONE]\n\n`;
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' },
        body,
      });
    }
  });
}

// ============================================================
// TEST 1: Landing Page
// ============================================================
test.describe('Landing Page', () => {
  test('renders landing page with name input and start button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=PadhAI').first()).toBeVisible();
    // Should have a name input
    const nameInput = page.locator('input[type="text"], input[placeholder*="name" i], input[placeholder*="Name" i]').first();
    await expect(nameInput).toBeVisible();
    // Should have a start/submit button
    const startButton = page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first();
    await expect(startButton).toBeVisible();
  });

  test('navigates to /learn after entering name', async ({ page }) => {
    await page.goto('/');
    const nameInput = page.locator('input').first();
    await nameInput.fill('TestStudent');
    const startButton = page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first();
    await startButton.click();
    await expect(page).toHaveURL(/\/learn/);
  });

  test('redirects to / if no name is set', async ({ page }) => {
    // Clear localStorage and go directly to /learn
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/learn');
    await expect(page).toHaveURL('/');
  });
});

// ============================================================
// TEST 2: Main Dashboard (no topic selected)
// ============================================================
test.describe('Main Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const nameInput = page.locator('input').first();
    await nameInput.fill('TestStudent');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await expect(page).toHaveURL(/\/learn/);
  });

  test('shows curriculum sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    // Should show curriculum items
    await expect(page.locator('text=Understanding Quadrilaterals').first()).toBeVisible();
    await expect(page.locator('text=Parallelogram').first()).toBeVisible();
  });

  test('shows progress panel on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('text=Progress').first()).toBeVisible();
    await expect(page.locator('text=Topics Completed').first()).toBeVisible();
  });

  test('shows welcome message when no topic selected', async ({ page }) => {
    // The main area should show a welcome/empty state
    const welcome = page.locator('text=/welcome|select a topic/i').first();
    await expect(welcome).toBeVisible();
  });

  test('mobile: shows hamburger menu and hides sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    // Hamburger menu button should be visible
    const menuButton = page.locator('header button').first();
    await expect(menuButton).toBeVisible();
    // Click hamburger to open sidebar overlay
    await menuButton.click();
    await page.waitForTimeout(300);
    // The mobile overlay sidebar should show topics
    await expect(page.locator('.fixed.inset-0 >> text=Parallelogram').first()).toBeVisible();
  });

  test('gamification stats visible in progress panel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    // Should show XP and level info
    await expect(page.locator('text=/XP/').first()).toBeVisible();
    await expect(page.locator('text=/Level/i').first()).toBeVisible();
    // Sound toggle
    await expect(page.locator('text=/Sound/i').first()).toBeVisible();
  });
});

// ============================================================
// TEST 3: Topic Selection → Video Intro Screen
// ============================================================
test.describe('Topic Selection & Video Intro', () => {
  test.beforeEach(async ({ page }) => {
    await mockLessonAPI(page);
    await page.goto('/');
    await page.locator('input').first().fill('Arjun');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await expect(page).toHaveURL(/\/learn/);
  });

  test('clicking a topic shows video intro screen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    // Click Parallelogram topic
    await page.locator('text=Parallelogram').first().click();
    // Should show video intro with topic title
    await expect(page.locator('text=Parallelogram').first()).toBeVisible();
    // Should have Watch Video and Skip buttons
    await expect(page.locator('button').filter({ hasText: /watch|video/i }).first()).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /skip/i }).first()).toBeVisible();
  });

  test('video intro shows YouTube thumbnail', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('text=Parallelogram').first().click();
    // YouTube thumbnail image should be present
    const thumbnail = page.locator('img[src*="youtube"]').first();
    await expect(thumbnail).toBeVisible();
  });

  test('skip button advances to concept cards', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('text=Parallelogram').first().click();
    // Wait for lesson to load
    await page.waitForTimeout(2000);
    // Click Skip
    await page.locator('button').filter({ hasText: /skip/i }).first().click();
    // Should now see concept card content
    await expect(page.locator('text=/door|tilt|shape|opposite|parallel/i').first()).toBeVisible({ timeout: 5000 });
    // Should see Next button
    await expect(page.locator('button').filter({ hasText: /next/i }).first()).toBeVisible();
  });
});

// ============================================================
// TEST 4: Concept Cards Flow
// ============================================================
test.describe('Concept Cards', () => {
  test.beforeEach(async ({ page }) => {
    await mockLessonAPI(page);
    await page.goto('/');
    await page.locator('input').first().fill('Arjun');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('text=Parallelogram').first().click();
    // Wait for lesson to load then skip video
    await page.waitForTimeout(2000);
    await page.locator('button').filter({ hasText: /skip/i }).first().click();
    await page.waitForTimeout(500);
  });

  test('shows progress dots matching card count', async ({ page }) => {
    // Should have progress dots (small circles)
    const dots = page.locator('.rounded-full.w-2.h-2, [class*="rounded-full"][class*="w-2"]');
    const dotCount = await dots.count();
    expect(dotCount).toBe(5); // 5 cards in parallelogram template
  });

  test('Next button advances to next card', async ({ page }) => {
    const firstCardText = await page.locator('p.text-lg, p.text-center').first().textContent();
    await page.locator('button').filter({ hasText: /next/i }).first().click();
    await page.waitForTimeout(300);
    const secondCardText = await page.locator('p.text-lg, p.text-center').first().textContent();
    expect(firstCardText).not.toBe(secondCardText);
  });

  test('navigating through all cards reaches quiz transition', async ({ page }) => {
    // Click Next 5 times (5 cards)
    for (let i = 0; i < 5; i++) {
      await page.locator('button').filter({ hasText: /next/i }).first().click();
      await page.waitForTimeout(300);
    }
    // Should see Quiz Transition screen
    await expect(page.locator('text=/quiz time/i').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('button').filter({ hasText: /start quiz/i }).first()).toBeVisible();
  });
});

// ============================================================
// TEST 5: Quiz Cards
// ============================================================
test.describe('Quiz Cards', () => {
  test.beforeEach(async ({ page }) => {
    await mockLessonAPI(page);
    await page.goto('/');
    await page.locator('input').first().fill('Arjun');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('text=Parallelogram').first().click();
    await page.waitForTimeout(2000);
    await page.locator('button').filter({ hasText: /skip/i }).first().click();
    await page.waitForTimeout(500);
    // Navigate through all 5 concept cards
    for (let i = 0; i < 5; i++) {
      await page.locator('button').filter({ hasText: /next/i }).first().click();
      await page.waitForTimeout(300);
    }
    // Click Start Quiz
    await page.locator('button').filter({ hasText: /start quiz/i }).first().click();
    await page.waitForTimeout(300);
  });

  test('shows quiz question with options and hearts', async ({ page }) => {
    // Should show quiz counter
    await expect(page.locator('text=/Quiz 1/i').first()).toBeVisible();
    // Should show hearts
    const hearts = page.locator('text=❤');
    expect(await hearts.count()).toBeGreaterThanOrEqual(3);
    // Should show question
    await expect(page.locator('text=/opposite sides/i').first()).toBeVisible();
    // Should show 4 options
    const options = page.locator('button').filter({ hasText: /^[A-D]\)/ });
    expect(await options.count()).toBe(4);
  });

  test('correct answer shows celebration', async ({ page }) => {
    // Click correct answer (B)
    await page.locator('button').filter({ hasText: /^B\)/ }).first().click();
    await page.waitForTimeout(300);
    // Should show "Sahi Jawab!"
    await expect(page.locator('text=/Sahi Jawab/i').first()).toBeVisible();
    // Should show XP
    await expect(page.locator('text=/\\+20 XP/').first()).toBeVisible();
  });

  test('wrong answer shows hint with Try Again button', async ({ page }) => {
    // Click wrong answer (A)
    await page.locator('button').filter({ hasText: /^A\)/ }).first().click();
    await page.waitForTimeout(300);
    // Should show hint
    await expect(page.locator('text=/nahi hai|try/i').first()).toBeVisible();
    // Should show Try Again button
    await expect(page.locator('button').filter({ hasText: /try again/i }).first()).toBeVisible();
  });

  test('wrong answer dims the option on retry', async ({ page }) => {
    // Click wrong answer (A)
    await page.locator('button').filter({ hasText: /^A\)/ }).first().click();
    await page.waitForTimeout(300);
    // Click Try Again
    await page.locator('button').filter({ hasText: /try again/i }).first().click();
    await page.waitForTimeout(300);
    // Option A should be disabled
    const optionA = page.locator('button').filter({ hasText: /^A\)/ }).first();
    await expect(optionA).toBeDisabled();
  });

  test('3 wrong answers reveals the answer', async ({ page }) => {
    // Attempt 1: wrong (A)
    await page.locator('button').filter({ hasText: /^A\)/ }).first().click();
    await page.waitForTimeout(300);
    await page.locator('button').filter({ hasText: /try again/i }).first().click();
    await page.waitForTimeout(300);

    // Attempt 2: wrong (C)
    await page.locator('button').filter({ hasText: /^C\)/ }).first().click();
    await page.waitForTimeout(300);
    await page.locator('button').filter({ hasText: /try again/i }).first().click();
    await page.waitForTimeout(300);

    // Attempt 3: wrong (D)
    await page.locator('button').filter({ hasText: /^D\)/ }).first().click();
    await page.waitForTimeout(300);

    // Should show revealed answer
    await expect(page.locator('text=/Answer:/i').first()).toBeVisible();
    await expect(page.locator('text=/No XP/i').first()).toBeVisible();
  });
});

// ============================================================
// TEST 6: Topic Complete Screen
// ============================================================
test.describe('Topic Complete', () => {
  test('shows achievement screen after all quizzes', async ({ page }) => {
    await mockLessonAPI(page);
    await page.goto('/');
    await page.locator('input').first().fill('Arjun');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('text=Parallelogram').first().click();
    await page.waitForTimeout(2000);
    await page.locator('button').filter({ hasText: /skip/i }).first().click();
    await page.waitForTimeout(500);

    // Navigate through all concept cards
    for (let i = 0; i < 5; i++) {
      await page.locator('button').filter({ hasText: /next/i }).first().click();
      await page.waitForTimeout(300);
    }

    // Start quiz
    await page.locator('button').filter({ hasText: /start quiz/i }).first().click();
    await page.waitForTimeout(300);

    // Answer all 3 quizzes correctly (all are 'B')
    for (let i = 0; i < 3; i++) {
      await page.locator('button').filter({ hasText: /^B\)/ }).first().click();
      await page.waitForTimeout(300);
      // Click Next after correct answer
      await page.locator('button').filter({ hasText: /next/i }).first().click();
      await page.waitForTimeout(300);
    }

    // Should show Topic Complete screen
    await expect(page.locator('text=/Topic Complete/i').first()).toBeVisible({ timeout: 5000 });
    // Should show key points
    await expect(page.locator('text=/Opposite sides/i').first()).toBeVisible();
    // Should show XP
    await expect(page.locator('text=/XP/').first()).toBeVisible();
    // Should show quiz score
    await expect(page.locator('text=/Quiz Score/i').first()).toBeVisible();
    // Should show doubt button
    await expect(page.locator('button').filter({ hasText: /doubt|ask/i }).first()).toBeVisible();
    // Should show Next Topic button
    await expect(page.locator('button').filter({ hasText: /next.*rhombus/i }).first()).toBeVisible();
  });
});

// ============================================================
// TEST 7: Doubt Chat Overlay
// ============================================================
test.describe('Doubt Chat', () => {
  test('floating doubt button opens chat overlay', async ({ page }) => {
    await mockLessonAPI(page);
    await page.goto('/');
    await page.locator('input').first().fill('Arjun');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('text=Parallelogram').first().click();
    await page.waitForTimeout(2000);
    await page.locator('button').filter({ hasText: /skip/i }).first().click();
    await page.waitForTimeout(500);

    // Should see floating doubt button (MessageCircle icon button)
    const doubtButton = page.locator('button[title="Ask a doubt"]');
    await expect(doubtButton).toBeVisible();

    // Click it
    await doubtButton.click();
    await page.waitForTimeout(300);

    // Should see doubt overlay
    await expect(page.locator('text=Ask PadhAI').first()).toBeVisible();
    // Should have input
    await expect(page.locator('input[placeholder*="doubt" i]').first()).toBeVisible();
    // Close button should work
    const closeButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' }).nth(0);
    // Find the close button in the overlay header
    const overlayClose = page.locator('.fixed button').first();
    await overlayClose.click();
    await page.waitForTimeout(300);
  });
});

// ============================================================
// TEST 8: Mobile Responsive
// ============================================================
test.describe('Mobile Responsive', () => {
  test('landing page works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('text=PadhAI').first()).toBeVisible();
    await page.locator('input').first().fill('MobileUser');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await expect(page).toHaveURL(/\/learn/);
  });

  test('lesson flow works on mobile', async ({ page }) => {
    await mockLessonAPI(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.locator('input').first().fill('MobileUser');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();

    // Open sidebar on mobile
    await page.locator('header button').first().click();
    await page.waitForTimeout(300);
    // Select topic from the mobile overlay sidebar
    await page.locator('.fixed.inset-0 >> text=Parallelogram').first().click();
    await page.waitForTimeout(2000);

    // Should see video intro (Watch Video button) or loading spinner
    await expect(page.locator('button').filter({ hasText: /watch video|skip/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.locator('input').first().fill('MobileUser');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});

// ============================================================
// TEST 9: Diagram Rendering
// ============================================================
test.describe('Diagram Rendering', () => {
  test('GeometryDiagram renders SVG for quadrilateral shapes', async ({ page }) => {
    await mockLessonAPI(page);
    await page.goto('/');
    await page.locator('input').first().fill('Arjun');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('text=Parallelogram').first().click();
    await page.waitForTimeout(2000);
    await page.locator('button').filter({ hasText: /skip/i }).first().click();
    await page.waitForTimeout(500);

    // Advance to card 2 which has a diagram
    await page.locator('button').filter({ hasText: /next/i }).first().click();
    await page.waitForTimeout(500);

    // Should have a diagram SVG with a polygon element (the shape)
    const polygon = page.locator('svg polygon').first();
    await expect(polygon).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================
// TEST 10: Progress Persistence
// ============================================================
test.describe('Progress Persistence', () => {
  test('username persists across page reload', async ({ page }) => {
    await page.goto('/');
    await page.locator('input').first().fill('PersistUser');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await expect(page).toHaveURL(/\/learn/);

    // Reload
    await page.reload();
    // Should still be on /learn (name persisted)
    await expect(page).toHaveURL(/\/learn/);
  });
});

// ============================================================
// TEST 11: Empty State & Error Handling
// ============================================================
test.describe('Empty State & Error', () => {
  test('shows empty state when no topic selected', async ({ page }) => {
    await page.goto('/');
    await page.locator('input').first().fill('TestUser');
    await page.locator('button').filter({ hasText: /start|begin|let.*go/i }).first().click();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Main area should show welcome/empty state
    await expect(page.locator('text=/welcome|select/i').first()).toBeVisible();
  });
});
