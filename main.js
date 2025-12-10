// MISSION FREIHEIT V2.3 (High Gloss & Interactive)

/**
 * 3D Tilt Effect Controller
 * Verleiht Karten einen hochwertigen, interaktiven 3D-Effekt bei Mausbewegung.
 * Läuft ohne externe Libraries.
 */
class TiltController {
    constructor() {
        this.cards = document.querySelectorAll('.tilt-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMove(e, card));
            card.addEventListener('mouseleave', () => this.handleLeave(card));
        });
    }

    handleMove(e, card) {
        const rect = card.getBoundingClientRect();
        // Berechne Mausposition relativ zur Kartenmitte
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Berechne Rotation (max 5 Grad für subtilen Effekt)
        const rotateX = ((y - centerY) / centerY) * -3; 
        const rotateY = ((x - centerX) / centerX) * 3;

        // Anwenden der Transformation
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Dynamischer Lichteffekt (Spotlight)
        // Wir nutzen background-image, um einen radialen Gradienten zu verschieben
        card.style.backgroundImage = `
            radial-gradient(
                circle at ${x}px ${y}px, 
                rgba(255, 255, 255, 0.07) 0%, 
                rgba(255, 255, 255, 0) 80%
            )
        `;
    }

    handleLeave(card) {
        // Reset Position & Licht
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        card.style.backgroundImage = 'none';
    }
}

/**
 * TranscriptSynchronizer
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
    }

    toggle() {
        const isHidden = this.transcriptContainer.hidden;
        this.transcriptContainer.hidden = !isHidden;
        this.toggleBtn.textContent = isHidden ? 'Transkript anzeigen' : 'Transkript schließen';
        if(isHidden) setTimeout(() => this.transcriptContainer.scrollIntoView({behavior: "smooth", block: "center"}), 100);
    }

    sync() {
        if (this.transcriptContainer.hidden || this.audio.paused) return;
        const time = this.audio.currentTime;
        let activeCue = null;
        
        this.cues.forEach(cue => {
            const start = parseFloat(cue.dataset.start);
            const end = parseFloat(cue.dataset.end || Infinity);
            const isActive = time >= start && time < end;
            cue.classList.toggle('active-cue', isActive);
            if (isActive) activeCue = cue;
        });

        if (activeCue) activeCue.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

/**
 * Particle Simulation
 */
class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        
        this.currentSize = 1;
        this.targetSize = 1;
        this.currentColor = 'rgba(241, 245, 249, 0.3)';
        this.preference = Math.random(); 
        this.selected = false; 
    }
    
    update(mode, centers) {
        if (mode === 'election') {
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist > 10) {
                this.vx += (dx / dist) * 0.05;
                this.vy += (dy / dist) * 0.05;
            }
            // Vortex
            let angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle + Math.PI/2) * 0.02;
            this.vy += Math.sin(angle + Math.PI/2) * 0.02;

            this.vx *= 0.95;
            this.vy *= 0.95;
            
            this.currentColor = this.preference < 0.5 ? '#fb7185' : '#4ade80'; 
            this.targetSize = 2;
        } else { 
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
            
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if(speed > 2) {
                this.vx = (this.vx/speed)*2;
                this.vy = (this.vy/speed)*2;
            }

            if (this.selected) {
                this.currentColor = '#22d3ee'; 
                this.targetSize = 5; 
            } else {
                this.currentColor = 'rgba(241, 245, 249, 0.2)'; 
                this.targetSize = 1;
            }
        }
        
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > this.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.height) this.vy *= -1;

        this.currentSize += (this.targetSize - this.currentSize) * 0.1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = this.currentColor;
        if(this.selected && this.currentSize > 2) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.currentColor;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

/**
 * PhoenixDossier Controller
 */
class PhoenixDossier {
    constructor() {
        this.DOM = {
            body: document.body,
            perfToggle: document.getElementById('perf-toggle'),
            simCanvas: document.getElementById('sim-canvas'),
            simWrapper: document.getElementById('canvas-wrapper'),
            simBtnElect: document.getElementById('btn-elect'),
            simBtnSort: document.getElementById('btn-sort'),
            simAnalysisText: document.getElementById('analysis-text'),
            simEntropyMeter: document.getElementById('entropy-meter')
        };

        this.state = { isLowPerfMode: false };
        this.simState = {
            ctx: null, width: 0, height: 0,
            particles: [], centers: [], 
            mode: 'election', 
            lastRotation: 0, rotationInterval: 2500,
            animationFrame: null
        };

        this.init();
    }

    init() {
        this.setupPerfToggle();
        this.setupAudioPlayers();
        this.setupShareButtons();
        
        if (this.DOM.simCanvas && this.DOM.simWrapper) this.setupSimulation();
        
        // Tilt Effect initialisieren (wenn nicht low perf)
        if(!this.state.isLowPerfMode) new TiltController();

        if (!this.state.isLowPerfMode && window.gsap && window.ScrollTrigger) this.setupGSAP();
        
        this.generateTakeaways();
        this.setupScrollSpy();
        
        const preloader = document.getElementById('preloader');
        if(preloader) setTimeout(() => preloader.classList.add('hidden'), 800);
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
    
    setupGSAP() {
        gsap.registerPlugin(ScrollTrigger);
        
        const mainTitle = document.getElementById('title-split');
        if(mainTitle) {
            const chars = this.manualSplitText(mainTitle);
            gsap.set(mainTitle, { opacity: 1 });
            gsap.set(chars, { opacity: 0, y: '100%', rotationX: -90, transformOrigin: 'center center -50px' });
            gsap.to(chars, { opacity: 1, y: '0%', rotationX: 0, duration: 1.2, ease: 'back.out(1.7)', stagger: 0.05, delay: 0.5 });
        }
        
        document.querySelectorAll('.chapter-section').forEach(section => {
            // Animiert Elemente innerhalb der Sektion gestaffelt
            const elements = section.querySelectorAll('h2, .audio-feature-box, p, .highlight-box');
            if(elements.length > 0) {
                gsap.from(elements, {
                    y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out",
                    scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none reverse" }
                });
            }
        });
    }

    setupShareButtons() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        
        const emailBtn = document.getElementById('share-email');
        if (emailBtn) emailBtn.href = `mailto:?subject=${title}&body=Schau dir dieses Dossier an: ${url}`;
        
        const xBtn = document.getElementById('share-x');
        if (xBtn) xBtn.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;

        const facebookBtn = document.getElementById('share-facebook');
        if (facebookBtn) facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    setupAudioPlayers() {
        document.querySelectorAll('.audio-feature-box').forEach(box => {
            new TranscriptSynchronizer(box);
            const audio = box.querySelector('audio');
            const playBtn = box.querySelector('.play-pause-btn');
            const progressBar = box.querySelector('.audio-progress-bar');
            const timeDisplay = box.querySelector('.current-time');
            const totalTimeDisplay = box.querySelector('.total-time');
            const progressContainer = box.querySelector('.audio-progress-container');
            const skipBtns = box.querySelectorAll('.skip-btn');

            if(!audio || !playBtn) return;

            const iconPlay = playBtn.querySelector('.icon-play');
            const iconPause = playBtn.querySelector('.icon-pause');

            const updateIcons = () => {
                if(iconPlay) iconPlay.style.display = audio.paused ? 'block' : 'none';
                if(iconPause) iconPause.style.display = audio.paused ? 'none' : 'block';
            };

            playBtn.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
            skipBtns.forEach(btn => btn.addEventListener('click', () => audio.currentTime += parseFloat(btn.dataset.skip)));

            audio.addEventListener('play', updateIcons);
            audio.addEventListener('pause', updateIcons);
            audio.addEventListener('loadedmetadata', () => { if(totalTimeDisplay) totalTimeDisplay.textContent = this.formatTime(audio.duration); });
            audio.addEventListener('timeupdate', () => {
                if(progressBar) progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                if(timeDisplay) timeDisplay.textContent = this.formatTime(audio.currentTime);
            });
            
            if(progressContainer) {
                progressContainer.addEventListener('click', (e) => {
                    const rect = progressContainer.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    audio.currentTime = percent * audio.duration;
                });
            }
        });
    }

    formatTime(sec) {
        if(!sec) return "00:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0'+s : s}`;
    }

    setupPerfToggle() {
        if (!this.DOM.perfToggle) return;
        const isLowPerf = localStorage.getItem('lowPerfMode') === 'true';
        this.state.isLowPerfMode = isLowPerf;
        
        const updateBtn = () => {
            this.DOM.perfToggle.textContent = this.state.isLowPerfMode ? '💤 FX: OFF' : '✨ FX: ON';
            document.body.classList.toggle('low-perf-mode', this.state.isLowPerfMode);
        };
        updateBtn();

        this.DOM.perfToggle.addEventListener('click', () => {
            this.state.isLowPerfMode = !this.state.isLowPerfMode;
            localStorage.setItem('lowPerfMode', String(this.state.isLowPerfMode));
            location.reload();
        });
    }

    generateTakeaways() {
        const list = document.querySelector('#knowledge-distillate ul');
        if (!list) return;
        document.querySelectorAll('section[data-takeaway]').forEach(sec => {
            const li = document.createElement('li');
            li.style.marginBottom = '1rem';
            li.style.color = 'var(--text-main)';
            li.style.borderBottom = '1px solid var(--border-subtle)';
            li.style.paddingBottom = '0.5rem';
            const num = sec.querySelector('.chapter-number')?.textContent || '•';
            li.innerHTML = `<strong style="color:var(--primary-glow); margin-right:10px;">${num}</strong> ${sec.dataset.takeaway}`;
            list.appendChild(li);
        });
    }
    
    setupScrollSpy() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.chapter-section');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const id = entry.target.id;
                    navItems.forEach(n => n.classList.remove('active'));
                    const active = document.querySelector(`.nav-item[href="#${id}"]`);
                    if(active) active.classList.add('active');
                }
            });
        }, { threshold: 0.3 });
        sections.forEach(s => observer.observe(s));
    }

    setupSimulation() {
        this.simState.ctx = this.DOM.simCanvas.getContext('2d');
        this.resizeSimulation();
        window.addEventListener('resize', () => this.resizeSimulation());

        this.simState.particles = Array.from({length: 600}, () => new Particle(this.simState.width, this.simState.height));
        
        this.rotateSortitionPower(); 

        this.DOM.simBtnElect.addEventListener('click', () => this.setSimMode('election'));
        this.DOM.simBtnSort.addEventListener('click', () => this.setSimMode('sortition'));

        requestAnimationFrame((t) => this.loopSimulation(t));
    }

    resizeSimulation() {
        if (!this.DOM.simWrapper) return;
        this.simState.width = this.DOM.simWrapper.offsetWidth;
        this.simState.height = this.DOM.simWrapper.offsetHeight;
        this.DOM.simCanvas.width = this.simState.width;
        this.DOM.simCanvas.height = this.simState.height;
        this.simState.centers = [
            {x: this.simState.width * 0.2, y: this.simState.height * 0.5},
            {x: this.simState.width * 0.8, y: this.simState.height * 0.5}
        ];
    }

    loopSimulation(timestamp) {
        if (!this.simState.ctx) return;
        
        this.simState.ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
        this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);

        if (this.simState.mode === 'sortition') {
            if (!this.simState.lastRotation) this.simState.lastRotation = timestamp;
            if (timestamp - this.simState.lastRotation > this.simState.rotationInterval) {
                this.rotateSortitionPower();
                this.simState.lastRotation = timestamp;
            }
        }

        this.simState.particles.forEach(p => {
            p.update(this.simState.mode, this.simState.centers);
            p.draw(this.simState.ctx);
        });

        requestAnimationFrame((t) => this.loopSimulation(t));
    }

    rotateSortitionPower() {
        this.simState.particles.forEach(p => p.selected = false);
        const subsetSize = 40; 
        const indices = new Set();
        while(indices.size < subsetSize) indices.add(Math.floor(Math.random() * this.simState.particles.length));
        indices.forEach(i => this.simState.particles[i].selected = true);
    }

    setSimMode(mode) {
        if (this.simState.mode === mode) return;
        this.simState.mode = mode;
        
        if (mode === 'election') {
            this.DOM.simBtnElect.classList.add('active-mode');
            this.DOM.simBtnSort.classList.remove('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Wahlsystem: <span style="color:var(--alert)">Polarisierung</span>. Gravitationszentren entstehen.`;
            this.DOM.simEntropyMeter.textContent = "STATUS: POLARIZED";
            this.DOM.simEntropyMeter.style.color = "var(--alert)";
        } else {
            this.DOM.simBtnSort.classList.add('active-mode');
            this.DOM.simBtnElect.classList.remove('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Isonomie: <span style="color:var(--logic)">Diversität</span>. Repräsentanten rotieren periodisch.`;
            this.DOM.simEntropyMeter.textContent = "STATUS: ROTATING";
            this.DOM.simEntropyMeter.style.color = "var(--logic)";
            this.rotateSortitionPower();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => { window.dossier = new PhoenixDossier(); });
