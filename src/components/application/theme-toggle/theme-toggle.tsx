"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon01 } from "@untitledui/icons";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const isDark = resolvedTheme === "dark";

    if (!mounted) {
        return (
            <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary">
                <div className="size-5" />
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary transition duration-100 ease-linear hover:bg-primary_hover hover:text-secondary_hover"
        >
            {isDark ? <Sun className="size-5 text-fg-quaternary" /> : <Moon01 className="size-5 text-fg-quaternary" />}
            {isDark ? "Mode clair" : "Mode sombre"}
        </button>
    );
}
