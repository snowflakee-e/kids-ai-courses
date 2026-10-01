'use strict';

// Настройки сайта
const CONFIG = {
    // Webhook для заявок на бесплатный урок (например, Make.com Custom Webhook).
    // Пока пусто — заявки не отправляются, форма работает в демо-режиме.
    leadWebhook: ''
};

const COURSES = [
    { id: 'hello-ai', title: 'Hello, AI!', age: '6-8', lessons: 8, minutes: 30, level: 'Starter',
      desc: 'Meet artificial intelligence through games and fun experiments.',
      palette: 'mint', pose: 'hello', thumb: '#DDF6EF' },
    { id: 'ai-tales', title: 'Fairy Tales with AI', age: '6-8', lessons: 6, minutes: 30, level: 'Starter',
      desc: 'Invent heroes and write magical stories together with AI.',
      palette: 'peach', pose: 'delight', thumb: '#FFEADF' },
    { id: 'prompts', title: 'Magic Prompts', age: '9-11', lessons: 10, minutes: 45, level: 'Beginner',
      desc: 'Learn to talk to AI so it understands you right away.',
      palette: 'sky', pose: 'idea', thumb: '#E1F0FF' },
    { id: 'ai-art', title: 'AI Artist', age: '9-11', lessons: 8, minutes: 45, level: 'Beginner',
      desc: 'Create pictures, comics and greeting cards with AI tools.',
      palette: 'lav', pose: 'wink', thumb: '#EEE9FF' },
    { id: 'my-bot', title: 'Build Your Robot Helper', age: '12-14', lessons: 12, minutes: 60, level: 'Intermediate',
      desc: 'Build your own chatbot and teach it to help with everyday tasks.',
      palette: 'sky', pose: 'victory', thumb: '#FFF1C9' },
    { id: 'ai-games', title: 'Games and AI', age: '12-14', lessons: 10, minutes: 60, level: 'Intermediate',
      desc: 'Make a simple game where the characters think with artificial intelligence.',
      palette: 'mint', pose: 'run', thumb: '#FFE0EA' }
];

const AGE_LABEL = { '6-8': 'Ages 6–8', '9-11': 'Ages 9–11', '12-14': 'Ages 12–14' };

// Шапка для каждой страницы: тексты и поза Бобика
const ROUTES = {
    home: {
        kicker: 'AI school for kids aged 6–14',
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
    },
    cabinet: {
        kicker: 'My cabinet',
        title: 'Hi!',
        lead: 'Here are your courses, stars and badges.',
        pose: 'joy', bubble: "Yay, you're here! 🎉"
    }
};

const BADGES = [
    { icon: '👋', title: 'First lesson' },
    { icon: '⭐', title: '10 stars' },
    { icon: '🔥', title: '3-day streak' },
    { icon: '🎨', title: 'First picture' },
    { icon: '🤖', title: 'Own bot' },
    { icon: '🏆', title: 'Course complete' }
];

const HAPPY_STATES = ['joy', 'surprise', 'delight', 'wink', 'victory'];
const STORAGE_KEY = 'bloop-user';

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
        this.renderCourseList($('#home-courses'), COURSES.slice(0, 3));
        this.filterCourses('all');
        this.bindEvents();
        this.updateAuthButton();
        this.drawStaticBobiks();
        this.onRoute();
    },

    // ---------- Хранилище ----------
    loadUser() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (e) {
            return null;
        }
    },

    saveUser() {
        try {
            if (this.user) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
            else localStorage.removeItem(STORAGE_KEY);
        } catch (e) { /* хранилище недоступно — работаем без него */ }
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
        let route = ROUTES[name] ? name : 'home';

        if (route === 'cabinet' && !this.user) {
            route = this.route === 'cabinet' ? 'home' : this.route;
            history.replaceState(null, '', route === 'home' ? '#/' : '#/' + route);
            this.openModal('login');
        }

        const changed = route !== this.route;
        this.route = route;

        $$('.page').forEach(p => { p.hidden = p.dataset.page !== route; });
        $$('.nav__menu a').forEach(a => {
            if (a.dataset.route === route) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });

        if (route === 'cabinet') this.renderCabinet();
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

        const title = $('#hero-title');
        if (route === 'cabinet' && this.user) {
            title.textContent = `Hi, ${this.user.name}!`;
        } else {
            title.innerHTML = r.title;
        }

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
        return `
            <article class="course">
                <div class="course__thumb" style="--thumb:${c.thumb}">
                    <span class="course__age">${AGE_LABEL[c.age]}</span>
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
                        <span class="course__free">First lesson free</span>
                        <button class="btn" type="button" data-open="lead" data-course="${c.id}">Start</button>
                    </div>
                </div>
            </article>`;
    },

    renderCourseList(el, list) {
        el.innerHTML = list.map(c => this.courseCard(c)).join('');
    },

    filterCourses(age) {
        const list = age === 'all' ? COURSES : COURSES.filter(c => c.age === age);
        this.renderCourseList($('#all-courses'), list);
        $('#results-count').textContent = `${list.length} ${plural(list.length, 'course')} found`;
        $$('#age-filter .chip').forEach(ch => {
            const active = ch.dataset.age === age;
            ch.classList.toggle('is-active', active);
            ch.setAttribute('aria-pressed', String(active));
        });
    },

    // ---------- Кабинет ----------
    newUser(name, age) {
        // Демо-прогресс, пока нет бэкенда
        const mine = COURSES.filter(c => c.age === age);
        const progress = {};
        mine.forEach((c, i) => { progress[c.id] = i === 0 ? 60 : 0; });
        return { name, age, palette: this.palette, stars: 12, streak: 3, progress };
    },

    renderCabinet() {
        const u = this.user;
        const mine = COURSES.filter(c => u.progress[c.id] !== undefined);
        const done = mine.reduce((sum, c) => sum + Math.round(c.lessons * u.progress[c.id] / 100), 0);
        const earned = 3;

        $('#stats').innerHTML = [
            ['⭐', u.stars, plural(u.stars, 'star')],
            ['🔥', u.streak, plural(u.streak, 'day') + ' in a row'],
            ['📚', done, plural(done, 'lesson') + ' done'],
            ['🏆', earned, plural(earned, 'badge')]
        ].map(([icon, value, label]) => `
            <div class="stat">
                <span class="stat__icon" aria-hidden="true">${icon}</span>
                <span class="stat__value">${value}</span>
                <span class="stat__label">${label}</span>
            </div>`).join('');

        $('#my-courses').innerHTML = mine.map((c, i) => {
            const p = u.progress[c.id];
            const locked = i > 0 && u.progress[mine[i - 1].id] < 100 && p === 0;
            return `
                <article class="my-course${locked ? ' is-locked' : ''}">
                    <div class="my-course__thumb" style="--thumb:${c.thumb}">${this.bobik(locked ? 'sleep' : c.pose, c.palette)}</div>
                    <div>
                        <h3>${c.title}</h3>
                        <p class="my-course__meta">${locked ? '🔒 Unlocks after the previous course' : `${p}% · ${c.lessons} ${plural(c.lessons, 'lesson')}`}</p>
                        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="${c.title} progress">
                            <div class="progress__fill" data-value="${p}"></div>
                        </div>
                    </div>
                    ${locked ? '' : `<button class="btn" type="button" data-continue="${c.id}">${p > 0 ? 'Continue' : 'Start'}</button>`}
                </article>`;
        }).join('');

        $('#profile-bobik').innerHTML = this.bobik('delight');
        $('#profile-name').textContent = u.name;
        $('#profile-age').textContent = `${AGE_LABEL[u.age]} · Level ${1 + Math.floor(u.stars / 10)}`;

        requestAnimationFrame(() => {
            $$('#my-courses .progress__fill').forEach(f => { f.style.width = f.dataset.value + '%'; });
        });

        $('#badges').innerHTML = BADGES.map((b, i) => `
            <div class="badge${i < earned ? '' : ' is-locked'}">
                <span class="badge__icon" aria-hidden="true">${b.icon}</span>
                <h3>${b.title}</h3>
            </div>`).join('');

        $$('#palette-picker .swatch').forEach(s => {
            s.setAttribute('aria-checked', String(s.dataset.palette === this.palette));
        });
    },

    setPalette(name) {
        this.palette = name;
        if (this.user) {
            this.user.palette = name;
            this.saveUser();
        }
        this.drawStaticBobiks();
        this.renderCabinet();
        this.setHeroBobik('surprise');
        clearTimeout(this.paletteTimer);
        this.paletteTimer = setTimeout(() => this.setHeroBobik(this.pose), 1200);
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

    login(form) {
        const data = new FormData(form);
        const name = String(data.get('name')).trim();
        if (!name) return;
        this.user = this.newUser(name, data.get('age'));
        this.saveUser();
        this.updateAuthButton();
        this.closeModal('login');
        form.reset();
        location.hash = '#/cabinet';
    },

    logout() {
        this.user = null;
        this.saveUser();
        this.updateAuthButton();
        location.hash = '#/';
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

        $('#auth-btn').addEventListener('click', () => {
            if (this.user) location.hash = '#/cabinet';
            else this.openModal('login');
        });
        $('#logout-btn').addEventListener('click', () => this.logout());

        $('#age-filter').addEventListener('click', e => {
            const chip = e.target.closest('.chip');
            if (chip) this.filterCourses(chip.dataset.age);
        });

        $('#palette-picker').addEventListener('click', e => {
            const sw = e.target.closest('.swatch');
            if (sw) this.setPalette(sw.dataset.palette);
        });

        // Кнопки, открывающие модалки, и «Продолжить» в кабинете
        document.addEventListener('click', e => {
            const opener = e.target.closest('[data-open]');
            if (opener) this.openModal(opener.dataset.open, opener.dataset.course);

            const cont = e.target.closest('[data-continue]');
            if (cont) {
                const c = COURSES.find(x => x.id === cont.dataset.continue);
                this.setHeroBobik('run');
                $('#bubble').textContent = `Off to "${c.title}"!`;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            if (e.target.closest('[data-close]')) e.target.closest('dialog').close();
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
