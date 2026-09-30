# Referencia del backend v0.11.0

Esta documentación corresponde al backend de la entrega anterior. **La corrección visual v0.11.1 no cambia este backend ni exige reinstalarlo.** Se conserva como referencia para quien todavía no lo haya instalado.

## Actualizar backend manualmente

La app funciona con el backend anterior para sus rutas históricas. Para activar artículos centralizados y snapshots completos entre dispositivos, reemplazar **Apps Script y Worker** por los archivos completos de `backend/`. Orden recomendado: Apps Script, Worker y archivos de la app.

### Apps Script — cuenta registrada `pancko1976@gm...`

1. Abrir el proyecto actual de Apps Script. Guardar una copia del código anterior.
2. Reemplazar su código completo por `backend/Pancko_AppsScript_v0.11.0.gs`. Conserva el ID de la Sheet ya identificado.
3. Guardar y actualizar la implementación web **existente** a una nueva versión del script; mantener su URL `/exec`. No basta con guardar en el editor. Mantener las opciones de ejecución/acceso de la implementación actual.
4. Para publicar precios: en Configuración del proyecto → Propiedades del script, agregar `PANCKO_ARTICLES_TOKEN` con una clave privada elegida por el responsable. No escribirla en el HTML, en el Worker ni en el repo. La app la pide al publicar y no la guarda en localStorage; se limpia al cerrar la vista previa o completar la publicación.
5. Opcional: ejecutar `prepararPanckoGestion` desde el editor para crear las hojas preparatorias vacías. No se ejecuta automáticamente desde la app ni con un GET. Si Google pide autorizar esta ejecución manual, corresponde al propietario realizarlo en su cuenta.

### Worker — cuenta registrada `tinchosiara@g...`

1. Abrir `pancko-integral-api` en Cloudflare.
2. Guardar copia del código anterior y reemplazarlo por `backend/Pancko_Worker_v0.11.0.mjs`. Es un Worker en formato módulo completo.
3. Mantener la URL `https://pancko-integral-api.tinchosiara.workers.dev`.
4. El archivo conserva la URL GAS confirmada. Si por decisión propia se crea otra implementación de Apps Script con distinta URL, actualizar `GAS_URL` en este archivo o definir la variable `GAS_URL` del Worker. La app apunta al Worker, no al GAS directamente.
5. El `/ping` del Worker informa v0.11.0. El `?action=ping` de Apps Script informa v0.11.0. Ninguno accede ni modifica Sheets.

No se modificó, leyó ni escribió la Sheet publicada durante esta implementación. Las pruebas del backend usaron una copia histórica local y dobles de los servicios.

## Hojas

| Hoja | Uso | Cuándo se crea |
|---|---|---|
| `presupuestos` | Filas históricas compatibles | Sólo una escritura de presupuesto si falta o está vacía; se mantiene el esquema existente |
| `registros_colores` | Registros de color compatibles | Sólo una escritura de color si falta o está vacía |
| `pancko_snapshots` | JSON completo, dividido en partes, de presupuestos y colores | Al guardar datos desde el backend nuevo, o con preparación manual |
| `articulos_maestro` | Maestro completo por versión; JSON de cada artículo conserva sus columnas | Primera publicación central o preparación manual |
| `articulos_versiones` | Publicaciones completas, ID, hash, fecha y cantidad | Primera publicación central o preparación manual |
| `remitos`, `remito_lineas` | Estructura futura; sin operaciones activas | Sólo preparación manual |
| `cc_movimientos` | Estructura futura; sin operaciones activas | Sólo preparación manual si falta/está vacía; la hoja existente se conserva tal cual |
| `recibos`, `recibo_aplicaciones` | Estructura futura; sin operaciones activas | Sólo preparación manual |
| `cheques` | Estructura futura; sin efectos económicos | Sólo preparación manual |

`config` existente se conserva; no se usa para inventar nuevas reglas económicas. La preparación preserva toda hoja económica existente aunque sus encabezados sean distintos: queda pendiente definir su migración cuando se active el circuito.

No se agregan columnas automáticamente a hojas históricas con contenido. Si una escritura encuentra encabezados requeridos faltantes, informa cuáles y se detiene; no modifica la estructura. Las lecturas no crean hojas ni cambian encabezados. Se validan las líneas antes de reemplazar un presupuesto. Las escrituras usan LockService. La lista central publica su versión después de escribir el maestro completo; las cargas huérfanas no se entregan y un reintento con el mismo ID las puede recuperar.

## Endpoints

| Worker | Acción de Apps Script | Operación |
|---|---|---|
| GET `/ping` | — | Estado del Worker |
| GET `/test` | — | Ejemplo estático histórico; no es un entorno de prueba segregado |
| GET `/colors` | `list_colors` | Colores y snapshot si existe |
| POST `/color` | `save_color` | Guardar registro por ID |
| GET `/budgets` | `list_budgets` | Presupuestos y snapshot si existe |
| POST `/budget` | `save_budget` | Guardar presupuesto por ID |
| POST `/budget/delete` | `delete_budget` | Borrar presupuesto por ID |
| GET `/articles/meta` | `articles_meta` | Versión central, fecha, cantidad y clave configurada sí/no |
| GET `/articles` | `list_articles` | Maestro de la última publicación completa |
| POST `/articles` | `save_articles` | Publicar lista con `articles`, `expected_version`, `upload_id`, `token` |

Apps Script acepta las mismas acciones por POST JSON en `text/plain`; por GET acepta `ping`, `colors/list_colors`, `budgets/list_budgets`, `articles/list_articles` y `articles_meta`.

Una publicación con el mismo `upload_id` y los mismos artículos devuelve la versión ya publicada. El mismo ID con otros datos se rechaza. `expected_version` debe coincidir con la última versión central para evitar sobrescribir una publicación simultánea. La clave protege las publicaciones de artículos; las rutas históricas mantienen el modelo de acceso de la app anterior, sin introducir un login general en esta misión.

## Usar la lista central

1. En Parámetros → Importar CSV, elegir un maestro o aumento y revisar la vista previa. Aplicar la actualización local.
2. En Sincronización → Publicar lista central, ingresar la clave y revisar la publicación. Confirmar para guardar una nueva versión en Sheet.
3. En otro dispositivo, Sincronización → Consultar / Recibir desde Sheet. Revisar y aplicar la vista previa.
4. Cada dispositivo guarda su copia offline. La sincronización del maestro es explícita en esta versión; no se descarga automáticamente en segundo plano.

Para los COD existentes se cambian **ARTIC y PR_CON_IVA**. Se conservan PR_SIN_IVA y los campos tintométricos como en el importador de aumentos anterior; nuevos productos conservan las columnas del CSV aportado. No se recalculan precios de líneas ya guardadas. Aplicar una lista actualiza los precios por pulso desde los artículos de tintas del maestro, siguiendo el comportamiento previo; una fórmula histórica mantiene su snapshot de precios.

Cuando el dispositivo ya eligió un maestro local o de Sheet, la actualización automática del CSV empaquetado no lo reemplaza en el siguiente inicio. Los CSV de clientes y recetas siguen disponibles como antes. Las recetas permanecen en memoria y Cache Storage; no se duplican en localStorage.
