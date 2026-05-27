/**
 * Dati specifici per ciascuno dei 16 sottogruppi armocromia.
 * - signature: colore più rappresentativo (usato come cerchio identitario)
 * - caratteristiche: 3-4 bullet che descrivono il sottogruppo
 * - palette: 12 colori specifici (parzialmente in comune con la stagione, parzialmente unici)
 * - accostamenti: 3 base + 2 neutri + 4 extra per ispirare combinazioni outfit
 * - smalti: 6 colori smalto consigliati
 * - smaltiIntro: 1-2 frasi che spiegano la scelta degli smalti
 */

export interface PaletteColor {
  name: string
  hex: string
}

export interface SubgroupData {
  signature: string
  caratteristiche: string[]
  palette: PaletteColor[]
  accostamenti: {
    base: PaletteColor[]
    neutri: PaletteColor[]
    extra: PaletteColor[]
  }
  smalti: PaletteColor[]
  smaltiIntro: string
}

export const SUBGROUP_DATA: Record<string, SubgroupData> = {
  // ── PRIMAVERA ──────────────────────────────────────────────────────────────
  'Primavera Assoluta': {
    signature: '#FF8C42',
    caratteristiche: [
      'Sottotono caldo dorato in perfetto equilibrio',
      'Luminosità vivace e naturale',
      'Contrasto medio-alto tra pelle, occhi e capelli',
      'Energia solare e giocosa',
    ],
    palette: [
      { name: 'Corallo', hex: '#FF6B47' },
      { name: 'Pesca', hex: '#FFAE94' },
      { name: 'Salmone', hex: '#FA8072' },
      { name: 'Arancio caldo', hex: '#FF8C00' },
      { name: 'Turchese caldo', hex: '#40E0D0' },
      { name: 'Verde mela', hex: '#8DB600' },
      { name: 'Oro vivo', hex: '#FFD700' },
      { name: 'Giallo caldo', hex: '#F8C040' },
      { name: 'Verde acqua caldo', hex: '#40C8B0' },
      { name: 'Rosa corallo', hex: '#F88070' },
      { name: 'Avorio caldo', hex: '#FFF0C8' },
      { name: 'Caramello', hex: '#C19A6B' },
    ],
    accostamenti: {
      base: [
        { name: 'Corallo', hex: '#FF6B47' },
        { name: 'Turchese caldo', hex: '#40E0D0' },
        { name: 'Oro vivo', hex: '#FFD700' },
      ],
      neutri: [
        { name: 'Avorio caldo', hex: '#FFF0C8' },
        { name: 'Cammello', hex: '#C19A6B' },
      ],
      extra: [
        { name: 'Verde mela', hex: '#8DB600' },
        { name: 'Pesca', hex: '#FFAE94' },
        { name: 'Champagne dorato', hex: '#F0C060' },
        { name: 'Caramello', hex: '#A66B30' },
      ],
    },
    smalti: [
      { name: 'Corallo brillante', hex: '#FF6B47' },
      { name: 'Pesca dorato', hex: '#FFAE94' },
      { name: 'Oro champagne', hex: '#E8C470' },
      { name: 'Rosa pesca', hex: '#FFB890' },
      { name: 'Nude caldo', hex: '#E0B898' },
      { name: 'Verde menta caldo', hex: '#A8D8B8' },
    ],
    smaltiIntro:
      'Smalti caldi e luminosi che valorizzano la tua mano: nude pesca, corallo brillante, oro champagne. Evita rossi freddi e bordeaux.',
  },

  'Spring Light': {
    signature: '#FFCBA4',
    caratteristiche: [
      'Sottotono caldo delicato e luminoso',
      'Colorazione chiara con leggera dorato',
      'Contrasto basso, tutto in sfumatura',
      'Freschezza eterea e leggera',
    ],
    palette: [
      { name: 'Pesca chiaro', hex: '#FFDAB9' },
      { name: 'Corallo tenue', hex: '#FFA08C' },
      { name: 'Albicocca', hex: '#FFC890' },
      { name: 'Giallo crema', hex: '#FFF0B8' },
      { name: 'Verde acqua', hex: '#A8E0C8' },
      { name: 'Azzurro caldo', hex: '#B8DCE8' },
      { name: 'Rosa cipria caldo', hex: '#FFCCD0' },
      { name: 'Salmone chiaro', hex: '#FFB0A0' },
      { name: 'Verde lime chiaro', hex: '#C8E090' },
      { name: 'Oro chiaro', hex: '#F0D880' },
      { name: 'Avorio caldo', hex: '#FFF6E0' },
      { name: 'Beige luminoso', hex: '#F5DEB3' },
    ],
    accostamenti: {
      base: [
        { name: 'Pesca chiaro', hex: '#FFDAB9' },
        { name: 'Verde acqua', hex: '#A8E0C8' },
        { name: 'Corallo tenue', hex: '#FFA08C' },
      ],
      neutri: [
        { name: 'Avorio caldo', hex: '#FFF6E0' },
        { name: 'Beige luminoso', hex: '#F5DEB3' },
      ],
      extra: [
        { name: 'Albicocca', hex: '#FFC890' },
        { name: 'Azzurro caldo', hex: '#B8DCE8' },
        { name: 'Giallo crema', hex: '#FFF0B8' },
        { name: 'Rosa cipria caldo', hex: '#FFCCD0' },
      ],
    },
    smalti: [
      { name: 'Pesca soft', hex: '#FFCBA4' },
      { name: 'Nude rosato caldo', hex: '#E8C0B0' },
      { name: 'Corallo tenue', hex: '#FFA08C' },
      { name: 'Beige cremoso', hex: '#F0DCC0' },
      { name: 'Rosa cipria caldo', hex: '#FFCCD0' },
      { name: 'Verde acqua chiaro', hex: '#A8E0C8' },
    ],
    smaltiIntro:
      'I tuoi smalti perfetti sono leggeri, luminosi e dolci: pesca tenue, nude caldo, corallo soft. Stop ai colori scuri o troppo saturi.',
  },

  'Spring Warm': {
    signature: '#D07850',
    caratteristiche: [
      'Sottotono caldo dorato/ramato deciso',
      'Tendenza ai toni terrosi (verso Autunno)',
      'Capacità di portare colori caldi più profondi',
      'Calore ricco e accogliente',
    ],
    palette: [
      { name: 'Terracotta', hex: '#D07850' },
      { name: 'Cammello', hex: '#C19A6B' },
      { name: 'Verde cachi', hex: '#A8A050' },
      { name: 'Bronzo chiaro', hex: '#C89850' },
      { name: 'Caramello', hex: '#B57838' },
      { name: 'Salmone caldo', hex: '#F8A080' },
      { name: 'Verde lime caldo', hex: '#A8D050' },
      { name: 'Senape caldo', hex: '#E0B040' },
      { name: 'Avorio caldo', hex: '#FFF0C8' },
      { name: 'Pesca dorato', hex: '#FFB880' },
      { name: 'Oro antico', hex: '#C89030' },
      { name: 'Rosso mattone', hex: '#B05028' },
    ],
    accostamenti: {
      base: [
        { name: 'Terracotta', hex: '#D07850' },
        { name: 'Verde cachi', hex: '#A8A050' },
        { name: 'Senape caldo', hex: '#E0B040' },
      ],
      neutri: [
        { name: 'Avorio caldo', hex: '#FFF0C8' },
        { name: 'Cammello', hex: '#C19A6B' },
      ],
      extra: [
        { name: 'Bronzo chiaro', hex: '#C89850' },
        { name: 'Salmone caldo', hex: '#F8A080' },
        { name: 'Caramello', hex: '#B57838' },
        { name: 'Rosso mattone', hex: '#B05028' },
      ],
    },
    smalti: [
      { name: 'Terracotta', hex: '#D07850' },
      { name: 'Bronzo', hex: '#C07832' },
      { name: 'Caramello', hex: '#B57838' },
      { name: 'Nude caldo terra', hex: '#C89878' },
      { name: 'Oro antico', hex: '#C89030' },
      { name: 'Verde cachi', hex: '#A8A050' },
    ],
    smaltiIntro:
      'Smalti dai toni terra e bronzo che dialogano con il tuo sottotono caldo: terracotta, caramello, oro antico. Evita rosa freddi e argento.',
  },

  'Spring Bright': {
    signature: '#FF4830',
    caratteristiche: [
      'Sottotono caldo brillante con chiarezza nitida',
      'Tendenza ai toni vividi (verso Inverno)',
      'Contrasto naturale più marcato',
      'Energia moderna e accesa',
    ],
    palette: [
      { name: 'Corallo acceso', hex: '#FF4830' },
      { name: 'Turchese vivido', hex: '#00C8C0' },
      { name: 'Fucsia caldo', hex: '#E0207C' },
      { name: 'Verde brillante', hex: '#30D060' },
      { name: 'Giallo elettrico', hex: '#F8E000' },
      { name: 'Arancio acceso', hex: '#FF8000' },
      { name: 'Rosa shocking caldo', hex: '#FF60A0' },
      { name: 'Verde lime acceso', hex: '#A0E020' },
      { name: 'Blu turchese caldo', hex: '#00B0E0' },
      { name: 'Bianco caldo', hex: '#FFF8E8' },
      { name: 'Viola caldo', hex: '#9030C0' },
      { name: 'Pesca brillante', hex: '#FF9070' },
    ],
    accostamenti: {
      base: [
        { name: 'Corallo acceso', hex: '#FF4830' },
        { name: 'Turchese vivido', hex: '#00C8C0' },
        { name: 'Fucsia caldo', hex: '#E0207C' },
      ],
      neutri: [
        { name: 'Bianco caldo', hex: '#FFF8E8' },
        { name: 'Cammello chiaro', hex: '#C19A6B' },
      ],
      extra: [
        { name: 'Giallo elettrico', hex: '#F8E000' },
        { name: 'Verde brillante', hex: '#30D060' },
        { name: 'Viola caldo', hex: '#9030C0' },
        { name: 'Arancio acceso', hex: '#FF8000' },
      ],
    },
    smalti: [
      { name: 'Corallo acceso', hex: '#FF4830' },
      { name: 'Fucsia brillante', hex: '#E0207C' },
      { name: 'Turchese vivido', hex: '#00C8C0' },
      { name: 'Rosso caldo brillante', hex: '#E83820' },
      { name: 'Oro lucido', hex: '#E8C040' },
      { name: 'Nude caldo brillante', hex: '#E8A890' },
    ],
    smaltiIntro:
      'Smalti vivaci e brillanti per la tua palette accesa: corallo, fucsia caldo, turchese. Evita toni smorzati o pastel sbiaditi.',
  },

  // ── ESTATE ─────────────────────────────────────────────────────────────────
  'Estate Assoluta': {
    signature: '#D8A8D8',
    caratteristiche: [
      'Sottotono freddo rosato in perfetto equilibrio',
      'Eleganza eterea naturale',
      'Contrasto basso, sfumato',
      'Grazia poetica e raffinata',
    ],
    palette: [
      { name: 'Rosa cipria', hex: '#F4C2C2' },
      { name: 'Malva', hex: '#D8A8D8' },
      { name: 'Lavanda', hex: '#C8C8E8' },
      { name: 'Azzurro nebbia', hex: '#A8CCDC' },
      { name: 'Verde salvia', hex: '#AABAA0' },
      { name: 'Rosa antico', hex: '#C08888' },
      { name: 'Prugna chiara', hex: '#C8A0C8' },
      { name: 'Turchese freddo', hex: '#A0C8D0' },
      { name: 'Rosso ciliegia freddo', hex: '#B04060' },
      { name: 'Grigio perla', hex: '#CCCCCC' },
      { name: 'Bordeaux rosato', hex: '#8C2040' },
      { name: 'Blu navy freddo', hex: '#2A3A5E' },
    ],
    accostamenti: {
      base: [
        { name: 'Malva', hex: '#D8A8D8' },
        { name: 'Azzurro nebbia', hex: '#A8CCDC' },
        { name: 'Rosa cipria', hex: '#F4C2C2' },
      ],
      neutri: [
        { name: 'Grigio perla', hex: '#CCCCCC' },
        { name: 'Bianco panna freddo', hex: '#F0F0F8' },
      ],
      extra: [
        { name: 'Prugna chiara', hex: '#C8A0C8' },
        { name: 'Verde salvia', hex: '#AABAA0' },
        { name: 'Bordeaux rosato', hex: '#8C2040' },
        { name: 'Lavanda', hex: '#C8C8E8' },
      ],
    },
    smalti: [
      { name: 'Rosa cipria', hex: '#F4C2C2' },
      { name: 'Malva soft', hex: '#D8A8D8' },
      { name: 'Nude freddo', hex: '#D8B8B8' },
      { name: 'Lavanda chiara', hex: '#D8D0E8' },
      { name: 'Rosa antico', hex: '#C08888' },
      { name: 'Prugna chiara', hex: '#C8A0C8' },
    ],
    smaltiIntro:
      'Smalti delicati e freddi che assecondano la tua armonia: rosa cipria, malva, nude freddo. Stop a corallo, terracotta e oro giallo.',
  },

  'Summer Light': {
    signature: '#E0D8F0',
    caratteristiche: [
      'Sottotono freddo molto chiaro',
      'Pastelli freddi come elemento centrale',
      'Trasparenza luminosa nei colori',
      'Leggerezza poetica',
    ],
    palette: [
      { name: 'Rosa cipria chiara', hex: '#FAD8DC' },
      { name: 'Lavanda bianca', hex: '#EEE8F8' },
      { name: 'Azzurro latte', hex: '#D8EEF8' },
      { name: 'Verde menta freddo', hex: '#C8E8D8' },
      { name: 'Glicine pallido', hex: '#E0D8F0' },
      { name: 'Rosa nude freddo', hex: '#E8C8C8' },
      { name: 'Lilla chiarissimo', hex: '#D8C8E8' },
      { name: 'Azzurro cielo', hex: '#C0DCEC' },
      { name: 'Beige freddo', hex: '#EEE8E0' },
      { name: 'Salvia chiarissima', hex: '#D0DCC8' },
      { name: 'Rosso ciliegia tenue', hex: '#D08090' },
      { name: 'Grigio perla chiaro', hex: '#E0E0E8' },
    ],
    accostamenti: {
      base: [
        { name: 'Rosa cipria chiara', hex: '#FAD8DC' },
        { name: 'Azzurro latte', hex: '#D8EEF8' },
        { name: 'Lavanda bianca', hex: '#EEE8F8' },
      ],
      neutri: [
        { name: 'Bianco panna freddo', hex: '#F0F0F8' },
        { name: 'Beige freddo', hex: '#EEE8E0' },
      ],
      extra: [
        { name: 'Verde menta freddo', hex: '#C8E8D8' },
        { name: 'Glicine pallido', hex: '#E0D8F0' },
        { name: 'Rosa nude freddo', hex: '#E8C8C8' },
        { name: 'Azzurro cielo', hex: '#C0DCEC' },
      ],
    },
    smalti: [
      { name: 'Rosa cipria chiara', hex: '#FAD8DC' },
      { name: 'Nude rosato freddo', hex: '#E0C8C8' },
      { name: 'Lavanda chiarissima', hex: '#E0D8F0' },
      { name: 'Bianco perla freddo', hex: '#F0EFF8' },
      { name: 'Azzurro latte', hex: '#D8EEF8' },
      { name: 'Rosa malva soft', hex: '#E0C0D0' },
    ],
    smaltiIntro:
      'I tuoi smalti perfetti sono i pastelli freddi: rosa cipria chiara, lavanda pallida, nude freddo. Evita rossi caldi, ori e neri pieni.',
  },

  'Summer Soft': {
    signature: '#B89898',
    caratteristiche: [
      'Sottotono freddo smorzato',
      'Neutri vellutati come segno distintivo',
      'Bassa saturazione, alta eleganza',
      'Profondità morbida',
    ],
    palette: [
      { name: 'Malva polveroso', hex: '#C0A0B8' },
      { name: 'Grigio tortora', hex: '#A89890' },
      { name: 'Verde salvia', hex: '#9CAA90' },
      { name: 'Rosa antico freddo', hex: '#B88090' },
      { name: 'Taupe', hex: '#9A8E88' },
      { name: 'Blu ardesia freddo', hex: '#607890' },
      { name: 'Prugna polverosa', hex: '#A08090' },
      { name: 'Beige rosato', hex: '#D0B8B0' },
      { name: 'Grigio lilla', hex: '#B0A8B8' },
      { name: 'Rosso antico smorzato', hex: '#A06868' },
      { name: 'Bordeaux soft', hex: '#7A4858' },
      { name: 'Blu jeans smorzato', hex: '#708090' },
    ],
    accostamenti: {
      base: [
        { name: 'Malva polveroso', hex: '#C0A0B8' },
        { name: 'Grigio tortora', hex: '#A89890' },
        { name: 'Verde salvia', hex: '#9CAA90' },
      ],
      neutri: [
        { name: 'Taupe', hex: '#9A8E88' },
        { name: 'Beige rosato', hex: '#D0B8B0' },
      ],
      extra: [
        { name: 'Rosa antico freddo', hex: '#B88090' },
        { name: 'Blu ardesia', hex: '#607890' },
        { name: 'Prugna polverosa', hex: '#A08090' },
        { name: 'Bordeaux soft', hex: '#7A4858' },
      ],
    },
    smalti: [
      { name: 'Malva polveroso', hex: '#C0A0B8' },
      { name: 'Nude taupe', hex: '#B0A098' },
      { name: 'Rosa antico smorzato', hex: '#B88090' },
      { name: 'Grigio rosato', hex: '#B0A0A0' },
      { name: 'Beige rosato', hex: '#D0B8B0' },
      { name: 'Bordeaux soft', hex: '#7A4858' },
    ],
    smaltiIntro:
      'Smalti smorzati e vellutati che amplificano la tua eleganza discreta: malva polveroso, nude taupe, bordeaux soft. Stop a colori puri e brillanti.',
  },

  'Summer Cool': {
    signature: '#8C4A6E',
    caratteristiche: [
      'Sottotono freddo più deciso',
      'Capacità di portare profondità fredde',
      'Contrasto medio rispetto alle altre Estati',
      'Eleganza fredda con carattere',
    ],
    palette: [
      { name: 'Prugna fredda', hex: '#8C4A6E' },
      { name: 'Blu periwinkle', hex: '#5070B8' },
      { name: 'Bordeaux rosato', hex: '#8C2040' },
      { name: 'Viola medio', hex: '#6040A0' },
      { name: 'Blu ardesia', hex: '#304878' },
      { name: 'Rosa fredda intensa', hex: '#D88098' },
      { name: 'Verde pino freddo', hex: '#386848' },
      { name: 'Lampone freddo', hex: '#C04068' },
      { name: 'Lavanda media', hex: '#A8A0D0' },
      { name: 'Grigio perla', hex: '#B8B8C0' },
      { name: 'Bianco freddo', hex: '#F0F0F8' },
      { name: 'Blu navy freddo', hex: '#2A3A5E' },
    ],
    accostamenti: {
      base: [
        { name: 'Prugna fredda', hex: '#8C4A6E' },
        { name: 'Blu periwinkle', hex: '#5070B8' },
        { name: 'Bordeaux rosato', hex: '#8C2040' },
      ],
      neutri: [
        { name: 'Grigio perla', hex: '#B8B8C0' },
        { name: 'Bianco freddo', hex: '#F0F0F8' },
      ],
      extra: [
        { name: 'Viola medio', hex: '#6040A0' },
        { name: 'Lampone freddo', hex: '#C04068' },
        { name: 'Lavanda media', hex: '#A8A0D0' },
        { name: 'Blu navy freddo', hex: '#2A3A5E' },
      ],
    },
    smalti: [
      { name: 'Prugna fredda', hex: '#8C4A6E' },
      { name: 'Bordeaux rosato', hex: '#8C2040' },
      { name: 'Rosa intenso freddo', hex: '#D88098' },
      { name: 'Lampone', hex: '#C04068' },
      { name: 'Nude freddo medio', hex: '#C0A0A8' },
      { name: 'Lavanda media', hex: '#A8A0D0' },
    ],
    smaltiIntro:
      'Smalti freddi con più profondità: prugna, bordeaux rosato, lampone. Evita arancio, terracotta e tutti gli ori caldi.',
  },

  // ── AUTUNNO ────────────────────────────────────────────────────────────────
  'Autunno Assoluto': {
    signature: '#B7410E',
    caratteristiche: [
      'Sottotono caldo dorato/aranciato deciso',
      'Ricchezza terrosa naturale',
      'Profondità calda senza durezza',
      'Eleganza opulenta',
    ],
    palette: [
      { name: 'Ruggine', hex: '#B7410E' },
      { name: 'Terracotta', hex: '#C66B2D' },
      { name: 'Senape', hex: '#D4A800' },
      { name: 'Oliva', hex: '#6B6B00' },
      { name: 'Bronzo', hex: '#C07832' },
      { name: 'Verde foresta', hex: '#2D5A1E' },
      { name: 'Cammello', hex: '#C19A6B' },
      { name: 'Rame', hex: '#B86020' },
      { name: 'Cioccolato', hex: '#5A2D0C' },
      { name: 'Borgogna', hex: '#7A1E28' },
      { name: 'Curry', hex: '#C89000' },
      { name: 'Verde muschio', hex: '#506828' },
    ],
    accostamenti: {
      base: [
        { name: 'Ruggine', hex: '#B7410E' },
        { name: 'Senape', hex: '#D4A800' },
        { name: 'Verde foresta', hex: '#2D5A1E' },
      ],
      neutri: [
        { name: 'Cammello', hex: '#C19A6B' },
        { name: 'Cioccolato', hex: '#5A2D0C' },
      ],
      extra: [
        { name: 'Terracotta', hex: '#C66B2D' },
        { name: 'Bronzo', hex: '#C07832' },
        { name: 'Borgogna', hex: '#7A1E28' },
        { name: 'Oliva', hex: '#6B6B00' },
      ],
    },
    smalti: [
      { name: 'Ruggine', hex: '#B7410E' },
      { name: 'Terracotta', hex: '#C66B2D' },
      { name: 'Bronzo', hex: '#C07832' },
      { name: 'Borgogna', hex: '#7A1E28' },
      { name: 'Nude caldo terra', hex: '#C89878' },
      { name: 'Oro antico', hex: '#C89030' },
    ],
    smaltiIntro:
      'Smalti caldi e ricchi che si fondono col tuo sottotono dorato: ruggine, terracotta, bronzo, borgogna. Stop a rosa freddi e argento.',
  },

  'Autumn Soft': {
    signature: '#B08868',
    caratteristiche: [
      'Sottotono caldo smorzato',
      'Tendenza ai neutri (verso Estate)',
      'Eleganza terrosa morbida',
      'Profondità avvolgente',
    ],
    palette: [
      { name: 'Cammello', hex: '#B08868' },
      { name: 'Bronzo antico', hex: '#A07840' },
      { name: 'Verde salvia caldo', hex: '#909878' },
      { name: 'Beige dorato', hex: '#C8B090' },
      { name: 'Tabacco', hex: '#8F5A2A' },
      { name: 'Malva caldo polveroso', hex: '#B89898' },
      { name: 'Ruggine smorzata', hex: '#A05838' },
      { name: 'Senape soft', hex: '#B89848' },
      { name: 'Marrone medio caldo', hex: '#806848' },
      { name: 'Avorio antico', hex: '#E0D0B0' },
      { name: 'Verde oliva soft', hex: '#88884A' },
      { name: 'Rosa terra', hex: '#B89888' },
    ],
    accostamenti: {
      base: [
        { name: 'Cammello', hex: '#B08868' },
        { name: 'Verde salvia caldo', hex: '#909878' },
        { name: 'Bronzo antico', hex: '#A07840' },
      ],
      neutri: [
        { name: 'Beige dorato', hex: '#C8B090' },
        { name: 'Avorio antico', hex: '#E0D0B0' },
      ],
      extra: [
        { name: 'Tabacco', hex: '#8F5A2A' },
        { name: 'Malva caldo polveroso', hex: '#B89898' },
        { name: 'Ruggine smorzata', hex: '#A05838' },
        { name: 'Senape soft', hex: '#B89848' },
      ],
    },
    smalti: [
      { name: 'Cammello', hex: '#B08868' },
      { name: 'Bronzo antico', hex: '#A07840' },
      { name: 'Nude terra', hex: '#C89878' },
      { name: 'Malva caldo', hex: '#B89898' },
      { name: 'Beige dorato', hex: '#C8B090' },
      { name: 'Tabacco soft', hex: '#9F7048' },
    ],
    smaltiIntro:
      'Smalti caldi smorzati che valorizzano il tuo tono velato: cammello, bronzo antico, nude terra. Evita colori brillanti o troppo saturi.',
  },

  'Autumn Warm': {
    signature: '#E08040',
    caratteristiche: [
      'Sottotono caldo dorato luminoso',
      'Tendenza ai toni vivaci (verso Primavera)',
      'Riflessi ramati nei capelli',
      'Calore solare e vivace',
    ],
    palette: [
      { name: 'Pesca caldo', hex: '#E8A878' },
      { name: 'Caramello', hex: '#C87832' },
      { name: 'Oro vivo', hex: '#E8C040' },
      { name: 'Verde lime caldo', hex: '#A8D050' },
      { name: 'Corallo caldo', hex: '#FF7850' },
      { name: 'Salmone dorato', hex: '#F09060' },
      { name: 'Albicocca intensa', hex: '#F09050' },
      { name: 'Verde cachi', hex: '#A8A050' },
      { name: 'Cammello luminoso', hex: '#D0A058' },
      { name: 'Rosso mattone caldo', hex: '#C04828' },
      { name: 'Giallo dorato', hex: '#F0C040' },
      { name: 'Bronzo chiaro', hex: '#C89850' },
    ],
    accostamenti: {
      base: [
        { name: 'Pesca caldo', hex: '#E8A878' },
        { name: 'Verde lime caldo', hex: '#A8D050' },
        { name: 'Caramello', hex: '#C87832' },
      ],
      neutri: [
        { name: 'Cammello luminoso', hex: '#D0A058' },
        { name: 'Avorio caldo', hex: '#FFF0C8' },
      ],
      extra: [
        { name: 'Corallo caldo', hex: '#FF7850' },
        { name: 'Oro vivo', hex: '#E8C040' },
        { name: 'Verde cachi', hex: '#A8A050' },
        { name: 'Rosso mattone caldo', hex: '#C04828' },
      ],
    },
    smalti: [
      { name: 'Caramello', hex: '#C87832' },
      { name: 'Pesca dorato', hex: '#E8A878' },
      { name: 'Corallo caldo', hex: '#FF7850' },
      { name: 'Oro vivo', hex: '#E8C040' },
      { name: 'Nude caldo dorato', hex: '#D0A878' },
      { name: 'Rosso mattone', hex: '#C04828' },
    ],
    smaltiIntro:
      'Smalti caldi e luminosi tra Autunno e Primavera: caramello, pesca dorato, oro vivo. Stop a rosa freddi e argento.',
  },

  'Autumn Deep': {
    signature: '#5A1828',
    caratteristiche: [
      'Sottotono caldo profondo',
      'Capacità di portare colori scuri intensi',
      'Contrasto naturale medio-alto',
      'Bellezza ricca e magnetica',
    ],
    palette: [
      { name: 'Bordeaux scuro', hex: '#5A1828' },
      { name: 'Cioccolato', hex: '#5A2D0C' },
      { name: 'Verde bottiglia', hex: '#1A4818' },
      { name: 'Prugna calda', hex: '#5A1840' },
      { name: 'Blu notte caldo', hex: '#101840' },
      { name: 'Verde notte', hex: '#0A2818' },
      { name: 'Terracotta scura', hex: '#A05838' },
      { name: 'Ruggine profonda', hex: '#882810' },
      { name: 'Marrone testa di moro', hex: '#3A1F12' },
      { name: 'Oliva scuro', hex: '#3A4008' },
      { name: 'Rosso mattone scuro', hex: '#702018' },
      { name: 'Senape scura', hex: '#A07820' },
    ],
    accostamenti: {
      base: [
        { name: 'Bordeaux scuro', hex: '#5A1828' },
        { name: 'Verde bottiglia', hex: '#1A4818' },
        { name: 'Cioccolato', hex: '#5A2D0C' },
      ],
      neutri: [
        { name: 'Marrone testa di moro', hex: '#3A1F12' },
        { name: 'Cammello scuro', hex: '#806848' },
      ],
      extra: [
        { name: 'Prugna calda', hex: '#5A1840' },
        { name: 'Ruggine profonda', hex: '#882810' },
        { name: 'Verde notte', hex: '#0A2818' },
        { name: 'Blu notte caldo', hex: '#101840' },
      ],
    },
    smalti: [
      { name: 'Bordeaux scuro', hex: '#5A1828' },
      { name: 'Prugna calda', hex: '#5A1840' },
      { name: 'Cioccolato', hex: '#5A2D0C' },
      { name: 'Ruggine profonda', hex: '#882810' },
      { name: 'Oro antico scuro', hex: '#9A6F1E' },
      { name: 'Verde bottiglia', hex: '#1A4818' },
    ],
    smaltiIntro:
      'Smalti profondi e caldi all\'altezza del tuo magnetismo: bordeaux scuro, prugna calda, cioccolato. Stop a colori chiari e freddi.',
  },

  // ── INVERNO ────────────────────────────────────────────────────────────────
  'Inverno Assoluto': {
    signature: '#CC0000',
    caratteristiche: [
      'Sottotono freddo netto',
      'Contrasto alto tra pelle, occhi e capelli',
      'Capacità di portare bianco e nero puri',
      'Sofisticazione drammatica',
    ],
    palette: [
      { name: 'Nero', hex: '#1A1A1A' },
      { name: 'Bianco puro', hex: '#FFFFFF' },
      { name: 'Rosso intenso', hex: '#CC0000' },
      { name: 'Blu royal', hex: '#3A5ACC' },
      { name: 'Verde smeraldo', hex: '#008050' },
      { name: 'Fucsia', hex: '#E0006C' },
      { name: 'Viola intenso', hex: '#6A0080' },
      { name: 'Bordeaux', hex: '#7A001E' },
      { name: 'Blu navy', hex: '#0A1850' },
      { name: 'Turchese elettrico', hex: '#00A8D0' },
      { name: 'Rosa shocking freddo', hex: '#E0188A' },
      { name: 'Argento', hex: '#B8B8C8' },
    ],
    accostamenti: {
      base: [
        { name: 'Nero', hex: '#1A1A1A' },
        { name: 'Bianco puro', hex: '#FFFFFF' },
        { name: 'Rosso intenso', hex: '#CC0000' },
      ],
      neutri: [
        { name: 'Argento', hex: '#B8B8C8' },
        { name: 'Grigio antracite', hex: '#3A3A48' },
      ],
      extra: [
        { name: 'Blu royal', hex: '#3A5ACC' },
        { name: 'Verde smeraldo', hex: '#008050' },
        { name: 'Fucsia', hex: '#E0006C' },
        { name: 'Bordeaux', hex: '#7A001E' },
      ],
    },
    smalti: [
      { name: 'Rosso freddo intenso', hex: '#CC0010' },
      { name: 'Nero', hex: '#1A1A1A' },
      { name: 'Fucsia', hex: '#E0006C' },
      { name: 'Bordeaux freddo', hex: '#7A001E' },
      { name: 'Argento', hex: '#B8B8C8' },
      { name: 'Nude rosato freddo', hex: '#D8B0B8' },
    ],
    smaltiIntro:
      'Smalti netti e definiti come la tua palette: rosso freddo intenso, nero, fucsia, bordeaux. Stop a tutti i toni caldi/dorati.',
  },

  'Winter Cool': {
    signature: '#B8B8E0',
    caratteristiche: [
      'Sottotono freddo delicato',
      'Tendenza ai toni morbidi (verso Estate)',
      'Contrasto medio armonioso',
      'Bellezza fredda sfumata',
    ],
    palette: [
      { name: 'Azzurro ghiaccio', hex: '#C0D8E8' },
      { name: 'Malva freddo', hex: '#B0A0C0' },
      { name: 'Lavanda fredda', hex: '#B8B8E0' },
      { name: 'Prugna chiara', hex: '#A878A0' },
      { name: 'Rosso carminio', hex: '#A82038' },
      { name: 'Bordeaux freddo', hex: '#600828' },
      { name: 'Grigio perla freddo', hex: '#C8C8D8' },
      { name: 'Blu navy', hex: '#0A1850' },
      { name: 'Verde abete freddo', hex: '#286048' },
      { name: 'Rosa freddo medio', hex: '#D8A0B8' },
      { name: 'Bianco ottico', hex: '#F0F4FF' },
      { name: 'Blu cielo freddo', hex: '#5878A8' },
    ],
    accostamenti: {
      base: [
        { name: 'Azzurro ghiaccio', hex: '#C0D8E8' },
        { name: 'Malva freddo', hex: '#B0A0C0' },
        { name: 'Rosso carminio', hex: '#A82038' },
      ],
      neutri: [
        { name: 'Grigio perla freddo', hex: '#C8C8D8' },
        { name: 'Bianco ottico', hex: '#F0F4FF' },
      ],
      extra: [
        { name: 'Lavanda fredda', hex: '#B8B8E0' },
        { name: 'Prugna chiara', hex: '#A878A0' },
        { name: 'Blu navy', hex: '#0A1850' },
        { name: 'Verde abete freddo', hex: '#286048' },
      ],
    },
    smalti: [
      { name: 'Rosa freddo medio', hex: '#D8A0B8' },
      { name: 'Malva freddo', hex: '#B0A0C0' },
      { name: 'Rosso carminio', hex: '#A82038' },
      { name: 'Nude freddo', hex: '#D8B8B8' },
      { name: 'Lavanda', hex: '#B8B8E0' },
      { name: 'Bordeaux freddo', hex: '#600828' },
    ],
    smaltiIntro:
      'Smalti freddi delicati per la tua armonia sfumata: rosa freddo, malva, carminio. Stop a corallo e dorati caldi.',
  },

  'Winter Bright': {
    signature: '#008050',
    caratteristiche: [
      'Sottotono freddo brillante',
      'Tendenza ai toni vividi (verso Primavera)',
      'Luminosità nitida cristallina',
      'Energia accesa e moderna',
    ],
    palette: [
      { name: 'Verde smeraldo', hex: '#008050' },
      { name: 'Fucsia', hex: '#E0006C' },
      { name: 'Turchese elettrico', hex: '#00A8D0' },
      { name: 'Verde lime brillante', hex: '#80E020' },
      { name: 'Ciclamino', hex: '#D8009A' },
      { name: 'Blu royal', hex: '#3A5ACC' },
      { name: 'Rosso freddo brillante', hex: '#E80020' },
      { name: 'Viola intenso', hex: '#6A0080' },
      { name: 'Lampone vivido', hex: '#E04080' },
      { name: 'Bianco ottico', hex: '#FFFFFF' },
      { name: 'Nero', hex: '#1A1A1A' },
      { name: 'Giallo lime freddo', hex: '#E0E020' },
    ],
    accostamenti: {
      base: [
        { name: 'Verde smeraldo', hex: '#008050' },
        { name: 'Fucsia', hex: '#E0006C' },
        { name: 'Turchese elettrico', hex: '#00A8D0' },
      ],
      neutri: [
        { name: 'Bianco ottico', hex: '#FFFFFF' },
        { name: 'Nero', hex: '#1A1A1A' },
      ],
      extra: [
        { name: 'Verde lime brillante', hex: '#80E020' },
        { name: 'Blu royal', hex: '#3A5ACC' },
        { name: 'Viola intenso', hex: '#6A0080' },
        { name: 'Lampone vivido', hex: '#E04080' },
      ],
    },
    smalti: [
      { name: 'Fucsia', hex: '#E0006C' },
      { name: 'Verde smeraldo', hex: '#008050' },
      { name: 'Rosso freddo brillante', hex: '#E80020' },
      { name: 'Viola intenso', hex: '#6A0080' },
      { name: 'Turchese elettrico', hex: '#00A8D0' },
      { name: 'Nero lucido', hex: '#0A0A0A' },
    ],
    smaltiIntro:
      'Smalti vivaci e brillanti come la tua palette: fucsia, smeraldo, rosso intenso, viola. Evita tutti i toni smorzati.',
  },

  'Winter Deep': {
    signature: '#0F1830',
    caratteristiche: [
      'Sottotono freddo profondo',
      'Capacità di portare colori scuri puri',
      'Contrasto naturale alto',
      'Bellezza mediterranea magnetica',
    ],
    palette: [
      { name: 'Nero', hex: '#0F0F12' },
      { name: 'Bordeaux scuro', hex: '#580020' },
      { name: 'Blu notte', hex: '#0F1830' },
      { name: 'Verde smeraldo scuro', hex: '#005038' },
      { name: 'Viola scuro', hex: '#4A0070' },
      { name: 'Rosso freddo profondo', hex: '#9A0020' },
      { name: 'Grigio antracite', hex: '#2A2A38' },
      { name: 'Prugna scura', hex: '#3A1040' },
      { name: 'Blu notte profondo', hex: '#0A1040' },
      { name: 'Verde bosco freddo', hex: '#103028' },
      { name: 'Bianco freddo', hex: '#F0F0F8' },
      { name: 'Argento', hex: '#A8A8B8' },
    ],
    accostamenti: {
      base: [
        { name: 'Nero', hex: '#0F0F12' },
        { name: 'Bordeaux scuro', hex: '#580020' },
        { name: 'Verde smeraldo scuro', hex: '#005038' },
      ],
      neutri: [
        { name: 'Grigio antracite', hex: '#2A2A38' },
        { name: 'Bianco freddo', hex: '#F0F0F8' },
      ],
      extra: [
        { name: 'Blu notte', hex: '#0F1830' },
        { name: 'Viola scuro', hex: '#4A0070' },
        { name: 'Prugna scura', hex: '#3A1040' },
        { name: 'Rosso freddo profondo', hex: '#9A0020' },
      ],
    },
    smalti: [
      { name: 'Bordeaux scuro', hex: '#580020' },
      { name: 'Nero lucido', hex: '#0F0F12' },
      { name: 'Rosso freddo profondo', hex: '#9A0020' },
      { name: 'Prugna scura', hex: '#3A1040' },
      { name: 'Verde smeraldo scuro', hex: '#005038' },
      { name: 'Argento scuro', hex: '#8A8A98' },
    ],
    smaltiIntro:
      'Smalti scuri e intensi all\'altezza della tua profondità: bordeaux scuro, nero, rosso freddo, smeraldo scuro. Stop a tutti i caldi.',
  },
}
