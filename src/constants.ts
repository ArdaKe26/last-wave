export const PLAYER = {
  SIZE: 32,
  COLOR: 0xffffff,
  SPEED: 200,
  MAX_HEALTH: 10,
  INVULNERABLE_MS: 500,
};

export const ENEMY = {
  ENEMY_SIZE: 28,
  ENEMY_COLOR: 0xff4444,
  ENEMY_SPEED: 100,
  ENEMY_SPAWN_INTERVAL_MS: 1000,
  ENEMY_MIN_SPAWN_DISTANCE: 200,
  ENEMY_HEALTH: 4,
  ENEMY_HEALTH_DATA_NAME: "health",
  ENEMY_DAMAGE: 2,
};

export const WEAPON = {
  MAX_WEAPONS: 6,
  DAMAGE_SAVE_NAME: "damage",
};

export const BULLET = {
  BULLET_SIZE: 8,
};

export const MATERIALS = {
  MATERIAL_SIZE: 10,
  MATERIAL_COLOR: 0x44ff44,
  MATERIAL_VALUE: 1,
};

export const WAVE = {
  BASE_DURATION: 20,
  DURATION_INCREASE_S: 5,
  MAX_DURATION_S: 60,
  ENEMY_HEALTH_PER_WAVE: 1,
  SPAWN_INTERVAL_MULTIPLIER: 0.85,
  MIN_SPAWN_INTERVAL: 250,
};

export const SHOP = {
  CARD_WIDTH: 220,
  CARD_HEIGHT: 200,
  CARD_COLOR: 0x333333,
  REROLL_BASE_COST: 2,
  SELL_MULTIPLIER: 0.5,
};

export const HEALTH_BAR = {
  HEALTH_BAR_BG_WIDTH: 200,
  HEALTH_BAR_BG_HEIGHT: 20,
  HEALTH_BAR_FILL_WIDTH: 196,
  HEALTH_BAR_FILL_HEIGHT: 16,
  BG_COLOR: 0x333333,
  FILL_COLOR: 0xff3333,
  FILL_COLOR_BG: 0x5a5a5a,
};

export const XP = {
  PER_MATERIAL: 1,
  BASE_TO_LEVEL: 10,
  INCREASE_PER_LEVEL: 7,
  XP_BAR_BG_WIDTH: 200,
  XP_BAR_BG_HEIGHT: 16,
  XP_BAR_FILL_WIDTH: 196,
  XP_BAR_FILL_HEIGHT: 12,
  XP_BG_COLOR: 0x333333,
  XP_FILL_COLOR: 0x44ff44,
  XP_FILL_COLOR_BG: 0x5a5a5a,
};

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

export type WeaponType = {
  name: string;
  damage: number;
  fire_interval: number;
  range: number;
  bullet_speed: number;
  bullet_color: number;
  price: number;
};

export const WEAPON_TYPES: WeaponType[] = [
  {
    name: "Pistol",
    damage: 2,
    fire_interval: 500,
    range: 300,
    bullet_speed: 450,
    bullet_color: 0xffff00,
    price: 10,
  },
  {
    name: "SMG",
    damage: 1,
    fire_interval: 150,
    range: 250,
    bullet_speed: 800,
    bullet_color: 0xffa500,
    price: 15,
  },
  {
    name: "Rifle",
    damage: 3,
    fire_interval: 400,
    range: 400,
    bullet_speed: 650,
    bullet_color: 0xffffff,
    price: 20,
  },
  {
    name: "Sniper",
    damage: 8,
    fire_interval: 1300,
    range: 800,
    bullet_speed: 1000,
    bullet_color: 0x00ffff,
    price: 25,
  },
];
