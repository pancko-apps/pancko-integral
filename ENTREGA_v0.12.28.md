# Pancko Gestión Cañada v0.12.28

Destino: frontend del repositorio estable `pancko-integral`, publicación manual. El ZIP contiene el sitio completo. No se cambió el contenido de `backend/`, ni se modificaron Worker, Apps Script o Sheet desplegados.

## Cambios

- Tintométrico: `Limpiar` descarta la preparación visible (producto, fórmula, cliente/nota, ajustes, pulsos y resultado) sin borrar recetas, historial o configuración.
- Tintométrico: se quitó el desplazamiento programado que subía los inputs repetidamente al enfocar. Los focos programáticos de Presupuestos y el editor manual ya no desplazan la página.
- Familia `MICROCEMENTO_PASTA`: `86921004` (base 5 KG) y `86921007` (base 25 KG). Los artículos `86921124` y `86921127` son Gris Medio ya preparado y no son patrones. La familia sólo acepta sus propias recetas SPECIAL.
- `data/recetas.csv`: se preservaron las 17.144 filas anteriores y se agregó Microcemento Nácar (Id 240197), con B=2.2, C=1.16, I=0.6 para 5 KG, consultados en lista 308. Para el artículo de 25 KG se usa el factor 5 con precisión decimal. El resto de fórmulas de Microcemento reportadas como `SIN_PRODUCTO` requieren consulta puntual; no se inventaron pulsos.
- Iconos de instalación y diagnóstico de versión/caché en Sincronización. `Limpiar caché local de app` pide confirmación y sólo borra Cache Storage de Pancko: no toca localStorage/IndexedDB.

## Instalación

Subir el contenido de `pancko-integral-main/` al repositorio, con `index.html` en la raíz. Tras publicar, usar **Sincronización → Forzar actualización**. Para que Android tome el icono nuevo puede ser necesario desinstalar la PWA y volver a instalarla; primero respaldar los datos locales importantes del celular, porque la desinstalación puede eliminarlos según Android/navegador. No hace falta borrar los datos del sitio para cargar esta versión.

## Comprobaciones

Pasaron las pruebas existentes de SPECIAL, edición manual, Presupuestos, Comandas y draft de Caja. Se validaron el parseo JS, 17.145 filas CSV y tamaños 192/512/180/48 px con fondo completo. La prueba táctil en Android y la instalación PWA requieren validación en el teléfono; el navegador automatizado disponible no tiene binario instalado.

Archivos modificados: `index.html`, `assets/budget-workbench.js`, `assets/special-editor.js`, `assets/special-recipes.js`, `assets/pwa-update.js`, `assets/icon-192.png`, `assets/icon-512.png`, `data/recetas.csv`, `data/version.json`, `manifest.webmanifest`, `sw.js`, `tests/special-core.test.js`, `CHANGELOG.md`, `README.md`, `SHA256SUMS.txt`. Nuevos: `assets/icon-maskable-192.png`, `assets/icon-maskable-512.png`, `assets/apple-touch-icon.png`, `assets/favicon.png`, este documento.
