# Sprint 4 — INST: Asignación Docente con Carga + Color

**Documento padre:** `PLAN_V2_MAESTRO.md`
**Duración estimada:** 1-2 semanas
**Pre-requisito:** Sprint 3 cerrado (oferta de cursos generada en al menos un paralelo-gestión).

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

- [ ] Endpoints implementados y testeados.
- [ ] Permisos sembrados.
- [ ] Vista matriz funcional con asignación inline.
- [ ] Vista dashboard con cargas y colores.
- [ ] Color picker funcional con validación de unicidad.
- [ ] Validación de sobrecarga (warning + confirmación admin).
- [ ] Test E2E manual: gestión con 3 paralelos → asignar 10 docentes → todos con color → ver dashboard de cargas → forzar sobrecarga de uno y validar warning.

---

## 8. Prompt para agente IA

```
Contexto: Sprint 4 del plan V2 de INCOS. Sprints 1-3 cerrados. Schema V2 desplegado.
Hay paralelos_gestion con oferta_cursos generados. Hora de asignar docentes.

Conceptos clave:
- Cada oferta_curso (= materia ofertada en un paralelo-gestión) recibe un docente vía
  asignaciones_docentes. La carga (carga_horaria) se hereda de
  asignaturas_plan.horas_semanales si no se especifica.
- Cada docente tiene color_hex permanente. Si se le va a asignar el primer curso y no
  tiene color, el sistema abre picker antes de confirmar.
- docentes.max_horas_semana (default 20) y max_horas_mes (default 80) marcan el tope.
  Si la suma de asignaciones excede el max, warning (no error).
- La unicidad del color entre docentes activos se valida en aplicación.

Tareas (en orden):

1) Backend: endpoint GET /docentes/:id/carga-gestion?gestion_id=X que calcule:
   - Suma de carga_horaria de asignaciones vigentes del docente en la gestión.
   - Compare con max_horas_semana y max_horas_mes.
   - Devuelva lista de asignaciones detalladas.

2) Backend: endpoint PUT /docentes/:id/color con validación de unicidad entre docentes
   activos. GET /docentes/colores-en-uso y GET /docentes/colores-sugeridos
   (paleta HSL fija de 16 colores).

3) Backend: endpoints CRUD de asignaciones-docentes. Al crear:
   - Si docente.color_hex es NULL → error 422 con flag requiere_color: true.
   - Si nueva asignación causa sobrecarga → warning en response pero deja crear si
     viene flag confirmar_sobrecarga: true en el body.
   - Marca asignación previa del mismo oferta_curso como vigente=FALSE.

4) Backend: endpoints de cobertura y dashboard de gestión.

5) Backend: permisos sembrados.

6) Frontend: vista matriz /institucional/horarios/asignacion-docente con:
   - Selector cascada gestión > plan > paralelo-gestión.
   - Tabla de oferta_cursos con dropdown de docente, badge de carga, color del docente.
   - Workflow: al seleccionar docente sin color, abre modal picker antes de POST.
   - Indicador de sobrecarga con clase CSS .blink (animation blink 1s infinite).

7) Frontend: vista dashboard /institucional/horarios/carga-docentes/:gestion_id con
   tarjetas KPI, tabla de docentes con barras de progreso, drawer de detalle.

8) Frontend: componente ColorPicker reutilizable con paleta + estado en-uso.

Restricciones:
- No tocar schema (todo está en Sprint 2).
- Soft delete con deleted_at.
- Idempotencia donde tenga sentido.

Empieza con la tarea 1.
```
