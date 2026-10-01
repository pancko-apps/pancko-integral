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
