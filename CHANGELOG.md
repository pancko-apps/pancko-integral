# CHANGELOG — Pancko Gestión v0.11.2

Fecha de entrega: 30/09/2026. Base: v0.11.1. App y caché v0.11.2; Apps Script v0.11.2; Worker v0.11.0 conservado.

## UX

- “Gestionar lista de precios” reemplaza Importar datos/CSV dentro de Parámetros / Datos.
- Estado local y central separados: cantidades, origen, nombre, versiones, fecha aplicada, publicación, recepción y última consulta.
- Bloques de maestro completo, sólo precios, Sheet central, exportación y tintométrico relacionado.
- Sincronización conserva red, pendientes y PWA; el catálogo queda accesible por un enlace secundario.
- Cards en columnas en PC y una columna en móvil, dentro del shell existente.

## Nombre y fecha

- Nombre requerido antes de importar/publicar; ejemplo Lista nº 73.
- Fecha y hora automáticas al aplicar localmente, tanto CSV como recepción de Sheet.
- Nombre y fecha de publicación persistidos en Sheet, asociados a la versión y entregados a otros dispositivos.
- Registro local de últimas 100 operaciones; vista de las últimas 10. No se inventan datos para versiones antiguas.

## Importación y exportación

- Se corrige la ambigüedad anterior: los dos importadores ya no hacen lo mismo.
- Maestro completo combina todos los campos suministrados por COD, incluyendo configuración tintométrica. Campos vacíos presentes reemplazan; omitidos se conservan. No elimina ausentes.
- Sólo precios actualiza ARTIC / PR_CON_IVA; conserva tintometría y demás campos existentes; agrega códigos nuevos y conserva ausentes.
- Vista previa con conteos y hasta 20 cambios, más aviso de modificaciones de configuración en maestro completo.
- Parser de artículos admite campos CSV con saltos de línea y comillas escapadas, aliases del proveedor y decimales locales. Rechaza estructura incompleta, códigos duplicados y precios inválidos.
- Exportación full conserva todas las columnas, ahora también PR_SIN_IVA cuando existe, y usa el nombre de lista en el nombre del archivo. No agrega metadatos de lista como si fueran productos.
- Protección ante cambios del catálogo durante una revisión y rollback de la escritura local si falta espacio antes de activar los datos nuevos.

## Centralización

- Se conserva el modo central de sólo precios ya validado por Tincho. No se implementa propagación central de tintometría en códigos existentes ni eliminación central de ausentes.
- `articulos_versiones` sigue siendo el índice con sus seis columnas originales.
- `articulos_maestro` sigue siendo el maestro técnico versionado con JSON por artículo.
- Nueva `articulos_metadatos`: nombre y fecha por versión.
- Nueva `lista_precios_actual`: espejo legible y filtrable de la versión vigente. Incluye columnas Pancko, extras, nombre, versión y fecha; no acumula publicaciones viejas.
- No hay endpoints nuevos. Se agregan campos compatibles a las rutas existentes /articles y /articles/meta.
- Reintentos preservan ID/fecha y no revierten el espejo a versiones viejas. Fallos del espejo se avisan sin invalidar el maestro técnico; se agrega reconstruirListaPreciosActual() para recuperación manual.
- No se crean hojas desde una lectura; no se cambia la estructura de presupuestos/registros_colores ni del maestro/índice.

## Archivos

Modificados: index.html; assets/gestion.js; assets/gestion.css; sw.js; data/version.json; textos de versión en assets/desktop-shell.js y assets/desktop-shell.css; README.md; CHANGELOG.md; VALIDACION.md e informes de validación/checksums.

Backend completo actualizado: backend/Pancko_AppsScript_v0.11.2.gs. Documentación nueva: BACKEND_v0.11.2.md. Worker completo sin cambios: backend/Pancko_Worker_v0.11.0.mjs. Se retira del ZIP el Apps Script anterior para evitar pegar la versión equivocada.

Sin cambios de contenido: data/articulos.csv, data/clientes.csv, data/recetas.csv, manifest.webmanifest e iconos. Sin cambios del cálculo tintométrico ni de los manejadores económicos.

## Pruebas, límites e instalación

Pruebas ejecutadas y límites reales en VALIDACION.md. Pasos para subir el contenido del ZIP y renovar PWA en README.md. Pasos para actualizar la implementación de Apps Script en BACKEND_v0.11.2.md. No se publica GitHub, Worker, Apps Script ni se modifica la Sheet real desde esta entrega.

Limitaciones: central sólo precios; espejo generado no editable como canal de actualización; recepción manual; 15000 artículos; revisión de 20 cambios; historial local de 100 operaciones; fechas locales dependen del reloj del dispositivo. Sin prueba visual en Chrome/Android real, impresión física, compartir nativo ni backend productivo. Los CSV incluidos conservan la base original; los 4270 artículos ya recibidos permanecen en el almacenamiento de cada dispositivo.
