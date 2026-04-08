import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RBStudio Flow',
  description: 'Transformamos ideas en especificaciones listas para construir en minutos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  )
}
