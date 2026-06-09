"use client";

import React from "react";
import { LanguageProvider } from "@/components/LanguageProvider";
import { GameConfigProvider } from "@/components/GameConfigContext";
import Header from "@/components/Header";

export default function ClientProviders({ children }: { children: React.ReactNode; }) {
    return (
        <LanguageProvider>
            <GameConfigProvider>
                <Header />
                <main className="flex-1 w-full flex flex-col">{children}</main>
            </GameConfigProvider>
        </LanguageProvider>
    );
}
