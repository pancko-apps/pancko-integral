# Pancko Gestión Cañada v0.12.30 · Caja diaria

**Destino:** frontend estable `pancko-integral`, publicación manual. Este paquete no se publicó ni cambió Worker, Apps Script o Sheet. No hay migración de datos locales ni borrado de pendientes.

## Antes de actualizar

En la **PC de la pintu donde se cargaron los movimientos faltantes**, abrir la versión actual: Caja diaria → fecha de hoy → **Respaldo de todas las cajas → Descargar respaldo JSON**. Guardar ese archivo aparte. Comprobar si las anotaciones de la mañana aparecen en esa PC. No borrar datos del sitio ni desinstalar la PWA antes de este respaldo. Si faltan incluso allí, recuperar a partir del último respaldo disponible; la versión nueva no puede reconstruir datos que ya no están en ese dispositivo.

## Qué cambió

- Panel **Diagnóstico de sincronización** con fecha exacta `YYYY-MM-DD`, dispositivo, versiones Worker/Apps Script, estado de conexión y clave (sólo sí/no), conteos, estados por movimiento, cola y log local de los últimos 100 eventos. Se copia sin mostrar la clave.
- **Exportar caja local del día JSON** incluye jornada, movimientos, pendientes, conteo, cierre, fecha, device ID y hora. **Copiar resumen local** permite un rescate legible.
- Botones explícitos para sincronizar, recibir central, reintentar pendientes, ver cola y forzar consulta de la jornada. La recepción mantiene los pendientes; si no puede conciliar una apertura o cierre, señala conflicto y no reemplaza datos.
- `/cash/apply` sólo quita una operación de cola tras comprobar su ID en `applied_ops`, o un alta duplicada idéntica que el servidor ya confirmó por ID de movimiento. Un error/timeout conserva el pendiente.
- `/cash/get` compara movimientos y estado aunque la revisión sea igual. Antes de sustituir una jornada divergente guarda copia local; si hay un movimiento local que no existe en central y no tiene pendiente, se detiene para que se exporte y revise.
- Mientras Caja está visible, vuelve a consultar cada minuto y al recuperar el foco. Las respuestas con fecha incompatible se rechazan. El formulario nuevo y el conteo en edición siguen protegidos.

**Clave local de diagnóstico:** `pk_cash_sync_diag_v1`. Las jornadas y pendientes continúan en `pk_cash_daily_v1`; no se cambió su formato. El respaldo automático antes de reemplazo usa `pk_cash_before_remote_<timestamp>`.

## Publicación

Copiar el contenido completo de este ZIP a la raíz de `pancko-integral` (donde está `index.html`). Revisar el diff y publicar sólo después de conservar el respaldo de la PC pintu. En cada dispositivo, abrir Sincronización → Forzar actualización, cerrar todas las ventanas y reabrir. Verificar `v0.12.30` y cache `pancko-gestion-v0.12.30` antes de diagnosticar. No borrar datos locales ni limpiar almacenamiento del sitio.

## Prueba con tres dispositivos

1. En cada dispositivo: Caja → hoy → Diagnóstico. Anotar fecha, device ID, versión, token sí/no, pendientes y revisión central. Si hay datos faltantes, **exportar JSON en los tres** antes de intentar reparar.
2. PC pintu: anotar `TEST SYNC PINTU A` por $111. Sincronizar. Comprobar `CONFIRMADO_CENTRAL`, cero pendientes y log de ACK con revisión. Si queda pendiente o error, copiar diagnóstico y detener la prueba.
3. Celular y PC depto: Actualizar desde central; comprobar el mismo ID y monto de `TEST SYNC PINTU A`.
4. Celular: anotar `TEST SYNC CELU B` por $222 y sincronizar. PC pintu y PC depto: Actualizar desde central; comprobar una sola aparición en ambos.
5. Anular **los movimientos de prueba** en Caja (quedan visibles y auditados) y sincronizar desde su dispositivo creador. Confirmar que el estado anulado llega a los otros. No eliminarlos silenciosamente.
6. Repetir con red cortada: crear un movimiento sólo de prueba, verificar pendiente en JSON; reconectar y reintentar, comprobar confirmación y ausencia de duplicados.

**La prueba multidispositivo real queda pendiente de ejecución en las tres máquinas de Tincho.** Las pruebas automatizadas cubren sincronización y borrador, recepción con pendientes, revisión igual pero contenido viejo, ACK incompleto y bloqueo ante movimiento local huérfano. No se hizo ninguna carga real en la Sheet.

## Diagnóstico del incidente

El código anterior no consultaba de nuevo mientras Caja seguía abierta y omitía la recepción cuando `revision` era igual, aunque el libro local no tuviera todos los movimientos. También quitaba de la cola después de un `ok` sin verificar `applied_ops` y no tenía log de pasos/errores. Son fallas verificadas en el código; **no se puede afirmar cuál causó específicamente los movimientos de esta mañana** sin el respaldo/diagnóstico de PC pintu y el estado central. Si permanecen sólo locales, la nueva versión intentará subirlos; ante conflicto no los descartará.

Archivos cambiados: `index.html`, `assets/caja-diagnostics.js` (nuevo), `sw.js`, `data/version.json`, pruebas de Caja, `README.md`, `CHANGELOG.md` y este documento. `backend/`, `data/recetas.csv` y demás módulos no cambiaron.
