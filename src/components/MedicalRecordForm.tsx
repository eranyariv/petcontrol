'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { medicalRecordSchema, type MedicalRecordFormValues } from '@/lib/validations/medical'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'

const visitTypeOptions = [
  { value: 'routine', label: 'בדיקה שגרתית', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'vaccine', label: 'חיסון', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'treatment', label: 'טיפול מיוחד', color: 'border-orange-300 bg-orange-50 text-orange-700' },
] as const

export default function MedicalRecordForm({ petId }: { petId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: { visit_type: 'routine' },
  })

  const visitType = watch('visit_type')

  const onSubmit = async (values: MedicalRecordFormValues) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('medical_records').insert({
        pet_id: petId,
        visit_date: values.visit_date,
        visit_type: values.visit_type,
        description: values.description || null,
        vet_name: values.vet_name || null,
      })
      if (error) throw error
      router.push(`/dashboard/pets/${petId}`)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
        {/* Visit Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">סוג הביקור</label>
          <div className="grid grid-cols-3 gap-2">
            {visitTypeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('visit_type', opt.value)}
                className={clsx(
                  'py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all',
                  visitType === opt.value
                    ? opt.color
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visit Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            תאריך הביקור <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('visit_date')}
            max={new Date().toISOString().split('T')[0]}
            className={clsx(
              'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400',
              errors.visit_date ? 'border-red-300 bg-red-50' : 'border-slate-200'
            )}
          />
          {errors.visit_date && (
            <p className="text-sm text-red-500 mt-1">{errors.visit_date.message}</p>
          )}
        </div>

        {/* Vet Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">שם הרופא</label>
          <input
            {...register('vet_name')}
            placeholder='לדוגמה: ד"ר כהן'
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 placeholder-slate-300"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">תיאור הביקור</label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="פרט את מה שנעשה בביקור..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 placeholder-slate-300 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'שומר...' : 'שמור רשומה'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  )
}
