'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../game.js');
const { COURSE, XP_RULES, BADGES } = require('../course.en.js');

const all = COURSE.blocks.flatMap(b => (b.soon ? [] : b.lessons));
const lesson = id => all.find(l => l.id === id);
const index = id => G.findStation(id).index;

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
  const known = ['cards', 'video', 'quiz', 'sort', 'build', 'spot', 'order', 'poll', 'chat', 'talk'];
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
        assert.ok(t.question && t.points.length && t.sample, where + ': talk needs question, points, sample');
      }
      if (t.type === 'chat') {
        assert.ok(!G.isGraded(t), 'chat is not graded');
        assert.ok(t.title && t.text && t.prompts.length && t.prompts.every(x => x && x.length <= 1200), where + ': chat needs title, text, prompts');
      }
      if (t.type === 'video') assert.ok(t.scenes.every(s => s.sec > 0 && s.pose && s.voice && s.visual), where);
    }
  }
});

test('lessons stay practical: little theory, few quiz questions', () => {
  for (const st of G.stations()) {
    const l = st.lesson;
    if (l.test) continue;
    const cards = l.tasks.filter(t => t.type === 'cards').reduce((n, t) => n + t.cards.length, 0);
    const quizzes = l.tasks.filter(t => t.type === 'quiz').length;
    const practice = l.tasks.filter(t => ['sort', 'build', 'spot', 'order', 'poll', 'talk', 'chat'].includes(t.type)).length;
    assert.ok(cards <= 3, `${l.id}: ${cards} theory cards`);
    assert.ok(quizzes <= 3, `${l.id}: ${quizzes} quiz questions`);
    assert.ok(practice >= 3, `${l.id}: only ${practice} practice tasks`);
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

test('Bloop practice replaced the missions', () => {
  assert.ok(G.stations().every(st => !st.lesson.tasks.some(t => t.type === 'mission')));
  assert.ok(G.stations().some(st => st.lesson.tasks.some(t => t.type === 'chat')));
});

test('side quests: not in the first block, never first in a block, never a test', () => {
  COURSE.blocks.forEach((b, bi) => {
    b.lessons.forEach((l, li) => {
      if (!l.extra) return;
      assert.notEqual(bi, 0, l.id + ' is in the first block');
      assert.ok(li > 0 && !b.lessons[li - 1].extra, l.id + ' must follow a main lesson');
      assert.ok(!l.test, l.id + ' cannot be a test');
    });
  });
  assert.ok(G.stations().some(st => st.extra), 'the course has side quests');
});

test('lesson XP: base + combo + done + perfect', () => {
  const l = lesson('l1');
  const n = l.tasks.filter(G.isGraded).length;
  const comboFor = run => Math.max(0, run - XP_RULES.comboFrom + 1) * XP_RULES.combo;
  const x = G.lessonXp(l, scores(l));
  assert.equal(x.graded, n);
  assert.equal(x.total, n * XP_RULES.correct + comboFor(n) + XP_RULES.lessonDone + XP_RULES.perfect);
  assert.equal(x.stars, 3);
});

test('partial score gives partial XP and fewer stars', () => {
  const l = lesson('l1');
  const n = l.tasks.filter(G.isGraded).length;
  const s = scores(l);
  const first = l.tasks.findIndex(G.isGraded);
  s[first] = 5 / 6;
  const x = G.lessonXp(l, s);
  assert.equal(x.base, 8 + (n - 1) * XP_RULES.correct);
  assert.equal(x.stars, 2);
});

test('main stations open one by one, author mode opens all', () => {
  let s = G.newState('Emma');
  assert.equal(G.isUnlocked(s, 0), true);
  assert.equal(G.isUnlocked(s, 1), false);
  s = G.applyLesson(s, 'l1', scores(lesson('l1')), '2026-10-01').state;
  assert.equal(G.isUnlocked(s, 1), true);
  assert.equal(G.currentIndex(s), 1);
  assert.equal(G.isUnlocked({ ...G.newState(), unlockAll: true }, G.stations().length - 1), true);
});

test('a side quest opens after its station and never blocks the trail', () => {
  const x = G.stations().find(st => st.extra);
  const parent = G.stations()[x.parent];
  const before = G.stations().slice(0, x.index).filter(st => !st.extra).map(st => st.lesson.id);
  let { state } = pass(G.newState(), before.filter(id => id !== parent.lesson.id));
  assert.equal(G.isUnlocked(state, x.index), false, 'locked until its station is passed');
  state = pass(state, [parent.lesson.id]).state;
  assert.equal(G.isUnlocked(state, x.index), true);
  // Следующая главная станция открыта, хотя ответвление не пройдено, и Блуп стоит на ней
  const next = G.stations().slice(x.index + 1).find(st => !st.extra);
  assert.equal(G.isUnlocked(state, next.index), true);
  assert.equal(G.currentIndex(state), next.index);
});

test('a block is done without its side quests, side quests count separately', () => {
  let { state } = pass(G.newState(), [...mainIds('b1'), ...mainIds('b2')]);
  const b2 = COURSE.blocks.find(b => b.id === 'b2');
  assert.equal(G.blockDone(state, b2), true);
  assert.ok(state.badges['block-b2']);
  const t = G.totals(state);
  assert.equal(t.lessonsDone, mainIds('b1').length + mainIds('b2').length);
  assert.equal(t.extrasDone, 0);
  const extra = b2.lessons.find(l => l.extra);
  const r = G.applyLesson(state, extra.id, scores(extra), '2026-10-02');
  assert.equal(r.blockBonus, 0, 'a side quest gives no second block bonus');
  assert.equal(G.totals(r.state).extrasDone, 1);
  assert.ok(r.badges.some(b => b.id === 'side-quest'));
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
  const { state, last } = pass(G.newState(), mainIds('b1'));
  assert.equal(last.blockCompleted, true);
  assert.equal(last.blockBonus, XP_RULES.blockDone);
  assert.ok(state.badges['block-b1']);
  const again = G.applyLesson(state, 't1', scores(lesson('t1')), '2026-10-02');
  assert.equal(again.blockBonus, 0);
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
