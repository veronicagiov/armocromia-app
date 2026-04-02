import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SEASON_PALETTES: Record<string, { name: string; hex: string }[]> = {
  Primavera: [
    { name: 'Corallo', hex: '#FF6B47' },
    { name: 'Pesca', hex: '#FFAE94' },
    { name: 'Salmone', hex: '#FA8072' },
    { name: 'Terracotta chiara', hex: '#E2725B' },
    { name: 'Cammello', hex: '#C19A6B' },
    { name: 'Avorio caldo', hex: '#FFF0C8' },
    { name: 'Verde lime', hex: '#90EE90' },
    { name: 'Turchese caldo', hex: '#40E0D0' },
    { name: 'Oro', hex: '#FFD700' },
    { name: 'Pesca chiaro', hex: '#FFDAB9' },
    { name: 'Verde mela', hex: '#8DB600' },
    { name: 'Arancio caldo', hex: '#FF8C00' },
    { name: 'Verde acqua caldo', hex: '#40C8B0' },
    { name: 'Champagne dorato', hex: '#F0C060' },
    { name: 'Rosa corallo', hex: '#F88070' },
  ],
  Estate: [
    { name: 'Rosa cipria', hex: '#F4C2C2' },
    { name: 'Malva', hex: '#D8A8D8' },
    { name: 'Lavanda', hex: '#C8C8E8' },
    { name: 'Grigio perla', hex: '#CCCCCC' },
    { name: 'Azzurro nebbia', hex: '#A8CCDC' },
    { name: 'Blu ghiaccio', hex: '#B8D8E8' },
    { name: 'Verde salvia', hex: '#AABAA0' },
    { name: 'Bianco ottico', hex: '#F0F0F8' },
    { name: 'Prugna chiara', hex: '#C8A0C8' },
    { name: 'Rosa antico', hex: '#C08888' },
    { name: 'Beige freddo', hex: '#E8E0D8' },
    { name: 'Turchese freddo', hex: '#A0C8D0' },
    { name: 'Rosa lavanda', hex: '#D0A8D0' },
    { name: 'Rosa polvere', hex: '#E0C8D8' },
    { name: 'Azzurro polvere', hex: '#B0C0D8' },
  ],
  Autunno: [
    { name: 'Ruggine', hex: '#A0522D' },
    { name: 'Ocra', hex: '#C89040' },
    { name: 'Verde bosco', hex: '#507840' },
    { name: 'Marrone cioccolato', hex: '#8B4513' },
    { name: 'Mattone', hex: '#804030' },
    { name: 'Senape', hex: '#D0A050' },
    { name: 'Giallo curry', hex: '#DAA520' },
    { name: 'Verde oliva', hex: '#556B2F' },
    { name: 'Bronzo scuro', hex: '#8B6914' },
    { name: 'Cammello scuro', hex: '#CD853F' },
    { name: 'Mogano', hex: '#6B3A2A' },
    { name: 'Arancio bruciato', hex: '#C87830' },
    { name: 'Kaki', hex: '#7A6840' },
    { name: 'Rame', hex: '#B87333' },
    { name: 'Cioccolato', hex: '#6B4226' },
  ],
  Inverno: [
    { name: 'Blu reale', hex: '#2040A0' },
    { name: 'Rosso puro', hex: '#CC1020' },
    { name: 'Bianco brillante', hex: '#F0F0F8' },
    { name: 'Nero', hex: '#101018' },
    { name: 'Viola', hex: '#8030A0' },
    { name: 'Blu cobalto', hex: '#0058B0' },
    { name: 'Fucsia', hex: '#E00050' },
    { name: 'Verde smeraldo', hex: '#006040' },
    { name: 'Oro freddo', hex: '#FFD700' },
    { name: 'Indaco', hex: '#4B0082' },
    { name: 'Turchese', hex: '#00CED1' },
    { name: 'Rosa shocking', hex: '#FF1493' },
    { name: 'Blu notte', hex: '#000080' },
    { name: 'Cremisi', hex: '#DC143C' },
    { name: 'Verde bandiera', hex: '#228B22' },
  ],
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key non configurata' }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('photo') as File
    const season = formData.get('season') as string

    if (!file || !season) {
      return NextResponse.json({ error: 'Foto e stagione richieste' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const mediaType = file.type || 'image/jpeg'

    const palette = SEASON_PALETTES[season]
    if (!palette) {
      return NextResponse.json({ error: 'Stagione non valida' }, { status: 400 })
    }

    const paletteList = palette.map(c => `${c.name} (${c.hex})`).join(', ')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `Analizza questa foto di un capo di abbigliamento o accessorio.

1. Identifica il colore DOMINANTE del capo (ignora lo sfondo, etichette, pelle della persona se visibile).
2. Dammi il codice hex del colore dominante.
3. Dammi il nome del colore in italiano.
4. Confronta il colore con questa palette della stagione ${season}: ${paletteList}. Il colore è compatibile con la palette? Considera una tolleranza ragionevole (non deve essere identico, ma armonico).

Rispondi SOLO in questo formato JSON, nient'altro:
{"color_hex": "#XXXXXX", "color_name": "nome colore", "in_palette": true/false, "closest_palette_color": "nome del colore più vicino in palette", "confidence": "high/medium/low"}`,
            },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json({ error: 'Errore analisi colore' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Estrai il JSON dalla risposta
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Risposta non valida' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Analyze color error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
