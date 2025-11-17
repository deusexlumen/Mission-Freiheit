// VALIDIERTE VERSION: Mission Freiheit v1.3 (Scroll-gesteuert & Finalisiert)
// UPGRADE: Scroll-gesteuerte Simulation, Visuelles Feedback (Lobby) & Reset-Button implementiert.

/**
 * TranscriptSynchronizer
 * ... (Klasse bleibt unverändert) ...
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
            if (isActive) {
                activeCue = cue;
            }
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
 * ... (Klasse bleibt unverändert, Logik ist in v1.2 bereits korrekt) ...
 */
class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.vx = (Math.random() - 0.5) * 0.5; // Geschwindigkeit x
        this.vy = (Math.random() - 0.5) * 0.5; // Geschwindigkeit y
        this.size = Math.random() * 1.5 + 0.5;
        this.color = '#444444'; // Basis-Partikelfarbe
        this.selected = false; // Für Los-Modus
        this.preference = Math.random(); // Für Wahl-Modus (0 -> Zentrum 1, 1 -> Zentrum 2)
    }
    
    update(mode, centers) {
        if (mode === 'election') {
            // WAHL-MODUS: Partikel bewegt sich zu seinem bevorzugten Zentrum
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist > 10) {
                this.vx += (dx / dist) * 0.05; // Gravitationskraft
                this.vy += (dy / dist) * 0.05;
            }
            this.vx *= 0.95; // Dämpfung
            this.vy *= 0.95;
            this.color = this.preference < 0.5 ? '#FF3333' : '#00CC66'; // Alert vs Logic (Angepasst)
            this.size = 1.5;
        
        } else { // 'sortition' (LOS-MODUS)
            
            if (this.selected) {
                // Plan 1: Geloste Partikel bewegen sich zur Deliberation ins Zentrum
                let target = { x: this.width / 2, y: this.height / 2 };
                let dx = target.x - this.x;
                let dy = target.y - this.y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                // Stärkere Gravitation zur Mitte
                if(dist > 10) { 
                    this.vx += (dx / dist) * 0.08;
                    this.vy += (dy / dist) * 0.08;
                }
                this.vx *= 0.95; // Dämpfung
                this.vy *= 0.95;

                // Visuell hervorheben (Dossier-Primärfarbe)
                this.color = '#06b6d4'; 
                this.size = 2.5;

            } else {
                // Nicht-geloste Partikel (Rest der Gesellschaft) bewegen sich zufällig (Entropie)
                this.vx += (Math.random() - 0.5) * 0.2;
                this.vy += (Math.random() - 0.5) * 0.2;
                const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
                if(speed > 2) { // Geschwindigkeitsbegrenzung
                    this.vx = (this.vx/speed)*2;
                    this.vy = (this.vy/speed)*2;
                }
                this.color = '#333'; // Unauffällig
                this.size = 1;
            }
        }
        // Position aktualisieren und an Rändern abprallen lassen
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > this.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.height) this.vy *= -1;
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
 * Die Hauptklasse, die die gesamte Anwendungslogik steuert.
 */
class PhoenixDossier {
    constructor() {
        // Sammelt alle wichtigen DOM-Elemente
        this.DOM = {
            body: document.body,
            focusPane: document.querySelector('.focus-pane'),
            perfToggle: document.getElementById('perf-toggle'),
            mainTitle: document.getElementById('title-split'),
            subTitle: document.getElementById('subtitle-split'),
            narrativePath: document.querySelector('.narrative-thread-path'),
            navItems: document.querySelectorAll('.bento-nav .nav-item'),
            sections: document.querySelectorAll('.chapter-section'),
            // Simulations-DOM-Elemente
            simCanvas: document.getElementById('sim-canvas'),
            simWrapper: document.getElementById('canvas-wrapper'),
            simBtnElect: document.getElementById('btn-elect'),
            simBtnSort: document.getElementById('btn-sort'),
            simBtnReset: document.getElementById('btn-reset'), // <-- MODIFIKATION (Reset-Button)
            simAnalysisText: document.getElementById('analysis-text'),
            simEntropyMeter: document.getElementById('entropy-meter'),
            simLobbyVisual: document.getElementById('lobby-target-visual') // <-- MODIFIKATION (Visuelles Feedback)
        };

        this.state = {
            isLowPerfMode: false,
        };

        // Simulations-Status
        this.simState = {
            ctx: null,
            width: 0,
            height: 0,
            particles: [],
            centers: [], // Gravitationszentren
            lobbyTarget: { x: 0, y: 0 }, 
            mode: 'election', // Startmodus
            animationFrame: null,
            isHealed: false 
        };

        this.init();
    }

    /**
     * Initialisiert alle Module der Anwendung.
     */
    init() {
        this.setupPerfToggle();
        this.setupAudioPlayers();
        
        if (this.DOM.simCanvas && this.DOM.simWrapper) {
            this.setupSimulation();
        }
        
        try {
            if (!this.state.isLowPerfMode && window.gsap) {
                // --- MODIFIKATION (Scroll-Steuerung) ---
                // Übergibt 'this' (die PhoenixDossier-Instanz) an die GSAP-Funktion
                this.setupGSAPAnimations(this);
                // --- ENDE MODIFIKATION ---
            } else {
                if(this.DOM.mainTitle) this.DOM.mainTitle.style.opacity = 1;
                if(this.DOM.subTitle) this.DOM.subTitle.style.opacity = 1;
                console.log('Low Performance Mode aktiv oder GSAP nicht gefunden: Animationen übersprungen.');
            }
        } catch (error) {
            console.error("Fehler bei der GSAP-Initialisierung:", error);
            if(this.DOM.mainTitle) this.DOM.mainTitle.style.opacity = 1;
            if(this.DOM.subTitle) this.DOM.subTitle.style.opacity = 1;
        }
        
        this.setupShareButtons();
        this.generateTakeaways();
        this.setupScrollSpy();
        console.log('Synthetisiertes Dossier v1.3 vollständig initialisiert.');
    }
    
    /**
     * Richtet alle Audio-Player auf der Seite ein (außer dem Sim-Control-Panel).
     * ... (Funktion bleibt unverändert) ...
     */
    setupAudioPlayers() {
        document.querySelectorAll('.audio-feature-box:not(.sim-controls)').forEach(box => {
            new TranscriptSynchronizer(box);
            this.setupAudioControls(box);
            if (!this.state.isLowPerfMode && window.innerWidth > 1024) {
                this.setupAudioVisualizer(box);
            }
        });
    }

    /**
     * Richtet die Steuerelemente für einen einzelnen Audio-Player ein.
     * ... (Funktion bleibt unverändert) ...
     */
    setupAudioControls(box) {
        const audio = box.querySelector('audio');
        const playPauseBtn = box.querySelector('.play-pause-btn');
        const progressContainer = box.querySelector('.audio-progress-container');
        const totalTimeEl = box.querySelector('.total-time');
        const speedBtn = box.querySelector('.speed-btn');

        if (!audio || !playPauseBtn || !progressContainer || !totalTimeEl) {
            console.warn('Ein Audio-Player konnte nicht initialisiert werden: Essentielle Elemente fehlen.', box);
            return;
        }

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
        
        audio.addEventListener('error', () => {
            console.error(`Audio-Datei konnte nicht geladen werden: ${audio.src}`);
            const audioBox = audio.closest('.audio-feature-box');
            if (audioBox) audioBox.innerHTML += '<p style="color:red;">Fehler: Die Audiodatei konnte nicht geladen werden.</p>';
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
            const newTime = (clickX / rect.width) * audio.duration;
            audio.currentTime = newTime;
        });

        skipBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const skipAmount = parseFloat(btn.dataset.skip);
                audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + skipAmount));
            });
        });

        if (speedBtn) {
            const speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];
            let currentSpeedIndex = 0;
            speedBtn.addEventListener('click', () => {
                currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
                const newSpeed = speeds[currentSpeedIndex];
                audio.playbackRate = newSpeed;
                speedBtn.textContent = `${newSpeed}x`;
            });
        }
        updatePlayPauseIcon();
    }
    
    /**
     * Richtet den Web Audio API Visualizer ein (falls nicht im Low-Perf-Modus).
     * ... (Funktion bleibt unverändert) ...
     */
    setupAudioVisualizer(box) {
         if (!window.AudioContext && !window.webkitAudioContext) {
            console.warn("AudioContext nicht verfügbar. Visualizer deaktiviert.");
            const visualizer = box.querySelector('.audio-visualizer');
            if (visualizer) visualizer.style.display = 'none';
            return;
        }

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
            } catch (e) {
                console.error("Fehler beim Verbinden der Audio-Quelle für den Visualizer:", e);
                return;
            }
        }

        analyser.fftSize = 128;
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
                ctx.fillStyle = `rgba(6, 182, 212, ${barHeight / 100})`;
                ctx.fillRect(barX, canvas.height - barHeight, barWidth, barHeight);
                barX += barWidth + 1;
            }
        };

        const startVisualizer = () => {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            draw();
        };
        
        audio.addEventListener('play', startVisualizer);
        audio.addEventListener('timeupdate', () => {
            if (!audio.paused) draw();
        });
    }
    
    /**
     * Formatiert Sekunden in ein MM:SS-Format.
     * ... (Funktion bleibt unverändert) ...
     */
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    /**
     * Richtet den Performance-Umschalter ein.
     * ... (Funktion bleibt unverändert) ...
     */
    setupPerfToggle() {
        if (!this.DOM.perfToggle) return;
        
        const isLowPerf = localStorage.getItem('lowPerfMode') === 'true';
        this.state.isLowPerfMode = isLowPerf;
        this.DOM.perfToggle.setAttribute('aria-pressed', String(isLowPerf));
        this.DOM.perfToggle.textContent = isLowPerf ? '💤 Animationen aus' : '✨ Animationen an';
        if (this.DOM.body) this.DOM.body.classList.toggle('low-perf-mode', isLowPerf);

        this.DOM.perfToggle.addEventListener('click', () => {
            this.state.isLowPerfMode = !this.state.isLowPerfMode;
            localStorage.setItem('lowPerfMode', String(this.state.isLowPerfMode));
            window.location.reload();
        });
    }

    /**
     * Teilt Text für GSAP-Animationen in einzelne Zeichen auf.
     * ... (Funktion bleibt unverändert) ...
     */
    manualSplitText(element) {
        if (!element) return [];
        const originalText = element.textContent;
        element.innerHTML = '';
        const chars = [];
        
        originalText.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.className = 'char-anim';
            charSpan.style.display = 'inline-block';
            charSpan.textContent = (char === ' ') ? '\u00A0' : char; // Leerzeichen erhalten
            element.appendChild(charSpan);
            chars.push(charSpan);
        });
        return chars;
    }

    /**
     * Richtet alle GSAP-Animationen ein.
     */
    // --- START MODIFIKATION (Scroll-Steuerung) ---
    setupGSAPAnimations(dossierInstance) { // Nimmt 'this' (die Instanz) entgegen
        if (!this.DOM.mainTitle || !this.DOM.subTitle) return;

        gsap.registerPlugin(ScrollTrigger);

        // Header-Titel-Animation (bleibt gleich)
        const mainChars = this.manualSplitText(this.DOM.mainTitle);
        const subChars = this.manualSplitText(this.DOM.subTitle);
        // ... (restliche Titel-Animation bleibt gleich) ...
        gsap.set([this.DOM.mainTitle, this.DOM.subTitle], { opacity: 1 });
        gsap.set(mainChars, { opacity: 0, y: '100%', rotationX: -90, transformOrigin: 'center center -50px' });
        gsap.set(subChars, { opacity: 0, y: '100%' });
        gsap.to(mainChars, {
            opacity: 1, y: '0%', rotationX: 0, duration: 0.8,
            ease: 'power3.out', stagger: 0.03, delay: 0.5
        });
        gsap.to(subChars, {
            opacity: 1, y: '0%', duration: 0.5,
            ease: 'power1.out', stagger: 0.01, delay: 1.0
        });
        
        // Kapitel-Titel Scroll-Animation (bleibt gleich)
        document.querySelectorAll('.chapter-section').forEach(section => {
            // ... (Animation bleibt gleich) ...
            const title = section.querySelector('.chapter-title');
            if (title) {
                 gsap.from(title, {
                    y: 100, opacity: 0, ease: "power2.out",
                    scrollTrigger: {
                        trigger: section, start: "top 80%", end: "top 20%",
                        scrub: true, toggleActions: "play none none reverse",
                    }
                });
            }
        });

        // Narrative Thread (SVG-Pfad) Animation (bleibt gleich)
        if (this.DOM.narrativePath && this.DOM.focusPane) {
            // ... (Animation bleibt gleich) ...
            const pathLength = this.DOM.narrativePath.getTotalLength();
            if (pathLength > 0) {
                this.DOM.narrativePath.style.strokeDasharray = pathLength;
                this.DOM.narrativePath.style.strokeDashoffset = pathLength;
                gsap.to(this.DOM.narrativePath, {
                    strokeDashoffset: 0, ease: "none",
                    scrollTrigger: {
                        trigger: this.DOM.focusPane, start: "top top", end: "bottom bottom",
                        scrub: 1, invalidateOnRefresh: true
                    }
                });
            }
        }
        
        // "Final Actions" Sektions-Animation (bleibt gleich)
        const finalSection = document.querySelector('.final-actions');
        if (finalSection) {
            // ... (Animation bleibt gleich) ...
            const finalCta = finalSection.querySelector('#final-cta');
            const actionCards = document.querySelectorAll('.final-actions-grid > .action-card');
            if(finalCta) gsap.from(finalCta, { scrollTrigger: { trigger: finalSection, start: 'top 80%', toggleActions: 'play none none none' }, opacity: 0, y: 50, duration: 0.8, ease: 'power2.out' });
            if(actionCards.length > 0) gsap.from(actionCards, { scrollTrigger: { trigger: finalSection, start: 'top 70%', toggleActions: 'play none none none' }, opacity: 0, y: 30, duration: 1, stagger: 0.2, ease: 'power2.out' });
        }

        // --- NEUE LOGIK: Scroll-gesteuerte Simulation ---
        if (dossierInstance) {
            // Trigger für Sektion 2 (Diagnose) -> Wahl-Modus
            ScrollTrigger.create({
                trigger: "#part2",
                start: "top 30%", // Wenn Sektion 2 30% von oben erreicht
                end: "bottom 30%",
                onEnter: () => dossierInstance.setSimMode('election'),
                onEnterBack: () => dossierInstance.setSimMode('election')
            });

            // Trigger für Sektion 3 (Therapie) -> Los-Modus
            ScrollTrigger.create({
                trigger: "#part3",
                start: "top 30%", // Wenn Sektion 3 30% von oben erreicht
                end: "bottom 30%",
                onEnter: () => dossierInstance.setSimMode('sortition'),
                onEnterBack: () => dossierInstance.setSimMode('sortition')
            });
        }
        // --- ENDE MODIFIKATION ---
    }
    
    /**
     * Richtet den Scroll-Spy für die Bento-Navigation ein.
     * ... (Funktion bleibt unverändert) ...
     */
    setupScrollSpy() {
        if (!this.DOM.sections.length || !this.DOM.navItems.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };

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
        }, observerOptions);

        this.DOM.sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Richtet die Share-Buttons ein.
     * ... (Funktion bleibt unverändert) ...
     */
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
    
    /**
     * Generiert die Takeaway-Liste in Sektion 7 dynamisch.
     * ... (Funktion bleibt unverändert) ...
     */
    generateTakeaways() {
        const container = document.querySelector('#knowledge-distillate ul');
        if (!container) return;
        
        const sections = document.querySelectorAll('section[data-takeaway]');
        sections.forEach((section) => {
            if (section.id === 'part0') return;
            const takeawayText = section.dataset.takeaway;
            const li = document.createElement('li');
            const chapterNumber = section.querySelector('.chapter-number')?.textContent.replace('.', '') || '';
            li.innerHTML = `<strong>Teil ${chapterNumber}:</strong> ${takeawayText}`;
            container.appendChild(li);
        });
    }


    // --- INTEGRIERTE SIMULATIONS-LOGIK ---
    
    /**
     * Initialisiert die Canvas-Simulation.
     */
    setupSimulation() {
        this.simState.ctx = this.DOM.simCanvas.getContext('2d');
        
        this.resizeSimulation(); 
        window.addEventListener('resize', () => this.resizeSimulation());

        // Performance-Anpassung (v1.2)
        const particleCount = window.innerWidth < 768 ? 300 : 800; 
        this.simState.particles = [];
        for(let i=0; i < particleCount; i++) { 
            this.simState.particles.push(new Particle(this.simState.width, this.simState.height));
        }
        
        const selectCount = window.innerWidth < 768 ? 25 : 50;
        const indices = new Set();
        while(indices.size < selectCount) indices.add(Math.floor(Math.random() * particleCount));
        indices.forEach(i => this.simState.particles[i].selected = true);

        // Event Listeners für Modus-Wechsel
        this.DOM.simBtnElect.addEventListener('click', () => this.setSimMode('election'));
        this.DOM.simBtnSort.addEventListener('click', () => this.setSimMode('sortition'));

        // --- START MODIFIKATION (Reset-Button) ---
        if (this.DOM.simBtnReset) {
            this.DOM.simBtnReset.addEventListener('click', () => this.resetSimulation());
        }
        // --- ENDE MODIFIKATION ---

        this.loopSimulation(); 
    }

    /**
     * Passt die Größe der Simulation an den Wrapper an.
     */
    resizeSimulation() {
        if (!this.DOM.simWrapper) return;
        this.simState.width = this.DOM.simWrapper.offsetWidth;
        this.simState.height = this.DOM.simWrapper.offsetHeight;
        this.DOM.simCanvas.width = this.simState.width;
        this.DOM.simCanvas.height = this.simState.height;
        
        // Definiert die Gravitationszentren neu
        this.simState.centers = [
            {x: this.simState.width * 0.25, y: this.simState.height * 0.5},
            {x: this.simState.width * 0.75, y: this.simState.height * 0.5}
        ];
        
        // Lobby-Ziel definieren
        this.simState.lobbyTarget = {x: this.simState.width * 0.5, y: 20 }; // y: 20 (für padding)

        // --- START MODIFIKATION (Visuelles Feedback) ---
        // Positioniert das Lobby-Visual
        if (this.DOM.simLobbyVisual) {
            this.DOM.simLobbyVisual.style.top = `${this.simState.lobbyTarget.y}px`;
        }
        // --- ENDE MODIFIKATION ---

        // Stellt sicher, dass Partikel im Frame bleiben
        this.simState.particles.forEach(p => {
            p.width = this.simState.width;
            p.height = this.simState.height;
            if (p.x > this.simState.width) p.x = this.simState.width;
            if (p.y > this.simState.height) p.y = this.simState.height;
        });
    }

    /**
     * Der Haupt-Animations-Loop für die Simulation.
     */
    loopSimulation() {
        if (!this.simState.ctx) return;
        
        this.simState.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);

        // Heilungs-Logik (v1.2)
        if (this.simState.mode === 'election' && !this.simState.isHealed) {
            const lobbyForce = 0.0005; 
            
            this.simState.centers.forEach(center => {
                let dx = this.simState.lobbyTarget.x - center.x;
                let dy = this.simState.lobbyTarget.y - center.y;
                
                center.x += dx * lobbyForce;
                center.y += dy * lobbyForce;
            });
        }

        this.simState.particles.forEach(p => {
            p.update(this.simState.mode, this.simState.centers);
            p.draw(this.simState.ctx);
        });

        // Gravitationszentren zeichnen (v1.2)
        if(this.simState.mode === 'election') {
            this.simState.ctx.beginPath();
            this.simState.ctx.arc(this.simState.centers[0].x, this.simState.centers[0].y, 5, 0, Math.PI*2);
            this.simState.ctx.fillStyle = '#FF3333'; // --alert
            this.simState.ctx.fill();
            
            this.simState.ctx.beginPath();
            this.simState.ctx.arc(this.simState.centers[1].x, this.simState.centers[1].y, 5, 0, Math.PI*2);
            this.simState.ctx.fillStyle = '#00CC66'; // --logic (als Kontrast)
            this.simState.ctx.fill();
        }

        this.simState.animationFrame = requestAnimationFrame(() => this.loopSimulation());
    }

    // --- START MODIFIKATION (Reset-Button) ---
    /**
     * Setzt den "Heilungs"-Status der Simulation zurück.
     */
    resetSimulation() {
        this.simState.isHealed = false;
        // Erzwingt den Wechsel in den "kaputten" Wahl-Modus,
        // auch wenn er schon aktiv ist (setSimMode würde sonst blockieren)
        this.simState.mode = 'sortition'; // Trick, um Wechsel zu erzwingen
        this.setSimMode('election');
    }
    // --- ENDE MODIFIKATION ---

    /**
     * Wechselt den Modus der Simulation (Wahl vs. Los).
     */
    setSimMode(newMode) {
        // Verhindert unnötiges Umschalten, außer wenn der Reset-Button
        // den Moduswechsel erzwingen will (siehe resetSimulation)
        if (this.simState.mode === newMode) return;

        // Zentren bei Moduswechsel zurücksetzen (nur wenn nicht geheilt)
        if (!this.simState.isHealed) {
             this.resizeSimulation();
        } else if (newMode === 'election') {
             // Wenn geheilt und zu Wahl gewechselt wird, Zentren auch zurücksetzen,
             // damit sie nicht an der Lobby-Position (oben) kleben bleiben.
             this.resizeSimulation();
        }
        
        this.simState.mode = newMode;

        // Aktualisiert die UI-Texte und Button-Stile
        const alertSpan = `<span style="color: var(--alert);">Stasis & Lobbyismus</span>`;
        const logicSpan = `<span style.color: var(--logic);>Deliberation</span>`;
        const healedSpan = `<span style="color: var(--logic);">STABILISIERT</span>`;

        if (newMode === 'election') {
            this.DOM.simBtnElect.classList.add('active-mode');
            this.DOM.simBtnSort.classList.remove('active-mode');
            
            if (this.simState.isHealed) {
                // Zustand 1: WAHL-MODUS (NACH HEILUNG)
                this.DOM.simAnalysisText.innerHTML = `Das System ist ${healedSpan}. Die Zentren driften nicht mehr, da der Bürgerrat korrigierend gewirkt hat.`;
                this.DOM.simEntropyMeter.textContent = "STABILIZED";
                this.DOM.simEntropyMeter.style.color = "var(--logic)";
                if (this.DOM.simLobbyVisual) this.DOM.simLobbyVisual.classList.remove('visible'); // <-- Visuelles Feedback
            } else {
                // Zustand 2: WAHL-MODUS (INITIAL)
                this.DOM.simAnalysisText.innerHTML = `Die Gesellschaft polarisiert sich (Stasis). Gleichzeitig driften die Machtzentren (Parteien) zu Partikularinteressen (Lobbyisten). ${alertSpan}.`;
                this.DOM.simEntropyMeter.textContent = "POLARIZED";
                this.DOM.simEntropyMeter.style.color = "var(--alert)";
                if (this.DOM.simLobbyVisual) this.DOM.simLobbyVisual.classList.add('visible'); // <-- Visuelles Feedback
            }
        
        } else { // 'sortition'
            // Zustand 3: LOS-MODUS (Startet die Heilung)
            this.simState.isHealed = true; // <-- DER "HEILUNGS"-AKT
            
            this.DOM.simBtnSort.classList.add('active-mode');
            this.DOM.simBtnElect.classList.remove('active-mode');
            
            this.DOM.simAnalysisText.innerHTML = `Ein Querschnitt der Bürger löst sich von der Masse und kommt zur ${logicSpan} zusammen. Das System heilt durch kognitive Diversität.`;
            this.DOM.simEntropyMeter.textContent = "OPTIMAL";
            this.DOM.simEntropyMeter.style.color = "var(--logic)";
            if (this.DOM.simLobbyVisual) this.DOM.simLobbyVisual.classList.remove('visible'); // <-- Visuelles Feedback
        }
    }
}

// === INITIALISIERUNG ===
window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        preloader.addEventListener('transitionend', () => {
            preloader.style.display = 'none';
        }, { once: true });
    }

    try {
        window.dossier = new PhoenixDossier();
    } catch (e) {
        console.error("Fehler bei der Initialisierung der PhoenixDossier-Anwendung:", e);
    }
});
