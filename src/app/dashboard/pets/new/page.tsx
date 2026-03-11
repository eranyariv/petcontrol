import AddPetForm from '@/components/AddPetForm'

export default function NewPetPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">הוסף חיה חדשה</h1>
        <p className="text-slate-500 mt-1">מלא את הפרטים של חיית המחמד שלך</p>
      </div>
      <AddPetForm />
    </div>
  )
}
