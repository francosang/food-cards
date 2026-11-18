# 05: Historial

**What to build:** Desde un icono en la cabecera, el usuario abre el Historial: una lista de solo lectura de los Días anteriores a hoy, del más reciente al más antiguo. Cada Día muestra su fecha en castellano, sus kcal frente al Objetivo de ese Día y la Tarjeta elegida en cada uno de los cuatro Momentos ("—" si quedó vacío). Si no hay Días, un mensaje lo explica. Se vuelve al Home con un botón o con el botón atrás del navegador.

Spec: `.scratch/app-tarjetas/spec.md` (historias 49-56). ADRs: 0001, 0002. Glosario: Historial.

**Blocked by:** 03, 04

**Status:** ready-for-agent

- [ ] `subscribeHistory(listener) → unsubscribe` en la interfaz del repositorio y en ambas implementaciones. Emite todos los Días ordenados por fecha descendente al suscribirse y después en cada cambio.
- [ ] Batería de contrato ampliada:
  - emisión inicial (vacía y con Días);
  - orden descendente;
  - confirmar y quitar notifican al Historial;
  - quitar la última Elección saca el Día del Historial;
  - cambios externos notifican al Historial (en `localStorage`).
- [ ] Navegación por hash: `#/historial` muestra el Historial y el botón atrás vuelve al Home. Funciona en GitHub Pages bajo `/food-cards/`.
- [ ] El Historial excluye el Día de hoy (según el reloj inyectable) y muestra los datos de los snapshots guardados, no de las Tarjetas actuales.
- [ ] Estado vacío con un mensaje amable.
- [ ] Solo lectura: no hay acciones para editar ni borrar.
- [ ] Tests del seam 2:
  - el Historial lista los Días anteriores (no hoy), en orden, con sus Elecciones y "—" en los vacíos;
  - estado vacío;
  - ir al Historial y volver con atrás;
  - un Día creado ayer (con el reloj falso) aparece en el Historial tras cambiar de día.
