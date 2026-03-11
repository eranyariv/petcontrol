import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PlusCircle, ArrowRight, MapPin, Cpu, Wheat, Calendar } from 'lucide-react'
import type { Pet, MedicalRecord } from '@/types'

const visitTypeLabels: Record<string, string> = {
  routine: 'בדיקה שגרתית',
  vaccine: 'חיסון',
  treatment: 'טיפול מיוחד',
}

const visitTypeColors: Record<string, string> = {
  routine: 'bg-blue-100 text-blue-700',
  vaccine: 'bg-green-100 text-green-700',
  treatment: 'bg-orange-100 text-orange-700',
}

export default async function PetDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: pet } = await supabase
    .from('pets')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!pet) notFound()

  const { data: records } = await supabase
    .from('medical_records')
    .select('*')
    .eq('pet_id', params.id)
    .order('visit_date', { ascending: false })

  const petData = pet as Pet
  const medicalRecords = (records ?? []) as MedicalRecord[]

  return (
    <div>
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        חזרה לרשימה
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pet Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="relative h-56 bg-slate-100">
              {petData.photo_url ? (
                <Image
                  src={petData.photo_url}
                  alt={petData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  {petData.type === 'dog' ? '🐶' : '🐱'}
                </div>
              )}
              <span className="absolute top-3 end-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
                {petData.type === 'dog' ? 'כלב' : 'חתול'}
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{petData.name}</h1>
                <p className="text-slate-500">
                  {petData.is_mixed ? 'מעורב' : petData.breed || 'גזע לא ידוע'}
                </p>
              </div>

              {petData.dob && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    {new Date(petData.dob).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {petData.home_address && (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{petData.home_address}</span>
                </div>
              )}

              {petData.allergies && (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <Wheat className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>{petData.allergies}</span>
                </div>
              )}

              {/* Chip ID section */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-medium">מספר שבב:</span>
                  <span className="font-mono">{petData.chip_id || 'לא הוזן'}</span>
                </div>
                {petData.chip_id && petData.type === 'dog' && (
                  <a
                    href={`https://www.moag.gov.il/yechidot/vetserv/dog_registry/Pages/default.aspx`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    🔍 בדיקה במאגר הארצי לרישום כלבים
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">רשומות רפואיות</h2>
              <Link
                href={`/dashboard/pets/${petData.id}/medical/new`}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                הוסף רשומה
              </Link>
            </div>

            {medicalRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-4xl mb-3">📋</div>
                <p>אין רשומות רפואיות עדיין</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${visitTypeColors[record.visit_type]}`}
                        >
                          {visitTypeLabels[record.visit_type]}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(record.visit_date).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                      {record.vet_name && (
                        <p className="text-sm font-medium text-slate-700">
                          ד"ר {record.vet_name}
                        </p>
                      )}
                      {record.description && (
                        <p className="text-sm text-slate-500 mt-1">{record.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
