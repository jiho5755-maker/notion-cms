import { test, expect } from '@playwright/test';

test.describe('업무 관리 시스템 - Phase 2', () => {
  test('협업자 관리 페이지 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/work/team');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /협업자 관리/ })).toBeVisible();

    // 추가 폼 확인
    await expect(page.getByRole('heading', { name: /새 협업자 추가/ })).toBeVisible();

    // 폼 필드 확인
    await expect(page.locator('input[name="title"]')).toBeVisible();

    // 페이지가 정상적으로 렌더링되었는지 확인
    await expect(page.locator('body')).toContainText('협업자');
  });

  test('주간 리뷰 페이지 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/work/weekly');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /주간 리뷰/ })).toBeVisible();

    // 생성 버튼 확인
    await expect(page.getByRole('button', { name: /지난 주 리뷰 생성/ })).toBeVisible();

    // 안내 메시지 확인
    await expect(page.locator('body')).toContainText('주간 리뷰란?');
  });

  test('대시보드 페이지 렌더링', async ({ page }) => {
    await page.goto('http://localhost:3000/work/dashboard');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /대시보드/ })).toBeVisible();

    // KPI 섹션 확인
    await expect(page.getByRole('heading', { name: /오늘 할 일/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /전체 통계/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /우선순위 등급 분포/ })).toBeVisible();

    // KPI 카드 확인 (최소 1개 이상)
    await expect(page.locator('body')).toContainText('총 작업');
  });

  test('네비게이션 동작 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/work/dashboard');

    // Team 페이지로 이동
    await page.click('a[href="/work/team"]');
    await expect(page).toHaveURL('http://localhost:3000/work/team');

    // Weekly 페이지로 이동
    await page.click('a[href="/work/weekly"]');
    await expect(page).toHaveURL('http://localhost:3000/work/weekly');

    // Dashboard로 복귀
    await page.goto('http://localhost:3000/work/dashboard');
    await expect(page).toHaveURL('http://localhost:3000/work/dashboard');
  });
});
