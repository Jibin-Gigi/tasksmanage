"use client"

import { useState } from "react"
import SettingsLayout from "./settings-layout"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ListTodo, Trophy, Settings } from "lucide-react"

export default function NavigationSettings() {
  const [navPosition, setNavPosition] = useState("left")
  const [navStyle, setNavStyle] = useState("icons-and-text")
  const [compactMode, setCompactMode] = useState(false)

  return (
    <SettingsLayout title="Navigation" description="Customize how you navigate through TaskQuest">
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Navigation Position</h3>
          <RadioGroup
            value={navPosition}
            onValueChange={setNavPosition}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="left" id="nav-left" />
              <Label htmlFor="nav-left" className="cursor-pointer flex-1">
                <div className="flex flex-col">
                  <span>Left Sidebar</span>
                  <span className="text-sm text-muted-foreground">Navigation on the left side</span>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="top" id="nav-top" />
              <Label htmlFor="nav-top" className="cursor-pointer flex-1">
                <div className="flex flex-col">
                  <span>Top Bar</span>
                  <span className="text-sm text-muted-foreground">Navigation at the top</span>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="bottom" id="nav-bottom" />
              <Label htmlFor="nav-bottom" className="cursor-pointer flex-1">
                <div className="flex flex-col">
                  <span>Bottom Bar</span>
                  <span className="text-sm text-muted-foreground">Mobile-style bottom navigation</span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Navigation Style</h3>
          <RadioGroup value={navStyle} onValueChange={setNavStyle} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="icons-and-text" id="nav-icons-text" />
              <Label htmlFor="nav-icons-text" className="cursor-pointer flex-1">
                <div className="flex flex-col">
                  <span>Icons & Text</span>
                  <span className="text-sm text-muted-foreground">Show both icons and labels</span>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="icons-only" id="nav-icons" />
              <Label htmlFor="nav-icons" className="cursor-pointer flex-1">
                <div className="flex flex-col">
                  <span>Icons Only</span>
                  <span className="text-sm text-muted-foreground">Compact view with just icons</span>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="text-only" id="nav-text" />
              <Label htmlFor="nav-text" className="cursor-pointer flex-1">
                <div className="flex flex-col">
                  <span>Text Only</span>
                  <span className="text-sm text-muted-foreground">Clean view with just text</span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Navigation Preview</h3>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className={`flex ${navPosition === "left" ? "flex-row" : "flex-col"} gap-2`}>
              {navPosition === "left" && (
                <div className="flex flex-col gap-2 border-r pr-4">{renderNavItems(navStyle)}</div>
              )}
              {navPosition === "top" && (
                <div className="flex flex-row gap-4 border-b pb-4 mb-4">{renderNavItems(navStyle)}</div>
              )}
              <div className="flex-1 min-h-[100px] flex items-center justify-center text-muted-foreground">
                Content Area
              </div>
              {navPosition === "bottom" && (
                <div className="flex flex-row justify-around gap-4 border-t pt-4 mt-4">{renderNavItems(navStyle)}</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="compact-mode">Compact Mode</Label>
            <p className="text-sm text-muted-foreground">Reduce spacing for a more dense interface</p>
          </div>
          <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
        </div>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </SettingsLayout>
  )
}

function renderNavItems(style: string) {
  const items = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { icon: <ListTodo className="h-5 w-5" />, label: "Tasks" },
    { icon: <Trophy className="h-5 w-5" />, label: "Achievements" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ]

  return items.map((item, index) => (
    <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer">
      {(style === "icons-and-text" || style === "icons-only") && item.icon}
      {(style === "icons-and-text" || style === "text-only") && <span className="text-sm">{item.label}</span>}
    </div>
  ))
}
