import path from 'path'
import fs from 'fs'
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  Link,
  Svg,
  Path,
  Circle,
  G,
  Polyline,
  renderToBuffer,
} from '@react-pdf/renderer'
import { SUBGROUP_COPY } from './pdf-copy'
import { SUBGROUP_DATA, PaletteColor } from './pdf-subgroup-data'

// ── FONT REGISTRATION ────────────────────────────────────────────────────────
const FONT_DIR = path.join(process.cwd(), 'node_modules', '@fontsource')

Font.register({
  family: 'Cormorant',
  fonts: [
    { src: path.join(FONT_DIR, 'cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff'), fontWeight: 400 },
    { src: path.join(FONT_DIR, 'cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff'), fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(FONT_DIR, 'cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff'), fontWeight: 700 },
  ],
})
Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(FONT_DIR, 'inter/files/inter-latin-400-normal.woff'), fontWeight: 400 },
    { src: path.join(FONT_DIR, 'inter/files/inter-latin-500-normal.woff'), fontWeight: 500 },
    { src: path.join(FONT_DIR, 'inter/files/inter-latin-600-normal.woff'), fontWeight: 600 },
    { src: path.join(FONT_DIR, 'inter/files/inter-latin-700-normal.woff'), fontWeight: 700 },
  ],
})

// ── DATI STAGIONE ────────────────────────────────────────────────────────────
interface MakeupItem {
  label: string
  value: string
  colors: PaletteColor[]
}

interface SeasonInfo {
  accent: string
  light: string
  paper: string
  description: string
  intro: string
  neutrals: PaletteColor[]
  avoidColors: PaletteColor[]
  makeup: MakeupItem[]
  bookLink: string
  bookTitle: string
}

const SUBGROUP_NEIGHBORS: Record<string, { label: string; colors: PaletteColor[] }> = {
  'Primavera Assoluta': { label: 'Estate Assoluta', colors: [
    { name: 'Malva caldo', hex: '#C8A0C0' },
    { name: 'Rosa antico', hex: '#C09090' },
    { name: 'Lavanda calda', hex: '#C0B0D8' },
    { name: 'Ciclamino tenue', hex: '#E0A0C0' },
    { name: 'Azzurro rosato', hex: '#C8D8E8' },
    { name: 'Verde salvia caldo', hex: '#B0BC9C' },
  ]},
  'Spring Light': { label: 'Summer Light', colors: [
    { name: 'Rosa cipria', hex: '#F4C2C2' },
    { name: 'Glicine pallido', hex: '#E0D8F0' },
    { name: 'Azzurro latte', hex: '#D8EEF8' },
    { name: 'Lavanda bianca', hex: '#EEE8F8' },
    { name: 'Beige freddo', hex: '#EEE8E0' },
    { name: 'Verde menta freddo', hex: '#C8E8D8' },
  ]},
  'Spring Warm': { label: 'Autumn Warm', colors: [
    { name: 'Ocra smorzata', hex: '#C8A060' },
    { name: 'Verde cachi profondo', hex: '#7A8030' },
    { name: 'Cammello scuro', hex: '#A88860' },
    { name: 'Bronzo medio', hex: '#A07830' },
    { name: 'Terracotta profonda', hex: '#A05028' },
    { name: 'Senape scuro', hex: '#A07820' },
  ]},
  'Spring Bright': { label: 'Winter Bright', colors: [
    { name: 'Fucsia freddo', hex: '#E0006C' },
    { name: 'Turchese vivido freddo', hex: '#00C8C0' },
    { name: 'Viola intenso', hex: '#6A0080' },
    { name: 'Ciclamino', hex: '#D8009A' },
    { name: 'Verde brillante freddo', hex: '#00B050' },
    { name: 'Blu royal', hex: '#3A5ACC' },
  ]},
  'Estate Assoluta': { label: 'Primavera Assoluta', colors: [
    { name: 'Corallo tenue', hex: '#F09078' },
    { name: 'Pesca caldo', hex: '#F0B890' },
    { name: 'Verde acqua caldo', hex: '#A8D8C8' },
    { name: 'Giallo crema', hex: '#F8F0C8' },
    { name: 'Salmone chiaro', hex: '#F8B0A0' },
    { name: 'Albicocca', hex: '#FFC890' },
  ]},
  'Summer Light': { label: 'Spring Light', colors: [
    { name: 'Pesca chiarissimo', hex: '#FFE8D8' },
    { name: 'Giallo crema caldo', hex: '#FFF8D0' },
    { name: 'Verde acqua', hex: '#C8EED8' },
    { name: 'Albicocca tenue', hex: '#FFD8B8' },
    { name: 'Avorio caldo', hex: '#FFF8E8' },
    { name: 'Rosa pesca chiaro', hex: '#FFD0C8' },
  ]},
  'Summer Soft': { label: 'Autumn Soft', colors: [
    { name: 'Cammello polveroso', hex: '#C8A882' },
    { name: 'Verde salvia caldo', hex: '#9CAA82' },
    { name: 'Rosa antico caldo', hex: '#C08878' },
    { name: 'Ocra morbida', hex: '#C8A060' },
    { name: 'Beige dorato', hex: '#D8C8A8' },
    { name: 'Bronzo antico', hex: '#A07840' },
  ]},
  'Summer Cool': { label: 'Winter Cool', colors: [
    { name: 'Prugna media', hex: '#7A3858' },
    { name: 'Blu periwinkle scuro', hex: '#3858A0' },
    { name: 'Bordeaux freddo medio', hex: '#700830' },
    { name: 'Viola medio', hex: '#6040A0' },
    { name: 'Blu ardesia scuro', hex: '#203868' },
    { name: 'Verde abete freddo', hex: '#286048' },
  ]},
  'Autunno Assoluto': { label: 'Primavera Assoluta', colors: [
    { name: 'Corallo caldo', hex: '#FF7850' },
    { name: 'Pesca dorato', hex: '#FFB880' },
    { name: 'Verde lime caldo', hex: '#90C040' },
    { name: 'Oro vivo', hex: '#E8C000' },
    { name: 'Albicocca intensa', hex: '#F09050' },
    { name: 'Salmone caldo', hex: '#F8A080' },
  ]},
  'Autumn Soft': { label: 'Summer Soft', colors: [
    { name: 'Malva polveroso', hex: '#C0A0B8' },
    { name: 'Grigio rosato', hex: '#C0B0B0' },
    { name: 'Rosa antico freddo', hex: '#C09898' },
    { name: 'Lavanda smorzata', hex: '#B8B0C8' },
    { name: 'Beige rosato', hex: '#D8C8C0' },
    { name: 'Taupe', hex: '#9A8E88' },
  ]},
  'Autumn Warm': { label: 'Spring Warm', colors: [
    { name: 'Corallo chiaro', hex: '#FF9070' },
    { name: 'Pesca luminoso', hex: '#FFC090' },
    { name: 'Lime caldo', hex: '#A8D050' },
    { name: 'Giallo dorato', hex: '#F8D050' },
    { name: 'Salmone caldo', hex: '#F8A080' },
    { name: 'Verde mela caldo', hex: '#B8C440' },
  ]},
  'Autumn Deep': { label: 'Winter Deep', colors: [
    { name: 'Bordeaux scurissimo', hex: '#400818' },
    { name: 'Blu notte freddo', hex: '#0A1040' },
    { name: 'Prugna fredda scura', hex: '#3A0840' },
    { name: 'Viola scuro', hex: '#380848' },
    { name: 'Verde notte freddo', hex: '#0A2818' },
    { name: 'Nero soft', hex: '#1A1A1F' },
  ]},
  'Inverno Assoluto': { label: 'Summer Cool', colors: [
    { name: 'Blu ghiaccio', hex: '#C0D8E8' },
    { name: 'Lavanda medio', hex: '#B0A8D0' },
    { name: 'Malva freddo', hex: '#C0A0C0' },
    { name: 'Grigio perla', hex: '#C8C8D0' },
    { name: 'Rosa freddo', hex: '#E0B8C8' },
    { name: 'Verde salvia freddo', hex: '#A8B8A8' },
  ]},
  'Winter Cool': { label: 'Summer Cool', colors: [
    { name: 'Lavanda fredda', hex: '#B8B8E0' },
    { name: 'Grigio perla rosato', hex: '#C8C0CC' },
    { name: 'Rosa freddo', hex: '#D8A0B8' },
    { name: 'Lilla tenue', hex: '#C8B8D8' },
    { name: 'Azzurro nebbia', hex: '#B8D0E0' },
    { name: 'Verde salvia freddo', hex: '#A8B8A8' },
  ]},
  'Winter Bright': { label: 'Spring Bright', colors: [
    { name: 'Corallo brillante caldo', hex: '#FF6840' },
    { name: 'Verde mela vivido', hex: '#70CC00' },
    { name: 'Arancio brillante', hex: '#FF9000' },
    { name: 'Giallo elettrico', hex: '#F8E000' },
    { name: 'Turchese caldo', hex: '#00D8A8' },
    { name: 'Pesca brillante', hex: '#FF9070' },
  ]},
  'Winter Deep': { label: 'Autumn Deep', colors: [
    { name: 'Marrone cioccolato', hex: '#5A2D0C' },
    { name: 'Verde bottiglia caldo', hex: '#1A4818' },
    { name: 'Borgogna calda', hex: '#720828' },
    { name: 'Marrone scuro caldo', hex: '#3A1808' },
    { name: 'Verde oliva scuro', hex: '#3A4008' },
    { name: 'Senape scura', hex: '#A07820' },
  ]},
}

const SEASON_DATA: Record<string, SeasonInfo> = {
  Primavera: {
    accent: '#D4845A',
    light: '#FFF5EE',
    paper: '#FBF6EF',
    description: '',
    intro:
      "calore dorato, freschezza e luminosità. Hai capelli con riflessi ramati o dorati, occhi chiari o medi con pagliuzze d'oro, pelle luminosa con sottotono pesca-avorio. La tua forza è la vivacità calda e naturale.",
    neutrals: [
      { name: 'Avorio caldo', hex: '#FFF0C8' },
      { name: 'Beige luminoso', hex: '#F5DEB3' },
      { name: 'Cammello chiaro', hex: '#C19A6B' },
      { name: 'Champagne dorato', hex: '#F0C060' },
      { name: 'Caramello', hex: '#A66B30' },
      { name: 'Marrone caldo', hex: '#7A4830' },
      { name: 'Blu navy caldo', hex: '#2A3A5E' },
    ],
    avoidColors: [
      { name: 'Nero', hex: '#1A1A1A' },
      { name: 'Grigio freddo', hex: '#7D7D7D' },
      { name: 'Bianco puro', hex: '#F0F0F0' },
      { name: 'Blu navy freddo', hex: '#1B2A6B' },
      { name: 'Rosa freddo', hex: '#E8A0B4' },
      { name: 'Verde oliva freddo', hex: '#5A5A00' },
    ],
    makeup: [
      { label: 'Fondotinta', value: 'Base con sottotono giallo-pesca, formula leggera e luminosa. Evita formule con rosa o grigio.', colors: [
        { name: 'Avorio caldo', hex: '#FFF0C8' }, { name: 'Pesca chiaro', hex: '#FFDAB9' }, { name: 'Beige dorato', hex: '#E8C088' },
      ]},
      { label: 'Blush', value: 'Corallo, pesca, albicocca — sfumato sulle guance come un tocco di sole.', colors: [
        { name: 'Corallo', hex: '#FF6B47' }, { name: 'Pesca', hex: '#FFAE94' }, { name: 'Albicocca', hex: '#FFC890' },
      ]},
      { label: 'Illuminante', value: 'Oro champagne o pesca shimmer, valorizza la luminosità naturale.', colors: [
        { name: 'Champagne dorato', hex: '#F0C060' }, { name: 'Pesca shimmer', hex: '#FFDAB9' },
      ]},
      { label: 'Labbra', value: 'Corallo, pesca, rosa caldo, nude aranciato. Evita il rosso freddo.', colors: [
        { name: 'Corallo', hex: '#FF6B47' }, { name: 'Pesca', hex: '#FFAE94' }, { name: 'Rosa caldo', hex: '#FF9080' }, { name: 'Nude aranciato', hex: '#E0A088' },
      ]},
      { label: 'Occhi', value: 'Bronzo, oro, marrone caldo, verde muschio, rame. Eyeliner marrone invece del nero.', colors: [
        { name: 'Bronzo', hex: '#C07832' }, { name: 'Oro', hex: '#FFD700' }, { name: 'Marrone caldo', hex: '#7A4830' }, { name: 'Verde muschio', hex: '#506828' },
      ]},
    ],
    bookLink: 'https://www.amazon.it/Armocromia-Palette-Spring-Larmadio-primavera/dp/B0BW345QJC/',
    bookTitle: "Armocromia Palette Spring — L'armadio della primavera",
  },

  Estate: {
    accent: '#9B7FA6',
    light: '#F8F0FF',
    paper: '#F8F4F7',
    description: '',
    intro:
      "sottotoni freddi e rosati che esprimono un'eleganza eterea. I tuoi capelli vanno dal biondo cenere al castano freddo, gli occhi sono chiari o grigi-azzurri, la pelle ha un velo rosato. La tua forza è la sfumatura raffinata.",
    neutrals: [
      { name: 'Bianco panna freddo', hex: '#F0F0F8' },
      { name: 'Beige freddo', hex: '#E8E0D8' },
      { name: 'Grigio perla', hex: '#CCCCCC' },
      { name: 'Taupe freddo', hex: '#9A8E92' },
      { name: 'Grigio antracite', hex: '#5A5A66' },
      { name: 'Blu navy freddo', hex: '#2A3A5E' },
      { name: 'Nero soft', hex: '#2A2A30' },
    ],
    avoidColors: [
      { name: 'Arancio', hex: '#FF8C00' },
      { name: 'Giallo caldo', hex: '#E8B800' },
      { name: 'Rosso fuoco', hex: '#CC2200' },
      { name: 'Marrone caldo', hex: '#8B5C2A' },
      { name: 'Terracotta', hex: '#C66B2D' },
      { name: 'Senape', hex: '#D4A800' },
    ],
    makeup: [
      { label: 'Fondotinta', value: 'Base con sottotono rosa-freddo, finish satinato. Evita formule con giallo o bronzo.', colors: [
        { name: 'Rosa freddo chiaro', hex: '#F4C2C2' }, { name: 'Beige freddo', hex: '#E8E0D8' }, { name: 'Avorio rosato', hex: '#F0E0E0' },
      ]},
      { label: 'Blush', value: 'Rosa freddo, malva tenue, rosa antico — sfumato con mano leggerissima.', colors: [
        { name: 'Rosa freddo', hex: '#F4C2C2' }, { name: 'Malva', hex: '#D8A8D8' }, { name: 'Rosa antico', hex: '#C08888' },
      ]},
      { label: 'Illuminante', value: 'Perla fredda o rosa silver: aggiunge luce senza alterare il sottotono.', colors: [
        { name: 'Perla fredda', hex: '#E8E8F0' }, { name: 'Rosa silver', hex: '#E0C8D0' },
      ]},
      { label: 'Labbra', value: 'Rosa freddo, malva, nude rosato, prugna chiara. Evita nude caldi o arancio.', colors: [
        { name: 'Rosa freddo', hex: '#E08090' }, { name: 'Malva', hex: '#D8A8D8' }, { name: 'Nude rosato', hex: '#D8B0B8' }, { name: 'Prugna chiara', hex: '#C8A0C8' },
      ]},
      { label: 'Occhi', value: 'Grigio, malva, blu freddo, taupe rosato, prugna. Eyeliner grigio o blu midnight.', colors: [
        { name: 'Grigio', hex: '#9A9AA8' }, { name: 'Malva', hex: '#D8A8D8' }, { name: 'Blu freddo', hex: '#5878A8' }, { name: 'Prugna', hex: '#8C4A6E' },
      ]},
    ],
    bookLink: 'https://www.amazon.it/Armocromia-Palette-Summer-Larmadio-perfetto/dp/B0BKS91Y61/',
    bookTitle: "Armocromia Palette Summer — L'armadio perfetto",
  },

  Autunno: {
    accent: '#A0522D',
    light: '#FFF8F0',
    paper: '#FBF4EC',
    description: '',
    intro:
      "sottotoni caldi e dorati-arancio, di una bellezza ricca e terrosa. Hai capelli ramati, castani caldi o rossi, occhi marroni, verdi o ambra, pelle con sottotono caldo beige-giallino. La tua forza è la profondità naturale.",
    neutrals: [
      { name: 'Avorio caldo', hex: '#F5E6C8' },
      { name: 'Beige dorato', hex: '#D8B98C' },
      { name: 'Cammello', hex: '#B89060' },
      { name: 'Tabacco', hex: '#8F5A2A' },
      { name: 'Cacao', hex: '#6B3818' },
      { name: 'Testa di moro', hex: '#3A1F12' },
      { name: 'Blu notte', hex: '#0F1830' },
    ],
    avoidColors: [
      { name: 'Rosa freddo', hex: '#E8A0B4' },
      { name: 'Blu elettrico', hex: '#0050CC' },
      { name: 'Bianco puro', hex: '#F0F0F0' },
      { name: 'Grigio freddo', hex: '#7D7D7D' },
      { name: 'Fucsia freddo', hex: '#E800A0' },
      { name: 'Azzurro freddo', hex: '#8090D0' },
    ],
    makeup: [
      { label: 'Fondotinta', value: 'Base con sottotono arancio-dorato, formula ricca. Evita formule con rosa o beige freddo.', colors: [
        { name: 'Beige dorato', hex: '#D8B98C' }, { name: 'Avorio caldo', hex: '#F5E6C8' }, { name: 'Pesca caldo', hex: '#E8A878' },
      ]},
      { label: 'Blush', value: 'Terracotta, pesca caldo, rame, albicocca profonda — pennellata ampia sulla guancia.', colors: [
        { name: 'Terracotta', hex: '#C66B2D' }, { name: 'Pesca caldo', hex: '#E8A878' }, { name: 'Rame', hex: '#B86020' }, { name: 'Albicocca', hex: '#F09050' },
      ]},
      { label: 'Illuminante', value: 'Oro antico o bronzo: glow caldo e naturale.', colors: [
        { name: 'Oro antico', hex: '#C89030' }, { name: 'Bronzo', hex: '#C07832' },
      ]},
      { label: 'Labbra', value: 'Terracotta, bronzo, nude caldo, borgogna, mattone. Evita rosa freddo o rosso ciliegia.', colors: [
        { name: 'Terracotta', hex: '#C66B2D' }, { name: 'Bronzo', hex: '#C07832' }, { name: 'Nude caldo', hex: '#C89878' }, { name: 'Borgogna', hex: '#7A1E28' },
      ]},
      { label: 'Occhi', value: 'Bronzo, rame, verde muschio, marrone dorato, oro antico. Eyeliner marrone cioccolato.', colors: [
        { name: 'Bronzo', hex: '#C07832' }, { name: 'Rame', hex: '#B86020' }, { name: 'Verde muschio', hex: '#506828' }, { name: 'Oro antico', hex: '#C89030' },
      ]},
    ],
    bookLink: 'https://www.amazon.it/Armocromia-Palette-Autumn-Larmadio-perfetto/dp/B0BRZ7H2KX/',
    bookTitle: "Armocromia Palette Autumn — L'armadio perfetto",
  },

  Inverno: {
    accent: '#1A3A6E',
    light: '#F0F0FF',
    paper: '#F2F2F8',
    description: '',
    intro:
      "sottotoni freddi e neutri di grande contrasto. I tuoi capelli vanno dal nero corvino al castano fondente, gli occhi possono essere neri, castani, olivastri o blu/verdi intensi, la pelle è chiara o scura con sottotono rosato-freddo. Il contrasto è il tuo punto di forza.",
    neutrals: [
      { name: 'Bianco ottico', hex: '#F8F8FF' },
      { name: 'Grigio chiaro', hex: '#C8C8D0' },
      { name: 'Argento', hex: '#B8B8C8' },
      { name: 'Grigio antracite', hex: '#3A3A48' },
      { name: 'Nero puro', hex: '#0F0F12' },
      { name: 'Blu navy scuro', hex: '#0A1850' },
      { name: 'Marrone freddo scuro', hex: '#2A1F1F' },
    ],
    avoidColors: [
      { name: 'Arancio', hex: '#FF8C00' },
      { name: 'Beige caldo', hex: '#D4B896' },
      { name: 'Verde oliva', hex: '#6B6B00' },
      { name: 'Marrone caldo', hex: '#8B5C2A' },
      { name: 'Caramello', hex: '#C87832' },
      { name: 'Giallo caldo', hex: '#E8B800' },
    ],
    makeup: [
      { label: 'Fondotinta', value: 'Base con sottotono rosa-freddo o neutro, finish luminoso o satin.', colors: [
        { name: 'Rosa freddo chiaro', hex: '#F4C2C2' }, { name: 'Beige freddo', hex: '#E8E0D8' }, { name: 'Avorio rosato', hex: '#F0E0E0' },
      ]},
      { label: 'Blush', value: 'Rosa freddo intenso, lampone, prugna fredda — applicato con precisione.', colors: [
        { name: 'Rosa freddo intenso', hex: '#E04080' }, { name: 'Lampone', hex: '#C04068' }, { name: 'Prugna fredda', hex: '#8C4A6E' },
      ]},
      { label: 'Illuminante', value: "Argento o rosa ghiaccio: sottolinea la luminosità cristallina.", colors: [
        { name: 'Argento', hex: '#B8B8C8' }, { name: 'Rosa ghiaccio', hex: '#F0E0E8' },
      ]},
      { label: 'Labbra', value: 'Rosso freddo, rosa intenso, prugna, bordeaux, nude freddo. Il rosso classico è il tuo must.', colors: [
        { name: 'Rosso freddo', hex: '#CC0010' }, { name: 'Rosa intenso', hex: '#E0006C' }, { name: 'Prugna', hex: '#8C4A6E' }, { name: 'Bordeaux', hex: '#7A001E' },
      ]},
      { label: 'Occhi', value: "Nero, grigio antracite, blu intenso, viola, argento, bordeaux. L'eyeliner nero è il tuo alleato.", colors: [
        { name: 'Nero', hex: '#1A1A1A' }, { name: 'Antracite', hex: '#3A3A48' }, { name: 'Blu intenso', hex: '#3A5ACC' }, { name: 'Viola', hex: '#6A0080' },
      ]},
    ],
    bookLink: 'https://www.amazon.it/Armocromia-Palette-Winter-Larmadio-perfetto/dp/B0B4K1BXVF/',
    bookTitle: "Armocromia Palette Winter — L'armadio perfetto",
  },
}

const SEASON_ORDER = ['Primavera', 'Estate', 'Autunno', 'Inverno']

const SEASON_TO_ASSOLUTO: Record<string, string> = {
  Primavera: 'Primavera Assoluta',
  Estate: 'Estate Assoluta',
  Autunno: 'Autunno Assoluto',
  Inverno: 'Inverno Assoluto',
}

function normalizeSubgroup(subgroup: string | undefined, season: string): string {
  if (!subgroup) return SEASON_TO_ASSOLUTO[season] || season
  if (SEASON_TO_ASSOLUTO[subgroup]) return SEASON_TO_ASSOLUTO[subgroup]
  return subgroup
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ]
}
function lightenHex(hex: string, amount = 0.85): string {
  const [r, g, b] = hexToRgb(hex)
  const nr = Math.round(r + (255 - r) * amount)
  const ng = Math.round(g + (255 - g) * amount)
  const nb = Math.round(b + (255 - b) * amount)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}
function isLightColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex)
  return (r * 0.299 + g * 0.587 + b * 0.114) > 175
}

// ── INPUT ────────────────────────────────────────────────────────────────────
export interface PDFInput {
  customerName: string
  customerEmail: string
  season: string
  subgroup: string
  notes?: string
  photoPath?: string
}

// ── STILI ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#3A2E26',
    paddingTop: 28,
    paddingHorizontal: 28,
    paddingBottom: 36,
  },
  pageBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
  },
  cardTitle: {
    fontFamily: 'Cormorant',
    fontSize: 15,
    color: '#3A2E26',
    marginBottom: 8,
    fontWeight: 700,
  },
  smallLabel: {
    fontSize: 7,
    letterSpacing: 1.2,
    color: '#9A8B7E',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  swatchLabel: {
    fontSize: 6,
    color: '#7A6A5C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 3,
  },
  body: {
    fontSize: 9,
    color: '#5A4A40',
    lineHeight: 1.45,
  },
})

// ── ICONE SVG ────────────────────────────────────────────────────────────────
function SunIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={1.3} fill="none" />
      <G stroke={color} strokeWidth={1.3} strokeLinecap="round">
        <Path d="M12 3 V5.5" /><Path d="M12 18.5 V21" /><Path d="M3 12 H5.5" /><Path d="M18.5 12 H21" />
        <Path d="M5.6 5.6 L7.4 7.4" /><Path d="M16.6 16.6 L18.4 18.4" /><Path d="M18.4 5.6 L16.6 7.4" /><Path d="M7.4 16.6 L5.6 18.4" />
      </G>
    </Svg>
  )
}
function StarIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3 L14.5 9 L21 9.6 L16 13.8 L17.6 20 L12 16.6 L6.4 20 L8 13.8 L3 9.6 L9.5 9 Z" stroke={color} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
    </Svg>
  )
}
function HeartIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20 C12 20 4 14 4 9 C4 6 6 4 8.5 4 C10 4 11.5 5 12 6.5 C12.5 5 14 4 15.5 4 C18 4 20 6 20 9 C20 14 12 20 12 20 Z" stroke={color} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
    </Svg>
  )
}
function BanIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.3} fill="none" />
      <Path d="M6 6 L18 18" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  )
}
function PencilIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 4 L20 9 L8 21 L3 21 L3 16 Z" stroke={color} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
      <Path d="M13 6 L18 11" stroke={color} strokeWidth={1.3} />
    </Svg>
  )
}
function SparkleIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z" stroke={color} strokeWidth={1.2} fill="none" strokeLinejoin="round" />
    </Svg>
  )
}
function DropletIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3 C12 3 5 11 5 15 C5 19 8 22 12 22 C16 22 19 19 19 15 C19 11 12 3 12 3 Z" stroke={color} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
    </Svg>
  )
}
function GiftIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 10 H21 V21 H3 Z" stroke={color} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
      <Path d="M2 7 H22 V10 H2 Z" stroke={color} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
      <Path d="M12 7 V21" stroke={color} strokeWidth={1.4} />
      <Path d="M8 7 C8 4 10 3 12 5 C14 3 16 4 16 7" stroke={color} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
    </Svg>
  )
}

// ── HELPER COMPONENTI ────────────────────────────────────────────────────────
function Swatch({ color, w = 50, h = 50, labelSize = 6 }: { color: PaletteColor; w?: number; h?: number; labelSize?: number }) {
  return (
    <View style={{ alignItems: 'center', width: w + 14 }}>
      <View
        style={{
          width: w,
          height: h,
          borderRadius: 6,
          backgroundColor: color.hex,
          borderWidth: isLightColor(color.hex) ? 0.5 : 0,
          borderColor: '#E5D8C9',
        }}
      />
      <Text style={{ fontSize: labelSize, color: '#7A6A5C', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center', marginTop: 3 }}>
        {color.name}
      </Text>
    </View>
  )
}

function AvoidSwatch({ color, w = 50, h = 50 }: { color: PaletteColor; w?: number; h?: number }) {
  return (
    <View style={{ alignItems: 'center', width: w + 14 }}>
      <View
        style={{
          width: w,
          height: h,
          borderRadius: 6,
          backgroundColor: color.hex,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path d="M5 5 L19 19" stroke={isLightColor(color.hex) ? '#3A2E26' : '#FFFFFF'} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </View>
      <Text style={{ fontSize: 6, color: '#7A6A5C', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center', marginTop: 3 }}>{color.name}</Text>
    </View>
  )
}

function SeasonStrip({ seasonKey, isMatch }: { seasonKey: string; isMatch: boolean }) {
  // Mostro 10 colori della Palette Assoluta della stagione, ai colori originali (no opacity)
  const assoluto = SUBGROUP_DATA[SEASON_TO_ASSOLUTO[seasonKey]]
  const swatches = assoluto.palette.slice(0, 10)
  const accent = SEASON_DATA[seasonKey].accent
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, paddingVertical: 2 }}>
      <View style={{ width: 18, height: 18, marginRight: 6, justifyContent: 'center', alignItems: 'center' }}>
        {isMatch && (
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: accent, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={10} height={10} viewBox="0 0 24 24"><Polyline points="5,12 10,17 19,7" stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
          </View>
        )}
      </View>
      <View style={{ width: 80 }}>
        <Text style={{ fontFamily: 'Cormorant', fontSize: 11, color: isMatch ? accent : '#9A8B7E', fontWeight: 700, letterSpacing: 0.4 }}>
          {seasonKey.toUpperCase()}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexGrow: 1, gap: 2 }}>
        {swatches.map((c, i) => (
          <View
            key={i}
            style={{
              flexGrow: 1,
              height: 14,
              borderRadius: 3,
              backgroundColor: c.hex,
              borderWidth: isLightColor(c.hex) ? 0.4 : 0,
              borderColor: '#E5D8C9',
            }}
          />
        ))}
      </View>
    </View>
  )
}

// Logo wordmark testuale
function Logo({ size = 11 }: { size?: number }) {
  return (
    <Text style={{ fontFamily: 'Inter', fontSize: size, letterSpacing: 3, color: '#3A2E26', textAlign: 'center' }}>
      <Text style={{ fontWeight: 700 }}>YOU</Text>
      <Text style={{ fontWeight: 400 }}>GLAMOUR</Text>
    </Text>
  )
}

// ── PAGINA 1 — COPERTINA ─────────────────────────────────────────────────────
function PageCover({ data, input, subgroup, seasonKey, photo }: { data: SeasonInfo; input: PDFInput; subgroup: string; seasonKey: string; photo?: string }) {
  const sg = SUBGROUP_DATA[subgroup]
  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.pageBg, { backgroundColor: data.paper }]} />

      {/* Header row: foto + intro */}
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 10 }}>
        {/* Foto */}
        <View style={{ width: 180, height: 240, borderRadius: 10, overflow: 'hidden', backgroundColor: data.light, justifyContent: 'center', alignItems: 'center' }}>
          {photo ? (
            <Image src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Text style={{ fontFamily: 'Cormorant', fontSize: 70, color: data.accent }}>
              {input.customerName.charAt(0)}
            </Text>
          )}
        </View>

        {/* Header dx */}
        <View style={{ flex: 1, paddingTop: 4 }}>
          <View style={{ marginBottom: 6 }}><Logo size={10} /></View>
          <Text style={{ fontFamily: 'Cormorant', fontSize: 34, color: '#3A2E26', textAlign: 'center', lineHeight: 1, marginTop: 2 }}>
            Armocromia
          </Text>
          <Text style={{ fontFamily: 'Cormorant', fontSize: 28, fontStyle: 'italic', color: '#3A2E26', textAlign: 'center', lineHeight: 1.05 }}>
            personale
          </Text>
          <View style={{ height: 8 }} />
          <Text style={{ fontFamily: 'Cormorant', fontSize: 11, color: '#5A4A40', textAlign: 'center', lineHeight: 1.45, fontStyle: 'italic' }}>
            Appartieni alla stagione <Text style={{ color: data.accent, fontWeight: 700, fontStyle: 'normal' }}>{seasonKey}</Text>, caratterizzata da {data.intro}
          </Text>
        </View>
      </View>

      {/* Il tuo sottogruppo — signature + descrizione + caratteristiche + stagione di confine */}
      <View style={[styles.card, { marginBottom: 10, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }]}>
        <View style={{ alignItems: 'center', width: 110 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: sg.signature, borderWidth: isLightColor(sg.signature) ? 0.5 : 0, borderColor: '#E5D8C9' }} />
          <Text style={{ fontFamily: 'Cormorant', fontSize: 14, color: data.accent, fontWeight: 700, marginTop: 6, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {subgroup}
          </Text>
          {SUBGROUP_NEIGHBORS[subgroup] && (
            <View style={{ marginTop: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 6, letterSpacing: 0.8, color: '#9A8B7E', textTransform: 'uppercase' }}>Confina con</Text>
              <Text style={{ fontFamily: 'Cormorant', fontSize: 10, color: '#5A4A40', fontStyle: 'italic', marginTop: 1, textAlign: 'center' }}>
                {SUBGROUP_NEIGHBORS[subgroup].label}
              </Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.smallLabel}>Il tuo sottogruppo</Text>
          <Text style={{ fontSize: 8.5, color: '#5A4A40', lineHeight: 1.45, marginTop: 6 }}>
            {SUBGROUP_DESCRIPTIONS[subgroup] || ''}
          </Text>
          <View style={{ marginTop: 6 }}>
            {sg.caratteristiche.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: data.accent, marginTop: 5, marginRight: 5 }} />
                <Text style={{ fontSize: 8.5, color: '#5A4A40', lineHeight: 1.4, flex: 1 }}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Migliori colori (12 dalla palette sottogruppo) */}
      <View style={[styles.card, { marginBottom: 10 }]}>
        <Text style={styles.cardTitle}>Migliori colori</Text>
        <Text style={{ fontSize: 8, color: '#7A6A5C', marginBottom: 8, lineHeight: 1.4 }}>
          I 12 colori che valorizzano di più il tuo sottogruppo, pescati dalla palette {seasonKey}.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'space-between' }}>
          {sg.palette.map((c, i) => (
            <Swatch key={i} color={c} w={62} h={36} labelSize={5.5} />
          ))}
        </View>
      </View>

      {/* Migliori neutri */}
      <View style={[styles.card]}>
        <Text style={styles.cardTitle}>Migliori neutri</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {data.neutrals.map((c, i) => (
            <Swatch key={i} color={c} w={58} h={36} />
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 16, left: 28, right: 28, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 7, color: '#B0A496', letterSpacing: 1 }}>youglamour.it</Text>
        <Text style={{ fontSize: 7, color: '#B0A496', letterSpacing: 1 }}>
          {input.customerName.toUpperCase()} · {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
        </Text>
      </View>
    </Page>
  )
}

// SUBGROUP_DESCRIPTIONS: paragrafo descrittivo completo per sottogruppo
const SUBGROUP_DESCRIPTIONS: Record<string, string> = {
  'Primavera Assoluta':
    "La Primavera Assoluta è la versione più rappresentativa della stagione: sottotono caldo dorato in perfetto equilibrio, capelli con riflessi ramati o biondi dorati, occhi limpidi attraversati da pagliuzze d'oro. I tuoi colori si esprimono nei toni caldi e luminosi al massimo dell'armonia: corallo, pesca, oro, turchese caldo, verde lime. La tua bellezza è solare, viva, naturalmente equilibrata.",
  'Spring Light':
    "La Spring Light è la Primavera più chiara e delicata. Il sottotono caldo è presente ma molto sfumato: capelli biondo dorato o castano chiaro, occhi limpidi con riflessi dorati, incarnato chiarissimo. Il contrasto naturale è basso, quasi acquerellato. I tuoi colori migliori sono i pastelli caldi — pesca chiaro, corallo tenue, verde acqua, lavanda bianca. La tua forza è la luminosità eterea, mai il contrasto drammatico.",
  'Spring Warm':
    "La Spring Warm è la Primavera che tende verso l'Autunno. Il sottotono caldo è più profondo, dorato-ramato deciso: capelli con riflessi ramati intensi, occhi castani caldi o nocciola, incarnato con sottotono dorato visibile. Puoi gestire colori terrosi senza appesantirti — terracotta, cammello, verde cachi, bronzo. È il sottogruppo più ricco della Primavera, dove tessuti strutturati e fluidi convivono.",
  'Spring Bright':
    "La Spring Bright è la Primavera che tende verso l'Inverno. Mantieni il sottotono caldo, ma con una chiarezza cristallina e un contrasto più marcato del solito: occhi limpidi e brillanti, pelle luminosa, capelli castano dorato. I tuoi colori migliori sono vividi e accesi senza diventare freddi — corallo brillante, turchese vivido, fucsia caldo. Fuggi i toni smorzati: spengono la tua nitidezza naturale.",
  'Estate Assoluta':
    "L'Estate Assoluta è la versione più classica della stagione fredda chiara, con sottotono freddo-rosato in perfetto equilibrio. Capelli biondo cenere o castano freddo, occhi grigio-azzurri, incarnato con velo rosato. Il contrasto naturale è basso e armonioso. I tuoi colori migliori sono i toni freddi morbidi: malva, lavanda, rosa cipria, azzurro nebbia, verde salvia. La tua eleganza è quella della sfumatura, mai del contrasto netto.",
  'Summer Light':
    "La Summer Light è l'Estate più chiara e luminosa, con un sottotono freddo delicatissimo. Capelli biondo cenere chiarissimo, occhi azzurri o grigio-verdi, pelle quasi traslucida. Il contrasto è bassissimo, tutto giocato sulla trasparenza dei colori. I tuoi colori migliori sono i pastelli freddi al massimo della chiarezza: rosa cipria, lavanda bianca, azzurro latte, verde menta freddo. La tua forza è la leggerezza poetica.",
  'Summer Soft':
    "La Summer Soft è l'Estate che tende verso l'Autunno. Mantieni il sottotono freddo, ma in una versione smorzata e vellutata. Capelli castano cenere o biondo scuro freddo, occhi grigi o verdi tenui, incarnato con velo rosato attenuato. I tuoi colori migliori sono i neutri freddi smorzati: malva polveroso, grigio tortora, verde salvia, taupe. Hai una qualità vellutata, profonda e raffinata insieme.",
  'Summer Cool':
    "La Summer Cool è l'Estate che tende verso l'Inverno. Il sottotono freddo si fa più deciso, con un contrasto naturale più marcato rispetto alle altre Estati. Capelli castano freddo, occhi azzurri intensi o grigi, pelle con velo rosato evidente. Puoi gestire colori freddi più profondi mantenendo la tua morbidezza: prugna, blu periwinkle, bordeaux rosato. È l'Estate con più carattere, un contrasto armonioso ma riconoscibile.",
  'Autunno Assoluto':
    "L'Autunno Assoluto è la versione più opulenta della stagione, con sottotono caldo dorato-aranciato in perfetto equilibrio. Capelli ramati, castano caldo o rossi, occhi marroni caldi, verdi o ambra, incarnato dorato/olivastro. I tuoi colori sono i toni terrosi al massimo della loro intensità: ruggine, senape, verde foresta, cammello, bronzo. La tua bellezza è ricca, naturale, magnetica — i colori freddi o troppo brillanti la smorzano.",
  'Autumn Soft':
    "L'Autumn Soft è l'Autunno che tende verso l'Estate. Mantieni il sottotono caldo, ma più smorzato e velato. Capelli castano caldo cenere o biondo scuro caldo, occhi marroni soft o verdi attenuati, incarnato con sottotono dorato tenue. Il contrasto è basso e sfumato. I tuoi colori migliori sono i neutri caldi: bronzo antico, cammello, salvia calda, malva polveroso. La tua forza è la profondità morbida.",
  'Autumn Warm':
    "L'Autumn Warm è l'Autunno che tende verso la Primavera. Mantieni il sottotono caldo, ma con una luminosità più viva e dorata. Capelli ramati luminosi o castano-rosso, occhi nocciola o verdi caldi, pelle visibilmente dorata. I tuoi colori migliori sono caldi e luminosi: pesca caldo, caramello, oro vivo, verde lime caldo, corallo caldo. Sei l'Autunno più solare, puoi osare toni più accesi rimanendo nel caldo.",
  'Autumn Deep':
    "L'Autumn Deep è l'Autunno più profondo e intenso, con un contrasto naturale più marcato rispetto agli altri sottogruppi della stagione. Sottotono caldo deciso: capelli castano scuro o quasi neri con riflessi caldi, occhi marroni intensi, incarnato dorato/olivastro. La tua palette si esprime nei colori profondi e ricchi: bordeaux scuro, cioccolato, verde bottiglia, prugna calda. La profondità del tuo viso ti permette di portare anche i toni più intensi senza essere sopraffatta.",
  'Inverno Assoluto':
    "L'Inverno Assoluto è la versione più classica e drammatica della stagione fredda profonda. Sottotono freddo neutro o rosato netto, contrasto naturale alto: capelli neri o castano scurissimo, occhi neri o intensi (castani, blu o verdi vividi), pelle chiara con sottotono freddo. I tuoi colori sono i toni puri al massimo dell'intensità: bianco ottico, nero, rosso, blu royal, smeraldo, fucsia. La tua bellezza vive di contrasti netti.",
  'Winter Cool':
    "Il Winter Cool è l'Inverno che tende verso l'Estate. Mantieni il sottotono freddo, ma con una luminosità più morbida e meno drammatica. Capelli castano cenere o castano scuro freddo, occhi grigio-azzurri o verdi freddi, incarnato con sottotono rosato delicato. Il contrasto è medio, mai estremo. I tuoi colori migliori sono i toni freddi delicati: azzurro ghiaccio, malva freddo, prugna chiara, rosso carminio.",
  'Winter Bright':
    "Il Winter Bright è l'Inverno che tende verso la Primavera. Mantieni il sottotono freddo e il contrasto alto, con una chiarezza cristallina e una luminosità nitida. Capelli castano scuro o neri brillanti, occhi limpidi e vividi (blu, verdi o castani intensi), pelle luminosa con sottotono freddo. I tuoi colori migliori sono vividi e brillanti: fucsia, verde smeraldo, turchese elettrico, lime brillante. I toni smorzati spengono la tua brillantezza.",
  'Winter Deep':
    "Il Winter Deep è l'Inverno più profondo e magnetico, particolarmente diffuso nelle bellezze mediterranee. Sottotono freddo o neutro, contrasto naturale alto giocato sulla profondità. Capelli nero corvino, occhi neri o castano scurissimi, pelle olivastra o ambrata con sottotono rosato-freddo. I tuoi colori migliori sono i toni profondi e intensi: nero, bordeaux scuro, blu notte, verde smeraldo scuro, viola. I toni caldi terrosi ti fanno apparire spenta.",
}

// ── PAGINA 2 — PALETTE COMPLETA + CONFRONTO + PRESTITO + EVITA ──────────────
function PagePalette({ data, subgroup, seasonKey }: { data: SeasonInfo; subgroup: string; seasonKey: string }) {
  const neighbor = SUBGROUP_NEIGHBORS[subgroup]
  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.pageBg, { backgroundColor: data.paper }]} />

      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontFamily: 'Cormorant', fontSize: 26, color: '#3A2E26', fontWeight: 700 }}>La tua palette</Text>
        <Text style={{ fontFamily: 'Cormorant', fontSize: 18, color: data.accent, fontStyle: 'italic' }}>{subgroup}</Text>
      </View>

      {/* Confronto stagioni — strisce con check */}
      <View style={[styles.card, { marginBottom: 8 }]}>
        <Text style={styles.cardTitle}>Confronto con le altre stagioni</Text>
        <Text style={{ fontSize: 8, color: '#7A6A5C', marginBottom: 6, lineHeight: 1.4 }}>
          Le quattro palette stagionali a confronto. La tua è quella evidenziata.
        </Text>
        {SEASON_ORDER.map((s) => (
          <SeasonStrip key={s} seasonKey={s} isMatch={s === seasonKey} />
        ))}
      </View>

      {/* Colori in prestito + Colori da evitare */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {neighbor && (
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Colori in prestito</Text>
            <Text style={{ fontSize: 7.5, color: '#7A6A5C', marginBottom: 6 }}>Dal sottogruppo confinante: <Text style={{ fontFamily: 'Cormorant', color: data.accent, fontWeight: 700 }}>{neighbor.label}</Text></Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 6 }}>
              {neighbor.colors.slice(0, 6).map((c, i) => (
                <Swatch key={i} color={c} w={44} h={32} />
              ))}
            </View>
          </View>
        )}
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.cardTitle}>Colori da evitare</Text>
          <Text style={{ fontSize: 7.5, color: '#7A6A5C', marginBottom: 6 }}>Spengono la tua luminosità naturale.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 6 }}>
            {data.avoidColors.slice(0, 6).map((c, i) => (
              <AvoidSwatch key={i} color={c} w={44} h={32} />
            ))}
          </View>
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 16, left: 28, right: 28, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 7, color: '#B0A496', letterSpacing: 1 }}>youglamour.it</Text>
        <Text style={{ fontSize: 7, color: '#B0A496', letterSpacing: 1 }}>La tua palette</Text>
      </View>
    </Page>
  )
}

// ── PAGINA 3 — GUIDA RAPIDA + ACCOSTAMENTI ──────────────────────────────────
function PageGuide({ data, subgroup }: { data: SeasonInfo; subgroup: string }) {
  const copy = SUBGROUP_COPY[subgroup]
  const sg = SUBGROUP_DATA[subgroup]

  const block = (title: string, Icon: React.ComponentType<{ color: string; size?: number }>, items: string[]) => (
    <View style={[styles.card, { flex: 1 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 }}>
        <Icon color={data.accent} size={16} />
        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#3A2E26', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</Text>
      </View>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: data.accent, marginTop: 5, marginRight: 5 }} />
          <Text style={{ flex: 1, fontSize: 8, color: '#5A4A40', lineHeight: 1.4 }}>{it}</Text>
        </View>
      ))}
    </View>
  )

  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.pageBg, { backgroundColor: data.paper }]} />

      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontFamily: 'Cormorant', fontSize: 26, color: '#3A2E26', fontWeight: 700 }}>Guida rapida</Text>
        <Text style={{ fontSize: 8.5, color: '#7A6A5C', marginTop: 2 }}>Il profilo del tuo sottogruppo, in sintesi</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {block('Punti di forza', StarIcon, copy.strengths)}
        {block('Cosa valorizza', HeartIcon, copy.valorizza)}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {block('Colori da evitare', BanIcon, copy.evita)}
        {block('Consigli di stile', PencilIcon, copy.stileAdvice)}
      </View>

      {/* Accostamenti colori */}
      <View style={[styles.card]}>
        <Text style={styles.cardTitle}>Accostamenti perfetti</Text>
        <Text style={{ fontSize: 8, color: '#7A6A5C', marginBottom: 8 }}>
          La formula per un outfit armonioso: 3 colori base, 2 neutri, 4 colori extra come accento.
        </Text>

        {/* Palette accostamenti: 3+2+4 in linea fissa, no wrap */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <View style={{ flex: 3 }}>
            <Text style={[styles.smallLabel, { marginBottom: 5 }]}>3 colori base</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {sg.accostamenti.base.map((c, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ width: '100%', height: 28, borderRadius: 5, backgroundColor: c.hex, borderWidth: isLightColor(c.hex) ? 0.4 : 0, borderColor: '#E5D8C9' }} />
                  <Text style={{ fontSize: 5.5, color: '#7A6A5C', textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center', marginTop: 2 }}>{c.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flex: 2 }}>
            <Text style={[styles.smallLabel, { marginBottom: 5 }]}>2 neutri</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {sg.accostamenti.neutri.map((c, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ width: '100%', height: 28, borderRadius: 5, backgroundColor: c.hex, borderWidth: isLightColor(c.hex) ? 0.4 : 0, borderColor: '#E5D8C9' }} />
                  <Text style={{ fontSize: 5.5, color: '#7A6A5C', textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center', marginTop: 2 }}>{c.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flex: 4 }}>
            <Text style={[styles.smallLabel, { marginBottom: 5 }]}>4 colori extra</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {sg.accostamenti.extra.map((c, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ width: '100%', height: 28, borderRadius: 5, backgroundColor: c.hex, borderWidth: isLightColor(c.hex) ? 0.4 : 0, borderColor: '#E5D8C9' }} />
                  <Text style={{ fontSize: 5.5, color: '#7A6A5C', textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center', marginTop: 2 }}>{c.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Esempi visivi di abbinamenti — 4 outfit */}
        <View style={{ height: 0.5, backgroundColor: '#E5D8C9', marginBottom: 10 }} />
        <Text style={[styles.smallLabel, { marginBottom: 6 }]}>4 esempi di abbinamento</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[
            { name: 'Classico', colors: [sg.accostamenti.base[0], sg.accostamenti.neutri[0], sg.accostamenti.extra[0]] },
            { name: 'Morbido', colors: [sg.accostamenti.neutri[0], sg.accostamenti.neutri[1], sg.accostamenti.base[1]] },
            { name: 'Acceso', colors: [sg.accostamenti.base[0], sg.accostamenti.base[1], sg.accostamenti.base[2]] },
            { name: 'Sera', colors: [sg.accostamenti.base[2], sg.accostamenti.extra[2], sg.accostamenti.neutri[1]] },
          ].map((combo, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: '#FBF9F4', borderRadius: 6, padding: 6, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Cormorant', fontSize: 11, color: data.accent, fontWeight: 700, marginBottom: 4 }}>{combo.name}</Text>
              <View style={{ flexDirection: 'row', borderRadius: 4, overflow: 'hidden', width: '100%', height: 36 }}>
                {combo.colors.map((c, j) => (
                  <View key={j} style={{ flex: 1, backgroundColor: c.hex, borderWidth: isLightColor(c.hex) ? 0.4 : 0, borderColor: '#E5D8C9' }} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 16, left: 28, right: 28, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 7, color: '#B0A496', letterSpacing: 1 }}>youglamour.it</Text>
        <Text style={{ fontSize: 7, color: '#B0A496', letterSpacing: 1 }}>Guida rapida</Text>
      </View>
    </Page>
  )
}

// ── PAGINA 4 — BONUS: MAKE-UP + SMALTI ──────────────────────────────────────
function PageBonus({ data, subgroup }: { data: SeasonInfo; subgroup: string }) {
  const sg = SUBGROUP_DATA[subgroup]
  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.pageBg, { backgroundColor: data.paper }]} />

      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <GiftIcon color={data.accent} size={22} />
          <View style={{ backgroundColor: data.accent, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10 }}>
            <Text style={{ fontSize: 7, letterSpacing: 1.8, color: '#FFFFFF', fontWeight: 700 }}>DOPPIO BONUS PER TE</Text>
          </View>
          <GiftIcon color={data.accent} size={22} />
        </View>
        <Text style={{ fontFamily: 'Cormorant', fontSize: 26, color: '#3A2E26', fontWeight: 700 }}>Make-up &amp; Smalti</Text>
        <Text style={{ fontFamily: 'Cormorant', fontSize: 12, color: '#7A6A5C', marginTop: 4, textAlign: 'center', fontStyle: 'italic', maxWidth: 380 }}>
          Sapevi del make-up... ma lo smalto è il regalo che non ti aspettavi.
        </Text>
      </View>

      {/* Make-up — layout a 2 colonne */}
      <View style={[styles.card, { marginBottom: 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
          <SparkleIcon color={data.accent} size={16} />
          <Text style={styles.cardTitle}>Il tuo make-up</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {data.makeup.map((m, i) => (
            <View key={i} style={{ width: '48%', marginBottom: 8, backgroundColor: '#FBF9F4', borderRadius: 6, padding: 8 }}>
              <Text style={[styles.smallLabel, { color: data.accent }]}>{m.label}</Text>
              <Text style={{ fontSize: 8, color: '#5A4A40', lineHeight: 1.4, marginTop: 3, marginBottom: 6 }}>{m.value}</Text>
              <View style={{ flexDirection: 'row', gap: 3 }}>
                {m.colors.map((c, j) => (
                  <View key={j} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ width: '100%', height: 18, borderRadius: 3, backgroundColor: c.hex, borderWidth: isLightColor(c.hex) ? 0.4 : 0, borderColor: '#E5D8C9' }} />
                    <Text style={{ fontSize: 5, color: '#7A6A5C', textTransform: 'uppercase', letterSpacing: 0.2, textAlign: 'center', marginTop: 2 }}>{c.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Smalti */}
      <View style={[styles.card]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 }}>
          <DropletIcon color={data.accent} size={16} />
          <Text style={styles.cardTitle}>Lo smalto perfetto</Text>
        </View>
        <Text style={{ fontSize: 8.5, color: '#5A4A40', lineHeight: 1.45, marginBottom: 10 }}>{sg.smaltiIntro}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {sg.smalti.map((c, i) => (
            <Swatch key={i} color={c} w={60} h={40} />
          ))}
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 16, left: 28, right: 28, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 7, color: '#B0A496', letterSpacing: 1 }}>youglamour.it</Text>
        <Text style={{ fontSize: 7, color: '#B0A496', letterSpacing: 1 }}>Bonus</Text>
      </View>
    </Page>
  )
}

// ── PAGINA 5 — CHIUSURA ─────────────────────────────────────────────────────
function PageClosing({ data, input, subgroup }: { data: SeasonInfo; input: PDFInput; subgroup: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.pageBg, { backgroundColor: data.paper }]} />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
        <Text style={{ fontFamily: 'Cormorant', fontSize: 34, color: data.accent, textAlign: 'center', marginBottom: 12 }}>
          Ciao, {input.customerName}
        </Text>
        <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 15, color: '#5A4A40', textAlign: 'center', lineHeight: 1.5, marginBottom: 26, maxWidth: 380 }}>
          La bellezza è equilibrio, non regola. Usa il colore come un alleato, non come un limite.
        </Text>

        <View style={[styles.card, { width: '80%', alignItems: 'center', paddingVertical: 22, borderWidth: 0.8, borderColor: data.accent }]}>
          <Text style={[styles.smallLabel]}>Il tuo profilo</Text>
          <Text style={{ fontFamily: 'Cormorant', fontSize: 22, color: data.accent, fontWeight: 700, marginTop: 6 }}>{subgroup}</Text>
          <Text style={{ fontSize: 10, color: '#7A6A5C', marginTop: 6 }}>{input.customerName}</Text>
          <Text style={{ fontSize: 8, color: '#B0A496', marginTop: 4 }}>
            {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <View style={{ marginTop: 26, alignItems: 'center' }}>
          <Text style={[styles.smallLabel, { textAlign: 'center' }]}>Approfondisci</Text>
          <Text style={{ fontSize: 9.5, color: '#5A4A40', marginTop: 6, textAlign: 'center' }}>Il libro della tua stagione:</Text>
          <Link src={data.bookLink} style={{ fontFamily: 'Cormorant', fontSize: 13, color: data.accent, marginTop: 4, textAlign: 'center' }}>
            {data.bookTitle}
          </Link>
        </View>

        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, color: '#9A8B7E' }}>Hai domande? Scrivici a</Text>
          <Link src="mailto:veronica@youglamour.it" style={{ fontFamily: 'Cormorant', fontSize: 14, color: data.accent, marginTop: 4 }}>
            veronica@youglamour.it
          </Link>
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 16, left: 28, right: 28, flexDirection: 'row', justifyContent: 'center' }}>
        <Text style={{ fontSize: 7, color: '#B0A496', letterSpacing: 1.5 }}>YOUGLAMOUR.IT · ANALISI ARMOCROMIA PERSONALIZZATA</Text>
      </View>
    </Page>
  )
}

// ── DOCUMENT ─────────────────────────────────────────────────────────────────
function ArmocromiaDocument({ input }: { input: PDFInput }) {
  const subgroup = normalizeSubgroup(input.subgroup, input.season)
  const seasonKey =
    Object.keys(SEASON_DATA).find(
      (k) =>
        input.season.toLowerCase().includes(k.toLowerCase()) ||
        subgroup.toLowerCase().includes(k.toLowerCase()),
    ) || 'Primavera'
  const data = SEASON_DATA[seasonKey]

  let photo: string | undefined
  if (input.photoPath && fs.existsSync(input.photoPath)) {
    try {
      const buf = fs.readFileSync(input.photoPath)
      const ext = path.extname(input.photoPath).slice(1).toLowerCase() || 'jpeg'
      const mime = ext === 'jpg' ? 'jpeg' : ext
      photo = `data:image/${mime};base64,${buf.toString('base64')}`
    } catch (e) {
      console.error('photo embed failed:', e)
    }
  }

  return (
    <Document title="Analisi Armocromia Personalizzata" author="youglamour.it">
      <PageCover data={data} input={input} subgroup={subgroup} seasonKey={seasonKey} photo={photo} />
      <PagePalette data={data} subgroup={subgroup} seasonKey={seasonKey} />
      <PageGuide data={data} subgroup={subgroup} />
      <PageBonus data={data} subgroup={subgroup} />
      <PageClosing data={data} input={input} subgroup={subgroup} />
    </Document>
  )
}

export async function generatePDF(input: PDFInput): Promise<Buffer> {
  const stream = await renderToBuffer(<ArmocromiaDocument input={input} />)
  return stream as Buffer
}
