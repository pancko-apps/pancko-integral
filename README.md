# Pancko Gestión v0.12.24 · Cañada · Comandas locales

ZIP completo para subir manualmente el contenido a la raíz del repo `pancko-integral` cuando decidas publicarlo. Conserva las 17.144 recetas de v0.12.23, incluida GPPTR. `index.html` debe quedar en la raíz. No se publicó ni modificó producción durante esta entrega.

Comandas: pantalla accesible desde el lateral PC y la tarjeta móvil. Carga rápida, catálogo o texto libre; cantidades exactas o pedido genérico; mensaje por WhatsApp sin destinatario fijo; historial y modelos locales. Guardar una comanda sólo escribe las tres claves `pk_comandas_history_v1`, `pk_comandas_models_v1`, `pk_comandas_draft_v1`. No sincroniza entre dispositivos.

La clave de borrador recupera la comanda en curso tras cerrar la app. Una comanda guardada se puede reenviar sin duplicarla. El historial permite recibir, anular y duplicar. Los modelos son copias independientes y editables al cargarlos. No afectan stock, caja, CC, presupuestos ni tintometría.

Para probar: abrir Comandas en PC o móvil, ingresar `rec int mate bl 6x1 + 4x4 + 3x10 + 3x20`, verificar cuatro COD; ingresar `recumix int 1,25 y 5 kg`, verificar dos COD; ingresar `Tinta B` y editar el pedido; guardar, enviar, reabrir historial, marcar recibida, duplicar, guardar/usar modelo. Una frase dudosa debe quedar libre. Hacé copia de los datos locales antes de limpiar almacenamiento del navegador.

El código del parser y flujo local se probó con el catálogo real. La revisión visual de la UI a tamaños PC y móvil queda pendiente de prueba en navegador: el navegador de ejecución bloqueó la URL local. Hay reglas responsive específicas para 650 px y menores.
