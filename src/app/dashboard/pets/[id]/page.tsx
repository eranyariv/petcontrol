import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PlusCircle, ArrowRight, MapPin, Cpu, Wheat, Calendar, Stethoscope, Phone, Pencil, Shield, FileText, Share2, ExternalLink } from 'lucide-react'
import type { Pet, MedicalRecord, Vet, PetInsurance, PetSocialProfile } from '@/types'
import { calcPetAge } from '@/lib/petAge'

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  other: 'אחר',
}

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

  const { data: vetsData } = await supabase
    .from('vets')
    .select('*')
    .eq('pet_id', params.id)
    .order('created_at', { ascending: true })

  const { data: insuranceData } = await supabase
    .from('pet_insurance')
    .select('*')
    .eq('pet_id', params.id)
    .order('created_at', { ascending: true })

  const { data: socialsData } = await supabase
    .from('pet_social_profiles')
    .select('*')
    .eq('pet_id', params.id)
    .order('created_at', { ascending: true })

  const petData = pet as Pet
  const medicalRecords = (records ?? []) as MedicalRecord[]
  const vets = (vetsData ?? []) as Vet[]
  const insurances = (insuranceData ?? []) as PetInsurance[]
  const socialProfiles = (socialsData ?? []) as PetSocialProfile[]
  const today = new Date().toISOString().split('T')[0]

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
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{petData.name}</h1>
                  {petData.dob && (
                    <p className="text-indigo-500 font-medium">גיל: {calcPetAge(petData.dob)}</p>
                  )}
                  <p className="text-slate-500">
                    {petData.is_mixed ? 'מעורב' : petData.breed || 'גזע לא ידוע'}
                  </p>
                </div>
                <Link
                  href={`/dashboard/pets/${petData.id}/edit`}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  עריכה
                </Link>
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
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{petData.home_address}</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <iframe
                      title="כתובת מגורים"
                      width="100%"
                      height="150"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(petData.home_address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
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
                    href="https://dogsearch.moag.gov.il/#/pages/pets"
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

        {/* Vets & Medical Records Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vets */}
          {vets.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-400" />
                וטרינרים מטפלים
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vets.map((vet) => (
                  <div key={vet.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                    <h3 className="font-semibold text-slate-800">{vet.name}</h3>
                    {vet.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                        <a href={`tel:${vet.phone}`} dir="ltr" className="hover:text-indigo-600 transition-colors">
                          {vet.phone}
                        </a>
                      </div>
                    )}
                    {vet.clinic_address && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{vet.clinic_address}</span>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-slate-200">
                          <iframe
                            title={`מרפאה - ${vet.name}`}
                            width="100%"
                            height="150"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(vet.clinic_address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insurance */}
          {insurances.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                ביטוח
              </h2>
              <div className="space-y-3">
                {insurances.map((ins) => {
                  const isExpired = ins.end_date < today
                  return (
                    <div
                      key={ins.id}
                      className={`p-4 rounded-xl border space-y-2 ${isExpired ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">{ins.firm_name}</h3>
                        {isExpired && (
                          <span className="text-xs font-medium bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                            פג תוקף
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${isExpired ? 'text-red-600' : 'text-slate-600'}`}>
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>
                          {new Date(ins.start_date).toLocaleDateString('he-IL')} — {new Date(ins.end_date).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                      {ins.cost && (
                        <p className="text-sm text-slate-600">
                          עלות: <span dir="ltr" className="font-medium">{ins.cost.toLocaleString('he-IL')}</span> ש"ח
                        </p>
                      )}
                      {ins.policy_pdf_url && (
                        <a
                          href={ins.policy_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          צפה בפוליסה
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Social Profiles */}
          {socialProfiles.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                רשתות חברתיות
              </h2>
              <div className="flex flex-wrap gap-3">
                {socialProfiles.map((sp) => (
                  <a
                    key={sp.id}
                    href={sp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-indigo-200 hover:bg-indigo-50 transition-colors text-sm font-medium text-slate-700"
                  >
                    <span>{platformLabels[sp.platform] || sp.platform}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Medical Records */}
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
