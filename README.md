# AgendaUPC

AgendaUPC es una aplicación web estática para organizar tareas académicas, priorizar entregas y detectar fechas críticas. Funciona directamente en el navegador, guarda la información de forma local y puede publicarse sin cambios en GitHub Pages.

## Problemática

Los estudiantes suelen recibir tareas por distintos cursos y canales. Al no tener una vista consolidada, pueden perder fechas límite, subestimar la carga semanal o atender primero actividades de baja prioridad.

- **Contexto:** organización académica de estudiantes universitarios.
- **Problema:** tareas dispersas, poca visibilidad de las fechas críticas y dificultad para estimar la carga pendiente.
- **Usuario objetivo:** estudiantes de la UPC que gestionan varias asignaturas al mismo tiempo.
- **Solución:** una agenda web ligera que concentra tareas, las ordena por fecha y prioridad, y muestra indicadores útiles para planificar la semana.

## Funcionalidades

- Crear, editar, completar y eliminar tareas.
- Registrar curso, fecha límite, prioridad, horas estimadas y notas.
- Buscar por título, curso o contenido de las notas.
- Filtrar por estado y prioridad.
- Detectar tareas vencidas y próximas a vencer.
- Calcular progreso, carga pendiente y cursos activos.
- Guardar automáticamente los datos en `localStorage`.
- Exportar e importar un respaldo en formato JSON.
- Cambiar entre tema claro y oscuro.
- Usar una interfaz adaptable a computadoras y teléfonos.

## Tecnologías y arquitectura

La solución utiliza HTML semántico, CSS y JavaScript moderno sin dependencias externas. La lógica reutilizable se encuentra en `assets/utils.js`; la interacción de la interfaz se concentra en `assets/app.js`; los estilos están en `assets/styles.css`. Esta arquitectura mantiene el proyecto simple, auditable y compatible con GitHub Pages.

```text
AgendaUPC/
├── .github/workflows/pages.yml
├── assets/
│   ├── app.js
│   ├── styles.css
│   └── utils.js
├── docs/
│   ├── evidencia-copilot.md
│   ├── guion-video.md
│   └── lista-entrega.md
├── tests/run-tests.mjs
├── .nojekyll
├── index.html
└── README.md
```

## Ejecución local

La forma más simple es abrir `index.html` en un servidor local. Desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Luego visite `http://localhost:8000`.

También puede usar la extensión Live Server de Visual Studio Code.

## Pruebas

Las pruebas cubren validación, estados de vencimiento, cálculos del panel y filtros.

```bash
node tests/run-tests.mjs
```

Resultado esperado:

```text
Todas las pruebas de lógica pasaron.
```

## Publicación en GitHub Pages

1. Cree un repositorio público vacío en GitHub.
2. Ejecute estos comandos dentro de la carpeta `AgendaUPC` y sustituya la URL por la de su repositorio:

```bash
git init
git add .
git commit -m "feat: publicar primera versión de AgendaUPC"
git branch -M main
git remote add origin https://github.com/USUARIO/AgendaUPC.git
git push -u origin main
```

3. En GitHub, abra **Settings > Pages**.
4. En **Build and deployment**, seleccione **GitHub Actions**.
5. Espere a que el flujo `Publicar AgendaUPC en GitHub Pages` termine correctamente.
6. Abra la URL indicada por GitHub y compruebe la creación, edición, filtrado y persistencia de tareas.

La aplicación usa rutas relativas, por lo que funciona tanto en el dominio principal como en una ruta de repositorio.

## Uso responsable de GitHub Copilot

La evidencia exigida por la evaluación debe corresponder a interacciones reales realizadas desde la cuenta del estudiante. El archivo [`docs/evidencia-copilot.md`](docs/evidencia-copilot.md) contiene una bitácora reproducible de prompts, decisiones y verificaciones. Ejecute esas interacciones en GitHub Copilot, revise las sugerencias antes de aceptarlas y reemplace los espacios de evidencia con capturas propias.

Decisiones técnicas que deben poder explicarse:

- Se eligió una arquitectura estática porque GitHub Pages no ejecuta servidores de aplicaciones.
- Se usó `localStorage` porque la información es personal, pequeña y no requiere una base de datos para este alcance.
- La fecha se interpreta en horario local para evitar desplazamientos de un día provocados por UTC.
- La importación valida cada registro antes de reemplazar los datos existentes.
- El contenido escrito por el usuario se inserta con `textContent`, lo que evita interpretar HTML no confiable.

## Privacidad y limitaciones

Los datos permanecen en el navegador y no se envían a un servidor. Si se borra el almacenamiento del sitio, las tareas también se eliminan; por eso se incluye la exportación a JSON. La aplicación no sincroniza información entre dispositivos ni gestiona cuentas de usuario.

## Guion y lista de entrega

- [`docs/guion-video.md`](docs/guion-video.md): guion cronometrado para un video de hasta un minuto.
- [`docs/lista-entrega.md`](docs/lista-entrega.md): verificación final del repositorio, GitHub Pages y video.

## Autor

Proyecto académico listo para personalizar con los datos del estudiante y los enlaces públicos de entrega.
