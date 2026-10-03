# Pancko Gestión v0.12.18 — Seguridad endpoints

**Requiere frontend completo con assets, Worker completo, Apps Script completo y configurar PANCKO_APP_TOKEN en ambos.** Una sola Clave operativa Pancko por dispositivo, en Sincronización.

Leer primero **SEGURIDAD_ENDPOINTS_v0.12.18.md**: contiene tabla del relevamiento, variables, orden exacto Worker → Apps Script → frontend, compat temporal, paso a strict, pruebas guiadas y rollback.

ZIP listo para subir: index.html está en la raíz. Subir contenido completo sin carpeta extra. backend contiene los dos códigos completos para copiar/desplegar manualmente; subirlos al repo no despliega los backends. Ninguna clave real está incluida.

CSV de artículos/clientes/recetas idénticos a v0.12.17. data/version.json cambia sólo versión de app. No cambia estructura de datos ni hojas. No cambia lógica económica ni UX de presupuestos. No se publicó ni se interactuó con GitHub/Cloudflare/Sheets de producción.

Sincronizar todo conserva pendientes y muestra resultados por módulo. Lista central sólo consulta versión; publicar y recibir/aplicar siguen requiriendo revisión explícita.

VALIDACION.md declara pruebas realizadas y límites. Los documentos de backend anteriores se conservan como referencia histórica; sus instrucciones de claves separadas están sustituidas por SEGURIDAD_ENDPOINTS_v0.12.18.md.
