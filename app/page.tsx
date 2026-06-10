"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useGameConfig } from "@/components/GameConfigContext";
import { useLanguage } from "@/components/LanguageProvider";
import { gamesList } from "@/lib/games";
import {
  Search,
  X,
  Palette,
  Brain,
  Type,
  Grid,
  Castle,
  Sparkles,
  ArrowRight,
  Play,
  Lock,
  Globe
} from "lucide-react";

// Mapeador de iconos de Lucide para renderizar dinámicamente según la config del juego
const iconMap: Record<string, React.ComponentType<React.ComponentProps<"svg">>> = {
  Palette,
  Brain,
  Type,
  Grid,
  Castle,
  Globe,
};

export default function GameLauncherPage() {
  const { activeStyle, setActiveGameName } = useGameConfig();
  const { gameLang, t: fullTranslations } = useLanguage();
  const t = fullTranslations.common;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Limpiar el nombre del juego activo en el header cuando estemos en el inicio
  useEffect(() => {
    setActiveGameName(null);
  }, [setActiveGameName]);

  // Obtener la traducción del nombre de una categoría
  const getCategoryName = (categoryKey: string): string => {
    // Enlazar los keys con los del config context
    const mapping: Record<string, string> = {
      categoryColor: t.categoryColor,
      categoryWord: t.categoryWord,
      categoryMemory: t.categoryMemory,
      categoryLogic: t.categoryLogic,
      categoryStrategy: t.categoryStrategy,
      categoryPuzzle: t.categoryPuzzle,
    };
    return mapping[categoryKey] || categoryKey;
  };

  // Obtener todas las categorías únicas que existen en la lista de juegos
  const categories = ["all", ...Array.from(new Set(gamesList.map((g) => g.categoryKey)))];

  // Lógica de filtrado
  const filteredGames = gamesList.filter((game) => {
    // Filtrar por categoría
    if (selectedCategory !== "all" && game.categoryKey !== selectedCategory) {
      return false;
    }

    // Filtrar por término de búsqueda (nombre, descripción o categoría en el idioma actual)
    const name = game.name[gameLang]?.toLowerCase() || "";
    const description = game.description[gameLang]?.toLowerCase() || "";
    const categoryTranslated = getCategoryName(game.categoryKey).toLowerCase();
    const term = searchQuery.toLowerCase();

    return (
      name.includes(term) ||
      description.includes(term) ||
      categoryTranslated.includes(term)
    );
  });

  return (
    <div
      style={{
        backgroundColor: activeStyle.bg,
        color: activeStyle.text,
      }}
      className="min-h-[calc(100vh-65px)] px-4 sm:px-6 py-8 sm:py-12 transition-colors duration-500 flex flex-col items-center justify-between"
    >
      {/* Contenedor Principal */}
      <div className="w-full max-w-5xl flex-1 flex flex-col items-center">
        {/* Cabecera / Hero de Launcher */}
        <div className="text-center mb-8 max-w-2xl animate-fade-in">
          <div className="inline-flex items-center justify-center p-3.5 bg-white/20 dark:bg-black/10 rounded-3xl border border-white/40 dark:border-black/5 shadow-md mb-4 sm:mb-5 animate-float">
            <Sparkles className="w-8 h-8" style={{ color: activeStyle.accent }} />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight select-none mb-3 bg-gradient-to-r from-current to-current/80 bg-clip-text">
            {t.titleLauncher}
          </h1>
          <p
            style={{ color: activeStyle.textMuted }}
            className="text-sm sm:text-lg font-medium leading-relaxed px-4"
          >
            {t.subtitleLauncher}
          </p>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="w-full max-w-2xl mb-10 flex flex-col gap-4.5 px-2">
          {/* Input de Búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 opacity-55" style={{ color: activeStyle.accent }} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-11 py-3.5 sm:py-4 rounded-2xl border text-sm sm:text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300"
              style={{
                backgroundColor: activeStyle.card,
                color: activeStyle.text,
                borderColor: activeStyle.border,
                boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.03)`,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = activeStyle.accent;
                e.target.style.boxShadow = `0 0 0 3px ${activeStyle.accent}25, 0 4px 6px -1px rgba(0, 0, 0, 0.03)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = activeStyle.border;
                e.target.style.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.03)`;
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center transition-transform hover:scale-110 active:scale-90"
              >
                <X className="w-5 h-5 opacity-60 hover:opacity-100" />
              </button>
            )}
          </div>

          {/* Selector de Categorías (Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center px-1">
            {categories.map((catKey) => {
              const isSelected = selectedCategory === catKey;
              const label = catKey === "all" ? t.categoryAll : getCategoryName(catKey);
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  style={{
                    backgroundColor: isSelected ? activeStyle.accent : activeStyle.card,
                    color: isSelected ? activeStyle.btnText : activeStyle.text,
                    borderColor: isSelected ? activeStyle.accent : activeStyle.border,
                  }}
                  className="px-4.5 py-2 rounded-full border text-xs sm:text-sm font-bold shrink-0 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cuadrícula de Tarjetas de Juegos */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-2">
            {filteredGames.map((game) => {
              const IconComp = iconMap[game.icon] || Grid;
              const gameName = game.name[gameLang] || game.name["es"];
              const gameDesc = game.description[gameLang] || game.description["es"];
              const gameCat = getCategoryName(game.categoryKey);

              const cardStyle = {
                backgroundColor: activeStyle.card,
                borderColor: activeStyle.border,
              };

              const cardContent = (
                <div
                  style={cardStyle}
                  className={`relative overflow-hidden p-6 rounded-3xl border shadow-sm transition-all duration-300 flex flex-col justify-between h-72 sm:h-80 select-none group border-2 hover:border-current/30 ${game.playable
                    ? "hover:-translate-y-2 hover:shadow-lg cursor-pointer"
                    : "opacity-75 cursor-not-allowed"
                    }`}
                  onMouseEnter={(e) => {
                    if (game.playable) {
                      e.currentTarget.style.borderColor = activeStyle.accent;
                      e.currentTarget.style.boxShadow = `0 10px 20px -5px ${activeStyle.accent}15`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = activeStyle.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Categoría superior y estado */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      style={{ color: activeStyle.textMuted }}
                      className="text-xxs sm:text-xs font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/5"
                    >
                      {gameCat}
                    </span>
                    {game.playable ? (
                      <span
                        style={{
                          color: activeStyle.accent,
                          backgroundColor: `${activeStyle.accent}10`,
                        }}
                        className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full animate-soft-pulse border border-current/25"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{t.playNow}</span>
                      </span>
                    ) : (
                      <span
                        style={{ color: activeStyle.textMuted }}
                        className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-current/20 bg-black/5 dark:bg-white/5"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        <span>{t.comingSoon}</span>
                      </span>
                    )}
                  </div>

                  {/* Icono y Detalles */}
                  <div className="flex-1 flex flex-col items-start justify-center">
                    {/* Círculo del icono */}
                    <div
                      style={{
                        backgroundColor: game.playable
                          ? `${activeStyle.accent}15`
                          : `${activeStyle.textMuted}10`,
                        color: game.playable ? activeStyle.accent : activeStyle.textMuted,
                      }}
                      className="p-3 sm:p-3.5 rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                    >
                      <IconComp className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    {/* Nombre */}
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight group-hover:text-current transition-colors">
                      {gameName}
                    </h3>
                    {/* Descripción */}
                    <p
                      style={{ color: activeStyle.textMuted }}
                      className="text-xs sm:text-sm font-medium leading-relaxed line-clamp-3 text-left"
                    >
                      {gameDesc}
                    </p>
                  </div>

                  {/* Flecha indicadora de ir si es jugable */}
                  {game.playable && (
                    <div
                      style={{ color: activeStyle.accent }}
                      className="flex items-center gap-1.5 self-end text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0"
                    >
                      <span>{t.playNow}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );

              return game.playable ? (
                <Link href={game.path} key={game.id} className="block w-full">
                  {cardContent}
                </Link>
              ) : (
                <div key={game.id} className="block w-full">
                  {cardContent}
                </div>
              );
            })}
          </div>
        ) : (
          /* Mensaje de no resultados */
          <div
            style={{
              backgroundColor: activeStyle.card,
              borderColor: activeStyle.border,
            }}
            className="w-full max-w-md p-8 rounded-3xl border text-center shadow-sm py-12 animate-fade-in"
          >
            <p style={{ color: activeStyle.textMuted }} className="font-semibold text-sm sm:text-base">
              {t.noGamesFound}
            </p>
          </div>
        )}
      </div>

      {/* Footer de página coqueto */}
      <footer style={{ color: activeStyle.textMuted }} className="w-full text-center mt-12 text-[10px] sm:text-xs font-bold opacity-60">
        <span>© {new Date().getFullYear()} Juegitos • {t.hechoCon}</span>
      </footer>
    </div>
  );
}
