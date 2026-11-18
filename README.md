# Food Cards

App personal para elegir una Tarjeta por Momento del día. Publicada en <https://francosang.github.io/food-cards/>.

## En local

Requiere Node 24 y Python 3.

```sh
npm install
npm run dev      # arranca en http://localhost:5173/food-cards/
npm test         # ejecuta los tests una vez (npm run test:watch para modo observación)
npm run build    # comprueba tipos y construye en dist/
```

## Regenerar las Tarjetas

La app importa `data/tarjetas.json` al construir. Tras cambiar `data/recetas.json`, `data/ingredientes.json` u `data/objetivos.json`:

```sh
python3 scripts/calcular.py --json
```

Regenera `docs/tarjetas.md` y `data/tarjetas.json`, y sale con código 1 si alguna Tarjeta queda fuera de tolerancia.

## Publicación

Cada push a `main` ejecuta los tests, construye y publica en GitHub Pages (`.github/workflows/deploy.yml`). Si falla un test, no se publica. En la configuración del repositorio, Pages debe tener como origen "GitHub Actions".
