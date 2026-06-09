import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const montserratAlternates = localFont({
    src: [
        {
            path: "../public/fonts/MontserratAlternates-Regular.ttf",
            weight: "400",
            style: "normal",
        },
        {
            path: "../public/fonts/MontserratAlternates-Bold.ttf",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-montserrat-alternates",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Juegitos - Launcher de Minijuegos",
    description: "Una colección de minijuegos modernos, limpios y coquetos.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="es"
            className={`${montserratAlternates.className} ${montserratAlternates.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    );
}
