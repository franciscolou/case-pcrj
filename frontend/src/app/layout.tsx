import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Painel PCRJ — Acompanhamento de Crianças',
  description: 'Painel de monitoramento de crianças em situação de vulnerabilidade social',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("font-sans", inter.variable)}>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-4 focus:left-4 bg-white text-blue-700 px-4 py-2 rounded-lg font-medium shadow-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Pular para o conteúdo principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
