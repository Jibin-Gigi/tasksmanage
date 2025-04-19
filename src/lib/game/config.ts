import { Types } from "phaser";
import { MainScene } from "@/lib/game/scenes/MainScene";

export const createGameConfig = (
  container: HTMLElement
): Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent: "game-content",
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: container,
    width: "100%",
    height: "100%",
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 1500 },
      debug: false,
    },
  },
  scene: [MainScene],
});
