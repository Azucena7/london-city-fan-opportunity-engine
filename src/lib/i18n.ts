export type Lang = "en" | "es";

export const dictionary = {
  en: {
    nav: {
      overview: "Overview",
      thisWeek: "This week",
      travel: "Travel",
      fixtures: "Fixtures",
      territories: "Territories",
      signals: "Live signals",
      story: "Story mode"
    },
    common: {
      prototype: "PUBLIC PROTOTYPE",
      destination: "Destination",
      provider: "Provider",
      changes: "Changes",
      walking: "Walking",
      checked: "Checked",
      source: "Source",
      waiting: "WAITING",
      live: "LIVE",
      measured: "MEASURED",
      inferred: "INFERRED",
      structural: "STRUCTURAL",
      unknown: "Unknown",
      automatic: "Automatic",
      date: "Date",
      venue: "Venue",
      selection: "Selection",
      target: "Target",
      product: "Product",
      channel: "Channel",
      score: "Score",
      decision: "Decision",
      opponent: "Opponent",
      territory: "Territory",
      calendar: "Calendar",
      attention: "Attention",
      fixtureAppeal: "Fixture appeal",
      weather: "Weather",
      momentum: "Momentum",
      exploreAll: "Explore all →",
      fullCalendar: "Full calendar →",
      publicPrototype: "Research-led prototype · not an official club product."
    },
    overview: {
      question: "THE QUESTION",
      title: "Where are the next 1,000 recurring fans?",
      lede:
        "A practical decision engine for turning geography, grassroots football, calendar whitespace and matchday signals into concrete acquisition plays.",
      aiLine1: "AI is not the story.",
      aiLine2: "The decision is.",
      territories: "Territories modelled",
      fixtures: "Fixtures scored",
      bestWindow: "Best current window",
      logic: "Operating logic",
      where: "WHERE",
      priorityTerritories: "Priority territories",
      when: "WHEN",
      opportunityCalendar: "Opportunity calendar",
      thesis: "OPERATING THESIS",
      thesisTitle: "Don’t ask fans to change clubs.",
      thesisText:
        "Compete for the decision that actually matters: “What are you doing this Sunday?”",
      planningScore: "PLANNING SCORE",
      planningFormula:
        "35% Territory + 25% Calendar + 20% Attention + 20% Fixture Appeal",
      planningNote:
        "Weather and attendance momentum activate inside the live matchday window."
    },
    weekly: {
      eyebrow: "WEEKLY DECISION",
      messageFallback: "Elite women’s football is closer than you think."
    },
    transparency: {
      eyebrow: "MODEL TRANSPARENCY",
      title: "What is automated, measured or inferred?",
      territory: "Territory opportunity",
      territoryDetail: "Modelled from families, grassroots network and access.",
      calendar: "Calendar whitespace",
      calendarDetail: "Competitor home inventory and local fixture context.",
      attention: "Attention pressure",
      attentionDetail: "Events, TV, holidays and competing sport.",
      weather: "Weather",
      weatherDetail: "Only activated inside a reliable forecast window.",
      momentum: "Attendance momentum",
      momentumDetail: "Requires current sales / scans / recent demand data.",
      appeal: "Fixture appeal",
      appealDetail: "Expert prior until enough observed club data replaces it."
    },
    thisWeek: {
      operatingView: "OPERATING VIEW",
      title: "What should the club do this week?",
      lede:
        "The next home fixture is selected automatically from the fixture dataset.",
      nextHome: "NEXT HOME FIXTURE",
      signalState: "SIGNAL STATE",
      readiness: "Live decision readiness",
      evidence: "EVIDENCE",
      why: "Why does the engine believe this?",
      rule: "OPERATING RULE",
      ruleTitle: "Resolve the fixture first. Activate live signals second.",
      ruleText:
        "Weather is never attached to an arbitrary date. Attendance momentum remains inactive until a reliable source exists.",
      noLive: "No live decision yet.",
      noLiveText:
        "The engine only upgrades from planning to live when weather and attendance momentum are genuinely available.",
      liveInputs: "live inputs available",
      updatedCurrent: "Updated from current V1 inputs"
    },
    evidence: {
      territorySource: "Families + girls' football network + matchday access",
      territoryNote: "Modelled from the structural V1 dataset.",
      calendarSource: "Competitor home fixtures and local inventory",
      calendarNote: "Current schedule-based opportunity layer.",
      attentionSource: "Events, TV, holidays and competing sport",
      attentionNote: "Planning estimate; should be re-checked closer to fixture.",
      weatherSource: "Reliable forecast window only",
      weatherNote: "Activates 5–7 days before matchday.",
      momentumSource: "Sales / scans / recent demand",
      momentumNote: "Requires current club-side or verified attendance data.",
      appealSource: "Opponent brand + likely demand + occasion",
      appealNote: "Expert prior until enough observed club data exists."
    },
    signals: {
      territoryDetail: "Bromley / Croydon priority territories",
      calendarDetail: "High whitespace vs nearby WSL inventory",
      attentionDetail: "Availability after external pressure",
      appealDetail: "Opponent / occasion prior",
      weatherDetail: "Activate in forecast window",
      momentumDetail: "Needs current sales / scans"
    },
    weather: {
      loading: "Loading live forecast…",
      unavailable: "Forecast unavailable",
      unavailableText: "The engine will not substitute a guessed weather score.",
      noDate: "No fixture date available",
      noDateText: "Weather remains inactive until the next home fixture can be resolved.",
      outside: "Outside forecast window",
      outsideText: "The engine will activate weather only when that match enters the 7-day forecast horizon.",
      suitability: "Weather suitability",
      refreshed: "Refreshed automatically"
    },
    travel: {
      eyebrow: "FAN EXPERIENCE × ACQUISITION SIGNAL",
      title: "Can I actually get to the match?",
      lede:
        "A fan-facing journey tool that also gives the growth engine a better measure of matchday friction.",
      ukToHayes: "UK → HAYES LANE",
      whereFrom: "Where are you coming from?",
      helper:
        "The engine resolves the origin first. London journeys route through TfL; origins elsewhere in Great Britain route through the national layer.",
      originLabel: "Postcode, station, town or city",
      originPlaceholder: "e.g. Cambridge, CR0 7AB, London Bridge",
      travelNow: "Travel now",
      matchday: "Matchday",
      check: "Check journey",
      resolving: "Resolving…",
      originRecognised: "Origin recognised",
      routingLayer: "Routing layer",
      gb: "Great Britain",
      noPostcode: "No postcode returned",
      accessScore: "ACCESS SCORE",
      routeUnavailable: "Journey unavailable",
      why: "WHY THIS MATTERS",
      whyTitle:
        "Twenty kilometres is not a customer insight. Twenty-seven minutes with no changes is.",
      whyText:
        "Accessibility should respond to the actual journey: duration, changes, walking burden and disruption.",
      nationalSetup:
        "National origin recognised — routing layer needs activation"
    },
    pages: {
      fixturesEyebrow: "FIXTURE DECISION CALENDAR",
      fixturesTitle: "Which home matches deserve acquisition spend?",
      territoriesEyebrow: "TERRITORY OPPORTUNITY",
      territoriesTitle: "Where should London City attack first?",
      signalsEyebrow: "LIVE SIGNALS",
      signalsTitle: "What can change the decision close to matchday?",
      storyEyebrow: "STORY MODE",
      storyTitle: "Alexia doesn’t fill stadiums. You do.",
      storyLede:
        "A practical experiment in turning star-driven attention into recurring matchday behaviour."
    },
    story: {
      problem: "Problem",
      problemTitle: "Stars create attention. They do not automatically create habit.",
      problemText:
        "The commercial question is not how much attention a signing creates. It is where recurring attendance can realistically come from.",
      where: "Where",
      whereTitle: "Find family-rich territories connected to girls’ football.",
      whereText:
        "Families, grassroots nodes and matchday accessibility reveal areas that standard fanbase assumptions can miss.",
      when: "When",
      whenTitle: "Not every home match deserves the same acquisition budget.",
      whenText:
        "Calendar whitespace, opponent appeal and competing attention create radically different windows across the season.",
      action: "Action",
      actionTitle: "Turn the score into one specific play.",
      actionText:
        "Target territory, product, channel, message and KPI are selected for the fixture — not left as a dashboard interpretation exercise.",
      learn: "Learn",
      learnTitle: "Replace assumptions with observed repeat behaviour.",
      learnText:
        "Postcode, scan, product, source and repeat-purchase data progressively turn the model from research-led to club-specific.",
      shareEyebrow: "THE IDEA IN ONE SENTENCE",
      shareQuote:
        "A four-person team can build capabilities that used to require ten — if AI becomes infrastructure, not the protagonist."
    }
  },
  es: {
    nav: {
      overview: "Resumen",
      thisWeek: "Esta semana",
      travel: "Viaje",
      fixtures: "Partidos",
      territories: "Territorios",
      signals: "Señales live",
      story: "Story mode"
    },
    common: {
      prototype: "PROTOTIPO PÚBLICO",
      destination: "Destino",
      provider: "Proveedor",
      changes: "Cambios",
      walking: "A pie",
      checked: "Consultado",
      source: "Fuente",
      waiting: "EN ESPERA",
      live: "LIVE",
      measured: "MEDIDO",
      inferred: "INFERIDO",
      structural: "ESTRUCTURAL",
      unknown: "Desconocido",
      automatic: "Automática",
      date: "Fecha",
      venue: "Estadio",
      selection: "Selección",
      target: "Objetivo",
      product: "Producto",
      channel: "Canal",
      score: "Score",
      decision: "Decisión",
      opponent: "Rival",
      territory: "Territorio",
      calendar: "Calendario",
      attention: "Atención",
      fixtureAppeal: "Atractivo del partido",
      weather: "Weather",
      momentum: "Momentum",
      exploreAll: "Explorar todos →",
      fullCalendar: "Ver calendario →",
      publicPrototype: "Prototipo basado en investigación · no es un producto oficial del club."
    },
    overview: {
      question: "LA PREGUNTA",
      title: "¿Dónde están los próximos 1.000 aficionados recurrentes?",
      lede:
        "Un motor práctico de decisión que convierte geografía, fútbol base femenino, huecos de calendario y señales de matchday en acciones concretas de captación.",
      aiLine1: "La IA no es la historia.",
      aiLine2: "La decisión sí.",
      territories: "Territorios modelados",
      fixtures: "Partidos puntuados",
      bestWindow: "Mejor ventana actual",
      logic: "Lógica operativa",
      where: "DÓNDE",
      priorityTerritories: "Territorios prioritarios",
      when: "CUÁNDO",
      opportunityCalendar: "Calendario de oportunidad",
      thesis: "TESIS OPERATIVA",
      thesisTitle: "No pidas a la gente que cambie de club.",
      thesisText:
        "Compite por la decisión que de verdad importa: “¿Qué haces este domingo?”",
      planningScore: "SCORE DE PLANIFICACIÓN",
      planningFormula:
        "35% Territorio + 25% Calendario + 20% Atención + 20% Atractivo del partido",
      planningNote:
        "Weather y momentum de asistencia se activan dentro de la ventana live de matchday."
    },
    weekly: {
      eyebrow: "DECISIÓN SEMANAL",
      messageFallback: "El fútbol femenino de élite está más cerca de lo que crees."
    },
    transparency: {
      eyebrow: "TRANSPARENCIA DEL MODELO",
      title: "¿Qué está automatizado, medido o inferido?",
      territory: "Oportunidad territorial",
      territoryDetail: "Modelada con familias, red de fútbol base y acceso.",
      calendar: "Hueco de calendario",
      calendarDetail: "Inventario local y partidos en casa de competidores.",
      attention: "Presión de atención",
      attentionDetail: "Eventos, TV, festivos y deporte competidor.",
      weather: "Weather",
      weatherDetail: "Solo se activa dentro de una ventana de forecast fiable.",
      momentum: "Momentum de asistencia",
      momentumDetail: "Requiere ventas actuales / scans / demanda reciente.",
      appeal: "Atractivo del partido",
      appealDetail: "Prior experto hasta sustituirlo por suficiente dato observado."
    },
    thisWeek: {
      operatingView: "VISTA OPERATIVA",
      title: "¿Qué debería hacer el club esta semana?",
      lede:
        "El próximo partido en casa se selecciona automáticamente desde el dataset de fixtures.",
      nextHome: "PRÓXIMO PARTIDO EN CASA",
      signalState: "ESTADO DE SEÑALES",
      readiness: "Preparación de la decisión live",
      evidence: "EVIDENCIA",
      why: "¿Por qué cree esto el motor?",
      rule: "REGLA OPERATIVA",
      ruleTitle: "Primero resuelve el partido. Después activa las señales live.",
      ruleText:
        "El weather nunca se asocia a una fecha arbitraria. El momentum de asistencia permanece inactivo hasta tener una fuente fiable.",
      noLive: "Todavía no hay decisión live.",
      noLiveText:
        "El motor solo pasa de planificación a live cuando weather y momentum de asistencia están disponibles de verdad.",
      liveInputs: "inputs live disponibles",
      updatedCurrent: "Actualizado con los inputs actuales de V1"
    },
    evidence: {
      territorySource: "Familias + red de fútbol femenino + acceso de matchday",
      territoryNote: "Modelado con el dataset estructural V1.",
      calendarSource: "Partidos en casa de competidores e inventario local",
      calendarNote: "Capa actual de oportunidad basada en calendario.",
      attentionSource: "Eventos, TV, festivos y deporte competidor",
      attentionNote: "Estimación de planificación; revisar cerca del partido.",
      weatherSource: "Solo ventana de forecast fiable",
      weatherNote: "Se activa 5–7 días antes del matchday.",
      momentumSource: "Ventas / scans / demanda reciente",
      momentumNote: "Requiere datos actuales del club o asistencia verificada.",
      appealSource: "Marca del rival + demanda probable + ocasión",
      appealNote: "Prior experto hasta contar con suficiente dato observado."
    },
    signals: {
      territoryDetail: "Territorios prioritarios de Bromley / Croydon",
      calendarDetail: "Mucho whitespace frente al inventario WSL cercano",
      attentionDetail: "Disponibilidad tras presión externa",
      appealDetail: "Prior de rival / ocasión",
      weatherDetail: "Se activa en ventana de forecast",
      momentumDetail: "Necesita ventas actuales / scans"
    },
    weather: {
      loading: "Cargando forecast live…",
      unavailable: "Forecast no disponible",
      unavailableText: "El motor no sustituirá el weather por un valor inventado.",
      noDate: "No hay fecha de partido disponible",
      noDateText: "Weather seguirá inactivo hasta resolver el próximo partido en casa.",
      outside: "Fuera de la ventana de forecast",
      outsideText: "El motor activará weather cuando el partido entre en el horizonte de 7 días.",
      suitability: "Suitability de weather",
      refreshed: "Actualizado automáticamente"
    },
    travel: {
      eyebrow: "EXPERIENCIA FAN × SEÑAL DE CAPTACIÓN",
      title: "¿Puedo llegar realmente al partido?",
      lede:
        "Una herramienta de viaje para el aficionado que también da al growth engine una mejor medida de la fricción de matchday.",
      ukToHayes: "UK → HAYES LANE",
      whereFrom: "¿Desde dónde vienes?",
      helper:
        "El motor primero resuelve el origen. Los viajes dentro de Londres usan TfL; fuera de Londres pasan por la capa nacional.",
      originLabel: "Código postal, estación, pueblo o ciudad",
      originPlaceholder: "ej. Cambridge, CR0 7AB, London Bridge",
      travelNow: "Viajar ahora",
      matchday: "Día de partido",
      check: "Consultar viaje",
      resolving: "Resolviendo…",
      originRecognised: "Origen reconocido",
      routingLayer: "Capa de rutas",
      gb: "Gran Bretaña",
      noPostcode: "Sin código postal",
      accessScore: "ACCESS SCORE",
      routeUnavailable: "Viaje no disponible",
      why: "POR QUÉ IMPORTA",
      whyTitle:
        "Veinte kilómetros no son un insight de cliente. Veintisiete minutos sin transbordos sí.",
      whyText:
        "La accesibilidad debe responder al viaje real: duración, cambios, minutos andando e incidencias.",
      nationalSetup:
        "Origen nacional reconocido — falta activar la capa de rutas"
    },
    pages: {
      fixturesEyebrow: "CALENDARIO DE DECISIÓN",
      fixturesTitle: "¿Qué partidos en casa merecen inversión de captación?",
      territoriesEyebrow: "OPORTUNIDAD TERRITORIAL",
      territoriesTitle: "¿Dónde debería atacar primero London City?",
      signalsEyebrow: "SEÑALES LIVE",
      signalsTitle: "¿Qué puede cambiar la decisión cerca del matchday?",
      storyEyebrow: "STORY MODE",
      storyTitle: "Alexia no llena estadios. Los llenas tú.",
      storyLede:
        "Un experimento práctico para convertir atención impulsada por estrellas en hábito de matchday."
    },
    story: {
      problem: "Problema",
      problemTitle: "Las estrellas crean atención. No crean hábito automáticamente.",
      problemText:
        "La pregunta comercial no es cuánta atención genera un fichaje. Es de dónde puede venir asistencia recurrente de forma realista.",
      where: "Dónde",
      whereTitle: "Encuentra territorios con muchas familias conectados al fútbol femenino de base.",
      whereText:
        "Familias, nodos grassroots y accesibilidad de matchday revelan zonas que los supuestos clásicos de fanbase pueden pasar por alto.",
      when: "Cuándo",
      whenTitle: "No todos los partidos en casa merecen el mismo presupuesto de captación.",
      whenText:
        "Los huecos de calendario, el atractivo del rival y la atención competidora crean ventanas muy diferentes durante la temporada.",
      action: "Acción",
      actionTitle: "Convierte el score en una acción concreta.",
      actionText:
        "Territorio, producto, canal, mensaje y KPI se seleccionan para el partido; no se dejan como ejercicio de interpretación del dashboard.",
      learn: "Aprender",
      learnTitle: "Sustituye supuestos por comportamiento real de repetición.",
      learnText:
        "Código postal, scan, producto, fuente y repetición convierten progresivamente el modelo de research-led a club-specific.",
      shareEyebrow: "LA IDEA EN UNA FRASE",
      shareQuote:
        "Un equipo de cuatro personas puede construir capacidades que antes requerían diez — si la IA se convierte en infraestructura y no en protagonista."
    }
  }
} as const;

export type Dictionary = (typeof dictionary)[Lang];

export function getDict(lang: Lang): Dictionary {
  return dictionary[lang];
}
