"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Settings, Shield, Layout, Bell, User } from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

// const settingsNavItems = [
//   {
//     title: "Profile",
//     href: "/settings/profile",
//     icon: User,
//   },
//   {
//     title: "Security",
//     href: "/settings/security",
//     icon: Shield,
//   },
//   {
//     title: "Appearance",
//     href: "/settings/appearance",
//     icon: Layout,
//   },
//   {
//     title: "Notifications",
//     href: "/settings/notifications",
//     icon: Bell,
//   },
// ]

export default function SettingsLayout({
  children,
  title,
  description,
}: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex-1 min-h-screen bg-[#030014] text-white">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-[1400px]">
        {/* Header with glowing effect */}
        <div className="mb-8 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-xl -z-10"></div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-violet-100 mb-2">
            {title}
          </h1>
          <p className="text-violet-300/80 md:text-lg">{description}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Navigation */}
          {/* <aside className="md:w-64">
            <nav className="space-y-2">
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group hover:bg-violet-900/20 hover:border-violet-500/30",
                      isActive ? "bg-violet-900/30 border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.3)]" : "border border-transparent"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-violet-400" : "text-violet-500/70 group-hover:text-violet-400"
                    )} />
                    <span className={cn(
                      "font-medium transition-colors",
                      isActive ? "text-violet-100" : "text-violet-300/70 group-hover:text-violet-100"
                    )}>
                      {item.title}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </aside> */}

          {/* Content with gradient background */}
          <div className="flex-1">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-violet-900/20 to-violet-900/10 border border-violet-500/20 p-6 md:p-8">
              {/* Animated Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

              {/* Radial Gradient Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#1C133240,transparent_120%)]"></div>

              {/* Glowing corners */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-violet-500/10 blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-purple-500/10 blur-2xl"></div>

              {/* Content */}
              <div className="relative z-10">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
