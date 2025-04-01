import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppearanceSettings from "./appearance-settings"
import NavigationSettings from "./navigation-settings"
import SecuritySettings from "./security-settings"

export const metadata: Metadata = {
  title: "Settings | TaskQuest",
  description: "Manage your TaskQuest settings and preferences",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your TaskQuest experience and level up your productivity.</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4 mt-4">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4 mt-4">
          <NavigationSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
