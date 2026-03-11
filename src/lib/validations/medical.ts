import { z } from 'zod'

export const medicalRecordSchema = z.object({
  visit_date: z
    .string({ required_error: 'שדה זה הוא חובה' })
    .min(1, 'שדה זה הוא חובה'),
  visit_type: z.enum(['routine', 'vaccine', 'treatment'], {
    required_error: 'שדה זה הוא חובה',
    invalid_type_error: 'נא לבחור סוג ביקור',
  }),
  description: z.string().max(1000, 'התיאור ארוך מדי').optional().or(z.literal('')),
  vet_name: z.string().max(100, 'השם ארוך מדי').optional().or(z.literal('')),
})

export type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>
