# Fake API · Calificaciones (mockup vivo)

Capa que simula el backend en memoria para validar la UX del cuaderno docente antes de conectar APIs reales.

## Por qué existe

- Latencia realista (300–500 ms).
- Errores de red simulados (~3 %).
- Auto-guardado y estados de celda sin depender del servidor.
- Los datos **no persisten** al recargar la página (el estado vive en `fakeDatabase.js`).

## Estructura

| Archivo | Rol |
|---------|-----|
| `fakeApiClient.js` | Latencia, probabilidad de error, delegación al endpoint |
| `fakeDatabase.js` | Estado mutable en memoria |
| `endpoints/cursos.endpoint.js` | Listado de cursos del docente |
| `endpoints/cuaderno.endpoint.js` | Cuaderno por curso y bimestre |
| `endpoints/evaluaciones.endpoint.js` | Notas y CRUD de evaluaciones bimestrales |
| `endpoints/tiposEvaluacion.endpoint.js` | Catálogo de tipos (ámbito BIMESTRE) |
| `endpoints/ajustesCurso.endpoint.js` | Overrides de cuota, finales y asistencia por curso |
| `endpoints/tablero.endpoint.js` | Tablero de coordinación (bimestres de la gestión) |
| `endpoints/vistaAdmin.endpoint.js` | Lista docentes e impersonación |
| `endpoints/politicaInstitucional.endpoint.js` | Política institucional (Nivel 1) |
| `impersonacionAudit.js` | Auditoría de ediciones en modo admin |
| `index.js` | Facade `calificacionesFakeApi` usada por los hooks |

## Cómo reemplazar por backend real (Fase 2-bis)

1. Mantener las **mismas firmas** en cada `*.endpoint.js` (mismos parámetros y forma del objeto de respuesta).
2. Sustituir el cuerpo de cada función por `fetch` / cliente HTTP del proyecto.
3. En `index.js`, opcionalmente bifurcar: `import { calificacionesFakeApi } from './fake-api'` vs `import { calificacionesApi } from './api'`.
4. **No modificar** `useMisCursosCalificaciones`, `useCuadernoCurso`, `useNotaAutosave` ni los componentes de presentation.

## Ajustes para QA

En `fakeApiClient.js`:

- `FAKE_ERROR_RATE`: `0.03` por defecto; poner `0` para desactivar errores.
- `MIN_DELAY_MS` / `MAX_DELAY_MS`: rango de latencia simulada.
