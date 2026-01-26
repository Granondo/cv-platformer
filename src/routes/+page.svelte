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

  function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  }

  const game = {
    player: {
      x: 100, y: 300, w: 40, h: 60,
      vx: 0, vy: 0, jumping: false,
      squash: 1, onPlatform: null
    },
    platforms: [
        { x: 50, y: 400, w: 200, h: 20, company: 'Toptal', color: '#6366f1',
          period: 'Sept 2019 - Jun 2020',
          desc: 'Built B2C e-commerce platform with secure authentication.' },
        { x: 300, y: 350, w: 180, h: 20, company: 'Upwork', color: '#8b5cf6',
          period: 'Aug 2020 - May 2021',
          desc: 'Developed task management platform with React, TypeScript.' },
        { x: 550, y: 280, w: 200, h: 20, company: 'WorkHuman', color: '#a855f7',
          period: 'May 2022 - May 2023',
          desc: 'Led JavaScript-to-TypeScript migration.' },
        { x: 800, y: 200, w: 220, h: 20, company: 'Chulakov Studio', color: '#c084fc',
          period: 'May 2024 - Present',
          desc: 'Architecting micro-frontend security monitoring app.' },
        { x: 1200, y: 300, w: 200, h: 20, company: 'Future Corp', color: '#f472b6',
          period: '2025 - 2026',
          desc: 'Innovating with AI and Web3.' },
        { x: 1500, y: 250, w: 180, h: 20, company: 'Dream Job Inc.', color: '#fb923c',
          period: '2026 - ∞',
          desc: 'Building the future.' }
      ],
    particles: [],
    parallaxLayers: [],
    camera: { x: 0, y: 0 },
    levelEnd: 2000,
    gravity: 0.5, jumpForce: -12, moveSpeed: 5, keys: {}
  };

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
          displayPlatformInfo(platform);
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
    if (p.y > height) { p.y = 300; p.x = 100; p.vy = 0; game.camera.x = 0; hidePlatformInfo(); }
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
      ctx.fillStyle = T.text;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(platform.company, platform.x + platform.w / 2, platform.y - 10);
    });

    game.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life;
      ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
    });
    ctx.globalAlpha = 1;

    const p = game.player;
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h);

    // Shadow
    ctx.fillStyle = T.platformShadow;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w / 2 * 1.2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(1 / p.squash, p.squash);

    // Spring
    const springHeight = 20;
    ctx.strokeStyle = T.spring;
    ctx.lineWidth = 4;
    ctx.beginPath();
    let coils = 5;
    let coilHeight = springHeight / coils;
    for(let i = 0; i < coils + 1; i++) {
        let y = -i * coilHeight;
        let x = Math.sin(i * 1.5 + Date.now() * 0.02) * 10;
        if(i === 0 || i === coils) x = 0;
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Body
    const bodyHeight = p.h - springHeight;
    ctx.translate(0, -springHeight);
    
    const gradient = ctx.createLinearGradient(-p.w / 2, -bodyHeight, p.w / 2, 0);
    gradient.addColorStop(0, T.player1);
    gradient.addColorStop(1, T.player2);
    ctx.fillStyle = gradient;
    ctx.fillRect(-p.w / 2, -bodyHeight, p.w, bodyHeight);

    // Eyes
    ctx.fillStyle = T.playerEyes;
    ctx.fillRect(-p.w / 4 - 5, -bodyHeight + 12, 6, 6);
    ctx.fillRect(p.w / 4 - 1, -bodyHeight + 12, 6, 6);
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
    {#if currentPlatform}
      <h3>{currentPlatform.company}</h3>
      <p class="period">{currentPlatform.period}</p>
      <p>{currentPlatform.desc}</p>
    {:else}
      <div class="placeholder">
        <h2>Welcome!</h2>
        <p>Use the arrow keys or A/D to move and Space to jump.</p>
        <p>Jump on the platforms to learn more about my experience.</p>
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
    padding: 40px;
    background: var(--panelBg);
    border-left: 1px solid var(--cardBorder);
    color: var(--cardText);
    overflow-y: auto;
    transition: background 0.3s;
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
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
  }
  
  .placeholder {
    text-align: center;
    margin-top: 50%;
    transform: translateY(-50%);
  }

  .placeholder h2 {
    color: var(--cardH3);
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
</style>
