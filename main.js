// VALIDIERTE VERSION: Mission Freiheit v1.1 (High-End Visuals)
// UPGRADE: Constellation-Effekt, Motion-Trails und Performance-Optimierungen.

/**
 * TranscriptSynchronizer
 * Verbindet <audio> mit Transkript-Container (Highlighting & Klick-Sprung).
 */
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
        
        // Klick-Ereignis für Transkript-Zeilen
        this.cues.forEach(cue => {
            cue.addEventListener('click', () => {
                this.audio.currentTime = parseFloat(cue.dataset.start);
                if (this.audio.paused) {
                    this.audio.play();
                }
            });
        });
        
        if (this.toggleBtn) {
            this.toggleBtn.textContent = 'Transkript anzeigen';
        }
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
            const containerScrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const cueOffsetTop = activeCue.offsetTop;
            const cueHeight = activeCue.offsetHeight;

            if (cueOffsetTop < containerScrollTop || cueOffsetTop + cueHeight > containerScrollTop + containerHeight) {
                container.scrollTop = cueOffsetTop - (container.clientHeight / 2) + (cueHeight / 2);
            }
        }
    }
}

/**
 * Particle
 * Repräsentiert einen Bürger in der Simulation.
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
        this.selected = false; 
        this.preference = Math.random(); 
    }
    
    update(mode, centers) {
        if (mode === 'election') {
            // WAHL: Bewegung zum bevorzugten Zentrum (Polarisierung)
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            // Gravitation mit leichter Zufallsabweichung (Chaos)
            if(dist > 10) {
                this.vx += (dx / dist) * 0.05 + (Math.random()-0.5)*0.01;
                this.vy += (dy / dist) * 0.05 + (Math.random()-0.5)*0.01;
            }
            
            this.vx *= 0.95; // Dämpfung
            this.vy *= 0.95;
            this.color = this.preference < 0.5 ? '#FF3333' : '#4f46e5'; // Rot vs Indigo (angepasst an Design)
            this.size = 1.5;
        } else { 
            // LOS: Zufällige Bewegung (Entropie)
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if(speed > 2) { 
                this.vx = (this.vx/speed)*2;
                this.vy = (this.vy/speed)*2;
            }
            
            if (this.selected) {
                this.color = '#00CC66'; // Isonomie-Grün
                this.size = 3.5; // Etwas größer für Sichtbarkeit
            } else {
                this.color = 'rgba(255, 255, 255, 0.15)'; // Inaktive Bürger sind geisterhaft
                this.size = 1;
            }
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap-Around (Pacman-Effekt) statt Abprallen für flüssigeren Look
        if (this.x < 0) this.x = this.width;
        if (this.x > this.width) this.x = 0;
        if (this.y < 0) this.y = this.height;
        if (this.y > this.height) this.y = 0;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}


/**
 * PhoenixDossier
 * Hauptklasse für Logik, Audio und Simulation.
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

        this.state = {
            isLowPerfMode: false,
        };

        this.simState = {
            ctx: null,
            width: 0,
            height: 0,
            particles: [],
            centers: [],
            mode: 'election',
            animationFrame: null
        };

        this.init();
    }

    init() {
        this.setupPerfToggle();
        this.setupAudioPlayers();
        
        if (this.DOM.simCanvas && this.DOM.simWrapper) {
            this.setupSimulation();
        }
        
        // GSAP Setup
        try {
            if (!this.state.isLowPerfMode && window.gsap) {
                this.setupGSAPAnimations();
            } else {
                if(this.DOM.mainTitle) this.DOM.mainTitle.style.opacity = 1;
                if(this.DOM.subTitle) this.DOM.subTitle.style.opacity = 1;
            }
        } catch (error) {
            console.error("GSAP Init Error:", error);
            if(this.DOM.mainTitle) this.DOM.mainTitle.style.opacity = 1;
        }
        
        this.setupShareButtons();
        this.generateTakeaways();
        this.setupScrollSpy();
        console.log('Mission Freiheit v1.1 initialisiert.');
    }
    
    // --- AUDIO PLAYER LOGIK ---
    setupAudioPlayers() {
        document.querySelectorAll('.audio-feature-box:not(.sim-controls)').forEach(box => {
            new TranscriptSynchronizer(box);
            this.setupAudioControls(box);
            if (!this.state.isLowPerfMode && window.innerWidth > 1024) {
                this.setupAudioVisualizer(box);
            }
        });
    }

    setupAudioControls(box) {
        const audio = box.querySelector('audio');
        const playPauseBtn = box.querySelector('.play-pause-btn');
        const progressContainer = box.querySelector('.audio-progress-container');
        const totalTimeEl = box.querySelector('.total-time');
        const speedBtn = box.querySelector('.speed-btn');

        if (!audio || !playPauseBtn || !progressContainer || !totalTimeEl) return;

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
            totalTimeEl.textContent = this.formatTime(audio.duration);
        });
        
        playPauseBtn.addEventListener('click', () => {
            audio.paused ? audio.play() : audio.pause();
        });
        
        audio.addEventListener('play', updatePlayPauseIcon);
        audio.addEventListener('pause', updatePlayPauseIcon);
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            updatePlayPauseIcon();
        });

        audio.addEventListener('timeupdate', () => {
            if (progressBar) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${progress}%`;
            }
            if (currentTimeEl) {
                currentTimeEl.textContent = this.formatTime(audio.currentTime);
            }
        });

        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            audio.currentTime = (clickX / rect.width) * audio.duration;
        });

        skipBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + parseFloat(btn.dataset.skip)));
            });
        });

        if (speedBtn) {
            const speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];
            let currentSpeedIndex = 0;
            speedBtn.addEventListener('click', () => {
                currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
                audio.playbackRate = speeds[currentSpeedIndex];
                speedBtn.textContent = `${speeds[currentSpeedIndex]}x`;
            });
        }
        updatePlayPauseIcon();
    }
    
    setupAudioVisualizer(box) {
         if (!window.AudioContext && !window.webkitAudioContext) return;

        const canvas = box.querySelector('.audio-visualizer');
        const audio = box.querySelector('audio');
        if (!canvas || !audio) return;

        const ctx = canvas.getContext('2d');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        
        if (!audio.dataset.audioSourceConnected) {
            try {
                const source = audioContext.createMediaElementSource(audio);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                audio.dataset.audioSourceConnected = 'true';
            } catch (e) { return; }
        }

        analyser.fftSize = 64; // Reduziert für den Retro-Look
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (audio.paused || audio.ended) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength);
            let barX = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2.5;
                ctx.fillStyle = `rgba(103, 232, 249, ${barHeight / 100})`; // Highlight Cyan
                ctx.fillRect(barX, canvas.height - barHeight, barWidth - 1, barHeight);
                barX += barWidth;
            }
        };

        audio.addEventListener('play', () => {
            if (audioContext.state === 'suspended') audioContext.resume();
            draw();
        });
    }
    
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    /**
     * Richtet den Performance-Umschalter ein.
     * Standard: Animationen sind AN (isLowPerfMode = false).
     */
    setupPerfToggle() {
        if (!this.DOM.perfToggle) return;
        
        // Prüfen: Steht explizit 'true' im Speicher? Wenn nicht (null/false), bleiben Animationen AN.
        const isLowPerf = localStorage.getItem('lowPerfMode') === 'true';
        this.state.isLowPerfMode = isLowPerf;

        // Initiale UI-Anpassung basierend auf dem Status
        this.updatePerfUI();

        this.DOM.perfToggle.addEventListener('click', () => {
            this.state.isLowPerfMode = !this.state.isLowPerfMode;
            localStorage.setItem('lowPerfMode', String(this.state.isLowPerfMode));
            
            // Reload erzwingen, um Animationen (GSAP/Canvas) sauber neu zu initialisieren oder zu stoppen
            window.location.reload(); 
        });
    }

    /**
     * Aktualisiert Text und Klasse basierend auf dem Modus.
     */
    updatePerfUI() {
        const isLowPerf = this.state.isLowPerfMode;

        // 1. Button Text & Aria aktualisieren
        this.DOM.perfToggle.setAttribute('aria-pressed', String(isLowPerf));
        // Text zeigt den AKTUELLEN Status an
        this.DOM.perfToggle.textContent = isLowPerf ? '💤 Animationen: AUS' : '✨ Animationen: AN';

        // 2. Body Klasse setzen (wichtig für CSS)
        if (isLowPerf && this.DOM.body) {
            this.DOM.body.classList.add('low-perf-mode');
        } else if (this.DOM.body) {
            this.DOM.body.classList.remove('low-perf-mode');
        }
    }

    // --- ANIMATIONEN ---
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
        if (!this.DOM.mainTitle || !this.DOM.subTitle) return;
        gsap.registerPlugin(ScrollTrigger);

        const mainChars = this.manualSplitText(this.DOM.mainTitle);
        const subChars = this.manualSplitText(this.DOM.subTitle);

        gsap.set([this.DOM.mainTitle, this.DOM.subTitle], { opacity: 1 });
        gsap.set(mainChars, { opacity: 0, y: '100%', rotationX: -90, transformOrigin: 'center center -50px' });
        gsap.set(subChars, { opacity: 0, y: '20px' });

        gsap.to(mainChars, {
            opacity: 1, y: '0%', rotationX: 0, duration: 1.2,
            ease: 'expo.out', stagger: 0.04, delay: 0.2
        });

        gsap.to(subChars, {
            opacity: 1, y: '0%', duration: 1,
            ease: 'power2.out', stagger: 0.01, delay: 0.8
        });
        
        document.querySelectorAll('.chapter-section').forEach(section => {
            const title = section.querySelector('.chapter-title');
            if (title) {
                 gsap.from(title, {
                    y: 50, opacity: 0, duration: 1, ease: "power3.out",
                    scrollTrigger: {
                        trigger: section, start: "top 85%", toggleActions: "play none none reverse"
                    }
                });
            }
        });

        if (this.DOM.narrativePath && this.DOM.focusPane) {
            const pathLength = this.DOM.narrativePath.getTotalLength();
            this.DOM.narrativePath.style.strokeDasharray = pathLength;
            this.DOM.narrativePath.style.strokeDashoffset = pathLength;
            gsap.to(this.DOM.narrativePath, {
                strokeDashoffset: 0, ease: "none",
                scrollTrigger: {
                    trigger: this.DOM.focusPane, start: "top top", end: "bottom bottom",
                    scrub: 1
                }
            });
        }
        
        const finalSection = document.querySelector('.final-actions');
        if (finalSection) {
            const actionCards = document.querySelectorAll('.action-card');
            if(actionCards.length > 0) {
                gsap.from(actionCards, { 
                    scrollTrigger: { trigger: finalSection, start: 'top 75%' }, 
                    opacity: 0, y: 50, duration: 0.8, stagger: 0.2, ease: 'back.out(1.7)' 
                });
            }
        }
    }
    
    setupScrollSpy() {
        if (!this.DOM.sections.length || !this.DOM.navItems.length) return;
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
        }, { threshold: 0.25 });
        this.DOM.sections.forEach(section => observer.observe(section));
    }

    setupShareButtons() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const emailBtn = document.getElementById('share-email');
        if (emailBtn) emailBtn.href = `mailto:?subject=${title}&body=${url}`;
        const xBtn = document.getElementById('share-x');
        if (xBtn) xBtn.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        const facebookBtn = document.getElementById('share-facebook');
        if (facebookBtn) facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }
    
    generateTakeaways() {
        const container = document.querySelector('#knowledge-distillate ul');
        if (!container) return;
        document.querySelectorAll('section[data-takeaway]').forEach((section) => {
            if (section.id === 'part0') return;
            const li = document.createElement('li');
            const chapterNumber = section.querySelector('.chapter-number')?.textContent.replace('.', '') || '';
            li.innerHTML = `<strong style="color:var(--primary-color)">${chapterNumber}</strong> ${section.dataset.takeaway}`;
            container.appendChild(li);
        });
    }

    // --- UPGRADED SIMULATION ---
    
    setupSimulation() {
        this.simState.ctx = this.DOM.simCanvas.getContext('2d');
        this.resizeSimulation(); 
        window.addEventListener('resize', () => this.resizeSimulation());

        // 800 Partikel für dichte Masse
        this.simState.particles = [];
        for(let i=0; i<800; i++) { 
            this.simState.particles.push(new Particle(this.simState.width, this.simState.height));
        }
        
        // 50 Partikel für Los-Auswahl (Isonomie-Gruppe)
        const indices = new Set();
        while(indices.size < 50) indices.add(Math.floor(Math.random() * 800));
        indices.forEach(i => this.simState.particles[i].selected = true);

        this.DOM.simBtnElect.addEventListener('click', () => this.setSimMode('election'));
        this.DOM.simBtnSort.addEventListener('click', () => this.setSimMode('sortition'));

        this.loopSimulation();
    }

    resizeSimulation() {
        if (!this.DOM.simWrapper) return;
        this.simState.width = this.DOM.simWrapper.offsetWidth;
        this.simState.height = this.DOM.simWrapper.offsetHeight;
        this.DOM.simCanvas.width = this.simState.width;
        this.DOM.simCanvas.height = this.simState.height;
        this.simState.centers = [
            {x: this.simState.width * 0.25, y: this.simState.height * 0.5},
            {x: this.simState.width * 0.75, y: this.simState.height * 0.5}
        ];
    }

/**
     * Der Haupt-Animations-Loop für die Simulation.
     */
    loopSimulation() {
        if (!this.simState.ctx) return;
        
        // Zeichnet einen halbtransparenten Hintergrund für Bewegungsschleier
        this.simState.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)'; 
        this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);

        // --- NEU: ROTATIONS-LOGIK (Der Puls der Isonomie) ---
        // Wenn wir im Los-Modus sind, tauschen wir ständig Mitglieder aus.
        if (this.simState.mode === 'sortition') {
            const now = Date.now();
            
            // Initialisierung des Timers beim ersten Durchlauf
            if (!this.simState.lastRotation) this.simState.lastRotation = now;

            // Alle 100ms findet eine Rotation statt (Geschwindigkeit anpassbar)
            if (now - this.simState.lastRotation > 100) {
                
                // 1. Finde alle aktuellen Ratsmitglieder
                const councilMembers = this.simState.particles.filter(p => p.selected);
                
                // 2. Finde alle "normalen" Bürger
                const citizens = this.simState.particles.filter(p => !p.selected);

                if (councilMembers.length > 0 && citizens.length > 0) {
                    // Ein Mitglied verlässt den Rat (tritt zurück in die Masse)
                    const retiringIdx = Math.floor(Math.random() * councilMembers.length);
                    councilMembers[retiringIdx].selected = false;

                    // Ein neuer Bürger wird per Los bestimmt (rückt nach)
                    const newMemberIdx = Math.floor(Math.random() * citizens.length);
                    citizens[newMemberIdx].selected = true;
                }

                this.simState.lastRotation = now;
            }
        }
        // ----------------------------------------------------

        // Aktualisiert und zeichnet jedes Partikel
        this.simState.particles.forEach(p => {
            p.update(this.simState.mode, this.simState.centers);
            p.draw(this.simState.ctx);
        });

        // Zeichnet die Gravitationszentren (nur im Wahl-Modus sichtbar)
        if(this.simState.mode === 'election') {
            // ... (Code für die roten/grünen Punkte bleibt gleich) ...
            this.simState.ctx.beginPath();
            this.simState.ctx.arc(this.simState.centers[0].x, this.simState.centers[0].y, 5, 0, Math.PI*2);
            this.simState.ctx.fillStyle = '#FF3333'; 
            this.simState.ctx.fill();
            
            this.simState.ctx.beginPath();
            this.simState.ctx.arc(this.simState.centers[1].x, this.simState.centers[1].y, 5, 0, Math.PI*2);
            this.simState.ctx.fillStyle = '#00CC66';
            this.simState.ctx.fill();
        }

        this.simState.animationFrame = requestAnimationFrame(() => this.loopSimulation());
    }

        // Zentren im Wahl-Modus zeichnen
        if(this.simState.mode === 'election') {
            this.drawCenter(this.simState.centers[0], '#FF3333');
            this.drawCenter(this.simState.centers[1], '#4f46e5'); // Indigo statt Grün für Kontrast
        }

        this.simState.animationFrame = requestAnimationFrame(() => this.loopSimulation());
    }
    
    drawCenter(center, color) {
        this.simState.ctx.beginPath();
        this.simState.ctx.arc(center.x, center.y, 8, 0, Math.PI*2);
        this.simState.ctx.fillStyle = color;
        this.simState.ctx.shadowBlur = 15;
        this.simState.ctx.shadowColor = color;
        this.simState.ctx.fill();
        this.simState.ctx.shadowBlur = 0; // Reset
    }

    setSimMode(newMode) {
        if (this.simState.mode === newMode) return;
        this.simState.mode = newMode;

        const alertSpan = `<span style="color: var(--alert);">Gravitationszentren</span>`;
        const logicSpan = `<span style="color: var(--logic);">Querschnitt</span>`;

        if (newMode === 'election') {
            this.DOM.simBtnElect.classList.add('active-mode');
            this.DOM.simBtnSort.classList.remove('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Das Wahlsystem erzeugt ${alertSpan}. Die Gesellschaft polarisiert sich. Ränder verhärten.`;
            this.DOM.simEntropyMeter.textContent = "POLARIZED";
            this.DOM.simEntropyMeter.style.color = "var(--alert)";
        } else {
            this.DOM.simBtnSort.classList.add('active-mode');
            this.DOM.simBtnElect.classList.remove('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Zufallsauswahl durchbricht die Blasen. Ein ${logicSpan} vernetzt sich. Diskurse entstehen.`;
            this.DOM.simEntropyMeter.textContent = "CONNECTED";
            this.DOM.simEntropyMeter.style.color = "var(--logic)";
        }
    }
}

// Initialisierung
window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Simuliert kurze Ladezeit für Effekt
        setTimeout(() => {
            preloader.classList.add('hidden');
            preloader.addEventListener('transitionend', () => preloader.style.display = 'none', { once: true });
        }, 500);
    }
    try { window.dossier = new PhoenixDossier(); } 
    catch (e) { console.error("Critical Init Error:", e); }
});
