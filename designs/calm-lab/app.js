'use strict';

// Calm Lab: фраза «My child is [возраст] and loves [интерес]» подбирает курсы из catalog.js.
// Возраст — диапазон группы: видны только курсы, чей возраст целиком внутри. Интерес сужает список дальше.
(function () {
    var C = BLOOP_CATALOG;
    var ROOT = '../../';
    var COLORS = ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)'];
    var BLOOP = { body: '#7CC8B4', accent: '#FFDCC7', screen: '#15231F', glow: '#E2F8F0', joint: '#B3A8F2' };
    var ARROW = '<span class="pill__icon" aria-hidden="true"><i class="ph-bold ph-arrow-up-right"></i></span>';
    var profile = C.loadProfile(); // ребёнок вошёл в кабинет: { name, id, min, max }

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var bot = function (state) { return renderBobik(state, BLOOP); };
    var plural = function (n, one) { return n + ' ' + one + (n === 1 ? '' : 's'); };
    var colorOf = function (g) { return COLORS[Math.max(0, C.AGE_GROUPS.indexOf(g))]; };

    function update() {
        var groupId = $('#f-age').value;
        var interest = $('#f-interest').value;
        var range = C.parseRange(groupId);
        var g = range && C.AGE_GROUPS.filter(function (x) { return x.id === groupId; })[0];
        if (range && !profile) C.saveRange(range);

        // «Всех возрастов» нет: пока возраст не выбран, курсов не показываем
        if (!range) {
            $('#finder-group').innerHTML = '';
            $('#results-count').textContent = '';
            $('#results').innerHTML = '<div class="empty"><p>Pick your child’s age in the sentence above. You’ll see only the courses made for that age.</p></div>';
            return;
        }

        var byAge = C.coursesInRange(range.min, range.max);
        var list = C.coursesForInterest(interest, byAge);

        $('#f-age').style.setProperty('--pick', g ? colorOf(g) : 'var(--mint)');
        $('#finder-group').innerHTML = g
            ? '<div><b>' + g.name + '</b>' + g.style + '</div><div><b>A lesson</b>' + g.session + ', ' + g.group.charAt(0).toLowerCase() + g.group.slice(1) + '</div><div><b>By the end</b>' + g.goal + '</div>'
            : '';

        var where = ' for ' + C.rangeLabel(range.min, range.max).toLowerCase();
        var why = interest ? ' who love ' + C.INTERESTS[interest].label.toLowerCase() : '';
        $('#results-count').textContent = list.length ? plural(list.length, 'course') + where + why : '';
        $('#results').innerHTML = list.length
            ? list.map(card).join('')
            : '<div class="empty"><p>No course' + where + ' matches this interest yet. ' + plural(byAge.length, 'other course') + ' fit the age.</p>' +
              '<button class="pill pill--light" type="button" id="any-interest"><span>Show every interest</span>' + ARROW + '</button></div>';
    }

    function card(c, i) {
        var g = C.groupOf(c);
        var href = C.courseHref(c, ROOT);
        var go = href
            ? '<a class="pill pill--dark" href="' + href + '"><span>Open the first lesson</span>' + ARROW + '</a>'
            : '<button class="pill pill--light" type="button" data-lead="' + c.id + '"><span>Book a free lesson</span>' + ARROW + '</button>';
        return '<article class="bezel course" style="--i:' + i + ';--g:' + colorOf(g) + '"><div class="bezel__core">' +
            '<div class="course__top"><span class="course__age">' + C.courseAges(c) + '</span>' +
            '<span class="course__bot" aria-hidden="true">' + bot(c.pose) + '</span></div>' +
            '<h3>' + c.title + '</h3><p>' + c.desc + '</p>' +
            '<ul class="course__meta"><li>' + plural(c.lessons, 'lesson') + '</li><li>' + c.minutes + ' min</li><li>' + c.level + '</li></ul>' +
            '<div class="course__go">' + go + '</div></div></article>';
    }

    function renderTimeline() {
        $('#timeline').innerHTML = C.AGE_GROUPS.map(function (g) {
            var n = C.coursesInRange(g.min, g.max).length;
            return '<li class="stop" style="--g:' + colorOf(g) + '">' +
                '<p class="stop__age">' + g.min + '–' + g.max + '</p><p class="stop__name">' + g.name + '</p>' +
                '<p>' + g.goal + '</p>' +
                '<ul class="stop__facts"><li>' + g.style + '</li><li>' + g.session + '</li><li>' + g.group + '</li></ul>' +
                // вошедшему ребёнку — кнопка только у его возраста
                (profile && profile.id !== g.id ? '' :
                '<button class="pill pill--light pill--sm stop__link" type="button" data-pick="' + g.id + '"><span>See ' + plural(n, 'course') + '</span>' + ARROW + '</button>') + '</li>';
        }).join('');
    }

    // ---------- Заявка ----------
    function openLead(courseId) {
        var form = $('#lead-form');
        var c = courseId && C.findCourse(courseId);
        $('#lead-course').textContent = c ? c.title + ', ' + C.courseAges(c).toLowerCase() : '';
        form.dataset.course = c ? c.id : '';
        var g = c ? C.groupOf(c) : null;
        form.elements.age.value = g ? g.id : ($('#f-age').value || '');
        $('#lead-note').textContent = '';
        $('#lead').showModal();
    }

    function setMenu(open) {
        $('#island').classList.toggle('is-open', open);
        $('#burger').setAttribute('aria-expanded', String(open));
        $('#burger').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    function init() {
        $('#year').textContent = new Date().getFullYear();
        $('#island-bot').innerHTML = bot('neutral');
        $('#tile-bot').innerHTML = bot('sleep');
        $('#cta-bot').innerHTML = bot('hello');

        var ageOptions = C.AGE_GROUPS.map(function (g) {
            return '<option value="' + g.id + '">' + g.min + ' to ' + g.max + '</option>';
        }).join('');
        $('#f-age').insertAdjacentHTML('beforeend', ageOptions);
        $('#lead-form').elements.age.insertAdjacentHTML('beforeend', C.AGE_GROUPS.map(function (g) {
            return '<option value="' + g.id + '">' + g.min + '–' + g.max + ' years</option>';
        }).join(''));
        $('#f-interest').insertAdjacentHTML('beforeend', Object.keys(C.INTERESTS).map(function (k) {
            return '<option value="' + k + '">' + C.INTERESTS[k].label.toLowerCase() + '</option>';
        }).join(''));

        var saved = C.loadRange();
        if (profile) {
            // Ребёнок вошёл в кабинет: возраст из кабинета, в фразе его не поменять
            $('#f-age').value = profile.id;
            $('#f-age').disabled = true;
            var note = $('#finder-note');
            note.hidden = false;
            note.textContent = 'Age from ' + profile.name + '’s cabinet. ';
            var link = document.createElement('a');
            link.href = ROOT + '../kids-ai-cabinet/';
            link.textContent = 'Change it in the cabinet';
            note.appendChild(link);
        } else if (saved) {
            $('#f-age').value = saved.min + '-' + saved.max;
        }
        renderTimeline();
        update();

        $('#f-age').addEventListener('change', update);
        $('#f-interest').addEventListener('change', update);
        document.addEventListener('click', function (e) {
            if (e.target.closest('#any-interest')) { $('#f-interest').value = ''; update(); }
            var pick = e.target.closest('[data-pick]');
            if (pick) {
                $('#f-age').value = pick.dataset.pick;
                $('#f-interest').value = '';
                update();
                $('#finder').scrollIntoView({ block: 'start' });
            }
            var lead = e.target.closest('[data-lead]');
            if (lead) openLead(lead.dataset.lead);
            if (e.target.closest('[data-close]')) e.target.closest('dialog').close();
            if (e.target.closest('#burger')) setMenu(!$('#island').classList.contains('is-open'));
            else if (e.target.closest('.island__nav a')) setMenu(false);
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
        $('#lead').addEventListener('click', function (e) { if (e.target === this) this.close(); });
        $('#lead-form').addEventListener('submit', function (e) {
            e.preventDefault();
            // Вебхук (Make.com) подключается так же, как на основном сайте: CONFIG.leadWebhook в main.js
            this.reset();
            $('#lead-note').textContent = 'Demo version: the request is not sent anywhere yet.';
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
