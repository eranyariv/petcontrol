import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminUserList from '@/components/AdminUserList'
import type { Profile, Pet } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as Profile).role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })

  // Fetch all pets
  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">ניהול משתמשים</h1>
        <p className="text-slate-500 mt-1">צפייה וניהול של כל המשתמשים הרשומים במערכת</p>
      </div>
      <AdminUserList
        profiles={(profiles ?? []) as Profile[]}
        pets={(pets ?? []) as Pet[]}
        currentUserId={user.id}
      />
    </div>
  )
}
