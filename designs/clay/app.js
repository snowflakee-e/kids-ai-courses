'use strict';

// Clay: урок на 30 секунд (угадай → проверь → научи) и курсы только для возраста ребёнка.
// Возраст: из кабинета, если ребёнок вошёл (поменять можно только там), иначе кубик, выбранный гостем.
(function () {
    var C = BLOOP_CATALOG;
    var ROOT = '../../';
    var COLORS = ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)'];
    var BLOOP = { body: '#A78BFA', accent: '#FDCBC3', screen: '#332F3A', glow: '#F3EEFF', joint: '#F9A8D4' };
    var RED = '#E5484D';
    var GREEN = '#7CC24A';

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var bot = function (state) { return renderBobik(state, BLOOP); };
    var plural = function (n, one) { return n + ' ' + one + (n === 1 ? '' : 's'); };
    var colorOf = function (g) { return COLORS[Math.max(0, C.AGE_GROUPS.indexOf(g))]; };
    var profile = C.loadProfile(); // ребёнок вошёл в кабинет: { name, id, min, max }
    var current = null;

    function apple(color) {
        return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
            '<path d="M50 30c-12-10-36-6-36 22 0 22 16 40 28 40 4 0 6-2 8-2s4 2 8 2c12 0 28-18 28-40 0-28-24-32-36-22z" fill="' + color + '"/>' +
            '<rect x="47" y="12" width="6" height="20" rx="3" fill="#7A4E2D"/>' +
            '<ellipse cx="64" cy="18" rx="12" ry="6" transform="rotate(-25 64 18)" fill="#3FAE6B"/>' +
            '<ellipse cx="34" cy="44" rx="7" ry="11" fill="#fff" opacity=".35"/></svg>';
    }

    // ---------- Урок на 30 секунд (исследование: предскажи → проверь → удивись → пойми) ----------
    var lesson = { step: 0, guess: null, shelf: [RED, RED, RED] };

    function renderLesson() {
        var L = lesson;
        document.querySelectorAll('.lesson__steps li').forEach(function (li, i) {
            li.classList.toggle('is-on', i === L.step);
            li.classList.toggle('is-done', i < L.step);
        });
        $('#lesson-shelf').innerHTML = L.shelf.map(apple).join('');
        var bubble = $('#lesson-bubble');
        var title, text, actions;

        if (L.step === 0) {
            $('#lesson-bot').innerHTML = bot('think');
            $('#lesson-item').innerHTML = apple(GREEN);
            $('#lesson-item').classList.remove('is-flying');
            bubble.hidden = true;
            title = 'Will Bloop know this is an apple?';
            text = 'Bloop has only ever seen red apples. Make your guess first.';
            actions = '<button class="clay-btn" type="button" data-guess="yes">Yes, it will</button>' +
                '<button class="clay-btn clay-btn--soft" type="button" data-guess="no">No, it won’t</button>';
        } else if (L.step === 1) {
            $('#lesson-bot').innerHTML = bot('sad');
            showBubble('Not an apple?', 'is-wrong');
            title = L.guess === 'no' ? 'You guessed right!' : 'Surprise: it didn’t!';
            text = 'Bloop isn’t being silly. It learned that apples are red, because red is all it was shown.';
            actions = '<button class="clay-btn" type="button" data-teach>Show Bloop a green apple</button>';
        } else {
            $('#lesson-bot').innerHTML = bot('joy');
            showBubble('Apple!', 'is-right');
            title = 'Now Bloop knows.';
            text = 'AI learns only from the examples it is shown. That was lesson one of Teach Bloop with Examples, for ages 6 to 8.';
            actions = '<a class="clay-btn" href="#courses">See courses for my child</a>' +
                '<button class="clay-btn clay-btn--soft" type="button" data-restart><i class="ph-bold ph-arrow-counter-clockwise" aria-hidden="true"></i>Again</button>';
        }
        $('#lesson-title').textContent = title;
        $('#lesson-text').textContent = text;
        $('#lesson-actions').innerHTML = actions;
    }

    function showBubble(text, cls) {
        var b = $('#lesson-bubble');
        b.hidden = false;
        b.className = 'lesson__bubble ' + cls;
        b.textContent = text;
    }

    function teach() {
        // Зелёное яблоко «улетает» в примеры, Блуп думает и узнаёт его
        $('#lesson-item').classList.add('is-flying');
        $('#lesson-actions').innerHTML = '';
        $('#lesson-bubble').hidden = true;
        $('#lesson-bot').innerHTML = bot('think');
        setTimeout(function () {
            lesson.shelf = lesson.shelf.concat(GREEN);
            $('#lesson-shelf').innerHTML = lesson.shelf.map(apple).join('');
            $('#lesson-item').innerHTML = apple(GREEN);
            $('#lesson-item').classList.remove('is-flying');
            lesson.step = 2;
            renderLesson();
        }, 750);
    }

    // ---------- Кубики возраста и курсы ----------
    function renderBlocks() {
        $('#blocks').innerHTML = C.AGE_GROUPS.map(function (g, i) {
            var n = C.coursesInRange(g.min, g.max).length;
            return '<button class="block" type="button" style="--g:' + COLORS[i] + '" data-group="' + g.id + '" aria-pressed="false">' +
                '<span class="block__age">' + g.min + '–' + g.max + '</span>' +
                '<span class="block__name">' + g.name + '</span><span class="block__n">' + plural(n, 'course') + '</span></button>';
        }).join('');
    }

    function pick(groupId) {
        current = groupId || null;
        var range = C.parseRange(current);
        if (range && !profile) C.saveRange(range);
        document.querySelectorAll('.block').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.group === current));
        });
        if (!range) {
            $('#count').textContent = '';
            $('#course-list').innerHTML = '<p class="empty clay">Tap your child’s age above. You’ll see only the courses made for it.</p>';
            return;
        }
        var list = C.coursesInRange(range.min, range.max);
        $('#count').textContent = plural(list.length, 'course') + ' for ' + C.rangeLabel(range.min, range.max).toLowerCase();
        $('#course-list').innerHTML = list.map(card).join('');
        $('#lead-age').value = current;
    }

    function card(c, i) {
        var g = C.groupOf(c);
        var href = C.courseHref(c, ROOT);
        var go = href
            ? '<a class="clay-btn" href="' + href + '">Open the first lesson</a>'
            : '<a class="clay-btn clay-btn--soft" href="#book" data-lead="' + c.id + '">Book a free lesson</a>';
        return '<article class="course clay" style="--i:' + i + ';--g:' + colorOf(g) + '">' +
            '<div class="course__top"><span class="course__age">' + C.courseAges(c) + '</span>' +
            '<span class="course__bot" aria-hidden="true">' + bot(c.pose) + '</span></div>' +
            '<h3>' + c.title + '</h3><p>' + c.desc + '</p>' +
            '<ul class="course__meta"><li><i class="ph-bold ph-book-open" aria-hidden="true"></i>' + plural(c.lessons, 'lesson') + '</li>' +
            '<li><i class="ph-bold ph-clock" aria-hidden="true"></i>' + c.minutes + ' min</li>' +
            '<li><i class="ph-bold ph-student" aria-hidden="true"></i>' + c.level + '</li></ul>' +
            '<div class="course__go">' + go + '</div></article>';
    }

    function init() {
        $('#year').textContent = new Date().getFullYear();
        $('#nav-bot').innerHTML = bot('neutral');
        $('#book-bot').innerHTML = bot('hello');
        $('#lead-age').insertAdjacentHTML('beforeend', C.AGE_GROUPS.map(function (g) {
            return '<option value="' + g.id + '">' + g.min + '–' + g.max + ' years</option>';
        }).join(''));
        renderLesson();
        renderBlocks();

        var saved = C.loadRange();
        if (profile) {
            $('#cabinet-text').textContent = profile.name + '’s cabinet';
            document.querySelectorAll('.block').forEach(function (b) { b.disabled = b.dataset.group !== profile.id; });
            var note = $('#age-note');
            note.hidden = false;
            note.textContent = 'Courses for ' + profile.name + ', ' + C.rangeLabel(profile.min, profile.max).toLowerCase() + ', as set in the cabinet. ';
            var link = document.createElement('a');
            link.href = ROOT + '../kids-ai-cabinet/';
            link.textContent = 'Change age in the cabinet';
            note.appendChild(link);
            pick(profile.id);
        } else {
            pick(saved ? saved.min + '-' + saved.max : null);
        }

        document.addEventListener('click', function (e) {
            var guess = e.target.closest('[data-guess]');
            if (guess) { lesson.guess = guess.dataset.guess; lesson.step = 1; renderLesson(); }
            if (e.target.closest('[data-teach]')) teach();
            if (e.target.closest('[data-restart]')) { lesson = { step: 0, guess: null, shelf: [RED, RED, RED] }; renderLesson(); }

            var block = e.target.closest('.block');
            if (block && !block.disabled) pick(block.dataset.group);

            var lead = e.target.closest('[data-lead]');
            if (lead) {
                var g = C.groupOf(C.findCourse(lead.dataset.lead));
                if (g) $('#lead-age').value = g.id;
            }
        });
        $('#lead-form').addEventListener('submit', function (e) {
            e.preventDefault();
            // Вебхук (Make.com) подключается так же, как на основном сайте: CONFIG.leadWebhook в main.js
            this.reset();
            if (current) $('#lead-age').value = current;
            $('#lead-note').textContent = 'Demo version: the request is not sent anywhere yet.';
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
