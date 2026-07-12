"use client";

import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, RefreshCw, Share2, BarChart2, X, Search } from "lucide-react";
import { useGameConfig } from "@/components/GameConfigContext";
import { useLanguage } from "@/components/LanguageProvider";
import countriesData from "@/public/paises.json";

interface Country {
    id: string;
    nombre: string;
    continente: string;
    superficie: number;
    rutaBandera: string;
    fronteras: string[];
    latitud: number;
    longitud: number;
    translations?: {
        de?: string;
        pl?: string;
        ru?: string;
        pt?: string;
        uk?: string;
    };
}

interface ModeStats {
    played: number;
    won: number;
    currentStreak: number;
    maxStreak: number;
    guessesDistribution: number[];
    totalGuesses: number;
}

interface GameStats {
    normal: ModeStats;
    easy: ModeStats;
}

const createDefaultModeStats = (): ModeStats => ({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessesDistribution: [0, 0, 0, 0, 0, 0, 0],
    totalGuesses: 0,
});

const createDefaultStats = (): GameStats => ({
    normal: createDefaultModeStats(),
    easy: createDefaultModeStats(),
});

// Canvas Confetti
const runConfetti = (
    canvas: HTMLCanvasElement,
    confettiAnimationRef: React.MutableRefObject<number | null>
) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Array<{
        x: number;
        y: number;
        size: number;
        color: string;
        speedX: number;
        speedY: number;
        rotation: number;
        rotationSpeed: number;
    }> = [];

    const colors = ["#FFB6C1", "#FFD700", "#98FB98", "#AFEEEE", "#D8BFD8", "#FFDAB9"];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.random() * 4 - 2,
            speedY: Math.random() * 5 + 3,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2,
        });
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeParticles = 0;

        particles.forEach((p) => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            if (p.y < canvas.height) {
                activeParticles++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }
        });

        if (activeParticles > 0) {
            confettiAnimationRef.current = requestAnimationFrame(animate);
        }
    };

    animate();
};

const normalizeString = (str: string): string => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};

const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
        Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    let brng = Math.atan2(y, x) * (180 / Math.PI);
    brng = (brng + 360) % 360; // Normalize to 0-360

    if (brng >= 337.5 || brng < 22.5) return "⬆️";
    if (brng >= 22.5 && brng < 67.5) return "↗️";
    if (brng >= 67.5 && brng < 112.5) return "➡️";
    if (brng >= 112.5 && brng < 157.5) return "↘️";
    if (brng >= 157.5 && brng < 202.5) return "⬇️";
    if (brng >= 202.5 && brng < 247.5) return "↙️";
    if (brng >= 247.5 && brng < 292.5) return "⬅️";
    if (brng >= 292.5 && brng < 337.5) return "↖️";
    return "📍";
};

export default function BanderadlePage() {
    const { activeStyle, setActiveGameName, themeMode } = useGameConfig();
    const { t: fullTranslations, gameLang } = useLanguage();
    const t = fullTranslations.banderadle;

    const getCountryName = (c: Country) => {
        if (gameLang !== "es" && gameLang !== "la" && c.translations && c.translations[gameLang as keyof typeof c.translations]) {
            return c.translations[gameLang as keyof typeof c.translations] as string;
        }
        return c.nombre;
    };

    const getContinentName = (continent: string) => {
        return t.continentNames[continent as keyof typeof t.continentNames] || continent;
    };

    // Game state
    const [mounted, setMounted] = useState(false);
    const [gameMode, setGameMode] = useState<"normal" | "easy">("normal");
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | "none">("none");
    const [targetCountry, setTargetCountry] = useState<Country | null>(null);
    const [guesses, setGuesses] = useState<Country[]>([]);
    const [currentGuessText, setCurrentGuessText] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
    const [revealedMosaicPieces, setRevealedMosaicPieces] = useState<number[]>([]);
    const [shakeRowIndex, setShakeRowIndex] = useState<number | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Modals & Stats
    const [showHelp, setShowHelp] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState<GameStats | null>(null);
    const [statsTab, setStatsTab] = useState<"normal" | "easy" | "global">("global");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const confettiAnimationRef = useRef<number | null>(null);
    const autocompleteContainerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const maxAttempts = 7;

    // Set active game name in the header
    useEffect(() => {
        setActiveGameName(gameMode === "easy" ? "Banderadle" : (gameLang === "de" ? "Ländersuche" : gameLang === "pl" ? "Wyszukiwacz krajów" : gameLang === "ru" ? "Поиск стран" : gameLang === "pt" ? "Busca-países" : gameLang === "la" ? "Investigator Patriarum" : "Buscapaíses"));
        return () => setActiveGameName(null);
    }, [setActiveGameName, gameMode, gameLang]);

    // Load stats and start initial game
    useEffect(() => {
        const savedStatsStr = localStorage.getItem("banderadle-game-stats");
        let loadedStats = createDefaultStats();
        if (savedStatsStr) {
            try {
                loadedStats = JSON.parse(savedStatsStr);
            } catch (e) {
                console.error("Error parsing stats", e);
            }
        }

        const countries = countriesData as Country[];
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];

        const timer = setTimeout(() => {
            setStats(loadedStats);
            setTargetCountry(randomCountry);
            setMounted(true);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    // Close autocomplete on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (autocompleteContainerRef.current && !autocompleteContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Inline filtered suggestions computed during render
    const filteredSuggestions = currentGuessText.trim() && showSuggestions
        ? (countriesData as Country[]).filter(c => {
            const matchesSpanish = normalizeString(c.nombre).includes(normalizeString(currentGuessText));
            const translatedName = gameLang !== "es" && gameLang !== "la" ? c.translations?.[gameLang as keyof typeof c.translations] : undefined;
            const matchesTranslated = translatedName ? normalizeString(translatedName).includes(normalizeString(currentGuessText)) : false;
            return (matchesSpanish || matchesTranslated) && !guesses.some(g => g.id === c.id);
        }).slice(0, 5)
        : [];

    // Handle suggestion keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (filteredSuggestions.length > 0 && selectedSuggestionIndex >= 0 && selectedSuggestionIndex < filteredSuggestions.length) {
                selectCountry(filteredSuggestions[selectedSuggestionIndex]);
            } else {
                handleSubmitGuess();
            }
        } else if (filteredSuggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedSuggestionIndex(prev => (prev + 1) % filteredSuggestions.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedSuggestionIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
            } else if (e.key === "Escape") {
                setShowSuggestions(false);
            }
        }
    };

    const selectCountry = (country: Country) => {
        setCurrentGuessText(getCountryName(country));
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const startNewGame = (mode: "normal" | "easy" = gameMode) => {
        if (mode !== gameMode) {
            setSlideDirection(mode === "easy" ? "left" : "right");
        } else {
            setSlideDirection("none");
        }
        setGameMode(mode);

        const countries = countriesData as Country[];
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        setTargetCountry(randomCountry);

        setGuesses([]);
        setCurrentGuessText("");
        setShowSuggestions(false);
        setGameStatus("playing");
        setRevealedMosaicPieces([]);
        setShowResultModal(false);

        // Cancel confetti
        if (confettiAnimationRef.current) {
            cancelAnimationFrame(confettiAnimationRef.current);
            confettiAnimationRef.current = null;
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx && canvasRef.current) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    };

    const triggerConfetti = () => {
        if (canvasRef.current) {
            runConfetti(canvasRef.current, confettiAnimationRef);
        }
    };

    const triggerShake = () => {
        setShakeRowIndex(guesses.length);
        setTimeout(() => setShakeRowIndex(null), 500);
    };

    const recordStats = (status: "won" | "lost", finalGuesses: Country[]) => {
        setStats((prevStats) => {
            const currentStats = prevStats ? { ...prevStats } : createDefaultStats();
            const mode = gameMode;
            const mStats = { ...currentStats[mode] };

            mStats.played += 1;
            mStats.totalGuesses += finalGuesses.length;

            if (status === "won") {
                mStats.won += 1;
                mStats.currentStreak += 1;
                if (mStats.currentStreak > mStats.maxStreak) {
                    mStats.maxStreak = mStats.currentStreak;
                }
                const winIndex = finalGuesses.length - 1;
                if (winIndex >= 0 && winIndex < 7) {
                    const distribution = [...mStats.guessesDistribution];
                    distribution[winIndex] += 1;
                    mStats.guessesDistribution = distribution;
                }
            } else {
                mStats.currentStreak = 0;
            }

            currentStats[mode] = mStats;
            localStorage.setItem("banderadle-game-stats", JSON.stringify(currentStats));
            return currentStats;
        });
    };

    const handleSubmitGuess = () => {
        if (gameStatus !== "playing" || !targetCountry) return;

        const guessName = currentGuessText.trim();
        const countries = countriesData as Country[];
        const matchedCountry = countries.find(c => {
            const matchesSpanish = normalizeString(c.nombre) === normalizeString(guessName);
            const translatedName = gameLang !== "es" && gameLang !== "la" ? c.translations?.[gameLang as keyof typeof c.translations] : undefined;
            const matchesTranslated = translatedName ? normalizeString(translatedName) === normalizeString(guessName) : false;
            return matchesSpanish || matchesTranslated;
        });

        if (!matchedCountry) {
            // Shake input to notify invalid
            triggerShake();
            return;
        }

        const nextGuesses = [...guesses, matchedCountry];
        setGuesses(nextGuesses);
        setCurrentGuessText("");
        setShowSuggestions(false);

        if (matchedCountry.id === targetCountry.id) {
            // Won!
            setGameStatus("won");
            // Reveal entire flag
            setRevealedMosaicPieces([0, 1, 2, 3, 4, 5]);
            recordStats("won", nextGuesses);
            setTimeout(() => {
                setShowResultModal(true);
                triggerConfetti();
            }, 1000);
        } else {
            // Wrong guess. Reveal a piece in easy mode.
            if (gameMode === "easy") {
                const remainingIndices = [0, 1, 2, 3, 4, 5].filter(idx => !revealedMosaicPieces.includes(idx));
                if (remainingIndices.length > 0) {
                    const randomPieceIdx = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
                    setRevealedMosaicPieces(prev => [...prev, randomPieceIdx]);
                }
            }

            if (nextGuesses.length >= maxAttempts) {
                // Lost!
                setGameStatus("lost");
                // Reveal entire flag
                setRevealedMosaicPieces([0, 1, 2, 3, 4, 5]);
                recordStats("lost", nextGuesses);
                setTimeout(() => {
                    setShowResultModal(true);
                }, 1000);
            }
        }
    };

    const isFronterizo = (guess: Country, target: Country) => {
        return target.fronteras.includes(guess.id) || guess.fronteras.includes(target.id);
    };

    // Compartir resultado
    const handleShareResult = () => {
        if (!targetCountry) return;
        const modeLabel = gameMode === "easy" ? t.statsModeEasy : t.statsModeNormal;
        let text = `Banderadle (${modeLabel}) ${guesses.length}/${maxAttempts}\n\n`;

        guesses.forEach((guess) => {
            let rowClues = "";

            // Continente
            if (guess.continente === targetCountry.continente) rowClues += "🟢";
            else rowClues += "🔴";

            // Fronterizo
            if (guess.id === targetCountry.id) rowClues += "🟢";
            else if (isFronterizo(guess, targetCountry)) rowClues += "🟡";
            else rowClues += "🔴";

            // Superficie
            if (guess.superficie === targetCountry.superficie) rowClues += "🟢";
            else if (targetCountry.superficie > guess.superficie) rowClues += "⬆️";
            else rowClues += "⬇️";

            // Distancia
            const dist = calculateDistance(guess.latitud, guess.longitud, targetCountry.latitud, targetCountry.longitud);
            const bear = calculateBearing(guess.latitud, guess.longitud, targetCountry.latitud, targetCountry.longitud);
            if (dist === 0) {
                rowClues += "🟢";
            } else {
                rowClues += `${bear} (${new Intl.NumberFormat("es-ES").format(dist)} km)`;
            }

            rowClues += ` 🗺️ ${getCountryName(guess)}\n`;
            text += rowClues;
        });

        text += `\nJuega aquí: ${window.location.href}`;

        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleResetStats = () => {
        if (window.confirm(t.statsResetConfirm)) {
            const def = createDefaultStats();
            setStats(def);
            localStorage.setItem("banderadle-game-stats", JSON.stringify(def));
        }
    };

    const getActiveStats = (): ModeStats => {
        if (!stats) return createDefaultModeStats();
        if (statsTab === "normal") return stats.normal;
        if (statsTab === "easy") return stats.easy;

        return {
            played: stats.normal.played + stats.easy.played,
            won: stats.normal.won + stats.easy.won,
            currentStreak: Math.max(stats.normal.currentStreak, stats.easy.currentStreak),
            maxStreak: Math.max(stats.normal.maxStreak, stats.easy.maxStreak),
            guessesDistribution: stats.normal.guessesDistribution.map((v, i) => v + (stats.easy.guessesDistribution[i] || 0)),
            totalGuesses: stats.normal.totalGuesses + stats.easy.totalGuesses,
        };
    };

    const activeStats = getActiveStats();
    const winRate = activeStats.played > 0 ? Math.round((activeStats.won / activeStats.played) * 100) : 0;

    const getPlaceholder = () => {
        if (!isMobile) return t.placeholderGuess;
        if (gameLang === "es" || gameLang === "pt") return "País...";
        if (gameLang === "de") return "Land...";
        if (gameLang === "pl") return "Kraj...";
        if (gameLang === "ru") return "Страна...";
        if (gameLang === "la") return "Patria...";
        return "País...";
    };

    if (!mounted || !targetCountry) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-emerald-500" />
            </div>
        );
    }

    const slideClass = slideDirection === "left" ? "animate-slide-left" : slideDirection === "right" ? "animate-slide-right" : "animate-mode-change";

    // Aspect ratio & layout sizing of the target flag
    const flagAspectClass = "aspect-[3/2] w-64 sm:w-80";

    const cols = 3;
    const rows = 2;

    return (
        <div
            style={{
                backgroundColor: activeStyle.bg,
                color: activeStyle.text,
            }}
            className="min-h-[calc(100vh-65px)] pt-6 xl:pt-10 px-4 sm:px-6 pb-8 transition-colors duration-500 relative flex flex-col items-center justify-between"
        >
            {/* Confetti Canvas */}
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

            {/* Header titles */}
            <header className={`w-full max-w-xl flex flex-col items-center mb-4 mt-2 text-center ${slideClass}`} key={`header-${gameMode}-${targetCountry.id}`}>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight select-none">
                    {gameMode === "easy" ? t.titleEasy : t.titleNormal}
                </h1>
                <p style={{ color: activeStyle.textMuted }} className="text-sm sm:text-base font-medium max-w-lg mt-2 mx-auto leading-relaxed px-2">
                    {gameMode === "easy" ? t.subtitleEasy : t.subtitleNormal}
                </p>
            </header>

            {/* Corner menus (Absolute on Desktop, flow on Mobile) */}
            <div className="w-full max-w-xl xl:max-w-5xl flex flex-col items-center gap-4 mt-2 mb-4 xl:contents">
                {/* Select Mode */}
                <div className="xl:absolute xl:top-6 xl:left-6 z-40 w-full xl:w-auto flex flex-col items-center xl:items-start gap-2" key="mode-selector">
                    {/* Segmented control for mobile (< xl) */}
                    <div style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }} className="flex xl:hidden p-1 rounded-xl border w-full max-w-[280px] select-none">
                        <button
                            onClick={() => startNewGame("normal")}
                            style={{
                                backgroundColor: gameMode === "normal" ? activeStyle.accent : "transparent",
                                color: gameMode === "normal" ? activeStyle.btnText : activeStyle.text,
                            }}
                            className="flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer"
                        >
                            {t.modeLabelNormal}
                        </button>
                        <button
                            onClick={() => startNewGame("easy")}
                            style={{
                                backgroundColor: gameMode === "easy" ? activeStyle.accent : "transparent",
                                color: gameMode === "easy" ? activeStyle.btnText : activeStyle.text,
                            }}
                            className="flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer"
                        >
                            {t.modeLabelEasy}
                        </button>
                    </div>

                    {/* Classic buttons for desktop (>= xl) */}
                    <div className="hidden xl:flex xl:flex-col gap-2 w-full">
                        <button
                            onClick={() => startNewGame("normal")}
                            style={{
                                backgroundColor: gameMode === "normal" ? activeStyle.accent : activeStyle.card,
                                color: gameMode === "normal" ? activeStyle.btnText : activeStyle.text,
                                borderColor: activeStyle.border,
                            }}
                            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold shadow-sm transition-all duration-300 hover:scale-102 active:scale-98 text-center xl:text-left ${gameMode === "normal" ? "shadow-md" : "hover:bg-opacity-90 cursor-pointer"
                                }`}
                        >
                            {t.modeLabelNormal}
                        </button>
                        <button
                            onClick={() => startNewGame("easy")}
                            style={{
                                backgroundColor: gameMode === "easy" ? activeStyle.accent : activeStyle.card,
                                color: gameMode === "easy" ? activeStyle.btnText : activeStyle.text,
                                borderColor: activeStyle.border,
                            }}
                            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold shadow-sm transition-all duration-300 hover:scale-102 active:scale-98 text-center xl:text-left ${gameMode === "easy" ? "shadow-md" : "hover:bg-opacity-90 cursor-pointer"
                                }`}
                        >
                            {t.modeLabelEasy}
                        </button>
                    </div>
                </div>

                {/* Info buttons */}
                <div className="xl:absolute xl:top-6 xl:right-6 flex flex-col items-center xl:items-end gap-2.5 z-40 w-full xl:w-auto">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHelp(true)}
                            style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                            className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl border shadow-sm text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                            title={t.howToPlay}
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.howToPlay}</span>
                        </button>
                        <button
                            onClick={() => setShowStats(true)}
                            style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                            className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl border shadow-sm text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                            title={t.stats}
                        >
                            <BarChart2 className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.stats}</span>
                        </button>
                        <button
                            onClick={() => startNewGame()}
                            style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                            className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl border shadow-sm text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                            title={t.reset}
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.reset}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Easy mode flag mosaic view */}
            {gameMode === "easy" && (
                <div className={`flex items-center justify-center my-4 ${slideClass}`} key={`flagview-${targetCountry.id}`}>
                    <div
                        className={`relative rounded-2xl overflow-hidden shadow-lg border border-black/10 dark:border-white/10 bg-slate-200 dark:bg-slate-900 ${flagAspectClass}`}
                    >
                        {/* The secret flag */}
                        <img
                            src={`/${targetCountry.rutaBandera}`}
                            alt="Secret Flag"
                            className="w-full h-full object-cover select-none pointer-events-none"
                        />

                        {/* Covered grid mosaic overlay */}
                        <div
                            className="absolute -inset-[5px] grid gap-0"
                            style={{
                                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
                            }}
                        >
                            {Array.from({ length: 6 }).map((_, index) => {
                                const isRevealed = revealedMosaicPieces.includes(index);
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-center font-bold text-lg select-none border border-slate-300 dark:border-slate-800 transition-all duration-700 ease-in-out transform ${isRevealed
                                            ? "opacity-0 scale-95 pointer-events-none"
                                            : "bg-slate-300 dark:bg-slate-800 text-slate-500/80 dark:text-slate-400/80 opacity-100 scale-100"
                                            }`}
                                    >
                                        {index + 1}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Autocomplete Input Submission */}
            {gameStatus === "playing" && (
                <div className="w-full max-w-lg flex flex-col gap-3 z-30 my-3">
                    {gameLang === "uk" && (
                        <div className="p-3.5 rounded-2xl border text-center text-xs font-bold bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 leading-relaxed shadow-xs">
                            ⚠️ Через зовнішні обмеження пошук країн можливий лише іспанською або англійською мовами.
                        </div>
                    )}
                    <div
                        ref={autocompleteContainerRef}
                        className="relative w-full"
                    >
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 opacity-50" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={currentGuessText}
                                onChange={(e) => {
                                    setCurrentGuessText(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={handleKeyDown}
                                placeholder={getPlaceholder()}
                                className={`w-full pl-10 pr-24 py-3 rounded-2xl border text-sm sm:text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${shakeRowIndex === guesses.length ? "animate-shake" : ""
                                    }`}
                                style={{
                                    backgroundColor: activeStyle.card,
                                    color: activeStyle.text,
                                    borderColor: activeStyle.border,
                                }}
                            />
                            {/* Submit button inside input */}
                            <button
                                onClick={handleSubmitGuess}
                                style={{
                                    backgroundColor: activeStyle.accent,
                                    color: activeStyle.btnText,
                                }}
                                className="absolute right-2 top-1.5 bottom-1.5 px-4 rounded-xl text-xs sm:text-sm font-bold hover:scale-103 active:scale-97 shadow-sm transition-all cursor-pointer"
                            >
                                {t.btnSend}
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        {filteredSuggestions.length > 0 && (
                            <div
                                style={{
                                    backgroundColor: activeStyle.card,
                                    borderColor: activeStyle.border,
                                }}
                                className="absolute z-50 w-full mt-1.5 rounded-2xl border shadow-xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200"
                            >
                                <ul className="py-1">
                                    {filteredSuggestions.map((country, idx) => {
                                        const isSelected = idx === selectedSuggestionIndex;
                                        return (
                                            <li key={country.id}>
                                                <button
                                                    onClick={() => selectCountry(country)}
                                                    style={{
                                                        backgroundColor: isSelected ? `${activeStyle.accent}15` : "transparent",
                                                    }}
                                                    className="w-full text-left px-4.5 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    {/* Flag and name */}
                                                    <img
                                                        src={`/${country.rutaBandera}`}
                                                        alt={getCountryName(country)}
                                                        className="w-6 h-4 object-cover rounded shadow-xs"
                                                    />
                                                    <span className="font-extrabold">{getCountryName(country)}</span>
                                                    <span style={{ color: activeStyle.textMuted }} className="text-xxs uppercase tracking-wider font-semibold ml-auto">{getContinentName(country.continente)}</span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Board Grid: horizontal scrollable table for columns */}
            <main className="w-full max-w-5xl my-4 flex-1 flex flex-col items-center">
                {guesses.length > 0 ? (
                    <div className="w-full overflow-x-auto rounded-3xl border border-black/10 dark:border-white/10 shadow-sm scrollbar-thin max-w-5xl">
                        <table className="w-full min-w-[700px] border-separate border-spacing-y-2 border-spacing-x-0 text-left text-xs sm:text-sm px-2">
                            <thead>
                                <tr className="font-bold tracking-wider uppercase text-xxs sm:text-xs select-none">
                                    <th
                                        style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                                        className="p-3 text-center w-28 rounded-l-2xl border-y border-l"
                                    >
                                        {t.colPais}
                                    </th>
                                    <th
                                        style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                                        className="p-3 text-center border-y"
                                    >
                                        {t.colContinente}
                                    </th>
                                    <th
                                        style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                                        className="p-3 text-center border-y"
                                    >
                                        {t.colFronterizo}
                                    </th>
                                    <th
                                        style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                                        className="p-3 text-center border-y"
                                    >
                                        {t.colSuperficie}
                                    </th>
                                    <th
                                        style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                                        className="p-3 text-center rounded-r-2xl border-y border-r"
                                    >
                                        {t.colDistancia}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {guesses.map((guess, rowIndex) => {
                                    // Styles constants - rich pastels in light mode, soft dark borders in dark mode
                                    const correctClass = "bg-emerald-100/75 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-300 border-y border-emerald-200/80 dark:border-emerald-900/50";
                                    const partialClass = "bg-amber-100/75 dark:bg-amber-950/30 text-amber-950 dark:text-amber-300 border-y border-amber-200/80 dark:border-amber-900/50";
                                    const incorrectClass = "bg-rose-100/75 dark:bg-rose-950/30 text-rose-950 dark:text-rose-300 border-y border-rose-200/80 dark:border-rose-900/50";
                                    const numberClass = "bg-sky-100/75 dark:bg-sky-950/30 text-sky-950 dark:text-sky-300 border-y border-sky-200/80 dark:border-sky-900/50";

                                    // Continente check
                                    const continentMatch = guess.continente === targetCountry.continente;
                                    const continentCellClass = continentMatch ? correctClass : incorrectClass;

                                    // Fronterizo check
                                    const isTargetCountry = guess.id === targetCountry.id;
                                    const fronterizoMatch = isFronterizo(guess, targetCountry);
                                    const fronterizoCellClass = isTargetCountry
                                        ? correctClass
                                        : fronterizoMatch
                                            ? `${partialClass} animate-soft-pulse`
                                            : incorrectClass;

                                    // Superficie check
                                    const superficieMatch = guess.superficie === targetCountry.superficie;
                                    const surfaceArrow = targetCountry.superficie > guess.superficie ? "higher" : "lower";
                                    const superficieCellClass = superficieMatch ? correctClass : numberClass;

                                    // Distancia & bearing check
                                    const dist = calculateDistance(guess.latitud, guess.longitud, targetCountry.latitud, targetCountry.longitud);
                                    const bear = calculateBearing(guess.latitud, guess.longitud, targetCountry.latitud, targetCountry.longitud);
                                    const isCorrectDist = dist === 0;
                                    const distanceCellClass = isCorrectDist ? correctClass : numberClass;

                                    return (
                                        <tr
                                            key={rowIndex}
                                            className={`font-medium animate-flip ${shakeRowIndex === rowIndex ? "animate-shake" : ""}`}
                                        >
                                            {/* Guess country name & flag */}
                                            <td
                                                style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                                                className="p-3 text-center align-middle font-bold min-w-[110px] rounded-l-2xl border-y border-l shadow-xs"
                                            >
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <img
                                                        src={`/${guess.rutaBandera}`}
                                                        alt={getCountryName(guess)}
                                                        className="w-10 h-7 object-cover rounded border border-black/10 dark:border-white/10 shadow-sm"
                                                    />
                                                    <span className="text-xxs sm:text-xs tracking-tight line-clamp-1">{getCountryName(guess)}</span>
                                                </div>
                                            </td>

                                            {/* Continente */}
                                            <td className={`p-3.5 text-center align-middle ${continentCellClass} min-w-[125px]`}>
                                                <div className="flex flex-col items-center">
                                                    <span className="font-extrabold text-sm">{getContinentName(guess.continente)}</span>
                                                    <span className="text-[9px] font-extrabold uppercase tracking-wide mt-0.5 opacity-95 dark:opacity-85">
                                                        {continentMatch ? t.valCoincide : t.valNoCoincide}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Fronterizo */}
                                            <td className={`p-3.5 text-center align-middle ${fronterizoCellClass} min-w-[125px]`}>
                                                <div className="flex flex-col items-center">
                                                    <span className="font-extrabold text-sm">
                                                        {isTargetCountry ? "-" : (fronterizoMatch ? t.valSi : t.valNo)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Superficie */}
                                            <td className={`p-3.5 text-center align-middle ${superficieCellClass} min-w-[160px]`}>
                                                <div className="flex flex-col items-center">
                                                    <span className="font-extrabold text-sm">{new Intl.NumberFormat("es-ES").format(guess.superficie)} km²</span>
                                                    <span className="text-[9px] font-extrabold uppercase tracking-wide mt-0.5 flex items-center gap-0.5 opacity-95 dark:opacity-85">
                                                        {superficieMatch ? (
                                                            <span>{t.valCoincide}</span>
                                                        ) : surfaceArrow === "higher" ? (
                                                            <span>{t.valMayor}</span>
                                                        ) : (
                                                            <span>{t.valMenor}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Distancia */}
                                            <td className={`p-3.5 text-center align-middle ${distanceCellClass} rounded-r-2xl border-r min-w-[150px]`}>
                                                <div className="flex flex-col items-center">
                                                    <span className="font-extrabold text-sm">{isCorrectDist ? "0 km" : `${new Intl.NumberFormat("es-ES").format(dist)} km`}</span>
                                                    <span className="text-[9px] font-extrabold uppercase tracking-wide mt-0.5 flex items-center gap-1 opacity-95 dark:opacity-85">
                                                        {isCorrectDist ? t.valCoincide : `${bear} ${t.valRumbo}`}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ color: activeStyle.textMuted }} className="text-center font-bold text-sm sm:text-base mt-10 max-w-sm px-6">{t.suerteEnJugar}</div>
                )}
            </main>

            {/* Help / Instructions Modal */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-[calc(100vw-2rem)] max-w-xl p-4 sm:p-8 rounded-3xl shadow-xl flex flex-col gap-3 sm:gap-4 relative animate-scale-in max-h-[85dvh] overflow-y-auto overscroll-behavior-contain"
                    >
                        <h2 className="text-lg sm:text-2xl font-black text-center border-b pb-3 flex items-center gap-2.5 justify-center">
                            <HelpCircle style={{ color: activeStyle.accent }} />
                            <span>{t.helpTitle}</span>
                        </h2>

                        <p className="text-xs sm:text-sm leading-relaxed font-semibold">{t.helpIntro(countriesData.length)}</p>
                        <p className="text-xs sm:text-sm leading-relaxed bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 font-semibold">
                            {t.helpEasyMode}
                        </p>

                        <div className="flex flex-col gap-2">
                            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider opacity-70">{t.helpTableTitle}</h3>

                            <div className="grid grid-cols-1 gap-2 text-[11px] sm:text-xs">
                                <div className="flex items-start gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white font-extrabold shrink-0">🟢</span>
                                    <span>{t.helpContinente}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white font-extrabold shrink-0">🟡</span>
                                    <span>{t.helpFronterizo}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-500 text-white font-extrabold shrink-0">⬆️/⬇️</span>
                                    <span>{t.helpSuperficie}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-500 text-white font-extrabold shrink-0">🧭</span>
                                    <span>{t.helpDistancia}</span>
                                </div>
                            </div>
                        </div>

                        <p style={{ color: activeStyle.textMuted }} className="text-[11px] sm:text-xs leading-relaxed italic border-t pt-3 mt-1 font-semibold">
                            {t.helpFooter}
                        </p>

                        <button
                            onClick={() => setShowHelp(false)}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="mt-2 w-full py-2 sm:py-3 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            {t.btnUnderstood}
                        </button>
                    </div>
                </div>
            )}

            {/* Results Game Over Modal */}
            {showResultModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-[calc(100vw-2rem)] max-w-md p-4 sm:p-8 rounded-3xl shadow-xl flex flex-col gap-3 sm:gap-4 text-center relative animate-scale-in max-h-[85dvh] overflow-y-auto overscroll-behavior-contain"
                    >
                        <h2 className="text-xl sm:text-3xl font-black">
                            {gameStatus === "won" ? t.winTitle : t.loseTitle}
                        </h2>

                        <p className="text-xs sm:text-base font-semibold leading-relaxed">
                            {gameStatus === "won"
                                ? t.winDesc(guesses.length)
                                : t.loseDesc
                            }
                        </p>

                        {/* Secret country card info */}
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 my-2 sm:my-4 bg-slate-100/50 dark:bg-slate-900/50 p-3 sm:p-4 rounded-2xl border border-black/5">
                            <span style={{ color: activeStyle.textMuted }} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t.secretCountryWas}</span>
                            <img
                                src={`/${targetCountry.rutaBandera}`}
                                alt={getCountryName(targetCountry)}
                                className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-lg border border-black/10 shadow-md"
                            />
                            <span className="text-lg sm:text-xl font-black">{getCountryName(targetCountry)}</span>
                            <span style={{ color: activeStyle.accent }} className="text-[10px] sm:text-xs font-extrabold uppercase bg-black/5 dark:bg-white/5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                                {getContinentName(targetCountry.continente)}
                            </span>
                        </div>

                        {/* Control buttons */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleShareResult}
                                style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                                className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm shadow-sm hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>{t.share}</span>
                            </button>
                            {copySuccess && (
                                <span className="text-xs font-bold text-emerald-500 animate-pulse">{t.copied}</span>
                            )}
                            <button
                                onClick={() => startNewGame()}
                                style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                                className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm border shadow-sm hover:bg-black/5 dark:hover:bg-white/5 hover:scale-103 active:scale-97 transition-all cursor-pointer"
                            >
                                {t.playAgain}
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setShowResultModal(false)}
                            className="absolute top-4 right-4 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                        >
                            <X className="w-5 h-5 opacity-60" />
                        </button>
                    </div>
                </div>
            )}

            {/* Statistics Modal */}
            {showStats && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-[calc(100vw-2rem)] max-w-md p-4 sm:p-8 rounded-3xl shadow-xl flex flex-col gap-3 sm:gap-4 relative animate-scale-in max-h-[85dvh] overflow-y-auto overscroll-behavior-contain"
                    >
                        <h2 className="text-xl sm:text-2xl font-black text-center border-b pb-3 flex items-center gap-2 justify-center">
                            <BarChart2 style={{ color: activeStyle.accent }} />
                            <span>{t.stats}</span>
                        </h2>

                        {/* Tab switcher */}
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full select-none">
                            {(["global", "normal", "easy"] as const).map((tab) => {
                                const active = statsTab === tab;
                                const labels = { global: t.statsModeAll, normal: t.statsModeNormal, easy: t.statsModeEasy };
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setStatsTab(tab)}
                                        style={{
                                            backgroundColor: active ? activeStyle.accent : "transparent",
                                            color: active ? activeStyle.btnText : (themeMode === "light" ? "#0f172a" : activeStyle.text),
                                        }}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-black text-center transition-all cursor-pointer ${active ? "shadow-xs" : "opacity-85 dark:opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        {labels[tab]}
                                    </button>
                                );
                            })}
                        </div>

                        {activeStats.played > 0 ? (
                            <div className="flex flex-col gap-4">
                                {/* Grid numbers */}
                                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
                                    <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 sm:p-2.5 rounded-xl border border-black/5">
                                        <div className="text-lg sm:text-2xl font-black">{activeStats.played}</div>
                                        <div style={{ color: activeStyle.textMuted }} className="text-[8px] sm:text-xxs uppercase tracking-wider font-extrabold mt-0.5">{t.statsPlayed}</div>
                                    </div>
                                    <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 sm:p-2.5 rounded-xl border border-black/5">
                                        <div className="text-lg sm:text-2xl font-black">{winRate}%</div>
                                        <div style={{ color: activeStyle.textMuted }} className="text-[8px] sm:text-xxs uppercase tracking-wider font-extrabold mt-0.5">{t.statsWinRate}</div>
                                    </div>
                                    <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 sm:p-2.5 rounded-xl border border-black/5">
                                        <div className="text-lg sm:text-2xl font-black">{activeStats.currentStreak}</div>
                                        <div style={{ color: activeStyle.textMuted }} className="text-[8px] sm:text-xxs uppercase tracking-wider font-extrabold mt-0.5">{t.statsCurrentStreak}</div>
                                    </div>
                                    <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 sm:p-2.5 rounded-xl border border-black/5">
                                        <div className="text-lg sm:text-2xl font-black">{activeStats.maxStreak}</div>
                                        <div style={{ color: activeStyle.textMuted }} className="text-[8px] sm:text-xxs uppercase tracking-wider font-extrabold mt-0.5">{t.statsMaxStreak}</div>
                                    </div>
                                </div>

                                {/* Guesses distribution */}
                                <div className="flex flex-col gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider opacity-70 text-left">{t.statsDistribution}</h3>

                                    <div className="flex flex-col gap-1 sm:gap-1.5">
                                        {activeStats.guessesDistribution.map((count, index) => {
                                            const maxCount = Math.max(...activeStats.guessesDistribution, 1);
                                            const widthPercent = (count / maxCount) * 100;
                                            return (
                                                <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-xs">
                                                    <span className="w-3 font-bold opacity-60 text-right text-xxs sm:text-xs">{index + 1}</span>
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-900 h-4.5 sm:h-5 rounded-md overflow-hidden relative border border-black/5">
                                                        <div
                                                            style={{
                                                                width: `${Math.max(widthPercent, 8)}%`,
                                                                backgroundColor: count > 0 ? activeStyle.accent : "transparent",
                                                            }}
                                                            className="h-full rounded-r flex items-center justify-end pr-2 transition-all duration-500 ease-out"
                                                        >
                                                            {count > 0 && (
                                                                <span className="text-[9px] sm:text-[10px] font-black text-white">{count}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom resets */}
                                <button
                                    onClick={handleResetStats}
                                    style={{ borderColor: activeStyle.border }}
                                    className="mt-4 py-2 border rounded-xl text-xs font-black text-rose-500 hover:bg-rose-50/10 active:scale-98 transition-all w-full cursor-pointer"
                                >
                                    {t.statsResetBtn}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p style={{ color: activeStyle.textMuted }} className="text-xs font-bold">{t.statsNoData}</p>
                            </div>
                        )}

                        <button
                            onClick={() => setShowStats(false)}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="mt-3 w-full py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-102 cursor-pointer"
                        >
                            {t.btnClose}
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer style={{ color: activeStyle.textMuted }} className="w-full text-center mt-12 text-[10px] sm:text-xs font-bold opacity-60 select-none">
                <span>© {new Date().getFullYear()} Juegitos • {fullTranslations.hechoCon}</span>
            </footer>
        </div>
    );
}