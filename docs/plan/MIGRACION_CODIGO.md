# Migración de código — mapa transversal

**Documento padre:** `PLAN_MAESTRO.md`  
**Pre-requisito BD:** schemas `01`–`24` + seeders `27`–`48` aplicados (**sin** tablas `cursos` / `cursos_horarios`).

Fuente de verdad del **código** durante el refactor horarios + plan de estudio. Los sprints 3–5 implementan por capas lo listado aquí.

---

## 1. Dos ejes del refactor

| Eje | Sprints | Qué cambia |
|-----|---------|------------|
| **Datos (BD)** | 1–2 | Catálogo plan + DDL + seeders |
| **Aplicación** | 3–5 (+ bonus MAT) | Repos, use cases, endpoints, vistas SQL, UI |

El schema ya no admite `cursos` / `cursos_horarios`. El código activo debe usar solo el modelo actual.

**Estado (2026-06-01):**

| Sprint | Estado |
|--------|--------|
| 3 — Oferta | Cerrado |
| 4 — Asignación docente + matrícula + notas | Cerrado |
| 5 — Grilla, conflictos, publicación | **En curso** (ver §6) |

---

## 2. Cadena canónica (cómo se arma el horario)

```
gestiones_planes
  → paralelos_gestion (aula, turno, estado)
    → oferta_cursos (materia del plan en ese paralelo)
      → asignaciones_docentes (docente + carga_horaria)
        → asignacion_horarios (bloques en catálogo horarios)
matriculas_materia.oferta_curso_id  (estable toda la gestión)
calificaciones / evaluaciones       (preferir asignatura_plan_id; oferta para listados)
```

**Tablas retiradas del código activo:**

| Antes | Ahora |
|-------|--------|
| `cursos` | `oferta_cursos` |
| `cursos_horarios` | `asignacion_horarios` |
| `asignaciones_docentes.curso_id` | `asignaciones_docentes.oferta_curso_id` |

En API y UI, el nombre `cursoId` en rutas o payloads de horarios significa **`oferta_curso_id`** (alias histórico de pantalla, no la tabla `cursos`).

---

## 3. Inventario por capa

### 3.1 Backend — eliminado del path activo

| Artefacto | Estado |
|-----------|--------|
| `models/curso.js`, `models/curso_horario.js` | Eliminados (2026-06-01) |
| `CourseRepository`, `CourseScheduleRepository`, `CourseShiftRepository` | Eliminados |
| `ICursoRepository`, `ICursoHorarioRepository` | Eliminados |
| `routes/cursos.routes.js` + `cursos.container.js` | Desmontados |
| `paralelos.routes`: `/:id/cursos`, `/:id/cursos-oferta` | Retirados (Sprint 3) |
| Use cases oferta en paralelo maestro (`CreateParaleloCursoOferta`, etc.) | Eliminados (FE/BE) |

### 3.2 Backend — modelo actual

| Módulo | Estado |
|--------|--------|
| **Oferta** | API `gestiones-planes`, `paralelos-gestion`, `oferta-cursos` |
| **Asignación docente** | `oferta_curso_id`, catálogos, matriz, carga, color |
| **Bloques horarios** | `AsignacionHorarioRepository` + vistas `54`, `81`…; `PATCH aulas/horarios/:id/aula` |
| **Plan semanal (transitorio)** | `GET/PUT /paralelos/:id/schedule` → `asignacion_horarios` vía `asignaciones_docentes` |
| **Inscripciones** | `CreateEnrollmentUseCase` con `oferta_curso_id` |
| **Calificaciones** | Listados sobre oferta + `asignaciones_docentes` |

### 3.3 Backend — pendiente Sprint 5

| Entregable | Detalle |
|------------|---------|
| `GET /paralelos-gestion/:id/grilla-horario` | Grilla + conflictos + cobertura en una respuesta |
| CRUD `asignacion-horarios` + `bulk` | Sustituye edición masiva del plan semanal transitorio |
| Motor conflictos | `GET gestiones/:id/conflictos`, `POST conflictos/validar` |
| Publicación | `POST paralelos-gestion/:id/publicar` |
| Cambio turno con bloques | `PUT paralelos-gestion/:id/cambiar-turno-con-bloques` |

### 3.4 Vistas SQL (`03-views/`)

Grupos por sprint (recrear vista tras cada cambio):

| Grupo | Ejemplos | Sprint |
|-------|----------|--------|
| Oferta / paralelo | `02`, `18`, `71`, `78`, `75`, `74` | 3 ✅ |
| Docente / asignación | `51`, `55`, `59`, `64`–`67`, `80` | 4 ✅ |
| Bloques / conflictos | `54`, `52`, `72`, `73`, `81`–`87`, `91`–`95` | 5 (desplegar + validar en UI) |
| Calificaciones | `108`, `116`, `119`, `110` | 4 ✅ |
| Matrícula / inscripción | `04`, `17`, `99`–`101` | 4 ✅ |

Alias en vistas (`curso_id`, `curso_horario_id`) = `oferta_curso_id` / `asignacion_horarios.id`.

### 3.5 Frontend

| Área | Estado |
|------|--------|
| Wizard `/institucional/oferta` | API oferta |
| `CursoRepository` FE, hooks paralelo `cursos-oferta` | Eliminados |
| Asignación docente + dashboard carga | Sprint 4 ✅ |
| Armado tab **Gestión de cursos** | `useOfertaAcademicaApi` ✅ |
| Armado **Plan semanal** | `GET/PUT /paralelos/:id/schedule` (funciona con BE nuevo; UX grilla = Sprint 5) |
| Grilla drag-and-drop por `paralelo_gestion` | Sprint 5 |
| Conflictos globales + publicación masiva | Sprint 5 |

---

## 4. Matriz endpoint (consumo UI)

| Retirado | Usar |
|----------|------|
| `GET /paralelos/:id/cursos-oferta` | `GET /paralelos-gestion/:id/oferta-cursos` |
| `POST /paralelos/:id/cursos` | `POST /paralelos-gestion/:id/generar-oferta` o `POST /oferta-cursos` |
| `PATCH/DELETE /cursos/:id` | `PUT /oferta-cursos/:id/estado`, `DELETE /oferta-cursos/:id` |
| Montaje `/api/v1/cursos` | — (desmontado) |

| Transitorio (armado actual) | Objetivo Sprint 5 |
|-----------------------------|-------------------|
| `GET/PUT /paralelos/:id/schedule` (`cursoId` = oferta) | `GET /paralelos-gestion/:id/grilla-horario` + CRUD `asignacion-horarios` |
| `PATCH /aulas/horarios/:cursoHorarioId/aula` | Mismo id = `asignacion_horarios.id` |
| `GET /docentes/cursos/:cursoId/horarios` | `cursoId` = `oferta_curso_id` |

---

## 5. Definition of Done global (código)

- [x] Sin `import` de `curso.js` / `curso_horario.js` en `backend/src`.
- [x] `/api/v1/cursos` desmontado; oferta solo por API `paralelos-gestion` / `oferta-cursos`.
- [x] Docentes e inscripciones persisten `oferta_curso_id`.
- [x] Lectura/escritura de bloques en `asignacion_horarios` (repos + `schedule` + aulas).
- [x] Vistas listado docente/calificaciones sin `JOIN cursos`.
- [x] FE institucional: oferta, asignación, gestión de oferta en armado.
- [ ] **Sprint 5:** grilla por `paralelo_gestion`, motor conflictos API, publicación UI.
- [ ] Smoke E2E: seeders `27`→`30`→`31`→`40`→`48` + publicar paralelo desde UI nueva.

---

## 6. ¿Se puede abrir Sprint 5 ya?

**Sí en backend y en la base del armado.** Sprint 4 está cerrado; no queda código activo contra tablas `cursos` / `cursos_horarios`.

**Frontend — qué ya hay vs qué falta:**

| Ya operativo | Pendiente Sprint 5 (nueva UX) |
|--------------|-------------------------------|
| Plan semanal por paralelo maestro (`GestionHorariosArmadoPage`, drag en grilla existente) | Selector **paralelo-gestión** y `GET grilla-horario` |
| Asignación de aulas (`PATCH` bloque) | Panel cobertura + conflictos en vivo |
| Publicación listado (`/horarios/publicacion`) | `POST publicar` con pre-condiciones |
| Dashboard pendientes / capacidad turno | Vista `/horarios/conflictos/:gestionId` |

No hace falta más limpieza de “cursos legacy” en FE para **empezar** Sprint 5; hace falta **implementar** los entregables de `SPRINT_5.md` (API grilla + pantallas nuevas o evolución del armado).

---

## 7. Orden de ejecución recomendado (local)

1. Schemas + seeders (hecho).
2. Sprint 3: oferta API/FE + retiro rutas oferta en paralelos. ✅
3. Sprint 4: asignación docente + inscripción + calificaciones + limpieza repos. ✅
4. Sprint 5: grilla `paralelo_gestion`, conflictos, publicación; opcional deprecar `schedule` cuando la grilla lo reemplace.
