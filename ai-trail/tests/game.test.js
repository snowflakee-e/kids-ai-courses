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
  const known = ['cards', 'video', 'quiz', 'sort', 'build', 'spot', 'poll', 'mission'];
  for (const st of G.stations()) {
    for (const t of st.lesson.tasks) {
      assert.ok(known.includes(t.type), st.lesson.id + ': ' + t.type);
      if (t.type === 'quiz') assert.ok(t.options.length >= 2);
      if (t.type === 'spot') assert.ok(t.wrong < t.sentences.length);
    }
  }
});

test('lesson XP: base + combo + done + perfect', () => {
  const l = lesson('l1'); // 4 оцениваемых задания
  const x = G.lessonXp(l, scores(l));
  assert.equal(x.graded, 4);
  assert.equal(x.total, 40 + 2 * XP_RULES.combo + XP_RULES.lessonDone + XP_RULES.perfect);
  assert.equal(x.stars, 3);
});

test('partial sort score gives partial XP and breaks the combo', () => {
  const l = lesson('l1');
  const s = scores(l);
  s[l.tasks.findIndex(t => t.type === 'sort')] = 5 / 6;
  const x = G.lessonXp(l, s);
  assert.equal(x.base, 8 + 30);
  assert.equal(x.combo, XP_RULES.combo); // серия 3 только на последнем вопросе
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
