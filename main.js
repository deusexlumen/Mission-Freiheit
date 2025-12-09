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
        const isHidden = this.transcriptContainer.hidden;
        this.transcriptContainer.hidden = !isHidden;
        this.toggleBtn.textContent = isHidden ? 'Transkript schließen' : 'Transkript öffnen';
        if(isHidden) {
             setTimeout(() => {
                this.transcriptContainer.scrollIntoView({behavior: "smooth", block: "center"});
             }, 100);
        }
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

        if (activeCue) {
            activeCue.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
}

/**
 * Particle
 * Visualisiert Bürger im Simulations-Canvas.
 */
class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 0.5;
        this.color = 'rgba(241, 245, 249, 0.3)'; 
        this.selected = false; 
        this.preference = Math.random(); 
    }
    
    update(mode, centers) {
        if (mode === 'election') {
            // WAHL-MODUS
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
            
            this.color = this.preference < 0.5 ? '#fb7185' : '#4ade80'; // Neon Rot / Grün
            this.size = 2;
        } else { 
            // LOS-MODUS
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if(speed > 2) {
                this.vx = (this.vx/speed)*2;
                this.vy = (this.vy/speed)*2;
            }
            if (this.selected) {
                this.color = '#22d3ee'; // Neon Cyan
                this.size = 3.5;
            } else {
                this.color = 'rgba(241, 245, 249, 0.2)'; 
                this.size = 1;
            }
        }
        
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > this.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.height) this.vy *= -1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        if(this.selected) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}


/**
 * PhoenixDossier
 * Hauptsteuerung.
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
            particles: [], centers: [], mode: 'election', animationFrame: null
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
            this.setupGSAP();
        }
        
        this.generateTakeaways();
        this.setupScrollSpy();
        
        const preloader = document.getElementById('preloader');
        if(preloader) {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 800);
        }
    }
    
    setupGSAP() {
        gsap.registerPlugin(ScrollTrigger);
        
        gsap.from("#title-anim", {
            duration: 1.5, y: 100, opacity: 0, ease: "power4.out", delay: 0.5
        });
        
        document.querySelectorAll('.chapter-section').forEach(section => {
            gsap.from(section, {
                opacity: 0, y: 50, duration: 1,
                scrollTrigger: {
                    trigger: section, start: "top 80%", toggleActions: "play none none reverse"
                }
            });
        });
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

            playBtn.addEventListener('click', () => {
                audio.paused ? audio.play() : audio.pause();
            });
            
            skipBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    audio.currentTime += parseFloat(btn.dataset.skip);
                });
            });

            audio.addEventListener('play', updateIcons);
            audio.addEventListener('pause', updateIcons);
            audio.addEventListener('loadedmetadata', () => {
                if(totalTimeDisplay) totalTimeDisplay.textContent = this.formatTime(audio.duration);
            });
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
            this.DOM.perfToggle.textContent = this.state.isLowPerfMode ? '💤 ANIMATIONEN: OFF' : '✨ ANIMATIONEN: ON';
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
        const subset = new Set();
        while(subset.size < 30) subset.add(Math.floor(Math.random() * 600));
        subset.forEach(i => this.simState.particles[i].selected = true);

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
            {x: this.simState.width * 0.2, y: this.simState.height * 0.5},
            {x: this.simState.width * 0.8, y: this.simState.height * 0.5}
        ];
    }

    loopSimulation() {
        if (!this.simState.ctx) return;
        this.simState.ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
        this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);

        this.simState.particles.forEach(p => {
            p.update(this.simState.mode, this.simState.centers);
            p.draw(this.simState.ctx);
        });

        requestAnimationFrame(() => this.loopSimulation());
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
            this.DOM.simAnalysisText.innerHTML = `Isonomie: <span style="color:var(--logic)">Diversität</span>. Zufallsauswahl durchbricht Blasen.`;
            this.DOM.simEntropyMeter.textContent = "STATUS: STABIL";
            this.DOM.simEntropyMeter.style.color = "var(--logic)";
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.dossier = new PhoenixDossier();
});