import { createClient } from '@/lib/supabase/server'
import PetCard from '@/components/PetCard'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import type { Pet } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: pets, error } = await supabase
    .from('pets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pets:', error)
  }

  const petList = (pets ?? []) as Pet[]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">החיות שלי</h1>
          <p className="text-slate-500 mt-1">
            {petList.length > 0
              ? `${petList.length} חיות מחמד רשומות`
              : 'עדיין אין חיות מחמד רשומות'}
          </p>
        </div>
        <Link
          href="/dashboard/pets/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          הוסף חיה חדשה
        </Link>
      </div>

      {/* Pet Grid */}
      {petList.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-semibold text-slate-600 mb-2">
            עדיין לא הוספת חיות מחמד
          </h3>
          <p className="text-slate-400 mb-6">
            הוסף את חיית המחמד הראשונה שלך ותתחיל לנהל את המידע שלה
          </p>
          <Link
            href="/dashboard/pets/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            הוסף חיה ראשונה
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {petList.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  )
}
