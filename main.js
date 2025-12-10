// MISSION FREIHEIT V3.2 (REFACTORED)

/** TILT EFFECT (Physics smoothed) */
class TiltEffect {
    constructor() {
        this.cards = document.querySelectorAll('.tilt-card');
        this.init();
    }
    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMove(e, card));
            card.addEventListener('mouseleave', () => this.reset(card));
        });
    }
    handleMove(e, card) {
        requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Subtle Rotation
            const rotateX = ((y - rect.height/2) / rect.height) * -3;
            const rotateY = ((x - rect.width/2) / rect.width) * 3;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Dynamic Light Source
            card.style.background = `
                radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.08) 0%, transparent 60%),
                linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)
            `;
        });
    }
    reset(card) {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
        card.style.background = `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)`;
    }
}

/** PARTICLE SIMULATION (Refined Colors) */
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('sim-canvas');
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mode = 'election'; // or 'sortition'
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initParticles();
        this.setupControls();
        this.loop();
    }
    
    resize() {
        this.w = this.canvas.parentElement.offsetWidth;
        this.h = this.canvas.parentElement.offsetHeight;
        this.canvas.width = this.w;
        this.canvas.height = this.h;
    }

    initParticles() {
        this.particles = Array.from({length: 400}, () => ({
            x: Math.random() * this.w,
            y: Math.random() * this.h,
            vx: (Math.random()-0.5), vy: (Math.random()-0.5),
            pref: Math.random(),
            color: '#fff',
            size: Math.random() * 2
        }));
    }

    setupControls() {
        const btnElect = document.getElementById('btn-elect');
        const btnSort = document.getElementById('btn-sort');
        const entropy = document.getElementById('entropy-meter');

        btnElect.addEventListener('click', () => {
            this.mode = 'election';
            btnElect.classList.add('active'); btnSort.classList.remove('active');
            entropy.textContent = "POLARISATION AKTIV";
            entropy.style.color = "var(--alert)";
        });

        btnSort.addEventListener('click', () => {
            this.mode = 'sortition';
            btnSort.classList.add('active'); btnElect.classList.remove('active');
            entropy.textContent = "DYNAMISCHE BALANCE";
            entropy.style.color = "var(--success)";
        });
    }

    loop() {
        this.ctx.fillStyle = 'rgba(5, 5, 7, 0.2)'; // Trail effect linked to bg color
        this.ctx.fillRect(0, 0, this.w, this.h);

        const centers = [{x: this.w*0.25, y: this.h*0.5}, {x: this.w*0.75, y: this.h*0.5}];

        this.particles.forEach(p => {
            if(this.mode === 'election') {
                // Gravitation towards poles
                const target = p.pref < 0.5 ? centers[0] : centers[1];
                const dx = target.x - p.x;
                const dy = target.y - p.y;
                p.vx += dx * 0.0005;
                p.vy += dy * 0.0005;
                p.color = p.pref < 0.5 ? '#ff2a6d' : '#00f3ff'; // Red vs Cyan
            } else {
                // Brownian Motion (Sortition)
                p.vx += (Math.random()-0.5) * 0.2;
                p.vy += (Math.random()-0.5) * 0.2;
                p.color = 'rgba(255,255,255,0.5)';
            }
            
            // Physics
            p.vx *= 0.96; p.vy *= 0.96; // Friction
            p.x += p.vx; p.y += p.vy;

            // Bounds
            if(p.x < 0 || p.x > this.w) p.vx *= -1;
            if(p.y < 0 || p.y > this.h) p.vy *= -1;

            // Draw
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.loop());
    }
}

/** AUDIO PLAYER LOGIC */
class AudioController {
    constructor(wrapper) {
        this.wrapper = wrapper;
        this.audio = wrapper.querySelector('audio');
        this.btn = wrapper.querySelector('.play-pause-btn');
        this.bar = wrapper.querySelector('.audio-progress-bar');
        this.barContainer = wrapper.querySelector('.audio-progress-container');
        this.timeDisplay = wrapper.querySelector('.current-time');
        
        // Transcript
        this.transBtn = wrapper.querySelector('.transcript-toggle-btn');
        this.transBox = wrapper.querySelector('.transcript-box');

        if(this.btn) this.btn.addEventListener('click', () => this.togglePlay());
        if(this.audio) {
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('ended', () => this.reset());
        }
        if(this.barContainer) {
            this.barContainer.addEventListener('click', (e) => {
                const rect = this.barContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                this.audio.currentTime = pos * this.audio.duration;
            });
        }
        if(this.transBtn) {
            this.transBtn.addEventListener('click', () => {
                const isHidden = this.transBox.style.display === 'none';
                this.transBox.style.display = isHidden ? 'block' : 'none';
            });
        }
    }

    togglePlay() {
        const iconPlay = this.btn.querySelector('.icon-play');
        const iconPause = this.btn.querySelector('.icon-pause');
        if(this.audio.paused) {
            this.audio.play();
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
        } else {
            this.audio.pause();
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
        }
    }

    updateProgress() {
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        this.bar.style.width = `${pct}%`;
        this.timeDisplay.textContent = new Date(this.audio.currentTime * 1000).toISOString().substr(14, 5);
    }
    
    reset() {
        this.btn.querySelector('.icon-play').style.display = 'block';
        this.btn.querySelector('.icon-pause').style.display = 'none';
        this.bar.style.width = '0%';
    }
}

// BOOTSTRAP
window.addEventListener('DOMContentLoaded', () => {
    // Hide Preloader
    setTimeout(() => document.getElementById('preloader').style.opacity = '0', 800);
    setTimeout(() => document.getElementById('preloader').remove(), 1300);

    new TiltEffect();
    new ParticleSystem();
    document.querySelectorAll('.audio-feature-box').forEach(box => new AudioController(box));

    // Simple GSAP entrance
    if(window.gsap) {
        gsap.from(".nav-card", {x: -50, opacity: 0, duration: 1, delay: 0.5});
        gsap.from("#title-split", {y: 50, opacity: 0, duration: 1, delay: 0.2});
    }
});
