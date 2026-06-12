"use client";

import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, RefreshCw, Share2, BarChart2, Check, X, Award, Play } from "lucide-react";
import { useGameConfig } from "@/components/GameConfigContext";
import { useLanguage } from "@/components/LanguageProvider";

// ==========================================
// 5. BASE DE DATOS DEL JUEGO (FONOS AFI)
// ==========================================
interface Consonante {
    fono: string;
    tipo: "Consonante";
    mecanismo_corriente_aire: string;
    estado_glotis_fonacion: string;
    accion_velo_paladar: string;
    punto_articulacion: string;
    modo_articulacion: string;
}

interface Vocal {
    fono: string;
    tipo: "Vocal";
    mecanismo_corriente_aire: string;
    modo_articulacion_abertura: string;
    punto_articulacion_localizacion: string;
    accion_labios_redondeamiento: string;
    accion_velo_paladar_nasalizacion: string;
    estado_cuerdas_vocales_fonacion: string;
}

interface FonoDatabase {
    consonantes: Consonante[];
    vocales: Vocal[];
}

import fonoDatabaseRaw from "./fonos.json";
import attributesDataRaw from "./attributes.json";

const fonoDatabase = fonoDatabaseRaw as FonoDatabase;

// ==========================================
// MAPEOS ESTÁTICOS PARA LAS OPCIONES AFI
// ==========================================
interface ArticulationOption {
    label: string;
    value: string;
}

interface AttributeConfig {
    label: string;
    options: ArticulationOption[];
}

const CONSONANTE_ATRIBUTES = attributesDataRaw.consonantes as Record<string, AttributeConfig>;
const VOCAL_ATRIBUTES = attributesDataRaw.vocales as Record<string, AttributeConfig>;

// Traducciones movidas a LanguageProvider.tsx

// ==========================================
// LÓGICA DE CONFETTI CANVAS
// ==========================================
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

// ==========================================
// MODELOS DE ESTADÍSTICAS
// ==========================================
interface GameStats {
    played: number;
    won: number;
    currentStreak: number;
    maxStreak: number;
    guessesDistribution: number[];
}

const createDefaultStats = (): GameStats => ({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessesDistribution: [0, 0, 0, 0, 0, 0] // 1 to 6 attempts
});

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function CazafonosPage() {
    const { activeStyle, setActiveGameName } = useGameConfig();
    const { t: fullTranslations } = useLanguage();
    const t = fullTranslations.cazafonos;

    // Establecer el nombre del juego activo en el header
    useEffect(() => {
        setActiveGameName("Cazafonos");
        return () => setActiveGameName(null);
    }, [setActiveGameName]);

    // Filtrar la base de datos para omitir los templates vacíos "[  ]"
    const validConsonants = fonoDatabase.consonantes.filter(c => c.fono.replace(/[\[\]\s]/g, "") !== "");
    const validVowels = fonoDatabase.vocales.filter(v => v.fono.replace(/[\[\]\s]/g, "") !== "");
    const playableFonos: Array<Consonante | Vocal> = [...validConsonants, ...validVowels];

    // Estados del Juego
    const [mounted, setMounted] = useState(false);
    const [targetFono, setTargetFono] = useState<Consonante | Vocal | null>(null);
    const [attempts, setAttempts] = useState<number>(0);
    const [maxAttempts] = useState<number>(6);
    const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");

    // Selección del tipo
    const [selectedTipo, setSelectedTipo] = useState<"Consonante" | "Vocal" | null>(null);

    // Selección de rasgos (etiquetas internas de valor)
    const [selections, setSelections] = useState<Record<string, string>>({});
    // Resultados de la validación por atributo (true: correcto, false: incorrecto)
    const [validatedAttributes, setValidatedAttributes] = useState<Record<string, boolean>>({});

    // Modals y Alertas
    const [showHelp, setShowHelp] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Animación y Canvas
    const [shakeAttrKey, setShakeAttrKey] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const confettiAnimationRef = useRef<number | null>(null);

    // Estadísticas
    const [stats, setStats] = useState<GameStats | null>(null);

    const startNewRound = () => {
        if (playableFonos.length === 0) return;
        const randomFono = playableFonos[Math.floor(Math.random() * playableFonos.length)];
        setTargetFono(randomFono);

        // Reset de estados
        setAttempts(0);
        setGameStatus("playing");
        setSelectedTipo(null);
        setSelections({});
        setValidatedAttributes({});
        setAlertMessage(null);
        setShowResultModal(false);

        // Cancelar confeti si está corriendo
        if (confettiAnimationRef.current) {
            cancelAnimationFrame(confettiAnimationRef.current);
            confettiAnimationRef.current = null;
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx && canvasRef.current) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    };

    // Cargar estadísticas e iniciar el juego al montar
    useEffect(() => {
        const savedStats = localStorage.getItem("cazafonos-stats");
        if (savedStats) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setStats(JSON.parse(savedStats));
            } catch (e) {
                console.error("Error cargando estadísticas de Cazafonos", e);
                setStats(createDefaultStats());
            }
        } else {
            setStats(createDefaultStats());
        }

        startNewRound();
        setMounted(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectTipo = (tipo: "Consonante" | "Vocal") => {
        if (gameStatus !== "playing") return;
        setSelectedTipo(tipo);

        // Inicializar con valores automáticos si solo hay 1 opción para evitar mutaciones en render
        const initialSelections: Record<string, string> = {};
        const attributes = tipo === "Consonante" ? CONSONANTE_ATRIBUTES : VOCAL_ATRIBUTES;
        Object.entries(attributes).forEach(([key, attr]) => {
            if (attr.options.length === 1) {
                initialSelections[key] = attr.options[0].value;
            }
        });

        setSelections(initialSelections);
        setValidatedAttributes({});
        setAlertMessage(null);
    };

    const handleSelectAttribute = (key: string, value: string) => {
        if (gameStatus !== "playing") return;
        // Si ya está validado y es correcto, no permitir cambiarlo
        if (validatedAttributes[key]) return;

        setSelections(prev => ({
            ...prev,
            [key]: value
        }));
        setAlertMessage(null);
    };

    const triggerConfetti = () => {
        if (canvasRef.current) {
            runConfetti(canvasRef.current, confettiAnimationRef);
        }
    };

    const triggerShakeAttribute = (key: string) => {
        setShakeAttrKey(key);
        setTimeout(() => setShakeAttrKey(null), 500);
    };

    const updateStats = (status: "won" | "lost", finalAttempts: number) => {
        setStats(prev => {
            const currentStats = prev ? { ...prev } : createDefaultStats();
            currentStats.played += 1;

            if (status === "won") {
                currentStats.won += 1;
                currentStats.currentStreak += 1;
                if (currentStats.currentStreak > currentStats.maxStreak) {
                    currentStats.maxStreak = currentStats.currentStreak;
                }
                const winIdx = finalAttempts - 1;
                if (winIdx >= 0 && winIdx < 6) {
                    currentStats.guessesDistribution[winIdx] += 1;
                }
            } else {
                currentStats.currentStreak = 0;
            }

            localStorage.setItem("cazafonos-stats", JSON.stringify(currentStats));
            return currentStats;
        });
    };

    const handleCheckAnswer = () => {
        if (gameStatus !== "playing" || !targetFono || !selectedTipo) return;

        // Comprobar que el tipo sea correcto primero
        if (selectedTipo !== targetFono.tipo) {
            // El tipo es incorrecto, sumamos intento y fallamos todo
            const nextAttempts = attempts + 1;
            setAttempts(nextAttempts);

            setAlertMessage(selectedTipo === "Consonante" ? t.incorrectTypeConsonante : t.incorrectTypeVocal);
            if (nextAttempts >= maxAttempts) {
                setGameStatus("lost");
                updateStats("lost", nextAttempts);
                setShowResultModal(true);
            }
            return;
        }

        // Definir qué atributos verificar
        const isConsonant = selectedTipo === "Consonante";
        const attributesToVerify = isConsonant
            ? Object.keys(CONSONANTE_ATRIBUTES)
            : Object.keys(VOCAL_ATRIBUTES);

        // Validar que todos los atributos requeridos estén seleccionados
        const missingAttrs = attributesToVerify.filter(attr => !selections[attr]);
        if (missingAttrs.length > 0) {
            setAlertMessage(t.selectRequired);
            // Hacer vibrar los campos vacíos
            missingAttrs.forEach(attr => triggerShakeAttribute(attr));
            return;
        }

        const newValidations: Record<string, boolean> = { ...validatedAttributes };
        let allCorrect = true;
        const targetFonoRecord = targetFono as unknown as Record<string, string>;

        attributesToVerify.forEach(attr => {
            const userVal = selections[attr];
            const targetVal = targetFonoRecord[attr];

            // Comparamos el valor del mapeo estático con el valor en la DB
            if (userVal === targetVal) {
                newValidations[attr] = true;
            } else {
                newValidations[attr] = false;
                allCorrect = false;
                triggerShakeAttribute(attr);
            }
        });

        setValidatedAttributes(newValidations);
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);

        if (allCorrect) {
            setGameStatus("won");
            updateStats("won", nextAttempts);
            setTimeout(() => {
                setShowResultModal(true);
                triggerConfetti();
            }, 600);
        } else {
            if (nextAttempts >= maxAttempts) {
                setGameStatus("lost");
                updateStats("lost", nextAttempts);
                setTimeout(() => {
                    setShowResultModal(true);
                }, 600);
            }
        }
    };

    const handleRevealSolution = () => {
        if (gameStatus !== "playing" || !targetFono) return;

        // Revelar todo
        const isConsonant = targetFono.tipo === "Consonante";
        setSelectedTipo(targetFono.tipo);

        const attributes = isConsonant ? CONSONANTE_ATRIBUTES : VOCAL_ATRIBUTES;
        const newSelections: Record<string, string> = {};
        const newValidations: Record<string, boolean> = {};
        const targetFonoRecord = targetFono as unknown as Record<string, string>;

        Object.keys(attributes).forEach(attr => {
            const targetVal = targetFonoRecord[attr];
            newSelections[attr] = targetVal;
            newValidations[attr] = true;
        });

        setSelections(newSelections);
        setValidatedAttributes(newValidations);
        setGameStatus("lost");
        updateStats("lost", attempts + 1);
        setShowResultModal(true);
    };

    const handleResetStats = () => {
        if (window.confirm(t.statsResetConfirm)) {
            const def = createDefaultStats();
            setStats(def);
            localStorage.setItem("cazafonos-stats", JSON.stringify(def));
        }
    };

    const handleShareResult = () => {
        if (!targetFono) return;
        const statusIcon = gameStatus === "won" ? "🟢" : "🔴";
        let text = `Cazafonos AFI ${attempts}/${maxAttempts} ${statusIcon}\n`;
        text += `Fono adivinado: ${targetFono.fono}\n\n`;

        // Generar grilla de atributos
        const isConsonant = targetFono.tipo === "Consonante";
        const attrs = isConsonant ? CONSONANTE_ATRIBUTES : VOCAL_ATRIBUTES;
        Object.keys(attrs).forEach(attr => {
            const correct = validatedAttributes[attr];
            text += `${correct ? "🟩" : "🟥"} ${(t.labels as Record<string, string>)[attrs[attr].label] || attrs[attr].label}\n`;
        });

        text += `\nJuega aquí: ${window.location.href}`;

        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    if (!mounted || !targetFono) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-indigo-500" />
            </div>
        );
    }

    const targetFonoRecord = targetFono as unknown as Record<string, string>;
    const winRate = stats && stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    const isConsonant = selectedTipo === "Consonante";
    const attributeSchema = isConsonant ? CONSONANTE_ATRIBUTES : VOCAL_ATRIBUTES;

    return (
        <div
            style={{
                backgroundColor: activeStyle.bg,
                color: activeStyle.text,
            }}
            className="min-h-[calc(100vh-65px)] pt-6 px-4 sm:px-6 pb-8 transition-colors duration-500 relative flex flex-col items-center justify-between"
        >
            {/* Canvas de Confeti */}
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

            {/* Menús de Navegación y Botones Superiores */}
            <div className="w-full max-w-2xl flex items-center justify-between gap-4 mb-4 select-none">
                <button
                    onClick={() => setShowHelp(true)}
                    style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl border shadow-sm text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    title={t.howToPlay}
                >
                    <HelpCircle className="w-4 h-4" style={{ color: activeStyle.accent }} />
                    <span className="hidden sm:inline">{t.howToPlay}</span>
                </button>

                <button
                    onClick={() => setShowStats(true)}
                    style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl border shadow-sm text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    title={t.stats}
                >
                    <BarChart2 className="w-4 h-4" style={{ color: activeStyle.accent }} />
                    <span className="hidden sm:inline">{t.stats}</span>
                </button>

                <button
                    onClick={startNewRound}
                    style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl border shadow-sm text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    title={t.reset}
                >
                    <RefreshCw className="w-4 h-4" style={{ color: activeStyle.accent }} />
                    <span className="hidden sm:inline">{t.reset}</span>
                </button>
            </div>

            {/* Cabecera / Títulos */}
            <header className="w-full max-w-xl flex flex-col items-center mb-6 text-center animate-mode-change">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight select-none">
                    {t.title}
                </h1>
                <p style={{ color: activeStyle.textMuted }} className="text-xs sm:text-sm font-semibold max-w-lg mt-2 mx-auto leading-relaxed px-2">
                    {t.subtitle}
                </p>
            </header>

            {/* Visualizador del Fono AFI */}
            <div className="w-full max-w-md flex flex-col items-center mb-6">
                <div
                    style={{
                        backgroundColor: activeStyle.card,
                        borderColor: activeStyle.border,
                        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.05)`,
                    }}
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl border flex items-center justify-center select-none shadow-md animate-float relative overflow-hidden backdrop-blur-md"
                >
                    {/* Detalles decorativos glassmorphic */}
                    <div style={{ backgroundColor: `${activeStyle.accent}10` }} className="absolute -top-12 -left-12 w-28 h-28 rounded-full blur-xl" />
                    <div style={{ backgroundColor: `${activeStyle.accent}15` }} className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-xl" />

                    <span
                        className="text-6xl sm:text-7xl font-extrabold font-mono tracking-wider drop-shadow-sm z-10"
                        style={{ color: activeStyle.text }}
                    >
                        {targetFono.fono}
                    </span>
                </div>

                {/* Intentos y feedback */}
                <div className="mt-4 flex items-center gap-3">
                    <span
                        style={{ color: activeStyle.textMuted }}
                        className="text-xs sm:text-sm font-bold uppercase tracking-wide bg-black/5 dark:bg-white/5 px-3 py-1 rounded-lg border border-black/5 dark:border-white/5"
                    >
                        {attempts >= maxAttempts - 1 ? t.attemptsSingle : t.attemptsLeft(maxAttempts - attempts)}
                    </span>
                    {gameStatus !== "playing" && (
                        <button
                            onClick={() => setShowResultModal(true)}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="text-xs font-bold px-3 py-1 rounded-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                            <Award className="w-3.5 h-3.5" />
                            <span>{t.viewResultBtn}</span>
                        </button>
                    )}
                </div>

                {alertMessage && (
                    <div className="w-full mt-4 p-3 rounded-2xl border text-center text-xs font-bold bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-shake shadow-xs">
                        {alertMessage}
                    </div>
                )}
            </div>

            {/* Panel de Selección */}
            <main className="w-full max-w-2xl flex-1 flex flex-col items-center select-none">
                {/* 1. Selección de tipo: Consonante vs Vocal */}
                <div className="w-full flex flex-col gap-3 mb-6">
                    <h2 style={{ color: activeStyle.text }} className="text-sm sm:text-base font-extrabold text-center uppercase tracking-wide">
                        {t.typePrompt}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {(["Consonante", "Vocal"] as const).map(tipo => {
                            const isSelected = selectedTipo === tipo;
                            const isCorrectType = targetFono.tipo === tipo;
                            const isSubmitted = attempts > 0;

                            let btnBg = activeStyle.card;
                            let btnText = activeStyle.text;
                            let btnBorder = activeStyle.border;

                            if (isSelected) {
                                btnBg = activeStyle.accent;
                                btnText = activeStyle.btnText;
                                btnBorder = activeStyle.accent;
                            }

                            // Feedback visual si se ha intentado y es incorrecto el tipo
                            const typeWasValidated = isSubmitted && isSelected && !isCorrectType;

                            return (
                                <button
                                    key={tipo}
                                    onClick={() => handleSelectTipo(tipo)}
                                    style={{
                                        backgroundColor: typeWasValidated ? "#EF4444" : btnBg,
                                        color: typeWasValidated ? "#FFFFFF" : btnText,
                                        borderColor: typeWasValidated ? "#EF4444" : btnBorder,
                                    }}
                                    className={`py-3.5 rounded-2xl border-2 text-sm sm:text-base font-extrabold tracking-wide text-center transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-sm cursor-pointer`}
                                >
                                    {tipo === "Consonante" ? t.consonante : t.vocal}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Listado de rasgos a rellenar */}
                {selectedTipo && (
                    <div className="w-full flex flex-col gap-5 animate-scale-in">
                        <h3 style={{ color: activeStyle.text }} className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-center border-b pb-2">
                            {t.attributesLabel}
                        </h3>

                        <div className="flex flex-col gap-4">
                            {Object.entries(attributeSchema).map(([key, attr]) => {
                                const isCorrect = validatedAttributes[key] === true;
                                const isIncorrect = validatedAttributes[key] === false;
                                const currentValue = selections[key] || "";
                                const isShaking = shakeAttrKey === key;

                                // Si la vocal tiene mecanismo de corriente de aire o cuerdas vocales, solo hay 1 opción.
                                // O si es correcta, bloquear edición.
                                const isLocked = isCorrect || attr.options.length <= 1;

                                return (
                                    <div
                                        key={key}
                                        style={{
                                            backgroundColor: isCorrect ? `${activeStyle.card}80` : activeStyle.card,
                                            borderColor: isCorrect
                                                ? "#10B981"
                                                : isIncorrect
                                                    ? "#EF4444"
                                                    : activeStyle.border,
                                        }}
                                        className={`p-4 rounded-2xl border-2 flex flex-col gap-3.5 shadow-sm transition-all duration-300 ${isShaking ? "animate-shake" : ""}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span style={{ color: activeStyle.text }} className="text-xs sm:text-sm font-extrabold">
                                                {(t.labels as Record<string, string>)[attr.label] || attr.label}
                                            </span>
                                            {isCorrect && (
                                                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                                                    <Check className="w-3 h-3" />
                                                    <span>{t.correctLabel}</span>
                                                </span>
                                            )}
                                            {isIncorrect && (
                                                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25">
                                                    <X className="w-3 h-3" />
                                                    <span>{t.incorrectLabel}</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Botones/pills de selección */}
                                        <div className="flex flex-wrap gap-2">
                                            {attr.options.map(option => {
                                                const isOptionSelected = currentValue === option.value;

                                                let pillBg = `${activeStyle.keyBg}50`;
                                                let pillText = activeStyle.text;
                                                let pillBorder = "transparent";

                                                if (isOptionSelected) {
                                                    pillBg = activeStyle.accent;
                                                    pillText = activeStyle.btnText;
                                                    pillBorder = activeStyle.accent;
                                                }

                                                // Si es correcto, pintar verde el seleccionado
                                                if (isCorrect && isOptionSelected) {
                                                    pillBg = "#10B981";
                                                    pillText = "#FFFFFF";
                                                    pillBorder = "#10B981";
                                                }

                                                return (
                                                    <button
                                                        key={option.value}
                                                        disabled={isLocked}
                                                        onClick={() => handleSelectAttribute(key, option.value)}
                                                        style={{
                                                            backgroundColor: pillBg,
                                                            color: pillText,
                                                            borderColor: pillBorder
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full border text-xxs sm:text-xs font-semibold shadow-2xs transition-all ${isLocked ? "opacity-90 cursor-not-allowed" : "hover:scale-[1.04] active:scale-[0.96] cursor-pointer"}`}
                                                    >
                                                        {(t.labels as Record<string, string>)[option.label] || option.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Botón de envío de respuestas */}
                        {gameStatus === "playing" && (
                            <div className="flex items-center gap-3 w-full mt-4">
                                <button
                                    onClick={handleRevealSolution}
                                    style={{
                                        backgroundColor: `${activeStyle.keyBg}60`,
                                        color: activeStyle.text,
                                        borderColor: activeStyle.border
                                    }}
                                    className="px-4 py-3 rounded-2xl border text-xs sm:text-sm font-extrabold hover:bg-opacity-80 transition-all flex items-center justify-center cursor-pointer flex-1"
                                >
                                    {t.revealBtn}
                                </button>
                                <button
                                    onClick={handleCheckAnswer}
                                    style={{
                                        backgroundColor: activeStyle.accent,
                                        color: activeStyle.btnText,
                                    }}
                                    className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold hover:scale-[1.02] active:scale-[0.98] shadow-md transition-all flex items-center justify-center cursor-pointer flex-[2]"
                                >
                                    {t.checkBtn}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal de Ayuda */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-[calc(100vw-2rem)] max-w-lg p-5 sm:p-8 rounded-3xl shadow-xl flex flex-col gap-4 relative animate-scale-in max-h-[85dvh] overflow-y-auto overscroll-behavior-contain"
                    >
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-center border-b pb-3 uppercase tracking-wider">
                            {t.helpTitle}
                        </h2>
                        <p className="text-xs sm:text-sm leading-relaxed">{t.helpIntro}</p>

                        <div className="flex flex-col gap-3 mt-1.5">
                            {t.helpSteps.map((step: string, index: number) => (
                                <p key={index} className="text-xs sm:text-sm font-medium leading-relaxed">
                                    {step}
                                </p>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowHelp(false)}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="w-full py-3 rounded-2xl text-xs sm:text-sm font-extrabold mt-2 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-sm text-center"
                        >
                            {t.btnUnderstood}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Estadísticas */}
            {showStats && stats && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-[calc(100vw-2rem)] max-w-lg p-5 sm:p-8 rounded-3xl shadow-xl flex flex-col gap-4 relative animate-scale-in max-h-[85dvh] overflow-y-auto overscroll-behavior-contain"
                    >
                        <button
                            onClick={() => setShowStats(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-center border-b pb-3 uppercase tracking-wider">
                            {t.stats}
                        </h2>

                        {stats.played > 0 ? (
                            <div className="flex flex-col gap-6">
                                {/* Grid de números rápidos */}
                                <div className="grid grid-cols-4 gap-2 text-center select-none">
                                    <div>
                                        <div className="text-xl sm:text-3xl font-extrabold">{stats.played}</div>
                                        <div style={{ color: activeStyle.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">{t.statsPlayed}</div>
                                    </div>
                                    <div>
                                        <div className="text-xl sm:text-3xl font-extrabold">{stats.won}</div>
                                        <div style={{ color: activeStyle.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">{t.statsWon}</div>
                                    </div>
                                    <div>
                                        <div className="text-xl sm:text-3xl font-extrabold">{winRate}%</div>
                                        <div style={{ color: activeStyle.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">{t.statsWinRate}</div>
                                    </div>
                                    <div>
                                        <div className="text-xl sm:text-3xl font-extrabold">{stats.currentStreak}</div>
                                        <div style={{ color: activeStyle.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">{t.statsCurrentStreak}</div>
                                    </div>
                                </div>

                                {/* Distribución de intentos */}
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-1">
                                        {t.statsDistribution}
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {stats.guessesDistribution.map((count, index) => {
                                            const maxCount = Math.max(...stats.guessesDistribution);
                                            const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                            return (
                                                <div key={index} className="flex items-center gap-3 text-xs">
                                                    <span className="font-bold w-3 shrink-0">{index + 1}</span>
                                                    <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-full h-5 overflow-hidden">
                                                        <div
                                                            style={{
                                                                width: `${Math.max(widthPercent, 8)}%`,
                                                                backgroundColor: count > 0 ? activeStyle.accent : `${activeStyle.textMuted}30`
                                                            }}
                                                            className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-inner"
                                                        >
                                                            {count}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Botón de reset stats */}
                                <button
                                    onClick={handleResetStats}
                                    className="text-[10px] font-extrabold uppercase text-rose-500 hover:text-rose-600 transition-colors self-center mt-2 cursor-pointer"
                                >
                                    {t.statsResetBtn}
                                </button>
                            </div>
                        ) : (
                            <p style={{ color: activeStyle.textMuted }} className="text-center font-bold text-sm py-8 select-none">
                                {t.statsNoData}
                            </p>
                        )}

                        <button
                            onClick={() => setShowStats(false)}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="w-full py-3 rounded-2xl text-xs sm:text-sm font-extrabold mt-2 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-sm text-center"
                        >
                            {t.btnClose}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Resultado (Victoria/Derrota) */}
            {showResultModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-[calc(100vw-2rem)] max-w-sm p-5 sm:p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 relative animate-scale-in text-center"
                    >
                        <button
                            onClick={() => setShowResultModal(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">
                            {gameStatus === "won" ? t.winTitle : t.loseTitle}
                        </h2>

                        <p className="text-xs sm:text-sm font-semibold max-w-xs leading-relaxed">
                            {gameStatus === "won" ? t.winDesc(attempts) : t.loseDesc}
                        </p>

                        <div className="w-full py-4 border-y my-2 flex flex-col items-center gap-2 select-none">
                            <span style={{ color: activeStyle.textMuted }} className="text-xxs sm:text-xs font-bold uppercase tracking-wider">
                                {t.solutionWas}
                            </span>
                            <span className="text-4xl font-extrabold font-mono tracking-widest" style={{ color: activeStyle.accent }}>
                                {targetFono.fono}
                            </span>
                            <span className="text-xs font-extrabold bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border">
                                {targetFono.tipo === "Consonante" ? t.consonante : t.vocal}: {targetFono.tipo === "Consonante"
                                    ? `${(t.labels as Record<string, string>)[targetFonoRecord.punto_articulacion] || targetFonoRecord.punto_articulacion} • ${(t.labels as Record<string, string>)[targetFonoRecord.modo_articulacion] || targetFonoRecord.modo_articulacion}`
                                    : `${(t.labels as Record<string, string>)[targetFonoRecord.modo_articulacion_abertura] || targetFonoRecord.modo_articulacion_abertura} • ${(t.labels as Record<string, string>)[targetFonoRecord.punto_articulacion_localizacion] || targetFonoRecord.punto_articulacion_localizacion}`}
                            </span>
                        </div>

                        {/* Botones de acción del modal */}
                        <div className="flex flex-col gap-2.5 w-full mt-2">
                            <button
                                onClick={handleShareResult}
                                style={{ backgroundColor: `${activeStyle.accent}20`, color: activeStyle.accent, borderColor: `${activeStyle.accent}40` }}
                                className="w-full py-3 rounded-2xl border text-xs sm:text-sm font-extrabold hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>{copySuccess ? t.copied : t.share}</span>
                            </button>

                            <button
                                onClick={() => {
                                    startNewRound();
                                    setShowResultModal(false);
                                }}
                                style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                                className="w-full py-3 rounded-2xl text-xs sm:text-sm font-extrabold hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>{t.playAgain}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Estilos CSS locales */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-4px); }
                    40%, 80% { transform: translateX(4px); }
                }
                @keyframes modeTransition {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-scale-in {
                    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
                .animate-mode-change {
                    animation: modeTransition 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
