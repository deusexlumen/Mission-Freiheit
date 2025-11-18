// VALIDIERTE VERSION: Mission Freiheit v1.4 (Visual Upgrade: Synaptic Connections)

/**
 * TranscriptSynchronizer
 * Verbindet Audio mit Text.
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
            this.toggleBtn.textContent = 'Transkript anzeigen';
        }
        
        this.audio.addEventListener('timeupdate', () => this.sync());
        
        this.cues.forEach(cue => {
            cue.addEventListener('click', () => {
                this.audio.currentTime = parseFloat(cue.dataset.start);
                if (this.audio.paused) this.audio.play();
            });
        });
    }

    toggle() {
        if (!this.transcriptContainer || !this.toggleBtn) return;
        const isHidden = this.transcriptContainer.hidden;
        this.transcriptContainer.hidden = !isHidden;
        this.toggleBtn.setAttribute('aria-expanded', String(isHidden));
        this.toggleBtn.textContent = isHidden ? 'Transkript anzeigen' : 'Transkript ausblenden';
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
            const cueOffsetTop = activeCue.offsetTop;
            const containerHeight = container.clientHeight;
            if (cueOffsetTop < container.scrollTop || cueOffsetTop + activeCue.offsetHeight > container.scrollTop + containerHeight) {
                container.scrollTop = cueOffsetTop - (containerHeight / 2) + (activeCue.offsetHeight / 2);
            }
        }
    }
}

/**
 * Particle System
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
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist > 10) {
                this.vx += (dx / dist) * 0.05;
                this.vy += (dy / dist) * 0.05;
            }
            this.vx *= 0.95;
            this.vy *= 0.95;
            this.color = this.preference < 0.5 ? '#FF3333' : '#00CC66';
            this.size = 1.5;
        } else if (mode === 'deliberation') {
            // DELIBERATION-MODUS: Konsensfindung in der Mitte
            let targetX = this.width / 2;
            let targetY = this.height / 2;
            let dx = targetX - this.x;
            let dy = targetY - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            // Sanfte Anziehung zur Mitte
            if(dist > 20) {
                this.vx += (dx / dist) * 0.03;
                this.vy += (dy / dist) * 0.03;
            }
            
            // WICHTIG: Mehr "Reibung" im Deliberation Modus (Zuhören braucht Ruhe)
            this.vx += (Math.random() - 0.5) * 0.05;
            this.vy += (Math.random() - 0.5) * 0.05;
            this.vx *= 0.94; 
            this.vy *= 0.94;
            
            // Farbe: Wenn ausgewählt, helles Lila, sonst dunkleres Grau als Hintergrundrauschen
            if (this.selected) {
                this.color = '#a855f7'; 
                this.size = 2.5;
            } else {
                this.color = '#2a2a2a'; // Hintergrundpartikel dimmen
                this.size = 1;
            }

        } else {
            // LOS-MODUS (Sortition): Zufall / Diversität
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if(speed > 2) {
                this.vx = (this.vx/speed)*2;
                this.vy = (this.vy/speed)*2;
            }
            if (this.selected) {
                this.color = '#00CC66';
                this.size = 3;
            } else {
                this.color = '#333'; 
                this.size = 1;
            }
        }
        
        // Update Position
        this.x += this.vx;
        this.y += this.vy;
        // Abprallen an Rändern
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
 * Hauptanwendung
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
            simBtnDelib: document.getElementById('btn-delib'),
            simAnalysisText: document.getElementById('analysis-text'),
            simEntropyMeter: document.getElementById('entropy-meter')
        };

        this.state = { isLowPerfMode: false };
        this.simState = {
            ctx: null, width: 0, height: 0, particles: [],
            centers: [], mode: 'election', animationFrame: null
        };

        this.init();
    }

    init() {
        this.setupPerfToggle();
        this.setupAudioPlayers();
        
        if (this.DOM.simCanvas && this.DOM.simWrapper) {
            this.setupSimulation();
        }
        
        if (!this.state.isLowPerfMode && window.gsap && window.ScrollTrigger) {
            try {
                this.setupGSAPAnimations();
            } catch (e) {
                console.warn("GSAP Animationen fehlgeschlagen, fahre ohne fort.", e);
                if(this.DOM.mainTitle) this.DOM.mainTitle.style.opacity = 1;
                if(this.DOM.subTitle) this.DOM.subTitle.style.opacity = 1;
            }
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
        });
    }

    setupAudioControls(box) {
        const audio = box.querySelector('audio');
        const playPauseBtn = box.querySelector('.play-pause-btn');
        const progressContainer = box.querySelector('.audio-progress-container');
        const totalTimeEl = box.querySelector('.total-time');
        const speedBtn = box.querySelector('.speed-btn');
        const progressBar = box.querySelector('.audio-progress-bar');
        const currentTimeEl = box.querySelector('.current-time');
        const skipBtns = box.querySelectorAll('.skip-btn');

        if (!audio || !playPauseBtn) return;

        const iconPlay = playPauseBtn.querySelector('.icon-play');
        const iconPause = playPauseBtn.querySelector('.icon-pause');
        
        const updatePlayPauseIcon = () => {
            const isPaused = audio.paused;
            if(iconPlay) iconPlay.style.display = isPaused ? 'block' : 'none';
            if(iconPause) iconPause.style.display = isPaused ? 'none' : 'block';
            playPauseBtn.setAttribute('aria-label', isPaused ? 'Abspielen' : 'Pausieren');
        };
        
        audio.addEventListener('loadedmetadata', () => {
            if(totalTimeEl) totalTimeEl.textContent = this.formatTime(audio.duration);
        });
        
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                if (!this.state.isLowPerfMode && !audio.dataset.visualizerInitialized) {
                    this.initSingleVisualizer(box);
                }
                audio.play().catch(e => console.warn("Autoplay blockiert oder Fehler:", e));
            } else {
                audio.pause();
            }
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
            if (currentTimeEl) currentTimeEl.textContent = this.formatTime(audio.currentTime);
        });

        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newTime = (clickX / rect.width) * audio.duration;
                audio.currentTime = newTime;
            });
        }

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
                audio.playbackRate = speeds[currentSpeedIndex];
                speedBtn.textContent = `${speeds[currentSpeedIndex]}x`;
            });
        }
        updatePlayPauseIcon();
    }

    initSingleVisualizer(box) {
        if (window.innerWidth <= 1024 || !window.AudioContext && !window.webkitAudioContext) return;
        
        const canvas = box.querySelector('.audio-visualizer');
        const audio = box.querySelector('audio');
        if (!canvas || !audio) return;

        try {
            const ctx = canvas.getContext('2d');
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContextClass();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            analyser.fftSize = 128;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            audio.dataset.visualizerInitialized = 'true';

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
            
            audio.addEventListener('play', () => {
                if (audioContext.state === 'suspended') audioContext.resume();
                draw();
            });
        } catch (e) {
            console.warn("Visualizer konnte nicht gestartet werden:", e);
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    setupPerfToggle() {
        if (!this.DOM.perfToggle) return;
        const isLowPerf = localStorage.getItem('lowPerfMode') === 'true';
        this.state.isLowPerfMode = isLowPerf;
        this.DOM.perfToggle.setAttribute('aria-pressed', String(isLowPerf));
        this.DOM.perfToggle.textContent = isLowPerf ? '💤 Animationen aus' : '✨ Animationen an';
        if (this.DOM.body) this.DOM.body.classList.toggle('low-perf-mode', isLowPerf);

        this.DOM.perfToggle.addEventListener('click', () => {
            localStorage.setItem('lowPerfMode', String(!this.state.isLowPerfMode));
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
        gsap.set(subChars, { opacity: 0, y: '100%' });

        gsap.to(mainChars, { opacity: 1, y: '0%', rotationX: 0, duration: 0.8, ease: 'power3.out', stagger: 0.03, delay: 0.5 });
        gsap.to(subChars, { opacity: 1, y: '0%', duration: 0.5, ease: 'power1.out', stagger: 0.01, delay: 1.0 });
        
        document.querySelectorAll('.chapter-section').forEach(section => {
            const title = section.querySelector('.chapter-title');
            if (title) {
                 gsap.from(title, {
                    y: 100, opacity: 0, ease: "power2.out",
                    scrollTrigger: { trigger: section, start: "top 80%", end: "top 20%", scrub: true, toggleActions: "play none none reverse" }
                });
            }
        });

        if (this.DOM.narrativePath && this.DOM.focusPane) {
            const pathLength = this.DOM.narrativePath.getTotalLength();
            this.DOM.narrativePath.style.strokeDasharray = pathLength;
            this.DOM.narrativePath.style.strokeDashoffset = pathLength;
            gsap.to(this.DOM.narrativePath, {
                strokeDashoffset: 0, ease: "none",
                scrollTrigger: { trigger: this.DOM.focusPane, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true }
            });
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
        }, { root: null, rootMargin: '0px', threshold: 0.3 });
        this.DOM.sections.forEach(section => observer.observe(section));
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
        this.simState.particles.forEach(p => {
            p.width = this.simState.width;
            p.height = this.simState.height;
        });
    }

    loopSimulation() {
        if (!this.simState.ctx) return;
        this.simState.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);
        
        this.simState.particles.forEach(p => {
            p.update(this.simState.mode, this.simState.centers);
            p.draw(this.simState.ctx);
        });

        if(this.simState.mode === 'election') {
            this.simState.ctx.beginPath();
            this.simState.ctx.arc(this.simState.centers[0].x, this.simState.centers[0].y, 5, 0, Math.PI*2);
            this.simState.ctx.fillStyle = '#FF3333';
            this.simState.ctx.fill();
            this.simState.ctx.beginPath();
            this.simState.ctx.arc(this.simState.centers[1].x, this.simState.centers[1].y, 5, 0, Math.PI*2);
            this.simState.ctx.fillStyle = '#00CC66';
            this.simState.ctx.fill();
        }
        
        // === VISUALISIERUNG DER VERNETZUNG (Deliberation) ===
        if (this.simState.mode === 'deliberation') {
            const selectedParticles = this.simState.particles.filter(p => p.selected);
            this.simState.ctx.beginPath();
            this.simState.ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)'; // Dezentes Lila
            this.simState.ctx.lineWidth = 1;
            
            // Verbindet ausgewählte Partikel miteinander, wenn sie nahe sind
            for (let i = 0; i < selectedParticles.length; i++) {
                for (let j = i + 1; j < selectedParticles.length; j++) {
                    const p1 = selectedParticles[i];
                    const p2 = selectedParticles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < 120) { // Verbindungsschwelle
                        this.simState.ctx.moveTo(p1.x, p1.y);
                        this.simState.ctx.lineTo(p2.x, p2.y);
                    }
                }
            }
            this.simState.ctx.stroke();
        }

        this.simState.animationFrame = requestAnimationFrame(() => this.loopSimulation());
    }

    setSimMode(newMode) {
        if (this.simState.mode === newMode) return;
        this.simState.mode = newMode;
        
        const alertSpan = `<span style="color: var(--alert);">Gravitationszentren</span>`;
        const logicSpan = `<span style="color: var(--logic);">Querschnitt</span>`;
        const delibSpan = `<span style="color: var(--delib);">Konsens</span>`;

        if(this.DOM.simBtnElect) this.DOM.simBtnElect.classList.remove('active-mode');
        if(this.DOM.simBtnSort) this.DOM.simBtnSort.classList.remove('active-mode');
        if(this.DOM.simBtnDelib) this.DOM.simBtnDelib.classList.remove('active-mode');

        if (newMode === 'election') {
            this.DOM.simBtnElect.classList.add('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Das Wahlsystem erzeugt ${alertSpan} (Parteien). Die Gesellschaft polarisiert sich. Ränder verhärten.`;
            this.DOM.simEntropyMeter.textContent = "POLARIZED";
            this.DOM.simEntropyMeter.style.color = "var(--alert)";
        } else if (newMode === 'sortition') {
            this.DOM.simBtnSort.classList.add('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Zufallsauswahl durchbricht die Blasen. Ein ${logicSpan} der Bevölkerung bildet sich. Hohe kognitive Diversität.`;
            this.DOM.simEntropyMeter.textContent = "OPTIMAL";
            this.DOM.simEntropyMeter.style.color = "var(--logic)";
        } else if (newMode === 'deliberation') {
            this.DOM.simBtnDelib.classList.add('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Durch Beratung nähern sich die Positionen an. Ein ${delibSpan} entsteht jenseits der Parteilinien.`;
            this.DOM.simEntropyMeter.textContent = "CONSENSUS";
            this.DOM.simEntropyMeter.style.color = "var(--delib)";
        }
    }
}

// === KRITISCHE INITIALISIERUNG ===
const startApplication = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }

    try {
        window.dossier = new PhoenixDossier();
        console.log("Mission Freiheit: Gestartet.");
    } catch (e) {
        console.error("Kritischer Startfehler:", e);
        document.body.style.overflow = 'auto';
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApplication);
} else {
    startApplication();
}
