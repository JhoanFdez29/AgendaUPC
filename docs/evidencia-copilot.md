# Evidencia reproducible de uso de GitHub Copilot

Esta guía permite producir evidencia real y verificable del uso de GitHub Copilot. No sustituya las capturas: abra el proyecto en Visual Studio Code, ejecute cada interacción con Copilot, evalúe la respuesta y conserve una imagen donde se vea el prompt y una parte relevante de la sugerencia.

## Registro de interacciones

### 1. Diseño de la solución

**Prompt sugerido**

> Analiza esta problemática: estudiantes universitarios administran tareas de varios cursos y pierden fechas límite. Propón una aplicación web estática compatible con GitHub Pages, con alcance pequeño, funcionalidades medibles y datos guardados en el navegador.

**Decisión del estudiante**

Se aceptó la arquitectura estática y el uso de `localStorage`. No se agregó autenticación ni base de datos porque excedían el alcance y no eran necesarias para validar el caso de uso.

**Evidencia que debe capturarse:** prompt y propuesta de arquitectura en el panel de Copilot Chat.

### 2. Lógica de fechas

**Prompt sugerido**

> Revisa `assets/utils.js`. Explica posibles errores de zona horaria al convertir una fecha con formato YYYY-MM-DD y propone una función que mantenga la fecha en horario local.

**Decisión del estudiante**

Se usó una construcción `new Date(año, mes - 1, día)` en lugar de interpretar directamente la cadena como UTC. Así se evita que la fecha cambie al día anterior en determinados husos horarios.

**Evidencia que debe capturarse:** explicación de Copilot y comparación de las dos formas de crear la fecha.

### 3. Validación y seguridad

**Prompt sugerido**

> Revisa el flujo de creación e importación de tareas. Identifica validaciones faltantes y riesgos de insertar contenido escrito por el usuario en el DOM. Sugiere correcciones sin agregar dependencias.

**Decisión del estudiante**

Se limitaron longitudes y rangos, se normalizaron los datos importados y se utilizó `textContent` para mostrar títulos, cursos y notas. No se usó `innerHTML` con datos del usuario.

**Evidencia que debe capturarse:** recomendaciones de validación y fragmento corregido.

### 4. Refactorización

**Prompt sugerido**

> Refactoriza la lógica de estadísticas y filtros para que pueda probarse sin acceder al DOM. Mantén funciones puras y no cambies el comportamiento visible.

**Decisión del estudiante**

La lógica se separó en `assets/utils.js`. La interfaz importa esas funciones desde `assets/app.js`, lo que reduce el acoplamiento y permite ejecutar pruebas con Node.js.

**Evidencia que debe capturarse:** sugerencia de separación y diff de los archivos.

### 5. Generación de pruebas

**Prompt sugerido**

> Genera pruebas con `node:assert/strict` para validar tareas vencidas, próximas, completadas, estadísticas y filtros. Usa como fecha fija el 24 de octubre de 2026.

**Decisión del estudiante**

Se revisaron los valores esperados y se conservaron pruebas deterministas en `tests/run-tests.mjs`. Después se ejecutó el archivo desde la terminal y se comprobó que todas las pruebas pasaran.

**Evidencia que debe capturarse:** prompt, prueba propuesta y salida `Todas las pruebas de lógica pasaron.`

## Reflexión breve

GitHub Copilot se utiliza como apoyo para analizar alternativas, detectar riesgos, refactorizar y proponer pruebas. Cada sugerencia debe compararse con los requisitos del proyecto. Las decisiones finales priorizan compatibilidad con GitHub Pages, claridad del código, validación de datos y una experiencia sencilla para el usuario.

## Lista de evidencias

- [ ] Captura del análisis de arquitectura.
- [ ] Captura de la explicación sobre fechas locales.
- [ ] Captura de las recomendaciones de validación.
- [ ] Captura del refactor de lógica.
- [ ] Captura de la generación y ejecución de pruebas.
- [ ] Confirmación de que el estudiante puede explicar las decisiones anteriores.
