"use client";

import { useState, useCallback } from "react";
import { cx } from "@/utils/cx";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StarRatingProps {
    value: number | null;
    onChange?: (value: number) => void;
    size?: "sm" | "md";
    isDisabled?: boolean;
    showValue?: boolean;
}

// ─── Star SVG parts ─────────────────────────────────────────────────────────

const STAR_PATH =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

function StarIcon({
    fill,
    sizeClass,
}: {
    fill: "full" | "half" | "empty";
    sizeClass: string;
}) {
    const id = `half-${Math.random().toString(36).slice(2, 9)}`;
    return (
        <svg
            viewBox="0 0 24 24"
            className={cx(sizeClass, "shrink-0")}
            aria-hidden="true"
        >
            {fill === "half" && (
                <defs>
                    <linearGradient id={id}>
                        <stop offset="50%" className="text-warning-primary" stopColor="currentColor" />
                        <stop offset="50%" className="text-quaternary" stopColor="currentColor" />
                    </linearGradient>
                </defs>
            )}
            <path
                d={STAR_PATH}
                fill={
                    fill === "full"
                        ? "currentColor"
                        : fill === "half"
                          ? `url(#${id})`
                          : "currentColor"
                }
                stroke="none"
                className={cx(
                    fill === "full" && "text-warning-primary",
                    fill === "empty" && "text-quaternary",
                )}
            />
        </svg>
    );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getFill(starIndex: number, value: number): "full" | "half" | "empty" {
    if (value >= starIndex + 1) return "full";
    if (value >= starIndex + 0.5) return "half";
    return "empty";
}

function valueFromClick(starIndex: number, isLeftHalf: boolean): number {
    return isLeftHalf ? starIndex + 0.5 : starIndex + 1;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function StarRating({
    value,
    onChange,
    size = "sm",
    isDisabled = false,
    showValue = false,
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const isInteractive = !!onChange && !isDisabled;
    const displayValue = hoverValue ?? value ?? 0;

    const sizeClass = size === "sm" ? "size-4" : "size-5";

    const handleClick = useCallback(
        (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
            if (!onChange) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const isLeftHalf = e.clientX - rect.left < rect.width / 2;
            onChange(valueFromClick(starIndex, isLeftHalf));
        },
        [onChange],
    );

    const handleMouseMove = useCallback(
        (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const isLeftHalf = e.clientX - rect.left < rect.width / 2;
            setHoverValue(valueFromClick(starIndex, isLeftHalf));
        },
        [],
    );

    const handleMouseLeave = useCallback(() => setHoverValue(null), []);

    if (!isInteractive) {
        return (
            <div className="flex items-center gap-0.5" aria-label={`Note : ${value ?? 0} sur 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon key={i} fill={getFill(i, displayValue)} sizeClass={sizeClass} />
                ))}
                {showValue && value != null && (
                    <span className="ml-1 text-xs font-medium text-tertiary">{value}</span>
                )}
            </div>
        );
    }

    return (
        <div
            className="flex items-center gap-0.5"
            role="radiogroup"
            aria-label="Note"
            onMouseLeave={handleMouseLeave}
        >
            {Array.from({ length: 5 }, (_, i) => (
                <button
                    key={i}
                    type="button"
                    className="cursor-pointer p-0 focus:outline-none"
                    onClick={(e) => handleClick(i, e)}
                    onMouseMove={(e) => handleMouseMove(i, e)}
                    aria-label={`${i + 1} etoile${i > 0 ? "s" : ""}`}
                >
                    <StarIcon fill={getFill(i, displayValue)} sizeClass={sizeClass} />
                </button>
            ))}
            {showValue && (
                <span className="ml-1 text-xs font-medium text-tertiary">
                    {hoverValue ?? value ?? "—"}
                </span>
            )}
        </div>
    );
}
