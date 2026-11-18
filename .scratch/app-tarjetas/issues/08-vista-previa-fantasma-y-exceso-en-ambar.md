# 08: Vista previa fantasma y exceso en ámbar

**What to build:** Mientras una Tarjeta está seleccionada sin confirmar, la cabecera muestra su aporte como un tramo translúcido a continuación del progreso confirmado, en kcal y en cada Macro, para prever cómo quedaría el Día antes de confirmar. Si el total confirmado (o el previsto) supera el Objetivo, la barra correspondiente se pinta en ámbar.

Spec: `.scratch/app-tarjetas/spec.md` (historias 36, 37).

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] La vista previa suma la Selección de cada Momento todavía sin Elección. Las Elecciones confirmadas no se cuentan dos veces.
- [ ] El tramo translúcido es visualmente distinto del progreso confirmado y accesible: el texto o la etiqueta indican el valor previsto, por ejemplo "+600 kcal previstas".
- [ ] Una barra cuyo total supera el Objetivo pasa a un estado "excedido" (ámbar, no rojo) y la barra no se desborda del contenedor.
- [ ] Los valores numéricos confirmados ("1.208 / 1.900 kcal") no incluyen la vista previa.
- [ ] Tests del seam 2:
  - seleccionar muestra la vista previa sin cambiar los totales confirmados;
  - confirmar la convierte en progreso;
  - quitar la Selección la elimina;
  - un Día que supera el Objetivo marca la barra como excedida (por estado accesible o atributo, no por color).
