# Validación — Pancko Gestión v0.11.6

Base v0.11.5. Se probó el código real con DOM, localStorage, confirmaciones y recursos PWA simulados. El cambio funcional está limitado a Caja diaria.

## Casos nuevos

- Cierre bloqueado contra edición; cancelación de reapertura sin cambios; reapertura confirmada con snapshot previo conservado; segundo cierre independiente.
- $50.000 inicial + $79.240 de movimiento; conteo $30.000 + $93.500 + $5.300 + $150 + $290; retiro $30.000. Cierre con $99.240 para mañana y desglose $0 + $93.500 + $5.300 + $150 + $290.
- Al abrir el siguiente día se sugieren $99.240 y los cinco grupos como conteo inicial; retiro nuevo en cero. Tras nueva instancia de app con el mismo libro, se conserva el desglose.
- Un segundo cierre tras reabrir no modifica la caja posterior ya creada. El primer cierre queda en el historial.
- Retiro $700 mayor que grupo grande $500: advertencia previa, saldo $400, desglose `null`; siguiente día sin conteo inventado.
- Saldo declarado manualmente $850 frente a $900 calculados: advertencia, saldo sugerido $850, desglose `null`.
- Modificar saldo inicial quita la etiqueta de procedencia del desglose sugerido. Cierre histórico sin `remaining_counts` conserva su estructura y sus cálculos; no se rellena retrospectivamente.

Estos escenarios aprobaron 17 verificaciones dirigidas. También se ejecutaron las pruebas heredadas: Caja (82), guardado automático (26), frontend (41), Worker/SW (23), recursos/sintaxis (30) y entrada del conteo (63). Los controles de regresión incluyen movimientos, importes, cierre/reapertura, suma y Enter, persistencia local, presupuestos y frontend general. El CSS de Caja no cambia su distribución, salvo comentarios de versión; las copias inline coinciden con sus fuentes.

## Integridad del paquete

Se verificó sintaxis JavaScript del módulo, scripts inline y service worker; referencias relativas de index/manifest/assets/data, CSV, versión y precache. Se comparó backend y CSV con v0.11.5 sin diferencias. El ZIP se ensambla con archivos directamente en raíz, sin carpeta contenedora. `SHA256SUMS.txt` enumera los archivos incluidos.

## Límites

No se dispone de una PWA instalada en Windows ni de Chrome/impresora físicos en este entorno. La reapertura se simuló con otra instancia sobre el mismo localStorage; no se publicó en GitHub ni se conectaron servicios productivos. El orden real de billetes dentro de cada grupo no se conoce: cuando el retiro supera el grupo grande, se pide ajuste humano sin repartirlo entre los otros grupos. El conteo precargado es una sugerencia inicial; se debe actualizar conforme entra o sale efectivo durante el nuevo día. Las cajas siguen siendo datos locales de cada navegador.
