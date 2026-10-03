> Documento histórico. Para v0.12.18 usar SEGURIDAD_ENDPOINTS_v0.12.18.md; las claves separadas ya no son la configuración vigente.

# CC · Unión explícita v0.12.4

Reemplazar Apps Script por el archivo completo `Pancko_AppsScript_v0.12.4.gs` y actualizar la implementación web existente. Mismo `SHEET_ID`, URL /exec y `PANCKO_CC_TOKEN`; sin nuevas propiedades. Worker v0.12.2 sin cambios funcionales ni de bytes, no requiere despliegue.

## Protocolo

Se reutilizan POST `/cc/get` y `/cc/apply`. La operación nueva es `kind: client_merge` con `op_id`, `from_client_id`, `to_client_id`, `before_revision` del destino, `source_revision` del origen (0 si es sólo local), nombre/documento de referencia y dispositivo. Bajo ScriptLock se comprueban revisiones, destino existente, ausencia de ciclos y referencias incompatibles. Un op_id repetido devuelve la decisión anterior. GET también usa el bloqueo para recibir un conjunto consistente.

## Almacenamiento

Sin nuevas hojas/columnas. El snapshot del cliente destino en `cc_clientes_extra` incorpora:

- `merge_sources`: IDs anteriores que ahora se refieren a esta ficha.
- `client_merges`: registro con acción client_merge, op_id, origen, destino, nombre, documento, dispositivo y fecha.
- `separate_from_ids`: excepciones aprobadas para clientes que deben mantenerse separados aunque compartan nombre/documento.

La unión central se publica con **una escritura en la fila destino**, que guarda también op_id. El evento en `cc_eventos` es auxiliar; si falla, el snapshot conserva el registro y la idempotencia. Las filas físicas de clientes/movimientos anteriores no se borran: `/cc/get` resuelve las referencias y entrega cada movimiento una sola vez con su cliente definitivo, filtrando fichas absorbidas. Editar después de una unión acepta la identidad resuelta, mantiene ID/revisión y actualiza la fila del movimiento. El origen histórico continúa disponible en los snapshots de unión.

## Frontend

`pk_cc_manual_v1` añade conflictos/decisiones de identidad, auditoría de unión e intentos pendientes. El respaldo previo local se guarda en `pk_cc_before_identity_merge_v1`; la clave no entra en el respaldo. Se conservan op_ids de movimientos al modificar únicamente su cliente en la cola. Los op_ids de altas de cliente retiradas de la cola quedan en `identity_merges.retired_client_ops`.

La unión requiere red y confirmación. Un corte entre confirmación central y aplicación local no pierde la decisión: el intento se conserva y la siguiente consulta trae la referencia aprobada. Los conflictos de movimiento con mismo ID y otros datos no se resuelven con una unión de clientes; siguen requiriendo revisión. Revisar después bloquea sólo los pendientes de esa ficha.

## Límites

La herramienta reconoce coincidencia exacta normalizada de nombre o documento, no prueba por sí sola que sean la misma persona. La decisión es del operador. Los registros de unión tienen límite defensivo de tamaño y de referencias; una ficha muy intervenida requerirá mantenimiento antes de seguir. No hay login ni permisos nuevos. No se borran documentos ni movimientos, ni se hacen asientos en Caja.
