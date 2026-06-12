import { GameLanguage } from "@/components/LanguageProvider";

export interface GameInfo {
    id: string;
    name: Record<GameLanguage, string>;
    description: Record<GameLanguage, string>;
    categoryKey: "categoryColor" | "categoryWord" | "categoryMemory" | "categoryLogic" | "categoryStrategy" | "categoryPuzzle" | "categoryGeografia";
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
            uk: "Hexle",
        },
        description: {
            es: "Adivina el código hexadecimal de los colores usando pistas visuales y de proximidad.",
            de: "Errate den Hex-Code von Farben mithilfe visueller Hinweise und Präzisionspfeilen.",
            pl: "Odgadnij kod szesnastkowy kolorów za pomocą wskazówek wizualnych i strzałek.",
            ru: "Угадай шестнадцатеричный код цветов, используя визуальные подсказки направления.",
            pt: "Adivinha o código hexadecimal das cores usando pistas visuais e setas de proximidade.",
            la: "Divina codicem hexadecimalem colorum per sagittas ac visualia indicia.",
            uk: "Вгадай шістнадцятковий код кольорів, використовуючи візуальні підказки напрямку.",
        },
        categoryKey: "categoryColor",
        path: "/hexle",
        playable: true,
        icon: "Palette",
        accentColor: "from-pink-400 to-rose-500",
    }, {
        id: "banderadle",
        name: {
            es: "Banderadle",
            de: "Banderadle",
            pl: "Banderadle",
            ru: "Banderadle",
            pt: "Banderadle",
            la: "Banderadle",
            uk: "Banderadle",
        },
        description: {
            es: "Adivina el país secreto a partir de pistas de sus atributos y el mosaico de su bandera.",
            de: "Errate das geheime Land anhand von Hinweisen zu seinen Merkmalen und dem Mosaik seiner Flagge.",
            pl: "Odgadnij tajemniczy kraj na podstawie wskazówek dotyczących jego cech i mozaiki jego flagi.",
            ru: "Угадайте загадочную страну по подсказкам о её характеристиках и мозаике её флага.",
            pt: "Adivinhe o país secreto a partir de pistas sobre seus atributos e do mosaico de sua bandeira.",
            la: "Conice patriam arcanam ex indiciis proprietatum eius atque e musivo vexilli eius.",
            uk: "Вгадай таємну країну за підказками про її атрибути та мозаїку її прапора.",
        },
        categoryKey: "categoryGeografia",
        path: "/banderadle",
        playable: true,
        icon: "Globe",
        accentColor: "from-emerald-400 to-cyan-500",
    }, {
        id: "sudoku",
        name: {
            es: "Sudoku",
            de: "Sudoku",
            pl: "Sudoku",
            ru: "Судоку",
            pt: "Sudoku",
            la: "Sudoku",
            uk: "Судоку",
        },
        description: {
            es: "Clásico juego de lógica donde debes completar la cuadrícula con números del 1 al 9, asegurando que cada número aparezca solo una vez en cada fila, columna y subcuadrícula.",
            de: "Klassisches Logikspiel, bei dem du das Gitter mit Zahlen von 1 bis 9 füllen musst, wobei jede Zahl nur einmal in jeder Zeile, Spalte und jedem Unterquadrat vorkommen darf.",
            pl: "Klasyczna gra logiczna, w której musisz wypełnić siatkę cyframi od 1 do 9, dbając o to, aby każda cyfra pojawiła się tylko raz w każdym wierszu, kolumnie i podkwadracie.",
            ru: "Классическая логическая игра, в которой вы должны заполнить сетку числами от 1 до 9, следя за тем, чтобы каждая цифра появлялась только один раз в каждой строке, столбце и подквадрате.",
            pt: "Clássico jogo de lógica onde você deve completar a grade com números de 1 a 9, garantindo que cada número apareça apenas uma vez em cada linha, coluna e subgrade.",
            la: "Ludus classicus logicae ubi reticulum impleas numeris ab 1 ad 9, ita ut quaelibet numerus solum semel in quoque ordine, columna et subquadrato appareat.",
            uk: "Класична логічна гра, в якій ви повинні заповнити сітку числами від 1 до 9, стежачи за тим, щоб кожна цифра з'являлася тільки один раз в кожному рядку, стовпці і підквадраті.",
        },
        categoryKey: "categoryLogic",
        path: "/sudoku",
        playable: true,
        icon: "Grid",
        accentColor: "from-indigo-400 to-purple-500", // Giving Sudoku a distinct premium indigo/purple accent gradient
    }, {
        id: "cazafonos",
        name: {
            es: "Cazafonos",
            de: "Phonjäger",
            pl: "Łowca Fonemów",
            ru: "Охотник на фонемы",
            pt: "Caçador de Fonemas",
            la: "Cazafonos",
            uk: "Мисливець на фонеми",
        },
        description: {
            es: "Adivina los rasgos articulatorios del fono del Alfabeto Fonético Internacional (AFI) presentado en la pantalla.",
            de: "Errate die artikulatorischen Merkmale des auf dem Bildschirm dargestellten IPA-Lautes.",
            pl: "Odgadnij cechy artykulacyjne głoski IPA prezentowanej na ekranie.",
            ru: "Угадайте артикуляционные признаки звука МФА, показанного на экране.",
            pt: "Adivinhe os traços articulatórios do fono do Alfabeto Fonético Internacional (AFI) apresentado no ecrã.",
            la: "Divina proprietates articulationis phoni ex Abecedario Phonetico Internationali (API) in scrinio picti.",
            uk: "Вгадай артикуляційні ознаки звуку МФА, показаного на екрані.",
        },
        categoryKey: "categoryWord",
        path: "/cazafonos",
        playable: false,
        icon: "Type",
        accentColor: "from-violet-400 to-fuchsia-500",
    },
];

