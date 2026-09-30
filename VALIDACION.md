# Validación — v0.11.4

**405 comprobaciones automatizadas aprobadas.** Código entregado, con DOM/servicios simulados y canvas real para las salidas anteriores. Base v0.11.3.

| Grupo | Comprobaciones |
|---|---:|
| static | 30 |
| frontend | 41 |
| integration | 8 |
| worker-sw | 23 |
| shell-layout | 60 |
| shell-data | 11 |
| catalog | 47 |
| cash | 82 |
| count-ux | 63 |
| cash-layout | 40 |

## Nuevos casos

- Sumas/restas locales: ejemplos de la orden, espacios alrededor de operadores, coma decimal, centavos exactos, signo inicial y total cero. Importes simples anteriores siguen compatibles, incluido formato con $.
- Rechazo de expresión incompleta, signos repetidos, total negativo, separadores/decimales inválidos, multiplicación/división/potencias/paréntesis, letras/funciones/código, overflow y longitud excesiva.
- Vista previa por grupo, marca de error y no escritura por tipeo; guardado parcial/cierre inválidos no modifican datos.
- Enter recorre cinco grupos y retiro; va al saldo sólo si está manualmente habilitado. Normaliza la suma válida y conserva foco/texto inválidos. No altera Tab ni composición de teclado.
- Conteos guardados son números del esquema 1, sin expresiones; recarga y lectura también desde v0.11.3. TXT e impresión HTML iguales para el mismo estado. 29 funciones de negocio/guardado/salidas idénticas.
- DOM de caja abierta generado por el código real, con controles en la fila de carga, listado desplazable accesible y secciones plegables.
- CSS de Caja revisado a 390/768/1023/1024/1280/1440/1920 px: escritorio con dos columnas/formulario horizontal/lista limitada/botones sticky; móvil con flujo vertical, altura de campo 44 px y tabla sin límite vertical impuesto. Es análisis de reglas, no medición real de píxeles en Chrome.

## Regresiones

- Sintaxis inline/fuentes/Worker/GAS, IDs/pantallas/rutas, copias inline, versiones, SW y recursos relativos.
- Caja: apertura/saldo inicial, ingresos/egresos/negativos, edición/hora/anulación, conteo parcial, diferencias, retiro/carry, cierre/reapertura/snapshots, consulta histórica, TXT/HTML/JSON/copia/restauración, cuotas/datos dañados/conflictos/doble clic y offline simulado. No altera catálogo, presupuesto o tintométrico.
- Presupuestos, cliente/alta rápida/mostrador, descuentos/cantidades, historial, snapshots y opciones de condiciones de pago. Etiqueta, ticket y A4 largo con canvas real.
- Tintométrico: factor y fórmula original/editada, precios guardados, producto desde presupuesto. Cálculos comerciales preservados.
- Lista central: importación completa/sólo precios, columnas tintométricas, nombres/fechas, publicación/recepción, espejo legible, compatibilidad/idempotencia/conflictos y errores con código real frontend/Worker/Apps Script y Sheets simulados. Equipo con 4270 artículos conserva lista instalada.
- Shell a ocho anchos y navegación de 14 módulos. SW simulado con nueve recursos, offline de index y CSV, limpieza Pancko, exclusión API/POST y espera de activación sin skipWaiting.
- Paquete: datos y backend preservados; index/sw/manifest/assets/data en raíz, checksums, ZIP íntegro y sin Informe para Cerebrito separado.

## No comprobado en servicios/dispositivos reales

No hay Chrome/Chromium ejecutable en el entorno. No se verificó apariencia en navegador real, altura exacta ocupada a cada resolución/zoom, teclado físico o virtual nativo, Android físico, actualización de PWA instalada, impresión física, clipboard/ventanas nativos ni backend desplegado. No se presentan las simulaciones como pruebas de producción. Los límites quedan documentados y la apariencia requiere revisión en el equipo de mostrador.
