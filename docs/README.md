# Documentación INCOS

Dos capas con distinto ciclo de vida: **permanente** (contexto del agente, guías y referencia) y **temporal** (planes de trabajo).

## Permanente — crece con el producto

| Capa | Ubicación | Cuándo editar |
|------|-----------|---------------|
| **Contexto raíz** | `CLAUDE.md` | Principios, reglas de proceso y flujo operativo siempre activos |
| **Skills** | `.claude/skills/*/SKILL.md` | Flujos por área: listado, detalle, RBAC, UI, backend, pruebas |
| **Agentes** | `.claude/agents/*.md` | Roles de orquestación (orquestador, arquitecto, planificador, frontend, backend, datos, revisor-ui, verificador) |
| **Guías de implementación** | `docs/guias/` | Paso a paso al crear pantallas/endpoints |
| **Referencia operativa** | `docs/referencia/` | Datos vivos (permisos, flujo operativo, estilo de textos) |

> `CLAUDE.md` y `.claude/` (agentes, skills y prompt maestro) **sí se versionan**, para seguir con el mismo contexto en cualquier máquina; solo `.claude/settings.local.json` es local. Las guías de `docs/` (por ejemplo `pruebas.md`) repiten lo esencial de los skills equivalentes.

### Skills (`.claude/skills/`)

`incos-ui-system`, `incos-frontend-module`, `incos-backend-module`, `incos-rbac`, `incos-permisos-rbac`, `incos-antd5-api`, `incos-modulo-listado`, `incos-modulo-detalle`, `incos-vistas-y-evolucion`, `incos-testing`, `clean-architecture-refactor`, `react-ui-ux-designer`. La tabla de cuándo se activa cada uno está en `CLAUDE.md`.

### `docs/guias/`

| Archivo | Propósito |
|---------|-----------|
| `implementacion-listado-modulo.md` | Cookbook de listado (FE + BE, referencias Docentes/CFG) |
| `checklist-listado.md` | Checklist de una página — listado |
| `implementacion-detalle-modulo.md` | Cookbook de ficha / detalle |
| `checklist-detalle.md` | Checklist de una página — detalle |
| `pruebas.md` | Pruebas automáticas: Jest (backend), Vitest (frontend), integración con BD efímera y CI |
| `activacion-cursado-horarios-calificaciones.md` | Activación del cursado, horarios y calificaciones |

### `docs/referencia/`

| Archivo | Propósito |
|---------|-----------|
| `matriz-permisos-sistema.md` | Pantalla ↔ `permisos.codigo` ↔ API ↔ acción |
| `flujo-operativo-gestion-academica.md` | Orden operativo CFG→INST→MAT→ACA; smoke E2E pantalla por pantalla |
| `estilo-textos-usuario.md` | Catálogo de conversiones voseo/tuteo a "usted" formal (regla en el skill `incos-ui-system`) |
| `tarjeta-informativa.md` | Referencia de la tarjeta informativa |

### Cadena de negocio (no negociable)

`paralelos_gestion` → `oferta_cursos` → `asignaciones_docentes` → `asignacion_horarios` → `horarios`

Se documenta en `CLAUDE.md` y con diagrama en `docs/referencia/flujo-operativo-gestion-academica.md`.

## Temporal — planes de trabajo (`docs/plan/`)

Planes de desarrollo, diseños y diagnósticos por dominio. Se archivan o eliminan cuando el trabajo se cierra y se estabiliza en producción. Punto de entrada: `estado-avance-y-proximos-pasos.md`.

| Dominio | Archivos |
|---------|----------|
| Estado general | `estado-avance-y-proximos-pasos.md`, `auditoria-modelo-datos.md` |
| Calificaciones y centralizador | `calificaciones-centralizador-nivelacion-rediseno.md`, `centralizador-nivelacion-plan-desarrollo.md`, `centralizador-nivelacion-frontend-diseno.md` |
| Matrícula | `matricula-arrastre-choques-centralizador.md`, `matricula-wizard-rediseno.md`, `planes-duales-matricula-plan-desarrollo.md` |
| Titulación y libros | `titulacion-avance-y-modalidad-plan-desarrollo.md`, `titulacion-y-dominios-pendientes.md`, `acta-defensa-grado-plan-desarrollo.md`, `libros-registro-plan-desarrollo.md` |
| Docencia y capacitación | `supervision-docente-plan-desarrollo.md`, `tutorias-plan-desarrollo.md`, `capacitacion-plan-desarrollo.md` |
| Reportes | `reportes-rep-diagnostico.md` |
| Sincronización | `sincronizacion-conflictos-seeders.md`, `sincronizacion-historico-migraciones.md`, `sincronizacion-servidor-local.md` |

## Flujo con el agente

```
Tarea nueva
  → CLAUDE.md (principios y reglas siempre activas)
  → skill del área (incos-ui-system | incos-frontend-module | incos-backend-module | incos-rbac | …)
  → guía en docs/guias/ + matriz de permisos si hay RBAC
  → docs/plan/ si el trabajo pertenece a un plan en curso
  → incos-testing: prueba en el mismo PR
```

## Ramas y CI

`master` y `develop` solo reciben cambios por PR (hacia `develop`); el CI (`.github/workflows/ci.yml`) corre lint, pruebas y build. Resumen en el [`README.md`](../README.md) de la raíz.

## Nombres antiguos (eliminados)

| Antes | Ahora |
|-------|--------|
| `04_guia_…` | `guias/implementacion-listado-modulo.md` |
| `04a_checklist_…` | `guias/checklist-listado.md` |
| `05_guia_…` | `guias/implementacion-detalle-modulo.md` |
| `05a_checklist_…` | `guias/checklist-detalle.md` |
| `06_` / `07_` arquitectura | skills `incos-frontend-module` / `incos-backend-module` |
| `docs/plan/PLAN_MAESTRO.md`, `MIGRACION_CODIGO.md`, `SPRINT_*.md` | ya no existen en `docs/plan/` |
