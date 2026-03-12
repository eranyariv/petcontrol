import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Cpu, Calendar } from 'lucide-react'
import type { Pet } from '@/types'
import { calcPetAge } from '@/lib/petAge'

export default function PetCard({ pet }: { pet: Pet }) {
  return (
    <Link href={`/dashboard/pets/${pet.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer group">
        {/* Photo */}
        <div className="relative h-44 bg-slate-100">
          {pet.photo_url ? (
            <Image
              src={pet.photo_url}
              alt={pet.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {pet.type === 'dog' ? '🐶' : '🐱'}
            </div>
          )}
          <span className="absolute top-2.5 end-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-bold text-indigo-600">
            {pet.type === 'dog' ? 'כלב' : 'חתול'}
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-slate-800 mb-0.5">{pet.name}</h3>
          {pet.dob && (
            <p className="text-sm text-indigo-500 font-medium mb-0.5">גיל: {calcPetAge(pet.dob)}</p>
          )}
          <p className="text-sm text-slate-400 mb-3">
            {pet.is_mixed ? 'מעורב' : pet.breed || 'גזע לא ידוע'}
          </p>

          <div className="space-y-1.5">
            {pet.dob && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{new Date(pet.dob).toLocaleDateString('he-IL')}</span>
              </div>
            )}
            {pet.home_address && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{pet.home_address}</span>
              </div>
            )}
            {pet.chip_id && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-mono">{pet.chip_id}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
