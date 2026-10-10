# Pancko Gestión · Cañada producción · v0.12.36

## Qué subir
Descomprimí este ZIP y reemplazá el contenido del repo `pancko-integral` con los archivos incluidos, respetando las carpetas. Incluye `data/recetas.csv` completo (17.191 filas; 21 SPECIAL de Microcemento en pasta). No subas los ZIP anteriores encima. No hace falta cambiar Worker, Apps Script ni Sheet.

## Cambios
- Editor de artículos: conserva todos los campos tintométricos aunque sólo se cambie el precio o la descripción.
- Permite elegir tintable/no tintable, base PASTEL/TINT/DEEP/ACCENT y factor del artículo sobre la receta patrón de Recuplast Interior Mate 1 L. Acepta coma decimal. Factor 1 aplica el patrón tal cual; 0,75 aplica 75 % de sus pulsos con redondeo normal de 0,125.
- Las familias SPECIAL conservan su configuración propia.
- El CSV completo de recetas contiene las 46 filas nuevas verificadas del paquete LAB.

## Importante sobre el catálogo
Editar un artículo guarda el cambio en este dispositivo. Para compartir esa configuración con otros dispositivos hay que publicar/recibir el catálogo central mediante el flujo existente, con revisión previa. No se publica ni sincroniza por sí solo. Una edición local marca el catálogo de este equipo como local y evita que un CSV del repo lo reemplace sin pasar por la importación del maestro.

## Comprobación rápida
En Artículos buscá `ACRILPLAST IE BLANCO 1 LTS` (COD 82010993), editá sin cambiar precio y verificá que siga tintable. En un artículo no tintable activá la opción, elegí PASTEL y probá 0,75; guardá y consultá la fórmula en Presupuestos. Verificá el producto/envase y los pulsos en la vista previa. Las recetas especiales mantienen su patrón propio.

## Entorno
Producción Cañada; frontend GitHub Pages `pancko-integral`; Worker/Apps Script/Sheet actuales sin cambios; sincronización actual sin cambios; Bridge sin cambios. Este ZIP contiene sólo el frontend necesario y este README.
