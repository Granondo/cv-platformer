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
      const bounce = Math.sin(time * 3) * 2;

      // Apply squash and stretch
      const scaleX = 1 / p.squash;
      const scaleY = p.squash;
      ctx.scale(scaleX, scaleY);

      // Wing flap animation (only when jumping)
      const wingFlap = p.jumping ? Math.sin(time * 15) * 0.4 : -0.3;

      // Left wing (behind)
      ctx.save();
      ctx.translate(-12, -35);
      ctx.rotate(-0.5 + wingFlap);
      ctx.fillStyle = T.player2 || '#06b6d4';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-2, -6, 3, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right wing (behind)
      ctx.save();
      ctx.translate(12, -35);
      ctx.rotate(0.5 - wingFlap);
      ctx.fillStyle = T.player2 || '#06b6d4';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(2, -6, 3, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Legs (move while walking)
      const legMove = Math.sin(time * 6) * 3;
      ctx.strokeStyle = T.player2 || '#06b6d4';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      // Left leg
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(-12 + legMove, 0);
      ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(12 - legMove, 0);
      ctx.stroke();

      // Main body - smooth blob shape
      ctx.fillStyle = T.player1 || '#22d3ee';
      ctx.beginPath();
      ctx.ellipse(0, -30, 20, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body shine/highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-6, -38, 8, 10, -0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      const eyeOffset = Math.sin(time * 2) * 1;

      // Left eye white
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-8, -32 + bounce, 6, 0, Math.PI * 2);
      ctx.fill();

      // Right eye white
      ctx.beginPath();
      ctx.arc(8, -32 + bounce, 6, 0, Math.PI * 2);
      ctx.fill();

      // Left pupil
      ctx.fillStyle = T.playerEyes || '#1e293b';
      ctx.beginPath();
      ctx.arc(-8 + eyeOffset, -32 + bounce, 3, 0, Math.PI * 2);
      ctx.fill();

      // Right pupil
      ctx.beginPath();
      ctx.arc(8 + eyeOffset, -32 + bounce, 3, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-9 + eyeOffset, -33 + bounce, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(7 + eyeOffset, -33 + bounce, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = T.playerEyes || '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -26, 8, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Blush
      ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-14, -26, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(14, -26, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();

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
