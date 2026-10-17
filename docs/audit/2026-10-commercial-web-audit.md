# Auditoría de la web comercial · 17‑10‑2026

**Alcance:**

- Rutas públicas: `/`, `/for-clubs`, `/pilot` (con `/operating-pack` y `/rehearsal`), `/cases`, `/case-study` y `/live/london-city`.
- La navegación superior y el pie.

**Método:**

- Medí cada página en el build de demostración a 1440 px y a 390 px: alto en pantallas, palabras, secciones y llamadas a la acción.
- Revisé los enlaces entrantes y salientes de cada página.
- La home se midió **antes** de añadir el vídeo (PR #528). El vídeo suma 1 pantalla en escritorio.

## 1. Lo que hay hoy

| Página | Pantallas 1440 | Pantallas 390 | Palabras | Secciones (h2) | CTA de piloto/demo |
|---|---|---|---|---|---|
| `/` | **12,5** | **19,0** | 1.517 | 9 | 9 |
| `/for-clubs` | 7,1 | 9,6 | 614 | 7 | 10 |
| `/pilot` | 7,3 | 10,6 | 727 | 9 | 8 |
| `/pilot/operating-pack` | 5,0 | 8,8 | 693 | 8 | 3 |
| `/pilot/rehearsal` | 1,9 | 3,8 | 327 | 3 | 3 |
| `/cases` | 1,9 | 3,6 | 241 | 4 | 2 |
| `/case-study` | **11,2** | **17,8** | 1.094 | 10 | 4 |
| `/live/london-city` | 5,4 | 8,1 | 577 | 5 | 5 |

**Navegación superior:**

- Enlaces: "How it fits" (ancla de la home), "Live case" y "FAQ" (ancla de la home).
- Botones: "Open workspace" y "Request pilot".

**Pie:** For clubs, Pilot, Case study, Guided demo y Privacy.

## 2. Diagnóstico

### La home es demasiado larga y hace cinco trabajos a la vez

Con 12,5 pantallas en escritorio y 19 en móvil, la home hace de portada, de página de producto, de caso, de página del piloto y de FAQ. Para una web B2B en esta fase lo razonable son 6–8 pantallas en escritorio: el comprador decide en las primeras 3 si sigue leyendo.

Tiene **repeticiones** claras:

| En la home | Repite a… |
|---|---|
| "The read before the first meeting" (Morning Read) | El panel de señales del hero (`OpportunityEngineStage`): misma lista de señales, dos veces seguidas |
| "Only signals that change decisions" | El método de `/pilot` ("One rhythm, four moments") |
| "Hypothesis first. Announcement after." (tabla completa) | `/case-study` y `/live/london-city` |
| "Prove it on 4–6 fixtures first" + "Better decisions, same stack" | `/for-clubs` y `/pilot`. Son dos CTA finales seguidos |
| "Questions clubs ask" (FAQ, 9 preguntas) | Las dudas de compra, que caben mejor junto al formulario |

### Tres páginas de piloto que el comprador no distingue

`/for-clubs` ("pide un piloto"), `/pilot` ("cómo funciona") y `/pilot/operating-pack` ("cómo se arranca") cuentan en gran parte lo mismo, y las tres terminan pidiendo el piloto.

Además:

- El botón "Request pilot" lleva a `/for-clubs#demo`, pero la navegación no tiene ningún enlace "Pilot".
- `/pilot` solo se alcanza desde el pie o desde dentro de otras páginas.

### Navegación con anclas que sacan al usuario de donde está

Dos de los tres enlaces ("How it fits" y "FAQ") son anclas de la home. Desde `/pilot` o `/case-study` devuelven al visitante a la home a media página.

Faltan además los destinos que un comprador busca:

- **Producto:** qué hace.
- **Piloto:** cómo se prueba.
- **Prueba:** qué evidencia hay.

### Páginas huérfanas o duplicadas

- **`/cases`** no tiene **ningún enlace entrante**: ni la navegación, ni el pie, ni otra página.
- Su contenido (Brighton, Everton y Crystal Palace) ya está en `/pilot` ("Four cycles") y en `/live/london-city`.

### `/case-study` es tan larga como la home

Tiene 11 pantallas y 10 secciones, y mezcla tres cosas:

- el caso (la secuencia de London City);
- el producto ("A demand operating system…", "Six operating questions");
- la visión ("The next leap…").

Ya existe `/case-study/technical` para el detalle técnico.

## 3. Propuesta

### Navegación

```
AVELA   Product · Pilot · Proof · FAQ                Open demo   Request pilot
```

| Enlace | Destino | Qué cambia |
|---|---|---|
| Product | `/` | La home pasa a ser la página de producto |
| Pilot | `/pilot` | Pasa a ser la única página de "cómo funciona", con Operating pack y Rehearsal como subpáginas |
| Proof | `/case-study` | Con London City Live enlazado arriba |
| FAQ | `/for-clubs#faq` | Las preguntas viven junto al formulario |
| Request pilot (botón) | `/for-clubs` | Página única de solicitud: propuesta, alcance, formulario y FAQ |

En móvil, el mismo orden. "Request pilot" se queda siempre visible, como ahora.

### Home (objetivo: unas 6,5 pantallas en escritorio y unas 11 en móvil)

1. **Hero:** sin cambios.
2. **El vídeo de 45 s** (PR #528).
3. **"Four decisions it is built to change":** qué cambia para el club.
4. **Prueba comprimida:** las 3 filas de London City y un enlace a Proof.
5. **"AVELA works across your tools":** en versión compacta.
6. **Un único bloque de piloto** con un CTA ("4–6 fixtures…"). Se fusionan el bloque de piloto y el CTA final.

**Sale de la home, sin borrarse:**

- **Morning Read:** ya lo enseñan el hero y el vídeo; se queda en `/live`.
- **"Only signals that change decisions":** pasa a `/pilot`.
- **"Change the context. Watch the plan." (simulador):** pasa a `/pilot`, junto al método. Es la mejor pieza interactiva y allí se usa con intención de compra.
- **FAQ:** pasa a `/for-clubs`. En la home queda solo un enlace "Questions clubs ask →".

### Resto

- **`/cases`:** redirigir a `/case-study`. Su contenido ya está en `/pilot` y `/live`.
- **`/case-study`:** dejarla en unas 6 pantallas:
  - la secuencia de London City y lo que demuestra y lo que no;
  - el resto, que es producto y visión, sale a `/` o a `/case-study/technical`.
- **`/for-clubs`:**
  - quitar lo que ya cuenta `/pilot`;
  - quedarse con propuesta, alcance, el tour de 50 s, el formulario y la FAQ.

### Lo que no cambia

- Ninguna afirmación, ninguna regla de verdad y ningún aviso sobre London City.
- El sistema editorial (eje del 42 %, campos de color).
- El formulario de leads, que sigue siendo solo de servidor.
- Las métricas de UTM existentes: se mantienen los parámetros en los enlaces que se muevan.

## 4. Orden sugerido

| # | Cambio | Esfuerzo | Riesgo |
|---|---|---|---|
| 1 | Navegación nueva (Product · Pilot · Proof · FAQ) y redirección `/cases` → `/case-study` | Bajo | Bajo |
| 2 | Home: sacar Morning Read, el simulador, "Only signals…" y la FAQ; fusionar los dos CTA finales | Medio | Medio: hay tests e2e que fijan el orden de la home |
| 3 | `/pilot` recibe el simulador y "Only signals…"; `/for-clubs` recibe la FAQ | Medio | Bajo |
| 4 | Recortar `/case-study` a la secuencia y lo que demuestra | Medio | Bajo |

Cada paso va en su propia PR, con capturas a 1440, 768 y 390 px y con el lint de Taste.

## 5. Estado

**Paso 1 · Navegación (PR #530):**

- Menú Product · Pilot · Proof · FAQ, con los botones Open demo y Request pilot.
- `/cases` redirige a `/case-study`.

**Pasos 2 y 3 · Home y piloto (en una sola PR):**

- **Home:** hero → vídeo → "Four decisions" → prueba → "Works across your tools" → FAQ → bloque de piloto. Mide **8,9 pantallas** en escritorio (antes 13,5 con el vídeo) y **13,8** en móvil (antes unas 20,5).
- **`/pilot`:** recibe el simulador "Change the context. Watch the plan.", junto al método. Pasa de 7,3 a 8,8 pantallas.

**Cambios respecto a la propuesta:**

- **FAQ:** se queda en la home, en desplegables, en lugar de pasar a `/for-clubs`. `/for-clubs` es bilingüe y la FAQ solo existe en inglés. Moverla habría dejado preguntas en inglés dentro de la versión en español. El enlace "FAQ" del menú sigue apuntando a `/#faq`.
- **Morning Read y "Only signals that change decisions":** se retiran en lugar de moverse.
  - Morning Read repetía la lista de señales del hero, que ya marca qué se lee hoy ("Reading now") y qué llega con el piloto ("In a pilot").
  - "Only signals…" repetía el ritmo de `/pilot` ("One rhythm, four moments").
  - La lectura diaria sigue en la app (`/app`, "Outside the club today").
- **CTA final:** el bloque "Better decisions, same stack." se fusiona con el bloque de piloto, que cierra la página.

**Paso 4 · Recortar `/case-study`:** de 11,2 a 6,7 pantallas en escritorio y de 17,8 a 10,8 en móvil.

- **Se queda lo que es prueba:**
  - la secuencia de London City y lo que demuestra y lo que no;
  - construido, observado y pendiente;
  - las asistencias publicadas, con su fuente;
  - el brief de Brighton;
  - el paso al piloto.
- **Salen cinco secciones de discurso de producto,** que ya cuentan la home y `/pilot`:
  - el problema;
  - el sistema operativo de demanda;
  - las audiencias de alcance a demanda, que además todavía citaba YouTube, ya retirado;
  - las seis preguntas;
  - la capa de coordinación.
