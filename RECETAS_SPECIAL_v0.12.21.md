# Recetas SPECIAL · Pancko Gestión v0.12.21

## Alcance y publicación

Esta entrega parte del ZIP estable v0.12.18 de Cañada. El ZIP incluye frontend y datos estáticos completos. No cambia ni despliega Worker, Apps Script ni Sheet. Los archivos `backend/` son copias sin cambios del paquete anterior. No se añadió ninguna receta SPECIAL real. El encabezado de `data/recetas.csv` tiene columnas opcionales nuevas; sus 16.958 filas históricas conservan sus bytes.

La app obtiene recetas desde **`data/recetas.csv` publicado en el mismo sitio**. La Sheet central actual no alimenta ese archivo. Una fila puesta sólo en una Sheet no se verá en Pancko. Para compartir colores entre dispositivos, añadir la fila al CSV publicado y actualizar el identificador `recetas` en `data/version.json` antes de subir el sitio. Si se usa un CSV de reemplazo en Parámetros, incluir también las filas SPECIAL: esa importación sustituye la colección en memoria hasta recargar la página.

## Formato

Encabezado completo:

```csv
base,id_formula,idcolor,descripcion,formula_1l,tipo_receta,familia_especial,articulo_patron_cod,articulo_patron_descripcion,contenido_patron,unidad_patron,codigo_formula,formula_pulsos,source,activo,observaciones
```

Las recetas de cinco columnas existentes tienen `tipo_receta=NORMAL` implícito. No es necesario ampliarlas. En una fila SPECIAL, `base` debe ser `SPECIAL:FAMILIA`; `id_formula`, `idcolor` y `codigo_formula` llevan el código del color; `formula_1l` va vacío; `formula_pulsos` representa los pulsos para el artículo patrón real; `activo` admite `SI` o `NO`. El COD, contenido y unidad patrón deben corresponder exactamente al mapeo de abajo. El editor genera la fila con comillas CSV para copiarla.

Ejemplo **ficticio**, únicamente para probar el formato. No representa una fórmula del fabricante:

```csv
"SPECIAL:PERLADO","TPER001","TPER001","Perlado prueba","","SPECIAL","PERLADO","89450983","HIDROESMALTE PERLADO 0.91 LTS","0.91","L","TPER001","C=3 | KX=0.5","pancko_manual","SI","Prueba ficticia"
```

No agregues ese ejemplo a producción salvo que quieras conservar una receta de prueba. Cada código y patrón debe ser único dentro de su familia; si se edita una receta publicada, **reemplazar** la fila anterior en vez de duplicarla. El editor guarda en `localStorage` del navegador; al cambiar familia, código o patrón de una receta ya publicada, también conserva una exclusión local de la clave vieja. Al publicar el CSV, hay que sustituir o quitar la fila vieja para el resto de dispositivos.

| Familia | COD patrón pequeño | Contenido | COD grande | Contenido | Escala |
| --- | --- | --- | --- | --- | --- |
| PERLADO | 89450983 | 0.91 L | 89450984 | 3.62 L | 3.62 ÷ 0.91 |
| ALUMINIO | 89459003 | 0.91 L | 89459004 | 3.62 L | 3.62 ÷ 0.91 |
| FERROXIN | 44519053 | 0.940 L | 44519054 | 3.760 L | 4 |
| GRESS_PLATA | 89395004 | 4 KG | 89395007 | 20 KG | 5 |
| GRESS_GRAFITO | 89396004 | 4 KG | 89396007 | 20 KG | 5 |
| OLD_OLDEST | 80371003 | 1 L | 80371004 | 4 L | 4 |

También se puede guardar una receta contra el patrón grande; Pancko prioriza una receta cuyo `articulo_patron_cod` coincide con el artículo elegido. Si sólo existe la receta del otro envase de la **misma familia**, escala por contenido destino ÷ contenido patrón. Cada pulso resultante se redondea al paso 0.125 que ya usa Pancko. El costo usa el precio local de cada pulso.

## Uso manual

1. Desde la paleta de una línea del presupuesto, **Nueva fórmula para este producto** crea una receta para el COD elegido. Revisar el envase patrón y los pulsos, guardar la receta, verificar la vista previa y luego tocar **Guardar cambio** para aplicarla a esa línea. Vaciar Fórmula y salir del campo, presionar Enter o guardar la paleta vacía quita las tintas y devuelve el precio base.
2. En Tintométrico, desplegar **Nuevo color / Gestionar fórmulas SPECIAL**. Elegir SPECIAL, familia y artículo patrón; completar código, descripción y pulsos. Revisar contenido y unidad asociados al COD. Guardar para usarla offline en este navegador.
3. Para corregirla, buscarla en la lista del mismo panel, editar y guardar. Para suspenderla, desmarcar **Activa**. Gress Plata y Gress Grafito son opciones separadas.
4. Copiar la fila CSV. Añadirla al final de `data/recetas.csv` o reemplazar su fila previa. Aumentar el valor `recetas` de `data/version.json`, actualizar el ZIP del sitio y comprobar desde otro dispositivo. El ZIP entregado no incluye nuevas fórmulas reales.
5. Para un color NORMAL, elegir NORMAL, base y pulsos por 1 L. La receta nueva también queda local hasta publicar la fila.

Guardar un **registro de laboratorio** conserva la preparación y puede usar la sincronización existente de registros; no crea una receta reutilizable. El editor de recetas no envía nada a Worker o Sheet.

## Prueba controlada después de publicar

- Hacer respaldo del sitio y sus datos locales; subir **el contenido** del ZIP completo. Verificar la versión v0.12.21 y que las recetas normales existentes sigan apareciendo.
- Recuplast Interior Mate: una receta NORMAL compatible conserva factor y costo. Textura, Agreste, Profesional y Cremar: contrastar una preparación conocida con la versión anterior; Rústico/Base Revestimiento también.
- Crear una receta SPECIAL de prueba local por cada familia; verificar sus dos COD, contenido patrón, costo y pulsos. Intentar NORMAL 8300 en Perlado: debe rechazar. Intentar Gress Plata en Grafito: debe rechazar.
- Probar Presupuestos: sugerencia, paleta, vista previa, aplicación, guardado, reapertura y copia/salida. Confirmar que la línea mantiene pulsos, familia y artículo patrón en el snapshot.
- Probar Laboratorio: sugerencias por código/nombre, guardar registro, editar pulsos de una preparación. Crear y corregir receta en el editor; recargar desconectado y comprobar reutilización local.
- Publicar una fila de prueba deliberada en el CSV y cambiar `data/version.json`; verificarla desde un navegador limpio. Retirar o desactivar la fila de prueba si no corresponde.

Las pruebas de interfaz y sincronización con el sitio real quedan pendientes hasta esa publicación controlada; los tests incluidos comprueban los cálculos, segregación y persistencia local simulada. No se implementó importación desde R-Final ni sincronización de recetas con Sheet.
