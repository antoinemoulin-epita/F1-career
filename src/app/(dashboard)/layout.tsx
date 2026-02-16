"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Globe02, Calendar, ClockRewind, BarChart12, BookOpen01 } from "@untitledui/icons";
import { SidebarNavigationSimple } from "@/components/application/app-navigation/sidebar-navigation/sidebar-simple";
import type { NavItemType, NavItemDividerType } from "@/components/application/app-navigation/config";

const navItems: (NavItemType | NavItemDividerType)[] = [
    { label: "Univers", href: "/universe", icon: Globe02 },
    { label: "Saison", href: "/season", icon: Calendar },
    { divider: true },
    {
        label: "Palmares",
        href: "/history",
        icon: ClockRewind,
        items: [
            { label: "Champions", href: "/history/champions" },
            { label: "Victoires", href: "/history/wins" },
            { label: "Records", href: "/history/records" },
            { label: "Saisons", href: "/history/seasons" },
        ],
    },
    {
        label: "Statistiques",
        href: "/stats",
        icon: BarChart12,
        items: [
            { label: "Duel Coequipiers", href: "/stats/head-to-head" },
            { label: "Circuits", href: "/stats/circuits" },
            { label: "Pilotes", href: "/stats/drivers" },
            { label: "Comparaison", href: "/stats/compare" },
        ],
    },
    { divider: true },
    {
        label: "Encyclopedie",
        href: "/profile",
        icon: BookOpen01,
        items: [
            { label: "Pilotes", href: "/profile/driver" },
            { label: "Equipes", href: "/profile/team" },
            { label: "Circuits", href: "/profile/circuit" },
            { label: "Motoristes", href: "/profile/engine-supplier" },
        ],
    },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen">
            <SidebarNavigationSimple items={navItems} footerItems={[]} activeUrl={pathname} />
            <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
        </div>
    );
}
