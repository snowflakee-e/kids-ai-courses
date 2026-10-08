'use strict';

// Курс только на английском: язык уходит Блупу-помощнику, чтобы он отвечал по-английски
const LANG = 'en';

// Настройки
const CONFIG = {
    // Webhook для результатов уроков (Make.com → Custom Webhook → Google Sheets).
    // Пусто — результаты никуда не отправляются, прогресс живёт только в браузере.
    // Если включишь — поправь раздел «What happens to data» в parents.html: там написано, что копии у нас нет.
    resultsWebhook: '',
    // Адрес Блупа-помощника (Cloudflare Worker из папки worker/), например https://bloop-tutor.имя.workers.dev
    // Пусто — помощник выключен: кнопки «Спросить Блупа» нет, «Объясни Блупу» работает как самопроверка.
    tutorUrl: 'https://bloop-tutor.kirillsotnikov12345.workers.dev/',
    // Свой ключ: эксперимент v3 (10 больших станций без роликов) не трогает прогресс в /ai-trail/ и /ai-trail-v2/
    storageKey: 'bloop-trail-v3',
    // Профиль из кабинета школы (тот же домен на GitHub Pages): берём оттуда имя
    cabinetKey: 'bloop-cabinet-v1'
};

// Меньше движения: по настройке системы или по переключателю в настройках курса (applyPrefs)
const SYSTEM_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let REDUCED = SYSTEM_REDUCED;

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

// Блуп — это Бобик из bobik.js в цветах бренда (переменные --rb-* в style.css). В v2 он напарник-стикер:
// маленький, в углу, реагирует на ответы, но не занимает центр экрана.
const blup = pose => bob(STATES[pose] || STATES.neutral).replace(/<title>[^<]*<\/title>/, '');

// Линейные иконки вместо эмодзи в кнопках
const ICON = {
    soundOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 10l4 4M21 10l-4 4"/></svg>'
};

// Тексты интерфейса: голос «старшего брата или сестры» — коротко, сухо, без сюсюканья.
// Контент уроков — в course.en.js.
const UI = {
    good: ['Correct.', 'Nailed it.', 'Clean.', 'Exactly.', 'Sharp.', 'That’s the one.'],
    bad: ['Not quite.', 'Close, but no.', 'Miss. Happens.'],
    letters: 'ABCDE',
    soundOff: 'Turn sound off', soundOn: 'Turn sound on',
    hi: name => (name ? `Hey, ${name}.` : 'Hey.'),
    helloKicker: (n, title, done, total) => `Zone ${String(n).padStart(2, '0')} · ${title} · ${done}/${total} stations`,
    level: (n, title) => `Lv ${n} · ${title}`,
    resume: title => `Continue: ${title}`,
    blockDone: 'Trail complete',
    next: title => `Next: ${title}`,
    start: title => `Start: ${title}`,
    block: n => `Zone ${String(n).padStart(2, '0')}`,
    soon: 'coming soon',
    finale: 'Zone finale', bossKicker: 'Final boss',
    station: n => `Station ${n}`,
    locked: 'locked',
    passed: 'done',
    resumeShort: '▶ continue',
    minutes: n => `${n} min`,
    tasks: n => `${n} ${n === 1 ? 'task' : 'tasks'}`,
    questions: n => `${n} ${n === 1 ? 'question' : 'questions'}`,
    rounds: n => `${n} ${n === 1 ? 'round' : 'rounds'}`,
    newStation: 'Unlocked',
    soonToast: title => `“${title}” opens soon`,
    firstPass: title => `Finish “${title}” first`,
    kind: { theory: 'Reading', practice: 'Practice', ai: 'With Bloop', test: 'Test', fight: 'Boss fight' },
    parts: 'What’s inside',
    part: (n, title) => `Part ${n}: ${title}`,
    best: (stars, pct) => `Best: ${stars} · ${pct}%`,
    rule: n => `${n} ${n === 1 ? 'task' : 'tasks'}. 50% to pass.`,
    resumeFrom: n => `Continue from task ${n}`,
    replay: 'Play again',
    begin: 'Start',
    resumed: n => `Back at task ${n}`,
    saved: 'Saved. You’ll pick up right here.',
    btn: {
        next: 'Next', gotIt: 'Got it', choose: 'Pick an answer',
        sortAll: 'Sort all the cards', build: 'Build the prompt', tapSentence: 'Tap a sentence',
        pickWord: 'Pick a word', tried: 'I tried it', order: 'Put every step in order'
    },
    sideQuest: 'Side quest',
    extraTag: 'optional · harder',
    extraChip: 'Side quest: optional, harder',
    pages: 'Trail zones', prevPage: 'Previous zone', nextPage: 'Next zone',
    orderHint: 'Tap the steps in order. What comes first?',
    orderPerfect: 'Perfect order.',
    orderScore: (c, n) => `${c} of ${n} on the first try`,
    orderText: 'The order is what makes it work.',
    combo: n => `${n} in a row`,
    practice: 'Practice', experiment: 'Experiment',
    readKicker: (part, min) => `${part ? `Part ${part} · ` : ''}Read · ${min} min`,
    takeaways: 'Key takeaways',
    proTip: 'Pro tip',
    checkYourself: 'Check yourself:',
    quizKicker: (test, n, total, boss) => `${boss ? 'Rapid fire' : test ? 'Challenge' : 'Check'} · ${n}/${total}`,
    prompt: 'Prompt', tap: 'Tap',
    correctIs: (text, explain) => `Answer: “${text}”. ${explain}`,
    sortAsk: 'Where does this one go?',
    sortDone: (r, n) => `${r} of ${n}`,
    perfect: 'Perfect run.',
    sortScore: (r, n) => `${r} of ${n} correct`,
    sortPerfectText: 'Every card in the right place.',
    sortHint: 'Read the notes under the cards. They’re the actual lesson.',
    yourPrompt: 'Your prompt', ai: 'AI',
    buildPerfect: 'That’s a real prompt.',
    buildScore: (c, n) => `${c} of ${n} on the first try`,
    buildText: 'Role + Task + Context + Format. That’s why the answer fits.',
    aiAnswer: 'AI’s answer',
    pollMatch: 'You think like a language model.', pollOther: 'A language model would pick differently.',
    copy: 'Copy', copied: 'Copied', selected: 'Selected. Now copy it.',
    almost: 'Not yet', stationDone: 'Station complete',
    leadFail: 'You need 50% to pass. You’ve seen the answers now, so run it back.',
    leadReplay: 'Replays only pay XP if you beat your best. Stars can still go up.',
    leadDone: title => `“${title}”: done.`,
    starsOf: n => `${n} of 3 stars`,
    statXp: 'XP', statAcc: 'accuracy', statRun: 'best run',
    blockCompleted: (title, xp) => `Zone “${title}” cleared. +${xp} XP`,
    levelUp: (n, title) => `New rank: ${title} (Lv ${n})`,
    badge: (title, desc) => `Badge “${title}”: ${desc.toLowerCase()}`,
    toMap: 'To the map →', again: 'Try again', map: 'To the map',
    nextBlock: title => `Next: “${title}”. Opens soon.`,
    badgeHave: ', earned', badgeMissing: ', not earned yet',
    welcome: name => `Nice to meet you, ${name}. Tap the first station.`,
    savedSettings: 'Saved',
    resetDone: 'Progress reset. Fresh start.',
    close: 'Close',
    tutorAsk: 'Ask Bloop',
    tutorKicker: 'Mistake review',
    tutorTitle: 'Ask Bloop',
    tutorStart: 'Why is my answer wrong?',
    tutorPlaceholder: 'Ask anything about this task…',
    tutorNote: 'Bloop stays on topic. Don’t share personal info.',
    tutorSend: 'Send',
    tutorThinking: 'Bloop is thinking',
    tutorError: 'Bloop is offline right now. Try again a bit later.',
    tutorTired: 'Bloop is out of energy for today. Back tomorrow.',
    tutorLimit: 'That’s enough questions for this task. Tap Next.',
    you: 'You', bloop: 'Bloop',
    talkKicker: 'Check with Bloop',
    talkPlaceholder: 'Your answer, your words…',
    talkHint: 'Bloop reads it and tells you what’s missing.',
    talkOffline: 'Write it in your own words, then compare with the example.',
    talkShow: 'Show an example answer',
    talkPoints: 'A good answer covers:',
    talkSample: 'Example answer:',
    talkWait: 'Answer Bloop first',
    talkSaved: 'Saved to your portfolio',
    verdict: { yes: '✓ Got it', partly: '≈ Almost', no: '✗ Not yet' },
    chatKicker: 'Try it with Bloop',
    chatHint: 'Bloop is AI too: it answers like a regular chatbot and can be wrong.',
    chatPrompts: 'Ready-made messages: tap one to drop it in',
    chatPlaceholder: 'Message Bloop…',
    chatNew: '↺ New chat',
    chatNewDone: 'New chat: Bloop forgot the old conversation',
    chatFill: 'Replace the [brackets] with your own words first',
    chatWait: 'Send your prompt to Bloop',
    chatOffline: 'Bloop is offline right now. Copy the prompt and try it in a chatbot you’re allowed to use.',
    bossHp: 'HP',
    bossHit: n => `−${n} HP`,
    bossWin: name => `${name}: down.`,
    bossLose: name => `${name} is still standing`,
    bossLeadWin: 'You beat it with real skills: clear prompts, fact-checking, guarding your data, spotting fakes, honest work.',
    bossLeadFail: 'Knock out at least half its HP. You know where it got you, so go again.',
    // Бой на Phaser (arena.js): строки внутри игры и вокруг неё
    arena: {
        kicker: 'Boss fight',
        start: 'Start the fight',
        loading: 'Loading the arena…',
        failed: 'The arena didn’t load. Check your connection and try again, or answer without shooting.',
        noShoot: 'Answer without shooting',
        noShootKicker: (n, total) => `Round ${n}/${total}`,
        locked: 'Beat the Glitch first',
        nextRound: 'Next round',
        leave: 'Leave the fight',
        turn: 'Turn your phone sideways to fight',
        keys: [['W A S D', 'move'], ['Mouse', 'aim'], ['Click / Space', 'shoot'], ['Esc', 'pause']],
        touchKeys: [['Left thumb', 'move'], ['Right thumb', 'shoot where you tap']],
        // в игре
        boss: 'The Glitch',
        fight: 'FIGHT!',
        round: (n, total) => `Round ${n}/${total}`,
        shieldUp: 'SHIELD UP', exposedShort: 'EXPOSED',
        exposed: 'Shield down · blast it',
        shieldDown: 'SHIELD DOWN',
        blast: 'Blast the Glitch before it reboots!',
        reboot: 'The Glitch reboots its shield…',
        hitsHint: 'Hit the right answer card 3 times to break the shield.',
        wrong: '✗ Glitch move. That card was a trap: find the right one.',
        final: 'Final phase', finalShort: 'Final', finalSub: 'No more shield. Finish it!',
        down: 'Bloop is down', retry: 'Enter, Space or tap to jump back in. Your answers are kept.',
        paused: 'Paused', resume: 'Esc or tap to resume',
        won: 'THE GLITCH: DOWN', wonKicker: 'Victory',
        controls: 'WASD moves · the mouse aims · click or Space shoots · Esc pauses',
        touchControls: 'Left thumb moves · right thumb shoots where you tap',
        // итог
        recapKicker: 'Fight recap',
        recapTitle: (c, n) => (c === n ? 'Flawless: every round on the first try' : `${c} of ${n} rounds on the first try`),
        recapText: 'The Glitch is down. Here’s every round: the ones marked ↺ tricked you once, so read why.',
        firstTry: 'first try', retried: 'took another try',
        doneTitle: (c, n) => (c === n ? 'Flawless fight.' : `${c} of ${n} on the first try.`),
        demoDone: (c, n) => `The Glitch is down: ${c} of ${n} on the first try. This was a preview, so your progress didn’t change.`,
        doneText: deaths => `The Glitch is down${deaths ? ` (Bloop got knocked out ${deaths} ${deaths === 1 ? 'time' : 'times'}, that never costs stars)` : ''}. One last thing: the final strike.`
    },
    week: (d, g) => `${Math.min(d, g)}/${g}`,
    weekProgress: (d, g) => `Weekly goal: ${Math.min(d, g)} of ${g} stations`,
    weekGoalMet: 'Weekly goal done. Missing a day never costs you anything.',
    predictKicker: 'Predict first',
    predictHit: 'Called it.', predictMiss: 'Didn’t see that coming?',
    reviewKicker: (n, total) => `Warm-up · ${n}/${total}`,
    reviewFrom: title => `From “${title}”`,
    reviewSkip: 'Skip the warm-up',
    reviewDone: 'Warm-up done. Lesson time.',
    teaser: text => `Next time: ${text.replace(/^Next[^:]*:\s*/, '')}`,
    rest: n => `${n} ${n === 1 ? 'station' : 'stations'} today. Good place to stop: your brain keeps working on it while you rest.`,
    limitDone: n => `That’s it for today: ${n} ${n === 1 ? 'station' : 'stations'} a day is the limit at home. See you tomorrow.`,
    limitToast: 'Today’s limit is reached. The trail opens again tomorrow.',
    limitBtn: 'Done for today',
    parentTime: (today, week) => `Time in lessons today: ${today} min · this week: ${week} min`,
    parentNoPin: 'Set a 4-digit PIN so only an adult can change the limit.',
    parentPinSet: 'Enter the PIN to change the limit.',
    pinWrong: 'Wrong PIN: the limit didn’t change',
    pinBad: 'The PIN must be exactly 4 digits',
    bloopIntro: 'I’m Bloop, an AI program, not a person. I can make mistakes, so check what matters and keep personal info to yourself.',
    chatGuessTitle: 'Before you send: what do you expect?',
    chatGuesses: ['Exactly what I need', 'OK, needs a follow-up', 'Generic or off target'],
    chatPickGuess: 'Pick what you expect first',
    chatExpected: text => `You expected: ${text}`,
    chatLeft: n => (n > 0 ? `${n} ${n === 1 ? 'message' : 'messages'} left` : 'No messages left. Compare the answers and tap Next.'),

    // Профиль, навыки, портфолио, сертификат, карточка
    profileKicker: (n, total) => `${n} of ${total} stations`,
    profileStats: { stars: 'stars', badges: 'badges', weeks: 'goal weeks' },
    skillsDone: 'cleared', skillsTodo: 'not yet',
    portfolioEmpty: 'Your prompts, plans and pitches land here as you write them in lessons.',
    portfolioCopy: 'Copy',
    certLocked: (done, total) => `Unlocks when you defeat the final boss. ${done} of ${total} zones cleared.`,
    certReady: 'You finished the trail. Put the name you want on it and print it or save it as a PDF.',
    certTitle: 'Certificate of completion',
    certLead: (stations, blocks) => `completed AI Trail, a hands-on course on using AI wisely and safely: ${blocks} zones, ${stations} stations.`,
    certDate: date => `Completed ${date}`,
    certStars: (s, m) => `${s} of ${m} stars`,
    certNote: 'Progress recorded in the learner’s browser. Not an accredited qualification.',
    shareKicker: 'My AI skills',
    shareStarted: 'Just getting started',
    shareStats: (stars, done, total) => `★ ${stars}   ·   ${done}/${total} stations`,
    shareFoot: 'AI Trail · a hands-on AI course for ages 14–17',
    shareDone: 'Card saved',
    shareTitle: 'My AI Trail skills'
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
        step: [[320, 0, .04, 'triangle', .03]],
        // бой с Глитчем
        zap:  [[1500, 0, .025, 'square', .006]],
        hit:  [[200, 0, .05, 'square', .02]],
        hurt: [[160, 0, .18, 'sawtooth', .05], [110, .08, .2, 'sawtooth', .04]],
        break: [[660, 0, .08], [990, .06, .1], [1320, .12, .16]],
        boom: [[90, 0, .5, 'sawtooth', .07], [60, .15, .6, 'sawtooth', .06]]
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
    // Тревожное сообщение (crisis) тоже не уходит в модель: воркер отвечает заготовкой с телефонами помощи.
    // Первое сообщение каждого чата — Блуп говорит, что он программа (требование прозрачности EU AI Act, ст. 50).
    chat({ log, form, mode, lesson, context, maxTurns, maxLength = 500, guard, onReply, onFail, onTurn, onSend }) {
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
        const intro = () => {
            const p = document.createElement('p');
            p.className = 'bubble bubble--ai is-note';
            p.innerHTML = `<span class="bubble__who">${UI.bloop}</span>`;
            p.appendChild(document.createTextNode(UI.bloopIntro));
            log.insertBefore(p, log.firstChild);
        };
        const turned = () => { if (onTurn) onTurn(maxTurns - turns); };
        intro();

        const send = async text => {
            text = String(text || '').trim().slice(0, maxLength);
            if (!text || busy || turns >= maxTurns) return;
            if (guard && !guard(text)) return;
            if (onSend) onSend(text);
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
                if (data.crisis) {
                    history.pop();
                    turns--;
                    add('ai', data.reply, 'is-crisis');
                    return;
                }
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
                    turned();
                }
            }
        };

        // Новый чат: Блуп забывает переписку. keepTurns — лимит сообщений на задание общий для всех чатов,
        // иначе он начинается заново.
        const reset = keepTurns => {
            epoch++;
            history = [];
            if (!keepTurns) turns = 0;
            busy = false;
            log.innerHTML = '';
            intro();
            lock(turns >= maxTurns);
            input.placeholder = turns >= maxTurns ? UI.tutorLimit : placeholder;
            turned();
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
    // Значки карты: простые фигуры, как условные обозначения, без стволов, грибов и цветов
    pine(x, y, s) {
        const n = this.n;
        return `<polygon class="t2" points="${n(x - s * .34)},${n(y)} ${n(x + s * .34)},${n(y)} ${n(x)},${n(y - s)}"/>`;
    },
    round(x, y, s) {
        return `<circle class="t1" cx="${x}" cy="${this.n(y - s * .4)}" r="${this.n(s * .4)}"/>`;
    },
    rock(x, y, s) {
        const n = this.n;
        return `<path class="tk" d="M${n(x - s * .5)} ${n(y)} L${n(x - s * .2)} ${n(y - s * .45)} L${n(x + s * .25)} ${n(y - s * .35)} L${n(x + s * .5)} ${n(y)} Z"/>`;
    },
    // Набор значков для каждой зоны: [тип, вес, мин. размер, макс. размер]
    MIX: [
        [['pine', 3, 14, 22], ['round', 3, 12, 18], ['rock', 1, 10, 14]],
        [['pine', 6, 14, 24], ['round', 1, 12, 16], ['rock', 1, 10, 14]],
        [['round', 4, 12, 18], ['pine', 2, 14, 20], ['rock', 2, 10, 15]]
    ],
    // Изолинии рельефа: неровные вложенные кольца, как на топографической карте
    blob(cx, cy, rad, ph, k) {
        const pts = [];
        for (let i = 0; i < 28; i++) {
            const a = i / 28 * Math.PI * 2;
            const rr = rad * (1 + .16 * Math.sin(k * a + ph) + .07 * Math.sin((k + 3) * a + ph * 2));
            pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .72]);
        }
        const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        let start = mid(pts[pts.length - 1], pts[0]);
        let d = `M${this.n(start[0])} ${this.n(start[1])}`;
        pts.forEach((p, i) => {
            const m = mid(p, pts[(i + 1) % pts.length]);
            d += ` Q${this.n(p[0])} ${this.n(p[1])} ${this.n(m[0])} ${this.n(m[1])}`;
        });
        return d + ' Z';
    },
    contours(W, H) {
        const r = this.rng(4242);
        let out = '';
        const hills = Math.max(3, Math.round(W * H / 70000));
        for (let i = 0; i < hills; i++) {
            const cx = r() * W, cy = r() * H, base = 50 + r() * 90, rings = 2 + Math.floor(r() * 3);
            const ph = r() * 6.28, k = 2 + Math.floor(r() * 3);
            for (let j = 1; j <= rings; j++) out += `<path class="contour" d="${this.blob(cx, cy, base * j / rings + 8 * j, ph, k)}"/>`;
        }
        return out;
    },
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

    const target = L.W * L.H / 9000;
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

    return `<svg class="map__svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">
        ${grounds}
        <defs><pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path class="gridline" d="M48 0H0V48"/></pattern></defs>
        <rect width="${W}" height="${H}" fill="url(#map-grid)"/>
        ${Forest.contours(W, H)}
        ${branches}
        <path class="trail-edge" d="${L.d}"/>
        <path class="trail" id="trail" d="${L.d}"/>
        <path class="trail-steps" d="${L.d}"/>
        <path class="trail-done" id="trail-done" d="${L.d}"/>
        ${trees}${fog}
    </svg>`;
}

const KIND = { predict: 'practice', cards: 'theory', read: 'theory', quiz: 'test', sort: 'practice', build: 'practice', spot: 'practice', order: 'practice', poll: 'practice', talk: 'ai', chat: 'ai', arena: 'fight' };

// Урок с боем на Phaser: полоска здоровья над заданиями не нужна, здоровье Глитча живёт в игре
const hasArena = lesson => lesson.tasks.some(t => t.type === 'arena');

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
        this.applyPrefs();
        this.mountTutor();
        this.mountBoss();
        this.mountNav();
        this.bind();
        this.renderAll();
        this.scrollToCurrent(false);
        const fight = () => { if (location.hash === '#fight') this.demoArena(); };
        window.addEventListener('hashchange', fight);
        if (location.hash === '#fight') fight();
        else if (!this.state.name) this.openHello();
    },

    // Настройки вида: тема, крупный текст, шрифт для лёгкого чтения, меньше движения
    applyPrefs() {
        const s = this.state, root = document.documentElement;
        if (s.theme === 'light' || s.theme === 'dark') root.dataset.theme = s.theme;
        else delete root.dataset.theme;
        root.dataset.text = s.bigText ? 'large' : 'normal';
        if (s.easyFont) root.dataset.font = 'easy';
        else delete root.dataset.font;
        if (s.calm) root.dataset.motion = 'reduce';
        else delete root.dataset.motion;
        REDUCED = SYSTEM_REDUCED || !!s.calm;
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
        const w = Game.week(this.state);
        set('#stat-week', UI.week(w.done, w.goal));
        $('#stat-week').closest('.pill').title = UI.weekProgress(w.done, w.goal);
        set('#stat-stars', t.stars);
        set('#stat-xp', this.state.xp);
        const btn = $('#sound-btn');
        btn.innerHTML = this.state.sound ? ICON.soundOn : ICON.soundOff;
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
        // Начатый урок можно закончить и после лимита, а открытый без единого ответа — уже нет
        if (Game.limitReached(s) && !(resume && s.current.step > 0)) btn.textContent = UI.limitBtn;
        else if (resume) btn.textContent = UI.resume(resume.lesson.title);
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
            <span class="finish" style="left:${X(L.end.x)};top:${Y(L.end.y)}" aria-hidden="true">🏁</span>
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
        lesson.tasks.forEach(t => { const k = KIND[t.type]; counts[k] = (counts[k] || 0) + (t.type === 'arena' ? t.rounds.length : 1); });
        $('#station-chips').innerHTML = (n.extra ? `<li class="chip--extra">${UI.extraChip}</li>` : '') +
            ['theory', 'practice', 'ai', 'test', 'fight'].filter(k => counts[k]).map(k =>
            `<li>${UI.kind[k]}${k === 'test' ? ` · ${UI.questions(counts[k])}` : k === 'fight' ? ` · ${UI.rounds(counts[k])}` : ''}</li>`).join('') +
            `<li>⏱ ${UI.minutes(lesson.minutes)}</li>`;

        // Большая станция: оглавление по частям (заголовки текстов урока)
        const parts = lesson.tasks.filter(t => t.type === 'read');
        $('#station-parts').hidden = !parts.length;
        $('#station-parts').innerHTML = parts.length ? `<p class="eyebrow">${UI.parts}</p><ol>${parts.map((t, i) =>
            `<li>${esc(UI.part(t.part || i + 1, t.title))}</li>`).join('')}</ol>` : '';

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
        // Лимит родителя закрывает новые станции до завтра, начатый урок можно закончить
        if (!resume && Game.limitReached(this.state)) {
            this.toast(UI.limitToast);
            return;
        }

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
        // Разминка: 1–3 вопроса из прошлых уроков по интервалам повторения. В тестах и при продолжении — нет.
        const review = resume || st.lesson.test ? [] : Game.reviewFor(this.state, lessonId);
        if (review.length) this.renderReview(review);
        else this.renderTask();
        if (resume) this.toast(UI.resumed(cur.step + 1));
    },

    // Сброс панели урока перед новым экраном
    clearTask() {
        const r = this.run;
        r.token++;
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
        return box;
    },

    // Разминка перед уроком: вопросы из тестов пройденных уроков. На звёзды и XP урока не влияет,
    // двигает только график повторения: верно — вопрос вернётся позже, ошибка — завтра.
    renderReview(items) {
        const r = this.run;
        const results = [];
        let k = 0;
        const finish = () => {
            this.state = Game.applyReview(this.state, results);
            this.save();
            r.review = null;
            if (results.length) this.toast(UI.reviewDone);
            this.renderTask();
        };
        const draw = () => {
            const it = items[k], t = it.task;
            const box = this.clearTask();
            $('#boss').hidden = true;
            $('#skip-btn').hidden = false;
            const opts = shuffle(t.options.map((text, i) => ({ text, ok: i === 0 })));
            box.innerHTML = `<p class="eyebrow task__kicker">${UI.reviewKicker(k + 1, items.length)}</p>
                <p class="review-from">${esc(UI.reviewFrom(it.lessonTitle))}</p>
                <h2 class="question">${esc(t.q)}</h2>
                <div class="options">${opts.map((o, i) =>
                    `<button class="option" type="button" data-i="${i}"><span class="option__key">${UI.letters[i]}</span><span>${esc(o.text)}</span></button>`).join('')}
                </div>`;
            this.setNext(UI.btn.choose, false);
            r.onNext = () => { k++; if (k < items.length) draw(); else finish(); };
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
                results.push({ lessonId: it.lessonId, ok: chosen.ok, due: it.due });
                Sound.play(chosen.ok ? 'good' : 'bad');
                this.showFeedback(chosen.ok ? 'good' : 'bad', chosen.ok ? pick(UI.good) : pick(UI.bad),
                    chosen.ok ? t.explain : UI.correctIs(right.text, t.explain));
                this.setNext(UI.btn.next, true);
            }));
        };
        r.review = { skip: finish };
        draw();
    },

    closeLesson() {
        if (this.leaveArena) this.leaveArena();
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
        const box = this.clearTask();
        r.onNext = () => this.nextTask();
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
        if (r.lesson.boss && !hasArena(r.lesson) && typeof score === 'number') this.hitBoss(score);
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
        // Предсказание в начале урока: ставка → что на самом деле → удивление. Без оценки:
        // ошибка предсказания тут не промах, а то, ради чего задание есть.
        predict(t, box) {
            box.innerHTML = this.head(UI.predictKicker, t.title, t.text) + `<div class="options">${t.options.map((o, i) =>
                `<button class="option" type="button" data-i="${i}"><span class="option__key">${UI.letters[i]}</span><span>${esc(o)}</span></button>`).join('')}
            </div>`;
            this.setNext(UI.btn.choose, false);
            const buttons = $$('.option', box);
            buttons.forEach(btn => btn.addEventListener('click', () => {
                const i = +btn.dataset.i;
                buttons.forEach((b, j) => {
                    b.disabled = true;
                    if (j === t.answer) b.classList.add('is-right');
                    else if (j === i) b.classList.add('is-mine');
                    else b.classList.add('is-dim');
                });
                this.answered(null, { title: i === t.answer ? UI.predictHit : UI.predictMiss, text: t.reveal });
            }));
        },

        // Бой с Глитчем: экран перед боем → игра на весь экран (arena.js + Phaser) → разбор раундов.
        // Без клавиатуры или без желания стрелять — те же раунды обычными вопросами, оценка та же.
        // Балл — доля раундов с ответом с первой попытки, но не меньше 0.5: Глитч побеждён, станция пройдена.
        arena(t, box) {
            const r = this.run, A = UI.arena, N = t.rounds.length;
            const touch = window.matchMedia('(pointer: coarse)').matches;
            const token = r.token;

            const done = (results, deaths) => {
                if (this.run !== r) return;
                const c = results.filter(Boolean).length;
                box.innerHTML = this.head(A.recapKicker, A.recapTitle(c, N), A.recapText) +
                    `<ol class="recap">${t.rounds.map((rd, i) => `<li class="${results[i] ? 'is-ok' : 'is-miss'}">
                        <span class="recap__mark" aria-hidden="true">${results[i] ? '✓' : '↺'}</span>
                        <div>
                            <p class="recap__q"><span class="sr-only">${results[i] ? A.firstTry : A.retried}: </span>${esc(rd.q)}</p>
                            <p class="recap__a">${esc(rd.options[0])}</p>
                            <p class="recap__x">${esc(rd.explain)}</p>
                        </div>
                    </li>`).join('')}</ol>`;
                r.onNext = () => this.nextTask();
                this.answered(c === N ? 1 : Math.max(.5, c / N), { title: A.doneTitle(c, N), text: A.doneText(deaths) });
            };

            const intro = () => {
                const keys = touch ? A.touchKeys : A.keys;
                box.innerHTML = this.head(A.kicker, t.title, t.text) + `
                    <ul class="arena-keys">${keys.map(([k, v]) => `<li><kbd>${esc(k)}</kbd><span>${esc(v)}</span></li>`).join('')}</ul>
                    <button class="btn btn--go btn--lg btn--block arena-start" type="button">${A.start}</button>
                    <p class="arena-note" hidden>${A.failed}</p>
                    <button class="link-btn arena-quiz" type="button">${A.noShoot}</button>`;
                this.setNext(A.locked, false);
                const start = $('.arena-start', box);
                start.addEventListener('click', () => fight(start));
                $('.arena-quiz', box).addEventListener('click', quiz);
            };

            const fight = async start => {
                start.disabled = true;
                start.textContent = A.loading;
                Sound.play('tap');
                try {
                    await Arena.load('vendor/phaser.min.js');
                } catch (e) {
                    start.disabled = false;
                    start.textContent = A.start;
                    $('.arena-note', box).hidden = false;
                    return;
                }
                if (this.run !== r || r.token !== token) return;
                this.openArena(t, r.lesson.boss, {
                    onEnd: res => done(res.results, res.deaths),
                    onLeave: intro,
                    onFail: () => { intro(); $('.arena-note', box).hidden = false; }
                });
            };

            // Те же раунды без стрельбы: неверный вариант гаснет, ищешь дальше, верный — разбор и следующий раунд
            const quiz = () => {
                const results = [];
                let k = 0;
                const draw = () => {
                    const rd = t.rounds[k];
                    const opts = shuffle(rd.options.map((text, i) => ({ text, ok: i === 0 })));
                    $('#feedback').hidden = true;
                    box.innerHTML = `<p class="eyebrow task__kicker">${A.noShootKicker(k + 1, N)}${rd.topic ? ` · ${esc(rd.topic)}` : ''}</p>
                        <h2 class="question">${esc(rd.q)}</h2>
                        <div class="options">${opts.map((o, i) =>
                            `<button class="option" type="button" data-i="${i}"><span class="option__key">${UI.letters[i]}</span><span>${esc(o.text)}</span></button>`).join('')}
                        </div>`;
                    this.setNext(UI.btn.choose, false);
                    $('.lesson__body').scrollTop = 0;
                    const buttons = $$('.option', box);
                    buttons.forEach(btn => btn.addEventListener('click', () => {
                        const chosen = opts[+btn.dataset.i];
                        if (results[k] === undefined) results[k] = chosen.ok;
                        if (!chosen.ok) {
                            btn.disabled = true;
                            btn.classList.add('is-wrong');
                            Sound.play('bad');
                            this.showFeedback('bad', pick(UI.bad), A.wrong.replace(/^✗\s*/, ''));
                            return;
                        }
                        buttons.forEach((b, i) => {
                            b.disabled = true;
                            if (opts[i].ok) b.classList.add('is-right');
                            else if (!b.classList.contains('is-wrong')) b.classList.add('is-dim');
                        });
                        Sound.play('good');
                        this.showFeedback('good', pick(UI.good), rd.explain);
                        this.setNext(k < N - 1 ? A.nextRound : UI.btn.next, true);
                    }));
                };
                r.onNext = () => {
                    k++;
                    if (k < N) draw();
                    else done(results, 0);
                };
                draw();
            };

            intro();
        },

        cards(t, box) {
            let k = 0;
            const draw = () => {
                const c = t.cards[k];
                box.innerHTML = `<article class="card">
                    <div class="card__head">
                        <div class="card__bot sticker" aria-hidden="true">${blup(c.pose)}</div>
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

        // Текст урока вместо ролика: заголовки, примеры промптов, «проверь себя» и итоги в конце.
        // В тексте **так** выделяется главное.
        read(t, box) {
            const rich = text => esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            const paras = text => (Array.isArray(text) ? text : [text]).map(p => `<p>${rich(p)}</p>`).join('');
            const section = s => `<section class="read__sec">
                ${s.h ? `<h3 class="read__h">${esc(s.h)}</h3>` : ''}
                ${s.text ? paras(s.text) : ''}
                ${s.big ? `<p class="card__big">${esc(s.big)}</p>` : ''}
                ${s.list ? `<ul class="read__list">${s.list.map(li => `<li>${rich(li)}</li>`).join('')}</ul>` : ''}
                ${s.example ? `<div class="chat read__example">
                    <p class="bubble bubble--me"><span class="bubble__who">${UI.prompt}</span>${esc(s.example.me)}</p>
                    ${s.example.ai ? `<p class="bubble bubble--ai"><span class="bubble__who">${UI.ai}</span>${esc(s.example.ai)}</p>` : ''}
                </div>` : ''}
                ${s.after ? paras(s.after) : ''}
                ${s.tip ? `<aside class="read__tip"><b>${esc(s.tip.label || UI.proTip)}</b><span>${rich(s.tip.text || s.tip)}</span></aside>` : ''}
                ${s.check ? `<div class="reveal">
                    <button class="reveal__btn" type="button" aria-expanded="false">${UI.checkYourself} ${esc(s.check.q)} <u>${UI.tap}</u></button>
                    <p class="reveal__answer" hidden>${rich(s.check.a)}</p>
                </div>` : ''}
            </section>`;

            box.innerHTML = `<article class="read">
                <header class="read__head">
                    <div class="read__bot sticker" aria-hidden="true">${blup(t.pose || 'point')}</div>
                    <p class="eyebrow task__kicker">${UI.readKicker(t.part, t.minutes)}</p>
                    <h2 class="read__title">${esc(t.title)}</h2>
                    ${t.intro ? `<p class="read__intro">${rich(t.intro)}</p>` : ''}
                </header>
                ${t.sections.map(section).join('')}
                ${t.takeaways ? `<div class="read__sum">
                    <p class="eyebrow">${UI.takeaways}</p>
                    <ul>${t.takeaways.map(li => `<li>${rich(li)}</li>`).join('')}</ul>
                </div>` : ''}
            </article>`;

            $$('.reveal__btn', box).forEach(btn => btn.addEventListener('click', () => {
                btn.nextElementSibling.hidden = false;
                btn.setAttribute('aria-expanded', 'true');
                Sound.play('pop');
            }));
            this.setNext(UI.btn.gotIt, true);
            this.run.onNext = () => {
                this.run.scores[this.run.step] = null;
                this.nextTask();
            };
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
            // Письменные задания с portfolio: true сохраняются: последний ответ на задание
            const keep = text => {
                if (!t.portfolio) return;
                const r = this.run;
                this.state.portfolio = this.state.portfolio || {};
                this.state.portfolio[r.lesson.id + ':' + r.step] = { lesson: r.lesson.title, title: t.title, text, at: Game.dayKey() };
                this.save();
                if (!$('.talk-saved', box)) form.insertAdjacentHTML('afterend', `<p class="talk-saved">✓ ${UI.talkSaved}</p>`);
            };

            if (!Tutor.enabled) {
                form.addEventListener('submit', e => {
                    e.preventDefault();
                    const text = $('textarea', form).value.trim().slice(0, 500);
                    if (!text) return;
                    keep(text);
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
                onSend: keep,
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

            const maxTurns = t.maxTurns || 4;
            box.innerHTML = this.head(UI.chatKicker, t.title, t.text) + steps +
                (prompts.length > 1 ? `<p class="eyebrow">${UI.chatPrompts}</p>
                    <div class="chat-chips">${prompts.map((x, i) => `<button class="chat-chip" type="button" data-i="${i}"><span>${esc(x)}</span></button>`).join('')}</div>` : '') + `
                <div class="chat-log chat-log--task" aria-live="polite"></div>
                <div class="guess" role="group" aria-label="${esc(UI.chatGuessTitle)}">
                    <p class="eyebrow">${UI.chatGuessTitle}</p>
                    <div class="guess__row">${UI.chatGuesses.map((g, i) =>
                        `<button class="chip-btn" type="button" data-g="${i}" aria-pressed="false">${esc(g)}</button>`).join('')}</div>
                </div>
                ${chatForm(UI.chatPlaceholder, 1200)}
                <p class="chat-left" aria-live="polite">${UI.chatLeft(maxTurns)}</p>
                <div class="chat-tools">
                    <p class="chat-note">${UI.chatHint}</p>
                    <button class="link-btn chat-new" type="button">${UI.chatNew}</button>
                </div>`;
            const log = $('.chat-log', box), form = $('.chat-form', box);
            const input = $('textarea', form);
            const alive = () => this.run && this.run.token === token;
            input.value = prompts[0] || '';

            // Перед каждым сообщением ученик выбирает, какой ответ ждёт: ставка делает результат заметным
            const guessBox = $('.guess', box);
            const guessBtns = $$('.guess .chip-btn', box);
            let guess = null, pending = null;
            const markGuess = () => guessBtns.forEach((b, i) => {
                b.classList.toggle('is-on', i === guess);
                b.setAttribute('aria-pressed', String(i === guess));
            });
            guessBtns.forEach(b => b.addEventListener('click', () => {
                guess = +b.dataset.g;
                markGuess();
                Sound.play('tap');
            }));

            $$('.chat-chip', box).forEach(chip => chip.addEventListener('click', () => {
                input.value = prompts[+chip.dataset.i];
                input.focus();
                Sound.play('tap');
            }));

            // Незаполненные [скобки] из шаблона: выделяем первую и просим заменить
            const guard = () => {
                const m = input.value.match(/\[[^\]\n]{1,60}\]/);
                if (m) {
                    this.toast(UI.chatFill);
                    input.focus();
                    input.setSelectionRange(m.index, m.index + m[0].length);
                    return false;
                }
                if (guess === null) {
                    this.toast(UI.chatPickGuess);
                    guessBox.classList.remove('is-shake');
                    void guessBox.offsetWidth;
                    guessBox.classList.add('is-shake');
                    return false;
                }
                pending = guess;
                guess = null;
                markGuess();
                return true;
            };

            // Лимит сообщений общий на задание: «Новый чат» не начинает его заново
            const chat = Tutor.chat({
                log, form, mode: 'chat', lesson: this.run.lesson.title,
                context: { task: t.title, goal: t.text || '', steps: t.steps || [] },
                maxTurns, maxLength: 1200, guard,
                onReply: (data, bubble) => {
                    if (!alive()) return;
                    if (pending !== null) bubble.insertAdjacentHTML('beforeend', `<span class="bubble__guess">${esc(UI.chatExpected(UI.chatGuesses[pending]))}</span>`);
                    pending = null;
                    Sound.play('pop');
                    this.setNext(UI.btn.next, true);
                },
                onTurn: left => {
                    if (!alive()) return;
                    $('.chat-left', box).textContent = UI.chatLeft(left);
                    guessBox.hidden = left <= 0;
                }
            });
            $('.chat-new', box).addEventListener('click', () => {
                chat.reset(true);
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
                    <span class="chat-bot sticker" id="tutor-blup" aria-hidden="true"></span>
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

    // ---------- Бой с Глитчем на весь экран (arena.js) ----------
    // Phaser уже должен быть загружен (Arena.load). onEnd — бой выигран, onLeave — «Leave the fight», onFail — игра не запустилась.
    async openArena(t, boss, { onEnd, onLeave, onFail }) {
        const A = UI.arena;
        const el = document.createElement('div');
        el.className = 'arena';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', t.title);
        el.innerHTML = `<div class="arena__stage"></div>
            <button class="arena__leave" type="button">${A.leave}</button>
            <p class="arena__turn">${A.turn}</p>`;
        document.body.appendChild(el);
        let game = null;
        const close = () => {
            if (game) game.destroy();
            game = null;
            el.remove();
            this.leaveArena = this.arena = null;
        };
        this.leaveArena = close;
        $('.arena__leave', el).addEventListener('click', () => { close(); onLeave(); });
        try {
            game = await Arena.play({
                parent: $('.arena__stage', el),
                boss, rounds: t.rounds, text: A,
                calm: REDUCED, touch: window.matchMedia('(pointer: coarse)').matches,
                sfx: name => Sound.play(name),
                bloop: size => bob(STATES.neutral, { body: '#C6F432', accent: '#7C5CFF', screen: '#15171D', glow: '#E9FFB0', joint: '#7C5CFF' }, size),
                onEnd: res => { close(); onEnd(res); }
            });
            if (!this.leaveArena) { game.destroy(); return; }
            this.arena = game;
        } catch (e) {
            console.warn('Arena:', e);
            close();
            onFail();
        }
    },

    // Ссылка …/ai-trail-v3/#fight открывает бой сразу, без прохождения станций.
    // Это просмотр: прогресс, звёзды и XP не меняются, станция босса остаётся закрытой.
    async demoArena() {
        const st = Game.stations().find(x => x.lesson.boss);
        const t = st && st.lesson.tasks.find(x => x.type === 'arena');
        if (!t || this.arena) return;
        this.toast(UI.arena.loading);
        try {
            await Arena.load('vendor/phaser.min.js');
        } catch (e) {
            this.toast(UI.arena.failed);
            return;
        }
        const back = () => { history.replaceState(null, '', location.pathname + location.search); };
        this.openArena(t, st.lesson.boss, {
            onEnd: res => { back(); this.toast(UI.arena.demoDone(res.results.filter(Boolean).length, res.results.length)); },
            onLeave: back,
            onFail: () => { back(); this.toast(UI.arena.failed); }
        });
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
        el.hidden = !B || hasArena(this.run.lesson);
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
        const res = Game.applyLesson(this.state, r.lesson.id, r.scores, undefined, (Date.now() - r.startedAt) / 1000);
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
        if (res.weekGoalMet) extra.push(['📅', UI.weekGoalMet]);
        else if (res.passed) extra.push(['📅', UI.weekProgress(res.week.done, res.week.goal)]);
        // Естественная точка остановки: тизер следующей станции, а после нескольких станций за день — отдых
        const limited = Game.limitReached(this.state);
        if (res.passed && lesson.teaser) extra.push(['🔮', UI.teaser(lesson.teaser)]);
        if (limited) extra.push(['🌙', UI.limitDone(this.state.dailyLimit)]);
        else if (res.rest) extra.push(['🌙', UI.rest(Game.dayStats(this.state).runs)]);
        $('#result-extra').innerHTML = extra.map(([icon, text], i) =>
            `<li style="animation-delay:${1.4 + i * .3}s"><span aria-hidden="true">${icon}</span>${esc(text)}</li>`).join('');

        const mapBtn = $('#result-map'), retry = $('#result-retry');
        if (res.passed) {
            mapBtn.textContent = UI.toMap;
            mapBtn.onclick = () => this.backToMap(res);
            retry.textContent = UI.replay;
            retry.onclick = () => this.startLesson(lesson.id, { fresh: true });
            retry.hidden = limited;
            // Конфетти — редкость: зона пройдена, первый идеальный урок или победа над боссом
            const big = res.blockCompleted || (lesson.boss && res.passed) || res.badges.some(b => b.id === 'sniper');
            if (big) this.confetti(180);
            Sound.play(big ? 'win' : 'star');
        } else {
            mapBtn.textContent = UI.again;
            mapBtn.onclick = () => this.startLesson(lesson.id, { fresh: true });
            retry.textContent = UI.map;
            retry.onclick = () => this.backToMap(res);
            retry.hidden = false;
            if (limited) {
                mapBtn.textContent = UI.toMap;
                mapBtn.onclick = () => this.backToMap(res);
                retry.hidden = true;
            }
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
        $('#settings-theme').value = s.theme || 'auto';
        $('#settings-big').checked = !!s.bigText;
        $('#settings-easy').checked = !!s.easyFont;
        $('#settings-calm').checked = !!s.calm;
        $('#reset-confirm').hidden = true;
        const min = sec => Math.round(sec / 60);
        $('#parent-time').textContent = UI.parentTime(min(Game.dayStats(s).sec), min(Game.weekSec(s)));
        const limit = $('#settings-limit'), pin = $('#settings-pin');
        limit.value = String(s.dailyLimit || 0);
        pin.value = '';
        limit.disabled = !!s.parentPin;
        $('#parent-note').textContent = s.parentPin ? UI.parentPinSet : UI.parentNoPin;
        $('#settings-sheet').showModal();
    },

    // ---------- Профиль: звание, навыки, портфолио, награды, сертификат ----------
    openProfile() {
        const s = this.state, t = Game.totals(s), lv = Game.levelFor(s.xp);
        $('#profile-level').textContent = lv.level;
        $('#profile-kicker').textContent = UI.profileKicker(t.lessonsDone, t.mainTotal);
        $('#profile-title').textContent = lv.title;
        const earned = BADGES.filter(b => s.badges[b.id]).length;
        $('#profile-stats').innerHTML = [
            [`${t.stars}`, UI.profileStats.stars],
            [`${earned}/${BADGES.length}`, UI.profileStats.badges],
            [`${t.weeksMet}`, UI.profileStats.weeks]
        ].map(([v, l]) => `<li><b>${v}</b><span>${l}</span></li>`).join('');

        $('#skills').innerHTML = COURSE.blocks.map(b => {
            const done = Game.blockDone(s, b);
            return `<section><h3>${esc(b.title)} <small>${done ? UI.skillsDone : UI.skillsTodo}</small></h3>
                <ul>${(b.skills || []).map(k => `<li class="${done ? 'is-on' : ''}">${esc(k)}</li>`).join('')}</ul></section>`;
        }).join('');

        const order = id => { const st = Game.findStation(id.split(':')[0]); return st ? st.index * 100 + +id.split(':')[1] : 1e9; };
        const items = Object.keys(s.portfolio || {}).sort((a, b) => order(a) - order(b));
        $('#portfolio').innerHTML = items.length ? items.map(id => {
            const it = s.portfolio[id];
            return `<article class="portfolio__item"><p class="eyebrow">${esc(it.lesson)} · ${esc(it.title)}</p>
                <p class="portfolio__text">${esc(it.text)}</p>
                <button class="link-btn" type="button" data-copy="${esc(id)}">${UI.portfolioCopy}</button></article>`;
        }).join('') : `<p class="empty">${UI.portfolioEmpty}</p>`;

        $('#badges').innerHTML = BADGES.map(b =>
            `<span class="badge${s.badges[b.id] ? '' : ' is-off'}" title="${esc(b.title + ': ' + b.desc)}" role="img" aria-label="${esc(b.title + (s.badges[b.id] ? UI.badgeHave : UI.badgeMissing))}">${b.icon}</span>`).join('');

        const complete = this.courseComplete();
        $('#cert-note').textContent = complete ? UI.certReady : UI.certLocked(t.blocksDone.length, COURSE.blocks.length);
        $('#cert-name-field').hidden = $('#cert-print').hidden = !complete;
        $('#cert-name').value = s.certName || s.name || '';
        this.profileTab('skills');
        $('#profile-sheet').showModal();
    },

    profileTab(name) {
        $$('#profile-sheet [role="tab"]').forEach(tab => {
            const on = tab.id === 'tab-' + name;
            tab.setAttribute('aria-selected', String(on));
            $('#' + tab.getAttribute('aria-controls')).hidden = !on;
        });
    },

    courseComplete() {
        return Game.totals(this.state).blocksDone.length === COURSE.blocks.length;
    },

    // Сертификат: заполняем скрытый блок .cert и печатаем. В печати видна только она (см. @media print)
    printCert() {
        if (!this.courseComplete()) return;
        const s = this.state, t = Game.totals(s);
        const name = $('#cert-name').value.trim() || s.name;
        s.certName = name;
        this.save();
        const last = Object.values(s.lessons).map(l => l.last).filter(Boolean).sort().pop() || Game.dayKey();
        const date = new Date(last + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const skills = COURSE.blocks.flatMap(b => b.skills || []);
        $('#cert').innerHTML = `<div class="cert__top">
                <div class="cert__brand"><svg viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#0E0F12"/><path d="M8 23c4 0 4-6 8-6s4-6 8-6" fill="none" stroke="#C6F432" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="11" r="3" fill="#C6F432"/></svg>AI Trail</div>
                <p class="cert__kicker">${UI.certTitle}</p>
            </div>
            <div>
                <p class="cert__name">${esc(name)}</p>
                <p class="cert__lead">${esc(UI.certLead(t.mainTotal, COURSE.blocks.length))}</p>
                <ul class="cert__skills">${skills.map(k => `<li>${esc(k)}</li>`).join('')}</ul>
            </div>
            <div class="cert__foot">
                <div><p>${esc(UI.certDate(date))} · ${esc(UI.certStars(t.stars, t.maxStars))}</p><p>${esc(UI.certNote)}</p></div>
                <span class="cert__bar"></span>
            </div>`;
        window.print();
    },

    // ---------- Карточка «мои навыки» для сторис: картинка 1080×1920, рисуется в браузере ----------
    openShare() {
        $('#share-name').checked = !!this.state.shareName;
        $('#share-sheet').showModal();
        this.drawShare();
    },

    async drawShare() {
        const s = this.state, t = Game.totals(s), lv = Game.levelFor(s.xp);
        const W = 1080, H = 1920;
        const cv = this.shareCanvas || (this.shareCanvas = document.createElement('canvas'));
        cv.width = W;
        cv.height = H;
        const c = cv.getContext('2d');
        // Старые Safari не знают roundRect: рисуем обычный прямоугольник
        if (!c.roundRect) c.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
        try { await Promise.all(['700 80px "Space Grotesk"', '500 40px "Space Grotesk"', '500 40px "Inter"'].map(f => document.fonts.load(f))); } catch (e) { /* системный шрифт */ }
        const display = '"Space Grotesk", system-ui, sans-serif', body = '"Inter", system-ui, sans-serif';
        const ACC = '#C6F432', INK = '#0B0C10', SOFT = '#A0A6B2', WHITE = '#F2F3F5';
        c.fillStyle = INK;
        c.fillRect(0, 0, W, H);
        // Изолинии фоном, как на карте курса
        c.strokeStyle = 'rgba(255,255,255,.06)';
        c.lineWidth = 3;
        [[880, 380, 260], [180, 1500, 300]].forEach(([x, y, r]) => {
            for (let k = 1; k <= 4; k++) { c.beginPath(); c.ellipse(x, y, r * k / 4 + 30 * k, (r * k / 4 + 30 * k) * .7, .3, 0, Math.PI * 2); c.stroke(); }
        });
        // Логотип
        const logo = (x, y, size) => {
            c.save(); c.translate(x, y); c.scale(size / 32, size / 32);
            c.fillStyle = ACC; c.beginPath(); c.roundRect(0, 0, 32, 32, 9); c.fill();
            c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round';
            c.beginPath(); c.moveTo(8, 23); c.bezierCurveTo(12, 23, 12, 17, 16, 17); c.bezierCurveTo(20, 17, 20, 11, 24, 11); c.stroke();
            c.fillStyle = INK; c.beginPath(); c.arc(24, 11, 3, 0, Math.PI * 2); c.fill();
            c.restore();
        };
        logo(90, 120, 84);
        c.fillStyle = WHITE;
        c.font = `700 56px ${display}`;
        c.fillText('ai trail', 196, 180);
        // Звание
        c.fillStyle = ACC;
        c.font = `700 40px ${display}`;
        c.fillText(UI.shareKicker.toUpperCase(), 90, 420);
        c.fillStyle = WHITE;
        c.font = `700 ${lv.title.length > 14 ? 112 : 132}px ${display}`;
        c.fillText(lv.title, 82, 570);
        c.fillStyle = SOFT;
        c.font = `500 44px ${body}`;
        const who = s.shareName && s.name ? `${s.name} · ` : '';
        c.fillText(`${who}Lv ${lv.level} · ${s.xp} XP`, 90, 650);
        // Цифры
        c.fillStyle = '#1B1E26';
        c.beginPath(); c.roundRect(90, 720, W - 180, 150, 36); c.fill();
        c.fillStyle = WHITE;
        c.font = `700 52px ${display}`;
        c.fillText(UI.shareStats(t.stars, t.lessonsDone, t.mainTotal), 140, 815);
        // Навыки из пройденных зон
        const skills = COURSE.blocks.filter(b => Game.blockDone(s, b)).flatMap(b => b.skills || []).slice(0, 6);
        let y = 1000;
        c.font = `500 46px ${body}`;
        const wrap = (text, maxW) => {
            const words = text.split(' '), lines = [];
            let line = '';
            words.forEach(w => { const tryLine = line ? line + ' ' + w : w; if (c.measureText(tryLine).width > maxW && line) { lines.push(line); line = w; } else line = tryLine; });
            if (line) lines.push(line);
            return lines;
        };
        if (!skills.length) {
            c.fillStyle = SOFT;
            c.fillText(UI.shareStarted, 90, y);
            const st = Game.stations()[Game.currentIndex(s)];
            c.fillStyle = WHITE;
            c.font = `700 56px ${display}`;
            wrap(`${st.block.title}: ${st.lesson.title}`, W - 180).forEach((l, i) => c.fillText(l, 90, y + 90 + i * 70));
        } else {
            skills.forEach(k => {
                c.fillStyle = ACC;
                c.font = `700 46px ${display}`;
                c.fillText('✓', 90, y);
                c.fillStyle = WHITE;
                c.font = `500 44px ${body}`;
                const lines = wrap(k, W - 250);
                lines.forEach((l, i) => c.fillText(l, 150, y + i * 58));
                y += lines.length * 58 + 34;
            });
        }
        // Подвал
        c.fillStyle = ACC;
        c.beginPath(); c.roundRect(90, H - 230, 120, 14, 7); c.fill();
        c.fillStyle = SOFT;
        c.font = `500 38px ${body}`;
        c.fillText(UI.shareFoot, 90, H - 150);
        c.fillText(location.host + location.pathname.replace(/index\.html$/, ''), 90, H - 96);
        $('#share-img').src = cv.toDataURL('image/png');
    },

    cardBlob() {
        return new Promise(resolve => this.shareCanvas.toBlob(resolve, 'image/png'));
    },

    // Поделиться через меню телефона (сторис, мессенджеры); где не умеет — скачать картинку
    async shareCard() {
        const blob = await this.cardBlob();
        const file = new File([blob], 'ai-trail-skills.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try { await navigator.share({ files: [file], title: UI.shareTitle }); return; } catch (e) { if (e.name === 'AbortError') return; }
        }
        this.downloadCard(blob);
    },

    async downloadCard(blob) {
        blob = blob instanceof Blob ? blob : await this.cardBlob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ai-trail-skills.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        this.toast(UI.shareDone);
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
        const colors = ['--accent', '--violet', '--warn', '--ink', '--accent-deep'].map(v => css.getPropertyValue(v).trim());
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
            if (Game.limitReached(s)) { this.toast(UI.limitToast); return; }
            const st = Game.stations()[Game.currentIndex(s)];
            if (Game.passed(s, st.lesson.id)) this.openStation(this.nodeByIndex(st.index));
            else this.startLesson(st.lesson.id);
        });

        $('#brand').addEventListener('click', () => window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));
        $('#settings-btn').addEventListener('click', () => this.openSettings());
        $('#profile-btn').addEventListener('click', () => this.openProfile());
        $$('#profile-sheet [role="tab"]').forEach(tab => tab.addEventListener('click', () => this.profileTab(tab.id.replace('tab-', ''))));
        $('#share-btn').addEventListener('click', () => this.openShare());
        $('#share-name').addEventListener('change', e => { this.state.shareName = e.target.checked; this.save(); this.drawShare(); });
        $('#share-go').addEventListener('click', () => this.shareCard());
        $('#share-save').addEventListener('click', () => this.downloadCard());
        $('#cert-print').addEventListener('click', () => this.printCert());
        $('#portfolio').addEventListener('click', e => {
            const btn = e.target.closest('[data-copy]');
            if (!btn) return;
            const item = this.state.portfolio[btn.dataset.copy];
            if (!item) return;
            try { navigator.clipboard.writeText(item.text).then(() => { btn.textContent = UI.copied; }); } catch (err) { /* без буфера обмена */ }
        });
        $('#sound-btn').addEventListener('click', () => {
            this.state.sound = Sound.on = !this.state.sound;
            this.save();
            this.renderTopbar();
            Sound.play('pop');
        });

        $('#next-btn').addEventListener('click', () => { if (this.run && this.run.onNext) this.run.onNext(); });
        $('#skip-btn').addEventListener('click', () => {
            if (!this.run) return;
            if (this.run.review) { this.run.review.skip(); return; }
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
            s.theme = $('#settings-theme').value;
            s.bigText = $('#settings-big').checked;
            s.easyFont = $('#settings-easy').checked;
            s.calm = $('#settings-calm').checked;
            this.applyPrefs();
            // Лимит от родителя: без PIN меняется свободно и PIN можно задать, с PIN — только после его ввода
            const limit = +$('#settings-limit').value, pin = $('#settings-pin').value.trim();
            if (pin && !/^\d{4}$/.test(pin)) { this.save(); this.toast(UI.pinBad); return; }
            if (!s.parentPin) {
                s.dailyLimit = limit;
                if (pin) s.parentPin = pin;
            } else if (pin === s.parentPin) {
                s.dailyLimit = limit;
            } else if (pin || limit !== s.dailyLimit) {
                this.save();
                this.toast(UI.pinWrong);
                return;
            }
            this.save();
            $('#settings-sheet').close();
            this.renderAll();
            this.toast(UI.savedSettings);
        });
        $('#reset-btn').addEventListener('click', () => { $('#reset-confirm').hidden = false; });
        $('#settings-pin').addEventListener('input', e => {
            const s = this.state;
            if (s.parentPin) $('#settings-limit').disabled = e.target.value.trim() !== s.parentPin;
        });
        $('#reset-no').addEventListener('click', () => { $('#reset-confirm').hidden = true; });
        // Сброс прогресса не снимает лимит и PIN родителя
        $('#reset-yes').addEventListener('click', () => {
            const { dailyLimit, parentPin, theme, bigText, easyFont, calm, sound } = this.state;
            this.state = Object.assign(Game.newState(this.state.name), { dailyLimit, parentPin, theme, bigText, easyFont, calm, sound });
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
