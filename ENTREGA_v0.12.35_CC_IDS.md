# Pancko Gestión Cañada v0.12.35 · Cuenta Corriente

**Diagnóstico de la captura:** la PC recibió saldo y movimiento de Municipalidad, pero la pantalla mostraba `Hay clientes sin ID o con ID duplicado` y bloqueaba el detalle de **todos**. Ese bloqueo global impedía abrir incluso fichas con ID único. No se conoce todavía cuál o cuáles clientes del dispositivo tienen el ID defectuoso.

**Cambio:** CC enumera las fichas defectuosas y protege sólo esas. Las fichas con ID único vuelven a abrir y permiten movimientos, sujeto a las validaciones existentes. Los importes ambiguos quedan fuera del total agregado para no sumarlos dos veces. No se renumeran IDs ni se mueven deudas. El acceso al detalle, alta y anulación de una ficha con ID ambiguo permanece bloqueado.

**Prevención:** en la actualización del CSV de clientes, los nombres duplicados ya no reutilizan el mismo ID previo en varias filas; la asignación es uno a uno y prefiere CUIT coincidente. Los duplicados ya presentes no se reparan a ciegas.

**Qué subir:** el contenido completo de `pancko-integral-main/` a la raíz de `pancko-integral`, incluido el `data/clientes.csv` y el `data/recetas.csv` del paquete. No cargar CSV aparte. Worker y Apps Script v0.12.31 quedan como estaban. No se modifica Sheet.

**Prueba:** abrir CC en la PC, buscar Municipalidad de Cañada de Gómez y abrirla. Comparar saldo y movimientos con el celular. Si esa ficha aparece deshabilitada con `ID ambiguo`, exportar respaldo de CC y compartir diagnóstico antes de cualquier corrección de IDs. Probar otro cliente válido.

**Pruebas locales:** las 11 pruebas Node pasan, incluida una nueva con clientes de ID duplicado ajenos y una ficha única seleccionada. No se probó en los dispositivos ni con la Sheet real.
