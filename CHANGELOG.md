# v0.12.10 — Sugerencias, lote y descuentos claros en Presupuestos

Fecha: 02/10/2026. Base: v0.12.9.

- Sugerencias rápidas al escribir, clic para agregar; Enter mantiene selección exacta/única/múltiple.
- Selector completo con casillas y botón «Agregar seleccionados», precio snapshot y líneas independientes. Bases TINT/DEEP/ACCENT en lote quedan pendientes para editar desde Fórmula.
- Importe de cada línea muestra sólo su descuento propio. Resumen: subtotal neto de línea, ahorro informativo, descuento general y total. Las salidas mantienen sus cálculos anteriores.
- Condición/forma de pago textual y descuento general numérico independiente. Se muestran en A4/imagen y ticket; alternativas de pago configuradas siguen disponibles.
- Tachito con confirmación restablece borrador, cliente Consumidor final, condición Lista y 0% sin tocar historial.
- Claves locales nuevas `pk_budget_condition_v1`, `pk_budget_general_pct_v1`; migración inicial de términos v0.12.9. Historial/Sheet mantienen `modo` y `modePercent`.
- Archivos modificados: `index.html`, `assets/budget-workbench.js`, `assets/budget-workbench.css`, `assets/pwa-update.js`, `sw.js`, `data/version.json`, `README.md`, `CHANGELOG.md`, `VALIDACION.md`, `SHA256SUMS.txt`. Backend y CSV sin cambios.
- Pruebas: 23 controles de pulido, 26 del presupuesto anterior, 41 generales, Caja, Cuenta Corriente entre dispositivos simulados, PWA/SW, sintaxis, rutas y ZIP; límites en `VALIDACION.md`.
- **Subir assets completo. Sólo index.html no alcanza.** No requiere actualizar Apps Script ni Worker.

---

# v0.12.9 — Presupuestos como comprobante en carga

Fecha: 02/10/2026. Base: v0.12.8 (se mantiene su corrección de Forzar actualización).

- Cabecera de cliente/condición, grilla de ocho columnas, totales y acciones integradas al shell Pancko; adaptación móvil.
- Enter por código/texto; selector de coincidencias con filtros según datos disponibles.
- Modal automático sólo para TINT/DEEP/ACCENT o base desconocida. PASTEL/BLANCO permite agregar fórmula desde su columna.
- Validación de fórmula/base/factor; snapshot de precio base, ficha del producto y fórmulas por línea. El mismo código puede tener líneas con precios distintos.
- Se corrigió en el editor de Presupuestos la consulta de precio base vivo y la relectura de receta para el mismo color: se usan los valores históricos guardados. El laboratorio conserva sus cálculos.
- Se evita borrar el color existente al dar foco al campo de edición.
- Copia de presupuesto histórico como nuevo, con confirmación de reemplazo del borrador y sin editar la entrada original.
- Nuevos: `assets/budget-workbench.js`, `assets/budget-workbench.css`.
- Modificados: `index.html`, `assets/pwa-update.js` (versión), `sw.js` (versión/precache), `data/version.json`, `README.md`, `CHANGELOG.md`, `VALIDACION.md`, `SHA256SUMS.txt`.
- Backend, hojas, endpoints, tokens y CSV sin cambios. No requiere migración ni redeploy.
- Pruebas aprobadas: 26 específicas + 41 generales y suites de CC, Caja y PWA. Sintaxis/rutas/ZIP comprobados. Ver `VALIDACION.md`.
- Limitación: navegador y servicios simulados; no se ejecutó revisión visual real PC/móvil, impresión física, compartir nativo ni conexión a producción.
- **Subir assets completos: no alcanza index.html.**

---

# CHANGELOG — Pancko Gestión v0.12.8

## v0.12.8 — Recarga de la PWA (2 de octubre de 2026)

- Corrección del botón: limpieza de caches antes de pedir actualización, activación explícita del worker en espera y navegación con URL nueva. El worker v0.12.8 trae `index.html` desde red cuando llega `pk_refresh` y reclama la ventana al activarse.
- Aviso global de resultado y comprobación tras navegar: versión actualizada o instrucción de cerrar todas las ventanas y reabrir. Se corrigió el indicador del archivo `pwa-update.js`, que en v0.12.7 seguía mostrando «Instalada: 0.12.6».
- Modificados `index.html`, `assets/pwa-update.js`, `sw.js`, `data/version.json`, README, CHANGELOG, VALIDACION y comprobación de archivos. Caja, Cuenta Corriente, CSV, Apps Script v0.12.6 y Worker v0.12.2 sin cambios de código respecto del ZIP v0.12.7. No se publicó ni se desplegó.

## v0.12.7 — Búsqueda local de movimientos de Caja (2 de octubre de 2026)

- Campo de búsqueda en «Historial por fecha»: recorre todas las cajas y movimientos disponibles localmente, incluidos importes cero y anulados. Busca detalle, fecha/hora, importe, dispositivo y estado; compara sin distinguir tildes o mayúsculas. Resultado con fecha, hora, detalle, importe, dispositivo y marca de anulación; al abrirlo muestra la jornada.
- Sólo consulta `pk_cash_daily_v1`; las jornadas centrales ya recibidas forman parte del libro local. No busca fechas que aún no llegaron al dispositivo. Los movimientos eliminados definitivamente no se muestran.
- Modificados `index.html`, `assets/caja.js` (copia de referencia), `assets/caja.css` (copia de estilos), `sw.js`, `data/version.json`, documentación y comprobación de archivos. Apps Script v0.12.6 corregido, Worker, CSV y demás módulos sin cambios frente al ZIP v0.12.6 corregido. No hay que redeplegar backend por esta mejora.

## v0.12.6 — Pagos imputados y recarga PWA (2 de octubre de 2026)

- Aplicaciones opcionales en pagos manuales; sugerencia por cargos seleccionados, parcial y reparto cronológico, saldo individual calculado desde pagos activos, estado y detalle en ficha. Pago general conserva su flujo.
- Apps Script completo v0.12.6 valida capacidad bajo bloqueo para evitar doble imputación entre dispositivos y conserva idempotencia/revisiones. Se reutilizan hojas, columnas, rutas y `PANCKO_CC_TOKEN`; Worker idéntico al v0.12.2 vigente.
- Estado de versión instalada/publicada, búsqueda y recarga limpia desde Sincronización. Servicio offline v0.12.6 deja pasar consultas de versión frescas. Se borran caches de app, no almacenamiento local.
- Modificados: `index.html`, `sw.js`, `data/version.json`, `assets/cc-payment-applications.js`, `assets/pwa-update.js`, Apps Script v0.12.6 y documentación. CSV y demás recursos sin cambios. No se publicó ni se desplegó.

## v0.12.5 — Detalle opcional de productos en cargos (2 de octubre de 2026)

- Sección plegada en Nuevo cargo: búsqueda desde artículos locales, cantidad, quitar línea y modos precio actual, manual o sin precio. Guarda código, descripción, cantidad, origen y snapshot de precio; sugiere importe sin imponerlo y advierte diferencias.
- El detalle viaja dentro del movimiento de CC, aparece en ficha y salidas TXT/copiar/imprimir, y se puede corregir al editar sin perder ID/revisión. Cargos anteriores y cargos sin productos conservan su formato y saldo.
- `index.html`, `assets/cc-product-detail.js`, `sw.js`, `data/version.json`, README/CHANGELOG/VALIDACION y SHA256SUMS modificados. CSV, demás assets, Apps Script, Worker, hojas, endpoints y tokens idénticos a v0.12.4. Sin despliegue de backend.

## v0.12.4 — Conflictos de identidad (2 de octubre de 2026)

- Comparación local/central por cliente, contacto, ID, cantidad de movimientos y saldo. Acciones explícitas: unir con ID central, separar con nombre distinguible o revisar después.
- Unión registrada en snapshot de cliente destino y evento client_merge. Operación idempotente; referencia central del ID anterior, sin borrar filas. Reasignación local de movimientos/cola conservando sus IDs. Respaldo previo y auditoría de operaciones de cliente retiradas.
- Conflictos de identidad ya no bloquean la recepción del libro ni la sincronización de clientes ajenos. Pendientes ligados a la pareja esperan decisión.
- Apps Script completo v0.12.4 obligatorio; Worker v0.12.2 idéntico, sin redeploy. Hojas y encabezados existentes compatibles; sin propiedades nuevas. Modificados index.html, sw.js, data/version.json, Apps Script, documentación y SHA256SUMS. CSV/assets y otros módulos preservados.

## v0.12.3 — UX y recepción automática de CC (1 de octubre de 2026)

- Consulta automática al entrar/elegir cliente, al recuperar visibilidad y cada 60 segundos dentro del módulo. Sin consultas superpuestas; pausa ante formulario abierto, conflicto, falta de clave/red o módulo oculto.
- Estado compacto superior y panel de configuración/sincronización plegable bajo las fichas. Los errores automáticos completos quedan en el panel inferior.
- Se conservan filtros de fechas al recibir central, pendientes locales, IDs, cálculos y botones manuales. Backend, hojas, propiedades, CSV, assets y módulos restantes sin cambios respecto de v0.12.2.
- Modificados: index.html, sw.js, data/version.json, README, CHANGELOG, VALIDACION y SHA256SUMS. No se publicó ni desplegó.

## v0.12.2 — Cuenta corriente central (1 de octubre de 2026)

- `pk_cc_manual_v1` sigue siendo el libro local y ahora incluye `sync_pending` con operaciones estables. Los movimientos nuevos, editados o anulados se guardan primero localmente; al volver la red se envían a Sheet y se reciben cambios hechos en otros dispositivos. Se conserva el ID de los movimientos v0.12.0/v0.12.1.
- Se sincronizan clientes vinculados y clientes nuevos mediante `cc_clientes_extra`; la recepción reconcilia un cliente importado con ID diferente sólo si esa ficha local no tiene movimientos. Una coincidencia ambigua se bloquea y pide revisión.
- Nuevas rutas Worker POST `/cc/get` y `/cc/apply`, acciones Apps Script `cc_get` y `cc_apply`. Token separado `PANCKO_CC_TOKEN`. Nuevas hojas automáticas al primer guardado: `cc_clientes_extra`, `cc_movimientos`, `cc_eventos`. Las dos primeras guardan filas legibles más un snapshot JSON por entidad; eventos son auditoría auxiliar. Sin cambios en hojas existentes.
- Con bloqueo de Script, revisión por entidad y `op_id` guardado en la fila, los reintentos no duplican operaciones. Creaciones de distinto ID se combinan. Editar/anular un movimiento cambiado en otro dispositivo devuelve conflicto. Respaldo y resolución explícita para mismo ID.
- Archivos modificados: `index.html`, `sw.js`, `data/version.json`, `backend/Pancko_AppsScript_v0.12.2.gs`, `backend/Pancko_Worker_v0.12.2.mjs`, documentación y checksums. CSV, assets, manifest e íconos idénticos a v0.12.1. No se cambió Caja, presupuestos, precios ni tintométrico. No se desplegó ni publicó desde esta entrega.

## v0.12.1 — Correcciones de Cuenta corriente (1 de octubre de 2026)

- Editar cargo, pago y ajuste activos conservando ID; confirmar importe cambiado y montos altos; registrar edición y recálculo del saldo. Los anulados permanecen bloqueados.
- Vista previa y normalización del importe en formato argentino. Ficha imprimible, TXT y copia al portapapeles con filtros de fechas visibles y saldo corrido.
- Mejor contraste del botón Cta CTE en Clientes. Campos operativos enmascarados con Mostrar/Ocultar, sin campos `type=password` en la app.
- Archivos de app modificados: `index.html`, `sw.js`, `data/version.json`. CSV, recursos `assets/`, manifest, Apps Script y Worker idénticos a v0.12.0. Documentación y checksums renovados. Sin hojas, propiedades ni endpoints nuevos. No se tocó la Caja compartida.
- CC sigue local/offline en `pk_cc_manual_v1`; v0.12.2 queda especificada como próxima etapa central. No se publicó ni se interactuó con servicios productivos.

## v0.12.0 — Cuenta corriente manual local

- Nuevo módulo operativo de ficha por cliente: búsqueda, filtros con/sin saldo, resumen general, cargos con referencia Yoppen, pagos por forma, ajustes y anulación conservando historial. Importe directo y detalle libre; productos opcionales pendientes.
- Alta y edición de clientes con localidad, nota y estado; alerta de similitud y bloqueo de duplicado exacto/documento. Si falta ID histórico, se asigna ID local estable; cliente con movimientos no se elimina desde la interfaz.
- Persistencia local independiente `pk_cc_manual_v1`, saldo calculado desde movimientos activos en centavos. Exportación/importación JSON con validación y detección de conflictos por ID. No hay sincronización central de CC; Caja sigue compartida sin cambios.
- Archivos de app cambiados: `index.html`, `sw.js`, `data/version.json`. Documentación actualizada: `README.md`, `CHANGELOG.md`, `VALIDACION.md`, `SHA256SUMS.txt`. CSV, Apps Script y Worker íntegros e idénticos a v0.11.8. No hay hojas, endpoints ni propiedades nuevas.
- Un pago en CC no escribe en Caja. Presupuestos, lista de precios, tintométrico y facturación no crean CC automáticamente. No se interactuó con servicios productivos ni se publicó.

## v0.11.8 — Caja diaria, presentación (1 de octubre de 2026)

- En PC, cierre previo de sólo lectura y conteo de hoy editable en dos columnas; en móvil, apilados. La fecha de origen es visible. El cierre ya registrado se muestra dentro del mismo esquema.
- Movimientos: detalle e importe más legibles, dispositivo debajo, egresos distinguibles, acciones alineadas al extremo derecho. En anchos de escritorio ajustados, las tarjetas se apilan para conservar la lectura de la tabla.
- Resumen compacto: saldo inicial, ingresos, egresos, saldo teórico, contado y diferencia. Texto menos alarmante cuando la sincronización demora o hay envíos pendientes, con el error concreto conservado.
- Archivos de la app cambiados: `index.html`, `sw.js`, `data/version.json`; documentación `README.md`, `CHANGELOG.md`, `VALIDACION.md` y checksums. Los CSV, Apps Script y Worker son idénticos a la entrega v0.11.7 corregida. Sin nuevas hojas, propiedades o endpoints. No cambian cálculos, ID, persistencia, cola ni protocolos de sincronización.
- Instalación existente: subir contenido del ZIP a la raíz del repo; cerrar/reabrir la PWA conectada. Sin redeploy de backend.

## Corrección de enlace Apps Script — 1 de octubre de 2026

- `backend/Pancko_Worker_v0.11.7.mjs`: cambia la URL del Apps Script a la nueva implementación proporcionada por Tincho. El destino fijado en el Worker prevalece ante una eventual variable de entorno `GAS_URL` antigua. Rutas y acciones existentes se conservan.
- `README.md`, `CHANGELOG.md`, `VALIDACION.md`, `SHA256SUMS.txt`: se actualiza documentación y verificación. El resto de archivos de la app y el Apps Script son idénticos a la entrega v0.11.7 previa. No hay nueva versión de la PWA ni cambios de caché porque el frontend conserva exactamente la misma URL del Worker.
- Para una instalación existente, desplegar manualmente **sólo el Worker completo** en Cloudflare. Este paquete sigue incluyendo todos los archivos del repositorio para instalación completa. No se ha desplegado en Cloudflare ni publicado en GitHub.



Base: v0.11.6. Alcance: Caja diaria compartida entre dispositivos; sin cambios funcionales en presupuestos, tintométrico, precios, clientes, remitos, cuenta corriente ni cheques.

## Caja

- `pk_cash_daily_v1` sigue siendo el libro local y ahora contiene `sync_pending` (operaciones con ID) y revisiones centrales por fecha. Cambios locales y su cola se escriben juntos. Al recuperar conexión se envían sin duplicar IDs.
- Se agregó nombre/clave local por dispositivo, estado visual de sincronización y botones «Sincronizar caja» y «Actualizar desde central». No hay login ni permisos por operador.
- Aperturas, movimientos, edición, anulación, eliminación, conteo, saldo inicial, cierre y reapertura se envían como operaciones. El backend aplica bajo lock y devuelve conflictos para versiones incompatibles. Los movimientos nuevos de varios equipos se combinan; una caja cerrada no admite ediciones desde otro dispositivo.
- «Anular» mantiene la fila sin sumar. «Eliminar definitivamente» requiere escribir ELIMINAR y otra confirmación: quita de lista/impresión, conserva ID y evento técnico de auditoría. No se borran rastros técnicos.
- Un conflicto no reemplaza automáticamente el libro local. Hay una recuperación explícita que primero descarga y guarda copia local del libro.
- Se preservan saldo y desglose de billetes del cierre v0.11.6.

## Backend y hojas

- `backend/Pancko_AppsScript_v0.11.7.gs` reemplaza al completo v0.11.2. Requiere propiedad nueva `PANCKO_CASH_TOKEN` (16+ caracteres), sin cambiar propiedades de lista de precios. Crear nueva versión de la implementación web.
- `backend/Pancko_Worker_v0.11.7.mjs` reemplaza al Worker v0.11.0. Agrega POST `/cash/get` y `/cash/apply`; rutas anteriores conservadas. Requiere desplegar el Worker.
- Primera escritura válida crea `caja_diaria` (snapshot autoritativo por fecha) y `caja_eventos` (auditoría auxiliar). Lectura simple no crea hojas. No toca hojas preexistentes.

Archivos del frontend modificados: `index.html`, `assets/caja.js`, `assets/caja.css`, nueva fuente `assets/caja-sync.js`, `sw.js`, `data/version.json` y textos de versión en assets de shell/gestión. CSV, manifest e iconos sin cambios.

## Despliegue

Seguir **en orden** las instrucciones de `README.md`: respaldar Caja; reemplazar/desplegar Apps Script, configurar su propiedad secreta, reemplazar/desplegar Worker y después subir el contenido completo del ZIP a la raíz del repo. Cerrar/reabrir la PWA con conexión y configurar nombre/clave en cada equipo. No borrar datos del sitio. No se interactuó con GitHub, Cloudflare ni Google Sheets productivos en esta entrega.

Pruebas, límites y contrato en `VALIDACION.md` y `README.md`. El Informe para Cerebrito se entrega en el texto final, fuera del ZIP.
## Corrección de Apps Script v0.12.6 — 2 de octubre de 2026

- La ruta GET `/exec` (`ping` por defecto) ahora informa la versión real `0.12.6` mediante `VERSION`; el literal `0.12.4` había quedado en `doGet`.
- Sin cambios de backend funcional, Worker, hojas, datos ni frontend. Requiere guardar el Apps Script completo y crear una nueva versión de la implementación web existente para que cambie la respuesta pública.
