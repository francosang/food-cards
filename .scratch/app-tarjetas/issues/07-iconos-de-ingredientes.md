# 07: Iconos de ingredientes

**What to build:** Cada Tarjeta muestra iconos planos de sus 3-4 ingredientes principales (pollo, arroz, brócoli…), para reconocerla de un vistazo y ver si los ingredientes están en casa. En el diálogo de detalles, cada ingrediente aparece con su icono.

Spec: `.scratch/app-tarjetas/spec.md` (historia 8 y "Iconos de ingredientes").

**Blocked by:** 06

**Status:** resolved

- [ ] SVG de Fluent Emoji Flat (Microsoft, MIT) incluidos en el proyecto, sin CDN, para funcionar sin conexión. Solo los que se usan. Con nota de atribución y licencia en el repo.
- [ ] Mapeo ingrediente → icono para los ingredientes de `data/ingredientes.json`, con un icono genérico por categoría como respaldo (lácteo, proteína, pescado, legumbre, cereal, tubérculo, verdura, fruta, grasa, otro).
- [ ] Un ingrediente nuevo sin entrada en el mapeo usa el icono de su categoría, sin romper nada.
- [ ] La Tarjeta muestra los iconos de sus 3-4 ingredientes principales, por peso y sin aceite, con texto alternativo accesible (nombre del ingrediente).
- [ ] El diálogo de detalles muestra el icono junto a cada ingrediente.
- [ ] Tests del seam 2: una Tarjeta conocida muestra los iconos esperados (por su texto alternativo) y no muestra el del aceite. Un ingrediente sin icono propio muestra el de su categoría.

## Comments

Resuelto en `main` (implementado por implement-spec, revisado con code-review; correcciones en 6797481).
