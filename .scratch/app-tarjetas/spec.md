# App de Tarjetas: elegir una Tarjeta por Momento y seguir el progreso del Día

Status: resolved

## Problem Statement

El usuario sigue un plan de 1.900 kcal (180 g de proteína, 175 g de carbohidratos, 56 g de grasas) y ya tiene 28 Tarjetas, 7 por Momento, calculadas para que cualquier combinación de una por Momento cumpla el Objetivo. Hoy esas Tarjetas solo existen como un documento y un JSON. Para decidir qué comer tiene que leer un markdown largo, no puede marcar lo que ya comió, no ve cuánto lleva del día y no guarda ningún registro de días anteriores.

## Solution

Una web app mobile-first, instalable como PWA y publicada en GitHub Pages:

- **Home:** los cuatro Momentos (desayuno, almuerzo, merienda, cena) en vertical. Cada uno tiene un banner con su nombre y un carrusel horizontal con sus Tarjetas.
- **Selección:** al tocar una Tarjeta, queda seleccionada (resaltada, con un botón "Ver detalles" dentro de la propia tarjeta) y aparece un tick en el banner del Momento.
- **Elección:** al tocar el tick, la Selección se confirma como Elección del Día.
- **Progreso:** una cabecera fija muestra las kcal y los Macros acumulados frente al Objetivo, con una vista previa del aporte de la Selección todavía sin confirmar.
- **Nuevo día:** cada día el Home empieza vacío sin perder nada. Los Días anteriores se consultan en una pantalla de Historial.

Todo se guarda en el navegador, detrás de un repositorio con la forma de Firestore, para poder migrar a Firebase sin cambiar el comportamiento.

## User Stories

### Explorar Tarjetas

1. Como usuario, quiero ver los cuatro Momentos del día en orden fijo (desayuno, almuerzo, merienda, cena), para recorrer mi día de arriba abajo.
2. Como usuario, quiero que cada Momento muestre sus Tarjetas en un carrusel horizontal, para comparar opciones sin salir del Home.
3. Como usuario, quiero que el carrusel encaje cada Tarjeta al desplazarlo (scroll-snap), para que las tarjetas no queden cortadas a medias.
4. Como usuario, quiero que en el móvil se vea parte de la siguiente Tarjeta, para saber que puedo desplazarme.
5. Como usuario, quiero ver en cada Tarjeta su nombre, para identificar la idea de comida.
6. Como usuario, quiero ver las kcal de cada Tarjeta en grande, para confirmar de un vistazo que todas valen lo mismo.
7. Como usuario, quiero ver la proteína, los carbohidratos y las grasas de cada Tarjeta como tres chips de color, para comparar su perfil de Macros.
8. Como usuario, quiero ver iconos planos de los 3-4 ingredientes principales de cada Tarjeta, para reconocerla rápido y saber si tengo esos ingredientes en casa.
9. Como usuario, quiero ver la etiqueta "dulce" o "salado" en las Tarjetas de desayuno y merienda, para elegir según me apetezca.
10. Como usuario, quiero que las Tarjetas aparezcan en el mismo orden siempre, para encontrarlas donde las dejé.

### Seleccionar y confirmar

11. Como usuario, quiero tocar una Tarjeta para seleccionarla, para indicar cuál estoy considerando.
12. Como usuario, quiero que la Tarjeta seleccionada se resalte claramente, para saber cuál está seleccionada.
13. Como usuario, quiero que al seleccionar una Tarjeta aparezca dentro de ella un botón "Ver detalles" sin que cambie su tamaño, para que el carrusel no salte.
14. Como usuario, quiero que al seleccionar una Tarjeta aparezca un tick en el banner del Momento, para poder confirmarla.
15. Como usuario, quiero que tocar otra Tarjeta del mismo Momento mueva la Selección a esa Tarjeta, para cambiar de idea antes de confirmar.
16. Como usuario, quiero que tocar de nuevo la Tarjeta seleccionada quite la Selección, para dejar el Momento sin nada.
17. Como usuario, quiero tocar el tick del banner para confirmar la Selección como Elección del Día, para registrar lo que comí.
18. Como usuario, quiero que el banner muestre claramente que el Momento está confirmado (tick relleno), para ver qué Momentos ya tengo resueltos.
19. Como usuario, quiero que la Tarjeta elegida siga resaltada con estilo de "confirmada", para distinguirla de una simple Selección.
20. Como usuario, quiero que, mientras un Momento está confirmado, tocar otra Tarjeta de ese Momento no haga nada, para no cambiar la Elección sin querer al desplazar el carrusel.
21. Como usuario, quiero tocar el tick de un Momento confirmado para desconfirmarlo (vuelve a quedar seleccionada la misma Tarjeta), para poder corregir una Elección.
22. Como usuario, quiero poder dejar un Momento sin Elección, para los días en que me salto una comida.
23. Como usuario, quiero que haya como máximo una Elección por Momento, para que el plan siga siendo intercambiable.
24. Como usuario, quiero que la Selección sin confirmar se pierda al cerrar la app, porque solo me importa lo que confirmé.
25. Como usuario, quiero que el tick, las Tarjetas y el botón de detalles se puedan usar con teclado y lector de pantalla, para que la app sea accesible.

### Detalles de una Tarjeta

26. Como usuario, quiero que "Ver detalles" abra un diálogo flotante, para consultar la Tarjeta sin salir del Home.
27. Como usuario, quiero ver en el diálogo el nombre, el Momento y si es dulce o salado, para tener contexto.
28. Como usuario, quiero ver en el diálogo las kcal, la proteína, los carbohidratos, las grasas y la fibra, para conocer la nutrición completa.
29. Como usuario, quiero ver la lista de ingredientes con su icono, sus gramos y su unidad casera ("2 rebanadas", "1 vasito"), para saber cuánto preparar sin pesarlo todo.
30. Como usuario, quiero leer las instrucciones de preparación en el diálogo, para cocinarla.
31. Como usuario, quiero cerrar el diálogo con un botón, con Escape o tocando fuera, para volver rápido al Home.
32. Como usuario, quiero que el diálogo sea solo de lectura, para confirmar siempre desde un único sitio (el tick del banner).

### Progreso del Día

33. Como usuario, quiero una cabecera fija arriba del Home con mis kcal acumuladas frente al Objetivo ("1.208 / 1.900 kcal") y una barra de progreso, para saber dónde estoy en todo momento.
34. Como usuario, quiero ver en la cabecera tres barras finas de proteína, carbohidratos y grasas con sus gramos frente al Objetivo, para seguir mis Macros.
35. Como usuario, quiero que solo las Elecciones confirmadas cuenten en el progreso, para que lo que veo sea lo que comí.
36. Como usuario, quiero ver el aporte de la Selección sin confirmar como un tramo translúcido sobre las barras, para prever cómo quedaría el Día antes de confirmar.
37. Como usuario, quiero que una barra se pinte en ámbar (no en rojo) si me paso del Objetivo, para enterarme sin que parezca un error grave.
38. Como usuario, quiero que el progreso se actualice al instante al confirmar o desconfirmar, para ver el efecto de cada Elección.
39. Como usuario, quiero que la cabecera siga visible mientras desplazo los Momentos, para no perder el progreso de vista.

### Persistencia y cambio de día

40. Como usuario, quiero que mis Elecciones de hoy se mantengan al cerrar y reabrir la app, para no perder lo marcado.
41. Como usuario, quiero que al día siguiente el Home aparezca vacío, para empezar a elegir de nuevo.
42. Como usuario, quiero que el cambio de día ocurra a medianoche según la hora local de mi dispositivo, para que coincida con mi día real.
43. Como usuario, quiero que si dejo la app en segundo plano y vuelvo al día siguiente, se muestre el Día nuevo, para no registrar en el Día equivocado.
44. Como usuario, quiero que si confirmo justo después de medianoche con la pantalla todavía mostrando el día anterior, la Elección se guarde en el Día nuevo y la vista pase a él, para que la fecha sea siempre la real.
45. Como usuario, quiero que una Elección guarde una copia de la Tarjeta tal como era al confirmarla, para que el Historial no cambie si las Tarjetas se recalculan después.
46. Como usuario, quiero que cada Día guarde el Objetivo que tenía, para que su progreso siga siendo correcto si el Objetivo cambia en el futuro.
47. Como usuario, quiero que si tengo la app abierta en dos pestañas, una Elección hecha en una aparezca en la otra, para no ver datos desactualizados.
48. Como usuario, quiero que un Día al que le quito todas las Elecciones deje de existir, para que el Historial no tenga Días vacíos.

### Historial

49. Como usuario, quiero un icono en la cabecera que abra el Historial, para revisar días anteriores.
50. Como usuario, quiero ver el Historial como una lista de Días, del más reciente al más antiguo, para encontrar rápido lo último.
51. Como usuario, quiero ver en cada Día del Historial su fecha, sus kcal totales frente al Objetivo y el nombre de la Tarjeta elegida en cada Momento, para recordar qué comí.
52. Como usuario, quiero ver claramente qué Momentos quedaron sin Elección en un Día pasado, para detectar los días incompletos.
53. Como usuario, quiero que el Historial sea solo de lectura, para que mi registro no cambie por accidente.
54. Como usuario, quiero que el Historial no incluya el Día de hoy, porque hoy ya lo veo en el Home.
55. Como usuario, quiero volver al Home desde el Historial con un botón o con el botón atrás del navegador, para que la navegación sea natural.
56. Como usuario, quiero un mensaje amable cuando el Historial está vacío, para entender que aún no hay días registrados.

### Instalación, apariencia y publicación

57. Como usuario, quiero instalar la app en la pantalla de inicio del móvil, para abrirla como una app nativa.
58. Como usuario, quiero que la app funcione sin conexión, porque las Tarjetas y mis datos son locales.
59. Como usuario, quiero que la app siga el tema claro u oscuro del sistema, para usarla cómodamente de noche.
60. Como usuario de escritorio, quiero que la app se vea centrada con un ancho máximo, para que no se estire de forma rara.
61. Como usuario, quiero toda la interfaz en castellano, porque es mi idioma.
62. Como desarrollador, quiero que cada push a `main` publique la app en GitHub Pages automáticamente, para no desplegar a mano.
63. Como desarrollador, quiero que la app tome las Tarjetas y los Objetivos de los JSON generados por `scripts/calcular.py` en el build, para que recalcular y publicar sea un único flujo.
64. Como desarrollador, quiero que el almacenamiento pase una batería de tests de contrato independiente de la implementación, para poder cambiar `localStorage` por Firebase con el mismo comportamiento exacto, reactividad incluida.

## Implementation Decisions

### Stack y estructura

- React + Vite + TypeScript, con Tailwind CSS v4. Sin router ni librería de componentes.
- La app Vite vive en la raíz del repo, junto a `data/` y `scripts/`.
- La interfaz está en castellano. El código y los identificadores, en inglés, según el glosario: `Card`, `Moment`, `Choice`, `Selection`, `Day`, `Goal`, `History`.
- Vite usa `base` `/food-cards/` (repo `francosang/food-cards`, URL `https://francosang.github.io/food-cards/`).
- PWA con `vite-plugin-pwa`: manifest, iconos y service worker que precachea la app para funcionar sin conexión.
- Tema claro/oscuro según `prefers-color-scheme`.
- Navegación entre Home e Historial por hash (`#/historial`). Funciona en GitHub Pages sin trucos de 404 y el botón atrás del navegador vuelve al Home.

### Datos de entrada

- La app importa `data/tarjetas.json` (Objetivos y Tarjetas con ingredientes, gramos, nutrición y preparación) de forma estática en el build. No hay `fetch` en tiempo de ejecución.
- La unidad casera ("2 rebanadas") se calcula en la app a partir de los datos de unidad de `data/ingredientes.json`, con la misma regla que `scripts/calcular.py` (múltiplos de ¼, con plural si es mayor que 1). Alternativa válida: que `calcular.py --json` añada el texto de la unidad casera a cada ingrediente de `tarjetas.json`, y la app solo lo muestra. Se prefiere esta, porque deja una sola implementación de la regla.
- Los Objetivos son fijos (vienen de `data/objetivos.json`, incluido en `tarjetas.json`) y no se editan desde la app.

### Iconos de ingredientes

- Se usan iconos SVG de Fluent Emoji Flat (Microsoft, licencia MIT), incluidos en el proyecto (sin CDN, para funcionar sin conexión). Se respeta la licencia con su nota de atribución.
- Un mapeo ingrediente → icono, con un icono genérico por categoría como respaldo (lácteo, proteína, pescado, legumbre, cereal, tubérculo, verdura, fruta, grasa, otro). Los ingredientes sin icono propio adecuado (claras, whey, queso batido…) usan el de su categoría.
- La Tarjeta muestra los iconos de sus 3-4 ingredientes principales: los de más peso, excluyendo aceite y condimentos. El diálogo de detalles muestra el icono de cada ingrediente.

### Modelo de dominio

- **Selección:** estado efímero de la interfaz, como mucho una por Momento. Nunca pasa por el repositorio.
- **Elección:** la Tarjeta confirmada en un Momento de un Día. Guarda un snapshot completo de la Tarjeta (id, nombre, Momento, tipo, ingredientes con gramos y nutrición), según el ADR-0002.
- **Día:** un documento por fecha local `YYYY-MM-DD`, con el snapshot del Objetivo vigente y como máximo una Elección por Momento:
  - `date`
  - `goal`: el snapshot del Objetivo, diario y por Momento
  - `choices`: un mapa opcional de Momento → snapshot de Tarjeta
- Un Día sin Elecciones no existe: al quitar la última Elección se borra su documento.
- Transiciones por Momento:
  - **Sin nada:** tocar una Tarjeta la deja seleccionada.
  - **Seleccionada:** tocar otra Tarjeta mueve la Selección; tocar la misma la quita; tocar el tick confirma.
  - **Confirmada:** tocar Tarjetas no hace nada; tocar el tick desconfirma y la misma Tarjeta vuelve a quedar seleccionada.
- Progreso del Día: suma de la nutrición de las Elecciones, frente al Objetivo diario guardado en el Día (o, si el Día aún no existe, el Objetivo actual). La vista previa suma además la Selección sin confirmar de cada Momento todavía sin Elección. Las barras pasan a ámbar si se supera el Objetivo.

### Repositorio de Días (ADR-0001)

- Interfaz reactiva con la forma de Firestore:
  - `subscribeDay(date, listener) → unsubscribe`: emite el Día (o su ausencia) en cuanto te suscribes y después en cada cambio.
  - `subscribeHistory(listener) → unsubscribe`: emite todos los Días ordenados por fecha descendente, y después en cada cambio.
  - `confirmChoice(date, moment, cardSnapshot, goalSnapshot) → Promise`: crea el Día si no existe (guardando el Objetivo) y fija la Elección del Momento.
  - `removeChoice(date, moment) → Promise`: quita la Elección y borra el Día si queda vacío.
- Todas las escrituras son asíncronas y todas las lecturas son por suscripción, aunque `localStorage` sea síncrono. La UI no lee nunca el almacenamiento de forma directa.
- Implementaciones:
  - **En memoria:** para tests y como referencia.
  - **`localStorage`:** con un espacio de nombres y versión de esquema propios. Escucha el evento `storage` para notificar cambios hechos en otras pestañas, como Firestore notifica los de otros dispositivos.
- La app recibe el repositorio por inyección (un provider de React), igual que el reloj.

### "Hoy" y cambio de día (ADR-0003)

- "Hoy" es la fecha local que devuelve un reloj inyectable, nunca un estado guardado.
- Se vuelve a leer:
  - al montar la app,
  - en `visibilitychange` (al volver a visible),
  - justo antes de cada confirmación o desconfirmación.
- Si la fecha cambió, la vista pasa al Día nuevo (y la suscripción cambia de fecha) antes de escribir.
- No hay temporizador de medianoche. Al cambiar de Día se descartan las Selecciones.

### Interfaz

- **Cabecera fija:** las kcal en grande con su barra, tres barras finas de P, C y G, el tramo translúcido de la vista previa, ámbar al pasarse y un icono de Historial.
- **Home:** los cuatro Momentos en vertical, en orden fijo. Cada uno tiene un banner con su nombre, sus kcal objetivo y el tick:
  - el tick no aparece si no hay Selección,
  - aparece como "confirmar" (contorno) si hay Selección,
  - aparece relleno si hay Elección.
- **Carrusel:** scroll-snap CSS nativo. Al cargar, un Momento confirmado se desplaza hasta su Tarjeta elegida; los demás empiezan en la primera.
- **Tarjeta:** tamaño fijo, con el nombre, las kcal, los chips de P, C y G, los iconos de ingredientes y la etiqueta dulce/salado (en desayuno y merienda). Tiene estados normal, seleccionada y confirmada. El botón "Ver detalles" ocupa un hueco reservado, así que la tarjeta no cambia de tamaño.
- **Diálogo de detalles:** elemento nativo `<dialog>` abierto como modal, solo de lectura. Se cierra con un botón, con Escape o tocando el fondo.
- **Historial:** una lista de Días anteriores a hoy, de más reciente a más antiguo. Cada fila tiene la fecha en castellano, las kcal frente al Objetivo del Día y los cuatro Momentos con el nombre de la Tarjeta elegida (o "—"). Incluye un estado vacío.
- **Accesibilidad:**
  - las Tarjetas son botones con `aria-pressed`,
  - el tick es un botón con una etiqueta que cambia ("Confirmar desayuno" / "Quitar elección de desayuno"),
  - el diálogo atrapa el foco.

### Publicación

- Un workflow de GitHub Actions instala, ejecuta los tests, construye y publica en GitHub Pages en cada push a `main`. Si un test falla, no se publica.

## Testing Decisions

- Un buen test comprueba comportamiento externo a través de un seam público: lo que el usuario ve y hace, o lo que el contrato del repositorio promete. Nunca detalles internos (estado de React, nombres de funciones auxiliares, claves internas de `localStorage`). Debe poder refactorizarse el interior sin tocar los tests.
- Herramientas: Vitest y Testing Library (con `user-event`), sobre jsdom.
- Se desarrolla con TDD, una porción roja-verde cada vez.

### Seam 1: contrato del repositorio de Días

Una única batería de tests, parametrizada por una función que crea el repositorio, que se ejecuta contra la implementación en memoria y contra la de `localStorage` (y en el futuro contra Firestore con su emulador, sin cambiar los tests). Cubre:

- `subscribeDay` emite el estado actual al suscribirse: ausencia si no hay Día, el Día si existe.
- `subscribeHistory` emite el estado actual al suscribirse: lista vacía o lista ordenada.
- Confirmar una Elección crea el Día con el Objetivo, la guarda y notifica a todos los suscriptores de esa fecha y del Historial.
- Confirmar en un Momento ya confirmado reemplaza la Elección.
- Quitar una Elección notifica; quitar la última borra el Día (`subscribeDay` emite ausencia y el Historial deja de incluirlo).
- Quitar en un Momento sin Elección no falla ni notifica cambios espurios.
- Las fechas están aisladas: escribir en una fecha no notifica a los suscriptores de otra.
- Después de `unsubscribe` no se reciben más notificaciones, y desuscribir dos veces es inocuo.
- Varios suscriptores de la misma fecha reciben todos los cambios.
- Escrituras seguidas sin esperar se aplican en orden, y el estado final es el de la última.
- Las promesas de escritura se resuelven después de que el cambio sea observable por una suscripción nueva.
- El Historial está ordenado por fecha descendente.
- Persistencia (solo para implementaciones duraderas): un repositorio nuevo sobre el mismo almacenamiento ve los datos anteriores.
- Cambios externos: una escritura hecha por otra instancia (otra pestaña, simulando el evento `storage`) notifica a los suscriptores de esta.
- Los snapshots devueltos no se pueden mutar desde fuera: modificar un objeto recibido no altera lo guardado.
- Datos corruptos o de una versión de esquema desconocida en `localStorage` no rompen la app (se tratan como vacíos), sin perder silenciosamente datos válidos.

### Seam 2: la app completa

Se renderiza el componente raíz con Testing Library, inyectando el repositorio en memoria y un reloj falso controlable. Cubre:

- Se muestran los cuatro Momentos en orden con sus Tarjetas, con nombre, kcal y P, C y G.
- Tocar una Tarjeta la selecciona: se resalta, aparece "Ver detalles" y aparece el tick en el banner, pero los totales de la cabecera no cambian (salvo la vista previa).
- Tocar otra Tarjeta mueve la Selección, y tocar la misma la quita.
- Confirmar con el tick suma la nutrición a la cabecera y la Elección queda en el repositorio con el snapshot de la Tarjeta y el Objetivo.
- Con el Momento confirmado, tocar otra Tarjeta no cambia nada. Desconfirmar resta la nutrición y deja la Tarjeta seleccionada.
- Las cuatro Elecciones suman los totales esperados frente al Objetivo, y pasarse del Objetivo marca la barra como excedida.
- "Ver detalles" abre un diálogo con ingredientes, gramos, unidad casera, nutrición con fibra y preparación, y se cierra con Escape y con el botón.
- Al montar la app con Elecciones ya guardadas para hoy, se muestran confirmadas.
- Al avanzar el reloj al día siguiente y emitir `visibilitychange`, el Home queda vacío y el Día anterior aparece en el Historial.
- Si se confirma con el reloj ya en el día siguiente sin `visibilitychange` previo, la Elección cae en el Día nuevo y la vista pasa a él.
- Un cambio externo en el repositorio (simulando otra pestaña) se refleja en el Home.
- El Historial lista los Días anteriores (no hoy), en orden, con sus Elecciones y "—" en los Momentos vacíos. Muestra un estado vacío si no hay Días.
- Navegar al Historial y volver con el botón atrás funciona.

Las funciones puras del dominio (totales, vista previa, transiciones, unidades caseras) se prueban a través de este seam. Solo se añaden tests unitarios sueltos si alguna se vuelve compleja.

### Antecedentes

Es el primer código de la app, así que no hay tests previos en el repo. Como referencia de estilo están los tests de `FoodMacrosTracker`, que inyectan `today` como función para fijar el reloj y usan repositorios falsos en memoria.

## Out of Scope

- Sincronización con Firebase, cuentas o login. El repositorio y sus tests de contrato quedan preparados para ello (ADR-0001).
- Exportar o importar el Historial (copia de seguridad en JSON).
- Editar Objetivos o Tarjetas desde la app, crear Tarjetas propias o ajustar cantidades.
- Editar o borrar Elecciones de Días pasados.
- Filtrar Tarjetas por ingredientes disponibles ("qué tengo en casa"). Los datos de ingredientes por Tarjeta ya lo permitirán más adelante.
- Objetivos distintos para días de entrenamiento y descanso.
- Notificaciones o recordatorios.
- Temporizador de medianoche (descartado a propósito, ADR-0003).
- Estadísticas o gráficos del Historial.

## Further Notes

- Glosario: `GLOSSARY.md` (Tarjeta, Momento, Selección, Elección, Día, Objetivo, Historial, Macros).
- Decisiones: ADR-0001 (datos en el navegador tras un repositorio reactivo), ADR-0002 (snapshot de la Tarjeta en cada Elección) y ADR-0003 ("hoy" derivado del reloj, sin reinicio).
- Las Tarjetas y sus valores nutricionales se generan con `scripts/calcular.py` a partir de `data/recetas.json`, `data/ingredientes.json` y `data/objetivos.json`. Si se elige que la unidad casera venga precalculada, ese script es el sitio donde añadirla.
- Inspiración de dominio: `FoodMacrosTracker` (Day Log keyed por fecha, Entries como snapshots).
