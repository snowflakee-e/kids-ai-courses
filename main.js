'use strict';

// Настройки сайта
const CONFIG = {
    // Webhook для заявок на бесплатный урок (например, Make.com Custom Webhook).
    // Пока пусто — заявки не отправляются, форма работает в демо-режиме.
    leadWebhook: ''
};

const COURSES = [
    { id: 'hello-ai', title: 'Привет, ИИ!', age: '6-8', lessons: 8, minutes: 30, level: 'Старт',
      desc: 'Знакомимся с искусственным интеллектом через игры и забавные эксперименты.',
      palette: 'mint', pose: 'hello', thumb: '#DDF6EF' },
    { id: 'ai-tales', title: 'Сказки с нейросетью', age: '6-8', lessons: 6, minutes: 30, level: 'Старт',
      desc: 'Придумываем героев и сочиняем волшебные истории вместе с ИИ.',
      palette: 'peach', pose: 'delight', thumb: '#FFEADF' },
    { id: 'prompts', title: 'Волшебные промпты', age: '9-11', lessons: 10, minutes: 45, level: 'Начальный',
      desc: 'Учимся разговаривать с нейросетью так, чтобы она понимала нас с полуслова.',
      palette: 'sky', pose: 'idea', thumb: '#E1F0FF' },
    { id: 'ai-art', title: 'Художник с ИИ', age: '9-11', lessons: 8, minutes: 45, level: 'Начальный',
      desc: 'Создаём картинки, комиксы и открытки с помощью нейросетей.',
      palette: 'lav', pose: 'wink', thumb: '#EEE9FF' },
    { id: 'my-bot', title: 'Свой робот-помощник', age: '12-14', lessons: 12, minutes: 60, level: 'Средний',
      desc: 'Собираем собственного чат-бота и учим его помогать с делами.',
      palette: 'sky', pose: 'victory', thumb: '#FFF1C9' },
    { id: 'ai-games', title: 'Игры и ИИ', age: '12-14', lessons: 10, minutes: 60, level: 'Средний',
      desc: 'Создаём простую игру, где персонажи думают с помощью искусственного интеллекта.',
      palette: 'mint', pose: 'run', thumb: '#FFE0EA' }
];

const AGE_LABEL = { '6-8': '6–8 лет', '9-11': '9–11 лет', '12-14': '12–14 лет' };

// Шапка для каждой страницы: тексты и поза Бобика
const ROUTES = {
    home: {
        kicker: 'Школа искусственного интеллекта для детей 6–14 лет',
        title: 'Bloop <span>AI School</span>',
        lead: 'Учимся дружить с нейросетями: рисуем, сочиняем сказки и собираем своих роботов-помощников вместе с Бобиком.',
        pose: 'hello', bubble: 'Привет! Я Бобик 👋'
    },
    courses: {
        kicker: 'Каталог',
        title: 'Наши курсы',
        lead: 'Выбирайте по возрасту: от первых игр с ИИ до собственных проектов.',
        pose: 'point', bubble: 'Выбирай любой!'
    },
    method: {
        kicker: 'Методика',
        title: 'Как мы учимся',
        lead: 'Короткие уроки-квесты, много практики и награды за каждый шаг.',
        pose: 'idea', bubble: 'У меня идея! 💡'
    },
    parents: {
        kicker: 'Для родителей',
        title: 'Родителям',
        lead: 'Форматы занятий, безопасность и ответы на частые вопросы.',
        pose: 'wink', bubble: 'Всё расскажу 😉'
    },
    cabinet: {
        kicker: 'Личный кабинет',
        title: 'Привет!',
        lead: 'Здесь твои курсы, звёзды и награды.',
        pose: 'joy', bubble: 'Ура, ты здесь! 🎉'
    }
};

const BADGES = [
    { icon: '👋', title: 'Первый урок' },
    { icon: '⭐', title: '10 звёзд' },
    { icon: '🔥', title: '3 дня подряд' },
    { icon: '🎨', title: 'Первая картинка' },
    { icon: '🤖', title: 'Свой бот' },
    { icon: '🏆', title: 'Курс пройден' }
];

const HAPPY_STATES = ['joy', 'surprise', 'delight', 'wink', 'victory'];
const STORAGE_KEY = 'bloop-user';

// Склонение: plural(3, ['звезда', 'звезды', 'звёзд']) → 'звезды'
const plural = (n, [one, few, many]) => {
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
};

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
            title.textContent = `Привет, ${this.user.name}!`;
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
        $('#burger').setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
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
                        <li>📚 ${c.lessons} ${plural(c.lessons, ['урок', 'урока', 'уроков'])}</li>
                        <li>⏱ ${c.minutes} мин</li>
                        <li>${c.level}</li>
                    </ul>
                    <div class="course__foot">
                        <span class="course__free">Первый урок бесплатно</span>
                        <button class="btn" type="button" data-open="lead" data-course="${c.id}">Начать</button>
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
        $('#results-count').textContent = `Найдено ${list.length} ${plural(list.length, ['курс', 'курса', 'курсов'])}`;
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
            ['⭐', u.stars, plural(u.stars, ['звезда', 'звезды', 'звёзд'])],
            ['🔥', u.streak, plural(u.streak, ['день', 'дня', 'дней']) + ' подряд'],
            ['📚', done, plural(done, ['урок пройден', 'урока пройдено', 'уроков пройдено'])],
            ['🏆', earned, plural(earned, ['награда', 'награды', 'наград'])]
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
                        <p class="my-course__meta">${locked ? '🔒 Откроется после предыдущего курса' : `${p}% · ${c.lessons} ${plural(c.lessons, ['урок', 'урока', 'уроков'])}`}</p>
                        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="Прогресс курса ${c.title}">
                            <div class="progress__fill" data-value="${p}"></div>
                        </div>
                    </div>
                    ${locked ? '' : `<button class="btn" type="button" data-continue="${c.id}">${p > 0 ? 'Продолжить' : 'Начать'}</button>`}
                </article>`;
        }).join('');

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
            btn.setAttribute('aria-label', 'Личный кабинет: ' + this.user.name);
        } else {
            $('.auth-text', btn).textContent = 'Личный кабинет';
            $('.btn__icon', btn).textContent = '🔑';
            btn.setAttribute('aria-label', 'Войти в личный кабинет');
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
            note.textContent = 'Демо-режим: заявки пока не отправляются.';
            return;
        }

        note.textContent = 'Отправляем…';
        try {
            const res = await fetch(CONFIG.leadWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(res.status);
            form.reset();
            note.textContent = 'Спасибо! Мы скоро свяжемся с вами 💛';
        } catch (e) {
            note.textContent = 'Не получилось отправить. Попробуйте ещё раз.';
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
                $('#bubble').textContent = `Поехали в «${c.title}»!`;
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
