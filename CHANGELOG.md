# v0.11.0 — 29/09/2026

Base: Pancko Integral v0.10.49. Nombre visible nuevo: Pancko Gestión.

- Escritorio con menú lateral y distribución amplia; móvil mantiene acceso rápido.
- Presupuestos con cliente persistente, alta rápida con retorno, búsqueda por CUIT/teléfono y agregado directo de productos.
- Condiciones de pago por presupuesto en A4, ticket y formatos compartidos.
- Factor Patrón/Especial y snapshots tintométricos coherentes. Reabrir/editar conserva precios por pulso guardados.
- Etiquetas sin duplicar registro por reimpresión; acción explícita para otra preparación igual. Código modificado visible y ajustado al ancho de etiqueta.
- A4 HTML con flujo multipágina e imagen larga sin el corte de 18 líneas; condiciones legibles sin repetir porcentajes en etiquetas que ya los incluyen.
- Importación con vista previa, validación completa y mezcla por COD; conserva tintométrico, ausentes y presupuesto en curso.
- Backend completo v0.11.0: precios centrales versionados, clave de publicación, control de versión/idempotencia, LockService, snapshots separados y lecturas sin escrituras.
- Remitos, CC, cobros, cheques y scanner en preparación. No se registra economía ni se genera deuda.
- Historial/pendientes sin recortes automáticos, reintentos de red y borrado de presupuesto pendiente.
- Shell PWA v0.11.0, recursos relativos, manifest estático, APIs sin caché y actualización esperando cierre de ventanas.

Reemplazar todos los archivos del frontend, no sólo index.html. Para centralización y snapshots entre dispositivos, actualizar manualmente Apps Script y Worker. Instrucciones completas en README.md.

Pruebas: sintaxis, rutas, CSV, navegación y flujos con DOM simulado, render real de canvas, backend sobre copia histórica y servicios simulados, integración entre dos dispositivos simulados y eventos de service worker con Cache Storage simulado. Detalle en VALIDACION.md.

No probado: navegador real PC/Android, responsive visual en Chrome, instalación real sobre una PWA existente, tiempos/límites reales de Apps Script, impresión física y Web Share/WhatsApp real. No se tocó ni se publicó el backend/app actuales.
