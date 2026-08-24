import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'SkillPath', description: 'Career moves, mapped.' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
