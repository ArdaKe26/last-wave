import { Scene } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../../constants";
import { loadBestWave } from "../highScore";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.cameras.main.setBackgroundColor("#1a1a1a");

    const best = loadBestWave();

    if (best > 0) {
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, "Best: Wave " + best, {
          fontSize: 24,
          color: "#ffff00",
          align: "center",
        })
        .setOrigin(0.5);
    }

    this.add
      .text(GAME_WIDTH / 2, 180, "LAST WAVE", {
        fontSize: 72,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 250, "Survive the waves. Upgrade. Repeat.", {
        fontSize: 24,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const playButton = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      200,
      60,
      0x695555,
    );
    playButton.setInteractive();
    playButton.on("pointerdown", () => this.scene.start("Game"));

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "PLAY", {
        fontSize: 28,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 250, "WASD - Move", {
        fontSize: 18,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 200, "Weapons shoot automatically", {
        fontSize: 18,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 150,
        "Collect materials, buy weapons between waves",
        {
          fontSize: 18,
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => this.scene.start("Game"));
    this.input.keyboard!.once("keydown-ENTER", () => this.scene.start("Game"));
  }
}
