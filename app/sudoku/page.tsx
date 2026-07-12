"use client";

import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, RefreshCw, Share2, BarChart2, X, Clock, Pencil, Lightbulb, Eraser, Trophy, ChevronDown } from "lucide-react";
import { useGameConfig } from "@/components/GameConfigContext";
import { useLanguage } from "@/components/LanguageProvider";

// Difficulty levels mapping
type Difficulty = "facil" | "medio" | "dificil" | "experto" | "maestro" | "extremo";

const DIFFICULTY_PRESETS: Record<Difficulty, { clues: number; nameKey: "difficultyEasy" | "difficultyMedium" | "difficultyHard" | "difficultyExpert" | "difficultyMaster" | "difficultyExtreme"; }> = {
    facil: { clues: 38, nameKey: "difficultyEasy" },
    medio: { clues: 32, nameKey: "difficultyMedium" },
    dificil: { clues: 27, nameKey: "difficultyHard" },
    experto: { clues: 23, nameKey: "difficultyExpert" },
    maestro: { clues: 19, nameKey: "difficultyMaster" },
    extremo: { clues: 17, nameKey: "difficultyExtreme" },
};

interface DifficultyStats {
    played: number;
    won: number;
    currentStreak: number;
    maxStreak: number;
    bestTime: number | null; // in seconds
    totalTime: number; // in seconds
}

type GameStats = Record<Difficulty, DifficultyStats>;

const createDefaultDifficultyStats = (): DifficultyStats => ({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    bestTime: null,
    totalTime: 0,
});

const createDefaultStats = (): GameStats => ({
    facil: createDefaultDifficultyStats(),
    medio: createDefaultDifficultyStats(),
    dificil: createDefaultDifficultyStats(),
    experto: createDefaultDifficultyStats(),
    maestro: createDefaultDifficultyStats(),
    extremo: createDefaultDifficultyStats(),
});

// Canvas Confetti animator
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

// Sudoku Logic Engine Helpers
const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
        if (grid[x][col] === num) return false;
    }
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) return false;
        }
    }
    return true;
};

// OPTIMIZADO: Resolvedor backtracking indexado (Forward-scanning)
const solveSudokuRandom = (grid: number[][]): boolean => {
    const emptyCells: { r: number; c: number; }[] = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }

    const solve = (index: number): boolean => {
        if (index === emptyCells.length) {
            return true;
        }

        const { r, c } = emptyCells[index];
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Fisher-Yates Shuffle
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        for (const num of numbers) {
            if (isValid(grid, r, c, num)) {
                grid[r][c] = num;
                if (solve(index + 1)) {
                    return true;
                }
                grid[r][c] = 0;
            }
        }
        return false;
    };

    return solve(0);
};

// OPTIMIZADO: Contador de soluciones indexado (Forward-scanning)
const countSolutions = (grid: number[][], limit: number = 2): number => {
    let count = 0;
    const emptyCells: { r: number; c: number; }[] = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }

    const check = (index: number): boolean => {
        if (index === emptyCells.length) {
            count++;
            return count >= limit;
        }

        const { r, c } = emptyCells[index];
        for (let num = 1; num <= 9; num++) {
            if (isValid(grid, r, c, num)) {
                grid[r][c] = num;
                if (check(index + 1)) {
                    grid[r][c] = 0;
                    return true;
                }
                grid[r][c] = 0;
            }
        }
        return false;
    };

    check(0);
    return count;
};

const generateSudokuBoard = (targetClues: number): { solution: number[][]; puzzle: number[][]; } => {
    let bestPuzzle: number[][] = [];
    let bestCluesCount = 81;
    let finalSolution: number[][] = [];

    // Intentos de generación
    for (let attempt = 0; attempt < 3; attempt++) {
        const solution: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
        solveSudokuRandom(solution);

        const puzzle: number[][] = solution.map(row => [...row]);
        const positions: { r: number; c: number; }[] = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                positions.push({ r, c });
            }
        }

        // Shuffle cells
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        let cluesCount = 81;
        for (const pos of positions) {
            if (cluesCount <= targetClues) break;

            const backup = puzzle[pos.r][pos.c];
            puzzle[pos.r][pos.c] = 0;
            cluesCount--;

            if (countSolutions(puzzle.map(row => [...row]), 2) !== 1) {
                puzzle[pos.r][pos.c] = backup;
                cluesCount++;
            }
        }

        if (cluesCount < bestCluesCount) {
            bestCluesCount = cluesCount;
            bestPuzzle = puzzle;
            finalSolution = solution;
        }

        if (bestCluesCount <= targetClues + 1) break;
    }

    return { solution: finalSolution, puzzle: bestPuzzle };
};

// Pure helper to extract random element
const getRandomElement = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};

export default function SudokuPage() {
    const { activeStyle, setActiveGameName, themeMode } = useGameConfig();
    const { gameLang, t: fullTranslations } = useLanguage();
    const t = fullTranslations.sudoku;

    // Game states
    const [difficulty, setDifficulty] = useState<Difficulty>("facil");
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | "none">("none");

    const [initialGrid, setInitialGrid] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
    const [currentGrid, setCurrentGrid] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
    const [solutionGrid, setSolutionGrid] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
    const [pencilNotes, setPencilNotes] = useState<number[][][]>(() => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
    const [hintCells, setHintCells] = useState<boolean[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(false)));

    const [selectedCell, setSelectedCell] = useState<{ r: number; c: number; } | null>(null);
    const [pencilMode, setPencilMode] = useState<boolean>(false);
    const [hintsLeft, setHintsLeft] = useState<number>(3);
    const [gameStatus, setGameStatus] = useState<"playing" | "won">("playing");

    // Timer state
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [timerActive, setTimerActive] = useState<boolean>(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerStartedRef = useRef<boolean>(false);

    // Modals
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [showResultModal, setShowResultModal] = useState<boolean>(false);
    const [showStats, setShowStats] = useState<boolean>(false);
    const [stats, setStats] = useState<GameStats | null>(null);
    const [statsTab, setStatsTab] = useState<Difficulty | "global">("global");

    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    const [shakeBoard, setShakeBoard] = useState<boolean>(false);

    // Canvas Confetti
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const confettiAnimationRef = useRef<number | null>(null);

    // Dropdown de dificultad en móvil
    const diffMenuRef = useRef<HTMLDivElement>(null);
    const [showDiffMenu, setShowDiffMenu] = useState<boolean>(false);

    // Cerrar menú de dificultad al hacer click afuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (diffMenuRef.current && !diffMenuRef.current.contains(event.target as Node)) {
                setShowDiffMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Set game launcher name
    useEffect(() => {
        setActiveGameName("Sudoku");
        return () => setActiveGameName(null);
    }, [setActiveGameName]);

    // Timer starter
    function startTimerIfNeeded() {
        if (!timerStartedRef.current && gameStatus === "playing") {
            timerStartedRef.current = true;
            setTimerActive(true);
        }
    }

    // Initialize/Reset game
    function startNewGame(diff: Difficulty = difficulty, anim: boolean = true) {
        if (anim && diff !== difficulty) {
            setSlideDirection(diff === "facil" || difficulty === "extremo" ? "right" : "left");
        } else {
            setSlideDirection("none");
        }
        setDifficulty(diff);

        // Generate board based on preset starting values
        const preset = DIFFICULTY_PRESETS[diff];
        const { solution, puzzle } = generateSudokuBoard(preset.clues);

        setInitialGrid(puzzle.map(row => [...row]));
        setCurrentGrid(puzzle.map(row => [...row]));
        setSolutionGrid(solution);
        setPencilNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
        setHintCells(Array.from({ length: 9 }, () => Array(9).fill(false)));

        setSelectedCell(null);
        setHintsLeft(3);
        setGameStatus("playing");

        // Reset timer
        setTimeElapsed(0);
        setTimerActive(false);
        timerStartedRef.current = false;
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
    }

    // Input actions
    function handleCellInput(r: number, c: number, val: number) {
        if (initialGrid[r][c] !== 0 || gameStatus !== "playing") return;

        startTimerIfNeeded();

        if (pencilMode) {
            setCurrentGrid(prev => {
                const next = prev.map(row => [...row]);
                next[r][c] = 0;
                return next;
            });
            setPencilNotes(prev => {
                const next = prev.map(row => row.map(cell => [...cell]));
                const currentNotes = next[r][c];
                if (currentNotes.includes(val)) {
                    next[r][c] = currentNotes.filter(n => n !== val);
                } else {
                    next[r][c] = [...currentNotes, val].sort();
                }
                return next;
            });
        } else {
            setPencilNotes(prev => {
                return prev.map((row, curR) =>
                    row.map((cellNotes, curC) => {
                        if (curR === r && curC === c) return [];

                        const sameRow = curR === r;
                        const sameCol = curC === c;

                        const sRow = r - r % 3;
                        const sCol = c - c % 3;
                        const curSRow = curR - curR % 3;
                        const curSCol = curC - curC % 3;
                        const sameSubgrid = sRow === curSRow && sCol === curSCol;

                        if ((sameRow || sameCol || sameSubgrid) && cellNotes.includes(val)) {
                            return cellNotes.filter(n => n !== val);
                        }
                        return cellNotes;
                    })
                );
            });

            const newGrid = currentGrid.map((row, curR) =>
                row.map((cell, curC) => (curR === r && curC === c ? val : cell))
            );
            setCurrentGrid(newGrid);

            // Check if game is completed
            checkWinState(newGrid);
        }
    }

    function handleClearCell(r: number, c: number) {
        if (initialGrid[r][c] !== 0 || gameStatus !== "playing") return;

        startTimerIfNeeded();

        setCurrentGrid(prev => {
            const next = prev.map(row => [...row]);
            next[r][c] = 0;
            return next;
        });
        setPencilNotes(prev => {
            const next = prev.map(row => row.map(cell => [...cell]));
            next[r][c] = [];
            return next;
        });
    }

    function checkWinState(grid: number[][]) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] !== solutionGrid[r][c]) {
                    return;
                }
            }
        }

        // Won!
        setGameStatus("won");
        setTimerActive(false);
        recordStats();

        setTimeout(() => {
            setShowResultModal(true);
            if (canvasRef.current) {
                runConfetti(canvasRef.current, confettiAnimationRef);
            }
        }, 800);
    }

    function revealCellHint(r: number, c: number) {
        const correctVal = solutionGrid[r][c];

        setPencilNotes(prev => {
            return prev.map((row, curR) =>
                row.map((cellNotes, curC) => {
                    if (curR === r && curC === c) return [];

                    const sameRow = curR === r;
                    const sameCol = curC === c;

                    const sRow = r - r % 3;
                    const sCol = c - c % 3;
                    const curSRow = curR - curR % 3;
                    const curSCol = curC - curC % 3;
                    const sameSubgrid = sRow === curSRow && sCol === curSCol;

                    if ((sameRow || sameCol || sameSubgrid) && cellNotes.includes(correctVal)) {
                        return cellNotes.filter(n => n !== correctVal);
                    }
                    return cellNotes;
                })
            );
        });

        setHintCells(prev => {
            const next = prev.map(row => [...row]);
            next[r][c] = true;
            return next;
        });

        setCurrentGrid(prev => {
            const next = prev.map(row => [...row]);
            next[r][c] = correctVal;
            checkWinState(next);
            return next;
        });

        setHintsLeft(prev => prev - 1);
    }

    function triggerHint() {
        if (hintsLeft <= 0 || gameStatus !== "playing") {
            setShakeBoard(true);
            setTimeout(() => setShakeBoard(false), 500);
            return;
        }

        startTimerIfNeeded();

        if (selectedCell) {
            const { r, c } = selectedCell;
            if (initialGrid[r][c] === 0 && currentGrid[r][c] !== solutionGrid[r][c]) {
                revealCellHint(r, c);
                return;
            }
        }

        const candidates: { r: number; c: number; }[] = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (initialGrid[r][c] === 0 && currentGrid[r][c] !== solutionGrid[r][c]) {
                    candidates.push({ r, c });
                }
            }
        }

        if (candidates.length > 0) {
            const randomPick = getRandomElement(candidates);
            setSelectedCell(randomPick);
            revealCellHint(randomPick.r, randomPick.c);
        }
    }

    // Statistics persistence
    function recordStats() {
        setStats(prevStats => {
            const currentStats = prevStats ? { ...prevStats } : createDefaultStats();
            const diffStats = { ...currentStats[difficulty] };

            diffStats.played += 1;
            diffStats.won += 1;
            diffStats.currentStreak += 1;
            if (diffStats.currentStreak > diffStats.maxStreak) {
                diffStats.maxStreak = diffStats.currentStreak;
            }

            diffStats.totalTime += timeElapsed;
            if (diffStats.bestTime === null || timeElapsed < diffStats.bestTime) {
                diffStats.bestTime = timeElapsed;
            }

            currentStats[difficulty] = diffStats;
            localStorage.setItem("sudoku-game-stats", JSON.stringify(currentStats));
            return currentStats;
        });
    }

    function handleResetStats() {
        if (window.confirm(t.statsResetConfirm)) {
            const def = createDefaultStats();
            setStats(def);
            localStorage.setItem("sudoku-game-stats", JSON.stringify(def));
        }
    }

    function handleShareResult() {
        const formattedTime = formatTime(timeElapsed);
        const diffName = t[DIFFICULTY_PRESETS[difficulty].nameKey];

        let text = `Sudoku (${diffName}) - ${formattedTime} ⏱️\n\n`;

        for (let r = 0; r < 9; r++) {
            let rowText = "";
            for (let c = 0; c < 9; c++) {
                if (initialGrid[r][c] !== 0) {
                    rowText += "⬛";
                } else if (hintCells[r][c]) {
                    rowText += "🔵";
                } else if (currentGrid[r][c] === solutionGrid[r][c]) {
                    rowText += "⬜";
                } else {
                    rowText += "🟥";
                }
                if (c === 2 || c === 5) rowText += " ";
            }
            text += rowText + "\n";
            if (r === 2 || r === 5) text += "\n";
        }

        text += `\nJuega aquí: ${window.location.href}`;

        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    }

    const isNumberCompleted = (num: number): boolean => {
        let count = 0;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (currentGrid[r][c] === num && currentGrid[r][c] === solutionGrid[r][c]) {
                    count++;
                }
            }
        }
        return count === 9;
    };

    function getActiveStats(): DifficultyStats {
        if (!stats) return createDefaultDifficultyStats();

        if (statsTab !== "global") {
            return stats[statsTab];
        }

        const allKeys = Object.keys(stats) as Difficulty[];
        const aggregated = createDefaultDifficultyStats();
        const validBestTimes: number[] = [];

        allKeys.forEach(k => {
            const s = stats[k];
            aggregated.played += s.played;
            aggregated.won += s.won;
            aggregated.totalTime += s.totalTime;
            aggregated.currentStreak = Math.max(aggregated.currentStreak, s.currentStreak);
            aggregated.maxStreak = Math.max(aggregated.maxStreak, s.maxStreak);
            if (s.bestTime !== null) {
                validBestTimes.push(s.bestTime);
            }
        });

        if (validBestTimes.length > 0) {
            aggregated.bestTime = Math.min(...validBestTimes);
        }

        return aggregated;
    }

    const activeStats = getActiveStats();
    const winRate = activeStats.played > 0 ? Math.round((activeStats.won / activeStats.played) * 100) : 0;

    const formatTime = (secs: number): string => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const getCellStyles = (r: number, c: number) => {
        const styles: React.CSSProperties = {
            borderStyle: "solid",
            borderLeftWidth: c > 0 ? "1px" : "0px",
            borderTopWidth: r > 0 ? "1px" : "0px",
            borderRightWidth: (c === 2 || c === 5) ? "3px" : (c === 8 ? "0px" : "1px"),
            borderBottomWidth: (r === 2 || r === 5) ? "3px" : (r === 8 ? "0px" : "1px"),
            borderColor: activeStyle.border,
        };

        if (c === 2 || c === 5) {
            styles.borderRightColor = activeStyle.text;
        }
        if (r === 2 || r === 5) {
            styles.borderBottomColor = activeStyle.text;
        }

        return styles;
    };

    const isCellSelected = (r: number, c: number): boolean => {
        return selectedCell?.r === r && selectedCell?.c === c;
    };

    const isCellHighlighted = (r: number, c: number): boolean => {
        if (!selectedCell) return false;
        if (selectedCell.r === r || selectedCell.c === c) return true;

        const sRow = selectedCell.r - selectedCell.r % 3;
        const sCol = selectedCell.c - selectedCell.c % 3;
        const cRow = r - r % 3;
        const cCol = c - c % 3;
        return sRow === cRow && sCol === cCol;
    };

    const isCellSameNumber = (r: number, c: number): boolean => {
        if (!selectedCell) return false;
        const selectedVal = currentGrid[selectedCell.r][selectedCell.c];
        if (selectedVal === 0) return false;
        return currentGrid[r][c] === selectedVal;
    };

    const conflicts = Array.from({ length: 9 }, () => Array(9).fill(false));
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = currentGrid[r][c];
            if (val === 0) continue;

            for (let c2 = 0; c2 < 9; c2++) {
                if (c2 !== c && currentGrid[r][c2] === val) {
                    conflicts[r][c] = true;
                    conflicts[r][c2] = true;
                }
            }
            for (let r2 = 0; r2 < 9; r2++) {
                if (r2 !== r && currentGrid[r2][c] === val) {
                    conflicts[r][c] = true;
                    conflicts[r2][c] = true;
                }
            }
            const startR = r - r % 3;
            const startC = c - c % 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const curR = startR + i;
                    const curC = startC + j;
                    if ((curR !== r || curC !== c) && currentGrid[curR][curC] === val) {
                        conflicts[r][c] = true;
                        conflicts[curR][curC] = true;
                    }
                }
            }
        }
    }

    useEffect(() => {
        const savedStatsStr = localStorage.getItem("sudoku-game-stats");
        if (savedStatsStr) {
            try {
                setStats(JSON.parse(savedStatsStr));
            } catch (e) {
                console.error("Error parsing stats", e);
                setStats(createDefaultStats());
            }
        } else {
            setStats(createDefaultStats());
        }
        startNewGame("facil", false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (timerActive) {
            timerIntervalRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [timerActive]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameStatus !== "playing" || showHelp || showResultModal || showStats) return;

            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                let nextRow = selectedCell ? selectedCell.r : 4;
                let nextCol = selectedCell ? selectedCell.c : 4;

                if (!selectedCell) {
                    setSelectedCell({ r: nextRow, c: nextCol });
                    return;
                }

                if (e.key === "ArrowUp") nextRow = (nextRow - 1 + 9) % 9;
                else if (e.key === "ArrowDown") nextRow = (nextRow + 1) % 9;
                else if (e.key === "ArrowLeft") nextCol = (nextCol - 1 + 9) % 9;
                else if (e.key === "ArrowRight") nextCol = (nextCol + 1) % 9;

                setSelectedCell({ r: nextRow, c: nextCol });
                return;
            }

            if (selectedCell) {
                const { r, c } = selectedCell;
                if (initialGrid[r][c] !== 0) return;

                if (/^[1-9]$/.test(e.key)) {
                    const val = parseInt(e.key);
                    if (isNumberCompleted(val)) return;
                    handleCellInput(r, c, val);
                }
                else if (["Backspace", "Delete", "0", " "].includes(e.key)) {
                    handleClearCell(r, c);
                }
                else if (e.key.toLowerCase() === "n") {
                    setPencilMode(prev => !prev);
                }
                else if (e.key.toLowerCase() === "h") {
                    triggerHint();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCell, gameStatus, initialGrid, pencilMode, hintsLeft, showHelp, showResultModal, showStats]);

    const slideClass = slideDirection === "left" ? "animate-slide-left" : slideDirection === "right" ? "animate-slide-right" : "animate-mode-change";

    return (
        <div
            style={{
                backgroundColor: activeStyle.bg,
                color: activeStyle.text,
            }}
            className="min-h-[calc(100vh-65px)] pt-6 xl:pt-10 px-4 sm:px-6 pb-8 transition-colors duration-500 relative flex flex-col items-center justify-between"
        >
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

            <header className={`w-full max-w-xl flex flex-col items-center mb-2 mt-1 xl:mb-3 xl:mt-2 ${slideClass}`} key={`header-${difficulty}`}>
                <div className="text-center flex flex-col items-center">
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight select-none">
                        {t.title}
                    </h1>
                    <p style={{ color: activeStyle.textMuted }} className="text-xxs sm:text-sm font-medium max-w-sm mt-0.5 mb-1 px-2 leading-relaxed">
                        {t.subtitle}
                    </p>

                    <div
                        style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                        className="flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm text-xs sm:text-sm font-semibold select-none animate-soft-pulse mt-0.5"
                    >
                        <Clock className="w-3.5 h-3.5 opacity-75" />
                        <span>{t.timeLabel}: <span className="font-bold tabular-nums">{formatTime(timeElapsed)}</span></span>
                    </div>
                </div>
            </header>

            <div className="w-full max-w-xl flex flex-col items-center gap-2.5 mt-1 mb-2 xl:mb-0 xl:contents">
                <div className="xl:absolute xl:top-6 xl:left-6 z-40 w-full xl:w-auto flex flex-col items-center xl:items-start gap-1.5" ref={diffMenuRef}>
                    <div className="relative xl:hidden w-full max-w-[220px]">
                        <button
                            onClick={() => setShowDiffMenu(!showDiffMenu)}
                            style={{
                                backgroundColor: activeStyle.card,
                                color: activeStyle.text,
                                borderColor: activeStyle.border,
                            }}
                            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer animate-mode-change"
                        >
                            <span>{t.difficultyLabel} <span style={{ color: activeStyle.accent }}>{t[DIFFICULTY_PRESETS[difficulty].nameKey]}</span></span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showDiffMenu ? "rotate-180" : ""}`} />
                        </button>

                        {showDiffMenu && (
                            <div
                                style={{
                                    backgroundColor: activeStyle.card,
                                    borderColor: activeStyle.border,
                                    color: activeStyle.text,
                                }}
                                className="absolute left-0 right-0 mt-1.5 rounded-xl border shadow-xl overflow-hidden flex flex-col py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                            >
                                {(Object.keys(DIFFICULTY_PRESETS) as Difficulty[]).map((diff) => {
                                    const isCurrent = difficulty === diff;
                                    const label = t[DIFFICULTY_PRESETS[diff].nameKey];
                                    return (
                                        <button
                                            key={diff}
                                            onClick={() => {
                                                startNewGame(diff);
                                                setShowDiffMenu(false);
                                            }}
                                            style={{
                                                backgroundColor: isCurrent ? `${activeStyle.accent}15` : "transparent",
                                                color: isCurrent ? activeStyle.accent : activeStyle.text,
                                            }}
                                            className="px-4 py-2 text-xs font-bold text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer w-full"
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="hidden xl:flex xl:flex-col gap-1.5 w-full">
                        {(Object.keys(DIFFICULTY_PRESETS) as Difficulty[]).map((diff) => {
                            const isCurrent = difficulty === diff;
                            const label = t[DIFFICULTY_PRESETS[diff].nameKey];
                            return (
                                <button
                                    key={diff}
                                    onClick={() => startNewGame(diff)}
                                    style={{
                                        backgroundColor: isCurrent ? activeStyle.accent : activeStyle.card,
                                        color: isCurrent ? activeStyle.btnText : activeStyle.text,
                                        borderColor: activeStyle.border,
                                    }}
                                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold shadow-sm transition-all duration-300 hover:scale-102 active:scale-98 text-left cursor-pointer ${isCurrent ? "shadow-md" : "hover:bg-opacity-90"
                                        }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

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

            <main
                className={`w-full max-w-[450px] aspect-square p-1 rounded-2xl border-2 shadow-lg mb-6 flex flex-col justify-between overflow-hidden transition-transform duration-300 ${shakeBoard ? "animate-shake" : ""
                    }`}
                style={{
                    backgroundColor: activeStyle.card,
                    borderColor: activeStyle.text
                }}
            >
                <div className="grid grid-cols-9 grid-rows-9 gap-0 h-full w-full">
                    {Array.from({ length: 9 }).map((_, r) => (
                        <div key={r} className="contents">
                            {Array.from({ length: 9 }).map((_, c) => {
                                const val = currentGrid[r][c];
                                const isOriginal = initialGrid[r][c] !== 0;
                                const isSelected = isCellSelected(r, c);
                                const isHighlighted = isCellHighlighted(r, c);
                                const isSameNumber = isCellSameNumber(r, c);
                                const isConflict = conflicts[r][c];
                                const isHint = hintCells[r][c];
                                const notes = pencilNotes[r][c];

                                // CORRECCIÓN: Comprobar si el valor colocado por el usuario es incorrecto respecto a la solución única
                                const isIncorrect = !isOriginal && val !== 0 && val !== solutionGrid[r][c];

                                // Dynamic cells backgrounds
                                let cellBg = activeStyle.card;
                                if (isSelected) {
                                    cellBg = activeStyle.accent + "45";
                                } else if (isSameNumber) {
                                    cellBg = activeStyle.accent + "30";
                                } else if (isConflict || isIncorrect) {
                                    cellBg = themeMode === "light" ? "#FFECEC" : "#552226"; // Resaltar errores en rojo suave
                                } else if (isHighlighted) {
                                    cellBg = activeStyle.accent + "12";
                                }

                                // Text color
                                let cellColor = activeStyle.text;
                                if (isConflict || isIncorrect) {
                                    cellColor = "#E11D48"; // Rose 600 red para errores de conflicto o número equivocado
                                } else if (isHint) {
                                    cellColor = themeMode === "light" ? "#4F46E5" : "#818CF8";
                                } else if (!isOriginal && val !== 0) {
                                    cellColor = activeStyle.accent; // Accent colored para números introducidos correctamente
                                }

                                return (
                                    <div
                                        key={c}
                                        onClick={() => {
                                            if (gameStatus === "playing") {
                                                setSelectedCell({ r, c });
                                            }
                                        }}
                                        style={{
                                            ...getCellStyles(r, c),
                                            backgroundColor: cellBg,
                                            color: cellColor,
                                        }}
                                        className={`relative aspect-square flex items-center justify-center font-semibold cursor-pointer select-none transition-all duration-200 ${isSelected ? "ring-2 ring-inset ring-offset-1 ring-offset-white dark:ring-offset-black" : ""
                                            }`}
                                    >
                                        {val !== 0 ? (
                                            <span className={`text-base sm:text-2xl ${isOriginal ? "font-extrabold" : "font-medium"
                                                }`}>
                                                {val}
                                            </span>
                                        ) : (
                                            notes.length > 0 && (
                                                <div className="grid grid-cols-3 grid-rows-3 h-full w-full p-0.5 sm:p-1 text-[7px] sm:text-[9px] leading-none opacity-80 select-none">
                                                    {Array.from({ length: 9 }).map((_, i) => {
                                                        const num = i + 1;
                                                        return (
                                                            <div key={num} className="flex items-center justify-center font-bold">
                                                                {notes.includes(num) ? num : ""}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </main>

            <footer className="w-full max-w-md flex flex-col gap-2 sm:gap-3.5 mt-auto">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                    <button
                        onClick={() => setPencilMode(prev => !prev)}
                        style={{
                            backgroundColor: pencilMode ? activeStyle.accent : activeStyle.card,
                            color: pencilMode ? activeStyle.btnText : activeStyle.text,
                            borderColor: activeStyle.border,
                        }}
                        className="py-2 sm:py-3.5 rounded-xl sm:rounded-2xl border font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:scale-102 active:scale-98"
                    >
                        <Pencil className="w-4 h-4 shrink-0" />
                        <span className="truncate">{t.notesLabel} ({pencilMode ? "ON" : "OFF"})</span>
                    </button>

                    <button
                        onClick={triggerHint}
                        style={{
                            backgroundColor: activeStyle.card,
                            color: activeStyle.text,
                            borderColor: activeStyle.border,
                        }}
                        className={`py-2 sm:py-3.5 rounded-xl sm:rounded-2xl border font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:scale-102 active:scale-98 ${hintsLeft <= 0 ? "opacity-50" : ""
                            }`}
                    >
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="truncate">{t.hintsLabel} ({hintsLeft})</span>
                    </button>

                    <button
                        onClick={() => {
                            if (selectedCell) {
                                handleClearCell(selectedCell.r, selectedCell.c);
                            }
                        }}
                        style={{
                            backgroundColor: activeStyle.card,
                            color: activeStyle.text,
                            borderColor: activeStyle.border,
                        }}
                        className="py-2 sm:py-3.5 rounded-xl sm:rounded-2xl border font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:scale-102 active:scale-98"
                    >
                        <Eraser className="w-4 h-4 shrink-0" />
                        <span className="truncate">{gameLang === "de" ? "Löschen" : gameLang === "la" ? "Delere" : gameLang === "ru" ? "Стереть" : gameLang === "pt" ? "Apagar" : gameLang === "pl" ? "Wyczyść" : "Borrar"}</span>
                    </button>
                </div>

                <div
                    style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                    className="p-2 sm:p-4.5 rounded-2xl sm:rounded-3xl border shadow-sm flex flex-col gap-1.5 sm:gap-2.5 select-none"
                >
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {[1, 2, 3, 4, 5].map((num) => {
                            const completed = isNumberCompleted(num);
                            return (
                                <button
                                    key={num}
                                    disabled={completed}
                                    onClick={() => {
                                        if (selectedCell && !completed) {
                                            handleCellInput(selectedCell.r, selectedCell.c, num);
                                        }
                                    }}
                                    style={{
                                        backgroundColor: completed ? "transparent" : activeStyle.keyBg,
                                        color: completed ? activeStyle.textMuted : activeStyle.text,
                                        borderColor: completed ? "transparent" : activeStyle.border,
                                    }}
                                    className={`py-2 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 shadow-sm ${completed
                                        ? "opacity-35 cursor-not-allowed pointer-events-none border border-dashed"
                                        : "hover:scale-105 active:scale-95 hover:bg-opacity-80 active:shadow-inner cursor-pointer"
                                        }`}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                        {[6, 7, 8, 9].map((num) => {
                            const completed = isNumberCompleted(num);
                            return (
                                <button
                                    key={num}
                                    disabled={completed}
                                    onClick={() => {
                                        if (selectedCell && !completed) {
                                            handleCellInput(selectedCell.r, selectedCell.c, num);
                                        }
                                    }}
                                    style={{
                                        backgroundColor: completed ? "transparent" : activeStyle.keyBg,
                                        color: completed ? activeStyle.textMuted : activeStyle.text,
                                        borderColor: completed ? "transparent" : activeStyle.border,
                                    }}
                                    className={`py-2 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 shadow-sm ${completed
                                        ? "opacity-35 cursor-not-allowed pointer-events-none border border-dashed"
                                        : "hover:scale-105 active:scale-95 hover:bg-opacity-80 active:shadow-inner cursor-pointer"
                                        }`}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </footer>

            {showHelp && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-[calc(100vw-2rem)] max-w-lg p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-3 sm:gap-4 relative animate-scale-in max-h-[85dvh] overflow-y-auto overscroll-behavior-contain"
                    >
                        <h2 className="text-lg sm:text-3xl font-extrabold text-center border-b pb-3">
                            {t.helpTitle}
                        </h2>
                        <p className="text-xs sm:text-sm leading-relaxed">{t.helpIntro}</p>
                        <p className="text-xs sm:text-sm leading-relaxed">{t.helpOriginal}</p>

                        <div className="flex flex-col gap-3 mt-1">
                            <div className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed">
                                <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 border flex items-center justify-center font-bold flex-shrink-0"><Pencil className="w-3.5 h-3.5" /></span>
                                <span className="flex-1">{t.helpAnotation}</span>
                            </div>
                            <div className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed">
                                <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 border flex items-center justify-center font-bold flex-shrink-0"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /></span>
                                <span className="flex-1">{t.helpHints}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowHelp(false)}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="mt-2 w-full py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            {gameLang === "de" ? "Verstanden!" : gameLang === "la" ? "Intellectum!" : gameLang === "ru" ? "Понятно" : gameLang === "pt" ? "Entendido!" : gameLang === "pl" ? "Rozumiem!" : "¡Entendido!"}
                        </button>
                    </div>
                </div>
            )}

            {showStats && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-[calc(100vw-2rem)] max-w-xl p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-3 sm:gap-4 relative animate-scale-in max-h-[85dvh] overflow-y-auto overscroll-behavior-contain"
                    >
                        <button
                            onClick={() => setShowStats(false)}
                            className="absolute top-4 right-4 p-1 hover:opacity-75 transition-opacity cursor-pointer z-10"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        <h2 className="text-lg sm:text-3xl font-extrabold text-center flex items-center justify-center gap-2 border-b pb-3">
                            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
                            <span>{t.stats}</span>
                        </h2>

                        <div className="flex flex-wrap gap-1 justify-center border-b pb-2.5">
                            <button
                                onClick={() => setStatsTab("global")}
                                style={{
                                    backgroundColor: statsTab === "global" ? activeStyle.accent : "transparent",
                                    color: statsTab === "global" ? activeStyle.btnText : activeStyle.text,
                                }}
                                className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[10px] font-extrabold transition-all cursor-pointer"
                            >
                                {gameLang === "de" ? "Global" : gameLang === "la" ? "Universale" : gameLang === "ru" ? "Общий" : gameLang === "pt" ? "Global" : gameLang === "pl" ? "Ogólne" : "Global"}
                            </button>
                            {(Object.keys(DIFFICULTY_PRESETS) as Difficulty[]).map((k) => (
                                <button
                                    key={k}
                                    onClick={() => setStatsTab(k)}
                                    style={{
                                        backgroundColor: statsTab === k ? activeStyle.accent : "transparent",
                                        color: statsTab === k ? activeStyle.btnText : activeStyle.text,
                                    }}
                                    className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[10px] font-extrabold transition-all cursor-pointer"
                                >
                                    {t[DIFFICULTY_PRESETS[k].nameKey]}
                                </button>
                            ))}
                        </div>

                        {activeStats.played > 0 ? (
                            <div className="flex flex-col gap-4 sm:gap-6 py-1">
                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-center">
                                    <div style={{ backgroundColor: activeStyle.keyBg }} className="p-2 sm:p-3.5 rounded-xl flex flex-col justify-center">
                                        <span className="text-base sm:text-2xl font-black">{activeStats.played}</span>
                                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs font-bold uppercase mt-0.5 sm:mt-1">{t.statsPlayed}</span>
                                    </div>
                                    <div style={{ backgroundColor: activeStyle.keyBg }} className="p-2 sm:p-3.5 rounded-xl flex flex-col justify-center">
                                        <span className="text-base sm:text-2xl font-black">{activeStats.won}</span>
                                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs font-bold uppercase mt-0.5 sm:mt-1">{t.statsWon}</span>
                                    </div>
                                    <div style={{ backgroundColor: activeStyle.keyBg }} className="p-2 sm:p-3.5 rounded-xl flex flex-col justify-center">
                                        <span className="text-base sm:text-2xl font-black">{winRate}%</span>
                                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs font-bold uppercase mt-0.5 sm:mt-1">{t.statsWinRate}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 text-center">
                                    <div style={{ backgroundColor: activeStyle.keyBg }} className="p-2 sm:p-3.5 rounded-xl flex flex-col justify-center">
                                        <span className="text-base sm:text-2xl font-black">{activeStats.currentStreak}</span>
                                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs font-bold uppercase mt-0.5 sm:mt-1">{t.statsCurrentStreak}</span>
                                    </div>
                                    <div style={{ backgroundColor: activeStyle.keyBg }} className="p-2 sm:p-3.5 rounded-xl flex flex-col justify-center">
                                        <span className="text-base sm:text-2xl font-black">{activeStats.maxStreak}</span>
                                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs font-bold uppercase mt-0.5 sm:mt-1">{t.statsMaxStreak}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 text-center">
                                    <div style={{ backgroundColor: activeStyle.keyBg }} className="p-2 sm:p-3.5 rounded-xl flex flex-col justify-center">
                                        <span className="text-sm sm:text-lg font-black">{activeStats.bestTime !== null ? formatTime(activeStats.bestTime) : "-"}</span>
                                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs font-bold uppercase mt-0.5 sm:mt-1">{t.bestTime}</span>
                                    </div>
                                    <div style={{ backgroundColor: activeStyle.keyBg }} className="p-2 sm:p-3.5 rounded-xl flex flex-col justify-center">
                                        <span className="text-sm sm:text-lg font-black">{activeStats.won > 0 ? formatTime(Math.round(activeStats.totalTime / activeStats.won)) : "-"}</span>
                                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs font-bold uppercase mt-0.5 sm:mt-1">{t.avgTime}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 mt-1 sm:mt-2">
                                    <button
                                        onClick={handleResetStats}
                                        style={{ borderColor: activeStyle.border }}
                                        className="flex-1 py-2 border rounded-xl font-bold text-xs text-red-500 hover:bg-red-50/10 active:scale-98 transition-all cursor-pointer"
                                    >
                                        {t.statsResetBtn}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: activeStyle.textMuted }} className="text-center py-8 text-xs sm:text-sm italic">
                                {t.statsNoData}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {showResultModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-[calc(100vw-2rem)] max-w-md p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-3 sm:gap-4 relative text-center animate-scale-in max-h-[85dvh] overflow-y-auto overscroll-behavior-contain"
                    >
                        <button
                            onClick={() => setShowResultModal(false)}
                            className="absolute top-4 right-4 p-1 hover:opacity-75 transition-opacity cursor-pointer z-10"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        <h2 className="text-xl sm:text-4xl font-extrabold text-indigo-500 mt-2 select-none">
                            {t.winTitle}
                        </h2>

                        <p style={{ color: activeStyle.textMuted }} className="text-xs sm:text-base">
                            {t.winDesc(t[DIFFICULTY_PRESETS[difficulty].nameKey])}
                        </p>

                        <div style={{ backgroundColor: activeStyle.keyBg }} className="p-3.5 sm:p-5 rounded-2xl border flex flex-col gap-2.5 sm:gap-3 my-1.5 text-left shadow-xs">
                            <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                                <span>{t.timeSpent}</span>
                                <span className="text-sm sm:text-lg font-black tabular-nums">{formatTime(timeElapsed)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm font-medium border-t pt-2">
                                <span>{t.bestTime}</span>
                                <span className="tabular-nums">{stats && stats[difficulty].bestTime !== null ? formatTime(stats[difficulty].bestTime!) : "-"}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-1 sm:mt-2">
                            <button
                                onClick={handleShareResult}
                                style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                                className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>{copySuccess ? t.copied : t.share}</span>
                            </button>

                            <button
                                onClick={() => startNewGame(difficulty)}
                                style={{ borderColor: activeStyle.border }}
                                className="w-full py-2.5 sm:py-3 border rounded-xl font-bold text-xs sm:text-sm hover:bg-black/5 dark:hover:bg-white/5 active:scale-98 transition-all cursor-pointer"
                            >
                                {t.playAgain}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}