## v0.12.8 — Recarga de la PWA

- Navegador/worker simulados: eliminación de caches de Pancko antes de `update`, conservación de cache ajeno, `skipWaiting`, `clients.claim`, navegación con parámetros `pk_refresh` y `pk_fresh`, y respuesta de red `no-store` para esa navegación.
- Sin worker en espera: desregistro y navegación de red; sin conexión: no se borran archivos. La comprobación después de navegar muestra éxito si carga la versión publicada y el mensaje de cerrar y reabrir si permanece una anterior. Claves y libros locales permanecen idénticos.
- Sintaxis de JavaScript, Apps Script y Worker, versión/cache, rutas relativas y contenido del ZIP verificados. No se pudo ejecutar en Chrome/Firefox/Android físicos ni contra GitHub Pages publicado; Tincho debe verificar el comportamiento real una vez subido.

## v0.12.7 — Buscador de Caja diaria

- DOM simulado con libro real `pk_cash_daily_v1`: encuentra ingreso, egreso, dos anotaciones de importe 0, detalle parcial con y sin tilde, fecha, importe, operador/dispositivo y movimiento anulado.
- Abrir un resultado selecciona y muestra su fecha; filtro queda escrito. Libro almacenado idéntico antes y después de buscar/abrir. Una nueva jornada recibida en el libro local aparece tras recarga.
- Sintaxis de bloques JavaScript, rutas, versión/cache, archivos del ZIP y CSS de ancho móvil comprobados. No se hizo prueba visual en Chrome/Android físicos ni consulta a Sheet productiva. Verificar el aspecto en PC y celular tras subir los archivos; si faltan fechas remotas, actualizar Caja desde central.

# Validación — Pancko Gestión v0.11.7

Se ejecutó código frontend real, Worker real y Apps Script real sobre DOM, almacenamiento y Sheets simulados. No sustituye una prueba en PC y celular con servicios desplegados.

| Caso | Resultado simulado |
|---|---|
| PC crea caja y movimiento A | Un snapshot central por fecha, movimiento una sola vez. |
| Celular recibe caja y carga B | PC actualiza y ve A+B. |
| Carga offline y posterior envío | Local/cola conservados; reconexión sin duplicar. |
| Anulación y eliminación | Anulada visible sin sumar; eliminada fuera de vista/TXT, evento técnico conservado. |
| Edición simultánea del mismo movimiento | Conflicto explícito; no sobrescribe la versión central. |
| Cierre con movimiento nuevo ajeno | Bloquea y exige actualización/revisión. |
| Cierre correcto y consulta desde segundo equipo | El segundo ve caja cerrada y no puede editar. |
| Reapertura confirmada | El segundo recibe reapertura y cierre previo conservado. |
| Caja al día siguiente | Saldo del cierre anterior y desglose si es deducible, también en dispositivo sin caja previa. |
| Local v0.11.6 | Legible; caja histórica cerrada con movimiento se publica sin alterar su cierre si la fecha aún no existe centralmente. |

También se comprobaron clave inválida, lectura que no crea hojas, endpoints nuevos del Worker, sintaxis de backend, service worker, rutas y archivos relativos, CSV intactos y ZIP raíz. La regresión del frontend existente aprobó 41 comprobaciones. La cola usa IDs estables e idempotencia del servidor; el doble envío y el merge de movimientos distintos están cubiertos por el modelo y la simulación.

**Pendiente fuera de este entorno:** despliegue manual real de Apps Script/Worker, permisos de la implementación web, latencia/cuotas efectivas de Sheets, caché de la PWA instalada, impresora y prueba física PC/celular. Si el backend antiguo sigue activo, la Caja continúa local y muestra error/pendientes; no se deben interpretar esos pendientes como sincronizados.

## Verificación de URL corregida (1 de octubre de 2026)

- Sintaxis del Worker con Node (`node --check`).
- Prueba aislada de `/colors`: petición a Apps Script con la URL nueva, aun si `env.GAS_URL` apuntase a la anterior. Se conserva la acción `list_colors`.
- No se modificaron archivos de PWA, CSV, HTML ni Apps Script; comparados byte a byte con la entrega v0.11.7.
- No se verificó el despliegue real de Cloudflare ni el permiso/contenido del nuevo Apps Script en producción. La comprobación final requiere desplegar el Worker y solicitar una ruta real como `/colors`, además de `/ping`.

## v0.11.8 — Validación de presentación

- Sintaxis de todos los bloques JavaScript embebidos, `sw.js`, JSON de versión y Worker: correcta.
- DOM simulado con el código de la app: abrir/cerrar fechas, arrastrar desglose, panel anterior sin inputs, conteo de hoy editable, suma/resta y Enter, guardado en `pk_cash_daily_v1`, lectura de movimientos, seis totales, estado de demora.
- Prueba simulada de dos dispositivos sobre backend aislado: movimientos distintos combinados sin duplicados; migración de una caja local v0.11.6 conservada en v0.11.8.
- Archivos backend y CSV comparados byte a byte con el paquete v0.11.7 con URL corregida.
- Limitación: no se ejecutó prueba visual en navegador real ni se tocó el servicio remoto/Sheet productivo. El DOM y las pruebas de sincronización fueron simulados. Revisar la pantalla en PC y celular luego de subir el paquete.

## v0.12.2 — Validación central de CC

- Backend Apps Script y Worker: sintaxis, rutas y protocolo comprobados con Sheet y Lock simulados. Sin cambios en las funciones existentes de Caja/precios/presupuestos.
- Dos navegadores simulados contra el mismo backend: cliente creado en PC recibido en celular; cargo de PC, pago de celular y saldos iguales; cliente creado en celular recibido en PC. Edición, anulación, reintentos sin duplicar, alta offline pendiente, conflicto edit/edit sin sobrescritura y resolución explícita después de respaldo.
- Migración de un libro `pk_cc_manual_v1` anterior sin campos de sincronización: sube el movimiento una vez con su ID. Cliente de CSV con ID diferente se remapea al central si su ficha local no tiene movimientos.
- Regresión de navegación, CSV, presupuesto, A4/ticket, tintométrico, Caja compartida, sintaxis JS, SW y ZIP completo. Ver resultados de pruebas debajo.
- **Sin prueba sobre la Sheet, el Apps Script y el Worker productivos ni prueba visual en PC/celular reales.** El acceso de la nueva implementación `/exec`, el token, la PWA instalada y la impresión se deben comprobar tras el despliegue siguiendo README. Conflictos de clientes de distinto ID con movimientos locales requieren conciliación manual; nunca se mezclan automáticamente.

## v0.12.1 — Validación de correcciones UX

- Pruebas con el código real y DOM simulado: cargo, pago y ajuste editados sin cambiar ID; importe modificado con confirmación, edición de anulado bloqueada, saldo recalculado y libro persistido en `pk_cc_manual_v1`.
- Parser de importes con miles y decimales, vista previa y confirmación adicional desde $1.000.000; duplicados y corrupción de libro siguen protegidos.
- Ficha TXT, copia y HTML de impresión con fechas, saldos y movimientos; botones y contraste inspeccionados estáticamente. Campos de clave sin `type=password`, con `autocomplete=off` y Mostrar/Ocultar.
- Regresión de cuenta local, resguardos/importación y guardas anteriores. Comparación byte a byte de CSV, assets y backend contra v0.12.0. Sintaxis de scripts y service worker, manifiesto, rutas y estructura ZIP.
- **No se pudo comprobar en Chrome real** si desapareció el aviso “Guardar contraseña”, ni la impresión visual real, ni probar en PC y celular físicos. Tampoco se probó contra Google Sheets: esta versión no toca backend ni centraliza CC. Revisar estos puntos luego de subir el paquete.

## v0.12.0 — Validación de cuenta corriente

- Sintaxis de bloques JS, `sw.js`, Worker sin cambios y JSON de versión.
- DOM simulado con código real: cliente nuevo y edición, cargo con número Yoppen, pago en efectivo, ajuste positivo/negativo, saldo, anulación conservada, filtro por comprobante, controles de importe y duplicado, referencia y nota.
- Respaldo JSON e importación en otro navegador simulado; detección de ID conflictivo, relectura de almacenamiento y protección ante libro corrupto. Cliente antiguo sin ID recibe uno persistente.
- No cambian `pk_cash_daily_v1`, las operaciones de sincronización de Caja, los datos CSV ni backend (comparación byte a byte).
- Limitación: sin prueba visual en navegador real ni acceso a servicios productivos; revisar desktop/móvil tras subir el paquete. CC es local/offline y no se propaga sola entre dispositivos.


## v0.12.3 — Recepción automática y UX

- Dos dispositivos simulados con backend real ejecutado sobre Sheet simulada: cargo/pago recibidos automáticamente al entrar, edición/anulación, migración e idempotencia de v0.12.2 preservadas.
- Polling de 60 segundos ejecutado con reloj controlado, filtros Desde/Hasta preservados; formulario abierto conserva importe sin reemplazo por respuesta automática. Al salir del módulo se detiene el temporizador. Panel inferior plegado y badge superior comprobados en DOM.
- Backend y CSV comparados byte a byte contra v0.12.2; sintaxis, rutas relativas, versión/cache y ZIP completo verificados.
- No se probó esta versión contra servicios productivos ni visualmente en PC/celular físicos. La sincronización v0.12.2 sí fue confirmada por Tincho; tras subir v0.12.3, comprobar recepción automática con la app visible durante un minuto. El navegador puede demorar timers si la pestaña está oculta; al volver visible se consulta nuevamente.


## v0.12.4 — Identidad manual

- Dos dispositivos y Sheet simulada: central A con cargo + local B homónimo con otro cargo; detección, revisar después, unión explícita, saldo combinado, IDs/op_id de movimiento conservados, evento de unión, reintento sin duplicados y recepción por otro dispositivo.
- Mantener separados con nombre distinguible y mismo documento: ambas fichas se sincronizan y conservan movimientos. Unión cuando ambas fichas ya tenían filas centrales, reintento del evento y edición posterior del movimiento de la ficha anterior.
- Regresión de sincronización/polling de v0.12.3, validación de sintaxis/rutas/cache y paquete completo. CSV, assets y Worker comparados contra la base.
- No se modificó ni probó la Sheet productiva. Sin prueba visual en los dispositivos reales. Requiere actualizar la implementación Apps Script antes del primer uso de la unión; probar primero con fichas de prueba y conservar los respaldos descargados.


## v0.12.5 — Detalle de productos en cargos

- DOM y dos dispositivos simulados con Apps Script v0.12.4 y Sheet aislada: cargo sin productos, dos artículos con PR_CON_IVA, suma y aviso de diferencia, precio manual obligatorio, modo sin precio, edición con snapshot histórico, transmisión al segundo dispositivo, alta offline pendiente y recepción al reconectar, anulación, reintento sin duplicados y edición de cargo antiguo.
- Regresión de unión/separación de identidades v0.12.4, sincronización PC/celular, cliente, pago, edición/anulación y conflicto de revisión. Regresión de 41 flujos de presupuesto, búsqueda, CSV, tintométrico, A4/ticket y navegación. Sintaxis de JS y verificación de archivos, rutas, versión/cache y ZIP.
- No se probaron el servidor, la Sheet ni dispositivos de producción; tampoco vista/impresión en un navegador real. En esta instalación verificar recepción del detalle en celular y pantalla móvil. La ficha impresa puede ocupar más de una hoja cuando tiene muchos artículos.


## v0.12.6 — Pagos imputados y PWA

- Apps Script sobre Sheet y Lock simulados: pago aplicado parcial/total, reintento idempotente, edición y anulación revierten efectos, dos dispositivos compiten por un mismo pendiente y el segundo conserva conflicto sin doble imputación.
- DOM simulado: selección de cargos, importe sugerido, distribución por fecha, saldo general e individual, historial; regresiones CC y unión de clientes v0.12.4, productos v0.12.5 y 41 flujos generales.
- Cache Storage y service worker simulados: instalación con peticiones frescas, consulta `version.json` con parámetro fresco, versión diferente, limpieza selectiva, desregistro y navegación; claves locales de Caja, CC, precios y catálogo intactas. Offline no inicia limpieza.
- Sintaxis JS/Apps Script/Worker, referencias, cache, CSV, ZIP y rutas verificadas. No se ejecutó contra Sheet/Worker productivos ni se comprobó visualmente en PWA real PC/celular. Un worker viejo puede responder una primera consulta con su version.json anterior; la recarga limpia obtiene index por red.
## Corrección de la versión de `/exec` — 2 de octubre de 2026

- Sintaxis del Apps Script y respuestas aisladas de `doGet()` sin parámetros y `doGet({parameter:{action:'ping'}}`: ambas informan `version: "0.12.6"`.
- No se ejecutó contra el Apps Script publicado; verificar luego de actualizar la implementación web existente.
