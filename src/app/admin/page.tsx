import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

export default function AdminPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_auth')?.value
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || 'changeme').toString('base64')

  if (!token || token !== expected) {
    redirect('/admin/login')
  }

  return <AdminDashboard />
}
