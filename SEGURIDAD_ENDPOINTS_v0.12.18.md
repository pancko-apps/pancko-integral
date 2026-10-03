# Pancko Gestión v0.12.18 — Clave operativa única

## Reemplazos obligatorios

**Subir frontend completo, incluida toda la carpeta assets y sw.js. Actualizar Worker y Apps Script completos. Configurar PANCKO_APP_TOKEN en ambos backends y Clave operativa Pancko en cada dispositivo.** No publicar sólo index.html. El ZIP tiene index.html en la raíz: subir su contenido, sin crear otra carpeta contenedora.

No se cambian los CSV (artículos, clientes y recetas), sus identificadores de versión ni estructuras de Sheets. data/version.json sí cambia para identificar la app. No hay hojas nuevas. La lógica económica, fórmulas, descuentos y UX de presupuestos quedan intactas.

## Relevamiento real de v0.12.17

| Worker: ruta/método | Acción Apps Script | Worker anterior | Apps Script anterior | v0.12.18 |
|---|---|---|---|---|
| GET /budgets | list_budgets | Sin autenticación | Abierta | Clave única en ambos |
| POST /budget | save_budget | Sin autenticación | Abierta | Clave única en ambos |
| POST /budget/delete | delete_budget | Sin autenticación | Abierta | Clave única en ambos |
| GET /colors | list_colors | Sin autenticación | Abierta | Clave única en ambos |
| POST /color | save_color | Sin autenticación | Abierta | Clave única en ambos |
| GET /articles | list_articles | Sin autenticación | Abierta | Clave única en ambos |
| GET /articles/meta | articles_meta | Sin autenticación | Abierta | Clave única en ambos |
| POST /articles | save_articles | Sin autenticación | PANCKO_ARTICLES_TOKEN | Clave única en ambos |
| POST /cash/get y /cash/apply | cash_get / cash_apply | Sin autenticación | PANCKO_CASH_TOKEN | Clave única en ambos |
| POST /cc/get y /cc/apply | cc_get / cc_apply | Sin autenticación | PANCKO_CC_TOKEN | Clave única en ambos |
| GET /auth/check (nueva) | auth_check (nueva) | No existía | No existía | Clave única en ambos |
| GET / y /ping | Estado público del Worker | Público | — | Público, sólo versión/servicio |
| GET /test | Muestra ficticia | Público | — | Eliminado: 404 |
| OPTIONS | Preflight | Público | — | Público con CORS limitado |

Todas las acciones privadas de doPost exigen clave antes de leer/escribir o tomar locks. Los alias directos doGet (`budgets`, `list_budgets`, `colors`, `list_colors`, `articles`, `list_articles`, `articles_meta`) también la exigen. doGet sin acción/ping sigue público con versión y hora, sin datos de negocio. Clientes, uniones e imputaciones se transportan por CC y quedan protegidos por su misma validación. No hay endpoint separado nuevo para clientes/historial.

## Una clave, dos validaciones

Crear una clave **aleatoria de al menos 32 caracteres** y guardar el mismo valor en:

- Cloudflare → Worker → Settings → Variables and Secrets → **Secret PANCKO_APP_TOKEN**.
- Apps Script → Configuración del proyecto → Propiedades del script → **PANCKO_APP_TOKEN**.
- Pancko → Sincronización → **Clave operativa Pancko** → Guardar configuración. Sólo una clave por dispositivo. Nombre del dispositivo opcional (por defecto “Dispositivo Pancko”).

Frontend guarda únicamente en `pk_app_token_v1` y manda `Authorization: Bearer ...`. No añade claves a cuerpos de movimientos/presupuestos ni al preview del catálogo. Caja/CC leen esa configuración común, conservando sus libros y pendientes. Guardar la nueva configuración retira la clave antigua de `pk_cash_identity_v1` y `pk_cc_token_v1`; conserva ID/nombre del dispositivo. No convierte automáticamente ninguna clave vieja en la nueva.

Worker admite header Authorization, X-Pancko-Token o token en body para compatibilidad de transporte; valida contra su secret y reenvía la clave en el sobre JSON de Apps Script. GAS recibe POST text/plain y valida payload.token contra su propiedad. No depende de headers que doPost no expone. Las credenciales se eliminan recursivamente de campos estructurados de negocio y snapshots. No se exportan claves ni se registran en logs. El log de legado sólo contiene ruta, método y fecha.

## Variables Cloudflare

| Nombre | Tipo / uso |
|---|---|
| PANCKO_APP_TOKEN | Secret obligatorio, mismo valor que GAS; mínimo 32 caracteres |
| PANCKO_SECURITY_MODE | Variable `compat` durante transición; luego `strict`. Ausente u otro valor = strict |
| PANCKO_LEGACY_UNTIL | Variable ISO UTC con fecha futura concreta; recomendamos máximo 24–48 horas. Ausente, inválida o vencida = strict efectivo |
| PANCKO_CASH_TOKEN | Secret viejo, sólo temporal, mismo valor anterior de Caja |
| PANCKO_CC_TOKEN | Secret viejo, sólo temporal, mismo valor anterior de CC |
| PANCKO_ARTICLES_TOKEN | Secret viejo, sólo temporal, mismo valor anterior de publicación |
| PANCKO_ALLOWED_ORIGINS | Opcional, orígenes completos separados por coma, sin paths ni `*`. GitHub Pages ya permitido |
| PANCKO_GAS_URL | Opcional sólo si cambia /exec. Por defecto mantiene URL actual |

Apps Script nuevo sólo requiere PANCKO_APP_TOKEN para autenticar todos los módulos. Las propiedades viejas ya no se usan. Las demás propiedades/datos que ya tenga el proyecto se mantienen.

## Compat temporal

Siempre valida la clave nueva. Con `compat` y fecha vigente, el Worker también permite claves viejas **sólo en sus rutas originales**. Además permite llamadas antiguas sin clave a presupuestos/colores y lecturas del catálogo sólo si Origin coincide con la app permitida. Una clave enviada e inválida nunca se trata como “sin clave”. /auth/check exige la clave nueva siempre.

**Mientras compat está vigente, las rutas antiguas sin clave siguen siendo una excepción de seguridad. CORS/Origin no son autenticación: un cliente ajeno al navegador puede falsificar Origin. No dejar compat indefinidamente.** La fecha vence automáticamente aunque se olvide cambiar la variable.

El Worker prueba primero la clave nueva contra GAS. Durante el reemplazo inicial, si el GAS viejo contesta exactamente su antiguo error de clave de Caja/CC/publicación, reintenta con el secret viejo correspondiente. Sólo en compat vigente. Una vez instalado GAS nuevo, nunca emite esos errores antiguos y acepta la clave nueva. Strict no usa este puente. No se reintentan conflictos, errores de negocio ni fallos de red con claves viejas.

Apps Script nuevo **no tiene excepción legacy directa**, ni acepta claves viejas. Llamarlo sin clave rechaza antes de tocar Sheets. La protección doble queda completa al terminar su despliegue.

## Orden exacto de despliegue

1. Respaldar repo/frontend, código actual de Worker/GAS, propiedades/configuración y libros locales de Caja/CC. No borrar localStorage ni datos de Sheets. Conservar claves viejas privadamente para rollback.
2. Generar la nueva clave. Configurar PANCKO_APP_TOKEN tanto en Cloudflare como en GAS. Copiar las tres claves anteriores como Secrets de Cloudflare para el puente temporal. Configurar `compat` y una fecha ISO de vencimiento a 24–48 h. No incluir claves en archivos/ZIP/capturas compartidas.
3. Reemplazar Worker por `backend/Pancko_Worker_v0.12.18.mjs` y desplegar. Mantener dominio actual. PWAs viejas siguen pasando por el puente temporal hacia GAS viejo.
4. Reemplazar código Apps Script por `backend/Pancko_AppsScript_v0.12.18.gs`. **Implementar → Administrar implementaciones → editar la implementación existente → Nueva versión → Implementar**. Mantener acceso/configuración de ejecución existentes y la misma URL /exec. No crear otra implementación por accidente. Abrir /exec: versión 0.12.18. Desde este paso GAS directo exige clave en todas las acciones privadas.
5. Subir contenido completo del ZIP al repo manualmente, incluida carpeta assets completa, sw.js, data/version.json. Los CSV son idénticos a v0.12.17; se incluyen como base completa.
6. En PC y celular: Forzar actualización, verificar v0.12.18. Si aparece el mensaje de completar actualización, cerrar todas las ventanas de Pancko y reabrir. Los libros y pendientes locales se conservan.
7. En cada dispositivo configurar una sola Clave operativa Pancko y nombre. Guardar y **Probar conexión**: debe confirmar Worker 0.12.18 y Apps Script 0.12.18. Un /ping público no prueba autenticación; usar este botón.
8. Probar módulos según guía siguiente. Revisar dispositivos antiguos antes del vencimiento.
9. Pasar Cloudflare a `PANCKO_SECURITY_MODE=strict`. Quitar PANCKO_LEGACY_UNTIL y los tres secrets viejos cuando ya no se necesiten para rollback. Apps Script puede retirar las tres propiedades viejas, que esta versión no consulta. No quitar PANCKO_APP_TOKEN.
10. Verificar rechazo sin clave y con clave incorrecta. Strict sólo admite la clave nueva (sin importar el origen). Si un dispositivo sigue viejo, actualizarlo/configurarlo; no dejar compat permanente.

## Sincronización única

Probar conexión valida ambos backends. Sincronizar todo procesa módulos independientemente y muestra resultado por módulo. Un error no impide continuar con los demás:

- Presupuestos: pendientes/borrados pendientes y recepción con mecanismos existentes.
- Colores: pendientes y recepción con mecanismo existente.
- Caja: fechas con operaciones pendientes y fecha seleccionada; conserva conflictos. No descarga todo el historial central.
- CC: pendientes/migración y recepción de movimientos/clientes; conserva conflictos y revisiones.
- Lista central: **sólo consulta versión**. No publica, no recibe/aplica catálogo automáticamente. Ir a Datos para revisar recepción o publicación y confirmar.

Las sincronizaciones automáticas existentes de Caja/CC permanecen. Sin red o sin clave se conserva el trabajo local y sus pendientes. Los estados de la pantalla son de la sesión, no un nuevo libro de datos; los detalles de conflictos siguen en cada módulo.

## Prueba guiada después de desplegar (PC/celular)

1. Dispositivo nuevo: cargar una sola clave y probar conexión. No hay campos separados de clave Caja/CC/lista.
2. Guardar presupuesto de prueba, sincronizar y recibir en otro dispositivo; abrir un presupuesto previo. Borrar sólo el de prueba y confirmar eliminación central.
3. Guardar color de prueba y recibirlo. Comprobar fórmula/snapshot sin modificar receta maestra.
4. PC agrega movimiento Caja; celular recibe y agrega otro; PC actualiza. Reintentar sin duplicar. Conteo parcial/cierre y pendientes permanecen.
5. PC crea cargo CC; celular recibe, registra pago; PC recibe y coincide saldo. Editar/anular según flujo existente y verificar conflictos.
6. Consultar lista central. Revisar publicación sólo con catálogo correcto y confirmar expresamente. Recibir en otro dispositivo con preview, sin aplicar automáticamente. Sincronizar todo nunca publica.
7. Interrumpir red, cargar movimiento, volver a red y sincronizar. No borrar libros locales ni limpiar datos del sitio.
8. Con clave incorrecta, confirmar error y pendientes conservados. Restaurar clave correcta. Strict: un request sin Authorization a /budgets debe responder 401. Apps Script POST `{"action":"list_budgets"}` debe devolver ok:false con AUTH_REQUIRED (GAS normalmente responde HTTP 200 incluso en error; revisar JSON).
9. Confirmar CORS desde `https://pancko-apps.github.io`; localhost/otros orígenes no están permitidos por defecto. No usar un archivo file:// como prueba de frontend publicado.

## Rollback

Respaldar antes y conservar la clave nueva/las anteriores privadamente. **No volver sólo el frontend a v0.12.17 mientras Worker esté strict**: sus llamadas antiguas serán rechazadas. Opción preferida: conservar backends seguros y restaurar datos/solucionar el frontend nuevo. Si debe volver frontend viejo, habilitar compat con fecha nueva corta y secrets viejos, manteniendo GAS nuevo protegido. No necesita cambiar hojas.

Si debe volver el código GAS antiguo, volver temporalmente a Worker compat con secrets viejos; el puente reconoce sus errores de clave. Esto reabre las rutas directas antiguas de GAS: usar sólo como recuperación breve y reinstalar la versión protegida. Restaurar Worker antiguo reabre también sus endpoints. No borrar pendientes para destrabar un error de autenticación. Exportar libros locales primero si necesita recuperar datos.

## Límites y riesgos restantes

Validado con DOM, Worker y Sheets simulados; no se hicieron escrituras en producción, despliegue, prueba física PWA, impresión real ni WhatsApp nativo. Requiere las pruebas guiadas tras instalación. La clave compartida habilita todos los módulos, incluida publicación confirmada; no hay roles/login ni permisos diferenciados. localStorage no es una bóveda: scripts del mismo origen/extensiones comprometidas podrían leer la clave. Rotarla en ambos backends y dispositivos si se expone. CORS es sólo capa de navegador. Compat sin clave es temporal y no ofrece la seguridad de strict. No se corrigieron aún precios faltantes de colorantes, cuota/transacciones localStorage, duplicados de recetas ni política de redondeo: fuera de alcance.
