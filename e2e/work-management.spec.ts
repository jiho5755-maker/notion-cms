import { test, expect } from '@playwright/test';

test.describe('업무 관리 시스템', () => {
  test('빠른 추가 페이지 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/work/quick-add');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /빠른 작업 추가/ })).toBeVisible();

    // 폼 요소 확인
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('input[name="dueDate"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('작업 목록 페이지 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/work/tasks');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: '작업 목록' })).toBeVisible();

    // 페이지가 정상적으로 렌더링되었는지 확인 (버튼 또는 메시지)
    await expect(page.locator('body')).toContainText('작업');
  });

  test('오늘 할 일 페이지 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/work/daily');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /오늘 할 일/ })).toBeVisible();

    // 날짜 정보 표시 확인
    await expect(page.locator('main p').first()).toBeVisible();
  });

  test('네비게이션 동작 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/work/quick-add');

    // 작업 목록으로 이동
    await page.click('a[href="/work/tasks"]');
    await expect(page).toHaveURL('http://localhost:3000/work/tasks');

    // 오늘 할 일로 이동
    await page.click('a[href="/work/daily"]');
    await expect(page).toHaveURL('http://localhost:3000/work/daily');

    // 빠른 추가로 이동
    await page.click('a[href="/work/quick-add"]');
    await expect(page).toHaveURL('http://localhost:3000/work/quick-add');
  });
});
