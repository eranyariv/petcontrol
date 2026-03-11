import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'מחמד - ניהול חיות מחמד',
  description: 'אפליקציה לניהול חיות המחמד שלך',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased bg-slate-50 min-h-screen">{children}</body>
    </html>
  )
}
