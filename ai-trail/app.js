'use strict';

// Курс только на английском. Язык уходит в Блупа-помощника и в результаты уроков.
const LANG = 'en';

// Настройки
const CONFIG = {
    // Webhook для результатов уроков (Make.com → Custom Webhook → Google Sheets).
    // Пусто — результаты никуда не отправляются, прогресс живёт только в браузере.
    resultsWebhook: '',
    // Адрес Блупа-помощника (Cloudflare Worker из папки worker/), например https://bloop-tutor.имя.workers.dev
    // Пусто — помощник выключен: кнопки «Спросить Блупа» нет, «Объясни Блупу» работает как самопроверка.
    tutorUrl: 'https://bloop-tutor.kirillsotnikov12345.workers.dev/',
    storageKey: 'bloop-trail-en-v1',
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

// Блуп — это Бобик из bobik.js в палитре peach (переменные --rb-* в style.css)
const blup = pose => bob(STATES[pose] || STATES.neutral).replace(/<title>[^<]*<\/title>/, '');

// Тексты интерфейса. Контент уроков — в course.en.js.
const UI = {
    good: ['Correct!', 'Bullseye!', 'Nailed it!', 'Nice one!', 'Big brain move!', 'Keep it up!'],
    bad: ['Almost!', 'Not quite', 'Missed, but that’s OK'],
    letters: 'ABCDE',
    soundOff: 'Turn sound off', soundOn: 'Turn sound on',
    hi: name => (name ? `Hi, ${name}!` : 'Hi!'),
    helloKicker: (n, title, done, total) => `Block ${n} · ${title} · ${done} of ${total} stations`,
    level: (n, title) => `Level ${n} · ${title}`,
    resume: title => `Continue: ${title}`,
    blockDone: 'Trail complete 🏆',
    next: title => `Next: ${title}`,
    start: title => `Start: ${title}`,
    block: n => `Block ${n}`,
    soon: 'coming soon',
    finale: 'Block finale', bossKicker: 'Final boss',
    station: n => `Station ${n}`,
    locked: '🔒 locked',
    passed: 'done',
    resumeShort: '▶ continue',
    minutes: n => `${n} min`,
    tasks: n => `${n} ${n === 1 ? 'task' : 'tasks'}`,
    questions: n => `${n} ${n === 1 ? 'question' : 'questions'}`,
    newStation: 'New station!',
    soonToast: title => `“${title}” is coming soon 🌱`,
    firstPass: title => `Finish “${title}” first`,
    kind: { theory: '📖 Theory', video: '🎬 Video', practice: '🧩 Practice', ai: '🤖 With Bloop', test: '✅ Test' },
    best: (stars, pct) => `Best result: ${stars} · ${pct}%`,
    rule: n => `${n} ${n === 1 ? 'task' : 'tasks'}. Get 50% right to pass the station.`,
    resumeFrom: n => `Continue from task ${n}`,
    replay: 'Play again',
    begin: 'Start',
    resumed: n => `Picking up from task ${n}`,
    saved: 'Progress saved, you’ll continue from here',
    btn: {
        next: 'Next', gotIt: 'Got it!', watch: 'Finish the video', choose: 'Pick an answer',
        sortAll: 'Sort all the cards', build: 'Build the prompt', tapSentence: 'Tap a sentence',
        pickWord: 'Pick a word', tried: 'I tried it ✓', order: 'Put every step in order'
    },
    sideQuest: 'Side quest',
    extraTag: 'optional · harder',
    extraChip: '🧭 Side quest: optional and harder',
    pages: 'Trail blocks', prevPage: 'Previous block', nextPage: 'Next block',
    orderHint: 'Tap the steps in order: which one comes first?',
    orderPerfect: 'Perfect order!',
    orderScore: (c, n) => `${c} of ${n} on the first try`,
    orderText: 'The order of the steps is what makes it work.',
    combo: n => `${n} in a row! 🔥`,
    practice: '🧩 Practice', experiment: '🧩 Experiment',
    video: sec => `🎬 Video · ${sec} sec`,
    quizKicker: (test, n, total, boss) => `${boss ? '⚡ Rapid fire' : test ? '🌳 Challenge' : '✅ Test'} · question ${n} of ${total}`,
    prompt: 'Prompt', tap: 'Tap',
    storyboard: 'Video storyboard', draft: 'Draft video', play: 'Watch the video',
    playHint: 'Press ▶ to watch. Tap the screen for the next scene.',
    pause: 'Pause', replayVideo: 'Watch again', resumeVideo: 'Play',
    correctIs: (text, explain) => `Correct answer: “${text}”. ${explain}`,
    sortAsk: 'Where does this card go?',
    sortDone: (r, n) => `Done: ${r} of ${n}`,
    perfect: 'Perfect!',
    sortScore: (r, n) => `${r} of ${n} correct`,
    sortPerfectText: 'Every card is in the right place.',
    sortHint: 'The notes under the cards will help next time.',
    yourPrompt: 'Your prompt', ai: 'AI',
    buildPerfect: 'Dream prompt!',
    buildScore: (c, n) => `${c} of ${n} on the first try`,
    buildText: 'Role + Task + Context + Format, and AI hits the target.',
    aiAnswer: '🤖 AI’s answer',
    pollMatch: 'You think like a neural network!', pollOther: 'A neural network would pick another word',
    copy: 'Copy', copied: 'Copied ✓', selected: 'Selected, now copy it',
    almost: 'So close', stationDone: 'Station complete!',
    leadFail: 'You need at least 50% correct. One more try and you’ve got it.',
    leadReplay: 'Replays give XP only if you beat your best result. You can still improve your stars.',
    leadDone: title => `“${title}” is in the bag.`,
    starsOf: n => `${n} of 3 stars`,
    statXp: 'XP earned', statAcc: 'accuracy', statRun: 'best streak',
    blockCompleted: (title, xp) => `Block “${title}” complete! +${xp} XP`,
    levelUp: (n, title) => `New level ${n}: ${title}`,
    badge: (title, desc) => `Badge “${title}”: ${desc.toLowerCase()}`,
    toMap: 'To the map →', again: 'Try again', map: 'To the map',
    nextBlock: title => `Next up: “${title}”. This block opens soon 🌱`,
    badgeHave: ', earned', badgeMissing: ', not earned yet',
    welcome: name => `Nice to meet you, ${name}! Tap the first station`,
    savedSettings: 'Saved',
    resetDone: 'Progress reset. Starting the trail over',
    close: 'Close',
    tutorAsk: 'Ask Bloop 💬',
    tutorKicker: 'Mistake review',
    tutorTitle: 'Ask Bloop',
    tutorStart: 'Why is my answer wrong?',
    tutorPlaceholder: 'Type your question…',
    tutorNote: 'Bloop keeps it friendly and on topic. Don’t share personal info.',
    tutorSend: 'Send',
    tutorThinking: 'Bloop is thinking',
    tutorError: 'Bloop is offline right now. Try again a bit later.',
    tutorTired: 'Bloop is tired for today. Come back tomorrow!',
    tutorLimit: 'That’s enough questions for this task, tap Next',
    you: 'You', bloop: 'Bloop',
    talkKicker: '🤖 Check with Bloop',
    talkPlaceholder: 'Write your answer in your own words…',
    talkHint: 'Bloop will read your answer and tell you what’s missing.',
    talkOffline: 'Write your answer in your own words, then compare it with the example.',
    talkShow: 'Show an example answer',
    talkPoints: 'A good answer covers:',
    talkSample: 'Example answer:',
    talkWait: 'Answer Bloop first',
    verdict: { yes: '✓ Nailed it', partly: '≈ Almost', no: '✗ Not yet' },
    chatKicker: '🤖 Try it with Bloop',
    chatHint: 'Bloop is AI too: it answers like a regular chatbot and can be wrong too.',
    chatPrompts: 'Ready-made messages: tap one to put it in the box',
    chatPlaceholder: 'Write your prompt…',
    chatNew: '↺ New chat',
    chatNewDone: 'New chat: Bloop forgot the old conversation',
    chatFill: 'Replace the [brackets] with your own words first',
    chatWait: 'Send your prompt to Bloop',
    chatOffline: 'Bloop is offline right now. Copy the prompt and try it in a chatbot you’re allowed to use.',
    bossHp: 'HP',
    bossHit: n => `−${n} HP`,
    bossWin: name => `${name} is defeated!`,
    bossLose: name => `${name} is still standing`,
    bossLeadWin: 'You beat the final boss with real skills: clear prompts, fact-checking, guarding your data and honest work.',
    bossLeadFail: 'Knock out at least half of the boss’s HP. You’ve seen the mistakes, so try again.'
};

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

// ---------- Блуп-помощник: запросы к воркеру и чат ----------
const Tutor = {
    get enabled() { return !!CONFIG.tutorUrl; },

    async ask(payload) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 30000);
        try {
            const res = await fetch(CONFIG.tutorUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lang: LANG, ...payload }),
                signal: ctrl.signal
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || typeof data.reply !== 'string') {
                console.warn('Bloop tutor:', res.status, data.error || '', data.detail || '');
                throw new Error(data.error || 'http ' + res.status);
            }
            return data;
        } finally {
            clearTimeout(timer);
        }
    },

    // Лента сообщений + форма. Вся переписка уходит в воркер, у ученика не больше maxTurns сообщений.
    // guard(text) может не пустить сообщение (например, с незаполненными [скобками]).
    // Сообщение с грубыми словами воркер не отправляет в модель (blocked): эта пара не остаётся в переписке.
    chat({ log, form, mode, lesson, context, maxTurns, maxLength = 500, guard, onReply, onFail }) {
        const input = $('textarea', form);
        const sendBtn = $('button[type="submit"]', form);
        const placeholder = input.placeholder;
        let history = [];
        let turns = 0, busy = false, epoch = 0;

        const add = (who, text, extra) => {
            const p = document.createElement('p');
            p.className = `bubble bubble--${who}${extra ? ' ' + extra : ''}`;
            p.innerHTML = `<span class="bubble__who">${who === 'me' ? UI.you : UI.bloop}</span>`;
            p.appendChild(document.createTextNode(text));
            log.appendChild(p);
            p.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
            return p;
        };
        const lock = on => { input.disabled = sendBtn.disabled = on; };

        const send = async text => {
            text = String(text || '').trim().slice(0, maxLength);
            if (!text || busy || turns >= maxTurns) return;
            if (guard && !guard(text)) return;
            const my = epoch;
            busy = true;
            turns++;
            lock(true);
            input.value = '';
            add('me', text);
            history.push({ role: 'user', content: text });
            const typing = add('ai', UI.tutorThinking, 'is-typing');
            try {
                const data = await Tutor.ask({ mode, lesson, context, messages: history });
                if (my !== epoch) return;
                typing.remove();
                if (data.blocked) {
                    history.pop();
                    add('ai', data.reply, 'is-error');
                    return;
                }
                history.push({ role: 'assistant', content: data.reply });
                const bubble = add('ai', data.reply);
                if (onReply) onReply(data, bubble);
            } catch (e) {
                if (my !== epoch) return;
                typing.remove();
                history.pop();
                turns--;
                add('ai', e.message === 'quota' ? UI.tutorTired : UI.tutorError, 'is-error');
                if (onFail) onFail(e);
            } finally {
                if (my === epoch) {
                    busy = false;
                    lock(turns >= maxTurns);
                    if (turns >= maxTurns) input.placeholder = UI.tutorLimit;
                }
            }
        };

        // Новый чат: Блуп забывает переписку, лимит сообщений начинается заново
        const reset = () => {
            epoch++;
            history = [];
            turns = 0;
            busy = false;
            log.innerHTML = '';
            lock(false);
            input.placeholder = placeholder;
        };

        form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); }
        });
        return { send, reset };
    }
};

const chatForm = (placeholder, maxLength = 500) => `<form class="chat-form">
    <textarea rows="2" maxlength="${maxLength}" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}"></textarea>
    <button class="btn btn--go" type="submit" aria-label="${esc(UI.tutorSend)}">➤</button>
</form>`;

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
// Три раскладки. v — телефон: тропа сверху вниз. h — компьютер и планшет лёжа: слева направо.
// book — планшет стоя (книжная ориентация): тоже слева направо, но страница выше, блоки листаются как главы.
// Главная тропа идёт через все обязательные станции. Ответвление (урок с extra) отходит от своей станции
// узкой пунктирной тропкой и обратно не возвращается: его можно пропустить.
const MAPS = {
    v: { dir: 'v', W: 360, GATE_GAP: 110, STEP: 140, XS: [100, 260] },
    h: { dir: 'h', H: 540, GATE_GAP: 200, STEP: 190, Y: 330, WAVE: 26, EXTRA_Y: 150 },
    book: { dir: 'h', H: 760, GATE_GAP: 200, STEP: 180, Y: 450, WAVE: 34, EXTRA_Y: 230 }
};

function mapMode() {
    if (window.matchMedia('(max-width: 599px)').matches) return 'v';
    return window.matchMedia('(orientation: portrait)').matches ? 'book' : 'h';
}

// Контрольные точки кривой: в раскладке v тропа выходит из станции вниз, в h — вправо
function bend(a, b, dir) {
    if (dir === 'h') {
        const dx = (b.x - a.x) / 2;
        return [{ x: a.x + dx, y: a.y }, { x: b.x - dx, y: b.y }];
    }
    const dy = (b.y - a.y) / 2;
    return [{ x: a.x, y: a.y + dy }, { x: b.x, y: b.y - dy }];
}

function cubicPoint(a, b, t, dir) {
    const [c1, c2] = bend(a, b, dir);
    const u = 1 - t;
    return {
        x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
        y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y
    };
}

function segmentD(a, b, dir) {
    const [c1, c2] = bend(a, b, dir);
    return ` C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
}

// Общие поля станции: номер в общем списке, номер на главной тропе блока, тип
function nodeBase(block, bi, lesson, li) {
    const st = block.soon ? null : Game.findStation(lesson.id);
    const num = block.lessons.slice(0, li + 1).filter(l => !l.extra && !l.test).length;
    return {
        block, bi, lesson, li, num,
        soon: !!block.soon, big: !!lesson.test, boss: !!lesson.boss, extra: !!lesson.extra,
        index: st ? st.index : -1
    };
}

const around = (n, r) => ({ x1: n.x - r, x2: n.x + r, y1: n.y - r, y2: n.y + r + 4 });

function layoutV(M) {
    const W = M.W, mid = W / 2;
    const L = { mode: 'v', dir: 'v', W, pts: [{ x: mid, y: 0 }], gates: [], nodes: [], zones: [], branches: [], boxes: [] };
    let y = 80, k = 0;

    COURSE.blocks.forEach((block, bi) => {
        L.gates.push({ x: mid, y, block, bi });
        L.zones.push({ bi, from: bi === 0 ? 0 : y - 70, soon: !!block.soon });
        L.boxes.push({ x1: 40, x2: W - 40, y1: y - 52, y2: y + 52 });
        L.pts.push({ x: mid, y });
        let first = true, last = null, hold = null, afterExtra = false;

        block.lessons.forEach((lesson, li) => {
            const base = nodeBase(block, bi, lesson, li);
            if (base.extra && last) {
                // Ответвление уходит на другую сторону карты, подпись под ним; главная тропа идёт прямо вниз
                const node = { ...base, x: last.x < mid ? W - 98 : 98, y: last.y + M.STEP, parent: last, label: 'below' };
                L.nodes.push(node);
                L.branches.push({ a: last, b: node });
                L.boxes.push(around(node, 40), { x1: node.x - 92, x2: node.x + 92, y1: node.y + 30, y2: node.y + 134 });
                y = node.y;
                hold = last.x;
                afterExtra = true;
                return;
            }
            y += first ? M.GATE_GAP : M.STEP + (afterExtra ? 52 : 0);
            first = false;
            const x = hold !== null ? hold : M.XS[k++ % 2];
            hold = null;
            afterExtra = false;
            const node = { ...base, x, y, pt: L.pts.length, label: x > mid ? 'left' : 'right' };
            L.pts.push({ x, y });
            L.nodes.push(node);
            last = node;
            const left = x > mid;
            L.boxes.push({ x1: left ? 6 : x + 36, x2: left ? x - 36 : W - 6, y1: y - 40, y2: y + 40 }, around(node, 46));
        });
        y += M.GATE_GAP + (afterExtra ? 70 : 0);
    });

    L.end = { x: mid, y: y + 10 };
    L.pts.push(L.end);
    L.H = L.end.y + 70;
    L.zones.forEach((z, i) => { z.to = i + 1 < L.zones.length ? L.zones[i + 1].from + 14 : L.H; });
    return L;
}

function layoutH(M, mode) {
    const H = M.H;
    const L = { mode, dir: 'h', H, STEP: M.STEP, pts: [{ x: 0, y: M.Y }], gates: [], nodes: [], zones: [], branches: [], boxes: [] };
    let x = 150, k = 0;

    COURSE.blocks.forEach((block, bi) => {
        if (bi > 0) x += M.GATE_GAP;
        L.gates.push({ x, y: M.Y, block, bi });
        L.zones.push({ bi, from: bi === 0 ? 0 : x - 110, soon: !!block.soon });
        L.boxes.push({ x1: x - 124, x2: x + 124, y1: M.Y - 74, y2: M.Y + 74 });
        L.pts.push({ x, y: M.Y });
        let first = true, last = null;

        block.lessons.forEach((lesson, li) => {
            const base = nodeBase(block, bi, lesson, li);
            if (base.extra && last) {
                // Ответвление поднимается над тропой между своей станцией и следующей, подпись над ним
                const node = { ...base, x: last.x + M.STEP / 2, y: M.EXTRA_Y, parent: last, label: 'above' };
                L.nodes.push(node);
                L.branches.push({ a: last, b: node });
                L.boxes.push(around(node, 40), { x1: node.x - M.STEP / 2, x2: node.x + M.STEP / 2, y1: node.y - 120, y2: node.y - 28 });
                return;
            }
            x += first ? M.GATE_GAP : M.STEP;
            first = false;
            const y = M.Y + (k++ % 2 ? M.WAVE : -M.WAVE);
            const node = { ...base, x, y, pt: L.pts.length, label: 'below' };
            L.pts.push({ x, y });
            L.nodes.push(node);
            last = node;
            L.boxes.push(around(node, 46), { x1: x - M.STEP / 2 + 8, x2: x + M.STEP / 2 - 8, y1: y + 30, y2: y + 124 });
        });
    });

    L.end = { x: x + 130, y: M.Y };
    L.pts.push(L.end);
    L.W = L.end.x + 90;
    L.zones.forEach((z, i) => { z.to = i + 1 < L.zones.length ? L.zones[i + 1].from + 14 : L.W; });
    return L;
}

function buildLayout(mode) {
    const M = MAPS[mode];
    const L = M.dir === 'v' ? layoutV(M) : layoutH(M, mode);
    let d = `M${L.pts[0].x} ${L.pts[0].y}`;
    for (let i = 1; i < L.pts.length; i++) d += segmentD(L.pts[i - 1], L.pts[i], L.dir);
    L.d = d;
    // Тропка ответвления всегда изгибается по вертикали: вниз на телефоне, вверх на широком экране
    L.branches.forEach(br => { br.d = `M${br.a.x} ${br.a.y}` + segmentD(br.a, br.b, 'v'); });
    return L;
}

// Деревья вокруг тропы: не на тропе, не под подписями и воротами
function scatterTrees(L) {
    const r = Forest.rng(20261004);
    const samples = [];
    const sample = (a, b, dir) => { for (let t = 0; t <= 1; t += .08) samples.push(cubicPoint(a, b, t, dir)); };
    for (let i = 1; i < L.pts.length; i++) sample(L.pts[i - 1], L.pts[i], L.dir);
    L.branches.forEach(br => sample(br.a, br.b, 'v'));

    const target = L.W * L.H / 3240;
    const trees = [];
    for (let i = 0; i < target * 5 && trees.length < target; i++) {
        const x = 8 + r() * (L.W - 16);
        const y = 30 + r() * (L.H - 40);
        const at = L.dir === 'v' ? y : x;
        const zone = L.zones.find(z => at >= z.from && at < z.to) || L.zones[0];
        const [type, , min, max] = Forest.pickType(Forest.MIX[zone.bi % Forest.MIX.length], r);
        const s = min + r() * (max - min);
        const reach = Math.max(14, s * .45);
        if (samples.some(p => Math.hypot(p.x - x, p.y - y) < 22 + reach)) continue;
        if (L.boxes.some(b => x + reach > b.x1 && x - reach < b.x2 && y > b.y1 && y - s < b.y2)) continue;
        if (trees.some(t => Math.hypot(t.x - x, t.y - y) < (t.s + s) * .35)) continue;
        trees.push({ type, x: Math.round(x), y: Math.round(y), s });
    }
    return trees.sort((a, b) => a.y - b.y);
}

function mapSvg(L) {
    const { W, H } = L;
    // Волнистая граница зоны: по горизонтали на телефоне, по вертикали на широком экране
    const edge = from => {
        let d;
        if (L.dir === 'v') {
            d = `M0 ${from + 12}`;
            for (let x = 0; x < W; x += 60) d += ` Q${x + 30} ${from - 6} ${x + 60} ${from + 12}`;
            return d;
        }
        d = `M${from + 12} 0`;
        for (let y = 0; y < H; y += 60) d += ` Q${from - 6} ${y + 30} ${from + 12} ${y + 60}`;
        return d;
    };
    const band = z => (L.dir === 'v' ? `${edge(z.from)} V${z.to} H0 Z` : `${edge(z.from)} H${z.to} V0 Z`);
    const grounds = L.zones.map(z => z.bi === 0
        ? (L.dir === 'v'
            ? `<rect class="z1" x="0" y="0" width="${W}" height="${z.to}"/>`
            : `<rect class="z1" x="0" y="0" width="${z.to}" height="${H}"/>`)
        : `<path class="z${(z.bi % 3) + 1}" d="${band(z)}"/>`).join('');
    const trees = scatterTrees(L).map(t => Forest[t.type](t.x, t.y, t.s)).join('');
    const fog = L.zones.filter(z => z.soon).map(z => `<path class="fog" d="${band(z)}"/>`).join('');
    const branches = L.branches.map((br, i) => `<g class="branch" id="branch-${i}">
            <path class="branch__edge" d="${br.d}"/><path class="branch__path" d="${br.d}"/><path class="branch__dash" d="${br.d}"/>
        </g>`).join('');

    const r = Forest.rng(7);
    let flies = '';
    for (let i = 0; i < Math.round(W * H / 21600); i++) {
        flies += `<circle cx="${Math.round(10 + r() * (W - 20))}" cy="${Math.round(20 + r() * (H - 40))}" r="2.2" style="animation-delay:${(r() * 3).toFixed(2)}s"/>`;
    }

    return `<svg class="map__svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">
        ${grounds}
        ${branches}
        <path class="trail-edge" d="${L.d}"/>
        <path class="trail" id="trail" d="${L.d}"/>
        <path class="trail-steps" d="${L.d}"/>
        <path class="trail-done" id="trail-done" d="${L.d}"/>
        ${trees}${fog}
        <g class="fireflies">${flies}</g>
    </svg>`;
}

const KIND = { cards: 'theory', video: 'video', quiz: 'test', sort: 'practice', build: 'practice', spot: 'practice', order: 'practice', poll: 'practice', talk: 'ai', chat: 'ai' };

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
        this.mountTutor();
        this.mountBoss();
        this.mountNav();
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
        btn.setAttribute('aria-label', this.state.sound ? UI.soundOff : UI.soundOn);
    },

    renderHello() {
        const s = this.state;
        const lv = Game.levelFor(s.xp);
        const st = Game.stations()[Game.currentIndex(s)];
        const t = Game.totals(s);
        const resume = s.current && Game.findStation(s.current.lessonId);

        $('#hello-title').textContent = UI.hi(s.name);
        $('#hello-kicker').textContent = UI.helloKicker(st.blockIndex + 1, st.block.title, t.lessonsDone, t.mainTotal);
        $('#level-name').textContent = UI.level(lv.level, lv.title);
        $('#level-xp').textContent = lv.to ? `${s.xp} / ${lv.to} XP` : `${s.xp} XP`;
        $('#level-fill').style.width = Math.round(lv.progress * 100) + '%';
        $('#level-bar').setAttribute('aria-valuenow', String(Math.round(lv.progress * 100)));

        const btn = $('#continue-btn');
        if (resume) btn.textContent = UI.resume(resume.lesson.title);
        else if (t.lessonsDone === t.mainTotal) btn.textContent = UI.blockDone;
        else btn.textContent = (t.lessonsDone ? UI.next : UI.start)(st.lesson.title);
    },

    renderMap() {
        const mode = this.mode = mapMode();
        const L = this.layout = buildLayout(mode);
        const s = this.state;
        const cur = Game.currentIndex(s);
        const pct = (v, total) => (v / total * 100).toFixed(3) + '%';
        const X = v => pct(v, L.W), Y = v => pct(v, L.H);

        const gates = L.gates.map(g => {
            const main = g.block.lessons.filter(l => !l.extra);
            const done = g.block.soon ? 0 : main.filter(l => Game.passed(s, l.id)).length;
            const kicker = `${UI.block(g.bi + 1)} · ${g.block.soon ? UI.soon : `${done}/${main.length}`}`;
            return `<div class="gate${g.block.soon ? ' gate--soon' : ''}" style="left:${X(g.x)};top:${Y(g.y)}">
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
            const kicker = this.kicker(n);
            let meta;
            if (status === 'soon') meta = UI.soon;
            else if (status === 'locked') meta = UI.locked;
            else if (status === 'done') meta = `<span class="label__stars">${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}</span> · ${UI.passed}`;
            else meta = resume ? UI.resumeShort : `▶ ${UI.minutes(n.lesson.minutes)} · ${UI.tasks(n.lesson.tasks.length)}`;
            const icon = status === 'soon' ? '?' : n.lesson.icon;
            const name = `${kicker}: ${n.lesson.title}${n.extra ? ` (${UI.extraTag})` : ''}`;

            // Подпись: сбоку от станции на телефоне, под станцией на широком экране, над ответвлением
            const off = n.big ? 50 : n.extra ? 38 : 44;
            let place;
            if (n.label === 'right') place = `left:${X(n.x + off)};top:${Y(n.y)}`;
            else if (n.label === 'left') place = `right:${X(L.W - n.x + off)};top:${Y(n.y)}`;
            else if (n.label === 'below') place = `left:${X(n.x)};top:${Y(n.y + off - 4)}`;
            else place = `left:${X(n.x)};top:${Y(n.y - off + 4)}`;
            if (L.dir === 'h') place += `;max-width:${X(L.STEP - 20)}`;

            return `<button class="node node--${status}${n.big ? ' node--big' : ''}${n.boss ? ' node--boss' : ''}${n.extra ? ' node--extra' : ''}" type="button" data-node="${i}"
                    style="left:${X(n.x)};top:${Y(n.y)}" aria-label="${esc(name)}">${icon}</button>
                <button class="label label--${status} label--${n.label}${n.extra ? ' label--extra' : ''}" type="button" data-node="${i}" tabindex="-1"
                    style="${place}" aria-hidden="true">
                    <span class="label__kicker">${kicker}</span>
                    <span class="label__title">${esc(n.lesson.title)}</span>
                    ${n.extra ? `<span class="label__tag">${UI.extraTag}</span>` : ''}
                    <span class="label__meta">${meta}</span>
                </button>`;
        }).join('');

        const map = $('#map');
        map.className = `map map--${mode}`;
        map.innerHTML = `<div class="map__inner">${mapSvg(L)}<div class="map__layer">${gates}${nodes}
            <span class="finish" style="left:${X(L.end.x)};top:${Y(L.end.y)}" aria-hidden="true">🏆</span>
            <div class="blup" id="blup"><div class="blup__body" id="blup-body"></div><span class="blup__bubble" id="blup-bubble" hidden></span></div>
        </div></div>`;
        this.fitMap();

        L.branches.forEach((br, i) => {
            const g = $(`#branch-${i}`);
            g.classList.toggle('is-done', Game.passed(s, br.b.lesson.id));
            g.classList.toggle('is-locked', !Game.isUnlocked(s, br.b.index));
        });

        this.measureTrail();
        let at = this.nodeByIndex(Math.min(s.blupAt || 0, cur));
        if (!at || at.extra) at = this.nodeByIndex(cur);
        this.placeBlup(at, 'hello');
        this.setTrailDone(this.lenAt[at.pt]);
        this.renderNav();
    },

    // Подпись станции: номер на главной тропе, «ответвление», «финал блока» или «финальный босс»
    kicker(n) {
        if (n.lesson.boss) return UI.bossKicker;
        if (n.lesson.test) return UI.finale;
        if (n.extra) return UI.sideQuest;
        return UI.station(n.num);
    },

    // На широком экране карта — лента нужной высоты, ширина считается из пропорций тропы
    fitMap() {
        const L = this.layout;
        const inner = $('#map .map__inner');
        if (L.dir !== 'h') { inner.style.width = ''; return; }
        inner.style.width = Math.round($('#map').clientHeight * L.W / L.H) + 'px';
    },

    // Листание по блокам: на широком экране блок — как глава книги
    renderNav() {
        const nav = $('#map-nav');
        const L = this.layout;
        nav.hidden = L.dir !== 'h';
        if (nav.hidden) return;
        $('.map-nav__dots', nav).innerHTML = L.gates.map(g =>
            `<button type="button" data-page="${g.bi}" aria-label="${esc(UI.block(g.bi + 1) + ': ' + g.block.title)}"></button>`).join('');
        this.syncNav();
    },

    // Какой блок сейчас на экране: последние ворота, левее трети ширины
    pageNow() {
        const map = $('#map'), L = this.layout;
        const scale = map.scrollWidth / L.W;
        const edge = map.scrollLeft + map.clientWidth / 3;
        let page = 0;
        L.gates.forEach(g => { if (g.x * scale - 130 * scale <= edge) page = g.bi; });
        return page;
    },

    syncNav() {
        const nav = $('#map-nav');
        if (!nav || nav.hidden) return;
        const map = $('#map'), L = this.layout;
        const page = this.pageNow();
        const g = L.gates[page];
        $('.map-nav__title', nav).textContent = `${UI.block(page + 1)} · ${g.block.title}`;
        $$('.map-nav__dots button', nav).forEach((b, i) => b.classList.toggle('is-on', i === page));
        $('[data-dir="-1"]', nav).disabled = map.scrollLeft < 4;
        $('[data-dir="1"]', nav).disabled = map.scrollLeft + map.clientWidth >= map.scrollWidth - 4;
    },

    goPage(page) {
        const map = $('#map'), L = this.layout;
        const g = L.gates[Math.max(0, Math.min(L.gates.length - 1, page))];
        const scale = map.scrollWidth / L.W;
        map.scrollTo({ left: Math.max(0, (g.x - 140) * scale), behavior: REDUCED ? 'auto' : 'smooth' });
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
            d += segmentD(L.pts[i - 1], L.pts[i], L.dir);
            probe.setAttribute('d', d);
            this.lenAt.push(probe.getTotalLength());
        }
        probe.remove();
        this.trailTotal = this.lenAt[this.lenAt.length - 1];
    },

    setTrailDone(len) {
        $('#trail-done').style.strokeDasharray = `${len} ${this.trailTotal + 10}`;
    },

    // Блуп стоит на тропе: на телефоне — сбоку от станции, со стороны края карты; на широком экране — перед станцией
    placeBlup(node, pose, bubble) {
        const el = $('#blup');
        if (this.layout.dir === 'h') {
            this.moveBlup(node.x - (node.big ? 62 : 56), node.y + 6);
            el.classList.remove('is-left', 'is-edge-right');
        } else {
            const outward = node.x < 180 ? -1 : 1;
            this.moveBlup(node.x + outward * (node.big ? 60 : 54), node.y + 6);
            el.classList.toggle('is-left', outward > 0);
            el.classList.toggle('is-edge-right', outward > 0);
        }
        $('#blup-body').innerHTML = blup(pose);
        $('#blup-bubble').hidden = !bubble;
        $('#blup-bubble').textContent = bubble || '';
    },

    moveBlup(x, y) {
        const el = $('#blup');
        el.style.left = (x / this.layout.W * 100) + '%';
        el.style.top = (y / this.layout.H * 100) + '%';
    },

    // Показать станцию: на телефоне прокручиваем страницу, на широком экране — ленту карты
    reveal(el, smooth) {
        const behavior = smooth && !REDUCED ? 'smooth' : 'auto';
        if (this.layout.dir === 'h') {
            const map = $('#map');
            const box = el.getBoundingClientRect(), frame = map.getBoundingClientRect();
            map.scrollTo({ left: map.scrollLeft + box.left - frame.left - (frame.width - box.width) / 2, behavior });
            const top = frame.top, bottom = frame.bottom;
            if (top < 60 || bottom > window.innerHeight) map.scrollIntoView({ block: 'nearest', behavior });
        } else {
            el.scrollIntoView({ block: 'center', behavior });
        }
    },

    async walk(fromIndex, toIndex) {
        const a = this.nodeByIndex(fromIndex), b = this.nodeByIndex(toIndex);
        const target = $(`.node[data-node="${this.layout.nodes.indexOf(b)}"]`);
        this.reveal(target, true);
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
        this.placeBlup(b, 'victory', UI.newStation);
        target.classList.add('is-pop');
        Sound.play('pop');
        setTimeout(() => { if ($('#blup-body')) this.placeBlup(b, 'hello'); }, 1800);
    },

    scrollToCurrent(smooth) {
        const node = this.nodeByIndex(Game.currentIndex(this.state));
        const el = $(`.node[data-node="${this.layout.nodes.indexOf(node)}"]`);
        if (!el) return;
        if (this.layout.dir === 'h') {
            // Открываем блок текущей станции с начала, как страницу; если станция дальше экрана — ставим её на треть ширины
            const map = $('#map'), L = this.layout;
            const scale = map.scrollWidth / L.W;
            const start = (L.gates[node.bi].x - 140) * scale;
            const at = node.x * scale;
            const left = at - start < map.clientWidth - 160 ? start : at - map.clientWidth / 3;
            map.scrollTo({ left: Math.max(0, left), behavior: smooth && !REDUCED ? 'smooth' : 'auto' });
            return;
        }
        if (el.getBoundingClientRect().bottom > window.innerHeight - 40) this.reveal(el, smooth);
    },

    onNodeClick(n) {
        Sound.play('tap');
        if (n.soon) {
            this.toast(UI.soonToast(n.block.title));
            return;
        }
        if (!Game.isUnlocked(this.state, n.index)) {
            const st = Game.stations()[n.index];
            const prev = Game.stations()[st.extra ? st.parent : st.prevMain].lesson;
            const el = $(`.node[data-node="${this.layout.nodes.indexOf(n)}"]`);
            el.classList.remove('is-shake');
            void el.offsetWidth;
            el.classList.add('is-shake');
            this.toast(UI.firstPass(prev.title));
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
        $('#station-kicker').textContent = `${UI.block(n.bi + 1)} · ${this.kicker(n)}`;
        $('#station-title').textContent = lesson.title;
        $('#station-goal').textContent = lesson.goal;
        $('#station-sheet').classList.toggle('is-extra', n.extra);

        const counts = {};
        lesson.tasks.forEach(t => { const k = KIND[t.type]; counts[k] = (counts[k] || 0) + 1; });
        $('#station-chips').innerHTML = (n.extra ? `<li class="chip--extra">${UI.extraChip}</li>` : '') +
            ['theory', 'video', 'practice', 'ai', 'test'].filter(k => counts[k]).map(k =>
            `<li>${UI.kind[k]}${k === 'test' ? ` · ${UI.questions(counts[k])}` : ''}</li>`).join('') +
            `<li>⏱ ${UI.minutes(lesson.minutes)}</li>`;

        $('#station-best').textContent = rec
            ? UI.best('★'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars), Math.round(rec.bestRatio * 100))
            : UI.rule(lesson.tasks.length);

        const start = $('#station-start');
        start.textContent = resume ? UI.resumeFrom(cur.step + 1) : rec ? UI.replay : UI.begin;
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
        if (resume) this.toast(UI.resumed(cur.step + 1));
    },

    closeLesson() {
        this.run = null;
        $('#lesson').hidden = true;
        document.body.classList.remove('is-overlay');
        this.renderAll();
        this.toast(UI.saved);
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
        r.mistake = null;
        $('#ask-btn').hidden = true;
        if ($('#tutor-sheet').open) $('#tutor-sheet').close();
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
        this.renderBoss();
        this.setNext(UI.btn.next, true);
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
            if (r.combo >= XP_RULES.comboFrom && score === 1) title = UI.combo(r.combo);
            const combo = $('#combo');
            combo.hidden = r.combo < 2;
            $('b', combo).textContent = r.combo;
        } else {
            Sound.play('pop');
        }
        this.showFeedback(tone, title, text);
        if (r.lesson.boss && typeof score === 'number') this.hitBoss(score);
        this.setNext(UI.btn.next, true);
        $('#ask-btn').hidden = !(Tutor.enabled && typeof score === 'number' && score < 1 && r.mistake);
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
                    ${c.chat ? `<div class="chat"><p class="bubble bubble--me"><span class="bubble__who">${UI.prompt}</span>${esc(c.chat)}</p></div>` : ''}
                    ${c.text ? `<p class="card__text">${esc(c.text)}</p>` : ''}
                    ${c.list ? `<ul class="card__list">${c.list.map(li => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}
                    ${c.reveal ? `<div class="reveal">
                        <button class="reveal__btn" type="button" aria-expanded="false">🤔 ${esc(c.reveal.q)} <u>${UI.tap}</u></button>
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
                this.setNext(k < t.cards.length - 1 ? UI.btn.next : UI.btn.gotIt, true);
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
            const head = this.head(UI.video(total), t.title);

            if (t.src) {
                box.innerHTML = head + `<div class="player"><video controls playsinline preload="metadata" src="${esc(t.src)}"></video></div>`;
                const v = $('video', box);
                this.setNext(UI.btn.watch, false);
                const unlock = () => { if (v.duration && v.currentTime / v.duration > .9) this.setNext(UI.btn.next, true); };
                v.addEventListener('timeupdate', unlock);
                v.addEventListener('ended', () => this.setNext(UI.btn.next, true));
                return;
            }
            if (t.youtube) {
                box.innerHTML = head + `<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${esc(t.youtube)}?rel=0" title="${esc(t.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
                return;
            }

            // Ролика ещё нет: играем раскадровку из сцен
            box.innerHTML = head + `<div class="player">
                <div class="player__screen" aria-label="${UI.storyboard}">
                    <svg class="player__bg" viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                        <rect class="z1" width="320" height="200"/>
                        <circle class="fc" cx="276" cy="38" r="20"/>
                        <path class="t3" d="M0 150 Q80 118 160 142 T320 136 V200 H0 Z"/>
                        ${Forest.pine(214, 150, 44)}${Forest.round(300, 146, 40)}${Forest.pine(250, 164, 34)}
                        <path class="t1" d="M0 178 Q100 154 200 174 T320 168 V200 H0 Z"/>
                    </svg>
                    <div class="player__bot" aria-hidden="true"></div>
                    <p class="player__caption" hidden></p>
                    <span class="player__tag">${UI.draft}</span>
                    <button class="player__play" type="button" aria-label="${UI.play}"><span>▶</span></button>
                </div>
                <p class="player__subs" aria-live="polite">${UI.playHint}</p>
                <div class="player__ctrl">
                    <button class="icon-btn" type="button" data-act="toggle" aria-label="${UI.pause}">❚❚</button>
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
                playBtn.setAttribute('aria-label', UI.replayVideo);
                toggle.textContent = '▶';
                if (!watched) {
                    watched = true;
                    this.setNext(UI.btn.next, true);
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
                toggle.setAttribute('aria-label', UI.pause);
                last = performance.now();
                requestAnimationFrame(tick);
            };
            const pause = () => {
                playing = false;
                toggle.textContent = '▶';
                toggle.setAttribute('aria-label', UI.resumeVideo);
            };

            playBtn.addEventListener('click', e => { e.stopPropagation(); play(); });
            toggle.addEventListener('click', () => (playing ? pause() : play()));
            screen.addEventListener('click', () => {
                if (!playing || scene < 0) return;
                if (scene + 1 < t.scenes.length) show(scene + 1);
                else finish();
            });
            this.setNext(UI.btn.watch, false);
        },

        quiz(t, box) {
            const lesson = this.run.lesson;
            const quizzes = lesson.tasks.filter(x => x.type === 'quiz');
            const num = quizzes.indexOf(t) + 1;
            const opts = shuffle(t.options.map((text, i) => ({ text, ok: i === 0 })));
            box.innerHTML = `<p class="eyebrow task__kicker">${UI.quizKicker(lesson.test, num, quizzes.length, !!lesson.boss)}</p>
                <h2 class="question">${esc(t.q)}</h2>
                <div class="options">${opts.map((o, i) =>
                    `<button class="option" type="button" data-i="${i}"><span class="option__key">${UI.letters[i]}</span><span>${esc(o.text)}</span></button>`).join('')}
                </div>`;
            this.setNext(UI.btn.choose, false);
            const buttons = $$('.option', box);
            buttons.forEach(btn => btn.addEventListener('click', () => {
                const chosen = opts[+btn.dataset.i];
                const right = opts.find(o => o.ok);
                buttons.forEach((b, i) => {
                    b.disabled = true;
                    if (opts[i].ok) b.classList.add('is-right');
                    else if (b !== btn) b.classList.add('is-dim');
                });
                if (!chosen.ok) {
                    btn.classList.add('is-wrong');
                    this.run.mistake = { question: t.q, answer: chosen.text, correct: right.text, explain: t.explain };
                }
                this.answered(chosen.ok ? 1 : 0, {
                    title: chosen.ok ? pick(UI.good) : pick(UI.bad),
                    text: chosen.ok ? t.explain : UI.correctIs(right.text, t.explain)
                });
            }));
        },

        sort(t, box, token) {
            const items = shuffle(t.items);
            const counts = t.buckets.map(() => 0);
            const misses = [];
            let k = 0, right = 0, busy = false;
            box.innerHTML = this.head(UI.practice, t.title, t.text) + `<div class="sort">
                <div class="sort__deck"></div>
                <p class="sort__why" aria-live="polite">${UI.sortAsk}</p>
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
            this.setNext(UI.btn.sortAll, false);
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
                    misses.push({ item, picked: +btn.dataset.b });
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
                deck.innerHTML = `<div class="sort__card">${UI.sortDone(right, items.length)}</div>`;
                buckets.forEach(b => { b.disabled = true; });
                const score = right / items.length;
                if (misses.length) {
                    this.run.mistake = {
                        question: `${t.title} ${t.text || ''}`,
                        answer: misses.map(m => `«${m.item.t}» → ${t.buckets[m.picked]}`).join('; '),
                        correct: misses.map(m => `«${m.item.t}» → ${t.buckets[m.item.b]}`).join('; '),
                        explain: misses.map(m => m.item.why).join(' ')
                    };
                }
                this.answered(score, {
                    title: score === 1 ? UI.perfect : UI.sortScore(right, items.length),
                    text: score === 1 ? UI.sortPerfectText : UI.sortHint
                });
            }));
        },

        build(t, box, token) {
            const slots = t.slots.map(s => ({ ...s, opts: shuffle(s.options.map((text, i) => ({ text, ok: i === 0 }))), clean: true, done: false }));
            box.innerHTML = this.head(UI.practice, t.title) + `<p class="goal">🎯 ${esc(t.goal)}</p>
                <div class="slots">${slots.map((s, si) => `<div class="slot" data-s="${si}">
                    <p class="slot__label">${esc(s.label)}</p>
                    <div class="slot__options">${s.opts.map((o, oi) =>
                        `<button class="chip-btn" type="button" data-o="${oi}">${esc(o.text)}</button>`).join('')}</div>
                    <p class="slot__hint" hidden>${esc(s.hint)}</p>
                </div>`).join('')}</div>
                <div class="build-chat chat" hidden></div>`;
            this.setNext(UI.btn.build, false);

            $$('.slot', box).forEach((el, si) => {
                const s = slots[si];
                $$('.chip-btn', el).forEach(chip => chip.addEventListener('click', () => {
                    if (s.done) return;
                    const o = s.opts[+chip.dataset.o];
                    if (!o.ok) {
                        s.clean = false;
                        (s.misses = s.misses || []).push(o.text);
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
                chat.innerHTML = `<p class="bubble bubble--me"><span class="bubble__who">${UI.yourPrompt}</span>${esc(prompt)}</p>
                    <p class="bubble bubble--ai"><span class="bubble__who">${UI.ai}</span><span class="typing"></span></p>`;
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
                const missed = slots.filter(s => !s.clean);
                if (missed.length) {
                    this.run.mistake = {
                        question: t.goal,
                        answer: missed.map(s => `${s.label}: ${s.misses.join(', ')}`).join('; '),
                        correct: missed.map(s => `${s.label}: ${s.opts.find(o => o.ok).text}`).join('; '),
                        explain: missed.map(s => s.hint).join(' ')
                    };
                }
                this.answered(score, {
                    title: score === 1 ? UI.buildPerfect : UI.buildScore(clean, slots.length),
                    text: t.done || UI.buildText
                });
            };
        },

        spot(t, box) {
            box.innerHTML = this.head(UI.practice, t.title, t.text) + `<div class="ai-answer">
                <p class="eyebrow ai-answer__who">${esc(t.who || UI.aiAnswer)}</p>
                <div class="sentences">${t.sentences.map((s, i) =>
                    `<button class="sentence" type="button" data-i="${i}">${esc(s)}</button>`).join('')}</div>
            </div>`;
            this.setNext(UI.btn.tapSentence, false);
            const buttons = $$('.sentence', box);
            buttons.forEach(btn => btn.addEventListener('click', () => {
                const ok = +btn.dataset.i === t.wrong;
                buttons.forEach(b => { b.disabled = true; });
                buttons[t.wrong].classList.add('is-right');
                if (!ok) {
                    btn.classList.add('is-wrong');
                    this.run.mistake = {
                        question: `${t.title}. ${t.text}`, answer: t.sentences[+btn.dataset.i],
                        correct: t.sentences[t.wrong], explain: t.explain
                    };
                }
                this.answered(ok ? 1 : 0, { title: ok ? pick(UI.good) : pick(UI.bad), text: t.explain });
            }));
        },

        // Расставить шаги по порядку: нажимаешь следующий шаг, ошибка — карточка трясётся.
        // Балл — доля шагов, угаданных с первой попытки.
        order(t, box) {
            const items = shuffle(t.items.map((text, i) => ({ text, i })));
            const misses = [];
            let k = 0, clean = 0, missed = false;
            box.innerHTML = this.head(UI.practice, t.title, t.text) + `<ol class="order__done"></ol>
                <p class="order__hint" aria-live="polite">${UI.orderHint}</p>
                <div class="order__pool">${items.map((it, j) =>
                    `<button class="order__item" type="button" data-j="${j}">${esc(it.text)}</button>`).join('')}</div>`;
            const done = $('.order__done', box);
            this.setNext(UI.btn.order, false);
            $$('.order__item', box).forEach(btn => btn.addEventListener('click', () => {
                const it = items[+btn.dataset.j];
                if (it.i !== k) {
                    if (!missed) misses.push({ step: k, picked: it.text });
                    missed = true;
                    btn.classList.remove('is-wrong');
                    void btn.offsetWidth;
                    btn.classList.add('is-wrong');
                    Sound.play('bad');
                    return;
                }
                if (!missed) clean++;
                missed = false;
                k++;
                btn.remove();
                done.insertAdjacentHTML('beforeend', `<li class="order__step">${esc(it.text)}</li>`);
                Sound.play('pop');
                if (k < items.length) return;
                $('.order__hint', box).hidden = true;
                const score = clean / items.length;
                if (misses.length) {
                    this.run.mistake = {
                        question: `${t.title}. ${t.text || ''}`,
                        answer: misses.map(m => `${m.step + 1}. ${m.picked}`).join('; '),
                        correct: t.items.map((x, i) => `${i + 1}. ${x}`).join('; '),
                        explain: t.explain || ''
                    };
                }
                this.answered(score, {
                    title: score === 1 ? UI.orderPerfect : UI.orderScore(clean, items.length),
                    text: t.explain || UI.orderText
                });
            }));
        },

        poll(t, box) {
            const max = Math.max(...t.options.map(o => o.p));
            box.innerHTML = this.head(UI.experiment, t.title, t.text) +
                `<p class="phrase">${esc(t.phrase)}</p>
                <div class="poll">${t.options.map((o, i) =>
                    `<button class="poll__opt" type="button" data-i="${i}"><i class="poll__fill"></i><span>${esc(o.t)}</span><span class="poll__pct">${o.p}%</span></button>`).join('')}
                </div>`;
            this.setNext(UI.btn.pickWord, false);
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
                    title: o.p === max ? UI.pollMatch : UI.pollOther,
                    text: t.explain
                });
            }));
        },

        // Ответ своими словами. С помощником его проверяет нейросеть, без него — сравнение с примером.
        talk(t, box, token) {
            box.innerHTML = this.head(t.kicker || UI.talkKicker, t.title) + `
                <div class="chat-log">
                    <p class="bubble bubble--ai"><span class="bubble__who">${UI.bloop}</span>${esc(t.question)}</p>
                </div>
                <p class="chat-note">${Tutor.enabled ? UI.talkHint : UI.talkOffline}</p>
                ${chatForm(t.placeholder || UI.talkPlaceholder)}
                <button class="link-btn talk-show" type="button" hidden>${UI.talkShow}</button>
                <div class="talk-sample" hidden>
                    <p class="eyebrow">${UI.talkPoints}</p>
                    <ul class="card__list">${t.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
                    <p class="eyebrow">${UI.talkSample}</p>
                    <p class="bubble bubble--ai">${esc(t.sample)}</p>
                </div>`;
            const log = $('.chat-log', box), form = $('.chat-form', box);
            const showBtn = $('.talk-show', box), sample = $('.talk-sample', box);
            const alive = () => this.run && this.run.token === token;
            const reveal = () => {
                sample.hidden = false;
                showBtn.hidden = true;
                this.setNext(UI.btn.next, true);
                Sound.play('pop');
            };
            showBtn.addEventListener('click', reveal);
            this.setNext(UI.talkWait, false);

            if (!Tutor.enabled) {
                form.addEventListener('submit', e => {
                    e.preventDefault();
                    const text = $('textarea', form).value.trim().slice(0, 500);
                    if (!text) return;
                    log.insertAdjacentHTML('beforeend', `<p class="bubble bubble--me"><span class="bubble__who">${UI.you}</span>${esc(text)}</p>`);
                    form.hidden = true;
                    reveal();
                });
                $('textarea', form).addEventListener('keydown', e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
                });
                return;
            }

            Tutor.chat({
                log, form, mode: 'check', lesson: this.run.lesson.title,
                context: { question: t.question, points: t.points }, maxTurns: 4,
                onReply: (data, bubble) => {
                    if (!alive()) return;
                    const v = UI.verdict[data.verdict] ? data.verdict : null;
                    if (v) bubble.insertAdjacentHTML('beforeend', `<span class="verdict verdict--${v}">${UI.verdict[v]}</span>`);
                    Sound.play(v === 'yes' ? 'good' : v === 'no' ? 'bad' : 'pop');
                    if (sample.hidden) showBtn.hidden = false;
                    this.setNext(UI.btn.next, true);
                },
                onFail: () => {
                    if (!alive()) return;
                    if (sample.hidden) showBtn.hidden = false;
                    this.setNext(UI.btn.next, true);
                }
            });
        },

        // Практика прямо в уроке: ученик пишет промпты Блупу, Блуп отвечает как обычный чат-бот.
        // prompts — готовые сообщения (первое уже в поле), steps — шаги задания. Без помощника — промпт для копирования.
        chat(t, box, token) {
            const prompts = t.prompts || [];
            const steps = t.steps ? `<ol class="task-steps">${t.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : '';
            const skip = $('#skip-btn');
            skip.hidden = false;
            this.run.onNext = () => { this.run.scores[this.run.step] = null; this.nextTask(); };

            if (!Tutor.enabled) {
                box.innerHTML = this.head(UI.chatKicker, t.title, t.text) + steps +
                    prompts.map((x, i) => `<div class="copy-prompt">
                        <p class="copy-prompt__text">${esc(x)}</p>
                        <button class="btn btn--white" type="button" data-i="${i}">${UI.copy}</button>
                    </div>`).join('') + `<p class="copy-note">${UI.chatOffline}</p>`;
                $$('.copy-prompt .btn', box).forEach(copy => copy.addEventListener('click', () => {
                    const text = prompts[+copy.dataset.i];
                    const done = () => { copy.textContent = UI.copied; Sound.play('pop'); };
                    const fallback = () => {
                        const range = document.createRange();
                        range.selectNodeContents($('.copy-prompt__text', copy.parentNode));
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                        copy.textContent = UI.selected;
                    };
                    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
                }));
                this.setNext(UI.btn.next, true);
                return;
            }

            box.innerHTML = this.head(UI.chatKicker, t.title, t.text) + steps +
                (prompts.length > 1 ? `<p class="eyebrow">${UI.chatPrompts}</p>
                    <div class="chat-chips">${prompts.map((x, i) => `<button class="chat-chip" type="button" data-i="${i}"><span>${esc(x)}</span></button>`).join('')}</div>` : '') + `
                <div class="chat-log chat-log--task" aria-live="polite"></div>
                ${chatForm(UI.chatPlaceholder, 1200)}
                <div class="chat-tools">
                    <p class="chat-note">${UI.chatHint}</p>
                    <button class="link-btn chat-new" type="button">${UI.chatNew}</button>
                </div>`;
            const log = $('.chat-log', box), form = $('.chat-form', box);
            const input = $('textarea', form);
            const alive = () => this.run && this.run.token === token;
            input.value = prompts[0] || '';

            $$('.chat-chip', box).forEach(chip => chip.addEventListener('click', () => {
                input.value = prompts[+chip.dataset.i];
                input.focus();
                Sound.play('tap');
            }));

            // Незаполненные [скобки] из шаблона: выделяем первую и просим заменить
            const guard = () => {
                const m = input.value.match(/\[[^\]\n]{1,60}\]/);
                if (!m) return true;
                this.toast(UI.chatFill);
                input.focus();
                input.setSelectionRange(m.index, m.index + m[0].length);
                return false;
            };

            const chat = Tutor.chat({
                log, form, mode: 'chat', lesson: this.run.lesson.title,
                context: { task: t.title, goal: t.text || '', steps: t.steps || [] },
                maxTurns: t.maxTurns || 6, maxLength: 1200, guard,
                onReply: () => {
                    if (!alive()) return;
                    Sound.play('pop');
                    this.setNext(UI.btn.next, true);
                }
            });
            $('.chat-new', box).addEventListener('click', () => {
                chat.reset();
                this.toast(UI.chatNewDone);
                Sound.play('tap');
                input.focus();
            });
            this.setNext(UI.chatWait, false);
        }
    },

    // Листание карты по блокам на широком экране
    mountNav() {
        $('#map').insertAdjacentHTML('beforebegin', `<nav class="map-nav" id="map-nav" hidden aria-label="${esc(UI.pages)}">
            <button class="icon-btn" type="button" data-dir="-1" aria-label="${esc(UI.prevPage)}">‹</button>
            <div class="map-nav__mid"><p class="map-nav__title"></p><div class="map-nav__dots"></div></div>
            <button class="icon-btn" type="button" data-dir="1" aria-label="${esc(UI.nextPage)}">›</button>
        </nav>`);
    },

    mountTutor() {
        $('.foot-row').insertAdjacentHTML('afterbegin', `<button class="btn btn--white" id="ask-btn" type="button" hidden>${UI.tutorAsk}</button>`);
        document.body.insertAdjacentHTML('beforeend', `<dialog class="sheet sheet--chat" id="tutor-sheet" aria-labelledby="tutor-title">
            <div class="sheet__box">
                <button class="sheet__close icon-btn" type="button" data-close aria-label="${esc(UI.close)}">✕</button>
                <div class="station-head">
                    <span class="chat-bot" id="tutor-blup" aria-hidden="true"></span>
                    <div>
                        <p class="eyebrow">${UI.tutorKicker}</p>
                        <h2 id="tutor-title">${UI.tutorTitle}</h2>
                    </div>
                </div>
                <div class="chat-log chat-log--scroll" id="tutor-log" aria-live="polite"></div>
                <div id="tutor-form-slot"></div>
                <p class="chat-note">${UI.tutorNote}</p>
            </div>
        </dialog>`);
        $('#ask-btn').addEventListener('click', () => this.openTutor());
    },

    // ---------- Финальный босс: полоска здоровья над заданием ----------
    // Каждое оцениваемое задание снимает равную долю здоровья, умноженную на его балл.
    mountBoss() {
        $('#task').insertAdjacentHTML('beforebegin', `<div class="boss" id="boss" hidden>
            <span class="boss__face" aria-hidden="true"></span>
            <div class="boss__info">
                <p class="boss__name"><b></b><span class="boss__hp"></span></p>
                <div class="boss__bar" role="progressbar" aria-valuemin="0"><span></span></div>
            </div>
            <span class="boss__say" hidden></span>
            <span class="boss__hit" aria-hidden="true"></span>
        </div>`);
    },

    bossHp() {
        const r = this.run, B = r.lesson.boss;
        const graded = r.lesson.tasks.map((t, i) => i).filter(i => Game.isGraded(r.lesson.tasks[i]));
        const dealt = graded.reduce((sum, i) => sum + (typeof r.scores[i] === 'number' ? r.scores[i] : 0), 0);
        return { hp: Math.max(0, Math.round(B.hp * (1 - dealt / graded.length))), per: B.hp / graded.length };
    },

    renderBoss() {
        const el = $('#boss'), B = this.run.lesson.boss;
        el.hidden = !B;
        if (!B) return;
        const { hp } = this.bossHp();
        $('.boss__face', el).textContent = hp > 0 ? B.icon : '💥';
        $('.boss__name b', el).textContent = B.name;
        $('.boss__hp', el).textContent = `${hp} ${UI.bossHp}`;
        const bar = $('.boss__bar', el);
        bar.setAttribute('aria-valuemax', B.hp);
        bar.setAttribute('aria-valuenow', hp);
        bar.setAttribute('aria-label', `${B.name}: ${hp} ${UI.bossHp}`);
        $('span', bar).style.width = (hp / B.hp * 100) + '%';
        el.classList.toggle('is-low', hp <= B.hp / 2);
        el.classList.toggle('is-down', hp === 0);
    },

    hitBoss(score) {
        const el = $('#boss'), B = this.run.lesson.boss;
        const dmg = Math.round(this.bossHp().per * score);
        this.renderBoss();
        if (dmg > 0) {
            const hit = $('.boss__hit', el);
            hit.textContent = UI.bossHit(dmg);
            el.classList.remove('is-hit');
            void el.offsetWidth;
            el.classList.add('is-hit');
        }
        const say = $('.boss__say', el);
        say.textContent = pick(score === 1 ? B.hurt : B.taunts);
        say.hidden = false;
        clearTimeout(this.bossTimer);
        this.bossTimer = setTimeout(() => { say.hidden = true; }, 2800);
    },

    // Один разговор на одну ошибку: повторное открытие показывает ту же переписку
    openTutor() {
        const r = this.run;
        if (!r || !r.mistake || !Tutor.enabled) return;
        const sheet = $('#tutor-sheet');
        const key = r.token + ':' + r.step;
        if (this.tutorKey === key) { sheet.showModal(); return; }
        this.tutorKey = key;
        $('#tutor-log').innerHTML = '';
        $('#tutor-blup').innerHTML = blup('think');
        $('#tutor-form-slot').innerHTML = chatForm(UI.tutorPlaceholder);
        const chat = Tutor.chat({
            log: $('#tutor-log'), form: $('#tutor-form-slot form'),
            mode: 'mistake', lesson: r.lesson.title, context: r.mistake, maxTurns: 5,
            onReply: () => { $('#tutor-blup').innerHTML = blup('wink'); }
        });
        sheet.showModal();
        chat.send(UI.tutorStart);
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
            lang: LANG,
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
        $('#result-kicker').textContent = this.kicker(this.layout.nodes.find(n => n.lesson === lesson));
        $('#result-title').textContent = lesson.boss
            ? (res.passed ? UI.bossWin(lesson.boss.name) : UI.bossLose(lesson.boss.name))
            : !res.passed ? UI.almost : res.stars === 3 ? UI.perfect : UI.stationDone;
        $('#result-lead').textContent = lesson.boss
            ? (res.passed ? UI.bossLeadWin : UI.bossLeadFail)
            : !res.passed
                ? UI.leadFail
                : res.isReplay && res.earned === 0
                    ? UI.leadReplay
                    : UI.leadDone(lesson.title);

        const starsBox = $('#result-stars');
        starsBox.innerHTML = [0, 1, 2].map(() => '<span aria-hidden="true">⭐</span>').join('') +
            `<span class="sr-only">${UI.starsOf(res.stars)}</span>`;
        const stars = $$('span[aria-hidden]', starsBox);
        stars.forEach((el, i) => {
            if (i < res.stars) setTimeout(() => { el.classList.add('is-on'); Sound.play('star'); }, 450 + i * 380);
        });

        $('#result-stats').innerHTML = [
            [`+${res.earned}`, UI.statXp],
            [`${Math.round(x.ratio * 100)}%`, UI.statAcc],
            [x.bestRun, UI.statRun]
        ].map(([v, l]) => `<li><b>${v}</b><span>${l}</span></li>`).join('');

        const extra = [];
        if (res.blockCompleted) extra.push(['🌳', UI.blockCompleted(r.st.block.title, res.blockBonus)]);
        if (res.levelUp) extra.push(['🆙', UI.levelUp(res.levelUp.level, res.levelUp.title)]);
        res.badges.forEach(b => extra.push([b.icon, UI.badge(b.title, b.desc)]));
        $('#result-extra').innerHTML = extra.map(([icon, text], i) =>
            `<li style="animation-delay:${1.4 + i * .3}s"><span aria-hidden="true">${icon}</span>${esc(text)}</li>`).join('');

        const mapBtn = $('#result-map'), retry = $('#result-retry');
        if (res.passed) {
            mapBtn.textContent = UI.toMap;
            mapBtn.onclick = () => this.backToMap(res);
            retry.textContent = UI.replay;
            retry.onclick = () => this.startLesson(lesson.id, { fresh: true });
            this.confetti(res.stars === 3 ? 180 : 110);
            if (res.levelUp || res.blockCompleted) setTimeout(() => this.confetti(160), 1500);
            Sound.play('win');
        } else {
            mapBtn.textContent = UI.again;
            mapBtn.onclick = () => this.startLesson(lesson.id, { fresh: true });
            retry.textContent = UI.map;
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
            if (next) this.toast(UI.nextBlock(next.title));
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
            `<span class="badge${s.badges[b.id] ? '' : ' is-off'}" title="${esc(b.title + ': ' + b.desc)}" role="img" aria-label="${esc(b.title + (s.badges[b.id] ? UI.badgeHave : UI.badgeMissing))}">${b.icon}</span>`).join('');
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

        $('#map-nav').addEventListener('click', e => {
            const dir = e.target.closest('[data-dir]');
            if (dir) { Sound.play('tap'); this.goPage(this.pageNow() + Number(dir.dataset.dir)); return; }
            const dot = e.target.closest('[data-page]');
            if (dot) { Sound.play('tap'); this.goPage(Number(dot.dataset.page)); }
        });
        $('#map').addEventListener('scroll', () => this.syncNav(), { passive: true });
        // Колесо мыши листает ленту карты вбок, пока есть куда; у края снова прокручивается страница
        $('#map').addEventListener('wheel', e => {
            if (this.layout.dir !== 'h' || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
            const map = e.currentTarget;
            const dy = e.deltaY * (e.deltaMode === 1 ? 40 : 1);
            const max = map.scrollWidth - map.clientWidth;
            if ((dy < 0 && map.scrollLeft <= 0) || (dy > 0 && map.scrollLeft >= max - 1)) return;
            e.preventDefault();
            map.scrollLeft += dy;
        }, { passive: false });
        // Повернули планшет или сузили окно — перестраиваем карту под новую раскладку
        let frame = 0;
        window.addEventListener('resize', () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                if (mapMode() !== this.mode) {
                    this.renderMap();
                    this.scrollToCurrent(false);
                } else {
                    this.fitMap();
                    this.syncNav();
                }
            });
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
            this.toast(UI.welcome(name));
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
            this.toast(UI.savedSettings);
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
            this.toast(UI.resetDone);
        });

        $$('dialog').forEach(dlg => {
            dlg.addEventListener('click', e => {
                if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
