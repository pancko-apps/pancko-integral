# Pancko Gestión Cañada v0.12.34

**Cambio:** el botón «Nueva fórmula / Mis fórmulas» está en el encabezado de Tintométrico, entre el título y los accesos Inicio/Presupuesto. Se eliminó la barra completa que ocupaba una fila. Preparación y resultado vuelven a comenzar debajo del encabezado, en dos columnas en escritorio. En móvil el botón mantiene ancho completo.

La fórmula propia y su sincronización confirmada por Tincho en v0.12.33 no cambian. No se modificaron Worker, Apps Script, Sheet, recetas.csv ni Caja.

**Qué subir:** descomprimir y subir el contenido de `pancko-integral-main/` a la raíz del repo `pancko-integral`. Es un frontend completo, con el mismo `data/recetas.csv` del paquete anterior. No subir CSV adicional. Los archivos de backend v0.12.31 se incluyen sólo como referencia; si ya sincroniza, no hay que volver a desplegarlos.

**Pruebas:** diez pruebas locales de las reglas existentes pasaron; verificación estática del HTML. La colocación final queda pendiente de revisión visual en la PC y el celular del usuario.
