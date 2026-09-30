# CHANGELOG — Pancko Gestión v0.11.3

Fecha: 30/09/2026. Base real: v0.11.2. App, shell y caché v0.11.3. Apps Script v0.11.2 y Worker v0.11.0 sin cambios.

## Implementado

- Caja diaria independiente de productos, presupuestos y circuitos oficiales. Accesos en sidebar, dashboard y tiles móviles; layout de dos columnas en PC y una en móvil, temas existentes.
- Una jornada por fecha; apertura desde último cierre anterior con ajuste manual y registro de origen. Saldo teórico visible, ingresos/egresos libres y enteros en centavos.
- Carga rápida con Enter, edición conservando hora, anulación confirmada y registro de cambios antes/después.
- Conteo parcial por importes de grupos, comparación de efectivo, retiro y saldo para mañana automático o declarado con advertencia.
- Cierre confirmado/bloqueado; reapertura confirmada conservando cierre y snapshot anterior. No propaga correcciones retroactivas a cajas ya creadas.
- Consulta por fecha, listado de jornadas, impresión A4/TXT/copia de caja actual o histórica; JSON de todo el libro y restauración sin reemplazar fechas diferentes.
- Protección ante datos dañados, falta de espacio, doble clic y revisión distinta en otra pestaña; Web Locks cuando está disponible.
- Campos de usuario futuros nulos; sin login.

## Hallazgo en la orden

El ejemplo de grupos 150.000 + 95.500 + 3.800 + 760 suma **250.060**, aunque el texto de la orden indica 249.060. La app suma lo ingresado, no fuerza el número escrito en el ejemplo. Para el caso contado 249.060 / retiro 200.000 se verificó el saldo 49.060 ajustando el segundo grupo a 94.500.

## Archivos

Nuevos: assets/caja.js y assets/caja.css; referencia LISTA_PRECIOS_v0.11.2.md.
Modificados: index.html (pantalla, accesos y código inline), sw.js, data/version.json, README.md, CHANGELOG.md, VALIDACION.md, resúmenes de validación y SHA256SUMS.txt. En assets/gestion.js/css y assets/desktop-shell.js/css sólo se actualizan textos de versión de la app; la instrucción de compatibilidad sigue pidiendo Apps Script v0.11.2.
Sin cambios de contenido: data/articulos.csv, data/clientes.csv, data/recetas.csv, manifest, iconos, backend completo y BACKEND_v0.11.2.md.

## Backend y pendientes

**No hay hojas, endpoints ni funciones Apps Script/Worker nuevas. No es necesario actualizar backend.** Las cajas no se sincronizan con Sheet. No se agregan remitos, CC, cheques, cobros oficiales, usuarios/login, productos o estadísticas comerciales.

Próxima etapa sugerida: validar uso diario en mostrador y salida real de impresión. Después definir respaldo/sincronización y usuarios si se desea, antes de integrar cobros oficiales.

## Pruebas e instalación

Resultados y límites en VALIDACION.md. Instalación: contenido del ZIP en raíz del repo; cerrar todas las ventanas Pancko para activar la PWA nueva y reabrir. No borrar los datos del sitio. No se publica ni se modifica GitHub, Worker, Apps Script o Sheet desde esta entrega.
