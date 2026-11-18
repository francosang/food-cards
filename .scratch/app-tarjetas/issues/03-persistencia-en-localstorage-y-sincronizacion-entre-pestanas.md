# 03: Persistencia en `localStorage` y sincronización entre pestañas

**What to build:** Las Elecciones de hoy sobreviven a cerrar y reabrir la app. Si la app está abierta en dos pestañas, una Elección hecha en una aparece en la otra. Al reabrir, el carrusel de cada Momento confirmado se desplaza hasta su Tarjeta elegida. El almacenamiento en `localStorage` cumple exactamente el mismo contrato que la implementación en memoria (y que la futura de Firebase), reactividad incluida.

Spec: `.scratch/app-tarjetas/spec.md` (historias 40, 47, 64 y "Repositorio de Días"). ADR: 0001.

**Blocked by:** 02

**Status:** resolved

- [ ] Implementación del repositorio de Días sobre `localStorage`, con espacio de nombres y versión de esquema propios.
- [ ] Pasa la batería de contrato completa del ticket 02 sin modificarla. Se ejecuta contra ambas implementaciones.
- [ ] Escrituras asíncronas y lecturas solo por suscripción, aunque `localStorage` sea síncrono.
- [ ] Casos de contrato nuevos (aplicables a implementaciones duraderas, o a todas cuando tenga sentido):
  - un repositorio nuevo sobre el mismo almacenamiento ve los datos anteriores;
  - una escritura de otra instancia o pestaña (evento `storage` simulado) notifica a los suscriptores de esta;
  - datos corruptos o de una versión de esquema desconocida no rompen nada: se tratan como vacíos, sin borrar silenciosamente datos válidos de otras fechas.
- [ ] La app usa la implementación de `localStorage` en producción y la de memoria en los tests de UI.
- [ ] Al cargar, el carrusel de un Momento con Elección se desplaza hasta la Tarjeta elegida; los demás empiezan en la primera.
- [ ] Test del seam 2: un cambio externo en el repositorio (simulando otra pestaña) se refleja en el Home.

## Comments

Resuelto en `main` (implementado por implement-spec, revisado con code-review; correcciones en 6797481).
