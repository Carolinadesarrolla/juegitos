"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PastelTheme, ThemeMode } from "./LanguageProvider";

export interface ThemeConfig {
    bg: string;
    card: string;
    text: string;
    textMuted: string;
    border: string;
    keyBg: string;
    keyHover: string;
    accent: string;
    btnText: string;
}

export const themeStyles: Record<PastelTheme, Record<ThemeMode, ThemeConfig>> = {
    pink: {
        light: {
            bg: "#FFF0F5",
            card: "#FFFFFF",
            text: "#4A1525",
            textMuted: "#8A5A6C",
            border: "#FFC0CB",
            keyBg: "#FFE4E1",
            keyHover: "#FFB6C1",
            accent: "#FF69B4",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#2B161D",
            card: "#3D242E",
            text: "#FFF0F5",
            textMuted: "#C2A3B0",
            border: "#5C3A46",
            keyBg: "#4D2D3B",
            keyHover: "#704155",
            accent: "#FF8DA1",
            btnText: "#1F0F14",
        },
    },
    blue: {
        light: {
            bg: "#E6F2FF",
            card: "#FFFFFF",
            text: "#0A2540",
            textMuted: "#4A6B82",
            border: "#B3D1FF",
            keyBg: "#D1E6FF",
            keyHover: "#99C2FF",
            accent: "#3385FF",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#101D2D",
            card: "#182D44",
            text: "#E6F2FF",
            textMuted: "#99B3CC",
            border: "#2C4B70",
            keyBg: "#1F3854",
            keyHover: "#335C8A",
            accent: "#66A3FF",
            btnText: "#08101A",
        },
    },
    yellow: {
        light: {
            bg: "#FFFDF0",
            card: "#FFFFFF",
            text: "#4A3E00",
            textMuted: "#8C7B3E",
            border: "#FFEFA6",
            keyBg: "#FFF9D4",
            keyHover: "#FFE875",
            accent: "#E6C300",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#262312",
            card: "#3B371E",
            text: "#FFFDF0",
            textMuted: "#C9C097",
            border: "#57512D",
            keyBg: "#474224",
            keyHover: "#6B6336",
            accent: "#FAD02C",
            btnText: "#18160B",
        },
    },
    green: {
        light: {
            bg: "#EAF7EE",
            card: "#FFFFFF",
            text: "#0E3A1A",
            textMuted: "#4E7C59",
            border: "#C2ECCF",
            keyBg: "#D5F3DF",
            keyHover: "#ABE5BE",
            accent: "#2E7D46",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#122617",
            card: "#1E3B26",
            text: "#EAF7EE",
            textMuted: "#A3CDB0",
            border: "#2F5D3D",
            keyBg: "#24492F",
            keyHover: "#376E47",
            accent: "#4CAF50",
            btnText: "#09130C",
        },
    },
    violet: {
        light: {
            bg: "#F5F0FF",
            card: "#FFFFFF",
            text: "#2A0E4E",
            textMuted: "#6B508C",
            border: "#E1D4FF",
            keyBg: "#EDE0FF",
            keyHover: "#D6BFFF",
            accent: "#8A2BE2",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#1E122C",
            card: "#2F1E44",
            text: "#F5F0FF",
            textMuted: "#B8A3CD",
            border: "#4A3366",
            keyBg: "#3A2454",
            keyHover: "#56367C",
            accent: "#B380FF",
            btnText: "#0F0916",
        },
    },
    orange: {
        light: {
            bg: "#FFF5EE",
            card: "#FFFFFF",
            text: "#4A270B",
            textMuted: "#8C5831",
            border: "#FFEFA6",
            keyBg: "#FFEBCD",
            keyHover: "#FFD7A8",
            accent: "#FF8C00",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#2E1E12",
            card: "#422E1F",
            text: "#FFF5EE",
            textMuted: "#D1B59C",
            border: "#61442F",
            keyBg: "#4F3725",
            keyHover: "#78543B",
            accent: "#FFA500",
            btnText: "#1F1106",
        },
    },
    mint: {
        light: {
            bg: "#F0FFF0",
            card: "#FFFFFF",
            text: "#004020",
            textMuted: "#3B7E58",
            border: "#C1F0C1",
            keyBg: "#D4F8D4",
            keyHover: "#B0EBA0",
            accent: "#3CB371",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#112419",
            card: "#1B3626",
            text: "#F0FFF0",
            textMuted: "#9ECBB0",
            border: "#2B523B",
            keyBg: "#203E2D",
            keyHover: "#326146",
            accent: "#00FA9A",
            btnText: "#0A1B12",
        },
    },
    coral: {
        light: {
            bg: "#FFF5F5",
            card: "#FFFFFF",
            text: "#4A1B1B",
            textMuted: "#8C4F4F",
            border: "#FFD6D6",
            keyBg: "#FFEBEB",
            keyHover: "#FFC2C2",
            accent: "#FF7F50",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#2D1818",
            card: "#402424",
            text: "#FFF5F5",
            textMuted: "#D19E9E",
            border: "#613535",
            keyBg: "#4F2A2A",
            keyHover: "#784242",
            accent: "#FF6B6B",
            btnText: "#200E0E",
        },
    },
    lavender: {
        light: {
            bg: "#FAF6FF",
            card: "#FFFFFF",
            text: "#2C144A",
            textMuted: "#6D528F",
            border: "#E8D9FF",
            keyBg: "#F0E5FF",
            keyHover: "#DDBFFF",
            accent: "#BA55D3",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#1F142D",
            card: "#312144",
            text: "#FAF6FF",
            textMuted: "#C5B4D6",
            border: "#4E356B",
            keyBg: "#3E2A54",
            keyHover: "#5E427F",
            accent: "#DA70D6",
            btnText: "#140A20",
        },
    },
    gray: {
        light: {
            bg: "#F5F5F5",
            card: "#FFFFFF",
            text: "#333333",
            textMuted: "#666666",
            border: "#E0E0E0",
            keyBg: "#ECECEC",
            keyHover: "#D9D9D9",
            accent: "#808080",
            btnText: "#FFFFFF",
        },
        dark: {
            bg: "#1F1F1F",
            card: "#2D2D2D",
            text: "#F5F5F5",
            textMuted: "#B3B3B3",
            border: "#4A4A4A",
            keyBg: "#3E3E3E",
            keyHover: "#555555",
            accent: "#A0A0A0",
            btnText: "#1F1F1F",
        },
    },
};

export interface GameConfigContextType {
    themeColor: PastelTheme;
    setThemeColor: (color: PastelTheme) => void;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    activeStyle: ThemeConfig;
    activeGameName: string | null;
    setActiveGameName: (name: string | null) => void;
}

const GameConfigContext = createContext<GameConfigContextType | undefined>(undefined);

export function GameConfigProvider({ children }: { children: React.ReactNode }) {
    const [themeColor, setThemeColorState] = useState<PastelTheme>("pink");
    const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
    const [activeGameName, setActiveGameName] = useState<string | null>(null);

    // Evitar problemas de hidratación en SSR cargando localStorage en useEffect
    useEffect(() => {
        const savedColor = localStorage.getItem("juegitos-theme-color") as PastelTheme;
        if (savedColor && themeStyles[savedColor]) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setThemeColorState(savedColor);
        }
        const savedMode = localStorage.getItem("juegitos-theme-mode") as ThemeMode;
        if (savedMode === "light" || savedMode === "dark") {
            setThemeModeState(savedMode);
        }
    }, []);

    const setThemeColor = (color: PastelTheme) => {
        setThemeColorState(color);
        localStorage.setItem("juegitos-theme-color", color);
    };

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        localStorage.setItem("juegitos-theme-mode", mode);
    };

    const activeStyle = themeStyles[themeColor][themeMode];

    return (
        <GameConfigContext.Provider
            value={{
                themeColor,
                setThemeColor,
                themeMode,
                setThemeMode,
                activeStyle,
                activeGameName,
                setActiveGameName,
            }}
        >
            {children}
        </GameConfigContext.Provider>
    );
}

export function useGameConfig() {
    const context = useContext(GameConfigContext);
    if (!context) {
        throw new Error("useGameConfig must be used within a GameConfigProvider");
    }
    return context;
}
