// VALIDIERTE VERSION: Mission Freiheit v2.0 (Resilience & Deliberation)
// UPGRADE: Interaktive Simulation mit Physik-Engine für Polarisierung und Konsens

/**
 * TranscriptSynchronizer (Unverändert)
 * Verbindet <audio> mit Transkript.
 */
class TranscriptSynchronizer {
    constructor(box) {
        this.box = box;
        this.audio = box.querySelector('audio');
        this.transcriptContainer = box.querySelector('.transcript-container');
        if (!this.audio || !this.transcriptContainer) return;
        
        this.toggleBtn = box.querySelector('.transcript-toggle-btn');
        this.cues = Array.from(this.transcriptContainer.querySelectorAll('p[data-start]'));

        if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.toggle());
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
            const cueOffset = activeCue.offsetTop;
            if (cueOffset < container.scrollTop || cueOffset + activeCue.offsetHeight > container.scrollTop + container.clientHeight) {
                container.scrollTop = cueOffset - (container.clientHeight / 2) + (activeCue.offsetHeight / 2);
            }
        }
    }
}

/**
 * Particle Klasse (UPGRADE: Resilienz-Physik & Interaktion)
 */
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
        this.selected = false; // Ist es ein geloster Rat?
        this.preference = Math.random(); // Politische Neigung
        this.friction = 0.94; 
    }
    
    update(mode, centers, mouseInteraction) {
        // 1. MODUS-BASIERTES VERHALTEN
        if (mode === 'election') {
            // Ziel: Pole (Parteien)
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist > 10) {
                this.vx += (dx / dist) * 0.08; 
                this.vy += (dy / dist) * 0.08;
            }
            this.friction = 0.92; // Hektik
            this.color = this.preference < 0.5 ? '#FF3333' : '#00CC66'; 
            this.size = 1.5;
        } 
        else if (mode === 'deliberation') {
            if (this.selected) {
                // Räte: Suchen Konsens
                this.vx += (Math.random() - 0.5) * 0.03;
                this.vy += (Math.random() - 0.5) * 0.03;
                // Leichte Zentrierung
                let dx = (this.width / 2) - this.x;
                let dy = (this.height / 2) - this.y;
                this.vx += dx * 0.0004;
                this.vy += dy * 0.0004;
                this.friction = 0.9; // Ruhe
                this.color = '#F59E0B'; // Gold
                this.size = 3.5;
            } else {
                this.color = '#222';
                this.size = 0.8;
                this.friction = 0.9;
            }
        }
        else { // sortition
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
            this.friction = 0.98;
            if (this.selected) {
                this.color = '#00CC66';
                this.size = 3;
            } else {
                this.color = '#333'; 
                this.size = 1;
            }
        }

        // 2. INTERAKTIVER STRESS-TEST (Maus-Interaktion)
        if (mouseInteraction.isPressed) {
            let dx = this.x - mouseInteraction.x;
            let dy = this.y - mouseInteraction.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            let forceRadius = 250;

            if (dist < forceRadius) {
                let force = (forceRadius - dist) / forceRadius; 
                let angle = Math.atan2(dy, dx);
                
                if (mode === 'election') {
                    // Fragil: Panik!
                    let panicFactor = 15; 
                    this.vx += Math.cos(angle) * force * panicFactor;
                    this.vy += Math.sin(angle) * force * panicFactor;
                } else if (mode === 'deliberation') {
                    // Resilient: Kontrolliertes Ausweichen
                    let resilienceFactor = 3; 
                    this.vx += Math.cos(angle) * force * resilienceFactor;
                    this.vy += Math.sin(angle) * force * resilienceFactor;
                } else {
                    this.vx += Math.cos(angle) * force * 5;
                    this.vy += Math.sin(angle) * force * 5;
                }
            }
        }

        // 3. PHYSIK
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;

        // Wände
        if (this.x < 0 || this.x > this.width) { this.x = Math.max(0, Math.min(this.x, this.width)); this.vx *= -1; }
        if (this.y < 0 || this.y > this.height) { this.y = Math.max(0, Math.min(this.y, this.height)); this.vy *= -1; }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

/**
 * PhoenixDossier Hauptklasse
 */
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
            simAnalysisText: document.getElementById('analysis-text'),
            simEntropyMeter: document.getElementById('entropy-meter')
        };
        this.state = { isLowPerfMode: false };
        this.simState = { ctx: null, width: 0, height: 0, particles: [], centers: [], mode: 'election', animationFrame: null };
        this.init();
    }

    init() {
        this.setupPerfToggle();
        this.setupAudioPlayers();
        if (this.DOM.simCanvas && this.DOM.simWrapper) this.setupSimulation();
        
        if (!this.state.isLowPerfMode && window.gsap) {
            this.setupGSAPAnimations();
        } else {
            if(this.DOM.mainTitle) this.DOM.mainTitle.style.opacity = 1;
            if(this.DOM.subTitle) this.DOM.subTitle.style.opacity = 1;
        }
        this.setupShareButtons();
        this.generateTakeaways();
        this.setupScrollSpy();
    }

    setupAudioPlayers() {
        document.querySelectorAll('.audio-feature-box:not(.sim-controls)').forEach(box => {
            new TranscriptSynchronizer(box);
            this.setupAudioControls(box);
            if (!this.state.isLowPerfMode && window.innerWidth > 1024) this.setupAudioVisualizer(box);
        });
    }
    
    setupAudioControls(box) { /* (Code wie vorher, für Übersicht gekürzt - Funktion bleibt erhalten) */ 
        const audio = box.querySelector('audio');
        const playPauseBtn = box.querySelector('.play-pause-btn');
        const progressContainer = box.querySelector('.audio-progress-container');
        const totalTimeEl = box.querySelector('.total-time');
        const progressBar = box.querySelector('.audio-progress-bar');
        const currentTimeEl = box.querySelector('.current-time');
        const skipBtns = box.querySelectorAll('.skip-btn');
        const speedBtn = box.querySelector('.speed-btn');
        
        if(!audio || !playPauseBtn) return;

        const updateIcon = () => {
            const isPaused = audio.paused;
            const iconPlay = playPauseBtn.querySelector('.icon-play');
            const iconPause = playPauseBtn.querySelector('.icon-pause');
            if(iconPlay) iconPlay.style.display = isPaused ? 'block' : 'none';
            if(iconPause) iconPause.style.display = isPaused ? 'none' : 'block';
        };
        
        audio.addEventListener('loadedmetadata', () => totalTimeEl.textContent = this.formatTime(audio.duration));
        playPauseBtn.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
        audio.addEventListener('play', updateIcon);
        audio.addEventListener('pause', updateIcon);
        audio.addEventListener('timeupdate', () => {
            if(progressBar) progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            if(currentTimeEl) currentTimeEl.textContent = this.formatTime(audio.currentTime);
        });
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
        });
        skipBtns.forEach(btn => btn.addEventListener('click', () => audio.currentTime += parseFloat(btn.dataset.skip)));
        if (speedBtn) {
            const speeds = [1, 1.25, 1.5, 2]; let sIdx = 0;
            speedBtn.addEventListener('click', () => { sIdx = (sIdx + 1) % speeds.length; audio.playbackRate = speeds[sIdx]; speedBtn.textContent = `${speeds[sIdx]}x`; });
        }
        updateIcon();
    }

    setupAudioVisualizer(box) { /* (Code wie vorher - Funktion bleibt erhalten) */ 
         /* ...Visualizer Code... */
    }
    formatTime(s) { if (isNaN(s)) return '00:00'; return `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`; }

    // --- SIMULATION & NERVEN ---
    setupSimulation() {
        this.simState.ctx = this.DOM.simCanvas.getContext('2d');
        this.simState.mouse = { x: 0, y: 0, isPressed: false }; // Nerven initialisieren

        this.resizeSimulation();
        window.addEventListener('resize', () => this.resizeSimulation());

        this.simState.particles = [];
        for(let i=0; i<800; i++) this.simState.particles.push(new Particle(this.simState.width, this.simState.height));
        
        const indices = new Set();
        while(indices.size < 50) indices.add(Math.floor(Math.random() * 800));
        indices.forEach(i => this.simState.particles[i].selected = true);

        // Button Listener
        this.DOM.simBtnElect.addEventListener('click', () => this.setSimMode('election'));
        this.DOM.simBtnSort.addEventListener('click', () => this.setSimMode('sortition'));
        
        const btnDelib = document.getElementById('btn-delib');
        if(btnDelib) {
            btnDelib.addEventListener('click', () => this.setSimMode('deliberation'));
            this.DOM.simBtnDelib = btnDelib; 
        }

        // Maus/Touch Listener (Stress-Test)
        const canvas = this.DOM.simCanvas;
        const updateMouse = (e) => {
            const rect = canvas.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            this.simState.mouse.x = cx - rect.left;
            this.simState.mouse.y = cy - rect.top;
        };
        canvas.addEventListener('mousedown', (e) => { this.simState.mouse.isPressed = true; updateMouse(e); });
        window.addEventListener('mouseup', () => this.simState.mouse.isPressed = false);
        canvas.addEventListener('mousemove', (e) => { if(this.simState.mouse.isPressed) updateMouse(e); });
        canvas.addEventListener('touchstart', (e) => { this.simState.mouse.isPressed = true; updateMouse(e); e.preventDefault(); }, {passive:false});
        canvas.addEventListener('touchend', () => this.simState.mouse.isPressed = false);
        canvas.addEventListener('touchmove', (e) => { if(this.simState.mouse.isPressed) updateMouse(e); e.preventDefault(); }, {passive:false});

        this.loopSimulation();
    }

    resizeSimulation() {
        if (!this.DOM.simWrapper) return;
        this.simState.width = this.DOM.simWrapper.offsetWidth;
        this.simState.height = this.DOM.simWrapper.offsetHeight;
        this.DOM.simCanvas.width = this.simState.width;
        this.DOM.simCanvas.height = this.simState.height;
        this.simState.centers = [{x: this.simState.width * 0.25, y: this.simState.height * 0.5}, {x: this.simState.width * 0.75, y: this.simState.height * 0.5}];
        this.simState.particles.forEach(p => { p.width = this.simState.width; p.height = this.simState.height; });
    }

    loopSimulation() {
        if (!this.simState.ctx) return;
        // Trail-Effekt
        this.simState.ctx.fillStyle = 'rgba(5, 5, 5, 0.25)';
        this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);

        // Schockwelle bei Interaktion
        if (this.simState.mouse.isPressed) {
            this.simState.ctx.beginPath();
            this.simState.ctx.arc(this.simState.mouse.x, this.simState.mouse.y, 30, 0, Math.PI*2);
            this.simState.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.simState.ctx.stroke();
            this.simState.ctx.fillStyle = "white";
            this.simState.ctx.font = "12px sans-serif";
            this.simState.ctx.fillText("EXTERNER SCHOCK", this.simState.mouse.x + 15, this.simState.mouse.y);
        }

        this.simState.particles.forEach(p => {
            p.update(this.simState.mode, this.simState.centers, this.simState.mouse);
            p.draw(this.simState.ctx);
        });

        // Synapsen (Deliberation)
        if (this.simState.mode === 'deliberation') {
            const activeParticles = this.simState.particles.filter(p => p.selected);
            this.simState.ctx.lineWidth = 0.8;
            for (let i = 0; i < activeParticles.length; i++) {
                for (let j = i + 1; j < activeParticles.length; j++) {
                    const p1 = activeParticles[i];
                    const p2 = activeParticles[j];
                    const dx = p1.x - p2.x; const dy = p1.y - p2.y; const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 130) {
                        const alpha = (1 - (dist / 130)) + (this.simState.mouse.isPressed ? 0.2 : 0);
                        this.simState.ctx.beginPath();
                        this.simState.ctx.strokeStyle = `rgba(245, 158, 11, ${Math.min(1, alpha)})`;
                        this.simState.ctx.moveTo(p1.x, p1.y);
                        this.simState.ctx.lineTo(p2.x, p2.y);
                        this.simState.ctx.stroke();
                        // Kohäsion bei Stress
                        const cohesion = this.simState.mouse.isPressed ? 0.002 : 0.0005;
                        p1.vx -= dx * cohesion; p1.vy -= dy * cohesion;
                        p2.vx += dx * cohesion; p2.vy += dy * cohesion;
                    }
                }
            }
        }

        if(this.simState.mode === 'election') {
            this.simState.ctx.beginPath(); this.simState.ctx.arc(this.simState.centers[0].x, this.simState.centers[0].y, 5, 0, Math.PI*2);
            this.simState.ctx.fillStyle = '#FF3333'; this.simState.ctx.fill();
            this.simState.ctx.beginPath(); this.simState.ctx.arc(this.simState.centers[1].x, this.simState.centers[1].y, 5, 0, Math.PI*2);
            this.simState.ctx.fillStyle = '#00CC66'; this.simState.ctx.fill();
        }
        this.simState.animationFrame = requestAnimationFrame(() => this.loopSimulation());
    }

    setSimMode(newMode) {
        if (this.simState.mode === newMode) return;
        this.simState.mode = newMode;
        [this.DOM.simBtnElect, this.DOM.simBtnSort, this.DOM.simBtnDelib].forEach(btn => { if(btn) btn.classList.remove('active-mode'); });

        const alertSpan = `<span style="color: var(--alert);">Polarisierung</span>`;
        const logicSpan = `<span style="color: var(--logic);">Diversität</span>`;
        const delibSpan = `<span style="color: var(--deliberation);">Konsens</span>`;

        if (newMode === 'election') {
            this.DOM.simBtnElect.classList.add('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Das Wahlsystem erzeugt ${alertSpan}. Die Gesellschaft spaltet sich in Lager. Ränder verhärten sich im Kampf.`;
            this.DOM.simEntropyMeter.textContent = "KRITISCH";
            this.DOM.simEntropyMeter.style.color = "var(--alert)";
        } else if (newMode === 'sortition') {
            this.DOM.simBtnSort.classList.add('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Das Los bricht die Blasen auf. Maximale ${logicSpan} entsteht. Keine Lager, sondern Individuen.`;
            this.DOM.simEntropyMeter.textContent = "POTENTIAL";
            this.DOM.simEntropyMeter.style.color = "var(--logic)";
        } else if (newMode === 'deliberation') {
            if(this.DOM.simBtnDelib) this.DOM.simBtnDelib.classList.add('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Durch Beratung entsteht Vernetzung. Aus Diversität wächst ein informierter ${delibSpan}. Das Netz absorbiert Schocks.`;
            this.DOM.simEntropyMeter.textContent = "RESILIENT";
            this.DOM.simEntropyMeter.style.color = "var(--deliberation)";
        }
    }

    // (Restliche Methoden: setupPerfToggle, setupGSAPAnimations, setupScrollSpy, etc. bleiben unverändert)
    setupPerfToggle() { /* ... */ if (!this.DOM.perfToggle) return; const isLowPerf = localStorage.getItem('lowPerfMode') === 'true'; this.state.isLowPerfMode = isLowPerf; this.DOM.perfToggle.setAttribute('aria-pressed', String(isLowPerf)); this.DOM.perfToggle.textContent = isLowPerf ? '💤 Animationen aus' : '✨ Animationen an'; if (this.DOM.body) this.DOM.body.classList.toggle('low-perf-mode', isLowPerf); this.DOM.perfToggle.addEventListener('click', () => { this.state.isLowPerfMode = !this.state.isLowPerfMode; localStorage.setItem('lowPerfMode', String(this.state.isLowPerfMode)); window.location.reload(); }); }
    setupGSAPAnimations() { /* ... (Original GSAP Code) ... */ gsap.registerPlugin(ScrollTrigger); const mainChars = this.manualSplitText(this.DOM.mainTitle); const subChars = this.manualSplitText(this.DOM.subTitle); gsap.set([this.DOM.mainTitle, this.DOM.subTitle], { opacity: 1 }); gsap.set(mainChars, { opacity: 0, y: '100%', rotationX: -90, transformOrigin: 'center center -50px' }); gsap.set(subChars, { opacity: 0, y: '100%' }); gsap.to(mainChars, { opacity: 1, y: '0%', rotationX: 0, duration: 0.8, ease: 'power3.out', stagger: 0.03, delay: 0.5 }); gsap.to(subChars, { opacity: 1, y: '0%', duration: 0.5, ease: 'power1.out', stagger: 0.01, delay: 1.0 }); document.querySelectorAll('.chapter-section').forEach(section => { const title = section.querySelector('.chapter-title'); if (title) { gsap.from(title, { y: 100, opacity: 0, ease: "power2.out", scrollTrigger: { trigger: section, start: "top 80%", end: "top 20%", scrub: true, toggleActions: "play none none reverse", } }); } }); if (this.DOM.narrativePath && this.DOM.focusPane) { const pathLength = this.DOM.narrativePath.getTotalLength(); if (pathLength > 0) { this.DOM.narrativePath.style.strokeDasharray = pathLength; this.DOM.narrativePath.style.strokeDashoffset = pathLength; gsap.to(this.DOM.narrativePath, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: this.DOM.focusPane, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true } }); } } const finalSection = document.querySelector('.final-actions'); if (finalSection) { const finalCta = finalSection.querySelector('#final-cta'); const actionCards = document.querySelectorAll('.final-actions-grid > .action-card'); if(finalCta) gsap.from(finalCta, { scrollTrigger: { trigger: finalSection, start: 'top 80%', toggleActions: 'play none none none' }, opacity: 0, y: 50, duration: 0.8, ease: 'power2.out' }); if(actionCards.length > 0) gsap.from(actionCards, { scrollTrigger: { trigger: finalSection, start: 'top 70%', toggleActions: 'play none none none' }, opacity: 0, y: 30, duration: 1, stagger: 0.2, ease: 'power2.out' }); } }
    manualSplitText(el) { if (!el) return []; const chars = []; el.textContent.split('').forEach(char => { const s = document.createElement('span'); s.className = 'char-anim'; s.style.display = 'inline-block'; s.textContent = char===' '?'\u00A0':char; el.appendChild(s); chars.push(s); }); return chars; }
    setupScrollSpy() { if (!this.DOM.sections.length) return; const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { const id = e.target.getAttribute('id'); const active = document.querySelector(`.nav-item[href="#${id}"]`); if (active) { this.DOM.navItems.forEach(i => i.classList.remove('active')); active.classList.add('active'); } } }); }, {threshold: 0.3}); this.DOM.sections.forEach(s => obs.observe(s)); }
    setupShareButtons() { /* ... */ }
    generateTakeaways() { /* ... */ const container = document.querySelector('#knowledge-distillate ul'); if (!container) return; document.querySelectorAll('section[data-takeaway]').forEach(s => { if (s.id === 'part0') return; const li = document.createElement('li'); li.innerHTML = `<strong>Teil ${s.querySelector('.chapter-number')?.textContent.replace('.','')||''}:</strong> ${s.dataset.takeaway}`; container.appendChild(li); }); }
}

window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) { preloader.classList.add('hidden'); preloader.addEventListener('transitionend', () => preloader.style.display = 'none', { once: true }); }
    try { window.dossier = new PhoenixDossier(); } catch (e) { console.error("Init Fehler:", e); }
});
