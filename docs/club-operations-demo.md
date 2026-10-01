# Demo de operación del club

Ruta: `/club-demo/operations`. Disponible en español e inglés.

Esta entrega es una demostración pública interactiva con estado en memoria. No es un espacio privado de producción. No tiene autenticación, base de datos de clientes, integraciones reales, envíos, inversión publicitaria ni renderizado de vídeo. Recargar reinicia la sesión.

## Fuentes y procedencia

`data/seed/club-operations-demo.json` contiene fuentes sintéticas versionadas. Ningún registro representa a una persona, empresa patrocinadora o resultado real. La referencia de calendario de London City procede del calendario existente del proyecto; modificar su fecha es un ensayo, no una actualización oficial. El escenario español, su rival e incidencias son ficticios.

| Fuente | Ejemplo | Qué demuestra |
|---|---|---|
| CRM | Siete IDs `DEMO-*`, permisos y frecuencia de contacto | Segmentación y exclusiones |
| Ticketing | Compras, entradas actuales y derechos de abono | Evitar vender a quien ya tiene derecho de entrada |
| Accesos | Visitas reconciliadas y un registro sin reconciliar | Separar asistencia confirmada de datos pendientes |
| Movilidad | Incidencia externa ficticia | Añadir una acción para facilitar la llegada |
| Meteorología | Disponibilidad ficticia | Inventario de fuentes; todavía no modifica recomendaciones |
| Partners | Dos empresas ficticias | Afinidad propuesta, revisión contractual e interés no confirmado |
| Medición | Cohorte y resultados ficticios independientes | Lectura descriptiva sin afirmar impacto incremental |

Comprador, beneficiario y asistente deben tener identidades separadas y reconciliadas en producción. Los IDs de esta demo solo vinculan los ejemplos del archivo; no demuestran una integración de identidad real.

## Guion para presentar al cliente

1. Elegir London City o el escenario español y generar el plan de recurrencia con movilidad.
2. Mostrar las seis acciones del plan integral y veinticuatro tareas, con fechas relativas al partido.
3. Abrir Campañas y flujos. Asignar responsable, confirmar audiencia y medición. Seleccionar el rol de aprobación y aprobar la acción de prueba.
4. Abrir Estudio creativo. Generar el paquete de Instagram: texto editable, gráfico SVG y guion de quince segundos. Descargar el gráfico o briefing si se desea. El vídeo es un guion, no un archivo renderizado.
5. Aprobar la versión creativa y simular el lanzamiento. No se publica ni se contacta con nadie. La misma versión de acción no se simula dos veces.
6. Revisar los resultados: estados de ejecución de esta sesión y ejemplo independiente de medición claramente separado.
7. Mostrar Audiencias: recurrencia selecciona DEMO-002 y DEMO-007. DEMO-003 carece de permiso; DEMO-004 ya tiene entrada; DEMO-006 alcanza el límite de contactos; los abonados quedan fuera del recordatorio de venta.
8. Mostrar rankings por segmento y compras o asistencia. DEMO-005 no recibe puntuación de asistencia porque sus accesos no están reconciliados. El reto de tres visitas es una propuesta, sin recompensas emitidas.
9. Asignar tareas en Calendario y equipo. Una tarea necesita responsable para marcarse completada. Descargar un calendario `.ics` de ensayo; esto no sincroniza una herramienta de trabajo.
10. Cambiar CRM a desactualizada en Fuentes. La acción queda sin aprobación válida. Restaurar la fuente requiere revisar y aprobar otra vez; no recupera automáticamente la aprobación anterior.
11. Probar Partners: crear una propuesta de prueba exige confirmar derechos. La propuesta sustituye el plan anterior. No hay patrocinadores ni contratos reales.
12. Cambiar objetivo o fecha. Generar un nuevo plan con tareas recalculadas y revisiones reiniciadas.

## Creatividades

El texto se genera mediante reglas y plantillas locales, no mediante un modelo de IA. El gráfico SVG es una composición de prueba sin escudos, fotografías de jugadores ni marcas de partners. Instagram usa 1080×1350, WhatsApp 1080×1080 y LinkedIn 1200×627. El guion describe un vídeo de quince segundos; no existe un proveedor de montaje conectado. Una aprobación de campaña y una aprobación de creatividad son requisitos distintos.

## Paso a producción

Antes de recibir datos del club: autenticación real, aislamiento por club, permisos comprobados en servidor, almacenamiento privado, política de conservación y auditoría persistente. Los roles de esta interfaz son controles de demostración.

Después: obtener proveedor/documentación/permisos de CRM, ticketing y accesos; implantar conectores y reconciliación de comprador/beneficiario/asistente. Verificar fuentes externas y sus licencias. Nunca usar una incidencia ficticia para información al aficionado.

Entrega real: destinatarios elegibles comprobados justo antes de enviar, bajas, límites entre campañas, cancelación, colas e idempotencia por destinatario/campaña/versión/canal. Una compra detiene recordatorios posteriores. Presupuestos, ofertas, derechos y versiones aprobadas se conservan de forma verificable.

Generación multimedia: biblioteca de recursos autorizados, proveedores y límites de coste, trabajos asíncronos, versiones editables y revisión previa a publicar. Los permisos de la API del canal y sus plantillas son independientes de la aprobación interna del club.

Evaluación: comparación válida, costes y margen cuando se conozcan. Separar conversiones atribuidas de impacto incremental; no entrenar automáticamente un motor a partir de resultados ficticios.
