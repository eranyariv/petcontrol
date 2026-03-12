export type PetType = 'dog' | 'cat'
export type VisitType = 'routine' | 'vaccine' | 'treatment'
export type UserRole = 'admin' | 'standard'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
  role: UserRole
  updated_at: string | null
}

export interface Pet {
  id: string
  owner_id: string
  name: string
  type: PetType
  dob: string | null
  breed: string | null
  is_mixed: boolean
  photo_url: string | null
  home_address: string | null
  allergies: string | null
  chip_id: string | null
  created_at: string
  updated_at: string
}

export interface MedicalRecord {
  id: string
  pet_id: string
  visit_date: string
  visit_type: VisitType
  description: string | null
  vet_name: string | null
  created_at: string
}

export interface Vet {
  id: string
  pet_id: string
  name: string
  clinic_address: string | null
  phone: string | null
  created_at: string
}

export interface PetInsurance {
  id: string
  pet_id: string
  firm_name: string
  start_date: string
  end_date: string
  cost: number | null
  policy_pdf_url: string | null
  created_at: string
}
