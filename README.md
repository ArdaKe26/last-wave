# Last Wave

A wave survival game for the browser, inspired by Brotato. Survive each wave, collect materials, buy weapons, level up and see how far you can get.

\*\*▶ Play it here: https://ardake26.github.io/last-wave/

## How to play

- Move with **WASD**. Your weapons aim and shoot at the nearest enemy **automatically**.
- Survive until the wave timer hits 0.
- Enemies drop **materials** (green squares). Walk over them to collect them.
- Between waves, spend materials in the **shop** and pick **upgrades** when you level up.
- Each wave is longer, enemies spawn faster and they have more health.
- If your health reaches 0, it's game over. Try to beat your best wave!

### Controls

| Key           | Action                                   |
| ------------- | ---------------------------------------- |
| W A S D       | Move                                     |
| Mouse         | Click shop cards and buttons             |
| Space / Enter | Start the game from the main menu        |
| R             | Play again (game over screen)            |
| Esc           | Back to the main menu (game over screen) |

## Features

### Weapons

You can hold up to **6 weapons** at once. Each one fires on its own timer.

| Weapon         | Damage | Fires every | Range | Price |
| -------------- | ------ | ----------- | ----- | ----- |
| Pistol         | 2      | 500 ms      | 300   | 10    |
| Machine Pistol | 1      | 200 ms      | 220   | 10    |
| Revolver       | 4      | 700 ms      | 350   | 15    |
| SMG            | 1      | 150 ms      | 250   | 15    |
| Rifle          | 3      | 400 ms      | 400   | 20    |
| Crossbow       | 5      | 1000 ms     | 500   | 20    |
| Marksman Rifle | 5      | 700 ms      | 600   | 25    |
| Sniper         | 8      | 1300 ms     | 800   | 25    |
| Minigun        | 1      | 80 ms       | 280   | 30    |
| Cannon         | 15     | 2000 ms     | 450   | 35    |

You start with a pistol by default.

### Shop

- 3 random weapons to buy after every wave
- **Reroll** for new offers (the price goes up each time you reroll)
- **Sell** weapons for half their price

### Levels and upgrades

Every material also gives XP. Each time you level up, you choose 1 of 3 random upgrades before the shop opens:

| Upgrade   | Effect            |
| --------- | ----------------- |
| Vitality  | +2 Max health     |
| Swiftness | +10% move speed   |
| Power     | +15% damage       |
| Haste     | +10% attack speed |

### Also

- Health bar and XP bar
- Damage numbers when you hit enemies or get hit
- Game over screen with your stats (wave, level, kills, materials)
- Your best wave is saved in your browser

## Built with

- [Phaser 4](https://phaser.io/)
- TypeScript
- [Vite](https://vitejs.dev/)

The project started from the official [Phaser Vite TypeScript template](https://github.com/phaserjs/template-vite-ts).

## Running it locally

Requires [Node.js](https://nodejs.org/).

```bash
npm install
npm run dev
```

Then open http://localhost:8080 in your browser.

To make a production build (into the `dist` folder):

```bash
npm run build
```

The game is deployed to GitHub Pages automatically on every push to `main`.

## License

MIT, see [LICENSE](LICENSE).
