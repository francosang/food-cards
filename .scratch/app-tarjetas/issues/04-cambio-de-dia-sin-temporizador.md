# 04: Cambio de día sin temporizador

**What to build:** Cada día el Home empieza vacío sin que se reinicie ni se borre nada. Si el usuario deja la app en segundo plano y vuelve al día siguiente, ve el Día nuevo. Si confirma justo después de medianoche con la pantalla todavía mostrando el día anterior, la Elección se guarda en el Día nuevo y la vista pasa a él. El Día anterior queda intacto, guardado con su fecha.

Spec: `.scratch/app-tarjetas/spec.md` (historias 41-44 y "Hoy y cambio de día"). ADR: 0003 (sin temporizador de medianoche, a propósito).

**Blocked by:** 02

**Status:** resolved

- [ ] Reloj inyectable (por el mismo mecanismo de provider que el repositorio) que devuelve la fecha local `YYYY-MM-DD`. "Hoy" nunca es un estado guardado.
- [ ] La fecha se vuelve a leer al montar la app, en `visibilitychange` (al volver a visible) y justo antes de cada confirmación o desconfirmación.
- [ ] Si la fecha cambió, la vista pasa al Día nuevo (cambia la suscripción de fecha) antes de escribir, y se descartan todas las Selecciones.
- [ ] No hay `setTimeout` ni `setInterval` para la medianoche.
- [ ] Tests del seam 2 con reloj falso:
  - al avanzar al día siguiente y emitir `visibilitychange`, el Home queda vacío y el Día anterior sigue en el repositorio;
  - confirmar con el reloj ya en el día siguiente, sin `visibilitychange` previo, guarda la Elección en el Día nuevo y la vista pasa a él;
  - una Selección sin confirmar desaparece al cambiar de día.

## Comments

Resuelto en `main` (implementado por implement-spec, revisado con code-review; correcciones en 6797481).
