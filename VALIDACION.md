# Validación — Pancko Gestión v0.12.9

## Método y alcance

JavaScript real de `index.html` y assets ejecutado en Node VM con DOM simulado. Datos CSV completos del paquete. Canvas de ticket/A4/etiqueta generado con motor gráfico real. Apps Script ejecutado con servicios de Google Sheets simulados para la regresión de Cuenta Corriente. Ninguna operación se envió a producción.

## Resultados aprobados

### Presupuestos: 26 controles específicos

- Código exacto; texto único; varias coincidencias; ausencia de coincidencias; metadatos y filtros opcionales.
- PASTEL y BLANCO sin apertura automática, apertura posterior desde Fórmula.
- TINT, DEEP y ACCENT con apertura automática.
- Rechazo de fórmula PASTEL en ACCENT y de factor inválido.
- Respeto de la base explícita en productos con varias bases compatibles.
- Fórmula editada queda sólo en la línea; recetas y catálogo no se modifican.
- Precios/factor y fórmula original permanecen aunque cambien precios maestros; pulsos negativos se rechazan; restauración usa la original guardada.
- Mismo código a 1.000 y 2.000 conserva dos líneas separadas.
- Ejemplo comprobado: 3 × 1.000 con descuento de línea 10%, más 1 × 2.000; subtotal 4.700; descuento general 30% = 1.410; total 3.290. Importe final de primera línea = 1.890.
- Grilla en el orden pedido y controles conectados a funciones existentes.
- Guardado/historial/copia como nuevo conserva snapshots y descuento. Entrada histórica intacta. Presupuesto viejo sin campos nuevos abre y calcula.
- Salida A4/HTML, ticket al compartir con descarga alternativa; reapertura sin red restaura catálogo y borrador y permite seguir agregando productos.
- Sin errores JS inesperados. Las advertencias de red en la prueba offline son las esperadas.

### Regresión general: 41 controles

Carga de 3.998 artículos, 16.958 recetas y catálogo de clientes; navegación de módulos; búsqueda; cliente por CUIT/ID; alta rápida y retorno; consumidor final; descuentos; historial/snapshot; opciones de condiciones de impresión; A4 de 25 líneas; ticket; laboratorio modo patrón y edición; etiqueta; factor y precio por pulso históricos; CSV inválido/duplicados; mezcla por COD sin perder columnas tinto; vista previa del maestro; historial local frente a respuestas centrales vacías; importación JSON; reintento de borrado pendiente.

### Cuenta Corriente, Caja y PWA

- Dos dispositivos simulados intercambian cliente/cargo/pago; verifican saldos iguales, edición, anulación, operación offline/reintento, datos locales anteriores y polling sin duplicar ni interrumpir formularios.
- Caja: búsqueda de ingreso/egreso, notas de importe cero, texto parcial con/sin tilde, fecha/importe/dispositivo/anulado, apertura de jornada sin escritura y lectura de movimientos centrales ya recibidos localmente.
- PWA: actualización con cache busting, activación/claim, aviso de éxito o cerrar/reabrir, eliminación de cachés sólo de Pancko y datos locales intactos. La lista de precache incluye ambos assets nuevos.

### Integridad del paquete

Sintaxis de scripts inline, JS externos, service worker, Worker y Apps Script; rutas locales y entradas de manifest/service worker; JSON; balance de delimitadores CSS y reglas responsive (sin renderizado); comparación de backend y CSV contra v0.12.8; ZIP sin carpeta envolvente, CRC y sumas SHA-256.

## Pendiente de validación real (no simulado como aprobado)

No hubo navegador Chromium/Firefox disponible y no fue posible descargarlo. Por tanto no se verificaron renderizado visual real ni interacción táctil: PC/móvil requieren revisión visual. Tampoco se imprimió en una impresora, se guardó PDF desde diálogo de impresión, se abrió el compartir nativo de WhatsApp, ni se consultó la Sheet real. El service worker fue probado con eventos/cachés simulados, no como PWA instalada.

Después de publicar el paquete completo, control sugerido: abrir Presupuestos en PC y móvil; agregar producto común y PASTEL con Enter; probar DEEP; editar su fórmula; guardar; copiar desde historial; abrir A4/ticket y confirmar versión v0.12.9. La publicación corresponde al usuario; este trabajo no interactuó con GitHub.
