# Pancko Gestión v0.12.16 — ajuste de columnas de Presupuestos

ZIP completo del sitio para subir **el contenido interior** a la raíz del repositorio de GitHub Pages. `index.html`, `sw.js`, `assets/` y `data/` deben quedar al mismo nivel. No se interactuó con GitHub ni se publicó la app.

## Qué cambió

Sólo se ajustó CSS de la grilla de Presupuestos para escritorio (desde 1024 px). Descripción toma 36% en lugar de 34%. El bloque numérico, desde Cantidad hasta Acción, ocupa 44% en vez de 46%: Cantidad 6%, Precio 9%, % Dto. 6%, Imp. Dto. 9%, Importe 10% y Acción 4%. El bloque comienza al 56% de la tabla en vez del 54%; los espacios horizontales internos se reducen de 6 a 3 px en esas columnas. Los inputs de Cantidad y % Dto. se alinean hacia el importe siguiente y conservan su función, con ancho máximo de 58 px. Se preserva el ancho de las columnas monetarias para que los precios grandes no se corten. Orden, alineación, fórmula, datos comerciales y resumen siguen como en v0.12.15. Móvil no recibe estas reglas de compactación.

Versiones de `index.html`, `sw.js`, `assets/pwa-update.js` y `data/version.json` pasan a v0.12.16 para actualizar la PWA. El único archivo de interfaz con cambios visuales es `assets/budget-workbench.css`.

## Archivos, datos y backend

Subí **assets completo**, además de `index.html`, `sw.js` y `data/` completos, para evitar mezclas de caché. En `data/` sólo cambia `version.json`; `articulos.csv`, `clientes.csv` y `recetas.csv` son byte por byte iguales a v0.12.15. `assets/budget-workbench.js`, Caja, Cuenta Corriente y todo el backend también son byte por byte iguales. Los archivos Apps Script y Worker están en el ZIP sólo para que el paquete sea completo: **no requieren actualización ni despliegue**. No hay tokens, hojas, endpoints, esquemas ni migraciones nuevas.

## Después de subir

Con red, usá «Forzar actualización» en Sincronización. Si la PWA pide cerrar todas las ventanas de Pancko, cerralas y reabrí hasta que muestre v0.12.16. La actualización conserva `localStorage`.

Ver `VALIDACION.md` para pruebas y límites.
