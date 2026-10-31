import { GameObjects, Input, Physics, Scene, Math as PhaserMath } from "phaser";
import { PLAYER, GAME_WIDTH, GAME_HEIGHT } from "../../constants";

const { SIZE, COLOR, SPEED } = PLAYER;

export class Game extends Scene {
  private player!: GameObjects.Rectangle;
  private wKey!: Input.Keyboard.Key;
  private aKey!: Input.Keyboard.Key;
  private sKey!: Input.Keyboard.Key;
  private dKey!: Input.Keyboard.Key;

  constructor() {
    super("Game");
  }

  preload() {}

  create() {
    this.player = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      SIZE,
      SIZE,
      COLOR,
    );

    this.physics.add.existing(this.player);

    const body = this.player.body as Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    this.wKey = this.input.keyboard!.addKey("W");
    this.aKey = this.input.keyboard!.addKey("A");
    this.sKey = this.input.keyboard!.addKey("S");
    this.dKey = this.input.keyboard!.addKey("D");
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
  }
}
