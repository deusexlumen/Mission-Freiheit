// VALIDIERTE VERSION: Mission Freiheit v1.0 (Synthesized & Hardened)
// UPGRADE: ISONOMIE Canvas-Simulation integriert. TranscriptSynchronizer-Klasse integriert.

/**
 * TranscriptSynchronizer
 * Eine Helferklasse, die ein <audio>-Element mit einem Transkript-Container verbindet.
 * Sie hebt die aktuell gesprochene Zeile hervor und ermöglicht das Springen per Klick.
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

    /**
     * Schaltet die Sichtbarkeit des Transkripts um.
     */
    toggle() {
        if (!this.transcriptContainer || !this.toggleBtn) return;
        const isHidden = this.transcriptContainer.hidden;
        this.transcriptContainer.hidden = !isHidden;
        this.toggleBtn.setAttribute('aria-expanded', String(isHidden));
        this.toggleBtn.textContent = isHidden ? 'Transkript ausblenden' : 'Transkript anzeigen';
    }

    /**
     * Synchronisiert das Transkript mit der aktuellen Audio-Zeit.
     */
    sync() {
        if (!this.transcriptContainer || this.transcriptContainer.hidden || !this.audio || this.audio.paused) return;
        const time = this.audio.currentTime;
        let activeCue = null;
        
        // Findet die aktive Zeile
        this.cues.forEach(cue => {
            const start = parseFloat(cue.dataset.start);
            const end = parseFloat(cue.dataset.end || Infinity);
            const isActive = time >= start && time < end;
            cue.classList.toggle('active-cue', isActive);
            if (isActive) {
                activeCue = cue;
            }
        });

        // Scrollt die aktive Zeile in die Mitte, falls nötig
        if (activeCue) {
            const container = this.transcriptContainer;
            const containerScrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const cueOffsetTop = activeCue.offsetTop;
            const cueHeight = activeCue.offsetHeight;

            // Prüft, ob die Zeile außerhalb des sichtbaren Bereichs ist
            if (cueOffsetTop < containerScrollTop || cueOffsetTop + cueHeight > containerScrollTop + containerHeight) {
                // Scrollt in die Mitte
                container.scrollTop = cueOffsetTop - (container.clientHeight / 2) + (cueHeight / 2);
            }
        }
    }
}

/**
 * Particle
 * Eine Helferklasse für die Canvas-Simulation. Repräsentiert ein einzelnes Partikel (Bürger).
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
    
    /**
     * Aktualisiert die Position und Farbe des Partikels basierend auf dem Modus.
     * @param {string} mode - 'election', 'sortition' oder 'deliberation'
     * @param {Array} centers - Die Gravitationszentren für den 'election'-Modus
     * @param {number} width - Breite des Canvas
     * @param {number} height - Höhe des Canvas
     */
    update(mode, centers, width, height) {
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
            this.color = this.preference < 0.5 ? '#FF3333' : '#00CC66'; // Alert vs Logic
            this.size = 1.5;
        } else if (mode === 'deliberation') {
            // NEU: DELIBERATION (Bewegung zur Mitte / Konsens)
            let centerX = width / 2;
            let centerY = height / 2;
            let dx = centerX - this.x;
            let dy = centerY - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            // Sanfte Anziehung zur Mitte
            if(dist > 5) {
                this.vx += (dx / dist) * 0.03; 
                this.vy += (dy / dist) * 0.03;
            }
            
            this.vx *= 0.92; // Beruhigung
            this.vy *= 0.92;
            this.color = '#4f46e5'; // Indigo (Konsens)
            this.size = 2;
        } else { 
            // SORTITION (LOS-MODUS): Partikel bewegt sich zufällig (Entropie)
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if(speed > 2) { // Geschwindigkeitsbegrenzung
                this.vx = (this.vx/speed)*2;
                this.vy = (this.vy/speed)*2;
            }
            // Geloste Partikel werden hervorgehoben
            if (this.selected) {
                this.color = '#00CC66'; // Logic-Farbe
                this.size = 3;
            } else {
                this.color = '#333'; 
                this.size = 1;
            }
        }
        // Position aktualisieren und an Rändern abprallen lassen
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    /**
     * Zeichnet das Partikel auf den Canvas.
     * @param {CanvasRenderingContext2D} ctx - Der 2D-Kontext des Canvas
     */
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
            simBtnDelib: document.getElementById('btn-delib'), // NEU
            simAnalysisText: document.getElementById('analysis-text'),
            simEntropyMeter: document.getElementById('entropy-meter')
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
            mode: 'election', // Startmodus
            animationFrame: null
        };

        this.init();
    }

    /**
     * Initialisiert alle Module der Anwendung.
     */
    init() {
        this.setupPerfToggle();
        this.setupAudioPlayers();
        
        // Simulation initialisieren, falls Elemente vorhanden
        if (this.DOM.simCanvas && this.DOM.simWrapper) {
            this.setupSimulation();
        }
        
        // GSAP-Animationen einrichten (oder überspringen)
        try {
            if (!this.state.isLowPerfMode && window.gsap) {
                this.setupGSAPAnimations();
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
        console.log('Synthetisiertes Dossier vollständig initialisiert.');
    }
    
    /**
     * Richtet alle Audio-Player auf der Seite ein (außer dem Sim-Control-Panel).
     */
    setupAudioPlayers() {
        document.querySelectorAll('.audio-feature-box:not(.sim-controls)').forEach(box => {
            new TranscriptSynchronizer(box); // Transkript-Helfer initialisieren
            this.setupAudioControls(box); // Player-Steuerung initialisieren
            if (!this.state.isLowPerfMode && window.innerWidth > 1024) {
                this.setupAudioVisualizer(box); // Visualizer initialisieren
            }
        });
    }

    /**
     * Richtet die Steuerelemente für einen einzelnen Audio-Player ein.
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
        
        // Aktualisiert das Play/Pause-Icon
        const updatePlayPauseIcon = () => {
            const isPaused = audio.paused;
            if(iconPlay) iconPlay.style.display = isPaused ? 'block' : 'none';
            if(iconPause) iconPause.style.display = isPaused ? 'none' : 'block';
            playPauseBtn.setAttribute('aria-label', isPaused ? 'Abspielen' : 'Pausieren');
        };
        
        // Metadaten geladen: Gesamtzeit anzeigen
        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = this.formatTime(audio.duration);
        });
        
        // Fehlerbehandlung
        audio.addEventListener('error', () => {
            console.error(`Audio-Datei konnte nicht geladen werden: ${audio.src}`);
            const audioBox = audio.closest('.audio-feature-box');
            if (audioBox) audioBox.innerHTML += '<p style="color:red;">Fehler: Die Audiodatei konnte nicht geladen werden.</p>';
        });

        // Klick-Handler
        playPauseBtn.addEventListener('click', () => {
            audio.paused ? audio.play() : audio.pause();
        });
        
        audio.addEventListener('play', updatePlayPauseIcon);
        audio.addEventListener('pause', updatePlayPauseIcon);
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            updatePlayPauseIcon();
        });

        // Zeit-Aktualisierung
        audio.addEventListener('timeupdate', () => {
            if (progressBar) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${progress}%`;
            }
            if (currentTimeEl) {
                currentTimeEl.textContent = this.formatTime(audio.currentTime);
            }
        });

        // Klick auf Fortschrittsbalken
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * audio.duration;
            audio.currentTime = newTime;
        });

        // Skip-Buttons
        skipBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const skipAmount = parseFloat(btn.dataset.skip);
                audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + skipAmount));
            });
        });

        // Geschwindigkeits-Button
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
        updatePlayPauseIcon(); // Initialzustand setzen
    }
    
    /**
     * Richtet den Web Audio API Visualizer ein (falls nicht im Low-Perf-Modus).
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
        
        // Verbindet die Audio-Quelle nur einmal
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
        
        // Zeichenfunktion
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
                // Verwendet die primäre CSS-Variable (angenommenes Cyan)
                ctx.fillStyle = `rgba(6, 182, 212, ${barHeight / 100})`;
                ctx.fillRect(barX, canvas.height - barHeight, barWidth, barHeight);
                barX += barWidth + 1;
            }
        };

        const startVisualizer = () => {
            // AudioContext muss ggf. durch Nutzerinteraktion gestartet werden
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            draw();
        };
        
        audio.addEventListener('play', startVisualizer);
        audio.addEventListener('timeupdate', () => {
            if (!audio.paused) draw(); // Zeichnet nur, wenn Audio aktiv ist
        });
    }
    
    /**
     * Formatiert Sekunden in ein MM:SS-Format.
     */
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    /**
     * Richtet den Performance-Umschalter ein.
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
            window.location.reload(); // Lädt die Seite neu, um Animationen sauber zu (de-)aktivieren
        });
    }

    /**
     * Teilt Text für GSAP-Animationen in einzelne Zeichen auf.
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
    setupGSAPAnimations() {
        if (!this.DOM.mainTitle || !this.DOM.subTitle) return;

        gsap.registerPlugin(ScrollTrigger);

        // Header-Titel-Animation
        const mainChars = this.manualSplitText(this.DOM.mainTitle);
        const subChars = this.manualSplitText(this.DOM.subTitle);

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
        
        // Kapitel-Titel Scroll-Animation
        document.querySelectorAll('.chapter-section').forEach(section => {
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

        // Narrative Thread (SVG-Pfad) Animation
        if (this.DOM.narrativePath && this.DOM.focusPane) {
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
        
        // "Final Actions" Sektions-Animation
        const finalSection = document.querySelector('.final-actions');
        if (finalSection) {
            const finalCta = finalSection.querySelector('#final-cta');
            const actionCards = document.querySelectorAll('.final-actions-grid > .action-card');
            if(finalCta) gsap.from(finalCta, { scrollTrigger: { trigger: finalSection, start: 'top 80%', toggleActions: 'play none none none' }, opacity: 0, y: 50, duration: 0.8, ease: 'power2.out' });
            if(actionCards.length > 0) gsap.from(actionCards, { scrollTrigger: { trigger: finalSection, start: 'top 70%', toggleActions: 'play none none none' }, opacity: 0, y: 30, duration: 1, stagger: 0.2, ease: 'power2.out' });
        }
    }
    
    /**
     * Richtet den Scroll-Spy für die Bento-Navigation ein.
     */
    setupScrollSpy() {
        if (!this.DOM.sections.length || !this.DOM.navItems.length) return;

        const observerOptions = {
            root: null, // Beobachtet im Browser-Viewport
            rootMargin: '0px',
            threshold: 0.3 // Auslösen, wenn 30% der Sektion sichtbar sind
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
     */
    generateTakeaways() {
        const container = document.querySelector('#knowledge-distillate ul');
        if (!container) return;
        
        const sections = document.querySelectorAll('section[data-takeaway]');
        sections.forEach((section) => {
            // Überspringt die Simulations-Sektion (part0)
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
        
        this.resizeSimulation(); // Erste Größe setzen
        window.addEventListener('resize', () => this.resizeSimulation());

        this.simState.particles = [];
        for(let i=0; i<800; i++) { // Erzeugt 800 Partikel
            this.simState.particles.push(new Particle(this.simState.width, this.simState.height));
        }
        
        // Wählt 50 Partikel zufällig aus (für den Los-Modus)
        const indices = new Set();
        while(indices.size < 50) indices.add(Math.floor(Math.random() * 800));
        indices.forEach(i => this.simState.particles[i].selected = true);

        // Event Listeners für Modus-Wechsel
        this.DOM.simBtnElect.addEventListener('click', () => this.setSimMode('election'));
        this.DOM.simBtnSort.addEventListener('click', () => this.setSimMode('sortition'));
        if (this.DOM.simBtnDelib) {
            this.DOM.simBtnDelib.addEventListener('click', () => this.setSimMode('deliberation'));
        }

        this.loopSimulation(); // Startet den Animations-Loop
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
        
        // Zeichnet einen halbtransparenten Hintergrund für Bewegungsschleier
        this.simState.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)'; // --void mit alpha
        this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);

        // Aktualisiert und zeichnet jedes Partikel
        this.simState.particles.forEach(p => {
            // HIER WURDE width/height HINZUGEFÜGT:
            p.update(this.simState.mode, this.simState.centers, this.simState.width, this.simState.height);
            p.draw(this.simState.ctx);
        });

        // Zeichnet die Gravitationszentren (nur im Wahl-Modus)
        if(this.simState.mode === 'election') {
            this.simState.ctx.beginPath();
            this.simState.ctx.arc(this.simState.centers[0].x, this.simState.centers[0].y, 5, 0, Math.PI*2);
            this.simState.ctx.fillStyle = '#FF3333'; // --alert
            this.simState.ctx.fill();
            
            this.simState.ctx.beginPath();
            this.simState.ctx.arc(this.simState.centers[1].x, this.sim
