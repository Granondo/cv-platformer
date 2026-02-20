<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let canvas;
  let width, height;
  let stalactites = [];
  let torchParticles = [];
  let lavaBubbles = [];
  let animFrame;

  function generateStalactites() {
    stalactites = [];
    const count = Math.floor(width / 40);
    for (let i = 0; i < count; i++) {
      stalactites.push({
        x: Math.random() * width,
        w: 8 + Math.random() * 16,
        h: 30 + Math.random() * 80,
        shade: Math.random() * 0.3
      });
    }
  }

  function spawnTorchParticle(tx, ty) {
    torchParticles.push({
      x: tx + (Math.random() - 0.5) * 8,
      y: ty,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -1 - Math.random() * 2,
      life: 1,
      size: 2 + Math.random() * 4,
      color: Math.random() > 0.5 ? '#ff6600' : Math.random() > 0.5 ? '#ffaa00' : '#ff3300'
    });
  }

  function update() {
    // Torch particles
    const torch1x = width * 0.2;
    const torch2x = width * 0.8;
    const torchY = height * 0.45;
    if (Math.random() > 0.3) spawnTorchParticle(torch1x, torchY);
    if (Math.random() > 0.3) spawnTorchParticle(torch2x, torchY);

    torchParticles = torchParticles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;
      p.size *= 0.98;
      return p.life > 0;
    });

    // Lava bubbles
    if (Math.random() > 0.92) {
      lavaBubbles.push({
        x: Math.random() * width,
        y: height - 40 + Math.random() * 10,
        r: 3 + Math.random() * 6,
        vy: -0.3 - Math.random() * 0.5,
        life: 1
      });
    }

    lavaBubbles = lavaBubbles.filter(b => {
      b.y += b.vy;
      b.life -= 0.015;
      return b.life > 0;
    });
  }

  function draw(ctx) {
    const t = Date.now() * 0.001;

    // Background
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(0, 0, width, height);

    // Ceiling
    const ceilH = 60;
    ctx.fillStyle = '#1a1412';
    ctx.fillRect(0, 0, width, ceilH);
    ctx.fillStyle = '#120e0a';
    for (let x = 0; x < width; x += 20) {
      const h = ceilH - 8 + Math.sin(x * 0.1) * 12;
      ctx.fillRect(x, 0, 20, h);
    }
    // Ceiling brick detail
    ctx.fillStyle = '#1e1814';
    for (let x = 0; x < width; x += 32) {
      ctx.fillRect(x, 0, 30, 2);
      ctx.fillRect(x + 16, ceilH - 4, 30, 2);
    }

    // Stalactites
    stalactites.forEach(s => {
      const baseColor = 0x1a + Math.floor(s.shade * 30);
      ctx.fillStyle = `rgb(${baseColor}, ${baseColor - 4}, ${baseColor - 8})`;
      // Triangular stalactite from pixel rects
      const steps = Math.floor(s.h / 4);
      for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const sw = s.w * (1 - ratio * 0.8);
        ctx.fillRect(s.x - sw / 2, ceilH + i * 4, sw, 5);
      }
      // Tip
      ctx.fillStyle = '#2a221c';
      ctx.fillRect(s.x - 1, ceilH + s.h - 4, 2, 6);
    });

    // Cave walls (left)
    ctx.fillStyle = '#14100c';
    for (let y = 0; y < height; y += 16) {
      const ww = 30 + Math.sin(y * 0.05 + t * 0.5) * 10;
      ctx.fillRect(0, y, ww, 18);
      ctx.fillStyle = '#1c1610';
      ctx.fillRect(0, y, ww - 4, 16);
      ctx.fillStyle = '#14100c';
    }
    // Cave walls (right)
    for (let y = 0; y < height; y += 16) {
      const ww = 30 + Math.sin(y * 0.06 + t * 0.5 + 2) * 10;
      ctx.fillRect(width - ww, y, ww, 18);
      ctx.fillStyle = '#1c1610';
      ctx.fillRect(width - ww + 4, y, ww - 4, 16);
      ctx.fillStyle = '#14100c';
    }

    // Torch brackets
    const torch1x = Math.floor(width * 0.2);
    const torch2x = Math.floor(width * 0.8);
    const torchY = Math.floor(height * 0.45);

    [torch1x, torch2x].forEach(tx => {
      // Bracket
      ctx.fillStyle = '#4a3a28';
      ctx.fillRect(tx - 4, torchY, 8, 20);
      ctx.fillStyle = '#6a5a40';
      ctx.fillRect(tx - 4, torchY, 8, 3);
      // Flame base
      const flicker = Math.sin(t * 8 + tx) * 2;
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(tx - 6, torchY - 10 + flicker, 12, 10);
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(tx - 4, torchY - 14 + flicker, 8, 8);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(tx - 2, torchY - 16 + flicker, 4, 6);
      // Glow
      const grad = ctx.createRadialGradient(tx, torchY - 10, 5, tx, torchY - 10, 120);
      grad.addColorStop(0, 'rgba(255, 120, 20, 0.15)');
      grad.addColorStop(1, 'rgba(255, 120, 20, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(tx - 120, torchY - 130, 240, 240);
    });

    // Torch particles
    torchParticles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), Math.round(p.size), Math.round(p.size));
    });
    ctx.globalAlpha = 1;

    // Lava (bottom)
    const lavaH = 60;
    const lavaY = height - lavaH;
    // Lava glow upward
    const lavaGlow = ctx.createLinearGradient(0, lavaY - 80, 0, lavaY);
    lavaGlow.addColorStop(0, 'rgba(200, 50, 0, 0)');
    lavaGlow.addColorStop(1, 'rgba(200, 50, 0, 0.15)');
    ctx.fillStyle = lavaGlow;
    ctx.fillRect(0, lavaY - 80, width, 80);

    // Lava body gradient
    const lavaGrad = ctx.createLinearGradient(0, lavaY, 0, height);
    lavaGrad.addColorStop(0, '#cc3300');
    lavaGrad.addColorStop(0.3, '#dd5500');
    lavaGrad.addColorStop(0.6, '#ee7700');
    lavaGrad.addColorStop(1, '#ff9900');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, lavaY, width, lavaH);

    // Lava surface animation
    ctx.fillStyle = '#ff5500';
    for (let x = 0; x < width; x += 12) {
      const waveH = Math.sin(x * 0.04 + t * 2) * 4;
      ctx.fillRect(x, lavaY - 4 + waveH, 12, 6);
    }
    ctx.fillStyle = '#ffaa33';
    for (let x = 6; x < width; x += 24) {
      const waveH = Math.sin(x * 0.05 + t * 3) * 3;
      ctx.fillRect(x, lavaY - 2 + waveH, 8, 3);
    }

    // Lava bubbles
    lavaBubbles.forEach(b => {
      ctx.globalAlpha = b.life * 0.7;
      ctx.fillStyle = '#ffcc44';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffee88';
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // "LEVEL 2" glow
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 20;
    ctx.font = '32px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffcc44';
    ctx.fillText('LEVEL 2', width / 2, height * 0.35);
    ctx.shadowBlur = 0;

    // "COMING SOON"
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 12;
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#cc8833';
    ctx.fillText('COMING SOON', width / 2, height * 0.35 + 50);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('The dungeon awaits...', width / 2, height * 0.35 + 80);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      goto('/');
    }
  }

  function goBack() {
    goto('/');
  }

  onMount(() => {
    const ctx = canvas.getContext('2d');

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      generateStalactites();
    }

    function gameLoop() {
      update();
      draw(ctx);
      animFrame = requestAnimationFrame(gameLoop);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', resize);
    resize();
    gameLoop();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', resize);
    };
  });
</script>

<svelte:head>
  <title>Level 2 - The Dungeon</title>
</svelte:head>

<div class="dungeon-container">
  <canvas bind:this={canvas}></canvas>
  <button class="back-button" on:click={goBack}>
    BACK TO LEVEL 1
  </button>
</div>

<style>
  :global(body) {
    margin: 0;
    background: #0a0808;
    overflow: hidden;
    font-family: 'Press Start 2P', monospace;
    image-rendering: pixelated;
  }

  .dungeon-container {
    position: relative;
    width: 100vw;
    height: 100vh;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
  }

  .back-button {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #cc6600;
    color: #ffaa44;
    padding: 14px 28px;
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    cursor: pointer;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.8);
    z-index: 10;
  }

  .back-button:hover {
    background: rgba(200, 80, 0, 0.3);
    box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.8);
    transform: translateX(-50%) translate(2px, 2px);
  }

  .back-button:active {
    box-shadow: none;
    transform: translateX(-50%) translate(4px, 4px);
  }
</style>
