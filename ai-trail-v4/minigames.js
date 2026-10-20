'use strict';

// Мини-игры v4: новые типы заданий поверх движка v3 (app.js). Подключается после app.js и до DOMContentLoaded,
// поэтому просто добавляет обработчики в app.tasks. Внутри обработчика this — это app, как у остальных заданий.
//
//   poster — «собери инфографику»: выбери верные факты из колоды (мифы — ловушки), раскрась и скачай плакат (PNG)
//   glitch — «найди глюки» на «ИИ-картинке» из scenes.js
//   meter  — «прокачай промпт»: собери Role / Task / Context / Format из колоды, шкала силы промпта растёт
//   draw   — «будь генератором картинок»: нарисуй по размытому, потом по подробному промпту, сравни. Без оценки
//   redact — «закрась лишнее»: закрась личные данные в сообщении чатботу, но не то, что нужно для задачи
//   hint   — «лестница подсказок»: реши задачу, подсказки бесплатны, готовый ответ — половина балла
// Плакат и рисунок сохраняются в портфолио картинкой.

const MG = {
    kicker: 'Mini-game',
    poster: {
        kicker: 'Infographic',
        empty: 'Pick a fact',
        ask: n => `Tap the ${n} cards that belong on the poster.`,
        good: 'On the poster.',
        full: 'Poster full. Now make it yours: title, colors, sticker.',
        style: 'Style it',
        titleLabel: 'Poster title',
        colors: 'Colors',
        stickerLabel: 'Sticker',
        save: 'Download poster (PNG)',
        saved: 'Downloaded and saved to your portfolio',
        foot: name => `Made by ${name || 'me'} · AI Starter Trail`,
        perfect: 'Clean poster: nothing wrong on it.',
        score: (m, trap) => `${m} ${m === 1 ? trap[0] : trap[1]} tried to sneak in`,
        text: 'Your poster is in your portfolio. Download it and share it, it’s a real infographic.',
        themes: [
            { name: 'Night', bg: '#0E0F12', ink: '#F2F3F5', accent: '#C6F432', card: '#1B1E26', num: '#0E0F12' },
            { name: 'Violet', bg: '#4B2FD1', ink: '#FFFFFF', accent: '#C6F432', card: '#5E44E0', num: '#0E0F12' },
            { name: 'Paper', bg: '#F6F6F2', ink: '#0E0F12', accent: '#7C5CFF', card: '#FFFFFF', num: '#FFFFFF' },
            { name: 'Sunset', bg: '#FF6B4A', ink: '#1A0E0A', accent: '#FFF3D6', card: '#FF8A6E', num: '#1A0E0A' }
        ],
        stickers: ['🤖', '🧠', '⚡', '✨']
    },
    glitch: {
        promptLabel: 'Prompt',
        tag: 'AI image',
        ask: 'Tap every glitch you see.',
        found: 'Glitch found.',
        miss: 'Looks fine there. Keep looking.',
        locked: 'Find the glitches',
        giveUp: 'I can’t find the rest: show me',
        count: (f, n) => `${f}/${n}`,
        all: 'All glitches found.',
        some: (f, n) => `${f} of ${n} glitches found`,
        missText: (m) => (m ? ` (${m} ${m === 1 ? 'wrong tap' : 'wrong taps'})` : '')
    },
    meter: {
        power: 'Prompt power',
        ask: 'Tap the cards that make this prompt stronger. One per part.',
        locked: 'Power the prompt to 100%',
        added: part => `${part} added.`,
        perfect: 'Full power, zero junk.',
        score: m => `Full power, but ${m} junk ${m === 1 ? 'card' : 'cards'} on the way`,
        icons: { Role: '🎭', Task: '🎯', Context: '📎', Format: '📐' }
    },
    draw: {
        round: (n, total) => `Round ${n}/${total}`,
        promptLabel: 'Your prompt',
        canvasLabel: 'Drawing pad',
        done: 'I’m done drawing',
        time: s => `${s}s`,
        timeUp: 'Time’s up!',
        colors: 'Colors',
        sizes: 'Brush size',
        eraser: 'Eraser',
        undo: 'Undo',
        clear: 'Clear',
        size: ['Thin', 'Medium', 'Thick'],
        compareTitle: 'Compare your two pictures',
        yourDrawing: n => `Your drawing, round ${n}`,
        checkTitle: 'Round 2: tick every detail you actually drew',
        checkHint: 'Be honest, nobody’s grading this one.',
        compare: 'See what it means',
        result: (n, total) => `${n} of ${total} details made it into your picture`,
        saved: 'Both drawings are saved to your portfolio.'
    },
    redact: {
        who: 'A message someone is about to send to a chatbot',
        ask: 'Tap words to black them out. Hide what AI doesn’t need, keep what it needs for the task.',
        pick: 'Black out at least one thing',
        check: 'Check',
        hit: 'hidden',
        missed: 'still visible',
        over: n => `You also blacked out ${n} ${n === 1 ? 'word' : 'words'} the AI needed for the task.`,
        perfect: 'Safe to send.',
        score: (h, n) => `${h} of ${n} secrets hidden`
    },
    hint: {
        puzzle: 'Puzzle',
        yourAnswer: 'Your answer',
        placeholder: 'Your answer',
        check: 'Check',
        ask: 'Try it yourself first. Stuck? Climb the hint ladder: hints are free.',
        hintBtn: n => `Hint ${n}`,
        answerBtn: 'Just tell me the answer',
        locked: 'Solve it (or give up)',
        wrong: more => (more ? 'Not yet. Take the next hint?' : 'Not yet. Check the last hint step by step.'),
        empty: 'Type a number first',
        alone: 'Solved on your own.',
        withHints: n => `Solved with ${n} ${n === 1 ? 'hint' : 'hints'}.`,
        gaveUp: 'You got the answer, not the skill.',
        solution: 'Answer'
    }
};

// ---------- Общие помощники ----------

// Картинка в портфолио: тот же ключ, что у письменных заданий (урок:шаг). JPEG шириной 540 — около 30–60 КБ
function mgKeepImage(app, title, canvas, text) {
    const r = app.run;
    if (!r) return;
    const w = 540, small = document.createElement('canvas');
    small.width = w;
    small.height = Math.round(canvas.height * w / canvas.width);
    const g = small.getContext('2d');
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, small.width, small.height);
    g.drawImage(canvas, 0, 0, small.width, small.height);
    let img;
    try { img = small.toDataURL('image/jpeg', .8); } catch (e) { return; }
    app.state.portfolio = app.state.portfolio || {};
    app.state.portfolio[r.lesson.id + ':' + r.step] = { lesson: r.lesson.title, title, text, img, at: Game.dayKey() };
    app.save();
}

function mgDownload(canvas, name) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function mgRoundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
}

function mgWrap(g, text, maxW) {
    const lines = [];
    let line = '';
    String(text).split(/\s+/).forEach(word => {
        const test = line ? line + ' ' + word : word;
        if (g.measureText(test).width > maxW && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    });
    if (line) lines.push(line);
    return lines;
}

const MG_FONT = '"Space Grotesk", system-ui, sans-serif';

// Плакат 1080×1350 (формат поста в Instagram): заголовок, нумерованные факты, подпись
async function mgPosterCanvas({ kicker, heading, facts, theme, sticker, foot }) {
    try { await document.fonts.load(`700 40px ${MG_FONT}`); } catch (e) { /* шрифт не загрузился — системный */ }
    const W = 1080, H = 1350, X = 80, c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = theme.bg;
    g.fillRect(0, 0, W, H);
    g.globalAlpha = .16;
    g.fillStyle = theme.accent;
    g.beginPath();
    g.arc(W - 110, 150, 270, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
    g.textBaseline = 'top';
    g.font = '150px serif';
    g.fillText(sticker, W - 270, 70);

    g.fillStyle = theme.accent;
    g.font = `700 32px ${MG_FONT}`;
    g.fillText(kicker.toUpperCase(), X, 90);
    g.fillStyle = theme.ink;
    g.font = `700 90px ${MG_FONT}`;
    let y = 140;
    mgWrap(g, heading, W - X * 2 - 210).slice(0, 3).forEach(line => { g.fillText(line, X, y); y += 98; });
    y += 40;

    // Факты: шрифт уменьшается, пока все карточки не поместятся
    const bottom = H - 150, gap = 24, cardW = W - X * 2, textX = X + 120, textW = cardW - 150;
    let size = 46, layout;
    do {
        g.font = `500 ${size}px ${MG_FONT}`;
        layout = facts.map(f => mgWrap(g, f.t, textW));
        const total = layout.reduce((s, l) => s + Math.max(l.length * size * 1.22, 72) + 60, 0) + gap * (facts.length - 1);
        if (y + total <= bottom || size <= 30) break;
        size -= 2;
    } while (true);
    facts.forEach((f, i) => {
        const lines = layout[i], h = Math.max(lines.length * size * 1.22, 72) + 60;
        g.fillStyle = theme.card;
        mgRoundRect(g, X, y, cardW, h, 30);
        g.fill();
        g.fillStyle = theme.accent;
        g.beginPath();
        g.arc(X + 64, y + h / 2, 34, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = theme.num;
        g.font = `700 36px ${MG_FONT}`;
        g.textAlign = 'center';
        g.fillText(String(i + 1), X + 64, y + h / 2 - 19);
        g.textAlign = 'left';
        g.fillStyle = theme.ink;
        g.font = `500 ${size}px ${MG_FONT}`;
        lines.forEach((line, k) => g.fillText(line, textX, y + 30 + k * size * 1.22));
        y += h + gap;
    });

    g.globalAlpha = .7;
    g.fillStyle = theme.ink;
    g.font = `500 30px ${MG_FONT}`;
    g.fillText(foot, X, H - 100);
    g.globalAlpha = 1;
    return c;
}

// ---------- Задания ----------
Object.assign(app.tasks, {
    // Инфографика: верные факты из колоды попадают на плакат, мифы трясутся и объясняют, почему они мифы.
    // Балл: факты / (факты + мифы, на которые нажали). Плакат можно оформить и скачать, он сохраняется в портфолио.
    poster(t, box, token) {
        const P = MG.poster, r = this.run;
        const stickers = t.stickers || P.stickers;
        const deck = shuffle(t.cards);
        const slots = t.cards.filter(c => c.ok).length;
        const placed = [], myths = [];
        const look = { theme: 0, sticker: stickers[0], heading: t.heading };
        let done = false;

        box.innerHTML = this.head(MG.kicker, t.title, t.text) + `
            <div class="mg-poster">
                <figure class="poster">
                    <span class="poster__sticker" aria-hidden="true"></span>
                    <p class="poster__kicker">${esc(P.kicker)}</p>
                    <h3 class="poster__title"></h3>
                    <ol class="poster__facts">${Array.from({ length: slots }, (_, k) =>
                        `<li class="poster__fact is-empty"><span class="poster__num">${k + 1}</span><span class="poster__text">${P.empty}</span></li>`).join('')}</ol>
                    <figcaption class="poster__foot">${esc(P.foot(this.state.name))}</figcaption>
                </figure>
                <div class="mg-poster__side">
                    <p class="mg-hint" aria-live="polite">${esc(P.ask(slots))}</p>
                    <div class="mg-deck">${deck.map((c, j) =>
                        // Иконки только на плакате: в колоде они были бы подсказкой (иконки есть лишь у верных фактов)
                        `<button class="mg-card" type="button" data-j="${j}"><span>${esc(c.t)}</span></button>`).join('')}</div>
                    <div class="mg-style" hidden>
                        <p class="eyebrow">${P.style}</p>
                        <label class="mg-field"><span>${P.titleLabel}</span><input class="mg-field__input" maxlength="40" value="${esc(t.heading)}"></label>
                        <div class="mg-row" role="group" aria-label="${P.colors}">${P.themes.map((th, k) =>
                            `<button class="mg-swatch" type="button" data-k="${k}" aria-label="${th.name}" aria-pressed="${k === 0}" style="--sw:${th.bg};--sw2:${th.accent}"></button>`).join('')}</div>
                        <div class="mg-row" role="group" aria-label="${P.stickerLabel}">${stickers.map((s, k) =>
                            `<button class="mg-sticker" type="button" data-k="${k}" aria-pressed="${k === 0}">${s}</button>`).join('')}</div>
                        <button class="btn btn--white btn--block mg-save" type="button">${P.save}</button>
                    </div>
                </div>
            </div>`;

        const poster = $('.poster', box), hint = $('.mg-hint', box);
        const paint = () => {
            const th = P.themes[look.theme];
            ['bg', 'ink', 'accent', 'card', 'num'].forEach(k => poster.style.setProperty('--p-' + k, th[k]));
            $('.poster__title', poster).textContent = look.heading || t.heading;
            $('.poster__sticker', poster).textContent = look.sticker;
        };
        paint();
        this.setNext(UI.btn.next, false);

        const render = () => mgPosterCanvas({
            kicker: P.kicker, heading: look.heading || t.heading, facts: placed, theme: P.themes[look.theme],
            sticker: look.sticker, foot: P.foot(this.state.name)
        });
        const keep = async () => {
            const c = await render();
            if (this.run !== r) return null;
            mgKeepImage(this, t.title, c, `${look.heading || t.heading}: ${placed.map(f => f.t).join(' · ')}`);
            return c;
        };

        $$('.mg-card', box).forEach(btn => btn.addEventListener('click', () => {
            if (done) return;
            const c = deck[+btn.dataset.j];
            btn.disabled = true;
            if (!c.ok) {
                myths.push(c);
                btn.classList.add('is-wrong');
                hint.className = 'mg-hint is-bad';
                hint.textContent = '✗ ' + c.why;
                Sound.play('bad');
                return;
            }
            placed.push(c);
            btn.classList.add('is-used');
            const li = $$('.poster__fact', poster)[placed.length - 1];
            li.classList.remove('is-empty');
            li.classList.add('is-in');
            $('.poster__text', li).textContent = (c.icon ? c.icon + ' ' : '') + c.t;
            hint.className = 'mg-hint';
            hint.textContent = '✓ ' + (c.why || P.good);
            Sound.play('pop');
            if (placed.length < slots) return;

            done = true;
            // Колода больше не нужна: на её месте — оформление плаката
            $('.mg-deck', box).hidden = true;
            hint.className = 'mg-hint';
            hint.textContent = P.full;
            $('.mg-style', box).hidden = false;
            const score = slots / (slots + myths.length);
            if (myths.length) {
                this.run.mistake = {
                    question: `${t.title}. ${t.text || ''}`,
                    answer: myths.map(m => m.t).join('; '),
                    correct: placed.map(f => f.t).join('; '),
                    explain: myths.map(m => m.why).join(' ')
                };
            }
            keep();
            this.answered(score, { title: myths.length ? P.score(myths.length, t.trap || ['myth', 'myths']) : P.perfect, text: P.text });
        }));

        $('.mg-field__input', box).addEventListener('input', e => { look.heading = e.target.value.trim(); paint(); });
        $$('.mg-swatch', box).forEach(b => b.addEventListener('click', () => {
            look.theme = +b.dataset.k;
            $$('.mg-swatch', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            paint();
            Sound.play('tap');
        }));
        $$('.mg-sticker', box).forEach(b => b.addEventListener('click', () => {
            look.sticker = stickers[+b.dataset.k];
            $$('.mg-sticker', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            paint();
            Sound.play('tap');
        }));
        $('.mg-save', box).addEventListener('click', async e => {
            const btn = e.currentTarget;
            btn.disabled = true;
            const c = await keep();
            btn.disabled = false;
            if (!c || this.run !== r || r.token !== token) return;
            mgDownload(c, 'ai-poster.png');
            this.toast(P.saved);
        });
    },

    // Найди глюки на «ИИ-картинке». Промах по пустому месту — минус четверть глюка (не больше 8 промахов).
    // После 3 промахов или 40 секунд можно сдаться: оставшиеся глюки показываются и не засчитываются.
    glitch(t, box, token) {
        const G = MG.glitch, S = SCENES[t.scene], r = this.run;
        const total = S.spots.length, found = new Set();
        let misses = 0, over = false;
        box.innerHTML = this.head(MG.kicker, t.title, t.text) + `
            <div class="mg-glitch">
                <p class="mg-glitch__prompt"><span class="eyebrow">${G.promptLabel}</span> ${esc(S.prompt)}</p>
                <div class="mg-glitch__pic">
                    <svg class="mg-glitch__svg" viewBox="0 0 400 300" role="img" aria-label="${esc(S.alt)}">${S.svg}<g class="mg-glitch__marks"></g></svg>
                    <span class="mg-glitch__tag">${G.tag}</span>
                </div>
                <div class="mg-glitch__bar"><b class="mg-glitch__count">${G.count(0, total)}</b><span class="mg-hint" aria-live="polite">${G.ask}</span></div>
                <ol class="mg-glitch__list"></ol>
                <button class="link-btn mg-glitch__give" type="button" hidden>${G.giveUp}</button>
            </div>`;
        this.setNext(G.locked, false);
        const svg = $('.mg-glitch__svg', box), marks = $('.mg-glitch__marks', box);
        const hint = $('.mg-hint', box), list = $('.mg-glitch__list', box), give = $('.mg-glitch__give', box);
        const ns = 'http://www.w3.org/2000/svg';
        const mark = (s, cls) => {
            const c = document.createElementNS(ns, 'circle');
            c.setAttribute('cx', s.x);
            c.setAttribute('cy', s.y);
            c.setAttribute('r', s.r);
            c.setAttribute('class', 'mg-mark ' + cls);
            marks.appendChild(c);
            list.insertAdjacentHTML('beforeend', `<li class="${cls}"><b>${esc(s.label)}.</b> ${esc(s.why)}</li>`);
        };
        const finish = () => {
            over = true;
            give.hidden = true;
            svg.classList.add('is-over');
            const score = Math.max(0, found.size - .25 * Math.min(misses, 8)) / total;
            const left = S.spots.filter((_, i) => !found.has(i));
            if (left.length) {
                this.run.mistake = {
                    question: `${t.title}. ${t.text || ''}`,
                    answer: `Found ${found.size} of ${total}`,
                    correct: S.spots.map(s => s.label).join('; '),
                    explain: left.map(s => s.why).join(' ')
                };
            }
            this.answered(Math.round(score * 100) / 100, {
                title: (found.size === total ? G.all : G.some(found.size, total)) + G.missText(misses),
                text: t.explain
            });
        };
        svg.addEventListener('click', e => {
            if (over) return;
            const p = svg.createSVGPoint();
            p.x = e.clientX;
            p.y = e.clientY;
            const at = p.matrixTransform(svg.getScreenCTM().inverse());
            let best = -1, bestD = Infinity;
            S.spots.forEach((s, i) => {
                const d = Math.hypot(s.x - at.x, s.y - at.y);
                if (d <= s.r && d < bestD) { best = i; bestD = d; }
            });
            if (best >= 0) {
                if (found.has(best)) return;
                found.add(best);
                mark(S.spots[best], 'is-found');
                $('.mg-glitch__count', box).textContent = G.count(found.size, total);
                hint.className = 'mg-hint';
                hint.textContent = '✓ ' + G.found;
                Sound.play('good');
                if (found.size === total) finish();
                return;
            }
            misses++;
            const x = document.createElementNS(ns, 'text');
            x.setAttribute('x', at.x);
            x.setAttribute('y', at.y);
            x.setAttribute('class', 'mg-miss');
            x.textContent = '✕';
            marks.appendChild(x);
            setTimeout(() => x.remove(), 900);
            hint.className = 'mg-hint is-bad';
            hint.textContent = G.miss;
            Sound.play('bad');
            if (misses >= 3) give.hidden = false;
        });
        give.addEventListener('click', () => {
            if (over) return;
            S.spots.forEach((s, i) => { if (!found.has(i)) mark(s, 'is-missed'); });
            Sound.play('pop');
            finish();
        });
        setTimeout(() => { if (!over && this.run === r && r.token === token) give.hidden = false; }, 40000);
    },

    // Прокачай промпт: из колоды карточек выбрать по одной на каждую часть (Role / Task / Context / Format).
    // Мусорные карточки (личные данные, пустые слова, не та роль) трясутся. Балл: части / (части + мусор).
    meter(t, box, token) {
        const M = MG.meter, r = this.run, parts = t.parts;
        const deck = shuffle(t.cards);
        const got = {}, junk = [];
        box.innerHTML = this.head(MG.kicker, t.title, t.text) + `
            <div class="mg-meter">
                <p class="mg-gauge__head"><span class="eyebrow">${M.power}</span><b class="mg-gauge__pct">0%</b></p>
                <div class="mg-gauge" role="progressbar" aria-label="${M.power}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                    <i class="mg-gauge__fill"></i>
                </div>
                <div class="mg-parts">${parts.map(p => `<span class="mg-part" data-p="${esc(p)}">${M.icons[p] || ''} ${esc(p)}</span>`).join('')}</div>
                <div class="chat mg-meter__prompt"><p class="bubble bubble--me"><span class="bubble__who">${UI.yourPrompt}</span><span class="mg-meter__text">${esc(t.start)}</span></p></div>
                <p class="mg-hint" aria-live="polite">${M.ask}</p>
                <div class="mg-deck">${deck.map((c, j) =>
                    `<button class="mg-card" type="button" data-j="${j}"><span>${esc(c.t)}</span></button>`).join('')}</div>
                <div class="chat mg-meter__reply" hidden></div>
            </div>`;
        this.setNext(M.locked, false);
        const hint = $('.mg-hint', box), gauge = $('.mg-gauge', box);
        const text = () => parts.filter(p => got[p]).map(p => got[p].t).join(' ') || t.start;

        const finish = () => {
            $$('.mg-card', box).forEach(b => { if (!b.disabled) { b.disabled = true; b.classList.add('is-dim'); } });
            const chat = $('.mg-meter__reply', box);
            chat.hidden = false;
            chat.innerHTML = `<p class="bubble bubble--ai"><span class="bubble__who">${UI.ai}</span><span class="typing"></span></p>`;
            const out = $('.typing', chat);
            if (REDUCED) {
                out.textContent = t.reply;
                out.classList.remove('typing');
            } else {
                let i = 0;
                const timer = setInterval(() => {
                    if (this.run !== r || r.token !== token) { clearInterval(timer); return; }
                    i += 2;
                    out.textContent = t.reply.slice(0, i);
                    if (i >= t.reply.length) { clearInterval(timer); out.classList.remove('typing'); }
                }, 22);
            }
            chat.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
            const score = parts.length / (parts.length + junk.length);
            if (junk.length) {
                this.run.mistake = {
                    question: `${t.title}. ${t.text || ''}`,
                    answer: junk.map(c => c.t).join('; '),
                    correct: parts.map(p => `${p}: ${got[p].t}`).join('; '),
                    explain: junk.map(c => c.why).join(' ')
                };
            }
            this.answered(score, { title: junk.length ? M.score(junk.length) : M.perfect, text: t.done || UI.buildText });
        };

        $$('.mg-card', box).forEach(btn => btn.addEventListener('click', () => {
            const c = deck[+btn.dataset.j];
            btn.disabled = true;
            if (!c.part || got[c.part]) {
                junk.push(c);
                btn.classList.add('is-wrong');
                gauge.classList.remove('is-shake');
                void gauge.offsetWidth;
                gauge.classList.add('is-shake');
                hint.className = 'mg-hint is-bad';
                hint.textContent = '✗ ' + c.why;
                Sound.play('bad');
                return;
            }
            got[c.part] = c;
            btn.classList.add('is-used');
            const pct = Math.round(Object.keys(got).length / parts.length * 100);
            $('.mg-gauge__fill', gauge).style.width = pct + '%';
            $('.mg-gauge__pct', box).textContent = pct + '%';
            gauge.setAttribute('aria-valuenow', pct);
            // CSS.escape недоступен: в app.js есть своя константа CSS (стили для вставки)
            $$('.mg-part', box).find(el => el.dataset.p === c.part).classList.add('is-on');
            $('.mg-meter__text', box).textContent = text();
            hint.className = 'mg-hint';
            hint.textContent = '✓ ' + M.added(c.part) + (c.why ? ' ' + c.why : '');
            Sound.play('pop');
            if (Object.keys(got).length === parts.length) finish();
        }));
    },

    // Будь генератором картинок: раунд с размытым промптом, раунд с подробным, потом сравнение и чек-лист деталей.
    // Без оценки: тут важен вывод, а не качество рисунка. Оба рисунка сохраняются в портфолио одной картинкой.
    draw(t, box, token) {
        const D = MG.draw, r = this.run;
        const COLORS = ['#0E0F12', '#F0453A', '#F5A100', '#3BB273', '#2F80ED', '#7C5CFF', '#8C5A35', '#FF7AA2'];
        const SIZES = [4, 10, 22];
        const pics = [];
        let round = 0, timer = null;
        const alive = () => this.run === r && r.token === token;

        const drawRound = () => {
            const rd = t.rounds[round];
            let left = rd.seconds || 60, color = COLORS[0], size = SIZES[1], erase = false, finished = false;
            box.innerHTML = this.head(`${MG.kicker} · ${D.round(round + 1, t.rounds.length)}`, t.title, round === 0 ? t.text : '') + `
                <div class="mg-draw">
                    <div class="mg-draw__prompt">
                        <div><span class="eyebrow">${D.promptLabel}</span><p>${esc(rd.prompt)}</p></div>
                        <b class="mg-draw__timer">${D.time(left)}</b>
                    </div>
                    <div class="mg-draw__tools">
                        <div class="mg-row" role="group" aria-label="${D.colors}">${COLORS.map((c, i) =>
                            `<button class="mg-swatch mg-swatch--sm" type="button" data-c="${i}" aria-label="${c}" aria-pressed="${i === 0}" style="--sw:${c};--sw2:${c}"></button>`).join('')}</div>
                        <div class="mg-row" role="group" aria-label="${D.sizes}">${SIZES.map((s, i) =>
                            `<button class="mg-tool" type="button" data-s="${i}" aria-pressed="${i === 1}" aria-label="${D.size[i]}"><i style="width:${4 + i * 6}px;height:${4 + i * 6}px"></i></button>`).join('')}
                            <button class="mg-tool mg-tool--text" type="button" data-erase aria-pressed="false">${D.eraser}</button>
                            <button class="mg-tool mg-tool--text" type="button" data-undo>${D.undo}</button>
                            <button class="mg-tool mg-tool--text" type="button" data-clear>${D.clear}</button>
                        </div>
                    </div>
                    <div class="mg-draw__pad"><canvas width="800" height="600" aria-label="${D.canvasLabel}"></canvas></div>
                </div>`;
            const canvas = $('canvas', box), g = canvas.getContext('2d');
            const blank = () => { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, canvas.width, canvas.height); };
            blank();
            const history = [];
            const snap = () => {
                history.push(g.getImageData(0, 0, canvas.width, canvas.height));
                if (history.length > 10) history.shift();
            };
            let drawing = false, last = null;
            const pos = e => {
                const b = canvas.getBoundingClientRect();
                return { x: (e.clientX - b.left) * canvas.width / b.width, y: (e.clientY - b.top) * canvas.height / b.height };
            };
            const stroke = (a, b) => {
                g.strokeStyle = erase ? '#FFFFFF' : color;
                g.lineWidth = erase ? size * 2 : size;
                g.lineCap = g.lineJoin = 'round';
                g.beginPath();
                g.moveTo(a.x, a.y);
                g.lineTo(b.x, b.y);
                g.stroke();
            };
            canvas.addEventListener('pointerdown', e => {
                if (finished) return;
                e.preventDefault();
                canvas.setPointerCapture(e.pointerId);
                snap();
                drawing = true;
                last = pos(e);
                stroke(last, { x: last.x + .1, y: last.y + .1 });
            });
            canvas.addEventListener('pointermove', e => {
                if (!drawing) return;
                const p = pos(e);
                stroke(last, p);
                last = p;
            });
            const up = () => { drawing = false; };
            canvas.addEventListener('pointerup', up);
            canvas.addEventListener('pointercancel', up);

            $$('[data-c]', box).forEach(b => b.addEventListener('click', () => {
                color = COLORS[+b.dataset.c];
                erase = false;
                $$('[data-c]', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
                $('[data-erase]', box).setAttribute('aria-pressed', 'false');
            }));
            $$('[data-s]', box).forEach(b => b.addEventListener('click', () => {
                size = SIZES[+b.dataset.s];
                $$('[data-s]', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            }));
            $('[data-erase]', box).addEventListener('click', e => {
                erase = !erase;
                e.currentTarget.setAttribute('aria-pressed', String(erase));
            });
            $('[data-undo]', box).addEventListener('click', () => { if (history.length) g.putImageData(history.pop(), 0, 0); });
            $('[data-clear]', box).addEventListener('click', () => { snap(); blank(); });

            const end = () => {
                if (finished) return;
                finished = true;
                clearInterval(timer);
                pics.push(canvas);
                round++;
                Sound.play('pop');
                if (round < t.rounds.length) drawRound();
                else compare();
            };
            const clock = $('.mg-draw__timer', box);
            clearInterval(timer);
            timer = setInterval(() => {
                if (!alive()) { clearInterval(timer); return; }
                left--;
                clock.textContent = left > 0 ? D.time(left) : D.timeUp;
                clock.classList.toggle('is-low', left <= 10);
                if (left <= 0) {
                    clearInterval(timer);
                    Sound.play('bad');
                    setTimeout(() => { if (alive()) end(); }, 700);
                }
            }, 1000);
            this.setNext(D.done, true);
            r.onNext = end;
            $('.lesson__body').scrollTop = 0;
        };

        const compare = () => {
            const lastRound = t.rounds[t.rounds.length - 1];
            box.innerHTML = this.head(MG.kicker, D.compareTitle) + `
                <div class="mg-draw__compare">${pics.map((c, i) => `<figure>
                    <img src="${c.toDataURL('image/png')}" alt="${D.yourDrawing(i + 1)}">
                    <figcaption><b>${D.round(i + 1, pics.length)}</b> ${esc(t.rounds[i].prompt)}</figcaption>
                </figure>`).join('')}</div>
                <p class="eyebrow mg-checks__title">${D.checkTitle}</p>
                <div class="mg-checks">${lastRound.parts.map((p, i) =>
                    `<label class="mg-check"><input type="checkbox" data-i="${i}"><span>${esc(p)}</span></label>`).join('')}</div>
                <p class="mg-hint">${D.checkHint}</p>`;
            $('.lesson__body').scrollTop = 0;
            this.setNext(D.compare, true);
            r.onNext = () => {
                const n = $$('.mg-check input:checked', box).length;
                $$('.mg-check input', box).forEach(i => { i.disabled = true; });
                // Оба рисунка рядом на одной картинке — для портфолио
                const W = 1200, H = 560, out = document.createElement('canvas');
                out.width = W;
                out.height = H;
                const g = out.getContext('2d');
                g.fillStyle = '#F6F6F2';
                g.fillRect(0, 0, W, H);
                g.fillStyle = '#0E0F12';
                g.textBaseline = 'top';
                pics.forEach((c, i) => {
                    const x = 30 + i * 585;
                    g.drawImage(c, x, 30, 555, 416);
                    g.font = `700 22px ${MG_FONT}`;
                    g.fillText(D.round(i + 1, pics.length), x, 462);
                    g.font = `500 20px ${MG_FONT}`;
                    mgWrap(g, t.rounds[i].prompt, 555).slice(0, 3).forEach((line, k) => g.fillText(line, x, 492 + k * 22));
                });
                mgKeepImage(this, t.title, out, t.rounds.map(rd => rd.prompt).join(' → '));
                r.onNext = () => this.nextTask();
                this.answered(null, { title: D.result(n, lastRound.parts.length), text: `${t.explain} ${D.saved}` });
            };
        };

        drawRound();
    },

    // Закрась лишнее: [[текст|почему]] в сообщении — секрет. Балл: (закрытые секреты − ½ за каждое лишнее слово) / секреты
    redact(t, box) {
        const R = MG.redact, r = this.run;
        const chunks = [];
        const re = /\[\[(.+?)\|(.+?)\]\]/g;
        let at = 0, m;
        const words = text => text.split(/(\s+)/).forEach(w => { if (w) chunks.push({ text: w, space: /^\s+$/.test(w) }); });
        while ((m = re.exec(t.message))) {
            words(t.message.slice(at, m.index));
            chunks.push({ text: m[1], why: m[2], secret: true });
            at = m.index + m[0].length;
        }
        words(t.message.slice(at));
        const secrets = chunks.filter(c => c.secret);

        box.innerHTML = this.head(MG.kicker, t.title, t.text) + `
            <div class="mg-redact">
                <p class="eyebrow">${esc(t.who || R.who)}</p>
                <p class="mg-redact__msg">${chunks.map((c, i) => (c.space ? c.text
                    : `<button class="mg-word" type="button" data-i="${i}" aria-pressed="false">${esc(c.text)}</button>`)).join('')}</p>
                <p class="mg-hint" aria-live="polite">${R.ask}</p>
                <ul class="mg-notes" hidden></ul>
            </div>`;
        const buttons = $$('.mg-word', box);
        const any = () => buttons.some(b => b.getAttribute('aria-pressed') === 'true');
        this.setNext(R.pick, false);
        buttons.forEach(b => b.addEventListener('click', () => {
            const on = b.getAttribute('aria-pressed') !== 'true';
            b.setAttribute('aria-pressed', String(on));
            b.classList.toggle('is-black', on);
            Sound.play('tap');
            this.setNext(any() ? R.check : R.pick, any());
        }));

        r.onNext = () => {
            let hit = 0, extra = 0;
            buttons.forEach(b => {
                const c = chunks[+b.dataset.i], on = b.getAttribute('aria-pressed') === 'true';
                b.disabled = true;
                if (c.secret) {
                    if (on) hit++;
                    b.classList.add(on ? 'is-hit' : 'is-missed');
                } else if (on) {
                    if (/\w/.test(c.text)) extra++;
                    b.classList.add('is-over');
                }
            });
            const notes = $('.mg-notes', box);
            notes.hidden = false;
            notes.innerHTML = secrets.map(c => {
                const on = buttons.find(b => chunks[+b.dataset.i] === c).getAttribute('aria-pressed') === 'true';
                return `<li class="${on ? 'is-ok' : 'is-miss'}"><b>${on ? '✓' : '✗'} “${esc(c.text)}”</b> ${on ? R.hit : R.missed}. ${esc(c.why)}</li>`;
            }).join('') + (extra ? `<li class="is-miss">${R.over(extra)}</li>` : '');
            $('.mg-hint', box).hidden = true;
            const score = Math.max(0, hit - extra * .5) / secrets.length;
            if (score < 1) {
                r.mistake = {
                    question: `${t.title}. ${t.text || ''}`,
                    answer: `Hid ${hit} of ${secrets.length} secrets, ${extra} extra words`,
                    correct: secrets.map(c => c.text).join('; '),
                    explain: secrets.map(c => c.why).join(' ')
                };
            }
            r.onNext = () => this.nextTask();
            this.answered(Math.round(score * 100) / 100, {
                title: score === 1 ? R.perfect : R.score(hit, secrets.length),
                text: t.explain
            });
        };
    },

    // Лестница подсказок: подсказки бесплатны (так работает хороший ИИ-репетитор), готовый ответ — половина балла
    hint(t, box) {
        const H = MG.hint;
        let used = 0, over = false;
        const norm = v => String(v).toLowerCase().replace(/coins?|\s/g, '').replace(',', '.');
        const answers = t.answers.map(norm);
        box.innerHTML = this.head(MG.kicker, t.title, t.text) + `
            <div class="mg-hintgame">
                <div class="mg-puzzle"><p class="eyebrow">${H.puzzle}</p><p class="mg-puzzle__q">${esc(t.puzzle)}</p></div>
                <form class="mg-answer" novalidate>
                    <label class="sr-only" for="mg-answer">${H.yourAnswer}</label>
                    <input id="mg-answer" class="mg-answer__in" inputmode="decimal" autocomplete="off" placeholder="${H.placeholder}">
                    <button class="btn btn--go" type="submit">${H.check}</button>
                </form>
                <p class="mg-hint" aria-live="polite">${H.ask}</p>
                <ol class="mg-ladder">${t.hints.map((h, i) => `<li class="mg-rung">
                    <button class="mg-rung__btn" type="button" data-i="${i}" ${i ? 'disabled' : ''}>${H.hintBtn(i + 1)}</button>
                    <p class="mg-rung__text" hidden>${esc(h)}</p>
                </li>`).join('')}</ol>
                <button class="link-btn link-btn--danger mg-giveup" type="button">${H.answerBtn}</button>
            </div>`;
        this.setNext(H.locked, false);
        const input = $('.mg-answer__in', box), hint = $('.mg-hint', box);
        const rungs = $$('.mg-rung__btn', box);

        const finish = (score, title) => {
            over = true;
            input.classList.remove('is-wrong');
            input.disabled = true;
            $('.mg-answer button', box).disabled = true;
            $('.mg-giveup', box).hidden = true;
            rungs.forEach(b => { b.disabled = true; });
            hint.hidden = true;
            box.insertAdjacentHTML('beforeend', `<div class="mg-solution"><p class="eyebrow">${H.solution}</p><p>${esc(t.solution)}</p></div>`);
            this.answered(score, { title, text: t.explain });
        };

        rungs.forEach((b, i) => b.addEventListener('click', () => {
            if (over) return;
            b.disabled = true;
            b.classList.add('is-open');
            b.nextElementSibling.hidden = false;
            used = Math.max(used, i + 1);
            if (rungs[i + 1]) rungs[i + 1].disabled = false;
            Sound.play('pop');
        }));
        $('.mg-answer', box).addEventListener('submit', e => {
            e.preventDefault();
            if (over) return;
            const v = norm(input.value);
            if (!v) { hint.textContent = H.empty; return; }
            if (answers.includes(v)) {
                Sound.play('good');
                finish(1, used ? H.withHints(used) : H.alone);
                return;
            }
            Sound.play('bad');
            input.classList.remove('is-wrong');
            void input.offsetWidth;
            input.classList.add('is-wrong');
            hint.className = 'mg-hint is-bad';
            hint.textContent = H.wrong(used < t.hints.length);
        });
        $('.mg-giveup', box).addEventListener('click', () => {
            if (over) return;
            this.run.mistake = { question: t.puzzle, answer: 'Asked for the answer', correct: t.solution, explain: t.explain };
            finish(.5, H.gaveUp);
        });
    }
});
