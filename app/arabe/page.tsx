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

interface ArabicLetterItem {
    id: string;
    char: string; // Isolated representation
    isolated: string;
    initial: string;
    medial: string;
    final: string;
    latin: string; // transliteration
    name: string; // e.g. "Alif"
}

interface WordItem {
    id: string;
    word: string; // Connected Arabic spelling
    latin: string; // transliteration
    meanings: Record<string, string>; // language translations
    breakdown: string; // letter breakdown (isolated forms joined with " + ")
}

// 28 basic Arabic letters + 3 special characters
const arabicAlphabet: ArabicLetterItem[] = [
    { id: "alif", char: "ا", isolated: "ا", initial: "ا", medial: "ـا", final: "ـا", latin: "a", name: "Alif" },
    { id: "ba", char: "ب", isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب", latin: "b", name: "Bāʾ" },
    { id: "ta", char: "ت", isolated: "ت", initial: "تـ", medial: "ـtـ", final: "ـت", latin: "t", name: "Tāʾ" },
    { id: "tha", char: "ث", isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث", latin: "th", name: "Thāʾ" },
    { id: "jim", char: "ج", isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج", latin: "j", name: "Jīm" },
    { id: "ha_hard", char: "ح", isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح", latin: "ḥ", name: "Ḥāʾ" },
    { id: "kha", char: "خ", isolated: "خ", initial: "خـ", medial: "ـkhـ", final: "ـخ", latin: "kh", name: "Khāʾ" },
    { id: "dal", char: "د", isolated: "د", initial: "د", medial: "ـد", final: "ـد", latin: "d", name: "Dāl" },
    { id: "dhal", char: "ذ", isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ", latin: "dh", name: "Dhāl" },
    { id: "ra", char: "ر", isolated: "ر", initial: "ر", medial: "ـr", final: "ـر", latin: "r", name: "Rāʾ" },
    { id: "zayn", char: "ز", isolated: "ز", initial: "ز", medial: "ـز", final: "ـز", latin: "z", name: "Zāy" },
    { id: "sin", char: "س", isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـs", latin: "s", name: "Sīn" },
    { id: "shin", char: "ش", isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش", latin: "sh", name: "Shīn" },
    { id: "sad", char: "ص", isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص", latin: "ṣ", name: "Ṣād" },
    { id: "dad", char: "ض", isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض", latin: "ḍ", name: "Ḍād" },
    { id: "ta_emphatic", char: "ط", isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط", latin: "ṭ", name: "Ṭāʾ" },
    { id: "za_emphatic", char: "ظ", isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ", latin: "ẓ", name: "Ẓāʾ" },
    { id: "ayn", char: "ع", isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع", latin: "ʿ", name: "ʿAyn" },
    { id: "ghayn", char: "غ", isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ", latin: "gh", name: "Ghayn" },
    { id: "fa", char: "ف", isolated: "ف", initial: "فـ", medial: "ـfـ", final: "ـف", latin: "f", name: "Fāʾ" },
    { id: "qaf", char: "ق", isolated: "ق", initial: "قـ", medial: "ـqـ", final: "ـق", latin: "q", name: "Qāf" },
    { id: "kaf", char: "ك", isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك", latin: "k", name: "Kāf" },
    { id: "lam", char: "ل", isolated: "ل", initial: "لـ", medial: "ـlـ", final: "ـل", latin: "l", name: "Lām" },
    { id: "mim", char: "م", isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم", latin: "m", name: "Mīm" },
    { id: "nun", char: "ن", isolated: "ن", initial: "نـ", medial: "ـnـ", final: "ـn", latin: "n", name: "Nūn" },
    { id: "ha", char: "ه", isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه", latin: "h", name: "Hāʾ" },
    { id: "waw", char: "و", isolated: "و", initial: "و", medial: "ـو", final: "ـو", latin: "w", name: "Wāw" },
    { id: "ya", char: "ي", isolated: "ي", initial: "يـ", medial: "ـyـ", final: "ـي", latin: "y", name: "Yāʾ" },
    { id: "hamza", char: "ء", isolated: "ء", initial: "ء", medial: "ء", final: "ء", latin: "'", name: "Hamza" },
    { id: "ta_marbuta", char: "ة", isolated: "ة", initial: "—", medial: "—", final: "ـة", latin: "t/h", name: "Tāʾ marbūṭah" },
    { id: "alif_maqsura", char: "ى", isolated: "ى", initial: "—", medial: "—", final: "ـى", latin: "ā", name: "Alif maqṣūrah" }
];

// Clean up standard connecting Unicode characters where they might have been mistyped above
arabicAlphabet.forEach(l => {
    if (l.medial === "ـtـ") l.medial = "ـتـ";
    if (l.medial === "ـkhـ") l.medial = "ـخـ";
    if (l.medial === "ـs") l.medial = "ـسـ";
    if (l.medial === "ـfـ") l.medial = "ـفـ";
    if (l.medial === "ـqـ") l.medial = "ـقـ";
    if (l.medial === "ـr") l.medial = "ـر";
    if (l.medial === "ـlـ") l.medial = "ـلـ";
    if (l.medial === "ـnـ") l.medial = "ـنـ";
    if (l.final === "ـn") l.final = "ـن";
    if (l.medial === "ـyـ") l.medial = "ـيـ";
});

// Common Arabic Words database
const commonWords: WordItem[] = [
    { id: "w1", word: "مَرْحَبًا", latin: "marhaban", meanings: { es: "hola", de: "Hallo", pl: "cześć", pt: "olá", uk: "привіт", ru: "привет", la: "hola" }, breakdown: "م + ر + ح + ب + ا" },
    { id: "w2", word: "شُكْرًا", latin: "shukran", meanings: { es: "gracias", de: "Danke", pl: "dziękuję", pt: "obrigado", uk: "дякую", ru: "спасибо", la: "gracias" }, breakdown: "ش + ك + ر + ا" },
    { id: "w3", word: "نَعَمْ", latin: "na'am", meanings: { es: "sí", de: "ja", pl: "tak", pt: "sim", uk: "так", ru: "да", la: "sí" }, breakdown: "ن +  ع + م" },
    { id: "w4", word: "لَا", latin: "la", meanings: { es: "no", de: "nein", pl: "nie", pt: "não", uk: "ні", ru: "нет", la: "no" }, breakdown: "ل + ا" },
    { id: "w5", word: "مِنْ فَضْلِكَ", latin: "min fadlik", meanings: { es: "por favor (a hombre)", de: "bitte (m)", pl: "proszę (m)", pt: "por favor (m)", uk: "будь ласка (м)", ru: "пожалуйста (к мужчине)", la: "por favor (a hombre)" }, breakdown: "م + ن +   + ف + ض + ل + ك" },
    { id: "w6", word: "بِخَيْر", latin: "bikhayr", meanings: { es: "bien", de: "gut / okay", pl: "dobrze", pt: "bem", uk: "добре", ru: "хорошо", la: "bien" }, breakdown: "ب + خ + ي + ر" },
    { id: "w7", word: "أَهْلًا", latin: "ahlan", meanings: { es: "hola / bienvenido", de: "Willkommen / Hallo", pl: "witaj", pt: "olá / bem-vindo", uk: "привіт / ласкаво просимо", ru: "привет / добро пожаловать", la: "hola / bienvenido" }, breakdown: "أ + ه + ل + ا" },
    { id: "w8", word: "مَعَ السَّلَامَة", latin: "ma'a salama", meanings: { es: "adiós", de: "auf Wiedersehen", pl: "do widzenia", pt: "adeus", uk: "до побачення", ru: "до свидания", la: "adiós" }, breakdown: "م + ع +   + ا + ل + س + ل + ا + م + ة" },
    { id: "w9", word: "صَدِيق", latin: "sadiq", meanings: { es: "amigo", de: "Freund", pl: "przyjaciel", pt: "amigo", uk: "друг", ru: "друг", la: "amigo" }, breakdown: "ص + d + y + q" }, // Wait, let's write it in Arabic characters: ص + د + ي + ق
    { id: "w10", word: "كِتَاب", latin: "kitab", meanings: { es: "libro", de: "Buch", pl: "książka", pt: "livro", uk: "книга", ru: "книга", la: "libro" }, breakdown: "ك + ت + ا + ب" },
    { id: "w11", word: "مَاء", latin: "ma'", meanings: { es: "agua", de: "Wasser", pl: "woda", pt: "água", uk: "вода", ru: "вода", la: "agua" }, breakdown: "م + ا + ء" },
    { id: "w12", word: "خُبْز", latin: "khubz", meanings: { es: "pan", de: "Brot", pl: "chleb", pt: "pão", uk: "хліб", ru: "хлеб", la: "pan" }, breakdown: "خ + ب + ز" },
    { id: "w13", word: "حَلِيب", latin: "halib", meanings: { es: "leche", de: "Milch", pl: "mleko", pt: "leite", uk: "молоко", ru: "молоко", la: "leche" }, breakdown: "ح + ل + ي + ب" },
    { id: "w14", word: "شَاي", latin: "shay", meanings: { es: "té", de: "Tee", pl: "herbata", pt: "chá", uk: "чай", ru: "чай", la: "té" }, breakdown: "ش + ا + ي" },
    { id: "w15", word: "قَهْوَة", latin: "qahwa", meanings: { es: "café", de: "Kaffee", pl: "kawa", pt: "café", uk: "кава", ru: "кофе", la: "café" }, breakdown: "ق + ه + و + ة" },
    { id: "w16", word: "بَيْت", latin: "bayt", meanings: { es: "casa", de: "Haus", pl: "dom", pt: "casa", uk: "дім", ru: "дом", la: "casa" }, breakdown: "ب + ي + ت" },
    { id: "w17", word: "مَدِينَة", latin: "madina", meanings: { es: "ciudad", de: "Stadt", pl: "miasto", pt: "cidade", uk: "місто", ru: "город", la: "ciudad" }, breakdown: "م + د + ي + ن + ة" },
    { id: "w18", word: "عَائِلَة", latin: "a'ila", meanings: { es: "familia", de: "Familie", pl: "rodzina", pt: "família", uk: "сім'я", ru: "семья", la: "familia" }, breakdown: "ع + ا + ئ + ل + ة" },
    { id: "w19", word: "شَارِع", latin: "shari'", meanings: { es: "calle", de: "Straße", pl: "ulica", pt: "rua", uk: "вулиця", ru: "улица", la: "calle" }, breakdown: "ش + ا + ر + c" }, // wait: ش + ا + ر + ع
    { id: "w20", word: "عَمَل", latin: "amal", meanings: { es: "trabajo", de: "Arbeit", pl: "praca", pt: "trabalho", uk: "робота", ru: "работа", la: "trabajo" }, breakdown: "ع + м + ل" }, // wait, ع + م + ل
    { id: "w21", word: "حُبّ", latin: "hubb", meanings: { es: "amor", de: "Liebe", pl: "miłość", pt: "amor", uk: "любов", ru: "любовь", la: "amor" }, breakdown: "ح + ب" },
    { id: "w22", word: "حَيَاة", latin: "hayat", meanings: { es: "vida", de: "Leben", pl: "życie", pt: "vida", uk: "життя", ru: "жизнь", la: "vida" }, breakdown: "ح + ي + ا + ة" },
    { id: "w23", word: "وَلَد", latin: "walad", meanings: { es: "niño / hijo", de: "Junge / Kind", pl: "chłopiec / syn", pt: "menino / filho", uk: "хлопчик / син", ru: "мальчик / сын", la: "niño / hijo" }, breakdown: "و + ل + د" },
    { id: "w24", word: "بِنْت", latin: "bint", meanings: { es: "niña / hija", de: "Mädchen / Tochter", pl: "dziewczynka / córka", pt: "menina / filha", uk: "дівчинка / донька", ru: "девочка / дочь", la: "niña / hija" }, breakdown: "ب + ن + ت" },
    { id: "w25", word: "صَبَاح الْخَيْر", latin: "sabah al-khayr", meanings: { es: "buenos días", de: "Guten Morgen", pl: "dzień dobry (rano)", pt: "bom dia", uk: "доброго ранку", ru: "доброе утро", la: "buenos días" }, breakdown: "ص + ب + ا + ح +   + а + ل + x + ي + ر" }, // wait, sound check
    { id: "w26", word: "مَسَاء الْخَيْر", latin: "massa' al-khayr", meanings: { es: "buenas tardes", de: "Guten Abend", pl: "dobry wieczór", pt: "boa tarde / noite", uk: "доброго вечора", ru: "добрый вечер", la: "buenas tardes" }, breakdown: "م + س + a + ء +   + ا + ل + خ + ي + ر" },
    { id: "w27", word: "لَيْلَة سَعِيدَة", latin: "layla sa'ida", meanings: { es: "buenas noches", de: "Gute Nacht", pl: "dobranoc", pt: "boa noite (despedida)", uk: "надобраніч", ru: "спокойной ночи", la: "buenas noches" }, breakdown: "ل + ي + ل + ة +   + س + ع + ي + د + ة" },
    { id: "w28", word: "مَدْرَسَة", latin: "madrasa", meanings: { es: "escuela", de: "Schule", pl: "szkoła", pt: "escola", uk: "школа", ru: "школа", la: "escuela" }, breakdown: "م + د + ر + س + ة" },
    { id: "w29", word: "شَمْس", latin: "shams", meanings: { es: "sol", de: "Sonne", pl: "słońce", pt: "sol", uk: "сонце", ru: "солнце", la: "sol" }, breakdown: "ش + م + س" },
    { id: "w30", word: "بَلَد", latin: "balad", meanings: { es: "país", de: "Land", pl: "kraj", pt: "país", uk: "країна", ru: "страна", la: "país" }, breakdown: "ب + ل + د" },
    { id: "w31", word: "وَقْت", latin: "waqt", meanings: { es: "tiempo", de: "Zeit", pl: "czas", pt: "tempo", uk: "час", ru: "время", la: "tiempo" }, breakdown: "و + ق + ت" },
    { id: "w32", word: "مَطْعَم", latin: "mat'am", meanings: { es: "restaurante", de: "Restaurant", pl: "restauracja", pt: "restaurante", uk: "ресторан", ru: "ресторан", la: "restaurante" }, breakdown: "م + ط + ع + م" },
    { id: "w33", word: "تَذْكِرَة", latin: "tadhkira", meanings: { es: "billete / boleto", de: "Ticket", pl: "bilet", pt: "bilhete", uk: "квиток", ru: "билет", la: "billete / boleto" }, breakdown: "ت + ذ + ك + ر + ة" },
    { id: "w34", word: "كَلْب", latin: "kalb", meanings: { es: "perro", de: "Hund", pl: "pies", pt: "cão / cachorro", uk: "собака", ru: "собака", la: "perro" }, breakdown: "ك + ل + ب" },
    { id: "w35", word: "قِطَّة", latin: "qitta", meanings: { es: "gato", de: "Katze", pl: "kot", pt: "gato", uk: "кішка / кіт", ru: "кошка", la: "gato" }, breakdown: "ق + ط + ة" },
    { id: "w36", word: "تُفَّاحَة", latin: "tuffaha", meanings: { es: "manzana", de: "Apfel", pl: "jabłko", pt: "maçã", uk: "яблуко", ru: "яблоко", la: "manzana" }, breakdown: "ت + ف + ا + ح + ة" },
    { id: "w37", word: "وَاحِد", latin: "wahid", meanings: { es: "uno", de: "eins", pl: "jeden", pt: "um", uk: "один", ru: "один", la: "uno" }, breakdown: "و + ا + ح + د" },
    { id: "w38", word: "اِثْنَان", latin: "ithnan", meanings: { es: "dos", de: "zwei", pl: "dwa", pt: "dois", uk: "два", ru: "два", la: "dos" }, breakdown: "ا + ث + ن + ا + ن" },
    { id: "w39", word: "ثَلَاثَة", latin: "thalatha", meanings: { es: "tres", de: "drei", pl: "trzy", pt: "três", uk: "три", ru: "три", la: "tres" }, breakdown: "ث + ل + ا + ث + ة" },
    { id: "w40", word: "أَرْبَعَة", latin: "arba'a", meanings: { es: "cuatro", de: "vier", pl: "cztery", pt: "quatro", uk: "чотири", ru: "четыре", la: "cuatro" }, breakdown: "أ + ر + ب + ع + ة" },
    { id: "w41", word: "خَمْسَة", latin: "khamsa", meanings: { es: "cinco", de: "fünf", pl: "pięć", pt: "cinco", uk: "п'ять", ru: "пять", la: "cinco" }, breakdown: "خ + م + س + ة" },
    { id: "w42", word: "قَمَر", latin: "qamar", meanings: { es: "luna", de: "Mond", pl: "księżyc", pt: "lua", uk: "місяць", ru: "луна", la: "luna" }, breakdown: "ق + м + р" },
    { id: "w43", word: "جَمِيل", latin: "jamil", meanings: { es: "hermoso", de: "schön", pl: "piękny", pt: "bonito", uk: "гарний", ru: "красивый", la: "hermoso" }, breakdown: "ج + م + ي + ل" },
    { id: "w44", word: "جَدِيد", latin: "jadid", meanings: { es: "nuevo", de: "neu", pl: "nowy", pt: "novo", uk: "новий", ru: "новый", la: "nuevo" }, breakdown: "ج + د + ي + د" },
    { id: "w45", word: "قَدِيم", latin: "qadim", meanings: { es: "viejo / antiguo", de: "alt", pl: "stary", pt: "velho", uk: "старий", ru: "старый", la: "viejo / antiguo" }, breakdown: "ق + د + ي + م" },
    { id: "w46", word: "كَبِير", latin: "kabir", meanings: { es: "grande", de: "groß", pl: "duży", pt: "grande", uk: "великий", ru: "большой", la: "grande" }, breakdown: "ك + ب + ي + ر" },
    { id: "w47", word: "صَغِير", latin: "saghir", meanings: { es: "pequeño", de: "klein", pl: "mały", pt: "pequeno", uk: "маленький", ru: "маленький", la: "pequeño" }, breakdown: "ص + غ + ي + ر" },
    { id: "w48", word: "الْيَوْم", latin: "al-yawm", meanings: { es: "hoy", de: "heute", pl: "dzisiaj", pt: "hoje", uk: "сьогодні", ru: "сегодня", la: "hoy" }, breakdown: "ا + ل + ي + و + م" },
    { id: "w49", word: "غَدًا", latin: "ghadan", meanings: { es: "mañana", de: "morgen", pl: "jutro", pt: "amanhã", uk: "завтра", ru: "завтра", la: "mañana" }, breakdown: "غ + د + ا" },
    { id: "w50", word: "كَيْفَ حَالُكَ", latin: "kayfa haluk", meanings: { es: "¿cómo estás?", de: "wie geht es dir? (m)", pl: "jak się masz? (m)", pt: "como estás? (m)", uk: "як справи? (м)", ru: "как дела? (к мужчине)", la: "cómo estás? (a hombre)" }, breakdown: "ك + ي + ف +   + ح + ا + ل + ك" }
];

commonWords.forEach(w => {
    if (w.id === "w26") w.breakdown = "م + س + ا + ء +   + ا + ل + خ + ي + ر";
});

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

    const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

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

export default function ArabeGamePage() {
    const { activeStyle, setActiveGameName } = useGameConfig();
    const { gameLang, t: centralT } = useLanguage();

    const t = centralT.arabe;

    // Configurar nombre en cabecera dynamically
    useEffect(() => {
        setActiveGameName(t.title);
        return () => setActiveGameName(null);
    }, [setActiveGameName, t.title]);

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Estados de Montado y UX
    const [mounted, setMounted] = useState<boolean>(false);
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [showStats, setShowStats] = useState<boolean>(false);
    const [shakeCard, setShakeCard] = useState<boolean>(false);

    // Estados de Configuración de Juego
    const [activeMode, setActiveMode] = useState<"letras" | "palabras">("letras");
    const [practiceDirection, setPracticeDirection] = useState<"ara-to-lat" | "lat-to-ara" | "mixed">("ara-to-lat");
    const [letterFormsMode, setLetterFormsMode] = useState<"solo-aisladas" | "todas-formas">("solo-aisladas");
    const [inputMethod, setInputMethod] = useState<"opciones" | "escritura">("opciones");

    // Pesos del Algoritmo Adaptativo (MUY IMPORTANTE: Aislado con prefijo "arabe-")
    const [letterWeights, setLetterWeights] = useState<Record<string, number>>({});
    const [wordWeights, setWordWeights] = useState<Record<string, number>>({});

    // Estadísticas del Juego
    const [playedCount, setPlayedCount] = useState<number>(0);
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [incorrectCount, setIncorrectCount] = useState<number>(0);
    const [streak, setStreak] = useState<number>(0);
    const [maxStreak, setMaxStreak] = useState<number>(0);

    // Estado de la Pregunta en Curso
    const [currentLetter, setCurrentLetter] = useState<ArabicLetterItem | null>(null);
    const [currentLetterFormKey, setCurrentLetterFormKey] = useState<"isolated" | "initial" | "medial" | "final">("isolated");
    const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
    const [currentDirection, setCurrentDirection] = useState<"ara-to-lat" | "lat-to-ara">("ara-to-lat");
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

        const savedPlayed = localStorage.getItem("arabe-played") || "0";
        const savedCorrect = localStorage.getItem("arabe-correct") || "0";
        const savedIncorrect = localStorage.getItem("arabe-incorrect") || "0";
        const savedStreak = localStorage.getItem("arabe-streak") || "0";
        const savedMaxStreak = localStorage.getItem("arabe-maxstreak") || "0";

        setPlayedCount(parseInt(savedPlayed, 10));
        setCorrectCount(parseInt(savedCorrect, 10));
        setIncorrectCount(parseInt(savedIncorrect, 10));
        setStreak(parseInt(savedStreak, 10));
        setMaxStreak(parseInt(savedMaxStreak, 10));

        // Inicializar o cargar pesos de letras
        const savedLetterWeightsStr = localStorage.getItem("arabe-letter-weights");
        let initialLetterWeights: Record<string, number> = {};
        if (savedLetterWeightsStr) {
            try {
                initialLetterWeights = JSON.parse(savedLetterWeightsStr);
            } catch (e) {
                console.error("Error parsing Arabic letter weights", e);
            }
        }
        // Asegurar que todos tengan un peso
        arabicAlphabet.forEach((l) => {
            if (initialLetterWeights[l.id] === undefined) {
                initialLetterWeights[l.id] = 100;
            }
        });
        setLetterWeights(initialLetterWeights);

        // Inicializar o cargar pesos de palabras
        const savedWordWeightsStr = localStorage.getItem("arabe-word-weights");
        let initialWordWeights: Record<string, number> = {};
        if (savedWordWeightsStr) {
            try {
                initialWordWeights = JSON.parse(savedWordWeightsStr);
            } catch (e) {
                console.error("Error parsing Arabic word weights", e);
            }
        }
        commonWords.forEach((w) => {
            if (initialWordWeights[w.id] === undefined) {
                initialWordWeights[w.id] = 100;
            }
        });
        setWordWeights(initialWordWeights);

        // Alertar si el usuario está en latín
        if (gameLang === "la") {
            setToastMessage("Este juego no está disponible en Latín. Se mostrará en Español.");
        }
    }, [gameLang]);

    // Generar primera ronda cuando los pesos y modo están listos
    useEffect(() => {
        if (mounted && Object.keys(letterWeights).length > 0) {
            startNewRound();
        }
    }, [mounted, activeMode, practiceDirection, letterFormsMode]);

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
    const getMasteryPercentage = () => {
        if (Object.keys(letterWeights).length === 0) return 0;
        const weightsArray = Object.values(letterWeights);
        const sumWeights = weightsArray.reduce((sum, w) => sum + w, 0);
        const averageWeight = sumWeights / weightsArray.length;
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
            let roundDir: "ara-to-lat" | "lat-to-ara" = "ara-to-lat";
            if (practiceDirection === "mixed") {
                roundDir = Math.random() > 0.5 ? "ara-to-lat" : "lat-to-ara";
            } else {
                roundDir = practiceDirection;
            }
            setCurrentDirection(roundDir);

            // 2. Elegir letra según pesos
            if (Object.keys(letterWeights).length === 0) return;
            const totalWeight = arabicAlphabet.reduce((sum, item) => sum + (letterWeights[item.id] || 100), 0);
            let rand = Math.random() * totalWeight;
            let selectedLetter = arabicAlphabet[0];

            for (let i = 0; i < arabicAlphabet.length; i++) {
                const item = arabicAlphabet[i];
                const w = letterWeights[item.id] || 100;
                if (rand < w) {
                    selectedLetter = item;
                    break;
                }
                rand -= w;
            }
            setCurrentLetter(selectedLetter);
            setCurrentWord(null);

            // 3. Determinar qué forma de la letra mostrar
            let formKey: "isolated" | "initial" | "medial" | "final" = "isolated";
            if (letterFormsMode === "todas-formas") {
                const keys: Array<"isolated" | "initial" | "medial" | "final"> = ["isolated", "initial", "medial", "final"];
                const availableKeys = keys.filter(k => selectedLetter[k] !== "—");
                formKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
            }
            setCurrentLetterFormKey(formKey);

            // 4. Generar opciones
            const correctVal = roundDir === "ara-to-lat" ? selectedLetter.latin : selectedLetter[formKey];

            let distractors: string[] = [];
            if (roundDir === "ara-to-lat") {
                distractors = arabicAlphabet
                    .filter((l) => l.id !== selectedLetter.id)
                    .map((l) => l.latin);
            } else {
                distractors = arabicAlphabet
                    .filter((l) => l.id !== selectedLetter.id && l[formKey] !== "—")
                    .map((l) => l[formKey]);
            }

            const uniqueDistractors = Array.from(new Set(distractors));
            const shuffledDistractors = uniqueDistractors.sort(() => 0.5 - Math.random()).slice(0, 3);
            const roundOptions = [...shuffledDistractors, correctVal].sort(() => 0.5 - Math.random());
            setOptions(roundOptions);

        } else {
            // Modo Palabras
            setCurrentDirection("ara-to-lat");

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

            // Generar opciones
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
            const correctVal = currentDirection === "ara-to-lat" ? currentLetter.latin : currentLetter[currentLetterFormKey];
            
            if (currentDirection === "lat-to-ara" && inputMethod === "escritura") {
                const userNoTatweel = cleanAnswer.replace(/[\u0640]/g, "").trim().toLowerCase();
                const correctNoTatweel = correctVal.replace(/[\u0640]/g, "").trim().toLowerCase();
                const isolatedNoTatweel = currentLetter.isolated.replace(/[\u0640]/g, "").trim().toLowerCase();
                correct = (userNoTatweel === correctNoTatweel) || (userNoTatweel === isolatedNoTatweel) || (userNoTatweel === currentLetter.name.toLowerCase());
            } else {
                correct = cleanAnswer === correctVal.trim().toLowerCase();
            }
        } else if (activeMode === "palabras" && currentWord) {
            targetId = currentWord.id;
            correct = cleanAnswer === currentWord.latin.trim().toLowerCase();
        }

        setIsCorrect(correct);
        setHasAnswered(true);

        const newPlayed = playedCount + 1;
        setPlayedCount(newPlayed);
        localStorage.setItem("arabe-played", newPlayed.toString());

        if (correct) {
            const newCorrect = correctCount + 1;
            setCorrectCount(newCorrect);
            localStorage.setItem("arabe-correct", newCorrect.toString());

            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem("arabe-streak", newStreak.toString());

            if (newStreak > maxStreak) {
                setMaxStreak(newStreak);
                localStorage.setItem("arabe-maxstreak", newStreak.toString());
            }

            if (newStreak > 0 && newStreak % 10 === 0) {
                triggerConfetti();
            }

            if (activeMode === "letras") {
                const currentW = letterWeights[targetId] || 100;
                const newW = Math.max(10, Math.round(currentW * 0.6));
                const updatedWeights = { ...letterWeights, [targetId]: newW };
                setLetterWeights(updatedWeights);
                localStorage.setItem("arabe-letter-weights", JSON.stringify(updatedWeights));
            } else {
                const currentW = wordWeights[targetId] || 100;
                const newW = Math.max(10, Math.round(currentW * 0.6));
                const updatedWeights = { ...wordWeights, [targetId]: newW };
                setWordWeights(updatedWeights);
                localStorage.setItem("arabe-word-weights", JSON.stringify(updatedWeights));
            }
        } else {
            const newIncorrect = incorrectCount + 1;
            setIncorrectCount(newIncorrect);
            localStorage.setItem("arabe-incorrect", newIncorrect.toString());
            setStreak(0);
            localStorage.setItem("arabe-streak", "0");

            setShakeCard(true);
            setTimeout(() => setShakeCard(false), 500);

            if (activeMode === "letras") {
                const currentW = letterWeights[targetId] || 100;
                const newW = Math.min(500, Math.round(currentW * 1.6));
                const updatedWeights = { ...letterWeights, [targetId]: newW };
                setLetterWeights(updatedWeights);
                localStorage.setItem("arabe-letter-weights", JSON.stringify(updatedWeights));
            } else {
                const currentW = wordWeights[targetId] || 100;
                const newW = Math.min(500, Math.round(currentW * 1.6));
                const updatedWeights = { ...wordWeights, [targetId]: newW };
                setWordWeights(updatedWeights);
                localStorage.setItem("arabe-word-weights", JSON.stringify(updatedWeights));
            }
        }
    };

    // Resetear estadísticas
    const handleResetProgress = () => {
        if (window.confirm(t.statsResetConfirm)) {
            localStorage.removeItem("arabe-played");
            localStorage.removeItem("arabe-correct");
            localStorage.removeItem("arabe-incorrect");
            localStorage.removeItem("arabe-streak");
            localStorage.removeItem("arabe-maxstreak");
            localStorage.removeItem("arabe-letter-weights");
            localStorage.removeItem("arabe-word-weights");

            setPlayedCount(0);
            setCorrectCount(0);
            setIncorrectCount(0);
            setStreak(0);
            setMaxStreak(0);

            const defaultLetterWeights: Record<string, number> = {};
            arabicAlphabet.forEach((l) => (defaultLetterWeights[l.id] = 100));
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
        const text = `🧠 Árabe en Juegitos\n⭐ Racha: ${streak} | Racha Máxima: ${maxStreak}\n📈 Efectividad: ${rate}%\n🎓 Maestría del Alfabeto: ${getMasteryPercentage()}%\n\nPractica el alfabeto árabe aquí: ${window.location.href}`;

        navigator.clipboard.writeText(text).then(() => {
            alert("¡Estadísticas copiadas al portapapeles!");
        });
    };

    // Nombre de la forma actual
    const getFormName = (key: string) => {
        if (key === "isolated") return t.colIsolated;
        if (key === "initial") return t.colInitial;
        if (key === "medial") return t.colMedial;
        return t.colFinal;
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
                    <div style={{ color: activeStyle.text }} className="leading-relaxed font-semibold flex flex-col gap-1">
                        <p className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                            {currentLetter.name} ({t.colIsolated}: <span dir="rtl" className="font-mono text-base font-black px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">{currentLetter.isolated}</span>)
                        </p>
                        <p className="opacity-95">
                            {t.alphabetTips[currentLetter.id as keyof typeof t.alphabetTips]}
                        </p>
                        <div className="grid grid-cols-4 gap-1 border-t pt-2 mt-2 text-center text-xxs font-black">
                            <div className="p-1 rounded bg-black/5 dark:bg-white/5">
                                <span className="block text-gray-500 font-extrabold">{t.colIsolated}</span>
                                <span dir="rtl" className="text-sm font-mono">{currentLetter.isolated}</span>
                            </div>
                            <div className="p-1 rounded bg-black/5 dark:bg-white/5">
                                <span className="block text-gray-500 font-extrabold">{t.colInitial}</span>
                                <span dir="rtl" className="text-sm font-mono">{currentLetter.initial}</span>
                            </div>
                            <div className="p-1 rounded bg-black/5 dark:bg-white/5">
                                <span className="block text-gray-500 font-extrabold">{t.colMedial}</span>
                                <span dir="rtl" className="text-sm font-mono">{currentLetter.medial}</span>
                            </div>
                            <div className="p-1 rounded bg-black/5 dark:bg-white/5">
                                <span className="block text-gray-500 font-extrabold">{t.colFinal}</span>
                                <span dir="rtl" className="text-sm font-mono">{currentLetter.final}</span>
                            </div>
                        </div>
                    </div>
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
                    <p style={{ color: activeStyle.text }} className="text-sm sm:text-base font-extrabold capitalize mb-2">
                        {currentWord.meanings[gameLang] || currentWord.meanings["es"]}
                    </p>
                    <div className="border-t pt-2 mt-2 flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">{t.letterBreakdown}</span>
                        <div dir="rtl" className="text-lg font-mono font-bold tracking-widest bg-black/5 dark:bg-white/5 p-2 rounded-xl text-center">
                            {currentWord.breakdown}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-emerald-500" />
            </div>
        );
    }

    const winRate = playedCount > 0 ? Math.round((correctCount / playedCount) * 100) : 0;
    const isWordModeUnlocked = getMasteryPercentage() >= 40;

    const keyboardRows = [
        ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
        ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
        ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"]
    ];

    return (
        <div
            style={{
                backgroundColor: activeStyle.bg,
                color: activeStyle.text,
            }}
            className="min-h-[calc(100vh-65px)] pt-6 xl:pt-10 px-4 sm:px-6 pb-8 transition-colors duration-500 relative flex flex-col items-center justify-between"
        >
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40 w-full h-full" />

            {toastMessage && (
                <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in z-50 border border-white/10 text-xs sm:text-sm font-bold max-w-md">
                    <span>{toastMessage}</span>
                    <button onClick={() => setToastMessage(null)} className="hover:opacity-80 p-0.5 rounded-full bg-white/10">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <div className="w-full max-w-2xl flex-1 flex flex-col items-center">

                <div className="w-full flex flex-col items-center text-center mb-4 sm:mb-6">
                    <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">{t.title}</h1>
                    <p style={{ color: activeStyle.textMuted }} className="text-[10px] sm:text-xs font-bold mt-0.5 opacity-90 leading-tight">{t.subtitle}</p>
                </div>

                <div className="xl:absolute xl:top-6 xl:right-6 flex flex-col items-center xl:items-end gap-2.5 z-40 w-full xl:w-auto mb-3">
                    <div className="flex items-center gap-2 justify-center">
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

                <div className="w-full flex flex-col sm:flex-row gap-3.5 justify-between items-center mb-4 sm:mb-6 text-xs font-semibold px-1 py-1">
                    {activeMode === "letras" ? (
                        <div className="flex flex-col xs:flex-row gap-3 w-full justify-between sm:justify-start items-stretch xs:items-center">
                            <div className="flex items-center gap-2">
                                <span style={{ color: activeStyle.textMuted }} className="text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0">
                                    {t.direction}:
                                </span>
                                <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5 gap-1">
                                    {(["ara-to-lat", "lat-to-ara", "mixed"] as const).map((dir) => (
                                        <button
                                            key={dir}
                                            onClick={() => setPracticeDirection(dir)}
                                            className="px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer text-center whitespace-nowrap"
                                            style={{
                                                backgroundColor: practiceDirection === dir ? activeStyle.accent : "transparent",
                                                color: practiceDirection === dir ? activeStyle.btnText : activeStyle.text,
                                            }}
                                        >
                                            {dir === "ara-to-lat" ? t.araToLat : dir === "lat-to-ara" ? t.latToAra : t.mixed}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span style={{ color: activeStyle.textMuted }} className="text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0">
                                    {t.practiceForms}:
                                </span>
                                <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5 gap-1">
                                    {(["solo-aisladas", "todas-formas"] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setLetterFormsMode(mode)}
                                            className="px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer text-center whitespace-nowrap"
                                            style={{
                                                backgroundColor: letterFormsMode === mode ? activeStyle.accent : "transparent",
                                                color: letterFormsMode === mode ? activeStyle.btnText : activeStyle.text,
                                            }}
                                        >
                                            {mode === "solo-aisladas" ? t.practiceFormsIsolated : t.practiceFormsAll}
                                        </button>
                                    ))}
                                </div>
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

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
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

                {((activeMode === "letras" && currentLetter) || (activeMode === "palabras" && currentWord)) && (
                    <div className="w-full flex flex-col gap-6 select-none animate-fade-in">

                        <div
                            style={{
                                backgroundColor: activeStyle.card,
                                borderColor: activeStyle.border,
                                boxShadow: `0 8px 30px -10px ${activeStyle.accent}15`
                            }}
                            className={`w-full rounded-3xl border p-5 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${shakeCard ? "animate-shake border-red-500/50" : ""
                                }`}
                        >
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

                            {activeMode === "letras" && (
                                <span style={{ color: activeStyle.accent }} className="text-xxs sm:text-xs font-extrabold uppercase tracking-widest mb-3 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-black/5">
                                    {currentDirection === "ara-to-lat" 
                                        ? `${t.colArabic} ➔ ${t.colTranslit}` 
                                        : `${t.colTranslit} ➔ ${t.colArabic}`}
                                </span>
                            )}

                            <div className="my-4 text-center">
                                {activeMode === "letras" && currentLetter && (
                                    <div className="flex flex-col items-center gap-2">
                                        <h2 
                                            dir="rtl"
                                            className="text-7xl sm:text-8xl font-black tracking-tight leading-none" 
                                            style={{ fontFamily: "'Amiri', 'Cairo', 'Geeza Pro', 'Tahoma', sans-serif" }}
                                        >
                                            {currentDirection === "ara-to-lat" 
                                                ? currentLetter[currentLetterFormKey] 
                                                : currentLetter.latin}
                                        </h2>
                                        {currentDirection === "ara-to-lat" && (
                                            <span style={{ color: activeStyle.textMuted }} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border mt-2">
                                                {getFormName(currentLetterFormKey)}
                                            </span>
                                        )}
                                        {currentDirection === "lat-to-ara" && letterFormsMode === "todas-formas" && (
                                            <span style={{ color: activeStyle.textMuted }} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border mt-2">
                                                Encuentra la: {getFormName(currentLetterFormKey)}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {activeMode === "palabras" && currentWord && (
                                    <h2 
                                        dir="rtl"
                                        className={`font-black leading-normal ${getWordFontSizeClass(currentWord.word)}`}
                                        style={{ fontFamily: "'Amiri', 'Cairo', 'Geeza Pro', 'Tahoma', sans-serif" }}
                                    >
                                        {currentWord.word}
                                    </h2>
                                )}
                            </div>

                            {hasAnswered && renderTipSection()}
                        </div>

                        <div className="w-full">
                            {inputMethod === "opciones" ? (
                                <div className={`grid gap-3 sm:gap-4 ${activeMode === "palabras" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"}`}>
                                    {options.map((option, idx) => {
                                        const isCorrectOption = activeMode === "letras" && currentLetter
                                            ? (currentDirection === "ara-to-lat" ? option === currentLetter.latin : option === currentLetter[currentLetterFormKey])
                                            : currentWord
                                                ? option === currentWord.latin
                                                : false;

                                        const isSelected = selectedOption === option;
                                        const isWrong = wrongChoices.includes(option);

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

                                        const isArabicText = activeMode === "letras" && currentDirection === "lat-to-ara";

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
                                                <span 
                                                    dir={isArabicText ? "rtl" : "ltr"}
                                                    style={isArabicText ? { fontFamily: "'Amiri', 'Cairo', 'Geeza Pro', sans-serif", fontSize: "1.3rem" } : {}}
                                                >
                                                    {option}
                                                </span>
                                                {hasAnswered && isCorrectOption && <Check className="w-5 h-5 text-emerald-600" />}
                                                {hasAnswered && (isSelected || isWrong) && !isCorrectOption && <X className="w-5 h-5 text-rose-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
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
                                            dir={activeMode === "letras" && currentDirection === "lat-to-ara" ? "rtl" : "ltr"}
                                            placeholder={
                                                activeMode === "letras" && currentDirection === "lat-to-ara"
                                                    ? t.placeholderWriteAra
                                                    : t.placeholderWrite
                                            }
                                            className="flex-1 px-5 py-4 rounded-2xl border text-sm sm:text-base font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300"
                                            style={{
                                                backgroundColor: activeStyle.card,
                                                color: activeStyle.text,
                                                borderColor: isCorrect === true ? "#10B981" : isCorrect === false ? "#EF4444" : activeStyle.border,
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

                                    {activeMode === "letras" && currentDirection === "lat-to-ara" && !hasAnswered && (
                                        <div style={{ backgroundColor: activeStyle.card, borderColor: activeStyle.border }} className="p-4 rounded-2xl border shadow-sm w-full select-none">
                                            <div className="text-[10px] font-extrabold uppercase tracking-wider mb-2.5" style={{ color: activeStyle.textMuted }}>
                                                {t.keyboardTitle}
                                            </div>
                                            <div className="flex flex-col gap-1.5 w-full">
                                                {keyboardRows.map((row, rowIdx) => (
                                                    <div key={rowIdx} className="flex justify-center gap-1">
                                                        {row.map((char) => (
                                                            <button
                                                                key={char}
                                                                type="button"
                                                                onClick={() => setUserAnswer((prev) => prev + char)}
                                                                style={{ 
                                                                    backgroundColor: activeStyle.keyBg, 
                                                                    color: activeStyle.text, 
                                                                    fontFamily: "'Amiri', 'Cairo', 'Geeza Pro', sans-serif" 
                                                                }}
                                                                className="flex-1 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-black/10 transition-colors cursor-pointer text-center min-w-[22px] max-w-[40px] flex items-center justify-center"
                                                            >
                                                                {char}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ))}
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setUserAnswer((prev) => prev + " ")}
                                                        style={{ backgroundColor: activeStyle.keyBg, color: activeStyle.text }}
                                                        className="w-1/2 py-2 sm:py-2.5 rounded-lg text-xxs font-extrabold hover:bg-black/10 transition-colors cursor-pointer text-center"
                                                    >
                                                        SPACE
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setUserAnswer((prev) => prev.slice(0, -1))}
                                                        className="w-1/2 py-2 sm:py-2.5 rounded-lg text-xxs font-extrabold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer text-center"
                                                    >
                                                        DEL
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

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
                                                <span 
                                                    dir={activeMode === "letras" && currentDirection === "lat-to-ara" ? "rtl" : "ltr"}
                                                    className="font-extrabold underline decoration-2 ml-1"
                                                    style={activeMode === "letras" && currentDirection === "lat-to-ara" ? { fontFamily: "'Amiri', 'Cairo', 'Geeza Pro', sans-serif", fontSize: "1.2rem" } : {}}
                                                >
                                                    {activeMode === "letras" && currentLetter
                                                        ? (currentDirection === "ara-to-lat" ? currentLetter.latin : currentLetter[currentLetterFormKey])
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

            {showHelp && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-full max-w-2xl p-5 sm:p-7 rounded-3xl shadow-xl flex flex-col gap-4 relative animate-scale-in max-h-[85vh] overflow-y-auto"
                    >
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl sm:text-2xl font-extrabold text-center border-b pb-3 uppercase tracking-wider">
                            {t.helpTitle}
                        </h2>

                        <div className="text-xs sm:text-sm font-medium flex flex-col gap-2.5 leading-relaxed text-left opacity-90 px-1 font-sans">
                            <p>{t.helpDesc1}</p>
                            <p>{t.helpDesc2}</p>
                            <p>{t.helpDesc3}</p>
                        </div>

                        <div className="border rounded-2xl overflow-hidden mt-2 max-h-[40dvh] overflow-y-auto scrollbar-thin select-none">
                            <table className="w-full text-center border-collapse">
                                <thead className="bg-black/5 dark:bg-white/5 font-extrabold border-b text-[10px] sm:text-xs" style={{ color: activeStyle.textMuted }}>
                                    <tr>
                                        <th className="p-1.5 sm:p-2.5 pl-3 text-left">{t.colName}</th>
                                        <th className="p-1.5 sm:p-2.5">{t.colIsolated}</th>
                                        <th className="p-1.5 sm:p-2.5">{t.colInitial}</th>
                                        <th className="p-1.5 sm:p-2.5">{t.colMedial}</th>
                                        <th className="p-1.5 sm:p-2.5">{t.colFinal}</th>
                                        <th className="p-1.5 sm:p-2.5">{t.colTranslit}</th>
                                        <th className="p-1.5 sm:p-2.5 text-right pr-3">{t.colSound}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y font-bold text-xs">
                                    {arabicAlphabet.map((l) => (
                                        <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="p-1.5 sm:p-2 pl-3 text-left text-xxs sm:text-xs" style={{ color: activeStyle.accent }}>{l.name}</td>
                                            <td dir="rtl" className="p-1.5 sm:p-2 text-base font-mono font-black">{l.isolated}</td>
                                            <td dir="rtl" className="p-1.5 sm:p-2 text-base font-mono text-gray-500 dark:text-gray-400">{l.initial}</td>
                                            <td dir="rtl" className="p-1.5 sm:p-2 text-base font-mono text-gray-500 dark:text-gray-400">{l.medial}</td>
                                            <td dir="rtl" className="p-1.5 sm:p-2 text-base font-mono text-gray-500 dark:text-gray-400">{l.final}</td>
                                            <td className="p-1.5 sm:p-2 font-mono text-[10px] sm:text-xs">{l.latin}</td>
                                            <td className="p-1.5 sm:p-2 text-[9px] sm:text-xxs text-right leading-normal pr-3" style={{ color: activeStyle.textMuted }}>
                                                {t.alphabetTips[l.id as keyof typeof t.alphabetTips]}
                                            </td>
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

            {showStats && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        style={{ backgroundColor: activeStyle.card, color: activeStyle.text }}
                        className="w-full max-w-md p-5 sm:p-7 rounded-3xl shadow-xl flex flex-col gap-4 relative animate-scale-in max-h-[85vh] overflow-y-auto"
                    >
                        <button
                            onClick={() => setShowStats(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl sm:text-2xl font-extrabold text-center border-b pb-3 uppercase tracking-wider">
                            {t.stats}
                        </h2>

                        {playedCount > 0 ? (
                            <div className="flex flex-col gap-5">
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

                                <div className="flex flex-col gap-4.5 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border">
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
