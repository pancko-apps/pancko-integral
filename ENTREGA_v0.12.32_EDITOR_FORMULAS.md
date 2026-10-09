# Pancko Gestión Cañada v0.12.32 · Editor de fórmulas

**Estado:** ZIP preparado. No se publicó ni se modificó producción. Frontend completo basado en v0.12.31.

## Cambios

- Tintométrico abre **Nueva fórmula / Mis fórmulas** en una pantalla propia; ya no despliega el editor sobre Laboratorio. Volver al laboratorio conserva la preparación.
- Alta NORMAL inicial; SPECIAL se elige explícitamente. Mis fórmulas guardadas se abre a pedido y lista sólo recetas propias por defecto. La casilla “Incluir fórmulas SPECIAL del catálogo” permite buscarlas si hace falta editarlas.
- Colorantes: una fila por tinta, selector de las tintas Pancko, campo numérico textual para pulsos (acepta coma decimal), agregar/quitar fila. Vista previa muestra el patrón antes del guardado. El formato `C=3 | KX=0.5` queda como dato interno compatible con el cálculo anterior.
- Crear desde preparación, edición, factores de envase, validación NORMAL/SPECIAL y sincronización usan la lógica de v0.12.31. No se modificaron Caja, Presupuestos, Worker, Apps Script, Sheet ni recetas.csv.

## Qué subir

**Si todavía no desplegaste v0.12.31:** primero instalar `backend/Pancko_AppsScript_v0.12.31.gs` en el Apps Script existente y `backend/Pancko_Worker_v0.12.31.mjs` en el Worker existente. Mantener URL GAS y secretos configurados. Verificar que ambos informan 0.12.31 al probar conexión. Después subir el **contenido** de `pancko-integral-main/` a la raíz del repo `pancko-integral` (index.html en raíz).

**Si v0.12.31 ya quedó desplegada y Probar conexión confirma ambos backends:** sólo subir el contenido de `pancko-integral-main/` a la raíz del repo. No volver a tocar Worker ni Apps Script para este cambio de UX.

No subir ningún CSV separado ni tocar Sheet manualmente. Actualizar la PWA y verificar v0.12.32 en pantalla. El backend seguirá diciendo 0.12.31: eso es correcto.

## Prueba

1. En Tintométrico abrir Nueva fórmula; comprobar pantalla propia, NORMAL inicial y lista de especiales oculta.
2. Código nuevo, descripción, base y patrón 1 L. Agregar C=3 y KX=0,5 en filas separadas; ver patrón y guardar.
3. Reabrir Mis fórmulas, editar una propia. Abrir SPECIAL de forma explícita y validar familia/COD.
4. Desde una preparación de laboratorio crear fórmula nueva: confirmar que copia las tintas y el factor del envase.
5. Confirmar en otro dispositivo la sincronización una vez publicado el backend v0.12.31.

**Pruebas locales realizadas:** diez pruebas Node previas de receta NORMAL/SPECIAL, sincronización simulada y módulos relacionados pasaron; `node --check` del editor pasó. No se pudo hacer prueba visual en navegador ni prueba real en celular/Sheet desde este entorno.
