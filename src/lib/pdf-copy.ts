/**
 * Copy per il PDF armocromia — 16 sottogruppi × 4 blocchi (Guida rapida).
 *
 * Blocchi:
 *  - strengths      Punti di forza
 *  - valorizza      Cosa valorizza
 *  - evita          Cosa evitare
 *  - stileAdvice    Consigli di stile (almeno 3 frasi/bullet)
 *
 * Bozza da editare da Veronica. Mantieni 3-4 bullet per blocco e tono caldo/pratico.
 */

export interface SubgroupCopy {
  strengths: string[]
  valorizza: string[]
  evita: string[]
  stileAdvice: string[]
}

export const SUBGROUP_COPY: Record<string, SubgroupCopy> = {
  // ── PRIMAVERA ──────────────────────────────────────────────────────────────
  'Primavera Assoluta': {
    strengths: [
      'Luminosità calda e dorata',
      'Contrasto alto tra pelle, occhi e capelli',
      "Riflessi pesca e oro nell'incarnato",
      'Energia vivace e naturale',
    ],
    valorizza: [
      'Colori caldi e luminosi: corallo, pesca, turchese caldo',
      'Tessuti leggeri: seta, chiffon, lino',
      'Gioielli in oro, rame, legno chiaro',
      'Pattern floreali e a pois in toni caldi',
    ],
    evita: [
      'Nero puro vicino al viso',
      'Bianco ottico freddo',
      'Grigi e blu navy spenti',
      'Tessuti pesanti e contrasti scuri',
    ],
    stileAdvice: [
      'Corallo + avorio caldo è il tuo signature look per eccellenza.',
      'Mixa colori caldi senza paura: la tua palette ama la vivacità solare.',
      "Per il guardaroba invernale punta su cammello, caramello e verde muschio.",
    ],
  },

  'Spring Light': {
    strengths: [
      'Luminosità eterea e delicata',
      'Sottotono dorato chiaro',
      'Lineamenti morbidi e armoniosi',
      'Freschezza naturale primaverile',
    ],
    valorizza: [
      'Pastelli caldi: pesca chiaro, corallo tenue, verde acqua caldo',
      'Tessuti fluidi e leggeri',
      'Accessori in oro chiaro o oro rosa',
      'Stampe minute e delicate',
    ],
    evita: [
      'Colori troppo saturi o scuri',
      'Nero e blu intensi che ti appesantiscono',
      'Contrasti netti bianco/nero',
      'Tessuti rigidi e strutturati',
    ],
    stileAdvice: [
      "La tua forza è la luminosità eterea: scegli colori chiari senza inseguire il contrasto drammatico.",
      'Abbina pesca chiaro + verde acqua per un look fresco e armonioso.',
      'Tessuti leggeri e trasparenti ti valorizzano più di quelli strutturati.',
    ],
  },

  'Spring Warm': {
    strengths: [
      'Calore dorato profondo',
      'Riflessi ramati e ambrati',
      'Tono caldo e avvolgente',
      'Versatilità tra fresco e terroso',
    ],
    valorizza: [
      'Toni terrosi caldi: terracotta, bronzo, cammello, cachi',
      'Tessuti strutturati: tweed, lana, suede',
      'Gioielli in oro antico, rame, ambra',
      'Stampe etniche e geometriche calde',
    ],
    evita: [
      'Rosa freddi e malva spenti',
      'Bianco e grigi freddi',
      'Blu elettrico e viola freddi',
      'Tonalità polverose senza luce',
    ],
    stileAdvice: [
      'Terracotta + verde cachi è il tuo abbinamento più caratteristico.',
      "Sei la Primavera che osa anche il caramello e il bronzo.",
      'Tessuti naturali con texture (suede, lino) ti esaltano.',
    ],
  },

  'Spring Bright': {
    strengths: [
      'Luminosità cristallina e nitida',
      'Contrasto naturale alto',
      'Capacità di portare colori accesi',
      'Energia brillante e moderna',
    ],
    valorizza: [
      'Colori vividi: corallo acceso, turchese brillante, fucsia caldo',
      'Tessuti compatti con finiture lisce',
      'Gioielli in oro lucido e pietre vivaci',
      'Pattern grafici e bold',
    ],
    evita: [
      'Colori smorzati o polverosi',
      'Beige e marroni opachi',
      'Pastelli troppo sbiaditi',
      "Tessuti dall'aspetto spento",
    ],
    stileAdvice: [
      'Corallo brillante + turchese acceso è il tuo segno distintivo.',
      "La tua palette ama l'intensità: punta sui colori accesi senza paura.",
      'Tessuti lisci e luminosi ti valorizzano: evita gli opachi.',
    ],
  },

  // ── ESTATE ─────────────────────────────────────────────────────────────────
  'Estate Assoluta': {
    strengths: [
      'Eleganza eterea e raffinata',
      'Sottotono freddo rosato',
      'Armonia in sfumatura',
      'Grazia naturale senza sforzo',
    ],
    valorizza: [
      'Toni freddi e morbidi: malva, lavanda, rosa cipria',
      'Tessuti fluidi: seta, jersey, chiffon',
      'Gioielli in argento, platino, perle',
      'Stampe delicate: paisley tenue, pizzo, fiorellini',
    ],
    evita: [
      'Arancio e giallo caldo',
      'Rosso fuoco e terracotta',
      'Marroni caldi e bronzo',
      'Contrasti forti e tessuti rigidi',
    ],
    stileAdvice: [
      'Malva + grigio perla è il tuo abbinamento signature, di giorno come di sera.',
      'Tessuti fluidi e stampe delicate amplificano la tua grazia.',
      'Evita i contrasti netti: la sfumatura è la tua forza.',
    ],
  },

  'Summer Light': {
    strengths: [
      'Leggerezza luminosa e fresca',
      'Sottotono freddo delicato',
      'Trasparenza nei colori chiari',
      'Eleganza discreta e poetica',
    ],
    valorizza: [
      'Pastelli freddi: lavanda chiara, rosa cipria, azzurro nebbia',
      'Tessuti diafani e impalpabili',
      'Argento opaco e perle naturali',
      'Stampe acquerellate e sfumate',
    ],
    evita: [
      'Colori troppo intensi o scuri',
      'Toni caldi: pesca, corallo, terracotta',
      'Nero pieno vicino al viso',
      'Contrasti drammatici',
    ],
    stileAdvice: [
      'Scegli pastelli freddi e tessuti trasparenti per un look poetico.',
      'Abbina rosa cipria + azzurro latte per un effetto fresco e raffinato.',
      'Argento opaco e perle valorizzano più di qualsiasi oro.',
    ],
  },

  'Summer Soft': {
    strengths: [
      'Qualità vellutata e avvolgente',
      'Sottotono freddo smorzato',
      'Profondità morbida senza durezza',
      'Versatilità tra freddo e caldo',
    ],
    valorizza: [
      'Neutri smorzati: malva polveroso, grigio tortora, verde salvia',
      'Tessuti opachi: cashmere, jersey, crepe',
      'Argento antico o oro rosa molto delicato',
      'Stampe sfumate e toni misti',
    ],
    evita: [
      'Colori puri e saturi',
      'Toni caldi accesi: arancio, giallo dorato',
      'Bianco ottico e contrasti netti',
      'Stampe troppo grafiche o vivide',
    ],
    stileAdvice: [
      'Malva polveroso + grigio tortora è il tuo look più riconoscibile.',
      'Cashmere e crepe valorizzano la tua qualità vellutata.',
      'Stampe sfumate amplificano la tua eleganza discreta.',
    ],
  },

  'Summer Cool': {
    strengths: [
      'Eleganza fredda con più carattere',
      'Capacità di portare toni profondi',
      'Sottotono freddo deciso',
      'Contrasto più marcato rispetto alle altre Estati',
    ],
    valorizza: [
      'Toni freddi profondi: prugna, periwinkle, bordeaux rosato',
      'Tessuti strutturati ma fluidi: crepe, raso, lana fine',
      'Argento, platino, pietre fredde',
      'Pattern geometrici sfumati',
    ],
    evita: [
      'Toni caldi: arancio, giallo dorato, terracotta',
      'Marroni caldi e cammello',
      'Bianco crema e avorio caldo',
      'Stampe troppo soft o pastello',
    ],
    stileAdvice: [
      'Puoi osare il bordeaux freddo e il prugna: la tua palette ha più profondità.',
      'Periwinkle + grigio perla è un abbinamento elegante e moderno.',
      'Tessuti strutturati ti valorizzano più di quelli vaporosi.',
    ],
  },

  // ── AUTUNNO ────────────────────────────────────────────────────────────────
  'Autunno Assoluto': {
    strengths: [
      'Ricchezza calda e opulenta',
      'Sottotono dorato-aranciato',
      'Profondità terrosa naturale',
      'Capacità di portare colori intensi',
    ],
    valorizza: [
      'Toni terrosi: ruggine, senape, verde foresta',
      'Tessuti naturali: lana, tweed, velluto, suede',
      'Oro antico, ambra, turchese, corallo',
      'Stampe etniche, tartán, paisley caldi',
    ],
    evita: [
      'Rosa freddi e pastelli polverosi',
      'Bianco puro e grigi freddi',
      'Blu elettrico e fucsia',
      'Tessuti sintetici lucidi',
    ],
    stileAdvice: [
      'Arancio bruciato + marrone cioccolato è il tuo signature opulento.',
      'Tessuti naturali (tweed, velluto, suede) ti esaltano magnificamente.',
      'Il verde oliva è il tuo neutral perfetto: funziona con quasi tutto.',
    ],
  },

  'Autumn Soft': {
    strengths: [
      'Profondità morbida e raffinata',
      'Sottotono caldo smorzato',
      'Eleganza terrosa senza durezza',
      "Versatilità con la palette Estate",
    ],
    valorizza: [
      'Neutri caldi smorzati: bronzo antico, cammello, salvia calda',
      'Tessuti opachi e materici: lino, lana fine, cotone',
      'Oro antico e ottone spazzolato',
      'Stampe sfumate e tono su tono',
    ],
    evita: [
      'Colori puri e brillanti',
      'Contrasti netti',
      'Bianco ottico e nero pieno',
      'Pattern troppo vividi',
    ],
    stileAdvice: [
      'Cammello + verde salvia caldo è il tuo abbinamento tono su tono ideale.',
      'Tessuti materici come lino e lana fine valorizzano la tua morbidezza.',
      'Stampe sfumate amplificano la tua eleganza discreta.',
    ],
  },

  'Autumn Warm': {
    strengths: [
      'Luminosità calda e dorata',
      'Riflessi ramati nei capelli',
      'Capacità di osare toni vivaci',
      'Versatilità con la palette Primavera',
    ],
    valorizza: [
      'Toni caldi luminosi: pesca caldo, caramello, oro, lime caldo',
      'Tessuti naturali con texture: suede chiaro, lino, cotone strutturato',
      'Oro giallo, rame chiaro, legno chiaro',
      'Stampe a pois caldi o geometriche soft',
    ],
    evita: [
      'Toni freddi e rosati',
      'Pastelli polverosi senza luce',
      'Grigi freddi e blu navy',
      'Bianco ottico',
    ],
    stileAdvice: [
      'Caramello + verde lime caldo è il tuo look più solare.',
      "Sei l'Autunno più vivace: punta su tessuti naturali in toni dorati.",
      'Oro giallo e ambra ti valorizzano più di qualsiasi argento.',
    ],
  },

  'Autumn Deep': {
    strengths: [
      'Profondità calda e intensa',
      'Capacità di portare colori scuri',
      'Contrasto naturale medio-alto',
      'Bellezza ricca e magnetica',
    ],
    valorizza: [
      'Colori profondi caldi: borgogna scuro, cioccolato, verde bottiglia, prugna calda',
      'Tessuti pregiati: velluto, lana pesante, pelle',
      'Oro antico scuro, pietre profonde',
      'Stampe ricche: tartán scuri, etniche profonde',
    ],
    evita: [
      'Pastelli freddi e tinte chiare polverose',
      'Bianco puro e azzurri ghiaccio',
      'Rosa freddi e malva',
      "Tessuti dall'aspetto fragile",
    ],
    stileAdvice: [
      'Borgogna + verde bottiglia è il tuo look più caratteristico.',
      "Velluto e lana pesante valorizzano la tua profondità calda.",
      "Punta sull'oro antico scuro: gli argenti freddi smorzano il tuo magnetismo.",
    ],
  },

  // ── INVERNO ────────────────────────────────────────────────────────────────
  'Inverno Assoluto': {
    strengths: [
      'Eleganza drammatica e netta',
      'Contrasto alto tra pelle, occhi e capelli',
      'Capacità di portare bianco e nero puri',
      'Sofisticazione naturale',
    ],
    valorizza: [
      'Colori netti: bianco puro, nero, rosso intenso, blu royal',
      'Tessuti pregiati: seta, raso, crepe, cashmere',
      'Argento, cristallo, platino, pietre fredde',
      'Pattern geometrici e stampe grafiche bold',
    ],
    evita: [
      'Toni caldi: arancio, giallo dorato, terracotta',
      'Beige caldo e marroni caldi',
      'Caramello e oro giallo intenso',
      "Tessuti dall'aspetto polveroso",
    ],
    stileAdvice: [
      'Bianco + nero è il tuo look definitivo.',
      'Per la sera: nero + rosso intenso, sempre vincente.',
      'Pattern geometrici netti e stampe bold ti valorizzano senza appesantirti.',
    ],
  },

  'Winter Cool': {
    strengths: [
      'Eleganza fredda e sfumata',
      'Sottotono freddo deciso',
      'Capacità di portare toni delicati',
      "Versatilità con la palette Estate",
    ],
    valorizza: [
      'Toni freddi delicati: azzurro ghiaccio, malva freddo, prugna chiara, rosso carminio',
      'Tessuti fluidi e lisci',
      'Argento e platino, pietre fredde chiare',
      'Pattern sfumati e geometrici soft',
    ],
    evita: [
      'Toni caldi e dorati',
      'Beige e marroni caldi',
      'Arancio e terracotta',
      'Stampe etniche calde',
    ],
    stileAdvice: [
      'Scegli toni freddi delicati senza mai inseguire il caldo.',
      'Azzurro ghiaccio + grigio perla è un abbinamento ultra-elegante.',
      "Argento e platino valorizzano molto più dell'oro nei tuoi accessori.",
    ],
  },

  'Winter Bright': {
    strengths: [
      'Luminosità fredda cristallina',
      'Capacità di portare colori accesi',
      'Sottotono freddo brillante',
      'Energia moderna e nitida',
    ],
    valorizza: [
      'Colori vividi freddi: fucsia, ciclamino, turchese elettrico, lime brillante',
      'Tessuti lisci e luminosi',
      'Argento lucido, cristallo, pietre brillanti',
      'Pattern grafici netti',
    ],
    evita: [
      'Toni smorzati e polverosi',
      'Beige e marroni caldi',
      'Pastelli sbiaditi',
      "Tessuti dall'aspetto opaco",
    ],
    stileAdvice: [
      'Fucsia + nero è il tuo look più riconoscibile.',
      'Verde smeraldo + bianco ottico è un abbinamento moderno e nitido.',
      'Tessuti lisci e luminosi amplificano la tua chiarezza cristallina.',
    ],
  },

  'Winter Deep': {
    strengths: [
      'Profondità fredda e intensa',
      'Capacità di portare colori scuri puri',
      'Contrasto naturale alto',
      'Bellezza mediterranea magnetica',
    ],
    valorizza: [
      'Colori profondi freddi: nero, bordeaux scuro, blu notte, smeraldo scuro',
      'Tessuti pregiati: seta pesante, velluto, cashmere',
      'Argento, platino, pietre profonde fredde',
      'Pattern geometrici netti, stampe grafiche scure',
    ],
    evita: [
      'Toni caldi e dorati',
      'Beige caldo, cammello, ocra',
      'Pastelli polverosi',
      'Verde oliva e marrone caldo',
    ],
    stileAdvice: [
      'Nero + smeraldo scuro è il tuo look più sofisticato.',
      'Bordeaux scuro + bianco ottico crea un contrasto magnetico.',
      'Velluto e seta pesante valorizzano la tua profondità.',
    ],
  },
}
