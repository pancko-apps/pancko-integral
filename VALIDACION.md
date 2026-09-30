# Validación de Pancko Gestión v0.11.1

## Alcance y métodos

Se ejecutaron 159 comprobaciones. El frontend se prueba con un DOM simulado y canvas real; la estructura responsive se inspecciona con DOM y cascada de CSS; Worker, cache, Apps Script y Sheets usan dobles de prueba. No se dispone de un renderizador de navegador real accesible para el build local.

| Grupo | Comprobaciones | Método |
|---|---:|---|
| Sintaxis, rutas y paquete estático | 22 | Node `--check`, eventos HTML, HTML/manifest y archivos locales |
| Flujos principales heredados | 40 | DOM simulado, datos CSV completos, canvas real |
| Worker existente y SW actualizado | 23 | Requests/Responses, fetch/cache simulados |
| Integración heredada | 8 | Dos dispositivos simulados → Worker → Apps Script → Sheets simulado |
| Estructura del shell y responsive | 55 | DOM y análisis de cascada de reglas estructurales CSS |
| Datos/acciones del dashboard | 11 | DOM simulado y almacenamiento local |
| **Total** | **159** | |

## Verificaciones principales

- Sintaxis de todos los scripts inline, eventos HTML, JS de gestión, service worker y backend incluido. CSS con bloques/cadenas cerrados; copias fuente del shell y gestión idénticas a lo integrado en HTML.
- IDs únicos; todas las rutas de navegación tienen pantalla; las 27 pantallas son hijas del mismo `main`. Trece módulos en la sidebar.
- `data/version.json` y tres CSV cargan en los flujos simulados: 3.998 artículos, 16.958 recetas y el catálogo de clientes (más clientes locales conservados). CSV byte a byte idénticos a la base.
- Anchos analizados: 360, 390, 768, 1023, 1024, 1280, 1440 y 1920 px. Debajo de 1024: sidebar/dashboard PC ocultos, ancho móvil original. Desde 1024: sidebar fija, header ancho, área principal descontando sidebar, sin máximo de 480 px, cuatro cards y paneles en columnas.
- Dashboard con contadores reales, sólo latas disponibles y presupuestos del día, recientes ordenados, exclusión de borrados, máximo de ocho sin descartar históricos, nombres de cliente insertados como texto seguro, indicador sin conexión y borrador conservado.
- Buscar producto por código; agregar línea sin cambiar de pantalla; cantidad/descuento; seleccionar cliente por CUIT; Consumidor final; alta rápida y cancelación sin perder presupuesto.
- Producto tintométrico desde presupuesto; factor Patrón/Especial; fórmula original/usada; precios históricos; snapshot; edición; etiqueta con `/MOD`; reimpresión sin duplicar el registro en sesión.
- A4 HTML, canvas A4 largo (25 líneas), ticket y tres opciones de condiciones de pago conservados. Se renderizaron las salidas canvas reales durante las regresiones, sin impresora física.
- Importación previa segura y sincronización heredada conservadas. Pruebas integradas de presupuesto/color y lista central con el mismo backend v0.11.0; sin agregar operaciones nuevas.
- Instalación offline simulada de nueve recursos; navegación/CSV/manifest desde cache; APIs fuera del cache; no `skipWaiting`; limpieza limitada a caches Pancko.
- Apps Script/Worker, manifest e iconos iguales a los de v0.11.0. Ningún módulo preparado escribe remitos, cuenta corriente, recibos ni cheques.
- ZIP con raíz correcta, archivos requeridos, integridad y hashes.

## Lo que no se pudo probar

**No se comprobó el aspecto final en un navegador real.** El navegador de esta ejecución rechazó abrir el archivo local por política de URLs. La terminal tampoco pudo iniciar un servidor HTTP local; descargar Chromium falló por restricciones de red. No se pidieron permisos externos ni se publicó una vista de prueba.

El análisis CSS verifica las reglas que definen el layout, no mediciones de píxeles, desbordes por métricas de fuente ni capturas reales. No equivale a probar Chrome, Android, consola de navegador o comportamiento de teclado táctil.

Tampoco se ejecutaron: registro/actualización de SW en una PWA instalada real, arranque offline real del teléfono, impresión física A4/térmica, compartir nativo/WhatsApp, llamadas al Worker/Apps Script/Sheet publicados, ni pruebas de cuotas reales de Google.

La entrega corrige el frontend y conserva las funciones anteriores. Estas limitaciones quedan documentadas para no confundir pruebas simuladas con una verificación de producción.
