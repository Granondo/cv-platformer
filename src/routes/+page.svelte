<script>
  import { onMount } from 'svelte';

  let canvas;
  let descriptionPanel;
  let currentPlatform = null;
  let width, height;

  let currentTheme = 'light';
  const themes = {
    light: {
      bg: '#f0f9ff',
      panelBg: '#ffffff',
      player1: '#22d3ee',
      player2: '#06b6d4',
      playerEyes: '#1e293b',
      spring: '#94a3b8',
      platformShadow: 'rgba(0,0,0,0.1)',
      platformTop: 'rgba(255,255,255,0.5)',
      text: '#334155',
      cardBorder: '#e0f2fe',
      cardText: '#334155',
      cardPeriod: '#64748b',
      cardH3: '#0891b2',
      parallax: ['#e0f2fe', '#bae6fd', '#7dd3fc']
    },
    dark: {
      bg: '#0f172a',
      panelBg: '#1e293b',
      player1: '#22d3ee',
      player2: '#06b6d4',
      playerEyes: '#0f172a',
      spring: '#64748b',
      platformShadow: 'rgba(0,0,0,0.3)',
      platformTop: 'rgba(255,255,255,0.2)',
      text: '#fff',
      cardBorder: '#475569',
      cardText: '#cbd5e1',
      cardPeriod: '#94a3b8',
      cardH3: '#22d3ee',
      parallax: ['#1e293b', '#334155', '#475569']
    }
  }

  function toggleTheme(event) {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    event.currentTarget.blur();
  }

  const game = {
    player: {
      x: 70, y: 390, w: 40, h: 60,
      vx: 0, vy: 0, jumping: false,
      squash: 1, onPlatform: null
    },
    platforms: [
        { x: 0, y: 450, w: 180, h: 20, color: '#3b82f6' },
        { x: 250, y: 400, w: 200, h: 20, company: 'Toptal', color: '#6366f1',
          period: 'Sept 2019 - Jun 2020',
          desc: `Cross-functional team of 5 (2 FE, 2 BE, 1 QA)
          Developed B2C e-commerce platform development, focusing on authentication and core user-facing features.
          Tech stack: React, Redux, Node.js, Express, PostgreSQL, MongoDB
          Responsibilities and achievements:
          • Designed and implemented secure authentication system featuring: JWT token-based auth, social logins, email verification, and CSRF/XSS protection.
          • Developed product catalog with advanced filtering and a shopping cart using Redux for optimal performance.
          • Built REST API endpoints for product operations using Node.js and Express.
          • Actively participated in agile ceremonies: daily standups, sprint planning, and peer code reviews.`
        },
        { x: 500, y: 350, w: 180, h: 20, company: 'Upwork', color: '#8b5cf6',
          period: 'Aug 2020 - May 2021',
          desc: `Cross-functional team of 4 (FE, BE, QA, Designer)
          Developed a feature-rich task management platform with advanced collaboration capabilities.
          Tech stack: React, Context API, TypeScript, React Router, Draft.js, react-beautiful-dnd, Material-UI
          Responsibilities and achievements:
          • Built a comprehensive navigation system with React Router, including nested routing for projects and tasks.
          • Developed an advanced search with debounced backend API integration.
          • Implemented a Google Docs-style rich text editor using Draft.js.
          • Created an intuitive drag-and-drop interface for task organization using react-beautiful-dnd.
          • Architected scalable state management using Context API with TypeScript.`
        },
        { x: 750, y: 280, w: 200, h: 20, company: 'WorkHuman', color: '#a855f7',
          period: 'May 2022 - May 2023',
          desc: `Agile team averaging 7 members (2 FE, 2 BE, 2 QA, Designer)
          Developed an employee rewards management platform from near-scratch.
          Tech stack: React, TypeScript, Context API, React Router, Custom UI library
          Responsibilities and achievements:
          • Independently executed a complete codebase migration from JavaScript to TypeScript in one month.
          • Developed a custom data table component with client-side multi-criteria filtering, sorting, and pagination for 1000+ records.
          • Built a sophisticated filtering system with real-time updates using Context API.
          • Implemented a complete reward workflow with role-based permissions and confirmation dialogs.
          Additional experience:
          • Worked on a legacy JSP (JavaServer Pages) project, implementing modifications and maintaining server-side rendered pages.`
        },
        { x: 1000, y: 200, w: 220, h: 20, company: 'Chulakov Studio', color: '#c084fc',
          period: 'May 2024 - Present',
          desc: `Team of 6 (2 FE, 2 BE, QA, Analyst)
          Developing a security monitoring application for a major financial institution.
          Tech stack: React 18, MobX, TypeScript, Highcharts, React Router, Micro-frontend architecture
          Responsibilities and achievements:
          • Architected and developed a micro-frontend module using React, MobX, and TypeScript for real-time data flows.
          • Built a comprehensive analytics dashboard suite using Highcharts, creating multiple custom visualization types (line, bar, pie, heatmaps).
          • Engineered highly customized, interactive chart components with drill-down capabilities and cross-chart data synchronization.
          • Optimized rendering performance for high-volume data visualization, handling thousands of data points efficiently.
          • Systematically debugged and resolved critical issues across the application, including race conditions, UI logic errors, and memory leaks.`
        },
      ],
    particles: [],
    parallaxLayers: [],
    camera: { x: 0, y: 0 },
    levelEnd: 2000,
    gravity: 0.5, jumpForce: -12, moveSpeed: 5, keys: {}
  };

  function parseDescription(desc) {
    if (!desc) return null;

    const lines = desc.split('\n').map(line => line.trim()).filter(line => line);
    const result = {
      intro: [],
      techStack: '',
      achievements: [],
      additional: []
    };

    let currentSection = 'intro';

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (lowerLine.startsWith('tech stack:')) {
        result.techStack = line.substring('Tech stack:'.length).trim();
        currentSection = 'achievements';
      } else if (lowerLine.startsWith('responsibilities and achievements:')) {
        currentSection = 'achievements';
      } else if (lowerLine.startsWith('additional experience:')) {
        currentSection = 'additional';
      } else if (line.startsWith('•')) {
        const item = line.substring(1).trim();
        if (currentSection === 'additional') {
          result.additional.push(item);
        } else {
          result.achievements.push(item);
        }
      } else {
        if (currentSection === 'intro') {
          result.intro.push(line);
        } else {
          const list = currentSection === 'achievements' ? result.achievements : result.additional;
          if (list.length > 0) {
            list[list.length - 1] += ' ' + line;
          } else {
            result.intro.push(line);
          }
        }
      }
    }
    return result;
  }

  $: formattedDesc = parseDescription(currentPlatform?.desc);

  function handleKeyDown(e) {
    game.keys[e.key] = true;
    if (e.key === ' ' && !game.player.jumping) {
      game.player.vy = game.jumpForce;
      game.player.jumping = true;
    }
  }

  function handleKeyUp(e) {
    game.keys[e.key] = false;
  }

  function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      game.particles.push({
        x, y, vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -5, life: 1, color
      });
    }
  }

  function displayPlatformInfo(platform) {
    currentPlatform = platform;
  }

  function hidePlatformInfo() {
    currentPlatform = null;
  }

  function update() {
    const p = game.player;

    if (game.keys['ArrowLeft'] || game.keys['a']) p.vx = -game.moveSpeed;
    else if (game.keys['ArrowRight'] || game.keys['d']) p.vx = game.moveSpeed;
    else p.vx *= 0.8;

    p.vy += game.gravity;
    p.x += p.vx;
    p.y += p.vy;

    game.camera.x += (p.x - game.camera.x - width * 0.7 / 3) * 0.1;
    if (game.camera.x < 0) game.camera.x = 0;
    if (game.camera.x > game.levelEnd - width * 0.7) game.camera.x = game.levelEnd - width * 0.7;

    let landed = false;
    game.platforms.forEach(platform => {
      if (p.x + p.w > platform.x && p.x < platform.x + platform.w &&
          p.y + p.h > platform.y && p.y + p.h < platform.y + 20 && p.vy > 0) {
        if (p.jumping) {
          createParticles(p.x + p.w / 2, p.y + p.h, platform.color);
          p.squash = 0.6;
        }
        p.y = platform.y - p.h;
        p.vy = 0;
        p.jumping = false;
        landed = true;

        if (p.onPlatform !== platform) {
          if (platform.company) {
            displayPlatformInfo(platform);
          }
          p.onPlatform = platform;
        }
      }
    });

    if (!landed) {
      p.onPlatform = null;
      hidePlatformInfo();
    }

    p.squash += (1 - p.squash) * 0.15;
    game.particles = game.particles.filter(pt => {
      pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.3; pt.life -= 0.02;
      return pt.life > 0;
    });

    if (p.x < 0) p.x = 0;
    if (p.x > game.levelEnd) {
       p.x = game.levelEnd;
       p.vx = 0;
    }
    if (p.y > height) { p.y = 390; p.x = 70; p.vy = 0; game.camera.x = 0; hidePlatformInfo(); }
  }

  function draw(ctx) {
      const T = themes[currentTheme];
      ctx.fillStyle = T.bg;
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.translate(-game.camera.x, -game.camera.y);
      game.parallaxLayers.forEach(layer => {
        ctx.fillStyle = layer.color;
        const parallaxX = -game.camera.x * layer.speed;
        layer.items.forEach(item => {
          ctx.fillRect(item.x + parallaxX, item.y, item.w, item.h);
        });
      });
      game.platforms.forEach(platform => {
        ctx.fillStyle = T.platformShadow;
        ctx.fillRect(platform.x + 4, platform.y + 4, platform.w, platform.h);
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
        ctx.fillStyle = T.platformTop;
        ctx.fillRect(platform.x, platform.y, platform.w, 3);
        if (platform.company) {
          ctx.fillStyle = T.text;
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(platform.company, platform.x + platform.w / 2, platform.y + platform.h + 15);
        }
      });
      game.particles.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
      });
      ctx.globalAlpha = 1;
      
      const p = game.player;
      ctx.save();
      ctx.translate(p.x, p.y);
      
      const px = 4;
      const time = Date.now() * 0.003;
      
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(6, 32, 11, p.h - 36);
      ctx.fillRect(23, 32, 11, p.h - 36);
      
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(6, 32, 28, 3);
      
      ctx.strokeStyle = T.player2 || '#06b6d4';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      
      const tentacles = [
        { x1: 8, y1: 10, x2: -4, y2: 4, x3: -10, y3: -2, offset: 0, factor: 8 },
        { x1: 32, y1: 10, x2: 44, y2: 4, x3: 50, y3: -2, offset: 1.5, factor: 8 },
        { x1: 6, y1: 18, x2: -6, y2: 16, x3: -12, y3: 10, offset: 3, factor: 6 },
        { x1: 34, y1: 18, x2: 46, y2: 16, x3: 52, y3: 10, offset: 4.5, factor: 6 },
        { x1: 10, y1: 26, x2: 0, y2: 26, x3: -6, y3: 20, offset: 2, factor: 5 },
        { x1: 30, y1: 26, x2: 40, y2: 26, x3: 46, y3: 20, offset: 3.5, factor: 5 }
      ];

      tentacles.forEach(t => {
        ctx.beginPath();
        ctx.moveTo(t.x1, t.y1);
        const float = Math.sin(time + t.offset) * t.factor;
        ctx.quadraticCurveTo(t.x2, t.y2 + float, t.x3, t.y3);
        ctx.stroke();
      });
      
      const octopus = [
        '..888888..', '.88888888.', '8888888888', '8822..2288', '8822..2288',
        '8888888888', '.88888888.', '..888888..'
      ];
      
      for(let row = 0; row < octopus.length; row++) {
        for(let col = 0; col < octopus[row].length; col++) {
          const pixel = octopus[row][col];
          if(pixel === '8') {
            ctx.fillStyle = row < 3 ? (T.player1 || '#22d3ee') : (T.player2 || '#06b6d4');
            ctx.fillRect(col * px, row * px, px, px);
          } else if(pixel === '2') {
            ctx.fillStyle = T.playerEyes || '#000';
            ctx.fillRect(col * px, row * px, px, px);
          }
        }
      }
      
      ctx.fillStyle = '#fff';
      ctx.fillRect(3 * px, 3 * px, px, px);
      ctx.fillRect(7 * px, 3 * px, px, px);
      
      ctx.fillStyle = 'rgba(251, 113, 133, 0.5)';
      ctx.fillRect(1 * px, 5 * px, px * 2, px);
      ctx.fillRect(7 * px, 5 * px, px * 2, px);
      
      ctx.fillStyle = T.player2 || '#06b6d4';
      ctx.fillRect(10, p.h - 8, 6, 4);
      ctx.fillRect(8, p.h - 4, 8, 4);
      ctx.fillRect(24, p.h - 8, 6, 4);
      ctx.fillRect(24, p.h - 4, 8, 4);
      
      ctx.restore();
      ctx.restore();
  }

  onMount(() => {
    const ctx = canvas.getContext('2d');
    
    function createParallax() {
      game.parallaxLayers = [];
      const layerCount = 3;
      for (let i = 0; i < layerCount; i++) {
        const speed = 0.2 + i * 0.2;
        const color = themes[currentTheme].parallax[i];
        const items = [];
        for (let j = 0; j < 50; j++) {
          items.push({
            x: Math.random() * game.levelEnd * 2,
            y: Math.random() * height,
            w: 20 + Math.random() * 50,
            h: 5 + Math.random() * 15
          });
        }
        game.parallaxLayers.push({ speed, color, items });
      }
    }

    function resize() {
      const panelWidth = descriptionPanel.clientWidth;
      width = window.innerWidth - panelWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      createParallax();
    }

    function gameLoop() {
      update();
      draw(ctx);
      requestAnimationFrame(gameLoop);
    }
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', resize);
    
    resize();
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', resize);
    };
  });
</script>

<svelte:head>
  <title>Vladimir Rybas - Interactive Resume</title>
</svelte:head>

<div class="container" style="--bg:{themes[currentTheme].bg}; --panelBg:{themes[currentTheme].panelBg}; --cardBorder:{themes[currentTheme].cardBorder}; --cardText:{themes[currentTheme].cardText}; --cardPeriod:{themes[currentTheme].cardPeriod}; --cardH3:{themes[currentTheme].cardH3};">
  <div class="game-wrapper">
    <canvas bind:this={canvas}></canvas>
    <button class="theme-switcher" on:click={toggleTheme}>
      {currentTheme === 'light' ? '🌙' : '☀️'}
    </button>
  </div>
  <div class="description-panel" bind:this={descriptionPanel}>
    <div class="instructions">
      <p>Use the arrow keys or A/D to move and Space to jump.</p>
      <p>Jump on the platforms to learn more about my experience.</p>
    </div>

    {#if currentPlatform && formattedDesc}
      <div class="content">
        <h3>{currentPlatform.company}</h3>
        <p class="period">{currentPlatform.period}</p>

        {#each formattedDesc.intro as paragraph}
          <p>{paragraph}</p>
        {/each}

        {#if formattedDesc.techStack}
          <h4 class="section-title">Tech Stack</h4>
          <p class="tech-stack">{formattedDesc.techStack}</p>
        {/if}

        {#if formattedDesc.achievements.length > 0}
          <h4 class="section-title">Responsibilities and Achievements</h4>
          <ul class="achievements-list">
            {#each formattedDesc.achievements as item}
              <li>{item}</li>
            {/each}
          </ul>
        {/if}

        {#if formattedDesc.additional.length > 0}
          <h4 class="section-title">Additional Experience</h4>
          <ul class="achievements-list">
            {#each formattedDesc.additional as item}
              <li>{item}</li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    background: var(--bg);
    overflow: hidden;
    font-family: sans-serif;
  }

  .container {
    display: flex;
    width: 100vw;
    height: 100vh;
  }

  .game-wrapper {
    position: relative;
    flex-grow: 1;
    height: 100%;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  
  .description-panel {
    width: 30%;
    max-width: 400px;
    background: var(--panelBg);
    border-left: 1px solid var(--cardBorder);
    color: var(--cardText);
    overflow-y: auto;
    transition: background 0.3s;
    display: flex;
    flex-direction: column;
  }

  .instructions {
    padding: 10px 40px;
    border-bottom: 1px solid var(--cardBorder);
    background: rgba(0, 0, 0, 0.02);
  }

  .content {
    padding: 40px;
  }

  .description-panel h3 {
    color: var(--cardH3);
    margin: 0 0 10px 0;
    font-size: 24px;
  }

  .description-panel .period {
    color: var(--cardPeriod);
    margin-bottom: 20px;
    font-size: 14px;
  }

  .description-panel p {
    font-size: 14px;
    line-height: 1.6;
    margin: 1em 0;
  }
  
  .theme-switcher {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100;
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    color: var(--cardText);
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
  }

  .section-title {
    color: var(--cardH3);
    font-size: 18px;
    margin-top: 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--cardBorder);
    padding-bottom: 5px;
  }

  .tech-stack {
    font-size: 14px !important;
    color: var(--cardPeriod) !important;
    line-height: 1.5;
  }

  .achievements-list {
    padding-left: 20px;
    margin: 0;
    font-size: 16px;
  }

  .achievements-list li {
    margin-bottom: 10px;
    line-height: 1.5;
  }
</style>
