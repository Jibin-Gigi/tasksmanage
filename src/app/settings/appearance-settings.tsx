import SettingsLayout from "./settings-layout"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AppearanceSettings() {
  return (
    <SettingsLayout 
      title="Appearance" 
      description="Customize how your TaskQuest looks and feels"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred theme for the dashboard.
              </p>
            </div>
            <Select defaultValue="dark">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable interface animations.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Make the interface more compact by reducing spacing.
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Play sound effects for notifications and actions.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </SettingsLayout>
  )
}
