# Guía: Activación del cursado del estudiante (estado, horario, bimestres y calificaciones)

> Documento de referencia para implementar, en próximas iteraciones, el paso de
> **INSCRITO → CURSANDO**, la visualización del **horario** del estudiante y la
> habilitación de **bimestres / calificaciones / asistencia** sobre el **nuevo
> enfoque** de schema (oferta de cursos + asignación de horarios).
>
> Fecha base: 2026-06. No contiene cambios de código; describe el estado actual,
> la cadena de datos y la brecha pendiente.

---

## 1. Modelo mental: la cadena de datos del nuevo enfoque

El cambio estructural clave respecto al esquema viejo es que **la matrícula del
estudiante ya NO apunta al docente**, sino a la **oferta de curso**:

```
estudiante
 └─ estudiantes_datos_academicos
     └─ inscripciones                         (estudiante en una gestión)
         └─ matriculas_materia                (una por materia que cursa)
             ├─ oferta_curso_id   ───────────►  oferta_cursos   ◄── ANCLA ESTABLE
             │                                     └─ paralelo_gestion_id → paralelos_gestion (turno, aula base)
             │                                     └─ asignatura_plan_id  → materia + periodo + horas
             └─ asignatura_plan_id (redundancia controlada)

oferta_cursos (1) ──► asignaciones_docentes (N)     ¿QUIÉN dicta? (docente, vigente)
                          └─ asignacion_horarios (N) ──► horarios (día + hora + turno)
                                                          (aula efectiva = paralelos_gestion.aula_id)
```

**Regla de oro del nuevo enfoque:** para pasar de “la materia que cursa el
estudiante” (`matriculas_materia.oferta_curso_id`) a “quién la dicta y en qué
bloques” (docente, horario, cuaderno de notas) **se puentea por
`oferta_cursos`**, no por el docente directamente:

```sql
matriculas_materia mm
  JOIN asignaciones_docentes ad
    ON ad.oferta_curso_id = mm.oferta_curso_id     -- ← puente nuevo
   AND ad.vigente = 1 AND ad.deleted_at IS NULL
  JOIN asignacion_horarios ah ON ah.asignacion_docente_id = ad.id
  JOIN horarios h             ON h.id = ah.horario_id
```

En el esquema **viejo** ese puente era directo (`mm.asignacion_docente_id`).
Ese cambio es la causa de la brecha descrita en la **sección 6**.

Archivos de schema que sustentan esto:
- `backend/database/01-schemas/08-estructura-academica-oferta.sql` — `paralelos_gestion`, `oferta_cursos`.
- `backend/database/01-schemas/09-estructura-academica-horarios.sql` — `asignaciones_docentes`, `asignacion_horarios`.
- `backend/database/01-schemas/13-inscripciones.sql` — `inscripciones`, `matriculas_materia`.
- `backend/database/01-schemas/15-evaluaciones.sql` — `bimestres_matricula`, `evaluaciones`, `evaluaciones_notas`, `tipos_evaluacion`, `configuracion_evaluacion`.
- `backend/database/01-schemas/17-asistencias-licencias.sql` — `asistencias`.

---

## 2. Estados de la matrícula (`matriculas_materia.estado`)

Catálogo: `backend/src/domain/constants/inscripciones.constants.js:40-47`

| Estado | Significado |
|---|---|
| `INSCRITO` | Matriculado, el cursado aún no inicia. **Estado inicial** que carga la migración. |
| `CURSANDO` | Cursando: ya hay bimestres abiertos y se pueden registrar notas/asistencia. |
| `APROBADO` | Nota efectiva ≥ 61. |
| `REPROBADO` | Nota efectiva < 61. |
| `ABANDONO` / `RETIRADO` | Casos administrativos (detalle en `historial_matricula`, schema 16). |

Modelo Sequelize: `backend/src/infrastructure/database/models/matricula_materia.js`
(usa `oferta_curso_id`; **no** tiene `asignacion_docente_id`).

> La migración `05-migrations/20-migrate-matriculas-materia.sql` deja a todos en
> el estado que traía el dump (la mayoría `INSCRITO`). El paso a `CURSANDO` es el
> “arranque” del ciclo académico descrito abajo.

---

## 3. ¿Qué acción dispara el cambio INSCRITO → CURSANDO?

Hoy el cambio **no es por estudiante**, sino una operación **masiva por gestión**
("iniciar gestión académica"), que además **crea los 4 bimestres** de cada matrícula.

### Cadena del evento (frontend → backend)

| Capa | Pieza | Ubicación |
|---|---|---|
| Frontend (repo) | `CalificacionRepository.iniciarGestionAcademica()` → `POST /v1/calificaciones/gestion-bimestres/iniciar` | `frontend/src/infrastructure/repositories/CalificacionRepository.js` |
| Frontend (UI) | **NO existe aún** un botón/página que invoque ese método | — (pendiente) |
| Ruta | `POST /calificaciones/gestion-bimestres/iniciar` | `backend/src/presentation/routes/calificaciones.routes.js:184` |
| Controller | `iniciarGestionAcademicaController` | `presentation/controllers/academico/calificaciones/` |
| Use case | `IniciarGestionAcademicaUseCase.execute({ userId })` | `backend/src/application/use-cases/academico/IniciarGestionAcademicaUseCase.js` |
| Repositorio | `GestionBimestresRepository.iniciarGestionAcademica(userId)` | `backend/src/infrastructure/repositories/GestionBimestresRepository.js:94` |

Lo que hace el repositorio (gestión vigente):
1. `UPDATE matriculas_materia SET estado='CURSANDO' WHERE estado='INSCRITO'` (de la gestión).
2. Inserta 4 filas en `bimestres_matricula` por matrícula: bimestre 1 = `EN_CURSO`, 2–4 = `PENDIENTE`.

Guardas existentes:
- `GestionBimestresRepository.gestionAcademicaIniciada(gestionId)` evita doble inicio
  (si ya hay matrículas en `CURSANDO/APROBADO/REPROBADO`).

### Decisión de diseño para la próxima iteración

Hay dos modelos posibles; conviene definir cuál se quiere:

- **A. Arranque por gestión (lo que ya existe):** un solo evento administrativo
  pone todo el padrón en `CURSANDO` y abre bimestres. Falta: **conectar la UI**
  (botón “Iniciar gestión académica” en el módulo de calificaciones /
  gestión-bimestres) al método `iniciarGestionAcademica()` ya disponible.
- **B. Transición por estudiante al matricular:** que `CreateEnrollmentUseCase`
  (o una acción posterior) deje la matrícula en `CURSANDO` y cree sus bimestres
  individualmente. Hoy **no existe**; habría que crear un use case
  `CambiarEstadoMatriculaUseCase` y exponerlo. El frontend ya tiene el hueco
  reservado: `InscripcionRepository.cambiarEstado()` devuelve “endpoint no
  implementado” y apunta a `PATCH /v1/inscripciones/:id/activo`.

---

## 4. Horario de clases del estudiante

### Aclaración importante sobre “según el bimestre actual”
El **horario semanal es por gestión**, no por bimestre: los bloques
(`asignacion_horarios`) son los mismos durante los 4 bimestres. Lo que cambia con
el bimestre actual es el **contexto de notas/asistencia** (qué cuaderno está
`EN_CURSO`), no la grilla horaria. Por tanto:
- “Mostrar el horario del estudiante” = listar los bloques de las materias que
  cursa, derivados de su matrícula.
- “Según el bimestre actual” = filtrar/mostrar solo materias con
  `matriculas_materia.estado = 'CURSANDO'` y resaltar el bimestre vigente.

### Estado actual del código
- **Existe** horario **por paralelo**: `GetParaleloScheduleUseCase`
  (`GET /v1/paralelos/:id/schedule`) — devuelve el plan semanal del paralelo en la
  gestión vigente. Repos: `AsignacionHorarioRepository`, `HorarioGrillaRepository`.
- El detalle de inscripción ya **reutiliza** ese endpoint para pintar la grilla:
  `frontend/.../inscripciones/hooks/state/matricula-detail/useMatriculaDetailSchedules.js`
  + `InscripcionesDetail.jsx`.
- **NO existe** un endpoint “horario del estudiante” que arme la grilla a partir
  de **sus** matrículas (útil cuando un estudiante cursa materias de distintos
  paralelos/arrastres).

### Query de referencia (nuevo enfoque) para el horario del estudiante
```sql
SELECT  oc.id              AS oferta_curso_id,
        m.nombre           AS materia,
        pg.turno, pg.aula_id,
        d.nombres          AS docente,
        h.dia, h.hora_inicio, h.hora_fin, ah.orden_secuencia
FROM matriculas_materia mm
JOIN inscripciones i          ON i.id = mm.inscripcion_id
JOIN oferta_cursos oc         ON oc.id = mm.oferta_curso_id
JOIN paralelos_gestion pg     ON pg.id = oc.paralelo_gestion_id
JOIN asignaturas_plan apl     ON apl.id = oc.asignatura_plan_id
JOIN materias m               ON m.id = apl.materia_id
LEFT JOIN asignaciones_docentes ad ON ad.oferta_curso_id = oc.id
     AND ad.vigente = 1 AND ad.deleted_at IS NULL
LEFT JOIN docentes d          ON d.id = ad.docente_id
LEFT JOIN asignacion_horarios ah ON ah.asignacion_docente_id = ad.id
     AND ah.activo = 1 AND ah.deleted_at IS NULL
LEFT JOIN horarios h          ON h.id = ah.horario_id
WHERE i.id = ?                       -- inscripción del estudiante en la gestión
  AND mm.estado = 'CURSANDO'         -- solo lo que está cursando
  AND mm.deleted_at IS NULL AND mm.activo = 1
ORDER BY h.dia, h.hora_inicio;
```

> El aula efectiva es `paralelos_gestion.aula_id` (no vive en `asignacion_horarios`).

---

## 5. Bimestres, calificaciones (cuaderno) y asistencia

### 5.1 Jerarquía de evaluación (schema 15)
```
matriculas_materia
  └─ bimestres_matricula (4 filas: bim 1..4; nota_teorico, nota_practico, nota_bimestre, estado)
        └─ evaluaciones_notas (celda: nota del estudiante en una columna)  [carga perezosa]
              └─ evaluacion_id → evaluaciones (columna del cuaderno)
                    ├─ asignacion_docente_id  (el curso: docente+materia+paralelo+gestión)
                    └─ periodo_academico_id   (el bimestre del calendario; division='BIMESTRE')
```
- **Columna del cuaderno** (`evaluaciones`) cuelga del **curso** = `asignacion_docente_id`.
- **Celda** (`evaluaciones_notas`) cuelga del **bimestre operativo del estudiante**
  = `bimestre_matricula_id`.
- **Nota final** de la materia = Σ `nota_bimestre × peso` (pesos en
  `configuracion_evaluacion` clave `POLITICA_INSTITUCIONAL`; ya sincronizada en el
  seeder `59`, vigente para gestión 2026).

### 5.2 ¿Cómo se “habilitan” las calificaciones?
1. **Arrancar la gestión** (sección 3) → crea `bimestres_matricula` y pone bim 1 `EN_CURSO`.
2. El **cuaderno** se abre por **curso** (`asignacion_docente_id`) y bimestre:
   - `GET /v1/calificaciones/asignaciones/:asignacionId/cuaderno/:bimestre`
   - Repos/lógica: `CuadernoRepository` (`asegurarBimestresMatriculaCurso`,
     `listarEvaluaciones`, `upsertNotaCelda`, …).
3. El docente crea columnas (`evaluaciones`) y carga notas (`evaluaciones_notas`),
   con autosave (`PUT .../cuaderno/:bimestre/notas`).
4. Cierre por bimestre (Consejo de Docentes):
   `POST /v1/calificaciones/gestion-bimestres/bimestre/:numero/cerrar`
   (previa validación `.../validar-cierre`).

Endpoints completos: `backend/src/presentation/routes/calificaciones.routes.js`.

### 5.3 Determinación del “bimestre actual”
Deriva de `periodos_academicos` (`division='BIMESTRE'`, `numero_orden` 1..4 y fechas)
de la gestión vigente. Repos relevantes: `AcademicPeriodRepository`,
`CalificacionContextoRepository`. El estado por bimestre se consulta con
`GET /v1/calificaciones/gestion-bimestres`.

### 5.4 Asistencia
- Modelo y repo **existen**: `models/asistencia.js`
  (`matricula_materia_id`, `fecha_clase`, `hora_clase`, `estado`
  PRESENTE/AUSENTE/TARDANZA), `AttendanceRepository`.
- **NO hay rutas/controllers expuestos** todavía → es lo que falta cablear para
  registrar asistencia desde la UI. Cuelga directo de `matricula_materia_id`.

---

## 6. ⚠️ Brecha crítica antes de activar el cursado — ✅ RESUELTA (2026-06)

> **Estado:** corregido. Se eliminaron todas las referencias a
> `mm.asignacion_docente_id` en `GestionBimestresRepository.js` (4 sitios) y
> `CuadernoRepository.js` (6 sitios). Verificado: `grep` sin coincidencias +
> `node --check` OK. Se aplicaron dos puentes según la intención de cada query:
> - **Filtrar por gestión** (GestionBimestres): `oferta_cursos → paralelos_gestion → gestiones_planes` (1:1, sin fan-out).
> - **Alumnos de un curso (asignación docente)** (Cuaderno): `ad.oferta_curso_id = mm.oferta_curso_id` con `WHERE ad.id = ?`, o subconsulta escalar `mm.oferta_curso_id = (SELECT oferta_curso_id FROM asignaciones_docentes WHERE id = ?)` en los INSERT para no arrastrar fan-out.

El SQL **crudo** estaba escrito contra el esquema **viejo** y referenciaba una
columna que **ya no existe**:

```sql
-- En GestionBimestresRepository.js (líneas 19, 111, 137, 360, y COUNT en 53, 279)
INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id   -- ❌ viejo
```

En el nuevo schema `matriculas_materia` **no tiene** `asignacion_docente_id`
(tiene `oferta_curso_id`). Con los datos nuevos cargados, **`iniciar gestión` y
las consultas de bimestres fallarán o no encontrarán filas**. Hay que cambiar el
puente a:

```sql
INNER JOIN asignaciones_docentes ad
        ON ad.oferta_curso_id = mm.oferta_curso_id            -- ✅ nuevo
       AND ad.vigente = 1 AND ad.deleted_at IS NULL
```

> Ojo: como una `oferta_curso` puede tener varias `asignaciones_docentes` a lo
> largo del tiempo, el filtro `ad.vigente = 1` (y `deleted_at IS NULL`) es
> necesario para no duplicar matrículas al hacer el JOIN. Revisar también que el
> `COUNT(DISTINCT ... asignacion_docente_id)` siga teniendo el sentido deseado
> tras el cambio.

Revisar de la misma forma cualquier otro SQL crudo que toque
`matriculas_materia` + `asignaciones_docentes` (buscar en backend
`mm.asignacion_docente_id`).

---

## 7. Checklist para próximas iteraciones

| # | Tarea | Estado hoy | Dónde |
|---|---|---|---|
| 1 | Corregir puente `mm.asignacion_docente_id` → `oferta_curso_id` | ✅ hecho (2026-06) | `GestionBimestresRepository.js` (4), `CuadernoRepository.js` (6) |
| 2 | Cablear UI “Iniciar gestión académica” al método ya existente | ❌ falta UI | módulo calificaciones / gestión-bimestres |
| 3 | (Opcional) Use case de transición de estado por estudiante (`CambiarEstadoMatriculaUseCase`) + `PATCH /inscripciones/:id/...` | ❌ no existe | use-cases/inscripciones |
| 4 | Endpoint “horario del estudiante” (query sección 4) | ❌ solo existe por paralelo | nuevo use case + ruta |
| 5 | Exponer rutas/controllers de **asistencia** | ⚠️ repo sí, rutas no | presentation/routes |
| 6 | Verificar que cuaderno/consolidado resuelven el curso vía oferta→asignación vigente | revisar | `CuadernoRepository`, use cases de calificaciones |
| 7 | Confirmar `configuracion_evaluacion` vigente para la gestión activa (pesos/cuotas) | ✅ sincronizado (seeder 59) | `02-seeders/59` |

### Resumen del “camino feliz” objetivo
1. Cargar schema (`01-20`) + seeders + migraciones (datos ya verificados).
2. Corregir el puente SQL (tarea 1).
3. Disparar **Iniciar gestión académica** desde la UI → matrículas pasan a
   `CURSANDO` y se crean los bimestres.
4. El estudiante ve su **horario** (query sección 4 / endpoint nuevo) de las
   materias en `CURSANDO`.
5. El docente abre el **cuaderno** del bimestre vigente y registra notas;
   opcionalmente, **asistencia** (cuando se expongan sus rutas).
6. Al cierre de cada bimestre se consolidan notas; la `nota_final` se recalcula
   por suma ponderada.
