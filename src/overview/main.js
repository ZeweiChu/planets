import { PLANETS, PHOTO_META } from "../shared/planets.js";
import "../../lang/ar.js";
import "../../lang/de.js";
import "../../lang/en.js";
import "../../lang/es.js";
import "../../lang/fr.js";
import "../../lang/hi.js";
import "../../lang/ja.js";
import "../../lang/ko.js";
import "../../lang/zh-Hans.js";
import "../../lang/zh-Hant.js";
import { pickLocale } from "../shared/locale";
import { messages } from "../mars/messages";
/* ---------- languages ---------- */
const I18N = window.I18N || {};
const LANG_ORDER = ['zh-Hans','zh-Hant','en','es','fr','de','ja','ko','hi','ar'];
const LANGS = LANG_ORDER.filter(c => I18N[c]);
// Right-to-left languages: keep "number °C" and powers of ten such as "3×10⁻¹⁵ bar" together as one
// left-to-right unit, otherwise the bidi algorithm splits them into "C° 727" or "10 ¹⁵⁻".
(function isolateDegrees(){
  const re = /((?:\{\w+\}|[−-]?\d[\d.,]*(?:[–-][−-]?\d[\d.,]*)?)\s)?°C/g;
  const sci = /\d[\d.,]*×10[⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+(?:\s(?:bar|K))?/g;
  const walk = o => { for (const k in o) {
    if (typeof o[k] === 'string') o[k] = o[k].replace(re, m => '⁦' + m + '⁩').replace(sci, m => '⁦' + m + '⁩');
    else if (o[k] && typeof o[k] === 'object') walk(o[k]);
  } };
  LANGS.forEach(c => { if (I18N[c].meta.dir === 'rtl') { walk(I18N[c].ui); walk(I18N[c].planets); walk(I18N[c].photos); walk(I18N[c].fun); } });
})();
const FONT_URLS = {
  sc:'family=Noto+Serif+SC:wght@600;700&family=Noto+Sans+SC:wght@400;500;700',
  tc:'family=Noto+Serif+TC:wght@600;700&family=Noto+Sans+TC:wght@400;500;700',
  jp:'family=Noto+Serif+JP:wght@600;700&family=Noto+Sans+JP:wght@400;500;700',
  kr:'family=Noto+Serif+KR:wght@600;700&family=Noto+Sans+KR:wght@400;500;700',
  deva:'family=Noto+Serif+Devanagari:wght@600;700&family=Noto+Sans+Devanagari:wght@400;500;700',
  arab:'family=Noto+Naskh+Arabic:wght@600;700&family=Noto+Sans+Arabic:wght@400;500;700'
};
const loadedFonts = new Set(['latin']);
function loadFont(key){
  if(loadedFonts.has(key) || !FONT_URLS[key]) return;
  loadedFonts.add(key);
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?' + FONT_URLS[key] + '&display=swap';
  document.head.appendChild(l);
}
function pickLang(){ return pickLocale(); }
let lang = pickLang();
const L = () => I18N[lang];
const U = () => I18N[lang].ui;
const tp = id => I18N[lang].planets[id];
const fmt = (s, v = {}) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
const num = (x, d = 0) => {
  const s = x.toLocaleString(L().meta.num, {minimumFractionDigits:d, maximumFractionDigits:d}).replace(/[‎‏؜]/g, '').replace(/^-/, '−');
  // In right-to-left text a leading minus would jump to the far side of the number; isolate it as LTR.
  return L().meta.dir === 'rtl' && s[0] === '−' ? '⁦' + s + '⁩' : s;
};
const decs = x => (String(x).split('.')[1] || '').length;

/* ---------- language-neutral data ---------- */
const GASCOL = {CO2:'#e8a13a',N2:'#6c8ff0',O2:'#45c4b0',Ar:'#b08cf0',CO:'#8b93a6',H2:'#dfe6f3',He:'#7fdbe6',CH4:'#8fd16a'};
const ATOMS = {H:['#e8edf5',4.2],C:['#5a606c',6.2],N:['#5c86ef',6.2],O:['#ec5a44',6.2],S:['#e6c34a',7],He:['#89e0ea',5.6],
  Ar:['#b597f2',7],Ne:['#f3a46c',6.2],Na:['#a983f4',7.4],Mg:['#86d47f',7.2],K:['#c895f5',8],Ca:['#a9bacb',7.6]};
const MOLS = {
  H2:[['H',-4.5,0],['H',4.5,0]], N2:[['N',-5.6,0],['N',5.6,0]], O2:[['O',-5.6,0],['O',5.6,0]], CO:[['C',-5.6,0],['O',5.6,0]],
  CO2:[['C',0,0],['O',-11.5,0],['O',11.5,0]], CH4:[['C',0,0],['H',-8,-6],['H',8,-6],['H',-8,6],['H',8,6]],
  He:[['He',0,0]], Ne:[['Ne',0,0]], Ar:[['Ar',0,0]], Na:[['Na',0,0]], Mg:[['Mg',0,0]], O:[['O',0,0]], H:[['H',0,0]], K:[['K',0,0]], Ca:[['Ca',0,0]]
};
const fmtF = f => `<bdi class="f">${f.replace(/(\d+)/g,'<sub>$1</sub>')}</bdi>`;
const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const uniF = f => f.replace(/\d/g, d => SUBS[+d]);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function molSVG(key){
  const m = MOLS[key]; if(!m) return '';
  let bonds = '', atoms = '';
  for(let i = 1; i < m.length; i++) bonds += `<line x1="${m[0][1]}" y1="${m[0][2]}" x2="${m[i][1]}" y2="${m[i][2]}"/>`;
  const order = m.map((a,i) => i).sort((a,b) => (m[a][0]==='H') - (m[b][0]==='H'));
  for(const i of order){
    const [el,x,y] = m[i]; const [c,r] = ATOMS[el];
    atoms += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width=".8"/><circle cx="${x - r*.3}" cy="${y - r*.35}" r="${r*.32}" fill="#fff" fill-opacity=".35"/>`;
  }
  return `<svg width="38" height="28" viewBox="-19 -14 38 28" aria-hidden="true"><g stroke="rgba(255,255,255,.45)" stroke-width="2.4">${bonds}</g>${atoms}</svg>`;
}

let uid = 0;
function planetSVG(p, d){
  const id = p.id + (++uid);
  const ring = p.id === 'saturn';
  const w = ring ? Math.round(d*1.9) : d;
  const vb = ring ? '-45 0 190 100' : '0 0 100 100';
  let f = '';
  const bands = (arr, op) => arr.map(([y,h,c]) => `<rect x="-10" y="${y}" width="120" height="${h}" fill="${c}" opacity="${op}"/>`).join('');
  switch(p.id){
    case 'mercury':
      f = [[30,34,7],[62,26,5],[70,60,9],[40,70,6],[22,56,4],[55,47,3.5],[80,40,4]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#000" opacity=".18"/><circle cx="${x-r*.25}" cy="${y-r*.25}" r="${r*.75}" fill="#fff" opacity=".05"/>`).join('');
      break;
    case 'venus':
      f = `<g transform="rotate(-10 50 50)" fill="#fff"><ellipse cx="50" cy="30" rx="70" ry="7" opacity=".16"/><ellipse cx="45" cy="52" rx="70" ry="9" opacity=".12"/><ellipse cx="55" cy="74" rx="70" ry="6" opacity=".14"/></g><g fill="#b89a5e" opacity=".18"><ellipse cx="40" cy="42" rx="40" ry="4" transform="rotate(-10 50 50)"/><ellipse cx="60" cy="64" rx="40" ry="4" transform="rotate(-10 50 50)"/></g>`;
      break;
    case 'earth':
      f = `<g fill="#5b8b4f"><ellipse cx="32" cy="40" rx="13" ry="21" transform="rotate(22 32 40)"/><ellipse cx="64" cy="64" rx="11" ry="16" transform="rotate(-18 64 64)"/><ellipse cx="72" cy="30" rx="9" ry="6"/></g><g fill="#c9b27c" opacity=".7"><ellipse cx="66" cy="58" rx="5" ry="4"/></g><g fill="#fff" opacity=".6"><ellipse cx="44" cy="22" rx="22" ry="3.5" transform="rotate(-12 44 22)"/><ellipse cx="58" cy="46" rx="20" ry="3" transform="rotate(8 58 46)"/><ellipse cx="34" cy="74" rx="18" ry="3.2" transform="rotate(-6 34 74)"/><ellipse cx="50" cy="98" rx="30" ry="8"/></g>`;
      break;
    case 'moon':
      f = `<g fill="#5f5d59" opacity=".55"><ellipse cx="38" cy="34" rx="15" ry="11"/><ellipse cx="58" cy="28" rx="10" ry="8"/><ellipse cx="30" cy="56" rx="11" ry="9"/><ellipse cx="62" cy="48" rx="8" ry="6"/></g><g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6"><circle cx="58" cy="76" r="5"/><circle cx="76" cy="60" r="3"/><circle cx="44" cy="84" r="2.5"/></g>`;
      break;
    case 'mars':
      f = `<g fill="#7f3a22" opacity=".45"><ellipse cx="40" cy="56" rx="20" ry="8" transform="rotate(-10 40 56)"/><ellipse cx="66" cy="40" rx="11" ry="6"/><ellipse cx="24" cy="38" rx="7" ry="4"/></g><ellipse cx="50" cy="3" rx="20" ry="8" fill="#fff" opacity=".85"/><ellipse cx="50" cy="99" rx="14" ry="5" fill="#fff" opacity=".6"/>`;
      break;
    case 'jupiter':
      f = bands([[10,5,'#b8865e'],[18,4,'#efe3cf'],[25,9,'#b28159'],[38,5,'#efe3cf'],[47,8,'#a46d48'],[58,4,'#ebdcc3'],[65,7,'#b78c66'],[76,5,'#cbb08e'],[86,6,'#b8936d']], .8) + `<ellipse cx="64" cy="62" rx="8" ry="4.6" fill="#c0603e"/><ellipse cx="64" cy="62" rx="5" ry="2.6" fill="#d77e57"/>`;
      break;
    case 'saturn':
      f = `<g transform="rotate(-18 50 50)">${bands([[16,6,'#cdb27c'],[30,5,'#efe0b8'],[42,8,'#c9ad78'],[58,6,'#efe0b8'],[70,6,'#c7aa74'],[82,6,'#cfb683']], .6)}</g>`;
      break;
    case 'uranus':
      f = `<ellipse cx="50" cy="18" rx="44" ry="22" fill="#fff" opacity=".10"/>`;
      break;
    case 'neptune':
      f = bands([[30,5,'#86afd0'],[58,6,'#86afd0'],[72,3,'#86afd0']], .55) + `<ellipse cx="62" cy="40" rx="9" ry="1.6" fill="#fff" opacity=".6"/><ellipse cx="38" cy="66" rx="6" ry="1.2" fill="#fff" opacity=".45"/>`;
      break;
  }
  const ringPath = sweep => `<g transform="rotate(-18 50 50)" fill="none"><path d="M-38 50 A88 20 0 0 ${sweep} 138 50" stroke="#d9c69c" stroke-opacity="${sweep ? .8 : .9}" stroke-width="8"/><path d="M-29 50 A79 17 0 0 ${sweep} 129 50" stroke="#000" stroke-opacity=".35" stroke-width="1.3"/></g>`;
  return `<svg width="${w}" height="${d}" viewBox="${vb}" aria-hidden="true" style="direction:ltr">
    <defs>
      <clipPath id="c${id}"><circle cx="50" cy="50" r="50"/></clipPath>
      <radialGradient id="s${id}" cx="34%" cy="30%" r="80%">
        <stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/>
        <stop offset=".78" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".66"/>
      </radialGradient>
    </defs>
    ${ring ? ringPath(1) : ''}<g clip-path="url(#c${id})"><circle cx="50" cy="50" r="50" fill="${p.color}"/>${f}<circle cx="50" cy="50" r="50" fill="url(#s${id})"/></g>${ring ? ringPath(0) : ''}
  </svg>`;
}

/* ---------- state ---------- */
let current = 'mars';
let weight = 70;
let temp = 1000;
let photoIdx = 0;
const byId = id => PLANETS.find(p => p.id === id);
const ratio = p => p.g / 9.8;
const pressStr = p => p.p === 0 ? '≈ 0' : p.p === null ? '—' : num(p.p, p.pd);

/* ---------- static text ---------- */
function fitText(el, max){
  // SVG diagrams are laid out left-to-right; give right-to-left labels their own bidi context.
  if (L().meta.dir === 'rtl' && !el.children.length && /[\u0590-\u08ff]/.test(el.textContent) && el.textContent[0] !== '\u2067')
    el.textContent = '\u2067' + el.textContent + '\u2069';
  let fs = parseFloat(el.getAttribute('font-size'));
  while(el.getComputedTextLength() > max && fs > 8){ fs -= 0.5; el.setAttribute('font-size', fs); }
}
function renderStatic(){
  const m = L().meta, u = U();
  const root = document.documentElement;
  root.lang = m.html; root.dir = m.dir; root.dataset.font = m.font;
  root.style.setProperty('--labelw', m.labelW); root.style.setProperty('--layerw', m.layerW);
  loadFont(m.font);
  document.title = u.title;
  document.getElementById('title').textContent = u.title;
  document.getElementById('langLabel').textContent = u.langLabel;
  const sel = document.getElementById('lang');
  sel.setAttribute('aria-label', u.langLabel);
  sel.value = lang;
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = u[el.dataset.t]; });
  strip.setAttribute('aria-label', u.stripLabel);
  strip.querySelectorAll('.pbtn').forEach(b => {
    const id = b.dataset.id;
    b.querySelector('.pname').innerHTML = tp(id).name + (m.latinNames ? '' : `<small>${I18N.en ? I18N.en.planets[id].name : ''}</small>`);
  });
  document.getElementById('sources').innerHTML = u.sources.map(s => `<li>${s}</li>`).join('');
  document.getElementById('esc').setAttribute('aria-label', u.escAria);
  drawFrost();
}

function drawFrost(){
  const u = U(), n = id => tp(id).name;
  const box = document.getElementById('frost');
  box.innerHTML = `<svg viewBox="0 0 760 236" width="100%" style="min-width:600px" role="img" aria-label="${u.frostAria}">
    <defs><radialGradient id="sunG" cx="0" cy="50%" r="100%"><stop offset="0" stop-color="#fff6d2"/><stop offset=".45" stop-color="#ffc25a"/><stop offset="1" stop-color="#ff8c28" stop-opacity="0"/></radialGradient></defs>
    <rect x="60" y="44" width="270" height="116" rx="10" fill="#ffb45a" fill-opacity=".08"/>
    <rect x="330" y="44" width="420" height="116" rx="10" fill="#78b4ff" fill-opacity=".07"/>
    <rect x="0" y="40" width="70" height="124" fill="url(#sunG)"/>
    <line x1="330" y1="36" x2="330" y2="168" stroke="#9fd0ff" stroke-width="1.5" stroke-dasharray="5 5"/>
    <text data-max="160" x="330" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="#cfe6ff">${u.frostLine}</text>
    <text data-max="400" x="338" y="60" font-size="12" fill="#9aa4bb">${u.frostOut}</text>
    <text data-max="250" x="322" y="60" font-size="12" fill="#9aa4bb" text-anchor="end">${u.frostIn}</text>
    <g fill="#ece6d9" text-anchor="middle">
      <circle cx="100" cy="104" r="5" fill="#8e8983"/><text data-max="50" x="100" y="142" font-size="12.5">${n('mercury')}</text>
      <circle cx="152" cy="104" r="8.5" fill="#e3cf9f"/><text data-max="50" x="152" y="142" font-size="12.5">${n('venus')}</text>
      <circle cx="208" cy="104" r="9" fill="#2f63a8"/><text data-max="54" x="208" y="142" font-size="12.5">${n('earth')}</text>
      <circle cx="268" cy="104" r="6" fill="#c0643c"/><text data-max="58" x="268" y="142" font-size="12.5">${n('mars')}</text>
      <circle cx="412" cy="100" r="27" fill="#d6bf9c"/><text data-max="96" x="412" y="148" font-size="12.5">${n('jupiter')}</text>
      <circle cx="520" cy="100" r="23" fill="#e0cc9c"/><ellipse cx="520" cy="100" rx="38" ry="8" fill="none" stroke="#d9c69c" stroke-opacity=".7" stroke-width="3" transform="rotate(-14 520 100)"/><text data-max="96" x="520" y="148" font-size="12.5">${n('saturn')}</text>
      <circle cx="624" cy="102" r="14" fill="#b5dde0"/><text data-max="70" x="624" y="142" font-size="12.5">${n('uranus')}</text>
      <circle cx="700" cy="102" r="14" fill="#9fc3de"/><text data-max="70" x="700" y="142" font-size="12.5">${n('neptune')}</text>
    </g>
    <g text-anchor="middle">
      <text data-max="240" x="190" y="192" font-size="14" font-weight="700" fill="#ece6d9">${u.grpRocky}</text>
      <text data-max="240" x="190" y="212" font-size="12.5" fill="#9aa4bb">${u.grpRockyNote}</text>
      <text data-max="200" x="466" y="192" font-size="14" font-weight="700" fill="#ece6d9">${u.grpGas}</text>
      <text data-max="200" x="466" y="212" font-size="12.5" fill="#9aa4bb">${u.grpGasNote}</text>
      <text data-max="170" x="662" y="192" font-size="14" font-weight="700" fill="#ece6d9">${u.grpIce}</text>
      <text data-max="170" x="662" y="212" font-size="12.5" fill="#9aa4bb">${u.grpIceNote}</text>
    </g>
    <text data-max="380" x="750" y="232" text-anchor="end" font-size="11.5" fill="#6b7690">${u.notToScale}</text>
  </svg>`;
  box.querySelectorAll('text[data-max]').forEach(t => fitText(t, +t.dataset.max));
}

/* ---------- strip ---------- */
const strip = document.getElementById('strip');
PLANETS.forEach(p => {
  const d = Math.round(18 + 64*Math.sqrt(p.D/142984));
  const b = document.createElement('button');
  b.className = p.parent ? 'pbtn sat' : 'pbtn'; b.type = 'button'; b.dataset.id = p.id; b.setAttribute('aria-pressed','false');
  b.innerHTML = planetSVG(p, d) + `<span class="pname"></span>`;
  b.addEventListener('click', () => go(p.id));
  strip.appendChild(b);
});

/* ---------- language menu ---------- */
const sel = document.getElementById('lang');
sel.innerHTML = LANGS.map(c => `<option value="${c}" lang="${I18N[c].meta.html}">${I18N[c].meta.name}</option>`).join('');
sel.addEventListener('change', () => {
  lang = sel.value;
  const url = new URL(location.href); url.searchParams.set('lang', lang); history.replaceState(null, '', url);
  try { localStorage.setItem('planets-lang', lang); } catch(e){}
  renderAll(true);
});

/* ---------- detail ---------- */
let ledeTimer;
function setLede(text){
  clearTimeout(ledeTimer);
  const el = document.getElementById('lede');
  if(el.textContent === text){ el.classList.remove("swap"); return; }
  if(reduceMotion || !el.textContent){ el.textContent = text; return; }
  el.classList.add('swap');
  ledeTimer = setTimeout(() => { el.textContent = text; el.classList.remove('swap'); }, 200);
}

function renderStage(p){
  const u = U(), metas = PHOTO_META[p.id], texts = L().photos[p.id];
  const ph = metas[photoIdx], tx = texts[photoIdx];
  const stage = document.getElementById('stage');
  const view = ph.pano
    ? `<div class="panowrap"><div class="view pano" id="view" tabindex="0" aria-label="${u.panoLabel}"><img src="photos/${ph.f}" alt="${tx.t}" draggable="false"></div><span class="hint">${u.panoHint}</span></div>`
    : `<div class="view" id="view"><img class="fit${ph.fit === 'cover' ? ' kb' : ''}" src="photos/${ph.f}" alt="${tx.t}" style="object-fit:${ph.fit};object-position:${ph.pos || '50% 50%'}"></div>`;
  const thumbs = metas.length > 1 ? `<div class="thumbs" role="group" aria-label="${u.switchPhoto}">${metas.map((x,i) => `<button type="button" data-i="${i}" aria-pressed="${i === photoIdx}" aria-label="${texts[i].t}"><img src="photos/${x.f}" alt=""></button>`).join('')}</div>` : '';
  stage.innerHTML = view + `<div class="cap"><div><span class="badge ${ph.bk}">${tx.b}</span><h3>${tx.t}</h3><p>${tx.d}</p><small>${fmt(u.imageCredit, {c: ph.c})}</small></div>${thumbs}</div>`;
  stage.querySelectorAll('.thumbs button').forEach(b => b.addEventListener('click', () => { const focused = document.activeElement === b; photoIdx = +b.dataset.i; renderStage(p); if(focused) stage.querySelector(`[data-i="${photoIdx}"]`).focus(); }));
  if(ph.pano) setupPano(document.getElementById('view'), ph.start ?? .5);
}

function setupPano(v, start){
  const img = v.querySelector('img');
  const center = () => { v.scrollLeft = (v.scrollWidth - v.clientWidth) * start; };
  if(img.complete) center(); else img.addEventListener('load', center, {once:true});
  let down = false, startX = 0, startLeft = 0;
  v.addEventListener('pointerdown', e => { if(e.pointerType !== 'mouse') return; down = true; startX = e.clientX; startLeft = v.scrollLeft; v.classList.add('drag'); v.setPointerCapture(e.pointerId); });
  v.addEventListener('pointermove', e => { if(down) v.scrollLeft = startLeft - (e.clientX - startX); });
  const up = () => { down = false; v.classList.remove('drag'); };
  v.addEventListener('pointerup', up); v.addEventListener('pointercancel', up);
  v.addEventListener('keydown', e => { if(e.key === 'ArrowLeft'){ v.scrollLeft -= 120; e.preventDefault(); } if(e.key === 'ArrowRight'){ v.scrollLeft += 120; e.preventDefault(); } });
}

function gravHTML(p){
  const u = U();
  const felt = Math.round(weight * ratio(p));
  const jump = Math.round(50 / ratio(p));
  return `<div class="gravrow">
      <div class="gbox"><span>${u.gAccel}</span><b>${num(p.g,1)}</b> <small>${fmt(u.gUnit, {r: num(ratio(p),2)})}</small></div>
      <div class="gbox"><span>${u.gFelt}</span><b id="felt">${felt}</b> <small>kg</small></div>
      <div class="gbox"><span>${u.gJump}</span><b id="jump">${jump}</b> <small>cm</small></div>
    </div>
    <div class="slider"><label for="wt">${u.gWeight}</label><input type="range" id="wt" min="30" max="150" step="1" value="${weight}"><output id="wtOut" for="wt">${weight} kg</output></div>
    ${p.p === null ? `<p class="note">${u.gCloud}</p>` : ''}`;
}

function airHTML(p){
  const u = U(), t = tp(p.id), G = L().gas;
  if(!p.gases){
    const chips = p.atoms.map(a => `<li class="gas">${molSVG(a)}<span class="f">${a.replace(/(\d+)/g,'<sub>$1</sub>')}<span class="n">${G[a]}</span></span></li>`).join('');
    return `<p class="q">${t.airQ}</p><p class="note">${t.airNote}</p><ul class="gases" style="margin-top:12px">${chips}</ul>`;
  }
  const sum = p.gases.reduce((s,[,v]) => s + v, 0);
  const other = Math.max(0, 100 - sum);
  const segs = p.gases.map(([k,v]) => `<span style="width:${v}%;background:${GASCOL[k]}" title="${G[k]} ${num(v,decs(v))}%"></span>`).join('')
    + (other > 0.05 ? `<span style="width:${other}%;background:#4a5370" title="${u.other} ${num(other,2)}%"></span>` : '');
  const chips = p.gases.map(([k,v]) => `<li class="gas"><i style="background:${GASCOL[k]}"></i>${molSVG(k)}<span class="f">${fmtF(k)}<span class="n">${G[k]}</span></span><span class="v">${num(v,decs(v))}%</span></li>`).join('');
  const minor = p.minor && p.minor.length ? `<p class="minor">${u.trace} ${p.minor.map(([k,v]) => `<span class="f">${fmtF(k)}</span> ${G[k]} <bdi>${v}</bdi>`).join(u.listSep)}</p>` : '';
  return `<p class="q">${t.airQ}</p>
    <div class="bar" role="img" aria-label="${p.gases.map(([k,v]) => G[k] + ' ' + num(v,decs(v)) + '%').join(u.listSep)}">${segs}</div>
    <ul class="gases">${chips}</ul>${minor}${t.airNote ? `<p class="note">${t.airNote}</p>` : ''}`;
}

function groundHTML(p){
  const t = tp(p.id), u = U();
  const head = `<div class="state"><i></i>${t.surface}</div><p class="q">${t.groundQ}</p>`;
  if(t.items) return head + `<ul class="items">${t.items.map(([a,b]) => `<li><b>${a}</b><span>${b}</span></li>`).join('')}</ul>`;
  const n = t.layers.length;
  return head + `<div class="layers">${t.layers.map(([a,b],i) => `<div class="layer" style="--d:${(0.1 + 0.55*i/(n-1)).toFixed(2)}"><b>${a}</b><span>${b}</span></div>`).join('')}</div>
    <div class="depth"><span>${u.layersTop}</span><span>${u.layersBottom}</span></div>`;
}

function render(keepPhoto){
  const p = byId(current), t = tp(p.id), u = U(), m = L().meta;
  document.documentElement.style.setProperty('--p', p.accent);
  setLede(L().fun[p.id]);
  strip.querySelectorAll('.pbtn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === current)));
  const selBtn = strip.querySelector(`[data-id="${current}"]`);
  if(selBtn && strip.scrollWidth > strip.clientWidth){
    const pos = selBtn.offsetLeft - (strip.clientWidth - selBtn.offsetWidth)/2;
    strip.scrollLeft = m.dir === 'rtl' ? -(strip.scrollWidth - strip.clientWidth - pos) : pos;
  }
  const mag = p.mag ? u.magYes : u.magNo;
  const moons = p.parent ? mag : fmt(p.moons === 1 ? u.moonsOne : u.moonsOther, {n: p.moons}) + ' · ' + mag;
  document.getElementById('detail').innerHTML = `
    <section class="stage" id="stage" aria-label="${fmt(u.photosOf, {name: t.name})}"></section>
    <aside class="portrait" aria-label="${fmt(u.glance, {name: t.name})}">
      <div class="phead">${planetSVG(p, p.id==='saturn' ? 40 : 44)}<span class="kind">${t.kind}</span></div>
      <h2 class="pn">${t.name}${m.latinNames || !I18N.en ? '' : `<span>${I18N.en.planets[p.id].name}</span>`}</h2>
      <p class="hook">${t.hook}</p>
      ${p.id === "mars" ? `<a class="explore-mars" href="${import.meta.env.BASE_URL}mars/?lang=${lang}">${messages[lang].explore} <span aria-hidden="true">↗</span></a>` : ""}
      <div class="stats">
        <div class="stat"><span>${u.statGravity}</span><b>${num(ratio(p),2)}×</b><em>${u.statEarth1}</em></div>
        <div class="stat"><span>${u.statTemp}</span><b>${L().meta.dir === 'rtl' ? '\u2066' + num(p.t) + ' °C\u2069' : num(p.t) + ' °C'}</b><em>${t.tNote}</em></div>
        <div class="stat"><span>${u.statPressure}</span><b>${pressStr(p)}${p.p === null ? '' : ' bar'}</b><em>${t.pNote}</em></div>
        <div class="stat"><span>${u.statDensity}</span><b>${num(p.density)}</b><em>${u.statDensityNote}</em></div>
        <div class="stat"><span>${u.statDay}</span><b class="word">${t.day}</b><em>${t.dayNote || '&nbsp;'}</em></div>
        <div class="stat"><span>${p.parent ? u.statOrbit : u.statYear}</span><b class="word">${t.year}</b><em>${moons}</em></div>
      </div>
    </aside>
    <div class="cards">
      <section class="card" aria-labelledby="h-ground"><h3 id="h-ground">${u.cardGround}</h3>${groundHTML(p)}</section>
      <section class="card" aria-labelledby="h-air"><h3 id="h-air">${u.cardAir}</h3>${airHTML(p)}</section>
      <section class="card" aria-labelledby="h-grav"><h3 id="h-grav">${u.cardGravity}</h3>${gravHTML(p)}</section>
      <section class="card" aria-labelledby="h-why"><h3 id="h-why">${u.cardWhy}</h3>
        <ol class="why">${t.why.map(([q,a]) => `<li><div><b>${q}</b><span>${a}</span></div></li>`).join('')}</ol>
        <p class="stand"><b>${u.standHere}</b>${t.stand}</p>
      </section>
    </div>`;
  if(!keepPhoto) photoIdx = 0;
  if(photoIdx >= PHOTO_META[p.id].length) photoIdx = 0;
  renderStage(p);
  document.getElementById('wt').addEventListener('input', e => {
    weight = +e.target.value;
    document.getElementById('wtOut').textContent = weight + ' kg';
    document.getElementById('felt').textContent = Math.round(weight * ratio(p));
  });
  document.querySelectorAll('#cmp tbody tr').forEach(tr => tr.classList.toggle('sel', tr.dataset.id === current));
  drawEscape();
}

/* ---------- comparison table ---------- */
function buildTable(){
  const u = U();
  const main = p => p.gases ? p.gases.filter(([,v]) => v >= 1).map(([k,v]) => `${fmtF(k)} <bdi>${v >= 10 ? num(Math.round(v)) : num(v,decs(v))}%</bdi>`).join(' · ') : (tp(p.id).tableGases || u.nearVacuum);
  const t = document.getElementById('cmp');
  t.innerHTML = `<thead><tr><th>${u.colPlanet}</th><th>${u.colType}</th><th>${u.colGround}</th><th>${u.colGases}</th><th class="num">${u.colGravity}</th><th class="num">${u.colTemp}</th><th class="num">${u.colPressure}</th><th class="num">${u.colEscape}</th></tr></thead>
  <tbody>${PLANETS.map(p => `<tr data-id="${p.id}" tabindex="0"><td><span class="tname">${planetSVG(p, p.id==='saturn'?20:22)}${tp(p.id).name}</span></td><td>${tp(p.id).kind}</td><td>${tp(p.id).tableSurface}</td><td>${main(p)}</td>
    <td class="num">${num(ratio(p),2)}</td><td class="num">${num(p.t)}</td><td class="num">${pressStr(p)}</td><td class="num">${num(p.vesc,1)}</td></tr>`).join('')}</tbody>`;
  t.querySelectorAll('tbody tr').forEach(tr => {
    tr.classList.toggle('sel', tr.dataset.id === current);
    tr.addEventListener('click', () => { go(tr.dataset.id); document.getElementById('detail').scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block:'start'}); });
    tr.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); tr.click(); } });
  });
}

/* ---------- escape-velocity lesson ---------- */
const R = 8.314;
const KEEP = [ {k:'CO2',M:0.04401,c:'#e8a13a'}, {k:'N2',M:0.028014,c:'#6c8ff0'}, {k:'H2O',M:0.018015,c:'#5fc9d8'}, {k:'He',M:0.004003,c:'#7fdbe6'}, {k:'H2',M:0.002016,c:'#dfe6f3'} ];
const need = (g, T) => 6 * Math.sqrt(3*R*T/g.M) / 1000;
function drawEscape(){
  const u = U();
  const svg = document.getElementById('esc');
  const X = v => 120 + Math.log10(v)/2 * 380;
  const rowY = i => 78 + i*28;
  const last = rowY(PLANETS.length - 1);
  svg.setAttribute('viewBox', `0 0 760 ${last + 82}`);
  let s = '';
  s += `<g stroke="#26324f">${[1,2,5,10,20,50,100].map(v => `<line x1="${X(v)}" x2="${X(v)}" y1="64" y2="${last + 22}"/>`).join('')}</g>`;
  PLANETS.forEach((p,i) => {
    const y = rowY(i);
    if(p.id === current) s += `<rect x="2" y="${y-13}" width="756" height="26" rx="6" fill="${p.accent}" fill-opacity=".12"/>`;
    s += `<line x1="120" x2="500" y1="${y}" y2="${y}" stroke="#26324f"/>`;
    s += `<text class="nm" x="12" y="${y+4.5}" font-size="13.5" fill="#ece6d9" font-weight="${p.id===current?700:400}">${tp(p.id).name}</text>`;
    s += `<text x="112" y="${y+4.5}" font-size="12" fill="#9aa4bb" text-anchor="end" font-family="IBM Plex Mono, monospace">${num(p.vesc,1)}</text>`;
  });
  KEEP.forEach((g,j) => {
    const x = X(need(g, temp));
    s += `<line x1="${x}" x2="${x}" y1="${j%2 ? 48 : 30}" y2="${last + 22}" stroke="${g.c}" stroke-width="1.6" stroke-opacity=".9"/>`;
    s += `<text x="${x}" y="${j%2 ? 42 : 24}" font-size="12.5" font-weight="700" fill="${g.c}" text-anchor="middle">${uniF(g.k)}</text>`;
  });
  PLANETS.forEach((p,i) => {
    const y = rowY(i);
    s += `<circle cx="${X(p.vesc)}" cy="${y}" r="${p.id===current?7:5.5}" fill="${p.color}" stroke="#0a0f1e" stroke-width="1.5"><title>${fmt(u.dotTitle, {name: tp(p.id).name, v: num(p.vesc,1)})}</title></circle>`;
    const kept = KEEP.filter(g => p.vesc > need(g, temp)).map(g => uniF(g.k));
    const txt = kept.length === KEEP.length ? u.keepAll : kept.length === 0 ? u.keepNone : fmt(u.keepSome, {list: kept.join(' · ')});
    s += `<text class="vd" x="516" y="${y+4.5}" font-size="13" fill="${kept.length ? '#ece6d9' : '#9aa4bb'}">${txt}</text>`;
  });
  s += `<g font-size="11.5" fill="#9aa4bb" text-anchor="middle" font-family="IBM Plex Mono, monospace">${[1,2,5,10,20,50,100].map(v => `<text x="${X(v)}" y="${last + 40}">${v}</text>`).join('')}</g>`;
  s += `<text class="ax" x="310" y="${last + 64}" font-size="12" fill="#9aa4bb" text-anchor="middle">${u.escAxis}</text>`;
  svg.innerHTML = s;
  svg.querySelectorAll('text.nm').forEach(t => fitText(t, 66));
  svg.querySelectorAll('text.vd').forEach(t => fitText(t, 236));
  svg.querySelectorAll('text.ax').forEach(t => fitText(t, 600));
  document.getElementById('tempOut').textContent = fmt(u.tempOut, {t: num(temp), c: num(temp - 273)});
  document.getElementById('escLegend').innerHTML = fmt(u.legend, {t: num(temp), list: KEEP.map(g => `${fmtF(g.k)} ${num(need(g,temp),1)}`).join(' · ')});
}
document.getElementById('temp').addEventListener('input', e => { temp = +e.target.value; drawEscape(); });

/* ---------- routing ---------- */
function go(id){
  if(!byId(id)) return;
  if(location.hash.slice(1) !== id){ try { history.replaceState(null, '', '#' + id); } catch(e){} }
  current = id; render(false);
}
window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if(byId(id) && id !== current){ current = id; render(false); } });

function renderAll(keepPhoto){ renderStatic(); buildTable(); render(keepPhoto); }

const start = location.hash.slice(1);
current = byId(start) ? start : 'mars';
renderAll(false);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawFrost(); drawEscape(); });
