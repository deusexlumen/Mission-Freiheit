// MISSION FREIHEIT v1.1 - POLISHED
// Features: Battery-Saving Simulation, Smooth UI, Robust Audio Sync

/**
 * TranscriptSynchronizer
 * Verbindet Audio mit Text, inklusive Auto-Scroll und Klick-Navigation.
 */
class TranscriptSynchronizer {
    constructor(box) {
        this.box = box;
        this.audio = box.querySelector('audio');
        this.transcriptContainer = box.querySelector('.transcript-container');
        this.toggleBtn = box.querySelector('.transcript-toggle-btn');
        
        if (!this.audio || !this.transcriptContainer) return;
        
        this.cues = Array.from(this.transcriptContainer.querySelectorAll('p[data-start]'));

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
        
        // Throttling für das 'timeupdate' Event wäre hier noch eine Micro-Optimierung, 
        // aber für Text-Highlighting ist 250ms Intervall des Browsers okay.
        this.audio.addEventListener('timeupdate', () => this.sync());
        
        this.cues.forEach(cue => {
            cue.addEventListener('click', () => {
                const time = parseFloat(cue.dataset.start);
                if (!isNaN(time)) {
                    this.audio.currentTime = time;
                    if (this.audio.paused) this.audio.play();
                }
            });
        });
    }

    toggle() {
        const isHidden = this.transcriptContainer.hidden;
        this.transcriptContainer.hidden = !isHidden;
        this.toggleBtn.setAttribute('aria-expanded', String(!isHidden));
        this.toggleBtn.textContent = isHidden ? 'Transkript ausblenden' : 'Transkript anzeigen';
    }

    sync() {
        if (this.transcriptContainer.hidden || this.audio.paused) return;
        
        const time = this.audio.currentTime;
        let activeCue = null;
        
        // Effiziente Suche
        this.cues.forEach(cue => {
            const start = parseFloat(cue.dataset.start);
            const end = parseFloat(cue.dataset.end || start + 10); // Fallback Endzeit
            
            // "Active" Klasse setzen/entfernen
            if (time >= start && time < end) {
                cue.classList.add('active-cue');
                activeCue = cue;
            } else {
                cue.classList.remove('active-cue');
            }
        });

        // Smart Scrolling
        if (activeCue) {
            this.scrollToCue(activeCue);
        }
    }
    
    scrollToCue(cue) {
        const container = this.transcriptContainer;
        const cueTop = cue.offsetTop;
        const containerTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        
        // Nur scrollen, wenn Element nicht im sichtbaren Bereich (plus Puffer)
        if (cueTop < containerTop + 20 || cueTop > containerTop + containerHeight - 50) {
            container.scrollTo({
                top: cueTop - 60,
                behavior: 'smooth'
            });
        }
    }
}

/**
 * Particle System (Optimized)
 */
class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5 + 0.5;
        this.color = '#444444';
        this.selected = false;
        this.preference = Math.random(); // 0...1
    }

    update(mode, centers, width, height) {
        // Update bounds dynamisch falls Resizing passiert ist
        this.width = width;
        this.height = height;

        if (mode === 'election') {
            // Logik: Wahlmodus (Anziehung)
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let distSq = dx*dx + dy*dy;
            let dist = Math.sqrt(distSq);
            
            if(dist > 5) {
                const force = 0.05;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
            
            // Friktion
            this.vx *= 0.95;
            this.vy *= 0.95;
            
            this.color = this.preference < 0.5 ? '#FF3333' : '#00CC66';
            this.size = 1.5;
            
        } else {
            // Logik: Losmodus (Brownsche Bewegung / Freiheit)
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
            
            // Limit Speed
            const speedSq = this.vx*this.vx + this.vy*this.vy;
            if(speedSq > 4) {
                const speed = Math.sqrt(speedSq);
                this.vx = (this.vx/speed)*2;
                this.vy = (this.vy/speed)*2;
            }
            
            this.color = this.selected ? '#00CC66' : '#30363d'; // Dunkleres Grau für Nicht-Selektierte
            this.size = this.selected ? 3.5 : 1;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce Walls
        if (this.x < 0 || this.x > this.width) { this.vx *= -1; this.x = Math.max(0, Math.min(this.width, this.x)); }
        if (this.y < 0 || this.y > this.height) { this.vy *= -1; this.y = Math.max(0, Math.min(this.height, this.y)); }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * PhoenixDossier - Main Application
 */
class PhoenixDossier {
    constructor() {
        this.DOM = {
            body: document.body,
            simCanvas: document.getElementById('sim-canvas'),
            simWrapper: document.getElementById('canvas-wrapper'),
            perfToggle: document.getElementById('perf-toggle')
        };
        
        this.state = {
            isLowPerf: localStorage.getItem('lowPerfMode') === 'true',
            isSimVisible: true
        };
        
        this.sim = {
            ctx: null,
            particles: [],
            centers: [],
            mode: 'election',
            animationId: null,
            observer: null
        };

        this.init();
    }

    init() {
        this.setupPerfToggle();
        this.setupAudioSystems();
        this.setupTakeaways();
        this.setupScrollSpy();
        this.setupShare();
        
        // GSAP nur laden, wenn nicht Low-Perf
        if (!this.state.isLowPerf && window.gsap && window.ScrollTrigger) {
            this.setupAnimations();
        } else {
            document.body.classList.add('low-perf-mode');
            // Fallback Opacity für Titel
            const titles = document.querySelectorAll('#title-split, #subtitle-split');
            titles.forEach(t => t.style.opacity = 1);
        }

        if (this.DOM.simCanvas) {
            this.initSimulation();
        }
    }

    setupAudioSystems() {
        document.querySelectorAll('.audio-feature-box:not(.sim-controls)').forEach(box => {
            new TranscriptSynchronizer(box);
            this.setupAudioPlayer(box);
            // Visualizer nur auf Desktop & High Perf
            if (!this.state.isLowPerf && window.innerWidth > 1024) {
                this.setupVisualizer(box);
            }
        });
    }

    setupAudioPlayer(box) {
        const audio = box.querySelector('audio');
        const playBtn = box.querySelector('.play-pause-btn');
        const progressContainer = box.querySelector('.audio-progress-container');
        const progressBar = box.querySelector('.audio-progress-bar');
        const timeEl = box.querySelector('.current-time');
        const totalEl = box.querySelector('.total-time');
        
        if (!audio || !playBtn) return;

        // UI Helpers
        const setIcon = (state) => {
            const playIcon = playBtn.querySelector('.icon-play');
            const pauseIcon = playBtn.querySelector('.icon-pause');
            if(playIcon) playIcon.style.display = state === 'play' ? 'block' : 'none';
            if(pauseIcon) pauseIcon.style.display = state === 'pause' ? 'block' : 'none';
        };

        // Events
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                // Alle anderen Audios stoppen (optional, aber nice to have)
                document.querySelectorAll('audio').forEach(a => { if(a !== audio) a.pause(); });
                audio.play();
            } else {
                audio.pause();
            }
        });

        audio.addEventListener('play', () => setIcon('pause'));
        audio.addEventListener('pause', () => setIcon('play'));
        audio.addEventListener('loadedmetadata', () => totalEl.textContent = this.fmtTime(audio.duration));
        audio.addEventListener('timeupdate', () => {
            if (progressBar) progressBar.style.width = (audio.currentTime / audio.duration * 100) + '%';
            if (timeEl) timeEl.textContent = this.fmtTime(audio.currentTime);
        });
        
        // Seek
        if(progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if(isFinite(audio.duration)) audio.currentTime = pos * audio.duration;
            });
        }
        
        // Speed Control
        const speedBtn = box.querySelector('.speed-btn');
        if(speedBtn) {
            speedBtn.addEventListener('click', () => {
                let r = audio.playbackRate;
                r = (r >= 2) ? 1 : r + 0.25;
                audio.playbackRate = r;
                speedBtn.textContent = r + 'x';
            });
        }
        
        // Skip Buttons
        box.querySelectorAll('.skip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                audio.currentTime += parseFloat(btn.dataset.skip);
            });
        });

        setIcon('play');
    }

    setupVisualizer(box) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        
        const canvas = box.querySelector('.audio-visualizer');
        const audio = box.querySelector('audio');
        if(!canvas || !audio) return;

        // Kontext erst bei User-Interaktion (Play) erstellen
        let ctx, analyser, dataArray;
        let initialized = false;

        const initAudioCtx = () => {
            if(initialized) return;
            try {
                const Actx = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new Actx();
                analyser = audioCtx.createAnalyser();
                const source = audioCtx.createMediaElementSource(audio);
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                analyser.fftSize = 64; // Weniger Balken = Retro Look
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                initialized = true;
            } catch(e) { console.warn("Visualizer Init failed", e); }
        };

        const canvasCtx = canvas.getContext('2d');
        const draw = () => {
            if(!initialized || audio.paused) return;
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            const barW = (canvas.width / dataArray.length) * 2.5;
            let x = 0;
            
            for(let i = 0; i < dataArray.length; i++) {
                const barH = dataArray[i] / 2;
                canvasCtx.fillStyle = `rgba(6, 182, 212, ${dataArray[i]/255})`; // Cyan
                canvasCtx.fillRect(x, canvas.height - barH, barW, barH);
                x += barW + 1;
            }
        };

        audio.addEventListener('play', () => {
            initAudioCtx();
            draw();
        });
    }

    // --- SIMULATION ENGINE (Mit Performance Saver) ---
    initSimulation() {
        this.sim.ctx = this.DOM.simCanvas.getContext('2d');
        
        // Resize Listener
        const resize = () => {
            const w = this.DOM.simWrapper.offsetWidth;
            const h = this.DOM.simWrapper.offsetHeight;
            this.DOM.simCanvas.width = w;
            this.DOM.simCanvas.height = h;
            this.sim.centers = [{x: w*0.25, y: h*0.5}, {x: w*0.75, y: h*0.5}];
        };
        window.addEventListener('resize', resize);
        resize();

        // Partikel erzeugen
        for(let i=0; i<600; i++) this.sim.particles.push(new Particle(this.DOM.simCanvas.width, this.DOM.simCanvas.height));
        // Los-Auswahl treffen
        const subset = new Set();
        while(subset.size < 40) subset.add(Math.floor(Math.random() * 600));
        subset.forEach(idx => this.sim.particles[idx].selected = true);

        // UI Controls
        document.getElementById('btn-elect')?.addEventListener('click', () => this.setSimMode('election'));
        document.getElementById('btn-sort')?.addEventListener('click', () => this.setSimMode('sortition'));

        // Performance: Nur rendern wenn sichtbar!
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.state.isSimVisible = entry.isIntersecting;
                if(entry.isIntersecting) this.loopSim();
            });
        }, { threshold: 0.1 });
        observer.observe(this.DOM.simWrapper);
    }

    setSimMode(mode) {
        this.sim.mode = mode;
        const btnElect = document.getElementById('btn-elect');
        const btnSort = document.getElementById('btn-sort');
        const txt = document.getElementById('analysis-text');
        const meter = document.getElementById('entropy-meter');

        if(mode === 'election') {
            btnElect.classList.add('active-mode');
            btnSort.classList.remove('active-mode');
            txt.innerHTML = `Das Wahlsystem erzeugt <span style="color:var(--alert)">Gravitationszentren</span>. Polarisierung entsteht.`;
            meter.textContent = "POLARIZED";
            meter.style.color = "var(--alert)";
        } else {
            btnSort.classList.add('active-mode');
            btnElect.classList.remove('active-mode');
            txt.innerHTML = `Zufallsauswahl erzeugt einen <span style="color:var(--logic)">Querschnitt</span> der Bevölkerung. Maximale Diversität.`;
            meter.textContent = "OPTIMAL";
            meter.style.color = "var(--logic)";
        }
    }

    loopSim() {
        if(!this.state.isSimVisible) return; // Stop Loop
        
        const { ctx } = this.sim;
        const w = this.DOM.simCanvas.width;
        const h = this.DOM.simCanvas.height;

        // Trail Effect
        ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        ctx.fillRect(0, 0, w, h);

        this.sim.particles.forEach(p => {
            p.update(this.sim.mode, this.sim.centers, w, h);
            p.draw(ctx);
        });

        if(this.sim.mode === 'election') {
            this.sim.centers.forEach((c, i) => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, 6, 0, Math.PI*2);
                ctx.fillStyle = i===0 ? '#FF3333' : '#00CC66';
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 0;
            });
        }

        requestAnimationFrame(() => this.loopSim());
    }

    // --- UTILS & SETUP ---
    setupAnimations() {
        gsap.registerPlugin(ScrollTrigger);
        
        // Titel
        const splitText = (el) => {
            const txt = el.textContent;
            el.textContent = '';
            return [...txt].map(char => {
                const s = document.createElement('span');
                s.textContent = char;
                s.style.display='inline-block';
                if(char === ' ') s.style.width='0.3em';
                el.appendChild(s);
                return s;
            });
        };
        
        const titleChars = splitText(document.getElementById('title-split'));
        const subChars = splitText(document.getElementById('subtitle-split'));
        
        gsap.from(titleChars, {
            y: 100, opacity: 0, rotateX: -90, stagger: 0.02, duration: 1, ease: "back.out(1.7)"
        });
        gsap.from(subChars, {
            y: 20, opacity: 0, stagger: 0.01, duration: 0.8, delay: 0.5
        });

        // Thread
        const path = document.querySelector('.narrative-thread-path');
        if(path) {
            const l = path.getTotalLength();
            path.style.strokeDasharray = l;
            path.style.strokeDashoffset = l;
            gsap.to(path, {
                strokeDashoffset: 0, ease: "none",
                scrollTrigger: {
                    trigger: ".focus-pane", start: "top top", end: "bottom bottom", scrub: 1
                }
            });
        }
        
        // Chapter Fade In
        document.querySelectorAll('.chapter-section').forEach(sect => {
            gsap.from(sect.querySelector('h2'), {
                x: -50, opacity: 0, duration: 0.8,
                scrollTrigger: { trigger: sect, start: "top 85%" }
            });
        });
    }

    setupScrollSpy() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('section[id]');
        
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if(e.isIntersecting) {
                    navItems.forEach(n => {
                        n.classList.toggle('active', n.getAttribute('href') === `#${e.target.id}`);
                    });
                }
            });
        }, { rootMargin: '-20% 0px -60% 0px' }); // Fokusbereich in der Mitte
        
        sections.forEach(s => observer.observe(s));
    }

    setupTakeaways() {
        const list = document.querySelector('#knowledge-distillate ul');
        if(!list) return;
        document.querySelectorAll('section[data-takeaway]').forEach(s => {
            if(s.id === 'part0') return;
            const li = document.createElement('li');
            li.innerHTML = `<strong style="color:var(--primary-color)">${s.querySelector('.chapter-number').textContent}</strong> ${s.dataset.takeaway}`;
            list.appendChild(li);
        });
    }

    setupShare() {
        const url = encodeURIComponent(window.location.href);
        const txt = encodeURIComponent("Mission Freiheit: Eine Analyse der Demokratiekrise.");
        const map = {
            'share-email': `mailto:?subject=${txt}&body=${url}`,
            'share-x': `https://twitter.com/intent/tweet?url=${url}&text=${txt}`,
            'share-facebook': `https://www.facebook.com/sharer/sharer.php?u=${url}`
        };
        for(const [id, link] of Object.entries(map)) {
            const el = document.getElementById(id);
            if(el) el.href = link;
        }
    }

    setupPerfToggle() {
        if(!this.DOM.perfToggle) return;
        const update = () => {
            this.DOM.perfToggle.innerHTML = this.state.isLowPerf ? '⚡ Performance: High' : '🔋 Performance: Eco';
            this.DOM.body.classList.toggle('low-perf-mode', this.state.isLowPerf);
        };
        update();
        this.DOM.perfToggle.addEventListener('click', () => {
            this.state.isLowPerf = !this.state.isLowPerf;
            localStorage.setItem('lowPerfMode', this.state.isLowPerf);
            window.location.reload();
        });
    }

    fmtTime(s) {
        if(isNaN(s)) return "00:00";
        return new Date(s * 1000).toISOString().substr(14, 5);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('preloader');
    if(loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => loader.style.display='none', 500);
        }, 800); // Künstliche Verzögerung für Smoothness
    }
    window.app = new PhoenixDossier();
});
