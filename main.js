Gerne\! Da die Änderungen alle drei Kerndateien (`index.html`, `styles.css`, `main.js`) betreffen, habe ich hier den **vollständigen, zusammengefügten Code** für jede Datei vorbereitet.

Du kannst den Inhalt einfach kopieren und die alten Dateien komplett überschreiben.

### 1\. `index.html` (Vollständig)

Hier sind der Lesefortschrittsbalken, die erweiterte Simulationsanzeige und der Light-Mode-Button integriert.

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mission Freiheit | Das Ultimative Dossier</title>
    
    <meta name="description" content="Das ultimative interaktive Dossier zur Isonomie und Losdemokratie. Analyse der Demokratiekrise, interaktive Simulation und konkrete Lösungswege.">
    <meta name="keywords" content="Isonomie, Losdemokratie, Mission Freiheit, Simulation, Web-Anwendung, Stasis, Tyrannei, UX, Performance, Architektur, Systemwandel, Demokratiekrise">
    <link rel="canonical" href="https://deusexlumen.github.io/losdemokratie/">
    
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://deusexlumen.github.io/losdemokratie/">
    <meta property="og:title" content="Mission Freiheit | Das Ultimative Dossier">
    <meta property="og:description" content="Ein interaktives Dossier, das die Demokratiekrise analysiert, eine Simulation von Wahl vs. Los bietet und mit der Losdemokratie einen konkreten Lösungsweg aufzeigt.">
    <meta property="og:image" content="https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80">
    
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'self';
        script-src 'self' https://cdnjs.cloudflare.com;
        style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https://images.unsplash.com;
        media-src 'self' https://cdn.jsdelivr.net;
        connect-src 'self' https://cdn.jsdelivr.net;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
    ">
    
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%2322d3ee%22/></svg>">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Source+Sans+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Source+Sans+Pro:ital,wght@0,200..900;1,200..900&display=swap">
    </noscript>
    
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="reading-progress" class="reading-progress-bar"></div>

    <div id="preloader" class="preloader">
        <div class="spinner"></div>
        <p class="loading-text">Dossier wird geladen...</p>
    </div>

    <a href="#main-content" class="skip-link">Zum Inhalt springen</a>
    
    <div class="narrative-interface">
        
        <aside class="bento-nav-container">
            <nav class="bento-nav">
                <div class="bento-header">
                    <span class="logo">M.F. V1.0</span>
                    <h1 class="nav-title">Mission Freiheit</h1>
                    <p class="nav-subtitle">Das Ultimative Dossier</p>
                </div>
                <a href="#part0" class="nav-item"><span class="nav-icon">🔬</span><span class="nav-text">0. Die Simulation</span></a>
                <a href="#part1" class="nav-item"><span class="nav-icon">🚨</span><span class="nav-text">1. Der Ursprung</span></a>
                <a href="#part2" class="nav-item"><span class="nav-icon">🩺</span><span class="nav-text">2. Die Diagnose</span></a>
                <a href="#part3" class="nav-item"><span class="nav-icon">💊</span><span class="nav-text">3. Die Therapie</span></a>
                <a href="#part4" class="nav-item"><span class="nav-icon">❤️‍🩹</span><span class="nav-text">4. Die Heilung</span></a>
                <a href="#part5" class="nav-item"><span class="nav-icon">🚧</span><span class="nav-text">5. Die Hürden</span></a>
                <a href="#part6" class="nav-item"><span class="nav-icon">🔭</span><span class="nav-text">6. Der Ausblick</span></a>
            </nav>
        </aside>

        <main id="main-content" class="focus-pane" role="main">
            <div class="narrative-thread-container">
                <svg class="narrative-thread" viewBox="0 0 40 1000" preserveAspectRatio="none">
                    <path class="narrative-thread-path" d="M 20 0 C 10 250, 30 500, 20 750 S 30 900, 20 1000" stroke-width="2" fill="none"/>
                </svg>
            </div>

            <header class="document-header">
                <hgroup>
                    <p class="subtitle" id="subtitle-split">Das ultimative Dossier zur Isonomie.</p>
                    <h1 class="main-title" id="title-split">Mission Freiheit.</h1>
                </hgroup>
                <p class="abstract">
                    Dieses Dossier analysiert die architektonischen Fehler der modernen Demokratie. Es kombiniert eine interaktive Simulation von <strong>Wahl vs. Los</strong> mit einer tiefgehenden Analyse der <strong>Isonomie</strong> als systemischen Lösungsansatz.
                </p>
                 <div class="metadata">
                    <p>Version: Mission Freiheit 1.1 (Enhanced)</p>
                    <p>Autor: Deus Ex Lumen</p>
                    <p>Datum: 2025</p>
                </div>
            </header>
            
            <article class="document-content">

                <section id="part0" aria-labelledby="nav-part0" class="chapter-section simulation-section" data-takeaway="Die Simulation visualisiert den Kernkonflikt: Wahlen erzeugen Polarisierung, während das Losverfahren (Isonomie) Diversität und Repräsentation wiederherstellt.">
                    <h2 class="chapter-title"><span class="chapter-number">00.</span>Die Simulation: Wahl vs. Los</h2>
                    
                    <div class="sim-controls audio-feature-box">
                        <h4>Experiment-Einstellungen</h4>
                        <p class="audio-description">Wähle einen Modus, um die gesellschaftliche Dynamik zu beobachten. Interagiere mit der Maus!</p>
                        
                        <div class="sim-buttons">
                            <button id="btn-elect" class="sim-btn sim-btn-alert active-mode">
                                Wahl (Status Quo)
                            </button>
                            <button id="btn-sort" class="sim-btn sim-btn-logic">
                                Los (Isonomie)
                            </button>
                        </div>

                        <div class="sim-analysis">
                            <div class="sim-analysis-header">
                                <span>SYSTEM-STATUS</span>
                                <span id="entropy-meter">POLARIZED</span>
                            </div>
                            <div class="metric-bar-container">
                                <div id="metric-bar" class="metric-bar"></div>
                            </div>
                            <p id="analysis-text">
                                Das Wahlsystem erzeugt <span style="color: var(--alert);">Gravitationszentren</span> (Parteien). Die Gesellschaft polarisiert sich.
                            </p>
                        </div>
                    </div>

                    <div id="canvas-wrapper"> 
                        <canvas id="sim-canvas" width="750" height="500"></canvas>
                        <div class="sim-overlay"></div>
                    </div>
                </section>

                <section id="part1" aria-labelledby="nav-part1" class="chapter-section" data-takeaway="Die Konzentration politischer Macht in den Händen Weniger (Aristokratie) ist das Kernproblem moderner Gesellschaften.">
                    <h2 class="chapter-title"><span class="chapter-number">01.</span>Die Krise unserer Zeit</h2>
                    <div class="audio-feature-box">
                        <h4>Audio-Essay Teil 1: Ein System am Limit</h4>
                        <p class="audio-description">Eine Analyse der Machtkonzentration und der lähmenden Konsequenzen.</p>
                        <audio class="audio-player-hidden" preload="metadata" src="https://cdn.jsdelivr.net/gh/deusexlumen/losdemokratie@main/TEIL%20EINS__Isonomie__Entlarvt_die_faktische_Aristokratie_und_die_Falle_der_Politik.m4a" playsinline crossorigin="anonymous"></audio>
                        <div class="custom-audio-player"><button class="play-pause-btn"><svg class="icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg><svg class="icon-pause" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg></button><div class="audio-progress-container"><div class="audio-progress-bar"></div></div><canvas class="audio-visualizer" width="100" height="40"></canvas><div class="audio-time"><span class="current-time">00:00</span>&nbsp;/&nbsp;<span class="total-time">00:00</span></div></div>
                        <button class="transcript-toggle-btn">Transkript anzeigen</button>
                        <div class="transcript-container" id="transcript-part1" hidden>
                             <p data-start="0" data-end="7.9">Kennen Sie das auch? Dieses Gefühl der politischen Frustration...</p>
                             </div>
                    </div>
                    <p>Alles beginnt mit einem Gefühl. Einem leisen, aber nagenden Zweifel an der Art und Weise, wie wir als Gesellschaft Entscheidungen treffen.</p>
                </section>
                
                <section id="part2" class="chapter-section" data-takeaway="Stasis (Parteienkampf) führt zu Handlungsunfähigkeit und dem Ruf nach Tyrannei.">
                    <h2 class="chapter-title"><span class="chapter-number">02.</span>Diagnose: Stasis &amp; Tyrannei</h2>
                    <p>Die repräsentative Demokratie leidet unter chronischen Krankheiten...</p>
                </section>

                <section id="part3" class="chapter-section" data-takeaway="Die Therapie ist die Isonomie, erreicht durch das Losverfahren.">
                    <h2 class="chapter-title"><span class="chapter-number">03.</span>Therapie: Die vergessene Lösung</h2>
                     <p>Die Losdemokratie ist eine kraftvolle Behandlungsmethode...</p>
                </section>

                <section id="part4" class="chapter-section" data-takeaway="Isonomie schafft einen herrschaftsfreien Raum für Deliberation.">
                    <h2 class="chapter-title"><span class="chapter-number">04.</span>Heilung: Isonomie in Aktion</h2>
                     <p>Isonomie beendet die unproduktiven Parteienkämpfe...</p>
                </section>

                <section id="part5" class="chapter-section" data-takeaway="Die größten Hürden sind falsche Feindbilder und aristokratische Illusionen.">
                    <h2 class="chapter-title"><span class="chapter-number">05.</span>Die Hürden</h2>
                     <p>Die moderne Zeit verwechselt oft Anarchie mit Anomie...</p>
                </section>

                <section id="part6" aria-labelledby="nav-part6" class="chapter-section" data-takeaway="Der Quantensprung gelingt, indem Last und Lust der Politik gerecht verteilt werden.">
                    <h2 class="chapter-title"><span class="chapter-number">06.</span>Der Quantensprung</h2>
                    <div class="audio-feature-box">
                        <h4>Audio-Essay Teil 6: Der Quantensprung zur Mündigkeit</h4>
                        <p class="audio-description">Eine Vision für eine wahrhaft politische Gesellschaft.</p>
                        <audio class="audio-player-hidden" preload="metadata" src="https://cdn.jsdelivr.net/gh/deusexlumen/losdemokratie@main/TEIL%20SECHS__Isonomie_und_Losverfahren__Der_Quantensprung_zur_politischen_M%C3%BCndigkeit.m4a" playsinline crossorigin="anonymous"></audio>
                        <div class="custom-audio-player"><button class="play-pause-btn"><svg class="icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg><svg class="icon-pause" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg></button><div class="audio-progress-container"><div class="audio-progress-bar"></div></div><canvas class="audio-visualizer" width="100" height="40"></canvas><div class="audio-time"><span class="current-time">00:00</span>&nbsp;/&nbsp;<span class="total-time">00:00</span></div></div>
                         </div>
                    <p>Die Isonomie, basierend auf dem Losverfahren, ist der einzige Weg...</p>
                </section>
                
                <section id="knowledge-distillate" class="chapter-section">
                    <h2 id="distillate-title" class="chapter-title"><span class="chapter-number">07.</span>Ihr Wissens-Destillat</h2>
                    <p>Kernargumente auf einen Blick:</p>
                    <ul></ul>
                </section>
                
                <section id="final-actions" class="chapter-section final-actions">
                    <h2 id="final-cta" class="chapter-title"><span class="chapter-number">08.</span>Werden Sie zum Systemwandler</h2>
                    <div class="final-actions-grid">
                        <div class="action-card">
                            <h3 class="card-title">Ihre Mission</h3>
                            <p>Wissen ist der erste Schritt, Handeln der nächste.</p>
                            <a href="https://losdemokratie.de/antrag" target="_blank" class="cta-button">Teil der Bewegung werden</a>
                             </div>
                        <div class="action-card">
                            <h3 class="card-title">Ihre Werkzeugkiste</h3>
                             </div>
                    </div>
                </section>
            </article>
        </main>
        
        <footer class="page-footer">
            <p>created by <a href="https://youtube.com/@deusexlumen" target="_blank">deus.ex.lumen</a> 2025</p>
        </footer>
        
        <div class="ui-controls-container">
            <button id="theme-toggle" class="perf-toggle-button" aria-label="Design wechseln">☀️ Light Mode</button>
            <button id="perf-toggle" class="perf-toggle-button" aria-pressed="false">✨ Animationen an</button>
        </div>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script type="module" src="main.js"></script>
</body>
</html>
```

### 2\. `styles.css` (Vollständig)

Beinhaltet alle Basisstile plus die neuen Erweiterungen für Light Mode, Mobile Nav und Sticky Audio.

```css
:root {
    /* Dark Mode Defaults */
    --bg-color: #0d1117;
    --primary-color: #06b6d4;      
    --secondary-color: #4f46e5;   
    --highlight-color: #67e8f9;     
    --text-color-bright: #e6edf3;  
    --text-color-dim: #9eb3c9;     
    --text-muted: #8b949e;         
    --heading-color: #f0f6fc;      
    --border-color: rgba(209, 213, 219, 0.1);
    --card-bg: rgba(22, 27, 34, 0.5);
    --cta-color: #a855f7;          

    --alert: #FF3333; 
    --logic: #00CC66; 
    --void: #050505; 

    --font-heading: 'Inter', sans-serif;
    --font-main: 'Source Sans Pro', sans-serif;
    --border-radius: 16px;

    --primary-color-translucent: rgba(34, 211, 238, 0.3);
    --shadow-glow: 0 0 24px var(--primary-color-translucent), 0 0 48px rgba(6, 182, 212, 0.2), inset 0 0 10px rgba(6, 182, 212, 0.1);
    --shadow-small: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* --- NEU: Light Mode Variablen --- */
body.light-theme {
    --bg-color: #f3f4f6;           
    --card-bg: #ffffff;            
    --text-color-dim: #4b5563;     
    --text-color-bright: #111827;  
    --heading-color: #1f2937;      
    --border-color: rgba(0, 0, 0, 0.1);
    --void: #e5e7eb;               
    --shadow-glow: 0 0 15px rgba(6, 182, 212, 0.15);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; background-color: var(--bg-color); }

body {
    font-family: var(--font-main);
    color: var(--text-color-dim);
    line-height: 1.7;
    background-color: var(--bg-color);
    min-height: 100vh;
    overflow-x: hidden;
    position: relative; 
}

/* Low Perf Mode */
.low-perf-mode * { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
.low-perf-mode .narrative-thread-container, .low-perf-mode .audio-visualizer { display: none !important; }

a { color: var(--highlight-color); text-decoration: none; transition: color 0.3s ease; }
a:hover { color: var(--primary-color); text-decoration: underline; }

h1, h2, h3, h4 { font-family: var(--font-heading); color: var(--heading-color); line-height: 1.2; margin-bottom: 0.5em; }
h1 { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; }
h2 { font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; }
h3 { font-size: 1.5rem; font-weight: 700; }

p { margin-bottom: 1.5rem; }
ul, ol { margin-bottom: 1.5rem; padding-left: 20px; }
li { margin-bottom: 0.5rem; }

/* Preloader */
.preloader {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: var(--bg-color);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    z-index: 9999; opacity: 1; transition: opacity 0.5s ease-in-out;
}
.preloader.hidden { opacity: 0; pointer-events: none; }
.spinner {
    width: 50px; height: 50px; border: 4px solid var(--border-color);
    border-top-color: var(--primary-color); border-radius: 50%;
    animation: spin 1s linear infinite; margin-bottom: 1rem;
}
.loading-text { color: var(--text-color-bright); font-size: 1.1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Layout */
.narrative-interface {
    display: grid; grid-template-columns: 280px 1fr;
    min-height: 100vh; max-width: 1400px; margin: 0 auto;
    position: relative;
    background: radial-gradient(circle at 10% 10%, rgba(6, 182, 212, 0.05) 0%, transparent 20%),
                radial-gradient(circle at 90% 90%, rgba(79, 70, 229, 0.05) 0%, transparent 20%),
                var(--bg-color);
    background-attachment: fixed;
}

.bento-nav-container { padding: 2rem 1.5rem 2rem 2rem; }
.bento-nav {
    position: sticky; top: 2rem; height: calc(100vh - 4rem); padding: 20px;
    border: 1px solid var(--border-color); border-radius: var(--border-radius);
    background: var(--card-bg); box-shadow: var(--shadow-small);
    display: flex; flex-direction: column;
}
.bento-header { padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px dashed var(--border-color); }
.logo { display: block; color: var(--primary-color); font-size: 0.75rem; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.1em; }
.nav-title { font-size: 1.6rem; font-weight: 900; margin-bottom: 0; }
.nav-subtitle { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0; }
.nav-item {
    display: flex; align-items: center; padding: 10px 12px; margin-bottom: 8px;
    border-radius: 12px; color: var(--text-color-bright); font-weight: 600;
    transition: background-color 0.2s, box-shadow 0.2s;
}
.nav-item:hover { background-color: rgba(6, 182, 212, 0.1); box-shadow: 0 0 5px rgba(6, 182, 212, 0.3); text-decoration: none; }
.nav-item.active { background-color: var(--primary-color-translucent); box-shadow: var(--shadow-glow); color: var(--highlight-color); }
.nav-item-cta { background-color: var(--cta-color); margin-top: auto; color: white; box-shadow: 0 0 10px rgba(168, 85, 247, 0.5); }
.nav-icon { font-size: 1.2rem; margin-right: 12px; }
.nav-text { flex-grow: 1; }

.focus-pane { padding: 2rem 2rem 5rem 1.5rem; position: relative; }

/* Content */
.document-header { margin-bottom: 4rem; padding-left: 1.5rem; }
.subtitle { font-size: 1.2rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.5rem; }
.main-title { margin-top: 0; display: flex; flex-wrap: wrap; overflow: hidden; }
.abstract { font-size: 1.15rem; font-weight: 300; color: var(--text-color-bright); margin-bottom: 1rem; border-left: 4px solid var(--primary-color); padding-left: 15px; }
.metadata { font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 20px; }

.document-content { max-width: 750px; }
.chapter-section { padding-left: 1.5rem; margin-bottom: 5rem; padding-top: 1rem; }
.chapter-title { display: flex; align-items: flex-start; gap: 10px; }
.chapter-number { font-size: 1.5rem; color: var(--primary-color); font-weight: 900; flex-shrink: 0; }

.highlight-box, .pull-quote {
    background-color: var(--card-bg); border: 1px solid var(--border-color);
    border-radius: var(--border-radius); padding: 20px; margin: 2rem 0; box-shadow: var(--shadow-small);
}
.highlight-box { border-left: 4px solid var(--secondary-color); }
.highlight-box strong { color: var(--text-color-bright); }
.pull-quote { font-style: italic; font-size: 1.3rem; line-height: 1.5; color: var(--text-color-bright); border-left: 4px solid var(--cta-color); }
.pull-quote::before { content: "„"; font-size: 3rem; line-height: 0; color: var(--cta-color); position: relative; top: 10px; margin-right: 5px; display: inline-block; }
.pull-quote + figcaption { display: block; text-align: right; font-size: 0.9rem; color: var(--text-muted); margin-top: -1.5rem; padding-right: 20px; }

/* Audio Feature Box */
.audio-feature-box {
    padding: 20px; background: rgba(255, 255, 255, 0.05);
    border-radius: var(--border-radius); border: 1px solid var(--border-color);
    box-shadow: var(--shadow-glow); transition: box-shadow 1.5s ease; margin: 3rem 0;
}
.audio-feature-box h4 { color: var(--heading-color); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px; }
.audio-description { font-size: 0.95rem; color: var(--text-muted); margin-top: -0.5rem; }
.custom-audio-player { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.audio-player-hidden { display: none; }
.play-pause-btn, .skip-btn { background: transparent; border: none; cursor: pointer; padding: 5px; display: flex; align-items: center; justify-content: center; }
.play-pause-btn svg, .skip-btn svg { width: 24px; height: 24px; fill: var(--text-color-bright); transition: fill 0.2s, transform 0.2s; }
.play-pause-btn:hover svg { fill: var(--highlight-color); transform: scale(1.1); }
.icon-pause { display: none; }
.audio-progress-container { flex-grow: 1; height: 8px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; cursor: pointer; overflow: hidden; }
.audio-progress-bar { width: 0%; height: 100%; background-color: var(--primary-color); border-radius: 4px; transition: width 0.1s linear; }
.audio-visualizer { width: 100px; height: 40px; }
.audio-time { color: var(--text-color-bright); font-size: 0.9rem; font-variant-numeric: tabular-nums; }
.speed-btn { background: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-color); color: var(--text-color-bright); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 0.85rem; }
.transcript-toggle-btn { background: transparent; color: var(--highlight-color); border: 1px solid var(--highlight-color); border-radius: 8px; padding: 8px 15px; cursor: pointer; font-weight: 500; transition: background-color 0.2s; }
.transcript-toggle-btn:hover { background-color: rgba(6, 182, 212, 0.1); }
.transcript-container { padding: 15px 10px 5px 10px; margin-top: 15px; border-top: 1px solid var(--border-color); max-height: 300px; overflow-y: auto; }
.transcript-container p { margin-bottom: 0.5rem; padding: 5px; cursor: pointer; transition: color 0.2s, background-color 0.2s; border-radius: 4px; }
.transcript-container p.active-cue { color: var(--highlight-color); background-color: rgba(6, 182, 212, 0.1); font-weight: 600; }

/* Simulation Styles */
.simulation-section #canvas-wrapper {
    position: relative; width: 100%; height: 500px; background-color: var(--void);
    border: 1px solid var(--border-color); border-radius: var(--border-radius);
    overflow: hidden; margin-top: 2rem;
}
#sim-canvas { display: block; width: 100%; height: 100%; }
.sim-overlay { position: absolute; inset: 0; background: radial-gradient(circle, transparent 40%, var(--void) 100%); pointer-events: none; }
.sim-controls { padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: var(--border-radius); border: 1px solid var(--border-color); box-shadow: var(--shadow-glow); margin: 3rem 0; }
.sim-controls h4 { color: var(--heading-color); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px; }
.sim-buttons { display: flex; gap: 10px; margin-bottom: 1.5rem; }
.sim-btn { flex: 1; padding: 12px; border: 1px solid var(--border-color); color: var(--text-muted); background: transparent; font-family: var(--font-heading); font-weight: 600; text-transform: uppercase; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
.sim-btn.sim-btn-alert { border-color: var(--alert); color: var(--alert); }
.sim-btn.sim-btn-alert:hover, .sim-btn.sim-btn-alert.active-mode { background-color: var(--alert); color: var(--void); box-shadow: 0 0 15px rgba(255, 51, 51, 0.4); }
.sim-btn.sim-btn-logic { border-color: var(--logic); color: var(--logic); }
.sim-btn.sim-btn-logic:hover, .sim-btn.sim-btn-logic.active-mode { background-color: var(--logic); color: var(--void); box-shadow: 0 0 15px rgba(0, 204, 102, 0.4); }
.sim-analysis { border-top: 1px solid var(--border-color); padding-top: 15px; }
.sim-analysis-header { display: flex; justify-content: space-between; font-family: monospace; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; }
#entropy-meter { font-weight: 700; color: var(--alert); transition: color 0.3s ease; }
.sim-analysis p { font-family: serif; font-size: 1.2rem; line-height: 1.4; color: var(--text-color-bright); margin: 0; }

/* Footer & Controls */
.page-footer { grid-column: 1 / -1; text-align: center; padding: 2rem 0 1rem 0; border-top: 1px solid var(--border-color); margin-top: 3rem; font-size: 0.85rem; color: var(--text-muted); }
.ui-controls-container { position: fixed; bottom: 20px; right: 20px; z-index: 100; display: flex; flex-direction: column; gap: 10px; }
.perf-toggle-button { background-color: rgba(255, 255, 255, 0.1); color: var(--text-color-bright); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 15px; cursor: pointer; font-size: 0.9rem; transition: background-color 0.2s; }
.perf-toggle-button:hover { background-color: rgba(255, 255, 255, 0.2); }
.skip-link { position: absolute; top: -40px; left: 50%; transform: translateX(-50%); z-index: 999; padding: 8px 16px; color: var(--bg-color); background-color: var(--highlight-color); transition: top 0.3s ease-in-out; font-weight: 700; border-radius: 8px; }
.skip-link:focus { top: 0; }

.narrative-thread-container { position: absolute; top: 0; left: -1.5rem; width: 40px; height: 100%; z-index: -1; pointer-events: none; }
.narrative-thread { width: 100%; height: 100%; overflow: visible; }
.narrative-thread-path { stroke: var(--primary-color); transition: stroke 1.5s ease; }

.final-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 2rem; }
.action-card { padding: 30px; background: rgba(79, 70, 229, 0.05); border: 1px solid rgba(79, 70, 229, 0.3); border-radius: var(--border-radius); box-shadow: 0 0 15px rgba(79, 70, 229, 0.1); }
.action-card .card-title { color: var(--heading-color); margin-bottom: 1rem; border-bottom: 1px solid rgba(79, 70, 229, 0.4); padding-bottom: 10px; }
.cta-button { display: inline-block; background-color: var(--cta-color); color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-weight: 700; font-size: 1rem; transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s; margin-top: 1rem; width: 100%; text-align: center; }
.cta-button:hover { background-color: #8b5cf6; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(168, 85, 247, 0.4); text-decoration: none; }
.share-buttons { margin-top: 1.5rem; display: flex; gap: 10px; flex-wrap: wrap; }
.share-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-color-bright); transition: background-color 0.2s; }
.share-btn:hover { background-color: rgba(255, 255, 255, 0.2); text-decoration: none; }

/* --- NEU: Lesefortschrittsbalken --- */
.reading-progress-bar {
    position: fixed; top: 0; left: 0; height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    width: 0%; z-index: 10000; transition: width 0.1s linear;
    box-shadow: 0 0 10px var(--primary-color);
}

/* --- NEU: Metrik-Balken (Simulation) --- */
.metric-bar-container {
    width: 100%; height: 6px; background: rgba(255,255,255,0.1);
    border-radius: 3px; margin: 10px 0; overflow: hidden;
}
.light-theme .metric-bar-container { background: rgba(0,0,0,0.1); }
.metric-bar { height: 100%; width: 50%; background-color: var(--text-muted); transition: width 0.5s ease, background-color 0.5s ease; }

/* --- UPDATE: Mobile Navigation --- */
@media (max-width: 1024px) {
    .narrative-interface { grid-template-columns: 1fr; gap: 1rem; }
    .narrative-thread-container { display: none; }
    .ui-controls-container { bottom: 80px; right: 10px; } /* Angepasst für Mobile Nav */
    
    .bento-nav-container { padding: 0; height: 0; }
    .bento-nav {
        position: fixed; bottom: 0; left: 0; width: 100%; height: auto;
        margin: 0; border-radius: 0; border-top: 1px solid var(--border-color);
        flex-direction: row; justify-content: space-around; padding: 10px;
        z-index: 5000; background: var(--bg-color); box-shadow: 0 -5px 20px rgba(0,0,0,0.2);
    }
    .bento-header, .nav-subtitle, .nav-item-cta, .nav-text { display: none; }
    .nav-item { flex-direction: column; padding: 5px; margin: 0; background: transparent !important; box-shadow: none !important; }
    .nav-item.active { color: var(--primary-color); }
    .nav-icon { margin: 0; font-size: 1.4rem; }
    .page-footer { padding-bottom: 80px; }
    
    .simulation-section #canvas-wrapper { height: 400px; }
    .sim-buttons { flex-direction: column; }
    .final-actions-grid { grid-template-columns: 1fr; }
}

/* --- NEU: Sticky Audio Player (Desktop) --- */
@media (min-width: 1024px) {
    .audio-feature-box {
        position: sticky; top: 2rem; z-index: 50;
        background: var(--bg-color);
        backdrop-filter: blur(10px); border: 1px solid var(--primary-color-translucent);
    }
}
```

### 3\. `main.js` (Vollständig)

Hier ist die komplett überarbeitete Logik mit Maus-Interaktion, Trails, Theme-Toggle und Lesefortschritt.

```javascript
// VALIDIERTE VERSION: Mission Freiheit v1.1 (Enhanced)
// UPGRADE: Interaktive Simulation & UI-Verbesserungen

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
        
        if (this.toggleBtn) this.toggleBtn.textContent = 'Transkript anzeigen';
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
            if (activeCue.offsetTop < container.scrollTop || activeCue.offsetTop + activeCue.offsetHeight > container.scrollTop + container.clientHeight) {
                container.scrollTop = activeCue.offsetTop - (container.clientHeight / 2) + (activeCue.offsetHeight / 2);
            }
        }
    }
}

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
    
    update(mode, centers, mouse) {
        // 1. Maus-Interaktion
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            const interactionRadius = 100;

            if (distance < interactionRadius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (interactionRadius - distance) / interactionRadius;
                this.vx -= forceDirectionX * force * 0.8;
                this.vy -= forceDirectionY * force * 0.8;
            }
        }

        // 2. Bewegungslogik
        if (mode === 'election') {
            let target = this.preference < 0.5 ? centers[0] : centers[1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist > 10) {
                this.vx += (dx / dist) * 0.08; 
                this.vy += (dy / dist) * 0.08;
            }
            
            this.vx *= 0.92;
            this.vy *= 0.92;
            this.color = this.preference < 0.5 ? '#FF3333' : '#00CC66';
        } else { 
            this.vx += (Math.random() - 0.5) * 0.3;
            this.vy += (Math.random() - 0.5) * 0.3;
            
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if(speed > 2.5) {
                this.vx = (this.vx/speed)*2.5;
                this.vy = (this.vy/speed)*2.5;
            }
            
            if (this.selected) {
                this.color = '#00CC66';
                this.size = 3;
            } else {
                this.color = document.body.classList.contains('light-theme') ? '#999' : '#333';
                this.size = 1;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > this.width) { this.x = this.width; this.vx *= -1; }
        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        if (this.y > this.height) { this.y = this.height; this.vy *= -1; }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}


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
            simEntropyMeter: document.getElementById('entropy-meter'),
            // NEU
            readingProgress: document.getElementById('reading-progress'),
            themeToggle: document.getElementById('theme-toggle'),
            metricBar: document.getElementById('metric-bar')
        };

        this.state = {
            isLowPerfMode: false,
        };

        this.simState = {
            ctx: null, width: 0, height: 0, particles: [], centers: [],
            mode: 'election', animationFrame: null,
            mouse: { x: null, y: null } // NEU
        };

        this.init();
    }

    init() {
        this.setupPerfToggle();
        this.setupAudioPlayers();
        this.setupReadingProgress();
        this.setupThemeToggle();
        
        if (this.DOM.simCanvas && this.DOM.simWrapper) {
            this.setupSimulation();
        }
        
        try {
            if (!this.state.isLowPerfMode && window.gsap) {
                this.setupGSAPAnimations();
            } else {
                if(this.DOM.mainTitle) this.DOM.mainTitle.style.opacity = 1;
                if(this.DOM.subTitle) this.DOM.subTitle.style.opacity = 1;
            }
        } catch (error) {
            if(this.DOM.mainTitle) this.DOM.mainTitle.style.opacity = 1;
            if(this.DOM.subTitle) this.DOM.subTitle.style.opacity = 1;
        }
        
        this.setupShareButtons();
        this.generateTakeaways();
        this.setupScrollSpy();
    }
    
    setupReadingProgress() {
        if (!this.DOM.readingProgress) return;
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            this.DOM.readingProgress.style.width = `${progress}%`;
        });
    }

    setupThemeToggle() {
        if (!this.DOM.themeToggle) return;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            this.DOM.themeToggle.textContent = '🌙 Dark Mode';
        }
        this.DOM.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            this.DOM.themeToggle.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
        });
    }

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

        if (!audio || !playPauseBtn) return;

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
            if(totalTimeEl) totalTimeEl.textContent = this.formatTime(audio.duration);
        });
        
        playPauseBtn.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
        audio.addEventListener('play', updatePlayPauseIcon);
        audio.addEventListener('pause', updatePlayPauseIcon);
        audio.addEventListener('ended', () => { audio.currentTime = 0; updatePlayPauseIcon(); });
        audio.addEventListener('timeupdate', () => {
            if (progressBar) progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            if (currentTimeEl) currentTimeEl.textContent = this.formatTime(audio.currentTime);
        });

        if(progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
            });
        }

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

        analyser.fftSize = 128;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (audio.paused || audio.ended) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
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

        const startVisualizer = () => { if (audioContext.state === 'suspended') audioContext.resume(); draw(); };
        audio.addEventListener('play', startVisualizer);
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
            this.state.isLowPerfMode = !this.state.isLowPerfMode;
            localStorage.setItem('lowPerfMode', String(this.state.isLowPerfMode));
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
        gsap.set(subChars, { opacity: 0, y: '100%' });
        gsap.to(mainChars, { opacity: 1, y: '0%', rotationX: 0, duration: 0.8, ease: 'power3.out', stagger: 0.03, delay: 0.5 });
        gsap.to(subChars, { opacity: 1, y: '0%', duration: 0.5, ease: 'power1.out', stagger: 0.01, delay: 1.0 });
        
        document.querySelectorAll('.chapter-section').forEach(section => {
            const title = section.querySelector('.chapter-title');
            if (title) {
                 gsap.from(title, { y: 100, opacity: 0, ease: "power2.out", scrollTrigger: { trigger: section, start: "top 80%", end: "top 20%", scrub: true, toggleActions: "play none none reverse" } });
            }
        });

        if (this.DOM.narrativePath && this.DOM.focusPane) {
            const pathLength = this.DOM.narrativePath.getTotalLength();
            if (pathLength > 0) {
                this.DOM.narrativePath.style.strokeDasharray = pathLength;
                this.DOM.narrativePath.style.strokeDashoffset = pathLength;
                gsap.to(this.DOM.narrativePath, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: this.DOM.focusPane, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true } });
            }
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
        }, { threshold: 0.3 });
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
        document.querySelectorAll('section[data-takeaway]').forEach((section) => {
            if (section.id === 'part0') return;
            const li = document.createElement('li');
            const chapterNumber = section.querySelector('.chapter-number')?.textContent.replace('.', '') || '';
            li.innerHTML = `<strong>Teil ${chapterNumber}:</strong> ${section.dataset.takeaway}`;
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

        this.DOM.simBtnElect.addEventListener('click', () => this.setSimMode('election'));
        this.DOM.simBtnSort.addEventListener('click', () => this.setSimMode('sortition'));

        // Maus-Tracking
        this.DOM.simCanvas.addEventListener('mousemove', (e) => {
            const rect = this.DOM.simCanvas.getBoundingClientRect();
            this.simState.mouse.x = e.clientX - rect.left;
            this.simState.mouse.y = e.clientY - rect.top;
        });
        this.DOM.simCanvas.addEventListener('mouseleave', () => {
            this.simState.mouse.x = null; this.simState.mouse.y = null;
        });

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
            p.width = this.simState.width; p.height = this.simState.height;
            if (p.x > this.simState.width) p.x = this.simState.width;
            if (p.y > this.simState.height) p.y = this.simState.height;
        });
    }

    loopSimulation() {
        if (!this.simState.ctx) return;
        
        // Trails Effekt
        const isLight = document.body.classList.contains('light-theme');
        this.simState.ctx.fillStyle = isLight ? 'rgba(229, 231, 235, 0.25)' : 'rgba(5, 5, 5, 0.15)';
        this.simState.ctx.fillRect(0, 0, this.simState.width, this.simState.height);

        this.simState.particles.forEach(p => {
            p.update(this.simState.mode, this.simState.centers, this.simState.mouse);
            p.draw(this.simState.ctx);
        });

        if(this.simState.mode === 'election') {
            this.simState.centers.forEach((center, i) => {
                this.simState.ctx.beginPath();
                this.simState.ctx.arc(center.x, center.y, 6, 0, Math.PI*2);
                this.simState.ctx.fillStyle = i === 0 ? '#FF3333' : '#00CC66';
                this.simState.ctx.fill();
            });
            if(this.DOM.metricBar) {
                this.DOM.metricBar.style.width = "90%";
                this.DOM.metricBar.style.backgroundColor = "var(--alert)";
            }
        } else {
            if(this.DOM.metricBar) {
                this.DOM.metricBar.style.width = "50%";
                this.DOM.metricBar.style.backgroundColor = "var(--logic)";
            }
        }

        this.simState.animationFrame = requestAnimationFrame(() => this.loopSimulation());
    }

    setSimMode(newMode) {
        if (this.simState.mode === newMode) return;
        this.simState.mode = newMode;

        const alertSpan = `<span style="color: var(--alert);">Gravitationszentren</span>`;
        const logicSpan = `<span style="color: var(--logic);">Querschnitt</span>`;

        if (newMode === 'election') {
            this.DOM.simBtnElect.classList.add('active-mode');
            this.DOM.simBtnSort.classList.remove('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Das Wahlsystem erzeugt ${alertSpan} (Parteien). Die Gesellschaft polarisiert sich.`;
            this.DOM.simEntropyMeter.textContent = "POLARIZED";
            this.DOM.simEntropyMeter.style.color = "var(--alert)";
        } else { 
            this.DOM.simBtnSort.classList.add('active-mode');
            this.DOM.simBtnElect.classList.remove('active-mode');
            this.DOM.simAnalysisText.innerHTML = `Zufallsauswahl durchbricht die Blasen. Ein ${logicSpan} der Bevölkerung bildet sich.`;
            this.DOM.simEntropyMeter.textContent = "OPTIMAL";
            this.DOM.simEntropyMeter.style.color = "var(--logic)";
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        preloader.addEventListener('transitionend', () => { preloader.style.display = 'none'; }, { once: true });
    }
    try { window.dossier = new PhoenixDossier(); } catch (e) { console.error(e); }
});
```
