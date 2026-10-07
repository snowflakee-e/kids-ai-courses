'use strict';

// Настройки сайта
const CONFIG = {
    // Webhook для заявок на бесплатный урок (например, Make.com Custom Webhook).
    // Пока пусто — заявки не отправляются, форма работает в демо-режиме.
    leadWebhook: '',

    // Личный кабинет — отдельный репозиторий kids-ai-cabinet.
    // На GitHub Pages оба сайта живут на одном домене, поэтому относительный путь
    // и общее хранилище браузера работают и там, и при локальном запуске из папки Code.
    cabinetUrl: '../kids-ai-cabinet/',
    cabinetKey: 'bloop-cabinet-v1'
};

// Курсы, возрастные группы и фильтр по возрасту — в catalog.js (общий с вариантами дизайна в designs/)
const CATALOG = BLOOP_CATALOG;
const COURSES = CATALOG.COURSES;

// Шапка для каждой страницы: тексты и поза Бобика
const ROUTES = {
    home: {
        kicker: 'AI school for kids and teens aged 6–17',
        title: 'Bloop <span>AI School</span>',
        lead: 'We learn to be friends with AI: drawing pictures, writing fairy tales and building our own robot helpers together with Bobik.',
        pose: 'hello', bubble: "Hi! I'm Bobik 👋"
    },
    courses: {
        kicker: 'Catalog',
        title: 'Our courses',
        lead: 'Pick by age: from first games with AI to your own projects.',
        pose: 'point', bubble: 'Pick any one!'
    },
    method: {
        kicker: 'Our method',
        title: 'How we learn',
        lead: 'Short quest lessons, lots of practice and a reward for every step.',
        pose: 'idea', bubble: 'I have an idea! 💡'
    },
    parents: {
        kicker: 'For parents',
        title: 'For parents',
        lead: 'Lesson formats, safety and answers to common questions.',
        pose: 'wink', bubble: "I'll tell you everything 😉"
    }
};

const HAPPY_STATES = ['joy', 'surprise', 'delight', 'wink', 'victory'];
const OLD_USER_KEY = 'bloop-user'; // ключ старого демо-кабинета на сайте

// plural(3, 'star') → 'stars'
const plural = (n, one, many = one + 's') => (n === 1 ? one : many);

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const app = {
    user: null,
    palette: 'mint',
    route: 'home',
    pose: 'hello',

    init() {
        this.user = this.loadUser();
        if (this.user && PALETTES[this.user.palette]) this.palette = this.user.palette;

        $('#year').textContent = new Date().getFullYear();
        $('#course-count').textContent = COURSES.length;
        this.renderAgeControls();
        const saved = CATALOG.loadRange();
        this.filterCourses(saved && this.groupId(saved) ? this.groupId(saved) : 'all');
        this.bindEvents();
        this.updateAuthButton();
        this.drawStaticBobiks();
        this.renderWelcomeBack();
        this.onRoute();
    },

    // ---------- Общее с кабинетом хранилище ----------
    // Сайт только читает прогресс и создаёт профиль при входе; XP, звёзды и награды считает кабинет.
    loadUser() {
        try {
            const saved = JSON.parse(localStorage.getItem(CONFIG.cabinetKey));
            if (saved) return saved;

            // Перенос имени из старого демо-кабинета сайта
            const old = JSON.parse(localStorage.getItem(OLD_USER_KEY));
            localStorage.removeItem(OLD_USER_KEY);
            if (old && old.name) {
                const migrated = { version: 1, name: old.name, age: old.age, palette: old.palette || 'mint' };
                localStorage.setItem(CONFIG.cabinetKey, JSON.stringify(migrated));
                return migrated;
            }
        } catch (e) { /* хранилище недоступно — работаем как гость */ }
        return null;
    },

    cabinetLink(courseId) {
        return CONFIG.cabinetUrl + (courseId ? '?start=' + encodeURIComponent(courseId) : '');
    },

    // Сводка прогресса для главной: считается из данных кабинета
    progressSummary(u) {
        const lessons = Object.values(u.lessons || {});
        const today = new Date();
        const key = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        const streakAlive = u.lastActive === key(today) || u.lastActive === key(yesterday);
        return {
            xp: u.xp || 0,
            stars: lessons.reduce((sum, l) => sum + (l.stars || 0), 0),
            lessons: lessons.filter(l => l.stars > 0).length,
            badges: Object.keys(u.achievements || {}).length,
            streak: streakAlive ? (u.streak || 0) : 0
        };
    },

    renderWelcomeBack() {
        const box = $('#welcome-back');
        if (!this.user) { box.hidden = true; return; }
        const s = this.progressSummary(this.user);
        box.hidden = false;
        $('#welcome-title').textContent = `Welcome back, ${this.user.name}!`;
        $('#welcome-bobik').innerHTML = this.bobik(s.lessons ? 'joy' : 'hello');
        $('#welcome-cta').textContent = s.lessons ? 'Continue learning →' : 'Start learning →';
        $('#welcome-stats').innerHTML = s.lessons
            ? [
                ['💎', s.xp, 'XP'],
                ['⭐', s.stars, plural(s.stars, 'star')],
                ['📚', s.lessons, plural(s.lessons, 'lesson') + ' passed'],
                ['🔥', s.streak, plural(s.streak, 'day') + ' streak'],
                ['🏆', s.badges, plural(s.badges, 'badge')]
            ].map(([icon, value, label]) => `<li><span aria-hidden="true">${icon}</span> <b>${value}</b> ${label}</li>`).join('')
            : '<li>Your first lesson is waiting. Let’s earn some stars! ⭐</li>';
    },

    // ---------- Бобик ----------
    bobik(state, palette) {
        return renderBobik(state, PALETTES[palette || this.palette]);
    },

    setHeroBobik(state) {
        const el = $('#hero-bobik');
        el.style.opacity = '0';
        setTimeout(() => {
            el.innerHTML = this.bobik(state);
            el.style.opacity = '1';
        }, 150);
    },

    drawStaticBobiks() {
        $('#logo-bobik').innerHTML = this.bobik('neutral');
        $('#cta-bobik').innerHTML = this.bobik('victory');
        $('#login-bobik').innerHTML = this.bobik('hello');
        $('#lead-bobik').innerHTML = this.bobik('delight');
    },

    // ---------- Навигация ----------
    onRoute() {
        const name = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];

        // Старые ссылки на кабинет внутри сайта ведут в настоящий кабинет
        if (name === 'cabinet') {
            history.replaceState(null, '', '#/');
            if (this.user) { location.href = this.cabinetLink(); return; }
            this.openModal('login');
        }

        const route = ROUTES[name] ? name : 'home';
        const changed = route !== this.route;
        this.route = route;

        $$('.page').forEach(p => { p.hidden = p.dataset.page !== route; });
        $$('.nav__menu a').forEach(a => {
            if (a.dataset.route === route) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });

        this.renderHero(route);
        this.closeMenu();

        if (changed) window.scrollTo(0, 0);
    },

    renderHero(route) {
        const r = ROUTES[route];
        const sky = $('#sky');
        sky.classList.toggle('sky--compact', route !== 'home');

        $('#hero-kicker').textContent = r.kicker;
        $('#hero-lead').textContent = r.lead;

        $('#hero-title').innerHTML = r.title;

        const bubble = $('#bubble');
        bubble.textContent = r.bubble;
        bubble.style.animation = 'none';
        void bubble.offsetWidth;
        bubble.style.animation = '';

        this.pose = r.pose;
        this.setHeroBobik(r.pose);
    },

    toggleMenu(force) {
        const menu = $('#nav-menu');
        const open = typeof force === 'boolean' ? force : !menu.classList.contains('is-open');
        menu.classList.toggle('is-open', open);
        $('#burger').setAttribute('aria-expanded', String(open));
        $('#burger').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    },

    closeMenu() { this.toggleMenu(false); },

    // ---------- Курсы ----------
    courseCard(c) {
        const href = CATALOG.courseHref(c, '');
        return `
            <article class="course">
                <div class="course__thumb" style="--thumb:${c.thumb}">
                    <span class="course__age">${CATALOG.courseAges(c)}</span>
                    <div class="course__bot">${this.bobik(c.pose, c.palette)}</div>
                </div>
                <div class="course__body">
                    <h3>${c.title}</h3>
                    <p>${c.desc}</p>
                    <ul class="tags">
                        <li>📚 ${c.lessons} ${plural(c.lessons, 'lesson')}</li>
                        <li>⏱ ${c.minutes} min</li>
                        <li>${c.level}</li>
                    </ul>
                    <div class="course__foot">
                        ${href
                            ? `<span class="course__free">Try it right now</span>
                               <a class="btn" href="${href}">Play now ▶</a>`
                            : `<span class="course__free">First lesson free</span>
                               <button class="btn" type="button" data-open="lead" data-course="${c.id}">Start</button>`}
                    </div>
                </div>
            </article>`;
    },

    renderCourseList(el, list) {
        el.innerHTML = list.map(c => this.courseCard(c)).join('');
    },

    // id группы, если диапазон совпадает с одной из групп ('6-8'), иначе null
    groupId(range) {
        const g = CATALOG.AGE_GROUPS.find(g => g.min === range.min && g.max === range.max);
        return g ? g.id : null;
    },

    // Кнопки фильтра и списки возрастов в формах — из одних и тех же групп каталога
    renderAgeControls() {
        $('#age-filter').insertAdjacentHTML('beforeend', CATALOG.AGE_GROUPS.map(g =>
            `<button class="chip" type="button" data-age="${g.id}">${CATALOG.rangeLabel(g.min, g.max)}</button>`).join(''));
        $$('select[name="age"]').forEach(sel => {
            sel.insertAdjacentHTML('beforeend', CATALOG.AGE_GROUPS.map(g =>
                `<option value="${g.id}">${g.min}–${g.max} years</option>`).join(''));
        });
    },

    // Выбор возраста: на странице курсов остаются только курсы, чей возраст целиком внутри диапазона.
    // Выбор запоминается, и главная показывает курсы этого возраста.
    filterCourses(age) {
        const range = CATALOG.parseRange(age);
        const list = range ? CATALOG.coursesInRange(range.min, range.max) : COURSES;
        CATALOG.saveRange(range);

        this.renderCourseList($('#all-courses'), list);
        $('#results-count').textContent = range
            ? `${list.length} ${plural(list.length, 'course')} for ${CATALOG.rangeLabel(range.min, range.max).toLowerCase()}`
            : `${list.length} ${plural(list.length, 'course')} for all ages`;
        $$('#age-filter .chip').forEach(ch => {
            const active = ch.dataset.age === age;
            ch.classList.toggle('is-active', active);
            ch.setAttribute('aria-pressed', String(active));
        });
        this.renderHomeCourses(range);
    },

    renderHomeCourses(range) {
        const list = range ? CATALOG.coursesInRange(range.min, range.max) : COURSES.filter(c => c.popular);
        this.renderCourseList($('#home-courses'), list.slice(0, 3));
        $('#home-courses-title').textContent = range
            ? `Courses for ${CATALOG.rangeLabel(range.min, range.max).toLowerCase()}`
            : 'Popular courses';
    },

    // ---------- Авторизация ----------
    updateAuthButton() {
        const btn = $('#auth-btn');
        if (this.user) {
            $('.auth-text', btn).textContent = this.user.name;
            $('.btn__icon', btn).textContent = '🙂';
            btn.setAttribute('aria-label', 'My cabinet: ' + this.user.name);
        } else {
            $('.auth-text', btn).textContent = 'My cabinet';
            $('.btn__icon', btn).textContent = '🔑';
            btn.setAttribute('aria-label', 'Log in to my cabinet');
        }
    },

    // Создаёт профиль в общем хранилище и открывает кабинет (выход — в самом кабинете)
    login(form) {
        const data = new FormData(form);
        const name = String(data.get('name')).trim();
        if (!name) return;
        this.user = { version: 1, name, age: data.get('age'), palette: this.palette };
        try {
            localStorage.setItem(CONFIG.cabinetKey, JSON.stringify(this.user));
        } catch (e) { /* без хранилища кабинет спросит имя ещё раз */ }
        location.href = this.cabinetLink(form.dataset.course);
    },

    // ---------- Заявка ----------
    async sendLead(form) {
        const note = $('#lead-note');
        const data = Object.fromEntries(new FormData(form));
        data.course = form.dataset.course || '';
        data.page = location.href;

        if (!CONFIG.leadWebhook) {
            note.textContent = 'Demo mode: sign-ups are not sent yet.';
            return;
        }

        note.textContent = 'Sending…';
        try {
            const res = await fetch(CONFIG.leadWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(res.status);
            form.reset();
            note.textContent = "Thank you! We'll get in touch soon 💛";
        } catch (e) {
            note.textContent = "Couldn't send. Please try again.";
        }
    },

    // ---------- Модалки ----------
    openModal(name, course) {
        const dlg = $(`#${name}-modal`);
        if (name === 'lead') {
            $('#lead-form').dataset.course = course || '';
            $('#lead-note').textContent = '';
            // Заявка с карточки курса: возраст ребёнка — группа этого курса
            const c = course && CATALOG.findCourse(course);
            const group = c && CATALOG.groupOf(c);
            if (group) $('#lead-form').elements.age.value = group.id;
        }
        if (!dlg.open) dlg.showModal();
    },

    closeModal(name) {
        const dlg = $(`#${name}-modal`);
        if (dlg.open) dlg.close();
    },

    // ---------- События ----------
    bindEvents() {
        window.addEventListener('hashchange', () => this.onRoute());

        $('#burger').addEventListener('click', () => this.toggleMenu());
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeMenu(); });
        document.addEventListener('click', e => {
            if (!e.target.closest('#nav')) this.closeMenu();
        });

        // Вошёл — сразу в кабинет, гость — сначала знакомство
        $('#auth-btn').addEventListener('click', () => {
            if (this.user) location.href = this.cabinetLink();
            else this.openModal('login');
        });
        $$('[data-cabinet-link]').forEach(a => {
            a.href = this.cabinetLink();
            a.addEventListener('click', e => {
                if (this.user) return;
                e.preventDefault();
                this.openModal('login');
            });
        });

        $('#age-filter').addEventListener('click', e => {
            const chip = e.target.closest('.chip');
            if (chip) this.filterCourses(chip.dataset.age);
        });

        // Кнопки, открывающие модалки
        document.addEventListener('click', e => {
            const opener = e.target.closest('[data-open]');
            if (opener) this.openModal(opener.dataset.open, opener.dataset.course);

            if (e.target.closest('[data-close]')) e.target.closest('dialog').close();
        });

        // Вернулись на сайт из кабинета кнопкой «назад» — обновляем прогресс
        window.addEventListener('pageshow', e => {
            if (!e.persisted) return;
            this.user = this.loadUser();
            this.updateAuthButton();
            this.renderWelcomeBack();
        });

        // Закрытие модалки по клику на фон
        $$('dialog').forEach(dlg => {
            dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
        });

        $('#login-form').addEventListener('submit', e => { e.preventDefault(); this.login(e.target); });
        $('#lead-form').addEventListener('submit', e => { e.preventDefault(); this.sendLead(e.target); });

        // Бобик реагирует на клик
        $('#hero-bobik').addEventListener('click', () => {
            const s = HAPPY_STATES[Math.floor(Math.random() * HAPPY_STATES.length)];
            this.setHeroBobik(s);
            clearTimeout(this.petTimer);
            this.petTimer = setTimeout(() => this.setHeroBobik(this.pose), 1400);
        });

        // Бобик показывает на главную кнопку
        $$('[data-point]').forEach(btn => {
            btn.addEventListener('mouseenter', () => this.setHeroBobik('point'));
            btn.addEventListener('mouseleave', () => this.setHeroBobik(this.pose));
        });

        // Липкое меню при прокрутке
        const nav = $('#nav');
        const slot = $('.nav-slot');
        const io = new IntersectionObserver(([entry]) => {
            nav.classList.toggle('is-stuck', !entry.isIntersecting);
        }, { threshold: 0 });
        io.observe(slot);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
