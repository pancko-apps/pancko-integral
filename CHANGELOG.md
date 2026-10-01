# CHANGELOG — Pancko Gestión v0.12.0

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
