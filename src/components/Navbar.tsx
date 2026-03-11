'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function Navbar({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold text-indigo-600">מחמד</span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt="תמונת פרופיל"
                width={36}
                height={36}
                className="rounded-full border-2 border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">
                  {user.email?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm text-slate-600 hidden sm:block">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              יציאה
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
