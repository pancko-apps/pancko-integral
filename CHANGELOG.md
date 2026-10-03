# v0.12.16 — compactación horizontal de la grilla de Presupuestos

- Cantidad y Precio más próximos por menor ancho de Cantidad, input alineado hacia Precio y menor padding horizontal.
- % Dto. e Imp. Dto. más próximos con el mismo criterio.
- Bloque Cantidad → Acción reducido del 46% al 44% del ancho de la grilla; sigue a la derecha, con títulos alineados y orden intacto.
- Anchos de Precio, Imp. Dto. e Importe conservados para precios grandes. Regla limitada a escritorio (1024 px o más); sin cambios de flujo, lógica, móvil, CSV, backend o estructura de datos.
- Versión visible, service worker/caché y `data/version.json` actualizados a v0.12.16.

Para instalación, pruebas y límites, ver `README.md` y `VALIDACION.md`.
