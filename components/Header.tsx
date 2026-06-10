"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useGameConfig, themeStyles } from "./GameConfigContext";
import { useLanguage, PastelTheme, GameLanguage, themeNames } from "./LanguageProvider";
import { Sun, Moon, Globe, Palette, Check, ChevronDown, Gamepad2, Settings } from "lucide-react";

export default function Header() {
    const {
        themeColor,
        setThemeColor,
        themeMode,
        setThemeMode,
        activeStyle,
        activeGameName,
    } = useGameConfig();

    const {
        gameLang,
        setGameLang,
    } = useLanguage();

    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const [showMobileSettings, setShowMobileSettings] = useState(false);

    const langMenuRef = useRef<HTMLDivElement>(null);
    const colorMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Cerrar menús al hacer click afuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setShowLangMenu(false);
            }
            if (colorMenuRef.current && !colorMenuRef.current.contains(event.target as Node)) {
                setShowColorMenu(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setShowMobileSettings(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const languages: { code: GameLanguage; name: string; flag: string; }[] = [
        { code: "es", name: "Español", flag: "🇪🇸" },
        { code: "de", name: "Deutsch", flag: "🇩🇪" },
        { code: "pl", name: "Polski", flag: "🇵🇱" },
        { code: "ru", name: "русский", flag: "🇷🇺" },
        { code: "pt", name: "Português", flag: "🇵🇹" },
        { code: "la", name: "Latina", flag: "🏛️" },
    ];

    const themes: PastelTheme[] = ["pink", "blue", "yellow", "green", "violet", "orange", "mint", "coral", "lavender", "gray"];

    const currentLangObj = languages.find((l) => l.code === gameLang) || languages[0];

    return (
        <header
            style={{
                backgroundColor: `${activeStyle.card}ee`, // Ligera transparencia glassmorphic
                borderColor: activeStyle.border,
                color: activeStyle.text,
            }}
            className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-500 px-4 py-3 sm:py-4 flex items-center justify-between"
        >
            {/* Logo y Enlace a la página principal */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <Link
                    href="/"
                    style={{ color: activeStyle.text }}
                    className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight transition-transform duration-300 hover:scale-105 active:scale-95 group shrink-0"
                >
                    <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" style={{ color: activeStyle.accent }} />
                    <span className={`font-extrabold ${activeGameName ? "hidden min-[380px]:inline" : "inline"}`}>Juegitos</span>
                </Link>

                {activeGameName && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold select-none min-w-0">
                        <span style={{ color: activeStyle.border }} className="font-light">|</span>
                        <span
                            style={{
                                color: activeStyle.accent,
                            }}
                            className="bg-opacity-10 px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-extrabold uppercase tracking-wide border border-current/20 whitespace-nowrap truncate max-w-[110px] sm:max-w-none"
                            title={activeGameName}
                        >
                            {activeGameName}
                        </span>
                    </div>
                )}
            </div>

            {/* Controles de Configuración del Header */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Selector de Color (Paleta Coqueta) - visible solo en desktop >= md */}
                <div className="relative hidden md:block" ref={colorMenuRef}>
                    <button
                        onClick={() => {
                            setShowColorMenu(!showColorMenu);
                            setShowLangMenu(false);
                        }}
                        style={{
                            borderColor: activeStyle.border,
                            backgroundColor: activeStyle.card,
                        }}
                        className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-xs sm:text-sm font-bold"
                        aria-label="Change color theme"
                    >
                        <span
                            style={{ backgroundColor: activeStyle.accent }}
                            className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-inner shrink-0"
                        />
                        <span className="hidden sm:inline capitalize">{themeNames[gameLang][themeColor]}</span>
                        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${showColorMenu ? "rotate-180" : ""}`} />
                    </button>

                    {/* Popover de paleta de colores */}
                    {showColorMenu && (
                        <div
                            style={{
                                backgroundColor: activeStyle.card,
                                borderColor: activeStyle.border,
                                color: activeStyle.text,
                            }}
                            className="absolute right-0 mt-2 p-3.5 rounded-2xl border shadow-xl w-48 sm:w-56 animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                            <div className="flex items-center gap-1.5 mb-2.5 px-1 text-xs font-bold uppercase tracking-wider opacity-60">
                                <Palette className="w-3.5 h-3.5" />
                                <span>{gameLang === "la" ? "Themata" : gameLang === "de" ? "Themes" : "Temas"}</span>
                            </div>

                            {/* Rejilla de botones circulares de colores */}
                            <div className="grid grid-cols-5 gap-2.5">
                                {themes.map((col) => {
                                    const colAccent = themeStyles[col][themeMode].accent;
                                    const isSelected = themeColor === col;
                                    return (
                                        <button
                                            key={col}
                                            onClick={() => {
                                                setThemeColor(col);
                                                setShowColorMenu(false);
                                            }}
                                            style={{ backgroundColor: colAccent }}
                                            title={themeNames[gameLang][col]}
                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/15 shadow-sm relative transition-all duration-300 hover:scale-115 hover:shadow-md active:scale-90 flex items-center justify-center cursor-pointer"
                                        >
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] font-black" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Selector de Idioma - visible solo en desktop >= md */}
                <div className="relative hidden md:block" ref={langMenuRef}>
                    <button
                        onClick={() => {
                            setShowLangMenu(!showLangMenu);
                            setShowColorMenu(false);
                        }}
                        style={{
                            borderColor: activeStyle.border,
                            backgroundColor: activeStyle.card,
                        }}
                        className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-xs sm:text-sm font-bold"
                    >
                        <Globe className="w-4 h-4 opacity-70" style={{ color: activeStyle.accent }} />
                        <span className="text-base leading-none">{currentLangObj.flag}</span>
                        <span className="hidden md:inline uppercase text-xs tracking-wider">{currentLangObj.code}</span>
                        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${showLangMenu ? "rotate-180" : ""}`} />
                    </button>

                    {/* Popover de selección de idioma */}
                    {showLangMenu && (
                        <div
                            style={{
                                backgroundColor: activeStyle.card,
                                borderColor: activeStyle.border,
                                color: activeStyle.text,
                            }}
                            className="absolute right-0 mt-2 rounded-2xl border shadow-xl overflow-hidden min-w-[150px] sm:min-w-[170px] animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                            <div className="flex flex-col py-1.5">
                                {languages.map((lang) => {
                                    const isSelected = gameLang === lang.code;
                                    return (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setGameLang(lang.code);
                                                setShowLangMenu(false);
                                            }}
                                            style={{
                                                backgroundColor: isSelected ? `${activeStyle.accent}15` : "transparent",
                                                color: isSelected ? activeStyle.accent : activeStyle.text,
                                            }}
                                            className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left w-full cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="text-lg leading-none">{lang.flag}</span>
                                                <span>{lang.name}</span>
                                            </span>
                                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Selector de Ajustes Móvil (Solo visible en < md) */}
                <div className="relative md:hidden" ref={mobileMenuRef}>
                    <button
                        onClick={() => {
                            setShowMobileSettings(!showMobileSettings);
                            setShowColorMenu(false);
                            setShowLangMenu(false);
                        }}
                        style={{
                            borderColor: activeStyle.border,
                            backgroundColor: activeStyle.card,
                            color: activeStyle.text,
                        }}
                        className="p-2.5 rounded-xl border shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                        aria-label="Toggle settings menu"
                    >
                        <Settings className={`w-4 h-4 transition-transform duration-500 ${showMobileSettings ? "rotate-90" : ""}`} style={{ color: activeStyle.accent }} />
                    </button>

                    {/* Popover unificado móvil */}
                    {showMobileSettings && (
                        <div
                            style={{
                                backgroundColor: activeStyle.card,
                                borderColor: activeStyle.border,
                                color: activeStyle.text,
                            }}
                            className="absolute right-0 mt-2 p-4 rounded-2xl border shadow-xl w-60 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-4 z-50"
                        >
                            {/* Sección de Temas */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-60">
                                    <Palette className="w-3.5 h-3.5" />
                                    <span>{gameLang === "la" ? "Themata" : gameLang === "de" ? "Themes" : "Temas"}</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {themes.map((col) => {
                                        const colAccent = themeStyles[col][themeMode].accent;
                                        const isSelected = themeColor === col;
                                        return (
                                            <button
                                                key={col}
                                                onClick={() => {
                                                    setThemeColor(col);
                                                    setShowMobileSettings(false);
                                                }}
                                                style={{ backgroundColor: colAccent }}
                                                title={themeNames[gameLang][col]}
                                                className="w-7.5 h-7.5 rounded-full border border-black/15 shadow-sm relative transition-all duration-300 hover:scale-115 flex items-center justify-center cursor-pointer"
                                            >
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] font-black" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <hr style={{ borderColor: `${activeStyle.border}50` }} className="my-0.5" />

                            {/* Sección de Idiomas */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-60">
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>{gameLang === "la" ? "Linguae" : gameLang === "de" ? "Sprachen" : "Idiomas"}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {languages.map((lang) => {
                                        const isSelected = gameLang === lang.code;
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setGameLang(lang.code);
                                                    setShowMobileSettings(false);
                                                }}
                                                style={{
                                                    backgroundColor: isSelected ? `${activeStyle.accent}15` : "transparent",
                                                    color: isSelected ? activeStyle.accent : activeStyle.text,
                                                    borderColor: isSelected ? `${activeStyle.accent}40` : activeStyle.border,
                                                }}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xxs font-extrabold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left cursor-pointer"
                                            >
                                                <span className="text-sm leading-none">{lang.flag}</span>
                                                <span className="truncate">{lang.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Selector Claro/Oscuro */}
                <button
                    onClick={() => {
                        const next = themeMode === "light" ? "dark" : "light";
                        setThemeMode(next);
                    }}
                    style={{
                        borderColor: activeStyle.border,
                        backgroundColor: activeStyle.card,
                        color: activeStyle.text,
                    }}
                    className="p-2 sm:p-2.5 rounded-xl border shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                    aria-label="Toggle theme mode"
                >
                    {themeMode === "light" ? (
                        <Moon className="w-4 h-4 sm:w-[17px] sm:h-[17px] transition-transform duration-500 rotate-0 hover:rotate-12" />
                    ) : (
                        <Sun className="w-4 h-4 sm:w-[17px] sm:h-[17px] transition-transform duration-500 rotate-0 hover:spin" style={{ color: activeStyle.accent }} />
                    )}
                </button>
            </div>
        </header>
    );
}
