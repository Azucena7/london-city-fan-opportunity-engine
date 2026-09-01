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
      live: "LIVE"
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
      thesis: "OPERATING THESIS",
      thesisTitle: "Don’t ask fans to change clubs.",
      thesisText:
        "Compete for the decision that actually matters: “What are you doing this Sunday?”",
      where: "WHERE",
      priorityTerritories: "Priority territories",
      explore: "Explore all →",
      when: "WHEN",
      opportunityCalendar: "Opportunity calendar",
      fullCalendar: "Full calendar →",
      planningScore: "PLANNING SCORE",
      planningFormula:
        "35% Territory + 25% Calendar + 20% Attention + 20% Fixture Appeal",
      planningNote:
        "Weather and attendance momentum activate inside the live matchday window."
    },
    thisWeek: {
      operatingView: "OPERATING VIEW",
      title: "What should the club do this week?",
      lede:
        "The next home fixture is selected automatically from the fixture dataset.",
      nextHome: "NEXT HOME FIXTURE",
      date: "Date",
      venue: "Venue",
      selection: "Selection",
      automatic: "Automatic",
      signalState: "SIGNAL STATE",
      readiness: "Live decision readiness",
      evidence: "EVIDENCE",
      why: "Why does the engine believe this?",
      rule: "OPERATING RULE",
      ruleTitle: "Resolve the fixture first. Activate live signals second.",
      ruleText:
        "Weather is never attached to an arbitrary date. Attendance momentum remains inactive until a reliable source exists."
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
      live: "LIVE"
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
      thesis: "TESIS OPERATIVA",
      thesisTitle: "No pidas a la gente que cambie de club.",
      thesisText:
        "Compite por la decisión que de verdad importa: “¿Qué haces este domingo?”",
      where: "DÓNDE",
      priorityTerritories: "Territorios prioritarios",
      explore: "Explorar todos →",
      when: "CUÁNDO",
      opportunityCalendar: "Calendario de oportunidad",
      fullCalendar: "Ver calendario →",
      planningScore: "SCORE DE PLANIFICACIÓN",
      planningFormula:
        "35% Territorio + 25% Calendario + 20% Atención + 20% Atractivo del partido",
      planningNote:
        "Weather y momentum de asistencia se activan dentro de la ventana live de matchday."
    },
    thisWeek: {
      operatingView: "VISTA OPERATIVA",
      title: "¿Qué debería hacer el club esta semana?",
      lede:
        "El próximo partido en casa se selecciona automáticamente desde el dataset de fixtures.",
      nextHome: "PRÓXIMO PARTIDO EN CASA",
      date: "Fecha",
      venue: "Estadio",
      selection: "Selección",
      automatic: "Automática",
      signalState: "ESTADO DE SEÑALES",
      readiness: "Preparación de la decisión live",
      evidence: "EVIDENCIA",
      why: "¿Por qué cree esto el motor?",
      rule: "REGLA OPERATIVA",
      ruleTitle: "Primero resuelve el partido. Después activa las señales live.",
      ruleText:
        "El weather nunca se asocia a una fecha arbitraria. El momentum de asistencia permanece inactivo hasta tener una fuente fiable."
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
    }
  }
} as const;

export function getDict(lang: Lang) {
  return dictionary[lang];
}
