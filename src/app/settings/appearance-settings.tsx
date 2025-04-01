"use client"

import { useState } from "react"
import SettingsLayout from "./settings-layout"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Check, Paintbrush, Sparkles } from "lucide-react"

const BACKGROUNDS = [
  { id: "forest", name: "Enchanted Forest", color: "bg-green-600" },
  { id: "space", name: "Cosmic Space", color: "bg-indigo-800" },
  { id: "desert", name: "Desert Adventure", color: "bg-amber-600" },
  { id: "ocean", name: "Ocean Depths", color: "bg-blue-700" },
  { id: "volcano", name: "Volcanic Realm", color: "bg-red-700" },
]

export default function AppearanceSettings() {
  const [background, setBackground] = useState("forest")
  const [iconSize, setIconSize] = useState(16)
  const [animations, setAnimations] = useState(true)

  return (
    <SettingsLayout title="Appearance" description="Customize how your TaskQuest looks and feels">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Background Theme</h3>
            <Button variant="outline" size="sm">
              <Paintbrush className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {BACKGROUNDS.map((bg) => (
              <div
                key={bg.id}
                className={`relative cursor-pointer rounded-lg p-2 transition-all ${
                  background === bg.id ? "ring-2 ring-primary" : "hover:bg-accent"
                }`}
                onClick={() => setBackground(bg.id)}
              >
                <div className={${bg.color} h-20 rounded-md mb-2}></div>
                <p className="text-sm font-medium text-center">{bg.name}</p>
                {background === bg.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Icon Size</h3>
            <p className="text-sm text-muted-foreground mb-4">Adjust how large the icons appear in your interface</p>
            <div className="space-y-4">
              <Slider value={[iconSize]} min={12} max={24} step={2} onValueChange={(value) => setIconSize(value[0])} />
              <div className="flex justify-between">
                <span className="text-sm">Small</span>
                <span className="text-sm font-medium">{iconSize}px</span>
                <span className="text-sm">Large</span>
              </div>
              <div className="flex items-center justify-center gap-4 py-4">
                <Sparkles style={{ width: ${iconSize}px, height: ${iconSize}px }} />
                <Paintbrush style={{ width: ${iconSize}px, height: ${iconSize}px }} />
                <Check style={{ width: ${iconSize}px, height: ${iconSize}px }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="animations">Animations</Label>
            <p className="text-sm text-muted-foreground">Enable animations for a more dynamic experience</p>
          </div>
          <Switch id="animations" checked={animations} onCheckedChange={setAnimations} />
        </div>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </SettingsLayout>
  )
}
