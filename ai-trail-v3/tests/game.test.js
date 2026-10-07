'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../game.js');
const { COURSE, XP_RULES, BADGES, LEVELS } = require('../course.en.js');

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
  const known = ['predict', 'read', 'cards', 'quiz', 'sort', 'build', 'spot', 'order', 'poll', 'chat', 'talk'];
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
      if (t.type === 'read') {
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

test('fewer, bigger stations: two parts each, real reading, plenty of practice', () => {
  assert.ok(G.stations().length <= 12, 'at most 12 stations, got ' + G.stations().length);
  for (const l of regular()) {
    const reads = l.tasks.filter(t => t.type === 'read');
    const quizzes = l.tasks.filter(t => t.type === 'quiz').length;
    const practice = l.tasks.filter(t => ['sort', 'build', 'spot', 'order', 'poll', 'talk', 'chat'].includes(t.type)).length;
    assert.deepEqual(reads.map(t => t.part), [1, 2], l.id + ': part 1 and part 2');
    assert.ok(quizzes <= 3, `${l.id}: ${quizzes} quiz questions`);
    assert.ok(practice >= 6, `${l.id}: only ${practice} practice tasks`);
    assert.ok(l.minutes >= 15 && l.minutes <= 30, `${l.id}: ${l.minutes} min`);
    // Каждая часть открывается предсказанием, потом текст
    reads.forEach(r => {
      const i = l.tasks.indexOf(r);
      assert.equal(l.tasks[i - 1].type, 'predict', `${l.id}: part ${r.part} opens with a prediction`);
    });
  }
});

test('the course ends with a boss fight that mixes the skills', () => {
  const bosses = G.stations().filter(st => st.lesson.boss);
  assert.equal(bosses.length, 1, 'one boss');
  const st = bosses[0], l = st.lesson;
  assert.equal(st.index, G.stations().length - 1, 'the boss is the last station');
  assert.ok(l.test && !l.extra, 'the boss is a main finale');
  assert.ok(l.boss.name && l.boss.icon && l.boss.hp > 0 && l.boss.taunts.length && l.boss.hurt.length);
  const types = new Set(l.tasks.filter(G.isGraded).map(t => t.type));
  for (const type of ['build', 'order', 'spot', 'sort', 'quiz']) assert.ok(types.has(type), 'boss round: ' + type);
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
  assert.equal(XP_RULES.weekGoal, 2);
  let s = G.newState();
  s = G.applyLesson(s, 's1', scores(lesson('s1')), '2026-10-05').state; // понедельник
  s = G.applyLesson(s, 's2', scores(lesson('s2'), 0), '2026-10-06').state; // не пройдено — не в счёт
  assert.deepEqual(G.week(s, '2026-10-07'), { done: 1, goal: 2, met: false, weeksMet: 0 });
  const r = G.applyLesson(s, 's2', scores(lesson('s2')), '2026-10-11'); // воскресенье той же недели
  assert.equal(r.weekGoalMet, true);
  assert.ok(r.badges.some(b => b.id === 'week-goal'));
  // Новая неделя начинается с нуля, но выполненная неделя остаётся навсегда
  assert.deepEqual(G.week(r.state, '2026-10-12'), { done: 0, goal: 2, met: false, weeksMet: 1 });
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
  assert.equal(r.rest, false, 'one big station is not enough for a break hint');
  r = G.applyLesson(r.state, 's2', scores(lesson('s2')), '2026-10-05');
  assert.equal(r.rest, true, 'suggest a stop after 2 big stations');
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

test('the Open World zone covers fakes, bias, companions and careers before the boss', () => {
  const b4 = COURSE.blocks.find(b => b.id === 'b4');
  assert.deepEqual(b4.lessons.map(l => l.id), ['s8', 's9', 'boss']);
  const text = JSON.stringify(b4.lessons.slice(0, 2));
  for (const word of ['deepfake', 'bias', 'companion', 'jobs']) assert.ok(text.toLowerCase().includes(word), word);
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

test('ranks go from intern to architect and rise with XP', () => {
  assert.equal(LEVELS[0].title, 'Intern');
  assert.equal(LEVELS[LEVELS.length - 1].title, 'AI Architect');
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
