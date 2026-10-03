> Documento histórico. Para v0.12.18 usar SEGURIDAD_ENDPOINTS_v0.12.18.md; las claves separadas ya no son la configuración vigente.

# Backend de lista de precios — v0.11.2

## Actualización manual de Apps Script

1. Abrir el proyecto existente que usa Pancko (cuenta indicada por Tincho: pancko1976@…).
2. Reemplazar el código anterior completo por `backend/Pancko_AppsScript_v0.11.2.gs`. No pegarlo debajo de la versión previa ni dejar funciones/constantes duplicadas en otro archivo del proyecto. Guardar.
3. Mantener `SHEET_ID`, la propiedad `PANCKO_ARTICLES_TOKEN` y la configuración de acceso existentes. No cambiar la clave si la publicación ya funciona.
4. En **Implementar → Administrar implementaciones**, seleccionar la implementación actual, editar y elegir **Nueva versión**, luego implementar. Actualizar la misma implementación conserva la URL que usa el Worker. Guardar el código sin actualizar la versión implementada no actualiza la API pública.
5. No hace falta modificar Worker: `Pancko_Worker_v0.11.0.mjs` se entrega íntegro y sin cambios.

Referencia oficial para actualizar implementaciones: https://developers.google.com/apps-script/concepts/deployments

Frontend nuevo con backend anterior permite seguir recibiendo el catálogo; impide publicar con nombre hasta actualizar Apps Script, para que el nombre no se pierda silenciosamente. El backend nuevo sigue aceptando y entregando datos a clientes v0.11.1.

## Clave

En Configuración del proyecto → Propiedades de la secuencia de comandos debe existir `PANCKO_ARTICLES_TOKEN`. Su valor es la clave privada de publicación elegida por el responsable. No es la contraseña de Google. Si ya estaba configurada, se conserva al reemplazar el código. No se incluye ninguna clave en el ZIP.

## Endpoints existentes, sin rutas nuevas

| Worker | Acción GAS | Función |
|---|---|---|
| GET /articles/meta | articles_meta | articlesMeta_() |
| GET /articles | list_articles | listArticles_() |
| POST /articles | save_articles | saveArticles_(payload), bajo withLock_() |

Worker envía POST JSON con Content-Type text/plain a la implementación GAS. La URL y las rutas históricas de presupuestos/colores se conservan.

GET meta y artículos agregan `list_name`, `catalog_metadata_supported: true` y `publication_mode: "prices"`. Conservan `version`, `count`, `updated_at` y `publish_configured`. POST agrega `list_name` y `catalog_metadata_version: 1`; conserva articles, token, expected_version y upload_id. El nombre es obligatorio para clientes que declaran ese contrato. Clientes anteriores pueden publicar sin nombre, con compatibilidad explícita.

La respuesta de publicación devuelve nombre, fecha y `mirror_ok`. Si falla sólo el espejo, devuelve ok:true y mirror_ok:false con mirror_warning. El maestro ya está publicado y puede recibirse; la app muestra la advertencia. Un reintento con el mismo ID no duplica la publicación ni cambia su fecha. Si ya existe una versión posterior, nunca se regenera el espejo con la versión antigua.

## Estructuras

- `articulos_versiones`: version, upload_id, hash, cantidad, created_at, estado. Sin cambios.
- `articulos_maestro`: version, COD, articulo_json. Sin cambios. Guarda los artículos de cada publicación histórica.
- `articulos_metadatos`: version, nombre_lista, publicada_el. Nueva, mantiene nombre y fecha por publicación sin alterar el índice histórico.
- `lista_precios_actual`: COD, ARTIC, PR_CON_IVA, usa_tinto, tipo_tinto, base_tinto, base_fisica_tinto, factor_envase_tinto, ajuste_formula_tinto, factor_tinto, litros_reales, kilos_reales, unidad_detectada, confianza_tinto, regla_tinto, observacion_tinto, Artículo, Descripción, P. C.F., campos adicionales encontrados (incluido PR_SIN_IVA cuando existe), nombre_lista, version, updated_at.

Se preservan códigos con ceros iniciales; la columna PR_CON_IVA tiene formato numérico; encabezado fijo y filtro. Textos que podrían parecer fórmulas se escriben como texto literal. Cada fila contiene el nombre y fecha de la versión publicada. No incluye fechas de recepción de otros dispositivos: esas fechas se registran localmente en cada uno.

Las nuevas hojas se crean al publicar; consultar no crea hojas. Las hojas técnicas existentes no se migran ni se alteran sus encabezados. Si una hoja técnica poblada carece de encabezados necesarios se informa error. Si `lista_precios_actual` ya existe con otra estructura, se conserva y se informa que no pudo regenerarse.

## Generar o reparar la vista de la lista ya publicada

La función completa `reconstruirListaPreciosActual()` puede ejecutarse manualmente en el editor después de actualizar Apps Script. Lee la versión técnica vigente y genera/repara sólo la vista legible. No publica otra versión, no cambia presupuestos y no requiere volver a subir artículos.

Es opcional: la próxima publicación desde la app también genera la vista. Para una publicación histórica sin nombre, se muestra el nombre vacío y se conserva su fecha real; no se inventa “Lista nº 73”. Para registrar ese nombre, publicar una nueva versión desde la app.

No ejecutar `prepararPanckoGestion()` para esta misión. Se conserva por compatibilidad, pero las hojas económicas no son necesarias. No hay cambios en los manejadores de presupuestos, colores, remitos, cuenta corriente, cobros o cheques.

## Orden de escritura y recuperación

Se valida clave, nombre, datos, ID y versión esperada bajo bloqueo. Se guarda el maestro de la nueva versión y sus metadatos; recién entonces se registra la publicación en articulos_versiones. Si falla antes de ese registro, las lecturas siguen entregando la versión anterior. Un reintento con el mismo ID reconstruye la carga incompleta.

Después del registro se genera el espejo con una escritura de tabla que incluye encabezados, filas y vaciado del excedente. No se vacía la hoja antes de tener la tabla preparada. Sheets no ofrece una transacción entre todas las hojas: por eso un fallo del espejo se informa aparte, y se puede reconstruir. El mecanismo de versión técnica sigue siendo la autoridad de sincronización.
