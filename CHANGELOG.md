# v0.12.18 — Seguridad endpoints / clave única

- Una Clave operativa Pancko por dispositivo: pk_app_token_v1.
- Headers Authorization en todas las llamadas privadas, validación Worker + Apps Script.
- Presupuestos, colores, Caja, CC y catálogo protegidos, incluso lecturas/alias directos de GAS.
- Sincronización: configurar una clave, probar ambos backends, sincronizar todo y estado por módulo.
- Lista central sólo consulta versión desde Sincronizar todo; publicación/recepción mantienen revisión explícita.
- Compat con vencimiento y puente de claves anteriores; strict por defecto. CORS limitado a GitHub Pages y orígenes explícitos. /test retirado.
- Código completo backend/Pancko_Worker_v0.12.18.mjs y backend/Pancko_AppsScript_v0.12.18.gs.
- Archivos modificados: index.html, sw.js, data/version.json, assets/pwa-update.js (versión), assets/gestion.js y assets/caja-sync.js (espejos), backend completo, README/CHANGELOG/VALIDACION/SHA256SUMS. Nuevo assets/operational-sync.js y SEGURIDAD_ENDPOINTS_v0.12.18.md.
- Sin hojas nuevas, migración económica ni modificación de los tres CSV. assets/budget-workbench.js/css y módulos económicos de Caja/CC conservan sus bytes.
- Despliegue manual obligatorio y pruebas físicas pendientes: ver SEGURIDAD_ENDPOINTS_v0.12.18.md y VALIDACION.md.

# v0.12.17 — huecos de la grilla corregidos según captura

- Se hizo un ajuste horizontal real: el bloque Cantidad→Acción se mueve a la derecha (inicio 56% → 64%) y pasa de 44% a 36% del ancho.
- Fórmula pasa de 12% a 8%; input corto de 72 px y botón agrupados al extremo derecho. La marca `mod.` no ensancha el control.
- Cantidad y Precio, % Dto. e Imp. Dto., e Imp. Dto. e Importe quedan visualmente más próximos; títulos conservan sus columnas.
- Descripción usa el ancho liberado. La tabla de escritorio tiene mínimo 1200 px y scroll horizontal propio cuando no entra; móvil mantiene sus tarjetas.
- Sin cambios de lógica, Caja, Cuenta Corriente, tintométrico, salidas, CSV o backend.
- Versión de interfaz, service worker/caché y `data/version.json` actualizados a v0.12.17.

Ver `README.md` y `VALIDACION.md`.
