const app = {
    currentPalette: 'mint',

    // Mock User Data for Personal Cabinet
    userData: {
        name: "Super Student",
        progress: 45,
        courses: [
            { id: 'intro-ai', title: 'AI Basics', locked: false, completed: true, desc: 'Welcome to the world of AI!' },
            { id: 'prompt-eng', title: 'Prompt Engineering', locked: false, completed: false, desc: 'Learn to talk to AI.' },
            { id: 'ai-art', title: 'AI Art Mastery', locked: true, completed: false, desc: 'Create magic images.' },
            { id: 'agent-build', title: 'Build Your Agent', locked: true, completed: false, desc: 'Create your own helper.' },
        ]
    },

    init() {
        this.updateBobik('header-bloop', 'hello');
        this.updateBobik('bloop-container', 'hello');
        this.updateBobik('bloop-profile', 'neutral');
        this.applyPaletteToCSS(this.currentPalette);
        this.renderCourseMap();
        this.updateProfile();

        const startBtn = document.getElementById('start-btn');
        startBtn.onmouseover = () => this.updateBobik('bloop-container', 'point');
        startBtn.onmouseout = () => this.updateBobik('bloop-container', 'hello');
    },

    updateBobik(containerId, stateId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // To make animations smooth, we use a fade transition
        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = renderBobik(stateId, PALETTES[this.currentPalette]);
            container.style.opacity = '1';
        }, 150);
    },

    changeSection(sectionId) {
        const currentSection = document.querySelector('.section.active');
        const targetSection = document.getElementById(sectionId);

        // Smooth transition: fade out -> change -> fade in
        currentSection.style.opacity = '0';
        currentSection.style.transform = 'translateY(10px)';

        setTimeout(() => {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            targetSection.classList.add('active');

            // Update active state in menu
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('onclick').includes(`'${sectionId}'`)) {
                    item.classList.add('active');
                }
            });

            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 300);

        if (sectionId === 'home') {
            this.updateBobik('bloop-container', 'hello');
        } else if (sectionId === 'map') {
            this.updateBobik('bloop-container', 'think');
        } else if (sectionId === 'profile') {
            this.updateBobik('bloop-profile', 'neutral');
        }
    },

    startAdventure() {
        this.updateBobik('bloop-container', 'joy');
        setTimeout(() => {
            this.changeSection('map');
            this.updateBobik('bloop-container', 'run');
        }, 800);
    },

    renderCourseMap() {
        const grid = document.getElementById('course-grid');
        if (!grid) return;

        grid.innerHTML = this.userData.courses.map(course => `
            <div class="course-card ${course.locked ? 'locked' : 'unlocked'}" onclick="app.selectCourse('${course.id}')">
                <div class="course-status ${course.completed ? 'status-completed' : (course.locked ? 'status-locked' : 'status-available')}">
                    ${course.completed ? '✅ Completed' : (course.locked ? '🔒 Locked' : '🚀 Available')}
                </div>
                <h3>${course.title}</h3>
                <p>${course.desc}</p>
            </div>
        `).join('');
    },

    selectCourse(courseId) {
        const course = this.userData.courses.find(c => c.id === courseId);
        if (course && !course.locked) {
            alert(`Starting ${course.title}! Get ready for some AI magic!`);
        } else if (course && course.locked) {
            alert('This course is still locked. Complete previous lessons first!');
        }
    },

    updateProfile() {
        document.getElementById('user-name').innerText = this.userData.name;
        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');

        fill.style.width = `${this.userData.progress}%`;
        text.innerText = `${this.userData.progress}% Complete`;
    },

    setPalette(paletteName) {
        this.currentPalette = paletteName;
        this.applyPaletteToCSS(paletteName);
        this.updateBobik('bloop-profile', 'surprise');
        setTimeout(() => {
            this.updateBobik('bloop-profile', 'neutral');
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
