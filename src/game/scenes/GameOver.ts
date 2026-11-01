import { Scene } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../../constants";
import { loadBestWave, saveBestWave } from "../highScore";

type GameOverData = {
  wave: number;
  level: number;
  kills: number;
  materials: number;
};

export class GameOver extends Scene {
  private wave = 0;
  private level = 0;
  private kills = 0;
  private materials = 0;

  constructor() {
    super("GameOver");
  }

  init(data: GameOverData) {
    this.wave = data.wave;
    this.level = data.level;
    this.kills = data.kills;
    this.materials = data.materials;
  }

  create() {
    this.cameras.main.setBackgroundColor("#1a1a1a");

    const best = loadBestWave();

    if (this.wave > best) {
      saveBestWave(this.wave);
      this.add
        .text(GAME_WIDTH / 2, 210, "NEW BEST!", {
          fontSize: 32,
          color: "#ffff00",
        })
        .setOrigin(0.5);
    } else {
      this.add
        .text(GAME_WIDTH / 2, 450, "Best: Wave " + best, {
          fontSize: 24,
          color: "#aaaaaa",
        })
        .setOrigin(0.5);
    }

    this.add
      .text(GAME_WIDTH / 2, 150, "GAME OVER", {
        fontSize: 64,
        color: "#ff4444",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 280, "Wave reached: " + this.wave, {
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 320, "Level: " + this.level, {
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 360, "Enemies killed: " + this.kills, {
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 400, "Materials collected: " + this.materials, {
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const playAgain = this.add.rectangle(
      GAME_WIDTH / 2 - 120,
      GAME_HEIGHT - 150,
      200,
      60,
      0x008000,
    );
    this.add
      .text(GAME_WIDTH / 2 - 120, GAME_HEIGHT - 150, "PLAY AGAIN", {
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    playAgain.setInteractive();
    playAgain.on("pointerdown", () => this.scene.start("Game"));

    const mainMenu = this.add.rectangle(
      GAME_WIDTH / 2 + 120,
      GAME_HEIGHT - 150,
      200,
      60,
      0x008000,
    );
    this.add
      .text(GAME_WIDTH / 2 + 120, GAME_HEIGHT - 150, "MAIN MENU", {
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    mainMenu.setInteractive();
    mainMenu.on("pointerdown", () => this.scene.start("MainMenu"));

    this.input.keyboard!.once("keydown-R", () => this.scene.start("Game"));
    this.input.keyboard!.once("keydown-ESC", () =>
      this.scene.start("MainMenu"),
    );
  }
}
