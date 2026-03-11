'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { petSchema, type PetFormValues } from '@/lib/validations/pet'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { Dog, Cat, Upload, X } from 'lucide-react'
import clsx from 'clsx'

export default function AddPetForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      type: 'dog',
      is_mixed: false,
    },
  })

  const isMixed = watch('is_mixed')
  const petType = watch('type')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) return null

    const formData = new FormData()
    formData.append('file', photoFile)
    formData.append('upload_preset', uploadPreset)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    return data.secure_url ?? null
  }

  const onSubmit = async (values: PetFormValues) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let photo_url = values.photo_url || null
      if (photoFile) {
        const uploaded = await uploadPhoto()
        if (uploaded) photo_url = uploaded
      }

      const { error } = await supabase.from('pets').insert({
        owner_id: user.id,
        name: values.name,
        type: values.type,
        dob: values.dob || null,
        breed: values.is_mixed ? 'מעורב' : (values.breed || null),
        is_mixed: values.is_mixed,
        photo_url,
        home_address: values.home_address || null,
        allergies: values.allergies || null,
        chip_id: values.chip_id || null,
      })

      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
      {/* Photo Upload */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">תמונת פרופיל</h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-slate-200 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors overflow-hidden"
        >
          {photoPreview ? (
            <>
              <img src={photoPreview} alt="תצוגה מקדימה" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); setPhotoFile(null) }}
                className="absolute top-2 start-2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">לחץ להעלאת תמונה</p>
              <p className="text-xs text-slate-300 mt-1">PNG, JPG עד 5MB</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-slate-700">פרטים בסיסיים</h2>

        {/* Pet Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">סוג החיה</label>
          <div className="grid grid-cols-2 gap-3">
            {(['dog', 'cat'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('type', type)}
                className={clsx(
                  'flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all',
                  petType === type
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                )}
              >
                {type === 'dog' ? <Dog className="w-5 h-5" /> : <Cat className="w-5 h-5" />}
                {type === 'dog' ? 'כלב' : 'חתול'}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            שם החיה <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="לדוגמה: בוקסר"
            className={clsx(
              'w-full px-4 py-2.5 rounded-xl border text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all',
              errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
            )}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Breed */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">גזע</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_mixed')}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-400"
              />
              <span className="text-sm text-slate-600">מעורב</span>
            </label>
            <input
              {...register('breed')}
              disabled={isMixed}
              placeholder="לדוגמה: גולדן רטריבר"
              className={clsx(
                'w-full px-4 py-2.5 rounded-xl border text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all',
                isMixed ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' : 'border-slate-200',
                errors.breed ? 'border-red-300 bg-red-50' : ''
              )}
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            תאריך לידה
          </label>
          <input
            type="date"
            {...register('dob')}
            max={new Date().toISOString().split('T')[0]}
            className={clsx(
              'w-full px-4 py-2.5 rounded-xl border text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all',
              errors.dob ? 'border-red-300 bg-red-50' : 'border-slate-200'
            )}
          />
          {errors.dob && (
            <p className="text-sm text-red-500 mt-1">{errors.dob.message}</p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-slate-700">מידע נוסף</h2>

        {/* Chip ID */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            מספר שבב (Chip ID)
          </label>
          <input
            {...register('chip_id')}
            placeholder="15 ספרות - לדוגמה: 981000000000000"
            maxLength={15}
            className={clsx(
              'w-full px-4 py-2.5 rounded-xl border font-mono text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all',
              errors.chip_id ? 'border-red-300 bg-red-50' : 'border-slate-200'
            )}
          />
          {errors.chip_id && (
            <p className="text-sm text-red-500 mt-1">{errors.chip_id.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            כתובת מגורים
          </label>
          <input
            {...register('home_address')}
            placeholder="לדוגמה: רחוב הרצל 1, תל אביב"
            className={clsx(
              'w-full px-4 py-2.5 rounded-xl border text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all',
              errors.home_address ? 'border-red-300 bg-red-50' : 'border-slate-200'
            )}
          />
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            אלרגיות למזון
          </label>
          <textarea
            {...register('allergies')}
            rows={3}
            placeholder="פרט אלרגיות ידועות..."
            className={clsx(
              'w-full px-4 py-2.5 rounded-xl border text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none',
              errors.allergies ? 'border-red-300 bg-red-50' : 'border-slate-200'
            )}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'שומר...' : 'הוסף חיה'}
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
