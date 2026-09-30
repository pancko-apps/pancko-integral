# Pancko Gestión v0.11.1

## Alcance

Corrección del shell escritorio solicitada a partir de las capturas de Pancko y D9.Gestión. Se detuvo la expansión funcional. Base: entrega v0.11.0 sobre Pancko Integral v0.10.49.

## Cambios

- Header ancho y sidebar fija debajo del header, con navegación vertical, módulo activo y desplazamiento propio en pantallas bajas.
- Área principal que ocupa el ancho restante. Todos los módulos, incluidos los preparados, están dentro de `main`.
- Dashboard exclusivo de PC: saludo/fecha, cuatro resúmenes reales, accesos rápidos, ocho presupuestos recientes, presupuesto en curso y paneles de preparación/tintométrico. La lista reciente no recorta el historial.
- Ver un presupuesto reciente no vacía ni reemplaza las líneas del borrador actual. Las acciones de crear/continuar abren el presupuesto vigente; no lo reinician.
- Artículos/clientes en columnas, encabezados con sus acciones, presupuesto con controles agrupados y total visible, laboratorio en dos columnas desde 1280 px.
- Superficies claras para el escritorio Pro, con azul y naranja de Pancko. Se mantienen opciones oscuras y temas móviles.
- Móvil por debajo de 1024 px conserva los tiles grandes, navegación y pantallas previas. Los módulos económicos se identifican como preparados.
- Pantallas en preparación con textos de uso, sin alert improvisado ni datos económicos ficticios.
- CSS/JS esenciales integrados en HTML y copias legibles en assets. No hay dependencia de un stylesheet externo para que se forme el sidebar.
- Cache y versión del frontend actualizados a v0.11.1. El service worker cachea el HTML completo, manifest, iconos y datos; continúa sin cachear la API.

## Archivos modificados

`index.html`, `sw.js`, `data/version.json`, `assets/gestion.css`, `assets/gestion.js`, `README.md`, `CHANGELOG.md`, `VALIDACION.md`, `VALIDACION_RESUMEN.json`, `SHA256SUMS.txt`.

Nuevos: `assets/desktop-shell.css`, `assets/desktop-shell.js`, `BACKEND_v0.11.0.md`, `VALIDACION_LAYOUT.json`.

Sin cambios byte a byte: los tres CSV, manifest, iconos, Apps Script y Worker. El cambio en `assets/gestion.js` sólo actualiza los textos visibles de versión; la lógica heredada se conserva.

## Backend

Sin cambios de código, hojas ni endpoints respecto de v0.11.0. El backend mantiene su versión v0.11.0. Los archivos completos se incluyen por continuidad; esta corrección no requiere reemplazarlos manualmente.

## Pruebas

159 comprobaciones aprobadas. Incluyen regresiones funcionales de presupuesto/tintométrico, dashboard, análisis de reglas responsive en 360/390/768/1023/1024/1280/1440/1920 px, rutas, CSV y offline/integración simulados. Sintaxis JS y eventos HTML válidos; ZIP completo con rutas y hashes verificados.

No se hizo una prueba visual en navegador real ni una prueba de impresión física o PWA instalada real. El entorno bloqueó los mecanismos disponibles para abrir el build local. Ver `VALIDACION.md`.

## Caché

Abrir con red para descargar la versión, cerrar todas las ventanas de Pancko y reabrir. No borrar almacenamiento local. La activación no se fuerza sobre ventanas viejas, para evitar mezclar versiones.

## Próxima misión

Confirmar visualmente este shell en los dispositivos de mostrador y ajustar distribución si hace falta. La expansión de remitos/cuenta corriente/cobros/cheques queda detenida hasta consolidar la UX principal.
