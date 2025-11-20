// MISSION FREIHEIT V2.0 - FINAL
// Features: Audio Sync, Canvas Physik Engine (Resilienz & Deliberation), GSAP Animationen

/**
 * Klasse für Audio-Transkript Synchronisation
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
            this.toggleBtn.addEventListener('click', () => {
                const isHidden = this.transcriptContainer.hidden;
                this.transcriptContainer.hidden = !isHidden;
                this.toggleBtn.textContent = isHidden ? 'Transkript ausblenden' : 'Transkript anzeigen';
                this.toggleBtn.setAttribute('aria-expanded', String(!isHidden));
            });
        }
        
        this.audio.addEventListener('timeupdate', () => this.sync());
        this.cues.forEach(cue => {
            cue.addEventListener('click', () => {
                this.audio.currentTime = parseFloat(cue.dataset.start);
                if (this.audio.paused) this.audio.play();
            });
        });
    }

    sync() {
        if (this.transcriptContainer.hidden || this.audio.paused) return;
        const time = this.audio.currentTime;
        let activeCue = null;
        this.cues.forEach(cue => {
            const start = parseFloat(cue.dataset.start);
            const end = parseFloat(cue.dataset.end || Infinity);
            if (time >= start && time < end) {
                cue.classList.add('active-cue');
                activeCue = cue;
            } else {
                cue.classList.remove('active-cue');
            }
        });
        if (activeCue) {
            this.transcriptContainer.scrollTop = activeCue.offsetTop - (this.transcriptContainer.clientHeight / 2) + (activeCue.offsetHeight / 2);
        }
    }
}

/**
 * Partikel-Logik für die Simulation
 */
class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5 + 0.5;
        this.color = '#444';
        this.selected = false; 
        this.preference = Math.random(); 
        this.friction = 0.94;
    }
    
    update(mode, centers, mouse) {
        // 1. Modus-Verhalten
        if (mode === 'election') {
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist > 10) {
                this.vx += (dx / dist) * 0.08; 
                this.vy += (dy / dist) * 0.08;
            }
            this.friction = 0.92; 
            this.color = this.preference < 0.5 ? '#FF3333' : '#00CC66'; 
            this.size = 1.5;
        } 
        else if (mode === 'deliberation') {
            if (this.selected) {
                this.vx += (Math.random() - 0.5) * 0.03;
                this.vy += (Math.random() - 0.5) * 0.03;
                let dx = (this.width / 2) - this.x;
                let dy = (this.height / 2) - this.y;
                this.vx += dx * 0.0004;
                this.vy += dy * 0.0004;
                this.friction = 0.9;
                this.color = '#F59E0B';
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
            this.color = this.selected ? '#00CC66' : '#333';
            this.size = this.selected ? 3 : 1;
        }

        // 2. Maus Interaktion (Stress-Test)
        if (mouse.isPressed) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 250) {
                let force = (250 - dist) / 250; 
                let angle = Math.atan2(dy, dx);
                let factor = (mode === 'election') ? 15 : (mode === 'deliberation' ? 3 : 5);
                this.vx += Math.cos(angle) * force * factor;
                this.vy += Math.sin(angle) * force * factor;
            }
        }

        // 3. Physik anwenden
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
        
        // Ränder
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
 * Hauptklasse
 */
class PhoenixDossier {
    constructor() {
        this.DOM = {
            simCanvas: document.getElementById('sim-canvas'),
            simWrapper: document.getElementById('canvas-wrapper'),
            simBtnElect: document.getElementById('btn-elect'),
            simBtnSort: document.getElementById('btn-sort'),
            simBtnDelib: document.getElementById('btn-delib'),
            simAnalysisText: document.getElementById('analysis-text'),
            simEntropyMeter: document.getElementById('entropy-meter'),
            narrativePath: document.querySelector('.narrative-thread-path'),
            mainTitle: document.getElementById('title-split'),
            subTitle: document.getElementById('subtitle-split'),
            perfToggle: document.getElementById('perf-toggle'),
            body: document.body,
            focusPane: document.querySelector('.focus-pane')
        };
        this.simState = { ctx: null, width: 0, height: 0, particles: [], centers: [], mode: 'election', mouse: {x:0, y:0, isPressed:false} };
        this.init();
    }

    init() {
        this.setupSimulation();
        this.setupAudioPlayers();
        this.setupGSAPAnimations();
        this.generateTakeaways();
        this.setupScrollSpy();
        
        // Performance Toggle
        if(this.DOM.perfToggle) {
            this.DOM.perfToggle.addEventListener('click', () => {
                const lowPerf = localStorage.getItem('lowPerfMode') === 'true';
                localStorage.setItem('lowPerfMode', !lowPerf);
                window.location.reload();
            });
        }
        
        // Preloader weg
        const pl = document.getElementById('preloader');
        if(pl) {
            pl.classList.add('hidden');
            setTimeout(() => pl.style.display = 'none', 500);
        }
    }

    setupAudioPlayers() {
        document.querySelectorAll('.audio-feature-box').forEach(box => {
            if (box.classList.contains('sim-controls')) return;
            new TranscriptSynchronizer(box);
            
            const audio = box.querySelector('audio');
            const btn = box.querySelector('.play-pause-btn');
            const progress = box.querySelector('.audio-progress-bar');
            const timeEl = box.querySelector('.current-time');
            const totalEl = box.querySelector('.total-time');
            
            if (audio && btn) {
                const updateIcon = () => {
                    const iconPlay = btn.querySelector('.icon-play');
                    const iconPause = btn.querySelector('.icon-pause');
                    if(iconPlay) iconPlay.style.display = audio.paused ? 'block' : 'none';
                    if(iconPause) iconPause.style.display = audio.paused ? 'none' : 'block';
                };
                
                btn.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
                audio.addEventListener('play', updateIcon);
                audio.addEventListener('pause', updateIcon);
                
                audio.addEventListener('loadedmetadata', () => {
                    if(totalEl) totalEl.textContent = this.formatTime(audio.duration);
                });
                
                audio.addEventListener('timeupdate', () => {
                    if(progress) progress.style.width = (audio.currentTime / audio.duration) * 100 + '%';
                    if(timeEl) timeEl.textContent = this.formatTime(audio.currentTime);
                });
                
                // Klick auf Progressbar
                const pCont = box.querySelector('.audio-progress-container');
                if(pCont) {
                    pCont.addEventListener('click', (e) => {
                        const rect = pCont.getBoundingClientRect();
                        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
                    });
                }
                
                // Visualizer
                if (window.innerWidth > 1024 && localStorage.getItem('lowPerfMode') !== 'true') {
                    const canvas = box.querySelector('.audio-visualizer');
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        let audioCtx, analyser, src;
                        
                        const startVis = () => {
                            if (!audioCtx) {
                                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                                analyser = audioCtx.createAnalyser();
                                src = audioCtx.createMediaElementSource(audio);
                                src.connect(analyser);
                                analyser.connect(audioCtx.destination);
                            }
                            const bufferLength = analyser.frequencyBinCount;
                            const dataArray = new Uint8Array(bufferLength);
                            
                            const draw = () => {
                                if (audio.paused) return;
                                requestAnimationFrame(draw);
                                analyser.getByteFrequencyData(dataArray);
                                ctx.clearRect(0,0,canvas.width,canvas.height);
                                const barWidth = canvas.width / bufferLength * 2.5;
                                let x = 0;
                                for(let i=0; i<bufferLength; i++) {
                                    const barHeight = dataArray[i]/2;
                                    ctx.fillStyle = `rgba(6,182,212,${barHeight/100})`;
                                    ctx.fillRect(x, canvas.height-barHeight, barWidth, barHeight);
                                    x += barWidth + 1;
                                }
                            };
                            draw();
                        };
                        // AudioContext darf erst nach User-Geste starten
                        audio.addEventListener('play', () => {
                            if(!audioCtx) startVis();
                        });
                    }
                }
            }
        });
    }
    
    formatTime(s) {
        if(isNaN(s)) return "00:00";
        const m = Math.floor(s/60);
        const sec = Math.floor(s%60);
        return `${m < 10 ? '0'+m : m}:${sec < 10 ? '0'+sec : sec}`;
    }

    setupSimulation() {
        if (!this.DOM.simCanvas) return;
        this.simState.ctx = this.DOM.simCanvas.getContext('2d');
        this.resizeSimulation();
        window.addEventListener('resize', () => this.resizeSimulation());

        // Partikel erstellen
        this.simState.particles = [];
        for(let i=0; i<800; i++) this.simState.particles.push(new Particle(this.simState.width, this.simState.height));
        
        const indices = new Set();
        while(indices.size < 50) indices.add(Math.floor(Math.random() * 800));
        indices.forEach(i => this.simState.particles[i].selected = true);

        // Button Listener
        if(this.DOM.simBtnElect) this.DOM.simBtnElect.addEventListener('click', () => this.setSimMode('election'));
        if(this.DOM.simBtnSort) this.DOM.simBtnSort.addEventListener('click', () => this.setSimMode('sortition'));
        if(this.DOM.simBtnDelib) this.DOM.simBtnDelib.addEventListener('click', () => this.setSimMode('deliberation'));

        // Maus/Touch Events
        const c = this.DOM.simCanvas;
        const getPos = (e) => {
            const r = c.getBoundingClientRect();
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: x - r.left, y: y - r.top };
        };
        const start = (e) => { this.simState.mouse.isPressed = true; const p = getPos(e); this.simState.mouse.x = p.x; this.simState.mouse.y = p.y; };
        const move = (e) => { if(this.simState.mouse.isPressed) { const p = getPos(e); this.simState.mouse.x = p.x; this.simState.mouse.y = p.y; } };
        const end = () => this.simState.mouse.isPressed = false;

        c.addEventListener('mousedown', start); window.addEventListener('mouseup', end); c.addEventListener('mousemove', move);
        c.addEventListener('touchstart', (e)=>{start(e); e.preventDefault();}, {passive:false}); 
        window.addEventListener('touchend', end); 
        c.addEventListener('touchmove', (e)=>{move(e); e.preventDefault();}, {passive:false});

        this.loopSimulation();
    }

    resizeSimulation() {
        if (!this.DOM.simWrapper) return;
        this.simState.width = this.DOM.simWrapper.offsetWidth;
        this.simState.height = this.DOM.simWrapper.offsetHeight;
        this.DOM.simCanvas.width = this.simState.width;
        this.DOM.simCanvas.height = this.simState.height;
        this.simState.centers = [{x: this.simState.width*0.25, y: this.simState.height*0.5}, {x: this.simState.width*0.75, y: this.simState.height*0.5}];
        this.simState.particles.forEach(p => { p.width = this.simState.width; p.height = this.simState.height; });
    }

    loopSimulation() {
        if (!this.simState.ctx) return;
        const ctx = this.simState.ctx;
        ctx.fillStyle = 'rgba(5, 5, 5, 0.25)';
        ctx.fillRect(0, 0, this.simState.width, this.simState.height);

        // Externe Schockwelle
        if (this.simState.mouse.isPressed) {
            ctx.beginPath(); ctx.arc(this.simState.mouse.x, this.simState.mouse.y, 30, 0, Math.PI*2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.stroke();
            ctx.fillStyle = "white"; ctx.fillText("EXTERNER SCHOCK", this.simState.mouse.x + 40, this.simState.mouse.y);
        }

        this.simState.particles.forEach(p => {
            p.update(this.simState.mode, this.simState.centers, this.simState.mouse);
            p.draw(ctx);
        });

        // Deliberation: Synapsen zeichnen
        if (this.simState.mode === 'deliberation') {
            const active = this.simState.particles.filter(p => p.selected);
            ctx.lineWidth = 0.8;
            for (let i = 0; i < active.length; i++) {
                for (let j = i + 1; j < active.length; j++) {
                    const p1 = active[i], p2 = active[j];
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    if (dist < 130) {
                        const alpha = (1 - dist/130) + (this.simState.mouse.isPressed ? 0.3 : 0);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(245, 158, 11, ${Math.min(1, alpha)})`;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        // Kohäsion
                        const pull = this.simState.mouse.isPressed ? 0.003 : 0.0005;
                        p1.vx -= (p1.x - p2.x) * pull; p1.vy -= (p1.y - p2.y) * pull;
                        p2.vx += (p1.x - p2.x) * pull; p2.vy += (p1.y - p2.y) * pull;
                    }
                }
            }
        }

        if(this.simState.mode === 'election') {
            ctx.beginPath(); ctx.arc(this.simState.centers[0].x, this.simState.centers[0].y, 5, 0, Math.PI*2); ctx.fillStyle = '#FF3333'; ctx.fill();
            ctx.beginPath(); ctx.arc(this.simState.centers[1].x, this.simState.centers[1].y, 5, 0, Math.PI*2); ctx.fillStyle = '#00CC66'; ctx.fill();
        }
        requestAnimationFrame(() => this.loopSimulation());
    }

    setSimMode(newMode) {
        this.simState.mode = newMode;
        [this.DOM.simBtnElect, this.DOM.simBtnSort, this.DOM.simBtnDelib].forEach(b => b && b.classList.remove('active-mode'));
        
        const map = {
            'election': { btn: this.DOM.simBtnElect, text: 'Das Wahlsystem erzeugt <span style="color:var(--alert)">Polarisierung</span>.', label: 'KRITISCH', color: 'var(--alert)' },
            'sortition': { btn: this.DOM.simBtnSort, text: 'Das Losverfahren erzeugt <span style="color:var(--logic)">Diversität</span>.', label: 'POTENTIAL', color: 'var(--logic)' },
            'deliberation': { btn: this.DOM.simBtnDelib, text: 'Beratung erzeugt <span style="color:var(--deliberation)">Resilienz</span>. Das Netz hält stand.', label: 'STABIL', color: 'var(--deliberation)' }
        };
        
        const current = map[newMode];
        if(current.btn) current.btn.classList.add('active-mode');
        this.DOM.simAnalysisText.innerHTML = current.text;
        this.DOM.simEntropyMeter.textContent = current.label;
        this.DOM.simEntropyMeter.style.color = current.color;
    }

    setupGSAPAnimations() {
        if (!window.gsap || !window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);
        
        const split = (id) => {
            const el = document.getElementById(id);
            if(!el) return [];
            const text = el.textContent; el.textContent = '';
            return text.split('').map(c => {
                const s = document.createElement('span');
                s.textContent = c === ' ' ? '\u00A0' : c;
                s.style.display = 'inline-block';
                el.appendChild(s);
                return s;
            });
        };

        const titleChars = split('title-split');
        const subChars = split('subtitle-split');

        gsap.from(titleChars, { opacity: 0, y: 50, rotateX: -90, stagger: 0.05, duration: 0.8, ease: "back.out" });
        gsap.from(subChars, { opacity: 0, y: 20, stagger: 0.02, duration: 0.6, delay: 0.5 });

        const path = this.DOM.narrativePath;
        if (path) {
            const len = path.getTotalLength();
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = len;
            gsap.to(path, {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: { trigger: ".focus-pane", start: "top top", end: "bottom bottom", scrub: 1 }
            });
        }
    }
    
    setupScrollSpy() {
        const sections = document.querySelectorAll('.chapter-section');
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if(e.isIntersecting) {
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    const active = document.querySelector(`.nav-item[href="#${e.target.id}"]`);
                    if(active) active.classList.add('active');
                }
            });
        }, { threshold: 0.3 });
        sections.forEach(s => obs.observe(s));
    }

    generateTakeaways() {
        const list = document.querySelector('#knowledge-distillate ul');
        if(!list) return;
        document.querySelectorAll('section[data-takeaway]').forEach(s => {
            if(s.id === 'part0') return;
            const li = document.createElement('li');
            const num = s.querySelector('.chapter-number')?.textContent || '';
            li.innerHTML = `<strong>Teil ${num.replace('.','')}</strong>: ${s.dataset.takeaway}`;
            list.appendChild(li);
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new PhoenixDossier();
});
