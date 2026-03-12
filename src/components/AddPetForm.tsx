'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { petSchema, type PetFormValues } from '@/lib/validations/pet'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useCallback } from 'react'
import { Dog, Cat, Upload, X, ZoomIn, ZoomOut, Check, PlusCircle, Trash2, Phone, Stethoscope } from 'lucide-react'
import clsx from 'clsx'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import getCroppedImg from '@/lib/cropImage'
import AddressField from '@/components/AddressField'

interface VetEntry {
  name: string
  clinic_address: string
  phone: string
}

export default function AddPetForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cropper state
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // Vets state
  const [vets, setVets] = useState<VetEntry[]>([{ name: '', clinic_address: '', phone: '' }])
  // Home address state (for AddressField)
  const [homeAddress, setHomeAddress] = useState('')

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
      const reader = new FileReader()
      reader.onloadend = () => {
        setRawImage(reader.result as string)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
      }
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleCropConfirm = async () => {
    if (!rawImage || !croppedAreaPixels) return
    try {
      const croppedBlob = await getCroppedImg(rawImage, croppedAreaPixels)
      const croppedFile = new File([croppedBlob], 'pet-photo.jpg', { type: 'image/jpeg' })
      setPhotoFile(croppedFile)
      setPhotoPreview(URL.createObjectURL(croppedBlob))
      setRawImage(null)
    } catch (err) {
      console.error('Crop failed:', err)
    }
  }

  const handleCropCancel = () => {
    setRawImage(null)
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

  const addVet = () => setVets([...vets, { name: '', clinic_address: '', phone: '' }])
  const removeVet = (index: number) => setVets(vets.filter((_, i) => i !== index))
  const updateVet = (index: number, field: keyof VetEntry, value: string) => {
    const updated = [...vets]
    updated[index] = { ...updated[index], [field]: value }
    setVets(updated)
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

      const { data: pet, error } = await supabase.from('pets').insert({
        owner_id: user.id,
        name: values.name,
        type: values.type,
        dob: values.dob || null,
        breed: values.is_mixed ? 'מעורב' : (values.breed || null),
        is_mixed: values.is_mixed,
        photo_url,
        home_address: homeAddress || null,
        allergies: values.allergies || null,
        chip_id: values.chip_id || null,
      }).select('id').single()

      if (error) throw error

      // Insert vets
      const validVets = vets.filter((v) => v.name.trim())
      if (validVets.length > 0 && pet) {
        const { error: vetError } = await supabase.from('vets').insert(
          validVets.map((v) => ({
            pet_id: pet.id,
            name: v.name.trim(),
            clinic_address: v.clinic_address.trim() || null,
            phone: v.phone.trim() || null,
          }))
        )
        if (vetError) console.error('Vet insert error:', vetError)
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Crop Modal */}
      {rawImage && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 text-center" dir="rtl">
              <h3 className="text-lg font-semibold text-slate-700">חיתוך תמונה</h3>
              <p className="text-sm text-slate-400 mt-1">גרור וזום כדי למרכז את התמונה</p>
            </div>

            <div className="relative w-full" style={{ height: '360px' }}>
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom controls */}
            <div className="flex items-center justify-center gap-3 py-3 px-4 border-t border-slate-100">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-48 accent-indigo-600"
              />
              <ZoomIn className="w-4 h-4 text-slate-400" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t border-slate-100" dir="rtl">
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                <Check className="w-4 h-4" />
                אישור
              </button>
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
        {/* Photo Upload */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">תמונת פרופיל</h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors overflow-hidden"
            style={{ aspectRatio: '4/3' }}
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
            <AddressField
              value={homeAddress}
              onChange={setHomeAddress}
              placeholder="לדוגמה: רחוב הרצל 1, תל אביב"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
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

        {/* Vets */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-400" />
              וטרינרים מטפלים
            </h2>
            <button
              type="button"
              onClick={addVet}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              הוסף וטרינר
            </button>
          </div>

          {vets.map((vet, index) => (
            <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">וטרינר {index + 1}</span>
                {vets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVet(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Vet Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  שם הוטרינר <span className="text-red-500">*</span>
                </label>
                <input
                  value={vet.name}
                  onChange={(e) => updateVet(index, 'name', e.target.value)}
                  placeholder='לדוגמה: ד"ר כהן'
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                />
              </div>

              {/* Clinic Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">כתובת מרפאה</label>
                <AddressField
                  value={vet.clinic_address}
                  onChange={(val) => updateVet(index, 'clinic_address', val)}
                  placeholder="לדוגמה: רחוב סוקולוב 10, רמת גן"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">טלפון</label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={vet.phone}
                    onChange={(e) => updateVet(index, 'phone', e.target.value)}
                    type="tel"
                    dir="ltr"
                    placeholder="03-1234567"
                    className="w-full px-4 ps-10 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
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
    </>
  )
}
