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
  SHOP,
  HEALTH_BAR,
  XP,
  StatUpgrade,
  STAT_UPGRADES,
  DAMAGE_NUMBER,
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
const {
  CARD_COLOR,
  CARD_HEIGHT,
  CARD_WIDTH,
  REROLL_BASE_COST,
  SELL_MULTIPLIER,
} = SHOP;
const {
  BG_COLOR,
  FILL_COLOR,
  HEALTH_BAR_BG_HEIGHT,
  HEALTH_BAR_BG_WIDTH,
  HEALTH_BAR_FILL_HEIGHT,
  HEALTH_BAR_FILL_WIDTH,
  FILL_COLOR_BG,
} = HEALTH_BAR;
const {
  BASE_TO_LEVEL,
  INCREASE_PER_LEVEL,
  PER_MATERIAL,
  XP_BAR_BG_HEIGHT,
  XP_BAR_BG_WIDTH,
  XP_BAR_FILL_HEIGHT,
  XP_BAR_FILL_WIDTH,
  XP_BG_COLOR,
  XP_FILL_COLOR,
  XP_FILL_COLOR_BG,
  LEVEL_UP_TEXT_COLOR,
  RISE_DISTANCE,
  RISE_DURATION,
} = XP;
const {
  DAMAGE_RISE_DISTANCE,
  DAMAGE_RISE_DURATION,
  DAMAGE_NUMBER_COLOR,
  DAMAGE_NUMBER_RANDOMNESS,
  DAMAGE_NUMBER_SIZE,
} = DAMAGE_NUMBER;

type OwnedWeapon = {
  type: WeaponType;
  nextFireTime: number;
};
export class Game extends Scene {
  private player!: GameObjects.Rectangle;
  private healthBarBg!: GameObjects.Rectangle;
  private healthBarFill!: GameObjects.Rectangle;
  private healthBarFillBg!: GameObjects.Rectangle;
  private xpBarBg!: GameObjects.Rectangle;
  private xpBarFill!: GameObjects.Rectangle;
  private xpBarFillBg!: GameObjects.Rectangle;
  private enemies!: Physics.Arcade.Group;
  private bullets!: Physics.Arcade.Group;
  private materials!: Physics.Arcade.Group;
  private spawnTimer!: Time.TimerEvent;
  private weapons: OwnedWeapon[] = [];
  private shopObjects: GameObjects.GameObject[] = [];
  private offerObjects: GameObjects.GameObject[] = [];
  private ownedWeaponObjects: GameObjects.GameObject[] = [];
  private levelUpObjects: GameObjects.GameObject[] = [];

  private wKey!: Input.Keyboard.Key;
  private aKey!: Input.Keyboard.Key;
  private sKey!: Input.Keyboard.Key;
  private dKey!: Input.Keyboard.Key;

  private materialText!: GameObjects.Text;
  private healthText!: GameObjects.Text;
  private xpText!: GameObjects.Text;
  private waveText!: GameObjects.Text;
  private buttonText!: GameObjects.Text;
  private shopText!: GameObjects.Text;
  private shopMessageText!: GameObjects.Text;
  private rerollText!: GameObjects.Text;

  private playerHealth = MAX_HEALTH;
  private maxHealth = MAX_HEALTH;
  private moveSpeed = SPEED;
  private damageMultiplier = 1;
  private attackSpeedMulitiplier = 1;
  private invulnerableUntil = 0;

  private materialCount = 0;
  private wave = 1;
  private waveTimeLeft = BASE_DURATION;
  private rerollCost = 0;
  private level = 1;
  private xp = 0;
  private pendingLevelUps = 0;
  private kills = 0;
  private totalMaterials = 0;

  constructor() {
    super("Game");
  }

  create() {
    this.playerHealth = MAX_HEALTH;
    this.maxHealth = MAX_HEALTH;
    this.moveSpeed = SPEED;
    this.damageMultiplier = 1;
    this.attackSpeedMulitiplier = 1;
    this.materialCount = 0;
    this.invulnerableUntil = 0;
    this.time.paused = false;
    this.wave = 1;
    this.waveTimeLeft = BASE_DURATION;
    this.level = 1;
    this.xp = 0;
    this.pendingLevelUps = 0;
    this.kills = 0;
    this.totalMaterials = 0;

    this.weapons = [{ type: WEAPON_TYPES[0], nextFireTime: 0 }];

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
    this.materialText = this.add.text(16, 16, "Material: 0", {
      fontSize: 24,
      color: "#ffffff",
    });

    this.healthBarBg = this.add
      .rectangle(16, 48, HEALTH_BAR_BG_WIDTH, HEALTH_BAR_BG_HEIGHT, BG_COLOR)
      .setOrigin(0, 0);
    this.healthBarFillBg = this.add
      .rectangle(
        18,
        50,
        HEALTH_BAR_FILL_WIDTH,
        HEALTH_BAR_FILL_HEIGHT,
        FILL_COLOR_BG,
      )
      .setOrigin(0, 0);
    this.healthBarFill = this.add
      .rectangle(
        18,
        50,
        HEALTH_BAR_FILL_WIDTH,
        HEALTH_BAR_FILL_HEIGHT,
        FILL_COLOR,
      )
      .setOrigin(0, 0);

    this.healthText = this.add
      .text(
        16 + HEALTH_BAR_BG_WIDTH / 2,
        48 + HEALTH_BAR_BG_HEIGHT / 2,
        this.playerHealth + "/" + this.maxHealth,
        { fontSize: 16, color: "#ffffff" },
      )
      .setOrigin(0.5);

    this.updateHealthUI();

    this.xpBarBg = this.add
      .rectangle(16, 74, XP_BAR_BG_WIDTH, XP_BAR_BG_HEIGHT, XP_BG_COLOR)
      .setOrigin(0, 0);
    this.xpBarFillBg = this.add
      .rectangle(
        18,
        76,
        XP_BAR_FILL_WIDTH,
        XP_BAR_FILL_HEIGHT,
        XP_FILL_COLOR_BG,
      )
      .setOrigin(0, 0);
    this.xpBarFill = this.add
      .rectangle(18, 76, XP_BAR_FILL_WIDTH, XP_BAR_FILL_HEIGHT, XP_FILL_COLOR)
      .setOrigin(0, 0);

    this.xpText = this.add
      .text(
        16 + XP_BAR_BG_WIDTH / 2,
        74 + XP_BAR_BG_HEIGHT / 2,
        "Lv " + this.level,
        { fontSize: 14, color: "#ffffff" },
      )
      .setOrigin(0.5);

    this.updateXpUI();

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

        this.showDamageNumber(enemy.x, enemy.y - 20, weaponDamage);

        bullet.destroy();

        const health = enemy.getData(ENEMY_HEALTH_DATA_NAME) - weaponDamage;
        enemy.setData(ENEMY_HEALTH_DATA_NAME, health);

        if (enemy.getData(ENEMY_HEALTH_DATA_NAME) <= 0) {
          this.dropMaterial(enemy.x, enemy.y);

          this.kills += 1;

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
        this.totalMaterials += MATERIAL_VALUE;

        this.updateMaterialUI();

        material.destroy();

        this.addXp(PER_MATERIAL);
      },
    );

    this.physics.add.overlap(this.player, this.enemies, () => {
      if (this.time.now < this.invulnerableUntil) {
        return;
      }

      this.playerHealth -= ENEMY_DAMAGE;

      this.invulnerableUntil = this.time.now + INVULNERABLE_MS;

      this.showDamageGotNumber(ENEMY_DAMAGE);

      this.updateHealthUI();

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
    body.setVelocity(
      direction.x * this.moveSpeed,
      direction.y * this.moveSpeed,
    );

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
          weapon.nextFireTime =
            this.time.now +
            weapon.type.fire_interval / this.attackSpeedMulitiplier;
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

    bullet.setData(DAMAGE_SAVE_NAME, weapon.damage * this.damageMultiplier);

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

    this.scene.start("GameOver", {
      wave: this.wave,
      level: this.level,
      kills: this.kills,
      materials: this.totalMaterials,
    });
  }

  private endWave() {
    this.bullets.clear(true, true);
    this.enemies.clear(true, true);

    this.physics.pause();
    this.time.paused = true;

    if (this.pendingLevelUps > 0) {
      this.openLevelUp();
    } else {
      this.openShop();
    }
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

  private startNextWave() {
    this.wave += 1;
    this.waveTimeLeft = this.getWaveDuration();
    this.waveText.setText("Wave " + this.wave + " - " + this.waveTimeLeft);
    this.physics.resume();
    this.time.paused = false;
    this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.playerHealth = this.maxHealth;
    this.updateHealthUI();
    this.spawnTimer.remove();
    this.spawnTimer = this.time.addEvent({
      delay: this.getSpawnInterval(),
      loop: true,
      callback: () => {
        this.spawnEnemy();
      },
    });
  }

  private openShop() {
    this.shopText = this.add
      .text(GAME_WIDTH / 2, 100, "Wave " + this.wave + " completed - Shop", {
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.showOffers();

    const button = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 80,
      200,
      60,
      0x44aa44,
    );
    button.setInteractive();
    button.on("pointerdown", () => this.closeShop());

    this.buttonText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 80, "Next Wave", {
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.showOwnedWeapons();

    this.shopMessageText = this.add
      .text(GAME_WIDTH - 200, GAME_HEIGHT - 40, "", {
        fontSize: 20,
        color: "#ff0000",
      })
      .setOrigin(0.5);

    this.rerollCost = REROLL_BASE_COST;

    const rerollButton = this.add
      .rectangle(GAME_WIDTH - 150, 190, 200, 60, 0x333333)
      .setOrigin(0.5);
    this.rerollText = this.add
      .text(GAME_WIDTH - 150, 190, "Reroll: (" + this.rerollCost + ")", {
        fontSize: 24,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    rerollButton.setInteractive();
    rerollButton.on("pointerdown", () => this.reroll());

    this.shopObjects.push(
      this.shopText,
      this.buttonText,
      button,
      this.shopMessageText,
      rerollButton,
      this.rerollText,
    );
  }

  private closeShop() {
    for (const obj of this.shopObjects) {
      obj.destroy();
    }

    this.shopObjects = [];
    this.startNextWave();
  }

  private buyWeapon(weapon: WeaponType, card: GameObjects.Rectangle) {
    if (this.materialCount < weapon.price) {
      this.shopMessageText.setText("Not Enough Materials");
      this.shopMessageText.setColor("#ff0000");
      return;
    }

    if (this.weapons.length >= MAX_WEAPONS) {
      this.shopMessageText.setText("Not Enough Weapon Space");
      this.shopMessageText.setColor("#ff0000");
      return;
    }

    this.materialCount -= weapon.price;

    this.updateMaterialUI();

    card.disableInteractive();
    card.setFillStyle(0x777777);

    this.weapons.push({ type: weapon, nextFireTime: 0 });

    this.showOwnedWeapons();

    this.shopMessageText.setText("Bought: " + weapon.name);
    this.shopMessageText.setColor("#00ff00");
  }

  private showOffers() {
    for (const obj of this.offerObjects) {
      obj.destroy();
    }
    this.offerObjects = [];

    for (let i = 0; i <= 2; i++) {
      const randomWeapon = PhaserMath.RND.pick(WEAPON_TYPES);
      const cardX = GAME_WIDTH / 2 + (i - 1) * 260;

      const card = this.add.rectangle(
        cardX,
        GAME_HEIGHT / 2,
        CARD_WIDTH,
        CARD_HEIGHT,
        CARD_COLOR,
      );

      const cardNameText = this.add
        .text(cardX, GAME_HEIGHT / 2 - 40, "WEAPON: " + randomWeapon.name)
        .setOrigin(0.5);
      const cardDamageText = this.add
        .text(cardX, GAME_HEIGHT / 2 - 20, "Damage: " + randomWeapon.damage)
        .setOrigin(0.5);
      const cardFireRateText = this.add
        .text(
          cardX,
          GAME_HEIGHT / 2,
          "Fire Rate: " + randomWeapon.fire_interval + "ms",
        )
        .setOrigin(0.5);
      const cardRangeText = this.add
        .text(cardX, GAME_HEIGHT / 2 + 20, "Range: " + randomWeapon.range)
        .setOrigin(0.5);
      const cardPriceText = this.add
        .text(cardX, GAME_HEIGHT / 2 + 40, "Price: " + randomWeapon.price)
        .setOrigin(0.5);

      card.setInteractive();
      card.on("pointerdown", () => this.buyWeapon(randomWeapon, card));

      this.shopObjects.push(
        card,
        cardDamageText,
        cardFireRateText,
        cardNameText,
        cardPriceText,
        cardRangeText,
      );
      this.offerObjects.push(
        card,
        cardDamageText,
        cardFireRateText,
        cardNameText,
        cardPriceText,
        cardRangeText,
      );
    }
  }

  private reroll() {
    if (this.materialCount < this.rerollCost) {
      this.shopMessageText.setText("Not Enough Materials");
      this.shopMessageText.setColor("#ff0000");
      return;
    }
    this.materialCount -= this.rerollCost;

    this.updateMaterialUI();

    this.showOffers();
    this.rerollCost += 1;

    this.rerollText.setText("Reroll: (" + this.rerollCost + ")");
  }

  private showOwnedWeapons() {
    for (const obj of this.ownedWeaponObjects) {
      obj.destroy();
    }

    this.ownedWeaponObjects = [];

    for (let i = 0; i < this.weapons.length; i++) {
      const weaponBoxX = 100 + i * 140;

      const refund = this.getRefund(this.weapons[i].type);

      const weaponBox = this.add.rectangle(
        weaponBoxX,
        GAME_HEIGHT - 160,
        130,
        50,
        0x333333,
      );

      const ownedWeaponText = this.add
        .text(
          weaponBoxX,
          GAME_HEIGHT - 160,
          this.weapons[i].type.name + "\nSell: " + refund,
          { align: "center", fontSize: 16, color: "#ffffff" },
        )
        .setOrigin(0.5);

      weaponBox.setInteractive();
      weaponBox.on("pointerdown", () => this.sellWeapon(i));

      this.ownedWeaponObjects.push(ownedWeaponText, weaponBox);
      this.shopObjects.push(ownedWeaponText, weaponBox);
    }
  }

  private sellWeapon(slot: number) {
    if (this.weapons.length === 1) {
      this.shopMessageText.setText("You can't sell your last weapon");
      this.shopMessageText.setColor("#ff0000");
      return;
    }
    const weapon = this.weapons[slot];
    this.materialCount += this.getRefund(weapon.type);

    this.weapons.splice(slot, 1);

    this.shopMessageText.setText(
      "Sold " + weapon.type.name + " for " + this.getRefund(weapon.type),
    );
    this.shopMessageText.setColor("#00ff00");
    this.updateMaterialUI();

    this.showOwnedWeapons();
  }

  private getRefund(weapon: WeaponType) {
    const refund = Math.floor(weapon.price * SELL_MULTIPLIER);
    return refund;
  }

  private updateHealthUI() {
    this.healthBarFill.scaleX = Math.max(0, this.playerHealth) / this.maxHealth;
    this.healthText.setText(this.playerHealth + "/" + this.maxHealth);
  }

  private getXpToNextLevel() {
    return BASE_TO_LEVEL + (this.level - 1) * INCREASE_PER_LEVEL;
  }

  private addXp(amount: number) {
    this.xp += amount;
    while (this.xp >= this.getXpToNextLevel()) {
      this.xp -= this.getXpToNextLevel();

      this.level += 1;
      this.pendingLevelUps += 1;
      this.showLevelPopUp();
    }
    this.updateXpUI();
  }

  private updateXpUI() {
    this.xpBarFill.scaleX = this.xp / this.getXpToNextLevel();
    this.xpText.setText("Lv " + this.level);
  }

  private applyUpgrade(upgrade: StatUpgrade) {
    switch (upgrade.stat) {
      case "maxHealth":
        this.maxHealth += upgrade.amount;
        this.playerHealth += upgrade.amount;
        this.updateHealthUI();
        break;
      case "moveSpeed":
        this.moveSpeed += SPEED * upgrade.amount;
        break;
      case "attackSpeed":
        this.attackSpeedMulitiplier += upgrade.amount;
        break;
      case "damage":
        this.damageMultiplier += upgrade.amount;
        break;
    }
  }

  private openLevelUp() {
    const titleText = this.add
      .text(
        GAME_WIDTH / 2,
        100,
        "Level Up! Choose an Upgrade (" + this.pendingLevelUps + " left)",
        {
          fontSize: 48,
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    const choices = PhaserMath.RND.shuffle([...STAT_UPGRADES]).slice(0, 3);

    for (let i = 0; i < choices.length; i++) {
      const upgrade = choices[i];
      const cardX = GAME_WIDTH / 2 + (i - 1) * 260;

      const card = this.add.rectangle(
        cardX,
        GAME_HEIGHT / 2,
        CARD_WIDTH,
        CARD_HEIGHT,
        CARD_COLOR,
      );

      const nameText = this.add
        .text(cardX, GAME_HEIGHT / 2 - 20, upgrade.name, {
          fontSize: 28,
          color: "#ffffff",
        })
        .setOrigin(0.5);
      const descriptionText = this.add
        .text(cardX, GAME_HEIGHT / 2 + 20, upgrade.description, {
          fontSize: 18,
          color: "#ffffff",
        })
        .setOrigin(0.5);

      card.setInteractive();

      card.on("pointerdown", () => this.pickUpgrade(upgrade));

      this.levelUpObjects.push(card, nameText, descriptionText);
    }

    this.levelUpObjects.push(titleText);
  }

  private pickUpgrade(upgrade: StatUpgrade) {
    this.applyUpgrade(upgrade);

    this.pendingLevelUps -= 1;

    for (const obj of this.levelUpObjects) {
      obj.destroy();
    }
    this.levelUpObjects = [];

    if (this.pendingLevelUps > 0) {
      this.openLevelUp();
    } else {
      this.openShop();
    }
  }

  private showLevelPopUp() {
    const levelUpText = this.add
      .text(this.player.x, this.player.y - 30, "LEVEL UP!", {
        fontSize: 20,
        color: LEVEL_UP_TEXT_COLOR,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: levelUpText,
      y: levelUpText.y - RISE_DISTANCE,
      alpha: 0,
      duration: RISE_DURATION,
      onComplete: () => levelUpText.destroy(),
    });
  }

  private showDamageNumber(x: number, y: number, amount: number) {
    const damageText = this.add
      .text(
        x +
          PhaserMath.Between(
            -DAMAGE_NUMBER_RANDOMNESS,
            DAMAGE_NUMBER_RANDOMNESS,
          ),
        y,
        String(Math.round(amount)),
        {
          fontSize: DAMAGE_NUMBER_SIZE,
          color: DAMAGE_NUMBER_COLOR,
        },
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: y - DAMAGE_RISE_DISTANCE,
      alpha: 0,
      duration: DAMAGE_RISE_DURATION,
      onComplete: () => damageText.destroy(),
    });
  }

  private showDamageGotNumber(amount: number) {
    const damageText = this.add
      .text(
        this.player.x +
          PhaserMath.Between(
            -DAMAGE_NUMBER_RANDOMNESS,
            DAMAGE_NUMBER_RANDOMNESS,
          ),
        this.player.y - 20,
        String(Math.round(amount)),
        {
          fontSize: DAMAGE_NUMBER_SIZE,
          color: DAMAGE_NUMBER_COLOR,
        },
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: this.player.y - DAMAGE_RISE_DISTANCE,
      alpha: 0,
      duration: DAMAGE_RISE_DURATION,
      onComplete: () => damageText.destroy(),
    });
  }

  private updateMaterialUI() {
    if (this.materialCount > 1) {
      this.materialText.setText("Materials: " + this.materialCount);
    } else {
      this.materialText.setText("Material: " + this.materialCount);
    }
  }
}
