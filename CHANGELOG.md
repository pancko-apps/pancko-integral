# CHANGELOG — Pancko Gestión v0.11.5

Fecha: 30/09/2026. Base: v0.11.4. App, shell y caché v0.11.5. Backend sin cambios (Apps Script v0.11.2; Worker v0.11.0).

## Corrección de Caja diaria

- Se identificó el bug: el conteo en v0.11.4 sólo se guardaba en memoria al editar; `pk_cash_daily_v1` recibía los valores al pulsar “Guardar sin cerrar” o cerrar la caja. Cerrar la PWA descartaba el conteo no guardado.
- Ahora cada estado válido de los cinco grupos, retiro y saldo manual se escribe inmediatamente en `pk_cash_daily_v1`. Enter y salida del campo también validan el dato. Se muestra “Conteo guardado en este dispositivo”.
- El importe de una expresión se convierte a centavos antes de guardar; la expresión en sí no entra al libro. Al recargar se ve el importe final.
- Una expresión incompleta, un retiro superior al contado o un importe inválido no reemplazan el último borrador válido. Queda visible el error y se bloquea cerrar hasta corregirlo.
- La escritura evita re-renderizar el formulario durante la edición, de modo que conserva foco, importe visible y posición de tipeo. No escribe otra vez si no hubo cambios. Si hay una operación ya en curso, difiere el borrador y lo guarda al completarse.
- Un fallo de almacenamiento muestra advertencia y conserva lo escrito; al reintentar correctamente se limpia esa advertencia. Las cajas existentes siguen con el mismo esquema y clave.
- En PC, la columna de fecha pasó a 250–285 px y el control de fecha tiene un mínimo de 170 px para evitar que se muestre “30/09/20”. La distribución móvil conserva sus tamaños previos.

## Compatibilidad y alcance

Los movimientos, totales, cierre/reapertura, historial, impresión y exportación conservan sus reglas. La diferencia y el “queda para mañana” se recalculan a partir del conteo restaurado y de los movimientos. El botón “Guardar sin cerrar” sigue disponible. No se modifican presupuesto, lista central, clientes ni tintométrico.

La nueva escritura es local e inmediata; todavía no sincroniza la Caja con Sheet ni entre dispositivos. No hay nuevas hojas ni endpoints. `backend/Pancko_AppsScript_v0.11.2.gs` y `backend/Pancko_Worker_v0.11.0.mjs` están completos e idénticos a v0.11.4; no hay que desplegarlos otra vez.

Archivos modificados: index.html, assets/caja.js, assets/caja.css, sw.js, data/version.json, textos de versión en assets/gestion.js/css y assets/desktop-shell.js/css, README.md, CHANGELOG.md, VALIDACION.md, VALIDACION_RESUMEN.json, VALIDACION_LAYOUT.json y SHA256SUMS.txt. Sin cambios byte a byte: tres CSV, manifest, iconos, backend y documentación de backend/lista.

## Subida

Descomprimir el ZIP y subir su **contenido** directamente a la raíz del repositorio, sin carpeta envolvente. Cerrar todas las ventanas Pancko y reabrir con conexión para activar la versión nueva. No borrar los datos del sitio: contienen las cajas. No se publicó nada desde esta entrega.

Pruebas y límites en VALIDACION.md; no se pudo ensayar la instalación PWA de escritorio ni medir visualmente el calendario en el Chrome real del mostrador.
