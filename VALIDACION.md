# Validación — v0.11.2

**211 comprobaciones automatizadas aprobadas.** Se ejecuta el código entregado. Los dobles de DOM, red, caché y Google Sheets no sustituyen una prueba en dispositivos y servicios reales.

| Grupo | Comprobaciones |
|---|---:|
| static | 22 |
| frontend | 40 |
| integration | 8 |
| worker-sw | 23 |
| shell-layout | 60 |
| shell-data | 11 |
| catalog | 47 |

## Cobertura

- Sintaxis de todos los scripts inline, JS, Worker y GAS; eventos HTML; IDs únicos; rutas/pantallas; manifest/iconos; ausencia de claves de prueba; registro SW con versión coherente.
- Arranque sin errores en DOM simulado; carga real de CSV de artículos, clientes, recetas y version.json; búsquedas y navegación de los 13 módulos.
- Presupuesto básico; cantidades/descuento por línea; cliente por CUIT; alta rápida y consumidor final; historial y snapshots; tres opciones de condiciones de pago.
- Tintométrico desde laboratorio y presupuesto: factor patrón, fórmula original/editada, reapertura y precio guardado; etiqueta; A4 y ticket generados con canvas real.
- Shell y reglas responsive a 360/390/768/1023/1024/1280/1440/1920 px; catálogo en una o dos columnas según ancho; formulario central único dentro de Gestionar lista. Se analiza la cascada CSS, no hay motor visual Chrome.
- Importación completa frente a sólo precios; tintometría preservada o actualizada según modo; campos vacíos frente a omitidos; códigos ausentes; nombres requeridos; alias de proveedor; validaciones; CSV exportado/reimportado con saltos de línea y comillas.
- Flujo frontend → Worker → GAS → segundo dispositivo con revisiones previas; nombre, fecha de publicación/aplicación, cantidades y registro local.
- Hoja legible con filas/campos/filtro; encabezados técnicos preservados; publicación más corta conserva ausentes; historial técnico conservado; reintento idempotente no revierte el espejo.
- Clave incorrecta, conflicto de versión, ID reutilizado, fallo de metadatos antes del commit, recuperación de carga huérfana, fallo de espejo y reconstrucción, colisión con hoja ajena, falta de espacio local y rechazo de publicación nombrada ante backend anterior.
- Cliente v0.11.1 recibe el backend nuevo; publicación antigua sin nombre compatible; versión histórica sin metadatos legible sin inventar nombre; lecturas sin escrituras.
- Preservación exacta de presupuesto en curso e historial al importar/publicar/recibir; nuevas líneas usan el precio nuevo. Reinicio offline simulado conserva nombre/lista/fechas. Actualización sobre catálogo instalado de 4270 artículos no lo reemplaza por el CSV de 3998.
- Service worker simulado: instalación de 9 recursos, apertura y datos offline, limpieza sólo de cachés Pancko, exclusión de APIs y POST, espera al cierre de ventanas sin skipWaiting.
- Dashboard conserva datos y borrador; módulos económicos continúan en preparación.

## No probado en este entorno

No hay ejecutable Chromium/Chrome disponible. No se verificaron render visual ni consola de un navegador real, Android físico, instalación/actualización real de PWA, impresora, diálogo de impresión, WhatsApp/compartir nativo ni las cuotas/latencias de Apps Script productivo. Las pruebas de backend usan Sheets simulados; no se modificaron las hojas reales.

## Verificación del paquete

ZIP con index.html, sw.js, manifest, assets y data directamente en raíz; backend completo y documentación. SHA256SUMS.txt permite verificar los archivos; su propia suma no se incluye. El ensamblado comprueba coincidencia entre código inline y sus copias en assets, CSV/iconos/Worker preservados y ausencia de carpeta envolvente.
