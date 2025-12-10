// MISSION FREIHEIT V4.0 (ULTIMATE ENGINE)

/** TILT EFFECT */
class TiltEffect {
    constructor() {
        this.cards = document.querySelectorAll('.tilt-card');
        this.init();
    }
    init() {
        this.cards.forEach(card => {
            let ticking = false;
            card.addEventListener('mousemove', (e) => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.updateTilt(e, card);
                        ticking = false;
                    });
                    ticking = true;
                }
            });
            card.addEventListener('mouseleave', () => this.resetTilt(card));
        });
    }
    updateTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -2;
        const rotateY = ((x - centerX) / centerX) * 2;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        card.style.backgroundImage = `
            radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.06) 0%, transparent 80%),
            linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)
        `;
    }
    resetTilt(card) {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
        card.style.backgroundImage = `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`;
    }
}

/** AUDIO LOGIC */
class TranscriptSynchronizer {
    constructor(box) {
        this.box = box;
        this.audio = box.querySelector('audio');
        this.transcriptContainer = box.querySelector('.transcript-container');
        this.toggleBtn = box.querySelector('.transcript-toggle-btn');
        if (!this.audio || !this.transcriptContainer) return;

        this.cues = Array.from(this.transcriptContainer.querySelectorAll('p[data-start]'));
        if(this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.toggle());
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
        this.toggleBtn.textContent = isHidden ? 'TRANSKRIPT ÖFFNEN' : 'TRANSKRIPT SCHLIESSEN';
        if(isHidden) setTimeout(() => this.transcriptContainer.scrollIntoView({behavior:"smooth", block:"center"}), 100);
    }
    sync() {
        if(this.transcriptContainer.hidden || this.audio.paused) return;
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
        if(activeCue) activeCue.scrollIntoView({behavior:"smooth", block:"center"});
    }
}

/** SIMULATION LOGIC */
class Particle {
    constructor(w, h) {
        this.w = w; this.h = h;
        this.x = Math.random() * w; this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
        this.size = 1; this.targetSize = 1;
        this.color = 'rgba(255,255,255,0.2)';
        this.selected = false;
        this.pref = Math.random();
    }
    update(mode, centers) {
        if(mode === 'election') {
            let target = this.pref < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x; let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist > 10) { this.vx += (dx/dist)*0.06; this.vy += (dy/dist)*0.06; }
            
            // Vortex Effect
            let angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle + Math.PI/2) * 0.03;
            this.vy += Math.sin(angle + Math.PI/2) * 0.03;
            
            this.vx *= 0.94; this.vy *= 0.94;
            this.color = this.pref < 0.5 ? '#ff003c' : '#00ff9f';
            this.targetSize = 2;
        } else {
            this.vx += (Math.random()-0.5)*0.3; this.vy += (Math.random()-0.5)*0.3;
            let speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if(speed > 2.5) { this.vx = (this.vx/speed)*2.5; this.vy = (this.vy/speed)*2.5; }
            
            if(this.selected) { this.color = '#00f0ff'; this.targetSize = 4; }
            else { this.color = 'rgba(255,255,255,0.15)'; this.targetSize = 1; }
        }
        this.x += this.vx; this.y += this.vy;
        if(this.x < 0 || this.x > this.w) this.vx *= -1;
        if(this.y < 0 || this.y > this.h) this.vy *= -1;
        this.size += (this.targetSize - this.size) * 0.1;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        if(this.selected && this.size > 2) {
            ctx.shadowBlur = 15; ctx.shadowColor = this.color;
        } else { ctx.shadowBlur = 0; }
        ctx.fill(); ctx.shadowBlur = 0;
    }
}

/** CONTROLLER */
class PhoenixDossier {
    constructor() {
        this.DOM = {
            simCanvas: document.getElementById('sim-canvas'),
            simWrapper: document.getElementById('canvas-wrapper'),
            btnElect: document.getElementById('btn-elect'),
            btnSort: document.getElementById('btn-sort'),
            entropy: document.getElementById('entropy-meter'),
            desc: document.getElementById('analysis-text')
        };
        this.simState = { ctx: null, w: 0, h: 0, particles: [], mode: 'election', lastRot: 0, rotInt: 2500 };
        this.init();
    }
    init() {
        if(this.DOM.simCanvas) this.setupSim();
        document.querySelectorAll('.audio-feature-box').forEach(box => {
            new TranscriptSynchronizer(box);
            this.setupAudio(box);
        });
        new TiltEffect();
        this.setupGSAP();
        this.setupShare();
        setTimeout(() => document.getElementById('preloader').classList.add('hidden'), 1200);
    }
    
    setupGSAP() {
        if(!window.gsap) return;
        gsap.registerPlugin(ScrollTrigger);
        
        gsap.from("#title-split", { duration: 1.5, y: 100, opacity: 0, ease: "power4.out", delay: 0.5 });
        
        document.querySelectorAll('.chapter-section').forEach(sec => {
            gsap.from(sec.querySelectorAll('h2, .tilt-card, p'), {
                scrollTrigger: { trigger: sec, start: "top 85%" },
                y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out"
            });
        });
    }

    setupSim() {
        this.simState.ctx = this.DOM.simCanvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.simState.particles = Array.from({length:600}, () => new Particle(this.simState.w, this.simState.h));
        
        this.DOM.btnElect.addEventListener('click', () => this.setMode('election'));
        this.DOM.btnSort.addEventListener('click', () => this.setMode('sortition'));
        
        requestAnimationFrame((t) => this.loop(t));
    }
    
    resize() {
        this.simState.w = this.DOM.simWrapper.offsetWidth;
        this.simState.h = this.DOM.simWrapper.offsetHeight;
        this.DOM.simCanvas.width = this.simState.w;
        this.DOM.simCanvas.height = this.simState.h;
    }
    
    loop(t) {
        const ctx = this.simState.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
        ctx.fillRect(0,0,this.simState.w, this.simState.h);
        
        if(this.simState.mode === 'sortition' && t - this.simState.lastRot > this.simState.rotInt) {
            this.rotatePower();
            this.simState.lastRot = t;
        }
        
        const centers = [{x:this.simState.w*0.25, y:this.simState.h*0.5}, {x:this.simState.w*0.75, y:this.simState.h*0.5}];
        this.simState.particles.forEach(p => { p.update(this.simState.mode, centers); p.draw(ctx); });
        
        requestAnimationFrame((t) => this.loop(t));
    }
    
    rotatePower() {
        this.simState.particles.forEach(p => p.selected = false);
        const set = new Set();
        while(set.size < 40) set.add(Math.floor(Math.random()*this.simState.particles.length));
        set.forEach(i => this.simState.particles[i].selected = true);
    }
    
    setMode(m) {
        this.simState.mode = m;
        const isElect = m === 'election';
        this.DOM.btnElect.className = isElect ? 'sim-btn sim-btn-alert active-mode' : 'sim-btn';
        this.DOM.btnSort.className = !isElect ? 'sim-btn sim-btn-logic active-mode' : 'sim-btn';
        this.DOM.entropy.textContent = isElect ? 'POLARIZED' : 'ROTATING';
        this.DOM.entropy.style.color = isElect ? 'var(--signal-alert)' : 'var(--signal-success)';
        if(!isElect) this.rotatePower();
    }

    setupAudio(box) {
        const audio = box.querySelector('audio');
        const btn = box.querySelector('.play-pause-btn');
        const iconPlay = btn.querySelector('.icon-play');
        const iconPause = btn.querySelector('.icon-pause');
        const bar = box.querySelector('.audio-progress-bar');
        const time = box.querySelector('.current-time');
        const total = box.querySelector('.total-time');
        
        const toggleIcons = () => {
            const isPaused = audio.paused;
            iconPlay.style.display = isPaused ? 'block' : 'none';
            iconPause.style.display = isPaused ? 'none' : 'block';
        };

        btn.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
        audio.addEventListener('play', toggleIcons);
        audio.addEventListener('pause', toggleIcons);
        
        audio.addEventListener('timeupdate', () => {
            if(bar) bar.style.width = (audio.currentTime/audio.duration)*100 + '%';
            if(time) time.textContent = this.fmt(audio.currentTime);
        });
        
        audio.addEventListener('loadedmetadata', () => {
            if(total) total.textContent = this.fmt(audio.duration);
        });

        box.querySelectorAll('.skip-btn').forEach(b => 
            b.addEventListener('click', () => audio.currentTime += parseFloat(b.dataset.skip)));
    }
    
    setupShare() {
        const url = encodeURIComponent(location.href);
        const txt = encodeURIComponent(document.title);
        const map = {
            'EMAIL': `mailto:?body=${url}`,
            'X': `https://twitter.com/intent/tweet?url=${url}&text=${txt}`,
            'FACEBOOK': `https://www.facebook.com/sharer/sharer.php?u=${url}`
        };
        document.querySelectorAll('.share-btn').forEach(btn => {
            const k = btn.id.split('-')[1].toUpperCase();
            if(map[k]) btn.href = map[k];
        });
    }
    
    setupPerfToggle() {
        const btn = document.getElementById('perf-toggle');
        if(btn) btn.addEventListener('click', () => location.reload());
    }

    generateTakeaways() {
        const list = document.querySelector('#knowledge-distillate ul');
        if (!list) return;
        document.querySelectorAll('section[data-takeaway]').forEach(sec => {
            const li = document.createElement('li');
            li.style.marginBottom = '1rem'; li.style.color = 'var(--text-body)';
            li.style.borderBottom = '1px solid var(--glass-border)'; li.style.paddingBottom = '0.5rem';
            const num = sec.querySelector('.chapter-number')?.textContent || '•';
            li.innerHTML = `<strong style="color:var(--neon-cyan); margin-right:10px;">${num}</strong> ${sec.dataset.takeaway}`;
            list.appendChild(li);
        });
    }

    fmt(s) { if(!s) return "00:00"; return new Date(s * 1000).toISOString().substr(14, 5); }
}

window.addEventListener('DOMContentLoaded', () => new PhoenixDossier());
