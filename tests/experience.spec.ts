import { expect, test, type Page } from '@playwright/test';
import { locales } from '../src/shared/locale';
import { SITES } from '../src/mars/world';

const position = (page: Page) => page.locator('#landscape').evaluate(el => ({ x: Number((el as HTMLElement).dataset.x), z: Number((el as HTMLElement).dataset.z), yaw: Number((el as HTMLElement).dataset.yaw) }));
async function enter(page: Page) {
  await page.goto('mars/?lang=en');
  await expect(page.locator('#enter')).toBeEnabled();
  await page.locator('#enter').click();
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'exploring');
  await expect(page.locator('#landscape')).toHaveAttribute('data-x', '6.00');
}

test('walk, look, visit all landmarks, change language, and return to planets', async ({ page }, info) => {
  // This full journey took 44.3 s on CI's software renderer; allow 3× the normal
  // test budget while keeping individual assertions and the other tests tight.
  test.slow();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await enter(page);
  const start = await position(page);
  if (info.project.name === 'mobile') {
    const button = page.locator('[data-key="ArrowUp"]');
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect.poll(async () => (await position(page)).z).toBeLessThan(start.z - .3);
    await page.mouse.up();
  } else {
    await page.keyboard.down('w');
    await expect.poll(async () => (await position(page)).z).toBeLessThan(start.z - .3);
    await page.keyboard.up('w');
  }
  await expect.poll(async () => (await position(page)).z).toBeLessThan(start.z - .3);
  const viewport = page.viewportSize()!;
  await page.mouse.move(viewport.width / 2, viewport.height / 2);
  await page.mouse.down(); await page.mouse.move(viewport.width / 2 + 90, viewport.height / 2 - 20, { steps: 10 }); await page.mouse.up();
  await expect.poll(async () => (await position(page)).yaw).not.toBe(start.yaw);
  for (const index of [0, 1, 2]) {
    await page.locator('#places').click();
    await page.locator(`[data-visit="${index}"]`).click();
    await expect(page.locator('#panel')).not.toBeVisible();
    await expect.poll(async () => { const p = await position(page); return { x: p.x, z: p.z }; }).toEqual(SITES[index].visit);
    await expect(page.locator('#nearby')).toBeVisible();
  }
  const beforeLocale = await position(page);
  await page.locator('#language').selectOption('zh-Hans');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  expect(await position(page)).toEqual(beforeLocale);
  await page.locator('#help').click();
  await page.keyboard.down('w'); await page.waitForTimeout(250); await page.keyboard.up('w');
  expect(await position(page)).toEqual(beforeLocale);
  await page.keyboard.press('Escape');
  await page.locator('#reset').click();
  await expect.poll(async () => (await position(page)).z).toBe(24);
  const ground = page.viewportSize()!;
  if (info.project.name === 'mobile') await page.touchscreen.tap(ground.width * .55, ground.height * .73);
  else await page.mouse.click(ground.width * .55, ground.height * .73);
  await expect.poll(async () => (await position(page)).z).toBeLessThan(23.7);
  await page.locator('#back').click();
  await expect(page.locator('.pbtn[data-id="mars"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#lang')).toHaveValue('zh-Hans');
  await page.locator('#lang').selectOption('fr');
  await page.reload();
  await expect(page.locator('#lang')).toHaveValue('fr');
  expect(errors).toEqual([]);
});

test('all ten locales fit and deep-link refresh works', async ({ page }) => {
  await enter(page);
  for (const locale of locales) {
    await page.locator('#language').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    await page.locator('#places').click();
    await expect(page.locator('#panel .place-card')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator('#close').click();
  }
  await page.reload();
  await expect(page.locator('#enter')).toBeEnabled();
  await expect(page.locator('#language')).toHaveValue('ar');
});

test('overview keeps 8 planets, 10 languages, photos and keyboard focus without loading Three.js', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', req => requests.push(req.url()));
  await page.goto('?lang=en#mars');
  await expect(page.locator('.pbtn')).toHaveCount(8);
  const ids = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  for (const locale of locales) {
    await page.locator('#lang').selectOption(locale);
    for (const id of ids) {
      await page.locator(`.pbtn[data-id="${id}"]`).click();
      await expect(page.locator('.pn')).not.toBeEmpty();
      await expect(page.locator('.card')).toHaveCount(4);
      await expect(page.locator(`.pbtn[data-id="${id}"]`)).toHaveAttribute('aria-pressed', 'true');
    }
  }
  expect(requests.some(url => /\/three-[^/]+\.js/.test(url))).toBe(false);
  await page.locator('#lang').selectOption('en');
  await page.locator('.pbtn[data-id="mars"]').click();
  await page.locator('.thumbs button').nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.thumbs button').nth(1)).toBeFocused();
  await expect(page.locator('#view img')).toBeVisible();
  await expect.poll(() => page.locator('#view img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.locator('.explore-mars').click();
  await expect(page.locator('#enter')).toBeEnabled();
});

test('unavailable WebGL offers a real photograph and accessible observations', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
      if (kind === 'webgl2' || kind === 'webgl' || kind === 'experimental-webgl') return null;
      return original.apply(this, [kind, ...args] as never);
    } as typeof original;
  });
  await page.goto('mars/?lang=en');
  await expect(page.locator('#fallback')).toBeVisible();
  await expect(page.locator('#fallback .place-card')).toHaveCount(3);
  await expect.poll(() => page.locator('#fallback img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.locator('#language').selectOption('zh-Hans');
  await expect(page.locator('#fallback h1')).toContainText('火星');
  await page.locator('#back').click();
  await expect(page.locator('#detail')).toBeVisible();
});

test('WebGL context loss exits safely to fallback', async ({ page }) => {
  await enter(page);
  await page.locator('#landscape').evaluate(canvas => {
    (canvas as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext();
  });
  await expect(page.locator('#fallback')).toBeVisible();
  await expect(page.locator('#retry')).toBeEnabled();
});

test('nearby ground moves the visitor and reduced motion uses an immediate step', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enter(page);
  const start = await position(page);
  const size = page.viewportSize()!;
  const x = size.width * .55, y = size.height * .73;
  if (info.project.name === 'mobile') await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await expect.poll(async () => (await position(page)).z).toBeLessThan(start.z - .2);
  const after = await position(page);
  await page.waitForTimeout(300);
  expect(await position(page)).toEqual(after);
  await page.locator('#quality').click();
  await expect(page.locator('#quality')).toHaveAttribute('aria-pressed', info.project.name === 'mobile' ? 'true' : 'false');
  expect(await position(page)).toEqual(after);
});

test('idle scenes stop GPU draws and walking redraws the scene', async ({ page }) => {
  await page.addInitScript(() => {
    let draws = 0;
    Object.defineProperty(window, '__marsDraws', { get: () => draws });
    const original = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (this: WebGL2RenderingContext, ...args: Parameters<typeof original>) {
      draws++;
      original.apply(this, args);
    };
  });
  const drawCount = () => page.evaluate(() => (window as unknown as { __marsDraws: number }).__marsDraws);
  await enter(page);
  await page.waitForTimeout(300);
  const idle = await drawCount();
  expect(idle).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  expect(await drawCount()).toBe(idle);
  await page.locator('#landscape').focus();
  await page.keyboard.down('w');
  await expect.poll(drawCount).toBeGreaterThan(idle);
  await page.keyboard.up('w');
});
