import MedicalRecordForm from '@/components/MedicalRecordForm'

export default function NewMedicalRecordPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">הוסף רשומה רפואית</h1>
        <p className="text-slate-500 mt-1">תיעוד ביקור אצל הרופא</p>
      </div>
      <MedicalRecordForm petId={params.id} />
    </div>
  )
}
