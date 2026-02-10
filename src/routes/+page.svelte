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
  let starsCollected = 0;
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

  const techs = [
    { name: 'React',       color: '#61DAFB', colorLight: '#a8eeff', colorDark: '#0e9abf' },
    { name: 'TypeScript',  color: '#3178C6', colorLight: '#6faee8', colorDark: '#1a4a8a' },
    { name: 'Node.js',     color: '#339933', colorLight: '#6fcc6f', colorDark: '#1a5c1a' },
    { name: 'Redux',       color: '#764ABC', colorLight: '#b085e0', colorDark: '#3d1f6e' },
    { name: 'MobX',        color: '#FF9955', colorLight: '#ffc99a', colorDark: '#c85a00' },
    { name: 'PostgreSQL',  color: '#336791', colorLight: '#6fa0c4', colorDark: '#1a3d5c' },
    { name: 'MongoDB',     color: '#47A248', colorLight: '#84d085', colorDark: '#235c24' },
    { name: 'Express',     color: '#888888', colorLight: '#bbbbbb', colorDark: '#444444' },
    { name: 'Highcharts',  color: '#8087E8', colorLight: '#b3b8ff', colorDark: '#4a52b8' },
    { name: 'Material UI', color: '#0081CB', colorLight: '#50b5f5', colorDark: '#004f80' },
    { name: 'Draft.js',    color: '#6b8cba', colorLight: '#9cb5d8', colorDark: '#3a5a80' },
    { name: 'JavaScript',  color: '#F7DF1E', colorLight: '#fff380', colorDark: '#b8a000' },
    { name: 'CSS',         color: '#1572B6', colorLight: '#55a5e8', colorDark: '#0a3f70' },
    { name: 'HTML',        color: '#E34F26', colorLight: '#f99272', colorDark: '#902200' },
    { name: 'Git',         color: '#F05032', colorLight: '#f98a78', colorDark: '#a01a00' },
    { name: 'React Router',color: '#CA4245', colorLight: '#e87f82', colorDark: '#7a1518' },
    { name: 'Context API', color: '#00BCD4', colorLight: '#70e8f5', colorDark: '#007a8a' },
  ];

  const game = {
    player: {
      x: 70, y: 390, w: 40, h: 60,
      vx: 0, vy: 0, jumping: false,
      squash: 1, onPlatform: null
    },
    falling: false,
    fallBubbles: [],
    fallBubbleTimer: 0,
    techQueue: [],
    platforms: [
        { x: 0, y: 450, w: 180, h: 20, color: '#3b82f6' },
        { x: 250, y: 400, w: 200, h: 20, key: 'toptal', color: '#6366f1' },
        { x: 500, y: 350, w: 180, h: 20, key: 'upwork', color: '#8b5cf6' },
        { x: 750, y: 280, w: 200, h: 20, key: 'workhuman', color: '#a855f7' },
        { x: 1000, y: 200, w: 220, h: 20, key: 'chulakov', color: '#c084fc' },
        { x: 1290, y: 280, w: 180, h: 20, color: '#f59e0b' },
        { x: 1530, y: 220, w: 150, h: 20, color: '#f97316' },
        { x: 1740, y: 160, w: 160, h: 20, color: '#ef4444' },
        { x: 1960, y: 250, w: 140, h: 20, color: '#ec4899' },
        { x: 2160, y: 180, w: 170, h: 20, color: '#d946ef' },
        { x: 2390, y: 280, w: 150, h: 20, color: '#10b981' },
        { x: 2600, y: 200, w: 160, h: 20, color: '#14b8a6' },
        { x: 2820, y: 130, w: 140, h: 20, color: '#06b6d4' },
        { x: 3020, y: 200, w: 150, h: 20, color: '#0ea5e9' },
        { x: 3230, y: 280, w: 160, h: 20, color: '#3b82f6' },
        { x: 3450, y: 180, w: 150, h: 20, color: '#6366f1' },
        { x: 3660, y: 100, w: 160, h: 20, color: '#84cc16' },
        { x: 3880, y: 160, w: 140, h: 20, color: '#22c55e' },
        { x: 4080, y: 240, w: 150, h: 20, color: '#eab308' },
        { x: 4290, y: 160, w: 160, h: 20, color: '#f97316' },
        { x: 4510, y: 90,  w: 150, h: 20, color: '#f43f5e' },
        { x: 4720, y: 160, w: 160, h: 20, color: '#a855f7' },
        { x: 4940, y: 240, w: 150, h: 20, color: '#2dd4bf' },
        { x: 5150, y: 160, w: 160, h: 20, color: '#fbbf24' },
        { x: 5370, y: 90,  w: 150, h: 20, color: '#60a5fa' },
        { x: 5580, y: 160, w: 170, h: 20, color: '#c084fc' },
      ],
    stars: [
        // Between start and Toptal
        { x: 180, y: 370 }, { x: 220, y: 340 },
        // On/around Toptal
        { x: 280, y: 370 }, { x: 380, y: 360 }, { x: 430, y: 330 },
        // Between Toptal and Upwork
        { x: 470, y: 310 },
        // On/around Upwork
        { x: 530, y: 320 }, { x: 610, y: 300 }, { x: 660, y: 280 },
        // On/around WorkHuman
        { x: 790, y: 250 }, { x: 870, y: 230 },
        // Between WorkHuman and Chulakov
        { x: 940, y: 200 }, { x: 970, y: 170 },
        // On/around Chulakov
        { x: 1030, y: 170 }, { x: 1120, y: 155 }, { x: 1190, y: 180 },
        // Between Chulakov and final platform
        { x: 1240, y: 240 }, { x: 1260, y: 210 },
        // On final platform
        { x: 1310, y: 250 }, { x: 1360, y: 240 }, { x: 1420, y: 250 },
        // Platform 7 (orange)
        { x: 1550, y: 190 }, { x: 1640, y: 200 },
        // Platform 8 (red)
        { x: 1760, y: 130 }, { x: 1860, y: 140 },
        // Platform 9 (pink)
        { x: 1980, y: 220 }, { x: 2060, y: 230 },
        // Platform 10 (fuchsia)
        { x: 2180, y: 150 }, { x: 2280, y: 160 },
        // Platform 11 (emerald)
        { x: 2410, y: 250 }, { x: 2510, y: 260 },
        // Platform 12 (teal)
        { x: 2620, y: 170 }, { x: 2720, y: 175 },
        // Platform 13 (cyan)
        { x: 2840, y: 100 }, { x: 2930, y: 110 },
        // Platform 14 (sky)
        { x: 3040, y: 170 }, { x: 3130, y: 180 },
        // Platform 15 (blue)
        { x: 3250, y: 250 }, { x: 3350, y: 255 },
        // Platform 16 (indigo)
        { x: 3470, y: 150 }, { x: 3560, y: 160 },
        // Platform 17 (lime)
        { x: 3680, y: 70  }, { x: 3780, y: 80  },
        // Platform 18 (green)
        { x: 3900, y: 130 }, { x: 3990, y: 140 },
        // Platform 19 (yellow)
        { x: 4100, y: 210 }, { x: 4190, y: 220 },
        // Platform 20 (orange)
        { x: 4310, y: 130 }, { x: 4400, y: 140 },
        // Platform 21 (rose)
        { x: 4530, y: 60  }, { x: 4620, y: 70  },
        // Platform 22 (violet)
        { x: 4740, y: 130 }, { x: 4830, y: 140 },
        // Platform 23 (teal)
        { x: 4960, y: 210 }, { x: 5050, y: 220 },
        // Platform 24 (amber)
        { x: 5170, y: 130 }, { x: 5260, y: 140 },
        // Platform 25 (sky blue)
        { x: 5390, y: 60  }, { x: 5480, y: 70  },
        // Platform 26 (final)
        { x: 5600, y: 130 }, { x: 5690, y: 140 }, { x: 5730, y: 135 },
    ].map(s => ({ ...s, collected: false, animTimer: 0 })),
    starsCollected: 0,
    particles: [],
    parallaxLayers: [],
    camera: { x: 0, y: 0 },
    levelEnd: 6000,
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
    if (e.key === ' ') {
      if (game.falling) {
        game.falling = false;
        game.fallBubbles = [];
        game.techQueue = [];
        game.camera.y = 0;
        game.player.x = 70; game.player.y = 390;
        game.player.vx = 0; game.player.vy = 0;
        game.player.rotation = 0;
        game.camera.x = 0;
        game.stars.forEach(s => { s.collected = false; s.animTimer = 0; });
        game.starsCollected = 0;
        starsCollected = 0;
        hidePlatformInfo();
      } else if (!game.player.jumping) {
        game.player.vy = game.jumpForce;
        game.player.jumping = true;
      }
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

    // Star collection
    game.stars.forEach(star => {
      if (star.collected) {
        star.animTimer = Math.max(0, star.animTimer - 1);
        return;
      }
      const dx = (p.x + p.w / 2) - star.x;
      const dy = (p.y + p.h / 2) - star.y;
      if (Math.sqrt(dx * dx + dy * dy) < 28) {
        star.collected = true;
        star.animTimer = 30;
        game.starsCollected++;
        starsCollected = game.starsCollected;
      }
    });
    game.particles = game.particles.filter(pt => {
      pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.3; pt.life -= 0.02;
      return pt.life > 0;
    });

    if (p.x < 0) p.x = 0;
    if (p.x > game.levelEnd) {
       p.x = game.levelEnd;
       p.vx = 0;
    }
    if (p.y > height + game.camera.y && !game.falling) {
      game.falling = true;
      hidePlatformInfo();
    }

    if (game.falling) {
      // Cap fall speed so giraffe is always visible
      if (p.vy > 4) p.vy = 4;
      p.rotation = (p.rotation || 0) + 0.03;

      game.camera.y += (p.y - game.camera.y - height * 0.4) * 0.08;

      game.fallBubbleTimer++;
      if (game.fallBubbleTimer > 18 && game.fallBubbles.length < 12) {
        game.fallBubbleTimer = 0;
        if (game.techQueue.length === 0) {
          game.techQueue = [...techs].sort(() => Math.random() - 0.5);
        }
        const tech = game.techQueue.pop();
        const angle = Math.random() * Math.PI * 2;
        const dist = 90 + Math.random() * 70;
        const radius = 28 + Math.random() * 14;
        game.fallBubbles.push({
          ox: Math.cos(angle) * dist,
          oy: Math.sin(angle) * dist,
          text: tech.name,
          color: tech.color,
          colorLight: tech.colorLight,
          colorDark: tech.colorDark,
          radius,
          angle,
          orbitSpeed: (Math.random() - 0.5) * 0.012,
          orbitDist: dist,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Slowly orbit each bubble around the player
      game.fallBubbles.forEach(b => {
        b.angle += b.orbitSpeed;
        b.ox = Math.cos(b.angle) * b.orbitDist;
        b.oy = Math.sin(b.angle) * b.orbitDist;
      });
    }
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

      // ── STARS ─────────────────────────────────────────────────
      const now = Date.now() * 0.003;
      game.stars.forEach(star => {
        if (star.collected && star.animTimer <= 0) return;

        const pulse = Math.sin(now + star.x * 0.1) * 0.15 + 1;
        const baseR = 10 * pulse;
        const alpha = star.collected ? star.animTimer / 30 : 1;
        const scale = star.collected ? 1 + (1 - star.animTimer / 30) * 1.5 : pulse;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(star.x, star.y);
        ctx.scale(scale, scale);

        // Glow
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, baseR * 2);
        glow.addColorStop(0, 'rgba(255, 220, 50, 0.6)');
        glow.addColorStop(1, 'rgba(255, 180, 0, 0)');
        ctx.beginPath();
        ctx.arc(0, 0, baseR * 2, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // 5-pointed star shape
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? baseR : baseR * 0.45;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          i === 0 ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
                  : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      });
      ctx.globalAlpha = 1;

      const p = game.player;
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h);
      if (game.falling) {
        ctx.translate(0, -43);
        ctx.rotate(p.rotation || 0);
        ctx.translate(0, 43);
      }

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

      ctx.restore(); // end player transform

      // ── TECH BUBBLES (falling state) ───────────────────────────
      if (game.falling) {
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;
        game.fallBubbles.forEach(b => {
          const wobble = Math.sin(Date.now() * 0.002 + b.phase) * 3;
          const bx = cx + b.ox + wobble;
          const by = cy + b.oy;
          const rad = b.radius;

          // Transparent inner fill
          const fill = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
          fill.addColorStop(0, 'rgba(255,255,255,0.06)');
          fill.addColorStop(0.7, b.color + '18');
          fill.addColorStop(1, b.color + '35');
          ctx.beginPath();
          ctx.arc(bx, by, rad, 0, Math.PI * 2);
          ctx.fillStyle = fill;
          ctx.fill();

          // Thin colorful rim
          ctx.beginPath();
          ctx.arc(bx, by, rad, 0, Math.PI * 2);
          ctx.strokeStyle = b.color + 'aa';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Large soft top-left highlight
          const bigShine = ctx.createRadialGradient(
            bx - rad * 0.4, by - rad * 0.45, 0,
            bx - rad * 0.4, by - rad * 0.45, rad * 0.7
          );
          bigShine.addColorStop(0, 'rgba(255,255,255,0.55)');
          bigShine.addColorStop(0.5, 'rgba(255,255,255,0.15)');
          bigShine.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.arc(bx, by, rad, 0, Math.PI * 2);
          ctx.fillStyle = bigShine;
          ctx.fill();

          // Small sharp specular dot
          const spec = ctx.createRadialGradient(
            bx - rad * 0.3, by - rad * 0.38, 0,
            bx - rad * 0.3, by - rad * 0.38, rad * 0.2
          );
          spec.addColorStop(0, 'rgba(255,255,255,0.95)');
          spec.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.arc(bx, by, rad, 0, Math.PI * 2);
          ctx.fillStyle = spec;
          ctx.fill();

          // Bottom-right secondary glow
          const secShine = ctx.createRadialGradient(
            bx + rad * 0.35, by + rad * 0.38, 0,
            bx + rad * 0.35, by + rad * 0.38, rad * 0.3
          );
          secShine.addColorStop(0, b.color + '55');
          secShine.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.arc(bx, by, rad, 0, Math.PI * 2);
          ctx.fillStyle = secShine;
          ctx.fill();

          // Text
          const fontSize = Math.max(9, rad * 0.36);
          ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
          ctx.fillStyle = b.colorDark;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(255,255,255,0.6)';
          ctx.shadowBlur = 3;
          ctx.fillText(b.text, bx, by);
          ctx.shadowBlur = 0;
        });
      }

      ctx.restore(); // end camera transform

      // ── FALLING OVERLAY HINT ───────────────────────────────────
      if (game.falling) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText('Press SPACE to return to the start', width / 2, height - 40);
        ctx.shadowBlur = 0;
      }
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
    <div class="star-counter">⭐ {starsCollected}</div>
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

  .star-counter {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 100;
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    color: var(--cardText);
    padding: 0 16px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    height: 50px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    pointer-events: none;
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
