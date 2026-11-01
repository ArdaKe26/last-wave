import {
  GameObjects,
  Input,
  Physics,
  Scene,
  Math as PhaserMath,
  Time,
} from "phaser";
import {
  PLAYER,
  GAME_WIDTH,
  GAME_HEIGHT,
  ENEMY,
  WEAPON,
  BULLET,
  MATERIALS,
  WAVE,
  WeaponType,
  WEAPON_TYPES,
} from "../../constants";

const { SIZE, COLOR, SPEED, MAX_HEALTH, INVULNERABLE_MS } = PLAYER;
const {
  ENEMY_SIZE,
  ENEMY_COLOR,
  ENEMY_SPEED,
  ENEMY_MIN_SPAWN_DISTANCE,
  ENEMY_SPAWN_INTERVAL_MS,
  ENEMY_HEALTH,
  ENEMY_HEALTH_DATA_NAME,
  ENEMY_DAMAGE,
} = ENEMY;
const { MAX_WEAPONS, DAMAGE_SAVE_NAME } = WEAPON;
const { BULLET_SIZE } = BULLET;
const { MATERIAL_COLOR, MATERIAL_SIZE, MATERIAL_VALUE } = MATERIALS;
const {
  BASE_DURATION,
  DURATION_INCREASE_S,
  ENEMY_HEALTH_PER_WAVE,
  MAX_DURATION_S,
  SPAWN_INTERVAL_MULTIPLIER,
  MIN_SPAWN_INTERVAL,
} = WAVE;

type OwnedWeapon = {
  type: WeaponType;
  nextFireTime: number;
};
export class Game extends Scene {
  private player!: GameObjects.Rectangle;
  private enemies!: Physics.Arcade.Group;
  private bullets!: Physics.Arcade.Group;
  private materials!: Physics.Arcade.Group;
  private materialText!: GameObjects.Text;
  private healthText!: GameObjects.Text;
  private gameOverText!: GameObjects.Text;
  private waveText!: GameObjects.Text;
  private waveEndText!: GameObjects.Text;
  private spawnTimer!: Time.TimerEvent;
  private weapons: OwnedWeapon[] = [];

  private wKey!: Input.Keyboard.Key;
  private aKey!: Input.Keyboard.Key;
  private sKey!: Input.Keyboard.Key;
  private dKey!: Input.Keyboard.Key;

  private playerHealth = MAX_HEALTH;
  private invulnerableUntil = 0;

  private materialCount = 0;
  private wave = 1;
  private waveTimeLeft = BASE_DURATION;

  constructor() {
    super("Game");
  }

  preload() {}

  create() {
    this.playerHealth = MAX_HEALTH;
    this.materialCount = 0;
    this.invulnerableUntil = 0;
    this.time.paused = false;
    this.wave = 1;
    this.waveTimeLeft = BASE_DURATION;

    this.weapons = [{ type: WEAPON_TYPES[1], nextFireTime: 0 }];

    this.player = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      SIZE,
      SIZE,
      COLOR,
    );

    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.materials = this.physics.add.group();

    this.waveText = this.add
      .text(
        GAME_WIDTH / 2,
        30,
        "Wave " + this.wave + " - " + this.waveTimeLeft,
        { fontSize: 24, color: "#ffffff" },
      )
      .setOrigin(0.5);
    this.materialText = this.add.text(16, 16, "Materials: 0", {
      fontSize: 24,
      color: "#ffffff",
    });
    this.healthText = this.add.text(16, 48, "Health: " + MAX_HEALTH, {
      fontSize: 24,
      color: "#ffffff",
    });
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tickWaveTimer(),
    });
    this.spawnTimer = this.time.addEvent({
      delay: this.getSpawnInterval(),
      loop: true,
      callback: () => {
        this.spawnEnemy();
      },
    });

    this.physics.add.existing(this.player);

    const body = this.player.body as Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    this.wKey = this.input.keyboard!.addKey("W");
    this.aKey = this.input.keyboard!.addKey("A");
    this.sKey = this.input.keyboard!.addKey("S");
    this.dKey = this.input.keyboard!.addKey("D");

    this.physics.add.collider(this.enemies, this.enemies);

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      (bulletObj, enemyObj) => {
        const bullet = bulletObj as GameObjects.Rectangle;
        const enemy = enemyObj as GameObjects.Rectangle;
        const weaponDamage = bullet.getData(DAMAGE_SAVE_NAME);

        bullet.destroy();

        const health = enemy.getData(ENEMY_HEALTH_DATA_NAME) - weaponDamage;
        enemy.setData(ENEMY_HEALTH_DATA_NAME, health);

        if (enemy.getData(ENEMY_HEALTH_DATA_NAME) <= 0) {
          this.dropMaterial(enemy.x, enemy.y);

          enemy.destroy();
        }
      },
    );

    this.physics.add.overlap(
      this.player,
      this.materials,
      (playerObj, materialObj) => {
        const material = materialObj as GameObjects.Rectangle;

        this.materialCount += MATERIAL_VALUE;

        this.materialText.setText("Materials: " + this.materialCount);

        material.destroy();
      },
    );

    this.physics.add.overlap(this.player, this.enemies, () => {
      if (this.time.now < this.invulnerableUntil) {
        return;
      }

      this.playerHealth -= ENEMY_DAMAGE;

      this.invulnerableUntil = this.time.now + INVULNERABLE_MS;

      this.healthText.setText("Health: " + this.playerHealth);

      this.player.setFillStyle(0xff0000);

      this.time.delayedCall(INVULNERABLE_MS, () => {
        this.player.setFillStyle(COLOR);
      });

      if (this.playerHealth <= 0) {
        this.gameOver();
      }
    });
  }

  update(time: number, delta: number): void {
    let x = 0;
    let y = 0;

    if (this.aKey.isDown) {
      x -= 1;
    }
    if (this.dKey.isDown) {
      x += 1;
    }
    if (this.wKey.isDown) {
      y -= 1;
    }
    if (this.sKey.isDown) {
      y += 1;
    }

    const direction = new PhaserMath.Vector2(x, y).normalize();

    const body = this.player.body as Physics.Arcade.Body;
    body.setVelocity(direction.x * SPEED, direction.y * SPEED);

    for (const child of this.enemies.getChildren()) {
      const enemy = child as GameObjects.Rectangle;

      const targetVector = new PhaserMath.Vector2(
        this.player.x - enemy.x,
        this.player.y - enemy.y,
      ).normalize();

      const body = enemy.body as Physics.Arcade.Body;

      body.setVelocity(
        targetVector.x * ENEMY_SPEED,
        targetVector.y * ENEMY_SPEED,
      );
    }

    for (const child of this.bullets.getChildren()) {
      const bullet = child as GameObjects.Rectangle;

      if (
        bullet.x < 0 ||
        bullet.x > GAME_WIDTH ||
        bullet.y < 0 ||
        bullet.y > GAME_HEIGHT
      ) {
        bullet.destroy();
      }
    }

    for (const weapon of this.weapons) {
      if (this.time.now >= weapon.nextFireTime) {
        if (this.shoot(weapon.type)) {
          weapon.nextFireTime = this.time.now + weapon.type.fire_interval;
        }
      }
    }
  }

  private spawnEnemy() {
    const spawnX = PhaserMath.Between(0, GAME_WIDTH);
    const spawnY = PhaserMath.Between(0, GAME_HEIGHT);

    const distance = PhaserMath.Distance.Between(
      spawnX,
      spawnY,
      this.player.x,
      this.player.y,
    );
    if (distance < ENEMY_MIN_SPAWN_DISTANCE) {
      return;
    }

    const enemy = this.add.rectangle(
      spawnX,
      spawnY,
      ENEMY_SIZE,
      ENEMY_SIZE,
      ENEMY_COLOR,
    );

    this.enemies.add(enemy);

    enemy.setData(ENEMY_HEALTH_DATA_NAME, this.getEnemyHealth());

    const body = enemy.body as Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
  }

  private findNearestEnemy(range: number) {
    let nearest: GameObjects.Rectangle | null = null;
    let nearestDistance = range;

    for (const child of this.enemies.getChildren()) {
      const enemy = child as GameObjects.Rectangle;

      const distanceToPlayer = PhaserMath.Distance.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y,
      );

      if (distanceToPlayer < nearestDistance) {
        nearestDistance = distanceToPlayer;
        nearest = enemy;
      }
    }

    return nearest;
  }

  private shoot(weapon: WeaponType) {
    const nearestEnemy = this.findNearestEnemy(weapon.range);

    if (nearestEnemy === null) {
      return false;
    }

    const bullet = this.add.rectangle(
      this.player.x,
      this.player.y,
      BULLET_SIZE,
      BULLET_SIZE,
      weapon.bullet_color,
    );

    this.bullets.add(bullet);

    const body = bullet.body as Physics.Arcade.Body;

    const bulletDirection = new PhaserMath.Vector2(
      nearestEnemy.x - this.player.x,
      nearestEnemy.y - this.player.y,
    ).normalize();

    body.setVelocity(
      bulletDirection.x * weapon.bullet_speed,
      bulletDirection.y * weapon.bullet_speed,
    );

    bullet.setData(DAMAGE_SAVE_NAME, weapon.damage);

    return true;
  }

  private dropMaterial(x: number, y: number) {
    const material = this.add.rectangle(
      x,
      y,
      MATERIAL_SIZE,
      MATERIAL_SIZE,
      MATERIAL_COLOR,
    );

    this.materials.add(material);
  }

  private gameOver() {
    this.physics.pause();
    this.time.paused = true;

    this.gameOverText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "GAME OVER\nPress R to restart", {
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-R", () => this.scene.restart());
  }

  private endWave() {
    this.bullets.clear(true, true);
    this.enemies.clear(true, true);

    this.physics.pause();
    this.time.paused = true;

    this.waveEndText = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        "Wave " + this.wave + " completed!\nPress SPACE for the next vawe",
        { fontSize: 24, color: "#ffffff" },
      )
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.wave += 1;
      this.waveTimeLeft = this.getWaveDuration();
      this.waveEndText.destroy(true);
      this.waveText.setText("Wave " + this.wave + " - " + this.waveTimeLeft);
      this.physics.resume();
      this.time.paused = false;
      this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
      this.playerHealth = MAX_HEALTH;
      this.healthText.setText("Health: " + this.playerHealth);
      this.spawnTimer.remove();
      this.spawnTimer = this.time.addEvent({
        delay: this.getSpawnInterval(),
        loop: true,
        callback: () => {
          this.spawnEnemy();
        },
      });
    });
  }

  private tickWaveTimer() {
    this.waveTimeLeft -= 1;
    this.waveText.setText("Wave " + this.wave + " - " + this.waveTimeLeft);

    if (this.waveTimeLeft <= 0) {
      this.endWave();
    }
  }

  private getWaveDuration() {
    return Math.min(
      BASE_DURATION + (this.wave - 1) * DURATION_INCREASE_S,
      MAX_DURATION_S,
    );
  }

  private getSpawnInterval() {
    return Math.max(
      ENEMY_SPAWN_INTERVAL_MS *
        Math.pow(SPAWN_INTERVAL_MULTIPLIER, this.wave - 1),
      MIN_SPAWN_INTERVAL,
    );
  }

  private getEnemyHealth() {
    return ENEMY_HEALTH + (this.wave - 1) * ENEMY_HEALTH_PER_WAVE;
  }
}
