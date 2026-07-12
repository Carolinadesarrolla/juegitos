"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    HelpCircle, RefreshCw, Share2, BarChart2, Check, X, Award, Play, ArrowRightLeft, BookOpen, Keyboard, ChevronRight, Info, Trophy
} from "lucide-react";
import { useGameConfig } from "@/components/GameConfigContext";
import { useLanguage } from "@/components/LanguageProvider";

// ============================================================================
// 1. DATA STRUCTURES & DATA BASE DEFINITIONS
// ============================================================================

interface LetterItem {
    id: string;
    char: string; // e.g. "А / а"
    cirilicUpper: string;
    cirilicLower: string;
    latin: string; // transliteration
}

interface WordItem {
    id: string;
    word: string; // cirilic spelling
    latin: string; // transliteration
    meanings: Record<string, string>; // language translations
}

// 33 Russian Letters
const russianAlphabet: LetterItem[] = [
    { id: "a", char: "А а", cirilicUpper: "А", cirilicLower: "а", latin: "a" },
    { id: "b", char: "Б б", cirilicUpper: "Б", cirilicLower: "б", latin: "b" },
    { id: "v", char: "В в", cirilicUpper: "В", cirilicLower: "в", latin: "v" },
    { id: "g", char: "Г г", cirilicUpper: "Г", cirilicLower: "г", latin: "g" },
    { id: "d", char: "Д д", cirilicUpper: "Д", cirilicLower: "д", latin: "d" },
    { id: "ye", char: "Е е", cirilicUpper: "Е", cirilicLower: "е", latin: "ye" },
    { id: "yo", char: "Ё ё", cirilicUpper: "Ё", cirilicLower: "ё", latin: "yo" },
    { id: "zh", char: "Ж ж", cirilicUpper: "Ж", cirilicLower: "ж", latin: "zh" },
    { id: "z", char: "З з", cirilicUpper: "З", cirilicLower: "з", latin: "z" },
    { id: "i", char: "И и", cirilicUpper: "И", cirilicLower: "и", latin: "i" },
    { id: "y", char: "Й й", cirilicUpper: "Й", cirilicLower: "й", latin: "y" },
    { id: "k", char: "К к", cirilicUpper: "К", cirilicLower: "к", latin: "k" },
    { id: "l", char: "Л л", cirilicUpper: "Л", cirilicLower: "л", latin: "l" },
    { id: "m", char: "М м", cirilicUpper: "М", cirilicLower: "м", latin: "m" },
    { id: "n", char: "Н н", cirilicUpper: "Н", cirilicLower: "н", latin: "n" },
    { id: "o", char: "О о", cirilicUpper: "О", cirilicLower: "о", latin: "o" },
    { id: "p", char: "П п", cirilicUpper: "П", cirilicLower: "п", latin: "p" },
    { id: "r", char: "Р р", cirilicUpper: "Р", cirilicLower: "р", latin: "r" },
    { id: "s", char: "С с", cirilicUpper: "С", cirilicLower: "с", latin: "s" },
    { id: "t", char: "Т т", cirilicUpper: "Т", cirilicLower: "т", latin: "t" },
    { id: "u", char: "У у", cirilicUpper: "У", cirilicLower: "у", latin: "u" },
    { id: "f", char: "Ф ф", cirilicUpper: "Ф", cirilicLower: "ф", latin: "f" },
    { id: "kh", char: "Х х", cirilicUpper: "Х", cirilicLower: "х", latin: "kh" },
    { id: "ts", char: "Ц ц", cirilicUpper: "Ц", cirilicLower: "ц", latin: "ts" },
    { id: "ch", char: "Ч ч", cirilicUpper: "Ч", cirilicLower: "ч", latin: "ch" },
    { id: "sh", char: "Ш ш", cirilicUpper: "Ш", cirilicLower: "ш", latin: "sh" },
    { id: "shch", char: "Щ щ", cirilicUpper: "Щ", cirilicLower: "щ", latin: "shch" },
    { id: "hard", char: "Ъ ъ", cirilicUpper: "Ъ", cirilicLower: "ъ", latin: "-" },
    { id: "yery", char: "Ы ы", cirilicUpper: "Ы", cirilicLower: "ы", latin: "y" },
    { id: "soft", char: "Ь ь", cirilicUpper: "Ь", cirilicLower: "ь", latin: "'" },
    { id: "e", char: "Э э", cirilicUpper: "Э", cirilicLower: "э", latin: "e" },
    { id: "yu", char: "Ю ю", cirilicUpper: "Ю", cirilicLower: "ю", latin: "yu" },
    { id: "ya", char: "Я я", cirilicUpper: "Я", cirilicLower: "я", latin: "ya" }
];

// Common Russian Words database (Word Mode)
const commonWords: WordItem[] = [
    { id: "w1", word: "привет", latin: "privet", meanings: { es: "hola", de: "Hallo", pl: "cześć", pt: "olá", uk: "привіт" } },
    { id: "w2", word: "спасибо", latin: "spasibo", meanings: { es: "gracias", de: "Danke", pl: "dziękuję", pt: "obrigado", uk: "дякую" } },
    { id: "w3", word: "да", latin: "da", meanings: { es: "sí", de: "ja", pl: "tak", pt: "sim", uk: "так" } },
    { id: "w4", word: "нет", latin: "net", meanings: { es: "no", de: "nein", pl: "nie", pt: "não", uk: "ні" } },
    { id: "w5", word: "пожалуйста", latin: "pozhaluysta", meanings: { es: "por favor / de nada", de: "bitte", pl: "proszę", pt: "por favor / de nada", uk: "будь ласка" } },
    { id: "w6", word: "хорошо", latin: "khorosho", meanings: { es: "bien / de acuerdo", de: "gut / okay", pl: "dobrze / w porządku", pt: "bem / ok", uk: "добре" } },
    { id: "w7", word: "здравствуйте", latin: "zdravstvuyte", meanings: { es: "hola (formal)", de: "Hallo (formal)", pl: "dzień dobry", pt: "olá (formal)", uk: "вітання" } },
    { id: "w8", word: "до свидания", latin: "do svidaniya", meanings: { es: "adiós", de: "auf Wiedersehen", pl: "do widzenia", pt: "adeus", uk: "до побачення" } },
    { id: "w9", word: "друг", latin: "drug", meanings: { es: "amigo", de: "Freund", pl: "przyjaciel", pt: "amigo", uk: "друг" } },
    { id: "w10", word: "книга", latin: "kniga", meanings: { es: "libro", de: "Buch", pl: "książka", pt: "livro", uk: "книга" } },
    { id: "w11", word: "вода", latin: "voda", meanings: { es: "agua", de: "Wasser", pl: "woda", pt: "água", uk: "вода" } },
    { id: "w12", word: "хлеб", latin: "khleb", meanings: { es: "pan", de: "Brot", pl: "chleb", pt: "pão", uk: "хліб" } },
    { id: "w13", word: "молоко", latin: "moloko", meanings: { es: "leche", de: "Milch", pl: "mleko", pt: "leite", uk: "молоко" } },
    { id: "w14", word: "чай", latin: "chay", meanings: { es: "té", de: "Tee", pl: "herbata", pt: "chá", uk: "чай" } },
    { id: "w15", word: "кофе", latin: "kofe", meanings: { es: "café", de: "Kaffee", pl: "kawa", pt: "café", uk: "кава" } },
    { id: "w16", word: "дом", latin: "dom", meanings: { es: "casa", de: "Haus", pl: "dom", pt: "casa", uk: "дім" } },
    { id: "w17", word: "город", latin: "gorod", meanings: { es: "ciudad", de: "Stadt", pl: "miasto", pt: "cidade", uk: "місто" } },
    { id: "w18", word: "семья", latin: "semya", meanings: { es: "familia", de: "Familie", pl: "rodzina", pt: "família", uk: "сім'я" } },
    { id: "w19", word: "метро", latin: "metro", meanings: { es: "metro", de: "U-Bahn", pl: "metro", pt: "metrô", uk: "метро" } },
    { id: "w20", word: "улица", latin: "ulitsa", meanings: { es: "calle", de: "Straße", pl: "ulica", pt: "rua", uk: "вулиця" } },
    { id: "w21", word: "работа", latin: "rabota", meanings: { es: "trabajo", de: "Arbeit", pl: "praca", pt: "trabalho", uk: "робота" } },
    { id: "w22", word: "любовь", latin: "lyubov", meanings: { es: "amor", de: "Liebe", pl: "miłość", pt: "amor", uk: "любов" } },
    { id: "w23", word: "жизнь", latin: "zhizn", meanings: { es: "vida", de: "Leben", pl: "życie", pt: "vida", uk: "життя" } },
    { id: "w24", word: "человек", latin: "chelovek", meanings: { es: "persona / hombre", de: "Mensch", pl: "człowiek", pt: "pessoa / homem", uk: "людина" } },
    { id: "w25", word: "утро", latin: "utro", meanings: { es: "mañana (parte del día)", de: "Morgen", pl: "poranek", pt: "manhã", uk: "ранок" } },
    { id: "w26", word: "день", latin: "den", meanings: { es: "día", de: "Tag", pl: "dzień", pt: "dia", uk: "день" } },
    { id: "w27", word: "вечер", latin: "vecher", meanings: { es: "tarde / noche (atardecer)", de: "Abend", pl: "wieczór", pt: "tarde / noite", uk: "вечір" } },
    { id: "w28", word: "ночь", latin: "noch", meanings: { es: "noche", de: "Nacht", pl: "noc", pt: "noite", uk: "ніч" } },
    { id: "w29", word: "школа", latin: "shkola", meanings: { es: "escuela", de: "Schule", pl: "szkoła", pt: "escola", uk: "школа" } },
    { id: "w30", word: "солнце", latin: "solntse", meanings: { es: "sol", de: "Sonne", pl: "słońce", pt: "sol", uk: "сонце" } },
    { id: "w31", word: "страна", latin: "strana", meanings: { es: "país", de: "Land", pl: "kraj", pt: "país", uk: "країна" } },
    { id: "w32", word: "время", latin: "vremya", meanings: { es: "tiempo", de: "Zeit", pl: "czas", pt: "tempo", uk: "час" } },
    { id: "w33", word: "ресторан", latin: "restoran", meanings: { es: "restaurante", de: "Restaurant", pl: "restauracja", pt: "restaurante", uk: "ресторан" } },
    { id: "w34", word: "билет", latin: "bilet", meanings: { es: "billete / boleto", de: "Ticket", pl: "bilet", pt: "bilhete", uk: "квиток" } },
    { id: "w35", word: "собака", latin: "sobaka", meanings: { es: "perro", de: "Hund", pl: "pies", pt: "cachorro", uk: "собака" } },
    { id: "w36", word: "кошка", latin: "koshka", meanings: { es: "gato", de: "Katze", pl: "kot", pt: "gato", uk: "кішка" } },
    { id: "w37", word: "яблоко", latin: "yabloko", meanings: { es: "manzana", de: "Apfel", pl: "jabłko", pt: "maçã", uk: "яблуко" } },
    { id: "w38", word: "один", latin: "odin", meanings: { es: "uno", de: "eins", pl: "jeden", pt: "um", uk: "один" } },
    { id: "w39", word: "два", latin: "dva", meanings: { es: "dos", de: "zwei", pl: "dwa", pt: "dois", uk: "два" } },
    { id: "w40", word: "три", latin: "tri", meanings: { es: "tres", de: "drei", pl: "trzy", pt: "três", uk: "три" } },
    { id: "w41", word: "достопримечательность", latin: "dostoprimechatelnost", meanings: { es: "atracción turística / lugar de interés", de: "Sehenswürdigkeit", pl: "atrakcja turystyczna", pt: "ponto turístico / atração", uk: "визначна пам'ятка" } },
    { id: "w42", word: "чувство", latin: "chuvstvo", meanings: { es: "sentimiento / sensación", de: "Gefühl", pl: "uczucie", pt: "sentimento / sensação", uk: "почуття" } }, // Dificultad: La primera 'в' es muda en la pronunciación real.
    { id: "w43", word: "объявление", latin: "obyavleniye", meanings: { es: "anuncio / aviso", de: "Ankündigung / Anzeige", pl: "ogłoszenie", pt: "anúncio / aviso", uk: "оголошення" } }, // Dificultad: Uso del signo duro 'ъ', poco común.
    { id: "w44", word: "путешествие", latin: "puteshestviye", meanings: { es: "viaje", de: "Reise", pl: "podróż", pt: "viagem", uk: "подорож" } }, // Dificultad: Sucesión compleja de las sibilantes 'ш' y 'тш'.
    { id: "w45", word: "произношение", latin: "proiznosheniye", meanings: { es: "pronunciación", de: "Aussprache", pl: "wymowa", pt: "pronúncia", uk: "вимова" } },
    { id: "w46", word: "счастье", latin: "schastye", meanings: { es: "felicidad", de: "Glück", pl: "szczęście", pt: "felicidade", uk: "щастя" } }, // Dificultad: La combinación 'сч' se pronuncia diferente de como se escribe (suena como 'щ').
    { id: "w47", word: "удовольствие", latin: "udovolstviye", meanings: { es: "placer / satisfacción", de: "Vergnügen", pl: "przyjemność", pt: "prazer", uk: "задоволення" } },
    { id: "w48", word: "борщ", latin: "borshch", meanings: { es: "borsch (sopa de remolacha)", de: "Borschtsch", pl: "barszcz", pt: "borscht", uk: "борщ" } }, // Dificultad: Termina en 'щ', letra que suele costar mucho pronunciar y transliterar.
    { id: "w49", word: "дождь", latin: "dozhd", meanings: { es: "lluvia", de: "Regen", pl: "deszcz", pt: "chuva", uk: "дощ" } }, // Dificultad: Pronunciación irregular y presencia del signo blando 'ь' al final.
    { id: "w50", word: "государство", latin: "gosudarstvo", meanings: { es: "estado / nación", de: "Staat", pl: "państwo", pt: "estado", uk: "держава" } }
];

// ============================================================================
// 2. LÓGICA DE CONFETTI CANVAS
// ============================================================================

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

    const colors = ["#3385FF", "#FF8DA1", "#98FB98", "#FAD02C", "#B380FF", "#FFA500", "#FF6B6B"];

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

const getWordFontSizeClass = (word: string) => {
    if (word.length > 15) {
        return "text-xl xs:text-2xl sm:text-4xl md:text-5xl";
    }
    if (word.length > 10) {
        return "text-2xl xs:text-3xl sm:text-5xl md:text-6xl";
    }
    return "text-4xl xs:text-5xl sm:text-6xl";
};

// ============================================================================
// 3. MAIN COMPONENT IMPLEMENTATION
// ============================================================================

export default function RusoGamePage() {
    const { activeStyle, setActiveGameName } = useGameConfig();
    const { gameLang, t: centralT } = useLanguage();

    // Configurar nombre en cabecera
    useEffect(() => {
        setActiveGameName("Ruso");
        return () => setActiveGameName(null);
    }, [setActiveGameName]);

    const t = centralT.ruso;

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Estados de Montado y UX
    const [mounted, setMounted] = useState<boolean>(false);
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [showStats, setShowStats] = useState<boolean>(false);
    const [shakeCard, setShakeCard] = useState<boolean>(false);

    // Estados de Configuración de Juego
    const [activeMode, setActiveMode] = useState<"letras" | "palabras">("letras");
    const [practiceDirection, setPracticeDirection] = useState<"cyr-to-lat" | "lat-to-cyr" | "mixed">("cyr-to-lat");
    const [inputMethod, setInputMethod] = useState<"opciones" | "escritura">("opciones");

    // Pesos del Algoritmo Adaptativo
    const [letterWeights, setLetterWeights] = useState<Record<string, number>>({});
    const [wordWeights, setWordWeights] = useState<Record<string, number>>({});

    // Estadísticas del Juego
    const [playedCount, setPlayedCount] = useState<number>(0);
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [incorrectCount, setIncorrectCount] = useState<number>(0);
    const [streak, setStreak] = useState<number>(0);
    const [maxStreak, setMaxStreak] = useState<number>(0);

    // Estado de la Pregunta en Curso
    const [currentLetter, setCurrentLetter] = useState<LetterItem | null>(null);
    const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
    const [currentDirection, setCurrentDirection] = useState<"cyr-to-lat" | "lat-to-cyr">("cyr-to-lat");
    const [options, setOptions] = useState<string[]>([]);
    const [userAnswer, setUserAnswer] = useState<string>("");
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hasAnswered, setHasAnswered] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [wrongChoices, setWrongChoices] = useState<string[]>([]);

    // Referencias para Canvas y Animación de Confeti
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const confettiAnimationRef = useRef<number | null>(null);

    // Cargar estadísticas y pesos de localStorage
    useEffect(() => {
        setMounted(true);

        const savedPlayed = localStorage.getItem("ruso-played") || "0";
        const savedCorrect = localStorage.getItem("ruso-correct") || "0";
        const savedIncorrect = localStorage.getItem("ruso-incorrect") || "0";
        const savedStreak = localStorage.getItem("ruso-streak") || "0";
        const savedMaxStreak = localStorage.getItem("ruso-maxstreak") || "0";

        setPlayedCount(parseInt(savedPlayed, 10));
        setCorrectCount(parseInt(savedCorrect, 10));
        setIncorrectCount(parseInt(savedIncorrect, 10));
        setStreak(parseInt(savedStreak, 10));
        setMaxStreak(parseInt(savedMaxStreak, 10));

        // Inicializar o cargar pesos de letras
        const savedLetterWeightsStr = localStorage.getItem("ruso-letter-weights");
        let initialLetterWeights: Record<string, number> = {};
        if (savedLetterWeightsStr) {
            try {
                initialLetterWeights = JSON.parse(savedLetterWeightsStr);
            } catch (e) {
                console.error("Error parsing letter weights", e);
            }
        }
        // Asegurar que todos tengan un peso
        russianAlphabet.forEach((l) => {
            if (initialLetterWeights[l.id] === undefined) {
                initialLetterWeights[l.id] = 100;
            }
        });
        setLetterWeights(initialLetterWeights);

        // Inicializar o cargar pesos de palabras
        const savedWordWeightsStr = localStorage.getItem("ruso-word-weights");
        let initialWordWeights: Record<string, number> = {};
        if (savedWordWeightsStr) {
            try {
                initialWordWeights = JSON.parse(savedWordWeightsStr);
            } catch (e) {
                console.error("Error parsing word weights", e);
            }
        }
        commonWords.forEach((w) => {
            if (initialWordWeights[w.id] === undefined) {
                initialWordWeights[w.id] = 100;
            }
        });
        setWordWeights(initialWordWeights);
    }, []);

    // Generar primera ronda cuando los pesos y modo están listos
    useEffect(() => {
        if (mounted && Object.keys(letterWeights).length > 0) {
            startNewRound();
        }
    }, [mounted, activeMode, practiceDirection]);

    // Limpieza de confeti en desmontaje
    useEffect(() => {
        return () => {
            if (confettiAnimationRef.current) {
                cancelAnimationFrame(confettiAnimationRef.current);
            }
        };
    }, []);

    // Lanzar Confeti
    const triggerConfetti = () => {
        if (canvasRef.current) {
            runConfetti(canvasRef.current, confettiAnimationRef);
        }
    };

    // Calcular la maestría general basada en los pesos de las letras
    // Rango de maestría: 0% a 100%. A menor peso, mayor maestría.
    // Peso inicial = 100 (0% maestría). Peso mínimo = 10 (100% maestría).
    const getMasteryPercentage = () => {
        if (Object.keys(letterWeights).length === 0) return 0;
        const weightsArray = Object.values(letterWeights);
        const sumWeights = weightsArray.reduce((sum, w) => sum + w, 0);
        const averageWeight = sumWeights / weightsArray.length;
        // Si averageWeight es 100 o más, es 0%. Si llega a 10, es 100%
        const percentage = Math.max(0, Math.min(100, Math.round(((100 - averageWeight) / 90) * 100)));
        return percentage;
    };

    // ============================================================================
    // 4. CORE GAMEPLAY MECHANICS (WEIGHTED ROTATION & ROUND INITS)
    // ============================================================================

    const startNewRound = () => {
        setIsCorrect(null);
        setHasAnswered(false);
        setUserAnswer("");
        setSelectedOption(null);
        setWrongChoices([]);

        if (activeMode === "letras") {
            // 1. Determinar dirección de esta ronda
            let roundDir: "cyr-to-lat" | "lat-to-cyr" = "cyr-to-lat";
            if (practiceDirection === "mixed") {
                roundDir = Math.random() > 0.5 ? "cyr-to-lat" : "lat-to-cyr";
            } else {
                roundDir = practiceDirection;
            }
            setCurrentDirection(roundDir);

            // 2. Elegir letra según pesos
            if (Object.keys(letterWeights).length === 0) return;
            const totalWeight = russianAlphabet.reduce((sum, item) => sum + (letterWeights[item.id] || 100), 0);
            let rand = Math.random() * totalWeight;
            let selectedLetter = russianAlphabet[0];

            for (let i = 0; i < russianAlphabet.length; i++) {
                const item = russianAlphabet[i];
                const w = letterWeights[item.id] || 100;
                if (rand < w) {
                    selectedLetter = item;
                    break;
                }
                rand -= w;
            }
            setCurrentLetter(selectedLetter);
            setCurrentWord(null);

            // 3. Generar opciones si es necesario
            const correctVal = roundDir === "cyr-to-lat" ? selectedLetter.latin : selectedLetter.cirilicLower;
            // Obtener distractores
            const distractors = russianAlphabet
                .filter((l) => l.id !== selectedLetter.id)
                .map((l) => (roundDir === "cyr-to-lat" ? l.latin : l.cirilicLower));

            // Quitar repetidos por si acaso (ej. si hay caracteres mudos que transliteren similar)
            const uniqueDistractors = Array.from(new Set(distractors));
            // Mezclar y elegir 3
            const shuffledDistractors = uniqueDistractors.sort(() => 0.5 - Math.random()).slice(0, 3);
            // Añadir respuesta correcta y mezclar
            const roundOptions = [...shuffledDistractors, correctVal].sort(() => 0.5 - Math.random());
            setOptions(roundOptions);

        } else {
            // Modo Palabras
            setCurrentDirection("cyr-to-lat"); // Las palabras siempre se transliteran a latín

            // Elegir palabra basada en pesos
            if (Object.keys(wordWeights).length === 0) return;
            const totalWeight = commonWords.reduce((sum, item) => sum + (wordWeights[item.id] || 100), 0);
            let rand = Math.random() * totalWeight;
            let selectedWord = commonWords[0];

            for (let i = 0; i < commonWords.length; i++) {
                const item = commonWords[i];
                const w = wordWeights[item.id] || 100;
                if (rand < w) {
                    selectedWord = item;
                    break;
                }
                rand -= w;
            }
            setCurrentWord(selectedWord);
            setCurrentLetter(null);

            // Generar opciones de palabras
            const correctVal = selectedWord.latin;
            const distractors = commonWords
                .filter((w) => w.id !== selectedWord.id)
                .map((w) => w.latin);

            const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
            const roundOptions = [...shuffledDistractors, correctVal].sort(() => 0.5 - Math.random());
            setOptions(roundOptions);
        }
    };

    // Validar respuesta
    const handleCheckAnswer = (answer: string) => {
        if (hasAnswered) return;

        let correct = false;
        let targetId = "";
        const cleanAnswer = answer.trim().toLowerCase();

        if (activeMode === "letras" && currentLetter) {
            targetId = currentLetter.id;
            const correctVal = currentDirection === "cyr-to-lat" ? currentLetter.latin : currentLetter.cirilicLower;
            correct = cleanAnswer === correctVal.trim().toLowerCase();
        } else if (activeMode === "palabras" && currentWord) {
            targetId = currentWord.id;
            correct = cleanAnswer === currentWord.latin.trim().toLowerCase();
        }

        setIsCorrect(correct);
        setHasAnswered(true);

        // Actualizar Estadísticas
        const newPlayed = playedCount + 1;
        setPlayedCount(newPlayed);
        localStorage.setItem("ruso-played", newPlayed.toString());

        if (correct) {
            const newCorrect = correctCount + 1;
            setCorrectCount(newCorrect);
            localStorage.setItem("ruso-correct", newCorrect.toString());

            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem("ruso-streak", newStreak.toString());

            if (newStreak > maxStreak) {
                setMaxStreak(newStreak);
                localStorage.setItem("ruso-maxstreak", newStreak.toString());
            }

            // Celebrar hitos de racha
            if (newStreak > 0 && newStreak % 10 === 0) {
                triggerConfetti();
            }

            // Disminuir peso de la letra/palabra (se domina mejor)
            if (activeMode === "letras") {
                const currentW = letterWeights[targetId] || 100;
                const newW = Math.max(10, Math.round(currentW * 0.6));
                const updatedWeights = { ...letterWeights, [targetId]: newW };
                setLetterWeights(updatedWeights);
                localStorage.setItem("ruso-letter-weights", JSON.stringify(updatedWeights));
            } else {
                const currentW = wordWeights[targetId] || 100;
                const newW = Math.max(10, Math.round(currentW * 0.6));
                const updatedWeights = { ...wordWeights, [targetId]: newW };
                setWordWeights(updatedWeights);
                localStorage.setItem("ruso-word-weights", JSON.stringify(updatedWeights));
            }
        } else {
            const newIncorrect = incorrectCount + 1;
            setIncorrectCount(newIncorrect);
            localStorage.setItem("ruso-incorrect", newIncorrect.toString());
            setStreak(0);
            localStorage.setItem("ruso-streak", "0");

            // Agitar la tarjeta en error
            setShakeCard(true);
            setTimeout(() => setShakeCard(false), 500);

            // Incrementar peso de la letra/palabra (necesita refuerzo)
            if (activeMode === "letras") {
                const currentW = letterWeights[targetId] || 100;
                const newW = Math.min(500, Math.round(currentW * 1.6));
                const updatedWeights = { ...letterWeights, [targetId]: newW };
                setLetterWeights(updatedWeights);
                localStorage.setItem("ruso-letter-weights", JSON.stringify(updatedWeights));
            } else {
                const currentW = wordWeights[targetId] || 100;
                const newW = Math.min(500, Math.round(currentW * 1.6));
                const updatedWeights = { ...wordWeights, [targetId]: newW };
                setWordWeights(updatedWeights);
                localStorage.setItem("ruso-word-weights", JSON.stringify(updatedWeights));
            }
        }
    };

    // Resetear estadísticas
    const handleResetProgress = () => {
        if (window.confirm(t.statsResetConfirm)) {
            localStorage.removeItem("ruso-played");
            localStorage.removeItem("ruso-correct");
            localStorage.removeItem("ruso-incorrect");
            localStorage.removeItem("ruso-streak");
            localStorage.removeItem("ruso-maxstreak");
            localStorage.removeItem("ruso-letter-weights");
            localStorage.removeItem("ruso-word-weights");

            setPlayedCount(0);
            setCorrectCount(0);
            setIncorrectCount(0);
            setStreak(0);
            setMaxStreak(0);

            const defaultLetterWeights: Record<string, number> = {};
            russianAlphabet.forEach((l) => (defaultLetterWeights[l.id] = 100));
            setLetterWeights(defaultLetterWeights);

            const defaultWordWeights: Record<string, number> = {};
            commonWords.forEach((w) => (defaultWordWeights[w.id] = 100));
            setWordWeights(defaultWordWeights);

            setIsCorrect(null);
            setHasAnswered(false);
            setUserAnswer("");
            setSelectedOption(null);
            setWrongChoices([]);

            setShowStats(false);
            setTimeout(() => startNewRound(), 100);
        }
    };

    // Compartir resultado
    const handleShareResult = () => {
        const rate = playedCount > 0 ? Math.round((correctCount / playedCount) * 100) : 0;
        const text = `🧠 Ruso en Juegitos\n⭐ Racha: ${streak} | Racha Máxima: ${maxStreak}\n📈 Efectividad: ${rate}%\n🎓 Maestría del Alfabeto: ${getMasteryPercentage()}%\n\nPractica el cirílico aquí: ${window.location.href}`;

        navigator.clipboard.writeText(text).then(() => {
            alert("¡Estadísticas copiadas al portapapeles!");
        });
    };

    // Renderizar consejos explicativos de la letra activa
    const renderTipSection = () => {
        if (activeMode === "letras" && currentLetter) {
            return (
                <div style={{ borderColor: activeStyle.border, backgroundColor: `${activeStyle.accent}05` }} className="p-4.5 rounded-2xl border text-left mt-4 text-xs sm:text-sm animate-fade-in w-full">
                    <div className="flex items-center gap-2 mb-2 font-bold" style={{ color: activeStyle.accent }}>
                        <Info className="w-4 h-4" />
                        <span>{t.tipTitle}</span>
                    </div>
                    <p style={{ color: activeStyle.text }} className="leading-relaxed font-semibold">
                        {t.alphabetTips[currentLetter.id as keyof typeof t.alphabetTips]}
                    </p>
                </div>
            );
        }
        if (activeMode === "palabras" && currentWord) {
            return (
                <div style={{ borderColor: activeStyle.border, backgroundColor: `${activeStyle.accent}05` }} className="p-4.5 rounded-2xl border text-left mt-4 text-xs sm:text-sm animate-fade-in w-full">
                    <div className="flex items-center gap-2 mb-2 font-bold" style={{ color: activeStyle.accent }}>
                        <BookOpen className="w-4 h-4" />
                        <span>{t.meaning}</span>
                    </div>
                    <p style={{ color: activeStyle.text }} className="text-sm sm:text-base font-extrabold capitalize">
                        {currentWord.meanings[gameLang] || currentWord.meanings["es"]}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-indigo-500" />
            </div>
        );
    }

    const winRate = playedCount > 0 ? Math.round((correctCount / playedCount) * 100) : 0;
    const isWordModeUnlocked = getMasteryPercentage() >= 40;

    return (
        <div
            style={{
                backgroundColor: activeStyle.bg,
                color: activeStyle.text,
            }}
            className="min-h-[calc(100vh-65px)] pt-6 xl:pt-10 px-4 sm:px-6 pb-8 transition-colors duration-500 relative flex flex-col items-center justify-between"
        >
            {/* Canvas para confeti de fondo */}
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40 w-full h-full" />

            {/* Floating Toast Notification (para Latín y otros avisos) */}
            {toastMessage && (
                <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in z-50 border border-white/10 text-xs sm:text-sm font-bold max-w-md">
                    <span>{toastMessage}</span>
                    <button onClick={() => setToastMessage(null)} className="hover:opacity-80 p-0.5 rounded-full bg-white/10">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Contenedor Central */}
            <div className="w-full max-w-2xl flex-1 flex flex-col items-center">

                {/* CABECERA (Simple y centrada) */}
                <div className="w-full flex flex-col items-center text-center mb-4 sm:mb-6">
                    <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">{t.title}</h1>
                    <p style={{ color: activeStyle.textMuted }} className="text-[10px] sm:text-xs font-bold mt-0.5 opacity-90 leading-tight">{t.subtitle}</p>
                </div>

                {/* Botones de Ayuda, Estadísticas y Reset específicos del Juego */}
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
                    </div>
                </div>


                {/* SELECTOR DE MODO DE JUEGO (Letras vs Palabras) */}
                <div
                    style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                    className="flex p-1 rounded-2xl border w-full mb-3 relative select-none"
                >
                    <button
                        onClick={() => setActiveMode("letras")}
                        className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                        style={{
                            backgroundColor: activeMode === "letras" ? activeStyle.accent : "transparent",
                            color: activeMode === "letras" ? activeStyle.btnText : activeStyle.text,
                        }}
                    >
                        <Keyboard className="w-4 h-4" />
                        <span>{t.lettersMode}</span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveMode("palabras");
                        }}
                        className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative"
                        style={{
                            backgroundColor: activeMode === "palabras" ? activeStyle.accent : "transparent",
                            color: activeMode === "palabras" ? activeStyle.btnText : activeStyle.text,
                        }}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>{t.wordsMode}</span>
                        {!isWordModeUnlocked && (
                            <span className="absolute -top-1 right-2 bg-yellow-500 text-[8px] px-1.5 py-0.5 rounded-full text-black font-extrabold uppercase animate-soft-pulse border border-yellow-300">
                                LOCKED
                            </span>
                        )}
                    </button>
                </div>

                {/* PANEL DE CONFIGURACIÓN DEL MODO ACTIVO (Muy compacto e inline) */}
                <div className="w-full flex flex-col sm:flex-row gap-3.5 justify-between items-center mb-4 sm:mb-6 text-xs font-semibold px-1 py-1">
                    {/* Configuración de Dirección (solo para Letras) */}
                    {activeMode === "letras" ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span style={{ color: activeStyle.textMuted }} className="text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0">
                                {t.direction}:
                            </span>
                            <div className="flex flex-wrap sm:flex-nowrap bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5 gap-1 flex-1 sm:flex-initial">
                                {(["cyr-to-lat", "lat-to-cyr", "mixed"] as const).map((dir) => (
                                    <button
                                        key={dir}
                                        onClick={() => setPracticeDirection(dir)}
                                        className="flex-1 px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer text-center whitespace-nowrap"
                                        style={{
                                            backgroundColor: practiceDirection === dir ? activeStyle.accent : "transparent",
                                            color: practiceDirection === dir ? activeStyle.btnText : activeStyle.text,
                                        }}
                                    >
                                        {dir === "cyr-to-lat" ? t.cyrToLat : dir === "lat-to-cyr" ? t.latToCyr : t.mixed}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 py-0.5 text-[10px] sm:text-xs font-bold leading-normal text-left flex-1">
                            <Award className="w-4 h-4 text-yellow-500 shrink-0" />
                            <span style={{ color: activeStyle.textMuted }}>
                                {isWordModeUnlocked ? t.unlockedMsg : t.progressRec}
                            </span>
                        </div>
                    )}

                    {/* Configuración de Entrada */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span style={{ color: activeStyle.textMuted }} className="text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0">
                            {t.inputMethod}:
                        </span>
                        <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5 gap-1 flex-1 sm:flex-initial">
                            {(["opciones", "escritura"] as const).map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setInputMethod(method)}
                                    className="flex-1 px-2.5 py-1 rounded-md text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer text-center whitespace-nowrap"
                                    style={{
                                        backgroundColor: inputMethod === method ? activeStyle.accent : "transparent",
                                        color: inputMethod === method ? activeStyle.btnText : activeStyle.text,
                                    }}
                                >
                                    {method === "opciones" ? t.options : t.writing}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TARJETA PRINCIPAL DE JUEGO */}
                {((activeMode === "letras" && currentLetter) || (activeMode === "palabras" && currentWord)) && (
                    <div className="w-full flex flex-col gap-6 select-none animate-fade-in">

                        {/* El Panel de Letra/Palabra en Grande */}
                        <div
                            style={{
                                backgroundColor: activeStyle.card,
                                borderColor: activeStyle.border,
                                boxShadow: `0 8px 30px -10px ${activeStyle.accent}15`
                            }}
                            className={`w-full rounded-3xl border p-5 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${shakeCard ? "animate-shake border-red-500/50" : ""
                                }`}
                        >
                            {/* Indicador de peso/frecuencia para ver el progreso adaptativo (Premium info) */}
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[9px] font-bold border border-black/5 dark:border-white/5" style={{ color: activeStyle.textMuted }}>
                                <RefreshCw className="w-2.5 h-2.5" />
                                <span>
                                    Freq: {
                                        activeMode === "letras" && currentLetter
                                            ? `${Math.round(((letterWeights[currentLetter.id] || 100) / 500) * 100)}%`
                                            : currentWord
                                                ? `${Math.round(((wordWeights[currentWord.id] || 100) / 500) * 100)}%`
                                                : "0%"
                                    }
                                </span>
                            </div>

                            {/* Indicador de dirección actual en Letras */}
                            {activeMode === "letras" && (
                                <span style={{ color: activeStyle.accent }} className="text-xxs sm:text-xs font-extrabold uppercase tracking-widest mb-3 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-black/5">
                                    {currentDirection === "cyr-to-lat" ? "CIRÍLICO ➔ LATÍN" : "LATÍN ➔ CIRÍLICO"}
                                </span>
                            )}

                            {/* CARÁCTER O PALABRA CENTRAL */}
                            <div className="my-4 text-center">
                                {activeMode === "letras" && currentLetter && (
                                    <h2 className="text-7xl sm:text-8xl font-black tracking-tight" style={{ fontFamily: "'PTSans', var(--font-montserrat-alternates), sans-serif" }}>
                                        {currentDirection === "cyr-to-lat" ? currentLetter.cirilicUpper : currentLetter.latin}
                                    </h2>
                                )}
                                {activeMode === "palabras" && currentWord && (
                                    <h2 className={`${getWordFontSizeClass(currentWord.word)} font-black tracking-tight`} style={{ fontFamily: "'PTSans', var(--font-montserrat-alternates), sans-serif" }}>
                                        {currentWord.word}
                                    </h2>
                                )}
                            </div>

                            {/* DETALLE COMPLEMENTARIO REVELADO AL RESPONDER */}
                            {hasAnswered && renderTipSection()}
                        </div>

                        {/* SECCIÓN DE ENTRADA Y VALIDACIÓN */}
                        <div className="w-full">
                            {inputMethod === "opciones" ? (
                                /* MODO OPCIONES (GRID DE BOTONES) */
                                <div className={`grid gap-3 sm:gap-4 ${activeMode === "palabras" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"}`}>
                                    {options.map((option, idx) => {
                                        const isCorrectOption = activeMode === "letras" && currentLetter
                                            ? (currentDirection === "cyr-to-lat" ? option === currentLetter.latin : option === currentLetter.cirilicLower)
                                            : currentWord
                                                ? option === currentWord.latin
                                                : false;

                                        const isSelected = selectedOption === option;
                                        const isWrong = wrongChoices.includes(option);

                                        // Estilo dinámico del botón según el estado
                                        let btnStyle = {
                                            backgroundColor: activeStyle.card,
                                            color: activeStyle.text,
                                            borderColor: activeStyle.border
                                        };

                                        if (hasAnswered) {
                                            if (isCorrectOption) {
                                                btnStyle = {
                                                    backgroundColor: "#EAF7EE",
                                                    color: "#0E3A1A",
                                                    borderColor: "#ABE5BE"
                                                };
                                            } else if (isSelected || isWrong) {
                                                btnStyle = {
                                                    backgroundColor: "#FFF5F5",
                                                    color: "#4A1B1B",
                                                    borderColor: "#FFC2C2"
                                                };
                                            }
                                        } else if (isSelected) {
                                            btnStyle = {
                                                backgroundColor: activeStyle.accent,
                                                color: activeStyle.btnText,
                                                borderColor: activeStyle.accent
                                            };
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                disabled={hasAnswered}
                                                onClick={() => {
                                                    setSelectedOption(option);
                                                    handleCheckAnswer(option);
                                                }}
                                                style={btnStyle}
                                                className="py-4.5 rounded-2xl border-2 text-base sm:text-lg font-black transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm text-center flex items-center justify-center gap-2 select-none"
                                            >
                                                <span>{option}</span>
                                                {hasAnswered && isCorrectOption && <Check className="w-5 h-5 text-emerald-600" />}
                                                {hasAnswered && (isSelected || isWrong) && !isCorrectOption && <X className="w-5 h-5 text-rose-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* MODO ESCRITURA DIRECTA */
                                <div className="flex flex-col gap-4">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!hasAnswered) {
                                                handleCheckAnswer(userAnswer);
                                            }
                                        }}
                                        className="flex gap-3"
                                    >
                                        <input
                                            type="text"
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            disabled={hasAnswered}
                                            autoFocus
                                            placeholder={
                                                activeMode === "letras" && currentDirection === "lat-to-cyr"
                                                    ? t.placeholderWriteCyr
                                                    : t.placeholderWrite
                                            }
                                            className="flex-1 px-5 py-4 rounded-2xl border text-sm sm:text-base font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300"
                                            style={{
                                                backgroundColor: activeStyle.card,
                                                color: activeStyle.text,
                                                borderColor: isCorrect === true ? "#2E7D46" : isCorrect === false ? "#FF6B6B" : activeStyle.border,
                                                boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.03)`
                                            }}
                                        />

                                        {!hasAnswered ? (
                                            <button
                                                type="submit"
                                                disabled={!userAnswer.trim()}
                                                style={{
                                                    backgroundColor: userAnswer.trim() ? activeStyle.accent : `${activeStyle.accent}50`,
                                                    color: activeStyle.btnText
                                                }}
                                                className="px-6 rounded-2xl text-xs sm:text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
                                            >
                                                {t.check}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={startNewRound}
                                                style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                                                className="px-6 rounded-2xl text-xs sm:text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm flex items-center gap-1.5"
                                            >
                                                <span>{t.next}</span>
                                                <ChevronRight className="w-4.5 h-4.5" />
                                            </button>
                                        )}
                                    </form>

                                    {/* Teclado Virtual Cirílico Auxiliar (Solo en Modo Escritura y dirección Latín -> Cirílico) */}
                                    {activeMode === "letras" && currentDirection === "lat-to-cyr" && !hasAnswered && (
                                        <div style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }} className="p-4 rounded-2xl border shadow-sm">
                                            <div className="text-[10px] font-extrabold uppercase tracking-wider mb-2.5" style={{ color: activeStyle.textMuted }}>
                                                {t.keyboardTitle}
                                            </div>
                                            <div className="grid grid-cols-7 sm:grid-cols-11 gap-1.5">
                                                {russianAlphabet.map((l) => (
                                                    <button
                                                        key={l.id}
                                                        type="button"
                                                        onClick={() => setUserAnswer((prev) => prev + l.cirilicLower)}
                                                        style={{ backgroundColor: activeStyle.keyBg, color: activeStyle.text }}
                                                        className="py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-black hover:bg-black/10 transition-colors cursor-pointer text-center"
                                                    >
                                                        {l.cirilicLower}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => setUserAnswer((prev) => prev.slice(0, -1))}
                                                    className="col-span-2 py-1.5 sm:py-2.5 rounded-lg text-xxs font-extrabold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer text-center"
                                                >
                                                    DEL
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Banner de Feedback Post-Respuesta (Si es Escritura) */}
                            {hasAnswered && inputMethod === "escritura" && (
                                <div
                                    style={{
                                        backgroundColor: isCorrect ? "#EAF7EE" : "#FFF5F5",
                                        borderColor: isCorrect ? "#C2ECCF" : "#FFD6D6",
                                        color: isCorrect ? "#0E3A1A" : "#4A1B1B"
                                    }}
                                    className="w-full rounded-2xl border p-4.5 mt-4 flex items-center justify-between text-xs sm:text-sm font-bold animate-fade-in"
                                >
                                    <div className="flex items-center gap-2">
                                        {isCorrect ? (
                                            <Check className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <X className="w-5 h-5 text-rose-600" />
                                        )}
                                        <span>
                                            {isCorrect ? t.correct : `${t.incorrect}. Respuesta: `}
                                            {!isCorrect && (
                                                <span className="font-extrabold underline decoration-2">
                                                    {activeMode === "letras" && currentLetter
                                                        ? (currentDirection === "cyr-to-lat" ? currentLetter.latin : currentLetter.cirilicLower)
                                                        : currentWord
                                                            ? currentWord.latin
                                                            : ""}
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    <button
                                        onClick={startNewRound}
                                        style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                                        className="px-3.5 py-1.5 rounded-xl text-xxs font-extrabold shadow-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <span>{t.next}</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* Botón de Siguiente para Opciones */}
                            {hasAnswered && inputMethod === "opciones" && (
                                <button
                                    onClick={startNewRound}
                                    style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                                    className="w-full py-4.5 rounded-2xl text-sm font-black mt-4 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                >
                                    <span>{t.next}</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                    </div>
                )}

            </div>

            {/* FOOTER RÁPIDO DE RACHAS EN PANTALLA PRINCIPAL */}
            <div
                style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }}
                className="w-full max-w-2xl rounded-2xl border px-3 py-2.5 sm:px-5 sm:py-3.5 grid grid-cols-3 gap-2 mt-6 text-[10px] sm:text-xs font-bold text-center"
            >
                <div className="flex flex-col xs:flex-row items-center justify-center gap-1 sm:gap-1.5">
                    <Trophy className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-yellow-500 shrink-0" />
                    <div className="flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1">
                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs">{t.streak}</span>
                        <span className="text-xs sm:text-sm font-black" style={{ color: activeStyle.text }}>{streak}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center bg-black/5 dark:bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-black/5 self-center">
                    <div className="flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1 text-center">
                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs">{t.mastery}</span>
                        <span className="text-xs sm:text-sm font-extrabold" style={{ color: activeStyle.accent }}>
                            {getMasteryPercentage()}%
                        </span>
                    </div>
                </div>

                <div className="flex flex-col xs:flex-row items-center justify-center gap-1 sm:gap-1.5">
                    <Award className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-orange-500 shrink-0" />
                    <div className="flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1">
                        <span style={{ color: activeStyle.textMuted }} className="text-[9px] sm:text-xs">{t.maxStreak}</span>
                        <span className="text-xs sm:text-sm font-black" style={{ color: activeStyle.text }}>{maxStreak}</span>
                    </div>
                </div>
            </div>

            {/* ============================================================================
          5. MODALES INTERACTIVOS (AYUDA / ESTADÍSTICAS)
          ============================================================================ */}

            {/* MODAL DE AYUDA (TABLA COMPLETA DE ALFABETO CIRÍLICO) */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-full max-w-xl p-5 sm:p-7 rounded-3xl shadow-xl flex flex-col gap-4 relative animate-scale-in max-h-[85vh] overflow-y-auto"
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

                        <div className="text-xs sm:text-sm font-medium flex flex-col gap-2.5 leading-relaxed text-left opacity-90 px-1">
                            <p>{t.helpDesc1}</p>
                            <p>{t.helpDesc2}</p>
                            <p>{t.helpDesc3}</p>
                        </div>

                        {/* TABLA DE CIRÍLICO */}
                        <div className="border rounded-2xl overflow-hidden mt-2 max-h-[40dvh] overflow-y-auto scrollbar-thin select-none">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/5 dark:bg-white/5 font-extrabold border-b text-[10px] sm:text-xs" style={{ color: activeStyle.textMuted }}>
                                    <tr>
                                        <th className="p-1.5 sm:p-2.5 pl-3 sm:pl-4">{t.colcirilic}</th>
                                        <th className="p-1.5 sm:p-2.5">{t.colTranslit}</th>
                                        <th className="p-1.5 sm:p-2.5 pr-3 sm:pr-4">{t.colSound}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y font-bold text-xxs sm:text-xs">
                                    {russianAlphabet.map((l) => (
                                        <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="p-1.5 sm:p-2 pl-3 sm:pl-4 text-sm sm:text-base font-black shrink-0" style={{ color: activeStyle.accent }}>{l.char}</td>
                                            <td className="p-1.5 sm:p-2 font-mono text-xs sm:text-sm">{l.latin}</td>
                                            <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs leading-normal pr-3 sm:pr-4" style={{ color: activeStyle.textMuted }}>{t.alphabetTips[l.id as keyof typeof t.alphabetTips]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={() => setShowHelp(false)}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="w-full py-3 rounded-2xl text-xs sm:text-sm font-extrabold mt-2 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-sm text-center"
                        >
                            {t.btnClose}
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL DE ESTADÍSTICAS */}
            {showStats && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-full max-w-md p-5 sm:p-7 rounded-3xl shadow-xl flex flex-col gap-4 relative animate-scale-in max-h-[85vh] overflow-y-auto"
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

                        {playedCount > 0 ? (
                            <div className="flex flex-col gap-5">
                                {/* Cuadrícula de estadísticas rápidas */}
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5">
                                        <div className="text-xl sm:text-2xl font-black">{playedCount}</div>
                                        <div style={{ color: activeStyle.textMuted }} className="text-[9px] font-extrabold uppercase tracking-wider mt-1">{t.statsPlayed}</div>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
                                        <div className="text-xl sm:text-2xl font-black">{correctCount}</div>
                                        <div className="text-[9px] font-extrabold uppercase tracking-wider mt-1">{t.statsCorrect}</div>
                                    </div>
                                    <div className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl border border-rose-500/20">
                                        <div className="text-xl sm:text-2xl font-black">{incorrectCount}</div>
                                        <div className="text-[9px] font-extrabold uppercase tracking-wider mt-1">{t.statsIncorrect}</div>
                                    </div>
                                </div>

                                {/* Gráfica de porcentaje de efectividad y maestría */}
                                <div className="flex flex-col gap-4.5 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border">
                                    {/* Fila Efectividad */}
                                    <div className="flex flex-col gap-1.5 text-xs">
                                        <div className="flex justify-between font-bold">
                                            <span style={{ color: activeStyle.textMuted }}>{t.statsWinRate}</span>
                                            <span>{winRate}%</span>
                                        </div>
                                        <div className="bg-black/10 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${winRate}%`,
                                                    backgroundColor: activeStyle.accent
                                                }}
                                                className="h-full rounded-full transition-all duration-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Fila Maestría */}
                                    <div className="flex flex-col gap-1.5 text-xs">
                                        <div className="flex justify-between font-bold">
                                            <span style={{ color: activeStyle.textMuted }}>{t.mastery}</span>
                                            <span style={{ color: activeStyle.accent }}>{getMasteryPercentage()}%</span>
                                        </div>
                                        <div className="bg-black/10 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${getMasteryPercentage()}%`,
                                                    backgroundColor: activeStyle.accent
                                                }}
                                                className="h-full rounded-full transition-all duration-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones de las estadísticas */}
                                <div className="flex flex-col gap-2.5 mt-2">
                                    <button
                                        onClick={handleShareResult}
                                        style={{ backgroundColor: `${activeStyle.accent}15`, color: activeStyle.accent, borderColor: `${activeStyle.accent}30` }}
                                        className="w-full py-3 rounded-2xl border text-xs sm:text-sm font-extrabold hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>Compartir Resultados</span>
                                    </button>

                                    <button
                                        onClick={handleResetProgress}
                                        className="text-[10px] font-extrabold uppercase text-rose-500 hover:text-rose-600 transition-colors self-center mt-2.5 cursor-pointer"
                                    >
                                        {t.statsResetBtn}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: activeStyle.textMuted }} className="text-center font-bold text-sm py-8">
                                {t.statsNoData}
                            </p>
                        )}

                        <button
                            onClick={() => setShowStats(false)}
                            style={{ backgroundColor: activeStyle.accent, color: activeStyle.btnText }}
                            className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold mt-2 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-sm text-center"
                        >
                            {t.btnClose}
                        </button>
                    </div>
                </div>
            )}

            {/* ESTILOS DE ANIMACIÓN CSS LOCALES */}
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
        </div>
    );
}
