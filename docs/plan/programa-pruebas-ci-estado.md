# Programa de pruebas y correcciones — estado vivo

> **Punto de entrada para retomar sin re-derivar contexto.** Se actualiza en cada PR del programa.
> **Última actualización:** 2026-10-26. Rama de trabajo del programa: `claude/blissful-dijkstra-vf4yji`.

## Objetivo
Cerrar el backlog de `correcciones-hallazgos-pruebas.md` y ampliar las pruebas de backend y frontend
(unitarias, integración, seguridad, carga/estrés, E2E) para que las ejecute el CI/CD. Se excluyen
`design/` y `studio/`. Autorización vigente: ejecución autónoma, sin pedir confirmación paso a paso.

## Método de entrega
- Un PR por proceso de cambio, hacia `develop`, **de uno en uno** (el auto-merge falla con "Base branch was modified" si dos PR se fusionan a la vez).
- Cada PR corre el CI (`ci.yml`): lint, pruebas unitarias, build, integración con MariaDB. Los cambios en `.github/workflows` no se auto-fusionan: se fusionan a mano.
- Todo cambio de lógica lleva su prueba (skill `incos-testing`; guía `docs/guias/pruebas.md`).
- Trabajo paralelo con agentes en worktrees (agentes del proyecto en `.claude/agents/`); el orquestador integra y verifica.

## Estado de las correcciones del backlog
| Bloque | Estado |
|---|---|
| 1 Pagos, 2 Seguridad, 3 Cadena de negocio, 5 Titulación, 7 Estudiantes | Hechos y fusionados (PR #34 a #39) |
| Decisiones de negocio (bimestres, licencias docente, estados) | Hecho; PR de este programa |
| 4 Fechas y asistencia | En curso |
| 6 Configuración y catálogos | En curso |

## Decisiones tomadas
- Compuerta de bimestre única (`assertBimestreEditable`): editable EN_CURSO o REABIERTO; cerrado solo tras reapertura, que exige gestión vigente y permiso de gestión de bimestres (RECTOR, DIR_ACADEMICO; ADMIN_SISTEMA por herencia). 
- Licencias de docente: fuera de alcance (quitadas del seed 60, la matriz y las rutas). Las bases ya sembradas conservan los registros viejos, apagados: **es obligatorio re-sembrar el seed 60 (permisos) al desplegar** (confirmado).
- `paralelos_gestion`: BORRADOR→OFERTADO; OFERTADO→PUBLICADO|BORRADOR; PUBLICADO→OFERTADO|BORRADOR|CERRADO; CERRADO terminal. **Confirmado por el dueño (2026-10-26)**, incluido PUBLICADO→CERRADO.
- `OfertaCurso`: PROGRAMADA→ACTIVA|CANCELADA; ACTIVA→CERRADA|CANCELADA. `GestionPlan`: PROPUESTO→APROBADO|CANCELADO; APROBADO→VIGENTE|CANCELADO; VIGENTE→CERRADO|CANCELADO. **Confirmado por el dueño (2026-10-26)**: CANCELADO desde VIGENTE permitido y sin vuelta a PROPUESTO.

## Cobertura backend (unitarias) al 2026-10-26
Global 50 % líneas / 37 % ramas, 4105 pruebas. Menor cobertura: `infrastructure/external/excel` 5 %, `views` 3 %, `external/pdf` 26 %, controllers 17–36 %, `presentation/validators/estudiantes` 2 %.

## Frentes de pruebas
| Frente | Dónde | Estado |
|---|---|---|
| Controllers/validators backend | `backend/tests/unit/` | En curso |
| Generadores PDF/Excel y repos de vistas | `backend/tests/unit/` | En curso |
| Seguridad (HTTP, RBAC exhaustivo, `npm audit`) | `tests/unit/seguridad-http`, `tests/integration/seguridad.test.js`, job `seguridad` | En curso |
| Carga y estrés (k6) | `backend/tests/load`, `.github/workflows/carga.yml` | En curso |
| Frontend capa `application` | `frontend/src/application/**/__tests__` | En curso |
| Frontend `presentation` + E2E Playwright | `frontend/e2e`, `.github/workflows/e2e.yml` | En curso |

## Límites conocidos
- El entorno de agentes no tiene MariaDB: las pruebas de integración y de carga solo se validan de verdad en el CI.
- Seguimiento académico, Traspasos y Transitabilidad siguen fuera de alcance.
