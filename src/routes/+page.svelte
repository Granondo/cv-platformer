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

  let currentTheme = 'dark';
  let languageDropdownOpen = false;
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    { value: 'ja', label: '日本語' }
  ];

  const themes = {
    light: {
      bg: '#5888b0',
      panelBg: '#d8c89a',
      player1: '#2a5cb8',
      player2: '#1a3a80',
      playerEyes: '#0a0a1a',
      spring: '#8a8a8a',
      platformShadow: 'rgba(0,0,0,0.35)',
      platformTop: '#5aaa3a',
      text: '#2a1a0a',
      cardBorder: '#c8a860',
      cardText: '#2a1a0a',
      cardPeriod: '#6a4a1a',
      cardH3: '#8a3a10',
      parallax: ['#2a5070', '#3a6888', '#4a7898']
    },
    dark: {
      bg: '#0a0a2e',
      panelBg: '#0e0e1e',
      player1: '#2a5cb8',
      player2: '#1a3a80',
      playerEyes: '#0a0a1a',
      spring: '#3a3a6a',
      platformShadow: 'rgba(0,0,0,0.6)',
      platformTop: '#2a6a1a',
      text: '#e8d8b0',
      cardBorder: '#3a3020',
      cardText: '#e8d8b0',
      cardPeriod: '#a09070',
      cardH3: '#d4af37',
      parallax: ['#0e0e26', '#141440', '#1e1e60']
    }
  };

  function toggleTheme(event) {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    event.currentTarget.blur();
    if (gameInitialized) createParallax();
  }

  function handleLanguageChange(event) {
    locale.set(event.target.value);
  }

  function toggleLanguageDropdown() {
    languageDropdownOpen = !languageDropdownOpen;
  }

  function selectLanguage(value) {
    locale.set(value);
    languageDropdownOpen = false;
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

  function createMobs() {
    // Each mob patrols its platform. minX/maxX are patrol bounds (left edge of mob).
    // Platforms used: #7 (x=1530,y=560,w=150), #12 (x=2610,y=270,w=160),
    //                 #19 (x=4030,y=215,w=160), #23 (x=4840,y=285,w=150)
    const h = 28;
    return [
      { x: 1570, y: 560 - h, w: 24, h, speed: 1.5, vx:  1.5, minX: 1530, maxX: 1530 + 150 - 24, dead: false, deadTimer: 0 },
      { x: 2660, y: 270 - h, w: 24, h, speed: 1.5, vx: -1.5, minX: 2610, maxX: 2610 + 160 - 24, dead: false, deadTimer: 0 },
      { x: 4060, y: 215 - h, w: 24, h, speed: 1.5, vx:  1.5, minX: 4030, maxX: 4030 + 160 - 24, dead: false, deadTimer: 0 },
      { x: 4870, y: 285 - h, w: 24, h, speed: 1.5, vx: -1.5, minX: 4840, maxX: 4840 + 150 - 24, dead: false, deadTimer: 0 },
    ];
  }

  const game = {
    player: {
      x: 70, y: 390, w: 40, h: 60,
      vx: 0, vy: 0, jumping: false,
      squash: 1, onPlatform: null, facing: 1
    },
    falling: false,
    killedByMob: false,
    mobDeathProgress: 0,
    fallBubbles: [],
    fallBubbleTimer: 0,
    techQueue: [],
    platforms: [
        // ── JOB PLATFORMS (ascending) ─────────────────────────────
        { x: 0,    y: 450, w: 180, h: 20, color: '#6a7a5a' },
        { x: 250,  y: 400, w: 200, h: 20, key: 'toptal',    color: '#8a7a50' },
        { x: 500,  y: 350, w: 180, h: 20, key: 'upwork',    color: '#7a6a48' },
        { x: 750,  y: 280, w: 200, h: 20, key: 'workhuman', color: '#806050' },
        { x: 1000, y: 200, w: 220, h: 20, key: 'chulakov',  color: '#8a7040' },
        // ── VALLEY DROP ───────────────────────────────────────────
        { x: 1290, y: 680, w: 180, h: 20, color: '#5a6a7a' },
        // ── ASCENDING TO PEAK ─────────────────────────────────────
        { x: 1530, y: 560, w: 150, h: 20, color: '#6a7a6a' },
        { x: 1760, y: 500, w: 160, h: 20, color: '#7a6a7a' },
        { x: 1980, y: 440, w: 140, h: 20, color: '#6a7a5a' },
        { x: 2190, y: 380, w: 170, h: 20, color: '#5a6a8a' },
        { x: 2400, y: 325, w: 150, h: 20, color: '#6a8a7a' },
        { x: 2610, y: 270, w: 160, h: 20, color: '#7a8a6a' },
        { x: 2820, y: 215, w: 140, h: 20, color: '#5a7a8a' },
        { x: 3030, y: 165, w: 150, h: 20, color: '#6a7a8a' },
        // ── DESCENDING — zigzag ups & downs ──────────────────────
        { x: 3250, y: 200, w: 150, h: 20, color: '#7a6a5a' }, // small step down from peak
        { x: 3440, y: 300, w: 140, h: 20, color: '#5a6a7a' }, // BIG drop
        { x: 3630, y: 200, w: 150, h: 20, color: '#7a8a5a' }, // jump UP — zigzag!
        { x: 3840, y: 310, w: 140, h: 20, color: '#6a7a6a' }, // BIG drop
        { x: 4030, y: 215, w: 160, h: 20, color: '#7a7a5a' }, // jump UP — zigzag!
        { x: 4240, y: 340, w: 140, h: 20, color: '#6a5a7a' }, // BIG drop
        { x: 4430, y: 255, w: 160, h: 20, color: '#8a7a6a' }, // jump UP — zigzag!
        { x: 4640, y: 370, w: 140, h: 20, color: '#6a7a8a' }, // BIG drop
        { x: 4840, y: 285, w: 150, h: 20, color: '#7a8a7a' }, // jump UP — zigzag!
        { x: 5050, y: 390, w: 150, h: 20, color: '#8a8a6a' }, // drop, easing out
        { x: 5260, y: 425, w: 150, h: 20, color: '#6a8a8a' }, // approach
        { x: 5470, y: 445, w: 180, h: 20, color: '#7a6a8a' }, // ← END
      ],
    stars: [
        // ── JOB SECTION (unchanged) ───────────────────────────────
        // Between start and Toptal
        { x: 180,  y: 370 }, { x: 220,  y: 340 },
        // On/around Toptal (y=400)
        { x: 280,  y: 370 }, { x: 380,  y: 360 }, { x: 430,  y: 330 },
        // Between Toptal and Upwork
        { x: 470,  y: 310 },
        // On/around Upwork (y=350)
        { x: 530,  y: 320 }, { x: 610,  y: 300 }, { x: 660,  y: 280 },
        // On/around WorkHuman (y=280)
        { x: 790,  y: 250 }, { x: 870,  y: 230 },
        // Between WorkHuman and Chulakov
        { x: 940,  y: 200 }, { x: 970,  y: 170 },
        // On/around Chulakov (y=200)
        { x: 1030, y: 170 }, { x: 1120, y: 155 }, { x: 1190, y: 180 },
        // ── VALLEY DROP ───────────────────────────────────────────
        { x: 1220, y: 380 }, { x: 1265, y: 545 },
        // On platform 6 (y=680)
        { x: 1320, y: 648 }, { x: 1395, y: 645 }, { x: 1462, y: 648 },
        // ── ASCENDING ─────────────────────────────────────────────
        // Platform 7 (y=560)
        { x: 1558, y: 528 }, { x: 1638, y: 523 },
        // Platform 8 (y=500)
        { x: 1785, y: 468 }, { x: 1862, y: 463 },
        // Platform 9 (y=440)
        { x: 2005, y: 408 }, { x: 2082, y: 403 },
        // Platform 10 (y=380)
        { x: 2215, y: 348 }, { x: 2298, y: 343 },
        // Platform 11 (y=325)
        { x: 2425, y: 293 }, { x: 2508, y: 288 },
        // Platform 12 (y=270)
        { x: 2635, y: 238 }, { x: 2718, y: 233 },
        // Platform 13 (y=215)
        { x: 2845, y: 183 }, { x: 2922, y: 178 },
        // Platform 14 (y=165)
        { x: 3055, y: 133 }, { x: 3132, y: 128 },
        // ── ZIGZAG DESCENT ────────────────────────────────────────
        // Platform 15 — step down (y=200)
        { x: 3275, y: 168 }, { x: 3355, y: 163 },
        // Platform 16 — big drop (y=300)
        { x: 3465, y: 268 }, { x: 3540, y: 263 },
        // Platform 17 — jump UP (y=200), 3 coins reward
        { x: 3655, y: 168 }, { x: 3712, y: 165 }, { x: 3740, y: 168 },
        // Platform 18 — big drop (y=310)
        { x: 3865, y: 278 }, { x: 3938, y: 273 },
        // Platform 19 — jump UP (y=215)
        { x: 4055, y: 183 }, { x: 4142, y: 178 },
        // Platform 20 — big drop (y=340)
        { x: 4265, y: 308 }, { x: 4348, y: 303 },
        // Platform 21 — jump UP (y=255), 3 coins reward
        { x: 4455, y: 223 }, { x: 4512, y: 220 }, { x: 4548, y: 223 },
        // Platform 22 — big drop (y=370)
        { x: 4665, y: 338 }, { x: 4748, y: 333 },
        // Platform 23 — jump UP (y=285)
        { x: 4865, y: 253 }, { x: 4948, y: 248 },
        // Platform 24 — easing out (y=390)
        { x: 5075, y: 358 }, { x: 5158, y: 353 },
        // Platform 25 — approach (y=425)
        { x: 5285, y: 393 }, { x: 5368, y: 388 },
        // Platform 26 — END (y=445), 3 coins
        { x: 5498, y: 413 }, { x: 5568, y: 410 }, { x: 5628, y: 413 },
    ].map(s => ({ ...s, collected: false, animTimer: 0 })),
    starsCollected: 0,
    mobs: createMobs(),
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
        game.player.facing = 1;
        game.camera.x = 0;
        game.stars.forEach(s => { s.collected = false; s.animTimer = 0; });
        game.starsCollected = 0;
        starsCollected = 0;
        game.mobs = createMobs();
        game.killedByMob = false;
        game.mobDeathProgress = 0;
        game.platforms.forEach(pl => { if (pl.key) pl.visited = false; });
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

    // When killed by mob: freeze player, advance collapse animation, skip all else
    if (game.killedByMob) {
      game.mobDeathProgress = Math.min(1, game.mobDeathProgress + 0.04);
      game.particles = game.particles.filter(pt => {
        pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.3; pt.life -= 0.02;
        return pt.life > 0;
      });
      return;
    }

    if (game.keys['ArrowLeft'] || game.keys['a']) { p.vx = -game.moveSpeed; p.facing = -1; }
    else if (game.keys['ArrowRight'] || game.keys['d']) { p.vx = game.moveSpeed; p.facing = 1; }
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
            platform.visited = true;
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
    // Mob patrol & collision
    game.mobs.forEach(mob => {
      if (mob.dead) {
        mob.deadTimer = Math.max(0, mob.deadTimer - 1);
        return;
      }

      // Patrol movement
      mob.x += mob.vx;
      if (mob.x <= mob.minX) { mob.x = mob.minX; mob.vx =  mob.speed; }
      if (mob.x >= mob.maxX) { mob.x = mob.maxX; mob.vx = -mob.speed; }

      // Player collision (skip if player is already dead/falling)
      if (game.falling) return;
      const mx = mob.x, my = mob.y, mw = mob.w, mh = mob.h;
      if (p.x + p.w > mx && p.x < mx + mw && p.y + p.h > my && p.y < my + mh) {
        if (p.vy > 0 && p.y + p.h < my + mh * 0.55) {
          // Stomp! Kill mob, bounce player
          mob.dead = true;
          mob.deadTimer = 22;
          p.vy = -8;
          createParticles(mx + mw / 2, my + mh / 2, '#8822cc');
          createParticles(mx + mw / 2, my + mh / 2, '#aa44ee');
        } else {
          // Mob kills player
          game.falling = true;
          game.killedByMob = true;
          hidePlatformInfo();
        }
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

      game.fallBubbles.forEach(b => {
        b.angle += b.orbitSpeed;
        b.ox = Math.cos(b.angle) * b.orbitDist;
        b.oy = Math.sin(b.angle) * b.orbitDist;
      });
    }
  }

  function draw(ctx) {
    const T = themes[currentTheme];
    ctx.imageSmoothingEnabled = false;

    // ── BACKGROUND ────────────────────────────────────────────
    ctx.fillStyle = T.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(-game.camera.x, -game.camera.y);

    // ── PARALLAX LAYERS ────────────────────────────────────────
    game.parallaxLayers.forEach((layer, layerIdx) => {
      const parallaxX = -game.camera.x * layer.speed;
      layer.items.forEach(item => {
        const ci = layer.colorIdx ?? Math.min(layerIdx, T.parallax.length - 1);
        ctx.fillStyle = item.color || T.parallax[Math.min(ci, T.parallax.length - 1)];
        ctx.fillRect(Math.round(item.x + parallaxX), Math.round(item.y), item.w, item.h);
      });
    });

    // ── PLATFORMS (pixel art stone bricks) ────────────────────
    game.platforms.forEach(platform => {
      const isKey = !!platform.key;
      const isVisited = isKey && !!platform.visited;
      const px = platform.x, py = platform.y, pw = platform.w, ph = platform.h;

      // Hard pixel shadow (no blur)
      ctx.fillStyle = isVisited ? '#3a2800' : '#222222';
      ctx.fillRect(px + 4, py + 4, pw, ph);

      // Stone body
      ctx.fillStyle = isVisited ? '#c8a820' : '#606070';
      ctx.fillRect(px, py, pw, ph);

      // Stone highlight (lighter left & top)
      ctx.fillStyle = isVisited ? '#e0c040' : '#787888';
      ctx.fillRect(px, py, pw, 2);
      ctx.fillRect(px, py, 2, ph);

      // Stone shadow (darker right & bottom)
      ctx.fillStyle = isVisited ? '#806010' : '#404050';
      ctx.fillRect(px + pw - 2, py, 2, ph);
      ctx.fillRect(px, py + ph - 2, pw, 2);

      // Brick mortar lines
      const mortarColor = isVisited ? '#9a7820' : '#484858';
      ctx.fillStyle = mortarColor;
      // Horizontal mortar (one line dividing the platform)
      ctx.fillRect(px + 2, py + Math.floor(ph / 2), pw - 4, 1);
      // Vertical mortar lines (staggered rows)
      const brickW = 18;
      for (let row = 0; row < 2; row++) {
        const rowY = py + (row === 0 ? 2 : Math.floor(ph / 2) + 1);
        const rowH = row === 0 ? Math.floor(ph / 2) - 2 : ph - Math.floor(ph / 2) - 3;
        const offset = row % 2 === 0 ? brickW / 2 : 0;
        for (let bx = px + offset; bx < px + pw - 2; bx += brickW) {
          ctx.fillRect(Math.round(bx), rowY, 1, rowH);
        }
      }

      // Grass top (3 layers)
      const grassTop = currentTheme === 'dark' ? '#1a5a10' : '#3a8a1a';
      const grassMid = currentTheme === 'dark' ? '#2a7a1a' : '#5aaa2a';
      const grassTip = currentTheme === 'dark' ? '#38a020' : '#70cc30';
      ctx.fillStyle = grassMid;
      ctx.fillRect(px, py - 4, pw, 4);
      ctx.fillStyle = grassTop;
      ctx.fillRect(px, py - 6, pw, 2);
      // Pixel grass tufts
      ctx.fillStyle = grassTip;
      for (let gx = px + 4; gx < px + pw - 4; gx += 10) {
        ctx.fillRect(gx,     py - 8, 2, 2);
        ctx.fillRect(gx + 4, py - 9, 2, 3);
        ctx.fillRect(gx + 7, py - 7, 2, 1);
      }

      // Gold trim for visited key platforms
      if (isVisited) {
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(px, py - 4, pw, 2);
        ctx.fillRect(px, py - 4, 2, ph + 4);
        ctx.fillRect(px + pw - 2, py - 4, 2, ph + 4);
        ctx.fillRect(px, py + ph - 2, pw, 2);
        // Corner ornaments
        ctx.fillStyle = '#f0c840';
        ctx.fillRect(px, py - 4, 4, 4);
        ctx.fillRect(px + pw - 4, py - 4, 4, 4);
      }

      // Company label (grey until visited, gold after)
      if (isKey) {
        const lang = translations[$locale] || translations.en;
        const company = lang.platforms[platform.key]?.company;
        if (company) {
          ctx.fillStyle = isVisited ? '#d4af37' : '#707080';
          ctx.font = '9px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(company, px + pw / 2, py + ph + 18);
        }
      }
    });

    // ── PARTICLES ──────────────────────────────────────────────
    game.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life;
      ctx.fillRect(Math.round(pt.x - 3), Math.round(pt.y - 3), 6, 6);
    });
    ctx.globalAlpha = 1;

    // ── MOBS ──────────────────────────────────────────────────
    const mobTime = Date.now() * 0.005;
    game.mobs.forEach(mob => {
      if (mob.dead && mob.deadTimer <= 0) return;

      ctx.save();
      ctx.translate(Math.round(mob.x + mob.w / 2), Math.round(mob.y + mob.h));

      // Death squash: flatten vertically, widen horizontally
      if (mob.dead) {
        const t = mob.deadTimer / 22;
        ctx.scale(1 + (1 - t) * 0.8, t);
      }

      // Flip direction
      if (mob.vx > 0) ctx.scale(-1, 1);

      // Pixel art goblin enemy
      const wobble = Math.sin(mobTime + mob.x * 0.05) * 1;
      const M1 = '#7a1acc'; // body purple
      const M2 = '#a040ee'; // body highlight
      const M3 = '#4a0080'; // body shadow
      const MF = '#40bb40'; // face green
      const MF2= '#60dd60'; // face highlight

      // Shadow on ground
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-14, -1, 28, 3);

      // Legs (two stubby legs at bottom)
      ctx.fillStyle = M3;
      ctx.fillRect(-10, -8 + wobble, 7, 8);
      ctx.fillRect(3,   -8 + wobble, 7, 8);
      ctx.fillStyle = M1;
      ctx.fillRect(-10, -8 + wobble, 7, 6);
      ctx.fillRect(3,   -8 + wobble, 7, 6);

      // Main body blob
      ctx.fillStyle = M3;
      ctx.fillRect(-12, -28 + wobble, 24, 22);      // shadow layer
      ctx.fillStyle = M1;
      ctx.fillRect(-12, -28 + wobble, 22, 21);      // main
      ctx.fillStyle = M2;
      ctx.fillRect(-12, -28 + wobble, 22, 5);       // top highlight
      ctx.fillRect(-12, -28 + wobble, 4, 21);       // left highlight

      // Face (lighter green patch)
      ctx.fillStyle = MF;
      ctx.fillRect(-8, -26 + wobble, 16, 15);
      ctx.fillStyle = MF2;
      ctx.fillRect(-8, -26 + wobble, 16, 3);
      ctx.fillRect(-8, -26 + wobble, 3, 15);

      // Eyes (red, angry)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-7, -24 + wobble, 5, 4);
      ctx.fillRect(2,  -24 + wobble, 5, 4);
      ctx.fillStyle = '#ff2020';
      ctx.fillRect(-6, -23 + wobble, 3, 3);
      ctx.fillRect(3,  -23 + wobble, 3, 3);
      // Angry eyebrow slant (pixel art)
      ctx.fillStyle = M3;
      ctx.fillRect(-7, -25 + wobble, 5, 1);
      ctx.fillRect(2,  -26 + wobble, 5, 1);

      // Mouth (jagged teeth)
      ctx.fillStyle = '#220044';
      ctx.fillRect(-5, -14 + wobble, 10, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -14 + wobble, 2, 3);
      ctx.fillRect(-1, -14 + wobble, 2, 3);
      ctx.fillRect(2,  -14 + wobble, 2, 3);

      // Gold eyes glow (pupils)
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(-5, -22 + wobble, 1, 1);
      ctx.fillRect(5,  -23 + wobble, 1, 1);

      ctx.restore();
    });

    // ── COINS (collectibles) ───────────────────────────────────
    const now = Date.now() * 0.003;
    game.stars.forEach(star => {
      if (star.collected && star.animTimer <= 0) return;

      const bobY = Math.sin(now + star.x * 0.08) * 3;
      const alpha = star.collected ? star.animTimer / 30 : 1;
      const scale = star.collected ? 1 + (1 - star.animTimer / 30) * 1.5 : 1;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(Math.round(star.x), Math.round(star.y + bobY));
      ctx.scale(scale, scale);

      // Coin body
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-6, -8, 12, 16);
      // Highlight (top-left)
      ctx.fillStyle = '#f0c840';
      ctx.fillRect(-6, -8, 4, 16);
      ctx.fillRect(-6, -8, 12, 4);
      // Shadow (bottom-right)
      ctx.fillStyle = '#8a6a10';
      ctx.fillRect(2, -8, 4, 16);
      ctx.fillRect(-6, 4, 12, 4);
      // Coin rim pixel border
      ctx.fillStyle = '#b89020';
      ctx.fillRect(-6, -8, 2, 2);
      ctx.fillRect(4, -8, 2, 2);
      ctx.fillRect(-6, 6, 2, 2);
      ctx.fillRect(4, 6, 2, 2);
      // Inner star symbol
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -5, 2, 10);  // vertical bar
      ctx.fillRect(-5, -1, 10, 2);  // horizontal bar
      ctx.fillRect(-3, -4, 2, 2);   // top-left pip
      ctx.fillRect(1,  -4, 2, 2);   // top-right pip
      ctx.fillRect(-3,  2, 2, 2);   // bottom-left pip
      ctx.fillRect(1,   2, 2, 2);   // bottom-right pip

      ctx.restore();
    });
    ctx.globalAlpha = 1;

    // ── PIXEL ART KNIGHT ──────────────────────────────────────
    const p = game.player;
    ctx.save();
    ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h));

    if (game.falling && !game.killedByMob) {
      ctx.translate(0, -30);
      ctx.rotate(p.rotation || 0);
      ctx.translate(0, 30);
    } else if (game.killedByMob) {
      // Collapse sideways: rotate around feet (origin is already at feet)
      const collapseAngle = (Math.PI / 2) * game.mobDeathProgress * (p.facing || 1);
      ctx.rotate(collapseAngle);
    }

    // Flip for facing direction
    if ((p.facing || 1) < 0) ctx.scale(-1, 1);

    const time = Date.now() * 0.003;
    const isMoving = Math.abs(p.vx) > 0.3;
    const legStep = isMoving ? Math.sin(time * 10) : 0;

    // Knight color palette
    const A1 = '#2a5cb8'; // armor blue (mid)
    const A2 = '#4a7cd8'; // armor highlight
    const A3 = '#1a3a6a'; // armor shadow
    const G1 = '#d4af37'; // gold (mid)
    const G2 = '#f0c840'; // gold highlight
    const G3 = '#8a6a10'; // gold shadow
    const R1 = '#8b0000'; // cape/plume dark red
    const R2 = '#cc2020'; // cape highlight
    const BT = '#1a1a2a'; // boot dark
    const BL = '#3a3a4a'; // boot lighter

    // ── CAPE (behind body) ─────────────────────────────────────
    const capeFlow = -p.vx * 4;
    const capeWave = Math.sin(time * 7) * (isMoving ? 2.5 : 0.8);
    ctx.beginPath();
    ctx.moveTo(-4, -44);
    ctx.bezierCurveTo(
      -6 + capeFlow * 0.3, -44 + capeWave * 0.5,
      -10 + capeFlow * 0.65, -24 + capeWave,
      -14 + capeFlow, -4 + capeWave * 0.3
    );
    ctx.lineTo(-6 + capeFlow * 0.5, -2);
    ctx.lineTo(-4, -44);
    ctx.closePath();
    ctx.fillStyle = R1;
    ctx.fill();
    // Cape highlight strip
    ctx.fillStyle = R2;
    ctx.fillRect(-5, -44, 2, 40);

    // ── LEFT LEG ──────────────────────────────────────────────
    ctx.save();
    ctx.translate(-7, -22);
    ctx.rotate(legStep * 0.15);
    ctx.fillStyle = A3;
    ctx.fillRect(-4, 0, 8, 14);  // shadow layer
    ctx.fillStyle = A1;
    ctx.fillRect(-4, 0, 8, 12);  // main
    ctx.fillStyle = A2;
    ctx.fillRect(-4, 0, 8, 3);   // top highlight
    ctx.fillStyle = G1;
    ctx.fillRect(-5, 8, 10, 3);  // knee gold ring
    ctx.fillStyle = G2;
    ctx.fillRect(-5, 8, 10, 1);
    ctx.restore();

    // ── RIGHT LEG ─────────────────────────────────────────────
    ctx.save();
    ctx.translate(7, -22);
    ctx.rotate(-legStep * 0.15);
    ctx.fillStyle = A3;
    ctx.fillRect(-4, 0, 8, 14);
    ctx.fillStyle = A1;
    ctx.fillRect(-4, 0, 8, 12);
    ctx.fillStyle = A2;
    ctx.fillRect(-4, 0, 8, 3);
    ctx.fillStyle = G1;
    ctx.fillRect(-5, 8, 10, 3);
    ctx.fillStyle = G2;
    ctx.fillRect(-5, 8, 10, 1);
    ctx.restore();

    // ── LEFT BOOT ─────────────────────────────────────────────
    ctx.save();
    ctx.translate(-7, -10);
    ctx.rotate(legStep * 0.1);
    ctx.fillStyle = BT;
    ctx.fillRect(-6, 0, 12, 10);   // main boot
    ctx.fillStyle = BL;
    ctx.fillRect(-6, 0, 12, 2);    // boot highlight
    ctx.fillStyle = G1;
    ctx.fillRect(-6, 6, 14, 2);    // gold spur band
    ctx.fillStyle = G3;
    ctx.fillRect(4, 0, 2, 10);     // boot shadow
    ctx.restore();

    // ── RIGHT BOOT ────────────────────────────────────────────
    ctx.save();
    ctx.translate(7, -10);
    ctx.rotate(-legStep * 0.1);
    ctx.fillStyle = BT;
    ctx.fillRect(-6, 0, 12, 10);
    ctx.fillStyle = BL;
    ctx.fillRect(-6, 0, 12, 2);
    ctx.fillStyle = G1;
    ctx.fillRect(-6, 6, 14, 2);
    ctx.fillStyle = G3;
    ctx.fillRect(4, 0, 2, 10);
    ctx.restore();

    // ── BELT ──────────────────────────────────────────────────
    ctx.fillStyle = '#3a1a08';
    ctx.fillRect(-16, -28, 32, 6);
    ctx.fillStyle = G1;
    ctx.fillRect(-5, -28, 10, 6);  // buckle plate
    ctx.fillStyle = G2;
    ctx.fillRect(-4, -27, 4, 2);   // buckle highlight
    ctx.fillStyle = G3;
    ctx.fillRect(-5, -24, 10, 2);  // buckle shadow

    // ── BODY / CHEST PLATE ────────────────────────────────────
    // Base shadow layer
    ctx.fillStyle = A3;
    ctx.fillRect(-14, -46, 28, 18);
    // Main armor
    ctx.fillStyle = A1;
    ctx.fillRect(-14, -46, 26, 17);
    // Top highlight strip
    ctx.fillStyle = A2;
    ctx.fillRect(-14, -46, 26, 4);
    // Right edge highlight
    ctx.fillStyle = A2;
    ctx.fillRect(8, -46, 4, 18);
    // Gold cross emblem
    ctx.fillStyle = G1;
    ctx.fillRect(-2, -44, 4, 14);    // vertical
    ctx.fillRect(-8, -38, 16, 4);    // horizontal
    ctx.fillStyle = G2;
    ctx.fillRect(-1, -43, 2, 2);     // top gem
    ctx.fillRect(-7, -37, 2, 2);     // left pip
    ctx.fillRect(5, -37, 2, 2);      // right pip
    ctx.fillStyle = G3;
    ctx.fillRect(-2, -32, 4, 2);     // cross base shadow

    // ── SHOULDER PADS ─────────────────────────────────────────
    // Left
    ctx.fillStyle = A3;
    ctx.fillRect(-22, -48, 10, 14);
    ctx.fillStyle = A1;
    ctx.fillRect(-22, -48, 10, 12);
    ctx.fillStyle = A2;
    ctx.fillRect(-22, -48, 10, 3);
    ctx.fillStyle = G1;
    ctx.fillRect(-22, -40, 10, 2);  // trim
    // Right
    ctx.fillStyle = A3;
    ctx.fillRect(12, -48, 10, 14);
    ctx.fillStyle = A1;
    ctx.fillRect(12, -48, 10, 12);
    ctx.fillStyle = A2;
    ctx.fillRect(12, -48, 10, 3);
    ctx.fillStyle = G1;
    ctx.fillRect(12, -40, 10, 2);

    // ── LEFT ARM ──────────────────────────────────────────────
    ctx.save();
    ctx.translate(-18, -43);
    ctx.rotate(-legStep * 0.12);  // arm swings opposite leg
    ctx.fillStyle = A3;
    ctx.fillRect(-3, 0, 7, 15);
    ctx.fillStyle = A1;
    ctx.fillRect(-3, 0, 7, 14);
    ctx.fillStyle = A2;
    ctx.fillRect(-3, 0, 7, 3);
    ctx.fillStyle = A3;
    ctx.fillRect(-3, 0, 2, 14);
    // Gauntlet
    ctx.fillStyle = A3;
    ctx.fillRect(-4, 13, 8, 8);
    ctx.fillStyle = G1;
    ctx.fillRect(-4, 13, 8, 2);
    ctx.fillRect(-4, 18, 8, 2);
    ctx.restore();

    // ── RIGHT ARM (holds shovel) ───────────────────────────────
    ctx.save();
    ctx.translate(14, -43);
    ctx.rotate(legStep * 0.12);
    ctx.fillStyle = A3;
    ctx.fillRect(-3, 0, 7, 15);
    ctx.fillStyle = A1;
    ctx.fillRect(-3, 0, 7, 14);
    ctx.fillStyle = A2;
    ctx.fillRect(-3, 0, 7, 3);
    ctx.fillStyle = A2;
    ctx.fillRect(2, 0, 2, 14);
    // Gauntlet
    ctx.fillStyle = A3;
    ctx.fillRect(-3, 13, 8, 8);
    ctx.fillStyle = G1;
    ctx.fillRect(-3, 13, 8, 2);
    ctx.fillRect(-3, 18, 8, 2);
    // Shovel handle (wood)
    ctx.fillStyle = '#7a4a18';
    ctx.fillRect(2, 19, 3, 22);
    ctx.fillStyle = '#9a6a28';
    ctx.fillRect(2, 19, 1, 22);
    // Shovel head (metal)
    ctx.fillStyle = '#9a9aaa';
    ctx.fillRect(-2, 39, 10, 6);
    ctx.fillStyle = '#ccccdd';
    ctx.fillRect(-2, 39, 10, 2);
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(-2, 43, 10, 2);
    ctx.restore();

    // ── NECK / GORGET ─────────────────────────────────────────
    ctx.fillStyle = A1;
    ctx.fillRect(-6, -54, 12, 10);
    ctx.fillStyle = A2;
    ctx.fillRect(-6, -54, 12, 3);
    ctx.fillStyle = G1;
    ctx.fillRect(-8, -47, 16, 2);   // gorget bottom trim
    ctx.fillRect(-6, -54, 12, 1);   // gorget top trim

    // ── HELMET ────────────────────────────────────────────────
    // Cheek guards
    ctx.fillStyle = A1;
    ctx.fillRect(-14, -68, 4, 16);
    ctx.fillStyle = A2;
    ctx.fillRect(-14, -68, 4, 3);
    ctx.fillStyle = A3;
    ctx.fillRect(-14, -54, 4, 2);
    ctx.fillStyle = A1;
    ctx.fillRect(10, -68, 4, 16);
    ctx.fillStyle = A2;
    ctx.fillRect(10, -68, 4, 3);
    ctx.fillStyle = A3;
    ctx.fillRect(10, -54, 4, 2);

    // Helmet main
    ctx.fillStyle = A3;
    ctx.fillRect(-12, -72, 24, 20);   // shadow layer
    ctx.fillStyle = A1;
    ctx.fillRect(-12, -72, 22, 19);   // main
    ctx.fillStyle = A2;
    ctx.fillRect(-12, -72, 22, 5);    // top highlight
    ctx.fillStyle = A2;
    ctx.fillRect(6, -72, 4, 20);      // right highlight

    // Helmet gold rim (top and bottom)
    ctx.fillStyle = G1;
    ctx.fillRect(-12, -72, 24, 2);    // top rim
    ctx.fillRect(-12, -54, 24, 2);    // bottom rim
    ctx.fillStyle = G2;
    ctx.fillRect(-12, -72, 4, 2);     // top-left pip
    ctx.fillRect(8, -72, 4, 2);       // top-right pip

    // Visor (eye slit) - dark opening
    ctx.fillStyle = '#080810';
    ctx.fillRect(-10, -65, 20, 7);
    // Eye glow - blue aura
    ctx.fillStyle = '#2244aa';
    ctx.fillRect(-9, -64, 18, 5);
    ctx.fillStyle = '#4466dd';
    ctx.fillRect(-8, -63, 7, 3);
    ctx.fillStyle = '#88aaff';
    ctx.fillRect(-7, -63, 3, 2);
    ctx.fillStyle = '#4466dd';
    ctx.fillRect(2, -63, 7, 3);
    ctx.fillStyle = '#88aaff';
    ctx.fillRect(4, -63, 3, 2);

    // ── PLUME ─────────────────────────────────────────────────
    const plumeY = Math.sin(time * 5) * (isMoving ? 1.5 : 0.4);
    ctx.fillStyle = R1;
    ctx.fillRect(-4, -76 + plumeY, 8, 6);       // base
    ctx.fillStyle = R2;
    ctx.fillRect(-3, -82 + plumeY * 1.2, 6, 8); // mid feather
    ctx.fillRect(-4, -76 + plumeY, 2, 6);
    ctx.fillStyle = R1;
    ctx.fillRect(-2, -86 + plumeY * 1.4, 4, 6); // upper feather
    ctx.fillStyle = '#ff4040';
    ctx.fillRect(-2, -90 + plumeY * 1.6, 4, 6); // tip bright
    ctx.fillStyle = '#ff8080';
    ctx.fillRect(-1, -93 + plumeY * 1.8, 2, 5); // very tip

    ctx.restore(); // end player transform

    // ── TECH BOXES (falling state, not mob death) ─────────────
    if (game.falling && !game.killedByMob) {
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;
      game.fallBubbles.forEach(b => {
        const wobble = Math.sin(Date.now() * 0.002 + b.phase) * 2;
        const bx = Math.round(cx + b.ox + wobble);
        const by = Math.round(cy + b.oy);
        const rad = Math.round(b.radius);

        // Box body
        ctx.fillStyle = b.color + 'cc';
        ctx.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
        // Top-left highlight
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillRect(bx - rad, by - rad, rad * 2, 4);
        ctx.fillRect(bx - rad, by - rad, 4, rad * 2);
        // Bottom-right shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(bx + rad - 4, by - rad, 4, rad * 2);
        ctx.fillRect(bx - rad, by + rad - 4, rad * 2, 4);
        // Pixel border
        ctx.strokeStyle = b.colorDark || '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx - rad + 1, by - rad + 1, rad * 2 - 2, rad * 2 - 2);

        // Text
        const fontSize = Math.max(6, Math.floor(rad * 0.28));
        ctx.font = `${fontSize}px "Press Start 2P", monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 3;
        ctx.fillText(b.text, bx, by);
        ctx.shadowBlur = 0;
      });
    }

    ctx.restore(); // end camera transform

    // ── FALLING OVERLAY HINT ──────────────────────────────────
    if (game.falling) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 8;

      if (game.killedByMob) {
        // Dark semi-transparent overlay
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, width, height);

        // Flicker effect: blink every ~20 frames using time
        const blink = Math.floor(Date.now() / 350) % 2 === 0;

        // Main death message
        ctx.font = '22px "Press Start 2P", monospace';
        ctx.fillStyle = blink ? '#ff2020' : '#ff6060';
        ctx.fillText('YOU DIED', width / 2, height / 2 - 24);

        // Sub-message
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#e8d8b0';
        ctx.fillText('...killed by a goblin. sorry.', width / 2, height / 2 + 14);
      }

      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#f0c840';
      ctx.fillText('PRESS SPACE TO RESTART', width / 2, height - 40);
      ctx.shadowBlur = 0;
    }
  }

  let gameInitialized = false;

  function createParallax() {
    game.parallaxLayers = [];

    // Stars layer (dark theme only)
    if (currentTheme === 'dark') {
      const starItems = [];
      const totalW = game.levelEnd * 2;
      for (let i = 0; i < 180; i++) {
        const sz = i % 6 === 0 ? 4 : i % 3 === 0 ? 3 : 2;
        starItems.push({
          x: Math.random() * totalW,
          y: Math.random() * (height * 0.75),
          w: sz, h: sz,
          color: i % 8 === 0 ? '#ffffc0' : i % 5 === 0 ? '#c0c0ff' : '#ffffff'
        });
      }
      game.parallaxLayers.push({ speed: 0.05, items: starItems });
    }

    // Mountain layers (far → near)
    const layerDefs = [
      { speed: 0.12, count: 14, maxH: 220, minH: 90, maxW: 210, minW: 140 },
      { speed: 0.28, count: 20, maxH: 140, minH: 50, maxW: 160, minW: 90 },
      { speed: 0.55, count: 30, maxH: 80,  minH: 25, maxW: 100, minW: 55 },
    ];

    layerDefs.forEach((def, mountainIdx) => {
      const items = [];
      const totalW = game.levelEnd * 2;
      const spacing = totalW / def.count;
      for (let j = 0; j < def.count + 2; j++) {
        const baseX = j * spacing + (Math.random() - 0.5) * spacing * 0.5;
        const mH = def.minH + Math.random() * (def.maxH - def.minH);
        const mW = def.minW + Math.random() * (def.maxW - def.minW);
        // Build stepped mountain from columns (pixel art)
        const cols = Math.floor(mW / 6);
        for (let c = 0; c < cols; c++) {
          const t = c / Math.max(cols - 1, 1);
          const profile = 1 - Math.abs(t * 2 - 1); // triangle
          const colH = Math.max(4, Math.round(mH * profile / 4) * 4);
          items.push({ x: baseX + c * 6, y: height - colH, w: 6, h: colH });
        }
      }
      game.parallaxLayers.push({ speed: def.speed, items, colorIdx: mountainIdx });
    });
  }

  $: if (!$isLoading && canvas && descriptionPanel && !gameInitialized) {
    gameInitialized = true;
    const ctx = canvas.getContext('2d');

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
    window.addEventListener('click', (e) => {
      if (languageDropdownOpen && !e.target.closest('.language-selector-wrapper')) {
        languageDropdownOpen = false;
      }
    });

    resize();
    gameLoop();
  }
</script>

<svelte:head>
  <title>Vladimir Rybas - Interactive CV</title>
</svelte:head>

{#if !$isLoading}
<div class="container" style="--bg:{themes[currentTheme].bg}; --panelBg:{themes[currentTheme].panelBg}; --cardBorder:{themes[currentTheme].cardBorder}; --cardText:{themes[currentTheme].cardText}; --cardPeriod:{themes[currentTheme].cardPeriod}; --cardH3:{themes[currentTheme].cardH3};">
  <div class="game-wrapper">
    <canvas bind:this={canvas}></canvas>
    <div class="star-counter"><span class="star-icon">★</span> {starsCollected} / {game.stars.length}</div>
    <div class="language-selector-wrapper">
      <!-- Hidden native select for accessibility -->
      <select class="language-selector-native" value={$locale} on:change={handleLanguageChange} tabindex="-1">
        {#each languageOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>

      <!-- Custom styled dropdown -->
      <button class="language-selector" on:click={toggleLanguageDropdown} type="button">
        {languageOptions.find(opt => opt.value === $locale)?.label || 'English'}
      </button>

      {#if languageDropdownOpen}
        <div class="language-dropdown">
          {#each languageOptions as option}
            <button
              class="language-option"
              class:selected={option.value === $locale}
              on:click={() => selectLanguage(option.value)}
              type="button"
            >
              {option.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>
    <button class="theme-switcher" on:click={toggleTheme}>
      {currentTheme === 'light' ? '🌙' : '☀️'}
    </button>
  </div>
  <div class="description-panel" bind:this={descriptionPanel}>
    <div class="instructions">
      <p>{$_('instructions.controls')}</p>
      <p>{$_('instructions.goal')}</p>
      <p class="desktop-hint">{$_('instructions.desktop')}</p>
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
    font-family: 'Press Start 2P', monospace;
    image-rendering: pixelated;
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
    image-rendering: pixelated;
  }

  .description-panel {
    width: 30%;
    max-width: 400px;
    background: var(--panelBg);
    border-left: 4px solid var(--cardBorder);
    color: var(--cardText);
    overflow-y: auto;
    transition: background 0.3s;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 0 rgba(0,0,0,0.5);
  }

  .instructions {
    padding: 16px 24px;
    border-bottom: 4px solid var(--cardBorder);
    background: rgba(0, 0, 0, 0.15);
    font-size: 8px;
    line-height: 1.9;
  }

  .instructions p {
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    line-height: 1.9;
    margin: 0.7em 0;
  }

  .desktop-hint {
    margin-top: 12px !important;
    padding-top: 10px;
    border-top: 2px solid var(--cardBorder);
    opacity: 0.55;
  }

  .content {
    padding: 24px;
  }

  .description-panel h3 {
    color: var(--cardH3);
    margin: 0 0 10px 0;
    font-family: 'Press Start 2P', monospace;
    font-size: 11px;
    line-height: 1.7;
    text-shadow: 2px 2px 0 rgba(0,0,0,0.4);
  }

  .description-panel .period {
    color: var(--cardPeriod);
    margin-bottom: 20px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    line-height: 1.6;
  }

  .description-panel p {
    font-family: system-ui, sans-serif;
    font-size: 12px;
    line-height: 1.7;
    margin: 0.8em 0;
  }

  .theme-switcher {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 100;
    background: rgba(0,0,0,0.6);
    border: 2px solid rgba(255,255,255,0.4);
    color: var(--cardText);
    padding: 8px;
    border-radius: 0;
    cursor: pointer;
    font-size: 18px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.6);
  }

  .theme-switcher:hover {
    background: rgba(0,0,0,0.8);
    box-shadow: 2px 2px 0 rgba(0,0,0,0.6);
    transform: translate(2px, 2px);
  }

  .theme-switcher:active {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  .star-counter {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 100;
    background: rgba(0,0,0,0.6);
    border: 2px solid #d4af37;
    color: #d4af37;
    padding: 0 14px;
    border-radius: 0;
    font-family: 'Press Start 2P', monospace;
    font-size: 11px;
    height: 44px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.6);
    pointer-events: none;
    letter-spacing: 1px;
  }

  .star-icon {
    font-family: sans-serif;
    font-size: 20px;
    line-height: 1;
    position: relative;
    top: -1px;
  }

  .language-selector-wrapper {
    position: absolute;
    top: 16px;
    right: 72px;
    z-index: 100;
  }

  .language-selector-native {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .language-selector {
    background: rgba(0,0,0,0.6);
    border: 2px solid rgba(255,255,255,0.4);
    color: var(--cardText);
    padding: 0 32px 0 12px;
    border-radius: 0;
    cursor: pointer;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    height: 44px;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.6);
    outline: none;
    position: relative;
    display: flex;
    align-items: center;
    min-width: 100px;
  }

  .language-selector::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid var(--cardText);
    pointer-events: none;
  }

  .language-selector:hover {
    background: rgba(0,0,0,0.8);
    box-shadow: 2px 2px 0 rgba(0,0,0,0.6);
    transform: translate(2px, 2px);
  }

  .language-dropdown {
    position: absolute;
    top: 52px;
    right: 0;
    background: var(--panelBg);
    border: 2px solid var(--cardBorder);
    box-shadow: 4px 4px 0 rgba(0,0,0,0.6);
    min-width: 140px;
    z-index: 101;
  }

  .language-option {
    display: block;
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--cardBorder);
    color: var(--cardText);
    padding: 12px 14px;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    text-align: left;
    cursor: pointer;
    transition: none;
  }

  .language-option:last-child {
    border-bottom: none;
  }

  .language-option:hover {
    background: var(--cardH3);
    color: var(--panelBg);
  }

  .language-option.selected {
    background: var(--cardBorder);
    color: var(--cardH3);
    font-weight: normal;
  }

  .section-title {
    color: var(--cardH3);
    font-family: 'Press Start 2P', monospace;
    font-size: 9px;
    line-height: 1.6;
    margin-top: 20px;
    margin-bottom: 12px;
    border-bottom: 2px solid var(--cardBorder);
    padding-bottom: 6px;
    text-shadow: 1px 1px 0 rgba(0,0,0,0.4);
  }

  .tech-stack {
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: var(--cardPeriod);
    line-height: 1.7;
  }

  .achievements-list {
    padding-left: 20px;
    margin: 0;
    font-size: 12px;
    font-family: system-ui, sans-serif;
  }

  .achievements-list li {
    margin-bottom: 8px;
    line-height: 1.7;
  }
</style>
