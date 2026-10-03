> Documento histórico. Para v0.12.18 usar SEGURIDAD_ENDPOINTS_v0.12.18.md; las claves separadas ya no son la configuración vigente.

# Cuenta corriente v0.12.6 · Imputación manual de pagos

Reemplazar Apps Script por `Pancko_AppsScript_v0.12.6.gs`, conservar `SHEET_ID`/propiedades y actualizar la implementación existente sin cambiar `/exec`. Worker v0.12.2 idéntico, no redeplegar. No hay hojas, columnas, endpoints ni tokens nuevos.

Se reutilizan `/cc/get` y `/cc/apply`; `/cc/get` informa `capabilities.payment_allocation=true`. Un pago con selección guarda `applications` en `cc_movimientos.snapshot_json`: `{charge_id, client_id, amount_cents, before_cents, after_cents}`. La suma de aplicaciones no excede el importe del pago. El excedente queda general sin imputar. Los cargos se consultan con saldo calculado por suma de pagos activos. Anular un pago lo excluye de esa suma; no se reescriben cargos.

Bajo ScriptLock, `/cc/apply` valida referencias, cliente, cargo activo, saldo central actual y snapshots antes/después. Dos pagos sobre el mismo saldo no pueden confirmarse silenciosamente. Un cargo con pagos aplicados no puede reducirse por debajo de ellos ni anularse. Conflictos dejan operación local pendiente para actualización y revisión. `op_id` y revisión del movimiento siguen dando idempotencia. La unión de clientes resuelve IDs en pagos/aplicaciones sin cambiar IDs de cargos.

Limitaciones: pagos generales anteriores no asignan cargos automáticamente y pueden hacer que el saldo global difiera de la suma de pendientes individuales. Un pago que supere lo seleccionado deja su sobrante general. Una operación offline basada en saldo viejo puede requerir editar la imputación después de volver a central. No hay conexión con Caja ni recibos.
