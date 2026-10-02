# Validación — Pancko Gestión v0.12.10

Se ejecutó el JavaScript real de `index.html` y assets en Node VM con DOM simulado; se usaron los CSV completos del paquete. Ticket, A4 como imagen y etiqueta se generaron con un motor gráfico real. Cuenta Corriente se verificó con servicios de Sheets simulados, sin usar los de la pinturería.

## Resultados

- **23 controles específicos v0.12.10:** migración de un borrador Contado 30%, sugerencias `1700/`, toque de sugerencia, Enter exacto/único/múltiple, selección persistente tras filtrar, lote de 3 pinceles con IDs/cantidades/descuentos/snapshots independientes, precio antiguo intacto al variar catálogo, lote mixto TINT/DEEP/BLANCO sin modales encadenados, edición posterior desde grilla, ACCENT individual con modal. Ejemplo de $285.714 y 10%: descuento $28.571 e importe de línea $257.143. Con 30% general, subtotal $257.143, descuento general $77.143 y total $180.000; la línea sigue mostrando $257.143. Descuento tipeable 20% recalcula resumen; condición Transferencia queda independiente y aparece en A4 y ticket. Entrada 150% rechazada. Cancelar limpieza conserva borrador; confirmar reinicia artículos/cliente/términos/fórmula y conserva historial. «Usar como nuevo» y reapertura offline mantienen condición y porcentaje. Sin errores JS inesperados.
- **26 controles específicos heredados de v0.12.9:** tintométrico por base, compatibilidad, factor, fórmula original y usada, edición manual, snapshot de precios, descuentos/redondeo, historial antiguo/nuevo, A4, ticket y offline.
- **41 controles generales:** inicio y navegación, artículos/clientes/CSV, presupuesto, tintométrico de laboratorio/etiqueta, salidas de 25 líneas, copias e importación de historial, lista de precios sin sobrescrituras, pendientes de sincronización y precio snapshot.
- **Caja y CC:** búsqueda local de caja de importes positivos/negativos/cero sin escritura; Cuenta Corriente PC/celular simulados intercambian cliente, cargo, pago, edición y anulación, saldos, reintento y polling.
- **PWA:** caché versionada, precarga de JS/CSS/CSV, recarga con cache busting y estado visible, `localStorage` intacto. Sintaxis de JS, handlers inline, Apps Script, Worker, JSON, rutas, integridad CSV/backend y ZIP verificados.

## Límites observados

No hubo navegador Chromium/Firefox disponible para revisión visual de PC/móvil ni PWA instalada real. No se probó impresión física, diálogo PDF ni compartir nativo de Android/WhatsApp. No se conectó a la Sheet productiva; las pruebas de sincronización fueron simuladas. El CSS se revisó estructuralmente y con reglas responsive, sin render visual real. Tras subirlo, corresponde la revisión visual y de salidas en los dispositivos reales.
