import type { Level, Mob, Platform, StarSpec } from './types';

const platforms: Platform[] = [
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
  { x: 3250, y: 200, w: 150, h: 20, color: '#7a6a5a' },
  { x: 3440, y: 300, w: 140, h: 20, color: '#5a6a7a' },
  { x: 3630, y: 200, w: 150, h: 20, color: '#7a8a5a' },
  { x: 3840, y: 310, w: 140, h: 20, color: '#6a7a6a' },
  { x: 4030, y: 215, w: 160, h: 20, color: '#7a7a5a' },
  { x: 4240, y: 340, w: 140, h: 20, color: '#6a5a7a' },
  { x: 4430, y: 255, w: 160, h: 20, color: '#8a7a6a' },
  { x: 4640, y: 370, w: 140, h: 20, color: '#6a7a8a' },
  { x: 4840, y: 285, w: 150, h: 20, color: '#7a8a7a' },
  { x: 5050, y: 390, w: 150, h: 20, color: '#8a8a6a' },
  { x: 5260, y: 425, w: 150, h: 20, color: '#6a8a8a' },
  { x: 5470, y: 445, w: 180, h: 20, color: '#7a6a8a' },
];

const stars: StarSpec[] = [
  // ── JOB SECTION ──────────────────────────────────────────
  { x: 180,  y: 370 }, { x: 220,  y: 340 },
  { x: 280,  y: 370 }, { x: 380,  y: 360 }, { x: 430,  y: 330 },
  { x: 470,  y: 310 },
  { x: 530,  y: 320 }, { x: 610,  y: 300 }, { x: 660,  y: 280 },
  { x: 790,  y: 250 }, { x: 870,  y: 230 },
  { x: 940,  y: 200 }, { x: 970,  y: 170 },
  { x: 1030, y: 170 }, { x: 1120, y: 155 }, { x: 1190, y: 180 },
  // ── VALLEY DROP ──────────────────────────────────────────
  { x: 1220, y: 380 }, { x: 1265, y: 545 },
  { x: 1320, y: 648 }, { x: 1395, y: 645 }, { x: 1462, y: 648 },
  // ── ASCENDING ────────────────────────────────────────────
  { x: 1558, y: 528 }, { x: 1638, y: 523 },
  { x: 1785, y: 468 }, { x: 1862, y: 463 },
  { x: 2005, y: 408 }, { x: 2082, y: 403 },
  { x: 2215, y: 348 }, { x: 2298, y: 343 },
  { x: 2425, y: 293 }, { x: 2508, y: 288 },
  { x: 2635, y: 238 }, { x: 2718, y: 233 },
  { x: 2845, y: 183 }, { x: 2922, y: 178 },
  { x: 3055, y: 133 }, { x: 3132, y: 128 },
  // ── ZIGZAG DESCENT ───────────────────────────────────────
  { x: 3275, y: 168 }, { x: 3355, y: 163 },
  { x: 3465, y: 268 }, { x: 3540, y: 263 },
  { x: 3655, y: 168 }, { x: 3712, y: 165 }, { x: 3740, y: 168 },
  { x: 3865, y: 278 }, { x: 3938, y: 273 },
  { x: 4055, y: 183 }, { x: 4142, y: 178 },
  { x: 4265, y: 308 }, { x: 4348, y: 303 },
  { x: 4455, y: 223 }, { x: 4512, y: 220 }, { x: 4548, y: 223 },
  { x: 4665, y: 338 }, { x: 4748, y: 333 },
  { x: 4865, y: 253 }, { x: 4948, y: 248 },
  { x: 5075, y: 358 }, { x: 5158, y: 353 },
  { x: 5285, y: 393 }, { x: 5368, y: 388 },
  { x: 5498, y: 413 }, { x: 5568, y: 410 }, { x: 5628, y: 413 },
];

// Mobs patrol the top of these key platforms.
// Each entry references the platform by index so the mob auto-aligns if a
// platform is resized or repositioned later.
const MOB_HEIGHT = 28;
const MOB_WIDTH = 24;
const MOB_SPEED = 1.5;
const mobPlatformIndices: { index: number; vx: 1 | -1 }[] = [
  { index: 6,  vx:  1 }, // ascending mid
  { index: 11, vx: -1 }, // ascending high
  { index: 18, vx:  1 }, // zigzag jump up
  { index: 22, vx: -1 }, // zigzag jump up
];

function createMobs(): Mob[] {
  return mobPlatformIndices.map(({ index, vx }) => {
    const pl = platforms[index];
    return {
      x: pl.x + 40,
      y: pl.y - MOB_HEIGHT,
      w: MOB_WIDTH,
      h: MOB_HEIGHT,
      speed: MOB_SPEED,
      vx: vx * MOB_SPEED,
      minX: pl.x,
      maxX: pl.x + pl.w - MOB_WIDTH,
      dead: false,
      deadTimer: 0,
    };
  });
}

const lastPlatform = platforms[platforms.length - 1];

export const level1: Level = {
  end: 6000,
  start: { x: 70, y: 390 },
  portal: {
    x: lastPlatform.x + lastPlatform.w / 2,
    y: lastPlatform.y,
  },
  platforms,
  stars,
  mobs: createMobs,
};
