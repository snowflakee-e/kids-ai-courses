'use strict';

// Логика курса без интерфейса: открытие станций, звёзды, XP, уровни, недельная цель, награды,
// повторение пройденного по интервалам и дневной лимит от родителя.
// Работает в браузере (глобальные данные из course.en.js) и в Node (для тестов).
// make(data) собирает ту же логику для другого курса — пригодится для курсов других возрастов.
(function (root) {
  var GRADED = { quiz: true, sort: true, build: true, spot: true, order: true, arena: true };

  // Бой с боссом весит столько, сколько в нём раундов: иначе финал дал бы меньше XP, чем обычная станция
  function weightOf(task) { return task.type === 'arena' ? task.rounds.length : 1; }

  function make(D) {
    function newState(name) {
      return {
        version: 1,
        name: name || '',
        xp: 0,
        combo: 0,
        bestCombo: 0,
        xpByDay: {},
        days: {},        // по дням: { runs — законченных станций, sec — время в уроках }
        weeks: {},       // по неделям (ключ — понедельник): пройденных станций
        review: {},      // повторение: { lessonId: { n — удачных повторов, next — день следующего } }
        lessons: {},
        badges: {},
        current: null,   // незаконченный урок: { lessonId, step, scores }
        blupAt: 0,       // станция, на которой стоит Блуп (для анимации перехода)
        sound: true,
        unlockAll: false, // режим автора: все станции открыты
        dailyLimit: 0,   // лимит станций в день от родителя, 0 — без лимита
        parentPin: '',   // PIN родителя: без него лимит не поменять
        portfolio: {},   // ответы из заданий с portfolio: true — { lessonId: { lesson, title, text, at } }
        // Настройки вида: тема (auto — как в телефоне), крупный текст, шрифт для лёгкого чтения, меньше движения
        theme: 'auto',
        bigText: false,
        easyFont: false,
        calm: false,
        shareName: false // показывать имя на карточке «мои навыки»
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

    function addDays(day, n) {
      var p = day.split('-').map(Number);
      var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
      return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
    }

    // Неделя начинается в понедельник: ключ недели — дата её понедельника
    function weekKey(day) {
      var p = day.split('-').map(Number);
      return addDays(day, -((new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() + 6) % 7));
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
        var s = typeof scores[i] === 'number' ? scores[i] : 0, w = weightOf(task);
        graded += w;
        sum += s * w;
        base += Math.round(R.correct * s * w);
        if (s === 1) {
          for (var k = 0; k < w; k++) {
            run++;
            if (run >= R.comboFrom) combo += R.combo;
          }
        } else {
          run = 0;
        }
        bestRun = Math.max(bestRun, run);
      });
      var ratio = graded ? sum / graded : 1;
      var stars = starsFor(ratio);
      var done = stars > 0 ? R.lessonDone : 0;
      var perfect = ratio >= 1 ? R.perfect : 0;
      // Победа над боссом — большой бонус сверху. Он входит в лучший результат станции, поэтому платится один раз
      var boss = lesson.boss && stars > 0 ? (R.bossDone || 0) : 0;
      return {
        ratio: ratio, stars: stars, graded: graded, bestRun: bestRun,
        base: base, combo: combo, done: done, perfect: perfect, boss: boss,
        total: base + combo + done + perfect + boss
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
      var t = { stars: 0, maxStars: 0, lessonsDone: 0, mainTotal: 0, extrasDone: 0, extrasTotal: 0, perfectLessons: 0, blocksDone: [], weeksMet: weeksMet(state) };
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

    // Недельная цель вместо серии дней: пропущенный день ничего не отнимает, ничего не сгорает.
    // Считаются пройденные станции, повторы тоже.
    function week(state, today) {
      var goal = D.XP_RULES.weekGoal;
      var done = (state.weeks || {})[weekKey(today || dayKey())] || 0;
      return { done: done, goal: goal, met: done >= goal, weeksMet: weeksMet(state) };
    }

    // Сколько недель цель была выполнена за всё время: только растёт
    function weeksMet(state) {
      var w = state.weeks || {}, goal = D.XP_RULES.weekGoal;
      return Object.keys(w).filter(function (k) { return w[k] >= goal; }).length;
    }

    function dayStats(state, today) {
      var d = (state.days || {})[today || dayKey()];
      return { runs: d ? d.runs : 0, sec: d ? d.sec : 0 };
    }

    function weekSec(state, today) {
      var from = weekKey(today || dayKey()), days = state.days || {};
      return Object.keys(days).reduce(function (sum, k) {
        var n = daysBetween(from, k);
        return n >= 0 && n < 7 ? sum + days[k].sec : sum;
      }, 0);
    }

    // Лимит родителя: после него новые станции закрыты до завтра. Начатый урок можно закончить.
    function limitReached(state, today) {
      return state.dailyLimit > 0 && dayStats(state, today).runs >= state.dailyLimit;
    }

    // Естественная точка остановки: после нескольких станций за день предлагаем отдохнуть
    function restTime(state, today) {
      return dayStats(state, today).runs >= D.XP_RULES.restAfter;
    }

    // ---------- Повторение по интервалам ----------
    // После первого прохождения урок вернётся вопросом из своего теста через 1 день,
    // после верного ответа — через 3, 7, 14, 30 дней; после ошибки — снова завтра.
    var INTERVALS = [1, 3, 7, 14, 30];

    function quizzesOf(lesson) {
      return lesson.tasks.filter(function (t) { return t.type === 'quiz'; });
    }

    // Вопросы для разминки в начале урока: сначала те, чей срок подошёл (самые старые первыми).
    // Если срок не подошёл ни у кого — один вопрос из последнего пройденного урока, без влияния на график.
    function reviewFor(state, lessonId, today, max) {
      today = today || dayKey();
      max = max || 3;
      var R = state.review || {};
      var item = function (id, due) {
        var st = findStation(id), q = st && quizzesOf(st.lesson);
        if (!q || !q.length) return null;
        return { lessonId: id, lessonTitle: st.lesson.title, due: due, task: q[(R[id].n || 0) % q.length] };
      };
      var ids = Object.keys(R).filter(function (id) { return id !== lessonId && findStation(id); });
      var due = ids.filter(function (id) { return R[id].next <= today; })
        .sort(function (a, b) { return R[a].next < R[b].next ? -1 : R[a].next > R[b].next ? 1 : findStation(a).index - findStation(b).index; })
        .slice(0, max).map(function (id) { return item(id, true); }).filter(Boolean);
      if (due.length || !ids.length) return due;
      var last = ids.sort(function (a, b) {
        var la = (state.lessons[a] || {}).last || '', lb = (state.lessons[b] || {}).last || '';
        return la < lb ? 1 : la > lb ? -1 : findStation(b).index - findStation(a).index;
      })[0];
      var warm = item(last, false);
      return warm ? [warm] : [];
    }

    // results: [{ lessonId, ok, due }]. Меняет график только у вопросов, чей срок подошёл.
    function applyReview(state, results, today) {
      today = today || dayKey();
      var s = clone(state);
      s.review = s.review || {};
      results.forEach(function (r) {
        var rec = s.review[r.lessonId];
        if (!rec || !r.due) return;
        if (r.ok) {
          rec.n = (rec.n || 0) + 1;
          rec.next = addDays(today, INTERVALS[Math.min(rec.n, INTERVALS.length - 1)]);
        } else {
          rec.next = addDays(today, INTERVALS[0]);
        }
      });
      return s;
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
    // sec — сколько секунд шёл урок: родитель видит время за день и неделю.
    function applyLesson(state, lessonId, scores, today, sec) {
      today = today || dayKey();
      var s = clone(state);
      s.days = s.days || {};
      s.weeks = s.weeks || {};
      s.review = s.review || {};
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
        run = scores[i] === 1 ? run + weightOf(task) : 0;
        s.bestCombo = Math.max(s.bestCombo, run);
      });
      s.combo = run;

      var blockBonus = !blockWasDone && blockDone(s, st.block) ? R.blockDone : 0;
      var earned = lessonEarned + blockBonus;
      s.xp += earned;
      s.xpByDay[today] = (s.xpByDay[today] || 0) + earned;
      var day = s.days[today] || (s.days[today] = { runs: 0, sec: 0 });
      day.runs++;
      day.sec += Math.max(0, Math.round(sec || 0));
      var weekBefore = week(state, today);
      if (x.stars > 0) s.weeks[weekKey(today)] = (s.weeks[weekKey(today)] || 0) + 1;
      var weekAfter = week(s, today);
      // Урок с тестовыми вопросами попадает в повторение после первого прохождения
      if (x.stars > 0 && !st.lesson.test && !s.review[lessonId] && quizzesOf(st.lesson).length) {
        s.review[lessonId] = { n: 0, next: addDays(today, INTERVALS[0]) };
      }
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
        week: weekAfter,
        weekGoalMet: weekAfter.met && !weekBefore.met,
        rest: restTime(s, today),
        badges: unlockBadges(s, today)
      };
    }

    var Game = {
      newState: newState, dayKey: dayKey, daysBetween: daysBetween, addDays: addDays, weekKey: weekKey,
      stations: stations, mainStations: mainStations, findStation: findStation, passed: passed,
      isUnlocked: isUnlocked, currentIndex: currentIndex, isGraded: isGraded, weightOf: weightOf,
      starsFor: starsFor, lessonXp: lessonXp, levelFor: levelFor,
      blockDone: blockDone, totals: totals, week: week, dayStats: dayStats, weekSec: weekSec,
      limitReached: limitReached, restTime: restTime, reviewFor: reviewFor, applyReview: applyReview,
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
