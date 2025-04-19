"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Gamepad2, Maximize2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

const GameComponent = dynamic(
  () => import("@/components/Game").then((mod) => mod.Game),
  { ssr: false }
);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullScreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-violet-100 flex items-center gap-2">
                <Gamepad2 className="h-8 w-8 text-violet-400" />
                Minigame
              </h1>
              <p className="text-violet-300/80 mt-2">
                Take a break and have some fun!
              </p>
            </div>

            {/* Game Container */}
            <div className="relative" ref={containerRef}>
              <Card className="w-full aspect-[16/9] bg-[#0E0529]/50 border-violet-500/20 overflow-hidden">
                <GameComponent />
              </Card>
              <Button
                onClick={handleFullScreen}
                className="absolute top-4 right-4 bg-violet-600/80 hover:bg-violet-500"
                size="icon"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Game Instructions */}
            <div className="mt-6 text-violet-300/80">
              <p>
                Note: Some games might be blocked by the website's security
                settings. If the game doesn't load, try opening it in a new tab.
              </p>
              <p className="mt-2">
                Press the maximize button in the top-right corner or ESC to
                toggle fullscreen mode.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  //   return (
  //     <main className="flex min-h-screen flex-col items-center justify-center bg-black">
  //       <GameComponent />
  //     </main>
  //   );
}
