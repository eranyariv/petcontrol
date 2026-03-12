export function calcPetAge(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (months < 0) {
    years--
    months += 12
  }
  if (now.getDate() < birth.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }

  if (years === 0) {
    if (months === 0) return 'פחות מחודש'
    return months === 1 ? 'חודש' : `${months} חודשים`
  }

  const yearStr = years === 1 ? 'שנה' : years === 2 ? 'שנתיים' : `${years} שנים`
  if (months === 0) return yearStr
  const monthStr = months === 1 ? 'וחודש' : `ו-${months} חודשים`
  return `${yearStr} ${monthStr}`
}
