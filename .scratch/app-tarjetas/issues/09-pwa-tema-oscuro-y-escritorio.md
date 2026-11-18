# 09: PWA, tema oscuro y escritorio

**What to build:** El usuario puede instalar la app en la pantalla de inicio del móvil y abrirla sin conexión. La app sigue el tema claro u oscuro del sistema. En escritorio se ve centrada, con un ancho máximo.

Spec: `.scratch/app-tarjetas/spec.md` (historias 57-60).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `vite-plugin-pwa` configurado: manifest en castellano (nombre, colores, `start_url` y `scope` bajo `/food-cards/`), iconos de la app en los tamaños requeridos y service worker que precachea la app para funcionar sin conexión.
- [ ] La app se puede instalar (criterios de instalabilidad de Chrome/Android y "Añadir a pantalla de inicio" en iOS).
- [ ] Al publicar una versión nueva, la app se actualiza sin quedarse atascada en la caché antigua (auto-update o aviso).
- [ ] Tema claro/oscuro según `prefers-color-scheme`, con colores definidos como tokens y contraste suficiente en ambos.
- [ ] En escritorio, el contenido queda centrado con ancho máximo y sin scroll horizontal de página. El carrusel sigue siendo usable con ratón y teclado.
- [ ] Verificado en el build publicado: Lighthouse PWA/installable sin errores y carga sin conexión tras la primera visita.
