# Validación v0.11.0

Fecha: 29/09/2026. Base local: Pancko Integral v0.10.49. No se contactó GitHub ni se modificó producción. Se usaron los CSV originales y una copia histórica de Pancko Integral DB.

## Resultado

114 comprobaciones automatizadas aprobadas:

| Grupo | Comprobaciones | Alcance |
|---|---:|---|
| Estático | 22 | Sintaxis JS inline, eventos HTML, extensión, SW, Worker y GAS; IDs; rutas; manifest; iconos; versión; igualdad byte a byte de los tres CSV; ausencia de claves de prueba |
| Frontend | 40 | Carga/ejecución en DOM simulado, navegación de 13 módulos, precios/clientes, altas con retorno, presupuesto, fórmulas, snapshots, ticket/A4/etiqueta en canvas real, importación/mezcla, backup y borrados pendientes |
| Apps Script | 19 | Servicios de Sheets/Locks/Properties simulados; validación, guardado por ID, snapshots, maestro versionado, idempotencia, conflictos, lecturas sin escritura, estructuras económicas vacías y compatibilidad con copia histórica |
| Worker y service worker | 25 | Rutas GET/POST, CORS, no-store, errores de GAS, preflight, instalación completa, limpieza acotada, navegación/recursos offline y APIs sin caché |
| Integración | 8 | Frontend → Worker → GAS → Sheets simulados; segundo dispositivo recibe datos completos; publicación/recepción de 3998 artículos; recuperación de carga interrumpida, reversión de snapshot y preservación de CC existente |

No hubo errores de ejecución en la inicialización y los flujos simulados. Se provocaron fallas de red/datos para comprobar mensajes, conservación local y reintentos; esas pruebas producen advertencias esperadas.

La copia histórica utilizada contenía 16 presupuestos en 76 filas de datos y 7 registros de color. Se comprobó que las lecturas no la alteraran y que una nueva escritura no modificara encabezados ni borrara otros presupuestos.

Datos de origen preservados: 3998 artículos, 1625 clientes en CSV y 16958 recetas. Los clientes locales previos se conservan al cargar el archivo; por eso la cantidad visible puede superar la cantidad del CSV.

## Pruebas de salida

- Ticket generado con canvas real para las tres opciones de condiciones.
- Etiqueta con fórmula editada, `/MOD` completo, factor y ancho original de 384 px. Inspección visual de la imagen generada; se corrigió el recorte del código largo.
- Imagen A4 de 25 líneas: se comprobaron todos los artículos y se inspeccionó la imagen. La imagen crece verticalmente.
- A4 HTML: verificación estructural de las tres opciones, todas las líneas, encabezado de tabla repetible, renglones sin corte interno y resumen en flujo.
- El cálculo comercial y la resolución de recetas de v0.10.49 no se reescribieron. Los cambios se concentraron en factor elegido, snapshot de fórmulas/precios y traslado/recuperación de datos.

## Límites de estas pruebas

El entorno no tenía un navegador Chrome/Chromium/Firefox instalado. Se verificó el frontend con un DOM simulado y canvas real; **eso no valida visualmente el responsive ni reemplaza una prueba de navegador real**.

No probado contra servicios publicados: ejecución/tiempos/cuotas reales de Apps Script, acceso de la implementación web, propiedades/clave configuradas, actualización del Worker y sincronización real entre teléfonos.

No probado en dispositivos/periféricos reales: instalación/actualización sobre la PWA instalada de Tincho, impresión térmica/A4 física, ventanas emergentes, Web Share y envío desde WhatsApp. Se conservan sus mecanismos existentes y se adaptaron los datos/salidas.

La verificación de offline se hizo ejecutando los eventos del service worker con Cache Storage y fetch simulados. No se certificó la instalación real ni el comportamiento de cada navegador ante la actualización. Por eso se indica cerrar todas las ventanas y conservar los datos del sitio.

Estas limitaciones no activan funcionalidades económicas: remitos/CC/recibos/cheques siguen en preparación.
