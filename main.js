// VALIDIERTE VERSION: Mission Freiheit v1.2 (Final)
// Feature: Deliberation Mode & Preloader Safety Net

class TranscriptSynchronizer {
    constructor(box) {
        this.box = box;
        this.audio = box.querySelector('audio');
        this.transcriptContainer = box.querySelector('.transcript-container');
        if (!this.audio || !this.transcriptContainer) return;
        
        this.toggleBtn = box.querySelector('.transcript-toggle-btn');
        this.cues = Array.from(this.transcriptContainer.querySelectorAll('p[data-start]'));

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
        this.audio.addEventListener('timeupdate', () => this.sync());
        
        this.cues.forEach(cue => {
            cue.addEventListener('click', () => {
                this.audio.currentTime = parseFloat(cue.dataset.start);
                if (this.audio.paused) this.audio.play();
            });
        });
        
        if (this.toggleBtn) this.toggleBtn.textContent = 'Transkript anzeigen';
    }

    toggle() {
        if (!this.transcriptContainer || !this.toggleBtn) return;
        const isHidden = this.transcriptContainer.hidden;
        this.transcriptContainer.hidden = !isHidden;
        this.toggleBtn.setAttribute('aria-expanded', String(isHidden));
        this.toggleBtn.textContent = isHidden ? 'Transkript ausblenden' : 'Transkript anzeigen';
    }

    sync() {
        if (!this.transcriptContainer || this.transcriptContainer.hidden || !this.audio || this.audio.paused) return;
        const time = this.audio.currentTime;
        let activeCue = null;
        
        this.cues.forEach(cue => {
            const start = parseFloat(cue.dataset.start);
            const end = parseFloat(cue.dataset.end || Infinity);
            const isActive = time >= start && time < end;
            cue.classList.toggle('active-cue', isActive);
            if (isActive) activeCue = cue;
        });

        if (activeCue) {
            const container = this.transcriptContainer;
            if (activeCue.offsetTop < container.scrollTop || activeCue.offsetTop + activeCue.offsetHeight > container.scrollTop + container.clientHeight) {
                container.scrollTop = activeCue.offsetTop - (container.clientHeight / 2) + (activeCue.offsetHeight / 2);
            }
        }
    }
}

class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5 + 0.5;
        this.color = '#444444';
        this.selected = false;
        this.preference = Math.random();
    }
    
    update(mode, centers, mouse) {
        // 1. Maus-Interaktion
        if (mouse && mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            const interactionRadius = 100;
            if (distance < interactionRadius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (interactionRadius - distance) / interactionRadius;
                this.vx -= forceDirectionX * force * 0.8;
                this.vy -= forceDirectionY * force * 0.8;
            }
        }

        // 2. Bewegungslogik
        if (mode === 'election') {
            // WAHL: Trennung in Lager
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist > 10) {
                this.vx += (dx / dist) * 0.08; 
                this.vy += (dy / dist) * 0.08;
            }
            this.vx *= 0.92; this.vy *= 0.92;
            this.color = this.preference < 0.5 ? '#ef4444' : '#10b981'; // Rot vs Grün (Updated Colors)

        } else if (mode === 'deliberation') {
            // DELIBERATION: Sanfte Attraktion zur Mitte
            let centerX = this.width / 2;
            let centerY = this.height / 2;
            let dx = centerX - this.x;
            let dy = centerY - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist > 50) {
                this.vx += (dx / dist) * 0.03; 
                this.vy += (dy / dist) * 0.03;
            }
            this.vx *= 0.90; this.vy *= 0.90;

            this.color = '#f59e0b'; // Gold
            this.size = this.selected ? 3.5 : 1.5;

        } else { 
            // LOS
            this.vx += (Math.random() - 0.5) * 0.3;
            this.vy += (Math.random() - 0.5) * 0.3;
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if(speed > 2.5) {
                this.vx = (this.vx/speed)*2.5;
                this.vy = (this.vy/speed)*2.5;
            }
            if (this.selected) {
                this.color = '#10b981'; 
                this.size = 3;
            } else {
                this.color = document.body.classList.contains('light-theme') ? '#94a3b8' : '#334155';
                this.size = 1;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > this.width) { this.x = this.width; this.vx *= -1; }
        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        if (this.y > this.height) { this.y = this.height; this.vy *= -1; }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}


class PhoenixDossier {
    constructor() {
        this.DOM = {
            body: document.body,
            focusPane: document.querySelector('.focus-pane'),
            perfToggle: document.getElementById('perf-toggle'),
            mainTitle: document.getElementById('title-split'),
            subTitle: document.getElementById('subtitle-split'),
            narrativePath: document.querySelector('.narrative-thread-path'),
            navItems: document.querySelectorAll('.bento-nav .nav-item'),
            sections: document.querySelectorAll('.chapter-section'),
            simCanvas: document.getElementById('sim-canvas'),
            simWrapper: document.getElementById('canvas-wrapper'),
            
            simBtnElect: document.getElementById('btn-elect'),
            simBtnSort: document.getElementById('btn-sort'),
            simBtnDelib: document.getElementById('btn-delib'),

            simAnalysisText: document.getElementById('analysis-text'),
            simEntropyMeter: document.getElementById('entropy-meter'),
            readingProgress: document.getElementById('reading-progress'),
            themeToggle: document.getElementById('theme-toggle'),
            metricBar: document.getElementById('metric-bar')
        };

        this.state = { isLowPerfMode: false };
        this.simState = {
            ctx: null, width: 0, height: 0, particles: [], centers: [],
            mode: 'election', animationFrame: null, mouse: { x: null, y: null }
        };

        this.init();
    }

    init() {
        this.setupPerfToggle();
        this.setupAudioPlayers();
        this.setupReadingProgress();
        this.setupThemeToggle();
        
        if (this.DOM.simCanvas && this.DOM.simWrapper) {
            this.setupSimulation();
        }
        
        try {
            if (!this.state.isLowPerfMode && window.gsap && window.ScrollTrigger) {
                this.setupGSAPAnimations();
            } else {
                this.showTitlesFallback();
            }
        } catch (error) {
            console.warn("GSAP Animation Fehler:", error);
            this.showTitlesFallback();
        }
        
        this.setupShareButtons();
        this.generateTakeaways();
        this.setupScrollSpy();
    }

    showTitlesFallback() {
        if(this.DOM.mainTitle) this.DOM.mainTitle.style.opacity = 1;
        if(this.DOM.subTitle) this.DOM.subTitle.style.opacity = 1;
    }
    
    setupReadingProgress() {
        if (!this.DOM.readingProgress) return;
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (docHeight > 0) ? (scrollTop / docHeight) * 100 : 0;
            this.DOM.readingProgress.style.width = `${progress}%`;
        });
    }

    setupThemeToggle() {
        if (!this.DOM.themeToggle) return;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            this.DOM.themeToggle.textContent = '🌙 Dark Mode';
        }
        this.DOM.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            this.DOM.themeToggle.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
        });
    }

    setupAudioPlayers() {
        document.querySelectorAll('.audio-feature-box:not(.sim-controls)').forEach(box => {
            try {
                new TranscriptSynchronizer(box);
                this.setupAudioControls(box);
                if (!this.state.isLowPerfMode && window.innerWidth > 1024) {
                    this.setupAudioVisualizer(box);
                }
            } catch(e) { console.warn("Audio Player Fehler:", e); }
        });
    }
    
    setupAudioControls(box) {
        const audio = box.querySelector('audio');
        const playPauseBtn = box.querySelector('.play-pause-btn');
        if (!audio || !playPauseBtn) return;
        
        const iconPlay = playPauseBtn.querySelector('.icon-play');
        const iconPause = playPauseBtn.querySelector('.icon-pause');
        const progressBar = box.querySelector('.audio-progress-bar');
        const currentTimeEl = box.querySelector('.current-time');
        const skipBtns = box.querySelectorAll('.skip-btn');
        
        const updatePlayPauseIcon = () => {
            const isPaused = audio.paused;
            if(iconPlay) iconPlay.style.display = isPaused ? 'block' : 'none';
            if(iconPause) iconPause.style.display = isPaused ? 'none' : 'block';
            playPauseBtn.setAttribute('aria-label', isPaused ? 'Abspielen' : 'Pausieren');
        };
        
        audio.addEventListener('loadedmetadata', () => {
            if(box.querySelector('.total-time')) box.querySelector('.total-time').textContent = this.formatTime(audio.duration);
        });
        playPauseBtn.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
        audio.addEventListener('play', updatePlayPauseIcon);
        audio.addEventListener('pause', updatePlayPauseIcon);
        audio.addEventListener('ended', () => { audio.currentTime = 0; updatePlayPauseIcon(); });
        audio.addEventListener('timeupdate', () => {
            if (progressBar && audio.duration) progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            if (currentTimeEl) currentTimeEl.textContent = this.formatTime(audio.currentTime);
        });
        
        const progressContainer = box.querySelector('.audio-progress-container');
        if(progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                if(audio.duration) audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
            });
        }

        skipBtns.forEach(btn => btn.addEventListener('click', () => { 
            if(audio.duration) audio.currentTime += parseFloat(btn.dataset.skip); 
        }));
        updatePlayPauseIcon();
    }

    setupAudioVisualizer(box) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        const canvas = box.querySelector('.audio-visualizer');
        const audio = box.querySelector('audio');
        if (!canvas || !audio) return;

        try {
            const ctx = canvas.getContext('2d');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            
            if (!audio.dataset.audioSourceConnected) {
                const source = audioContext.createMediaElementSource(audio);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                audio.dataset.audioSourceConnected = 'true';
            }

            analyser.fftSize = 128;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const draw = () => {
                if (audio.paused || audio.ended) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
                requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const barWidth = (canvas.width / bufferLength);
                let barX = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = dataArray[i] / 2.5;
                    ctx.fillStyle = `rgba(6, 182, 212, ${barHeight / 100})`;
                    ctx.fillRect(barX, canvas.height - barHeight, barWidth, barHeight);
                    barX += barWidth + 1;
                }
            };
            const startVisualizer = () => { if (audioContext.state === 'suspended') audioContext.resume(); draw(); };
            audio.addEventListener('play', startVisualizer);
        } catch(e) { console.warn("Visualizer Error:", e); }
    }

    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    setupPerfToggle() {
        if (!this.DOM.perfToggle) return;
        let isLowPerf = false;
        try { isLowPerf = localStorage.getItem('lowPerfMode') === 'true'; } catch(e){}
        this.state.isLowPerfMode = isLowPerf;
        this.DOM.perfToggle.setAttribute('aria-pressed', String(isLowPerf));
        this.DOM.perfToggle.textContent = isLowPerf ? '💤 Animationen aus' : '✨ Animationen an';
        if (this.DOM.body) this.DOM.body.classList.toggle('low-perf-mode', isLowPerf);
        this.DOM.perfToggle.addEventListener('click', () => {
            this.state.isLowPerfMode = !this.state.isLowPerfMode;
            try { localStorage.setItem('lowPerfMode', String(this.state.isLowPerfMode)); } catch(e){}
            window.location.reload();
        });
    }

    manualSplitText(element) {
        if (!element) return [];
        const originalText = element.textContent;
        element.innerHTML = '';
        const chars = [];
        originalText.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.className = 'char-anim';
            charSpan.style.display = 'inline-block';
            charSpan.textContent = (char === ' ') ? '\u00A0' : char;
            element.appendChild(charSpan);
            chars.push(charSpan);
        });
        return chars;
    }

    setupGSAPAnimations() {
        if (!this.DOM.mainTitle) return;
        gsap.registerPlugin(ScrollTrigger);
        const mainChars = this.manualSplitText(this.DOM.mainTitle);
        const subChars = this.manualSplitText(this.DOM.subTitle);
        gsap.set([this.DOM.mainTitle, this.DOM.subTitle], { opacity: 1 });
        gsap.set(mainChars, { opacity: 0, y: '100%', rotationX: -90, transformOrigin: 'center center -50px' });
        gsap.set(subChars, { opacity: 0, y: '100%' });
        gsap.to(mainChars, { opacity: 1, y: '0%', rotationX: 0, duration: 0.8, ease: 'power3.out', stagger: 0.03, delay: 0.5 });
        gsap.to(subChars, { opacity: 1, y: '0%', duration: 0.5, ease: 'power1.out', stagger: 0.01, delay: 1.0 });
        
        document.querySelectorAll('.chapter-section').forEach(section => {
            const title = section.querySelector('.chapter-title');
            if (title) gsap.from(title, { y: 100, opacity: 0, ease: "power2.out", scrollTrigger: { trigger: section, start: "top 80%", end: "top 20%", scrub: true, toggleActions: "play none none reverse" } });
        });
        
        if (this.DOM.narrativePath && this.DOM.focusPane) {
             try {
                const pathLength = this.DOM.narrativePath.getTotalLength();
                if (pathLength > 0) {
                    this.DOM.narrativePath.style.strokeDasharray = pathLength;
                    this.DOM.narrativePath.style.strokeDashoffset = pathLength;
                    gsap.to(this.DOM.narrativePath, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: this.DOM.focusPane, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true } });
                }
            } catch(e) { console.warn("SVG Error:", e); }
        }

        const finalSection = document.querySelector('.final-actions');
        if (finalSection) {
            const finalCta = finalSection.querySelector('#final-cta');
            const actionCards = document.querySelectorAll('.final-actions-grid > .action-card');
            if(finalCta) gsap.from(finalCta, { scrollTrigger: { trigger: finalSection, start: 'top 80%', toggleActions: 'play none none none' }, opacity: 0, y: 50, duration: 0.8, ease: 'power2.out' });
            if(actionCards.length > 0) gsap.from(actionCards, { scrollTrigger: { trigger: finalSection, start: 'top 70%', toggleActions: 'play none none none' }, opacity: 0, y: 30, duration: 1, stagger: 0.2, ease: 'power2.out' });
        }
    }

    setupScrollSpy() {
        if (!this.DOM.sections.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    const activeNavItem = document.querySelector(`.nav-item[href="#${id}"]`);
                    if (activeNavItem) {
                        this.DOM.navItems.forEach(item => item.classList.remove('active'));
                        activeNavItem.classList.add('active');
                    }
                }
            });
        }, { threshold: 0.3 });
        this.DOM.sections.forEach(section => observer.observe(section));
    }

    setupShareButtons() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        if(document.getElementById('share-email')) document.getElementById('share-email').href = `mailto:?subject=${title}&body=${url}`;
        if(document.getElementById('share-x')) document.getElementById('share-x').href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        if(document.getElementById('share-facebook')) document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    generateTakeaways() {
        const container = document.querySelector('#knowledge-distillate ul');
        if (!container) return;
        container.innerHTML = '';
        document.querySelectorAll('section[data-takeaway]').forEach((section) => {
            if (section.id === 'part0') return;
            const li = document.createElement('li');
            const chapterNumber = section.querySelector('.chapter-number')?.textContent.replace('.', '') || '';
            li.innerHTML = `<strong>Teil ${chapterNumber}:</strong> ${section.dataset.takeaway}`;
            container.appendChild(li);
        });
    }

    setupSimulation() {
        this.simState.ctx = this.DOM.simCanvas.getContext('2d');
        this.resizeSimulation();
        window.addEventListener('resize', () => this.resizeSimulation());

        this.simState.particles = [];
        for(let i=0; i<800; i++) this.simState.particles.push(new Particle(this.simState.width, this.simState.height));
        
        const indices = new Set();
        while(indices.size < 50) indices.add(Math.floor(Math.random() * 800));
        indices.forEach(i => this.simState.particles[i].selected = true);

        if(this.DOM.simBtnElect) this.DOM.simBtnElect.addEventListener('click', () => this.setSimMode('election'));
        if(this.DOM.simBtnSort) this.DOM.simBtnSort.addEventListener('click', () => this.setSimMode('sortition'));
        if(this.DOM.simBtnDelib) this.DOM.simBtnDelib.addEventListener('click', () => this.setSimMode('deliberation'));

        this.DOM.simCanvas.addEventListener('mousemove', (e) => {
            const rect = this.DOM.simCanvas.getBoundingClientRect();
            this.simState.mouse.x = e.clientX - rect.left;
            this.simState.mouse.y = e.clientY - rect.top;
        });
        this.DOM.simCanvas.addEventListener('mouseleave', () => { this.simState.mouse.x = null; this.simState.mouse.y = null; });

        this.loopSimulation();
    }

    resizeSimulation() {
        if (!this.DOM.simWrapper) return;
        this.simState.width = this.DOM.simWrapper.offsetWidth;
        this.simState.height = this.DOM.simWrapper.offsetHeight;
        this.DOM.simCanvas.width = this.simState.width;
        this.DOM.simCanvas.height = this.simState.height;
        this.simState.centers = [{x: this.simState.width * 0.25, y: this.simState.height * 0.5}, {x: this.simState.width * 0.75, y: this.simState.height * 0.5}];
        this.simState.particles.forEach(p => {
            p.width = this.simState.width; p.height = this.simState.height;
        });
    }

    loopSimulation() {
        if (!this.simState.ctx) return;
        
        const isLight = document.body.classList.contains('light-theme');
        this.simState.ctx.fillStyle = isLight ? 'rgba(229, 231, 235, 0.25)' : 'rgba(5, 5, 5, 0.15)';
        this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);

        this.simState.particles.forEach(p => {
            p.update(this.simState.mode, this.simState.centers, this.simState.mouse);
            p.draw(this.simState.ctx);
        });

        if(this.simState.mode === 'election') {
            this.simState.centers.forEach((center, i) => {
                this.simState.ctx.beginPath();
                this.simState.ctx.arc(center.x, center.y, 6, 0, Math.PI*2);
                this.simState.ctx.fillStyle = i === 0 ? '#ef4444' : '#10b981';
                this.simState.ctx.fill();
            });
        }
        this.simState.animationFrame = requestAnimationFrame(() => this.loopSimulation());
    }

    setSimMode(newMode) {
        if (this.simState.mode === newMode) return;
        this.simState.mode = newMode;

        const alertSpan = `<span style="color: var(--alert);">Gravitationszentren</span>`;
        const logicSpan = `<span style="color: var(--logic);">Querschnitt</span>`;
        const delibSpan = `<span style="color: var(--delib);">Konsens</span>`;

        [this.DOM.simBtnElect, this.DOM.simBtnSort, this.DOM.simBtnDelib].forEach(btn => {
            if(btn) btn.classList.remove('active-mode');
        });

        if (newMode === 'election') {
            this.DOM.simBtnElect.classList.add('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Das Wahlsystem erzeugt ${alertSpan} (Parteien). Die Gesellschaft polarisiert sich.`;
            this.DOM.simEntropyMeter.textContent = "POLARIZED";
            this.DOM.simEntropyMeter.style.color = "var(--alert)";
            if(this.DOM.metricBar) { this.DOM.metricBar.style.width = "90%"; this.DOM.metricBar.style.backgroundColor = "var(--alert)"; }
        } else if (newMode === 'sortition') { 
            this.DOM.simBtnSort.classList.add('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Zufallsauswahl durchbricht die Blasen. Ein ${logicSpan} der Bevölkerung bildet sich.`;
            this.DOM.simEntropyMeter.textContent = "MIXED";
            this.DOM.simEntropyMeter.style.color = "var(--logic)";
            if(this.DOM.metricBar) { this.DOM.metricBar.style.width = "50%"; this.DOM.metricBar.style.backgroundColor = "var(--logic)"; }
        } else if (newMode === 'deliberation') {
            this.DOM.simBtnDelib.classList.add('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Die Beratung führt zu ${delibSpan}. Gemeinsame Lösungen entstehen.`;
            this.DOM.simEntropyMeter.textContent = "UNIFIED";
            this.DOM.simEntropyMeter.style.color = "var(--delib)";
            if(this.DOM.metricBar) { this.DOM.metricBar.style.width = "10%"; this.DOM.metricBar.style.backgroundColor = "var(--delib)"; }
        }
    }
}

// === INITIALISIERUNG ===
window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const removePreloader = () => { if (preloader) preloader.style.display = 'none'; };

    if (preloader) {
        preloader.classList.add('hidden');
        preloader.addEventListener('transitionend', removePreloader, { once: true });
        setTimeout(removePreloader, 600); // Safety Net
    }

    try { window.dossier = new PhoenixDossier(); } 
    catch (e) { console.error("Startfehler:", e); removePreloader(); }
});
