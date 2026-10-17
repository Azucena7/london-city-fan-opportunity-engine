# AVELA: auditoría estratégica de producto y de preparación para una adquisición

- **Fecha:** 17 octubre 2026
- **Modo:** solo lectura. No se ha modificado código.
- **Base:** `main` @ `181898a`
- **Uso:** guía de auditoría antes de incorporar más desarrollos. Cada propuesta nueva debería poder justificarse contra §11 (prioridades) y §12 (reglas de decisión).

Cómo leer los estados:

- **Hecho verificado** = comprobado en el código del repo, con ruta a fichero.
- **Hipótesis** = a validar con clubes, datos o integraciones reales.
- **Competidores:** la información viene de búsquedas web del 17‑10‑2026. Las páginas no se pudieron abrir directamente, así que hay que confirmar las citas literales antes de usarlas en material comercial.

---

## 0. Veredicto en una frase

AVELA tiene una **disciplina de verdad excepcional** (estados de evidencia, salud de fuentes, privacidad en base de datos) y un buen esqueleto de flujo de decisión. Pero hoy la **inteligencia externa no mueve las decisiones**, no existe motor de demanda, y el producto ha crecido hacia **gestión interna de trabajo**, que es justo lo que no debería ser.

**Recomendación:** refactor incremental con dos reestructuraciones concretas:

1. Convertir las señales externas en un motor real que alimente la prioridad.
2. Sustituir la gestión de trabajo interna por un monitor de ejecución conectado a las herramientas del club.

---

## 1. Qué es AVELA hoy según el código

| Capa | Estado real | Evidencia |
|---|---|---|
| Ingesta externa | **Snapshots diarios**, no tiempo real. Scripts escriben JSON en `data/live/*`, un cron de GitHub los commitea a `main` y Vercel redespliega. No hay tabla de señales en Supabase. | `.github/workflows/daily-data-refresh.yml`, `scripts/refresh-*.mjs` |
| Señales | 41 señales curadas a mano más 1 de tiempo generada. Tienen estado (measured/confirmed/forecast/inferred/waiting), fuente, fecha, fixture y acción. Les falta geografía, caducidad, relevancia y magnitud. `confidence` no está tipado. | `src/lib/models.ts:53`, `data/live/signals.json` |
| Priorización | **Reglas fijas sobre un `planningScore` estático** sacado de un Excel semilla, más constantes de confianza, urgencia y nº de señales. Ni el tiempo ni el transporte cambian el ranking. | `src/lib/productOpportunity.ts:287`, `src/lib/opportunityRadar.ts:33-55` |
| Demanda / asistencia | **Ausente**, y la FAQ dice explícitamente "AVELA no predice asistencia". Hay asistencia histórica pública y benchmark WSL estáticos. | `CommercialFAQ.tsx:9`, `data/history/*` |
| Jugadoras | El optimizador de packs prueba por fuerza bruta todas las combinaciones de 1 a 8 jugadoras y puntúa cada una con pesos fijos. Corre sobre **7 jugadoras sintéticas**. Lesiones y convocatorias viven en estado React o localStorage, sin persistir. No hay lógica de sustitución ni test unitario del scoring. | `src/lib/clubStrategy.ts:169-262`, `PlayerAssetPlanner.tsx` |
| Retención | Pipeline de agregados CRM con privacidad y audiencias por criterios: no repetidores, abonados que no asisten, primeras compras. Bien hecho, pero **sin datos reales** (`crm-ticketing.json` vacío). | `scripts/lib/crm-ticketing-aggregate.mjs`, `CrmAudiences.tsx` |
| Movilidad | `/matchday/[id]` público con tiempo, TfL rail y enlaces. Los corredores son escenario modelado. No hay rutas ni tiempos de viaje. No hay widget embebible, porque `X-Frame-Options: DENY` bloquea incrustarlo. | `src/app/matchday/[fixtureId]/page.tsx`, `next.config.mjs` |
| Ejecución | **El handoff a Asana/Monday/Jira no crea nada**: inserta `external_work_packages` con `sync_state:"proposed"` y responde "External tasks have not been created". No hay conectores. En cambio sí hay mucha gestión interna: peticiones con owner y fecha, carga y capacidad, disponibilidad, tablero de campañas y continuidad operativa. | `src/app/api/work-system/handoff/route.ts:108-124`, migraciones `workload_items`, `operational_requests`, `capacity_windows`… |
| Decisión humana | Bien hecho: `decision_events` con 13 tipos (approved/rejected/committed…) y una máquina de estados server-side para packs. | `migrations/20261004214706`, `MatchPlanDecision.tsx` |
| Aprendizaje | Parcial. Ventanas post-partido, recomendación de aprendizaje, decisiones similares e informe imprimible. Ejecución y resultado ya están separados. **No hay holdouts ni error de previsión.** El proveedor de medición no está configurado. | `src/lib/learningRecommendation.ts`, `LearningCampaignTrace.tsx:205` |
| IA | Ask AVELA y borrador de campaña a través de Vercel AI Gateway, cerrados por allowlist. No hay `max_tokens`, cuotas ni rate limit. | `src/app/api/ask-avela/route.ts`, `src/lib/aiAccess.ts` |
| Plataforma | Next 15 + React 19, Supabase por REST (sin SDK). 118 políticas RLS con tests SQL en CI, 46–49 rutas API, ~394 tests unitarios (muchos son regex sobre el código fuente) y ~94 e2e (persistencia mockeada). | ver §9 |

**Resumen honesto:** hoy AVELA es un **workspace de decisión de un solo club** con señales públicas refrescadas a diario, priorización por reglas y una capa de privacidad y gobernanza muy por encima de lo habitual en esta fase. No es todavía un sistema predictivo ni un orquestador conectado.

---

## 2. Visión original frente a lo construido

Fuentes: `docs/product-brief.md`, `docs/womens-football-product-thesis.md` y el brief estratégico de octubre de 2026.

| Promesa original | Grado de cumplimiento | Qué pasó |
|---|---|---|
| Fixture & Match Intelligence: re-evaluar el contexto de cada partido | ◐ 40 % | Hay ingesta y señales, pero no cambian la prioridad, que sale de un score estático. |
| Motor de **Attendance**: brechas de demanda, potencial y presión de inventario | ○ 10 % | **Se ha diluido**: el producto renuncia públicamente a estimar demanda. Es la pérdida más importante frente a la visión. |
| Audience Opportunity | ◐ 35 % | Hay criterios de audiencia, pero sin datos reales ni ranking de segmentos. |
| Sponsor Opportunity | ◐ 25 % | Página demo y salud de contratos. Además es el **terreno fuerte de Blinkfire**. |
| Activation: audiencia, mensaje, canal, owner, coste, medición | ◑ 60 % | Es la parte más construida. Pero ha derivado hacia gestión interna (ver §6). |
| Learning: recomendación → decisión → ejecución → resultado | ◐ 40 % | Existe la estructura, pero falta el diseño de medición y el error de previsión. |
| "Club Opportunity Memory" (el moat declarado) | ◐ 30 % | `decision_events` y `decisionSimilarity` son la semilla. Sin clubes reales no acumula nada. |

**Lo que hay que recuperar:** que la inteligencia externa decida qué partido importa y por qué, y el motor de demanda.

**Señales de deriva:**

- Datos que se refrescan y nadie usa: YouTube `audienceReach`, `searchDemand`, el benchmark WSL y `experienceDemand`.
- Tres APIs vivas sin llamadores: `/api/weather`, `/api/matchday/road` y `/api/matchday/[id]/travel`.
- La Morning Read, que es el mejor resumen externo, vive en la home pública y en el email, **no dentro de `/app`**.
- Las rutas antiguas `/signals`, `/mobility` y `/travel` redirigen fuera.
- En la ficha de partido, las señales aparecen en la fase 04 dentro de `<details>` plegados, **después** de "Build & route".

---

## 3. Inteligencia externa: inventario por familia

Leyenda: ● implementado y refrescado · ◑ snapshot parcial · ◐ manual o modelado · ○ ausente · ⊘ se obtiene pero no se usa

| Familia | Estado | Detalle | Hueco principal |
|---|---|---|---|
| Tiempo | ◑ | Open-Meteo diario, **solo el próximo partido en casa**. | No hay avisos Met Office ni histórico del pronóstico. Umbrales de lluvia inconsistentes: 60 % en `weather-signal.mjs:4`, 50 % en `preparedMoves.ts`/`morningRead.ts`, 35 % como "medium". El UI dice "Live" cuando es un snapshot diario. |
| Transporte | ◑ | TfL rail (4 partidos) y carretera (15 km), diarios. | Carretera solo aparece en la Morning Read. Faltan huelgas como señal propia, tiempos de viaje y rutas alternativas. El transporte **no entra en el ranking**. |
| Eventos en competencia | ◑ | Fútbol masculino y femenino más deporte de Ticketmaster, puntuados por reglas. | **Conciertos y festivales se descargan y se filtran**: de 608 eventos se quedan 30, todos deportivos. Aun así el UI anuncia "Concerts, festivals, sport" (`engineSignals.ts:17`). Las retransmisiones son manuales. |
| Ciudad / calendario | ◑ | Festivos de GOV.UK. | **Faltan vacaciones escolares**, clave para familias, y eventos comunitarios. |
| Contexto deportivo | ◐ | Calendario scrapeado de la web del club y ventanas FIFA en semilla. | El atractivo del rival está en la semilla pero no se usa. Forma, rivalidad y disponibilidad son manuales o sintéticas. |
| Digital / audiencia | ⊘/○ | YouTube se refresca a diario y no se muestra. Noticias por palabra clave. | Trends bloqueado. Blinkfire `requires-access`. |
| Origen de aficionados | ◐ | Funciona con agregados del club; sin ellos, "not connected". | Depende de un piloto. |

**Esquema de señal objetivo.** Campos que faltan:

- `geoScope`
- `validUntil`
- `relevance`
- `impactDirection` + `impactBand` (categórico, nunca precisión falsa)
- `confidence` tipado y obligatorio
- `evidenceClass`: observed | forecast | modelled | hypothesis | recommendation
- `supersedes`, para el histórico de cambios
- caducidad por edad

---

## 4. Blinkfire frente a AVELA

### 4.1 Qué hace Blinkfire hoy (fuentes públicas, octubre de 2026)

| Capacidad | Blinkfire | Fuente (resumen de búsqueda) |
|---|---|---|
| Valoración de patrocinio en social, TV y activos físicos | **Confirmado** (Sponsorship Performance Hub, enero 2026) | analyticsblog.blinkfire.com 2026/01/29 |
| Analítica social y engagement, benchmarking | **Confirmado** | analyticsblog 2024/03/28, 2024/10/23 |
| Detección de logos por visión artificial | **Confirmado** (patentado) | blinkfire.com/landing/brandspotter |
| Broadcast / OTT, earned media | **Confirmado** (abril 2026) | blinkfire.com/d/landing/broadcast-ott |
| Inventario y fulfilment de patrocinio (BIM) y CRM con Salesforce | **Confirmado** | blinkfire.com/d/landing/bim |
| Ticketing Intelligence con Ticketmaster Nexus: asistencia por sección | **Confirmado** (noviembre 2025) | analyticsblog 2025/11/13 |
| **Agentes IA y MCP** ("Ask a question. Get a finished report", conectar Claude, ChatGPT o Gemini) | **Confirmado** (2026) | blinkfire.com/d/landing/blinkfire-agentic-suite |
| Talent / trends de atletas | **Confirmado** | analyticsblog 2025/03/20 |
| API de reporting, BI (Tableau, Power BI, Snowflake) | **Confirmado**. La licencia de la API prohíbe redistribuir los datos. | blinkfire.com/api_tos |
| Tiempo, transporte, eventos de ciudad | **No encontrado** | — |
| Predicción de asistencia | **No encontrado** (solo asistencia observada) | — |
| Recomendación o decisión de qué hacer | **Parcial**: "AI-based pricing" en BIM | — |
| Integración con Asana o Monday | **No encontrado** | — |

### 4.2 Matriz de capacidades

| Capacidad | Clasificación | Comentario |
|---|---|---|
| Analítica y valoración de patrocinio | **Fortaleza Blinkfire** | No competir. Consumir como fuente. |
| Valoración de medios / broadcast | **Fortaleza Blinkfire** | Fuera de alcance. |
| Analítica social | **Fortaleza Blinkfire → integración** | Momentum de jugadoras y contenido como **input** del optimizador. |
| Analítica de ticketing | **Solapamiento / redundancia potencial** | Blinkfire con Ticketmaster ya da asistencia observada. AVELA solo aporta valor si hace **previsión y decisión**, no descripción. |
| Predicción de asistencia | **Diferenciación AVELA (potencial, no construida)** | Nadie club-facing lo hace con señales externas. PredictHQ lo hace en horizontal. |
| Inteligencia externa: eventos, tiempo, movilidad, ciudad | **Diferenciación AVELA (parcial)** | Replicable con APIs públicas; el valor está en traducirla a decisión de club. |
| Activación comercial de jugadoras con derechos y disponibilidad | **Diferenciación AVELA (lógica sí, datos no)** | Encaja con Blinkfire Talent y BIM: complementariedad clara. |
| Optimización de campañas | **Incierto** | Hoy son reglas; sin resultados no hay optimización. |
| Modelado de escenarios comerciales | **Diferenciación potencial** | Hoy es "Illustrative simulation". |
| Retención y frecuencia | **Complementariedad** con el CRM (Salesforce, SeatGeek IQ) | AVELA: decisión sobre agregados. El CRM: el registro. |
| Recomendaciones de decisión | **Diferenciación AVELA** | Blinkfire no muestra next-best-action. |
| Coordinación transversal | **Diferenciación AVELA** | Pero no debe ser un project manager. |
| Seguimiento de ejecución | **Integración** (Asana/Monday/Jira) | Hoy no existe ningún conector. |
| Atribución de resultados | **Incierto** | Requiere diseño de medición con el club. |
| Agentes IA | **Fortaleza Blinkfire / redundancia** | Ask AVELA **no diferencia**. Mantener como utilidad, nunca como reclamo. |
| Integración de datos y ecosistema de partners | **Fortaleza Blinkfire** | AVELA tiene contratos JSON-Schema pero ni API pública ni webhooks. |

### 4.3 Dónde sería imprudente competir

Valoración de patrocinio, detección de marca, broadcast, inventario y fulfilment de patrocinio, reporting automatizado de sponsors, y "chat con tus datos".

Implicación: `/app/sponsors` debe reposicionarse como **"oportunidades de activación para partners"**, alimentadas por Blinkfire o el CRM cuando existan. No debe ser un módulo de gestión de patrocinio.

### 4.4 Otros actores (puertas de entrada además de Blinkfire)

| Actor | Rol para AVELA |
|---|---|
| **Two Circles + KORE** (incluye Hookit) | Incumbente en patrocinio y fan data en Reino Unido. Comprador alternativo plausible y competidor en el pitch. |
| **SeatGeek IQ / Ticketmaster** | Se están moviendo a "intelligence partner". Fuente de ventas agregadas. Riesgo de que suban hacia la decisión. |
| **Salesforce Agentforce** (Tottenham, octubre 2026) | Capa CRM y agentes. AVELA va encima, no al lado. |
| **PredictHQ** | Inteligencia de eventos con asistencia prevista y MCP. **Mejor como feed que construir scraping propio**, pero también demuestra que la capa externa sola es commodity. |
| **Teamworks** | Disponibilidad de jugadoras y operaciones deportivas. Fuente para el optimizador. |
| **Stats Perform / Opta** | Contexto deportivo y fútbol femenino. |
| **SponsorUnited** | La "decisión" del lado del patrocinio (qué deals hacer). No es matchday. |

No se ha encontrado ningún proveedor de software comercial específico de **fútbol femenino**. Es un hueco real (hipótesis a validar).

---

## 5. Diferenciación y moat

**Fácil de replicar para Blinkfire (meses, no años):**

- UI de radar y ficha de partido;
- ingesta de APIs públicas: Open-Meteo, TfL, festivos, Ticketmaster;
- reglas de priorización;
- chat con LLM;
- el tablero de campañas.

Hoy el código **no es en sí un activo defensivo**. Tiene unas 3 semanas de historia visible, un solo autor principal, sin clientes y sin datos propios.

**Lo que puede volverse defendible (por orden de valor):**

1. **Memoria decisión → ejecución → resultado entre clubes.** Un dataset que nadie tiene: qué contexto hubo, qué se recomendó, qué se decidió, qué se ejecutó y qué pasó. Solo existe si hay pilotos. Es el activo central de cualquier adquisición.
2. **Modelo calibrado de demanda de matchday** con features externas, entrenado y evaluado en varios clubes. Por ahora no existe, y debe nacer transparente: baseline + bandas, no ML opaco.
3. **Motor de restricciones de activación de jugadoras**: contratos, cuotas, lesiones, convocatorias, momentum. Conocimiento de dominio difícil de modelar bien y muy útil para Blinkfire Talent/BIM.
4. **Arquitectura de confianza**: agregados con privacidad garantizada en la base de datos y estados de evidencia. Reduce la fricción de compliance de los clubes y acorta la compra.
5. **Foco en fútbol femenino** como cuña de go-to-market: crecimiento rápido, equipos pequeños, sin proveedor específico.

### 5.1 ¿Por qué compraría Blinkfire en vez de construir?

Hoy no lo haría: es más barato construirlo. Lo haría si AVELA tuviera:

- (a) **N clubes pagando o en piloto medido** con evidencia de decisiones mejores o más rápidas;
- (b) el dataset de decisión y resultado del punto 1;
- (c) un modelo de demanda con error de previsión publicado;
- (d) integración ya hecha con sus APIs o MCP;
- (e) relación con buyers que Blinkfire no toca: marketing y ticketing, no solo patrocinio.

Sin (a) y (b), el resto es replicable.

### 5.2 Rutas estratégicas

| Ruta | Valoración |
|---|---|
| SaaS independiente | Necesario en cualquier caso para generar evidencia. Es la ruta base. |
| Partnership / integración API con Blinkfire | **La mejor puerta de entrada.** AVELA consume social y talent y expone "recomendaciones y contexto" a su Agentic Suite. Prerrequisito: API propia más un acuerdo de datos, porque su licencia limita redistribuir. |
| Distribución comercial (reventa por Blinkfire, Two Circles o ticketing) | Viable tras 2–3 pilotos con evidencia. |
| White-label | Prematuro. |
| Inversión estratégica | Plausible tras pilotos. |
| Adquisición | Solo con evidencia, dataset e IP limpia. Sin valoraciones: no hay datos que las sostengan. |

---

## 6. Ejecución: cómo pasar de recomendación a acción sin crear otro project manager

**Problema.** El código contiene un mini‑PM:

- `operational_requests` (owner, fecha, etapas);
- `workload_items` + `capacity_windows` (carga y capacidad);
- `availability_windows` + slot finder;
- tablero y lista de campañas con owner y etapa;
- `operational_continuity_*`;
- presupuesto de esfuerzo.

Esto **contradice el principio "AVELA decide, las herramientas ejecutan"** y además no conecta con nada.

**Modelo objetivo:**

```
AVELA (dueño): señal · recomendación · alternativas · confianza · aprobación · rationale · impacto esperado · vínculo decisión→resultado
        │  aprobación humana
        ▼
Capa de conectores (abstracción): ExecutionConnector { createActions, readStatus, mapProject }
        │  idempotencia (decision_id+action_key), reintentos, auditoría, external_ref + url
        ▼
Herramienta del club (fuente de verdad de la ejecución): Asana | Monday | Jira | Planner | webhook genérico
        │  estado / fecha / bloqueo / completado (lectura)
        ▼
AVELA Execution Monitor (compacto): activadas · completadas · en curso · bloqueadas · en riesgo · próximas fechas · enlaces
        ▼
Learning: ejecución operativa (¿se entregó?)  ≠  impacto de negocio (¿funcionó?)
```

**Reglas:**

- Nunca editar tareas en AVELA.
- Nunca inventar un % de progreso: usar ratios explícitos (3/5 completadas) o estados descriptivos.
- Mostrar siempre por separado **Delivered** y **Worked**.

**Primer conector:**

1. **Webhook genérico.** Sirve para cualquier herramienta vía Zapier o Make, y además da un export.
2. **Asana o Monday**, el que use el primer club piloto. Esto es una pregunta abierta.

**Qué conservar:** las tablas `external_work_packages` y `external_work_item_links` ya modelan esto. Son el embrión correcto.

---

## 7. UX de la app

**Lo que funciona:**

- shell persistente;
- bandeja de decisiones;
- radar;
- estados de evidencia;
- barra de decisión;
- informe de ciclo;
- móvil razonable.

**Problemas:**

1. **Orden invertido en la ficha de partido.** Va Decide → Feasibility → Build & route → *Evidence & impact* → Human decision → Learn. La historia de producto es señal → impacto → decisión. Las señales deben ir primero y verse sin desplegar nada.
2. **La misma cola de decisiones aparece en 4 sitios:** Home, Radar, Executive y la ficha.
3. **Cuatro modelos de pasos distintos:**
   - el rail de la ficha;
   - el handoff strip (Decide → Campaign → Players → Learning);
   - Campaigns (Draft → Review → Ready → Handoff → Learning);
   - Executive (01–04).
4. **Naming drift:**
   - Radar / Matches / Opportunity Radar;
   - Season / Calendar / Calendar intelligence;
   - Team / Access;
   - "Club decision workspace" frente a "Opportunity Engine".
5. **Learning queda escondido en "More" en móvil**, aunque es el final del loop.
6. **Executive aparece bajo "Club system"**, cuando es una vista de decisión.

**Experiencia propuesta: centrada en el partido, con el calendario como entrada:**

```
Calendario / Radar ──► Partido
                        1 Contexto externo (qué cambió, por qué importa, frescura)
                        2 Riesgos y oportunidades + escenarios de demanda (bandas, no puntos)
                        3 Recomendación (alternativas, confianza, bloqueos)
                        4 Viabilidad (derechos, jugadoras, capacidad del equipo: solo lectura)
                        5 Activar → conector externo
                        6 Monitor de ejecución (compacto)
                        7 Resultado + aprendizaje (Delivered vs Worked)
```

Home = "qué necesita mi atención hoy" (top 3 + lectura externa del día). Radar es dueño de la cola completa. Executive = brief imprimible o compartible.

---

## 8. Web comercial

**Bien:**

- La inteligencia externa está visible en el hero, con el estado "Reading now / In a pilot".
- Los avisos sobre London City están en todas partes.
- Hay FAQ honesta.
- La captura de leads es server-only, con Turnstile y honeypot.

**A corregir (riesgo de afirmaciones no soportadas):**

1. **"AVELA reads across your tools"** (Blinkfire, Asana, Monday, Jira, calendarios) en una tabla titulada "What AVELA reads". **Ninguna integración está viva.** → Añadir estado Live / Pilot / Roadmap por herramienta.
2. **FAQ: "watches a signal network around every fixture… carries history of previous decisions and outcomes"** sobredimensiona lo que existe.
3. **Contradicción sobre el transporte:** `HowTheEngineWorks` dice "in a pilot" y la FAQ dice que TfL se lee a diario.
4. **"City events: Concerts, festivals"**, cuando se filtran.
5. **La tabla de prueba "AVELA saw → London City later announced"** sugiere predicción o influencia. El aviso de no-causalidad debe ir dentro de la tabla, no al lado.
6. **"Recorded on the real application"** en el vídeo de /for-clubs → "Recorded on the demo workspace".
7. **`/cases`** habla de un "composite score" (choca con "no magic score") y de 3 casos frente a 4. Está huérfana del nav.
8. **Categoría inconsistente:** Opportunity Engine / decision workspace / Decision Center / decision intelligence. Elegir una (ver §12, decisión D1).

**Falta:**

- un problema explícito en la home ("por qué tus herramientas actuales no lo resuelven");
- cómo se hace exactamente el handoff a las herramientas;
- nombres de proveedores de ticketing compatibles;
- una página de privacidad (obligatoria antes de captar leads de clubes de la UE o Reino Unido).

**Vídeo promocional:** no menciona la inteligencia externa (tiempo, transporte, eventos), que es el núcleo de la tesis. Antes de subirlo a la home, cambiar la capacidad 01 o el gancho por un "qué cambió fuera": rival en competencia, huelga de tren, lluvia.

---

## 9. Due diligence técnica (semáforo)

| Área | Semáforo | Motivo / acción |
|---|---|---|
| Calidad de código | 🟢/🟡 | Lint estricto, 0 TODO. CSS global en capas (~6.4k líneas). Componentes de más de 1000 líneas (`CampaignDeliveryPlanner.tsx`). |
| Documentación | 🟢 | architecture, data-model, scoring-logic, source-register. Faltan ADRs. |
| IP / licencias | 🔴/🟡 | **Sin LICENSE ni declaración de titularidad.** Autoría asistida por IA. Scraping de webs de club y liga (revisar ToS). Dependencias MIT/Apache. |
| Seguridad | 🟡 | RLS con tests, leads server-only, Origin checks. **Sin rate limiting**, CSP mínima. Turnstile falla abierto si falta el secreto. |
| GDPR | 🟡/🔴 | Hay borrador de DPA. **No hay página de privacidad**, ni retención o borrado automático, ni herramienta de acceso o supresión. |
| Tests | 🟢/🟡 | 394 unitarios (muchos regex sobre el fuente), 94 e2e con persistencia mockeada, sin cobertura medida. **El optimizador de packs no tiene test unitario.** |
| Despliegue | 🟢 | Reproducible, CI con gates, migraciones probadas en Postgres 16. |
| Operación | 🟡/🔴 | Sin Sentry ni logging estructurado ni uptime. **El pipeline de datos commitea a `main`.** |
| Escalabilidad | 🟡/🔴 | JSON compilado en el build, supuestos de un solo club, sin colas. **El LLM no tiene límite de coste.** |
| Deriva de esquema | 🟡 | `campaign_records` y `player_pack_selections` están en `supabase/bootstrap`, no en `migrations/`. Tablas de temporada sin uso. API `campaign-workspace` huérfana. |
| Transferibilidad | 🟡 | Buena doc y CI. Historia muy joven, bus factor ≈ 1, `.env.example` incompleto. |

**¿Es predictivo hoy?** No. Son reglas y heurísticas. El LLM solo se usa en el chat y en el borrador de campaña. No debe venderse como "predictive intelligence".

---

## 10. Simplificación: conservar, mejorar, consolidar, retirar

| Acción | Elementos |
|---|---|
| **Conservar** | Estados de evidencia y salud de fuentes. Privacidad en base de datos (agregados, RLS, server-only leads). `decision_events` y aprobación humana. Morning Read. Pipeline CRM agregado. Optimizador de packs (lógica). Informe de ciclo. Piloto 4–6 partidos. |
| **Mejorar** | Esquema de señal. Cobertura de tiempo y transporte. Eventos de ciudad. Vacaciones escolares. Ranking alimentado por señales. Optimizador con datos reales, persistencia, sustituciones y tests. Learning con holdouts y error de previsión. |
| **Consolidar** | Una sola cola (Radar). Un solo modelo de pasos. `/pilot` + `/for-clubs`. `/cases` + `/case-study` + `/live`. Naming de la app. Umbrales de tiempo en una sola constante. |
| **Reposicionar** | Sponsors → "oportunidades de activación para partners" (con Blinkfire como fuente). Ask AVELA → utilidad, no reclamo. Executive → brief compartible. Contracts → "derechos que bloquean o habilitan", con ingesta. |
| **Integrar externamente** | Ejecución (Asana/Monday/Jira/webhook). Social y talent (Blinkfire). Eventos (evaluar PredictHQ frente al scraping). Ventas agregadas (ticketing). Disponibilidad (Teamworks o manual). |
| **Congelar o retirar** *(requiere decisión, ver D3)* | Planificador de capacidad y carga (`workload_items`, `capacity_windows`, `OperationalCapacityPanel`). Gestión de peticiones operativas como tracker. Continuidad operativa. Tablero de campañas como PM (dejarlo como vista de estado). Tablas de temporada sin uso. API `campaign-workspace`. Estado duplicado en localStorage y Supabase. |

---

## 11. Prioridades y roadmap

**Criterios:** dolor del cliente · impacto comercial · diferenciación · demostrabilidad · disponibilidad de datos · coste. **No se prioriza nada por el mero hecho de estar ya construido.**

### Estado a 17‑10‑2026

**Hecho (fusionado en `main`):**

| Fase | PR | Qué |
|---|---|---|
| 0 | #510 | Afirmaciones de la web con estado Live today / In a pilot / Planned, `/privacy`, LICENSE, límites de IA, `.env.example` completo |
| 0 | #511 | "Outside the club today" al inicio de `/app` |
| 0 | #512 | Señales del partido justo bajo la decisión en la ficha |
| 0 | #513 | Una sola escala de tiempo, etiquetas "updated daily", cortes de carretera en `/matchday` |
| 1 | #514 | Presión de contexto: el entorno reordena el Radar con puntos explicados (estado sin cambios) |
| 1 | #515 | Previsión por partido dentro de 16 días y aviso de cambio de previsión |
| 1 | #516 | Conciertos y festivales en recintos grandes como eventos de ciudad |
| 1 | #518 | Huelgas de transporte como señal propia |
| 1 | #519 | Esquema de señal: confianza, alcance geográfico, caducidad y clase de evidencia |
| 1 | #520 | Retirada del alcance de YouTube |
| 1 | #521 | Vacaciones escolares (Bromley y vecinos) con fuente oficial, aún sin verificar |
| 2 | #522 | Webhook genérico firmado: envío idempotente del paquete aprobado y lectura de estado |

**Fase 2 en revisión:**

- Monitor de ejecución en la ficha: envío solo tras confirmación, Delivered "x de y" sin %, en curso, bloqueadas, en riesgo (48 h).
- Herramienta de ejecución elegida en `/app/setup` (Asana, Monday, Jira, Notion u otra) y qué tipo de trabajo se envía.
- Gestión interna congelada (D3): seguimiento de peticiones, capacidad y continuidad operativa ocultos tras `AVELA_INTERNAL_WORK_MANAGEMENT`. Sus APIs y datos se mantienen hasta acordar la migración. Disponibilidad y huecos de calendario se quedan: son viabilidad, no gestión de tareas.
- Falta: separar Delivered de Worked en Learning, y luego el vídeo.

**Reubicado por decisión del fundador:**

- **Vídeo promocional:** se hace al cierre de la fase 2, cuando el producto enseñe "señal → prioridad → tarea externa → Delivered/Worked". Se regenera con `scripts/video/`.
- **Alcance de YouTube: retirado.** La medición de redes (impacto de campañas, momentum de jugadoras) es terreno de Blinkfire o de la herramienta social del club. AVELA lo recibirá como dato de entrada vía la integración de la fase 5 (selección de jugadoras, oportunidades disparadas por un pico de atención, "observado, no atribuido" en el informe), nunca con monitorización propia.

**Pendiente de la fase 1:**

- Vacaciones escolares: marcar como verificadas cuando el club o el fundador confirme las fechas en la página del council de Bromley. Hasta entonces no generan momentos de calendario.
- Esquema de señal completo: zona, caducidad, confianza tipada y tipo de evidencia.

### Fase 0: Quick wins (1–2 semanas, sin cambios de arquitectura)

| P | Cambio | Criterio de aceptación |
|---|---|---|
| P0 | Corregir afirmaciones de la web (§8, puntos 1–7) y añadir estado Live/Pilot/Roadmap por integración | Ninguna integración inexistente aparece como "reads". La contradicción del transporte está resuelta. |
| P0 | Página de privacidad + LICENSE/IP + `.env.example` completo | Existe `/privacy`, enlazada desde el formulario. Hay LICENSE. |
| P0 | Límites del LLM: `max_tokens`, rate limit por usuario, log de uso | Ask AVELA y el borrador de campaña tienen tope por petición y por día. |
| P1 | Lectura externa del día **dentro de `/app`** (reutilizar la Morning Read) | Home muestra tiempo, transporte, eventos y calendario con frescura. |
| P1 | Señales primero en la ficha de partido; un solo modelo de pasos | El orden es Contexto → Impacto → Decisión → Viabilidad → Activar → Aprender. |
| P1 | Exponer los datos huérfanos: carretera en `/app` y `/matchday`, alcance de YouTube | Cero imports sin consumidor en `src/lib/data.ts`. |
| P1 | Unificar umbrales de tiempo; corregir "Live" por "Updated daily" | Hay una sola constante y un test. |
| P1 | Vídeo: incluir un caso de señal externa antes de subirlo | El vídeo muestra "qué cambió fuera → qué recomendamos". |

### Fase 1: Motor de inteligencia externa v1 (P0)

1. Esquema de señal con los campos de §3, persistido con histórico (Supabase o almacén versionado) y caducidad.
2. Cobertura:
   - tiempo para todos los partidos de casa a 16 días, más avisos Met Office y deltas de pronóstico;
   - vacaciones escolares por council del área de captación;
   - huelgas como señal propia;
   - conciertos y festivales con filtro de radio y aforo (evaluar PredictHQ);
   - retransmisiones.
3. **Las señales entran en la prioridad.** Componente "presión de contexto" transparente y explicable que sustituye el `planningScore` estático. El efecto de cada señal se ve en el signal log, que ya existe.
4. Reglas de frescura: una señal caducada no puntúa y se marca.

**Aceptación:** cambiar una señal cambia el orden del radar y el porqué es legible.

### Fase 2: Activación sin project manager (P0)

1. Congelar los módulos de gestión interna (D3), ocultos detrás de un flag sin borrar datos.
2. Interfaz `ExecutionConnector`, más webhook genérico, más un conector real (Asana o Monday según el club piloto). Idempotencia, reintentos, `external_ref` y URL, lectura de estado.
3. Componente **Execution Monitor** compacto por partido o campaña.
4. Separar en Learning "Delivered" de "Worked".

**Aceptación:** al aprobar se crea la tarea externa con un enlace. Su estado vuelve a AVELA. No se puede editar la tarea desde AVELA.

### Fase 3: Motor de demanda v0 (P1, requiere un club piloto)

1. Baseline transparente: histórico propio, más rival, más día/hora, más ritmo de venta agregado.
2. Escenarios en bandas.
3. Registro de calibración y **error de previsión publicado tras cada partido**.
4. Hasta que exista: "índice de presión de demanda" etiquetado explícitamente como "no es una previsión".

**Aceptación:** hay error medido en ≥4 partidos, y nunca se muestra un número sin banda ni fuente.

### Fase 4: Activación de jugadoras real (P1)

1. Ingesta de plantilla y contratos (CSV y extracción de cláusulas con revisión humana).
2. Disponibilidad persistida: lesión, convocatoria, manual.
3. Lógica de sustitución ("si cae X, entra Y y por qué") más tests unitarios del scoring.
4. Inputs de momentum desde Blinkfire Talent y social cuando haya acceso.

### Fase 5: Ecosistema (P2)

1. **Adaptador Blinkfire**, en dos direcciones:
   - entrada: social, talent y obligaciones de sponsor vía API o MCP;
   - salida: API o MCP de AVELA con contexto y recomendaciones.
2. Conectores de ticketing agregados: Ticketmaster, SeatGeek, Tixr, según el piloto.
3. Widget embebible "Cómo llegar al estadio" (exige excepción de `frame-ancestors`). Opcional, sin complicar el B2B.
4. Observabilidad: Sentry o equivalente, logging, uptime. Mover el pipeline de datos fuera de los commits a `main`.

### P3: Diferir o retirar

- Planificador de capacidad.
- Continuidad operativa.
- Tablero tipo PM.
- Valoración de sponsors.
- Chat como reclamo.
- White-label.
- Nuevos módulos sin datos de un club.

---

## 12. Decisiones del fundador

**Aprobadas el 17‑10‑2026** tal como se proponen abajo. `CLAUDE.md` ya refleja D1, D2 y D3. Para D4–D6 se aplica el criterio por defecto indicado:

- **D4:** mantener las fuentes propias y evaluar PredictHQ durante el primer piloto. No se añade una dependencia SaaS sin beneficio medido.
- **D5:** primero el webhook genérico. El conector nativo se elige según el stack del primer club.
- **D6:** contactar con Blinkfire como partner de datos cuando estén hechas las fases 0–1, proponiendo un piloto conjunto con un club suyo de fútbol femenino.


- **D1. Categoría y loop.** Opciones:
  - mantener "The Opportunity Engine…" (marca) más "Sports Commercial Decision Intelligence" como descriptor de categoría para compradores;
  - cambiar a "Anticipate → Decide → Activate → Learn".

  *Recomendación:* marca "Opportunity Engine", descriptor "Sports commercial decision intelligence" y loop **Anticipate → Decide → Activate → Learn**. Learn incluye Measure. Requiere actualizar `CLAUDE.md`.
- **D2. ¿Volvemos a estimar demanda?** El producto hoy dice "no predecimos asistencia". *Recomendación:* sí, pero solo con datos de un club, en bandas y con error publicado. Hasta entonces, índice de presión etiquetado.
- **D3. Congelar la gestión interna de trabajo.** `CLAUDE.md` dice "no eliminar capacidad para simplificar UI". Esto es una decisión estratégica, no de UI, y necesita aprobación explícita y la actualización de `CLAUDE.md`.
- **D4. Fuente de eventos.** Scraping propio o PredictHQ (coste frente a cobertura, y dependencia).
- **D5. Primer conector de ejecución.** Depende del stack del primer club.
- **D6. Blinkfire.** ¿Contacto como partner de datos ya (con un piloto conjunto en un club cliente suyo de fútbol femenino) o después de 2 pilotos propios?

---

## 13. Preguntas abiertas que solo resuelve el mercado

1. ¿Quién compra en un club femenino: marketing, comercial o el CEO? ¿Con qué presupuesto?
2. ¿Qué decisión duele más: asistencia, activación de jugadoras o patrocinio?
3. ¿Qué herramientas usan de verdad para tareas, CRM y ticketing?
4. ¿Comparten ventas agregadas por partido y con qué latencia?
5. ¿Qué precisión de previsión haría cambiar una decisión?
6. ¿Blinkfire tiene clientes en WSL/NWSL que serían piloto conjunto? ¿Qué permite su licencia de API?
7. ¿Con qué frecuencia caducan las señales relevantes (horas o días)? ¿Hace falta tiempo real?
8. ¿Qué evidencia aceptaría un club como "mejor decisión": velocidad, ingresos, asistencia?

---

## 14. Respuestas explícitas a las 16 preguntas del brief

1. **¿Qué es AVELA hoy?** Un workspace de decisión para un club, con señales públicas diarias, ranking por reglas, aprobación humana registrada, privacidad sólida y mucha gestión interna. No es predictivo ni está conectado.
2. **¿Qué debe ser?** La capa que anticipa qué partido o campaña importa por contexto externo y datos del club, recomienda con evidencia, activa en las herramientas del club y mide si funcionó.
3. **¿Qué dejar de construir?** Gestión interna de trabajo, valoración de patrocinio, chat como diferencial, nuevas páginas de marketing duplicadas y nuevos módulos sobre datos sintéticos.
4. **¿Qué recuperar?** Inteligencia externa como motor de prioridad, el motor de demanda (con honestidad estadística), las señales primero en la UX, y los datos y APIs huérfanos.
5. **¿Qué es diferencial frente a Blinkfire?** Anticipación contextual (tiempo, movilidad, eventos, calendario) traducida a decisión. Previsión de demanda (por construir). Restricciones de activación de jugadoras. Bucle decisión → ejecución → resultado.
6. **¿Qué replicaría Blinkfire fácilmente?** La UI, la ingesta de APIs públicas, las reglas de ranking, el chat y los tableros.
7. **¿Qué puede ser IP defendible?** El dataset de decisiones y resultados entre clubes, el modelo calibrado de demanda, el motor de restricciones de jugadoras y la arquitectura de privacidad por agregados.
8. **¿Producto mínimo convincente?** Para 4–6 partidos:
   - lectura externa fiable y fresca;
   - un ranking que cambia por esas señales;
   - una recomendación con viabilidad;
   - aprobación que crea tareas en la herramienta del club;
   - monitor de ejecución;
   - informe Delivered frente a Worked.
9. **¿Integraciones esenciales?**
   - Ventas o ticketing agregados.
   - Una herramienta de ejecución (o webhook).
   - Fuentes públicas: tiempo, transporte, eventos, calendario.
   - Después: Blinkfire (social y talent) y el CRM.
10. **¿Cómo debe funcionar el motor externo?**
    1. Conectores por familia.
    2. Esquema normalizado con evidencia, geografía, caducidad y confianza.
    3. Histórico.
    4. Reglas de relevancia por partido.
    5. Componente de prioridad explicable.
    6. Alertas solo cuando cambia una decisión.
11. **¿De recomendación a acción sin PM?** Aprobación humana → conector → tarea externa (fuente de verdad) → lectura de estado → monitor compacto. Nada se edita en AVELA.
12. **¿Ejecución separada del impacto?** Dos métricas distintas siempre visibles:
    - **Delivered:** acciones completadas frente a aprobadas, según la herramienta externa.
    - **Worked:** resultado frente a objetivo o baseline, con diseño de medición pre-acordado; sin él, "observado, no atribuido".
13. **¿La UX comunica el producto?** A medias. Buena estructura, pero las señales están enterradas y después del plan, hay colas y modelos de pasos duplicados, y el naming es inconsistente.
14. **¿La web explica el problema?** Explica bien qué hace y es honesta con London City. Le falta un problema explícito, y sobredimensiona integraciones y "historia de decisiones".
15. **¿Ruta más creíble?**
    1. Fases 0–2.
    2. 2–3 pilotos medidos en fútbol femenino.
    3. Integración con Blinkfire (y ticketing) como partner de datos.
    4. Evidencia publicada (error de previsión, tiempo señal→acción, Delivered/Worked).
    5. Conversación estratégica.
16. **¿Qué roadmap de ingeniería, en qué orden?** Fase 0 → Fase 1 → Fase 2 → (con club) Fase 3 → Fase 4 → Fase 5.

---

## 15. Recomendación final

**Refactor incremental con dos reestructuraciones dirigidas:**

- (1) la capa de señales pasa de "evidencia que se lee" a "motor que prioriza";
- (2) la gestión interna de trabajo se congela y se sustituye por conectores más un monitor.

No hace falta reescribir: la plataforma, la privacidad, la decisión humana y el piloto son una buena base.

**Posicionamiento:**

> **The Opportunity Engine for football club marketing & commercial teams.**
> Sports commercial decision intelligence: anticipa qué partido importa, decide con evidencia, activa en tus herramientas y aprende de lo que pasó.
> Blinkfire mide y monetiza; AVELA anticipa y decide. Juntos: Measure → Anticipate → Decide → Activate → Learn *(hipótesis a validar, no hecho competitivo)*.

**Principio rector para cualquier desarrollo futuro:**

> AVELA no es donde los equipos hacen todo su trabajo. Es donde la organización entiende qué importa, decide qué hacer, lo activa en sus sistemas y mide si funcionó.

### Checklist para aprobar un desarrollo nuevo

- [ ] ¿Mejora una decisión (Anticipate/Decide) o su medición (Learn), o es gestión de trabajo?
- [ ] ¿Usa datos reales o públicos con estado de evidencia, o depende de datos sintéticos?
- [ ] ¿Lo hace ya mejor Blinkfire, el CRM o la herramienta de tareas? Si es así: integrar, no construir.
- [ ] ¿Cambia algo visible en la prioridad o la recomendación?
- [ ] ¿Respeta las reglas de verdad (`CLAUDE.md`) y la frontera London City?
- [ ] ¿Tiene criterio de aceptación medible y test que ejecute lógica (no regex sobre el fuente)?
