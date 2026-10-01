# CHANGELOG — Pancko Gestión v0.11.7

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
