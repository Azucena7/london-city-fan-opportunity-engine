# Club Operations: producto y contratación modular

Propuesta de producto, 1 octubre 2026. No es una tarifa aprobada, una licencia activa ni un contrato. La web actual es una demo pública con datos sintéticos; no es todavía un espacio privado de producción.

## Qué vendemos

Un sistema operativo para coordinar marketing, comunicación y negocio del club alrededor de cada partido: transformar información en un plan, asignar trabajo, revisar acciones y aprender de sus resultados. No vender un clon de un CRM, Blinkfire, un gestor de tareas o un generador de vídeos.

La licencia básica debe resolver coordinación sin obligar a comprar todos los módulos. Seguridad, aislamiento por club, permisos, auditoría y salida/exportación son requisitos transversales de producción, nunca funcionalidades premium. No están implementados por los interruptores de la demo.

## Base: Club Operations

- Hipótesis inicial: un club, temporada operativa y cinco usuarios. Validar puestos adicionales por tramo; conservar históricos de temporadas según retención pactada.
- Plan por partido y objetivos, acciones sugeridas por reglas, campañas y briefings.
- Tareas, responsables, calendario exportable, revisión y aprobación manual.
- Brand Kit permanente separado de kits creativos de campaña. Biblioteca versionada y derechos de recursos en producción.
- Registro manual de partners, acuerdos y apariciones; comprobaciones básicas de alcance y cupo, sin recomendador avanzado.
- Resumen operativo y exportaciones, onboarding y soporte estándar definidos en contrato.
- Producción obligatoria: autenticación, permisos en servidor, aislamiento, almacenamiento privado, auditoría, retención, revocación y exportación/borrado. Documentos sensibles nunca en la demo pública.

La demo ensaya marca JSON sintética, campañas, versiones, registros ficticios y reservas locales. No conecta bibliotecas ni carga contratos reales.

## Módulos adicionales

| Módulo | Resultado vendido | Alcance y dependencia | Unidad propuesta |
| --- | --- | --- | --- |
| Audiencias y fidelización | Captación, recurrencia y asistencia medibles | Identidad única, CRM/ticketing/accesos, segmentos, exclusiones, rankings privados y gamificación voluntaria. Acceso al proveedor contratado por el club. | Tramo de perfiles activos y conectores |
| Automatización y canales | Ejecutar acciones aprobadas y ahorrar seguimiento | Requiere Audiencias para contacto segmentado. Canales autorizados, tareas conectadas, colas, reintentos, idempotencia, límites y parada tras compra/baja. WhatsApp no implica envío automático a cualquier grupo. | Ejecuciones incluidas + consumo; mensajes y publicidad separados |
| Estudio creativo | Producir piezas coherentes más rápido | Variantes de texto/imagen/vídeo sujetas a kits, derechos y revisión. Proveedores de IA y renderizado de vídeo pendientes; hoy SVG y guion. | Créditos de generación y almacenamiento |
| Inteligencia de contenidos | Priorizar temas, formatos y protagonistas | Métricas comparables, evolución y pool autorizado. Conector Blinkfire opcional sujeto a licencia, documentación y permisos. No necesita reemplazar su producto. | Cuentas/pool analizado; licencia externa aparte |
| Partners y valor comercial | Activaciones, cumplimiento y renovaciones | Inventario, afinidad explicable, exclusividades, entregables e informes. Puede operar manualmente. Exposición conectada requiere Inteligencia y permiso de uso/compartición. | Partners activos e inventario |
| Talento y activaciones | Repartir apariciones y evitar sobreasignación | Vigencia, alcance, disponibilidad, coste, cupo, carga y recomendador ponderado. Inteligencia opcional añade engagement; no obligatoria. | Pool de talento y activaciones |

Conectores estándar asociados al módulo; integración personalizada y migraciones presupuestadas aparte. Evitar cobros acumulativos por el mismo conector en varios módulos. Documentar matriz de compatibilidad real por proveedor antes de venderlo.

## Paquetes orientados a problemas

- Coordinación: Base, para empezar sin integración.
- Crecimiento: Base + Audiencias + Automatización; añadir Estudio creativo según volumen.
- Contenido y partners: Base + Estudio creativo + Inteligencia + Partners.
- Activaciones de plantilla: Base + Talento; Inteligencia opcional.
- Club completo: Base + seis módulos, sin prometer todos los conectores de mercado.

El configurador deja componer módulos y resuelve la dependencia Automatización → Audiencias. Retirar Audiencias retira Automatización. No hace pagos ni activa una suscripción.

## Modelo económico propuesto, no tarifas de mercado

Suscripción anual por club + precio anual de cada módulo. Implantación inicial separada según complejidad. Definir créditos/ejecuciones incluidos y topes antes de contratar. Alertar y requerir autorización para ampliar consumo, nunca gasto automático sin límite. No cobrar por partido ni por cada aficionado en la base; usar tramos comprensibles en Audiencias. Usuarios adicionales por tramo.

No fijar aún importes. Validar tres pilotos pagados y medir horas ahorradas, tiempo para preparar un partido, porcentaje de tareas completadas, calidad de aprobaciones y capacidad de demostrar compras/accesos con comparación válida. Calcular costes de infraestructura, soporte, conectores, almacenamiento e IA; negociar márgenes y disposición a pagar. No usar engagement o valor mediático como ROI financiero ni inventar uplift.

Antes de publicar tarifas: usuarios, clubes, temporadas, almacenamiento, retención de contratos, número de conectores, frecuencias, límites, créditos, soporte, SLA, duración, renovación, cancelación/exportación y costes externos. La licencia Blinkfire, publicidad y mensajería no están incluidas. Adaptaciones legales y contratos del talento corresponden al club y sus asesores.

## Derechos y optimización

Imagen, presencia física, publicación en cuenta propia, publicidad pagada, sublicencia a partners, reedición y réplica digital no son el mismo permiso. Registrar alcance, documento, firma y validación humana; versiones y vigencia. Extracción asistida futura puede proponer campos, no confirmar legalmente los derechos.

Hard gates del ensayo: firma/validación simuladas, vigencia, canal, territorio, categoría, disponibilidad confirmada, responsable, presupuesto, cupo conocido y colisión de fecha. No usar lesiones, salud ni valoración deportiva. Primero filtrar elegibles, luego ponderar afinidad sintética, capacidad restante/cupo y tasa de contenido comparable. Explicar cada componente. Si no hay denominador, excluir engagement de la media para ese candidato; no convertir ausencia de evidencia en rendimiento cero. Revisar sesgos de exposición y no considerar engagement mérito deportivo.

Todas las apariciones comprometidas cuentan: realizadas y futuras reservadas. Completar no consume cupo dos veces. Cancelar libera capacidad. Quota null significa sin confirmar, no infinito. Una unidad de la demo no modela duración, fracciones, diferentes bolsas de derechos, simultaneidad parcial ni restricciones de contrato: añadirlas con documentación real antes de producción.

## Blinkfire: evidencia y condiciones revisadas

- API disponible para clientes con licencia activa y acceso habilitado: https://www.blinkfire.com/connector/learnmore/gds
- Condiciones de integración interna, restricciones de redistribución y multi-club: https://www.blinkfire.com/api_tos
- Capacidades del producto (no garantía de endpoints contratados): https://analyticsblog.blinkfire.com/blog/2026/01/29/sponsorship-performance-hub-social-tv-broadcast-and-physical-asset-valuations/

Pendiente confirmar contrato del club, autorización para nuestra aplicación y hosting, campos, identificación de protagonistas, cuentas propias vs club, denominadores medidos/estimados, histórico, frecuencia, límites, retention y posibilidad de informar a partners. No scraping ni tokens en navegador. Credenciales en servidor por club, permisos de lectura mínimos, trabajos de sincronización con reintentos y procedencia/fecha visibles. No redistribuir datos de una liga automáticamente a clubes.

## Estado de la entrega y recorrido de demo

En `/club-demo/operations`: Marca y recursos → importar JSON sintético descargado; Kits de campaña → cambiar campaña sin alterar marca; Contenidos y tendencias → filtrar cuenta/canal/formato/tasa; Talento y derechos → comprobar acuerdo, ajustar solicitud/pesos, usar rol Aprobación, reservar y observar cupo/colisión; Plan → generar acción, aprobar, Estudio → generar pieza con contexto de campaña y talento reservado; cambiar kit → aprobación invalidada; Licencia y módulos → Base, añadir módulos y descargar alcance.

Fuentes: `data/seed/club-strategy-demo.json` contiene cuatro talentos, cuatro apariciones y nueve posts inventados. Ventanas de comparación de 14 días, muestras pequeñas sin tendencia inferencial. No son datos de London City ni de Blinkfire. La tasa es suma de interacciones / suma de impresiones; sin denominador completo, tasa desconocida. La variación es en puntos porcentuales, no crecimiento de ventas.

Pendientes de producción: autenticación y datos privados; importación real de recursos y contratos; extracción y validación asistida; conectores reales; workflows persistentes; proveedores de IA/vídeo; publicación/envío; pagos y entitlements en servidor; informes medidos. El configurador no es control de acceso ni facturación. No aceptar datos privados en la web pública.
