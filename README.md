# Pancko Gestión v0.12.15 — Presupuestos de escritorio

Esta entrega es el sitio completo para subir a la **raíz** del repositorio de GitHub Pages. Conservá las carpetas `assets/` y `data/` enteras. Reemplazá los archivos existentes por los del ZIP; no subas la carpeta contenedora como subdirectorio. No se publicó ni se interactuó con GitHub.

## Cambios

- La cabecera de Presupuestos deja sólo referencia, fecha y aviso breve de propuesta. Ya no repite «Tipo de comprobante: Presupuesto».
- Cliente, alta rápida y condición comercial pasan a un bloque compacto debajo de las líneas y a la izquierda del resumen; mantienen los mismos campos, IDs y eventos.
- Las columnas numéricas permanecen en el mismo orden y se agrupan más a la derecha. Descripción gana espacio; Fórmula usa menos ancho.
- La fórmula muestra código y botón avanzado en una sola línea. El nombre del color se conserva en el presupuesto y en el tooltip del campo, sin ocupar otra línea visible. `mod.` identifica las tintas cambiadas a mano. Los errores de validación siguen apareciendo si ocurren.
- La grilla de escritorio tiene menos alto por fila. La vista de móvil sigue usando tarjetas y conserva todos los controles.
- Versión, caché de PWA y `data/version.json` avanzan a v0.12.15.

## Archivos y datos

Frontend modificado: `index.html`, `assets/budget-workbench.js`, `assets/budget-workbench.css`, `assets/pwa-update.js`, `sw.js`, `data/version.json`. Este README, `CHANGELOG.md`, `VALIDACION.md` y `SHA256SUMS.txt` documentan la entrega. Subí **assets completo** para no mezclar versiones.

Los CSV de artículos, clientes y recetas son los de v0.12.14. Los archivos completos de Apps Script y Worker se incluyen por integridad del paquete, pero **no se modificaron y no hay que desplegarlos**. No cambian tokens, hojas, endpoints, estructura de presupuestos ni almacenamiento local.

## Actualización

1. Descomprimí el ZIP y subí **el contenido interior** a la raíz del repo, con `index.html`, `sw.js`, `assets/` y `data/` al mismo nivel.
2. Una vez publicado GitHub Pages, con red abrí Sincronización y usá «Forzar actualización». Si aparece el aviso de cerrar ventanas, cerrá todas las ventanas de Pancko y reabrí. Comprobá que figure v0.12.15.
3. Conservá `localStorage`; la actualización de caché no requiere borrar datos de la app.

## Alcance de validación

Se controlan sintaxis, rutas, CSV/versionado, estructura del ZIP, carga de líneas y fórmulas, cálculos, impresión/compartir, guardado y reapertura, Caja, Cuenta Corriente y PWA con pruebas automatizadas. Se revisa la captura compartida y la estructura responsive. Ver `VALIDACION.md` para resultados y límites. El zoom visual real de 100% y 110% debe comprobarse en el navegador de Tincho después de subir; en este entorno no hay navegador gráfico instalado.
