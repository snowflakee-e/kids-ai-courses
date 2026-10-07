'use strict';

// Каталог курсов Bloop AI School: общий для основного сайта и вариантов дизайна (designs/*).
// ages: [от, до] включительно. В выбранный диапазон попадает только курс, чей возраст целиком внутри:
// при выборе 6–8 видны курсы для 6–7, 7–8 и 6–8, но не для 9–11.
// Программа курсов собрана по исследованию kids-ai-teaching-research.pdf (разделы 5 и 10).
var BLOOP_CATALOG = (function () {
  var MIN_AGE = 6;
  var MAX_AGE = 17;
  var RANGE_KEY = 'bloop-age-range'; // выбранный возраст, общий для всех сайтов на домене

  // Сегменты по интересам (исследование, раздел 6)
  var INTERESTS = {
    games:    { label: 'Gaming', icon: '🎮' },
    art:      { label: 'Drawing and stories', icon: '🎨' },
    blog:     { label: 'Making videos', icon: '📱' },
    research: { label: 'How things work', icon: '🔬' },
    study:    { label: 'School and exams', icon: '📚' }
  };

  // 12–14 и 14–17 пересекаются на 14: группы из CLAUDE.md и исследования. Четырнадцатилетнему подходят обе.
  var AGE_GROUPS = [
    { id: '6-8', min: 6, max: 8, name: 'Explorers',
      style: 'Stories, characters and games. No technical words.',
      goal: 'Knows that AI is a program people taught, finds AI around the house and keeps three safety rules.',
      session: '25 min', group: 'Up to 5 kids, a grown-up nearby' },
    { id: '9-11', min: 9, max: 11, name: 'Inventors',
      style: 'Experiments, simple analogies and hands-on mini-tasks.',
      goal: 'Trains a model, explains why data matters, catches AI mistakes and makes pictures from a prompt.',
      session: '45 min', group: 'Up to 8 kids, work in pairs' },
    { id: '12-14', min: 12, max: 14, name: 'Creators',
      style: 'How AI works inside, real use cases and projects.',
      goal: 'Understands how a chatbot guesses words, writes prompts with a formula, checks facts and spots deepfakes.',
      session: '50 min', group: 'Up to 10, team roles, demo day' },
    { id: '14-17', min: 14, max: 17, name: 'Pros',
      style: 'Real tools for studying and own projects.',
      goal: 'Uses AI as a study partner, not a ghostwriter, builds an own assistant and knows where AI does not belong.',
      session: 'App + weekly 60–75 min live', group: 'Up to 15, project teams of 3–4' }
  ];

  // playable: курс уже есть в кабинете (kids-ai-cabinet); url: курс живёт отдельной страницей в этом репозитории
  var COURSES = [
    { id: 'hello-ai', title: 'Hello, AI!', ages: [6, 7], lessons: 8, minutes: 25, level: 'Starter',
      desc: 'Find the smart things at home, see how a machine “sees” and “hears”, and learn three safety rules.',
      interests: ['research'], palette: 'mint', pose: 'hello', thumb: '#DDF6EF', playable: true, popular: true },
    { id: 'teach-bloop', title: 'Teach Bloop with Examples', ages: [6, 8], lessons: 6, minutes: 25, level: 'Starter',
      desc: 'Show Bloop ten photos of a toy and watch it learn. Turn the toy upside down and find out why it gets confused.',
      interests: ['research', 'games'], palette: 'sky', pose: 'idea', thumb: '#E1F0FF' },
    { id: 'ai-tales', title: 'Fairy Tales with AI', ages: [7, 8], lessons: 6, minutes: 30, level: 'Starter',
      desc: 'Invent a hero, tell the story out loud and see it turn into pictures, with a grown-up at the keyboard.',
      interests: ['art'], palette: 'peach', pose: 'delight', thumb: '#FFEADF' },

    { id: 'prompts', title: 'Magic Prompts', ages: [9, 11], lessons: 10, minutes: 45, level: 'Beginner',
      desc: 'Learn the “who + does what + where + in what style” formula and get the picture you imagined.',
      interests: ['art', 'blog'], palette: 'sky', pose: 'idea', thumb: '#E1F0FF', playable: true, popular: true },
    { id: 'ai-art', title: 'AI Artist', ages: [9, 11], lessons: 8, minutes: 45, level: 'Beginner',
      desc: 'Make comics and cards with AI, tell AI pictures from real ones and sign who made what.',
      interests: ['art', 'blog'], palette: 'lav', pose: 'wink', thumb: '#EEE9FF', playable: true },
    { id: 'glitch-hunt', title: 'Bloop vs Glitch', ages: [9, 10], lessons: 8, minutes: 40, level: 'Beginner',
      desc: 'Glitch keeps messing up Bloop’s data. Find made-up facts, fix bad examples and learn why AI gets things wrong.',
      interests: ['research', 'games'], palette: 'peach', pose: 'surprise', thumb: '#FFE0EA' },
    { id: 'train-model', title: 'Train Your Own Model', ages: [10, 11], lessons: 8, minutes: 45, level: 'Beginner',
      desc: 'Build a rock-paper-scissors detector in Teachable Machine and put it into your own Scratch game.',
      interests: ['games', 'research'], palette: 'mint', pose: 'run', thumb: '#DDF6EF' },

    { id: 'my-bot', title: 'Build Your Robot Helper', ages: [12, 14], lessons: 12, minutes: 50, level: 'Intermediate',
      desc: 'Write instructions for your own chatbot, test it on tricky questions and show what it can and can’t do.',
      interests: ['study', 'games'], palette: 'sky', pose: 'victory', thumb: '#FFF1C9', popular: true },
    { id: 'ai-games', title: 'Games and AI', ages: [12, 14], lessons: 10, minutes: 50, level: 'Intermediate',
      desc: 'Why does the Minecraft zombie walk to you and not into the wall? Design game characters with rules and with learning.',
      interests: ['games'], palette: 'mint', pose: 'run', thumb: '#FFE0EA' },
    { id: 'truth-or-fake', title: 'Truth or Fake?', ages: [12, 14], lessons: 8, minutes: 50, level: 'Intermediate',
      desc: 'Catch AI making things up, check facts in two sources, and spot deepfakes and scam voices.',
      interests: ['research', 'blog', 'study'], palette: 'lav', pose: 'think', thumb: '#EEE9FF' },

    { id: 'ai-trail', title: 'AI Trail', ages: [14, 17], lessons: 18, minutes: 8, level: 'Advanced',
      desc: 'Use AI for real: studying, projects, spotting fakes and bias. Short hands-on lessons with Bloop.',
      interests: ['study', 'research', 'blog'], palette: 'peach', pose: 'point', thumb: '#E3F5D6', url: 'ai-trail/' },
    { id: 'study-coach', title: 'AI Study Coach', ages: [15, 17], lessons: 6, minutes: 60, level: 'Advanced',
      desc: 'Prepare for exams with AI as a coach: it quizzes you, you answer, it explains mistakes. You learn, it doesn’t do the work.',
      interests: ['study'], palette: 'lav', pose: 'think', thumb: '#EEE9FF' }
  ];

  // '6-8' → { min: 6, max: 8 }; '7' → { min: 7, max: 7 }; иначе null («все возрасты»)
  function parseRange(value) {
    var m = /^(\d+)(?:-(\d+))?$/.exec(String(value || ''));
    if (!m) return null;
    var min = Number(m[1]);
    var max = m[2] ? Number(m[2]) : min;
    return min <= max ? { min: min, max: max } : null;
  }

  function fitsRange(course, min, max) {
    return course.ages[0] >= min && course.ages[1] <= max;
  }

  // Курсы, чей возраст целиком внутри диапазона. Без диапазона — все курсы.
  function coursesInRange(min, max, list) {
    list = list || COURSES;
    if (min == null) return list.slice();
    return list.filter(function (c) { return fitsRange(c, min, max); });
  }

  // Курсы для ребёнка конкретного возраста
  function coursesForAge(age, list) {
    return (list || COURSES).filter(function (c) { return c.ages[0] <= age && age <= c.ages[1]; });
  }

  function coursesForInterest(interest, list) {
    list = list || COURSES;
    if (!interest) return list.slice();
    return list.filter(function (c) { return c.interests.indexOf(interest) !== -1; });
  }

  function rangeLabel(min, max) {
    return min === max ? 'Age ' + min : 'Ages ' + min + '–' + max;
  }

  function courseAges(course) {
    return rangeLabel(course.ages[0], course.ages[1]);
  }

  // Первая группа, в которую курс помещается целиком
  function groupOf(course) {
    for (var i = 0; i < AGE_GROUPS.length; i++) {
      if (fitsRange(course, AGE_GROUPS[i].min, AGE_GROUPS[i].max)) return AGE_GROUPS[i];
    }
    return null;
  }

  function findCourse(id) {
    for (var i = 0; i < COURSES.length; i++) if (COURSES[i].id === id) return COURSES[i];
    return null;
  }

  // Куда ведёт кнопка курса. root — путь от страницы до корня репозитория ('' или '../../').
  // Кабинет — соседний репозиторий на том же домене. null — курса пока нет, ведём на пробный урок.
  function courseHref(course, root) {
    root = root || '';
    if (course.url) return root + course.url;
    if (course.playable) return root + '../kids-ai-cabinet/?start=' + encodeURIComponent(course.id);
    return null;
  }

  function loadRange() {
    try { return parseRange(localStorage.getItem(RANGE_KEY)); } catch (e) { return null; }
  }

  function saveRange(range) {
    try {
      if (range) localStorage.setItem(RANGE_KEY, range.min === range.max ? String(range.min) : range.min + '-' + range.max);
      else localStorage.removeItem(RANGE_KEY);
    } catch (e) { /* без хранилища выбор живёт до перезагрузки */ }
  }

  return {
    MIN_AGE: MIN_AGE, MAX_AGE: MAX_AGE, INTERESTS: INTERESTS, AGE_GROUPS: AGE_GROUPS, COURSES: COURSES,
    parseRange: parseRange, fitsRange: fitsRange, coursesInRange: coursesInRange, coursesForAge: coursesForAge,
    coursesForInterest: coursesForInterest, rangeLabel: rangeLabel, courseAges: courseAges, groupOf: groupOf,
    findCourse: findCourse, courseHref: courseHref, loadRange: loadRange, saveRange: saveRange
  };
})();

if (typeof module !== 'undefined') module.exports = BLOOP_CATALOG;
