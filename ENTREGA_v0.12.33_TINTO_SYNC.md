# Pancko Gestión Cañada v0.12.33

**Estado:** paquete preparado, sin despliegue. Frente v0.12.32 + corrección visual y estado de recetas.

## Causa comprobada

La captura muestra `Recetas propias locales: 1 · Pendientes: 1 · Configurá la Clave operativa para compartir · Sin clave operativa; cambios sólo locales.` El guardado local funcionó. No hubo petición autorizada de escritura central, por eso la Sheet no creó `recetas_personales`. La pestaña se crea al recibir la primera escritura válida en Apps Script v0.12.31.

## Cambios

- El botón Nueva fórmula ocupa una barra entera por encima de las dos columnas del Tintométrico. Preparación queda a la izquierda y resultado a la derecha, ambos en la misma fila de escritorio. Móvil conserva una columna.
- El editor muestra el estado de sincronización al comienzo con enlace a configurar Clave operativa. El mensaje del guardado indica claramente si queda sólo local.
- Al guardar Clave operativa, intenta enviar las recetas pendientes. Sincronizar todo incluye recetas propias y muestra su estado en la pantalla Sincronización.
- No se modifican Caja, recetas.csv, Sheet, Worker ni Apps Script. Los backends empaquetados siguen siendo v0.12.31.

## Recuperar la fórmula ya creada

1. En **el mismo dispositivo y navegador** donde se creó, no borrar los datos del sitio. La fórmula quedó en `pk_shared_recipes_v1` con 1 pendiente.
2. Abrir Sincronización, ingresar la misma Clave operativa que usan los otros dispositivos y guardar. La app intenta enviar la pendiente; también se puede tocar Sincronizar recetas propias.
3. Probar conexión: Worker y Apps Script deben indicar v0.12.31. Si son viejos, desplegar `backend/Pancko_Worker_v0.12.31.mjs` y `backend/Pancko_AppsScript_v0.12.31.gs` conservando configuración; después reintentar sin duplicar la receta.
4. Confirmar pendientes 0, entonces abrir otro dispositivo, configurar clave allí y sincronizar. La pestaña `recetas_personales` aparece en la primera escritura central válida.

## Qué subir

Si los dos backends ya están en v0.12.31, subir **el contenido de** `pancko-integral-main/` a la raíz del repo `pancko-integral`. Es un paquete completo: incluye `data/recetas.csv`; no cargar un CSV adicional. Si algún backend es anterior, desplegar primero los dos archivos v0.12.31 dentro de `backend/` y luego subir el frontend. No se requiere cargar la Sheet manualmente.

**Pruebas locales:** diez pruebas Node pasaron, incluido guardado local, cola, ACK/reintento idempotente y fusión de recetas entre dispositivos simulados. No hubo prueba real con la cuenta, Sheet ni dispositivos físicos.
