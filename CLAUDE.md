# Food Cards

App personal (React + Vite + TS, GitHub Pages) para elegir una Tarjeta por Momento del día; cualquier combinación cumple el Objetivo diario de `obetivos.md`. Vocabulario en `GLOSSARY.md`; decisiones en `docs/adr/`; spec y tickets en `.scratch/app-tarjetas/`.

## Convenciones

- Idioma: interfaz, docs, glosario, ADRs y tickets en castellano; código e identificadores en inglés con los nombres del glosario (`Card`, `Moment`, `Selection`, `Choice`, `Day`, `Goal`, `History`). Commits en inglés.
- Git: commit directamente en `main`, sin ramas. Commit y push solo cuando el usuario lo pida.

## Datos de las Tarjetas

- Fuente de verdad: `data/recetas.json` (ingredientes y gramos de cada Tarjeta), `data/ingredientes.json` (valores por 100 g, con `fuente` y `barcode` opcional) y `data/objetivos.json` (Objetivo por Momento y tolerancias).
- `docs/tarjetas.md` y `data/tarjetas.json` son generados: tras cambiar datos, regenera con `python3 scripts/calcular.py --json`. Sale con código 1 si una Tarjeta queda fuera de tolerancia.
- Reglas para crear o cambiar Tarjetas (acordadas con el usuario, no están en el código):
  - Alimentos sencillos de Mercadona/Bonpreu: congelados, latas, botes, arroz en vasito, pan y pasta integral, leche desnatada.
  - Colesterol: máximo 1 yema por Tarjeta, carne roja en 1 sola Tarjeta, cerdo solo magro, embutido solo pavo o jamón cocido.
  - Whey en máximo 2 desayunos y 2 meriendas. Desayunos y meriendas: 4 dulces y 3 saladas.
  - Preparación ≤ 20 min (micro, sartén, airfryer); almuerzos aptos para tupper. Almuerzos y cenas con ≥ 200 g de verdura o legumbre.
  - Aceite siempre pesado dentro de la Tarjeta; café solo, infusiones y especias son libres.
- Valores nutricionales: Open Food Facts para productos de marca (Hacendado), BEDCA para genéricos, `estimado` cuando no hay ficha fiable. Para buscar en Open Food Facts usa `https://search.openfoodfacts.org/search?q=<término> brands_tags:"hacendado"` (el buscador `cgi/search.pl` devuelve "temporarily unavailable"); la ficha por código es `GET /api/v2/product/{barcode}`. User-Agent genérico, sin datos del usuario.

## App

- El repositorio de Días tiene forma de Firestore (suscripciones reactivas, escrituras asíncronas) porque se migrará a Firebase: toda implementación pasa la misma batería de tests de contrato sin modificarla (ADR-0001).
- Tests en dos seams: el contrato del repositorio y la app completa renderizada con Testing Library con repositorio en memoria y reloj falso inyectados. Comportamiento externo, TDD.
- Publicación en `https://francosang.github.io/food-cards/` (`base` `/food-cards/`), navegación por hash.

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
