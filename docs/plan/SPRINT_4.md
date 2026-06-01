# Sprint 4 — INST: Asignación Docente con Carga + Color

**Documento padre:** `PLAN_MAESTRO.md`
**Duración estimada:** 1-2 semanas
**Pre-requisito:** Sprint 3 cerrado (oferta operativa por API/FE en `/institucional/oferta`; rutas de oferta en paralelo maestro retiradas).  
**Mapa de migración:** `MIGRACION_CODIGO.md`

---

## 0. Alcance (código)

| Incluido | Detalle |
|----------|---------|
| API asignación docente | §3 sobre `oferta_curso_id` |
| **Migración docentes** | `AssignTeacherToCourse`, catálogos `cursos-disponibles` / `cursos-por-paralelo` → oferta |
| **Migración MAT (lectura/alta)** | `CreateEnrollmentUseCase` enlaza `matriculas_materia.oferta_curso_id` |
| **Calificaciones (listados)** | Repos/vistas que listan “cursos” del docente → oferta + asignatura_plan |
| Vistas SQL | Grupo docente/asignación (~15 vistas) |
| FE | Matriz asignación + dashboard carga + color picker |

| No incluido (Sprint 5) | Grilla por `paralelo_gestion`, motor conflictos, publicación masiva |

### 0.1 Dos pistas en paralelo (decisión 2026-05-29)

Sprint 5 describe el flujo ideal de **armado de horarios** (grilla, bloques, conflictos). Ese flujo depende de oferta + asignación docente ya cerrados. **No** podemos posponer hasta Sprint 5 los módulos que ya operan con estudiantes reales:

| Pista | Prioridad | Qué |
|-------|-----------|-----|
| **A — Asignación docente** | Alta | Endpoints §3, matriz FE, color picker, carga docente (objetivo original del sprint) |
| **B — Continuidad operativa** | Alta (paralela) | Inscripciones + calificaciones: BE y FE alineados a `oferta_curso_id` / `paralelos_gestion` **sin** esperar la grilla de Sprint 5 |

**Pista B — entregables mínimos:**

1. **Backend:** `CreateEnrollmentUseCase` (y update) resuelve materias desde `oferta_cursos` del `paralelo_gestion` vigente, no desde tabla `cursos` ni `CourseRepository` en el camino activo.
2. **Backend:** listados de calificaciones (mis cursos, coordinación, cuaderno) leen vistas/repos sobre `asignaciones_docentes` + `oferta_cursos`; `dataFieldName` estable.
3. **Frontend calificaciones:** mantener rutas y UX actuales (`asignacionId` = `asignacion_docente_id`); ajustar hooks/API solo si cambia el payload; verificar cuaderno con matriculados existentes.
4. **Frontend inscripciones:** flujo de alta sigue operativo contra gestión con oferta generada (seeders 27→30 + asignaciones 31+).
5. **Frontend horarios:** banner hacia oferta/asignación; **no** grilla nueva aquí (Sprint 5). `CursoRepository` FE eliminado.

Regla: **Sprint 4 cierra la cadena gestión → oferta → docente → matrícula → notas.** Sprint 5 cierra **bloques → conflictos → publicación horario**.

---

## 1. Objetivo

Construir la pantalla donde el equipo administrativo:
1. Asigna un docente a cada `oferta_curso` (creando `asignaciones_docentes`).
2. Ve en vivo la **carga acumulada** del docente (semanal + mensual) y la valida contra su máximo.
3. Asigna el **color único** del docente para esta gestión (validando que no choque con otros docentes activos).

Al final del sprint, todos los cursos ofertados tienen docente asignado, con cargas bajo el máximo y colores únicos. La gestión está lista para armar el horario (Sprint 5).

## 2. Entregables

1. **API backend** para asignar docentes, consultar cargas y validar colores.
2. **Permisos RBAC** correspondientes.
3. **Frontend** con dos vistas: matriz de asignación por paralelo y dashboard de carga por docente.
4. **Migración código:** módulo docentes e inscripciones sin `curso_id`; model `asignacion_docente` solo `oferta_curso_id`.
5. **Vistas SQL** grupo docente/asignación reescritas; calificaciones listado docente sin JOIN a `cursos`.

## 3. Endpoints backend

### 3.1 Asignaciones docentes (CRUD)

- `GET /api/v1/asignaciones-docentes?gestion_plan_id=&paralelo_gestion_id=&docente_id=` — filtrable
- `GET /api/v1/asignaciones-docentes/:id` — detalle con oferta_curso + docente + carga
- `POST /api/v1/asignaciones-docentes` — body:
  ```json
  {
    "gestion_plan_id": 1,
    "oferta_curso_id": 23,
    "docente_id": 5,
    "carga_horaria": 4
  }
  ```
  - Si no se pasa `carga_horaria`, se hereda de `asignaturas_plan.horas_semanales`.
  - Si el docente NO tiene `color_hex` asignado, devolver error 422 con `requiere_color: true`.
- `PUT /api/v1/asignaciones-docentes/:id` — editar carga o cambiar docente.
- `DELETE /api/v1/asignaciones-docentes/:id` — soft delete (suelta el curso, queda sin docente).

### 3.2 Carga horaria del docente

- `GET /api/v1/docentes/:id/carga-gestion?gestion_id=X`
  - Response:
  ```json
  {
    "docente_id": 5,
    "gestion_id": 2026,
    "max_horas_semana": 20,
    "max_horas_mes": 80,
    "carga_actual_semana": 18,
    "carga_actual_mes": 72,
    "disponible_semana": 2,
    "disponible_mes": 8,
    "sobrecarga": false,
    "asignaciones": [
      { "id": 12, "oferta_curso_id": 23, "asignatura": "FUA-101", "paralelo": "PRIMERO A", "horas": 6 },
      ...
    ]
  }
  ```
- `GET /api/v1/gestiones/:id/carga-docentes` — resumen para toda la gestión
  - Response:
  ```json
  {
    "totales": {
      "docentes_activos": 25,
      "horas_total_semana": 480,
      "docentes_sobrecargados": 1,
      "cobertura": 92.5
    },
    "docentes": [
      { "docente_id": 5, "nombre": "...", "carga_semana": 18, "max_semana": 20, "ratio": 0.9, "color_hex": "#3498DB" },
      ...
    ]
  }
  ```

### 3.3 Color del docente

- `PUT /api/v1/docentes/:id/color` — body: `{ color_hex: "#3498DB" }`
  - Valida que ningún otro docente activo (no `deleted_at`) tenga ese color. Si choca: 422 con `colores_en_uso: [...]`.
- `GET /api/v1/docentes/colores-en-uso` — lista de colores ya usados (para sugerir libres en el picker)
- `GET /api/v1/docentes/colores-sugeridos` — paleta predefinida HSL con `disponible: bool` para cada color

### 3.4 Cobertura de la oferta

- `GET /api/v1/paralelos-gestion/:id/cobertura-docente`
  - Response:
  ```json
  {
    "paralelo_gestion_id": 1,
    "cursos_total": 7,
    "cursos_con_docente": 6,
    "cursos_sin_docente": 1,
    "faltantes": [{ "oferta_curso_id": 18, "asignatura": "INT-103" }],
    "cobertura_pct": 85.7
  }
  ```

## 4. Permisos RBAC

| código | nombre |
|---|---|
| `institucional.horarios.asignacion-docente` | Asignar docentes a cursos |
| `institucional.horarios.color-docente` | Asignar colores a docentes |
| `institucional.horarios.carga-docente` | Ver y validar cargas docentes |

## 5. Frontend

Ruta raíz: `/institucional/horarios/asignacion-docente`

### 5.1 Vista matriz: Asignación por paralelo

Selector arriba: Gestión → Plan habilitado → Paralelo-gestión.

Tabla:

| Materia | Horas | Docente | Color | Carga total docente | Acciones |
|---|---|---|---|---|---|
| MPI-101 Matemática | 4 | Lic. Marcos Vargas ▼ | 🟦 | 18/20 hrs ✓ | [✕] |
| PRG-102 Programación I | 8 | Ing. Lily Arenas ▼ | 🟩 | 20/20 hrs ✓ | [✕] |
| INT-103 Inglés Técnico | 2 | (sin asignar) ▼ | — | — | [Asignar] |
| HDC-104 Hardware | 4 | Ing. Roxana ▼ | 🟧 | **22/20 hrs ⚠** | [✕] |

- Selector de docente: dropdown con búsqueda. Muestra el color y la carga actual del docente al lado de su nombre.
- Si al seleccionar un docente la carga total resulta > max, el badge parpadea rojo (`animation: blink 1s infinite`) y se permite guardar con confirmación explícita (admin puede sobrecargar bajo su responsabilidad).
- Si el docente no tiene color asignado, el sistema abre automáticamente el picker de color antes de confirmar la asignación.

### 5.2 Vista dashboard: Carga por docente

Ruta: `/institucional/horarios/carga-docentes/:gestion_id`

Layout tipo dashboard:

- **Tarjetas de KPI** arriba: docentes activos, horas total semana, docentes sobrecargados, cobertura de la gestión.
- **Tabla de docentes** con barras de progreso:

```
Lic. Marcos Vargas  🟦  ████████████░░  18/20 hrs   [Ver detalles]
Ing. Lily Arenas    🟩  ███████████████ 20/20 hrs   [Ver detalles]
Ing. Roxana         🟧  █████████████░  16/20 hrs   [Ver detalles]
Lic. Juan Mora      ⬜   ░░░░░░░░░░░░░░░  0/20 hrs   [Asignar color]
```

- Click en docente → drawer con lista de sus asignaciones (paralelo + materia + horas + aula del paralelo-gestión).
- Botón "Asignar color" si está vacío.

### 5.3 Color picker

Modal con:
- Paleta predefinida (12-16 colores HSL bien distribuidos).
- Indicador visual de cuáles están en uso (con tooltip "Usado por: Ing. X").
- Campo manual para hex personalizado con validación de unicidad.
- Botón "Sugerir libre" que elige el primer color de la paleta no usado.

## 6. Reglas de validación

1. **Sobrecarga:** `SUM(asignaciones.carga_horaria) > docentes.max_horas_semana` → warning (no error). Solo el rol admin puede confirmar la asignación que cause sobrecarga.
2. **Color obligatorio:** un docente sin `color_hex` no puede ser asignado a ningún curso. La UI debe forzar el picker.
3. **Color único:** validación en backend al hacer `PUT /docentes/:id/color`. Compara contra docentes activos (con `deleted_at IS NULL`).
4. **Asignación única vigente:** un `oferta_curso` solo puede tener una `asignacion_docente` con `vigente = TRUE` y `deleted_at IS NULL` a la vez. Al asignar nuevo docente, el anterior pasa a `vigente = FALSE` (queda histórico para auditoría).
5. **Cambio de docente:** preserva las matrículas (`matriculas_materia.oferta_curso_id` no cambia). Solo se rota el docente.

## 7. Definition of Done

- [x] Endpoints implementados (§3.1–3.4) — verificar con `SMOKE_SPRINT_4.md` en BD local.
- [x] Permisos sembrados (54/55/56 ids 108–110).
- [x] Vista matriz funcional con asignación inline (FE `/institucional/horarios/asignacion-docente`).
- [x] Vista dashboard con cargas y colores (`/institucional/horarios/carga-docentes/:gestionId`).
- [x] Color picker funcional con validación de unicidad.
- [x] Validación de sobrecarga (warning + confirmación admin).
- [x] **Código:** `CreateTeacherAssignment` / listados docente usan `oferta_curso_id`; inscripción crea matrículas contra oferta.
- [x] **Pista B:** inscripción (`offerCourseId`) + calificaciones por `asignacion_docente_id`; armado gestión sobre API oferta; smoke en `SMOKE_SPRINT_4.md`.
- [x] **Vistas:** grupo docente del mapa migración reescrito sobre `oferta_cursos` (despliegue local con seeders `31`–`39`).
- [x] Test E2E (checklist): paralelo con oferta → asignar docentes (seeders 31+) → dashboard carga → inscripción → cuaderno docente (`SMOKE_SPRINT_4.md`).
- [x] **B5 mínimo:** banner en gestión/armado horarios → oferta + asignación docente (grilla bloques = Sprint 5).

---

## 8. Prompt para agente IA

```
Contexto: Sprint 4 del plan INCOS. Sprints 1–3 cerrados. Schema con paralelos_gestion,
oferta_cursos, asignaciones_docentes (oferta_curso_id), asignacion_horarios.

Hay estudiantes matriculados y calificaciones activas. Sprint 5 (grilla horarios) NO
bloquea este sprint: primero cerramos oferta → docente → matrícula → notas.

Dos pistas en paralelo (ver SPRINT_4.md §0.1):

== PISTA A — Asignación docente (orden interno) ==

A1) GET /docentes/:id/carga-gestion?gestion_id=X (carga semana/mes vs máximos).
A2) PUT /docentes/:id/color + GET colores-en-uso / colores-sugeridos.
A3) CRUD asignaciones-docentes (requiere_color, confirmar_sobrecarga, vigente único).
A4) Cobertura paralelo + dashboard carga gestión.
A5) Permisos seeds 54/56/55 + matriz.
A6) FE matriz /institucional/horarios/asignacion-docente + dashboard carga + ColorPicker.

== PISTA B — Continuidad operativa (en paralelo con A, no al final) ==

B1) CreateEnrollmentUseCase (+ update): matriculas_materia.oferta_curso_id desde
    oferta del paralelo_gestion; retirar CourseRepository del camino activo.
B2) Calificaciones BE: repos/vistas listado docente (108, 116, 119…) sin JOIN cursos.
B3) Calificaciones FE: verificar mis-cursos / cuaderno / coordinación con asignaciones
    seedeadas (31+); dataKey = dataFieldName; sin regresión con matriculados.
B4) Inscripciones FE: smoke alta contra gestión con oferta OFERTADA.
B5) FE horarios legacy (plantilla, CursoRepository): deprecar o banner → oferta/asignación;
    NO armar grilla (Sprint 5).

Mapa: MIGRACION_CODIGO.md §3.2 (docentes, inscripciones, calificaciones listados).

Restricciones: cero ALTER TABLE; soft delete; idempotencia donde aplique.

Empieza con A1; en cuanto A3 esté estable, abrir B1 en paralelo.
```
