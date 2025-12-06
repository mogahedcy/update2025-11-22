import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/jwt'
import { Noto_Sans_Arabic } from "next/font/google";
import "../globals.css";
import DashboardLayoutClient from './DashboardLayoutClient'

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'لوحة التحكم | محترفين الديار العالمية',
  robots: { index: false, follow: false },
}

async function requireAdmin() {
  const token = (await cookies()).get('admin-token')?.value
  if (!token) return null
  try {
    const decoded = verifyToken(token) as any
    return { id: decoded.adminId, username: decoded.username }
  } catch {
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) {
    redirect('/login')
  }

  return (
    <html lang="ar" dir="rtl" className={notoSansArabic.variable}>
      <body className="antialiased font-arabic" suppressHydrationWarning={true}>
        <DashboardLayoutClient admin={admin}>{children}</DashboardLayoutClient>
      </body>
    </html>
  )
}
