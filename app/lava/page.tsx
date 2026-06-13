"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useGameConfig } from "@/components/GameConfigContext";
import { useLanguage } from "@/components/LanguageProvider";
import { 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ArrowLeft, 
  Sparkles, 
  Info, 
  Check 
} from "lucide-react";

// Local translations for the lava lamp page to maintain support for all launcher languages
const localT: Record<string, Record<string, string>> = {
  es: {
    title: "Lámpara de Lava",
    controls: "Configuración",
    speed: "Velocidad de Cera",
    viscosity: "Grosor de Fusión (Blur)",
    count: "Cantidad de Pedazos",
    size: "Tamaño de Pedazos",
    irregularity: "Irregularidad (Deformación)",
    pureBlackBg: "Fondo Negro Puro",
    noBorderGlow: "Cera sin Bordes (Glow)",
    interactivity: "Interactuar con Cursor",
    cursorEffect: "Efecto Cursor",
    repel: "Repeler",
    attract: "Atraer",
    none: "Ninguno",
    palette: "Temas de Color",
    fullscreen: "Pantalla Completa",
    exitFullscreen: "Salir Completa",
    back: "Volver al Launcher",
    reset: "Reiniciar Simulación",
    infoText: "Mueve el cursor para interactuar. Clic/toque para crear cera. Los controles se ocultan solos.",
  },
  de: {
    title: "Lavalampe",
    controls: "Einstellungen",
    speed: "Wachsgeschwindigkeit",
    viscosity: "Schmelzdicke (Blur)",
    count: "Stückanzahl",
    size: "Stückgröße",
    irregularity: "Nieregularität (Verformung)",
    pureBlackBg: "Reines Schwarz Hintergrund",
    noBorderGlow: "Randloses Wachs (Glow)",
    interactivity: "Cursor-Interaktion",
    cursorEffect: "Cursor-Effekt",
    repel: "Abstoßen",
    attract: "Anziehen",
    none: "Keiner",
    palette: "Farbthemen",
    fullscreen: "Vollbild",
    exitFullscreen: "Vollbild beenden",
    back: "Zurück zum Launcher",
    reset: "Simulation zurücksetzen",
    infoText: "Bewege den Cursor zum Interagieren. Klicken zum Erstellen. Kontrollen blenden sich aus.",
  },
  pl: {
    title: "Lampa Lawa",
    controls: "Ustawienia",
    speed: "Prędkość wosku",
    viscosity: "Grubość topnienia (Blur)",
    count: "Liczba kawałków",
    size: "Rozmiar kawałków",
    irregularity: "Nieregularność (Deformacja)",
    pureBlackBg: "Czyste Czarne Tło",
    noBorderGlow: "Bez krawędzi (Glow)",
    interactivity: "Interakcja z kursorem",
    cursorEffect: "Efekt kursora",
    repel: "Odpychanie",
    attract: "Przyciąganie",
    none: "Brak",
    palette: "Tematy kolorów",
    fullscreen: "Pełny ekran",
    exitFullscreen: "Wyjdź z pełnego ekranu",
    back: "Powrót do Launchera",
    reset: "Resetuj symulację",
    infoText: "Ruszaj kursorem, aby wpływać na wosk. Kliknij, by dodać kroplę. Panel ukryje się sam.",
  },
  ru: {
    title: "Лавовая Лампа",
    controls: "Настройки",
    speed: "Скорость воска",
    viscosity: "Толщина плавления (Blur)",
    count: "Количество кусков",
    size: "Размер кусков",
    irregularity: "Неровность (Искажение)",
    pureBlackBg: "Чистый Черный Фон",
    noBorderGlow: "Без контуров (Glow)",
    interactivity: "Взаимодействие с курсором",
    cursorEffect: "Эффект курсора",
    repel: "Отталкивание",
    attract: "Притяжение",
    none: "Нет",
    palette: "Цветовые темы",
    fullscreen: "Во весь экран",
    exitFullscreen: "Обычный режим",
    back: "Вернуться в Лаунчер",
    reset: "Сброс симуляции",
    infoText: "Двигайте курсор для эффекта. Клик для создания капли. Меню скрывается само.",
  },
  pt: {
    title: "Lâmpada de Lava",
    controls: "Configurações",
    speed: "Velocidade da Cera",
    viscosity: "Espessura de Fusão (Blur)",
    count: "Quantidade de Pedaços",
    size: "Tamanho dos Pedaços",
    irregularity: "Irregularidade (Deformação)",
    pureBlackBg: "Fundo Preto Puro",
    noBorderGlow: "Sem Bordas (Glow)",
    interactivity: "Interatividade do Cursor",
    cursorEffect: "Efeito do Cursor",
    repel: "Repelir",
    attract: "Atrair",
    none: "Nenhum",
    palette: "Temas de Cores",
    fullscreen: "Ecrã Inteiro",
    exitFullscreen: "Sair do Ecrã Inteiro",
    back: "Voltar ao Launcher",
    reset: "Reiniciar Simulação",
    infoText: "Mova o cursor para interagir. Clique para criar cera. Painel oculta-se sozinho.",
  },
  la: {
    title: "Lampas Lavae",
    controls: "Optiones",
    speed: "Celeritas Cerae",
    viscosity: "Fussionis Tenacitas (Blur)",
    count: "Numerus Partium",
    size: "Magnitudo Partium",
    irregularity: "Inconstantia Formae (Deformatio)",
    pureBlackBg: "Fundo Ater Purus",
    noBorderGlow: "Sine Marginibus (Glow)",
    interactivity: "Actio Cursoris",
    cursorEffect: "Effectus Cursoris",
    repel: "Repellere",
    attract: "Attrahere",
    none: "Nihil",
    palette: "Colores",
    fullscreen: "Plena Scrinia",
    exitFullscreen: "Exire Plena Scrinia",
    back: "Redire ad Launcher",
    reset: "Renovare Simulatiónem",
    infoText: "Move cursorem ad agendum. Preme ut ceram crees. Optiones ipsae evanescent.",
  },
  uk: {
    title: "Лавова Лампа",
    controls: "Налаштування",
    speed: "Швидкість воску",
    viscosity: "Товщина злиття (Blur)",
    count: "Кількість шматочків",
    size: "Розмір шматочків",
    irregularity: "Неровність (Деформація)",
    pureBlackBg: "Чистий Чорний Фон",
    noBorderGlow: "Без контурів (Glow)",
    interactivity: "Взаємодія з курсором",
    cursorEffect: "Ефект курсора",
    repel: "Відштовхування",
    attract: "Притягання",
    none: "Немає",
    palette: "Кольорові теми",
    fullscreen: "На весь екран",
    exitFullscreen: "Вийти з повного екрану",
    back: "Повернутися в Лаунчер",
    reset: "Скинути симуляцію",
    infoText: "Рухайте курсор для впливу. Клік для створення капли. Панель ховається сама.",
  }
};

interface LavaBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  baseRadius: number;
  color: string;
  hue: number;
  temp: number; // 0 is cold/sinking, 1 is hot/rising
  type: "dynamic";
  phaseOffset: number;
  speedMultiplier: number; // small random speed deviation factor
  isMergingInto?: LavaBlob; // reference to blob it is merging into

  // Branch A Satellites (Mid-body and Outer)
  satXA1: number;
  satYA1: number;
  satVxA1: number;
  satVyA1: number;
  satXA2: number;
  satYA2: number;
  satVxA2: number;
  satVyA2: number;

  // Branch B Satellites (Mid-body and Outer)
  satXB1: number;
  satYB1: number;
  satVxB1: number;
  satVyB1: number;
  satXB2: number;
  satYB2: number;
  satVxB2: number;
  satVyB2: number;
}

// Visual themes of the wax blobs in HSL format for organic color blending
const colorThemes: Record<string, {
  name: Record<string, string>;
  background: string; // CSS tailwind classes for the container
  getRandomColor: () => { hue: number; color: string; };
}> = {
  retro: {
    name: { es: "Clásico Retro", en: "Classic Retro", de: "Klassisch Retro", pl: "Klasyczny Retro", ru: "Ретро-Классика", pt: "Clássico Retro", la: "Lava Classica", uk: "Класичний Ретро" },
    background: "from-[#080205] via-[#200405] to-[#400508]", // Dark red/burgundy
    getRandomColor: () => {
      const hue = Math.random() * 45; // 0 to 45 (Red, Orange, Gold)
      return { hue, color: `hsl(${hue}, 95%, 50%)` };
    }
  },
  cyberpunk: {
    name: { es: "Cyberpunk 2077", en: "Cyberpunk", de: "Cyberpunk", pl: "Cyberpunk", ru: "Киберпанк", pt: "Cyberpunk", la: "Cyberpunk", uk: "Кіберпанк" },
    background: "from-[#02000d] via-[#120024] to-[#25002a]", // Dark indigo/violet
    getRandomColor: () => {
      const choices = [320, 280, 190]; // Pink/Magenta, Deep Violet, Cyan
      const baseHue = choices[Math.floor(Math.random() * choices.length)];
      const hue = (baseHue + (Math.random() * 20 - 10) + 360) % 360;
      return { hue, color: `hsl(${hue}, 95%, 55%)` };
    }
  },
  ocean: {
    name: { es: "Abismo Marino", en: "Deep Ocean", de: "Tiefsee", pl: "Głęboki Ocean", ru: "Морская Бездна", pt: "Abismo Marino", la: "Altum Mare", uk: "Морська Безодня" },
    background: "from-[#000a0d] via-[#001724] to-[#002436]", // Navy blue/teal
    getRandomColor: () => {
      const hue = 165 + Math.random() * 65; // 165 to 230 (Mint-Teal to Blue)
      return { hue, color: `hsl(${hue}, 90%, 50%)` };
    }
  },
  aurora: {
    name: { es: "Aurora Boreal", en: "Aurora", de: "Polarlicht", pl: "Zorza Polarna", ru: "Северное Сияние", pt: "Aurora Boreal", la: "Aurora Borealis", uk: "Північне Сяйво" },
    background: "from-[#02090b] via-[#021f1d] to-[#042d3a]", // Northern lights background
    getRandomColor: () => {
      const choices = [120, 150, 180, 210, 290]; // Green, Lime, Teal, Blue, Violet
      const baseHue = choices[Math.floor(Math.random() * choices.length)];
      const hue = (baseHue + (Math.random() * 20 - 10) + 360) % 360;
      return { hue, color: `hsl(${hue}, 95%, 52%)` };
    }
  },
  acid: {
    name: { es: "Bosque Ácido", en: "Acid Forest", de: "Saurer Wald", pl: "Kwaśny Las", ru: "Кислотный Лес", pt: "Floresta Ácida", la: "Silva Acida", uk: "Кислотний Ліс" },
    background: "from-[#020a02] via-[#071f07] to-[#122c12]", // Radioactive green tones
    getRandomColor: () => {
      const hue = 60 + Math.random() * 80; // 60 to 140 (Yellow-Green to Emerald)
      return { hue, color: `hsl(${hue}, 95%, 48%)` };
    }
  },
  pastel: {
    name: { es: "Sueño Dulce", en: "Pastel Dreams", de: "Pastelltraum", pl: "Pastelowy Sen", ru: "Пастельный Сон", pt: "Sonho Doce", la: "Somnium Pastel", uk: "Пастельний Сон" },
    background: "from-[#0e0c1a] via-[#1a172c] to-[#25203b]", // Dark grey/purple
    getRandomColor: () => {
      const hue = Math.random() * 360; // Complete rainbow pastel spectrum
      return { hue, color: `hsl(${hue}, 75%, 72%)` };
    }
  },
  sunset: {
    name: { es: "Furia del Sol", en: "Sunset Aura", de: "Sunset Aura", pl: "Zachód Słońca", ru: "Закат Солнца", pt: "Aura do Pôr-do-Sol", la: "Aura Solis Occasus", uk: "Захід Сонця" },
    background: "from-[#0c0017] via-[#24001a] to-[#3d0f04]", // Sunset colors
    getRandomColor: () => {
      const choices = [335, 350, 15, 40]; // Hot pink, Coral red, Orange, Amber
      const baseHue = choices[Math.floor(Math.random() * choices.length)];
      const hue = (baseHue + (Math.random() * 15 - 7.5) + 360) % 360;
      return { hue, color: `hsl(${hue}, 95%, 52%)` };
    }
  },
  random: {
    name: { es: "Arcoíris Caótico", en: "Chaos Rainbow", de: "Chaos Regenbogen", pl: "Tęcza Chaosu", ru: "Хаотичная Радуга", pt: "Arco-íris Caótico", la: "Color Alternus", uk: "Хаотична Веселка" },
    background: "from-[#050508] via-[#0d0f1a] to-[#121424]",
    getRandomColor: () => {
      const hue = Math.random() * 360;
      return { hue, color: `hsl(${hue}, 95%, 55%)` };
    }
  }
};

// Helper builder function for single dynamic wax pieces (All pools removed for realistic thermodynamics)
const createBlob = (
  width: number, 
  height: number, 
  type: "dynamic",
  size: number,
  theme: string
): LavaBlob => {
  const { hue, color } = colorThemes[theme].getRandomColor();
  const phaseOffset = Math.random() * Math.PI * 2;
  const speedMultiplier = 0.85 + Math.random() * 0.3; // Speed deviation (+/- 15%)
  
  // WIDER SIZE DIVERSITY: Range 0.45 to 1.50 times baseSize
  const rad = size * (0.45 + Math.random() * 1.05);
  
  // Spawn completely off-screen at the bottom to rise organically, or scattered at initialization
  const x = rad + Math.random() * (width - rad * 2);
  const y = Math.random() * (height + rad * 1.5) - (rad * 0.5);

  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 0.7,
    vy: (Math.random() - 0.5) * 1.2,
    radius: 1, // start at 1 and expand smoothly
    targetRadius: rad,
    baseRadius: rad,
    color,
    hue,
    temp: Math.random(),
    type,
    phaseOffset,
    speedMultiplier,
    
    // Branch A (starts offset left/up to break symmetry)
    satXA1: x - 1,
    satYA1: y - 1,
    satVxA1: 0,
    satVyA1: 0,
    satXA2: x - 2,
    satYA2: y - 2,
    satVxA2: 0,
    satVyA2: 0,
    
    // Branch B (starts offset right/down to break symmetry)
    satXB1: x + 1,
    satYB1: y + 1,
    satVxB1: 0,
    satVyB1: 0,
    satXB2: x + 2,
    satYB2: y + 2,
    satVxB2: 0,
    satVyB2: 0
  };
};

export default function LavaLampAnimationPage() {
  const { activeStyle, setActiveGameName } = useGameConfig();
  const { gameLang } = useLanguage();
  
  // Localized texts matching translation provider
  const lang = localT[gameLang] || localT["es"];

  // Config UI states
  const [speed, setSpeed] = useState<number>(1.0);
  const [count, setCount] = useState<number>(10);
  const [baseSize, setBaseSize] = useState<number>(65);
  const [viscosity, setViscosity] = useState<number>(20); // blur radius
  const [irregularity, setIrregularity] = useState<number>(0.3); // squash & stretch factor
  const [pureBlackBg, setPureBlackBg] = useState<boolean>(false);
  const [noBorderGlow, setNoBorderGlow] = useState<boolean>(false);
  const [cursorInteractive, setCursorInteractive] = useState<boolean>(true);
  const [cursorForce, setCursorForce] = useState<"repel" | "attract">("repel");
  const [paletteId, setPaletteId] = useState<string>("retro");
  
  // UI Panels
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // References for Canvas and Physics Loop (avoids state delays at 60fps)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blobsRef = useRef<LavaBlob[]>([]);
  const mouseRef = useRef<{ x: number; y: number; onScreen: boolean }>({ x: -9999, y: -9999, onScreen: false });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number | null>(null);

  // Store variables in a config ref so animation loop gets hot reload values instantly
  const configRef = useRef({
    speed,
    count,
    baseSize,
    viscosity,
    irregularity,
    noBorderGlow,
    cursorInteractive,
    cursorForce,
    paletteId,
  });

  // 60FPS Physics solver & canvas drawing routine (Hoisted to be declared before useEffects)
  const runPhysicsLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const frame = () => {
      time++;
      const config = configRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const mouse = mouseRef.current;

      // Clean canvas (Black color must be perfect for CSS contrast filter to clip boundaries)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      const blobs = blobsRef.current;

      // 1. UPDATE SPEEDS AND POSITION
      blobs.forEach((b) => {
        // Individualized speed factors matching speed deviation
        const speedFactor = config.speed * b.speedMultiplier;

        // Expand/Shrink radius animation towards target (slower/more gradual when merging to make it look natural)
        if (b.radius !== b.targetRadius) {
          const isMerging = b.isMergingInto || blobs.some(other => other.isMergingInto === b);
          const growthRate = isMerging ? 0.035 : 0.08;
          b.radius += (b.targetRadius - b.radius) * growthRate * speedFactor;
        }

        // Thermodynamic logic for pieces traveling up and down
        // Hot zone: bottom of screen (completely off-screen rest zone)
        if (b.y > height + b.radius - 20) {
          b.temp += (1.0 - b.temp) * 0.015 * speedFactor;
        } else if (b.y < -b.radius + 20) {
          // Cool zone: top of screen (completely off-screen rest zone)
          b.temp -= b.temp * 0.018 * speedFactor;
        }

        // Buoyancy/Gravity calculations based on temperature
        const buoyancy = b.temp * 0.09 * speedFactor;
        const gravity = (1.0 - b.temp) * 0.075 * speedFactor;
        
        b.vy -= buoyancy;
        b.vy += gravity;

        // Sway sideways gently
        b.vx += Math.sin(time * 0.008 + b.phaseOffset) * 0.025 * speedFactor;

        // Elastic drag friction
        b.vx *= (1 - 0.02 * speedFactor);
        b.vy *= (1 - 0.02 * speedFactor);

        // Apply physics speed caps
        const maxVy = 2.4 * speedFactor;
        const maxVx = 1.3 * speedFactor;
        if (Math.abs(b.vy) > maxVy) b.vy = Math.sign(b.vy) * maxVy;
        if (Math.abs(b.vx) > maxVx) b.vx = Math.sign(b.vx) * maxVx;

        // Move main node
        b.x += b.vx * speedFactor;
        b.y += b.vy * speedFactor;

        // Lateral wall bounce checks
        if (b.x < b.radius) {
          b.x = b.radius;
          b.vx = Math.abs(b.vx) * 0.7;
        } else if (b.x > width - b.radius) {
          b.x = width - b.radius;
          b.vx = -Math.abs(b.vx) * 0.7;
        }

        // Vertical off-screen resting checks (Snaps to base and base detours)
        if (b.y > height + b.radius + 15) {
          // Sit completely below the viewport boundary, hidden, and heat up
          b.y = height + b.radius + 15;
          b.vy = 0;
          b.vx = 0;
          b.temp += (1.0 - b.temp) * 0.035 * speedFactor;
          
          // Launch upward once heated
          if (b.temp > 0.88 && Math.random() < 0.012) {
            b.vy = -0.5 - Math.random() * 0.8;
            b.y -= 20; // Detach and enter screen
            // Larger size when emerging from below
            b.targetRadius = config.baseSize * (1.1 + Math.random() * 0.9);
            b.baseRadius = b.targetRadius;
          }
        } else if (b.y < -b.radius - 15) {
          // Sit completely above the viewport boundary, hidden, and cool down
          b.y = -b.radius - 15;
          b.vy = 0;
          b.vx = 0;
          b.temp -= b.temp * 0.035 * speedFactor;

          // Drop downward once cooled
          if (b.temp < 0.12 && Math.random() < 0.012) {
            b.vy = 0.5 + Math.random() * 0.8;
            b.y += 20; // Detach and enter screen
          }
        }

        if (b.isMergingInto) {
          const target = b.isMergingInto;
          // Merge slide speed is very gentle (0.07) for a gradual blend
          const mergeSlideSpeed = 0.07 * speedFactor;
          b.x += (target.x - b.x) * mergeSlideSpeed;
          b.y += (target.y - b.y) * mergeSlideSpeed;
          b.satXA1 += (target.x - b.satXA1) * mergeSlideSpeed;
          b.satYA1 += (target.y - b.satYA1) * mergeSlideSpeed;
          b.satXB1 += (target.x - b.satXB1) * mergeSlideSpeed;
          b.satYB1 += (target.y - b.satYB1) * mergeSlideSpeed;
          b.satXA2 += (target.x - b.satXA2) * mergeSlideSpeed;
          b.satYA2 += (target.y - b.satYA2) * mergeSlideSpeed;
          b.satXB2 += (target.x - b.satXB2) * mergeSlideSpeed;
          b.satYB2 += (target.y - b.satYB2) * mergeSlideSpeed;
        } else {
          // 1b. UPDATE DUAL-BRANCH SATELLITE CHAIN FOR COMPLEX BENDS
          const d_target1 = b.radius * 0.55;
          const d_target2 = b.radius * 0.45;

          // Branch A1
          const dxA1 = b.x - b.satXA1;
          const dyA1 = b.y - b.satYA1;
          const distA1 = Math.sqrt(dxA1 * dxA1 + dyA1 * dyA1) || 0.001;
          // Cap the spring force to prevent velocity spikes
          const springForceA1 = Math.max(-3.5, Math.min(3.5, (distA1 - d_target1) * 0.08));
          b.satVxA1 += (dxA1 / distA1) * springForceA1 - b.satVxA1 * 0.16;
          b.satVyA1 += (dyA1 / distA1) * springForceA1 - b.satVyA1 * 0.16 + (b.vy > 0 ? -0.05 : 0.05);

          // Branch B1
          const dxB1 = b.x - b.satXB1;
          const dyB1 = b.y - b.satYB1;
          const distB1 = Math.sqrt(dxB1 * dxB1 + dyB1 * dyB1) || 0.001;
          // Cap the spring force to prevent velocity spikes
          const springForceB1 = Math.max(-3.5, Math.min(3.5, (distB1 - d_target1) * 0.08));
          b.satVxB1 += (dxB1 / distB1) * springForceB1 - b.satVxB1 * 0.16;
          b.satVyB1 += (dyB1 / distB1) * springForceB1 - b.satVyB1 * 0.16 + (b.vy > 0 ? -0.05 : 0.05);

          // Mutual repulsion between A1 and B1 to force opposite alignment (elliptical stretching)
          const dxAB = b.satXB1 - b.satXA1;
          const dyAB = b.satYB1 - b.satYA1;
          const distAB = Math.sqrt(dxAB * dxAB + dyAB * dyAB) || 0.001;
          const repForce = 0.28 * speedFactor;
          b.satVxA1 -= (dxAB / distAB) * repForce;
          b.satVyA1 -= (dyAB / distAB) * repForce;
          b.satVxB1 += (dxAB / distAB) * repForce;
          b.satVyB1 += (dyAB / distAB) * repForce;

          // Branch A2 (attached to A1)
          const dxA2 = b.satXA1 - b.satXA2;
          const dyA2 = b.satYA1 - b.satYA2;
          const distA2 = Math.sqrt(dxA2 * dxA2 + dyA2 * dyA2) || 0.001;
          // Cap the spring force to prevent velocity spikes
          const springForceA2 = Math.max(-3.0, Math.min(3.0, (distA2 - d_target2) * 0.08));
          b.satVxA2 += (dxA2 / distA2) * springForceA2 - b.satVxA2 * 0.16;
          b.satVyA2 += (dyA2 / distA2) * springForceA2 - b.satVyA2 * 0.16 + (b.vy > 0 ? -0.08 : 0.08);

          // Push outer nodes away from the main body
          const dxA2_main = b.satXA2 - b.x;
          const dyA2_main = b.satYA2 - b.y;
          const distA2_main = Math.sqrt(dxA2_main * dxA2_main + dyA2_main * dyA2_main) || 0.001;
          const pushMainA2 = 0.15 * speedFactor;
          b.satVxA2 += (dxA2_main / distA2_main) * pushMainA2;
          b.satVyA2 += (dyA2_main / distA2_main) * pushMainA2;

          // Branch B2 (attached to B1)
          const dxB2 = b.satXB1 - b.satXB2;
          const dyB2 = b.satYB1 - b.satYB2;
          const distB2 = Math.sqrt(dxB2 * dxB2 + dyB2 * dyB2) || 0.001;
          // Cap the spring force to prevent velocity spikes
          const springForceB2 = Math.max(-3.0, Math.min(3.0, (distB2 - d_target2) * 0.08));
          b.satVxB2 += (dxB2 / distB2) * springForceB2 - b.satVxB2 * 0.16;
          b.satVyB2 += (dyB2 / distB2) * springForceB2 - b.satVyB2 * 0.16 + (b.vy > 0 ? -0.08 : 0.08);

          // Push outer nodes away from the main body
          const dxB2_main = b.satXB2 - b.x;
          const dyB2_main = b.satYB2 - b.y;
          const distB2_main = Math.sqrt(dxB2_main * dxB2_main + dyB2_main * dyB2_main) || 0.001;
          const pushMainB2 = 0.15 * speedFactor;
          b.satVxB2 += (dxB2_main / distB2_main) * pushMainB2;
          b.satVyB2 += (dyB2_main / distB2_main) * pushMainB2;

          // Add random wiggles (scaled by irregularity)
          const wiggleFreq1 = 0.035;
          const wiggleAmp1 = 0.15 * config.irregularity * speedFactor;
          b.satVxA1 += Math.sin(time * wiggleFreq1 + b.phaseOffset) * wiggleAmp1;
          b.satVyA1 += Math.cos(time * wiggleFreq1 * 1.25 + b.phaseOffset * 1.5) * wiggleAmp1;
          b.satVxB1 += Math.sin(time * wiggleFreq1 + b.phaseOffset + Math.PI) * wiggleAmp1;
          b.satVyB1 += Math.cos(time * wiggleFreq1 * 1.25 + b.phaseOffset * 1.5 + Math.PI) * wiggleAmp1;

          const wiggleFreq2 = 0.028;
          const wiggleAmp2 = 0.12 * config.irregularity * speedFactor;
          b.satVxA2 += Math.cos(time * wiggleFreq2 - b.phaseOffset) * wiggleAmp2;
          b.satVyA2 += Math.sin(time * wiggleFreq2 * 1.35 + b.phaseOffset * 0.7) * wiggleAmp2;
          b.satVxB2 += Math.cos(time * wiggleFreq2 - b.phaseOffset + Math.PI) * wiggleAmp2;
          b.satVyB2 += Math.sin(time * wiggleFreq2 * 1.35 + b.phaseOffset * 0.7 + Math.PI) * wiggleAmp2;

          // Fluid interaction pulls on satellites from other nearby blobs to create complex deforms (e.g. C shape)
          let pullXA1 = 0, pullYA1 = 0;
          let pullXB1 = 0, pullYB1 = 0;
          let pullXA2 = 0, pullYA2 = 0;
          let pullXB2 = 0, pullYB2 = 0;

          blobs.forEach(other => {
            if (other === b || other.targetRadius <= 0.2 || other.isMergingInto) return;
            const range = (b.radius + other.radius) * 2.3;

            // Pull for A1
            const dxA1_o = other.x - b.satXA1;
            const dyA1_o = other.y - b.satYA1;
            const distA1_o = Math.sqrt(dxA1_o * dxA1_o + dyA1_o * dyA1_o) || 0.001;
            if (distA1_o < range) {
              const force = (1 - distA1_o / range) * 0.35 * speedFactor * config.irregularity;
              pullXA1 += (dxA1_o / distA1_o) * force;
              pullYA1 += (dyA1_o / distA1_o) * force;
            }

            // Pull for B1
            const dxB1_o = other.x - b.satXB1;
            const dyB1_o = other.y - b.satYB1;
            const distB1_o = Math.sqrt(dxB1_o * dxB1_o + dyB1_o * dyB1_o) || 0.001;
            if (distB1_o < range) {
              const force = (1 - distB1_o / range) * 0.35 * speedFactor * config.irregularity;
              pullXB1 += (dxB1_o / distB1_o) * force;
              pullYB1 += (dyB1_o / distB1_o) * force;
            }

            // Pull for A2
            const dxA2_o = other.x - b.satXA2;
            const dyA2_o = other.y - b.satYA2;
            const distA2_o = Math.sqrt(dxA2_o * dxA2_o + dyA2_o * dyA2_o) || 0.001;
            if (distA2_o < range) {
              const force = (1 - distA2_o / range) * 0.35 * speedFactor * config.irregularity;
              pullXA2 += (dxA2_o / distA2_o) * force;
              pullYA2 += (dyA2_o / distA2_o) * force;
            }

            // Pull for B2
            const dxB2_o = other.x - b.satXB2;
            const dyB2_o = other.y - b.satYB2;
            const distB2_o = Math.sqrt(dxB2_o * dxB2_o + dyB2_o * dyB2_o) || 0.001;
            if (distB2_o < range) {
              const force = (1 - distB2_o / range) * 0.35 * speedFactor * config.irregularity;
              pullXB2 += (dxB2_o / distB2_o) * force;
              pullYB2 += (dyB2_o / distB2_o) * force;
            }
          });

          b.satVxA1 += pullXA1;
          b.satVyA1 += pullYA1;
          b.satVxB1 += pullXB1;
          b.satVyB1 += pullYB1;
          b.satVxA2 += pullXA2;
          b.satVyA2 += pullYA2;
          b.satVxB2 += pullXB2;
          b.satVyB2 += pullYB2;

          // Add cursor interaction deformation
          if (config.cursorInteractive && mouse.onScreen) {
            const mouseRange = 220;

            const pullNode = (nodeX: number, nodeY: number) => {
              const dxM = nodeX - mouse.x;
              const dyM = nodeY - mouse.y;
              const distM = Math.sqrt(dxM * dxM + dyM * dyM) || 0.001;
              if (distM < mouseRange) {
                const force = (1 - distM / mouseRange) * 0.25 * speedFactor * config.irregularity;
                const dirX = dxM / distM;
                const dirY = dyM / distM;
                const mult = config.cursorForce === "repel" ? 1 : -1;
                return { x: dirX * force * mult, y: dirY * force * mult };
              }
              return { x: 0, y: 0 };
            };

            const fA1 = pullNode(b.satXA1, b.satYA1);
            b.satVxA1 += fA1.x; b.satVyA1 += fA1.y;

            const fB1 = pullNode(b.satXB1, b.satYB1);
            b.satVxB1 += fB1.x; b.satVyB1 += fB1.y;

            const fA2 = pullNode(b.satXA2, b.satYA2);
            b.satVxA2 += fA2.x; b.satVyA2 += fA2.y;

            const fB2 = pullNode(b.satXB2, b.satYB2);
            b.satVxB2 += fB2.x; b.satVyB2 += fB2.y;
          }

          // Apply satellite velocity caps to prevent erratic jumping
          const maxSatV = 3.5 * speedFactor;
          if (Math.abs(b.satVxA1) > maxSatV) b.satVxA1 = Math.sign(b.satVxA1) * maxSatV;
          if (Math.abs(b.satVyA1) > maxSatV) b.satVyA1 = Math.sign(b.satVyA1) * maxSatV;
          if (Math.abs(b.satVxB1) > maxSatV) b.satVxB1 = Math.sign(b.satVxB1) * maxSatV;
          if (Math.abs(b.satVyB1) > maxSatV) b.satVyB1 = Math.sign(b.satVyB1) * maxSatV;
          if (Math.abs(b.satVxA2) > maxSatV) b.satVxA2 = Math.sign(b.satVxA2) * maxSatV;
          if (Math.abs(b.satVyA2) > maxSatV) b.satVyA2 = Math.sign(b.satVyA2) * maxSatV;
          if (Math.abs(b.satVxB2) > maxSatV) b.satVxB2 = Math.sign(b.satVxB2) * maxSatV;
          if (Math.abs(b.satVyB2) > maxSatV) b.satVyB2 = Math.sign(b.satVyB2) * maxSatV;

          // Apply velocity updates
          b.satXA1 += b.satVxA1 * speedFactor;
          b.satYA1 += b.satVyA1 * speedFactor;
          b.satXB1 += b.satVxB1 * speedFactor;
          b.satYB1 += b.satVyB1 * speedFactor;
          b.satXA2 += b.satVxA2 * speedFactor;
          b.satYA2 += b.satVyA2 * speedFactor;
          b.satXB2 += b.satVxB2 * speedFactor;
          b.satYB2 += b.satVyB2 * speedFactor;

          // Constraints (attach to parent nodes)
          const clampDist = (x1: number, y1: number, x2: number, y2: number, maxD: number) => {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
            if (d > maxD) {
              return { x: x1 + (dx / d) * maxD, y: y1 + (dy / d) * maxD, clamped: true };
            }
            return { x: x2, y: y2, clamped: false };
          };

          const maxDist1 = b.radius * 1.5;
          const cA1 = clampDist(b.x, b.y, b.satXA1, b.satYA1, maxDist1);
          b.satXA1 = cA1.x; b.satYA1 = cA1.y;
          if (cA1.clamped) { b.satVxA1 *= 0.5; b.satVyA1 *= 0.5; }

          const cB1 = clampDist(b.x, b.y, b.satXB1, b.satYB1, maxDist1);
          b.satXB1 = cB1.x; b.satYB1 = cB1.y;
          if (cB1.clamped) { b.satVxB1 *= 0.5; b.satVyB1 *= 0.5; }

          const maxDist2 = b.radius * 1.3;
          const cA2 = clampDist(b.satXA1, b.satYA1, b.satXA2, b.satYA2, maxDist2);
          b.satXA2 = cA2.x; b.satYA2 = cA2.y;
          if (cA2.clamped) { b.satVxA2 *= 0.5; b.satVyA2 *= 0.5; }

          const cB2 = clampDist(b.satXB1, b.satYB1, b.satXB2, b.satYB2, maxDist2);
          b.satXB2 = cB2.x; b.satYB2 = cB2.y;
          if (cB2.clamped) { b.satVxB2 *= 0.5; b.satVyB2 *= 0.5; }
        }
      });

      // 2. CURSOR ATTRACTION/REPULSION FIELD
      if (config.cursorInteractive && mouse.onScreen) {
        blobs.forEach((b) => {
          if (b.targetRadius <= 0.1) return;
          const dx = b.x - mouse.x;
          const dy = b.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const range = 240; // field radius

          if (dist < range && dist > 1) {
            const speedFactor = config.speed * b.speedMultiplier;
            const force = (1 - dist / range) * 0.07 * speedFactor;
            const dirX = dx / dist;
            const dirY = dy / dist;

            if (config.cursorForce === "repel") {
              b.vx += dirX * force;
              b.vy += dirY * force;
            } else {
              b.vx -= dirX * force;
              b.vy -= dirY * force;
            }
          }
        });
      }

      // 3. COLLISION INTERACTION (Viscous Sliding & Stabilized Fusion)
      const dynamicBlobs = blobs.filter(b => b.targetRadius > 0.2);
      for (let i = 0; i < dynamicBlobs.length; i++) {
        const b1 = dynamicBlobs[i];
        if (b1.isMergingInto) continue;

        for (let j = i + 1; j < dynamicBlobs.length; j++) {
          const b2 = dynamicBlobs[j];
          if (b2.isMergingInto || b2.targetRadius <= 0.2) continue;

          // 3a. Horizontal merging of resting bottom blobs
          if (b1.y >= height && b2.y >= height) {
            const distH = Math.abs(b1.x - b2.x);
            const sumR = b1.radius + b2.radius;
            if (distH < sumR * 1.1) {
              const combinedVolume = Math.sqrt(b1.radius * b1.radius + b2.radius * b2.radius);
              b1.targetRadius = Math.min(combinedVolume, config.baseSize * 2.2);
              b1.baseRadius = b1.targetRadius;
              b2.targetRadius = 0;
              b2.isMergingInto = b1;
              continue;
            }
          }

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          // Collision radius aligned to rendered circle (0.80) to avoid visual margin gaps
          const sumRad = (b1.radius + b2.radius) * 0.80;

          if (dist < sumRad) {
            // Overlapping!
            const nx = dx / (dist || 0.001);
            const ny = dy / (dist || 0.001);

            // Relative velocity
            const rvx = b2.vx - b1.vx;
            const rvy = b2.vy - b1.vy;

            // Velocity projected onto normal
            const velAlongNormal = rvx * nx + rvy * ny;

            // Only resolve if they are moving towards each other
            if (velAlongNormal < 0) {
              // Damp the normal velocity heavily (viscous cushion effect)
              const impulse = -0.78 * velAlongNormal;
              b1.vx -= 0.5 * impulse * nx;
              b1.vy -= 0.5 * impulse * ny;
              b2.vx += 0.5 * impulse * nx;
              b2.vy += 0.5 * impulse * ny;
            }

            const canMerge = (b1.radius + b2.radius) < config.baseSize * 2.3;
            // Higher probability of fusion on significant overlap
            const isDeepOverlap = dist < sumRad * 0.72;
            const mergeProbability = isDeepOverlap ? 0.85 : (dist < sumRad * 0.85 ? 0.25 : 0.08);

            if (canMerge && Math.random() < mergeProbability * config.speed) {
              // Fuse b2 into b1
              const combinedVolume = Math.sqrt(b1.radius * b1.radius + b2.radius * b2.radius);
              b1.targetRadius = Math.min(combinedVolume, config.baseSize * 2.2);
              b2.targetRadius = 0;
              b2.isMergingInto = b1;

              // Conservation of momentum
              const m1 = b1.radius * b1.radius;
              const m2 = b2.radius * b2.radius;
              const totalMass = m1 + m2;
              if (totalMass > 0.001) {
                b1.vx = (b1.vx * m1 + b2.vx * m2) / totalMass;
                b1.vy = (b1.vy * m1 + b2.vy * m2) / totalMass;
              }
            } else {
              // Soft repulsion force to keep them moving around each other
              const overlap = sumRad - dist;
              const pushForce = 0.02 * config.speed;
              const pushAngle = dist === 0 ? Math.random() * Math.PI * 2 : 0;
              const dirX = dist === 0 ? Math.cos(pushAngle) : nx;
              const dirY = dist === 0 ? Math.sin(pushAngle) : ny;
              const pushX = dirX * Math.min(overlap, 10) * pushForce;
              const pushY = dirY * Math.min(overlap, 10) * pushForce;

              b1.vx -= pushX;
              b1.vy -= pushY;
              b2.vx += pushX;
              b2.vy += pushY;
            }
          }
        }
      }

      // 4. LARGE PIECE SPLITTING (Tension / Budding)
      for (let i = 0; i < dynamicBlobs.length; i++) {
        const b = dynamicBlobs[i];
        if (b.isMergingInto) continue;

        // Splitting threshold: radius is much larger than configured baseSize
        if (b.radius > config.baseSize * 1.45 && b.targetRadius > config.baseSize * 1.35) {
          const speedFactor = config.speed * b.speedMultiplier;
          // Slow tick split check
          if (Math.random() < 0.0018 * speedFactor) {
            // Conserve volume: R_new = R_orig / sqrt(2)
            const splitRad = b.radius / Math.sqrt(2);

            const newBlob: LavaBlob = {
              x: b.x + 8, // Tiny offset to break overlap
              y: b.y,
              vx: b.vx + 0.4,
              vy: b.vy,
              radius: 2, // Budding off starting small
              targetRadius: splitRad,
              baseRadius: splitRad,
              color: b.color,
              hue: b.hue,
              temp: b.temp,
              type: "dynamic",
              phaseOffset: Math.random() * Math.PI * 2,
              speedMultiplier: 0.85 + Math.random() * 0.3,
              
              // Branch A Satellites (Starts offset to left/up)
              satXA1: b.x + 7,
              satYA1: b.y - 1,
              satVxA1: 0,
              satVyA1: 0,
              satXA2: b.x + 6,
              satYA2: b.y - 2,
              satVxA2: 0,
              satVyA2: 0,

              // Branch B Satellites (Starts offset to right/down)
              satXB1: b.x + 9,
              satYB1: b.y + 1,
              satVxB1: 0,
              satVyB1: 0,
              satXB2: b.x + 10,
              satYB2: b.y + 2,
              satVxB2: 0,
              satVyB2: 0
            };

            // Set parent target size
            b.targetRadius = splitRad;
            // Adjust parent velocity to push it in the opposite direction
            b.vx -= 0.4;

            blobs.push(newBlob);
            break; // Stop iteration checks to prevent array index corruption
          }
        }
      }

      // 5. PURGE SHRINKED PIECES (Garbage Collection)
      const filteredBlobs = blobs.filter(b => !(b.targetRadius === 0 && b.radius < 0.5));

      // Replenish merged/shrunk blobs to maintain active count
      const activeCount = filteredBlobs.filter(b => b.targetRadius > 0.2).length;
      if (activeCount < config.count) {
        const newB = createBlob(width, height, "dynamic", config.baseSize, config.paletteId);
        newB.y = height + newB.targetRadius + 15;
        newB.temp = 0.1; // Start cold at bottom
        newB.radius = 1;
        filteredBlobs.push(newB);
      }
      blobsRef.current = filteredBlobs;

      // 6. RENDER PIECES (Dual-branch multi-node rendering for complex curves & glows)
      filteredBlobs.forEach((b) => {
        if (b.radius < 0.2) return;
        
        // Dynamic radii for satellite nodes
        const r0 = b.radius * 0.82;
        const rA1 = b.radius * 0.55;
        const rA2 = b.radius * 0.38;
        const rB1 = b.radius * 0.55;
        const rB2 = b.radius * 0.38;

        // Interpolate satellite coordinates depending on irregularity slider setting
        const x0 = b.x;
        const y0 = b.y;
        
        const xA1 = b.x + (b.satXA1 - b.x) * config.irregularity;
        const yA1 = b.y + (b.satYA1 - b.y) * config.irregularity;

        const xA2 = b.x + (b.satXA2 - b.x) * config.irregularity;
        const yA2 = b.y + (b.satYA2 - b.y) * config.irregularity;

        const xB1 = b.x + (b.satXB1 - b.x) * config.irregularity;
        const yB1 = b.y + (b.satYB1 - b.y) * config.irregularity;

        const xB2 = b.x + (b.satXB2 - b.x) * config.irregularity;
        const yB2 = b.y + (b.satYB2 - b.y) * config.irregularity;

        const drawNode = (nx: number, ny: number, nr: number, isMain: boolean) => {
          if (nr < 0.5) return;
          
          if (config.noBorderGlow) {
            // Draw soft radial gradients for border-less glow clouds
            const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
            // Core is bright white
            grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            // Inner color
            grad.addColorStop(0.18, b.color);
            // Soft outer color fading
            grad.addColorStop(0.5, b.color.replace(")", ", 0.55)").replace("hsl", "hsla"));
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(nx, ny, nr, 0, Math.PI * 2);
            ctx.fill();

            // Inner concentrated specular glow core
            if (isMain && nr > 15) {
              const coreGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr * 0.22);
              coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
              coreGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
              ctx.fillStyle = coreGrad;
              ctx.beginPath();
              ctx.arc(nx, ny, nr * 0.22, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Standard sharp metaball fill
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(nx, ny, nr, 0, Math.PI * 2);
            ctx.fill();

            // 3D Glass highlight
            if (isMain && nr > 12) {
              ctx.beginPath();
              ctx.arc(nx - nr * 0.22, ny - nr * 0.22, nr * 0.28, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
              ctx.fill();
            }
          }
        };

        // Draw Nodes
        drawNode(x0, y0, r0, true);
        drawNode(xA1, yA1, rA1, false);
        drawNode(xA2, yA2, rA2, false);
        drawNode(xB1, yB1, rB1, false);
        drawNode(xB2, yB2, rB2, false);
      });

      frameRef.current = requestAnimationFrame(frame);
    };

    frameRef.current = requestAnimationFrame(frame);
  };

  // Re-generate simulation from scratch
  const resetSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const initialBlobs: LavaBlob[] = [];
    const width = canvas.width;
    const height = canvas.height;

    // Generate count dynamic blobs (All static pools are gone!)
    for (let i = 0; i < count; i++) {
      initialBlobs.push(createBlob(width, height, "dynamic", baseSize, paletteId));
    }

    blobsRef.current = initialBlobs;
  };

  // Click handler: Spawn wax blob at specific point
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!configRef.current.cursorInteractive) return;
    
    // Cancel action if click was on config menu (stops bubble propagation)
    const target = e.target as HTMLElement;
    if (target.closest(".controls-panel")) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const blobs = blobsRef.current;
    const { hue, color } = colorThemes[configRef.current.paletteId].getRandomColor();
    const rad = configRef.current.baseSize * (0.8 + Math.random() * 0.5);
    const speedMultiplier = 0.85 + Math.random() * 0.3;
    
    const newBlob: LavaBlob = {
      x: clickX,
      y: clickY,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: 2,
      targetRadius: rad,
      baseRadius: rad,
      color,
      hue,
      temp: clickY > canvas.height / 2 ? 0.85 : 0.15, // Hotter if spawned low
      type: "dynamic",
      phaseOffset: Math.random() * Math.PI * 2,
      speedMultiplier,
      
      // Branch A (starts offset left/up to break symmetry)
      satXA1: clickX - 1,
      satYA1: clickY - 1,
      satVxA1: 0,
      satVyA1: 0,
      satXA2: clickX - 2,
      satYA2: clickY - 2,
      satVxA2: 0,
      satVyA2: 0,
      
      // Branch B (starts offset right/down to break symmetry)
      satXB1: clickX + 1,
      satYB1: clickY + 1,
      satVxB1: 0,
      satVyB1: 0,
      satXB2: clickX + 2,
      satYB2: clickY + 2,
      satVxB2: 0,
      satVyB2: 0
    };

    blobs.push(newBlob);

    // Garbage collector: enforce dynamic cap to prevent memory slowdowns
    const dynamicBlobs = blobs.filter(b => b.targetRadius > 0);
    if (dynamicBlobs.length > configRef.current.count + 6) {
      const oldest = blobs.find(b => b.targetRadius > 0);
      if (oldest) oldest.targetRadius = 0;
    }
  };

  // Native HTML5 Fullscreen toggle
  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error requesting fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle auto-hiding control panel on mouse/touch inactivity
  const resetActivityTimer = () => {
    setShowControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000); // 4 seconds of inactivity
  };

  // Track header metadata
  useEffect(() => {
    setActiveGameName(lang.title);
    return () => setActiveGameName(null);
  }, [setActiveGameName, lang.title]);

  // Keep configuration values in sync with state updates
  useEffect(() => {
    configRef.current = {
      speed,
      count,
      baseSize,
      viscosity,
      irregularity,
      noBorderGlow,
      cursorInteractive,
      cursorForce,
      paletteId,
    };
  }, [speed, count, baseSize, viscosity, irregularity, noBorderGlow, cursorInteractive, cursorForce, paletteId]);

  // Handle controls display fade timer setup
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Sync window fullscreen state with native API
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Update blob counts when requested in config panel
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const blobs = blobsRef.current;
    
    // Filter dynamic blobs currently active
    const activeBlobs = blobs.filter(b => b.targetRadius > 0);
    const diff = count - activeBlobs.length;

    if (diff > 0) {
      // Create more dynamic blobs
      for (let i = 0; i < diff; i++) {
        blobs.push(createBlob(canvas.width, canvas.height, "dynamic", baseSize, paletteId));
      }
    } else if (diff < 0) {
      // Mark dynamic blobs for deletion (shrinking them smoothly)
      let marked = 0;
      for (let i = blobs.length - 1; i >= 0; i--) {
        if (blobs[i].targetRadius > 0) {
          blobs[i].targetRadius = 0;
          marked++;
          if (marked >= Math.abs(diff)) break;
        }
      }
    }
    blobsRef.current = blobs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // Scaling base size of existing blobs smoothly without resetting simulation
  useEffect(() => {
    const blobs = blobsRef.current;
    blobs.forEach(b => {
      b.baseRadius = baseSize * (0.45 + Math.random() * 1.05);
      if (b.targetRadius > 0) {
        b.targetRadius = b.baseRadius;
      }
    });
  }, [baseSize]);

  // Instantly color-shift blobs when theme is toggled
  useEffect(() => {
    const blobs = blobsRef.current;
    blobs.forEach(b => {
      const themeColors = colorThemes[paletteId];
      const { hue, color } = themeColors.getRandomColor();
      b.hue = hue;
      b.color = color;
    });
  }, [paletteId]);

  // Main simulation initializer (Mount only)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas sizes
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reset loop if running
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    // Populate initial blobs array (No static pools)
    const initialBlobs: LavaBlob[] = [];
    const width = canvas.width;
    const height = canvas.height;

    for (let i = 0; i < count; i++) {
      initialBlobs.push(createBlob(width, height, "dynamic", baseSize, paletteId));
    }

    blobsRef.current = initialBlobs;

    // Resize event listener
    const handleResize = () => {
      const prevW = canvas.width;
      const prevH = canvas.height;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const scaleX = canvas.width / (prevW || 1);
      const scaleY = canvas.height / (prevH || 1);

      blobsRef.current.forEach(b => {
        b.x = Math.max(b.radius, Math.min(canvas.width - b.radius, b.x * scaleX));
        b.y = b.y * scaleY; // Let them scale vertically, resting heights are auto-realigned
        b.satXA1 = Math.max(b.radius, Math.min(canvas.width - b.radius, b.satXA1 * scaleX));
        b.satYA1 = b.satYA1 * scaleY;
        b.satXA2 = Math.max(b.radius, Math.min(canvas.width - b.radius, b.satXA2 * scaleX));
        b.satYA2 = b.satYA2 * scaleY;
        b.satXB1 = Math.max(b.radius, Math.min(canvas.width - b.radius, b.satXB1 * scaleX));
        b.satYB1 = b.satYB1 * scaleY;
        b.satXB2 = Math.max(b.radius, Math.min(canvas.width - b.radius, b.satXB2 * scaleX));
        b.satYB2 = b.satYB2 * scaleY;
      });
    };

    window.addEventListener("resize", handleResize);

    // Start drawing loop
    runPhysicsLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeBackground = pureBlackBg ? "bg-black" : colorThemes[paletteId].background;

  // Visual filter configurations: If noBorderGlow is active, use a minimal contrast value (1.4) so they remain blurry/soft glow clouds.
  const canvasContrast = noBorderGlow ? 1.4 : 23;
  const canvasBlur = noBorderGlow ? viscosity * 0.35 : viscosity;

  return (
    <div 
      className={`relative w-screen h-screen overflow-hidden select-none transition-all duration-1000 ${
        pureBlackBg ? "bg-black" : `bg-gradient-to-b ${activeBackground}`
      }`}
      onMouseMove={(e) => {
        resetActivityTimer();
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            onScreen: true,
          };
        }
      }}
      onMouseLeave={() => {
        mouseRef.current.onScreen = false;
      }}
      onTouchStart={resetActivityTimer}
      onTouchMove={(e) => {
        resetActivityTimer();
        const canvas = canvasRef.current;
        if (canvas && e.touches.length > 0) {
          const rect = canvas.getBoundingClientRect();
          mouseRef.current = {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
            onScreen: true,
          };
        }
      }}
      onTouchEnd={() => {
        mouseRef.current.onScreen = false;
      }}
    >
      {/* Canvas rendering metaballs with dynamic viscosity CSS filters */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{
          filter: `blur(${canvasBlur}px) contrast(${canvasContrast})`,
          background: "#000000",
          mixBlendMode: "screen",
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair animate-fade-in"
        />
      </div>

      {/* Floating glassmorphic controls panel */}
      <div 
        className={`controls-panel absolute top-6 right-6 w-[330px] rounded-3xl p-5 border shadow-2xl transition-all duration-500 ease-out z-40 max-h-[85vh] overflow-y-auto scrollbar-none flex flex-col gap-4.5 ${
          showControls 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{
          backgroundColor: `${activeStyle.card}22`, // glassmorphic transparent
          borderColor: `${activeStyle.border}35`,
          color: activeStyle.text,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255,255,255,0.1)`,
        }}
        onMouseEnter={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
        }}
        onMouseLeave={resetActivityTimer}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: `${activeStyle.border}22` }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse" style={{ color: activeStyle.accent }} />
            <h2 className="font-extrabold text-lg tracking-tight select-none">
              {lang.title}
            </h2>
          </div>
          <Link href="/" className="transition-transform hover:scale-110 active:scale-90 p-1 rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Configurations List */}
        <div className="flex flex-col gap-4 text-xs font-semibold">
          
          {/* SPEED SLIDER */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center opacity-85">
              <span>{lang.speed}</span>
              <span className="font-mono text-xxs font-bold bg-white/10 px-1.5 py-0.5 rounded-sm">{speed.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.2" 
              max="2.5" 
              step="0.1" 
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-current cursor-ew-resize h-1 bg-white/20 rounded-lg appearance-none"
              style={{ color: activeStyle.accent }}
            />
          </div>

          {/* DENSITY SLIDER (Cantidad de pedazos) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center opacity-85">
              <span>{lang.count}</span>
              <span className="font-mono text-xxs font-bold bg-white/10 px-1.5 py-0.5 rounded-sm">{count}</span>
            </div>
            <input 
              type="range" 
              min="4" 
              max="20" 
              step="1" 
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-current cursor-ew-resize h-1 bg-white/20 rounded-lg appearance-none"
              style={{ color: activeStyle.accent }}
            />
          </div>

          {/* BASE SIZE SLIDER (Tamaño de pedazos) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center opacity-85">
              <span>{lang.size}</span>
              <span className="font-mono text-xxs font-bold bg-white/10 px-1.5 py-0.5 rounded-sm">{baseSize}px</span>
            </div>
            <input 
              type="range" 
              min="30" 
              max="110" 
              step="5" 
              value={baseSize}
              onChange={(e) => setBaseSize(parseInt(e.target.value))}
              className="w-full accent-current cursor-ew-resize h-1 bg-white/20 rounded-lg appearance-none"
              style={{ color: activeStyle.accent }}
            />
          </div>

          {/* VISCOSITY (BLUR FILTER) SLIDER */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center opacity-85">
              <span>{lang.viscosity}</span>
              <span className="font-mono text-xxs font-bold bg-white/10 px-1.5 py-0.5 rounded-sm">{viscosity}px</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="35" 
              step="1" 
              value={viscosity}
              onChange={(e) => setViscosity(parseInt(e.target.value))}
              className="w-full accent-current cursor-ew-resize h-1 bg-white/20 rounded-lg appearance-none"
              style={{ color: activeStyle.accent }}
            />
          </div>

          {/* IRREGULARITY (SQUASH & STRETCH) SLIDER */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center opacity-85">
              <span>{lang.irregularity}</span>
              <span className="font-mono text-xxs font-bold bg-white/10 px-1.5 py-0.5 rounded-sm">{(irregularity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={irregularity}
              onChange={(e) => setIrregularity(parseFloat(e.target.value))}
              className="w-full accent-current cursor-ew-resize h-1 bg-white/20 rounded-lg appearance-none"
              style={{ color: activeStyle.accent }}
            />
          </div>

          {/* NO BORDER GLOW TOGGLE */}
          <div className="flex justify-between items-center py-0.5">
            <span className="opacity-85">{lang.noBorderGlow}</span>
            <button 
              onClick={() => setNoBorderGlow(!noBorderGlow)}
              className="w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer"
              style={{
                backgroundColor: noBorderGlow ? activeStyle.accent : "rgba(255,255,255,0.15)"
              }}
            >
              <div 
                className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  noBorderGlow ? "translate-x-4.5" : "translate-x-0"
                }`} 
              />
            </button>
          </div>

          {/* PURE BLACK BACKGROUND TOGGLE */}
          <div className="flex justify-between items-center py-0.5">
            <span className="opacity-85">{lang.pureBlackBg}</span>
            <button 
              onClick={() => setPureBlackBg(!pureBlackBg)}
              className="w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer"
              style={{
                backgroundColor: pureBlackBg ? activeStyle.accent : "rgba(255,255,255,0.15)"
              }}
            >
              <div 
                className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  pureBlackBg ? "translate-x-4.5" : "translate-x-0"
                }`} 
              />
            </button>
          </div>

          {/* CURSOR INTERACTIVE TOGGLE */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="opacity-85">{lang.interactivity}</span>
              <button 
                onClick={() => setCursorInteractive(!cursorInteractive)}
                className="w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: cursorInteractive ? activeStyle.accent : "rgba(255,255,255,0.15)"
                }}
              >
                <div 
                  className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    cursorInteractive ? "translate-x-4.5" : "translate-x-0"
                  }`} 
                />
              </button>
            </div>
            
            {/* CURSOR FORCE TYPE (Attract / Repel) */}
            {cursorInteractive && (
              <div className="flex flex-col gap-1 mt-1 pl-2 border-l border-white/10 animate-fade-in">
                <span className="opacity-60 text-xxs uppercase tracking-wider mb-0.5">{lang.cursorEffect}</span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                  <button
                    onClick={() => setCursorForce("repel")}
                    className={`py-1 px-2.5 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                      cursorForce === "repel" ? "bg-white/15 shadow-sm text-white" : "opacity-50 hover:opacity-100 text-current"
                    }`}
                  >
                    {lang.repel}
                  </button>
                  <button
                    onClick={() => setCursorForce("attract")}
                    className={`py-1 px-2.5 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                      cursorForce === "attract" ? "bg-white/15 shadow-sm text-white" : "opacity-50 hover:opacity-100 text-current"
                    }`}
                  >
                    {lang.attract}
                  </button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-t opacity-10" style={{ borderColor: activeStyle.border }} />

          {/* PALETTE / COLORTHEMES SELECTOR */}
          <div className="flex flex-col gap-2">
            <span className="opacity-85">{lang.palette}</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(colorThemes).map(([id, p]) => {
                const isSelected = paletteId === id;
                return (
                  <button
                    key={id}
                    onClick={() => setPaletteId(id)}
                    className="flex flex-col items-start gap-1 p-2 rounded-xl border text-left transition-all duration-300 hover:scale-102 cursor-pointer relative"
                    style={{
                      backgroundColor: isSelected ? `${activeStyle.accent}15` : "rgba(255, 255, 255, 0.03)",
                      borderColor: isSelected ? activeStyle.accent : "rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <span className="text-[10px] font-bold tracking-tight truncate w-full">{p.name[gameLang] || p.name["en"]}</span>
                    <div className="flex gap-1 items-center mt-0.5">
                      <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: id === "retro" ? "hsl(20, 95%, 50%)" : id === "cyberpunk" ? "hsl(320, 95%, 55%)" : id === "ocean" ? "hsl(190, 90%, 50%)" : id === "aurora" ? "hsl(150, 95%, 52%)" : id === "acid" ? "hsl(90, 95%, 48%)" : id === "pastel" ? "hsl(280, 75%, 72%)" : id === "sunset" ? "hsl(15, 95%, 52%)" : "hsl(180, 95%, 55%)" }} />
                      <span className="w-3 h-3 rounded-full border border-black/20 -ml-1.5" style={{ backgroundColor: id === "retro" ? "hsl(0, 95%, 50%)" : id === "cyberpunk" ? "hsl(270, 95%, 55%)" : id === "ocean" ? "hsl(220, 90%, 50%)" : id === "aurora" ? "hsl(210, 95%, 52%)" : id === "acid" ? "hsl(120, 95%, 48%)" : id === "pastel" ? "hsl(180, 75%, 72%)" : id === "sunset" ? "hsl(350, 95%, 52%)" : "hsl(300, 95%, 55%)" }} />
                    </div>
                    {isSelected && (
                      <Check className="absolute top-1.5 right-1.5 w-3 h-3 text-current" style={{ color: activeStyle.accent }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-t opacity-10" style={{ borderColor: activeStyle.border }} />

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-2 mt-1">
            {/* Reset Simulation */}
            <button
              onClick={resetSimulation}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border font-extrabold text-[11px] shadow-sm transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang.reset}</span>
            </button>

            {/* Toggle Fullscreen */}
            <button
              onClick={toggleFullscreenMode}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-extrabold text-[11px] shadow-sm transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer"
              style={{
                backgroundColor: activeStyle.accent,
                color: activeStyle.btnText,
              }}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? lang.exitFullscreen : lang.fullscreen}</span>
            </button>
          </div>
        </div>

        {/* Tip text at the bottom */}
        <div 
          className="flex items-start gap-1.5 p-2.5 rounded-2xl border text-[10px] font-bold leading-normal mt-1 opacity-70"
          style={{
            backgroundColor: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Info className="w-3.5 h-3.5 shrink-0" style={{ color: activeStyle.accent }} />
          <span>{lang.infoText}</span>
        </div>
      </div>

      {/* Subtle bottom indicator when controls fade out */}
      <div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-bold text-xxs tracking-widest uppercase opacity-40 transition-opacity duration-700 pointer-events-none z-10"
        style={{ 
          opacity: showControls ? 0 : 0.4,
          color: activeStyle.text,
          textShadow: "0 2px 4px rgba(0,0,0,0.5)"
        }}
      >
        {lang.infoText.split(".")[0]}
      </div>
    </div>
  );
}
