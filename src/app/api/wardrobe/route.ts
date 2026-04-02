import { NextRequest, NextResponse } from 'next/server'
import { getAllWardrobeItems, insertWardrobeItem, deleteWardrobeItem } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = getAllWardrobeItems()
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const category = formData.get('category') as string
    const colorHex = formData.get('color_hex') as string
    const colorName = (formData.get('color_name') as string) || null
    const frequency = formData.get('frequency') as string
    const note = (formData.get('note') as string) || ''
    const season = formData.get('season') as string
    const inPalette = formData.get('in_palette') === 'true'
    const file = formData.get('photo') as File | null

    let photoPath: string | null = null
    if (file && file.size > 0) {
      const baseDir = process.env.STORAGE_PATH || (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'data'))
      const uploadDir = path.join(baseDir, 'wardrobe')
      fs.mkdirSync(uploadDir, { recursive: true })

      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const buffer = Buffer.from(await file.arrayBuffer())
      fs.writeFileSync(path.join(uploadDir, safeName), buffer)
      photoPath = `wardrobe/${safeName}`
    }

    const id = insertWardrobeItem({
      category,
      color_hex: colorHex,
      color_name: colorName,
      frequency,
      photo: photoPath,
      note,
      season,
      in_palette: inPalette,
    })

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    console.error('Wardrobe POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  deleteWardrobeItem(id)
  return NextResponse.json({ success: true })
}
