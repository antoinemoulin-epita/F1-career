"use client";

import {
    Breadcrumbs as AriaBreadcrumbs,
    Breadcrumb as AriaBreadcrumb,
    Link as AriaLink,
} from "react-aria-components";
import { ChevronRight } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
    return (
        <AriaBreadcrumbs className={cx("flex items-center gap-1.5 overflow-x-auto text-sm", className)}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <AriaBreadcrumb key={index} className="flex items-center gap-1.5">
                        {index > 0 && <ChevronRight className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />}
                        {isLast || !item.href ? (
                            <span className="whitespace-nowrap font-semibold text-primary">{item.label}</span>
                        ) : (
                            <AriaLink
                                href={item.href}
                                className="whitespace-nowrap font-medium text-tertiary transition duration-100 ease-linear hover:text-secondary_hover"
                            >
                                {item.label}
                            </AriaLink>
                        )}
                    </AriaBreadcrumb>
                );
            })}
        </AriaBreadcrumbs>
    );
};
