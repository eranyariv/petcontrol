'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Users, ChevronDown, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

export default function Navbar({ user, profile }: { user: User; profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url
  const email = profile?.email || user.email
  const isAdmin = profile?.role === 'admin'

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="מחמד" width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-bold text-indigo-600">מחמד</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                ניהול משתמשים
              </Link>
            )}

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="תמונת פרופיל"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-sm">
                      {email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm text-slate-600 hidden sm:block">{displayName}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute top-full start-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  {/* Profile Section */}
                  <div className="p-5 text-center border-b border-slate-100">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="תמונת פרופיל"
                        width={72}
                        height={72}
                        className="rounded-full border-2 border-indigo-200 mx-auto mb-3"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-indigo-600 font-bold text-2xl">
                          {email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-slate-800">{displayName}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-2 text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                        מנהל מערכת
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      יציאה מהחשבון
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
