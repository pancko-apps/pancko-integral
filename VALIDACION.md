# Validación — Pancko Gestión v0.11.5

**433 comprobaciones automatizadas aprobadas**, con código real y DOM/almacenamiento/servicios simulados. Base v0.11.4.

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
| cash-layout | 42 |
| autosave | 26 |

## Caso obligatorio de pérdida de conteo

1. Caja 30/09/2026 abierta con saldo inicial $50.000 y movimiento positivo $79.240.
2. Conteo: $30.000, $93.500, $5.300, $150 y $290; retiro $30.000.
3. Al ingresar cada valor, el borrador JSON de `pk_cash_daily_v1` ya contiene los centavos correspondientes.
4. Nueva instancia de app con el mismo almacenamiento, **sin pulsar Guardar sin cerrar**: movimiento y cinco grupos restaurados; contado $129.240, teórico $129.240, diferencia $0, retiro $30.000 y saldo para mañana $99.240. La caja sigue abierta.
5. Se repite tras **Guardar sin cerrar** y otra recarga; se conserva caja abierta y todos los importes.
6. Cambio de módulo y retorno preservan los importes. Suma `20.000+10.000` queda guardada como $30.000.
7. Modo manual y saldo $98.000 restaurados; diferencia declarada permanece como advertencia. Una expresión inválida conserva el último valor válido.
8. Escribir otro conteo sin cerrar actualiza contado y diferencia. Guardado de movimiento demorado y conteo concurrente dejan ambos registros. La falta de espacio preserva el dato anterior y avisa; el reintento recupera el guardado.

## Regresiones

- Sintaxis JS de todo inline, copias fuente, SW, Worker, Apps Script y eventos HTML; pantallas, rutas, manifest/iconos, versión y nueve recursos precacheados.
- Apertura/cierre/reapertura, cambios de inicial, movimientos, edición/anulación, conteo parcial, sumas seguras y Enter, respaldo/impresión/TXT, protección ante datos dañados/conflictos y funcionamiento offline simulado.
- Presupuestos, selección de clientes, historial, condiciones de impresión, tintométrico, etiquetas y A4/ticket con canvas real.
- Catálogo central con importación/publicación/recepción y Google Sheets/Worker simulados. CSV, backend, iconos y manifest comprobados byte a byte frente a v0.11.4; el listado instalado no se reemplaza.
- Shell y Caja responsive inspeccionados por DOM y reglas CSS a 390, 768, 1023, 1024, 1280, 1440 y 1920 px. Campo de fecha en escritorio con mínimo 170 px; móvil conserva ancho previo. Sin motor visual Chrome.

## No probado aquí

No hay un Chrome/Chromium ejecutable en el entorno. El cierre/reinicio se simula creando otra instancia de la app con el almacenamiento persistido; no se cerró una PWA instalada de Windows real. Tampoco se probaron teclado nativo, impresión física, cotas reales de almacenamiento, zoom/altura visual exacta, Worker/Apps Script/Sheets productivos o activación de SW en una PWA instalada. El alcance de esas pruebas se declara para distinguir la validación técnica de la prueba en mostrador.

## Paquete

El ZIP tiene index.html, sw.js, manifest, assets, data, backend completo sin cambios y documentación directamente en raíz. SHA256SUMS.txt verifica cada archivo salvo sí mismo. El Informe para Cerebrito se entrega en texto en la conversación, sin archivo en el ZIP.
