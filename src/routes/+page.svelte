<script>
  import { onMount } from 'svelte';
  import { _, locale, isLoading } from 'svelte-i18n';
  import en from '$lib/i18n/locales/en.json';
  import ru from '$lib/i18n/locales/ru.json';
  import ja from '$lib/i18n/locales/ja.json';

  const translations = { en, ru, ja };

  let canvas;
  let descriptionPanel;
  let currentPlatform = null;
  let width, height;

  let currentTheme = 'light';
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    { value: 'ja', label: '日本語' }
  ];

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

  function handleLanguageChange(event) {
    locale.set(event.target.value);
  }

  const game = {
    player: {
      x: 70, y: 390, w: 40, h: 60,
      vx: 0, vy: 0, jumping: false,
      squash: 1, onPlatform: null
    },
    platforms: [
        { x: 0, y: 450, w: 180, h: 20, color: '#3b82f6' },
        { x: 250, y: 400, w: 200, h: 20, key: 'toptal', color: '#6366f1' },
        { x: 500, y: 350, w: 180, h: 20, key: 'upwork', color: '#8b5cf6' },
        { x: 750, y: 280, w: 200, h: 20, key: 'workhuman', color: '#a855f7' },
        { x: 1000, y: 200, w: 220, h: 20, key: 'chulakov', color: '#c084fc' },
      ],
    particles: [],
    parallaxLayers: [],
    camera: { x: 0, y: 0 },
    levelEnd: 2000,
    gravity: 0.5, jumpForce: -12, moveSpeed: 5, keys: {}
  };

  function getPlatformData(platform, currentLocale) {
    if (!platform?.key || !currentLocale) return null;

    const lang = translations[currentLocale] || translations.en;
    const platformInfo = lang.platforms[platform.key];

    if (!platformInfo) return null;

    return {
      company: platformInfo.company,
      period: platformInfo.period,
      intro: platformInfo.intro.split('\n').filter(line => line.trim()),
      techStack: platformInfo.techStack,
      achievements: platformInfo.achievements || [],
      additional: platformInfo.additional || []
    };
  }

  $: platformData = getPlatformData(currentPlatform, $locale);

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
          if (platform.key) {
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
        if (platform.key) {
          const lang = translations[$locale] || translations.en;
          const company = lang.platforms[platform.key]?.company;
          if (company) {
            ctx.fillStyle = T.text;
            ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(company, platform.x + platform.w / 2, platform.y + platform.h + 15);
          }
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
      ctx.translate(p.x + p.w / 2, p.y + p.h);

      const time = Date.now() * 0.003;
      const legMove = p.vx !== 0 ? Math.sin(time * 10) * 5 : 0;

      // Giraffe colors
      const bodyColor = '#F5A623';
      const spotColor = '#8B4513';
      const neckColor = '#F0A030';
      const darkColor = '#5C3010';

      // ── BACK LEGS ──────────────────────────────────────────────
      ctx.fillStyle = bodyColor;
      // Back left
      ctx.beginPath();
      ctx.roundRect(-14, -18, 6, 20, 3);
      ctx.fill();
      // Back right
      ctx.beginPath();
      ctx.roundRect(8, -18, 6, 20, 3);
      ctx.fill();

      // ── BODY ──────────────────────────────────────────────────
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, -28, 17, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body spots
      ctx.fillStyle = spotColor;
      ctx.beginPath(); ctx.ellipse(-9, -26, 4, 5, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(7, -30, 3, 4, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(2, -22, 3, 3, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-3, -34, 3, 3, -0.1, 0, Math.PI * 2); ctx.fill();

      // ── NECK ──────────────────────────────────────────────────
      ctx.fillStyle = neckColor;
      ctx.beginPath();
      ctx.moveTo(-7, -40);
      ctx.lineTo(7, -40);
      ctx.lineTo(5, -66);
      ctx.lineTo(-5, -66);
      ctx.closePath();
      ctx.fill();

      // Neck spots
      ctx.fillStyle = spotColor;
      ctx.beginPath(); ctx.ellipse(-3, -50, 3, 4, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(4, -58, 2, 3, -0.2, 0, Math.PI * 2); ctx.fill();

      // ── SCARF ──────────────────────────────────────────────────
      const scarfColors = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f'];
      const flow = -p.vx * 5;
      const wave = Math.sin(time * 8) * (Math.abs(p.vx) > 0.5 ? 4 : 1.5);
      const scarfY = -54;
      const scarfStripes = 4;

      for (let i = 0; i < scarfStripes; i++) {
        const offset = i * 3 - 4;
        const cp1x = flow * 0.3;
        const cp1y = scarfY + offset + wave;
        const cp2x = flow * 0.7;
        const cp2y = scarfY + offset + 8 - wave;
        const endX = flow;
        const endY = scarfY + offset + 5;

        ctx.beginPath();
        ctx.moveTo(-3, scarfY + offset);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        ctx.strokeStyle = scarfColors[i];
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Scarf knot on the neck
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.ellipse(0, scarfY + 4, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c1121f';
      ctx.beginPath();
      ctx.ellipse(0, scarfY + 4, 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── FRONT LEGS (animated) ──────────────────────────────────
      ctx.fillStyle = bodyColor;
      // Front left
      ctx.save();
      ctx.translate(-9, -22);
      ctx.rotate(legMove * 0.04);
      ctx.beginPath();
      ctx.roundRect(-3, 0, 6, 22, 3);
      ctx.fill();
      ctx.fillStyle = darkColor;
      ctx.beginPath();
      ctx.roundRect(-3, 18, 7, 5, 2);
      ctx.fill();
      ctx.restore();

      // Front right
      ctx.save();
      ctx.translate(9, -22);
      ctx.rotate(-legMove * 0.04);
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.roundRect(-3, 0, 6, 22, 3);
      ctx.fill();
      ctx.fillStyle = darkColor;
      ctx.beginPath();
      ctx.roundRect(-3, 18, 7, 5, 2);
      ctx.fill();
      ctx.restore();

      // Back hooves
      ctx.fillStyle = darkColor;
      ctx.beginPath(); ctx.roundRect(-14, -1, 7, 5, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(8, -1, 7, 5, 2); ctx.fill();

      // ── HEAD ──────────────────────────────────────────────────
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, -73, 10, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snout
      ctx.fillStyle = '#F8C07A';
      ctx.beginPath();
      ctx.ellipse(5, -70, 6, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Nostrils
      ctx.fillStyle = darkColor;
      ctx.beginPath(); ctx.ellipse(4, -69, 1.2, 0.8, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(7, -68, 1.2, 0.8, 0.3, 0, Math.PI * 2); ctx.fill();

      // Ossicones (horns)
      ctx.fillStyle = spotColor;
      ctx.beginPath(); ctx.roundRect(-8, -84, 4, 10, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(1, -85, 4, 10, 2); ctx.fill();
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(-6, -85, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, -86, 3, 0, Math.PI * 2); ctx.fill();

      // Head spot
      ctx.fillStyle = spotColor;
      ctx.beginPath(); ctx.ellipse(-4, -74, 3, 3, 0.2, 0, Math.PI * 2); ctx.fill();

      // Eye white
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(4, -76, 4, 0, Math.PI * 2); ctx.fill();
      // Pupil
      ctx.fillStyle = darkColor;
      ctx.beginPath(); ctx.arc(5, -76, 2, 0, Math.PI * 2); ctx.fill();
      // Highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(4.5, -77, 1, 0, Math.PI * 2); ctx.fill();

      // Eyelashes
      ctx.strokeStyle = darkColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const angle = -Math.PI * 0.9 + i * 0.3;
        ctx.beginPath();
        ctx.moveTo(4 + Math.cos(angle) * 4, -76 + Math.sin(angle) * 4);
        ctx.lineTo(4 + Math.cos(angle) * 6, -76 + Math.sin(angle) * 6);
        ctx.stroke();
      }

      // Smile
      ctx.strokeStyle = darkColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(6, -69, 3, 0.1, Math.PI * 0.6);
      ctx.stroke();

      // Blush
      ctx.fillStyle = 'rgba(251, 113, 133, 0.35)';
      ctx.beginPath(); ctx.ellipse(9, -72, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
      ctx.restore();
  }

  let gameInitialized = false;

  $: if (!$isLoading && canvas && descriptionPanel && !gameInitialized) {
    gameInitialized = true;
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
  }
</script>

<svelte:head>
  <title>Vladimir Rybas - Interactive Resume</title>
</svelte:head>

{#if !$isLoading}
<div class="container" style="--bg:{themes[currentTheme].bg}; --panelBg:{themes[currentTheme].panelBg}; --cardBorder:{themes[currentTheme].cardBorder}; --cardText:{themes[currentTheme].cardText}; --cardPeriod:{themes[currentTheme].cardPeriod}; --cardH3:{themes[currentTheme].cardH3};">
  <div class="game-wrapper">
    <canvas bind:this={canvas}></canvas>
    <select class="language-selector" value={$locale} on:change={handleLanguageChange}>
      {#each languageOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    <button class="theme-switcher" on:click={toggleTheme}>
      {currentTheme === 'light' ? '🌙' : '☀️'}
    </button>
  </div>
  <div class="description-panel" bind:this={descriptionPanel}>
    <div class="instructions">
      <p>{$_('instructions.controls')}</p>
      <p>{$_('instructions.goal')}</p>
    </div>

    {#if currentPlatform && platformData}
      <div class="content">
        <h3>{platformData.company}</h3>
        <p class="period">{platformData.period}</p>

        {#each platformData.intro as paragraph}
          <p>{paragraph}</p>
        {/each}

        {#if platformData.techStack}
          <h4 class="section-title">{$_('sections.techStack')}</h4>
          <p class="tech-stack">{platformData.techStack}</p>
        {/if}

        {#if platformData.achievements.length > 0}
          <h4 class="section-title">{$_('sections.responsibilities')}</h4>
          <ul class="achievements-list">
            {#each platformData.achievements as item}
              <li>{item}</li>
            {/each}
          </ul>
        {/if}

        {#if platformData.additional.length > 0}
          <h4 class="section-title">{$_('sections.additional')}</h4>
          <ul class="achievements-list">
            {#each platformData.additional as item}
              <li>{item}</li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
</div>
{/if}

<style>
  :global(body) {
    margin: 0;
    background: var(--bg);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
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

  .language-selector {
    position: absolute;
    top: 20px;
    right: 80px;
    z-index: 100;
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    color: var(--cardText);
    padding: 10px 15px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    height: 50px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    outline: none;
  }

  .language-selector:hover {
    background: rgba(255,255,255,0.3);
  }

  .language-selector option {
    background: var(--panelBg);
    color: var(--cardText);
    padding: 10px;
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
