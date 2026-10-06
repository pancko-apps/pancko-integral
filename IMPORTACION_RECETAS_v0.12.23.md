# Ficha de entrega · v0.12.23

| Campo | Destino |
|---|---|
| Entorno / comercio | Producción / Cañada, **paquete preparado, no publicado** |
| STORE_ID | CDG (metadato de origen; no se implementa router) |
| Frontend | Repo estable `pancko-integral` al publicar manualmente |
| Worker / Apps Script / Sheet / tokens | Sin cambios |
| Sync | Configuración existente; este paquete no la altera |
| Bridge | Sin cambios; URL de producción no habilitada por esta entrega |
| Dominios de extensión | Sin cambios; no se incluye extensión |
| ZIP | `Pancko_Gestion_CANADA_PROD_RECETAS_v0.12.23_COMPLETO.zip` |
| CSV | `data/recetas.csv` (también entregado separado) |

## Datos añadidos

- Se conservaron exactamente las 16.958 filas previas del CSV.
- Se anexaron 109 recetas comunes del exportable `recetas_normales_nuevas.csv`, sin duplicados de clave base/ID/código.
- Se anexaron 76 recetas SPECIAL marcadas `ESPECIAL_OK` del exportable `recetas_especiales_nuevas.csv`: FERROXIN 23, PERLADO 15, GRESS_PLATA 13, ALUMINIO 9, GRESS_GRAFITO 9 y OLD_OLDEST 7. La familia, COD patrón, contenido, unidad, colorantes y pulsos fueron validados.
- No se usó `recetas(2).csv` como base, porque cambia una receta histórica además de sumar las 109 filas.
- Se agregó además GPPTR (PASTEL, IdFormula 241632, «Gris perla mod Patria», AXX=1.25 | B=2.5 | C=5 | D=7.5) con los datos comprobados por Tincho en la sesión oficial y la descarga R15. No venía en los exportables nuevos.

## Pulsos SPECIAL

SPECIAL conserva los pulsos decimales del patrón (por ejemplo `F001`, `KX=0.03`). Al escalar a otro envase se conserva hasta seis decimales; NORMAL sigue con pasos de 0,125. La edición y reapertura de recetas SPECIAL mantienen esos decimales. El costo sigue usando los precios locales por pulso. No se modificaron los pulsos de los archivos fuente.

## Publicación manual y control

1. Guardar copia del CSV viejo y respaldo de datos locales en los dispositivos.
2. Subir el **contenido completo** del ZIP al repo cuando se decida publicar; sustituir `data/recetas.csv` junto con `index.html`, `sw.js`, `data/version.json` y los assets. El nuevo identificador de `data/version.json` fuerza a recargar el CSV aunque el dispositivo haya visto v0.12.22. En versiones anteriores a v0.12.22, publicar sólo el CSV haría que los pulsos SPECIAL diminutos se redondeen a cero.
3. Abrir la app y comprobar `v0.12.23` en el lateral. Verificar una receta común nueva, un SPECIAL del patrón y `F001` con `KX=0.03`, además de un envase mayor.
4. Guardar y reabrir un registro y un presupuesto con SPECIAL; comprobar pulsos y costo. Verificar también una receta NORMAL preexistente y otra de las 109 nuevas y GPPTR.
5. Si ya existen recetas manuales locales con la misma clave, la versión manual sigue teniendo prioridad; revisar cada dispositivo por separado antes de borrar nada.

Ningún repositorio remoto, Sheet, Apps Script, Worker ni extensión se modificó.
