# Sprint 5 — INST: Armado de Horario + Conflictos + Publicación

**Documento padre:** `PLAN_MAESTRO.md`  
**Duración estimada:** 2-3 semanas (es el más grande)  
**Pre-requisito:** Sprint 4 cerrado (asignaciones docente sobre `oferta_curso_id`; seeders `31`–`39`).  
**Mapa de migración:** `MIGRACION_CODIGO.md`

---

## 0. Alcance (código)

### 0.1 Ya hecho antes de la grilla nueva (2026-06-01)

| Ítem | Detalle |
|------|---------|
| Modelos/repos `cursos` / `cursos_horarios` | Eliminados; `AsignacionHorarioRepository` activo |
| `GET/PUT /paralelos/:id/schedule` | Persiste bloques en `asignacion_horarios` (`cursoId` en body = `oferta_curso_id`) |
| `PATCH /aulas/horarios/:cursoHorarioId/aula` | Actualiza `asignacion_horarios.aula_id` |
| FE armado plan semanal | `GestionHorariosArmadoPage` + `useParaleloScheduleApi` (sigue usando esas rutas) |

Esto **no** cierra el sprint: es la base transitoria. El objetivo del sprint sigue siendo la grilla por **paralelo-gestión** y el motor de conflictos/publicación de §3.

### 0.2 Pendiente (entregables del sprint)

| Incluido | Detalle |
|----------|---------|
| API grilla | `GET /paralelos-gestion/:id/grilla-horario` |
| CRUD bloques | `POST/PUT/DELETE /asignacion-horarios` + `bulk` |
| Motor conflictos + publicación | §3 |
| `cambiar-turno-con-bloques` | Completa TODO del Sprint 3 |
| Vistas SQL | Desplegar y validar grupo bloques/conflictos (`81`–`95`, etc.) |
| FE | Grilla drag-and-drop por `paralelo_gestion`, conflictos globales, publicar |

---

## 1. Objetivo

Construir el módulo donde se arma el horario semanal de cada paralelo-gestión asignando bloques (`asignacion_horarios`) a las asignaciones docentes. Incluye:
1. **Drag-and-drop** de bloques en grilla semanal por turno.
2. **Motor de conflictos** en tiempo real: docente solapado, paralelo solapado, aula solapada.
3. **Validación de cobertura**: cada asignación tiene la cantidad de bloques que sus horas requieren.
4. **Publicación**: cuando todo cuadra, `paralelo_gestion.estado → PUBLICADO`.

Es el sprint más visual y más complejo. Recomendable dividir en dos sub-iteraciones internas.

## 2. Entregables

1. **API backend** de bloques + motor de conflictos + publicación.
2. **Frontend** con grilla drag-and-drop, validador de carga, parpadeo de conflictos.
3. **Validador de publicación**: estado `OFERTADO → PUBLICADO`.
4. **Endpoint de cambio de turno con re-mapeo** (completar el TODO de Sprint 3).
5. **Migración código:** pantallas `institucional/horarios` consumen API grilla (sustituir o convivir con `schedule` transitorio).
6. **Vistas SQL** grupo bloques/conflictos; calificaciones que JOIN horarios actualizadas.

## 3. Endpoints backend

### 3.1 Bloques (asignacion_horarios)

- `GET /api/v1/paralelos-gestion/:id/grilla-horario`
  - Response: grilla semanal completa con bloques agrupados por día + lista de conflictos detectados.
  ```json
  {
    "paralelo_gestion_id": 1,
    "turno": "TARDE",
    "grilla": {
      "LUNES": [
        { "horario_id": 1, "hora_inicio": "14:00", "hora_fin": "14:45", "asignacion_docente_id": 12, "asignatura": "FUA-101", "docente": "Lic. Marcos", "color_hex": "#3498DB", "aula_id": 1, "aula_nombre": "AULA-1", "es_aula_base": true, "tiene_conflicto": false },
        ...
      ],
      "MARTES": [...]
    },
    "conflictos": [
      { "tipo": "DOCENTE", "horario_id": 5, "asignaciones_involucradas": [12, 18], "mensaje": "Lic. Marcos asignado a 2 cursos en el mismo bloque" },
      { "tipo": "AULA", "horario_id": 7, "asignaciones_involucradas": [9, 15], "mensaje": "AULA-2 ocupada por 2 cursos" }
    ],
    "cobertura": {
      "completa": false,
      "asignaciones": [
        { "asignacion_docente_id": 12, "asignatura": "FUA-101", "horas_requeridas": 6, "bloques_asignados": 6, "ok": true },
        { "asignacion_docente_id": 18, "asignatura": "PRG-102", "horas_requeridas": 8, "bloques_asignados": 5, "ok": false }
      ]
    }
  }
  ```
- `POST /api/v1/asignacion-horarios` — body:
  ```json
  {
    "asignacion_docente_id": 12,
    "horario_id": 5,
    "aula_id": null,
    "orden_secuencia": 1
  }
  ```
  - `aula_id = NULL` significa "usa el aula base del paralelo-gestión" (default).
- `PUT /api/v1/asignacion-horarios/:id` — editar (mover de horario, cambiar aula).
- `DELETE /api/v1/asignacion-horarios/:id` — quitar bloque.
- `POST /api/v1/asignacion-horarios/bulk` — body con array, para drag-and-drop masivo.

### 3.2 Motor de conflictos

- `GET /api/v1/gestiones/:id/conflictos` — todos los conflictos de la gestión
- `GET /api/v1/paralelos-gestion/:id/conflictos` — conflictos del paralelo
- `POST /api/v1/conflictos/validar` — body: `{ asignacion_docente_id, horario_id, aula_id }`. Pre-validación antes de hacer POST. Devuelve `{ valido: bool, conflictos: [...] }`.

**Reglas de detección:**

1. **Conflicto DOCENTE:** dos `asignacion_horarios` con `horario_id` igual, cuyas `asignaciones_docentes` correspondan al mismo `docente_id`. Excepción: el docente puede tener dos cursos en bloques consecutivos pero no simultáneos.

2. **Conflicto PARALELO:** dos `asignacion_horarios` con `horario_id` igual, cuyas `oferta_cursos` correspondan al mismo `paralelo_gestion_id`. Significa que los estudiantes del paralelo tendrían dos clases al mismo tiempo.

3. **Conflicto AULA:** dos `asignacion_horarios` con `horario_id` igual y `aula_id` igual (considerando que `NULL` se resuelve al aula base del paralelo-gestión).

### 3.3 Cambio de turno con re-mapeo

- `PUT /api/v1/paralelos-gestion/:id/cambiar-turno-con-bloques` — body: `{ turno: 'NOCHE' }`
  - Mapea bloques del turno actual al nuevo:
    - Bloque #1 TARDE (14:00) → bloque #1 NOCHE (18:45)
    - Bloque #2 TARDE (14:45) → bloque #2 NOCHE (19:30)
    - Etc.
  - Si el nuevo turno tiene menos bloques que el actual, devuelve error pidiendo eliminar bloques excedentes primero.
  - Si el cambio rompe bloques sábado, también devuelve advertencia.

### 3.4 Publicación

- `POST /api/v1/paralelos-gestion/:id/publicar`
  - Pre-condiciones:
    - Estado actual = `OFERTADO`.
    - `cobertura.completa = true` (todas las asignaciones con sus horas cubiertas).
    - `conflictos.length === 0`.
    - No hay docente sobrecargado.
  - Si todas se cumplen → estado `PUBLICADO`.
  - Si falla, devuelve detalle de qué condición no cumple.
- `POST /api/v1/gestiones/:id/publicar-todos` — publica todos los paralelos-gestión que cumplan.

## 4. Permisos RBAC

| código | nombre |
|---|---|
| `institucional.horarios.bloques` | Gestionar bloques de horario |
| `institucional.horarios.conflictos` | Ver y resolver conflictos |
| `institucional.horarios.publicar` | Publicar paralelos-gestión |

## 5. Frontend

Ruta raíz: `/institucional/horarios/armado`

### 5.1 Vista principal: Grilla semanal del paralelo-gestión

Selector arriba: Gestión → Paralelo-gestión.

Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ PRIMERO A SIS-INF TARDE - AULA-1 - 2026     [OFERTADO]      │
├─────────────┬──────────┬──────────┬──────────┬──────────┬───┤
│ Hora        │ LUN      │ MAR      │ MIE      │ JUE      │...│
├─────────────┼──────────┼──────────┼──────────┼──────────┼───┤
│ 1 14:00     │ MPI-101  │ PRG-102  │ HDC-104  │ INT-103  │   │
│             │ 🟦 Marcos│ 🟩 Lily  │ 🟧 Roxana│ 🟪 Juan  │   │
│             │ AULA-1   │ AULA-1   │ AULA-1   │ AULA-1   │   │
├─────────────┼──────────┼──────────┼──────────┼──────────┼───┤
│ 2 14:45     │ MPI-101  │ PRG-102  │ HDC-104  │ INT-103  │   │
│             │ 🟦       │ 🟩       │ 🟧       │ 🟪       │   │
└─────────────┴──────────┴──────────┴──────────┴──────────┴───┘

┌─ Panel lateral derecho: asignaciones pendientes ───────────┐
│ ▶ TSO-105 Sistemas Operativos  4/4 hrs  🟫 Carlos  ✓        │
│ ▶ OTM-106 Ofimática           3/4 hrs  🟨 María   ⚠         │
│ ▶ DPW-107 Diseño Web           0/4 hrs  🟥 Ricardo ⚠        │
│                                                              │
│ Total: 18/30 hrs cubiertas                                  │
│                                                              │
│ ⚠ Conflicto detectado:                                      │
│   AULA-1 ocupada por PRG-102 y HDC-104 en bloque 3 MAR     │
│                                                              │
│ [Publicar paralelo] (deshabilitado hasta 30/30 + 0 conf.)   │
└──────────────────────────────────────────────────────────────┘
```

- **Drag-and-drop:** arrastrar bloque desde panel lateral hasta celda. Arrastrar celda hacia otra celda para mover.
- **Color del bloque:** viene del docente (`asignaciones_docentes.color_hex` heredado de `docentes.color_hex`).
- **Celdas en conflicto:** `class="blink"` con keyframes CSS.
- **Tooltip:** hover sobre bloque muestra detalles (docente, aula, conflicto si aplica).

### 5.2 Vista de conflictos globales

Ruta: `/institucional/horarios/conflictos/:gestion_id`

Tabla de conflictos:

| Tipo | Bloque | Involucrados | Acción |
|---|---|---|---|
| DOCENTE | MAR 14:45 | Marcos: FUA-101 (1°A) + ADM-203 (2°A) | [Resolver] |
| AULA | LUN 19:30 | AULA-1: PRG-102 (1°A SIS) + INF-CONT (1°D CON) | [Resolver] |

### 5.3 Vista de publicación

Ruta: `/institucional/horarios/publicar/:gestion_id`

Resumen por paralelo-gestión con semáforo:

```
PRIMERO A SIS-INF TARDE     ✓ 30/30 hrs ✓ 0 confl. ✓ docentes ok  [Publicar]
PRIMERO B SIS-INF TARDE     ⚠ 28/30 hrs ✓ 0 confl. ✓ docentes ok  [Resolver]
PRIMERO C SIS-INF NOCHE     ✓ 30/30 hrs ⚠ 1 confl. ✓ docentes ok  [Resolver]
SEGUNDO A SIS-INF NOCHE     ✓ 30/30 hrs ✓ 0 confl. ⚠ Marcos 22hrs [Confirmar]
```

Botón global "Publicar todos los OK".

## 6. Reglas de validación

1. **Drag de bloque entre paralelos:** no permitido. Un bloque pertenece a una asignación, que pertenece a una oferta, que pertenece a un paralelo-gestión. Para mover una materia entre paralelos, primero eliminar la asignación.

2. **Aula NULL = aula base:** al detectar conflicto de aula, el motor resuelve `NULL → paralelos_gestion.aula_id` antes de comparar.

3. **Conflicto admitido bajo confirmación:** la admin puede publicar con conflictos siempre que confirme explícitamente con su contraseña. Esto se loguea como decisión consciente.

4. **Estado PUBLICADO bloquea edición:** una vez en `PUBLICADO`, no se pueden agregar/quitar/mover bloques sin volver a `OFERTADO`. Esto previene que cambios en horario afecten a estudiantes ya matriculados.

5. **Bloques en sábado:** los horarios 56-60 son especiales (no uniformes). El motor tiene una lista blanca de qué horario_id corresponde a qué slot sábado.

## 7. Definition of Done

- [x] **Pre-requisito código:** sin modelos/repos `cursos` / `cursos_horarios` (checklist `MIGRACION_CODIGO.md` §5).
- [x] Bloques persisten en `asignacion_horarios` (plan semanal transitorio + PATCH aula).
- [ ] Endpoints de las secciones 3.1 a 3.4 implementados y testeados.
- [ ] Motor de conflictos detecta las 3 categorías correctamente.
- [ ] Grilla drag-and-drop funcional (selector `paralelo_gestion`).
- [ ] Parpadeo de conflictos visible.
- [ ] Validador de cobertura en vivo.
- [ ] Endpoint de cambio de turno con re-mapeo de bloques funcional.
- [ ] Publicación con todas las pre-condiciones validadas.
- [ ] **Vistas:** horarios/conflictos desplegadas y usadas por la UI nueva.
- [ ] Test E2E: seeders `40`–`48` coherentes con grilla UI → publicar paralelo.

---

## 8. Prompt para agente IA

```
Contexto: Sprint 5 del plan INCOS. Sprints 1-4 cerrados. Schema con paralelos_gestion,
oferta_cursos, asignaciones_docentes, asignacion_horarios. Repos cursos eliminados;
GET/PUT schedule transitorio ya escribe asignacion_horarios.

Tarea: módulo INST → Horarios → Armado, con drag-and-drop, motor de conflictos,
validación de cobertura y publicación.

Por la complejidad, vamos a dividirlo en sub-tareas y cerrar cada una antes de seguir:

== SUB-FASE A: Backend del motor ==

A1) Endpoint GET /paralelos-gestion/:id/grilla-horario que devuelva la estructura
    JSON de la sección 3.1 con bloques agrupados por día, lista de conflictos y
    cobertura. Cobertura compara SUM(bloques) por asignacion_docente_id vs
    asignacion_docente.carga_horaria (o asignaturas_plan.horas_semanales como fallback).

A2) Motor de conflictos: módulo independiente que dada una gestión devuelve la lista
    de las 3 categorías (DOCENTE, PARALELO, AULA). Para AULA, resolver NULL al aula
    base del paralelo_gestion antes de comparar.

A3) Endpoints CRUD de asignacion_horarios + POST bulk para drag-and-drop.

A4) POST /conflictos/validar para pre-chequear antes de POST.

== SUB-FASE B: Frontend grilla ==

B1) Componente <GrillaSemanal> que renderiza la grilla del paralelo-gestión.
    - Filas: bloques del turno (1-6 TARDE, 1-5 NOCHE, sábado especial).
    - Columnas: días.
    - Celdas: bloques renderizados con color del docente.
    - CSS: animation blink 1s infinite para celdas con tiene_conflicto: true.

B2) Drag-and-drop con react-dnd o similar.
    - Drag de panel lateral (asignaciones pendientes) → celda.
    - Drag de celda → otra celda.
    - Al soltar, llamar POST /conflictos/validar; si OK confirma con POST/PUT real.

B3) Panel lateral derecho con asignaciones del paralelo, su carga, conflictos
    detectados, botón publicar (deshabilitado hasta cumplir condiciones).

== SUB-FASE C: Publicación y cambio de turno ==

C1) POST /paralelos-gestion/:id/publicar con validación de las 4 pre-condiciones
    (estado, cobertura, conflictos, sobrecarga).

C2) PUT /paralelos-gestion/:id/cambiar-turno-con-bloques que reemplaza al endpoint
    placeholder del Sprint 3. Mapea bloques entre turnos por número de orden.

C3) Vista global /institucional/horarios/publicar/:gestion_id con semáforo por
    paralelo y botón "Publicar todos los OK".

== SUB-FASE D: Conflictos globales ==

D1) Vista /institucional/horarios/conflictos/:gestion_id con tabla y acciones de
    resolución rápida (mover bloque, cambiar aula, cambiar docente).

Restricciones:
- Toda validación en aplicación.
- Conflicto admitido solo bajo confirmación explícita con contraseña (audit log).
- Estado PUBLICADO bloquea ediciones; volver a OFERTADO primero.

Empieza con A1.
```
