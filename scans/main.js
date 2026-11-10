// PVF Scan page: deep-zoom lens, timelines of rooms through time, "how it works" tabs.
(() => {
  const V = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- deep-zoom lens over the hero scan ----------
  document.querySelectorAll('[data-zoom]').forEach((z) => {
    const img = z.querySelector('img'); const lens = z.querySelector('.zoom-lens');
    lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    const K = 6; // magnification over the shown image
    const move = (e) => {
      const r = z.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - r.left, 0), r.width); const y = Math.min(Math.max(e.clientY - r.top, 0), r.height);
      const s = lens.offsetWidth;
      lens.style.transform = `translate(${x - s / 2}px, ${y - s / 2}px)`;
      lens.style.backgroundSize = `${r.width * K}px ${r.height * K}px`;
      lens.style.backgroundPosition = `${-(x * K - s / 2)}px ${-(y * K - s / 2)}px`;
    };
    z.addEventListener('pointerenter', (e) => { z.classList.add('on'); move(e); });
    z.addEventListener('pointermove', move);
    z.addEventListener('pointerleave', () => z.classList.remove('on'));
    z.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { z.classList.add('on'); z.setPointerCapture(e.pointerId); move(e); } });
    z.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') z.classList.remove('on'); });
    z.addEventListener('pointercancel', () => z.classList.remove('on'));
  });
  document.querySelectorAll('.lp-hi').forEach((e) => { e.style.backgroundImage = `url(assets/scan/scan.jpg?v=${V})`; });
  document.querySelectorAll('.lp-lo').forEach((e) => { e.style.backgroundImage = `url(assets/scan/photo.jpg?v=${V})`; });

  // ---------- a room through time: each period is one 3D scan seen from 6 angles ----------
  const VIEWS = 6;
  const PERIODS = {
    hall: [
      { set: 'a', who: 'Soft Matter', what: 'group show, painting and textile', from: 'Mar 2026', to: 'May 2026', color: 'orange', phases: [] },
      { set: 'b', who: 'Open Signal', what: 'photography and light', from: 'Jun 2026', to: 'Aug 2026', color: 'lime', phases: [] },
      { set: 'c', who: 'Night Garden', what: 'installation and video', from: 'Sep 2026', to: 'Nov 2026', color: 'sky', phases: [] },
    ],
    studio: [
      { set: 'a', who: 'Studio 4, empty', what: 'between residencies', from: 'Jan 2026', to: 'Feb 2026', color: 'mute', phases: ['Scanned empty', 'Open for applications', 'Visits by applicants'] },
      { set: 'b', who: 'Nino K.', what: 'painter in residence', from: 'Mar 2026', to: 'Aug 2026', color: 'orange', phases: ['Move-in', 'First works', 'Work in progress', 'Preparing the show', 'Open studio', 'Move-out'] },
      { set: 'c', who: 'Luka B.', what: 'sculptor in residence', from: 'Sep 2026', to: 'Feb 2027', color: 'sky', phases: ['Move-in', 'Casting', 'Work in progress', 'Preparing the show', 'Open studio', 'Move-out'] },
    ],
  };
  const short = (a, b) => {
    const [m1, y1] = a.split(' '); const [m2, y2] = b.split(' ');
    return y1 === y2 ? `${m1}–${m2} ${y2.slice(2)}` : `${m1} ${y1.slice(2)} – ${m2} ${y2.slice(2)}`;
  };
  document.querySelectorAll('[data-otl]').forEach((fig) => {
    const id = fig.dataset.otl; const periods = PERIODS[id]; const steps = periods.length * VIEWS;
    const label = id === 'hall' ? 'hall' : 'studio';
    fig.insertAdjacentHTML('afterbegin', `<div class=otl>
      <div class=otl-view>
        ${periods.map((p) => Array.from({ length: VIEWS }, (_, k) => `<img class=otl-img data-p=${p.set} data-k=${k} src="assets/orbit/${id}-${p.set}-${k + 1}.jpg?v=${V}" alt="" width=600 height=512 ${k || p.set !== 'a' ? 'loading=lazy ' : ''}decoding=async>`).join('')).join('')}
        <p class=otl-scan>3D scan · view <b>1</b> / ${VIEWS}</p>
        <button type=button class="otl-nav prev" aria-label="Back in time"><svg viewBox="0 0 10 10" width=10 height=10 aria-hidden=true><path d="M7 1 L2 5 L7 9 Z"/></svg></button>
        <button type=button class="otl-nav next" aria-label="Forward in time"><svg viewBox="0 0 10 10" width=10 height=10 aria-hidden=true><path d="M3 1 L8 5 L3 9 Z"/></svg></button>
      </div>
      <div class=otl-now><b class=otl-who></b><span class=otl-what></span><span class=otl-dates></span><span class=otl-phase></span></div>
      <div class=otl-bar>
        <div class=otl-segs>${periods.map((p) => `<div class=otl-seg style="--c:var(--${p.color})"><span class=otl-name>${esc(p.who)}</span><span class=otl-d>${esc(p.from)} – ${esc(p.to)}</span><span class=otl-ds>${esc(short(p.from, p.to))}</span>
          <span class=otl-phs>${p.phases.map((x) => `<i title="${esc(x)}"></i>`).join('')}</span></div>`).join('')}</div>
        <input class=otl-r type=range min=0 max=${steps - 1} step=1 value=0 aria-label="Move the ${label} through time">
      </div>
    </div>`);
    const t = fig.querySelector('.otl'); const r = t.querySelector('.otl-r');
    const set = () => {
      const i = Number(r.value); const p = periods[Math.floor(i / VIEWS)]; const k = i % VIEWS;
      const phase = p.phases.length ? p.phases[Math.min(p.phases.length - 1, Math.floor(k * p.phases.length / VIEWS))] : '';
      t.querySelectorAll('.otl-img').forEach((img) => img.classList.toggle('on', img.dataset.p === p.set && Number(img.dataset.k) === k));
      t.querySelector('.otl-scan b').textContent = k + 1;
      t.querySelector('.otl-who').textContent = p.who;
      t.querySelector('.otl-what').textContent = p.what;
      t.querySelector('.otl-dates').textContent = `${p.from} – ${p.to}`;
      t.querySelector('.otl-phase').textContent = phase;
      t.querySelector('.otl-phase').hidden = !phase;
      t.style.setProperty('--pc', `var(--${p.color})`);
      t.querySelectorAll('.otl-seg').forEach((sg, j) => sg.classList.toggle('on', j === Math.floor(i / VIEWS)));
      t.querySelector('.prev').disabled = i === 0;
      t.querySelector('.next').disabled = i === Number(r.max);
    };
    r.addEventListener('input', set);
    t.querySelector('.prev').addEventListener('click', () => { r.value = Math.max(0, Number(r.value) - 1); set(); });
    t.querySelector('.next').addEventListener('click', () => { r.value = Math.min(Number(r.max), Number(r.value) + 1); set(); });
    // drag on the picture turns the scan
    const view = t.querySelector('.otl-view'); let dx = null;
    view.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; dx = { x: e.clientX, v: Number(r.value) }; view.setPointerCapture(e.pointerId); });
    view.addEventListener('pointermove', (e) => {
      if (!dx) return;
      const n = Math.max(0, Math.min(Number(r.max), dx.v + Math.round((e.clientX - dx.x) / 40)));
      if (n !== Number(r.value)) { r.value = n; set(); }
    });
    const end = () => { dx = null; };
    view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);
    set();
  });

  // ---------- how it works ----------
  const st = (ic, h, p) => ({ ic, h, p });
  const HOW = [
    [st(1, 'Light it evenly', 'Two lights at 45° to the work, no direct sun. A colour card next to the work in the first frame.'),
      st(2, 'Shoot close, in a grid', 'Camera parallel to the work, 10–20 frames in rows with about 60% overlap, every frame in focus.'),
      st(3, 'Upload', 'Over Wi-Fi in the residence straight to the scan server, or from home in the member account.'),
      st(4, 'Processing', 'Up to about an hour of computer time per work, in the night queue or at once.'),
      st(5, 'On the site', 'Deep zoom on the artwork page, real size in centimetres, previews for cards and the catalogue.')],
    [st(6, 'Soft light all around', 'No hard shadows. The object on a turntable, or walk around it.'),
      st(7, 'Shoot in rings', '60–100 frames in 2–3 rings at different heights, each frame overlapping the next.'),
      st(8, 'Upload', 'The same way as flat works.'),
      st(9, 'Processing', 'The photos become a 3D scene with Gaussian Splatting; a turntable and hero angles are rendered from it.'),
      st(10, 'On the site', 'A 3D view on the artwork page; the renders go to cards and the catalogue.')],
    [st(6, 'Even light', 'Gallery or studio lights on, no hard sun patches; a drone flies the park on a calm, overcast day.'),
      st(7, 'Walk the room', '300–500 photos along the walls and through the middle, every surface seen twice.'),
      st(3, 'Upload', 'The whole set goes to the scan server from the residence.'),
      st(4, 'Processing', 'About 3 hours of computer time per room, in the night queue or at once.'),
      st(10, 'On the site', 'A 3D visit on the studio or exhibition page, with the works in it as points.')],
    [st(11, 'Scan again', 'At each stage of a work, before every show closes, when an artist moves in and leaves.'),
      st(12, 'Aligned for you', 'Each new scan is matched to the previous one, so nothing jumps between stages.'),
      st(13, 'Timeline', 'A slider on the page moves through every stage, with its date and name.')],
  ];
  const hw = document.querySelector('.hw'); const tabs = [...document.querySelectorAll('.fmts [data-f]')];
  const showHow = (i) => {
    tabs.forEach((b, j) => b.setAttribute('aria-selected', String(i === j)));
    hw.innerHTML = HOW[i].map((s, n) => `<li><span class=hw-n>${n + 1}</span><img src="assets/icons/icon-${String(s.ic).padStart(2, '0')}.png?v=${V}" alt="" width=160 height=100><h3>${s.h}</h3><p>${s.p}</p></li>`).join('');
    hw.classList.toggle('three', HOW[i].length === 3);
    if (!reduce) { hw.classList.remove('in'); void hw.offsetWidth; hw.classList.add('in'); }
  };
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => showHow(i));
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const j = (i + d + tabs.length) % tabs.length; tabs[j].focus(); showHow(j);
    });
  });
  showHow(0);
})();
