# CHANGELOG — Pancko Gestión v0.11.6

Fecha: 30/09/2026. Base: v0.11.5. Backend sin cambios.

## Caja diaria

- Confirmado: caja cerrada bloqueada; reapertura con confirmación e historial; saldo inicial del día nuevo sugerido desde el último cierre anterior.
- Cierres nuevos guardan un snapshot `remaining_counts` en el mismo libro local `pk_cash_daily_v1`, sin modificar importes históricos. El retiro se resta primero del grupo de $20.000/$10.000, y los demás grupos se conservan.
- Si el retiro supera ese grupo o el “queda para mañana” manual no cuadra, la vista previa y el cierre advierten; se guarda saldo total, `remaining_counts: null` y motivo, sin inventar billetes.
- La nueva jornada precarga como conteo inicial los grupos sólo si conserva el saldo sugerido y el cierre anterior guardó desglose confiable. El retiro nuevo comienza en cero. El conteo inicial debe ajustarse según efectivo real durante el día.
- Al reabrir una caja anterior y volverla a cerrar, se conserva la foto del primer cierre en historial. Jornadas posteriores ya creadas no cambian su saldo ni su conteo automáticamente.
- Los cierres de v0.11.5 o previos se leen igual y no reciben desglose retroactivo. Se mantiene `schema_version: 1` y la misma clave de almacenamiento.

Archivos cambiados: `index.html`, `assets/caja.js`, `assets/caja.css` (sólo comentario de versión), `sw.js`, `data/version.json`, textos de versión en `assets/gestion.js`, `assets/gestion.css`, `assets/desktop-shell.js` y `assets/desktop-shell.css`, `README.md`, `CHANGELOG.md`, `VALIDACION.md` y `SHA256SUMS.txt`. Los CSV, iconos, manifest, backend conservan sus bytes.

No hay cambios de Sheet, endpoints, Apps Script ni Worker. Los archivos de `backend/` son referencia de la entrega previa; no hace falta desplegarlos.

## Instalación

Descomprimir y subir el **contenido** del ZIP a la raíz del repositorio. Cerrar las ventanas de la PWA y reabrir con conexión para activar v0.11.6. No borrar los datos del sitio; allí está la Caja. No se usó GitHub ni se publicó nada en esta entrega.

Ver `VALIDACION.md` para pruebas y límites. El Informe para Cerebrito se entrega sólo en el texto final de la conversación.
