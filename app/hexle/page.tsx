"use client";

import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, RefreshCw, Share2, BarChart2, Trophy, Clock, X } from "lucide-react";
import { useGameConfig } from "@/components/GameConfigContext";
import { useLanguage } from "@/components/LanguageProvider";

interface ModeStats {
    played: number;
    won: number;
    currentStreak: number;
    maxStreak: number;
    guessesDistribution: number[];
    totalGuesses: number;
    directionClues: {
        up: number;
        down: number;
        exact: number;
    };
    timeOfDay: {
        night: number;
        morning: number;
        afternoon: number;
        evening: number;
    };
}

interface GameStats {
    "ojo-de-aguila": ModeStats;
    "clasico": ModeStats;
}

// ThemeConfig interface removed since styles are loaded from global config state





const createDefaultModeStats = (): ModeStats => ({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessesDistribution: [0, 0, 0, 0, 0, 0],
    totalGuesses: 0,
    directionClues: {
        up: 0,
        down: 0,
        exact: 0,
    },
    timeOfDay: {
        night: 0,
        morning: 0,
        afternoon: 0,
        evening: 0,
    },
});

const createDefaultStats = (): GameStats => ({
    "ojo-de-aguila": createDefaultModeStats(),
    "clasico": createDefaultModeStats(),
});

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

const getRandomColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, "0");
};

export default function ColorlePage() {
    const { activeStyle, setActiveGameName } = useGameConfig();
    const { gameLang, t: fullTranslations } = useLanguage();
    const t = fullTranslations.hexle;

    // Establecer el nombre del juego activo en el header
    useEffect(() => {
        setActiveGameName("Hexle");
        return () => setActiveGameName(null);
    }, [setActiveGameName]);

    // Estado del juego y deslizamiento
    const [gameMode, setGameMode] = useState<"ojo-de-aguila" | "clasico">("ojo-de-aguila");
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | "none">("none");
    const [targetColor, setTargetColor] = useState<string>(getRandomColor);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState<string>("");
    const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [showResultModal, setShowResultModal] = useState<boolean>(false);
    const [shakeRowIndex, setShakeRowIndex] = useState<number | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    // Estado de estadísticas
    const [stats, setStats] = useState<GameStats | null>(null);
    const [showStats, setShowStats] = useState<boolean>(false);
    const [statsTab, setStatsTab] = useState<"ojo-de-aguila" | "clasico" | "global">("global");

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const confettiAnimationRef = useRef<number | null>(null);

    const maxAttempts = gameMode === "ojo-de-aguila" ? 5 : 6;

    // Generador de color al azar (definido externamente)

    // Inicializar juego
    const startNewGame = (mode: "ojo-de-aguila" | "clasico" = gameMode) => {
        if (mode !== gameMode) {
            setSlideDirection(mode === "clasico" ? "left" : "right");
        } else {
            setSlideDirection("none");
        }
        setGameMode(mode);
        const color = getRandomColor();
        setTargetColor(color);
        setGuesses([]);
        setCurrentGuess("");
        setGameStatus("playing");
        setShowResultModal(false);
        if (confettiAnimationRef.current) {
            cancelAnimationFrame(confettiAnimationRef.current);
            confettiAnimationRef.current = null;
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx && canvasRef.current) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    };

    // Cargar preferencias, estadísticas y juego inicial al montar
    useEffect(() => {
        const savedStatsStr = localStorage.getItem("colorle-game-stats");
        if (savedStatsStr) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setStats(JSON.parse(savedStatsStr));
            } catch (e) {
                console.error("Error parsing stats", e);
                setStats(createDefaultStats());
            }
        } else {
            setStats(createDefaultStats());
        }
    }, []);

    // Escuchar teclado físico
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameStatus !== "playing" || showHelp || showResultModal) return;

            const key = e.key.toUpperCase();
            if (key === "ENTER") {
                handleSubmitGuess();
            } else if (key === "BACKSPACE") {
                handleBackspace();
            } else if (/^[0-9A-F]$/.test(key) && currentGuess.length < 6) {
                handleInputChar(key);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentGuess, gameStatus, showHelp, showResultModal, targetColor, gameMode]);

    function handleInputChar(char: string) {
        if (currentGuess.length < 6) {
            setCurrentGuess((prev) => prev + char);
        }
    }

    function handleBackspace() {
        setCurrentGuess((prev) => prev.slice(0, -1));
    }

    const recordGameEnd = (status: "won" | "lost", finalGuesses: string[]) => {
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
                if (winIndex >= 0 && winIndex < 6) {
                    const distribution = [...mStats.guessesDistribution];
                    distribution[winIndex] += 1;
                    mStats.guessesDistribution = distribution;
                }
            } else {
                mStats.currentStreak = 0;
            }

            let upCount = 0;
            let downCount = 0;
            let exactCount = 0;

            finalGuesses.forEach((guess) => {
                for (let i = 0; i < 6; i++) {
                    const valGuess = getHexValue(guess[i] || "0");
                    const valTarget = getHexValue(targetColor[i] || "0");
                    const diff = valTarget - valGuess;
                    if (diff === 0) {
                        exactCount += 1;
                    } else if (diff > 0) {
                        upCount += 1;
                    } else {
                        downCount += 1;
                    }
                }
            });

            mStats.directionClues = {
                up: mStats.directionClues.up + upCount,
                down: mStats.directionClues.down + downCount,
                exact: mStats.directionClues.exact + exactCount,
            };

            const hour = new Date().getHours();
            const timeOfDay = { ...mStats.timeOfDay };
            if (hour >= 22 || hour < 6) {
                timeOfDay.night += 1;
            } else if (hour >= 6 && hour < 12) {
                timeOfDay.morning += 1;
            } else if (hour >= 12 && hour < 18) {
                timeOfDay.afternoon += 1;
            } else {
                timeOfDay.evening += 1;
            }
            mStats.timeOfDay = timeOfDay;

            currentStats[mode] = mStats;
            localStorage.setItem("colorle-game-stats", JSON.stringify(currentStats));
            return currentStats;
        });
    };

    function handleSubmitGuess() {
        if (gameStatus !== "playing") return;
        if (currentGuess.length < 6) {
            triggerShake();
            return;
        }

        const nextGuesses = [...guesses, currentGuess];
        setGuesses(nextGuesses);

        if (currentGuess === targetColor) {
            setGameStatus("won");
            recordGameEnd("won", nextGuesses);
            setTimeout(() => {
                setShowResultModal(true);
                triggerConfetti();
            }, 1000);
        } else if (nextGuesses.length >= maxAttempts) {
            setGameStatus("lost");
            recordGameEnd("lost", nextGuesses);
            setTimeout(() => {
                setShowResultModal(true);
            }, 1000);
        }

        setCurrentGuess("");
    }

    function triggerShake() {
        setShakeRowIndex(guesses.length);
        setTimeout(() => {
            setShakeRowIndex(null);
        }, 500);
    }

    // Obtener el valor decimal de un caracter hexadecimal
    const getHexValue = (char: string): number => {
        return parseInt(char, 16);
    };

    // Generar las pistas de flechas por dígito
    const getDigitClue = (guessChar: string, targetChar: string) => {
        const valGuess = getHexValue(guessChar);
        const valTarget = getHexValue(targetChar);
        const diff = valTarget - valGuess;

        if (diff === 0) {
            return { symbol: "✓", colorClass: "text-emerald-500 font-bold" };
        } else if (diff > 0) {
            return {
                symbol: diff > 2 ? "▲▲" : "▲",
                colorClass: diff > 2 ? "text-amber-500 font-bold scale-y-110" : "text-amber-400 font-bold",
            };
        } else {
            return {
                symbol: diff < -2 ? "▼▼" : "▼",
                colorClass: diff < -2 ? "text-indigo-500 font-bold scale-y-110" : "text-indigo-400 font-bold",
            };
        }
    };

    // Confeti nativo en Canvas
    const triggerConfetti = () => {
        if (canvasRef.current) {
            runConfetti(canvasRef.current, confettiAnimationRef);
        }
    };

    // Compartir resultado
    const handleShareResult = () => {
        let text = `Hexle (${gameMode === "ojo-de-aguila" ? t.statsModeEagle : t.statsModeClassic}) ${guesses.length}/${maxAttempts}\n\n`;
        guesses.forEach((guess) => {
            let rowClues = "";
            for (let i = 0; i < 6; i++) {
                const valGuess = getHexValue(guess[i]);
                const valTarget = getHexValue(targetColor[i]);
                const diff = valTarget - valGuess;

                if (diff === 0) {
                    rowClues += "✓";
                } else if (diff > 2) {
                    rowClues += "▲▲";
                } else if (diff > 0) {
                    rowClues += "▲";
                } else if (diff < -2) {
                    rowClues += "▼▼";
                } else {
                    rowClues += "▼";
                }
            }
            rowClues += ` 🎨 #${guess}\n`;
            text += rowClues;
        });

        text += `\nJuega aquí: ${window.location.href}`;

        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    // Renderizar una fila del tablero
    const renderRow = (rowIndex: number) => {
        const isSubmitted = rowIndex < guesses.length;
        const isCurrent = rowIndex === guesses.length;
        const rowGuess = isSubmitted ? guesses[rowIndex] : isCurrent ? currentGuess : "";
        const isShaking = shakeRowIndex === rowIndex;

        return (
            <div
                key={rowIndex}
                className={`flex items-center gap-1.5 sm:gap-3 transition-transform duration-300 ${isShaking ? "animate-shake" : ""
                    }`}
            >
                {/* Fila de letras/números */}
                <div className="flex gap-1 sm:gap-2">
                    {Array.from({ length: 6 }).map((_, colIndex) => {
                        const char = rowGuess[colIndex] || "";
                        const targetChar = targetColor[colIndex] || "";
                        const clue = isSubmitted ? getDigitClue(char, targetChar) : null;

                        return (
                            <div key={colIndex} className="flex flex-col items-center">
                                <div
                                    style={{
                                        backgroundColor: activeStyle.card,
                                        borderColor: isCurrent && colIndex === currentGuess.length ? activeStyle.accent : activeStyle.border,
                                        color: activeStyle.text,
                                    }}
                                    className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-2xl border-2 flex items-center justify-center font-bold text-sm sm:text-xl shadow-sm transition-all duration-300 ${isSubmitted ? "animate-flip" : isCurrent && char ? "scale-105" : ""
                                        }`}
                                >
                                    {char}
                                </div>
                                {/* Flecha de pista */}
                                <div className="h-4 sm:h-6 mt-0.5 sm:mt-1 flex items-center justify-center">
                                    {clue && (
                                        <span className={`text-xs sm:text-sm tracking-tighter transition-all duration-500 ${clue.colorClass}`}>
                                            {clue.symbol}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Previsualización rectangular de color (swatch estático, doble ancho) */}
                <div className="flex items-center pb-5 sm:pb-7 pl-1">
                    {isSubmitted ? (
                        <div
                            style={{ backgroundColor: `#${rowGuess}` }}
                            className="w-18 h-9 xs:w-20 xs:h-10 sm:w-28 sm:h-14 md:w-32 md:h-16 rounded-lg sm:rounded-2xl border border-black/15 shadow-sm transform hover:scale-105 transition-transform duration-300 flex-shrink-0"
                            title={`#${rowGuess}`}
                        />
                    ) : isCurrent && currentGuess.length === 6 ? (
                        <div
                            style={{ backgroundColor: `#${currentGuess}` }}
                            className="w-18 h-9 xs:w-20 xs:h-10 sm:w-28 sm:h-14 md:w-32 md:h-16 rounded-lg sm:rounded-2xl border-2 border-dashed shadow-sm animate-pulse flex-shrink-0"
                        />
                    ) : (
                        <div
                            style={{ borderColor: activeStyle.border }}
                            className="w-18 h-9 xs:w-20 xs:h-10 sm:w-28 sm:h-14 md:w-32 md:h-16 rounded-lg sm:rounded-2xl border-2 border-dashed bg-transparent shadow-none flex-shrink-0"
                        />
                    )}
                </div>
            </div>
        );
    };

    // Obtener estadísticas activas según la pestaña
    const getActiveStats = (): ModeStats | null => {
        if (!stats) return null;

        if (statsTab === "ojo-de-aguila") {
            return stats["ojo-de-aguila"];
        }
        if (statsTab === "clasico") {
            return stats["clasico"];
        }

        const eagle = stats["ojo-de-aguila"];
        const classic = stats["clasico"];

        return {
            played: eagle.played + classic.played,
            won: eagle.won + classic.won,
            currentStreak: Math.max(eagle.currentStreak, classic.currentStreak),
            maxStreak: Math.max(eagle.maxStreak, classic.maxStreak),
            guessesDistribution: eagle.guessesDistribution.map((v, i) => v + (classic.guessesDistribution[i] || 0)),
            totalGuesses: eagle.totalGuesses + classic.totalGuesses,
            directionClues: {
                up: eagle.directionClues.up + classic.directionClues.up,
                down: eagle.directionClues.down + classic.directionClues.down,
                exact: eagle.directionClues.exact + classic.directionClues.exact,
            },
            timeOfDay: {
                night: eagle.timeOfDay.night + classic.timeOfDay.night,
                morning: eagle.timeOfDay.morning + classic.timeOfDay.morning,
                afternoon: eagle.timeOfDay.afternoon + classic.timeOfDay.afternoon,
                evening: eagle.timeOfDay.evening + classic.timeOfDay.evening,
            },
        };
    };

    const activeStats = getActiveStats() || createDefaultModeStats();

    const getFavoriteTimeOfDay = (tod: ModeStats["timeOfDay"]): string => {
        const entries = Object.entries(tod) as [keyof ModeStats["timeOfDay"], number][];
        let maxVal = -1;
        let maxSlot: keyof ModeStats["timeOfDay"] | null = null;
        entries.forEach(([slot, val]) => {
            if (val > maxVal) {
                maxVal = val;
                maxSlot = slot;
            }
        });
        if (maxVal === 0 || !maxSlot) return "-";
        if (maxSlot === "night") return t.timeNight;
        if (maxSlot === "morning") return t.timeMorning;
        if (maxSlot === "afternoon") return t.timeAfternoon;
        return t.timeEvening;
    };

    const handleResetStats = () => {
        if (window.confirm(t.statsResetConfirm)) {
            const def = createDefaultStats();
            setStats(def);
            localStorage.setItem("colorle-game-stats", JSON.stringify(def));
        }
    };

    const slideClass = slideDirection === "left" ? "animate-slide-left" : slideDirection === "right" ? "animate-slide-right" : "animate-mode-change";

    return (
        <div
            style={{
                backgroundColor: activeStyle.bg,
                color: activeStyle.text,
            }}
            className="min-h-[calc(100vh-65px)] pt-6 xl:pt-12 px-4 sm:px-6 pb-8 transition-colors duration-500 relative flex flex-col items-center justify-between"
        >
            {/* Canvas para el confeti */}
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

            {/* Contenedor responsivo superior para Controles (Flujo vertical en móvil, absoluto en desktop) */}
            <div className="w-full max-w-xl flex flex-col gap-4 mt-2 mb-4 xl:mb-0 xl:contents">
                {/* Selector de Modo de Juego */}
                <div className="xl:absolute xl:top-6 xl:left-6 flex flex-row xl:flex-col gap-2 z-40 w-full xl:w-auto justify-center xl:justify-start" key="mode-selector-corner animate-mode-change">
                    <button
                        onClick={() => startNewGame("ojo-de-aguila")}
                        style={{
                            backgroundColor: gameMode === "ojo-de-aguila" ? activeStyle.accent : activeStyle.card,
                            color: gameMode === "ojo-de-aguila" ? activeStyle.btnText : activeStyle.text,
                            borderColor: activeStyle.border,
                        }}
                        className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold shadow-sm transition-all duration-300 hover:scale-102 active:scale-98 text-center xl:text-left ${gameMode === "ojo-de-aguila" ? "shadow-md" : "hover:bg-opacity-90"
                            }`}
                    >
                        {t.modeLabelEagleEye}
                    </button>
                    <button
                        onClick={() => startNewGame("clasico")}
                        style={{
                            backgroundColor: gameMode === "clasico" ? activeStyle.accent : activeStyle.card,
                            color: gameMode === "clasico" ? activeStyle.btnText : activeStyle.text,
                            borderColor: activeStyle.border,
                        }}
                        className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold shadow-sm transition-all duration-300 hover:scale-102 active:scale-98 text-center xl:text-left ${gameMode === "clasico" ? "shadow-md" : "hover:bg-opacity-90"
                            }`}
                    >
                        {t.modeLabelClassic}
                    </button>
                </div>

                {/* Botones de Ayuda, Estadísticas y Reset específicos del Juego */}
                <div className="xl:absolute xl:top-6 xl:right-6 flex flex-col items-center xl:items-end gap-2.5 z-40 w-full xl:w-auto">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHelp(true)}
                            style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                            className="px-3.5 py-2 rounded-xl border shadow-sm text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span>{t.howToPlay}</span>
                        </button>
                        <button
                            onClick={() => setShowStats(true)}
                            style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                            className="px-3.5 py-2 rounded-xl border shadow-sm text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <BarChart2 className="w-4 h-4" />
                            <span>{t.stats}</span>
                        </button>
                        <button
                            onClick={() => startNewGame()}
                            style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                            className="px-3.5 py-2 rounded-xl border shadow-sm text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>{t.reset}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido Superior (Título y Descripción adaptados dinámicamente) */}
            <header className={`w-full max-w-xl flex flex-col items-center mb-4 mt-2 ${slideClass}`} key={`header-${gameMode}-${targetColor}`}>
                <div className="text-center">
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight select-none">
                        {gameMode === "ojo-de-aguila" ? t.titleEagleEye : t.titleClassic}
                    </h1>
                    <p style={{ color: activeStyle.textMuted }} className="text-sm sm:text-xl font-medium max-w-lg text-center mt-2 mx-auto leading-relaxed px-2">
                        {gameMode === "ojo-de-aguila" ? t.subtitleEagleEye : t.subtitleClassic}
                    </p>
                </div>
            </header>

            {/* Modo Ojo de Águila: Cajas de color de comparación arriba del tablero */}
            {gameMode === "ojo-de-aguila" && (
                <div className={`w-full max-w-xl flex flex-col items-center gap-2 mb-4 ${slideClass}`} key={`comparison-${gameMode}-${targetColor}`}>
                    <div className="flex gap-4 sm:gap-8 items-center justify-center w-full">
                        {/* Caja de Color Objetivo */}
                        <div className="flex flex-col items-center gap-1.5">
                            <span style={{ color: activeStyle.textMuted }} className="text-xs sm:text-sm uppercase tracking-wider font-bold">
                                {t.targetColorLabel}
                            </span>
                            <div
                                style={{ backgroundColor: `#${targetColor}` }}
                                className="w-20 h-20 sm:w-28 sm:h-28 xl:w-32 xl:h-32 rounded-2xl border border-black/15 shadow-md transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                                title="Target color to match"
                            />
                        </div>

                        {/* Caja del Último Intento */}
                        <div className="flex flex-col items-center gap-1.5">
                            <span style={{ color: activeStyle.textMuted }} className="text-xs sm:text-sm uppercase tracking-wider font-bold">
                                {t.latestGuessLabel}
                            </span>
                            {guesses.length > 0 ? (
                                <div
                                    style={{ backgroundColor: `#${guesses[guesses.length - 1]}` }}
                                    className="w-20 h-20 sm:w-28 sm:h-28 xl:w-32 xl:h-32 rounded-2xl border border-black/15 shadow-md transform hover:scale-105 transition-transform duration-300 animate-scale-in cursor-pointer"
                                    title={`Last guess: #${guesses[guesses.length - 1]}`}
                                />
                            ) : (
                                <div
                                    style={{ borderColor: activeStyle.border }}
                                    className="w-20 h-20 sm:w-28 sm:h-28 xl:w-32 xl:h-32 rounded-2xl border-2 border-dashed bg-transparent flex items-center justify-center text-lg font-bold opacity-30 select-none"
                                >
                                    -
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tablero del Juego */}
            <main className={`w-full max-w-xl flex flex-col items-center gap-2 mb-4 ${slideClass}`} key={`board-${gameMode}-${targetColor}`}>
                {Array.from({ length: maxAttempts }).map((_, index) => renderRow(index))}
            </main>

            {/* Teclado Virtual */}
            <section className="w-full max-w-xl mt-auto">
                <div
                    style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                    className="p-2.5 sm:p-4 rounded-2xl border shadow-sm flex flex-col gap-2"
                >
                    {/* Fila 1 */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {["0", "1", "2", "3", "4"].map((char) => (
                            <button
                                key={char}
                                onClick={() => handleInputChar(char)}
                                style={{ backgroundColor: activeStyle.keyBg, color: activeStyle.text }}
                                className="py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-opacity-80 active:shadow-inner"
                            >
                                {char}
                            </button>
                        ))}
                    </div>

                    {/* Fila 2 */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {["5", "6", "7", "8", "9"].map((char) => (
                            <button
                                key={char}
                                onClick={() => handleInputChar(char)}
                                style={{ backgroundColor: activeStyle.keyBg, color: activeStyle.text }}
                                className="py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-opacity-80 active:shadow-inner"
                            >
                                {char}
                            </button>
                        ))}
                    </div>

                    {/* Fila 3 */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {["A", "B", "C", "D", "E"].map((char) => (
                            <button
                                key={char}
                                onClick={() => handleInputChar(char)}
                                style={{ backgroundColor: activeStyle.keyBg, color: activeStyle.text }}
                                className="py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-opacity-80 active:shadow-inner"
                            >
                                {char}
                            </button>
                        ))}
                    </div>

                    {/* Fila 4 */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        <button
                            onClick={handleBackspace}
                            style={{ backgroundColor: activeStyle.keyBg, color: activeStyle.text }}
                            className="py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-opacity-80 active:shadow-inner"
                        >
                            ⌫
                        </button>
                        <button
                            onClick={() => handleInputChar("F")}
                            style={{ backgroundColor: activeStyle.keyBg, color: activeStyle.text }}
                            className="py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-opacity-80 active:shadow-inner"
                        >
                            F
                        </button>
                        <button
                            onClick={handleSubmitGuess}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95 active:shadow-inner"
                        >
                            {gameLang === "de" ? "Bereit" : gameLang === "la" ? "Paratus" : gameLang === "ru" ? "Готово" : gameLang === "pt" ? "Enviar" : gameLang === "pl" ? "Gotowe" : "Listo"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Modal de Ayuda / Instrucciones */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col gap-4 sm:gap-5 relative animate-scale-in"
                    >
                        <h2 className="text-xl sm:text-3xl font-bold text-center border-b pb-3">
                            {t.helpTitle}
                        </h2>
                        <p className="text-xs sm:text-lg leading-relaxed">{t.helpIntro}</p>
                        <p className="text-xs sm:text-lg leading-relaxed">{t.helpRGB}</p>

                        <div className="flex flex-col gap-2.5 sm:gap-3.5 mt-1">
                            <p className="text-xs sm:text-sm font-bold">{t.helpArrows}</p>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm leading-none">
                                <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-800 border flex items-center justify-center font-bold text-amber-500 flex-shrink-0">▲▲</span>
                                <span className="flex-1">{t.helpArrowDoubleUp}</span>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm leading-none">
                                <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-800 border flex items-center justify-center font-bold text-amber-400 flex-shrink-0">▲</span>
                                <span className="flex-1">{t.helpArrowSingleUp}</span>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm leading-none">
                                <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-800 border flex items-center justify-center font-bold text-indigo-400 flex-shrink-0">▼</span>
                                <span className="flex-1">{t.helpArrowSingleDown}</span>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm leading-none">
                                <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-800 border flex items-center justify-center font-bold text-indigo-500 flex-shrink-0">▼▼</span>
                                <span className="flex-1">{t.helpArrowDoubleDown}</span>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm leading-none">
                                <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-800 border flex items-center justify-center font-bold text-emerald-500 flex-shrink-0">✓</span>
                                <span className="flex-1">{t.helpArrowCheck}</span>
                            </div>
                        </div>

                        <p style={{ color: activeStyle.textMuted }} className="text-xs sm:text-sm leading-relaxed italic border-t pt-3 mt-1">
                            {t.helpFooter}
                        </p>

                        <button
                            onClick={() => setShowHelp(false)}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="mt-2 w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            {gameLang === "de" ? "Verstanden!" : gameLang === "la" ? "Intellectum!" : gameLang === "ru" ? "Понятно" : gameLang === "pt" ? "Entendido!" : gameLang === "pl" ? "Rozumiem!" : "¡Entendido!"}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Fin de Partida */}
            {showResultModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 sm:gap-5 relative animate-scale-in"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center">
                            {gameStatus === "won" ? t.winTitle : t.loseTitle}
                        </h2>

                        <p className="text-center text-sm sm:text-base">
                            {gameStatus === "won" ? t.winDesc(guesses.length) : t.loseDesc}
                        </p>

                        <div className="flex flex-col items-center gap-2 my-1">
                            <span style={{ color: activeStyle.textMuted }} className="text-xs uppercase tracking-wider font-bold">
                                {t.secretColorWas}
                            </span>
                            <div className="flex items-center gap-3 sm:gap-4 bg-black/5 dark:bg-white/5 py-2 px-4 sm:px-5 rounded-2xl border border-black/10">
                                <div
                                    style={{ backgroundColor: `#${targetColor}` }}
                                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border shadow-md animate-bounce"
                                />
                                <span className="font-mono text-lg sm:text-2xl font-bold tracking-widest">
                                    #{targetColor}
                                </span>
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-2 mt-1">
                            <button
                                onClick={handleShareResult}
                                style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                                className="w-full py-2.5 sm:py-3 rounded-xl border font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                {copySuccess ? t.copied : t.share}
                            </button>
                            <button
                                onClick={() => setShowStats(true)}
                                style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                                className="w-full py-2.5 sm:py-3 rounded-xl border font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <BarChart2 className="w-4 h-4" />
                                {t.stats}
                            </button>
                            <button
                                onClick={() => startNewGame()}
                                style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                                className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                            >
                                {t.playAgain}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Estadísticas */}
            {showStats && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col gap-4 sm:gap-5 relative animate-scale-in max-h-[90vh] overflow-y-auto"
                    >
                        {/* Botón de cerrar en la esquina superior derecha */}
                        <button
                            onClick={() => setShowStats(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            aria-label="Cerrar estadísticas"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl sm:text-3xl font-bold text-center border-b pb-3 flex items-center justify-center gap-2">
                            <BarChart2 className="w-6 h-6" />
                            {t.stats}
                        </h2>

                        {/* Selector de pestañas */}
                        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5">
                            {(["global", "ojo-de-aguila", "clasico"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setStatsTab(tab)}
                                    style={{
                                        backgroundColor: statsTab === tab ? activeStyle.accent : "transparent",
                                        color: statsTab === tab ? activeStyle.btnText : activeStyle.text,
                                    }}
                                    className="flex-1 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300"
                                >
                                    {tab === "global" ? t.statsModeAll : tab === "ojo-de-aguila" ? t.statsModeEagle : t.statsModeClassic}
                                </button>
                            ))}
                        </div>

                        {/* Grid de métricas principales */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/5 dark:border-white/5">
                                <span className="block text-xl sm:text-2xl font-bold">
                                    {new Intl.NumberFormat("es-ES").format(activeStats.played)}
                                </span>
                                <span style={{ color: activeStyle.textMuted }} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                    {t.statsPlayed}
                                </span>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/5 dark:border-white/5">
                                <span className="block text-xl sm:text-2xl font-bold">
                                    {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(
                                        activeStats.played > 0 ? (activeStats.won / activeStats.played) * 100 : 0
                                    ) + "%"}
                                </span>
                                <span style={{ color: activeStyle.textMuted }} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                    {t.statsWinRate}
                                </span>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/5 dark:border-white/5">
                                <span className="block text-xl sm:text-2xl font-bold">
                                    {new Intl.NumberFormat("es-ES").format(activeStats.currentStreak)}
                                </span>
                                <span style={{ color: activeStyle.textMuted }} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                    {t.statsCurrentStreak}
                                </span>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/5 dark:border-white/5">
                                <span className="block text-xl sm:text-2xl font-bold">
                                    {new Intl.NumberFormat("es-ES").format(activeStats.maxStreak)}
                                </span>
                                <span style={{ color: activeStyle.textMuted }} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                    {t.statsMaxStreak}
                                </span>
                            </div>
                        </div>

                        {/* Distribución de Intentos */}
                        <div className="flex flex-col gap-2 mt-1">
                            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1">
                                {t.statsDistribution}
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                {Array.from({ length: statsTab === "ojo-de-aguila" ? 5 : 6 }).map((_, i) => {
                                    const val = activeStats.guessesDistribution[i] || 0;
                                    const maxVal = Math.max(...activeStats.guessesDistribution, 1);
                                    const percentage = (val / maxVal) * 100;
                                    return (
                                        <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                                            <span className="w-3 font-bold">{i + 1}</span>
                                            <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden h-5 sm:h-6 flex items-center">
                                                <div
                                                    style={{
                                                        width: `${Math.max(percentage, 8)}%`,
                                                        backgroundColor: val > 0 ? activeStyle.accent : "rgba(0,0,0,0.15)",
                                                        color: val > 0 ? activeStyle.btnText : activeStyle.text,
                                                    }}
                                                    className="h-full flex items-center justify-end px-2 font-bold transition-all duration-500 rounded-full min-w-[30px]"
                                                >
                                                    {new Intl.NumberFormat("es-ES").format(val)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Patrones y Curiosidades */}
                        <div className="flex flex-col gap-2 mt-1 text-xs sm:text-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1">
                                {t.statsFunTitle}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5 gap-0.5">
                                    <span style={{ color: activeStyle.textMuted }} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Trophy className="w-3 h-3 text-amber-500" />
                                        {t.statsPersonality}
                                    </span>
                                    <span className="font-semibold mt-1">
                                        {activeStats.played > 0
                                            ? (() => {
                                                const { up, down } = activeStats.directionClues;
                                                if (up === 0 && down === 0) return "-";
                                                if (down > up * 1.15) return t.statsTendencyOptimist;
                                                if (up > down * 1.15) return t.statsTendencyPessimist;
                                                return t.statsTendencyBalanced;
                                            })()
                                            : "-"}
                                    </span>
                                </div>

                                <div className="flex flex-col bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5 gap-0.5">
                                    <span style={{ color: activeStyle.textMuted }} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-indigo-500" />
                                        {t.statsFavTime}
                                    </span>
                                    <span className="font-semibold mt-1">
                                        {getFavoriteTimeOfDay(activeStats.timeOfDay)}
                                    </span>
                                </div>

                                <div className="flex flex-col bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5 gap-0.5">
                                    <span style={{ color: activeStyle.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">
                                        {t.statsPerfectWins}
                                    </span>
                                    <span className="font-bold text-base mt-1 text-emerald-500">
                                        {new Intl.NumberFormat("es-ES").format(activeStats.guessesDistribution[0] || 0)}
                                    </span>
                                </div>

                                <div className="flex flex-col bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5 gap-0.5">
                                    <span style={{ color: activeStyle.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">
                                        {t.statsLastChanceWins}
                                    </span>
                                    <span className="font-bold text-base mt-1 text-rose-500">
                                        {new Intl.NumberFormat("es-ES").format(
                                            statsTab === "ojo-de-aguila"
                                                ? activeStats.guessesDistribution[4] || 0
                                                : statsTab === "clasico"
                                                    ? activeStats.guessesDistribution[5] || 0
                                                    : (activeStats.guessesDistribution[4] || 0) + (activeStats.guessesDistribution[5] || 0)
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Promedio de intentos */}
                            <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-black/5 dark:border-white/5 mt-1">
                                <span className="font-bold">{t.statsAvgGuesses}</span>
                                <span className="font-bold text-base">
                                    {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(
                                        activeStats.played > 0 ? activeStats.totalGuesses / activeStats.played : 0
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Restablecer estadísticas */}
                        <div className="flex justify-center mt-2 border-t pt-3">
                            <button
                                onClick={handleResetStats}
                                className="text-xs font-bold opacity-60 hover:opacity-100 hover:text-red-500 transition-all flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-red-500/10 cursor-pointer"
                            >
                                {t.statsResetBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Estilos CSS Inline para Animaciones Personalizadas */}
            <style jsx global>{`
        @keyframes flip {
          0% { transform: rotateX(0deg); }
          45% { transform: rotateX(90deg); }
          55% { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes modeTransition {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-flip {
          animation: flip 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-slide-left {
          animation: slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-right {
          animation: slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-mode-change {
          animation: modeTransition 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
        </div>
    );
}
