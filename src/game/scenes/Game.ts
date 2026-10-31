import { GameObjects, Input, Physics, Scene, Math as PhaserMath } from "phaser";
import {
  PLAYER,
  GAME_WIDTH,
  GAME_HEIGHT,
  ENEMY,
  WEAPON,
  BULLET,
  MATERIALS,
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
const { RANGE, FIRE_INTERVAL_MS, DAMAGE } = WEAPON;
const { BULLET_COLOR, BULLET_SIZE, BULLET_SPEED } = BULLET;
const { MATERIAL_COLOR, MATERIAL_SIZE, MATERIAL_VALUE } = MATERIALS;

export class Game extends Scene {
  private player!: GameObjects.Rectangle;
  private enemies!: Physics.Arcade.Group;
  private bullets!: Physics.Arcade.Group;
  private materials!: Physics.Arcade.Group;
  private materialText!: GameObjects.Text;
  private healthText!: GameObjects.Text;
  private gameOverText!: GameObjects.Text;

  private wKey!: Input.Keyboard.Key;
  private aKey!: Input.Keyboard.Key;
  private sKey!: Input.Keyboard.Key;
  private dKey!: Input.Keyboard.Key;

  private playerHealth = MAX_HEALTH;
  private invulnerableUntil = 0;

  private materialCount = 0;

  constructor() {
    super("Game");
  }

  preload() {}

  create() {
    this.playerHealth = MAX_HEALTH;
    this.materialCount = 0;
    this.invulnerableUntil = 0;
    this.time.paused = false;

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

    this.materialText = this.add.text(16, 16, "Materials: 0", {
      fontSize: 24,
      color: "#ffffff",
    });
    this.healthText = this.add.text(16, 48, "Health: " + MAX_HEALTH, {
      fontSize: 24,
      color: "#ffffff",
    });

    this.time.addEvent({
      delay: ENEMY_SPAWN_INTERVAL_MS,
      loop: true,
      callback: () => this.spawnEnemy(),
    });

    this.time.addEvent({
      delay: FIRE_INTERVAL_MS,
      loop: true,
      callback: () => this.shoot(),
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
        bullet.destroy();

        const health = enemy.getData(ENEMY_HEALTH_DATA_NAME) - DAMAGE;
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

    enemy.setData(ENEMY_HEALTH_DATA_NAME, ENEMY_HEALTH);

    const body = enemy.body as Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
  }

  private findNearestEnemy() {
    let nearest: GameObjects.Rectangle | null = null;
    let nearestDistance = RANGE;

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

  private shoot() {
    const nearestEnemy = this.findNearestEnemy();

    if (nearestEnemy === null) {
      return;
    }

    const bullet = this.add.rectangle(
      this.player.x,
      this.player.y,
      BULLET_SIZE,
      BULLET_SIZE,
      BULLET_COLOR,
    );

    this.bullets.add(bullet);

    const body = bullet.body as Physics.Arcade.Body;

    const bulletDirection = new PhaserMath.Vector2(
      nearestEnemy.x - this.player.x,
      nearestEnemy.y - this.player.y,
    ).normalize();

    body.setVelocity(
      bulletDirection.x * BULLET_SPEED,
      bulletDirection.y * BULLET_SPEED,
    );
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
}
