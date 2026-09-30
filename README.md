# Pancko Gestión v0.11.4 — Caja diaria compacta

Entrega completa construida sobre v0.11.3. Compacta la Caja en escritorio y agrega entrada de sumas/restas en los grupos de conteo, con avance mediante Enter. Mantiene el mismo libro local, cálculos, historial y salidas.

## Instalar

1. Descomprimir el ZIP y subir **su contenido a la raíz del repositorio**, sin una carpeta envolvente. `index.html`, `sw.js`, `manifest.webmanifest`, `assets/` y `data/` quedan al mismo nivel que en la app existente. Conservar los otros archivos propios del repo.
2. **No reemplazar Apps Script ni Worker por esta misión.** Los dos archivos completos de `backend/` se conservan byte a byte desde v0.11.3 como referencia: Apps Script v0.11.2 y Worker v0.11.0. Subir esos archivos al repositorio no actualiza los servicios. La Caja no los utiliza.
3. Abrir Pancko con conexión y dejar completar la actualización. Cerrar todas las pestañas/ventanas instaladas de Pancko y reabrir. Debe verse **v0.11.4**. Repetir en cada equipo. El worker puede seguir mostrando v0.11.0; es correcto.
4. No borrar datos del sitio ni restablecer el navegador: eso elimina datos locales, incluidas las cajas. Eliminar cachés de PWA y eliminar datos del sitio son acciones distintas. Ante dudas, exportar primero los respaldos.

No se interactuó con GitHub ni se publicó ningún servicio. No se modificó la Sheet real.

## Distribución compacta y entrada de conteo

En PC (desde 1024 px) el encabezado se reduce; fecha, estado y saldo quedan en la franja superior. La columna izquierda reúne el resumen en cuatro bloques bajos, detalle/importe/Ingreso/Egreso en una fila y movimientos con altura máxima adaptable a la ventana y scroll interno. La derecha contiene grupos en filas compactas, retiro, saldo para mañana, contado/teórico/diferencia y guardar/cerrar. Historial y respaldo quedan plegados; registro de cambios mantiene su sección plegable.

La compactación busca concentrar la operación principal dentro de la ventana de PC. El tamaño real depende de altura de pantalla, zoom, textos y mensajes: no se garantiza ausencia total de scroll. Las secciones secundarias pueden requerir desplazar la página. En móvil se mantienen campos altos y disposición vertical; la tabla no recibe una altura máxima vertical forzada.

Los cinco campos de grupos aceptan importes o sumas/restas simples:

- `30000+20000+10000` o `30.000+20.000+10.000` → 60.000.
- `93500+500` → 94.000.
- `30.000-10.000` → 20.000.
- `1.234,56+0,44` → 1.235.

Se muestra el resultado del grupo mientras se escribe. Una expresión incompleta o inválida muestra error y no se guarda ni cierra la caja. Se admiten hasta dos decimales por importe y signos +/−; no multiplicación, división, paréntesis, funciones ni texto ejecutable. El parser no usa eval ni Function. Límite de expresión: 2000 caracteres. El total final del grupo debe ser no negativo.

Enter valida el campo, reemplaza una expresión válida por su resultado y pasa al siguiente: grandes → 2.000/1.000/500 → 200/100 → 50/10 → otros/monedas → retiro → saldo para mañana, únicamente si está manualmente habilitado. Una expresión inválida conserva texto y foco. Enter no guarda ni cierra automáticamente la caja. Retiro y saldo para mañana continúan aceptando importes simples, sin expresiones.

Al guardar parcial o cerrar, se conservan **sólo los importes finales en centavos**, dentro del esquema anterior; no se agregan expresiones al historial ni al respaldo. Las cajas existentes no necesitan migración y las nuevas pueden ser leídas por v0.11.3.

## Usar Caja diaria

- Acceso directo en sidebar de PC, tarjeta del dashboard y tile grande en móvil.
- Al entrar abre la fecha de hoy en horario de Argentina. Si todavía no existe, ofrece crearla con el saldo dejado en el último cierre anterior disponible. Se puede modificar esa sugerencia.
- Una fecha tiene una sola caja. El selector de fecha y la tabla histórica permiten consultar días anteriores.
- Carga libre de **detalle + importe**, con hora automática. Positivo suma, negativo resta; “Egreso” fuerza el signo negativo. No se eligen productos, clientes ni comprobantes. Enter también guarda.
- Acepta `4750`, `4.750`, `154.000`, `-32.000`, `4.750,50`. No usa coma como separador de miles; admite hasta dos decimales. Los cálculos internos usan centavos enteros.
- Editar conserva la hora original y marca el movimiento. Anular pide confirmación, conserva el movimiento visible y deja de sumarlo. El registro de cambios guarda antes/después.
- El saldo teórico queda visible en la barra fija: inicial + ingresos − egresos.
- El conteo se carga como **importe total por grupo**, no cantidad de billetes. “Guardar sin cerrar” conserva el conteo parcial y mantiene abierta la caja.
- Diferencia = contado − teórico: cero “Caja OK”; positivo “Sobra efectivo”; negativo “Falta efectivo”.
- Retiro y saldo para mañana: contado − retiro. Se puede declarar otro saldo manualmente, con advertencia visible si no coincide. No se permiten conteos/retiros/saldos iniciales negativos ni retiro superior al contado.
- Cerrar requiere conteo explícito y confirmación. Una caja vacía puede cerrar ingresando `0` en un grupo. Cerrada bloquea ediciones; reabrir pide confirmación y conserva el cierre anterior con su snapshot.
- Cambiar una caja anterior no recalcula el saldo inicial de otra fecha ya creada. Al abrir una nueva se sugiere el último cierre anterior disponible; si hay jornadas anteriores abiertas, se avisa.
- Imprimir caja abre un resumen A4 completo del día seleccionado. Si se bloquea la ventana, descarga un HTML para abrir/imprimir. También permite TXT o copiar el resumen; sin clipboard disponible descarga TXT. Las salidas incluyen movimientos anulados identificados, importes, conteo y cierre guardado. No incluyen conteos que todavía no se guardaron.

## Guardado y respaldos

**Sólo local/offline**, por navegador y dispositivo. La clave es `pk_cash_daily_v1`; la app guarda un libro JSON con revisión y días. No existe sincronización de cajas con Sheet ni entre PC y celular.

Se guarda automáticamente después de cada acción confirmada: apertura, carga, edición, anulación, cambio de inicial, conteo parcial, cierre y reapertura. Lo escrito sin tocar el botón de guardar aún no es un movimiento registrado.

“Respaldo de todas las cajas” descarga el libro JSON. Restaurar valida el archivo y agrega fechas nuevas. Si una fecha ya existe con datos distintos, rechaza toda la importación; no la reemplaza. Fechas idénticas no se duplican. Exportar regularmente permite conservar una copia fuera del navegador.

Se valida el libro antes de escribir. Si está dañado, se bloquea la escritura y se permite descargar el contenido original. Si falta espacio, no se activa el cambio y se conserva la entrada del movimiento. Se comprueba la revisión para detectar cambios de otra pestaña y se usa Web Locks cuando está disponible; en navegadores sin Web Locks, evitar editar la misma caja simultáneamente en varias pestañas.

## Estructura técnica

- Libro: `schema_version: 1`, `revision`, `days`.
- Día: ID estable `cash_AAAA-MM-DD`, fecha, estado `open/closed`, apertura, fuente de saldo sugerido, movimientos, totales derivados, conteo parcial, cierre activo, cierres anteriores y registro de cambios.
- Movimiento: UUID, detalle, importe en centavos, creación/edición, marca de editado y anulación. No se elimina físicamente.
- Cierre: importes de los cinco grupos, conteo explícito, retiro, saldo manual opcional, total contado, diferencia, saldo dejado, fecha/hora y snapshot de movimientos/apertura/totales.
- `created_by`, `updated_by` y `closed_by` quedan preparados con `null`, sin login.
- Fechas técnicas ISO; presentación con horario de Argentina. La fecha/hora depende del reloj del equipo.
- CSS y JS de caja están inline en index.html para viajar con el shell cacheado; `assets/caja.css` y `assets/caja.js` son copias fuente idénticas, no dependencias externas de ejecución.

## Lo anterior se conserva

No se cambia el cálculo tintométrico ni se recalculan presupuestos en curso/guardados. Lista central, nombres/fechas de lista, importadores, clientes, precios por pulso, etiquetas, A4, ticket e historial siguen con sus reglas anteriores. Remitos, cuenta corriente, cobros, cheques y scanner mantienen su estado previo; usuarios/login quedan pendientes.

Los tres CSV, manifest, iconos y backend se conservan byte a byte. El CSV de artículos incluido mantiene los 3998 artículos de la base; un equipo que ya recibió 4270 desde Sheet conserva su catálogo local. No se incrementa la versión de los datos CSV para forzar un reemplazo.

La Caja diaria no registra productos ni estadísticas comerciales. Sí conserva historial consultable por fecha.

## Límites y validación

Ver `VALIDACION.md` y `CHANGELOG.md`. Las pruebas ejecutan el código entregado con DOM, almacenamiento, ventanas, clipboard, caché y Sheets simulados; canvas real para las salidas existentes. No se probó en Chrome/Android real, PWA instalada real, impresora física ni servicios desplegados. Esa cobertura pendiente queda declarada; no se presenta la simulación como prueba de producción.

El historial ocupa almacenamiento del navegador y está sujeto a su cuota. Detalle de movimiento hasta 300 caracteres; respaldo importable hasta 20 MB. Los respaldos no sustituyen una sincronización: esta etapa está pensada para un equipo principal de caja. Los cierres guardados y anulaciones no son controles de usuario: no hay autenticación.

Documentación del catálogo existente en `LISTA_PRECIOS_v0.11.2.md` y del backend en `BACKEND_v0.11.2.md`. Son referencias de la etapa anterior, no instrucciones para reemplazar el backend por esta Caja.
