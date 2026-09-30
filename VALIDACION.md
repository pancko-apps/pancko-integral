# Validación — v0.11.3

**302 comprobaciones automatizadas aprobadas.** Base v0.11.2, sin sustitución del código previo de negocio. Se ejecuta el código entregado; los dobles de DOM, almacenamiento y servicios no sustituyen una prueba en dispositivos reales.

| Grupo | Comprobaciones |
|---|---:|
| static | 30 |
| frontend | 41 |
| integration | 8 |
| worker-sw | 23 |
| shell-layout | 60 |
| shell-data | 11 |
| catalog | 47 |
| cash | 82 |

## Caja diaria

- Navegación/accesos, fechas estrictas, hora de Argentina, apertura única, saldo sugerido, cambio manual y campos de usuario nulos.
- Importes AR con miles/coma/negativos, rechazo de vacío/inválido/exceso de precisión, cálculo exacto en centavos, detalle obligatorio.
- Ejemplos reales, edición con ID/hora conservados, anulación confirmada/no suma, marcas y auditoría antes/después. No confirma cargas normales.
- Grupos de billetes como importes, conteo parcial/recarga, faltante/sobrante/caja OK, retiro inválido, cierre cancelado y cierre vacío explícito.
- Cierre bloquea escritura accidental; reapertura conserva snapshot; carry automático y manual, aviso de inconsistencia y conservación del saldo de cajas posteriores existentes.
- Histórico por fecha, TXT, JSON, impresión HTML y clipboard con alternativa. Escapado del detalle libre en pantalla e impresión.
- Restauración completa en otro navegador simulado, no duplicación, rechazo de conflictos/JSON dañado/cierre inconsistente/fechas duplicadas.
- Almacenamiento lleno no cambia lo guardado y conserva la entrada; cambios de otra pestaña detectados; Web Locks simulado; doble clic y cambio de fecha durante guardado demorado no duplican ni cambian día.
- Libro dañado no se sobrescribe y permite descargar el original. Caja sin peticiones de red; claves de catálogo/presupuesto/tintométrico y snapshots inalterados por sus acciones.

## Regresiones anteriores

- Sintaxis de scripts inline/fuentes/Worker/GAS y eventos HTML; IDs/rutas; copias inline idénticas; CSV/manifest/iconos y ambos archivos de backend conservados; version.json y SW coherentes.
- Carga real de archivos CSV y búsqueda; navegación de 14 módulos; presupuesto, cantidad/descuento, cliente/alta rápida/consumidor final, historial, snapshots y condiciones de impresión.
- Tintométrico desde laboratorio/presupuesto: factor patrón/original/editado, precio guardado y etiquetas. A4 largo, ticket y etiqueta generados con canvas real.
- Publicación/recepción central con código real frontend → Worker → GAS y segundo dispositivo, usando Sheets y red simulados. Maestro/sólo precios, columnas tintométricas, nombres/fechas, vista legible, idempotencia, versión/conflictos, errores y compatibilidad.
- Presupuestos no se recalculan por catálogo; equipos con 4270 artículos conservan lista instalada. Recarga offline conserva datos locales.
- CSS del shell analizado a 360/390/768/1023/1024/1280/1440/1920 px, preservando sidebar/área amplia en escritorio. Es análisis de cascada; no captura de navegador.
- SW simulado: instalación de nueve recursos, navegación y CSV offline, APIs/POST fuera de caché, limpieza sólo Pancko y actualización sin skipWaiting. Caja inline incluida dentro del index.html cacheado.

## No probado

No hay ejecutable Chromium/Chrome disponible en el entorno. No se verificaron render/consola de navegador real, Android físico, instalación o actualización real de PWA, ventanas/clipboard nativos, impresión física, WhatsApp, cuotas de almacenamiento reales ni backend/Sheets desplegados. No se modificaron servicios reales. Las pruebas de caja usan DOM/localStorage/ventanas/locks simulados; los cálculos, validaciones y funciones ejecutadas son los del paquete. Las salidas existentes usan canvas real, sin impresión física.

## Paquete

ZIP sin carpeta envolvente, con index/sw/manifest/assets/data en raíz, documentación y backend completo sin cambios. SHA256SUMS.txt incluye todos los archivos salvo su propia suma. No se incluye un Informe para Cerebrito separado: se entrega como texto al final de la charla.
