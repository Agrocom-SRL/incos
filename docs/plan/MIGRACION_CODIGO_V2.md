# Migración de código V1 → V2 (mapa transversal)

**Documento padre:** `PLAN_MAESTRO.md`  
**Pre-requisito:** Sprint 2 aplicado en BD local (schemas `01`–`24` + seeders `27`–`48`, **sin** tablas `cursos` / `cursos_horarios`).

Este archivo es la **fuente de verdad para el código**. Los sprints 3–5 implementan por capas lo que aquí se lista.

---

## 1. Dos ejes del refactor

| Eje | Sprints | Qué cambia |
|-----|---------|------------|
| **Datos (BD)** | 1–2 | Catálogo plan + DDL V2 + seeders |
| **Aplicación** | 3–5 (+ bonus MAT) | Repos, use cases, endpoints, vistas SQL, UI |

Sprint 2 **no** obliga a borrar código legacy; solo deja la BD incompatible con V1.  
Los sprints 3–5 **sí** deben retirar o reescribir ese código.

---

## 2. Cadena de lectura V2 (cómo se arma el horario)

```
gestiones_planes
  → paralelos_gestion (aula, turno, estado)
    → oferta_cursos (materia del plan en ese paralelo)
      → asignaciones_docentes (docente + carga_horaria + color)
        → asignacion_horarios (bloques en catálogo horarios)
matriculas_materia.oferta_curso_id  (estable toda la gestión)
calificaciones / evaluaciones       (preferir asignatura_plan_id; oferta solo para listados)
```

**V1 (eliminar del código activo):** `cursos` → `oferta_cursos`; `cursos_horarios` → `asignacion_horarios`; `asignaciones_docentes.curso_id` → `oferta_curso_id`.

---

## 3. Inventario por capa (estado orientativo)

### 3.1 Backend — eliminar o dejar de montar

| Artefacto | Acción | Sprint |
|-----------|--------|--------|
| `models/curso.js`, `models/curso_horario.js` | Eliminar cuando no haya imports | 3 |
| `CourseRepository`, `CourseScheduleRepository` | Eliminar | 3 |
| `ICursoRepository`, `ICursoHorarioRepository` | Eliminar | 3 |
| `routes/cursos.routes.js` + `cursos.container.js` | Desmontar `/api/v1/cursos` | 3 |
| `paralelos.routes`: `/:id/cursos`, `/:id/cursos-oferta`, `/:id/schedule` | Sustituir por oferta V2 + stub 410 hasta S5 | 3 / 5 |
| Use cases: `CreateParaleloCursoOferta`, `GetParaleloCursosOferta`, `PutParaleloSchedule`, `GetParaleloHorarios`, `Update/DeleteCursoOferta` | Reemplazar o borrar | 3 / 5 |

### 3.2 Backend — migrar (no solo añadir)

| Módulo | Cambio principal | Sprint |
|--------|------------------|--------|
| **Oferta** (nuevo) | API `gestiones-planes`, `paralelos-gestion`, `oferta-cursos` | 3 |
| **Docentes / asignación** | `curso_id` → `oferta_curso_id`; catálogos desde `oferta_cursos` | 4 |
| **Horarios / bloques** | Lectura/escritura en `asignacion_horarios`; grilla por `asignacion_docente_id` | 5 |
| **Inscripciones** | `CreateEnrollmentUseCase`: ofertas del paralelo-gestión, no `cursos` | 4 |
| **Calificaciones** | Listados “curso” = oferta o asignatura_plan; repos que JOIN `cursos` | 4–5 |
| **Dashboard horarios** | Use cases que cuentan “sin curso” → “sin oferta” / cobertura V2 | 5 |

### 3.3 Vistas SQL (`03-views/`) — ~45 archivos citan `cursos`

Agrupar por sprint (recrear vista tras cada cambio):

| Grupo | Ejemplos | Sprint |
|-------|----------|--------|
| Oferta / paralelo | `02`, `18`, `71`, `78`, `75`, `74` | 3 |
| Docente / asignación | `51`, `55`, `59`, `64`–`67`, `80` | 4 |
| Bloques / conflictos | `54`, `52`, `72`, `73`, `81`–`87`, `91`–`95` | 5 |
| Calificaciones | `108`, `116`, `119`, `110` (revisar JOIN) | 4–5 |
| Matrícula / inscripción | `04`, `17`, `99`–`101` | 4 |

Regla: **no ejecutar** vistas V1 contra BD V2; o marcarlas `.legacy.sql` hasta reescritura.

### 3.4 Frontend

| Área | Acción | Sprint |
|------|--------|--------|
| Nuevo wizard | `/institucional/oferta-academica` solo API V2 | 3 |
| `CursoRepository`, hooks `useCursosDelParalelo*` | Sustituir por `OfertaCurso` / paralelo-gestión | 3–4 |
| `institucional/horarios` (aulas, armado legacy) | Migrar a flujo oferta → docente → bloques | 4–5 |
| Docentes asignación | Endpoints y labels “curso” → “oferta” | 4 |
| Calificaciones | `dataKey` alineado a respuesta V2 | 4–5 |

---

## 4. Matriz endpoint (consumo UI)

| Legacy (retirar) | V2 (usar) |
|------------------|-----------|
| `GET /paralelos/:id/cursos-oferta` | `GET /paralelos-gestion/:id/oferta-cursos` |
| `POST /paralelos/:id/cursos` | `POST /paralelos-gestion/:id/generar-oferta` o `POST /oferta-cursos` |
| `PATCH/DELETE /cursos/:id` | `PUT /oferta-cursos/:id/estado`, `DELETE /oferta-cursos/:id` |
| `GET/PUT /paralelos/:id/schedule` | Sprint 5: `GET /paralelos-gestion/:id/grilla-horario`, CRUD `asignacion-horarios` |
| Docentes `cursos-disponibles` (V1) | Sprint 4: asignaciones sobre `oferta_curso_id` |

---

## 5. Definition of Done global (código)

- [ ] Ningún `import` activo de `curso.js` / `curso_horario.js` en `backend/src`.
- [ ] `/api/v1/cursos` desmontado; paralelos sin rutas V1 de oferta/schedule.
- [ ] Docentes e inscripciones persisten solo `oferta_curso_id`.
- [ ] Horarios leen/escriben `asignacion_horarios`.
- [ ] Vistas en `03-views/` usadas por la app reescritas o no desplegadas.
- [ ] FE institucional horarios + oferta sin `CursoRepository` V1.
- [ ] Smoke manual: seeders 27→30→31→40 en cadena contra UI V2.

---

## 6. Orden de ejecución recomendado (local)

1. Schemas + seeders (ya hecho).
2. Sprint 3: oferta API/FE + **retiro rutas/repos cursos en paralelos**.
3. Sprint 4: asignación docente + inscripción + vistas/docentes + calificaciones (listados).
4. Sprint 5: bloques + vistas horarios + publicación + completar `cambiar-turno` con bloques.
