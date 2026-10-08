# Pancko Gestión v0.12.28 · Cañada · Pulido Tintométrico y PWA

Ver `ENTREGA_v0.12.28.md` para cambios, instalación y pruebas.

# Pancko Gestión v0.12.27 · Cañada · Carga de Comandas

ZIP completo del frontend `pancko-integral` para reemplazo manual. `index.html` queda en la raíz del repo. No se publicó desde esta entrega.

En Comandas, Producto y Cantidad forman una sola carga. El buscador prioriza la coincidencia continua usada en Presupuestos y después encuentra fragmentos por palabra. Elegir una sugerencia sólo llena Producto y enfoca Cantidad; Agregar o Enter desde Cantidad crea la línea. X limpia Producto sin alterar la comanda ni la cantidad ya escrita. Se admite texto libre, números, `6x1`, `6*1`, `3x20lt`, `1 caja` y pedidos literales. La lista compacta móvil de v0.12.26 continúa y el editor se abre con un toque.

Los datos previos quedan en `pk_comandas_draft_v1`, `pk_comandas_history_v1`, `pk_comandas_models_v1`; no hay migración. Caja v0.12.25, Presupuestos, Tintométrico, Worker, Apps Script, Sheet, extensión y sincronización mantienen su comportamiento. La actualización de shell/PWA y su número de versión son necesarios para recibir el nuevo archivo de Comandas.

Las pruebas automatizadas cubren las cuatro búsquedas solicitadas, selección sin agregado, foco, cantidades y texto libre, además de los flujos previos. Revisar visualmente en el celular tras publicar; este entorno no puede abrir su instancia local en el navegador de prueba.
