# Validación v0.12.11

## Resultados

- 26 verificaciones de pulido: sugerencias reales 1700/, clic, Enter exacto/único/múltiple, casillas/lote, líneas independientes y snapshots, reglas tintométricas, línea sin descuento general, resumen neto, porcentaje editable con input estable, condición que sugiere 30% y admite cambio manual a 25%, resumen sin Importe de lista, términos comerciales, ticket, porcentaje inválido, limpieza completa, historial/copia, offline y ausencia de errores inesperados.
- 26 verificaciones de Presupuestos: búsqueda, selecciones, descuentos/cantidades, fórmulas y compatibilidad, historial, copias, A4/ticket/compartir y offline.
- 41 verificaciones generales: datos CSV, navegación, clientes, presupuesto, salidas con canvas real, tintométrico y persistencia/respaldo.
- Regresión Caja: buscador de ingresos/egresos/importe cero, fecha/dispositivo/anulados, apertura y ausencia de escrituras.
- Cuenta Corriente con backend simulado: PC crea cliente/cargo; celular recibe, paga; PC recibe. Edición/anulación, saldos y reintento sin duplicados.
- PWA: recarga con URL fresca, estados, actualización, skipWaiting/claim, conservación de localStorage, fallback de cierre y reapertura.
- Service worker: precache/rutas, versión desde red, limpieza selectiva de cache.
- Sintaxis: 11 archivos externos/backend, 9 scripts inline y 204 handlers. Rutas relativas, IDs únicos, JSON, delimitadores CSS y precache.
- Comparación contra v0.12.10: CSV y backend idénticos; inline de Caja/CC/laboratorio/salidas intactos salvo versión frontend.
- ZIP: raíz correcta, 32 archivos, integridad CRC y SHA256 verificados.

## Ejemplo de cálculo

Precio 285714, descuento de línea 10%: descuento 28571, importe de línea/subtotal 257143. Descuento general 30%: descuento 77143, total 180000. La línea sigue mostrando 257143. Se conserva redondeo de funciones existentes, sin cambio contable.

## Límites

Pruebas en DOM/backend simulados con código real y canvas real. Sin navegador físico para revisión visual a distintos anchos; responsive inspeccionado en CSS. No se probó PWA instalada física, impresión física, envío real por WhatsApp ni la Sheet productiva. Los tests no equivalen a una prueba de producción. No se cambiaron los módulos ajenos ni backend.
