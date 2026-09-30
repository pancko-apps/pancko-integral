# Pancko Gestión v0.11.1 — corrección de UX escritorio

ZIP completo basado en la entrega v0.11.0, que conserva Pancko Integral v0.10.49 como base funcional. Esta versión corrige la estructura visual; no agrega funciones económicas ni cambia el backend.

## La distribución

- **PC, desde 1024 px:** header de lado a lado, sidebar izquierda fija, navegación vertical con los 13 módulos y área de trabajo amplia. El contenido ya no tiene un límite de 480 px.
- **Inicio de PC:** saludo y fecha, cuatro tarjetas de resumen, accesos rápidos, presupuestos recientes, borrador en curso, tintométrico y panel de módulos en preparación.
- **Datos reales:** contadores del catálogo, clientes, presupuestos del día y latas disponibles. Los presupuestos recientes se abren sin reemplazar el borrador. Sin saldos, remitos o pagos ficticios.
- **Pantallas integradas:** artículos, presupuesto, laboratorio, clientes, historial, parámetros y sincronización quedan dentro de la misma área de trabajo. Se conservan los eventos y flujos anteriores.
- **Móvil, por debajo de 1024 px:** tiles grandes y navegación simple de Pancko; sidebar y dashboard de PC ocultos. Se conservan los temas móviles. En PC el tema Pro usa superficies claras y sidebar azul; Noche, Premium, Clásico oscuro e Industrial conservan una superficie oscura.
- **En preparación:** remitos, cuenta corriente, recibos, cheques y scanner abren pantallas prolijas dentro del shell. Continúan sin operaciones económicas activas.

## Cómo subir

1. Descomprimir el ZIP. `index.html`, `sw.js`, `manifest.webmanifest`, `assets/` y `data/` ya están en su raíz. Subir el contenido, sin agregar una carpeta envolvente.
2. Reemplazar esos archivos y carpetas en la raíz del repositorio existente. Conservar otros archivos propios que no formen parte de esta entrega.
3. **No hace falta volver a pegar Apps Script ni Worker por esta corrección.** Los archivos incluidos en `backend/` son exactamente los de v0.11.0, para mantener el paquete completo. Si todavía no instalaste ese backend, las instrucciones previas están en `BACKEND_v0.11.0.md`; no es requisito para ver el nuevo shell.
4. Después de que GitHub Pages actualice los archivos, abrir Pancko con red para que se descargue la actualización. Cerrar todas sus pestañas y ventanas instaladas, en cada dispositivo, y volver a abrir. Si aún aparece v0.11.0, dejar terminar la descarga, cerrar todas las ventanas y reabrir otra vez.
5. La sidebar en PC y el subtítulo en móvil deben indicar **v0.11.1**. No borrar los datos del sitio: ahí puede haber presupuestos, clientes, colores y borradores locales.

El CSS y el JavaScript esenciales están integrados en `index.html`, para que el shell no quede sin formato si falta un archivo auxiliar. Las copias legibles de `assets/` corresponden a ese mismo código; para futuras ediciones deben mantenerse sincronizadas con el HTML. El paquete completo, incluyendo iconos, manifest y CSV, sigue siendo necesario para la instalación offline.

## Qué se conserva

CSV originales de artículos, clientes y recetas; claves locales `pk_*`; borrador en curso; historial; fórmulas y snapshots tintométricos; factores y precios por pulso; etiquetas; A4, ticket y WhatsApp; importación y sincronización existentes. Los presupuestos siguen siendo propuestas sin impacto económico.

No hay hojas nuevas, endpoints nuevos, escrituras económicas ni cambios de Apps Script/Worker respecto de v0.11.0. No se interactuó con GitHub ni se publicó desde esta misión.

## Validación y límites

Se aprobaron **159 comprobaciones automatizadas**, incluyendo sintaxis, estructura, rutas, carga de CSV, navegación, presupuesto, cliente, tintométrico, etiqueta, salidas de impresión, preservación del borrador, datos del dashboard, service worker/offline simulado e integración con dobles de backend.

**No se pudo verificar el render visual en Chrome/Android real en este entorno.** El navegador disponible bloqueó abrir archivos locales; tampoco fue posible iniciar un servidor local ni descargar Chromium con los permisos disponibles. La validación responsive analiza DOM y cascada de reglas CSS a ocho anchos, y no sustituye una captura real de navegador. Tampoco se probaron impresión física, compartir nativo/WhatsApp ni actualización de una PWA instalada real.

Detalle de pruebas en `VALIDACION.md` y `VALIDACION_RESUMEN.json`. Cambios y archivos en `CHANGELOG.md`.
