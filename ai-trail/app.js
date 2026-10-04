'use strict';

// Настройки
const CONFIG = {
    // Webhook для результатов уроков (Make.com → Custom Webhook → Google Sheets).
    // Пусто — результаты никуда не отправляются, прогресс живёт только в браузере.
    resultsWebhook: '',
    storageKey: 'bloop-trail-v1',
    // Профиль из кабинета школы (тот же домен на GitHub Pages): берём оттуда имя
    cabinetKey: 'bloop-cabinet-v1'
};

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const esc = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const pick = list => list[Math.floor(Math.random() * list.length)];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// plural(5, 'задание', 'задания', 'заданий') → 'заданий'
function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
}

// Блуп — это Бобик из bobik.js в палитре peach (переменные --rb-* в style.css)
const blup = pose => bob(STATES[pose] || STATES.neutral).replace(/<title>[^<]*<\/title>/, '');

const GOOD = ['Точно!', 'В яблочко!', 'Огонь!', 'Красиво!', 'Мозг на максималках!', 'Так держать!'];
const BAD = ['Почти!', 'Не совсем', 'Мимо, но не страшно'];
const LETTERS = 'АБВГД';

// ---------- Звуки: короткие тоны WebAudio, без файлов ----------
const Sound = {
    on: true,
    ctx: null,
    LIB: {
        tap:  [[660, 0, .05, 'sine', .04]],
        good: [[784, 0, .1], [1175, .09, .18]],
        bad:  [[220, 0, .14, 'square', .03], [175, .12, .2, 'square', .03]],
        pop:  [[880, 0, .06], [1320, .05, .1]],
        star: [[1046, 0, .12], [1568, .08, .22]],
        win:  [[523, 0, .12], [659, .1, .12], [784, .2, .12], [1046, .3, .35]],
        step: [[320, 0, .04, 'triangle', .03]]
    },
    play(name) {
        if (!this.on) return;
        try {
            this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const t = this.ctx.currentTime;
            (this.LIB[name] || []).forEach(([freq, at, dur, type = 'sine', vol = .07]) => {
                const o = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                o.type = type;
                o.frequency.value = freq;
                g.gain.setValueAtTime(.0001, t + at);
                g.gain.exponentialRampToValueAtTime(vol, t + at + .01);
                g.gain.exponentialRampToValueAtTime(.0001, t + at + dur);
                o.connect(g).connect(this.ctx.destination);
                o.start(t + at);
                o.stop(t + at + dur + .02);
            });
        } catch (e) { /* звук недоступен — просто молчим */ }
    }
};

// ---------- Лес: плоские деревья в стиле Бобика, цвета из токенов ----------
const Forest = {
    rng(seed) {
        return () => {
            seed = (seed + 0x6D2B79F5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    },
    n: v => Math.round(v * 10) / 10,
    shadow(x, y, rx) { return `<ellipse class="sd" cx="${x}" cy="${y}" rx="${this.n(rx)}" ry="${this.n(rx * .25)}"/>`; },
    pine(x, y, s) {
        const n = this.n.bind(this);
        const tier = (w, base, top, cls) => `<polygon class="${cls}" points="${n(x - s * w)},${n(y - s * base)} ${n(x + s * w)},${n(y - s * base)} ${n(x)},${n(y - s * top)}"/>`;
        return this.shadow(x, y, s * .4) +
            `<rect class="tk" x="${n(x - s * .07)}" y="${n(y - s * .24)}" width="${n(s * .14)}" height="${n(s * .25)}"/>` +
            tier(.5, .2, .8, 't2') + tier(.4, .5, 1.05, 't2') + tier(.3, .78, 1.3, 't1');
    },
    round(x, y, s) {
        const n = this.n.bind(this);
        return this.shadow(x, y, s * .38) +
            `<rect class="tk" x="${n(x - s * .08)}" y="${n(y - s * .5)}" width="${n(s * .16)}" height="${n(s * .52)}" rx="${n(s * .06)}"/>` +
            `<circle class="t1" cx="${x}" cy="${n(y - s * .75)}" r="${n(s * .42)}"/>` +
            `<circle class="t3" cx="${n(x - s * .13)}" cy="${n(y - s * .88)}" r="${n(s * .17)}"/>`;
    },
    bush(x, y, s) {
        const n = this.n.bind(this);
        return this.shadow(x, y, s * .6) +
            `<circle class="t2" cx="${n(x - s * .3)}" cy="${n(y - s * .3)}" r="${n(s * .32)}"/>` +
            `<circle class="t2" cx="${n(x + s * .3)}" cy="${n(y - s * .3)}" r="${n(s * .32)}"/>` +
            `<circle class="t1" cx="${x}" cy="${n(y - s * .45)}" r="${n(s * .4)}"/>`;
    },
    mushroom(x, y, s) {
        const n = this.n.bind(this);
        return this.shadow(x, y, s * .5) +
            `<rect class="dt" x="${n(x - s * .18)}" y="${n(y - s * .62)}" width="${n(s * .36)}" height="${n(s * .62)}" rx="${n(s * .12)}"/>` +
            `<path class="cp" d="M${n(x - s * .62)} ${n(y - s * .55)} Q${x} ${n(y - s * 1.55)} ${n(x + s * .62)} ${n(y - s * .55)} Z"/>` +
            `<circle class="dt" cx="${n(x - s * .2)}" cy="${n(y - s * .82)}" r="${n(s * .1)}"/>` +
            `<circle class="dt" cx="${n(x + s * .2)}" cy="${n(y - s * .74)}" r="${n(s * .08)}"/>`;
    },
    flower(x, y, s) {
        const n = this.n.bind(this), cy = y - s * .5;
        return [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy]) =>
            `<circle class="fl" cx="${n(x + dx * s * .32)}" cy="${n(cy + dy * s * .32)}" r="${n(s * .3)}"/>`).join('') +
            `<circle class="fc" cx="${x}" cy="${n(cy)}" r="${n(s * .22)}"/>`;
    },
    // Набор деревьев для каждой зоны: [тип, вес, мин. размер, макс. размер]
    MIX: [
        [['round', 4, 30, 44], ['pine', 2, 30, 44], ['bush', 2, 18, 28], ['mushroom', 1, 10, 14], ['flower', 2, 7, 10]],
        [['pine', 7, 32, 48], ['round', 1, 30, 40], ['bush', 2, 18, 26], ['mushroom', 2, 10, 14]],
        [['round', 3, 30, 42], ['flower', 4, 7, 10], ['bush', 2, 18, 26], ['mushroom', 1, 10, 13], ['pine', 1, 30, 40]]
    ],
    pickType(mix, r) {
        const total = mix.reduce((s, m) => s + m[1], 0);
        let v = r() * total;
        for (const m of mix) { v -= m[1]; if (v <= 0) return m; }
        return mix[0];
    }
};

// ---------- Геометрия карты ----------
const MAP = { W: 360, GATE_GAP: 110, STEP: 140, XS: [100, 260] };

function cubicPoint(a, b, t) {
    const dy = (b.y - a.y) / 2;
    const p = [a, { x: a.x, y: a.y + dy }, { x: b.x, y: b.y - dy }, b];
    const u = 1 - t;
    return {
        x: u * u * u * p[0].x + 3 * u * u * t * p[1].x + 3 * u * t * t * p[2].x + t * t * t * p[3].x,
        y: u * u * u * p[0].y + 3 * u * u * t * p[1].y + 3 * u * t * t * p[2].y + t * t * t * p[3].y
    };
}

function segmentD(a, b) {
    const dy = (b.y - a.y) / 2;
    return ` C${a.x} ${a.y + dy} ${b.x} ${b.y - dy} ${b.x} ${b.y}`;
}

function buildLayout() {
    const pts = [{ x: 180, y: 0 }];
    const gates = [], nodes = [], zones = [];
    let y = 80, k = 0, playable = 0;

    COURSE.blocks.forEach((block, bi) => {
        gates.push({ x: 180, y, block, bi, pt: pts.length });
        zones.push({ bi, top: bi === 0 ? 0 : y - 70, soon: !!block.soon });
        pts.push({ x: 180, y });
        block.lessons.forEach((lesson, li) => {
            y += li === 0 ? MAP.GATE_GAP : MAP.STEP;
            const node = {
                x: MAP.XS[k % 2], y, block, bi, lesson, li,
                soon: !!block.soon, big: !!lesson.test,
                index: block.soon ? -1 : playable++, pt: pts.length
            };
            nodes.push(node);
            pts.push({ x: node.x, y });
            k++;
        });
        y += MAP.GATE_GAP;
    });

    const end = { x: 180, y: y + 10 };
    pts.push(end);
    const H = end.y + 70;
    zones.forEach((z, i) => { z.bottom = i + 1 < zones.length ? zones[i + 1].top + 14 : H; });

    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += segmentD(pts[i - 1], pts[i]);

    return { W: MAP.W, H, pts, gates, nodes, zones, end, d };
}

// Деревья вокруг тропы: не на тропе, не под подписями и воротами
function scatterTrees(L) {
    const r = Forest.rng(20261004);
    const samples = [];
    for (let i = 1; i < L.pts.length; i++) {
        for (let t = 0; t <= 1; t += .08) samples.push(cubicPoint(L.pts[i - 1], L.pts[i], t));
    }
    const boxes = [];
    L.nodes.forEach(n => {
        const left = n.x > 180;
        boxes.push({ x1: left ? 6 : n.x + 36, x2: left ? n.x - 36 : 354, y1: n.y - 40, y2: n.y + 40 });
        boxes.push({ x1: n.x - 46, x2: n.x + 46, y1: n.y - 46, y2: n.y + 50 });
    });
    L.gates.forEach(g => boxes.push({ x1: 40, x2: 320, y1: g.y - 52, y2: g.y + 52 }));

    const trees = [];
    for (let i = 0; i < 1400 && trees.length < L.H / 9; i++) {
        const x = 8 + r() * (L.W - 16);
        const y = 30 + r() * (L.H - 40);
        const zone = L.zones.find(z => y >= z.top && y < z.bottom) || L.zones[0];
        const [type, , min, max] = Forest.pickType(Forest.MIX[zone.bi % Forest.MIX.length], r);
        const s = min + r() * (max - min);
        const reach = Math.max(14, s * .45);
        if (samples.some(p => Math.hypot(p.x - x, p.y - y) < 22 + reach)) continue;
        if (boxes.some(b => x + reach > b.x1 && x - reach < b.x2 && y > b.y1 && y - s < b.y2)) continue;
        if (trees.some(t => Math.hypot(t.x - x, t.y - y) < (t.s + s) * .35)) continue;
        trees.push({ type, x: Math.round(x), y: Math.round(y), s });
    }
    return trees.sort((a, b) => a.y - b.y);
}

function mapSvg(L) {
    const { W, H } = L;
    const wave = top => {
        let d = `M0 ${top + 12}`;
        for (let x = 0; x < W; x += 60) d += ` Q${x + 30} ${top - 6} ${x + 60} ${top + 12}`;
        return d;
    };
    const grounds = L.zones.map(z => z.bi === 0
        ? `<rect class="z1" x="0" y="0" width="${W}" height="${z.bottom}"/>`
        : `<path class="z${(z.bi % 3) + 1}" d="${wave(z.top)} V${z.bottom} H0 Z"/>`).join('');
    const trees = scatterTrees(L).map(t => Forest[t.type](t.x, t.y, t.s)).join('');
    const fog = L.zones.filter(z => z.soon).map(z => `<path class="fog" d="${wave(z.top)} V${z.bottom} H0 Z"/>`).join('');

    const r = Forest.rng(7);
    let flies = '';
    for (let i = 0; i < Math.round(H / 60); i++) {
        flies += `<circle cx="${Math.round(10 + r() * (W - 20))}" cy="${Math.round(20 + r() * (H - 40))}" r="2.2" style="animation-delay:${(r() * 3).toFixed(2)}s"/>`;
    }

    return `<svg class="map__svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">
        ${grounds}
        <path class="trail-edge" d="${L.d}"/>
        <path class="trail" id="trail" d="${L.d}"/>
        <path class="trail-steps" d="${L.d}"/>
        <path class="trail-done" id="trail-done" d="${L.d}"/>
        ${trees}${fog}
        <g class="fireflies">${flies}</g>
    </svg>`;
}

const KIND = { cards: 'theory', video: 'video', quiz: 'test', sort: 'practice', build: 'practice', spot: 'practice', poll: 'practice', mission: 'practice' };
const KIND_LABEL = { theory: '📖 Теория', video: '🎬 Ролик', practice: '🧩 Практика', test: '✅ Тест' };

// ---------- Приложение ----------
const app = {
    state: null,
    run: null,
    layout: null,
    lenAt: [],
    confettiParts: [],

    init() {
        document.head.insertAdjacentHTML('beforeend', '<style>' + CSS + '</style>');
        this.state = this.load();
        Sound.on = this.state.sound;
        $('#brand-blup').innerHTML = blup('neutral');
        this.bind();
        this.renderAll();
        this.scrollToCurrent(false);
        if (!this.state.name) this.openHello();
    },

    // ---------- Хранилище ----------
    load() {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(CONFIG.storageKey)); } catch (e) { /* нет доступа — начинаем с нуля */ }
        const state = Object.assign(Game.newState(), saved || {});
        if (!state.name) {
            try {
                const cabinet = JSON.parse(localStorage.getItem(CONFIG.cabinetKey));
                if (cabinet && cabinet.name) this.suggestedName = cabinet.name;
            } catch (e) { /* профиля кабинета нет */ }
        }
        return state;
    },

    save() {
        try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.state)); } catch (e) { /* без хранилища прогресс живёт до перезагрузки */ }
    },

    // ---------- Карта ----------
    renderAll() {
        this.renderTopbar();
        this.renderHello();
        this.renderMap();
    },

    renderTopbar() {
        const t = Game.totals(this.state);
        const set = (id, value) => {
            const el = $(id);
            if (el.textContent !== String(value)) {
                el.textContent = value;
                const pill = el.closest('.pill');
                pill.classList.remove('is-bump');
                void pill.offsetWidth;
                pill.classList.add('is-bump');
            }
        };
        set('#stat-streak', Game.currentStreak(this.state));
        set('#stat-stars', t.stars);
        set('#stat-xp', this.state.xp);
        const btn = $('#sound-btn');
        btn.textContent = this.state.sound ? '🔊' : '🔇';
        btn.setAttribute('aria-label', this.state.sound ? 'Выключить звук' : 'Включить звук');
    },

    renderHello() {
        const s = this.state;
        const lv = Game.levelFor(s.xp);
        const list = Game.stations();
        const st = list[Game.currentIndex(s)];
        const t = Game.totals(s);
        const resume = s.current && Game.findStation(s.current.lessonId);

        $('#hello-title').textContent = s.name ? `Привет, ${s.name}!` : 'Привет!';
        $('#hello-kicker').textContent = `Блок ${st.blockIndex + 1} · ${st.block.title} · ${t.lessonsDone} из ${list.length} станций`;
        $('#level-name').textContent = `Уровень ${lv.level} · ${lv.title}`;
        $('#level-xp').textContent = lv.to ? `${s.xp} / ${lv.to} XP` : `${s.xp} XP`;
        $('#level-fill').style.width = Math.round(lv.progress * 100) + '%';
        $('#level-bar').setAttribute('aria-valuenow', String(Math.round(lv.progress * 100)));

        const btn = $('#continue-btn');
        if (resume) btn.textContent = `Продолжить: ${resume.lesson.title}`;
        else if (t.lessonsDone === list.length) btn.textContent = 'Блок пройден 🌳';
        else btn.textContent = (t.lessonsDone ? 'Дальше: ' : 'Начать: ') + st.lesson.title;
    },

    renderMap() {
        const L = this.layout = buildLayout();
        const s = this.state;
        const cur = Game.currentIndex(s);
        const pct = (v, total) => (v / total * 100).toFixed(3) + '%';

        const gates = L.gates.map(g => {
            const done = g.block.soon ? 0 : g.block.lessons.filter(l => Game.passed(s, l.id)).length;
            const kicker = g.block.soon ? `Блок ${g.bi + 1} · скоро` : `Блок ${g.bi + 1} · ${done}/${g.block.lessons.length}`;
            return `<div class="gate${g.block.soon ? ' gate--soon' : ''}" style="left:${pct(g.x, L.W)};top:${pct(g.y, L.H)}">
                <div class="gate__plank">
                    <p class="gate__kicker">${kicker}</p>
                    <h2 class="gate__title">${esc(g.block.title)}</h2>
                    <p class="gate__sub">${esc(g.block.subtitle)}</p>
                </div>
            </div>`;
        }).join('');

        const nodes = L.nodes.map((n, i) => {
            const status = this.nodeStatus(n, cur);
            const rec = n.index >= 0 ? s.lessons[n.lesson.id] : null;
            const resume = s.current && s.current.lessonId === n.lesson.id;
            const left = n.x > 180;
            const off = n.big ? 50 : 44;
            const side = left ? `right:${pct(L.W - n.x + off, L.W)}` : `left:${pct(n.x + off, L.W)}`;
            const kicker = n.lesson.test ? 'Финал блока' : `Станция ${n.li + 1}`;
            let meta;
            if (status === 'soon') meta = 'скоро';
            else if (status === 'locked') meta = '🔒 закрыто';
            else if (status === 'done') meta = `<span class="label__stars">${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}</span> · пройдено`;
            else meta = resume ? '▶ продолжить' : `▶ ${n.lesson.minutes} мин · ${n.lesson.tasks.length} ${plural(n.lesson.tasks.length, 'задание', 'задания', 'заданий')}`;
            const icon = status === 'soon' ? '?' : n.lesson.icon;
            const name = `${kicker}: ${n.lesson.title}`;
            return `<button class="node node--${status}${n.big ? ' node--big' : ''}" type="button" data-node="${i}"
                    style="left:${pct(n.x, L.W)};top:${pct(n.y, L.H)}" aria-label="${esc(name)}">${icon}</button>
                <button class="label label--${status}${left ? ' label--left' : ''}" type="button" data-node="${i}" tabindex="-1"
                    style="${side};top:${pct(n.y, L.H)}" aria-hidden="true">
                    <span class="label__kicker">${kicker}</span>
                    <span class="label__title">${esc(n.lesson.title)}</span>
                    <span class="label__meta">${meta}</span>
                </button>`;
        }).join('');

        $('#map').innerHTML = mapSvg(L) + `<div class="map__layer">${gates}${nodes}
            <span class="finish" style="left:${pct(L.end.x, L.W)};top:${pct(L.end.y, L.H)}" aria-hidden="true">🏆</span>
            <div class="blup" id="blup"><div class="blup__body" id="blup-body"></div><span class="blup__bubble" id="blup-bubble" hidden></span></div>
        </div>`;

        this.measureTrail();
        const at = Math.min(s.blupAt || 0, cur);
        this.placeBlup(this.nodeByIndex(at), 'hello');
        this.setTrailDone(this.lenAt[this.nodeByIndex(at).pt]);
    },

    nodeStatus(n, cur) {
        if (n.soon) return 'soon';
        if (Game.passed(this.state, n.lesson.id)) return 'done';
        if (n.index === cur) return 'current';
        return Game.isUnlocked(this.state, n.index) ? 'open' : 'locked';
    },

    nodeByIndex(index) {
        return this.layout.nodes.find(n => n.index === index);
    },

    // Длина тропы до каждой точки — для анимации и золотой полосы пройденного пути
    measureTrail() {
        const L = this.layout;
        const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        $('#map svg').appendChild(probe);
        this.lenAt = [0];
        let d = `M${L.pts[0].x} ${L.pts[0].y}`;
        for (let i = 1; i < L.pts.length; i++) {
            d += segmentD(L.pts[i - 1], L.pts[i]);
            probe.setAttribute('d', d);
            this.lenAt.push(probe.getTotalLength());
        }
        probe.remove();
        this.trailTotal = this.lenAt[this.lenAt.length - 1];
    },

    setTrailDone(len) {
        $('#trail-done').style.strokeDasharray = `${len} ${this.trailTotal + 10}`;
    },

    // Блуп стоит сбоку от станции, со стороны края карты
    placeBlup(node, pose, bubble) {
        const outward = node.x < 180 ? -1 : 1;
        this.moveBlup(node.x + outward * (node.big ? 60 : 54), node.y + 6);
        const el = $('#blup');
        el.classList.toggle('is-left', outward > 0);
        el.classList.toggle('is-edge-right', outward > 0);
        $('#blup-body').innerHTML = blup(pose);
        $('#blup-bubble').hidden = !bubble;
        $('#blup-bubble').textContent = bubble || '';
    },

    moveBlup(x, y) {
        const el = $('#blup');
        el.style.left = (x / this.layout.W * 100) + '%';
        el.style.top = (y / this.layout.H * 100) + '%';
    },

    async walk(fromIndex, toIndex) {
        const a = this.nodeByIndex(fromIndex), b = this.nodeByIndex(toIndex);
        const target = $(`.node[data-node="${this.layout.nodes.indexOf(b)}"]`);
        target.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
        const La = this.lenAt[a.pt], Lb = this.lenAt[b.pt];

        if (!REDUCED) {
            await wait(500);
            const path = $('#trail');
            const el = $('#blup');
            $('#blup-body').innerHTML = blup('run');
            $('#blup-bubble').hidden = true;
            this.moveBlup(a.x, a.y);
            await wait(350);
            el.classList.add('is-walking');
            const dur = Math.min(2800, Math.max(1200, (Lb - La) * 6));
            await new Promise(resolve => {
                const t0 = performance.now();
                let lastX = a.x, lastStep = 0;
                const frame = now => {
                    const k = Math.min(1, (now - t0) / dur);
                    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
                    const len = La + (Lb - La) * e;
                    const p = path.getPointAtLength(len);
                    if (Math.abs(p.x - lastX) > .3) el.classList.toggle('is-left', p.x < lastX);
                    lastX = p.x;
                    this.moveBlup(p.x, p.y);
                    this.setTrailDone(len);
                    if (now - lastStep > 260) { Sound.play('step'); lastStep = now; }
                    if (k < 1) requestAnimationFrame(frame);
                    else resolve();
                };
                requestAnimationFrame(frame);
            });
            el.classList.remove('is-walking');
        }

        this.setTrailDone(Lb);
        this.placeBlup(b, 'victory', 'Новая станция!');
        target.classList.add('is-pop');
        Sound.play('pop');
        setTimeout(() => { if ($('#blup-body')) this.placeBlup(b, 'hello'); }, 1800);
    },

    scrollToCurrent(smooth) {
        const node = this.nodeByIndex(Game.currentIndex(this.state));
        const el = $(`.node[data-node="${this.layout.nodes.indexOf(node)}"]`);
        if (el && el.getBoundingClientRect().bottom > window.innerHeight - 40) {
            el.scrollIntoView({ block: 'center', behavior: smooth && !REDUCED ? 'smooth' : 'auto' });
        }
    },

    onNodeClick(n) {
        Sound.play('tap');
        if (n.soon) {
            this.toast(`«${n.block.title}» скоро откроется 🌱`);
            return;
        }
        if (!Game.isUnlocked(this.state, n.index)) {
            const prev = Game.stations()[n.index - 1].lesson;
            const el = $(`.node[data-node="${this.layout.nodes.indexOf(n)}"]`);
            el.classList.remove('is-shake');
            void el.offsetWidth;
            el.classList.add('is-shake');
            this.toast(`Сначала пройди «${prev.title}»`);
            return;
        }
        this.openStation(n);
    },

    openStation(n) {
        const lesson = n.lesson;
        const rec = this.state.lessons[lesson.id];
        const cur = this.state.current;
        const resume = cur && cur.lessonId === lesson.id && cur.step > 0;

        $('#station-icon').textContent = lesson.icon;
        $('#station-kicker').textContent = `Блок ${n.bi + 1} · ${lesson.test ? 'Финал блока' : 'Станция ' + (n.li + 1)}`;
        $('#station-title').textContent = lesson.title;
        $('#station-goal').textContent = lesson.goal;

        const counts = {};
        lesson.tasks.forEach(t => { const k = KIND[t.type]; counts[k] = (counts[k] || 0) + 1; });
        $('#station-chips').innerHTML = ['theory', 'video', 'practice', 'test'].filter(k => counts[k]).map(k =>
            `<li>${KIND_LABEL[k]}${k === 'test' ? ` · ${counts[k]} ${plural(counts[k], 'вопрос', 'вопроса', 'вопросов')}` : ''}</li>`).join('') +
            `<li>⏱ ${lesson.minutes} мин</li>`;

        $('#station-best').textContent = rec
            ? `Лучший результат: ${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)} · ${Math.round(rec.bestRatio * 100)}%`
            : `${lesson.tasks.length} ${plural(lesson.tasks.length, 'задание', 'задания', 'заданий')}. От 50% верных — станция пройдена.`;

        const start = $('#station-start');
        start.textContent = resume ? `Продолжить с задания ${cur.step + 1}` : rec ? 'Пройти ещё раз' : 'Начать';
        start.onclick = () => this.startLesson(lesson.id);
        const restart = $('#station-restart');
        restart.hidden = !resume;
        restart.onclick = () => this.startLesson(lesson.id, { fresh: true });

        $('#station-sheet').showModal();
    },

    // ---------- Урок ----------
    startLesson(lessonId, { fresh = false } = {}) {
        const st = Game.findStation(lessonId);
        const cur = this.state.current;
        const resume = !fresh && cur && cur.lessonId === lessonId && cur.step > 0 && cur.step < st.lesson.tasks.length;

        this.run = {
            st, lesson: st.lesson,
            step: resume ? cur.step : 0,
            scores: resume ? cur.scores.slice() : [],
            combo: 0, token: 0,
            startedAt: Date.now(),
            onNext: null
        };
        if (!resume) {
            this.state.current = { lessonId, step: 0, scores: [] };
            this.save();
        }

        $$('dialog[open]').forEach(d => d.close());
        $('#result').hidden = true;
        $('#lesson').hidden = false;
        document.body.classList.add('is-overlay');
        $('#combo').hidden = true;
        this.renderSteps();
        this.renderTask();
        if (resume) this.toast(`Продолжаем с задания ${cur.step + 1}`);
    },

    closeLesson() {
        this.run = null;
        $('#lesson').hidden = true;
        document.body.classList.remove('is-overlay');
        this.renderAll();
        this.toast('Прогресс сохранён, продолжишь с этого места');
    },

    renderSteps() {
        const r = this.run;
        $('#steps').innerHTML = r.lesson.tasks.map((t, i) => {
            if (i === r.step) return '<span class="is-now"></span>';
            if (i > r.step) return '<span></span>';
            const s = r.scores[i];
            if (typeof s !== 'number' || s === 1) return '<span class="is-done"></span>';
            return s === 0 ? '<span class="is-miss"></span>' : '<span class="is-part"></span>';
        }).join('');
    },

    renderTask() {
        const r = this.run;
        const t = r.lesson.tasks[r.step];
        r.token++;
        r.onNext = () => this.nextTask();
        $('#feedback').hidden = true;
        // иначе анимация «+XP» повторится, когда панель снова станет видимой
        $('#xp-pop').classList.remove('is-on');
        $('#skip-btn').hidden = true;
        const box = $('#task');
        box.innerHTML = '';
        box.style.animation = 'none';
        void box.offsetWidth;
        box.style.animation = '';
        $('.lesson__body').scrollTop = 0;
        this.setNext('Дальше', true);
        this.tasks[t.type].call(this, t, box, r.token);
    },

    setNext(text, enabled) {
        const btn = $('#next-btn');
        btn.textContent = text;
        btn.disabled = !enabled;
    },

    nextTask() {
        const r = this.run;
        r.step++;
        if (r.step >= r.lesson.tasks.length) {
            this.finishLesson();
            return;
        }
        this.state.current = { lessonId: r.lesson.id, step: r.step, scores: r.scores };
        this.save();
        this.renderSteps();
        this.renderTask();
    },

    // score: 0..1 у оцениваемых заданий, null — без оценки
    answered(score, { title, text }) {
        const r = this.run;
        r.scores[r.step] = score;
        let tone = 'info';
        if (typeof score === 'number') {
            r.combo = score === 1 ? r.combo + 1 : 0;
            tone = score >= .5 ? 'good' : 'bad';
            const xp = Math.round(XP_RULES.correct * score);
            if (xp > 0) this.xpPop(`+${xp} XP`);
            Sound.play(score === 1 ? 'good' : score >= .5 ? 'pop' : 'bad');
            if (r.combo >= XP_RULES.comboFrom && score === 1) title = `Серия ×${r.combo}! 🔥`;
            const combo = $('#combo');
            combo.hidden = r.combo < 2;
            $('b', combo).textContent = r.combo;
        } else {
            Sound.play('pop');
        }
        this.showFeedback(tone, title, text);
        this.setNext('Дальше', true);
    },

    showFeedback(tone, title, text) {
        const fb = $('#feedback');
        fb.className = 'feedback feedback--' + tone;
        fb.hidden = false;
        $('#feedback-blup').innerHTML = blup(tone === 'good' ? pick(['joy', 'delight', 'wink']) : tone === 'bad' ? 'sad' : 'idea');
        $('#feedback-title').textContent = title;
        $('#feedback-text').textContent = text || '';
    },

    xpPop(text) {
        const el = $('#xp-pop');
        el.textContent = text;
        el.classList.remove('is-on');
        void el.offsetWidth;
        el.classList.add('is-on');
    },

    head(kicker, title, text) {
        return `<p class="eyebrow task__kicker">${kicker}</p><h2 class="task__title">${esc(title)}</h2>` +
            (text ? `<p class="task__text">${esc(text)}</p>` : '');
    },

    // Отрисовка заданий по типам
    tasks: {
        cards(t, box) {
            let k = 0;
            const draw = () => {
                const c = t.cards[k];
                box.innerHTML = `<article class="card">
                    <div class="card__head">
                        <div class="card__bot" aria-hidden="true">${blup(c.pose)}</div>
                        <div>
                            ${c.kicker ? `<p class="eyebrow">${esc(c.kicker)}</p>` : ''}
                            <h2 class="card__title">${esc(c.title)}</h2>
                        </div>
                    </div>
                    ${c.big ? `<p class="card__big">${esc(c.big)}</p>` : ''}
                    ${c.chat ? `<div class="chat"><p class="bubble bubble--me"><span class="bubble__who">Промпт</span>${esc(c.chat)}</p></div>` : ''}
                    ${c.text ? `<p class="card__text">${esc(c.text)}</p>` : ''}
                    ${c.list ? `<ul class="card__list">${c.list.map(li => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}
                    ${c.reveal ? `<div class="reveal">
                        <button class="reveal__btn" type="button" aria-expanded="false">🤔 ${esc(c.reveal.q)} <u>Нажми</u></button>
                        <p class="reveal__answer" hidden>${esc(c.reveal.a)}</p>
                    </div>` : ''}
                    ${t.cards.length > 1 ? `<div class="card__dots" aria-hidden="true">${t.cards.map((_, i) => `<span class="${i === k ? 'is-on' : ''}"></span>`).join('')}</div>` : ''}
                </article>`;
                const rb = $('.reveal__btn', box);
                if (rb) rb.addEventListener('click', () => {
                    $('.reveal__answer', box).hidden = false;
                    rb.setAttribute('aria-expanded', 'true');
                    Sound.play('pop');
                });
                this.setNext(k < t.cards.length - 1 ? 'Дальше' : 'Понятно!', true);
            };
            this.run.onNext = () => {
                if (k < t.cards.length - 1) {
                    k++;
                    Sound.play('tap');
                    draw();
                    $('.lesson__body').scrollTop = 0;
                } else {
                    this.run.scores[this.run.step] = null;
                    this.nextTask();
                }
            };
            draw();
        },

        video(t, box, token) {
            const total = t.scenes.reduce((s, sc) => s + sc.sec, 0);
            const head = this.head(`🎬 Ролик · ${total} сек`, t.title);

            if (t.src) {
                box.innerHTML = head + `<div class="player"><video controls playsinline preload="metadata" src="${esc(t.src)}"></video></div>`;
                const v = $('video', box);
                this.setNext('Досмотри ролик', false);
                const unlock = () => { if (v.duration && v.currentTime / v.duration > .9) this.setNext('Дальше', true); };
                v.addEventListener('timeupdate', unlock);
                v.addEventListener('ended', () => this.setNext('Дальше', true));
                return;
            }
            if (t.youtube) {
                box.innerHTML = head + `<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${esc(t.youtube)}?rel=0" title="${esc(t.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
                return;
            }

            // Ролика ещё нет: играем раскадровку из сцен
            box.innerHTML = head + `<div class="player">
                <div class="player__screen" aria-label="Раскадровка ролика">
                    <svg class="player__bg" viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                        <rect class="z1" width="320" height="200"/>
                        <circle class="fc" cx="276" cy="38" r="20"/>
                        <path class="t3" d="M0 150 Q80 118 160 142 T320 136 V200 H0 Z"/>
                        ${Forest.pine(214, 150, 44)}${Forest.round(300, 146, 40)}${Forest.pine(250, 164, 34)}
                        <path class="t1" d="M0 178 Q100 154 200 174 T320 168 V200 H0 Z"/>
                    </svg>
                    <div class="player__bot" aria-hidden="true"></div>
                    <p class="player__caption" hidden></p>
                    <span class="player__tag">Черновик ролика</span>
                    <button class="player__play" type="button" aria-label="Смотреть ролик"><span>▶</span></button>
                </div>
                <p class="player__subs" aria-live="polite">Нажми ▶, чтобы смотреть. Тап по экрану — следующая сцена.</p>
                <div class="player__ctrl">
                    <button class="icon-btn" type="button" data-act="toggle" aria-label="Пауза">❚❚</button>
                    <div class="player__track">${t.scenes.map(() => '<span><i></i></span>').join('')}</div>
                    <span class="player__time">0:00</span>
                </div>
            </div>`;

            const screen = $('.player__screen', box);
            const bot = $('.player__bot', box);
            const caption = $('.player__caption', box);
            const subs = $('.player__subs', box);
            const playBtn = $('.player__play', box);
            const toggle = $('[data-act="toggle"]', box);
            const fills = $$('.player__track i', box);
            const time = $('.player__time', box);
            let scene = -1, elapsed = 0, playing = false, ended = false, last = 0, watched = false;

            const fmt = sec => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
            const show = i => {
                scene = i;
                elapsed = 0;
                const sc = t.scenes[i];
                bot.innerHTML = blup(sc.pose);
                caption.hidden = false;
                caption.textContent = sc.screen;
                subs.textContent = sc.voice;
                [bot, caption].forEach(el => { el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in'); });
                fills.forEach((f, k) => { f.style.width = k < i ? '100%' : '0'; });
                Sound.play('tap');
            };
            const finish = () => {
                playing = false;
                ended = true;
                fills.forEach(f => { f.style.width = '100%'; });
                playBtn.hidden = false;
                $('span', playBtn).textContent = '↻';
                playBtn.setAttribute('aria-label', 'Смотреть ещё раз');
                toggle.textContent = '▶';
                if (!watched) {
                    watched = true;
                    this.setNext('Дальше', true);
                    Sound.play('pop');
                }
            };
            const tick = now => {
                if (!playing || this.run.token !== token || !box.isConnected) return;
                elapsed += now - last;
                last = now;
                const sc = t.scenes[scene];
                fills[scene].style.width = Math.min(100, elapsed / (sc.sec * 1000) * 100) + '%';
                const done = t.scenes.slice(0, scene).reduce((s, x) => s + x.sec, 0) + elapsed / 1000;
                time.textContent = `${fmt(Math.min(done, total))} / ${fmt(total)}`;
                if (elapsed >= sc.sec * 1000) {
                    if (scene + 1 < t.scenes.length) show(scene + 1);
                    else { finish(); return; }
                }
                requestAnimationFrame(tick);
            };
            const play = () => {
                if (scene < 0 || ended) show(0);
                ended = false;
                playing = true;
                playBtn.hidden = true;
                toggle.textContent = '❚❚';
                toggle.setAttribute('aria-label', 'Пауза');
                last = performance.now();
                requestAnimationFrame(tick);
            };
            const pause = () => {
                playing = false;
                toggle.textContent = '▶';
                toggle.setAttribute('aria-label', 'Смотреть');
            };

            playBtn.addEventListener('click', e => { e.stopPropagation(); play(); });
            toggle.addEventListener('click', () => (playing ? pause() : play()));
            screen.addEventListener('click', () => {
                if (!playing || scene < 0) return;
                if (scene + 1 < t.scenes.length) show(scene + 1);
                else finish();
            });
            this.setNext('Досмотри ролик', false);
        },

        quiz(t, box) {
            const lesson = this.run.lesson;
            const quizzes = lesson.tasks.filter(x => x.type === 'quiz');
            const num = quizzes.indexOf(t) + 1;
            const opts = shuffle(t.options.map((text, i) => ({ text, ok: i === 0 })));
            box.innerHTML = `<p class="eyebrow task__kicker">${lesson.test ? '🌳 Испытание' : '✅ Тест'} · вопрос ${num} из ${quizzes.length}</p>
                <h2 class="question">${esc(t.q)}</h2>
                <div class="options">${opts.map((o, i) =>
                    `<button class="option" type="button" data-i="${i}"><span class="option__key">${LETTERS[i]}</span><span>${esc(o.text)}</span></button>`).join('')}
                </div>`;
            this.setNext('Выбери ответ', false);
            const buttons = $$('.option', box);
            buttons.forEach(btn => btn.addEventListener('click', () => {
                const chosen = opts[+btn.dataset.i];
                const right = opts.find(o => o.ok);
                buttons.forEach((b, i) => {
                    b.disabled = true;
                    if (opts[i].ok) b.classList.add('is-right');
                    else if (b !== btn) b.classList.add('is-dim');
                });
                if (!chosen.ok) btn.classList.add('is-wrong');
                this.answered(chosen.ok ? 1 : 0, {
                    title: chosen.ok ? pick(GOOD) : pick(BAD),
                    text: chosen.ok ? t.explain : `Правильно: «${right.text}». ${t.explain}`
                });
            }));
        },

        sort(t, box, token) {
            const items = shuffle(t.items);
            const counts = t.buckets.map(() => 0);
            let k = 0, right = 0, busy = false;
            box.innerHTML = this.head('🧩 Практика', t.title, t.text) + `<div class="sort">
                <div class="sort__deck"></div>
                <p class="sort__why" aria-live="polite">Куда отнесёшь карточку?</p>
                <div class="sort__buckets">${t.buckets.map((b, i) =>
                    `<button class="bucket" type="button" data-b="${i}"><span>${esc(b)}</span><b>0</b></button>`).join('')}
                </div>
            </div>`;
            const deck = $('.sort__deck', box);
            const why = $('.sort__why', box);
            const buckets = $$('.bucket', box);
            const showCard = () => {
                deck.innerHTML = `<div class="sort__card"><span class="sort__count">${k + 1}/${items.length}</span>${esc(items[k].t)}</div>`;
            };
            this.setNext('Разложи все карточки', false);
            showCard();

            buckets.forEach(btn => btn.addEventListener('click', async () => {
                if (busy) return;
                busy = true;
                const item = items[k];
                const ok = +btn.dataset.b === item.b;
                const card = $('.sort__card', deck);
                why.className = 'sort__why' + (ok ? '' : ' is-bad');
                why.textContent = (ok ? '✓ ' : '✗ ') + item.why;
                if (ok) {
                    right++;
                    Sound.play('pop');
                } else {
                    Sound.play('bad');
                    card.classList.add('is-wrong');
                    await wait(1100);
                }
                if (this.run.token !== token) return;
                card.classList.add('go-' + item.b);
                counts[item.b]++;
                const target = buckets[item.b];
                $('b', target).textContent = counts[item.b];
                target.classList.remove('is-hit');
                void target.offsetWidth;
                target.classList.add('is-hit');
                await wait(350);
                if (this.run.token !== token) return;
                k++;
                busy = false;
                if (k < items.length) {
                    showCard();
                    return;
                }
                deck.innerHTML = `<div class="sort__card">Готово: ${right} из ${items.length}</div>`;
                buckets.forEach(b => { b.disabled = true; });
                const score = right / items.length;
                this.answered(score, {
                    title: score === 1 ? 'Идеально!' : `${right} из ${items.length} верно`,
                    text: score === 1 ? 'Все карточки на своих местах.' : 'Пояснения под карточками помогут в следующий раз.'
                });
            }));
        },

        build(t, box, token) {
            const slots = t.slots.map(s => ({ ...s, opts: shuffle(s.options.map((text, i) => ({ text, ok: i === 0 }))), clean: true, done: false }));
            box.innerHTML = this.head('🧩 Практика', t.title) + `<p class="goal">🎯 ${esc(t.goal)}</p>
                <div class="slots">${slots.map((s, si) => `<div class="slot" data-s="${si}">
                    <p class="slot__label">${esc(s.label)}</p>
                    <div class="slot__options">${s.opts.map((o, oi) =>
                        `<button class="chip-btn" type="button" data-o="${oi}">${esc(o.text)}</button>`).join('')}</div>
                    <p class="slot__hint" hidden>${esc(s.hint)}</p>
                </div>`).join('')}</div>
                <div class="build-chat chat" hidden></div>`;
            this.setNext('Собери промпт', false);

            $$('.slot', box).forEach((el, si) => {
                const s = slots[si];
                $$('.chip-btn', el).forEach(chip => chip.addEventListener('click', () => {
                    if (s.done) return;
                    const o = s.opts[+chip.dataset.o];
                    if (!o.ok) {
                        s.clean = false;
                        chip.disabled = true;
                        chip.classList.add('is-wrong');
                        $('.slot__hint', el).hidden = false;
                        Sound.play('bad');
                        return;
                    }
                    s.done = true;
                    chip.classList.add('is-right');
                    $$('.chip-btn', el).forEach(c => { c.disabled = true; });
                    $('.slot__hint', el).hidden = true;
                    el.classList.add('is-done');
                    Sound.play('pop');
                    if (slots.every(x => x.done)) finish();
                }));
            });

            const finish = () => {
                const prompt = slots.map(s => s.opts.find(o => o.ok).text).join('. ') + '.';
                const chat = $('.build-chat', box);
                chat.hidden = false;
                chat.innerHTML = `<p class="bubble bubble--me"><span class="bubble__who">Твой промпт</span>${esc(prompt)}</p>
                    <p class="bubble bubble--ai"><span class="bubble__who">ИИ</span><span class="typing"></span></p>`;
                chat.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
                const out = $('.typing', chat);
                if (REDUCED) {
                    out.textContent = t.reply;
                    out.classList.remove('typing');
                } else {
                    let i = 0;
                    const timer = setInterval(() => {
                        if (this.run.token !== token) { clearInterval(timer); return; }
                        i += 2;
                        out.textContent = t.reply.slice(0, i);
                        if (i >= t.reply.length) { clearInterval(timer); out.classList.remove('typing'); }
                    }, 24);
                }
                const clean = slots.filter(s => s.clean).length;
                const score = clean / slots.length;
                this.answered(score, {
                    title: score === 1 ? 'Промпт мечты!' : `${clean} из ${slots.length} с первого раза`,
                    text: 'Роль + Задача + Контекст + Формат — и ИИ отвечает в точку.'
                });
            };
        },

        spot(t, box) {
            box.innerHTML = this.head('🧩 Практика', t.title, t.text) + `<div class="ai-answer">
                <p class="eyebrow ai-answer__who">${esc(t.who || '🤖 Ответ ИИ')}</p>
                <div class="sentences">${t.sentences.map((s, i) =>
                    `<button class="sentence" type="button" data-i="${i}">${esc(s)}</button>`).join('')}</div>
            </div>`;
            this.setNext('Нажми на предложение', false);
            const buttons = $$('.sentence', box);
            buttons.forEach(btn => btn.addEventListener('click', () => {
                const ok = +btn.dataset.i === t.wrong;
                buttons.forEach(b => { b.disabled = true; });
                buttons[t.wrong].classList.add('is-right');
                if (!ok) btn.classList.add('is-wrong');
                this.answered(ok ? 1 : 0, { title: ok ? pick(GOOD) : pick(BAD), text: t.explain });
            }));
        },

        poll(t, box) {
            const max = Math.max(...t.options.map(o => o.p));
            box.innerHTML = this.head('🧩 Эксперимент', t.title, t.text) +
                `<p class="phrase">${esc(t.phrase)}</p>
                <div class="poll">${t.options.map((o, i) =>
                    `<button class="poll__opt" type="button" data-i="${i}"><i class="poll__fill"></i><span>${esc(o.t)}</span><span class="poll__pct">${o.p}%</span></button>`).join('')}
                </div>`;
            this.setNext('Выбери слово', false);
            const poll = $('.poll', box);
            const buttons = $$('.poll__opt', box);
            buttons.forEach(btn => btn.addEventListener('click', () => {
                const o = t.options[+btn.dataset.i];
                btn.classList.add('is-mine');
                buttons.forEach((b, i) => {
                    b.disabled = true;
                    $('.poll__fill', b).style.width = t.options[i].p + '%';
                });
                poll.classList.add('is-open');
                this.answered(null, {
                    title: o.p === max ? 'Ты думаешь как нейросеть!' : 'Нейросеть выбрала бы другое',
                    text: t.explain
                });
            }));
        },

        mission(t, box) {
            box.innerHTML = this.head('🚀 Миссия', t.title, t.text) + `<div class="mission__prompt">
                <p id="mission-text">${esc(t.prompt)}</p>
                <button class="btn btn--white" type="button">Скопировать</button>
            </div>
            <p class="mission__note">${esc(t.note)}</p>`;
            const copy = $('.mission__prompt .btn', box);
            copy.addEventListener('click', () => {
                const done = () => { copy.textContent = 'Скопировано ✓'; Sound.play('pop'); };
                const fallback = () => {
                    const range = document.createRange();
                    range.selectNodeContents($('#mission-text', box));
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                    copy.textContent = 'Выделено — скопируй';
                };
                try { navigator.clipboard.writeText(t.prompt).then(done, fallback); } catch (e) { fallback(); }
            });
            this.setNext('Я попробовал(а) ✓', true);
            const skip = $('#skip-btn');
            skip.hidden = false;
            this.run.onNext = () => { this.run.scores[this.run.step] = null; this.nextTask(); };
        }
    },

    finishLesson() {
        const r = this.run;
        const res = Game.applyLesson(this.state, r.lesson.id, r.scores);
        this.state = res.state;
        this.save();
        this.sendResult(r, res);
        this.showResult(r, res);
    },

    // Результат в Make.com: простой POST формой, без preflight-запроса
    sendResult(r, res) {
        if (!CONFIG.resultsWebhook) return;
        const body = new URLSearchParams({
            name: this.state.name,
            course: COURSE.id,
            block: r.st.block.id,
            lesson: r.lesson.id,
            lessonTitle: r.lesson.title,
            stars: res.stars,
            scorePct: Math.round(res.xp.ratio * 100),
            xpEarned: res.earned,
            xpTotal: this.state.xp,
            level: Game.levelFor(this.state.xp).level,
            plays: this.state.lessons[r.lesson.id].plays,
            durationSec: Math.round((Date.now() - r.startedAt) / 1000),
            scores: r.lesson.tasks.map((t, i) => (typeof r.scores[i] === 'number' ? Math.round(r.scores[i] * 100) / 100 : '-')).join(' '),
            finishedAt: new Date().toISOString()
        });
        try { fetch(CONFIG.resultsWebhook, { method: 'POST', mode: 'no-cors', body }).catch(() => {}); } catch (e) { /* без сети */ }
    },

    showResult(r, res) {
        const x = res.xp;
        const lesson = r.lesson;
        $('#lesson').hidden = true;
        $('#result').hidden = false;
        $('#result').scrollTop = 0;

        $('#result-blup').innerHTML = blup(!res.passed ? 'sad' : res.stars === 3 ? 'victory' : 'joy');
        $('#result-kicker').textContent = lesson.test ? 'Финал блока' : `Станция ${r.st.block.lessons.indexOf(lesson) + 1}`;
        $('#result-title').textContent = !res.passed ? 'Почти получилось' : res.stars === 3 ? 'Идеально!' : 'Станция пройдена!';
        $('#result-lead').textContent = !res.passed
            ? 'Нужно хотя бы 50% верных. Ещё одна попытка — и всё получится.'
            : res.isReplay && res.earned === 0
                ? 'Опыт за повтор не начисляется, если результат не лучше прошлого. Звёзды улучшать можно.'
                : `«${lesson.title}» в копилке.`;

        const starsBox = $('#result-stars');
        starsBox.innerHTML = [0, 1, 2].map(() => '<span aria-hidden="true">⭐</span>').join('') +
            `<span class="sr-only">${res.stars} из 3 звёзд</span>`;
        const stars = $$('span[aria-hidden]', starsBox);
        stars.forEach((el, i) => {
            if (i < res.stars) setTimeout(() => { el.classList.add('is-on'); Sound.play('star'); }, 450 + i * 380);
        });

        $('#result-stats').innerHTML = [
            [`+${res.earned}`, 'опыта'],
            [`${Math.round(x.ratio * 100)}%`, 'точность'],
            [x.bestRun, 'серия без ошибок']
        ].map(([v, l]) => `<li><b>${v}</b><span>${l}</span></li>`).join('');

        const extra = [];
        if (res.blockCompleted) extra.push(['🌳', `Блок «${r.st.block.title}» пройден! +${res.blockBonus} XP`]);
        if (res.levelUp) extra.push(['🆙', `Новый уровень ${res.levelUp.level}: ${res.levelUp.title}`]);
        res.badges.forEach(b => extra.push([b.icon, `Награда «${b.title}»: ${b.desc.toLowerCase()}`]));
        $('#result-extra').innerHTML = extra.map(([icon, text], i) =>
            `<li style="animation-delay:${1.4 + i * .3}s"><span aria-hidden="true">${icon}</span>${esc(text)}</li>`).join('');

        const mapBtn = $('#result-map'), retry = $('#result-retry');
        if (res.passed) {
            mapBtn.textContent = 'На карту →';
            mapBtn.onclick = () => this.backToMap(res);
            retry.textContent = 'Пройти ещё раз';
            retry.onclick = () => this.startLesson(lesson.id, { fresh: true });
            this.confetti(res.stars === 3 ? 180 : 110);
            if (res.levelUp || res.blockCompleted) setTimeout(() => this.confetti(160), 1500);
            Sound.play('win');
        } else {
            mapBtn.textContent = 'Ещё раз';
            mapBtn.onclick = () => this.startLesson(lesson.id, { fresh: true });
            retry.textContent = 'На карту';
            retry.onclick = () => this.backToMap(res);
            Sound.play('bad');
        }
        mapBtn.focus();
    },

    async backToMap(res) {
        this.run = null;
        $('#result').hidden = true;
        $('#lesson').hidden = true;
        document.body.classList.remove('is-overlay');
        const from = this.state.blupAt || 0;
        const to = Game.currentIndex(this.state);
        this.renderAll();
        if (to > from) {
            this.state.blupAt = to;
            this.save();
            await this.walk(from, to);
        } else {
            this.scrollToCurrent(true);
        }
        if (res && res.blockCompleted) {
            const next = COURSE.blocks.find(b => b.soon);
            if (next) this.toast(`Дальше — «${next.title}». Блок скоро откроется 🌱`);
        }
    },

    // ---------- Листы ----------
    openHello() {
        const input = $('#hello-name');
        input.value = this.state.name || this.suggestedName || '';
        $('#hello-blup').innerHTML = blup('hello');
        $('#hello-sheet').showModal();
    },

    openSettings() {
        const s = this.state;
        $('#settings-name').value = s.name;
        $('#settings-sound').checked = s.sound;
        $('#settings-unlock').checked = s.unlockAll;
        $('#reset-confirm').hidden = true;
        $('#badges').innerHTML = BADGES.map(b =>
            `<span class="badge${s.badges[b.id] ? '' : ' is-off'}" title="${esc(b.title + ': ' + b.desc)}" role="img" aria-label="${esc(b.title + (s.badges[b.id] ? ', получена' : ', ещё не получена'))}">${b.icon}</span>`).join('');
        $('#settings-sheet').showModal();
    },

    toast(text) {
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = text;
        $('#toasts').appendChild(el);
        setTimeout(() => {
            el.classList.add('is-out');
            setTimeout(() => el.remove(), 300);
        }, 2600);
    },

    confetti(amount) {
        if (REDUCED) return;
        const cv = $('#confetti');
        const ctx = cv.getContext('2d');
        const css = getComputedStyle(document.documentElement);
        const colors = ['--sun', '--go', '--peach', '--sky', '--lav', '--pink'].map(v => css.getPropertyValue(v).trim());
        const w = window.innerWidth, h = window.innerHeight;
        for (let i = 0; i < amount; i++) {
            this.confettiParts.push({
                x: w / 2 + (Math.random() - .5) * 160, y: h * .32,
                vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4,
                r: Math.random() * 360, vr: (Math.random() - .5) * 14,
                w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
                c: colors[i % colors.length], life: 0
            });
        }
        if (this.confettiRunning) return;
        this.confettiRunning = true;
        const dpr = window.devicePixelRatio || 1;
        cv.width = w * dpr;
        cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const frame = () => {
            ctx.clearRect(0, 0, w, h);
            this.confettiParts = this.confettiParts.filter(p => p.y < h + 40 && p.life < 240);
            this.confettiParts.forEach(p => {
                p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.r * Math.PI / 180);
                ctx.fillStyle = p.c;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            if (this.confettiParts.length) requestAnimationFrame(frame);
            else { ctx.clearRect(0, 0, w, h); this.confettiRunning = false; }
        };
        requestAnimationFrame(frame);
    },

    // ---------- События ----------
    bind() {
        $('#map').addEventListener('click', e => {
            const el = e.target.closest('[data-node]');
            if (el) this.onNodeClick(this.layout.nodes[+el.dataset.node]);
        });

        $('#continue-btn').addEventListener('click', () => {
            const s = this.state;
            const resume = s.current && Game.findStation(s.current.lessonId);
            if (resume) { this.startLesson(resume.lesson.id); return; }
            const st = Game.stations()[Game.currentIndex(s)];
            if (Game.passed(s, st.lesson.id)) this.openStation(this.nodeByIndex(st.index));
            else this.startLesson(st.lesson.id);
        });

        $('#brand').addEventListener('click', () => window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));
        $('#settings-btn').addEventListener('click', () => this.openSettings());
        $('#sound-btn').addEventListener('click', () => {
            this.state.sound = Sound.on = !this.state.sound;
            this.save();
            this.renderTopbar();
            Sound.play('pop');
        });

        $('#next-btn').addEventListener('click', () => { if (this.run && this.run.onNext) this.run.onNext(); });
        $('#skip-btn').addEventListener('click', () => {
            if (!this.run) return;
            this.run.scores[this.run.step] = null;
            this.nextTask();
        });
        $('#lesson-close').addEventListener('click', () => this.closeLesson());

        $('#hello-form').addEventListener('submit', e => {
            e.preventDefault();
            const name = $('#hello-name').value.trim();
            if (!name) return;
            this.state.name = name;
            this.save();
            $('#hello-sheet').close();
            this.renderHello();
            Sound.play('pop');
            this.toast(`Приятно познакомиться, ${name}! Жми на первую станцию`);
        });

        $('#settings-form').addEventListener('submit', e => {
            e.preventDefault();
            const s = this.state;
            s.name = $('#settings-name').value.trim() || s.name;
            s.sound = Sound.on = $('#settings-sound').checked;
            s.unlockAll = $('#settings-unlock').checked;
            this.save();
            $('#settings-sheet').close();
            this.renderAll();
            this.toast('Сохранено');
        });
        $('#reset-btn').addEventListener('click', () => { $('#reset-confirm').hidden = false; });
        $('#reset-no').addEventListener('click', () => { $('#reset-confirm').hidden = true; });
        $('#reset-yes').addEventListener('click', () => {
            this.state = Game.newState(this.state.name);
            Sound.on = this.state.sound;
            this.save();
            $('#settings-sheet').close();
            this.renderAll();
            window.scrollTo(0, 0);
            this.toast('Прогресс сброшен. Начинаем тропу заново');
        });

        $$('dialog').forEach(dlg => {
            dlg.addEventListener('click', e => {
                if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
