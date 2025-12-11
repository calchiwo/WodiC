"use client"

import VoiceCalculator from "@/components/voice-calculator"
import PWAInstallButton from "@/components/pwa-install-button"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { ClientOnly } from "@/components/client-only"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 flex flex-col">
      <div className="container mx-auto max-w-4xl flex-1">
        <div className="flex justify-end mb-4 gap-2">
          <ClientOnly>
            <ThemeToggle />
          </ClientOnly>
          <PWAInstallButton />
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/wodic-logo.jpg" alt="WodiC Logo" width={60} height={60} className="rounded-lg" />
            <h1 className="text-4xl font-bold text-foreground text-balance">WodiC Voice Calculator</h1>
          </div>
          <p className="text-muted-foreground text-lg text-pretty">
            Speak your math problems and get instant AI-powered solutions.
          </p>
        </div>
        <VoiceCalculator />
      </div>

      <footer className="mt-12 py-6 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground text-sm">
            This is a project of{" "}
            <a
              href="https://builtbywodi.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              BuiltByWodi®
            </a>
            , developed with ♥️ by{" "}
            <a
              href="https://x.com/calchiwo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Caleb "Calchiwo" Wodi
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
