"use client";

import type { ReactNode } from "react";
import {
    Globe02,
    Calendar,
    Flag06,
    ClockRewind,
    BarChart12,
    Download01,
    Settings01,
    LifeBuoy01,
} from "@untitledui/icons";
import { SidebarNavigationSimple } from "@/components/application/app-navigation/sidebar-navigation/sidebar-simple";
import type { NavItemType } from "@/components/application/app-navigation/config";

const navItems: NavItemType[] = [
    { label: "Universe", href: "/universe", icon: Globe02 },
    { label: "Season", href: "/season", icon: Calendar },
    { label: "Race", href: "/race", icon: Flag06 },
    { label: "History", href: "/history", icon: ClockRewind },
    { label: "Stats", href: "/stats", icon: BarChart12 },
    { label: "Export", href: "/export", icon: Download01 },
];

const footerItems: NavItemType[] = [
    { label: "Support", href: "/support", icon: LifeBuoy01 },
    { label: "Settings", href: "/settings", icon: Settings01 },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <SidebarNavigationSimple items={navItems} footerItems={footerItems} />
            <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
        </div>
    );
}
