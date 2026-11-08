import { isLocale, localeNames, locales, pickLocale, saveLocale, type Locale } from '../shared/locale';
import { messages, type Copy } from './messages';
import type { MarsScene, Quality, SceneState } from './scene';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
let locale: Locale = pickLocale();
let quality: Quality = matchMedia('(pointer: coarse)').matches ? 'low' : 'high';
let scene: MarsScene | null = null;
let started = false;
let failed = false;
let loadVersion = 0;
let nearest = -1;
const found = new Set<number>();
const panel = $<HTMLDialogElement>('panel');
const canvas = $<HTMLCanvasElement>('landscape');
const language = $<HTMLSelectElement>('language');
const enter = $<HTMLButtonElement>('enter');
let panelKind: 'places' | 'help' | 'about' | number = 'places';
const source = 'https://science.nasa.gov/mars/facts/';
const siteSources = [
  'https://science.nasa.gov/resource/sedimentary-signs-of-a-martian-lakebed-2/',
  'https://science.nasa.gov/resource/wind-at-work/',
  source,
];
const copy = () => messages[locale];

language.innerHTML = locales.map(code => `<option value="${code}" lang="${code}">${localeNames[code]}</option>`).join('');

function note(index: number, allowVisit: boolean) {
  const t = copy(), site = t.sites[index];
  return `<article class="place-card"><span class="number">0${index + 1}</span>${found.has(index) ? `<span class="discovered">${t.found}</span>` : ''}
    <h3>${site.title}</h3><p class="subtitle">${site.subtitle}</p><p>${site.text}</p>
    <div class="place-actions">${allowVisit ? `<button class="visit" data-visit="${index}">${t.visit} <span aria-hidden="true">↗</span></button>` : ''}<a href="${siteSources[index]}" target="_blank" rel="noopener noreferrer">${t.source} ↗</a></div></article>`;
}

function renderPanel() {
  const t = copy();
  $('panel-title').textContent = typeof panelKind === 'number' ? t.sites[panelKind].title : panelKind === 'places' ? t.places : panelKind === 'help' ? t.help : t.aboutTitle;
  $('panel-content').innerHTML = typeof panelKind === 'number' ? note(panelKind, false) : panelKind === 'places' ? t.sites.map((_, i) => note(i, !!scene)).join('') : panelKind === 'help' ? `<p>${t.helpText}</p>` : `<p>${t.aboutText}</p><p><a href="${source}" target="_blank" rel="noopener noreferrer">${t.source} ↗</a></p>`;
  panel.querySelectorAll<HTMLButtonElement>('[data-visit]').forEach(button => button.addEventListener('click', () => {
    scene?.visit(Number(button.dataset.visit));
    started = true; document.body.dataset.mode = 'exploring';
    panel.close(); canvas.focus({ preventScroll: true });
  }));
}

function renderCopy() {
  const t = copy();
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.title = `${t.mars} — ${t.worlds}`;
  language.value = locale;
  document.querySelectorAll<HTMLElement>('[data-copy]').forEach(el => {
    const value = t[el.dataset.copy as keyof Copy];
    if (typeof value === 'string') el.textContent = value;
  });
  document.querySelectorAll<HTMLElement>('[data-title]').forEach(el => {
    const value = t[el.dataset.title as keyof Copy];
    if (typeof value === 'string') { el.title = value; el.setAttribute('aria-label', value); }
  });
  canvas.setAttribute('aria-label', t.scene);
  document.querySelector('.tools')!.setAttribute('aria-label', t.mars);
  document.querySelector('.touch-controls')!.setAttribute('aria-label', t.help);
  $<HTMLAnchorElement>('back').href = `${import.meta.env.BASE_URL}?lang=${locale}#mars`;
  $('instructions').textContent = matchMedia('(pointer: coarse)').matches ? t.touch : t.desktop;
  $('enter-label').textContent = scene ? t.enter : t.loading;
  $('quality-label').textContent = quality === 'high' ? t.high : t.low;
  $('quality').title = `${t.quality}: ${quality === 'high' ? t.high : t.low}`;
  $('quality').setAttribute('aria-label', $('quality').title);
  $('quality').setAttribute('aria-pressed', String(quality === 'high'));
  if (nearest >= 0) $('nearby-name').textContent = t.sites[nearest].subtitle;
  if (failed) $('fallback-notes').innerHTML = t.sites.map((_, i) => note(i, false)).join('');
  if (panel.open) renderPanel();
}

function openPanel(kind: typeof panelKind) {
  panelKind = kind; renderPanel(); scene?.setActive(false); panel.showModal();
}
$('places').addEventListener('click', () => openPanel('places'));
$('help').addEventListener('click', () => openPanel('help'));
$('about').addEventListener('click', () => openPanel('about'));
$('nearby').addEventListener('click', () => { if (nearest >= 0) openPanel(nearest); });
$('close').addEventListener('click', () => panel.close());
panel.addEventListener('close', () => scene?.setActive(started));
panel.addEventListener('click', event => {
  const rect = panel.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) panel.close();
});
language.addEventListener('change', () => {
  if (!isLocale(language.value)) return;
  locale = language.value; saveLocale(locale);
  const url = new URL(location.href); url.searchParams.set('lang', locale); history.replaceState(null, '', url);
  renderCopy();
});
enter.addEventListener('click', () => {
  if (!scene) return;
  started = true; document.body.dataset.mode = 'exploring';
  scene.setActive(true); canvas.focus({ preventScroll: true });
});
$('reset').addEventListener('click', () => { scene?.reset(); canvas.focus({ preventScroll: true }); });
$('quality').addEventListener('click', () => {
  quality = quality === 'high' ? 'low' : 'high'; scene?.setQuality(quality); renderCopy();
});
document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button => {
  const release = () => scene?.hold(button.dataset.key!, false);
  button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); scene?.hold(button.dataset.key!, true); });
  button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  button.addEventListener('keydown', event => { if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); scene?.hold(button.dataset.key!, true); } });
  button.addEventListener('keyup', release); button.addEventListener('blur', release);
});

function update(state: SceneState) {
  const t = copy();
  canvas.dataset.x = state.x.toFixed(2); canvas.dataset.z = state.z.toFixed(2); canvas.dataset.yaw = state.yaw.toFixed(3);
  $('map-player').setAttribute('transform', `translate(${56 + state.x} ${56 + state.z}) rotate(${-state.yaw * 180 / Math.PI})`);
  nearest = state.nearest;
  $('nearby').hidden = !started || nearest < 0 || panel.open;
  if (nearest >= 0) {
    found.add(nearest); $('nearby-name').textContent = t.sites[nearest].subtitle;
  }
  const status = started && state.boundary ? t.boundary : '';
  if ($('status').textContent !== status) $('status').textContent = status;
}

function showFallback() {
  loadVersion++;
  scene?.dispose(); scene = null;
  failed = true; started = false;
  if (panel.open) panel.close();
  document.body.dataset.mode = 'fallback';
  $('fallback').hidden = false; $('nearby').hidden = true;
  renderCopy();
}

async function loadScene() {
  const version = ++loadVersion;
  failed = false; enter.disabled = true;
  $('fallback').hidden = true;
  document.body.dataset.mode = 'loading'; renderCopy();
  try {
    // Keep the entire Three.js graph off the overview page and let the shell paint first.
    const { MarsScene } = await import('./scene');
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    if (version !== loadVersion) return;
    scene = new MarsScene(canvas, { quality, onUpdate: update, onError: showFallback });
    if (version !== loadVersion) { scene.dispose(); scene = null; return; }
    document.body.dataset.mode = 'welcome'; enter.disabled = false; renderCopy();
  } catch (error) {
    if (version !== loadVersion) return;
    console.warn('Mars view unavailable:', error instanceof Error ? error.message : error);
    showFallback();
  }
}
$('retry').addEventListener('click', () => { location.reload(); });
window.addEventListener('pagehide', () => { loadVersion++; scene?.dispose(); scene = null; });
window.addEventListener('pageshow', event => { if (event.persisted) { started = false; void loadScene(); } });
renderCopy();
void loadScene();
