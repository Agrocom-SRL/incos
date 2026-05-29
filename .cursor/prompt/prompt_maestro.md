# INCOS — Tarea de desarrollo

## Contexto
Monorepo INCOS: backend Express + Sequelize + MySQL; frontend React + Ant Design v5;
Clean Architecture por capas. Plan en docs/plan/ (temporal). Reglas permanentes en .cursor/rules/.

**Estado plan:** Sprint 3 cerrado (2026-05-29). **Sprint 4 en curso** — ver `SPRINT_4.md` §0.1 (pistas A + B).

## Antes de escribir código (obligatorio)
1. Leer `.cursor/rules/incos-project.mdc` y aplicar la regla del área:
   - UI/páginas/CSS → incos-ui-system
   - Estructura FE (hooks, connectors, tabs) → incos-frontend-module
   - API, use cases, repos, DI → incos-backend-module
   - Permisos (routes, ActionButton, verificarPermiso, seeds) → incos-rbac
2. Skills según la tarea:
   - Listado/tabla → incos-modulo-listado + docs/guias/implementacion-listado-modulo.md + checklist-listado.md
   - Ficha/detalle/plan → incos-modulo-detalle + implementacion-detalle-modulo.md + checklist-detalle.md
   - Solo permisos/seeds → incos-permisos-rbac + docs/referencia/matriz-permisos-sistema.md
   - Pulir pantalla → react-ui-ux-designer
3. Plan actual: `docs/plan/SPRINT_4.md`, `MIGRACION_CODIGO.md`, `PLAN_MAESTRO.md`

## Restricciones globales
- Carpetas por ítem de menú (`configuracion/academico/`), NO por entidad (no hooks/carreras/).
- pages/ y connectors/ sin lógica de negocio ni fetch; hooks en application/.../hooks/{api,features,state}.
- dataKey frontend = dataFieldName backend en todas las respuestas API.
- RBAC: misma acción en routes.jsx, TableActions/ActionButton y verificarPermiso (LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR — nunca VER).
- UI: theme Ant Design; sin #hex/fontSize literal (salvo color de negocio sanitizado).
- Cero ALTER TABLE salvo que el sprint lo diga explícitamente.
- **No posponer** inscripciones ni calificaciones hasta Sprint 5; la grilla horarios es Sprint 5.

## [OBJETIVO]
Sprint 4 — Pista A, tarea **A2**: implementar color docente según `SPRINT_4.md` §3.3:
- `PUT /api/v1/docentes/:id/color`
- `GET /api/v1/docentes/colores-en-uso`
- `GET /api/v1/docentes/colores-sugeridos` (paleta 16 colores HSL)

**A1 completado:** `GET /api/v1/docentes/:id/carga-gestion?gestion_id=` — suma asignaciones vigentes sobre `oferta_cursos`, compara con `max_horas_semana` / `max_horas_mes`, `data.carga_gestion`.

Cuando A2–A3 estén estables, abrir **Pista B** (CreateEnrollmentUseCase → `oferta_curso_id`).

Referencia de cadena ya desplegada:
```
gestiones_planes → paralelos_gestion → oferta_cursos → asignaciones_docentes → matriculas_materia.oferta_curso_id
```

## Entregable esperado
- Lista de archivos tocados (BE/FE) alineados a las capas.
- Checklist de guía marcado (listado o detalle si aplica).
- Actualizar matriz si hay permiso/endpoint nuevo.
- Indicar qué probar manualmente (rol con/sin permiso).
- Smoke Pista B: inscripción de prueba + cuaderno docente sobre misma gestión/oferta.
