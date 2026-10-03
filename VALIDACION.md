# Validación v0.12.14

## Comprobaciones ejecutadas

- Sintaxis JS/Apps Script: 11 archivos externos/backend, 9 scripts inline y 208 handlers. Rutas relativas, manifest, version.json y precache presentes. CSS sin delimitadores desbalanceados.
- Comprobación de estructura: grilla conserva nueve columnas en el mismo orden; el tachito tiene nombre/tooltip y la prueba elimina una única línea, conservando los IDs de las demás.
- Regresión de Presupuestos: fórmula rápida, sugerencias de fórmulas compatibles, bases PASTEL/BLANCO/TINT/DEEP/ACCENT, Enter por Fórmula/Cantidad/% Dto., select-all, productos, selector múltiple, descuentos, limpieza del borrador, historial y reapertura offline.
- Salidas A4/ticket/canvas y compartir simulado, laboratorio tintométrico, Caja local y Cuenta Corriente PC/celular con backend simulado. PWA/service worker comprueban actualización y conservación del almacenamiento local.
- CSV de artículos/clientes/recetas y backend comparados byte a byte con v0.12.13. ZIP con raíz correcta, 32 archivos, hashes SHA256 y CRC validados.

## Lo que no se pudo comprobar físicamente

No hay binarios de Chromium, Firefox ni WebKit instalados en esta ejecución. El aspecto real a zoom 100% y 110%, el desplazamiento horizontal según monitor, y la presentación en móvil quedan para revisión en navegador. Tampoco se realizó impresión física, envío real de WhatsApp, ni conexión a la Sheet productiva. Las pruebas de DOM/canvas son simulaciones y no sustituyen esa revisión visual.
