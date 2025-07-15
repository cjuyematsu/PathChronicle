"use client";
import { useState, useEffect } from "react";
import { Plane, Train, Building, Bus, Ship } from "lucide-react";

// Define the props interface
interface LoadingProps {
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "spinner" | "dots" | "pulse" | "bars" | "travel";
    color?: "blue" | "gray" | "green" | "purple" | "orange";
    text?: string;
    className?: string;
    layout?: "vertical" | "horizontal";
}

const Loading = ({
    size = "md",
    variant = "spinner",
    color = "blue",
    text,
    className = "",
    layout = "vertical",
}: LoadingProps) => {
    const [currentIcon, setCurrentIcon] = useState(0);

    // For travel variant - cycling through transport icons
    const travelIcons = [Plane, Train, Building, Bus, Ship];

    useEffect(() => {
        if (variant === "travel") {
            const interval = setInterval(() => {
                setCurrentIcon((prev) => (prev + 1) % travelIcons.length);
            }, 800);
            return () => clearInterval(interval);
        }
    }, [variant, travelIcons.length]);

    // Size classes
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
    };

    // Color classes
    const colorClasses = {
        blue: "text-blue-500",
        gray: "text-gray-500",
        green: "text-green-500",
        purple: "text-purple-500",
        orange: "text-orange-500",
    };

    // Text size classes
    const textSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
    };

    // Spinner variant
    const SpinnerLoader = () => (
        <div
            className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}
        />
    );

    // Dots variant
    const DotsLoader = () => (
        <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={`rounded-full ${colorClasses[color]} ${
                        size === "sm"
                            ? "w-1.5 h-1.5"
                            : size === "md"
                            ? "w-2 h-2"
                            : size === "lg"
                            ? "w-3 h-3"
                            : "w-4 h-4"
                    }`}
                    style={{
                        animation: `bounce 1.4s ease-in-out ${
                            i * 0.16
                        }s infinite both`,
                        backgroundColor: "currentColor",
                    }}
                />
            ))}
        </div>
    );

    // Pulse variant
    const PulseLoader = () => (
        <div
            className={`rounded-full ${colorClasses[color]} ${sizeClasses[size]} animate-pulse`}
            style={{ backgroundColor: "currentColor" }}
        />
    );

    // Bars variant
    const BarsLoader = () => (
        <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className={`${colorClasses[color]} ${
                        size === "sm"
                            ? "w-1 h-4"
                            : size === "md"
                            ? "w-1.5 h-6"
                            : size === "lg"
                            ? "w-2 h-8"
                            : "w-3 h-12"
                    }`}
                    style={{
                        animation: `stretchdelay 1.2s ${
                            i * 0.1
                        }s infinite ease-in-out`,
                        backgroundColor: "currentColor",
                    }}
                />
            ))}
        </div>
    );

    // Travel variant - cycling transport icons
    const TravelLoader = () => {
        const CurrentIcon = travelIcons[currentIcon];
        return (
            <div className="relative">
                <CurrentIcon
                    className={`${sizeClasses[size]} ${colorClasses[color]} transition-all duration-300 transform`}
                    style={{
                        animation: "fadeInOut 0.8s ease-in-out infinite",
                    }}
                />
            </div>
        );
    };

    // Render the appropriate loader
    const renderLoader = () => {
        switch (variant) {
            case "dots":
                return <DotsLoader />;
            case "pulse":
                return <PulseLoader />;
            case "bars":
                return <BarsLoader />;
            case "travel":
                return <TravelLoader />;
            default:
                return <SpinnerLoader />;
        }
    };

    return (
        <div
            className={`flex items-center justify-center ${
                layout === "horizontal" ? "flex-row gap-2" : "flex-col gap-3"
            } ${className}`}
        >
            {text && layout === "horizontal" && (
                <div
                    className={`${textSizeClasses[size]} text-gray-600 font-medium`}
                >
                    {text}
                </div>
            )}
            <div className="flex items-center justify-center">
                {renderLoader()}
            </div>
            {text && layout === "vertical" && (
                <div
                    className={`${textSizeClasses[size]} text-gray-600 font-medium animate-pulse`}
                >
                    {text}
                </div>
            )}

            <style jsx>{`
                @keyframes bounce {
                    0%,
                    80%,
                    100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1);
                    }
                }

                @keyframes stretchdelay {
                    0%,
                    40%,
                    100% {
                        transform: scaleY(0.4);
                    }
                    20% {
                        transform: scaleY(1);
                    }
                }

                @keyframes fadeInOut {
                    0%,
                    100% {
                        opacity: 0.4;
                        transform: scale(0.8);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default Loading;
