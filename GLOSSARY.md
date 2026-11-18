# Food Cards

App personal para elegir, en cada momento del día, una idea de comida entre opciones intercambiables de igual valor calórico, de modo que cualquier combinación cumpla el objetivo diario.

## Language

**Tarjeta** (`Card`):
Una idea de comida concreta, con sus ingredientes en gramos, su nutrición y su preparación. Todas las Tarjetas de un mismo Momento aportan las mismas kcal y macros dentro de la tolerancia.
_Avoid_: comida, plato, receta, meal

**Momento** (`Moment`):
Uno de los cuatro tramos del día: desayuno, almuerzo, merienda o cena. Cada Momento tiene su propio Objetivo y sus propias Tarjetas.
_Avoid_: comida, toma, meal time

**Elección** (`Choice`):
La Tarjeta que el usuario confirma haber comido en un Momento de un Día. Como máximo una por Momento y Día.
_Avoid_: registro, entrada, marca, entry

**Selección** (`Selection`):
Una Tarjeta resaltada en un Momento pero todavía no confirmada. Permite ver sus detalles y su aporte previsto sin que cuente para el Día.
_Avoid_: elección pendiente, borrador

**Día** (`Day`):
Las Elecciones de una fecha local y su progreso hacia el Objetivo diario.
_Avoid_: jornada, day log, diario

**Objetivo** (`Goal`):
Las kcal y macros a alcanzar: el diario y su reparto por Momento.
_Avoid_: meta, target, límite

**Historial** (`History`):
Los Días anteriores a hoy que tienen al menos una Elección.
_Avoid_: histórico, archivo, log

**Macros**:
Proteína, carbohidratos y grasas. Las kcal y la fibra se muestran junto a ellos pero no son Macros.
_Avoid_: macronutrientes, nutrientes (para referirse a los tres)
