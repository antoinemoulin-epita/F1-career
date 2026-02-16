"use client";

import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

export const UntitledLogo = (props: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div {...props} className={cx("flex h-8 items-center gap-1.5", props.className)}>
            <span className="text-xl font-extrabold tracking-tight text-brand-secondary">F1</span>
            <span className="text-xl font-semibold tracking-tight text-primary">Manager</span>
        </div>
    );
};
