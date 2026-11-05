/*
 * safari-balk.js — laat de balken van Safari (iPhone, iOS 26) automatisch meekleuren met de site.
 * Werkt op elke site zonder instellingen en zonder de site aan te passen: zet het bestand in de site en laad het met
 *   <script src="safari-balk.js" defer></script>
 * VERPLICHT daarnaast in de <head> van elke pagina (Safari leest deze alleen bij het laden):
 *   <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
 *   <meta name="theme-color" content="#ffffff">  (beginkleur = kleur bovenaan)
 * EN in de CSS dezelfde beginkleur op html, anders springt de balk heel even bij koud openen:
 *   html { background-color: #ffffff; }  (kleur bovenaan)
 * en body zonder eigen afwijkende kleur (body { background: transparent } of dezelfde kleur): een dekkende body-kleur
 * gaat in Safari vóór de html-kleur, en dan flitst de bovenbalk bij (snel) herladen in die body-kleur.
 *
 * Wat het doet (bewezen aanpak, ILS delta-demo, getest op iPhone 28-10-2026):
 * - viewport-fit=cover en een theme-color-meta (maakt ze aan als ze ontbreken)
 * - meet zelf de kleur die je echt ziet bovenaan en onderaan het scherm: effen kleur, foto (zoals hij
 *   werkelijk in beeld staat, ook bij object-fit/background-size cover) en donkere lagen eroverheen
 *   (gradients en ::before/::after-overlays) worden samen verrekend
 * - theme-color volgt die kleur: bovenaan de kleur onder de klok, onderaan de pagina die van het laatste blok
 * - Safari 26 kleurt een balk naar een vast element aan die rand; is dat er niet, dan naar de html-achtergrond.
 *   Daarom: bovenaan de pagina krijgen html-achtergrond en theme-color de kleur van de bovenrand (zodat de
 *   bovenbalk naadloos overloopt in de kop/foto), onderaan de pagina de kleur van het laatste blok plus een vast
 *   strookje onderaan. Tussendoor verandert er niets (daar is Safari doorzichtig; wisselen gaf geknipper).
 * - maakt een bijna-dekkende vaste/sticky kop (zoals rgba(255,255,255,.95)) volledig dekkend;
 *   echt doorzichtige koppen over een foto blijven zoals ze zijn
 * - voegt op telefoons ruimte toe onder het laatste blok (in zijn eigen achtergrond), zodat de laatste tekst
 *   niet achter de Safari-balk valt
 * - meet opnieuw bij scrollen, draaien, laden en na klikken (bijv. menu open/dicht)
 */
(() => {
  const doc = document.documentElement;
  const head = document.head;

  // 1. viewport-fit=cover en theme-color-meta
  let viewport = head.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1';
    head.appendChild(viewport);
  }
  if (!/viewport-fit/.test(viewport.content)) viewport.content += ', viewport-fit=cover';
  let thema = head.querySelector('meta[name="theme-color"]:not([media])');
  if (!thema) {
    thema = document.createElement('meta');
    thema.name = 'theme-color';
    head.appendChild(thema);
  }
  head.querySelectorAll('meta[name="theme-color"][media]').forEach((m) => m.remove());

  // 2. Kleuren meten
  const WIT = { r: 255, g: 255, b: 255, a: 1 };
  const DONKER = { r: 17, g: 17, b: 17, a: 1 };
  const parse = (kleur) => {
    const m = kleur && kleur.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  // laag (met doorzichtigheid) over een dekkende kleur leggen
  const over = (laag, onder) => ({
    r: laag.r * laag.a + onder.r * (1 - laag.a),
    g: laag.g * laag.a + onder.g * (1 - laag.a),
    b: laag.b * laag.a + onder.b * (1 - laag.a),
    a: 1,
  });
  // kleur van een gradient op hoogte t (0 = boven, 1 = onder); bij lineaire gradients van boven naar onder
  const gradientKleur = (beeld, t) => {
    const g = beeld.match(/(?:linear|radial|conic)-gradient\((.*)\)/);
    if (!g) return null;
    const stops = g[1].match(/rgba?\([^)]+\)/g);
    if (!stops) return null;
    const naarRechts = /to (left|right)|90deg|270deg/.test(g[1]);
    if (naarRechts) {
      // horizontale gradient: gemiddelde van alle stops
      const k = stops.map(parse);
      const n = k.length;
      return k.reduce((s, c) => ({ r: s.r + c.r / n, g: s.g + c.g / n, b: s.b + c.b / n, a: s.a + c.a / n }), { r: 0, g: 0, b: 0, a: 0 });
    }
    const p = Math.max(0, Math.min(1, t)) * (stops.length - 1);
    const a = parse(stops[Math.floor(p)]);
    const b = parse(stops[Math.ceil(p)]);
    const f = p - Math.floor(p);
    return { r: a.r + (b.r - a.r) * f, g: a.g + (b.g - a.g) * f, b: a.b + (b.b - a.b) * f, a: a.a + (b.a - a.a) * f };
  };

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 8;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const beelden = new Map();
  const laadBeeld = (url) => {
    if (!beelden.has(url)) {
      const img = new Image();
      img.src = url;
      img.onload = () => bijwerken();
      beelden.set(url, img);
    }
    return beelden.get(url);
  };
  const positie = (waarde, as) => {
    // "50% 30%", "center top", "left" → fractie 0..1 voor as 0 (x) of 1 (y)
    const delen = (waarde || '50% 50%').split(/\s+/);
    const woord = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
    let d = delen[as] ?? delen[0];
    if (delen.length === 1 && as === 1) d = /top|bottom/.test(delen[0]) ? delen[0] : 'center';
    if (d in woord) return woord[d];
    return d.endsWith('%') ? parseFloat(d) / 100 : 0.5;
  };
  // gemiddelde kleur van de foto in een horizontale strook rond hoogte y, zoals hij in vak `vak` in beeld staat
  const fotoKleur = (img, vak, y, passing, posX, posY) => {
    try {
      if (!img || !img.complete) return 'laden';
      if (!img.naturalWidth) return null;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      let sx = vak.width / iw, sy = vak.height / ih;
      if (passing === 'cover') sx = sy = Math.max(sx, sy);
      else if (passing === 'contain' || passing === 'scale-down') sx = sy = Math.min(sx, sy);
      else if (passing === 'none') sx = sy = 1;
      const dw = iw * sx, dh = ih * sy;
      const ox = (vak.width - dw) * posX, oy = (vak.height - dh) * posY;
      const yRel = y - vak.top;
      const bx = Math.max(0, (0 - ox) / sx);
      const bw = Math.min(iw - bx, vak.width / sx);
      const by = Math.max(0, Math.min(ih - 1, (yRel - 10 - oy) / sy));
      const bh = Math.max(1, Math.min(ih - by, 20 / sy));
      ctx.clearRect(0, 0, 8, 8);
      ctx.drawImage(img, bx, by, bw, bh, 0, 0, 8, 8);
      const d = ctx.getImageData(0, 0, 8, 8).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      const n = d.length / 4;
      return { r: r / n, g: g / n, b: b / n, a: 1 };
    } catch { return null; }
  };
  // overlay-laag van een pseudo-element (::before/::after) dat over het hele element ligt
  const pseudoLaag = (el, welke, t) => {
    const s = getComputedStyle(el, welke);
    if (s.content === 'none' || s.display === 'none' || !/absolute|fixed/.test(s.position)) return null;
    const op = parseFloat(s.opacity);
    if (!op) return null;
    let k = gradientKleur(s.backgroundImage, t) || parse(s.backgroundColor);
    if (!k || k.a === 0) return null;
    return { ...k, a: k.a * op };
  };

  // de kleur die je echt ziet op punt (x, y): alle lagen van boven naar beneden verrekend
  const eigen = (el) => el.id === 'safari-balk-onder' || el.id === 'safari-balk-boven';
  const kleurOp = (x, y) => {
    const lagen = [];
    let basis = null;
    for (const el of document.elementsFromPoint(x, y)) {
      if (eigen(el)) continue;
      const vak = el.getBoundingClientRect();
      const t = vak.height ? (y - vak.top) / vak.height : 0;
      for (const welke of ['::after', '::before']) {
        const l = pseudoLaag(el, welke, t);
        if (l) l.a >= 0.99 ? (basis = { ...l, a: 1 }) : lagen.push(l);
        if (basis) break;
      }
      if (basis) break;
      const s = getComputedStyle(el);
      // kleurband via border-image met fill (bijv. een kop die over de hele schermbreedte doorloopt)
      if (/fill/.test(s.borderImageSlice)) {
        const rand = gradientKleur(s.borderImageSource, 0);
        if (rand && rand.a >= 0.99) { basis = { ...rand, a: 1 }; break; }
      }
      if (el.tagName === 'IMG') {
        basis = fotoKleur(el, vak, y, s.objectFit, positie(s.objectPosition, 0), positie(s.objectPosition, 1));
        if (basis === 'laden') return null; // foto nog niet geladen: later opnieuw meten
        basis = basis || DONKER;
        break;
      }
      if (el.tagName === 'VIDEO' || el.tagName === 'CANVAS' || el.tagName === 'IFRAME') { basis = DONKER; break; }
      const url = s.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
      // gradients die vóór de foto staan liggen eroverheen
      const voorFoto = url ? s.backgroundImage.slice(0, s.backgroundImage.indexOf('url(')) : s.backgroundImage;
      const g = gradientKleur(voorFoto, t);
      if (g && g.a > 0) {
        if (g.a >= 0.99) { basis = { ...g, a: 1 }; break; }
        lagen.push(g);
      }
      if (url) {
        const maat = s.backgroundSize.split(',')[0].trim();
        const pos = s.backgroundPosition.split(',')[0].trim();
        basis = fotoKleur(laadBeeld(url[1]), vak, y, maat === 'contain' ? 'contain' : 'cover', positie(pos, 0), positie(pos, 1));
        if (basis === 'laden') return null;
        basis = basis || parse(s.backgroundColor) || DONKER;
        if (basis.a < 1) basis = DONKER;
        break;
      }
      const k = parse(s.backgroundColor);
      if (k && k.a > 0) {
        if (k.a >= 0.99) { basis = { ...k, a: 1 }; break; }
        lagen.push(k);
      }
    }
    let kleur = basis || parse(getComputedStyle(doc).backgroundColor) || WIT;
    if (kleur.a < 1) kleur = WIT;
    for (let i = lagen.length - 1; i >= 0; i--) kleur = over(lagen[i], kleur);
    return kleur;
  };

  // 3. Vast strookje onderaan (alleen zichtbaar onderaan de pagina): Safari neemt de kleur van een vast element
  //    aan de onderrand over. Het steekt 4px het scherm in, onder de balk van Safari.
  const strookOnder = document.createElement('div');
  strookOnder.id = 'safari-balk-onder';
  strookOnder.setAttribute('aria-hidden', 'true');
  strookOnder.style.cssText = 'display:none;position:fixed;left:0;right:0;bottom:-8px;width:100%;height:12px;pointer-events:none;z-index:2147483646';
  // GEEN vast strookje bovenaan: Safari tekent bij een vast element aan de bovenrand een dichte balk zonder het
  // zachte verloop van de pagina erachter (Bart, 28-10: "de fade is weg, nu een donkere lijn"). Zonder vast element
  // volgt de bovenbalk de html-achtergrond; die houden we daarom ALTIJD in de bovenkleur (ook onderaan de pagina),
  // dan springt hij nooit. De onderbalk komt alleen van het vaste strookje onderaan.
  // extra ruimte onder het laatste blok (in zijn eigen achtergrond), zodat de laatste tekst niet achter de Safari-balk valt
  const stijl = document.createElement('style');
  stijl.textContent = '@media (max-width:760px) and (pointer:coarse){[data-safari-laatste]{padding-bottom:calc(var(--safari-pb,0px) + 56px + env(safe-area-inset-bottom)) !important}}';
  head.appendChild(stijl);
  const laatsteBlok = () => [...document.body.children].reverse().find((el) => {
    if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|LINK|META)$/.test(el.tagName) || eigen(el) || el.hidden) return false;
    const s = getComputedStyle(el);
    return s.position !== 'fixed' && s.display !== 'none' && el.getBoundingClientRect().height > 0;
  });

  // 4. Bijna-dekkende vaste/sticky kop helemaal dekkend maken (anders kleurt de bovenste balk verkeerd mee)
  const kopDekkend = () => {
    document.querySelectorAll('body *').forEach((el) => {
      if (eigen(el)) return;
      const s = getComputedStyle(el);
      if (s.position !== 'fixed' && s.position !== 'sticky') return;
      const r = el.getBoundingClientRect();
      if (r.top > 4 || r.bottom < 0 || r.width < innerWidth * 0.8 || r.height < 3) return;
      const k = parse(s.backgroundColor);
      if (k && k.a >= 0.8 && k.a < 1) {
        el.style.backgroundColor = hex(k);
        el.style.backdropFilter = 'none';
        el.style.webkitBackdropFilter = 'none';
      }
    });
  };

  // Bovenbalk: theme-color + html-achtergrond, altijd in de kleur van de bovenrand van de pagina.
  // Onderbalk: alleen het vaste strookje onderaan, onderaan de pagina in de kleur van het laatste blok.
  // Zo veranderen boven en onder los van elkaar en springt de bovenbalk niet meer als je onderaan komt.
  let kleurBoven = (thema.getAttribute('content') || '').trim(); // beginkleur uit de <head>
  const zetBoven = (kleur) => {
    if (!kleur) return;
    if (thema.getAttribute('content') !== kleur) thema.setAttribute('content', kleur);
    if (doc.style.backgroundColor !== kleur) doc.style.backgroundColor = kleur;
  };
  const vastBovenaan = (x) => {
    // een vaste/sticky kop of open menu bovenin: dan bepaalt dat element de bovenkleur
    const el = document.elementsFromPoint(x, 4).find((e) => !eigen(e));
    if (!el) return false;
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const p = getComputedStyle(e).position;
      if (p === 'fixed' || p === 'sticky') return true;
    }
    return false;
  };
  const meet = () => {
    const x = innerWidth / 2;
    const onder = innerHeight + scrollY >= doc.scrollHeight - 160;

    // boven: alleen meten helemaal bovenaan de pagina, of als er een vaste kop/menu bovenin staat
    const vast = vastBovenaan(x);
    if (scrollY <= 2 || vast) {
      const k = kleurOp(x, 4);
      if (k) {
        if (!vast) kleurBoven = hex(k);
        zetBoven(hex(k));
      }
    } else {
      zetBoven(kleurBoven);
    }

    // onder: alleen onderaan de pagina de kleur van het laatste blok. Alleen op aanraakschermen: op een computer
    // is er geen Safari-balk onderin en was het strookje zichtbaar als witte rand onder een donker zijmenu (Harmonature 03-11).
    if (onder && matchMedia('(pointer:coarse)').matches) {
      const k = kleurOp(x, innerHeight - 2);
      if (k) {
        const kleur = hex(k);
        strookOnder.style.backgroundColor = kleur;
        strookOnder.style.display = 'block';
      }
    } else {
      strookOnder.style.display = 'none';
    }
  };
  let gepland = false;
  const bijwerken = () => {
    if (gepland) return;
    gepland = true;
    requestAnimationFrame(() => { gepland = false; meet(); });
  };
  let wacht = 0;
  const straks = () => {
    clearTimeout(wacht);
    wacht = setTimeout(bijwerken, 80);
    setTimeout(bijwerken, 450);
  };

  const start = () => {
    // blokken zonder eigen achtergrond houden de oude paginakleur (anders nemen ze de onderkleur over)
    const bodyKleur = parse(getComputedStyle(document.body).backgroundColor);
    const htmlKleur = parse(getComputedStyle(doc).backgroundColor);
    const basis = bodyKleur && bodyKleur.a > 0 ? hex(bodyKleur) : htmlKleur && htmlKleur.a > 0 ? hex(htmlKleur) : '#ffffff';
    [...document.body.children].forEach((el) => {
      if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|LINK|META)$/.test(el.tagName)) return;
      const s = getComputedStyle(el);
      if (s.position === 'fixed' || s.position === 'absolute') return;
      const k = parse(s.backgroundColor);
      if ((!k || k.a === 0) && s.backgroundImage === 'none') el.style.backgroundColor = basis;
    });
    document.body.style.backgroundColor = 'transparent';
    const laatste = laatsteBlok();
    if (laatste) {
      laatste.style.setProperty('--safari-pb', getComputedStyle(laatste).paddingBottom);
      laatste.setAttribute('data-safari-laatste', '');
    }
    document.body.appendChild(strookOnder);
    kopDekkend();
    meet();
    addEventListener('scroll', bijwerken, { passive: true });
    addEventListener('resize', () => { kopDekkend(); straks(); });
    addEventListener('load', () => { kopDekkend(); bijwerken(); });
    // na een klik (menu open/dicht, tabbladen) en na animaties opnieuw meten
    document.addEventListener('click', straks, true);
    document.addEventListener('transitionend', straks, true);
    // foto's die later laden (lazy loading) opnieuw meten
    document.addEventListener('load', (e) => { if (e.target.tagName === 'IMG') bijwerken(); }, true);
    setTimeout(bijwerken, 600);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
