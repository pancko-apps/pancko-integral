# Pancko Gestión v0.12.21 · Recetas SPECIAL · Cañada producción

ZIP completo de frontend para publicar manualmente en el repo estable **después de respaldo y prueba controlada**. No se publicó desde esta entrega. Los archivos de `backend/` están incluidos como referencia histórica y son idénticos a v0.12.18: **no desplegarlos como un cambio de esta versión**.

Leer [RECETAS_SPECIAL_v0.12.21.md](RECETAS_SPECIAL_v0.12.21.md) para formato, carga manual, escala, límites y checklist. Subir el contenido del ZIP con `index.html` en la raíz. El CSV actual sólo tiene fórmulas NORMAL; ninguna SPECIAL real fue añadida.

Archivos cambiados frente a v0.12.18: `index.html`, `assets/budget-workbench.js`, `assets/gestion.js`, `assets/pwa-update.js`, `assets/budget-workbench.css`, `sw.js`, `data/version.json`, y **únicamente el encabezado** de `data/recetas.csv`. Archivos nuevos: `assets/special-recipes.js`, `assets/special-editor.js`, este documento y tests. Worker, Apps Script, Sheet, artículos, clientes y recetas existentes no fueron modificados.

Desde la paleta se puede crear una receta para el artículo elegido. Borrar el código de Fórmula y salir de la casilla restaura el precio base de la línea. El editor manual persiste recetas en el navegador; para que todos los equipos las reciban hay que añadir la fila al CSV y publicar con nueva versión de recetas. Guardar un registro de laboratorio no da de alta una receta. La Sheet actual no es fuente de recetas para la app.

La guía de seguridad anterior sigue en `SEGURIDAD_ENDPOINTS_v0.12.18.md` como referencia de la versión estable que sirvió de base. No se cambiaron sus endpoints ni claves.
