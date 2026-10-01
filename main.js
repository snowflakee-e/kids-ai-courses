const app = {
    currentPalette: 'mint',
    isLoggedIn: false,

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
        this.renderHomeCourses();
        this.renderProfileCourses();
        this.updateProfile();

        // Start button interaction
        const startBtn = document.getElementById('start-btn');
        if(startBtn) {
            startBtn.onmouseover = () => this.updateBobik('bloop-container', 'point');
            startBtn.onmouseout = () => this.updateBobik('bloop-container', 'hello');
        }
    },

    toggleAuth() {
        this.isLoggedIn = !this.isLoggedIn;
        const btn = document.getElementById('auth-btn');
        const text = btn.querySelector('.auth-text');
        const icon = btn.querySelector('.auth-icon');

        if (this.isLoggedIn) {
            text.innerText = 'Logout';
            icon.innerText = '🚪';
            this.changeSection('profile'); // Go to cabinet after login
        } else {
            text.innerText = 'Login';
            icon.innerText = '🔑';
            this.changeSection('home');
        }
    },

    updateBobik(containerId, stateId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = renderBobik(stateId, PALETTES[this.currentPalette]);
            container.style.opacity = '1';
        }, 150);
    },

    changeSection(sectionId) {
        const currentSection = document.querySelector('.section.active');
        const targetSection = document.getElementById(sectionId);

        if (!currentSection || !targetSection) return;

        currentSection.style.opacity = '0';
        currentSection.style.transform = 'translateY(10px)';

        setTimeout(() => {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            targetSection.classList.add('active');

            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 300);

        // Update mascot state based on section
        if (sectionId === 'home') {
            this.updateBobik('bloop-container', 'hello');
        } else if (sectionId === 'map') {
            this.updateBobik('bloop-container', 'think');
        } else if (sectionId === 'profile') {
            this.updateBobik('bloop-profile', 'neutral');
        }
    },

    renderHomeCourses() {
        const list = document.getElementById('home-course-list');
        if (!list) return;

        list.innerHTML = this.userData.courses.map(course => `
            <div class="home-course-item" onclick="app.selectCourse('${course.id}')">
                <div class="course-info">
                    <h4>${course.title}</h4>
                    <p>${course.desc}</p>
                </div>
                <div class="course-action">${course.locked ? '🔒' : '🚀 Start'}</div>
            </div>
        `).join('');
    },

    renderProfileCourses() {
        const grid = document.getElementById('profile-course-grid');
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
