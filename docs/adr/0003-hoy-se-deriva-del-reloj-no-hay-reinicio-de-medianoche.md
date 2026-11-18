# "Hoy" se deriva del reloj: no hay reinicio de medianoche

El Home empieza vacío cada día sin que se reinicie ni archive nada. Cada Elección se guarda con su fecha local, y el Home muestra el Día cuya fecha es "hoy", calculada con un reloj inyectable. La fecha se vuelve a leer al abrir la app, al volver al primer plano (`visibilitychange`) y antes de cada escritura. Si cambió, la vista pasa al Día nuevo, que está vacío, y el anterior queda como Historial sin moverlo.

No hay temporizador de medianoche, a propósito. En el navegador los temporizadores se pausan en segundo plano, y el único caso que cubriría (mirar la pantalla justo al pasar la medianoche) se resuelve con el siguiente toque. Es el mismo modelo de FoodMacrosTracker, que guarda las entradas con su fecha, pero sin su ticker.
