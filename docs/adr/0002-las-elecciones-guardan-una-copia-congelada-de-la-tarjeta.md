# Las Elecciones guardan una copia congelada de la Tarjeta

Las Tarjetas se regeneran con `scripts/calcular.py` y pueden cambiar de gramos o de nutrición, o desaparecer. Por eso una Elección no guarda solo el `id` de la Tarjeta, sino una copia congelada (nombre, Momento, ingredientes con gramos y nutrición) tomada al confirmarla. El Historial muestra siempre lo que se comió ese día, sin consultar las Tarjetas actuales. Es el mismo criterio que el ADR-0007 de FoodMacrosTracker.
