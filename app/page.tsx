import dynamic from "next/dynamic"
import Image from "next/image"
import { Suspense } from "react"

const VoiceCalculator = dynamic(() => import("@/components/voice-calculator"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-24 rounded-lg bg-muted" />
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  ),
})

const PWAInstallButton = dynamic(() => import("@/components/pwa-install-button"), {
  ssr: false,
  loading: () => null,
})

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((mod) => ({ default: mod.ThemeToggle })),
  {
    ssr: false,
    loading: () => <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />,
  },
)

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 flex flex-col">
      <div className="container mx-auto max-w-4xl flex-1">
        <div className="flex justify-end mb-4 gap-2">
          <Suspense fallback={<div className="h-10 w-10 rounded-full bg-muted animate-pulse" />}>
            <ThemeToggle />
          </Suspense>
          <Suspense fallback={null}>
            <PWAInstallButton />
          </Suspense>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/wodic-logo.jpg" alt="WodiC Logo" width={60} height={60} className="rounded-lg" priority />
            <h1 className="text-4xl font-bold text-foreground text-balance">WodiC Voice Calculator</h1>
          </div>
          <p className="text-muted-foreground text-lg text-pretty">
            Speak your math problems and get instant AI-powered calculations.
          </p>
        </div>
        <VoiceCalculator />
      </div>

      <footer className="mt-12 py-6 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground text-sm">
            {"This is a project of "}
            <a
              href="https://calebwodi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              BuiltByWodi
            </a>
            {", developed with love by "}
            <a
              href="https://x.com/calchiwo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              {"Caleb \"Calchiwo\" Wodi"}
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
