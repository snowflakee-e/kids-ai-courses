'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../game.js');
const { COURSE, XP_RULES, BADGES, LEVELS } = require('../course.en.js');
const { SCENES } = require('../scenes.js');

const GAMES = ['poster', 'glitch', 'meter', 'draw', 'redact', 'hint'];

const all = COURSE.blocks.flatMap(b => (b.soon ? [] : b.lessons));
const lesson = id => all.find(l => l.id === id);
const regular = () => G.stations().filter(st => !st.lesson.test).map(st => st.lesson);

// Все оцениваемые задания урока на один балл, остальные — null
function scores(l, value = 1) {
  return l.tasks.map(t => (G.isGraded(t) ? value : null));
}

function pass(state, ids, day = '2026-10-01') {
  let r;
  for (const id of ids) {
    r = G.applyLesson(state, id, scores(lesson(id)), day);
    state = r.state;
  }
  return { state, last: r };
}

const mainIds = blockId => COURSE.blocks.find(b => b.id === blockId).lessons.filter(l => !l.extra).map(l => l.id);

test('stars by ratio', () => {
  assert.equal(G.starsFor(1), 3);
  assert.equal(G.starsFor(0.8), 2);
  assert.equal(G.starsFor(0.5), 1);
  assert.equal(G.starsFor(0.49), 0);
});

test('every task is valid', () => {
  const known = ['predict', 'read', 'cards', 'quiz', 'sort', 'build', 'spot', 'order', 'poll', 'chat', 'talk', 'arena'].concat(GAMES);
  const ids = new Set();
  for (const st of G.stations()) {
    const l = st.lesson;
    assert.ok(!ids.has(l.id), 'duplicate id ' + l.id);
    ids.add(l.id);
    assert.ok(l.title && l.goal && l.icon && l.minutes, l.id + ': title, goal, icon, minutes');
    assert.ok(l.tasks.some(G.isGraded), l.id + ': needs at least one graded task');
    for (const t of l.tasks) {
      const where = l.id + ': ' + t.type;
      assert.ok(known.includes(t.type), where);
      if (t.type === 'quiz') assert.ok(t.q && t.options.length >= 2 && t.explain, where);
      if (t.type === 'spot') assert.ok(t.wrong < t.sentences.length, where);
      if (t.type === 'sort') {
        assert.equal(t.buckets.length, 2, where);
        assert.ok(t.items.every(i => i.b === 0 || i.b === 1), where);
      }
      if (t.type === 'order') {
        assert.ok(t.items.length >= 3, where);
        assert.equal(new Set(t.items).size, t.items.length, where + ': steps must differ');
      }
      if (t.type === 'build') assert.ok(t.slots.every(s => s.options.length >= 2 && s.hint), where);
      if (t.type === 'arena') {
        assert.ok(l.boss, where + ': an arena belongs to a boss lesson');
        assert.ok(t.title && t.text && t.rounds.length >= 6, where + ': title, text, at least 6 rounds');
        for (const r of t.rounds) {
          assert.ok(r.topic && r.q && r.explain, where + ': round needs topic, q, explain');
          // Варианты летают карточками: 2–4 штуки, короткие, разные
          assert.ok(r.options.length >= 2 && r.options.length <= 4, where + ': 2–4 options');
          assert.ok(r.options.every(o => o.length <= 70), where + ': option over 70 chars');
          assert.equal(new Set(r.options).size, r.options.length, where + ': options must differ');
        }
      }
      if (t.type === 'talk') {
        assert.ok(!G.isGraded(t), 'talk is not graded');
        assert.ok(t.question && t.points.length && t.points.length <= 6 && t.sample, where + ': talk needs question, up to 6 points, sample');
      }
      if (t.type === 'chat') {
        assert.ok(!G.isGraded(t), 'chat is not graded');
        assert.ok(t.title && t.text && t.prompts.length && t.prompts.every(x => x && x.length <= 1200), where + ': chat needs title, text, prompts');
      }
      if (t.type === 'predict') {
        assert.ok(!G.isGraded(t), 'predict is not graded');
        assert.ok(t.title && t.text && t.options.length >= 2 && t.answer >= 0 && t.answer < t.options.length && t.reveal, where);
      }
      if (t.type === 'poster') {
        const ok = t.cards.filter(c => c.ok), traps = t.cards.filter(c => !c.ok);
        assert.ok(t.title && t.text && t.heading && t.heading.length <= 40, where + ': title, text, heading up to 40 chars');
        assert.ok(ok.length >= 3 && ok.length <= 5 && traps.length >= 3, where + ': 3–5 facts and at least 3 traps');
        assert.ok(t.cards.every(c => c.t && c.why && c.t.length <= 60), where + ': every card has text (up to 60 chars) and why');
        assert.ok(!t.stickers || t.stickers.length >= 2, where + ': stickers');
      }
      if (t.type === 'glitch') {
        const s = SCENES[t.scene];
        assert.ok(s && s.svg && s.prompt && s.alt, where + ': unknown scene ' + t.scene);
        assert.ok(s.spots.length >= 3, where + ': at least 3 glitches');
        for (const p of s.spots) {
          assert.ok(p.label && p.why && p.r >= 14, where + ': spot needs label, why, radius 14+');
          assert.ok(p.x >= 0 && p.x <= 400 && p.y >= 0 && p.y <= 300, where + ': spot inside the 400×300 picture');
        }
        // Зоны не перекрываются: одно нажатие — один глюк
        s.spots.forEach((a, i) => s.spots.slice(i + 1).forEach(b =>
          assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > a.r + b.r, where + ': spots overlap: ' + a.label + ' / ' + b.label)));
      }
      if (t.type === 'meter') {
        assert.ok(t.start && t.reply && t.parts.length >= 3, where + ': start, reply, parts');
        for (const p of t.parts) assert.equal(t.cards.filter(c => c.part === p).length, 1, where + ': exactly one card for ' + p);
        assert.ok(t.cards.filter(c => !c.part).length >= 2, where + ': at least 2 junk cards');
        assert.ok(t.cards.every(c => c.t && (c.part || c.why)), where + ': junk cards explain why');
        assert.ok(t.cards.every(c => !c.part || t.parts.includes(c.part)), where + ': card part must be one of parts');
      }
      if (t.type === 'draw') {
        assert.ok(!G.isGraded(t), 'draw is not graded');
        assert.ok(t.title && t.explain && t.rounds.length >= 2, where + ': title, explain, 2+ rounds');
        assert.ok(t.rounds.every(r => r.prompt && r.seconds >= 30 && r.seconds <= 120), where + ': prompt, 30–120 seconds');
        const last = t.rounds[t.rounds.length - 1];
        assert.ok(last.parts && last.parts.length >= 3, where + ': the last round has a checklist of parts');
        assert.ok(last.prompt.length > t.rounds[0].prompt.length * 3, where + ': the last prompt is much more detailed than the first');
      }
      if (t.type === 'redact') {
        const secrets = t.message.match(/\[\[(.+?)\|(.+?)\]\]/g) || [];
        assert.ok(secrets.length >= 3, where + ': at least 3 secrets');
        assert.ok(!/\[\[|\]\]/.test(t.message.replace(/\[\[(.+?)\|(.+?)\]\]/g, '')), where + ': broken [[secret|why]]');
        assert.ok(t.explain, where + ': explain');
      }
      if (t.type === 'hint') {
        const norm = v => String(v).toLowerCase().replace(/coins?|\s/g, '').replace(',', '.');
        assert.ok(t.puzzle && t.solution && t.explain && t.answers.length, where + ': puzzle, solution, explain, answers');
        assert.ok(t.hints.length >= 2 && t.hints.length <= 4, where + ': 2–4 hints');
        assert.ok(t.answers.map(norm).every(Boolean), where + ': empty answer after normalizing');
      }      if (t.type === 'read') {
        assert.ok(!G.isGraded(t), 'read is not graded');
        assert.ok(t.title && t.minutes > 0 && t.intro, where + ': title, minutes, intro');
        assert.ok(t.sections.length >= 3, where + ': at least 3 sections');
        assert.ok(t.sections.every(s => s.h || s.tip), where + ': a section needs a heading (or is a single tip)');
        assert.ok(t.sections.every(s => !s.check || (s.check.q && s.check.a)), where + ': check needs q and a');
        assert.ok(t.sections.every(s => !s.example || s.example.me), where + ': example needs a prompt');
        assert.ok(Array.isArray(t.takeaways) && t.takeaways.length >= 2 && t.takeaways.length <= 4, where + ': 2–4 takeaways');
        // Выделение **так** всегда парное, иначе в тексте останутся звёздочки
        const text = JSON.stringify([t.intro, t.sections, t.takeaways]);
        assert.equal((text.match(/\*\*/g) || []).length % 2, 0, where + ': unpaired **');
      }
    }
  }
});

test('no videos: the course is reading and practice only', () => {
  for (const st of G.stations()) assert.ok(st.lesson.tasks.every(t => t.type !== 'video'), st.lesson.id);
});

test('beginner stations: two parts each, short reading, a mini-game and practice', () => {
  assert.ok(G.stations().length >= 6 && G.stations().length <= 8, '6–8 stations for a beginner course, got ' + G.stations().length);
  for (const l of regular()) {
    const reads = l.tasks.filter(t => t.type === 'read');
    const quizzes = l.tasks.filter(t => t.type === 'quiz').length;
    const practice = l.tasks.filter(t => ['sort', 'build', 'spot', 'order', 'poll', 'talk', 'chat'].concat(GAMES).includes(t.type)).length;
    assert.deepEqual(reads.map(t => t.part), [1, 2], l.id + ': part 1 and part 2');
    assert.ok(quizzes <= 3, `${l.id}: ${quizzes} quiz questions`);
    assert.ok(practice >= 4, `${l.id}: only ${practice} practice tasks`);
    assert.ok(l.minutes >= 12 && l.minutes <= 20, `${l.id}: ${l.minutes} min, a beginner station is 12–20`);
    assert.ok(reads.every(r => r.minutes <= 4), `${l.id}: beginner reads are short`);
    // Каждая часть открывается предсказанием, потом текст
    reads.forEach(r => {
      const i = l.tasks.indexOf(r);
      assert.equal(l.tasks[i - 1].type, 'predict', `${l.id}: part ${r.part} opens with a prediction`);
    });
  }
});

test('the course ends with a boss fight game that mixes the skills', () => {
  const bosses = G.stations().filter(st => st.lesson.boss);
  assert.equal(bosses.length, 1, 'one boss');
  const st = bosses[0], l = st.lesson;
  assert.equal(st.index, G.stations().length - 1, 'the boss is the last station');
  assert.ok(l.test && !l.extra, 'the boss is a main finale');
  assert.ok(l.boss.name && l.boss.icon && l.boss.hp > 0 && l.boss.taunts.length && l.boss.hurt.length);
  const arenas = l.tasks.filter(t => t.type === 'arena');
  assert.equal(arenas.length, 1, 'one arena fight');
  const topics = arenas[0].rounds.map(r => r.topic);
  for (const topic of ['How AI learns', 'Chatbots', 'Fluent vs true', 'Hallucinations', 'AI images', 'Prompts', 'Steering', 'Image prompts', 'Privacy', 'Honest use']) {
    assert.ok(topics.includes(topic), 'boss round: ' + topic);
  }
  assert.equal(l.tasks[l.tasks.length - 1].type, 'talk', 'the final strike comes after the fight');
});

test('an arena counts as one graded task per round', () => {
  const l = lesson('boss'), n = l.tasks.find(t => t.type === 'arena').rounds.length;
  const comboFor = run => Math.max(0, run - XP_RULES.comboFrom + 1) * XP_RULES.combo;
  const x = G.lessonXp(l, scores(l));
  assert.equal(x.graded, n);
  assert.equal(x.boss, XP_RULES.bossDone);
  assert.equal(x.total, n * XP_RULES.correct + comboFor(n) + XP_RULES.lessonDone + XP_RULES.perfect + XP_RULES.bossDone);
  // Глитч побеждён, но с первой попытки меньше половины: станция пройдена на 1 звезду
  assert.equal(G.lessonXp(l, scores(l, .5)).stars, 1);
  assert.equal(G.lessonXp(l, scores(l, .8)).stars, 2);
  const r = G.applyLesson(G.newState(), 'boss', scores(l), '2026-10-01');
  assert.equal(r.state.bestCombo, n, 'a perfect fight is a combo of all its rounds');
});

test('beating the boss pays a big bonus once, losing pays nothing', () => {
  const l = lesson('boss');
  assert.ok(XP_RULES.bossDone >= 150, 'the boss bonus is bigger than any regular station');
  assert.equal(G.lessonXp(l, scores(l, 0)).boss, 0);
  assert.equal(G.lessonXp(lesson('s1'), scores(lesson('s1'))).boss, 0, 'regular stations get no boss bonus');
  const first = G.applyLesson(G.newState(), 'boss', scores(l, .5), '2026-10-01');
  assert.ok(first.earned >= XP_RULES.bossDone);
  const again = G.applyLesson(first.state, 'boss', scores(l, .5), '2026-10-02');
  assert.equal(again.earned, 0, 'no second bonus on a replay');
});

test('no side quests and no zone tests: only the boss is a test', () => {
  assert.ok(G.stations().every(st => !st.extra), 'no side quests');
  assert.deepEqual(G.stations().filter(st => st.lesson.test).map(st => st.lesson.id), ['boss']);
  assert.ok(G.stations().some(st => st.lesson.tasks.some(t => t.type === 'chat')));
});

test('lesson XP: base + combo + done + perfect', () => {
  const l = lesson('s1');
  const n = l.tasks.filter(G.isGraded).length;
  const comboFor = run => Math.max(0, run - XP_RULES.comboFrom + 1) * XP_RULES.combo;
  const x = G.lessonXp(l, scores(l));
  assert.equal(x.graded, n);
  assert.equal(x.total, n * XP_RULES.correct + comboFor(n) + XP_RULES.lessonDone + XP_RULES.perfect);
  assert.equal(x.stars, 3);
});

test('partial score gives partial XP and fewer stars', () => {
  const l = lesson('s1');
  const n = l.tasks.filter(G.isGraded).length;
  const s = scores(l);
  const first = l.tasks.findIndex(G.isGraded);
  s[first] = 5 / 6;
  const x = G.lessonXp(l, s);
  assert.equal(x.base, 8 + (n - 1) * XP_RULES.correct);
  assert.equal(x.stars, 2);
});

test('stations open one by one, author mode opens all', () => {
  let s = G.newState('Emma');
  assert.equal(G.isUnlocked(s, 0), true);
  assert.equal(G.isUnlocked(s, 1), false);
  s = G.applyLesson(s, 's1', scores(lesson('s1')), '2026-10-01').state;
  assert.equal(G.isUnlocked(s, 1), true);
  assert.equal(G.currentIndex(s), 1);
  assert.equal(G.isUnlocked({ ...G.newState(), unlockAll: true }, G.stations().length - 1), true);
});

test('a zone is cleared when all its stations are passed, the bonus comes once', () => {
  const { state, last } = pass(G.newState(), mainIds('b1'));
  assert.equal(last.blockCompleted, true);
  assert.equal(last.blockBonus, XP_RULES.blockDone);
  assert.ok(state.badges['block-b1']);
  const again = G.applyLesson(state, 's2', scores(lesson('s2')), '2026-10-02');
  assert.equal(again.blockBonus, 0);
  const t = G.totals(state);
  assert.equal(t.lessonsDone, mainIds('b1').length);
});

test('failed lesson does not unlock the next one', () => {
  const l = lesson('s1');
  const r = G.applyLesson(G.newState(), 's1', scores(l, 0), '2026-10-01');
  assert.equal(r.passed, false);
  assert.equal(G.isUnlocked(r.state, 1), false);
  assert.equal(r.earned, 0);
});

test('replay pays only the difference', () => {
  const l = lesson('s2');
  const half = scores(l).map((v, i) => (v === null ? null : i % 2 ? 1 : 0.5));
  const first = G.applyLesson(G.newState(), 's2', half, '2026-10-01');
  const again = G.applyLesson(first.state, 's2', half, '2026-10-01');
  assert.equal(again.earned, 0);
  const better = G.applyLesson(again.state, 's2', scores(l), '2026-10-01');
  assert.equal(better.earned, G.lessonXp(l, scores(l)).total - first.xp.total);
});

test('the whole trail can be finished and every badge is reachable', () => {
  const ids = G.stations().map(st => st.lesson.id);
  let state = G.newState();
  ['2026-10-01', '2026-10-02', '2026-10-03'].forEach((day, i) => {
    const part = ids.slice(i * Math.ceil(ids.length / 3), (i + 1) * Math.ceil(ids.length / 3));
    state = pass(state, part, day).state;
  });
  for (const b of BADGES) assert.ok(state.badges[b.id], 'badge ' + b.id);
  assert.equal(G.currentIndex(state), G.mainStations().slice(-1)[0].index);
});

test('the top rank needs most of the trail, but not a perfect run', () => {
  const max = regular().concat(lesson('boss')).reduce((sum, l) => sum + G.lessonXp(l, scores(l)).total, 0) +
    COURSE.blocks.length * XP_RULES.blockDone;
  const top = LEVELS[LEVELS.length - 1].xp;
  assert.ok(top <= max * 0.8, `top rank ${top} vs max ${max}`);
  assert.ok(top >= max * 0.5, `top rank ${top} is too easy for max ${max}`);
});

test('every station teases the next one', () => {
  G.mainStations().slice(0, -1).forEach(st => assert.ok(st.lesson.teaser, st.lesson.id + ': teaser'));
});

test('weekly goal: passed stations count, misses take nothing away', () => {
  assert.equal(XP_RULES.weekGoal, 3);
  let s = G.newState();
  s = G.applyLesson(s, 's1', scores(lesson('s1')), '2026-10-05').state; // понедельник
  s = G.applyLesson(s, 's2', scores(lesson('s2'), 0), '2026-10-06').state; // не пройдено — не в счёт
  s = G.applyLesson(s, 's2', scores(lesson('s2')), '2026-10-07').state;
  assert.deepEqual(G.week(s, '2026-10-08'), { done: 2, goal: 3, met: false, weeksMet: 0 });
  const r = G.applyLesson(s, 's3', scores(lesson('s3')), '2026-10-11'); // воскресенье той же недели
  assert.equal(r.weekGoalMet, true);
  assert.ok(r.badges.some(b => b.id === 'week-goal'));
  // Новая неделя начинается с нуля, но выполненная неделя остаётся навсегда
  assert.deepEqual(G.week(r.state, '2026-10-12'), { done: 0, goal: 3, met: false, weeksMet: 1 });
  assert.equal(G.week(r.state, '2026-11-30').weeksMet, 1);
  assert.equal(G.weekKey('2026-10-11'), '2026-10-05');
  assert.equal(G.weekKey('2026-10-12'), '2026-10-12');
});

test('time in lessons, natural stop and the parent daily limit', () => {
  let s = { ...G.newState(), dailyLimit: 2 };
  assert.equal(G.limitReached(s, '2026-10-05'), false);
  s = G.applyLesson(s, 's1', scores(lesson('s1')), '2026-10-05', 1300).state;
  s = G.applyLesson(s, 's2', scores(lesson('s2'), 0), '2026-10-05', 120.4).state;
  assert.deepEqual(G.dayStats(s, '2026-10-05'), { runs: 2, sec: 1420 });
  assert.equal(G.limitReached(s, '2026-10-05'), true, 'failed runs count towards the limit too');
  assert.equal(G.limitReached(s, '2026-10-06'), false, 'the limit resets the next day');
  assert.equal(G.limitReached({ ...s, dailyLimit: 0 }, '2026-10-05'), false, 'no limit by default');
  s = G.applyLesson(s, 's2', scores(lesson('s2')), '2026-10-07', 60).state;
  assert.equal(G.weekSec(s, '2026-10-08'), 1480);
  let t = G.newState();
  let r = G.applyLesson(t, 's1', scores(lesson('s1')), '2026-10-05');
  assert.equal(r.rest, false, 'one station is not enough for a break hint');
  r = G.applyLesson(r.state, 's2', scores(lesson('s2')), '2026-10-05');
  assert.equal(r.rest, false, 'two short stations are still fine');
  r = G.applyLesson(r.state, 's3', scores(lesson('s3')), '2026-10-05');
  assert.equal(r.rest, true, 'suggest a stop after 3 stations');
});

test('spaced review: tomorrow, then 3 and 7 days; a miss brings it back tomorrow', () => {
  let s = G.applyLesson(G.newState(), 's1', scores(lesson('s1')), '2026-10-05').state;
  assert.deepEqual(s.review.s1, { n: 0, next: '2026-10-06' });
  // В тот же день срок не подошёл: один вопрос из последнего урока для разминки, график не меняется
  let items = G.reviewFor(s, 's2', '2026-10-05');
  assert.equal(items.length, 1);
  assert.equal(items[0].due, false);
  assert.equal(items[0].task.type, 'quiz');
  assert.deepEqual(G.applyReview(s, [{ lessonId: 's1', ok: true, due: false }], '2026-10-05').review.s1, s.review.s1);
  items = G.reviewFor(s, 's2', '2026-10-06');
  assert.deepEqual(items.map(i => [i.lessonId, i.due]), [['s1', true]]);
  s = G.applyReview(s, [{ lessonId: 's1', ok: true, due: true }], '2026-10-06');
  assert.deepEqual(s.review.s1, { n: 1, next: '2026-10-09' });
  s = G.applyReview(s, [{ lessonId: 's1', ok: true, due: true }], '2026-10-09');
  assert.equal(s.review.s1.next, '2026-10-16');
  s = G.applyReview(s, [{ lessonId: 's1', ok: false, due: true }], '2026-10-16');
  assert.deepEqual(s.review.s1, { n: 2, next: '2026-10-17' });
  const quizzes = lesson('s1').tasks.filter(t => t.type === 'quiz');
  assert.equal(G.reviewFor(s, 's2', '2026-10-17')[0].task, quizzes[2 % quizzes.length]);
  // Не больше трёх вопросов, свой урок не повторяем, босс в повторение не попадает
  s = pass(G.newState(), ['s1', 's2', 's3', 's4'], '2026-10-01').state;
  items = G.reviewFor(s, 's4', '2026-10-20');
  assert.equal(items.length, 3);
  assert.ok(items.every(i => i.lessonId !== 's4' && i.due));
  s = pass(s, G.stations().slice(4).map(st => st.lesson.id), '2026-10-02').state;
  assert.equal(s.review.boss, undefined);
});

test('three zones: basics, prompts, safety; the Safe Zone ends with the boss', () => {
  assert.deepEqual(COURSE.blocks.map(b => b.lessons.map(l => l.id)), [['s1', 's2'], ['s3', 's4'], ['s5', 's6', 'boss']]);
  const text = id => JSON.stringify(COURSE.blocks.find(b => b.id === id)).toLowerCase();
  for (const word of ['training data', 'model', 'hallucination', 'source']) assert.ok(text('b1').includes(word), 'b1: ' + word);
  for (const word of ['role', 'context', 'format', 'follow-up', 'style', 'deepfake']) assert.ok(text('b2').includes(word), 'b2: ' + word);
  for (const word of ['password', 'address', 'stored', 'trusted adult', 'hint', 'ai use']) assert.ok(text('b3').includes(word), 'b3: ' + word);
});

test('every regular station has a mini-game, and every mini-game is used', () => {
  for (const l of regular()) assert.ok(l.tasks.some(t => GAMES.includes(t.type)), l.id + ': no mini-game');
  const used = new Set(G.stations().flatMap(st => st.lesson.tasks.map(t => t.type)));
  for (const g of GAMES) assert.ok(used.has(g), 'mini-game never used: ' + g);
  assert.ok(G.stations().filter(st => st.lesson.tasks.some(t => t.type === 'poster')).length >= 2, 'at least 2 infographics');
});

test('mini-games are graded, except drawing', () => {
  for (const g of ['poster', 'glitch', 'meter', 'redact', 'hint']) assert.equal(G.isGraded({ type: g }), true, g);
  assert.equal(G.isGraded({ type: 'draw' }), false);
});

test('finishing a lesson clears its saved progress', () => {
  const s = { ...G.newState(), current: { lessonId: 's1', step: 3, scores: [] } };
  const r = G.applyLesson(s, 's1', scores(lesson('s1')), '2026-10-01');
  assert.equal(r.state.current, null);
});

// ---------- Данные для сертификата, портфолио и званий ----------
test('every zone lists the skills it teaches, for the certificate and the share card', () => {
  for (const b of COURSE.blocks) {
    assert.ok(Array.isArray(b.skills) && b.skills.length >= 3, b.id + ': at least 3 skills');
    assert.ok(b.skills.every(k => typeof k === 'string' && k.length > 10 && k.length <= 70), b.id + ': short, readable skills');
  }
});

test('portfolio tasks are written tasks, and every zone has at least one', () => {
  for (const st of G.stations()) {
    for (const t of st.lesson.tasks) if (t.portfolio) assert.equal(t.type, 'talk', st.lesson.id + ': portfolio is only for talk tasks');
  }
  for (const b of COURSE.blocks) {
    assert.ok(b.lessons.some(l => l.tasks.some(t => t.portfolio)), b.id + ': no portfolio task');
  }
});

test('ranks go from rookie to AI pro and rise with XP', () => {
  assert.equal(LEVELS[0].title, 'Rookie');
  assert.equal(LEVELS[LEVELS.length - 1].title, 'AI Pro');
  LEVELS.slice(1).forEach((l, i) => assert.ok(l.xp > LEVELS[i].xp, l.title));
});

test('neutral money for Europe and the US: no currency signs in lessons', () => {
  const text = JSON.stringify(COURSE);
  assert.ok(!/[$€£]\s?\d/.test(text), 'found a price with a currency sign');
});

test('display settings and portfolio are part of a fresh state', () => {
  const s = G.newState('Ava');
  assert.deepEqual([s.theme, s.bigText, s.easyFont, s.calm, s.shareName], ['auto', false, false, false, false]);
  assert.deepEqual(s.portfolio, {});
});
