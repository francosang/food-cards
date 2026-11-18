# 02: Seleccionar y confirmar, con progreso del Día

**What to build:**
- El usuario toca una Tarjeta y queda **seleccionada**: resaltada, y aparece un tick de "confirmar" en el banner de su Momento.
- Tocar otra Tarjeta del mismo Momento mueve la Selección; tocar la misma la quita.
- Al tocar el tick, la Selección se convierte en la **Elección** del Día: la Tarjeta pasa al estilo "confirmada", el tick se rellena y una cabecera fija suma su nutrición al progreso del Día.
- Mientras el Momento está confirmado, tocar otras Tarjetas no hace nada. Tocar el tick desconfirma: la nutrición se resta y la Tarjeta vuelve a quedar seleccionada.

Las Elecciones se guardan en un repositorio de Días reactivo, con la forma de Firestore (por ahora en memoria), cubierto por una batería de tests de contrato reutilizable.

Spec: `.scratch/app-tarjetas/spec.md` (historias 11-23, 25, 33-35, 38, 39, 45, 46, 48, 64). ADRs: 0001, 0002. Glosario: Selección, Elección, Día, Objetivo.

**Blocked by:** 01

**Status:** resolved

- [ ] Repositorio de Días con interfaz reactiva:
  - `subscribeDay(date, listener) → unsubscribe`, que emite el estado actual al suscribirse y después cada cambio;
  - `confirmChoice(date, moment, cardSnapshot, goalSnapshot) → Promise`;
  - `removeChoice(date, moment) → Promise`.
- [ ] Un Día es un documento por fecha local `YYYY-MM-DD`: `date`, `goal` (snapshot del Objetivo diario y por Momento) y `choices` (un mapa opcional de Momento → snapshot completo de la Tarjeta: id, nombre, Momento, tipo, ingredientes con gramos y nutrición).
- [ ] Al quitar la última Elección se borra el Día: `subscribeDay` emite ausencia.
- [ ] Implementación en memoria del repositorio.
- [ ] Batería de contrato parametrizada por una función que crea el repositorio, pensada para ejecutarse contra cualquier implementación. Casos:
  - emisión inicial (con ausencia y con Día);
  - confirmar crea el Día con el Objetivo y notifica a todos los suscriptores de la fecha;
  - confirmar en un Momento ya confirmado reemplaza la Elección;
  - quitar notifica, y quitar la última borra el Día;
  - quitar en un Momento sin Elección no falla ni notifica cambios espurios;
  - fechas aisladas entre sí;
  - sin notificaciones después de `unsubscribe` (y desuscribir dos veces es inocuo);
  - varios suscriptores de la misma fecha;
  - escrituras seguidas sin esperar se aplican en orden;
  - al resolverse la promesa, el cambio es visible para una suscripción nueva;
  - los snapshots devueltos no se pueden mutar desde fuera.
- [ ] El repositorio se inyecta en la app con un provider. La UI nunca lee el almacenamiento directamente.
- [ ] La Selección es estado efímero de la UI, como mucho una por Momento, y no pasa por el repositorio.
- [ ] Transiciones por Momento:
  - sin nada → tocar Tarjeta → seleccionada;
  - seleccionada → otra Tarjeta → mueve; misma Tarjeta → quita; tick → confirmada;
  - confirmada → tocar Tarjetas no hace nada; tick → seleccionada (la misma Tarjeta).
- [ ] El tick del banner solo aparece si hay Selección o Elección: contorno = confirmar, relleno = confirmado.
- [ ] Cabecera fija (sticky) con las kcal acumuladas frente al Objetivo diario ("1.208 / 1.900 kcal") con barra, y tres barras finas de P, C y G con sus gramos frente al Objetivo. Solo cuentan las Elecciones. El Objetivo sale del Día guardado o, si aún no existe, del Objetivo actual.
- [ ] Accesibilidad: las Tarjetas son botones con `aria-pressed`, y el tick es un botón con una etiqueta que cambia ("Confirmar desayuno" / "Quitar elección de desayuno").
- [ ] Tests del seam 2 (app con repositorio en memoria):
  - seleccionar, mover y quitar la Selección sin cambiar los totales;
  - confirmar suma, y la Elección queda en el repositorio con el snapshot de la Tarjeta y el Objetivo;
  - con el Momento confirmado, tocar otra Tarjeta no cambia nada;
  - desconfirmar resta y deja la Tarjeta seleccionada;
  - cuatro Elecciones suman los totales esperados;
  - al montar con Elecciones ya guardadas para hoy, se muestran confirmadas;
  - un cambio en el repositorio hecho fuera de la UI se refleja en la pantalla.
- [ ] En este ticket "hoy" puede calcularse de forma simple. El reloj inyectable llega en el 04.

## Comments

Resuelto en `main` (implementado por implement-spec, revisado con code-review; correcciones en 6797481).
