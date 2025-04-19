import { useEffect, useRef } from "react";
import { createGameConfig } from "@/lib/game/config";

export function Game() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const initPhaser = async () => {
      if (typeof window !== "undefined") {
        const Phaser = (await import("phaser")).default;
        const container = document.getElementById("game-content");
        if (!gameRef.current && container) {
          gameRef.current = new Phaser.Game(createGameConfig(container));
        }
      }
    };

    initPhaser();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="game-content"
      className="w-full h-full"
    />
  );
}
