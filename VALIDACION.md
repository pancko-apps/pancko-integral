# Validación v0.12.18

Pruebas automatizadas ejecutadas sobre código completo con DOM simulado, Cloudflare Request/Response y SpreadsheetApp/locks simulados. No se accedió a datos ni endpoints de producción.

- Seguridad: 66 comprobaciones. Rutas privadas Worker sin clave/inválida rechazan antes de reenviar; GAS directo y alias GET rechazan sin lectura/escritura. Clave válida, presupuesto guardar/borrar, colores guardar/listar, snapshots sin credenciales, compat, claves limitadas por módulo, expiración, strict, CORS/preflight, /test 404 y autenticación doble.
- Operativa: 8 comprobaciones. Dispositivo nuevo con una sola clave, conexión ambos backends, header común, guardar presupuesto, sincronizar todo sin publicar lista, fallo de un módulo no detiene otros, pendientes conservados sin clave, persistencia de negocio sin claves.
- Catálogo: publicación de 3998 productos, preview sin credenciales, recepción explícita/aplicación con nombre de lista. Puente de despliegue GAS anterior probado; strict no reintenta claves antiguas.
- Frontend: 41 comprobaciones de carga completa (3998 artículos, 16958 recetas, clientes), navegación, presupuesto, tintométrico/etiqueta, snapshots, salidas, backups y borrado pendiente.
- Presupuestos: 26 comprobaciones de carga, descuentos, fórmula, snapshot histórico, reapertura offline, A4/ticket/compartir alternativo. Carga rápida: 21 comprobaciones de bases, autocomplete/Enter/select-all y persistencia.
- Cuenta Corriente: PC/celular simulados con clientes, cargo, pago, edición, anulación, saldo y reintento sin duplicar.
- Caja: combinación PC/celular (5 casos); búsqueda local con positivos, egresos, importe cero, estados, apertura de fecha y recepción local.
- PWA: registro/SW simulado, precache completo, limpieza selectiva, activación y recarga cache-busting con fallback visible; localStorage intacto.
- Sintaxis: 10 scripts inline, todos los JS, Worker completo y Apps Script completo pasan node --check. Rutas precache existen. ZIP sin carpeta contenedora, sin claves reales y con CSV idénticos a v0.12.17.

No probado: despliegue real Cloudflare/GAS, PC/celular físicos, impresión/PDF físico, WhatsApp nativo ni navegador real/inspección visual de la nueva pantalla. La matriz usa simulaciones; no equivale a confirmar instalación en producción. Ejecutar la guía PC/celular después del despliegue. Esta entrega modifica sólo transporte/configuración; no rehace lógica económica ni presupuesto.
