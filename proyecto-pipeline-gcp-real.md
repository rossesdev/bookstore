# Proyecto conductor: plataforma de pedidos en GCP

**Fecha:** 26 de septiembre de 2026. **Dedicación:** 8 semanas, 3 horas diarias. **Autoría:** la estudiante construye el sistema; el mentor revisa decisiones, pruebas y fallos. **Presupuesto declarado:** hasta 300 USD de créditos de prueba para todo el proyecto, sujeto a saldo y vigencia reales de la cuenta.

## Resultado que se busca

Construir y operar una plataforma analítica de una tienda ficticia como **proyecto nuevo e independiente**. La fuente batch inicial será un generador propio de archivos diarios de clientes y productos sintéticos; la fuente streaming será un productor propio de eventos de cambios de pedidos. Debe responder: «¿cuánto se vendió por día y cuál es el estado actual de cada pedido?». La entrega incluye ingesta, almacenamiento raw, validación y cuarentena, transformación, un mart de ventas, consumo BI, despliegue reproducible, controles de acceso, observabilidad y recuperación. Es un prototipo de prácticas de producción; dos meses no equivalen a operar una plataforma empresarial real a escala.

**Supuesto provisional:** los archivos batch serán `customers.csv` y `products.csv`; los eventos serán JSON. La estudiante puede sustituir el generador batch por una fuente externa después de definir su contrato, sin cambiar el objetivo analítico. La misión 03 queda fuera de este proyecto y permanece como práctica separada.

## Arquitectura objetivo

```text
Archivos batch propios ── Cloud Run Job ── GCS raw ── BigQuery landing ─┐
                    ↑                        │                               │
       Cloud Scheduler → Workflows       manifiesto                         ├─ Dataform → core/mart → BI
                                                                            │
Productor sintético ── Kafka ───── Dataflow ── BigQuery raw/staging ─────────┘
                                    ├──────── GCS raw por ventanas
                                    └──────── cuarentena + motivo

Terraform crea recursos e IAM; CI valida y despliega; Logging/Monitoring vigilan ambas ramas.
```

La ruta batch recoge **instantáneas** diarias de dimensiones; la ruta de eventos representa cambios de pedidos y permite probar retrasos, duplicados y orden. El vínculo será `customer_id` y, si se modelan artículos, `product_id`. Dataflow valida cada mensaje y conserva el original; la detección de un mismo `event_id` en varios mensajes y la elección del estado actual se hacen en BigQuery/Dataform, donde pueden compararse entre sí.

## Contratos y reglas que debes definir antes del código

| Elemento | Decisión inicial y prueba requerida |
|---|---|
| Archivos batch | Conservar archivo original por `run_id`, recurso y fecha; registrar filas, bytes, hash, estado y error. Una entrega parcial no se marca completa. |
| Evento | Campos mínimos: `event_id`, `order_id`, `order_version`, `event_ts`, `published_at`, `status`, `amount`, `customer_id`. `event_id` identifica el evento; `order_version` ordena cambios de un pedido. |
| Identidad e idempotencia | Repetición idéntica de `event_id` no suma otra vez. Mismo ID con contenido distinto va a cuarentena. Una actualización legítima usa ID nuevo y versión mayor. |
| Tiempo | Conservar hora del evento, publicación, ingesta y disponibilidad en mart. Un evento que llega tarde con versión menor permanece en el historial y no revierte el estado actual. |
| Calidad | Campos obligatorios, tipos, valores de estado, importe no negativo, unicidad, relación con cliente, conteos entre zonas y causa de cada rechazo. Definir explícitamente qué hacer si falta el cliente. |
| SLO provisional | Batch consultable antes de una hora diaria elegida; evento visible en el mart en 15 minutos, medido de extremo a extremo. Son objetivos de prueba, no garantías actuales. |
| Datos sensibles | Solo datos ficticios. Los campos personales de `customers` quedan en raw con acceso restringido; el mart usa `customer_id` y no expone dirección/nombre. |
| Retención y recuperación | Elegir días de retención raw y de cuarentena; documentar cómo repetir un `run_id`, reconstruir un día y comprobar que no cambia el total. |

## Tablas y almacenamiento

- **GCS raw:** archivos batch inmutables por entorno/fuente/fecha/`run_id` y manifiesto de entrega; mensajes de streaming archivados en objetos por ventana y fragmento. Definir política de ciclo de vida. No intentar anexar registros a un mismo objeto.
- **BigQuery landing:** instantáneas de `customers` y `products` con `run_id` y `ingested_at`; mensajes de pedidos con payload original y metadatos. Separar las cargas batch de las escrituras streaming.
- **BigQuery quarantine:** registro rechazado, fuente, `run_id` o `event_id`, etapa, motivo y momento. Conservar el original para reprocesar.
- **Dataform staging/core/mart:** normalizar tipos; conservar `order_events` histórico; obtener **una** fila candidata por `order_id` antes de actualizar `orders_current`; crear `daily_sales` de pedidos cuyo estado final sea `completed`. Usar aserciones de unicidad, valores no nulos y reconciliación.
- **BI:** un dashboard pequeño sobre el mart, con ventas diarias, pedidos por estado y última actualización. Looker Studio es suficiente si Power BI no está disponible en el entorno.

Particionar por fecha solo después de definir las consultas y medir bytes; considerar clustering por `order_id` cuando el patrón de acceso lo justifique. `MERGE` necesita claves y candidatos únicos; probar la reejecución y el evento tardío antes de confiar en el resultado.

## Construcción por semanas

| Semana | Lo que construyes tú | Prueba para avanzar | Investigación puntual |
|---|---|---|---|
| **1 — Contrato e infraestructura** | Pregunta de negocio, consumidores, fuentes, modelo de eventos, SLO, estimación inicial de volumen y decisión sobre dónde operará Kafka; después diagrama, región, presupuesto/alertas, repositorio y Terraform de `dev`. Define nombres y variables de `test` y `prod` desde ahora. | Puedes explicar qué dato llega a cada destino y por qué; `terraform plan` es reproducible; no hay claves de servicio en Git. | Contratos de datos, Kafka básico, IAM, regiones, coste por servicio y estado Free Trial/Paid. |
| **2 — Ingesta batch** | Crear un generador independiente de `customers.csv` y `products.csv` y un Cloud Run Job que publique archivos raw y manifiesto en GCS. | Entrega completa; un fallo deja ejecución fallida; mismo `run_id` no publica datos distintos; conteos del manifiesto cuadran. | Cloud Run Jobs, GCS, contratos de CSV y reintentos. |
| **3 — Carga y modelo batch** | Ejecutar jobs de carga GCS→BigQuery; construir `stg_customers`, `stg_products` y las primeras aserciones de Dataform. | Dos ejecuciones del mismo lote no duplican filas; `run_id` permite rastrear cada fila al archivo raw; datos incorrectos quedan identificados. | BigQuery load jobs, esquemas CSV, Dataform y particiones. |
| **4 — Orquestación y recuperación batch** | Cloud Scheduler inicia Workflows; Workflows ejecuta extracción, comprueba manifiesto, carga y dispara transformaciones solo tras éxito. Implementar replay de un `run_id` o fecha. | Reprocesar siete días produce el mismo resultado que una reconstrucción desde raw; fallo intermedio no deja un mart marcado como fresco. | Workflows, estados de ejecución, backfill, idempotencia. |
| **5 — Eventos** | Crear productor sintético con casos normales, duplicados, conflicto, desorden y eventos tardíos; publicar en Kafka. Crear Dataflow que archive raw en GCS por ventanas, valide y envíe aceptados/rechazados a destinos distintos. | Cada mensaje se puede localizar por `event_id`; conflicto y error tienen motivo; el pipeline puede detenerse y reanudarse sin doble conteo analítico. | Kafka: topic, partición, clave, offset, productor y consumidor; Beam/Dataflow, tiempo de evento y coste de recursos continuos. |
| **6 — Estado y consumo** | Modelar histórico, `orders_current` y `daily_sales` en Dataform; unir pedidos con clientes por `customer_id`; crear dashboard. | Una versión tardía no revierte el pedido; cambios válidos actualizan estado; total de ventas coincide con casos esperados y no cambia al repetir ingesta. Medir latencia hasta BI. | `MERGE`, incrementalidad, aserciones, vistas/marts y frescura. |
| **7 — Operación, seguridad y despliegue** | Completar Terraform para `dev`, `test` y `prod` con recursos e identidades separados; CI de pruebas, compilación y plan; despliegue con Workload Identity Federation y aprobación para `prod`; logs estructurados, métricas, alertas, IAM mínimo y retención. | Una PR defectuosa falla en CI; una identidad sin permiso no lee raw sensible; alerta por fallo o ausencia de ejecución; puedes desplegar `test` desde cero. | CI/CD, WIF, Logging/Monitoring, gobierno y linaje. |
| **8 — Ensayo de producción** | Hacer una liberación corta a `prod` si saldo y permisos lo permiten; inyectar duplicado, esquema roto, retraso y pérdida de una carga; ejecutar replay, documentar runbook, coste real, dos decisiones arquitectónicas y límites; apagar recursos continuos al terminar. | Otra persona puede seguir el README y reproducir el flujo; presentas datos de latencia, coste y recuperación, y explicas qué cambiaría a ×10 de volumen. | Capacidad, RPO/RTO, postmortem, optimización. |

**Práctica continua:** desde la semana 1 cada cambio lleva una prueba útil, revisión de permisos y actualización del coste observado. `dev`, `test` y `prod` son entornos separados; la primera liberación a `prod` es corta y ocurre tras pasar pruebas y comprobar saldo. Kafka y Dataflow pueden consumir crédito mientras permanecen activos: usar ventanas de laboratorio y detener recursos al terminar cada sesión hasta medir su coste.

## Control del presupuesto

Los 300 USD son **crédito disponible declarado, no un precio estimado del proyecto**. Antes de crear recursos, verificar saldo, fecha de vencimiento y si la cuenta sigue en Free Trial o ya es Paid. En Free Trial, la documentación de Google indica que no se cobra durante la prueba; en Paid, uso no cubierto por crédito puede cobrarse. Un presupuesto con alertas no detiene por sí solo todos los servicios. Registrar coste diario, etiquetar recursos, fijar frecuencia baja de extracción, limitar mensajes y consultas de prueba, y apagar jobs de streaming fuera del laboratorio. No hacer funcionar `prod` 24/7 para simular profesionalidad.

## Primer bloque de trabajo: hoy

1. Escribir una ficha de una página: pregunta de negocio, quién usará el resultado, fuentes, grano de las tablas, contrato del evento, horario batch, meta de frescura y saldo/fecha de vencimiento del crédito.
2. Dibujar el recorrido de **un archivo batch** y de **un evento** hasta `daily_sales`; señalar dónde habría rechazo, repetición y recuperación. Decidir dónde se ejecutará Kafka antes de definir red, permisos y coste.
3. Crear una carpeta/repo nuevo y muestras pequeñas de `customers.csv`, `products.csv` y `order_events.jsonl`, con filas válidas e inválidas. Anotar conteos, tamaño y frecuencia previstos.

**Entrega para revisión:** ficha, diagrama y medidas de los archivos de muestra. Con eso se eligen región, frecuencia, retención y primer Terraform sin adivinar volumetría.

## Fuentes oficiales consultadas el 26 de septiembre de 2026

- [Cloud Run Jobs programados](https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule) y [Workflows ejecutando Jobs](https://docs.cloud.google.com/workflows/docs/tutorials/execute-cloud-run-jobs).
- [Carga JSONL de GCS a BigQuery](https://docs.cloud.google.com/bigquery/docs/loading-data-cloud-storage-json), [Dataform incremental y `uniqueKey`](https://docs.cloud.google.com/dataform/docs/create-tables) y [tablas particionadas](https://docs.cloud.google.com/bigquery/docs/partitioned-tables).
- [Lectura de Kafka desde Dataflow](https://docs.cloud.google.com/dataflow/docs/guides/read-from-kafka), [Kafka → Dataflow → BigQuery](https://docs.cloud.google.com/dataflow/docs/kafka-dataflow) y [métodos de escritura Dataflow/BigQuery](https://docs.cloud.google.com/dataflow/docs/guides/write-to-bigquery).
- [Workload Identity Federation para CI/CD](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines), [presupuestos y alertas](https://docs.cloud.google.com/billing/docs/how-to/budgets) y [programa Free Trial](https://docs.cloud.google.com/free/docs/free-cloud-features).
