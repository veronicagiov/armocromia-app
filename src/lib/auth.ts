import { cookies } from 'next/headers'

export function checkAdminAuth(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_auth')?.value
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || 'changeme').toString('base64')
  return Boolean(token && token === expected)
}

export function getExpectedToken(): string {
  return Buffer.from(process.env.ADMIN_PASSWORD || 'changeme').toString('base64')
}
