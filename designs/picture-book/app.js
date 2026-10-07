'use strict';

// Picture Book: ростомер выбирает возраст, полка показывает только подходящие курсы.
// Полоса группы (6–8) → курсы, чей возраст целиком внутри; одна метка (7) → курсы, где есть этот возраст.
(function () {
    var C = BLOOP_CATALOG;
    var ROOT = '../../';
    var GROUP_COLORS = ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)'];
    var BLOOP = { body: '#FF4FA3', accent: '#FFC93C', screen: '#2A4A9E', glow: '#FFF6D6', joint: '#19A56B' };
    var BLOOP_SOFT = { body: '#FFFEFA', accent: '#FFC93C', screen: '#2A4A9E', glow: '#FFF6D6', joint: '#FF4FA3' };
    var SPAN = C.MAX_AGE - C.MIN_AGE + 1;

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var bot = function (state, pal) { return renderBobik(state, pal || BLOOP); };
    var plural = function (n, one) { return n + ' ' + one + (n === 1 ? '' : 's'); };

    var choice = null; // { min, max, kind: 'group' | 'age' }
    var profile = C.loadProfile(); // ребёнок вошёл в кабинет: { name, min, max }

    function groupIndex(course) {
        var g = C.groupOf(course);
        return Math.max(0, C.AGE_GROUPS.indexOf(g));
    }

    // ---------- Ростомер ----------
    function renderChart() {
        var html = '';
        C.AGE_GROUPS.forEach(function (g, i) {
            // компьютер: колонки по возрасту, ступеньки вверх; телефон: строки по возрасту (17 сверху), дорожки слева направо
            var style = [
                '--c1:' + (g.min - C.MIN_AGE + 1), '--c2:' + (g.max - C.MIN_AGE + 2),
                '--row:' + (C.AGE_GROUPS.length - i),
                '--lane:' + (i + 2),
                '--r1:' + (C.MAX_AGE - g.max + 1), '--r2:' + (C.MAX_AGE - g.min + 2),
                '--g:' + GROUP_COLORS[i]
            ].join(';');
            html += '<button class="band" type="button" style="' + style + '" data-group="' + g.id + '" aria-pressed="false">' +
                '<span class="band__bot" aria-hidden="true"></span>' +
                '<span>' + g.min + '–' + g.max + ' ' + g.name + '</span></button>';
        });
        html += '<span class="tape" aria-hidden="true"></span>';
        for (var age = C.MIN_AGE; age <= C.MAX_AGE; age++) {
            html += '<button class="tick" type="button" style="--col:' + (age - C.MIN_AGE + 1) + ';--trow:' + (C.MAX_AGE - age + 1) + '" ' +
                'data-age="' + age + '" aria-pressed="false" aria-label="Age ' + age + '"><span>' + age + '</span></button>';
        }
        $('#growth-chart').innerHTML = html;
    }

    function select(next) {
        choice = next;
        if (next && next.kind === 'group' && !profile) C.saveRange(next);
        document.querySelectorAll('.band').forEach(function (b) {
            var g = C.AGE_GROUPS.filter(function (x) { return x.id === b.dataset.group; })[0];
            var on = !!(choice && choice.kind === 'group' && g.min === choice.min && g.max === choice.max);
            b.classList.toggle('is-on', on);
            b.setAttribute('aria-pressed', String(on));
            $('.band__bot', b).innerHTML = on ? bot('hello', BLOOP_SOFT) : '';
        });
        document.querySelectorAll('.tick').forEach(function (t) {
            var age = Number(t.dataset.age);
            var on = !!(choice && choice.kind === 'age' && choice.min === age);
            t.classList.toggle('is-on', on);
            t.classList.toggle('in-range', !!(choice && choice.kind === 'group' && age >= choice.min && age <= choice.max));
            t.setAttribute('aria-pressed', String(on));
        });
        renderShelf();
    }

    // ---------- Полка ----------
    function renderShelf() {
        var list, intro;
        if (!choice) {
            // «Все возрасты» не показываем: без возраста полка пустая и просит выбрать его
            $('#shelf-intro').innerHTML = '<div><h3>The shelf is waiting</h3></div>' +
                '<p>Pick your child’s age on the chart above. Every course is planned for one age band, so you’ll only see the ones that fit.</p>';
            $('#books').innerHTML = '';
            return;
        } else if (choice.kind === 'group') {
            var g = C.AGE_GROUPS.filter(function (x) { return x.min === choice.min && x.max === choice.max; })[0];
            list = C.coursesInRange(choice.min, choice.max);
            intro = '<div><h3>' + C.rangeLabel(g.min, g.max) + ': ' + g.name + '</h3>' +
                '<ul class="shelf__facts"><li>' + g.session + ' a lesson</li><li>' + g.group + '</li></ul></div>' +
                '<p>' + g.style + ' By the end your child ' + g.goal.charAt(0).toLowerCase() + g.goal.slice(1) + '</p>';
        } else {
            list = C.coursesForAge(choice.min);
            intro = '<div><h3>For a ' + choice.min + '-year-old</h3></div>' +
                '<p>' + plural(list.length, 'course') + ' made for age ' + choice.min + '. Each one is planned for a narrow age band, so the tasks are not too easy and not too hard.</p>';
        }
        $('#shelf-intro').innerHTML = intro;
        $('#books').innerHTML = list.length
            ? list.map(book).join('')
            : '<p class="empty">No course for this age yet. Book a free lesson and we’ll suggest the closest one.</p>';
    }

    function book(c, i) {
        var href = C.courseHref(c, ROOT);
        var go = href
            ? '<a class="btn btn--ink" href="' + href + '">Open the first lesson</a>'
            : '<button class="btn btn--line" type="button" data-lead="' + c.id + '">Book a free first lesson</button>';
        return '<article class="book" style="--i:' + i + ';--g:' + GROUP_COLORS[groupIndex(c)] + '">' +
            '<div class="book__cover"><span class="book__age">' + C.courseAges(c) + '</span>' +
            '<div class="book__bot" aria-hidden="true">' + bot(c.pose) + '</div></div>' +
            '<div class="book__body"><h4>' + c.title + '</h4><p>' + c.desc + '</p>' +
            '<ul class="book__facts"><li>' + plural(c.lessons, 'lesson') + '</li><li>' + c.minutes + ' min each</li><li>' + c.level + '</li></ul>' +
            '<div class="book__go">' + go + '</div></div></article>';
    }

    // ---------- Заявка ----------
    function openLead(courseId) {
        var form = $('#lead-form');
        var c = courseId && C.findCourse(courseId);
        form.dataset.course = c ? c.id : '';
        $('#lead-course').textContent = c ? c.title + ', ' + C.courseAges(c).toLowerCase() : '';
        var g = c ? C.groupOf(c) : (choice && choice.kind === 'group' ? C.groupOf({ ages: [choice.min, choice.max] }) : null);
        if (g) form.elements.age.value = g.id;
        $('#lead-note').textContent = '';
        $('#lead').showModal();
    }

    function sendLead(form) {
        // Вебхук (Make.com) подключается так же, как на основном сайте: CONFIG.leadWebhook в main.js
        form.reset();
        $('#lead-note').textContent = 'Demo version: the request is not sent anywhere yet.';
    }

    function init() {
        $('#year').textContent = new Date().getFullYear();
        $('#brand-bot').innerHTML = bot('neutral');
        $('#cover-bot').innerHTML = bot('hello');
        $('#rest-bot').innerHTML = bot('sleep');
        $('#last-bot').innerHTML = bot('victory');
        $('#lead-form').elements.age.insertAdjacentHTML('beforeend', C.AGE_GROUPS.map(function (g) {
            return '<option value="' + g.id + '">' + g.min + '–' + g.max + ' years</option>';
        }).join(''));

        renderChart();
        if (profile) {
            // Ребёнок вошёл в кабинет: ростомер показывает только его группу, выбрать другую нельзя
            document.querySelectorAll('.band, .tick').forEach(function (b) { b.disabled = true; });
            var note = $('#chart-note');
            note.hidden = false;
            note.textContent = 'Showing courses for ' + profile.name + ', ' + C.rangeLabel(profile.min, profile.max).toLowerCase() + ', as set in the cabinet. ';
            var link = document.createElement('a');
            link.href = ROOT + '../kids-ai-cabinet/';
            link.textContent = 'Change age in the cabinet';
            note.appendChild(link);
            select({ min: profile.min, max: profile.max, kind: 'group' });
        } else {
            var saved = C.loadRange();
            select(saved ? { min: saved.min, max: saved.max, kind: 'group' } : null);
        }

        $('#growth-chart').addEventListener('click', function (e) {
            var band = e.target.closest('.band');
            var tick = e.target.closest('.tick');
            if (band) {
                var r = C.parseRange(band.dataset.group);
                select({ min: r.min, max: r.max, kind: 'group' });
            } else if (tick) {
                var age = Number(tick.dataset.age);
                select({ min: age, max: age, kind: 'age' });
            }
        });
        document.addEventListener('click', function (e) {
            var lead = e.target.closest('[data-lead]');
            if (lead) openLead(lead.dataset.lead);
            if (e.target.closest('[data-close]')) e.target.closest('dialog').close();
        });
        $('#lead').addEventListener('click', function (e) { if (e.target === this) this.close(); });
        $('#lead-form').addEventListener('submit', function (e) { e.preventDefault(); sendLead(this); });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
