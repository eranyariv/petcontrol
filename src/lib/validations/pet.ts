import { z } from 'zod'

export const petSchema = z.object({
  name: z
    .string({ required_error: 'שדה זה הוא חובה' })
    .min(2, 'השם חייב להכיל לפחות 2 תווים')
    .max(50, 'השם ארוך מדי'),
  type: z.enum(['dog', 'cat'], {
    required_error: 'שדה זה הוא חובה',
    invalid_type_error: 'נא לבחור סוג חיה',
  }),
  dob: z
    .string({ required_error: 'שדה זה הוא חובה' })
    .refine((val) => {
      if (!val) return true
      const date = new Date(val)
      return date <= new Date()
    }, 'תאריך הלידה לא יכול להיות בעתיד')
    .optional()
    .or(z.literal('')),
  breed: z.string().max(100, 'שם הגזע ארוך מדי').optional().or(z.literal('')),
  is_mixed: z.boolean().default(false),
  chip_id: z
    .string()
    .regex(/^\d{15}$/, 'נא להזין מספרים בלבד - בדיוק 15 ספרות')
    .optional()
    .or(z.literal('')),
  home_address: z.string().max(200, 'הכתובת ארוכה מדי').optional().or(z.literal('')),
  allergies: z.string().max(500, 'הטקסט ארוך מדי').optional().or(z.literal('')),
  photo_url: z.string().url('כתובת URL לא תקינה').optional().or(z.literal('')),
})

export type PetFormValues = z.infer<typeof petSchema>
