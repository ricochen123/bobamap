import { test, expect } from '@playwright/test';

const BASE = 'https://bobamap-iota.vercel.app';

test.describe('BobaMap', () => {

  test('homepage loads with map and search', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/BobaMap/);
    await expect(page.getByRole('button', { name: /near me/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /city/i })).toBeVisible();
  });

  test('unauthenticated user sees login and signup buttons', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('user can navigate to login page', async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole('link', { name: /log in/i }).click();
    await expect(page).toHaveURL(/login/);
  });

  test('user can navigate to signup page', async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/register|signup/);
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/username/i).fill('fakeuser');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible();
  });

});