import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppearanceSettings from "./appearance-settings";
import NavigationSettings from "./navigation-settings";
import SecuritySettings from "./security-settings";
import { Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Settings | TaskQuest",
  description: "Manage your TaskQuest settings and preferences",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#030014] text-white">
      <div className="container mx-auto px-4 md:px-6 py-12 space-y-8 max-w-[1400px]">
        <div className="flex flex-col space-y-2 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-xl -z-10"></div>
          <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-violet-400" />
            <Badge
              variant="secondary"
              className="bg-violet-900/20 text-violet-200 hover:bg-violet-900/30"
            >
              Settings
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-violet-100">
            Settings
          </h1>
          <p className="text-violet-300/80 md:text-lg">
            Customize your TaskQuest experience and level up your productivity.
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-violet-900/20 to-violet-900/10 border border-violet-500/20 p-6 md:p-8">
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

          {/* Radial Gradient Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#1C133240,transparent_120%)]"></div>

          <div className="relative z-10">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md bg-violet-900/20 border border-violet-500/20">
                <TabsTrigger
                  value="appearance"
                  className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-violet-300"
                >
                  Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="navigation"
                  className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-violet-300"
                >
                  Navigation
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-violet-300"
                >
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-4 mt-8">
                <AppearanceSettings />
              </TabsContent>

              <TabsContent value="navigation" className="space-y-4 mt-8">
                <NavigationSettings />
              </TabsContent>

              <TabsContent value="security" className="space-y-4 mt-8">
                <SecuritySettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
