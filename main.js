// ==============================================
// UPGRADE: "RESILIENZ-PHYSIK" & INTERAKTION
// ==============================================

class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        // Basis-Geschwindigkeiten
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        // Eigenschaften
        this.size = Math.random() * 1.5 + 0.5;
        this.color = '#444444';
        this.selected = false; // Ist es ein geloster Rat?
        this.preference = Math.random(); // Politische Neigung (0-1)
        
        // Für die Physik-Simulation
        this.friction = 0.94; 
    }
    
    /**
     * Update der Physik basierend auf Modus und externen Einflüssen (Maus)
     */
    update(mode, centers, mouseInteraction) {
        
        // 1. BASIS-VERHALTEN JE NACH MODUS
        // --------------------------------
        if (mode === 'election') {
            // Ziel: Einer der beiden Pole
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            // Starke Anziehung (Polarisierung)
            if(dist > 10) {
                this.vx += (dx / dist) * 0.08; 
                this.vy += (dy / dist) * 0.08;
            }
            this.friction = 0.92; // Viel Energie im System
            this.color = this.preference < 0.5 ? '#FF3333' : '#00CC66'; 
            this.size = 1.5;
        } 
        else if (mode === 'deliberation') {
            if (this.selected) {
                // Räte: Sanfte Bewegung, "Suche" nach Konsens
                this.vx += (Math.random() - 0.5) * 0.03;
                this.vy += (Math.random() - 0.5) * 0.03;
                
                // Leichte Zentrierung (Runder Tisch)
                let dx = (this.width / 2) - this.x;
                let dy = (this.height / 2) - this.y;
                this.vx += dx * 0.0004;
                this.vy += dy * 0.0004;

                this.friction = 0.9; // "Abkühlen" der Debatte
                this.color = '#F59E0B'; // Gold
                this.size = 3.5;
            } else {
                // Bevölkerung vertraut dem Rat (passiv)
                this.color = '#222';
                this.size = 0.8;
                this.friction = 0.9;
            }
        }
        else { // 'sortition' (Übergangsphase)
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
            this.friction = 0.98;
            
            if (this.selected) {
                this.color = '#00CC66';
                this.size = 3;
            } else {
                this.color = '#333'; 
                this.size = 1;
            }
        }

        // 2. INTERAKTIVER STRESS-TEST (MAUS KLICK)
        // ----------------------------------------
        if (mouseInteraction.isPressed) {
            let dx = this.x - mouseInteraction.x;
            let dy = this.y - mouseInteraction.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            let forceRadius = 250;

            if (dist < forceRadius) {
                // Berechnung der Explosionskraft
                let force = (forceRadius - dist) / forceRadius; 
                let angle = Math.atan2(dy, dx);
                
                // WIE REAGIERT DAS SYSTEM AUF KRISE?
                if (mode === 'election') {
                    // Fragil: Extreme Panik, Partikel fliegen weit auseinander
                    let panicFactor = 15; 
                    this.vx += Math.cos(angle) * force * panicFactor;
                    this.vy += Math.sin(angle) * force * panicFactor;
                } else if (mode === 'deliberation') {
                    // Resilient: Partikel weichen aus, aber kontrolliert
                    let resilienceFactor = 3; // Viel weniger Auswirkung
                    this.vx += Math.cos(angle) * force * resilienceFactor;
                    this.vy += Math.sin(angle) * force * resilienceFactor;
                } else {
                    this.vx += Math.cos(angle) * force * 5;
                    this.vy += Math.sin(angle) * force * 5;
                }
            }
        }

        // 3. PHYSIK ANWENDEN
        // ------------------
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;

        // Wände
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

// -------------------------------------------------------
// Update in der PhoenixDossier Klasse (Setup & Loop)
// -------------------------------------------------------

// 1. FÜGE DIES ZU setupSimulation() HINZU:
/*
    this.simState.mouse = { x: 0, y: 0, isPressed: false };
    
    // Event Listener für "Krise" (Maus/Touch)
    const canvas = this.DOM.simCanvas;
    
    const updateMouse = (e) => {
        const rect = canvas.getBoundingClientRect();
        // Unterscheidung Touch vs Mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        this.simState.mouse.x = clientX - rect.left;
        this.simState.mouse.y = clientY - rect.top;
    };

    canvas.addEventListener('mousedown', (e) => {
        this.simState.mouse.isPressed = true;
        updateMouse(e);
        // Visueller Hinweis
        this.DOM.simCanvas.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mouseup', () => {
        this.simState.mouse.isPressed = false;
        this.DOM.simCanvas.style.cursor = 'pointer';
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if(this.simState.mouse.isPressed) updateMouse(e);
    });

    // Touch Support
    canvas.addEventListener('touchstart', (e) => {
        this.simState.mouse.isPressed = true;
        updateMouse(e);
        e.preventDefault(); // Scrollen verhindern
    }, {passive: false});
    
    canvas.addEventListener('touchend', () => {
        this.simState.mouse.isPressed = false;
    });
    canvas.addEventListener('touchmove', (e) => {
        if(this.simState.mouse.isPressed) updateMouse(e);
        e.preventDefault();
    }, {passive: false});
    
    // Neuer Button Listener
    this.DOM.simBtnDelib = document.getElementById('btn-delib');
    if(this.DOM.simBtnDelib) {
        this.DOM.simBtnDelib.addEventListener('click', () => this.setSimMode('deliberation'));
    }
*/

// 2. ERSETZE loopSimulation() DAMIT:

loopSimulation() {
    if (!this.simState.ctx) return;
    
    // 1. Canvas löschen (mit Trail-Effekt)
    this.simState.ctx.fillStyle = 'rgba(5, 5, 5, 0.25)';
    this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);

    // 2. Schockwelle zeichnen (wenn Maus gedrückt)
    if (this.simState.mouse.isPressed) {
        this.simState.ctx.beginPath();
        this.simState.ctx.arc(this.simState.mouse.x, this.simState.mouse.y, 30, 0, Math.PI*2);
        this.simState.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.simState.ctx.stroke();
        this.simState.ctx.beginPath();
        this.simState.ctx.arc(this.simState.mouse.x, this.simState.mouse.y, 100, 0, Math.PI*2); // Äußerer Ring
        this.simState.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.simState.ctx.stroke();
        
        // Text-Hinweis bei Interaktion
        this.simState.ctx.fillStyle = "white";
        this.simState.ctx.font = "12px sans-serif";
        this.simState.ctx.fillText("EXTERNER SCHOCK", this.simState.mouse.x + 15, this.simState.mouse.y);
    }

    // 3. Partikel Update
    this.simState.particles.forEach(p => {
        // WICHTIG: Übergebe das mouse-Objekt
        p.update(this.simState.mode, this.simState.centers, this.simState.mouse);
        p.draw(this.simState.ctx);
    });

    // 4. Modus-Spezifische Visuals
    if (this.simState.mode === 'deliberation') {
        // Synapsen zeichnen
        const activeParticles = this.simState.particles.filter(p => p.selected);
        this.simState.ctx.lineWidth = 0.8;
        
        for (let i = 0; i < activeParticles.length; i++) {
            for (let j = i + 1; j < activeParticles.length; j++) {
                const p1 = activeParticles[i];
                const p2 = activeParticles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 130) {
                    // Elastizität: Verbindungen werden bei Stress (Mausklick) sichtbar gespannt
                    const tension = this.simState.mouse.isPressed ? 0.8 : 0.2; 
                    const alpha = (1 - (dist / 130)) + (this.simState.mouse.isPressed ? 0.2 : 0);
                    
                    this.simState.ctx.beginPath();
                    this.simState.ctx.strokeStyle = `rgba(245, 158, 11, ${Math.min(1, alpha)})`;
                    this.simState.ctx.moveTo(p1.x, p1.y);
                    this.simState.ctx.lineTo(p2.x, p2.y);
                    this.simState.ctx.stroke();

                    // Physik: Gegenseitige Anziehung (Kohäsion)
                    // Wird stärker bei Stress, um das System zusammenzuhalten!
                    const cohesion = this.simState.mouse.isPressed ? 0.002 : 0.0005;
                    p1.vx -= dx * cohesion; p1.vy -= dy * cohesion;
                    p2.vx += dx * cohesion; p2.vy += dy * cohesion;
                }
            }
        }
    }
    
    // Gravitationszentren (Wahl-Modus)
    if(this.simState.mode === 'election') {
        // ... (Zeichnen der Zentren wie vorher) ...
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
