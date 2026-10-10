# Pancko Gestión · Cañada · v0.12.37

## Qué subir

Este ZIP contiene **el frontend completo del repositorio `pancko-integral`**. Descomprimí y subí/reemplazá en la raíz del repo los archivos y carpetas `index.html`, `sw.js`, `manifest.webmanifest`, `assets/` y `data/`, conservando la misma estructura. Incluye el `data/recetas.csv` completo vigente (con Microcemento SPECIAL). No subas sólo los archivos nuevos. No hace falta borrar los datos locales de la PWA. Al actualizar, cerrá y reabrí las pestañas para que el service worker active la nueva versión; verificá v0.12.37 en la app.

**No subir este ZIP a Worker, Apps Script ni Sheet.** No incluye backend. No modifica sincronización central ni producción de recetas. Publicación manual por Tincho; esta entrega no se publicó.

## Cheques y valores

Agenda local de cheques físicos y eCheq recibidos o entregados. Alta, edición, cambio de estado, anulación, eliminación confirmada, búsqueda, filtros, vencimientos y copia de resumen. En Cuenta Corriente, un pago con forma Cheque muestra datos adicionales y la opción **Agendar** activada por defecto. Al guardar correctamente el pago se crea el registro local vinculado al ID del movimiento; reintentar un pago con el mismo ID actualiza la misma ficha. El pago conserva su comportamiento actual en Cuenta Corriente. Si falla la agenda, aparece un mensaje y se puede editar el pago para reintentar.

Clave local: `pk_values_checks_v1`. Guarda los datos del valor, importes en centavos, fechas, origen, IDs de Cuenta Corriente y dispositivo. **Sólo existe en el navegador/dispositivo en que se cargó.** No se comparte por Sheet, Worker ni otros dispositivos y borrar los datos del sitio la elimina. Cta Cte sí sigue su sincronización propia. Estados de Cheques no alteran saldos de Cta Cte, Caja ni bancos. La edición de la ficha de Cheques tampoco modifica el pago de origen.

## Prueba breve

1. En Cheques y valores, crear físico recibido, físico entregado, eCheq recibido y eCheq entregado; editar importe y vencimiento.
2. Cambiar a Depositado, Cobrado, Rechazado y Anulado; buscar por contacto/banco y usar filtros Próximos 7 días/Vencidos y Copiar resumen.
3. En Cuenta Corriente, registrar un pago con Cheque y vencimiento; comprobar que se guarda el pago y aparece la ficha local vinculada. Verificar que Caja no cambia.
4. Revisar en celular la lista compacta y el formulario. Esta prueba visual y la publicación quedan para el dispositivo de Tincho.

Pruebas automáticas locales: alta de cuatro combinaciones, edición, estados, filtros, copia, enlace de Cta Cte sin duplicado y protección de datos corruptos. Sintaxis de los scripts verificada.

## Próxima etapa

Sincronización central de la agenda; definir rechazo y contra movimiento de deuda; cobro y banco; depósito real; tablero más completo. Ninguna de esas operaciones está activa en v0.12.37.
