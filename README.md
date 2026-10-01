# Pancko Gestión v0.11.8 — Caja diaria más clara

Entrega completa basada en v0.11.6. Caja diaria conserva el libro offline `pk_cash_daily_v1` y agrega sincronización con Google Sheets mediante Apps Script y Worker. Presupuesto, artículos, lista de precios, tintométrico y el resto de la app conservan su lógica.


## Actualizar desde v0.11.7 instalada

Esta v0.11.8 mejora **sólo la presentación de Caja diaria**. Si la Caja compartida v0.11.7 ya funciona en PC y celular, descomprimí el ZIP y subí **su contenido a la raíz** del repositorio de GitHub Pages. Conservá la estructura `index.html`, `sw.js`, `manifest.webmanifest`, `assets/`, `data/`, `backend/`. No hace falta editar ni desplegar Apps Script o Worker: ambos archivos completos se incluyen **sin cambios** respecto del paquete v0.11.7 con la URL nueva corregida. La app sigue usando el mismo endpoint de Worker y la misma clave de Caja. No borres datos locales ni almacenamiento del sitio. Cerrá todas las ventanas y la PWA, y reabrí conectada para recibir el cache v0.11.8; comprobá que la pantalla muestre esa versión.

Caja muestra el desglose conservado del cierre anterior a la izquierda, sólo como referencia, y el conteo real de hoy editable a la derecha. Si no hay desglose previo, aparecen guiones. Si el último cierre no fue realmente arrastrado al abrir la caja, la interfaz lo aclara para no confundirlo con el conteo de hoy. El resumen de seis cifras usa el conteo actual válido al escribir; los datos guardados siguen en `pk_cash_daily_v1`. En móvil, las dos secciones se apilan. Los botones y la lista de movimientos conservan sus operaciones originales.

## Corrección de URL de Apps Script (1 de octubre de 2026)

El Worker completo de este paquete apunta a:

`https://script.google.com/macros/s/AKfycbwyFVFa54Ruue2-4UoIuvnYzbjyqmyEwiwuozl7Zz01zVD0KJSXMKnHdDtCwrAzg2VT/exec`

Si v0.11.7 ya está instalada, **para esta corrección sólo hace falta reemplazar y desplegar el Worker en Cloudflare**. No es necesario volver a subir la app a GitHub Pages, cambiar `index.html`, `sw.js`, `data/version.json` ni reinstalar la PWA. Tampoco hace falta volver a pegar Apps Script si ese mismo código ya está publicado en la nueva implementación. El ZIP incluye la app y el Apps Script completos por conveniencia para una instalación desde cero. El Worker sigue sirviendo `https://pancko-integral-api.tinchosiara.workers.dev/`; subir su archivo al repositorio por sí solo no lo despliega en Cloudflare. Revisar que la nueva implementación `/exec` conserve acceso, código, hoja y propiedad `PANCKO_CASH_TOKEN`.

## Orden para activar

1. **Antes de subir la app**, exportar un respaldo JSON de la Caja del equipo principal. Si la PC y el celular ya tienen cajas distintas para una misma fecha, revisar cuál será la principal: la sincronización no mezcla automáticamente dos historias preexistentes de la misma fecha.
2. En la cuenta del Apps Script actual, reemplazar el proyecto por el archivo **completo** `backend/Pancko_AppsScript_v0.11.7.gs`, conservando el `SHEET_ID` ya incluido. En **Configuración del proyecto → Propiedades del script**, crear `PANCKO_CASH_TOKEN` con una clave compartida de al menos 16 caracteres. No escribirla en el código ni en el repositorio. **Actualizar la implementación** de la aplicación web a una nueva versión; comprobar que sigue usando la URL `/exec` esperada. Acceso desde Worker según la configuración actual del servicio.
3. Reemplazar el código completo del Worker por `backend/Pancko_Worker_v0.11.7.mjs` en la cuenta Cloudflare actual y desplegarlo. Esta revisión fija `GAS_URL` a la nueva URL de Apps Script indicada abajo y la usa directamente, aun si quedara una variable `GAS_URL` antigua en Cloudflare. Si existe esa variable, actualizarla o quitarla para evitar confusiones futuras. Verificar `/ping` y una consulta real, por ejemplo `/colors` (el ping por sí solo no comprueba acceso a Apps Script). No hay que cambiar la clave de publicación de precios ni sus propiedades.
4. Descomprimir el ZIP y subir **su contenido** a la raíz del repositorio: `index.html`, `sw.js`, `manifest.webmanifest`, `assets/`, `data/`, `backend/` y documentación. Subir los archivos backend al repo **no** actualiza Apps Script ni Cloudflare: completar pasos 2 y 3 manualmente. Cerrar todas las ventanas de la PWA y reabrir con conexión; debe verse v0.11.7. No borrar los datos del sitio.
5. En Caja diaria → **Dispositivo y sincronización**, introducir un nombre por dispositivo (por ejemplo “PC Mostrador” o “Tincho celu”) y la **misma clave** del paso 2. Guardar. El nombre es trazabilidad, no login. Repetir en cada dispositivo. La clave se almacena localmente en el navegador; evitar un dispositivo compartido o sin bloqueo físico si eso no es aceptable.

**No se publicó ni se cambió el backend real desde esta entrega.** Para compartir Caja, primero deben estar activos los dos códigos backend nuevos y configurada la propiedad. Hasta entonces sigue funcionando localmente, y la pantalla indica pendientes/error de sincronización.

## Uso rápido PC y celular

1. PC: abrir Caja, crear el día y cargar “Ingreso de prueba” por $100. Pulsar **Sincronizar caja**; ver “Sincronizada”.
2. Celular: abrir la misma fecha, configurar nombre/clave, pulsar **Actualizar desde central**; debe aparecer ese movimiento. Agregar otro por $200 y sincronizar.
3. PC: **Actualizar desde central**; comprobar que aparecen ambos una vez. Desconectar temporalmente el celular, cargar un tercero y ver “Pendiente de enviar”. Reconectar y sincronizar; actualizar la PC.
4. Probar “Anular”: la fila permanece visible y no suma. Probar “Eliminar definitivamente” sólo con un movimiento de prueba: requiere escribir `ELIMINAR` y confirmar; desaparece de la lista normal y del TXT/impresión, pero permanece el ID en `deleted_ids` y un evento de auditoría.
5. Cerrar en PC; actualizar desde el celular y comprobar que se ve cerrada. Reabrir con confirmación en PC; sincronizar y actualizar el celular. Crear el día siguiente: sugerencia del último “queda para mañana” y, si es deducible, desglose inicial de billetes.

## Cómo resuelve concurrencia

- Una caja por fecha en `caja_diaria`. Cada operación tiene `op_id` estable y se aplica bajo `ScriptLock`; el servidor mantiene `central_revision` y op IDs aplicados para responder de forma idempotente a reintentos.
- Movimientos nuevos con IDs distintos se suman aunque provengan de dos dispositivos. Editar, anular o eliminar compara la versión exacta del movimiento visto; si cambió en otro equipo, devuelve conflicto en vez de pisarlo.
- Apertura repetida de una fecha con historias diferentes da conflicto. Un conteo parcial comprueba el conteo anterior; cambiar saldo inicial comprueba el inicial anterior. Un cierre compara movimientos, inicial y conteo del servidor antes de registrar; no cierra sobre datos viejos. Reabrir comprueba el cierre vigente.
- Si no hay red, los cambios se guardan junto con la cola `sync_pending` en `pk_cash_daily_v1`. Al recuperar la red se intenta enviarlos, y también hay botón manual. No requiere polling permanente. La pantalla indica guardado local, pendientes, sincronizada, conflicto y última sincronización.
- Ante conflicto, conservar/exportar respaldo. **Actualizar desde central** no descarta cambios pendientes. En el panel de configuración existe “Guardar respaldo local y reemplazar esta fecha desde central”: pide dos confirmaciones, descarga el JSON y guarda una copia adicional en almacenamiento local antes de descartar los pendientes de esa fecha. Revisar el libro antes de tomar esa decisión; la operación no combina dos ediciones incompatibles automáticamente.
- Al consultar una fecha aún no abierta, también recibe el último cierre anterior desde central para sugerir saldo y desglose incluso en un dispositivo recién configurado. Caja sin nombre/clave sigue en modo local. Si el servidor no responde, el cierre/reapertura pide confirmación para hacerlo sólo local y dejarlo pendiente. Si el servidor informa un conflicto conocido, exige revisión antes de cerrar o reabrir.

## Hojas y endpoints

| Elemento | Contenido |
|---|---|
| `caja_diaria` | Una fila por fecha: fecha, revisión, estado, saldo inicial/final, última actualización y `snapshot_json` completo con movimientos, conteo, retiro, “queda”, diferencias, historial y auditoría. Es la fuente de verdad. |
| `caja_eventos` | Registro auxiliar de operaciones (excepto borradores de conteo por teclado): op ID, fecha, revisión, acción, movimiento, dispositivo y hora del servidor. El snapshot guarda los op IDs para idempotencia incluso si falla esta hoja auxiliar. |
| POST `/cash/get` → `cash_get` | Consultar una fecha; cuerpo `{date,token,include_previous:true}` para incluir el último cierre anterior. La lectura no crea hojas. |
| POST `/cash/apply` → `cash_apply` | Aplicar `create/add/edit/void/delete/opening/draft/close/reopen` con `op_id`, `date`, `device`, `data`, `token`. Respuesta con fecha, revisión y snapshot; conflicto incluye `conflict:true` y el día central. |

Ambas hojas se crean **al primer guardado válido**, con encabezados sólo si no existen o están vacías. Una hoja existente con encabezados distintos bloquea escritura y pide revisión; no reordena ni borra datos. La hoja `caja_movimientos` no se crea: movimientos viven dentro del snapshot de la fecha para que cierre y cambios sean una sola escritura autoritativa; `caja_eventos` ofrece rastro técnico. La clave de Caja pertenece exclusivamente a `PANCKO_CASH_TOKEN` de Apps Script, separada de la lista de precios. `BACKEND_v0.11.2.md` y `LISTA_PRECIOS_v0.11.2.md` siguen en el paquete como documentación histórica de los otros módulos; los archivos para desplegar ahora son los dos `v0.11.7` de `backend/`.

## Compatibilidad y límites

- Los días locales v0.11.6 siguen legibles. El primer envío de un día previo crea su snapshot central si la fecha aún no existe. Si otro dispositivo ya creó esa fecha centralmente, se marca conflicto; nunca se sobrescribe la caja existente sin decisión explícita.
- Se conserva cierre, reapertura, arrastre de saldo y billetes de v0.11.6, conteo con sumas, impresión, TXT, respaldo JSON e historial. Una caja posterior ya creada no cambia sola al corregir un cierre anterior.
- Sin usuarios reales, cualquier persona con la clave compartida puede modificar Caja. El nombre de dispositivo sólo ayuda a identificar el origen; no sustituye roles ni autorización individual.
- Sheet limita el tamaño de una celda: el backend detiene una jornada que supera ~45.000 caracteres de snapshot; los datos locales y la cola quedan intactos para respaldo y revisión. Es una limitación conocida de esta primera centralización.
- El evento de eliminación conserva ID, importe y detalle anterior en la auditoría técnica; no es borrado irrecuperable de toda traza. La impresión normal y la lista excluyen el movimiento eliminado.
- Ver `VALIDACION.md` para pruebas simuladas y lo no comprobado en servicios reales. El Informe para Cerebrito se entrega en el texto de la conversación, **fuera del ZIP**.
