# Pancko Gestión v0.12.17 — grilla de Presupuestos ajustada a la captura

ZIP completo del sitio. Descomprimí y subí **el contenido interior** a la raíz del repositorio de GitHub Pages: `index.html`, `sw.js`, `assets/`, `data/` y demás archivos al mismo nivel. No se interactuó con GitHub ni se publicó la app.

## Corrección visual

La captura de v0.12.16 mostró que los huecos seguían entre el campo de fórmula y Cantidad, Cantidad y Precio, % Dto. e Imp. Dto., e Imp. Dto. e Importe. Los pequeños ajustes de v0.12.16 no alcanzaron. En esta versión se redistribuye de forma clara la tabla de escritorio (a partir de 1024 px): Código 8%, Descripción 48%, Fórmula 8%, Cantidad 5%, Precio 7%, % Dto. 5%, Imp. Dto. 7%, Importe 8%, Acción 4%. El bloque numérico ahora arranca al 64% del ancho de la tabla y ocupa 36% (en v0.12.16 empezaba al 56% y ocupaba 44%).

El campo de fórmula tiene ancho máximo de 72 px, queda junto al botón avanzado y ambos se alinean al borde derecho de su columna. Cantidad y % Dto. también se alinean hacia el importe siguiente. Para conservar importes legibles en pantallas menos anchas, la tabla de escritorio tiene ancho mínimo de 1200 px y permite scroll horizontal dentro de la grilla cuando haga falta. La vista móvil no recibe estas reglas. Si una fórmula se editó manualmente, la marca `mod.` queda encima del borde del botón sin ensanchar la fila.

No cambian lógica, cálculos, eventos de teclado, estructura de presupuesto, impresión ni compartir. El único archivo visual modificado es `assets/budget-workbench.css`.

## Versión, datos y backend

`index.html`, `sw.js`, `assets/pwa-update.js` y `data/version.json` pasan a v0.12.17 para actualizar la PWA. Subí `assets/` y `data/` completos para evitar mezclas de caché. Dentro de `data/` **sólo cambia `version.json`**: los CSV de artículos, clientes y recetas son idénticos a v0.12.16. `assets/budget-workbench.js`, Caja, Cuenta Corriente, Apps Script y Worker también permanecen idénticos. El backend figura en el ZIP para mantener el paquete completo, pero **no hay que desplegar Apps Script ni Worker**. No se cambian tokens, hojas, endpoints ni esquemas.

Después de publicar, con red usá «Forzar actualización» desde Sincronización. Si aparece el aviso, cerrá todas las ventanas de Pancko y reabrí. `localStorage` se conserva. Ver `VALIDACION.md` para pruebas y límites.
