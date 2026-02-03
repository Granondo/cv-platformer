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
        ctx.fillText(platform.company, platform.x + platform.w / 2, platform.y + platform.h + 15);
      });
      game.particles.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
      });
      ctx.globalAlpha = 1;
      
      // Octopus Character
      const p = game.player;
      ctx.save();
      ctx.translate(p.x, p.y);
      
      const px = 4; // pixel size
      const time = Date.now() * 0.003;
      
      // Red pants (TWO SEPARATE LEGS with bigger gap)
      ctx.fillStyle = '#dc2626';
      // Left pant leg (wider gap in middle)
      ctx.fillRect(6, 32, 11, p.h - 36);
      // Right pant leg
      ctx.fillRect(23, 32, 11, p.h - 36);
      
      // Pants details (belt/waistband - full width)
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(6, 32, 28, 3);
      
      // Gap between legs is just empty (transparent/white background shows through)
      // No need to draw anything - the space between x:17-23 is just empty
      
      // Animated floating tentacles around body (larger and more visible)
      ctx.strokeStyle = T.player2 || '#06b6d4';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      
      // Top left tentacle (long)
      ctx.beginPath();
      ctx.moveTo(8, 10);
      const float1 = Math.sin(time + 0) * 8;
      ctx.quadraticCurveTo(-4, 4 + float1, -10, -2);
      ctx.stroke();
      
      // Top right tentacle (long)
      ctx.beginPath();
      ctx.moveTo(32, 10);
      const float2 = Math.sin(time + 1.5) * 8;
      ctx.quadraticCurveTo(44, 4 + float2, 50, -2);
      ctx.stroke();
      
      // Middle left tentacle
      ctx.beginPath();
      ctx.moveTo(6, 18);
      const float3 = Math.sin(time + 3) * 6;
      ctx.quadraticCurveTo(-6, 16 + float3, -12, 10);
      ctx.stroke();
      
      // Middle right tentacle
      ctx.beginPath();
      ctx.moveTo(34, 18);
      const float4 = Math.sin(time + 4.5) * 6;
      ctx.quadraticCurveTo(46, 16 + float4, 52, 10);
      ctx.stroke();
      
      // Bottom left tentacle
      ctx.beginPath();
      ctx.moveTo(10, 26);
      const float5 = Math.sin(time + 2) * 5;
      ctx.quadraticCurveTo(0, 26 + float5, -6, 20);
      ctx.stroke();
      
      // Bottom right tentacle
      ctx.beginPath();
      ctx.moveTo(30, 26);
      const float6 = Math.sin(time + 3.5) * 5;
      ctx.quadraticCurveTo(40, 26 + float6, 46, 20);
      ctx.stroke();
      
      // Suction cups on tentacles (larger)
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      const cups = [
        {x: -6, y: 2 + float1},
        {x: 46, y: 2 + float2},
        {x: -8, y: 14 + float3},
        {x: 48, y: 14 + float4},
        {x: -2, y: 22 + float5},
        {x: 42, y: 22 + float6},
      ];
      cups.forEach(cup => {
        ctx.beginPath();
        ctx.arc(cup.x, cup.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Octopus body (10x8 pixels)
      const octopus = [
        '..888888..',
        '.88888888.',
        '8888888888',
        '8822..2288',
        '8822..2288',
        '8888888888',
        '.88888888.',
        '..888888..',
      ];
      
      // Draw body
      for(let row = 0; row < octopus.length; row++) {
        for(let col = 0; col < octopus[row].length; col++) {
          const pixel = octopus[row][col];
          
          if(pixel === '8') {
            if(row < 3) {
              ctx.fillStyle = T.player1 || '#22d3ee';
            } else {
              ctx.fillStyle = T.player2 || '#06b6d4';
            }
            ctx.fillRect(col * px, row * px, px, px);
          } else if(pixel === '2') {
            ctx.fillStyle = T.playerEyes || '#000';
            ctx.fillRect(col * px, row * px, px, px);
          }
        }
      }
      
      // Eye shine
      ctx.fillStyle = '#fff';
      ctx.fillRect(3 * px, 3 * px, px, px);
      ctx.fillRect(7 * px, 3 * px, px, px);
      
      // Cheek blush
      ctx.fillStyle = 'rgba(251, 113, 133, 0.5)';
      ctx.fillRect(1 * px, 5 * px, px * 2, px);
      ctx.fillRect(7 * px, 5 * px, px * 2, px);
      
      // Static ground legs (RIGHT AT THE BOTTOM - using p.h)
      ctx.fillStyle = T.player2 || '#06b6d4';
      // Left leg
      ctx.fillRect(10, p.h - 8, 6, 4);
      ctx.fillRect(8, p.h - 4, 8, 4);
      // Right leg
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
    {#if currentPlatform}
      <h3>{currentPlatform.company}</h3>
      <p class="period">{currentPlatform.period}</p>
      <p>{currentPlatform.desc}</p>

    {/if}
    <div class="placeholder">
        <p>Use the arrow keys or A/D to move and Space to jump.</p>
        <p>Jump on the platforms to learn more about my experience.</p>
    </div>
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
    position: relative;
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
    position: absolute;
    bottom: 40px;
    left: 0;
    right: 0;
    border-top: 1px solid var(--cardBorder);
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .placeholder h2 {
    color: var(--cardH3);
    font-size: 1.2em;
  }

  .placeholder p {
    font-size: 0.9em;
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
