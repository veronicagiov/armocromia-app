import PDFDocument from 'pdfkit'

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 50
const CONTENT_W = PAGE_W - 2 * MARGIN

interface SeasonInfo {
  accent: string
  light: string
  description: string
  characteristics: string[]
  palette: { name: string; hex: string }[]
  avoidColors: { name: string; hex: string }[]
  makeup: { label: string; value: string }[]
  styleAdvice: string[]
  subgroups: Record<string, string>
}

// Colori dal sottogruppo confinante
const SUBGROUP_NEIGHBORS: Record<string, { label: string; colors: { name: string; hex: string }[] }> = {
  'Primavera Assoluta': { label: 'Estate Assoluta', colors: [
    { name: 'Malva caldo', hex: '#C8A0C0' },
    { name: 'Rosa antico', hex: '#C09090' },
    { name: 'Lavanda calda', hex: '#C0B0D8' },
    { name: 'Ciclamino tenue', hex: '#E0A0C0' },
    { name: 'Azzurro rosato', hex: '#C8D8E8' },
  ]},
  'Spring Light': { label: 'Summer Light', colors: [
    { name: 'Rosa cipria', hex: '#F4C2C2' },
    { name: 'Glicine pallido', hex: '#E0D8F0' },
    { name: 'Azzurro latte', hex: '#D8EEF8' },
    { name: 'Lavanda bianca', hex: '#EEE8F8' },
    { name: 'Beige freddo', hex: '#EEE8E0' },
  ]},
  'Spring Warm': { label: 'Autumn Warm', colors: [
    { name: 'Ocra smorzata', hex: '#C8A060' },
    { name: 'Verde cachi', hex: '#8A9650' },
    { name: 'Cammello', hex: '#C8A882' },
    { name: 'Bronzo chiaro', hex: '#C89850' },
    { name: 'Terracotta', hex: '#D07850' },
  ]},
  'Spring Bright': { label: 'Winter Bright', colors: [
    { name: 'Fucsia', hex: '#E0006C' },
    { name: 'Turchese vivido', hex: '#00C8C0' },
    { name: 'Viola intenso', hex: '#7000B0' },
    { name: 'Ciclamino', hex: '#E000A0' },
    { name: 'Verde brillante', hex: '#30D060' },
  ]},
  'Estate Assoluta': { label: 'Primavera Assoluta', colors: [
    { name: 'Corallo tenue', hex: '#F09078' },
    { name: 'Pesca caldo', hex: '#F0B890' },
    { name: 'Verde acqua caldo', hex: '#A8D8C8' },
    { name: 'Giallo crema', hex: '#F8F0C8' },
    { name: 'Salmone chiaro', hex: '#F8B0A0' },
  ]},
  'Summer Light': { label: 'Spring Light', colors: [
    { name: 'Pesca chiarissimo', hex: '#FFE8D8' },
    { name: 'Giallo crema caldo', hex: '#FFF8D0' },
    { name: 'Verde acqua', hex: '#C8EED8' },
    { name: 'Albicocca tenue', hex: '#FFD8B8' },
    { name: 'Avorio caldo', hex: '#FFF8E8' },
  ]},
  'Summer Soft': { label: 'Autumn Soft', colors: [
    { name: 'Cammello polveroso', hex: '#C8A882' },
    { name: 'Verde salvia caldo', hex: '#9CAA82' },
    { name: 'Rosa antico caldo', hex: '#C08878' },
    { name: 'Ocra morbida', hex: '#C8A060' },
    { name: 'Beige dorato', hex: '#D8C8A8' },
  ]},
  'Summer Cool': { label: 'Winter Cool', colors: [
    { name: 'Prugna fredda', hex: '#8C4A6E' },
    { name: 'Blu periwinkle', hex: '#5060A8' },
    { name: 'Bordeaux rosato', hex: '#8C2040' },
    { name: 'Viola medio', hex: '#6040A0' },
    { name: 'Blu ardesia', hex: '#304878' },
  ]},
  'Autunno Assoluto': { label: 'Primavera Assoluta', colors: [
    { name: 'Corallo caldo', hex: '#FF7850' },
    { name: 'Pesca dorato', hex: '#FFB880' },
    { name: 'Verde lime caldo', hex: '#90C040' },
    { name: 'Oro vivo', hex: '#E8C000' },
    { name: 'Albicocca intensa', hex: '#F09050' },
  ]},
  'Autumn Soft': { label: 'Summer Soft', colors: [
    { name: 'Malva polveroso', hex: '#C0A0B8' },
    { name: 'Grigio rosato', hex: '#C0B0B0' },
    { name: 'Rosa antico freddo', hex: '#C09898' },
    { name: 'Lavanda smorzata', hex: '#B8B0C8' },
    { name: 'Beige rosato', hex: '#D8C8C0' },
  ]},
  'Autumn Warm': { label: 'Spring Warm', colors: [
    { name: 'Corallo chiaro', hex: '#FF9070' },
    { name: 'Pesca luminoso', hex: '#FFC090' },
    { name: 'Lime caldo', hex: '#A8D050' },
    { name: 'Giallo dorato', hex: '#F8D050' },
    { name: 'Salmone caldo', hex: '#F8A080' },
  ]},
  'Autumn Deep': { label: 'Winter Deep', colors: [
    { name: 'Bordeaux scuro', hex: '#580A20' },
    { name: 'Blu notte caldo', hex: '#101840' },
    { name: 'Prugna calda', hex: '#5A1840' },
    { name: 'Viola notte', hex: '#380848' },
    { name: 'Verde notte', hex: '#0A2818' },
  ]},
  'Inverno Assoluto': { label: 'Summer Cool', colors: [
    { name: 'Blu ghiaccio', hex: '#C0D8E8' },
    { name: 'Lavanda medio', hex: '#B0A8D0' },
    { name: 'Malva freddo', hex: '#C0A0C0' },
    { name: 'Grigio perla', hex: '#C8C8D0' },
    { name: 'Rosa freddo', hex: '#E0B8C8' },
  ]},
  'Winter Cool': { label: 'Summer Cool', colors: [
    { name: 'Lavanda fredda', hex: '#B8B8E0' },
    { name: 'Grigio perla rosato', hex: '#C8C0CC' },
    { name: 'Rosa freddo', hex: '#D8A0B8' },
    { name: 'Lilla tenue', hex: '#C8B8D8' },
    { name: 'Azzurro nebbia', hex: '#B8D0E0' },
  ]},
  'Winter Bright': { label: 'Spring Bright', colors: [
    { name: 'Corallo brillante', hex: '#FF6840' },
    { name: 'Verde mela vivido', hex: '#70CC00' },
    { name: 'Arancio brillante', hex: '#FF9000' },
    { name: 'Giallo elettrico', hex: '#F8E000' },
    { name: 'Turchese caldo', hex: '#00D8A8' },
  ]},
  'Winter Deep': { label: 'Autumn Deep', colors: [
    { name: 'Marrone cioccolato', hex: '#5A2D0C' },
    { name: 'Verde bottiglia', hex: '#1A4818' },
    { name: 'Borgogna calda', hex: '#720828' },
    { name: 'Marrone scuro', hex: '#3A1808' },
    { name: 'Verde oliva scuro', hex: '#3A4008' },
  ]},
}

const SEASON_DATA: Record<string, SeasonInfo> = {
  Primavera: {
    accent: '#D4845A',
    light: '#FFF5EE',
    description:
      'La donna Primavera irradia una luce calda, fresca e luminosa. La sua colorazione è caratterizzata da sottotoni dorati e aranciati: capelli con riflessi ramati o dorati, occhi chiari o medi con pagliuzze dorate, pelle luminosa con sottotono pesca-avorio.',
    characteristics: [
      'Sottotono: caldo e dorato',
      'Contrasto: basso-medio tra pelle, occhi e capelli',
      'Luminosità: chiara, fresca, luminosa',
      'Parola chiave: vivace e delicata insieme',
    ],
    palette: [
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
    avoidColors: [
      { name: 'Nero', hex: '#1A1A1A' },
      { name: 'Grigio freddo', hex: '#7D7D7D' },
      { name: 'Bianco puro', hex: '#F0F0F0' },
      { name: 'Blu navy', hex: '#1B2A6B' },
      { name: 'Blu notte', hex: '#0A1040' },
      { name: 'Verde oliva scuro', hex: '#5A5A00' },
    ],
    makeup: [
      { label: 'Fondotinta', value: 'Base con sottotono giallo-pesca, formula leggera e luminosa. Evita formule con rosa o grigio.' },
      { label: 'Correttore', value: 'Pesca chiaro sotto gli occhi per illuminare senza effetto spettrale.' },
      { label: 'Blush', value: 'Corallo, pesca, albicocca — sfumato sulle guance come un tocco di sole naturale.' },
      { label: 'Illuminante', value: 'Oro champagne o pesca shimmer: valorizza la luminosità naturale della tua pelle.' },
      { label: 'Labbra', value: 'Corallo, pesca, rosa caldo, nude aranciato. Evita il rosso freddo o il bordeaux.' },
      { label: 'Occhi', value: 'Bronzo, oro, marrone caldo, verde muschio, rame. Eyeliner marrone invece del nero.' },
    ],
    styleAdvice: [
      'Prediligi tessuti leggeri e dalle texture morbide come chiffon, seta e lino.',
      'I pattern floreali e a pois in toni caldi ti valorizzano particolarmente.',
      'Punta su accessori in oro, rame e legno chiaro. Evita argento e acciaio.',
      "L'abbinamento corallo + avorio caldo è il tuo signature look per eccellenza.",
      'Puoi mixare colori caldi senza paura: la tua stagione ama la vivacità.',
      'Per il guardaroba invernale punta su cammello, caramello e verde muschio.',
    ],
    subgroups: {
      'Primavera Assoluta':
        'La Primavera Assoluta esprime al massimo la freschezza e la vivacità primaverile. I colori della tua palette sono brillanti, caldi e luminosi in perfetto equilibrio. Il tuo look ideale è leggero, gioioso e naturale.',
      'Spring Light':
        "La Spring Light è la Primavera più delicata e chiara. La tua palette si esprime meglio nei toni pesca chiari, corallo tenue e verde acqua caldo. Evita colori troppo saturi o scuri: la tua forza è la luminosità eterea.",
      'Spring Warm':
        "La Spring Warm tende verso l'Autunno. La tua palette include colori più profondi e terrosi: terracotta, bronzo, verde cachi e caramello. I tessuti strutturati ti valorizzano quanto quelli fluidi.",
      'Spring Bright':
        "La Spring Bright tende verso l'Inverno. I tuoi colori migliori sono vividi e contrastati, con una chiarezza quasi cristallina. Il corallo acceso, il turchese brillante ti stanno divinamente.",
    },
  },

  Estate: {
    accent: '#9B7FA6',
    light: '#F8F0FF',
    description:
      "La donna Estate emana un'eleganza eterea e raffinata. La sua colorazione è caratterizzata da sottotoni freddi e rosati: capelli dal biondo cenere al castano freddo, occhi chiari o grigi-azzurri, pelle con velo rosato e sottotono freddo.",
    characteristics: [
      'Sottotono: freddo e rosato',
      'Contrasto: basso-medio, tutto in sfumatura',
      'Luminosità: chiara e delicata, mai intensa',
      'Parola chiave: eterea e sofisticata',
    ],
    palette: [
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
      { name: 'Cedro freddo', hex: '#A8D0A0' },
      { name: 'Grigio lilla', hex: '#B8B0C8' },
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
      { label: 'Fondotinta', value: 'Base con sottotono rosa-freddo, coprenza media e finish satinato. Evita formule con giallo o bronzo.' },
      { label: 'Correttore', value: 'Rosa chiaro freddo sotto gli occhi per una luminosità naturale e delicata.' },
      { label: 'Blush', value: 'Rosa freddo, malva tenue, rosa antico — sfumato con mano leggerissima.' },
      { label: 'Illuminante', value: 'Perla fredda o rosa silver: aggiunge luce senza alterare il sottotono.' },
      { label: 'Labbra', value: 'Rosa freddo, malva, nude rosato, prugna chiara. Evita nude caldi o arancio.' },
      { label: 'Occhi', value: 'Grigio, malva, blu freddo, taupe rosato, prugna. Eyeliner grigio o blu midnight.' },
    ],
    styleAdvice: [
      'I tessuti fluidi e morbidi come seta, jersey e chiffon esaltano la tua grazia naturale.',
      'Le stampe delicate — fiorellini, paisley tenue, pizzo — sono perfette per te.',
      'Accessori in argento, cristallo e pietre madreperla. Evita oro giallo intenso.',
      "Abbina malva + grigio perla per un look ultra-sofisticato da giorno o sera.",
      'Evita contrasti forti: il tuo punto di forza è la sfumatura e la leggerezza.',
      'Per il guardaroba freddo punta su cappotti grigi, lavanda e blu ghiaccio.',
    ],
    subgroups: {
      'Estate Assoluta':
        "L'Estate Assoluta è quella più classica e raffinata. La tua palette è tutta in tonalità fredde e rosate in perfetto equilibrio. Il tuo look ideale è delicato, poetico, elegante senza sforzo.",
      'Summer Light':
        "La Summer Light è l'Estate più chiara e luminosa. I tuoi colori migliori sono pastelli freddi: lavanda chiarissima, rosa cipria, azzurro nebbia. La tua forza è la leggerezza e la trasparenza dei colori.",
      'Summer Soft':
        "La Summer Soft tende verso l'Autunno. I tuoi colori migliori sono neutri e smorzati: grigio tortora, malva polveroso, verde salvia. Hai una qualità vellutata e avvolgente.",
      'Summer Cool':
        "La Summer Cool tende verso l'Inverno. Puoi gestire colori più profondi mantenendo il sottotono freddo: prugna, blu periwinkle, bordeaux rosato. Hai più contrasto rispetto alle altre Estati.",
    },
  },

  Autunno: {
    accent: '#A0522D',
    light: '#FFF8F0',
    description:
      "La donna Autunno esprime una bellezza ricca, profonda e terrosa. La sua colorazione è caratterizzata da sottotoni caldi e dorati-arancio: capelli ramati, castani caldi o rossi, occhi marroni, verdi o ambra, pelle dorata o beige caldo con sottotono giallo.",
    characteristics: [
      'Sottotono: caldo, dorato-arancio',
      'Contrasto: medio-alto, tutto in calore',
      'Luminosità: media e profonda, mai fredda',
      'Parola chiave: ricca, opulenta, naturale',
    ],
    palette: [
      { name: 'Arancio bruciato', hex: '#CC5500' },
      { name: 'Ruggine', hex: '#B7410E' },
      { name: 'Verde oliva', hex: '#6B6B00' },
      { name: 'Senape', hex: '#D4A800' },
      { name: 'Terracotta', hex: '#C66B2D' },
      { name: 'Bronzo', hex: '#C07832' },
      { name: 'Borgogna', hex: '#7A1E28' },
      { name: 'Verde foresta', hex: '#2D5A1E' },
      { name: 'Caramello', hex: '#C87832' },
      { name: 'Oro scuro', hex: '#A87800' },
      { name: 'Cioccolato', hex: '#5A2D0C' },
      { name: 'Pesca caldo', hex: '#E8A878' },
      { name: 'Rame', hex: '#B86020' },
      { name: 'Curry', hex: '#C89000' },
      { name: 'Verde muschio', hex: '#506828' },
    ],
    avoidColors: [
      { name: 'Rosa freddo', hex: '#E8A0B4' },
      { name: 'Blu elettrico', hex: '#0050CC' },
      { name: 'Bianco puro', hex: '#F0F0F0' },
      { name: 'Grigio freddo', hex: '#7D7D7D' },
      { name: 'Rosa freddo acceso', hex: '#E800A0' },
      { name: 'Azzurro freddo', hex: '#8090D0' },
    ],
    makeup: [
      { label: 'Fondotinta', value: 'Base con sottotono arancio-dorato, formula ricca e coprente. Evita formule con rosa o beige freddo.' },
      { label: 'Correttore', value: 'Pesca-arancio per nascondere le occhiaie: evita il rosa freddo che smorza la tua luminosità.' },
      { label: 'Blush', value: 'Terracotta, pesca caldo, rame, albicocca profonda. Applicato con pennello ampio sulla guancia.' },
      { label: 'Illuminante', value: 'Oro antico o bronzo: crea un glow caldo e naturale che valorizza la profondità della tua pelle.' },
      { label: 'Labbra', value: 'Terracotta, bronzo, nude caldo, borgogna, mattone. Evita il rosa freddo o il rosso ciliegia.' },
      { label: 'Occhi', value: 'Bronzo, rame, verde muschio, marrone dorato, oro antico. Eyeliner marrone cioccolato o khaki.' },
    ],
    styleAdvice: [
      'I tessuti naturali — lana, tweed, velluto, pelle, suede — ti esaltano magnificamente.',
      'Le stampe geometriche etniche, tartán e paisley caldi sono fatti per te.',
      'Accessori in oro antico, legno scuro, pietre ambra, turchese e corallo.',
      "L'abbinamento arancio bruciato + marrone cioccolato è il tuo signature look.",
      'Puoi gestire look molto ricchi e layered: abbina texture diverse senza paura.',
      'Il verde oliva è il tuo neutral perfetto: funziona con quasi tutto nella tua palette.',
    ],
    subgroups: {
      'Autunno Assoluto':
        "L'Autunno Assoluto è il più tipico e opulento. La tua palette è ricca di colori profondi e caldi al massimo della loro intensità. Ruggine, senape, verde foresta: tutto crea un effetto di lusso naturale.",
      'Autumn Soft':
        "L'Autumn Soft tende verso l'Estate. I tuoi colori migliori sono neutri e sfumati: bronzo antico, ruggine attenuata, verde salvia caldo, cammello. La tua forza è la profondità morbida.",
      'Autumn Warm':
        "L'Autumn Warm tende verso la Primavera. I tuoi colori sono più luminosi e dorati: pesca caldo, caramello, oro, verde lime caldo. Puoi osare colori più vivaci rimanendo nei toni caldi.",
      'Autumn Deep':
        "L'Autumn Deep è l'Autunno più profondo e scuro. I tuoi colori migliori sono intensi: borgogna scuro, marrone cioccolato, verde bottiglia, prugna calda. Puoi gestire più contrasto grazie alla profondità della tua colorazione.",
    },
  },

  Inverno: {
    accent: '#1A3A6E',
    light: '#F0F0FF',
    description:
      "La donna Inverno irradia un'eleganza drammatica e sofisticata. La sua colorazione è caratterizzata da sottotoni freddi e neutri: capelli scuri o biondo cenere freddo, occhi intensi, pelle chiara o scura con sottotono rosato-freddo. Il contrasto è il suo punto di forza.",
    characteristics: [
      'Sottotono: freddo, neutro-rosato o olivastro',
      'Contrasto: alto tra pelle, occhi e capelli',
      'Luminosità: chiara o scura, mai neutra',
      'Parola chiave: drammatica, netta, sofisticata',
    ],
    palette: [
      { name: 'Nero', hex: '#1A1A1A' },
      { name: 'Bianco puro', hex: '#FFFFFF' },
      { name: 'Rosso intenso', hex: '#CC0000' },
      { name: 'Blu royal', hex: '#3A5ACC' },
      { name: 'Verde smeraldo', hex: '#008050' },
      { name: 'Fucsia', hex: '#E0006C' },
      { name: 'Viola intenso', hex: '#6A0080' },
      { name: 'Argento', hex: '#B8B8C8' },
      { name: 'Bordeaux', hex: '#7A001E' },
      { name: 'Blu navy', hex: '#0A1850' },
      { name: 'Ciclamino', hex: '#D8009A' },
      { name: 'Azzurro ghiaccio', hex: '#D0E8F0' },
      { name: 'Bianco ghiaccio', hex: '#F0F4FF' },
      { name: 'Turchese elettrico', hex: '#00A8D0' },
      { name: 'Lampone freddo', hex: '#E04080' },
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
      { label: 'Fondotinta', value: 'Base con sottotono rosa-freddo o neutro, alta coprenza e finish luminoso o satin.' },
      { label: 'Correttore', value: 'Rosa freddo chiaro o neutro sotto gli occhi: evita pesca e giallo che smorzano il contrasto.' },
      { label: 'Blush', value: 'Rosa freddo intenso, lampone, prugna fredda — applicato con precisione sulla guancia.' },
      { label: 'Illuminante', value: 'Argento o rosa ghiaccio: sottolinea la luminosità cristallina tipica dell\'Inverno.' },
      { label: 'Labbra', value: 'Rosso freddo, rosa intenso, prugna, bordeaux, nude freddo. Il rosso classico è il tuo must.' },
      { label: 'Occhi', value: 'Nero, grigio antracite, blu intenso, viola, argento, bordeaux. L\'eyeliner nero è il tuo alleato.' },
    ],
    styleAdvice: [
      "Il tuo punto di forza è il contrasto: bianco + nero è il tuo look definitivo.",
      'I tessuti pregiati — seta, raso, crepe, cashmere — esaltano la tua eleganza naturale.',
      'Accessori in argento, cristallo, platino e pietre preziose fredde. Evita oro giallo.',
      "L'abbinamento nero + rosso intenso è il tuo signature look per le serate.",
      'Puoi gestire pattern geometrici netti e stampe grafiche bold senza sembrare eccessiva.',
      'Il blu navy è il tuo neutral alternativo al nero: elegante e sempre perfetto.',
    ],
    subgroups: {
      'Inverno Assoluto':
        "L'Inverno Assoluto è il più classico e drammatico. Bianco puro e nero sono i tuoi colori assoluti, insieme a rosso intenso, blu royal e verde smeraldo. Sei la definizione di eleganza senza compromessi.",
      'Winter Cool':
        "Il Winter Cool tende verso l'Estate. I tuoi colori migliori sono freddi e delicati: azzurro ghiaccio, malva freddo, grigio perla, prugna chiara. Hai più morbidezza rispetto all'Inverno Assoluto.",
      'Winter Bright':
        "Il Winter Bright tende verso la Primavera. I tuoi colori sono vividi, brillanti e intensi: fucsia, ciclamino, verde lime brillante, turchese elettrico. Hai una qualità cristallina e luminosa.",
      'Winter Deep':
        "Il Winter Deep è l'Inverno più profondo e scuro. I tuoi colori migliori sono intensi e ricchi: nero, bordeaux profondo, blu notte, verde smeraldo scuro. La tua colorazione ha una profondità rara.",
    },
  },
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return [r, g, b]
}

function lightenHex(hex: string, amount = 0.85): string {
  const [r, g, b] = hexToRgb(hex)
  const nr = Math.round(r + (255 - r) * amount)
  const ng = Math.round(g + (255 - g) * amount)
  const nb = Math.round(b + (255 - b) * amount)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

function drawBullet(doc: PDFKit.PDFDocument, x: number, y: number, color: string) {
  doc.circle(x, y + 5, 3).fill(color)
}

export interface PDFInput {
  customerName: string
  customerEmail: string
  season: string
  subgroup: string
  notes?: string
}

export function generatePDF(input: PDFInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: MARGIN,
      autoFirstPage: false,
      info: { Title: 'Analisi Armocromia Personalizzata', Author: 'youglamour.it' },
    })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const seasonKey = Object.keys(SEASON_DATA).find(k =>
      input.season.toLowerCase().includes(k.toLowerCase()) ||
      input.subgroup?.toLowerCase().includes(k.toLowerCase())
    ) || 'Primavera'

    const data = SEASON_DATA[seasonKey]
    const subgroupDesc = data.subgroups[input.subgroup] || data.subgroups[Object.keys(data.subgroups)[0]]
    const neighbor = SUBGROUP_NEIGHBORS[input.subgroup]

    // ── PAG 1: COPERTINA ─────────────────────────────────────────────────────
    doc.addPage({ size: 'A4' })
    drawCover(doc, data, input)

    // ── PAG 2: LA TUA STAGIONE ───────────────────────────────────────────────
    doc.addPage({ size: 'A4' })
    drawPageHeader(doc, data, 'La Tua Stagione')

    // Descrizione stagione
    doc.fontSize(20).font('Times-Bold').fillColor(data.accent).text(seasonKey, MARGIN, 112, { lineBreak: false })
    doc.fontSize(10).font('Helvetica').fillColor('#555555')
      .text(data.description, MARGIN, 140, { width: CONTENT_W, lineGap: 2 })

    // Calcola altezza descrizione (appross. 3 righe = 48px)
    const descLines = Math.ceil(data.description.length / 90)
    const descH = descLines * 15 + 6
    let y2 = 140 + descH

    doc.rect(MARGIN, y2, CONTENT_W, 0.8).fill('#E0D8D0')
    y2 += 12
    doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA').text('IL TUO SOTTOGRUPPO', MARGIN, y2, { characterSpacing: 1.5, lineBreak: false })
    y2 += 15
    doc.fontSize(14).font('Times-Bold').fillColor(data.accent).text(input.subgroup || seasonKey, MARGIN, y2, { lineBreak: false })
    y2 += 22
    doc.fontSize(10).font('Helvetica').fillColor('#555555').text(subgroupDesc, MARGIN, y2, { width: CONTENT_W, lineGap: 2 })

    const subLines = Math.ceil(subgroupDesc.length / 90)
    const subH = subLines * 15 + 6
    y2 += subH

    doc.rect(MARGIN, y2, CONTENT_W, 0.8).fill('#E0D8D0')
    y2 += 12
    doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA').text('CARATTERISTICHE', MARGIN, y2, { characterSpacing: 1.5, lineBreak: false })
    y2 += 15
    for (const c of data.characteristics) {
      drawBullet(doc, MARGIN + 7, y2, data.accent)
      doc.fontSize(10).font('Helvetica').fillColor('#333333').text(c, MARGIN + 18, y2, { width: CONTENT_W - 18, lineBreak: false })
      y2 += 19
    }

    drawPageFooter(doc, data)

    // ── PAG 3: PALETTE + CONFINANTI + DA EVITARE ─────────────────────────────
    doc.addPage({ size: 'A4' })
    drawPageHeader(doc, data, 'La Tua Palette Colori')

    // Colori valorizzanti — grid 5×3
    let y3 = 110
    doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA').text('COLORI CHE TI VALORIZZANO', MARGIN, y3, { characterSpacing: 1.5, lineBreak: false })
    y3 += 14

    const swW = 82, swH = 40, swGapX = 10
    const swRowH = swH + 14 + 6 // swatch + label + gap
    const gridW3 = 5 * swW + 4 * swGapX
    const startX3 = (PAGE_W - gridW3) / 2

    for (let i = 0; i < 15; i++) {
      const col = i % 5
      const row = Math.floor(i / 5)
      const x = startX3 + col * (swW + swGapX)
      const sy = y3 + row * swRowH
      doc.roundedRect(x, sy, swW, swH, 5).fill(data.palette[i].hex)
      doc.fontSize(7).font('Helvetica').fillColor('#555555').text(data.palette[i].name, x, sy + swH + 3, { width: swW, align: 'center', lineBreak: false })
    }
    y3 += 3 * swRowH + 2

    // Colori confinanti
    if (neighbor) {
      doc.rect(MARGIN, y3, CONTENT_W, 0.8).fill('#E0D8D0')
      y3 += 12
      doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA').text('COLORI DAL SOTTOGRUPPO CONFINANTE', MARGIN, y3, { characterSpacing: 1.5, lineBreak: false })
      y3 += 13
      doc.fontSize(8.5).font('Helvetica').fillColor(data.accent).text(`In prestito da: ${neighbor.label}`, MARGIN, y3, { lineBreak: false })
      y3 += 14

      const nbW = 78, nbH = 36, nbGap = 11
      const nbTotal = 5 * nbW + 4 * nbGap
      const nbStartX = (PAGE_W - nbTotal) / 2
      for (let i = 0; i < 5; i++) {
        const x = nbStartX + i * (nbW + nbGap)
        doc.roundedRect(x, y3, nbW, nbH, 5).fill(neighbor.colors[i].hex)
        doc.fontSize(7).font('Helvetica').fillColor('#555555').text(neighbor.colors[i].name, x, y3 + nbH + 3, { width: nbW, align: 'center', lineBreak: false })
      }
      y3 += nbH + 18
    }

    // Colori da evitare
    doc.rect(MARGIN, y3, CONTENT_W, 0.8).fill('#E0D8D0')
    y3 += 12
    doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA').text('COLORI DA EVITARE', MARGIN, y3, { characterSpacing: 1.5, lineBreak: false })
    y3 += 14

    const avW = 68, avH = 36, avGap = 13
    const avTotal = 6 * avW + 5 * avGap
    const avStartX3 = (PAGE_W - avTotal) / 2
    for (let i = 0; i < 6; i++) {
      const x = avStartX3 + i * (avW + avGap)
      doc.roundedRect(x, y3, avW, avH, 5).fill(data.avoidColors[i].hex)
      doc.fontSize(14).fillColor('rgba(255,255,255,0.85)').text('✕', x, y3 + 9, { width: avW, align: 'center', lineBreak: false })
      doc.fontSize(7).font('Helvetica').fillColor('#666666').text(data.avoidColors[i].name, x, y3 + avH + 3, { width: avW, align: 'center', lineBreak: false })
    }

    drawPageFooter(doc, data)

    // ── PAG 4: MAKE-UP & STILE ───────────────────────────────────────────────
    doc.addPage({ size: 'A4' })
    drawPageHeader(doc, data, 'Make-up & Stile')

    let y4 = 110
    doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA').text('CONSIGLI MAKE-UP', MARGIN, y4, { characterSpacing: 1.5, lineBreak: false })
    y4 += 14

    const mkRowH = 40
    for (const item of data.makeup) {
      doc.rect(MARGIN, y4, 3, mkRowH - 4).fill(data.accent)
      doc.fontSize(7.5).font('Helvetica').fillColor('#AAAAAA').text(item.label.toUpperCase(), MARGIN + 11, y4 + 2, { characterSpacing: 0.8, lineBreak: false })
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(item.value, MARGIN + 11, y4 + 14, { width: CONTENT_W - 11, lineBreak: false })
      y4 += mkRowH
    }

    y4 += 8
    doc.rect(MARGIN, y4, CONTENT_W, 0.8).fill('#E0D8D0')
    y4 += 12

    doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA').text('CONSIGLI DI STILE', MARGIN, y4, { characterSpacing: 1.5, lineBreak: false })
    y4 += 14

    const stRowH = 32
    for (const tip of data.styleAdvice) {
      doc.roundedRect(MARGIN, y4, CONTENT_W, stRowH - 4, 4).fill(lightenHex(data.accent, 0.9))
      drawBullet(doc, MARGIN + 13, y4 + 10, data.accent)
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(tip, MARGIN + 25, y4 + 10, { width: CONTENT_W - 35, lineBreak: false })
      y4 += stRowH
    }

    drawPageFooter(doc, data)

    // ── PAG 5: CONCLUSIONE ───────────────────────────────────────────────────
    doc.addPage({ size: 'A4' })
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(data.light)
    doc.rect(0, 0, PAGE_W, 8).fill(data.accent)
    doc.rect(0, PAGE_H - 8, PAGE_W, 8).fill(data.accent)
    doc.circle(PAGE_W / 2, PAGE_H / 2, 200).fill(lightenHex(data.accent, 0.93))

    doc.fontSize(9).font('Helvetica').fillColor('#BBBBBB').text('youglamour.it', MARGIN, 55, { width: CONTENT_W, align: 'center', characterSpacing: 2, lineBreak: false })
    doc.fontSize(26).font('Times-Bold').fillColor(data.accent).text(`Ciao, ${input.customerName}!`, MARGIN, 150, { width: CONTENT_W, align: 'center', lineBreak: false })
    doc.fontSize(11).font('Times-Roman').fillColor('#555555')
      .text(
        'Questo PDF è la tua guida personale — uno strumento pensato per aiutarti\na vestirti con intenzione e piacere, scegliendo ogni giorno i colori che\nti fanno sentire davvero al tuo meglio.',
        MARGIN + 30, 194, { width: CONTENT_W - 60, lineGap: 4, align: 'center' }
      )
    doc.fontSize(11).font('Times-Roman').fillColor('#777777')
      .text(
        "Non esistono regole assolute: l'armocromia è un linguaggio,\ne tu ne sei la voce. Usala con curiosità e con gioia.",
        MARGIN + 30, 264, { width: CONTENT_W - 60, lineGap: 4, align: 'center' }
      )

    // Box riepilogo
    const bx = MARGIN + 40, bw = CONTENT_W - 80, bh = 105, by = 330
    doc.roundedRect(bx, by, bw, bh, 12).fill('#FFFFFF')
    doc.roundedRect(bx, by, bw, bh, 12).stroke(data.accent)
    doc.fontSize(8).font('Helvetica').fillColor('#BBBBBB').text('IL TUO PROFILO', MARGIN, by + 14, { width: CONTENT_W, align: 'center', characterSpacing: 1.5, lineBreak: false })
    doc.fontSize(16).font('Times-Bold').fillColor(data.accent).text(input.subgroup || input.season, MARGIN, by + 30, { width: CONTENT_W, align: 'center', lineBreak: false })
    doc.fontSize(11).font('Helvetica').fillColor('#777777').text(input.customerName, MARGIN, by + 56, { width: CONTENT_W, align: 'center', lineBreak: false })
    doc.fontSize(9).font('Helvetica').fillColor('#BBBBBB').text(
      new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }),
      MARGIN, by + 74, { width: CONTENT_W, align: 'center', lineBreak: false }
    )

    doc.fontSize(10).font('Helvetica').fillColor('#AAAAAA').text('Hai domande? Scrivici a', MARGIN, 460, { width: CONTENT_W, align: 'center', lineBreak: false })
    doc.fontSize(11).font('Helvetica').fillColor(data.accent).text('veronica@youglamour.it', MARGIN, 478, { width: CONTENT_W, align: 'center', lineBreak: false })

    doc.end()
  })
}

function drawCover(doc: PDFKit.PDFDocument, data: SeasonInfo, input: PDFInput) {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(data.light)
  doc.rect(0, 0, PAGE_W, 12).fill(data.accent)
  doc.rect(0, PAGE_H - 12, PAGE_W, 12).fill(data.accent)
  doc.circle(PAGE_W / 2, PAGE_H / 2, 210).fill(lightenHex(data.accent, 0.93))

  let y = 55
  doc.fontSize(9).font('Helvetica').fillColor('#BBBBBB')
    .text('youglamour.it', MARGIN, y, { width: CONTENT_W, align: 'center', characterSpacing: 2.5 })

  y = 160
  doc.fontSize(10.5).font('Helvetica').fillColor('#BBBBBB')
    .text('ANALISI ARMOCROMIA', MARGIN, y, { width: CONTENT_W, align: 'center', characterSpacing: 3 })
  y += 22
  doc.fontSize(36).font('Times-Bold').fillColor(data.accent)
    .text('Personalizzata', MARGIN, y, { width: CONTENT_W, align: 'center' })

  y += 66
  doc.rect((PAGE_W - 70) / 2, y, 70, 1.5).fill(data.accent)

  y += 24
  doc.fontSize(9.5).font('Helvetica').fillColor('#BBBBBB')
    .text('PREPARATA PER', MARGIN, y, { width: CONTENT_W, align: 'center', characterSpacing: 2 })
  y += 18
  doc.fontSize(28).font('Times-Bold').fillColor('#333333')
    .text(input.customerName, MARGIN, y, { width: CONTENT_W, align: 'center' })

  y += 50
  doc.fontSize(9.5).font('Helvetica').fillColor('#BBBBBB')
    .text('IL TUO SOTTOGRUPPO', MARGIN, y, { width: CONTENT_W, align: 'center', characterSpacing: 2 })
  y += 18

  const badgeW = 260, badgeH = 44
  const badgeX = (PAGE_W - badgeW) / 2
  doc.roundedRect(badgeX, y, badgeW, badgeH, 22).fill(data.accent)
  doc.fontSize(15).font('Times-Bold').fillColor('#FFFFFF')
    .text(input.subgroup || input.season, badgeX, y + 13, { width: badgeW, align: 'center' })

  y += badgeH + 50
  doc.fontSize(8.5).font('Helvetica').fillColor('#CCCCCC')
    .text(
      new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }),
      MARGIN, y, { width: CONTENT_W, align: 'center' }
    )
}

function drawPageHeader(doc: PDFKit.PDFDocument, data: SeasonInfo, title: string) {
  doc.rect(0, 0, PAGE_W, 88).fill(data.accent)
  doc.rect(0, 88, PAGE_W, 4).fill(lightenHex(data.accent, 0.5))
  doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.6)')
    .text('youglamour.it  —  ANALISI ARMOCROMIA PERSONALIZZATA', MARGIN, 22, { width: CONTENT_W })
  doc.fontSize(21).font('Times-Bold').fillColor('#FFFFFF')
    .text(title, MARGIN, 42, { width: CONTENT_W })
}

function drawPageFooter(doc: PDFKit.PDFDocument, data: SeasonInfo) {
  const y = PAGE_H - 38
  doc.rect(MARGIN, y, CONTENT_W, 0.5).fill('#E0D8D0')
  doc.fontSize(8).font('Helvetica').fillColor('#CCCCCC')
    .text('youglamour.it  ·  Analisi Armocromia Personalizzata',
      MARGIN, y + 8, { width: CONTENT_W, align: 'center' })
}
