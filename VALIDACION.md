# Validación v0.12.12

## Verificaciones ejecutadas

- 19 pruebas nuevas sobre presupuestos: no tintable sin fórmula; PASTEL con input/modal; select-all; 8299 con nombre Ice Age y snapshot completo; ausencia de modal en Enter; rechazo de código inexistente/incompatible/ambiguo sin mutar línea; botón avanzado y pulsos manuales marcados mod.; reingreso del mismo código conserva edición manual; reemplazo con confirmación; cantidad/descuento y total; importe inválido no persiste NaN; historial/A4; restauración offline; dos códigos consecutivos en líneas independientes; navegación a la siguiente fórmula; consola sin errores.
- 26 verificaciones de Presupuestos de v0.12.11: artículos, bases PASTEL/BLANCO y TINT/DEEP/ACCENT, tintas manuales, snapshot/cambio de lista, historial, impresión/compartir y offline.
- 26 verificaciones del pulido v0.12.11: sugerencias, lote, descuentos, condición comercial, ticket, limpiar borrador y copia del historial.
- 41 verificaciones generales: CSV, clientes, navegación, A4/ticket/WhatsApp simulado, laboratorio, persistencia y datos locales.
- Regresión Caja: búsqueda por ingreso/egreso/importe cero, apertura, fecha/dispositivo/anulados, sólo lectura.
- Regresión Cuenta Corriente con backend simulado: PC/celular, cliente, cargo, pago, edición, anulación y reintentos.
- PWA y service worker: versión, cache, precarga de recetas, refresco, claim/skipWaiting, localStorage intacto.
- Sintaxis de archivos JS, Apps Script y scripts inline/handlers; rutas/manifest/version.json; CSV y backend idénticos a v0.12.11; hash y CRC del ZIP.

## Límites

El DOM y backend de pruebas son simulados; no se revisó visualmente en navegador físico, ni se imprimió/envió a WhatsApp real o consultó la Sheet productiva. La prueba offline verifica conservación y lectura de una fórmula ya aplicada en el borrador. El CSV de recetas está en el precache del service worker, pero el simulador offline de JS no reproduce Cache Storage de un dispositivo instalado: por eso no se afirma una prueba física de ingreso de fórmulas nuevas sin red.
