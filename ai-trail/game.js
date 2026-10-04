'use strict';

// Логика курса без интерфейса: открытие станций, звёзды, XP, уровни, серии, награды.
// Работает в браузере (глобальные данные из course.en.js или course.js) и в Node (для тестов).
// В Node по умолчанию берёт английский курс — основной; make(data) собирает логику для другого курса.
(function (root) {
  var GRADED = { quiz: true, sort: true, build: true, spot: true, order: true };

  function make(D) {
    function newState(name) {
      return {
        version: 1,
        name: name || '',
        xp: 0,
        combo: 0,
        bestCombo: 0,
        streak: 0,
        bestStreak: 0,
        lastActive: null,
        xpByDay: {},
        lessons: {},
        badges: {},
        current: null,   // незаконченный урок: { lessonId, step, scores }
        blupAt: 0,       // станция, на которой стоит Блуп (для анимации перехода)
        sound: true,
        unlockAll: false // режим автора: все станции открыты
      };
    }

    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    // Дата в формате YYYY-MM-DD по локальному времени
    function dayKey(date) {
      var d = date || new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function daysBetween(a, b) {
      var pa = a.split('-').map(Number), pb = b.split('-').map(Number);
      return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
    }

    // Плоский список станций, в которые можно войти (блоки «скоро» не входят).
    // Урок с extra: true — ответвление от главной тропы: необязательный и сложнее.
    // Оно отходит от ближайшего главного урока перед ним (parent) и не держит дорогу дальше.
    var cache = null;
    function stations() {
      if (cache) return cache;
      cache = [];
      var lastMain = -1;
      D.COURSE.blocks.forEach(function (block, blockIndex) {
        if (block.soon) return;
        block.lessons.forEach(function (lesson) {
          var st = { block: block, blockIndex: blockIndex, lesson: lesson, index: cache.length, extra: !!lesson.extra };
          if (st.extra) st.parent = lastMain;
          else { st.prevMain = lastMain; lastMain = st.index; }
          cache.push(st);
        });
      });
      return cache;
    }

    function mainStations() {
      return stations().filter(function (st) { return !st.extra; });
    }

    function findStation(lessonId) {
      return stations().filter(function (st) { return st.lesson.id === lessonId; })[0] || null;
    }

    function passed(state, lessonId) {
      var r = state.lessons[lessonId];
      return !!(r && r.stars > 0);
    }

    // Главные станции открываются по очереди, ответвление — когда пройдена станция, от которой оно отходит
    function isUnlocked(state, index) {
      if (state.unlockAll) return true;
      var st = stations()[index], list = stations();
      var before = st.extra ? st.parent : st.prevMain;
      return before < 0 || passed(state, list[before].lesson.id);
    }

    // Первая непройденная главная станция; если всё пройдено — последняя главная
    function currentIndex(state) {
      var list = mainStations();
      for (var i = 0; i < list.length; i++) {
        if (!passed(state, list[i].lesson.id)) return list[i].index;
      }
      return list[list.length - 1].index;
    }

    function isGraded(task) { return !!GRADED[task.type]; }

    // 3 звезды — без ошибок, 2 — от 75%, 1 — от 50%, 0 — станция не пройдена
    function starsFor(ratio) {
      if (ratio >= 1) return 3;
      if (ratio >= 0.75) return 2;
      if (ratio >= 0.5) return 1;
      return 0;
    }

    // scores — по заданиям урока: число 0..1 у оцениваемых, null у остальных
    function lessonXp(lesson, scores) {
      var R = D.XP_RULES, run = 0, bestRun = 0, base = 0, combo = 0, sum = 0, graded = 0;
      lesson.tasks.forEach(function (task, i) {
        if (!isGraded(task)) return;
        var s = typeof scores[i] === 'number' ? scores[i] : 0;
        graded++;
        sum += s;
        base += Math.round(R.correct * s);
        if (s === 1) {
          run++;
          if (run >= R.comboFrom) combo += R.combo;
        } else {
          run = 0;
        }
        bestRun = Math.max(bestRun, run);
      });
      var ratio = graded ? sum / graded : 1;
      var stars = starsFor(ratio);
      var done = stars > 0 ? R.lessonDone : 0;
      var perfect = ratio >= 1 ? R.perfect : 0;
      return {
        ratio: ratio, stars: stars, graded: graded, bestRun: bestRun,
        base: base, combo: combo, done: done, perfect: perfect,
        total: base + combo + done + perfect
      };
    }

    function levelFor(xp) {
      var L = D.LEVELS, i = 0;
      while (i + 1 < L.length && xp >= L[i + 1].xp) i++;
      var cur = L[i], next = L[i + 1] || null;
      return {
        level: i + 1,
        title: cur.title,
        from: cur.xp,
        to: next ? next.xp : null,
        progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1
      };
    }

    // Блок пройден, когда пройдены все главные станции. Ответвления не обязательны.
    function blockDone(state, block) {
      return !block.soon && block.lessons.every(function (l) { return l.extra || passed(state, l.id); });
    }

    function totals(state) {
      // lessonsDone и mainTotal — только главная тропа, extrasDone и extrasTotal — ответвления
      var t = { stars: 0, maxStars: 0, lessonsDone: 0, mainTotal: 0, extrasDone: 0, extrasTotal: 0, perfectLessons: 0, blocksDone: [] };
      stations().forEach(function (st) {
        var r = state.lessons[st.lesson.id];
        t.maxStars += 3;
        if (st.extra) t.extrasTotal++;
        else t.mainTotal++;
        if (!r) return;
        t.stars += r.stars;
        if (r.stars > 0) {
          if (st.extra) t.extrasDone++;
          else t.lessonsDone++;
        }
        if (r.stars === 3) t.perfectLessons++;
      });
      D.COURSE.blocks.forEach(function (b) { if (blockDone(state, b)) t.blocksDone.push(b.id); });
      return t;
    }

    // Серия дней: сгорает, если пропущен хотя бы один день
    function currentStreak(state, today) {
      if (!state.lastActive) return 0;
      return daysBetween(state.lastActive, today || dayKey()) <= 1 ? state.streak : 0;
    }

    function touchStreak(s, today) {
      if (s.lastActive === today) return;
      s.streak = s.lastActive && daysBetween(s.lastActive, today) === 1 ? s.streak + 1 : 1;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      s.lastActive = today;
    }

    function unlockBadges(s, today) {
      var t = totals(s), unlocked = [];
      D.BADGES.forEach(function (b) {
        if (!s.badges[b.id] && b.check(s, t)) {
          s.badges[b.id] = today;
          unlocked.push(b);
        }
      });
      return unlocked;
    }

    // Применяет результат урока. Возвращает новое состояние и всё, что нужно показать.
    // Повторное прохождение даёт только разницу с лучшим результатом — XP нельзя «нафармить».
    function applyLesson(state, lessonId, scores, today) {
      today = today || dayKey();
      var s = clone(state);
      var st = findStation(lessonId);
      var R = D.XP_RULES;
      var levelBefore = levelFor(s.xp);
      var blockWasDone = blockDone(s, st.block);

      var x = lessonXp(st.lesson, scores);
      var prev = s.lessons[lessonId] || { stars: 0, bestXp: 0, bestRatio: 0, plays: 0 };
      var lessonEarned = Math.max(0, x.total - prev.bestXp);

      s.lessons[lessonId] = {
        stars: Math.max(prev.stars, x.stars),
        bestXp: Math.max(prev.bestXp, x.total),
        bestRatio: Math.max(prev.bestRatio || 0, x.ratio),
        plays: prev.plays + 1,
        last: today
      };

      // Серия безошибочных заданий продолжается между уроками и сбрасывается на ошибке
      var run = s.combo || 0;
      st.lesson.tasks.forEach(function (task, i) {
        if (!isGraded(task)) return;
        run = scores[i] === 1 ? run + 1 : 0;
        s.bestCombo = Math.max(s.bestCombo, run);
      });
      s.combo = run;

      var blockBonus = !blockWasDone && blockDone(s, st.block) ? R.blockDone : 0;
      var earned = lessonEarned + blockBonus;
      s.xp += earned;
      s.xpByDay[today] = (s.xpByDay[today] || 0) + earned;
      touchStreak(s, today);
      if (s.current && s.current.lessonId === lessonId) s.current = null;

      var levelAfter = levelFor(s.xp);
      return {
        state: s,
        xp: x,
        stars: x.stars,
        prevStars: prev.stars,
        passed: x.stars > 0,
        firstPass: prev.stars === 0 && x.stars > 0,
        isReplay: prev.plays > 0,
        lessonEarned: lessonEarned,
        blockBonus: blockBonus,
        earned: earned,
        blockCompleted: blockBonus > 0,
        levelUp: levelAfter.level > levelBefore.level ? levelAfter : null,
        badges: unlockBadges(s, today)
      };
    }

    var Game = {
      newState: newState, dayKey: dayKey, daysBetween: daysBetween,
      stations: stations, mainStations: mainStations, findStation: findStation, passed: passed,
      isUnlocked: isUnlocked, currentIndex: currentIndex, isGraded: isGraded,
      starsFor: starsFor, lessonXp: lessonXp, levelFor: levelFor,
      blockDone: blockDone, totals: totals, currentStreak: currentStreak,
      applyLesson: applyLesson
    };
    return Game;
  }

  if (typeof module !== 'undefined') {
    module.exports = make(require('./course.en.js'));
    module.exports.make = make;
  } else {
    root.Game = make(root);
  }
})(this);
