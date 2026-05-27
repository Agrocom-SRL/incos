# Sprint 3 — INST: Oferta Académica

**Documento padre:** `PLAN_V2_MAESTRO.md`
**Duración estimada:** 1-2 semanas
**Pre-requisito:** Sprint 2 cerrado (schema V2 desplegado).

---

## 1. Objetivo

Construir el módulo **INST → Oferta Académica** donde el equipo administrativo:
1. Habilita un plan de estudio en una gestión específica (`gestiones_planes`).
2. Genera automáticamente los `paralelos_gestion` para la oferta (con su aula base y turno).
3. Genera automáticamente las `oferta_cursos` desde el plan vigente (todas las asignaturas del periodo aplicable a cada paralelo).
4. Puede editar aulas, turnos y estado de cada paralelo-gestión.

Al final del sprint la oferta del año está lista para asignar docentes (Sprint 4).

## 2. Entregables

1. **API backend** para habilitar planes, generar paralelos-gestión y generar oferta de cursos.
2. **Permisos RBAC** correspondientes.
3. **Frontend** con flujo guiado de 3 pasos: gestión → habilitar plan → generar oferta.
4. **Endpoint de cambio de turno** con migración de bloques (aunque en este sprint todavía no hay bloques, deja el endpoint listo para Sprint 5).

## 3. Endpoints backend

### 3.1 Gestiones y planes habilitados

- `GET /api/v1/gestiones` — lista de gestiones (ya existe en base)
- `POST /api/v1/gestiones/:id/marcar-vigente` — desmarca otras + marca esta
- `GET /api/v1/gestiones/:id/planes-habilitados` — lista de `gestiones_planes` de esa gestión
- `POST /api/v1/gestiones-planes` — body: `{ gestion_id, plan_estudio_id }`. Crea fila con estado `PROPUESTO`.
- `PUT /api/v1/gestiones-planes/:id/estado` — body: `{ estado: 'PROPUESTO' | 'APROBADO' | 'VIGENTE' | 'CERRADO' | 'CANCELADO' }`

### 3.2 Paralelos de gestión

- `GET /api/v1/gestiones-planes/:id/paralelos-gestion` — lista
- `POST /api/v1/gestiones-planes/:id/generar-paralelos-gestion`
  - Toma el `plan_estudio_id` del `gestion_plan`.
  - Busca todos los `paralelos` activos de la `carrera_id` del plan.
  - Crea un `paralelos_gestion` por cada uno, con `turno` heredado del paralelo maestro, `aula_id = NULL`, `estado = BORRADOR`.
  - Idempotente: si ya existen, no duplica.
- `PUT /api/v1/paralelos-gestion/:id` — edita `aula_id`, `cupo_maximo`, `cupo_minimo`, `observaciones`.
- `PUT /api/v1/paralelos-gestion/:id/cambiar-turno` — body: `{ turno: 'MAÑANA' | 'TARDE' | 'NOCHE' }`
  - Cambia el turno y, si ya existen bloques en `asignacion_horarios` (Sprint 5), los re-mapea al rango horario del nuevo turno. En este sprint solo registrar el endpoint con TODO interno.
- `PUT /api/v1/paralelos-gestion/:id/estado` — body: `{ estado }`
  - Reglas: `BORRADOR → OFERTADO` requiere tener oferta_cursos generada y aula asignada.
  - `OFERTADO → PUBLICADO` requiere validación de Sprint 5 (sin conflictos, carga completa).

### 3.3 Oferta de cursos

- `GET /api/v1/paralelos-gestion/:id/oferta-cursos` — lista de cursos ofertados en ese paralelo
- `POST /api/v1/paralelos-gestion/:id/generar-oferta`
  - Toma el `plan_estudio_id` del `gestion_plan_id` del paralelo-gestión.
  - Toma el `periodo_id` correspondiente al paralelo maestro (vía `paralelos.periodo_id`).
  - Busca todas las `asignaturas_plan` de ese periodo en ese plan.
  - Crea un `oferta_curso` por cada una, con `estado = PROGRAMADA`.
  - Idempotente.
- `POST /api/v1/oferta-cursos` — manual: body `{ paralelo_gestion_id, asignatura_plan_id }`
- `PUT /api/v1/oferta-cursos/:id/estado` — body: `{ estado }`
- `DELETE /api/v1/oferta-cursos/:id` — soft delete

### 3.4 Validación de cobertura

- `GET /api/v1/paralelos-gestion/:id/validar-oferta`
  - Response: `{ valido: bool, asignaturas_esperadas: N, oferta_actual: N, faltantes: [...], sobrantes: [...], horas_total: M }`
  - Faltantes: materias del plan que no están en `oferta_cursos`.
  - Sobrantes: cursos en oferta que no pertenecen al periodo del plan.

## 4. Permisos RBAC

| código | nombre |
|---|---|
| `institucional.oferta.gestion-plan` | Habilitar planes en gestión |
| `institucional.oferta.paralelo-gestion` | Gestionar paralelos de gestión |
| `institucional.oferta.cursos` | Gestionar oferta de cursos |

Acciones aplicables: `LISTAR`, `DETALLE`, `CREAR`, `EDITAR`, `ELIMINAR`, `ACTIVAR`.

## 5. Frontend

Ruta raíz: `/institucional/oferta-academica`

### 5.1 Pantalla principal: Wizard

Stepper de 3 pasos en una sola página:

```
[ 1. Gestión ]  →  [ 2. Planes ]  →  [ 3. Paralelos + Oferta ]
```

**Paso 1: Gestión**
- Dropdown de gestiones disponibles.
- Marca la activa (botón "marcar vigente").

**Paso 2: Planes habilitados**
- Lista de planes habilitados en la gestión.
- Botón "Habilitar plan" → modal con dropdown de `planes_estudios.vigente = TRUE`.
- Click en un plan habilitado → continúa al paso 3.

**Paso 3: Paralelos + Oferta**
- Botón principal: "Generar paralelos de gestión" (idempotente).
- Tabla de paralelos generados:

| Paralelo | Turno | Aula | Cupos | Oferta | Estado | Acciones |
|---|---|---|---|---|---|---|
| PRIMERO A | TARDE | AULA-1 ▼ | 35 | ✓ 7/7 | BORRADOR | [Generar oferta] [Editar] |
| PRIMERO B | TARDE | AULA-2 ▼ | 35 | ⚠ 5/7 | BORRADOR | [Generar oferta] |
| PRIMERO C | NOCHE | (sin asignar) | 35 | — | BORRADOR | [Asignar aula] |

- Edición inline de aula y turno.
- "Generar oferta" llama al endpoint correspondiente y muestra resultado.
- Badge "✓ 7/7" = oferta completa según validador.
- Botón global "Cambiar todos a OFERTADO" (valida que tengan aula + oferta completa).

### 5.2 Drawer/Modal de paralelo-gestión

Al click en una fila, se abre detalle:
- Datos del paralelo maestro (read-only).
- Datos editables: aula, turno, cupos, observaciones.
- Lista de `oferta_cursos` con su asignatura y horas.
- Botón "Agregar curso manual" (para casos especiales fuera del plan estándar).

## 6. Reglas de validación

1. **Cambio de turno con bloques:** si `paralelos_gestion.estado >= PUBLICADO`, no se puede cambiar el turno (los bloques ya están publicados al estudiantado). Solo permitido en `BORRADOR` u `OFERTADO`.
2. **Pasar a OFERTADO:** requiere `aula_id != NULL` y validación de oferta completa (`faltantes.length === 0`).
3. **Pasar a PUBLICADO:** se valida en Sprint 5 (cobertura de bloques + cero conflictos). Aquí solo se valida pre-condición OFERTADO.
4. **Eliminar paralelo-gestión:** no permitido si tiene `oferta_cursos` activas con `matriculas_materia` asociadas.
5. **Aula única por horario:** no se valida acá (eso es bloque a bloque en Sprint 5). En este sprint dos paralelos pueden compartir aula sin error.

## 7. Definition of Done

- [ ] Backend con endpoints de las secciones 3.1 a 3.4.
- [ ] Permisos sembrados.
- [ ] Pantalla wizard funcional para los 3 pasos.
- [ ] Generación automática de paralelos-gestión y oferta de cursos funcionando.
- [ ] Validador de cobertura visible.
- [ ] Cambio de estado con validaciones.
- [ ] Test E2E manual: gestión nueva → habilitar plan SIS-INF → generar 3 paralelos → asignar aulas → generar oferta → ver 7+8+8 cursos creados → pasar todos a OFERTADO.

---

## 8. Prompt para agente IA

```
Contexto: Sprint 3 del plan V2 de INCOS. Vamos a construir el módulo INST → Oferta
Académica. Los Sprints 1 y 2 ya están cerrados, así que:
- El catálogo Plan de Estudio existe y tiene UI.
- El schema V2 está desplegado: paralelos_gestion, oferta_cursos, asignacion_horarios
  ya existen. asignaciones_docentes apunta a oferta_curso_id.
- docentes tiene color_hex, max_horas_semana, max_horas_mes.

Tareas (entrega en orden, espera aprobación entre cada una):

1) Backend: implementar endpoints sección 3 de SPRINT_3.md. Estructura por capas
   (controller + service + repository). Validaciones en service. Sequelize ORM.

   Endpoints clave a generar primero:
   - POST /gestiones-planes/:id/generar-paralelos-gestion (idempotente)
   - POST /paralelos-gestion/:id/generar-oferta (idempotente)
   - GET /paralelos-gestion/:id/validar-oferta

2) Backend: endpoint PUT /paralelos-gestion/:id/cambiar-turno con TODO comentado
   para la futura migración de bloques (Sprint 5). Por ahora solo cambia el campo.

3) Backend: permisos sembrados para institucional.oferta.gestion-plan,
   institucional.oferta.paralelo-gestion, institucional.oferta.cursos con sus 6 acciones
   típicas (LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR).

4) Frontend: pantalla wizard /institucional/oferta-academica con stepper Ant Design
   3 pasos (Gestión, Planes habilitados, Paralelos + Oferta).
   - Paso 1: dropdown de gestiones + botón marcar vigente.
   - Paso 2: lista de planes habilitados + modal "Habilitar plan".
   - Paso 3: tabla de paralelos-gestión con edición inline de aula y turno,
     botón "Generar oferta" por fila, badge de cobertura.

5) Frontend: drawer/modal de detalle de paralelo-gestión con:
   - Datos read-only del paralelo maestro.
   - Edición de aula, turno, cupos.
   - Lista de oferta_cursos.
   - Botón "Agregar curso manual".

Restricciones del proyecto:
- Cero ALTER TABLE en este sprint (todo el schema está en Sprint 2).
- Toda validación en aplicación.
- Soft delete con deleted_at.
- Operaciones de generación deben ser idempotentes.

Empieza con la tarea 1.
```
