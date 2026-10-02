# Pancko Gestión v0.12.5 — Productos opcionales en cargos de CC

## Actualizar desde v0.12.4

Descomprimir y subir **el contenido** del ZIP a la raíz de GitHub Pages (`index.html`, `sw.js`, `assets/`, `data/`, `backend/` y documentación). Reemplazar el archivo nuevo `assets/cc-product-detail.js` junto al index. Cerrar las ventanas de la PWA en PC y celular, reabrir con conexión y comprobar v0.12.5. **Conservar el almacenamiento del sitio** (`pk_cc_manual_v1`) y la clave de CC local. El service worker precarga el archivo nuevo para uso offline posterior.

**Backend:** Apps Script completo v0.12.4 y Worker completo v0.12.2 van en el ZIP exactamente como en la versión ya instalada. No hay que actualizar ni redeplegar Apps Script/Worker, no hay nuevas hojas/columnas/endpoints/propiedades/tokens. Se sigue usando `POST /cc/apply` y `/cc/get` con `PANCKO_CC_TOKEN`. Verificar que el backend v0.12.4 ya esté desplegado antes de usar CC (lo confirmó Tincho en su instalación).

En «Nuevo cargo», abrir «Detalle de productos (opcional)», buscar por código o descripción, agregar líneas y elegir un modo para todo el cargo: precio actual local (snapshot), precio manual o sin precio. El total calculado se sugiere como importe y se puede modificar; si difiere aparece aviso. **Sólo el importe final guardado afecta el saldo.** Sin productos, el cargo mantiene la carga manual anterior. La ficha incluye «Ver productos» y el TXT/copiar/imprimir muestran líneas debajo del movimiento. Al editar conserva precios y descripciones históricos aunque cambie el catálogo; si se decide cambiar de modo a precio actual, consulta el catálogo local vigente para ese cambio explícito.

Los datos nuevos se guardan en `product_detail` dentro del movimiento de `pk_cc_manual_v1` y viajan en `snapshot_json` de la fila existente de `cc_movimientos`. Se admite hasta 12 líneas, cantidad decimal de hasta tres posiciones y subtotales redondeados a centavos por línea. La búsqueda lee el catálogo local, no altera su precio. No crea stock, remito, presupuesto, Caja ni integración Yoppen. Respaldos JSON anteriores siguen importándose. Conservar respaldos de CC antes de reemplazar la app.

## Historia: v0.12.4 — Resolución manual de identidad



## Actualizar desde v0.12.3

1. Descargar respaldo JSON de CC en cada dispositivo con movimientos. La herramienta de unión guarda además una copia local antes de proceder.
2. Reemplazar el Apps Script completo por `backend/Pancko_AppsScript_v0.12.4.gs`. Mantener el mismo `SHEET_ID` y las propiedades actuales, especialmente `PANCKO_CC_TOKEN`. Actualizar la implementación web existente a una nueva versión **conservando su URL /exec**. No crear otra implementación si no es necesario.
3. **Worker sin cambios**: se incluye `backend/Pancko_Worker_v0.12.2.mjs` idéntico al vigente; no hay que redeplegarlo. La acción nueva `client_merge` viaja por `/cc/apply`, que ya existe. Si accidentalmente cambia la URL de Apps Script, sí habrá que corregir `GAS_URL` en Worker.
4. Subir el contenido completo del ZIP a la raíz del repo. Actualizar PC y celular antes de usar la unión. Cerrar todas las ventanas de Pancko en cada dispositivo y reabrir con conexión; comprobar v0.12.4. No borrar datos del sitio.
5. En el equipo con la ficha local anterior, pulsar Actualizar desde central. Abrir «Conflictos de clientes». Comparar ID, contacto, movimientos y saldo de ambos lados y elegir la acción.

### Acciones de identidad

- **Unir fichas usando ID central:** pide confirmación, guarda una copia de CC en `pk_cc_before_identity_merge_v1` y ofrece descarga JSON. Registra la unión en central; después reasigna los movimientos locales y sus operaciones pendientes al ID definitivo. IDs de movimientos y de sus operaciones se conservan. Las operaciones de alta de la ficha anterior se retiran de la cola y sus IDs quedan en la auditoría local. Se suben los pendientes y se recalcula la ficha combinada. No elimina movimientos ni reemplaza datos de contacto centrales con la ficha local.
- **Mantener separados:** solicita un nombre distinguible para la ficha local, conserva sus movimientos y registra una excepción explícita para esa pareja de IDs, incluso si comparten documento. Otra computadora recibe las fichas separadas. No unifica deudas.
- **Revisar después:** deja la pareja pendiente. La sincronización omite los cambios ligados al cliente en conflicto y permite enviar los de otros clientes. La herramienta permanece disponible.

Las decisiones centrales de unión viajan a otros dispositivos: si uno todavía tiene el ID anterior, la app reasigna esa ficha local a la decisión ya confirmada. En Sheet se conservan las filas originales como historial; la referencia de unión vive en el snapshot de la ficha destino. Las lecturas/API exponen el ID definitivo sin duplicar filas de movimientos. No se agregan hojas ni columnas; `cc_eventos` registra `client_merge` y el snapshot destino guarda origen, destino, fecha, dispositivo y op_id. Ver `BACKEND_CC_v0.12.4.md`.

Si la red corta durante la unión, no volver a crear movimientos: actualizar o repetir la unión recupera la decisión con el mismo ID de operación. Una discrepancia del mismo ID de movimiento sigue siendo un conflicto de edición: la unión de clientes no lo sobrescribe.

## Historia: instalación y funcionamiento anteriores

## Actualizar desde v0.12.2 ya funcionando

Subir el contenido del ZIP a la raíz del repositorio, cerrar todas las ventanas de la PWA y reabrir con red para recibir v0.12.3. No borrar datos del sitio. **No reemplazar ni redeplegar Apps Script o Worker**: los archivos completos v0.12.2 se incluyen sin cambios. Las hojas, endpoints y token de CC continúan iguales.

Cuenta corriente consulta central al entrar, al cambiar de cliente (con una pausa mínima de 5 segundos entre consultas rápidas), al volver a una ventana visible y cada **60 segundos** mientras el módulo está abierto. Se pausa sin red, sin clave, con conflicto conocido o mientras hay un formulario de movimiento abierto. Si un formulario se abre durante la consulta, la respuesta automática no lo reemplaza; el siguiente ciclo vuelve a consultar. Los filtros Desde/Hasta se conservan al recibir. Los botones manuales y el envío de pendientes al guardar/volver la red siguen disponibles.

Arriba queda un estado compacto. El panel «Dispositivo, clave y sincronización», con última recepción, clave, error completo y resolución de conflictos, queda plegado debajo de las fichas y cerca del respaldo. Las consultas automáticas no borran pendientes ni resuelven conflictos por su cuenta. La hora del estado indica la última consulta completada, no garantiza que otro dispositivo no haya cambiado datos después.

Las instrucciones siguientes son para instalar el backend central desde versiones anteriores.

## Despliegue desde v0.12.1, en orden

1. **Antes de actualizar**, descargar respaldos JSON de Cuenta corriente en cada equipo que tenga movimientos propios. Respaldar también Caja. Si dos equipos ya tienen deudas para el mismo cliente con IDs distintos, conservar ambos respaldos y revisar antes de unir fichas.
2. En la cuenta del Apps Script que ya usa Pancko, reemplazar el código completo por `backend/Pancko_AppsScript_v0.12.2.gs`. Mantener el `SHEET_ID` existente. En Propiedades del script configurar `PANCKO_CC_TOKEN` con una clave propia de CC de **al menos 16 caracteres**; no publicarla en el repositorio. Conservar `PANCKO_CASH_TOKEN` y la clave de artículos sin cambios. Crear una **nueva versión de la implementación web** existente y comprobar su URL `/exec`.
3. En Cloudflare, reemplazar y desplegar el Worker completo `backend/Pancko_Worker_v0.12.2.mjs`. Conserva la URL de Apps Script `AKfycbwyFVFa54Ruue2-4UoIuvnYzbjyqmyEwiwuozl7Zz01zVD0KJSXMKnHdDtCwrAzg2VT/exec`; si la implementación cambió de URL, actualizarla en el Worker **antes** de desplegar. Verificar `/ping` (versión 0.12.2) y una operación real de CC. Subir el archivo Worker al repo por sí solo no lo despliega.
4. Descomprimir el ZIP y subir **su contenido directamente a la raíz del repositorio**: `index.html`, `sw.js`, `manifest.webmanifest`, `assets/`, `data/`, `backend/` y documentación. Subir los archivos backend al repo no actualiza los servicios; completar los pasos anteriores por separado. Cerrar todas las ventanas de Pancko/PWA y reabrir con conexión; debe verse v0.12.2. **No borrar datos del sitio**: contienen `pk_cc_manual_v1`.
5. En Cuenta corriente, abrir «Dispositivo y clave de CC», escribir la **misma clave** en PC y celular, guardarla y pulsar **Sincronizar CC**. El nombre del dispositivo se toma de la configuración de Caja; si no está configurado figura «Sin identificar». La clave de CC queda sólo en el almacenamiento de cada dispositivo.

La primera sincronización **sube los movimientos locales anteriores con sus IDs**, junto con sus clientes, y luego recibe las fichas centrales. Descargá un respaldo antes de esta primera subida. «Actualizar desde central» trae datos sin descartar operaciones pendientes; «Sincronizar CC» intenta enviar pendientes y luego trae lo central. Las cargas offline permanecen en `pk_cc_manual_v1` hasta que la red y el backend respondan. El estado muestra pendientes, conflicto y última sincronización. Un conflicto nunca sobrescribe la versión local automáticamente. Para conflictos del **mismo ID** se ofrece respaldar y usar explícitamente la versión central de ese registro; para clientes con distinto ID y nombre coincidente se requiere revisar los respaldos antes de conciliar.

### Prueba guiada PC y celular

1. En PC crear un cliente de prueba y un cargo manual pequeño; pulsar **Sincronizar CC** y comprobar «sincronizada».
2. En celular configurar la clave de CC y pulsar **Actualizar desde central**. Verificar cliente, cargo y saldo. Agregar pago y sincronizar.
3. En PC pulsar **Actualizar desde central**; comprobar el pago y el mismo saldo. Repetir Sincronizar CC: no debe crear otro cargo.
4. En celular sin red cargar otro cargo; comprobar «pendiente de enviar». Reconectar y sincronizar; actualizar la PC.
5. Editar y anular sólo movimientos de prueba desde equipos distintos. Si los dos editan el mismo sin actualizar, el segundo recibe conflicto. Exportar respaldos al terminar.

**Cuenta corriente sigue siendo manual**: no recibe deudas de presupuesto/remito/Yoppen ni crea movimientos de Caja al registrar un pago. No hay login: cualquiera con la clave compartida y acceso a la app puede operar la ficha. No se probaron estos pasos en los servicios productivos desde esta entrega; ver `VALIDACION.md`.

Detalles de hojas, operaciones y límites en `BACKEND_CC_v0.12.2.md`. Las instrucciones históricas siguientes corresponden a versiones anteriores y no sustituyen este orden de despliegue.

## Historia de versiones anteriores

## Actualizar desde v0.12.0

Esta versión mejora la ficha manual de Cuenta corriente y **sigue siendo local** en `pk_cc_manual_v1`. Caja diaria conserva su sincronización central. Antes de reemplazar archivos, descargá un respaldo de Cuenta corriente y otro de Caja desde el equipo principal.

1. Descomprimí el ZIP. Subí **el contenido**, sin una carpeta contenedora adicional, a la raíz del repositorio que sirve GitHub Pages. Reemplazá `index.html`, `sw.js`, `data/version.json`, `assets/` y la documentación; conservá la estructura `data/` y `backend/`.
2. No borres los datos del sitio ni reinstales la PWA. Cerrá todas sus ventanas, abrila con conexión y comprobá `Pancko Gestión v0.12.1`.
3. Editá un movimiento de prueba y comprobá el saldo. Exportá una ficha TXT e imprimila. Verificá las claves operativas de Caja y lista central en tu Chrome.

**No se modifica ni se redepliega Apps Script o Worker.** Los archivos completos `backend/` están incluidos como referencia idéntica a v0.12.0. Los tres CSV, Caja, lista central, presupuestos y tintométrico conservan sus datos y lógica.

### Cambios de Cuenta corriente

- Cada movimiento activo ofrece **Editar**. Conserva su ID y fecha de creación; cambia los campos editables del tipo, recalcula el saldo y registra `updated_at`, `updated_by_device`, `edited` e `edit_history`. Cargo y pago conservan su tipo; un ajuste puede pasar de positivo a negativo o viceversa. Un anulado no se edita. Cambiar el importe exige confirmación.
- El importe admite puntos de miles y coma decimal; una línea debajo muestra “Se cargará: …”. Al salir del campo se normaliza la vista. Importes de $1.000.000 o más, nuevos o corregidos, requieren confirmación adicional. Las validaciones originales continúan vigentes.
- La ficha ofrece **Imprimir ficha**, **Exportar resumen TXT** y **Copiar resumen**. Incluye contacto, fecha de emisión, saldo actual, cargos, pagos y saldo corrido. Si hay filtros Desde/Hasta, las filas exportadas respetan ese período; los totales superiores muestran **el saldo y acumulados actuales completos del cliente**, no sólo el período. Los movimientos anulados se ven marcados y no suman.
- El botón **Cta CTE** de Clientes tiene contraste azul/blanco. Las claves operativas de Caja y lista central usan un campo de texto enmascarado visualmente con botón Mostrar/Ocultar, para evitar la detección habitual de campos de contraseña en Chrome. El valor de las claves y el modo de almacenamiento no cambian. Otros navegadores pueden interpretar el enmascaramiento de modo distinto.

### Próxima etapa: CC central v0.12.2

No hay hojas ni endpoints nuevos en v0.12.1. Para compartir saldos entre PC y celular se necesita sincronizar **movimientos y clientes**. Diseño propuesto: hojas `cc_movimientos` (ID, cliente, datos, revisión, estado), `cc_eventos` (operación idempotente y origen) y `cc_clientes_extra` (altas/ediciones identificadas); propiedad separada `PANCKO_CC_TOKEN`; endpoints `/cc/get` y `/cc/apply` en Worker. El servidor debe aplicar bajo bloqueo, guardar `op_id`, comparar la revisión del movimiento en edición/anulación, combinar altas con IDs distintos y devolver conflicto sin pisar cambios concurrentes. La app conservará `pk_cc_manual_v1` y una cola offline; necesitará una migración explícita con respaldo y conciliación de clientes duplicados antes de hacer central la ficha existente. No desplegar hojas ni propiedades de esta propuesta todavía.

**Hasta esa etapa, los saldos de CC en dos dispositivos pueden diferir.** Usá un equipo principal y exportá respaldos de la ficha. Importar JSON en otro equipo no equivale a sincronización automática.

## Historia y funcionamiento anterior

Entrega completa basada en v0.11.6. Caja diaria conserva el libro offline `pk_cash_daily_v1` y agrega sincronización con Google Sheets mediante Apps Script y Worker. Presupuesto, artículos, lista de precios, tintométrico y el resto de la app conservan su lógica.


## Novedad v0.12.0: ficha manual de cuenta corriente

Cuenta corriente se guarda **sólo en este navegador** bajo `pk_cc_manual_v1`. No se sincroniza entre PC y celular. Caja diaria **sí** conserva su propia sincronización. Elegimos esta primera etapa local para tener cargos, pagos y anulaciones confiables sin introducir conflictos de deuda entre dispositivos ni tocar la Sheet mientras se define un protocolo central. Usar **un equipo principal** para esta ficha; descargar su respaldo JSON con regularidad. Importar el respaldo en otro dispositivo combina movimientos por ID, pero **no habilita sincronización automática** ni resuelve ediciones concurrentes.

Desde Cuenta corriente podés buscar clientes por nombre, teléfono o comprobante; consultar saldos, cargos, pagos, historial y filtro de fechas; cargar cargo con referencia libre a Yoppen, pago con forma y referencia, o ajuste positivo/negativo; y anular sin borrar la auditoría. El saldo en centavos se calcula como cargos + ajustes positivos − pagos − ajustes negativos, omitiendo anulados. El total general por cobrar suma **sólo saldos positivos**; anticipos quedan como saldos a favor en las fichas. Los productos opcionales del cargo quedan pendientes: en esta versión se usa importe directo y detalle libre. No hay efectos sobre stock.

Clientes mantiene `pk_clients` y sus IDs. Al entrar a Cuenta corriente, clientes antiguos sin ID reciben uno local estable; IDs duplicados bloquean escrituras hasta revisar la base. Alta desde Clientes o desde Cuenta corriente incorpora localidad, nota y activo/inactivo. Nombre o documento exacto existente bloquea duplicados; nombres parecidos piden confirmación. No se puede eliminar desde la app un cliente que tenga movimientos, incluso anulados; se puede marcar inactivo. El respaldo de CC incluye movimientos y clientes vinculados o creados localmente; al importar valida IDs y cancela si hay discrepancias, sin borrar registros existentes.

Un cargo es **manual** y puede referir una factura o remito de Yoppen; Pancko no obtiene esos comprobantes. Un presupuesto guardado/impreso no genera deuda. Un pago en efectivo no crea un movimiento de Caja diaria: si corresponde, se registra por separado. Esta ficha no factura, no emite recibos fiscales y no sustituye a Yoppen. El nombre del dispositivo configurado para Caja se usa sólo como trazabilidad, sin login.

### Actualizar desde v0.11.8 ya instalada

1. Antes de actualizar, exportar los respaldos que ya utilizás, especialmente Caja.
2. Descomprimir el ZIP y subir **su contenido** a la raíz del repositorio GitHub Pages: `index.html`, `sw.js`, `manifest.webmanifest`, `assets/`, `data/` y documentación. Los archivos `backend/` van incluidos completos pero **no hay que reemplazar ni redeplegar Apps Script/Worker** para esta versión.
3. Cerrar todas las ventanas de la PWA; reabrir con conexión y comprobar `Pancko Gestión v0.12.0`. No borrar almacenamiento del sitio: ahí quedan Caja, clientes y la nueva ficha local.
4. Crear un cliente o abrir uno existente, anotar un cargo y un pago de prueba, verificar el saldo y descargar un respaldo desde Cuenta corriente. El respaldo de Caja es independiente del respaldo de CC.

Para una instalación desde cero, leer también las instrucciones históricas de Caja compartida que siguen más abajo.

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
