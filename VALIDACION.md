# Validación — Pancko Gestión v0.11.7

Se ejecutó código frontend real, Worker real y Apps Script real sobre DOM, almacenamiento y Sheets simulados. No sustituye una prueba en PC y celular con servicios desplegados.

| Caso | Resultado simulado |
|---|---|
| PC crea caja y movimiento A | Un snapshot central por fecha, movimiento una sola vez. |
| Celular recibe caja y carga B | PC actualiza y ve A+B. |
| Carga offline y posterior envío | Local/cola conservados; reconexión sin duplicar. |
| Anulación y eliminación | Anulada visible sin sumar; eliminada fuera de vista/TXT, evento técnico conservado. |
| Edición simultánea del mismo movimiento | Conflicto explícito; no sobrescribe la versión central. |
| Cierre con movimiento nuevo ajeno | Bloquea y exige actualización/revisión. |
| Cierre correcto y consulta desde segundo equipo | El segundo ve caja cerrada y no puede editar. |
| Reapertura confirmada | El segundo recibe reapertura y cierre previo conservado. |
| Caja al día siguiente | Saldo del cierre anterior y desglose si es deducible, también en dispositivo sin caja previa. |
| Local v0.11.6 | Legible; caja histórica cerrada con movimiento se publica sin alterar su cierre si la fecha aún no existe centralmente. |

También se comprobaron clave inválida, lectura que no crea hojas, endpoints nuevos del Worker, sintaxis de backend, service worker, rutas y archivos relativos, CSV intactos y ZIP raíz. La regresión del frontend existente aprobó 41 comprobaciones. La cola usa IDs estables e idempotencia del servidor; el doble envío y el merge de movimientos distintos están cubiertos por el modelo y la simulación.

**Pendiente fuera de este entorno:** despliegue manual real de Apps Script/Worker, permisos de la implementación web, latencia/cuotas efectivas de Sheets, caché de la PWA instalada, impresora y prueba física PC/celular. Si el backend antiguo sigue activo, la Caja continúa local y muestra error/pendientes; no se deben interpretar esos pendientes como sincronizados.

## Verificación de URL corregida (1 de octubre de 2026)

- Sintaxis del Worker con Node (`node --check`).
- Prueba aislada de `/colors`: petición a Apps Script con la URL nueva, aun si `env.GAS_URL` apuntase a la anterior. Se conserva la acción `list_colors`.
- No se modificaron archivos de PWA, CSV, HTML ni Apps Script; comparados byte a byte con la entrega v0.11.7.
- No se verificó el despliegue real de Cloudflare ni el permiso/contenido del nuevo Apps Script en producción. La comprobación final requiere desplegar el Worker y solicitar una ruta real como `/colors`, además de `/ping`.

## v0.11.8 — Validación de presentación

- Sintaxis de todos los bloques JavaScript embebidos, `sw.js`, JSON de versión y Worker: correcta.
- DOM simulado con el código de la app: abrir/cerrar fechas, arrastrar desglose, panel anterior sin inputs, conteo de hoy editable, suma/resta y Enter, guardado en `pk_cash_daily_v1`, lectura de movimientos, seis totales, estado de demora.
- Prueba simulada de dos dispositivos sobre backend aislado: movimientos distintos combinados sin duplicados; migración de una caja local v0.11.6 conservada en v0.11.8.
- Archivos backend y CSV comparados byte a byte con el paquete v0.11.7 con URL corregida.
- Limitación: no se ejecutó prueba visual en navegador real ni se tocó el servicio remoto/Sheet productivo. El DOM y las pruebas de sincronización fueron simulados. Revisar la pantalla en PC y celular luego de subir el paquete.
