# Pancko Gestión v0.12.26 · Cañada · Comandas compactas en móvil

ZIP completo para reemplazo manual del frontend de `pancko-integral`. Incluye Caja v0.12.25 sin cambios funcionales, Comandas con lista compacta móvil y las 17.144 recetas previas. `index.html` queda en la raíz del repo. No se publicó durante esta entrega.

En pantallas de hasta 650 px, Comandas enseña una fila por ítem con producto y cantidad/pedido. Tocarla despliega los cinco campos de edición y Eliminar; tocar otra cierra la anterior. La carga rápida y búsqueda están arriba; la lista, abajo. En PC se conserva el formulario abierto por ítem. El borrador, historial, modelos, parser y formato WhatsApp mantienen las mismas claves locales: `pk_comandas_draft_v1`, `pk_comandas_history_v1`, `pk_comandas_models_v1`. No hay migración de datos.

Pruebas: el test de Comandas genera 20 líneas y comprueba que inicialmente ninguna está abierta, sólo una puede expandirse, el resumen se actualiza al editar y se vuelve a cerrar. También pasan los tests anteriores de Caja, recetas, presupuestos y Comandas. El navegador de la ejecución bloquea la URL local, así que la comprobación visual en celular real queda pendiente de hacer tras subir el paquete.

Worker, Apps Script, Sheet, tokens, sync de otros módulos y extensión: sin cambios.
