export type Platform = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  key?: string;
  visited?: boolean;
};

export type StarSpec = {
  x: number;
  y: number;
};

export type Star = StarSpec & {
  collected: boolean;
  animTimer: number;
};

export type MobSpec = {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  vx: number;
  minX: number;
  maxX: number;
};

export type Mob = MobSpec & {
  dead: boolean;
  deadTimer: number;
};

export type Level = {
  end: number;
  start: { x: number; y: number };
  portal: { x: number; y: number };
  platforms: Platform[];
  stars: StarSpec[];
  mobs: () => Mob[];
};
