> Referencia conservada del circuito de lista central v0.11.2. Para instalar esta entrega v0.11.3, seguir README.md. Esta entrega no requiere actualizar backend.

# Pancko Gestión v0.11.2 — Gestionar lista de precios

Entrega completa sobre v0.11.1. Conserva el shell de escritorio y la experiencia móvil. Esta misión reúne la gestión del catálogo, agrega nombres/fechas y una vista legible en Google Sheets. No agrega operaciones económicas.

## Qué instalar

1. **Apps Script:** reemplazar el código del proyecto actual por `backend/Pancko_AppsScript_v0.11.2.gs`, completo. Guardar y actualizar la implementación existente a una nueva versión, conservando su URL. Ver `BACKEND_v0.11.2.md`.
2. **Worker:** no necesita reemplazarse si ya funciona la lista central con v0.11.0. El archivo completo incluido es idéntico al anterior. Que `/ping` del Worker siga mostrando 0.11.0 es correcto.
3. Descomprimir el ZIP. Subir/reemplazar **su contenido en la raíz del repo**, sin una carpeta envolvente: `index.html`, `sw.js`, `manifest.webmanifest`, `assets/` y `data/`. Conservar otros archivos propios. La carpeta `backend/` es la entrega del código para copiar manualmente en Apps Script/Worker: subirla al repo no actualiza esos servicios.
4. Abrir Pancko con conexión, dejar descargar la actualización, cerrar todas sus pestañas/ventanas instaladas y volver a abrir. Repetir en PC y celular. Debe verse v0.11.2. No borrar los datos del sitio: contienen información local.

No se interactuó con GitHub ni se publicó o modificó la Sheet real durante esta misión.

## Dónde está cada cosa

**Parámetros / Datos → Gestionar lista de precios** contiene estado, nombre de lista, importación maestro, actualización sólo precios, publicación/recepción central, exportación full, recetas, precios por pulso y registro local de operaciones.

Sincronización mantiene estado de red, presupuestos/colores pendientes, reintento y PWA. Sólo tiene un acceso secundario a Gestionar lista de precios; no duplica el formulario central.

## Nombre y fecha de implementación

Antes de importar o publicar, ingresar un nombre, por ejemplo **Lista nº 73**. No se exige numeración correlativa: el identificador técnico sigue siendo único aunque se repita el nombre.

- Al aplicar un CSV o una recepción de Sheet se registra automáticamente la fecha y hora en ese dispositivo. Ésa es su fecha de implementación local.
- Al publicar se registra automáticamente la fecha y hora del servidor. El nombre y esa fecha viajan al recibir desde otro dispositivo.
- Publicación y aplicación pueden ocurrir en fechas distintas. Las pantallas las distinguen; las fechas se guardan como ISO y se muestran con horario de Argentina.
- El registro local conserva las últimas 100 operaciones y muestra las 10 más recientes. Las publicaciones centrales mantienen su historial en Sheet.
- No se inventan nombres ni fechas para catálogos anteriores. Aparecen como “Sin nombre registrado” / “Sin registrar” hasta la siguiente operación que los registre.
- Publicar con otro nombre no renombra retroactivamente la lista aplicada localmente ni cambia su fecha. El estado central muestra el nombre publicado.

## Qué hace cada modo

| Operación | Códigos existentes | Códigos nuevos | Ausentes |
|---|---|---|---|
| Importar maestro completo | Combina por COD; reemplaza todos los campos presentes en el CSV, incluyendo tintometría | Incorpora todos los campos | Conserva |
| Actualizar sólo precios | Actualiza ARTIC y PR_CON_IVA; conserva las demás columnas | Incorpora los datos disponibles | Conserva |
| Publicar en Sheet | Actualiza ARTIC y PR_CON_IVA del maestro central; conserva su tintometría | Incorpora el artículo completo | Conserva |
| Recibir desde Sheet | Actualiza ARTIC y PR_CON_IVA locales; conserva la tintometría local | Incorpora el artículo completo | Conserva |

En maestro completo, un campo presente pero vacío reemplaza el anterior con vacío; un campo omitido no lo borra. La revisión advierte el cambio de configuración y cuenta los productos afectados. No existe reemplazo destructivo del catálogo ni eliminación automática por omisión.

Se admiten encabezados Pancko y aliases de proveedor como `Artículo`, `Descripción`, `P. C.F.`. La importación de artículos valida códigos repetidos, campos requeridos, precios y estructura del CSV, y admite campos entre comillas, comillas escapadas y saltos de línea. Los campos adicionales se conservan. Las filas totalmente en blanco se ignoran; las filas con delimitadores pero sin datos se rechazan.

**La sincronización central sigue en modo sólo precios.** No se agregó selector central de maestro completo: actualizar localmente un factor o una base de un código que ya existe en Sheet no propaga ese cambio a otros dispositivos. Esta limitación se muestra en pantalla para mantener el circuito central ya probado.

## Primera operación con esta versión

Si el catálogo local actual es correcto, se puede publicar directamente, sin reimportar: ingresar nombre y clave → Revisar publicación → Publicar en Sheet. Se publica el catálogo local completo, combinado con el central según las reglas anteriores.

En otro dispositivo: Consultar / Recibir desde Sheet → revisar → Aplicar en este dispositivo. La recepción es manual y no pide clave. El nombre llega desde Sheet. El botón de sincronización de pendientes no descarga el catálogo automáticamente.

Publicar no reemplaza el catálogo local por la combinación central. Si la Sheet conserva códigos que este dispositivo no tiene, recibirla después para incorporarlos. La información central del estado corresponde a la última consulta, no a una vigilancia automática.

## Hojas

| Hoja | Función |
|---|---|
| articulos_versiones | Índice técnico de publicaciones; mismas seis columnas anteriores |
| articulos_maestro | Base técnica versionada usada por la app; mismas columnas version / COD / articulo_json |
| articulos_metadatos | Nueva: nombre y fecha de publicación vinculados a version |
| lista_precios_actual | Nueva: vista humana filtrable de la lista vigente, con columnas normales, nombre y fecha |

Las dos hojas nuevas se crean al publicar. Las lecturas no crean ni reescriben hojas. La vista legible se reemplaza con cada publicación, sin acumular versiones antiguas; el historial sigue en el maestro técnico. Editar manualmente la vista no actualiza la app y esos cambios se reemplazarán al regenerarla.

## Qué se conserva

Presupuestos guardados y en curso, líneas, historial, snapshots, fórmulas, factores guardados, etiquetas, A4, ticket, WhatsApp, clientes, latas en espera y el cálculo tintométrico. Los productos agregados después de aplicar una actualización usan el nuevo catálogo. Los precios por pulso reconocidos en artículos se actualizan al aplicar, como antes, para cálculos posteriores.

El paquete conserva byte a byte los CSV originales de la base v0.11.1: **3998 artículos** y las recetas/clientes existentes. No se descargó una copia de tu Sheet real. Un dispositivo que ya recibió **4270 artículos** los conserva al actualizar la app; uno nuevo puede recibirlos manualmente de Sheet. La versión del CSV del repositorio no se incrementó para evitar reemplazar listas instaladas.

## Validación y límites

Detalle y resultados en `VALIDACION.md`, `VALIDACION_RESUMEN.json` y `CHANGELOG.md`. Se probaron los flujos con el código real de frontend, Worker y Apps Script, usando DOM, red, caché y Sheets simulados; se generaron A4/ticket/etiqueta con canvas real. No se verificó esta entrega en un Chrome/Android real ni contra tu backend desplegado, ni con impresión física o compartir nativo. No se presenta esa simulación como prueba de producción.

La estructura responsive fue revisada a ocho anchos y conserva el umbral de escritorio de 1024 px. El entorno no dispone de un ejecutable Chromium/Chrome para la comprobación visual real. No se probó el ciclo de actualización de una PWA instalada real.

Límites vigentes: 15000 artículos por catálogo; revisión muestra hasta 20 cambios; registro local de 100 operaciones; cuotas/tiempos de Google Apps Script no medidos en producción. Un fallo exclusivo del espejo se avisa y no invalida la publicación técnica. Las fechas de aplicación local dependen del reloj del dispositivo.
