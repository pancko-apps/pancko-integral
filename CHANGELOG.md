# CHANGELOG — Pancko Gestión v0.11.4

Fecha: 30/09/2026. Base real: v0.11.3. App/shell/cache v0.11.4. Apps Script v0.11.2 y Worker v0.11.0 sin cambios.

## UX de Caja

- Encabezado, fecha/estado/saldo y tarjetas compactos en PC; dos columnas de operación.
- Resumen inicial/ingresos/egresos/teórico en cuatro bloques bajos.
- Detalle, importe y botones Ingreso/Egreso en una fila de escritorio; edición/cancelación siguen disponibles.
- Movimientos con filas bajas, cabecera sticky y scroll interno limitado según altura de ventana. La lista no se recorta ni elimina datos.
- Conteo por grupos en filas horizontales; contado/teórico y diferencia agrupados, botones guardar/cerrar visibles y compactos.
- Historial por fecha y respaldo plegados; registro de cambios conserva su sección plegable. Contenido histórico y acciones conservados.
- Móvil mantiene controles altos y flujo vertical; no se aplica el límite vertical de la tabla de PC. Respeta temas existentes.

## Entrada de conteo

- Sumas/restas simples en los cinco grupos, con números locales, miles con punto y decimales con coma. Parser seguro sin eval/Function; cálculo por centavos enteros.
- Resultado visible por grupo; expresión inválida o total negativo no permite guardar/cerrar.
- Enter valida y normaliza el resultado; avanza por cinco grupos → retiro → saldo para mañana cuando está manualmente habilitado. No envía movimiento ni cierra automáticamente.
- Se guardan los importes finales, con el mismo esquema/clave anteriores. No cambia el cálculo de saldo, diferencia, retiro o carry.

## Conservación

29 funciones de cálculo, persistencia, cierre/reapertura, historial y exportación/impresión comparadas y exactamente iguales a v0.11.3. No se modifican las cajas existentes al consultar. TXT/HTML de una misma caja conservan el resultado anterior. Lectura de datos nuevos compatible con v0.11.3.

Sin backend nuevo, hojas nuevas, endpoints nuevos, login ni integración económica. CSV, manifest, iconos y backend byte a byte preservados. La lista central instalada no se reemplaza por el CSV del repo.

## Archivos

Modificados: index.html; assets/caja.js/css; sw.js; data/version.json; README.md; CHANGELOG.md; VALIDACION.md; resúmenes de validación y SHA256SUMS.txt. En assets/gestion.js/css y assets/desktop-shell.js/css sólo se actualizan textos de versión 0.11.3 → 0.11.4.

Sin cambios: backend/Pancko_AppsScript_v0.11.2.gs; backend/Pancko_Worker_v0.11.0.mjs; BACKEND_v0.11.2.md; LISTA_PRECIOS_v0.11.2.md; tres CSV; manifest e iconos. Código de negocio previo fuera de Caja preservado salvo textos de versión.

## Instalación y límites

Subir el contenido del ZIP a raíz del repo sin carpeta envolvente. No actualizar Apps Script ni Worker por esta misión. Abrir con red, cerrar todas las ventanas Pancko y reabrir para activar la nueva PWA; no borrar datos del sitio.

Pruebas en VALIDACION.md. La compactación fue verificada mediante DOM y cascada CSS a distintos anchos; no con un motor visual Chrome. No se garantiza cero scroll en pantallas bajas o con zoom alto. No se probó en Android físico, PWA instalada ni impresora real. Las pruebas de teclado/foco usan DOM simulado; no se tocó GitHub ni servicios productivos.
