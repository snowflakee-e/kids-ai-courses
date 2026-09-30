const app = {
    currentPalette: 'mint',

    init() {
        // Initial Bobik state
        this.updateBobik('bobik-container', 'hello');
        this.updateBobik('bobik-profile', 'neutral');

        // Set default palette
        this.applyPaletteToCSS(this.currentPalette);

        // Interaction: Point to start button
        const startBtn = document.getElementById('start-btn');
        startBtn.onmouseover = () => this.updateBobik('bobik-container', 'point');
        startBtn.onmouseout = () => this.updateBobik('bobik-container', 'hello');
    },

    updateBobik(containerId, stateId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Use the bobik.js function
        container.innerHTML = renderBobik(stateId, PALETTES[this.currentPalette]);
    },

    changeSection(sectionId) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        // Change Bobik's state based on section
        if (sectionId === 'home') {
            this.updateBobik('bobik-container', 'hello');
        } else if (sectionId === 'map') {
            this.updateBobik('bobik-container', 'think');
        } else if (sectionId === 'profile') {
            this.updateBobik('bobik-profile', 'neutral');
        }
    },

    startAdventure() {
        this.updateBobik('bobik-container', 'joy');
        setTimeout(() => {
            this.changeSection('map');
            this.updateBobik('bobik-container', 'run');
        }, 800);
    },

    selectLevel(level) {
        console.log('Selected level:', level);
        // Add logic for level selection here
    },

    setPalette(paletteName) {
        this.currentPalette = paletteName;
        this.applyPaletteToCSS(paletteName);

        // Bobik is surprised by new colors!
        this.updateBobik('bobik-profile', 'surprise');
        setTimeout(() => {
            this.updateBobik('bobik-profile', 'neutral');
        }, 1000);
    },

    applyPaletteToCSS(paletteName) {
        const pal = PALETTES[paletteName];
        const root = document.documentElement;
        root.style.setProperty('--rb-body', pal.body);
        root.style.setProperty('--rb-accent', pal.accent);
        root.style.setProperty('--rb-screen', pal.screen);
        root.style.setProperty('--rb-glow', pal.glow);
        root.style.setProperty('--rb-joint', pal.joint);
    }
};

window.onload = () => app.init();
