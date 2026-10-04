'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../game.js');
const { COURSE, XP_RULES } = require('../course.js');

const block = COURSE.blocks[0];
const lesson = id => block.lessons.find(l => l.id === id);

// Все оцениваемые задания урока на один балл, остальные — null
function scores(l, value = 1) {
  return l.tasks.map(t => (G.isGraded(t) ? value : null));
}

function passAll(state, day = '2026-10-01') {
  let r;
  for (const l of block.lessons) {
    r = G.applyLesson(state, l.id, scores(l), day);
    state = r.state;
  }
  return { state, last: r };
}

test('stars by ratio', () => {
  assert.equal(G.starsFor(1), 3);
  assert.equal(G.starsFor(0.8), 2);
  assert.equal(G.starsFor(0.5), 1);
  assert.equal(G.starsFor(0.49), 0);
});

test('every playable task type is known and quiz options are not empty', () => {
  const known = ['cards', 'video', 'quiz', 'sort', 'build', 'spot', 'poll', 'mission', 'talk'];
  for (const st of G.stations()) {
    for (const t of st.lesson.tasks) {
      assert.ok(known.includes(t.type), st.lesson.id + ': ' + t.type);
      if (t.type === 'quiz') assert.ok(t.options.length >= 2);
      if (t.type === 'spot') assert.ok(t.wrong < t.sentences.length);
      if (t.type === 'talk') {
        assert.ok(!G.isGraded(t), 'talk is not graded');
        assert.ok(t.question && t.points.length && t.sample, st.lesson.id + ': talk needs question, points, sample');
      }
    }
  }
});

// Серия даёт бонус с comboFrom-го безошибочного задания подряд
const comboFor = run => Math.max(0, run - XP_RULES.comboFrom + 1) * XP_RULES.combo;

test('lesson XP: base + combo + done + perfect', () => {
  const l = lesson('l1');
  const n = l.tasks.filter(G.isGraded).length;
  const x = G.lessonXp(l, scores(l));
  assert.equal(x.graded, n);
  assert.equal(x.total, n * XP_RULES.correct + comboFor(n) + XP_RULES.lessonDone + XP_RULES.perfect);
  assert.equal(x.stars, 3);
});

test('partial sort score gives partial XP and breaks the combo', () => {
  const l = lesson('l1');
  const n = l.tasks.filter(G.isGraded).length;
  const s = scores(l);
  const sortAt = l.tasks.findIndex(t => t.type === 'sort');
  assert.equal(l.tasks.slice(0, sortAt).some(G.isGraded), false, 'sort is the first graded task');
  s[sortAt] = 5 / 6;
  const x = G.lessonXp(l, s);
  assert.equal(x.base, 8 + (n - 1) * XP_RULES.correct);
  assert.equal(x.combo, comboFor(n - 1)); // серия начинается только после сортировки
  assert.equal(x.stars, 2);
});

test('stations open one by one, author mode opens all', () => {
  let s = G.newState('Аня');
  assert.equal(G.isUnlocked(s, 0), true);
  assert.equal(G.isUnlocked(s, 1), false);
  s = G.applyLesson(s, 'l1', scores(lesson('l1')), '2026-10-01').state;
  assert.equal(G.isUnlocked(s, 1), true);
  assert.equal(G.currentIndex(s), 1);
  assert.equal(G.isUnlocked({ ...G.newState(), unlockAll: true }, 4), true);
});

test('failed lesson does not unlock the next one', () => {
  const l = lesson('l1');
  const r = G.applyLesson(G.newState(), 'l1', scores(l, 0), '2026-10-01');
  assert.equal(r.passed, false);
  assert.equal(G.isUnlocked(r.state, 1), false);
  assert.equal(r.earned, 0);
});

test('replay pays only the difference', () => {
  const l = lesson('l2');
  const half = scores(l).map((v, i) => (v === null ? null : i % 2 ? 1 : 0.5));
  const first = G.applyLesson(G.newState(), 'l2', half, '2026-10-01');
  const again = G.applyLesson(first.state, 'l2', half, '2026-10-01');
  assert.equal(again.earned, 0);
  const better = G.applyLesson(again.state, 'l2', scores(l), '2026-10-01');
  assert.equal(better.earned, G.lessonXp(l, scores(l)).total - first.xp.total);
});

test('block bonus and badge are given once', () => {
  const { state, last } = passAll(G.newState());
  assert.equal(last.blockCompleted, true);
  assert.equal(last.blockBonus, XP_RULES.blockDone);
  assert.ok(state.badges['block-b1']);
  const again = G.applyLesson(state, 't1', scores(lesson('t1')), '2026-10-02');
  assert.equal(again.blockBonus, 0);
});

test('day streak grows and burns', () => {
  let s = G.newState();
  s = G.applyLesson(s, 'l1', scores(lesson('l1')), '2026-10-01').state;
  s = G.applyLesson(s, 'l2', scores(lesson('l2')), '2026-10-02').state;
  assert.equal(s.streak, 2);
  assert.equal(G.currentStreak(s, '2026-10-03'), 2);
  assert.equal(G.currentStreak(s, '2026-10-05'), 0);
});

test('finishing a lesson clears its saved progress', () => {
  const s = { ...G.newState(), current: { lessonId: 'l1', step: 3, scores: [] } };
  const r = G.applyLesson(s, 'l1', scores(lesson('l1')), '2026-10-01');
  assert.equal(r.state.current, null);
});

test('English content mirrors the Russian one', () => {
  const en = require('../course.en.js');
  const shape = c => c.blocks.map(b => ({
    id: b.id, soon: !!b.soon, lessons: b.lessons.map(l => ({
      id: l.id, test: !!l.test, minutes: l.minutes,
      tasks: (l.tasks || []).map(t => ({
        type: t.type,
        cards: t.cards && t.cards.length,
        options: t.options && t.options.length,
        buckets: t.items && t.items.map(i => i.b),
        slots: t.slots && t.slots.map(s => s.options.length),
        wrong: t.wrong,
        points: t.points && t.points.length,
        scenes: t.scenes && t.scenes.map(s => s.sec + s.pose)
      }))
    }))
  }));
  assert.deepEqual(shape(en.COURSE), shape(COURSE));
  assert.deepEqual(en.XP_RULES, XP_RULES);
  assert.deepEqual(en.LEVELS.map(l => l.xp), require('../course.js').LEVELS.map(l => l.xp));
  assert.deepEqual(en.BADGES.map(b => b.id), require('../course.js').BADGES.map(b => b.id));
});
