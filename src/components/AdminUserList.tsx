'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ChevronDown, ChevronUp, Dog, Cat } from 'lucide-react'
import type { Profile, Pet } from '@/types'

export default function AdminUserList({
  profiles,
  pets,
  currentUserId,
}: {
  profiles: Profile[]
  pets: Pet[]
  currentUserId: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const getPetsForUser = (userId: string) => pets.filter((p) => p.owner_id === userId)

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUserId) return
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה וכל החיות שלו?')) return

    setDeleting(userId)
    try {
      // Delete all pets first (cascades to medical records)
      await supabase.from('pets').delete().eq('owner_id', userId)
      // Delete the profile
      await supabase.from('profiles').delete().eq('id', userId)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm text-slate-400">משתמשים רשומים</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{profiles.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm text-slate-400">סה"כ חיות</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{pets.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm text-slate-400">מנהלי מערכת</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {profiles.filter((p) => p.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* User List */}
      {profiles.map((profile) => {
        const userPets = getPetsForUser(profile.id)
        const isExpanded = expandedUser === profile.id
        const isCurrentUser = profile.id === currentUserId

        return (
          <div
            key={profile.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* User Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedUser(isExpanded ? null : profile.id)}
            >
              <div className="flex items-center gap-3">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || ''}
                    width={44}
                    height={44}
                    className="rounded-full border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">
                      {profile.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">
                      {profile.full_name || 'ללא שם'}
                    </h3>
                    {profile.role === 'admin' && (
                      <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        מנהל
                      </span>
                    )}
                    {isCurrentUser && (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        אתה
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">
                  {userPets.length} חיות
                </span>
                {!isCurrentUser && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteUser(profile.id)
                    }}
                    disabled={deleting === profile.id}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="מחק משתמש"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>

            {/* Expanded Pets */}
            {isExpanded && (
              <div className="border-t border-slate-100 p-4 bg-slate-50">
                {userPets.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    אין חיות רשומות
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {userPets.map((pet) => (
                      <Link
                        key={pet.id}
                        href={`/dashboard/pets/${pet.id}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors"
                      >
                        {pet.type === 'dog' ? (
                          <Dog className="w-8 h-8 text-indigo-400 shrink-0" />
                        ) : (
                          <Cat className="w-8 h-8 text-indigo-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{pet.name}</p>
                          <p className="text-xs text-slate-400">
                            {pet.is_mixed ? 'מעורב' : pet.breed || 'גזע לא ידוע'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
