# 06: Detalles de la Tarjeta

**What to build:** Al seleccionar una Tarjeta aparece dentro de ella un botón "Ver detalles", sin que la tarjeta cambie de tamaño. Al pulsarlo se abre un diálogo flotante de solo lectura con:
- el nombre, el Momento y si es dulce o salado;
- las kcal, la proteína, los carbohidratos, las grasas y la fibra;
- la lista de ingredientes con sus gramos y su unidad casera ("2 rebanadas", "1 vasito");
- las instrucciones de preparación.

Se cierra con un botón, con Escape o tocando fuera.

Spec: `.scratch/app-tarjetas/spec.md` (historias 13, 26-32 y "Datos de entrada").

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] `scripts/calcular.py --json` añade a cada ingrediente de `data/tarjetas.json` el texto de su unidad casera (la misma regla que ya usa para `docs/tarjetas.md`: múltiplos de ¼, con plural si es mayor que 1), o lo omite si no aplica. Se regenera `tarjetas.json`.
- [ ] El botón "Ver detalles" solo es visible en la Tarjeta seleccionada o confirmada, ocupa el hueco reservado y no cambia el tamaño de la Tarjeta.
- [ ] El diálogo usa el elemento nativo `<dialog>` abierto como modal, atrapa el foco y se cierra con un botón, con Escape o con un clic en el fondo. No tiene acciones de confirmar.
- [ ] El diálogo muestra todo lo descrito arriba, a partir de los datos de la Tarjeta.
- [ ] Abrir el diálogo no cambia la Selección ni la Elección.
- [ ] Tests del seam 2: seleccionar, ver detalles, comprobar ingredientes, gramos, unidad casera, nutrición con fibra y preparación, y cerrar con Escape y con el botón.
