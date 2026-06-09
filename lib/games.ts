import { GameLanguage } from "@/components/LanguageProvider";

export interface GameInfo {
    id: string;
    name: Record<GameLanguage, string>;
    description: Record<GameLanguage, string>;
    categoryKey: "categoryColor" | "categoryWord" | "categoryMemory" | "categoryLogic" | "categoryStrategy" | "categoryPuzzle";
    path: string;
    playable: boolean;
    icon: string; // Lucide icon string identifier
    accentColor: string; // Gradient color indicator or accent string
}

export const gamesList: GameInfo[] = [
    {
        id: "hexle",
        name: {
            es: "Hexle",
            de: "Hexle",
            pl: "Hexle",
            ru: "Hexle",
            pt: "Hexle",
            la: "Hexle",
        },
        description: {
            es: "Adivina el código hexadecimal de los colores usando pistas visuales y de proximidad.",
            de: "Errate den Hex-Code von Farben mithilfe visueller Hinweise und Präzisionspfeilen.",
            pl: "Odgadnij kod szesnastkowy kolorów za pomocą wskazówek wizualnych i strzałek.",
            ru: "Угадай шестнадцатеричный код цветов, используя визуальные подсказки направления.",
            pt: "Adivinha o código hexadecimal das cores usando pistas visuais e setas de proximidade.",
            la: "Divina codicem hexadecimalem colorum per sagittas ac visualia indicia.",
        },
        categoryKey: "categoryColor",
        path: "/hexle",
        playable: true,
        icon: "Palette",
        accentColor: "from-pink-400 to-rose-500",
    },

];
