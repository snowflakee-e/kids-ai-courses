'use strict';

// Финальный бой с Глитчем на Phaser 3. Сам Phaser (vendor/phaser.min.js, ~1.2 МБ) грузится только при старте боя.
// Управление: WASD или стрелки — ходить, мышь — целиться, клик или пробел — стрелять, Esc — пауза.
// На телефоне: левый палец — движение, правый — стрельба туда, где касаешься.
//
// Раунд = вопрос из курса. Ответы летают карточками, три попадания в карточку — это выбор.
// Верная карточка снимает щит: несколько секунд Глитча можно бить. Неверная взрывается кольцом пуль.
// Здоровье Глитча режется по раундам: пока есть вопросы, ниже своей доли его не добить, поэтому
// каждый вопрос обязательно встретится. После последнего вопроса — финальная фаза без щита.
// В итог уходит только то, с первой ли попытки найден ответ в каждом раунде. Смерти не штрафуются.
const Arena = (() => {
    const W = 960, H = 540;
    const HEARTS = 5, HITS = 3;
    const C = {
        bg: 0x0B0C10, surface: 0x14161C, line: 0x262A34, line2: 0x363B47, ink: 0xF2F3F5, soft: 0xA0A6B2,
        lime: 0xC6F432, limeDark: 0x232C0E, violet: 0x7C5CFF, pink: 0xFF3B8D, cyan: 0x3DF2E0, bad: 0xF0453A
    };
    const FONT = "'Space Grotesk', system-ui, sans-serif";
    const BODY = "'Inter', system-ui, sans-serif";
    // Глитч — пиксельный пришелец в два кадра, o — светящиеся глаза
    const INVADER = [
        ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XXoXXXoXX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'],
        ['..X.....X..', 'X..X...X..X', 'X.XXXXXXX.X', 'XXXoXXXoXXX', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..X.....X..', '.X.......X.']
    ];
    const BOSS_R = 42, SHIELD_R = 62, PLAYER_R = 15;

    let loading = null;
    function load(src) {
        if (window.Phaser) return Promise.resolve();
        if (!loading) loading = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = () => { loading = null; s.remove(); reject(new Error('phaser')); };
            document.head.appendChild(s);
        });
        return loading;
    }

    function svgImage(svg) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        });
    }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const pick = list => list[Math.floor(Math.random() * list.length)];
    function shuffle(list) {
        const a = list.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // o: { parent, boss: { name, hp, taunts, hurt }, rounds: [{ topic, q, options (первый верный), explain }],
    //      text (строки UI.arena), calm, touch, sfx(name), bloop(size) → svg, onEnd({ results, deaths, sec }) }
    // Возвращает { destroy }.
    async function play(o) {
        const Z = (window.devicePixelRatio || 1) > 1 || o.parent.clientWidth > W * 1.2 ? 2 : 1;
        const T = o.text, N = o.rounds.length, HP = o.boss.hp, calm = !!o.calm, touch = !!o.touch;
        const bloopW = 72;
        const bloop = await svgImage(o.bloop(bloopW * Z).replace(/width="(\d+)"/, (m, w) => `width="${w}" height="${Math.round(w * 292 / 300)}"`));
        const sfx = name => { try { o.sfx(name); } catch (e) { /* без звука */ } };
        let game = null, ended = false;

        class Fight extends Phaser.Scene {
            constructor() { super('fight'); }

            create() {
                this.cameras.main.setZoom(Z).centerOn(W / 2, H / 2);
                this.textures.addImage('bloop', bloop);
                this.makeTextures();
                this.drawBackdrop();

                this.k = -1;
                this.phase = 'intro';
                this.paused = false;
                this.timers = [];
                this.res = o.rounds.map(() => ({ first: null }));
                this.answeredN = 0;
                this.deaths = 0;
                this.started = Date.now();
                this.cd = { a: 0, b: 0, s: 0 };
                this.spin = 0;
                this.shots = 0;
                this.cards = [];
                this.pShots = [];
                this.bShots = [];

                this.boss = { x: W / 2, y: 190, hp: HP, shield: true, t: 0, frameT: 0, frame: 0, jitT: 0, tear: 0, tearT: 2, flash: 0 };
                this.ghostA = this.add.image(0, 0, 'inv0').setScale(1 / Z).setTint(C.pink).setAlpha(.55).setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
                this.ghostB = this.add.image(0, 0, 'inv0').setScale(1 / Z).setTint(C.cyan).setAlpha(.55).setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
                this.bossImg = this.add.image(0, 0, 'inv0').setScale(1 / Z).setDepth(4);
                this.shieldG = this.add.graphics().setDepth(4);

                this.player = { x: W / 2, y: 470, hearts: HEARTS, inv: 0, cool: 0 };
                this.playerImg = this.add.image(this.player.x, this.player.y, 'bloop').setScale(1 / Z).setDepth(8);

                this.sparks = this.add.particles(0, 0, 'spark', {
                    speed: { min: 60, max: 280 }, lifespan: { min: 250, max: 650 },
                    scale: { start: 1.3 / Z, end: 0 }, tint: [C.lime, C.pink, C.cyan, C.violet],
                    blendMode: Phaser.BlendModes.ADD, emitting: false
                }).setDepth(9);

                this.makeHud();
                this.setupInput();

                this.big(T.boss.toUpperCase(), '', 1.1);
                this.after(1.2, () => { this.big(T.fight, '', .8); sfx('pop'); });
                this.after(1.9, () => this.startRound(0));
                this.msg((touch ? T.touchControls : T.controls) + '\n' + T.hitsHint, '#F2F3F5', 9);
            }

            // ---------- Текстуры: рисуем сами, в Z раз крупнее, и уменьшаем спрайты — чётко на ретине ----------
            makeTextures() {
                const tex = (key, w, h, draw) => {
                    if (this.textures.exists(key)) return;
                    const g = this.make.graphics({ x: 0, y: 0 }, false);
                    draw(g, Z);
                    g.generateTexture(key, Math.ceil(w * Z), Math.ceil(h * Z));
                    g.destroy();
                };
                tex('pshot', 8, 20, (g, z) => {
                    g.fillStyle(C.lime, .3).fillRoundedRect(0, 0, 8 * z, 20 * z, 4 * z);
                    g.fillStyle(C.lime, 1).fillRoundedRect(2 * z, 2 * z, 4 * z, 16 * z, 2 * z);
                });
                tex('bshot', 18, 18, (g, z) => {
                    g.fillStyle(C.pink, .28).fillCircle(9 * z, 9 * z, 9 * z);
                    g.fillStyle(C.pink, 1).fillPoints([{ x: 9 * z, y: 2 * z }, { x: 16 * z, y: 9 * z }, { x: 9 * z, y: 16 * z }, { x: 2 * z, y: 9 * z }], true);
                    g.fillStyle(0xFFFFFF, 1).fillCircle(9 * z, 9 * z, 2 * z);
                });
                tex('bring', 18, 18, (g, z) => {
                    g.fillStyle(C.violet, .3).fillCircle(9 * z, 9 * z, 9 * z);
                    g.fillStyle(C.violet, 1).fillCircle(9 * z, 9 * z, 6 * z);
                    g.fillStyle(C.cyan, 1).fillCircle(9 * z, 9 * z, 2.5 * z);
                });
                tex('spark', 8, 8, (g, z) => g.fillStyle(0xFFFFFF, 1).fillCircle(4 * z, 4 * z, 4 * z));
                const heart = (g, z, fill) => {
                    g.fillStyle(fill, 1);
                    g.fillCircle(6 * z, 6 * z, 5 * z).fillCircle(14 * z, 6 * z, 5 * z);
                    g.fillTriangle(1.2 * z, 8 * z, 18.8 * z, 8 * z, 10 * z, 17 * z);
                };
                tex('heart', 20, 18, (g, z) => heart(g, z, C.lime));
                tex('heart0', 20, 18, (g, z) => heart(g, z, C.line2));
                INVADER.forEach((rows, f) => tex('inv' + f, 99, 72, (g, z) => {
                    const p = 9 * z;
                    rows.forEach((row, y) => [...row].forEach((ch, x) => {
                        if (ch === '.') return;
                        g.fillStyle(ch === 'o' ? C.lime : C.violet, 1).fillRect(x * p, y * p, p, p);
                    }));
                }));
            }

            drawBackdrop() {
                const g = this.add.graphics().setDepth(0);
                g.lineStyle(1, C.line, .55);
                for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, H);
                for (let y = 0; y <= H; y += 40) g.lineBetween(0, y, W, y);
                g.lineStyle(2, C.line2, 1).strokeRect(1, 1, W - 2, H - 2);
            }

            txt(x, y, s, style) {
                return this.add.text(x, y, s, Object.assign({ fontFamily: BODY, fontSize: '16px', color: '#F2F3F5', resolution: Z }, style));
            }

            makeHud() {
                this.hearts = Array.from({ length: HEARTS }, (_, i) => this.add.image(28 + i * 26, 26, 'heart').setScale(1 / Z).setDepth(12));
                this.nameT = this.txt(W / 2, 10, '', { fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#C6F432' }).setOrigin(.5, 0).setDepth(12);
                this.hpG = this.add.graphics().setDepth(12);
                this.roundT = this.txt(W - 20, 16, '', { fontFamily: FONT, fontSize: '14px', fontStyle: 'bold', color: '#A0A6B2' }).setOrigin(1, 0).setDepth(12);
                this.bannerG = this.add.graphics().setDepth(10);
                this.kickerT = this.txt(W / 2, 60, '', { fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#C6F432' }).setOrigin(.5, 0).setDepth(11);
                this.qT = this.txt(W / 2, 78, '', { fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', align: 'center', wordWrap: { width: 840, useAdvancedWrap: true } }).setOrigin(.5, 0).setDepth(11);
                this.msgT = this.txt(W / 2, H - 10, '', {
                    fontSize: '15px', align: 'center', lineSpacing: 3, backgroundColor: 'rgba(20,22,28,0.92)',
                    padding: { x: 14, y: 8 }, wordWrap: { width: 820, useAdvancedWrap: true }
                }).setOrigin(.5, 1).setDepth(20).setAlpha(0);
                this.sayT = this.txt(0, 0, '', {
                    fontSize: '14px', fontStyle: 'bold', color: '#0B0C10', backgroundColor: '#F2F3F5',
                    padding: { x: 10, y: 6 }, wordWrap: { width: 230, useAdvancedWrap: true }
                }).setDepth(15).setVisible(false);
                this.dim = this.add.rectangle(W / 2, H / 2, W, H, C.bg, .78).setDepth(25).setVisible(false);
                this.bigT = this.txt(W / 2, H / 2 - 18, '', { fontFamily: FONT, fontSize: '46px', fontStyle: 'bold', color: '#C6F432', align: 'center' }).setOrigin(.5).setDepth(30).setAlpha(0);
                this.subT = this.txt(W / 2, H / 2 + 30, '', { fontSize: '17px', align: 'center', wordWrap: { width: 700 } }).setOrigin(.5).setDepth(30).setAlpha(0);
                this.winG = this.add.graphics().setDepth(12);
                this.joyG = this.add.graphics().setDepth(22);
                this.drawHp();
            }

            setupInput() {
                const kb = this.input.keyboard;
                this.keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ESC,P,ENTER');
                kb.addCapture('SPACE,UP,DOWN,LEFT,RIGHT');
                this.input.mouse && this.input.mouse.disableContextMenu();
                this.mouseAim = false;
                this.joy = null;
                this.fireP = null;
                const cam = this.cameras.main;
                const world = p => p.positionToCamera(cam);
                this.input.on('pointermove', p => {
                    if (!p.wasTouch) this.mouseAim = true;
                    if (this.joy && p.id === this.joy.id) { const w = world(p); this.joy.x = w.x; this.joy.y = w.y; }
                    if (this.fireP && p.id === this.fireP.id) { const w = world(p); this.fireP.x = w.x; this.fireP.y = w.y; }
                });
                this.input.on('pointerdown', p => {
                    if (this.wonReady) { this.finish(); return; }
                    if (this.paused) { this.pause(false); return; }
                    if (this.phase === 'dead') { this.respawn(); return; }
                    if (!p.wasTouch) return;
                    const w = world(p);
                    if (w.x < W / 2 && !this.joy) this.joy = { id: p.id, ax: w.x, ay: w.y, x: w.x, y: w.y };
                    else if (!this.fireP) this.fireP = { id: p.id, x: w.x, y: w.y };
                });
                this.input.on('pointerup', p => {
                    if (this.joy && p.id === this.joy.id) this.joy = null;
                    if (this.fireP && p.id === this.fireP.id) this.fireP = null;
                });
                this.game.events.on('blur', () => { if (this.live()) this.pause(true); });
            }

            // Свои таймеры вместо time.delayedCall: на паузе они стоят
            after(sec, fn) { this.timers.push({ t: sec, fn }); }

            live() { return !this.paused && this.phase !== 'dead' && this.phase !== 'won'; }

            tier() { return this.phase === 'final' ? 3 : 1 + Math.floor(3 * Math.max(0, this.k) / N); }

            floor() { return this.phase === 'final' ? 0 : Math.round(HP * (N - this.answeredN) / N); }

            // ---------- Раунды ----------
            startRound(k) {
                const rd = o.rounds[k];
                this.k = k;
                this.phase = 'question';
                this.readLeft = calm ? 4 : 3;
                this.cd = { a: 1, b: 3, s: 0 };
                this.setShield(true);
                this.roundT.setText(T.round(k + 1, N));
                this.banner((T.round(k + 1, N) + (rd.topic ? ' · ' + rd.topic : '')).toUpperCase(), rd.q);
                this.spawnCards(rd);
                if (k > 0) this.say(o.boss.taunts);
            }

            banner(kicker, q) {
                this.kickerT.setText(kicker);
                this.qT.setText(q);
                const h = q ? this.qT.height : 0;
                this.bannerG.clear();
                this.bannerG.fillStyle(C.surface, .94).fillRoundedRect(40, 52, W - 80, 34 + h, 12);
                this.bannerG.lineStyle(1.5, this.phase === 'question' ? C.line2 : C.pink, 1).strokeRoundedRect(40, 52, W - 80, 34 + h, 12);
            }

            spawnCards(rd) {
                const opts = shuffle(rd.options.map((t, i) => ({ t, ok: i === 0 })));
                const n = opts.length, gap = W / n, wrap = Math.min(240, gap - 72);
                this.cards = opts.map((op, i) => {
                    const t = this.txt(0, -6, op.t, { fontSize: '15px', align: 'center', lineSpacing: 2, wordWrap: { width: wrap, useAdvancedWrap: true } }).setOrigin(.5);
                    const w = Math.max(130, t.width + 28), h = t.height + 36;
                    const g = this.add.graphics();
                    const hx = gap * (i + .5), hy = 318 + (n > 2 ? (i % 2 ? 34 : -6) : 0);
                    const c = this.add.container(hx, hy, [g, t]).setDepth(5).setAlpha(0);
                    const card = { c, g, t, w, h, hx, hy, ok: op.ok, hits: 0, alive: true, flash: 0, ph: Math.random() * 6.28 };
                    this.drawCard(card);
                    this.tweens.add({ targets: c, alpha: 1, duration: 300, delay: 150 + i * 140 });
                    return card;
                });
            }

            drawCard(card, state) {
                const { g, w, h } = card;
                g.clear();
                const stroke = state === 'ok' ? C.lime : state === 'bad' ? C.bad : card.flash > 0 ? C.lime : C.line2;
                g.fillStyle(state === 'ok' ? C.limeDark : C.surface, .96).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
                g.lineStyle(card.flash > 0 || state ? 3 : 2, stroke, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
                for (let i = 0; i < HITS; i++) {
                    const px = (i - (HITS - 1) / 2) * 14, py = h / 2 - 11;
                    if (i < card.hits) g.fillStyle(state === 'bad' ? C.bad : C.lime, 1).fillCircle(px, py, 4);
                    else g.lineStyle(1.5, C.soft, .8).strokeCircle(px, py, 4);
                }
            }

            hitCard(card) {
                card.hits++;
                card.flash = .1;
                this.drawCard(card);
                sfx('tap');
                if (card.hits >= HITS) this.lockCard(card);
            }

            lockCard(card) {
                const r = this.res[this.k], rd = o.rounds[this.k];
                if (r.first === null) r.first = card.ok;
                card.alive = false;
                if (!card.ok) {
                    this.drawCard(card, 'bad');
                    this.burst(card.c.x, card.c.y, calm ? 7 : 10, 150, 'bring');
                    this.tweens.add({ targets: card.c, alpha: 0, scale: 1.15, duration: 380, onComplete: () => card.c.destroy() });
                    this.msg(T.wrong, '#FF8A80', 4);
                    this.say(o.boss.taunts);
                    sfx('bad');
                    if (!calm) this.cameras.main.shake(160, .004);
                    return;
                }
                this.drawCard(card, 'ok');
                this.cards.forEach(c => {
                    if (c === card) return;
                    c.alive = false;
                    this.tweens.add({ targets: c.c, alpha: 0, duration: 250, onComplete: () => c.c.destroy() });
                });
                this.tweens.add({ targets: card.c, alpha: 0, y: card.c.y - 20, duration: 600, delay: 500, onComplete: () => card.c.destroy() });
                this.answeredN++;
                if (r.first && this.player.hearts < HEARTS) this.player.hearts++;
                this.msg('✓ ' + rd.explain, '#C6F432', 8);
                this.say(o.boss.hurt);
                sfx('break');
                this.sparks.explode(40, this.boss.x, this.boss.y);
                if (this.answeredN >= N) this.startFinal();
                else this.startWindow();
                this.damage(r.first ? 6 : 3);
            }

            startWindow() {
                this.phase = 'window';
                this.winMax = this.winLeft = calm ? 7 : 6;
                this.cd = { a: .6, b: 1.2, s: 0 };
                this.setShield(false);
                this.banner(T.exposed.toUpperCase(), o.rounds[this.k].q);
                this.big(T.shieldDown, T.blast, .9);
            }

            endWindow() {
                this.phase = 'between';
                this.setShield(true);
                this.winG.clear();
                this.big('', T.reboot, .9);
                this.after(1.2, () => this.startRound(this.k + 1));
            }

            startFinal() {
                this.phase = 'final';
                this.cd = { a: .8, b: 1.5, s: 0 };
                this.setShield(false);
                this.roundT.setText(T.finalShort);
                this.banner(T.final.toUpperCase(), T.finalSub);
                this.big(T.final, T.finalSub, 1.2);
            }

            setShield(on) {
                this.boss.shield = on;
                this.nameT.setText(`${o.boss.name.toUpperCase()} · ${on ? T.shieldUp : T.exposedShort}`);
                this.nameT.setColor(on ? '#3DF2E0' : '#FF3B8D');
                this.drawHp();
            }

            damage(n) {
                const b = this.boss, before = b.hp;
                b.hp = Math.max(this.floor(), b.hp - n);
                if (b.hp < before) b.flash = .06;
                this.drawHp();
                if (b.hp <= 0 && this.phase === 'final') this.win();
            }

            drawHp() {
                const g = this.hpG, x = W / 2 - 180, y = 32, w = 360;
                g.clear();
                g.fillStyle(C.line, 1).fillRoundedRect(x, y, w, 10, 5);
                const f = this.boss.hp / HP;
                if (f > 0) g.fillStyle(this.boss.shield ? C.violet : C.pink, 1).fillRoundedRect(x, y, Math.max(10, w * f), 10, 5);
                if (this.phase === 'window') g.fillStyle(0xFFFFFF, .9).fillRect(x + w * this.floor() / HP - 1, y - 3, 2, 16);
                this.hearts && this.hearts.forEach((h, i) => h.setTexture(i < this.player.hearts ? 'heart' : 'heart0'));
            }

            // ---------- Сообщения ----------
            msg(text, color, sec) {
                this.msgT.setText(text).setColor(color).setAlpha(1);
                this.tweens.killTweensOf(this.msgT);
                this.tweens.add({ targets: this.msgT, alpha: 0, duration: 500, delay: sec * 1000 });
            }

            say(list) {
                this.sayT.setText(pick(list)).setVisible(true);
                this.sayLeft = 2.8;
            }

            big(title, sub, sec) {
                this.tweens.killTweensOf([this.bigT, this.subT]);
                this.bigT.setText(title).setAlpha(1).setScale(calm ? 1 : 1.25);
                this.subT.setText(sub).setAlpha(1);
                if (!calm) this.tweens.add({ targets: this.bigT, scale: 1, duration: 260, ease: 'Back.Out' });
                if (sec) this.tweens.add({ targets: [this.bigT, this.subT], alpha: 0, duration: 350, delay: sec * 1000 });
            }

            pause(on) {
                if (on === this.paused || this.phase === 'won') return;
                this.paused = on;
                this.dim.setVisible(on || this.phase === 'dead');
                if (on) {
                    this.tweens.killTweensOf([this.bigT, this.subT]);
                    this.bigT.setText(T.paused).setAlpha(1).setScale(1);
                    this.subT.setText(T.resume).setAlpha(1);
                } else if (this.phase === 'dead') {
                    this.big(T.down, T.retry);
                } else {
                    this.bigT.setAlpha(0);
                    this.subT.setAlpha(0);
                }
            }

            // ---------- Пули ----------
            pool(list, key, depth) {
                let s = list.find(x => !x.active);
                if (!s) {
                    s = this.add.image(0, 0, key).setScale(1 / Z).setDepth(depth);
                    list.push(s);
                }
                s.setTexture(key).setActive(true).setVisible(true);
                return s;
            }

            shootB(x, y, ang, speed, key) {
                if (this.bShots.filter(s => s.active).length > 260) return;
                const s = this.pool(this.bShots, key || 'bshot', 7);
                s.setPosition(x, y);
                s.vx = Math.cos(ang) * speed;
                s.vy = Math.sin(ang) * speed;
                s.r = 6;
            }

            aimed(n, spread, speed) {
                const b = this.boss, a = Math.atan2(this.player.y - b.y, this.player.x - b.x);
                for (let i = 0; i < n; i++) this.shootB(b.x, b.y + 20, a + (i - (n - 1) / 2) * spread, speed);
            }

            burst(x, y, n, speed, key) {
                const off = Math.random() * 6.28;
                for (let i = 0; i < n; i++) this.shootB(x, y, off + i / n * Math.PI * 2, speed, key);
            }

            clearB() { this.bShots.forEach(s => s.setActive(false).setVisible(false)); }

            bossFire(dt) {
                const cd = this.cd, tier = this.tier(), slow = calm ? 1.25 : 1, b = this.boss;
                cd.a -= dt; cd.b -= dt; cd.s -= dt;
                if (this.phase === 'question') {
                    if (this.readLeft > 0) { this.readLeft -= dt; return; }
                    if (cd.a <= 0) {
                        this.aimed(tier === 3 ? 3 : 1, .22, 170);
                        cd.a = [1.8, 1.4, 1.6][tier - 1] * slow;
                    }
                    if (tier > 1 && cd.b <= 0) {
                        this.burst(b.x, b.y, tier === 3 ? 10 : 8, 130, 'bring');
                        cd.b = (tier === 3 ? 3.5 : 4) * slow;
                    }
                    return;
                }
                if (this.phase !== 'window' && this.phase !== 'final') return;
                if (cd.a <= 0) {
                    this.aimed(3, .25, tier === 1 ? 200 : 185);
                    cd.a = [.9, 1, 1.4][tier - 1] * slow;
                }
                if (tier === 2 && cd.b <= 0) {
                    this.burst(b.x, b.y, 14, 150, 'bring');
                    cd.b = 1.5 * slow;
                }
                if (tier === 3 && cd.s <= 0) {
                    this.spin += .32;
                    this.shootB(b.x, b.y, this.spin, 150, 'bring');
                    this.shootB(b.x, b.y, this.spin + Math.PI, 150, 'bring');
                    cd.s = .12 * slow;
                }
                if (this.phase === 'final' && cd.b <= 0) {
                    this.burst(b.x, b.y, 16, 140, 'bring');
                    cd.b = 2.2 * slow;
                }
            }

            // ---------- Игрок ----------
            hurt() {
                const p = this.player;
                if (p.inv > 0 || !this.live()) return;
                p.hearts--;
                p.inv = 1.4;
                this.drawHp();
                sfx('hurt');
                if (!calm) this.cameras.main.shake(180, .006);
                if (p.hearts <= 0) this.die();
            }

            die() {
                this.before = this.phase;
                this.phase = 'dead';
                this.deaths++;
                this.deadT = .7;
                this.clearB();
                this.dim.setVisible(true);
                this.big(T.down, T.retry);
                this.sayT.setVisible(false);
            }

            respawn() {
                if (this.deadT > 0) return;
                const p = this.player;
                p.hearts = HEARTS;
                p.inv = 2;
                p.x = W / 2; p.y = 470;
                this.phase = this.before;
                if (this.phase === 'window') this.winLeft = this.winMax;
                if (this.phase === 'question') this.readLeft = 1.5;
                this.dim.setVisible(false);
                this.bigT.setAlpha(0);
                this.subT.setAlpha(0);
                this.drawHp();
            }

            win() {
                this.phase = 'won';
                const b = this.boss;
                this.clearB();
                this.cards.forEach(c => c.c.active && c.c.destroy());
                this.winG.clear();
                this.sparks.explode(calm ? 50 : 140, b.x, b.y);
                [this.bossImg, this.ghostA, this.ghostB].forEach(i => i.setVisible(false));
                this.shieldG.clear();
                this.sayT.setVisible(false);
                if (!calm) { this.cameras.main.shake(500, .012); this.cameras.main.flash(180, 198, 244, 50); }
                sfx('boom');
                this.after(.5, () => sfx('win'));
                this.banner(T.wonKicker.toUpperCase(), '');
                this.big(T.won, '', 0);
                this.after(1.6, () => this.victory());
            }

            // Экран победы в игре: звёзды, ответы с первой попытки, время, нокауты. Дальше — по кнопке игрока
            victory() {
                const c = this.res.filter(r => r.first).length;
                const stars = c === N ? 3 : c / N >= .75 ? 2 : 1;
                const sec = Math.round((Date.now() - this.started) / 1000);
                this.dim.setVisible(true);
                this.tweens.killTweensOf([this.bigT, this.subT]);
                this.bigT.setText(T.won).setAlpha(1).setScale(1).setY(H / 2 - 40);
                this.subT.setText(T.victory(c, N, sec, this.deaths)).setAlpha(1).setY(H / 2 + 14);
                this.starsT = this.txt(W / 2, H / 2 - 104, '★'.repeat(stars) + '☆'.repeat(3 - stars), {
                    fontFamily: FONT, fontSize: '44px', color: '#F5A100'
                }).setOrigin(.5).setDepth(30);
                this.contT = this.txt(W / 2, H / 2 + 84, T.cont, {
                    fontFamily: FONT, fontSize: '17px', fontStyle: 'bold', color: '#0B0C10', backgroundColor: '#C6F432', padding: { x: 18, y: 10 }
                }).setOrigin(.5).setDepth(30);
                if (!calm) {
                    this.starsT.setScale(.4);
                    this.tweens.add({ targets: this.starsT, scale: 1, duration: 420, ease: 'Back.Out' });
                    this.tweens.add({ targets: this.contT, alpha: .55, duration: 700, yoyo: true, repeat: -1 });
                }
                sfx('star');
                this.wonReady = true;
            }

            finish() {
                if (ended) return;
                ended = true;
                o.onEnd({ results: this.res.map(r => r.first === true), deaths: this.deaths, sec: Math.round((Date.now() - this.started) / 1000) });
            }

            // ---------- Кадр ----------
            update(time, delta) {
                const dt = Math.min(delta / 1000, .05), K = this.keys, JD = Phaser.Input.Keyboard.JustDown;
                if (JD(K.ESC) || JD(K.P)) this.pause(!this.paused);
                if (touch && window.innerHeight > window.innerWidth && this.live()) this.pause(true);
                if (this.phase === 'dead') {
                    this.deadT -= dt;
                    if (!this.paused && (JD(K.ENTER) || JD(K.SPACE))) this.respawn();
                    return;
                }
                if (this.paused) return;

                for (let i = this.timers.length - 1; i >= 0; i--) {
                    const t = this.timers[i];
                    t.t -= dt;
                    if (t.t <= 0) { this.timers.splice(i, 1); t.fn(); }
                }
                if (this.phase === 'won') {
                    if (this.wonReady && (JD(K.ENTER) || JD(K.SPACE))) this.finish();
                    return;
                }

                this.updateBoss(dt);
                this.updatePlayer(dt);
                this.updateCards(dt);
                this.bossFire(dt);
                this.updateShots(dt);

                if (this.phase === 'window') {
                    this.winLeft -= dt;
                    const f = Math.max(0, this.winLeft / this.winMax);
                    this.winG.clear().fillStyle(C.pink, 1).fillRect(W / 2 - 180, 46, 360 * f, 3);
                    if (this.winLeft <= 0 || this.boss.hp <= this.floor()) this.endWindow();
                }
                if (this.sayLeft > 0) {
                    this.sayLeft -= dt;
                    const b = this.boss, right = b.x + 66 + this.sayT.width < W - 10;
                    this.sayT.setPosition(right ? b.x + 66 : b.x - 66 - this.sayT.width, b.y - 44);
                    if (this.sayLeft <= 0) this.sayT.setVisible(false);
                }
            }

            updateBoss(dt) {
                const b = this.boss, m = this.phase === 'final' ? 1.5 : 1;
                b.t += dt * m;
                b.x = W / 2 + Math.sin(b.t * .55) * 300;
                b.y = 190 + Math.sin(b.t * 1.25) * 16;
                b.frameT -= dt;
                if (b.frameT <= 0) { b.frame ^= 1; b.frameT = .45; [this.bossImg, this.ghostA, this.ghostB].forEach(i => i.setTexture('inv' + b.frame)); }
                // Глитч-эффект: цветные двойники дрожат, иногда картинка «рвётся» в сторону
                let tear = 0;
                if (!calm) {
                    b.tearT -= dt;
                    if (b.tearT <= 0) { b.tear = .07; b.tearT = 1.5 + Math.random() * 2.5; b.tx = (Math.random() < .5 ? -1 : 1) * (8 + Math.random() * 8); }
                    if (b.tear > 0) { b.tear -= dt; tear = b.tx; }
                }
                b.jitT -= dt;
                if (b.jitT <= 0) {
                    const j = calm ? 0 : (b.shield ? 2 : 4) + (1 - b.hp / HP) * 5;
                    b.ja = [-3 - Math.random() * j, Math.random() * j - j / 2];
                    b.jb = [3 + Math.random() * j, Math.random() * j - j / 2];
                    b.jitT = .07;
                }
                this.bossImg.setPosition(b.x + tear, b.y);
                this.ghostA.setPosition(b.x + tear + b.ja[0], b.y + b.ja[1]);
                this.ghostB.setPosition(b.x + tear + b.jb[0], b.y + b.jb[1]);
                if (b.flash > 0) { b.flash -= dt; this.bossImg.setTintFill(0xFFFFFF); } else this.bossImg.clearTint();

                const g = this.shieldG.clear();
                if (b.shield) {
                    const rot = calm ? 0 : b.t * 1.6;
                    g.fillStyle(C.cyan, .07).fillCircle(b.x, b.y, SHIELD_R);
                    g.lineStyle(2, C.cyan, .7).strokeCircle(b.x, b.y, SHIELD_R);
                    g.lineStyle(4, C.cyan, .9);
                    for (let i = 0; i < 6; i++) {
                        const a = rot + i * Math.PI / 3;
                        g.beginPath().arc(b.x, b.y, SHIELD_R + 6, a, a + .5).strokePath();
                    }
                }
            }

            updatePlayer(dt) {
                const p = this.player, K = this.keys;
                let dx = (K.D.isDown || K.RIGHT.isDown ? 1 : 0) - (K.A.isDown || K.LEFT.isDown ? 1 : 0);
                let dy = (K.S.isDown || K.DOWN.isDown ? 1 : 0) - (K.W.isDown || K.UP.isDown ? 1 : 0);
                this.joyG.clear();
                if (this.joy) {
                    const jx = this.joy.x - this.joy.ax, jy = this.joy.y - this.joy.ay, len = Math.hypot(jx, jy);
                    if (len > 6) { dx = jx / Math.max(len, 40); dy = jy / Math.max(len, 40); }
                    const kx = this.joy.ax + jx / Math.max(1, len / 44), ky = this.joy.ay + jy / Math.max(1, len / 44);
                    this.joyG.fillStyle(0xFFFFFF, .08).fillCircle(this.joy.ax, this.joy.ay, 48);
                    this.joyG.lineStyle(2, 0xFFFFFF, .25).strokeCircle(this.joy.ax, this.joy.ay, 48);
                    this.joyG.fillStyle(C.lime, .5).fillCircle(kx, ky, 20);
                }
                const len = Math.hypot(dx, dy);
                if (len > 1) { dx /= len; dy /= len; }
                p.x = clamp(p.x + dx * 280 * dt, 24, W - 24);
                p.y = clamp(p.y + dy * 280 * dt, 140, H - 30);
                p.inv = Math.max(0, p.inv - dt);
                this.playerImg.setPosition(p.x, p.y).setRotation(calm ? 0 : dx * .12);
                this.playerImg.setAlpha(p.inv > 0 && Math.floor(p.inv * 12) % 2 ? .35 : 1);

                // Стрельба: курок — пробел, кнопка мыши или правый палец
                p.cool -= dt;
                const mouse = this.input.mousePointer;
                const firing = K.SPACE.isDown || (mouse && mouse.isDown && !touch) || !!this.fireP;
                if (!firing || p.cool > 0 || this.phase === 'intro' || this.phase === 'won') return;
                p.cool = .14;
                let ax = 0, ay = -1;
                const target = this.fireP || (this.mouseAim && mouse ? mouse.positionToCamera(this.cameras.main) : null);
                if (target) {
                    const tx = target.x - p.x, ty = target.y - p.y, d = Math.hypot(tx, ty);
                    if (d > 8) { ax = tx / d; ay = ty / d; }
                }
                const s = this.pool(this.pShots, 'pshot', 6);
                s.setPosition(p.x + ax * 26, p.y + ay * 26).setRotation(Math.atan2(ay, ax) + Math.PI / 2);
                s.vx = ax * 640;
                s.vy = ay * 640;
                if (this.shots++ % 3 === 0) sfx('zap');
            }

            updateCards(dt) {
                const t = this.boss.t, amp = calm ? 10 : 22;
                this.cards.forEach(card => {
                    if (!card.alive) return;
                    card.c.x = clamp(card.hx + Math.sin(t * .9 + card.ph) * amp, card.w / 2 + 8, W - card.w / 2 - 8);
                    card.c.y = card.hy + Math.cos(t * 1.3 + card.ph) * (calm ? 5 : 12);
                    if (card.flash > 0) { card.flash -= dt; if (card.flash <= 0) this.drawCard(card); }
                });
            }

            updateShots(dt) {
                const b = this.boss, p = this.player;
                const out = s => s.x < -30 || s.x > W + 30 || s.y < -30 || s.y > H + 30;
                for (const s of this.pShots) {
                    if (!s.active) continue;
                    s.x += s.vx * dt;
                    s.y += s.vy * dt;
                    if (out(s)) { s.setActive(false).setVisible(false); continue; }
                    const card = this.phase === 'question' && this.cards.find(c => c.alive && c.c.alpha > .5 &&
                        Math.abs(s.x - c.c.x) < c.w / 2 && Math.abs(s.y - c.c.y) < c.h / 2);
                    if (card) { s.setActive(false).setVisible(false); this.hitCard(card); continue; }
                    const d = Math.hypot(s.x - b.x, s.y - b.y);
                    if (b.shield && d < SHIELD_R) {
                        s.setActive(false).setVisible(false);
                        this.sparks.explode(3, s.x, s.y);
                    } else if (!b.shield && d < BOSS_R) {
                        s.setActive(false).setVisible(false);
                        this.sparks.explode(4, s.x, s.y);
                        this.damage(1);
                        if (this.shots % 2 === 0) sfx('hit');
                    }
                }
                for (const s of this.bShots) {
                    if (!s.active) continue;
                    s.x += s.vx * dt;
                    s.y += s.vy * dt;
                    if (out(s)) { s.setActive(false).setVisible(false); continue; }
                    if (Math.hypot(s.x - p.x, s.y - p.y) < PLAYER_R + s.r) {
                        s.setActive(false).setVisible(false);
                        this.hurt();
                    }
                }
                if (Math.hypot(p.x - b.x, p.y - b.y) < BOSS_R + PLAYER_R) this.hurt();
            }
        }

        game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: o.parent,
            width: W * Z,
            height: H * Z,
            backgroundColor: '#0B0C10',
            scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
            input: { activePointers: 3 },
            audio: { noAudio: true },
            banner: false,
            scene: Fight
        });

        return {
            // Сцена боя — для отладки и автотестов
            get scene() { return game && game.scene.getScene('fight'); },
            destroy() {
                ended = true;
                if (game) game.destroy(true);
                game = null;
            }
        };
    }

    return { load, play };
})();
