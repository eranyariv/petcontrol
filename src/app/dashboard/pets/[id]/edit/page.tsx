import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditPetForm from '@/components/EditPetForm'
import type { Pet, Vet, PetInsurance } from '@/types'

export default async function EditPetPage({
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

  return (
    <div className="max-w-xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">עריכת {pet.name}</h1>
        <p className="text-slate-500 mt-1">עדכון פרטי החיה</p>
      </div>
      <EditPetForm pet={pet as Pet} vets={(vetsData ?? []) as Vet[]} insurances={(insuranceData ?? []) as PetInsurance[]} />
    </div>
  )
}
