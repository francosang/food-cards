# Datos solo en el navegador, detrás de un repositorio reactivo

La app se publica en GitHub Pages (estática, sin backend), así que los Días y sus Elecciones se guardan en el navegador (`localStorage`): un solo dispositivo, sin cuenta. Descartamos Firebase por ahora porque añade login y configuración que una app personal de un usuario no necesita todavía. Como la intención es migrar a Firebase más adelante, el almacenamiento queda detrás de una interfaz de repositorio con la forma de Firestore (lecturas por suscripción que notifican cambios, escrituras asíncronas) y un conjunto de tests de contrato que toda implementación debe pasar sin cambios.

## Consecuencias

- Borrar los datos del navegador borra el Historial. Mitigación prevista: exportar el Historial a JSON.
- Aunque `localStorage` es síncrono, el repositorio expone escrituras asíncronas y lecturas reactivas, para que la UI ya esté escrita como lo exigirá Firestore.
- Un documento por Día (como `days/{YYYY-MM-DD}` en Firestore), con un snapshot del Objetivo y como máximo una Elección por Momento. Un Día sin Elecciones no se guarda.
- Los cambios hechos en otra pestaña (evento `storage`) notifican a los suscriptores, igual que Firestore notifica los cambios de otro dispositivo. Los tests de contrato lo cubren.
