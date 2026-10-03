> Documento histórico. Para v0.12.18 usar SEGURIDAD_ENDPOINTS_v0.12.18.md; las claves separadas ya no son la configuración vigente.

# Cuenta corriente central · contrato v0.12.2

## Instalación

El proyecto de Apps Script y la Sheet existentes se conservan. Reemplazar el código completo por `backend/Pancko_AppsScript_v0.12.2.gs`, agregar propiedad de script `PANCKO_CC_TOKEN` (16 caracteres o más), actualizar la implementación web y luego desplegar `backend/Pancko_Worker_v0.12.2.mjs` en Cloudflare. `GAS_URL` mantiene la URL comunicada en octubre de 2026. No poner la clave en el repositorio. El Worker devuelve JSON y conserva las rutas anteriores.

| Ruta Worker | Acción Apps Script | Uso |
|---|---|---|
| POST `/cc/get` | `cc_get` | Cuerpo `{token}`; devuelve `clients`, `movements`, `server_time`. Lectura sin crear hojas. |
| POST `/cc/apply` | `cc_apply` | Cuerpo `{token, op_id, kind, id, before_revision, after, device}`. `kind`: `client_create`, `client_update`, `movement_create`, `movement_edit`, `movement_void`. |

`/cc/apply` opera con ScriptLock. Una revisión no coincidente responde `{ok:false,conflict:true,central,...}`. `op_id` se guarda junto a la entidad y un reintento devuelve el mismo resultado sin otra escritura. El evento auxiliar no determina el saldo ni la idempotencia.

## Hojas nuevas

| Hoja | Contenido | Creación |
|---|---|---|
| `cc_clientes_extra` | `id`, nombre, documento, revisión, fecha de actualización, `snapshot_json`, `op_ids_json`. Incluye clientes usados por CC, sean CSV o altas nuevas. | Primera creación válida de cliente. |
| `cc_movimientos` | Una fila por ID: cliente e identificación de nombre al crear, fecha, tipo, importe en centavos, estado, revisión, fecha, `snapshot_json`, `op_ids_json`. | Primer movimiento válido. |
| `cc_eventos` | ID de operación, entidad, ID, revisión, acción, dispositivo y fecha del servidor. Auditoría auxiliar. | Primera escritura; si falla, la entidad y su `op_id` siguen vigentes. |

Si la hoja existe, se revisan encabezados; no se reordenan ni se borran columnas. Un encabezado faltante bloquea escrituras. La lectura no crea hojas. Los snapshots guardan los campos completos de v0.12.1, incluida edición/anulación; no hay fórmula de saldo en Sheet. El saldo se calcula en la app a partir de movimientos activos. No se modifican `presupuestos`, `registros_colores`, `caja_diaria` ni sus eventos.

## Colisiones y migración

- Movimiento nuevo: ID estable `cc_...`; otro ID se suma. Mismo ID y otros datos da conflicto. Un `op_id` repetido es idempotente.
- Edición/anulación: exige la revisión vista al comenzar. La nueva revisión se devuelve al dispositivo. Un registro anulado no se edita.
- Cliente nuevo: se guarda con ID local estable. La recepción empareja un cliente CSV del otro dispositivo por CUIT o nombre normalizado sólo si no tiene movimientos locales; con movimientos, frena la unión para revisión manual. Backend también rechaza nombres/documentos exactos duplicados con IDs distintos.
- Los movimientos previos en `pk_cc_manual_v1` sin revisión se encolan con su ID original al pulsar Sincronizar CC. El libro y la cola se guardan juntos. Primero se envía el cliente, luego sus movimientos. Respaldar cada equipo antes de migrar.
- Conflicto del mismo ID: la operación local queda pendiente y no se sobrescribe. Hay botón explícito para exportar respaldo y escoger la versión central de ese registro. Un conflicto entre IDs de clientes distintos requiere revisión de respaldos y conciliación manual antes de continuar; no se resuelve por nombre automáticamente cuando ambos tienen movimientos.
- Si la clave falta o el backend falla, la escritura local sigue disponible. El token se guarda sólo en el dispositivo (`pk_cc_token_v1`), fuera de `pk_cc_manual_v1` y de los respaldos JSON.

## Límites actuales

No hay usuarios ni roles: el token es compartido. La consulta `/cc/get` descarga el libro completo; si crece mucho, una siguiente versión debe paginar. `op_ids_json` tiene límite defensivo por entidad para impedir superar el tamaño de celda de Sheet. Cambiar manualmente filas/snapshots en Sheet puede generar inconsistencias y bloquea la lectura. La eliminación definitiva de movimientos de CC no está implementada. Pagos de CC no escriben en Caja y presupuestos no generan deuda.
