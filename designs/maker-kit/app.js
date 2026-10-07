'use strict';

// Maker Kit: кнопки возраста и форма записи берут курсы из catalog.js.
// В выбранном диапазоне — только курсы, чей возраст целиком внутри; в форме возраст сужает список курсов.
(function () {
    var C = BLOOP_CATALOG;
    var ROOT = '../../';
    var COLORS = ['var(--t1)', 'var(--t2)', 'var(--t3)', 'var(--t4)'];
    var BLOOP = { body: '#4361EE', accent: '#FFD23F', screen: '#1D1F4E', glow: '#B8F5E6', joint: '#FF7AA2' };

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var bot = function (state) { return renderBobik(state, BLOOP); };
    var plural = function (n, one) { return n + ' ' + one + (n === 1 ? '' : 's'); };
    var groupIndex = function (g) { return C.AGE_GROUPS.indexOf(g); };

    // Инструменты ИИ по возрасту (исследование, раздел 12)
    var TOOLS = {
        '6-8': 'Only through a grown-up: Teachable Machine, Quick, Draw!',
        '9-11': 'Bloop’s sandbox, Teachable Machine, Scratch',
        '12-14': 'Bloop’s sandbox; real chatbots from 13 with your consent',
        '14-17': 'Real tools in teen modes, with your consent'
    };

    var current = null; // id группы или null — возраст ещё не выбран
    var profile = C.loadProfile(); // ребёнок вошёл в кабинет: { name, id, min, max }

    // ---------- Наборы ----------
    function renderTracks() {
        var html = C.AGE_GROUPS.map(function (g, i) {
            return '<button class="track' + (i === 3 ? ' track--blue' : '') + '" type="button" style="--c:' + COLORS[i] + '" data-group="' + g.id + '" aria-pressed="false">' +
                '<span class="track__age">' + g.min + '–' + g.max + '</span>' +
                '<span class="track__name">' + g.name + '<small>' + plural(C.coursesInRange(g.min, g.max).length, 'kit') + '</small></span></button>';
        }).join('');
        $('#tracks').innerHTML = html;
    }

    // Набор возраста: только курсы, чей возраст целиком внутри группы. «Всех возрастов» нет.
    function pick(groupId) {
        current = groupId || null;
        var range = C.parseRange(current);
        if (range && !profile) C.saveRange(range);
        document.querySelectorAll('.track').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.group === current));
        });
        if (!range) {
            $('#kit-count').textContent = '';
            $('#kit-list').innerHTML = '<p class="empty">Press your child’s age band above. You’ll get only the kits built for that age.</p>';
            return;
        }
        var list = C.coursesInRange(range.min, range.max);
        $('#kit-count').textContent = plural(list.length, 'kit') + ' for ' + C.rangeLabel(range.min, range.max).toLowerCase();
        $('#kit-list').innerHTML = list.map(kit).join('');
    }

    function kit(c, i) {
        var g = C.groupOf(c);
        var href = C.courseHref(c, ROOT);
        var go = href
            ? '<a class="btn btn--yellow" href="' + href + '">Open the first lesson</a>'
            : '<a class="btn btn--white" href="#bench" data-lead="' + c.id + '">Free first lesson</a>';
        return '<article class="kit" style="--i:' + i + ';--c:' + COLORS[groupIndex(g)] + '">' +
            '<div class="kit__lid"><div class="kit__bot" aria-hidden="true">' + bot(c.pose) + '</div>' +
            '<span class="kit__sticker"><span>' + c.ages[0] + '–' + c.ages[1] + '<small>years</small></span></span></div>' +
            '<div class="kit__body"><h3>' + c.title + '</h3><p>' + c.desc + '</p>' +
            '<dl class="kit__spec"><div><dt>Lessons</dt><dd>' + c.lessons + '</dd></div>' +
            '<div><dt>Minutes</dt><dd>' + c.minutes + '</dd></div><div><dt>Level</dt><dd>' + c.level + '</dd></div></dl>' +
            '<div class="kit__go">' + go + '</div></div></article>';
    }

    // ---------- Таблица треков: на компьютере таблица, на телефоне карточки ----------
    function renderSpec() {
        var rows = [
            ['Learns through', function (g) { return g.style; }],
            ['A lesson', function (g) { return g.session; }],
            ['Group', function (g) { return g.group; }],
            ['AI tools', function (g) { return TOOLS[g.id]; }],
            ['By the end', function (g) { return g.goal; }]
        ];
        var cls = function (i) { return 'spec__track' + (i === 3 ? ' spec__track--blue' : ''); };
        var html = '<div class="spec__row" role="row"><span class="spec__cell spec__label" role="columnheader">Track</span>' +
            C.AGE_GROUPS.map(function (g, i) {
                return '<span class="spec__cell ' + cls(i) + '" role="columnheader" style="--c:' + COLORS[i] + '"><b>' + g.min + '–' + g.max + '</b>' + g.name + '</span>';
            }).join('') + '</div>';
        html += rows.map(function (r) {
            return '<div class="spec__row" role="row"><span class="spec__cell spec__label" role="rowheader">' + r[0] + '</span>' +
                C.AGE_GROUPS.map(function (g) { return '<span class="spec__cell" role="cell">' + r[1](g) + '</span>'; }).join('') + '</div>';
        }).join('');
        html += C.AGE_GROUPS.map(function (g, i) {
            return '<article class="spec__card" role="presentation"><div class="' + cls(i) + '" style="--c:' + COLORS[i] + '"><b>' + g.min + '–' + g.max + '</b>' + g.name + '</div><dl>' +
                rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1](g) + '</dd>'; }).join('') + '</dl></article>';
        }).join('');
        $('#spec').innerHTML = html;
    }

    // ---------- Запись ----------
    function fillCourses(groupId, selectedId) {
        var sel = $('#lead-course');
        var r = C.parseRange(groupId);
        if (!r) {
            sel.disabled = true;
            sel.innerHTML = '<option value="">Choose the age first</option>';
            return;
        }
        var list = C.coursesInRange(r.min, r.max);
        sel.disabled = false;
        sel.innerHTML = '<option value="">Not sure yet, help me choose</option>' + list.map(function (c) {
            return '<option value="' + c.id + '"' + (c.id === selectedId ? ' selected' : '') + '>' + c.title + ' (' + C.courseAges(c).toLowerCase() + ')</option>';
        }).join('');
    }

    function prefillLead(courseId) {
        var c = C.findCourse(courseId);
        var g = c && C.groupOf(c);
        if (!g) return;
        $('#lead-age').value = g.id;
        fillCourses(g.id, c.id);
    }

    function init() {
        $('#year').textContent = new Date().getFullYear();
        $('#bar-bot').innerHTML = bot('neutral');
        $('#diagram-bot').innerHTML = bot('point');
        $('#stop-bot').innerHTML = bot('sleep');
        $('#lead-age').insertAdjacentHTML('beforeend', C.AGE_GROUPS.map(function (g) {
            return '<option value="' + g.id + '">' + g.min + '–' + g.max + ' years, ' + g.name + '</option>';
        }).join(''));

        renderTracks();
        renderSpec();
        var saved = C.loadRange();
        var start = profile ? profile.id : (saved ? saved.min + '-' + saved.max : null);
        if (profile) {
            // Ребёнок вошёл в кабинет: доступен только его трек
            document.querySelectorAll('.track').forEach(function (b) { b.disabled = b.dataset.group !== profile.id; });
            var note = $('#age-note');
            note.hidden = false;
            note.textContent = 'Kits for ' + profile.name + ', ' + C.rangeLabel(profile.min, profile.max).toLowerCase() + ', as set in the cabinet. ';
            var link = document.createElement('a');
            link.href = ROOT + '../kids-ai-cabinet/';
            link.textContent = 'Change age in the cabinet';
            note.appendChild(link);
        }
        pick(start);
        if (start) { $('#lead-age').value = start; fillCourses(start); }

        $('#tracks').addEventListener('click', function (e) {
            var b = e.target.closest('.track');
            if (!b || b.disabled) return;
            pick(b.dataset.group);
            if (b.dataset.group) { $('#lead-age').value = b.dataset.group; fillCourses(b.dataset.group); }
        });
        $('#kit-list').addEventListener('click', function (e) {
            var lead = e.target.closest('[data-lead]');
            if (lead) prefillLead(lead.dataset.lead);
        });
        $('#lead-age').addEventListener('change', function () { fillCourses(this.value); });
        $('#lead-form').addEventListener('submit', function (e) {
            e.preventDefault();
            // Вебхук (Make.com) подключается так же, как на основном сайте: CONFIG.leadWebhook в main.js
            this.reset();
            fillCourses('');
            $('#lead-note').textContent = 'Demo version: the request is not sent anywhere yet.';
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
