# 01: Esqueleto publicado: Home con los Momentos y sus Tarjetas

**What to build:** Al abrir `https://francosang.github.io/food-cards/`, el usuario ve los cuatro Momentos (desayuno, almuerzo, merienda, cena) en vertical. Cada uno tiene un banner con su nombre y sus kcal objetivo, y debajo un carrusel horizontal con sus Tarjetas. Cada Tarjeta muestra el nombre, las kcal en grande, la proteína, los carbohidratos y las grasas como tres chips de color y, en desayuno y merienda, la etiqueta dulce/salado. Cada push a `main` ejecuta los tests y publica la app automáticamente.

Spec: `.scratch/app-tarjetas/spec.md` (historias 1-7, 9, 10, 61-63). Glosario: `GLOSSARY.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Proyecto React + Vite + TypeScript con Tailwind CSS v4 y Vitest + Testing Library (jsdom) en la raíz del repo, junto a `data/` y `scripts/`.
- [ ] Vite configurado con `base` `/food-cards/`.
- [ ] La app importa de forma estática `data/tarjetas.json` (Objetivos y Tarjetas). No hay `fetch` en tiempo de ejecución.
- [ ] El Home muestra los cuatro Momentos en orden fijo, y cada uno lista sus 7 Tarjetas en el orden del JSON.
- [ ] Carrusel horizontal con CSS scroll-snap nativo. En un ancho de móvil asoma parte de la siguiente Tarjeta.
- [ ] Las Tarjetas tienen tamaño fijo y dejan un hueco reservado (vacío por ahora) para el futuro botón "Ver detalles".
- [ ] Interfaz en castellano. Identificadores de código en inglés según el glosario (`Card`, `Moment`, `Goal`…).
- [ ] Test del seam 2 (app renderizada con Testing Library): se ven los cuatro Momentos en orden con los nombres, kcal y P, C y G de sus Tarjetas.
- [ ] Workflow de GitHub Actions: instala, ejecuta los tests, construye y publica en GitHub Pages en cada push a `main`. No publica si falla un test.
- [ ] Instrucciones mínimas en el README: cómo arrancar en local, ejecutar los tests y regenerar `tarjetas.json` con `scripts/calcular.py --json`.
