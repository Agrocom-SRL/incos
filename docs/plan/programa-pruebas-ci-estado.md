# Programa de pruebas y correcciones — estado vivo

> **Punto de entrada para retomar sin re-derivar contexto.** Se actualiza en cada PR del programa.
> **Última actualización:** 2026-10-26 (noche). Rama de trabajo del programa: `claude/blissful-dijkstra-vf4yji`.

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
| 1 Pagos, 2 Seguridad, 3 Cadena de negocio, 5 Titulación, 7 Estudiantes | Fusionados (PR #34 a #39) |
| Decisiones de negocio (bimestres, licencias docente, estados) | Fusionado (PR #56) |
| 4 Fechas y asistencia | Fusionado (PR #57) |
| 6 Configuración y catálogos | Fusionado (PR #58) |
| Hallazgos de la integración (centralizador vacío, `POST /libros`, `POST /carreras` duplicada, aporte huérfano, `stack` en 404) | En curso |

## Decisiones tomadas
- Compuerta de bimestre única (`assertBimestreEditable`): editable EN_CURSO o REABIERTO; cerrado solo tras reapertura, que exige gestión vigente y permiso de gestión de bimestres (RECTOR, DIR_ACADEMICO; ADMIN_SISTEMA por herencia). 
- Licencias de docente: fuera de alcance (quitadas del seed 60, la matriz y las rutas). Las bases ya sembradas conservan los registros viejos, apagados: **es obligatorio re-sembrar el seed 60 (permisos) al desplegar** (confirmado).
- `paralelos_gestion`: BORRADOR→OFERTADO; OFERTADO→PUBLICADO|BORRADOR; PUBLICADO→OFERTADO|BORRADOR|CERRADO; CERRADO terminal. **Confirmado por el dueño (2026-10-26)**, incluido PUBLICADO→CERRADO.
- `OfertaCurso`: PROGRAMADA→ACTIVA|CANCELADA; ACTIVA→CERRADA|CANCELADA. `GestionPlan`: PROPUESTO→APROBADO|CANCELADO; APROBADO→VIGENTE|CANCELADO; VIGENTE→CERRADO|CANCELADO. **Confirmado por el dueño (2026-10-26)**: CANCELADO desde VIGENTE permitido y sin vuelta a PROPUESTO.

## Pruebas: cobertura y PR fusionados
| Frente | PR | Resultado |
|---|---|---|
| Controllers y validators backend | #59 | 94–100 % en los módulos medidos |
| Seguridad (HTTP, JWT, inyección, IDOR, subidas, rate limit) | #60 | 7 huecos reales corregidos; `npm audit` en rojo (backend 21, frontend 8) |
| Use cases y controllers academico/configuracion/pagos | #61 | 90–100 % |
| Excel, PDF y repositorios de vistas | #62 | 93–99 % |
| Frontend: componentes, RBAC y E2E Playwright | #63 | 448 pruebas + 20 E2E |
| Carga y estrés (k6) | #64 | Scripts; nunca ejecutados |
| Frontend capa `application` | #65 | 6 → 54 % de líneas; objetivo 70 % pendiente |
| Backend ronda 2 (repos, middleware, rutas, dominio, contenedor) | #66 | Global ~87 % líneas, 73 % ramas |
| Integración por dominio (8 dominios, MariaDB real) | #67 | 16 suites, 476 pruebas, validadas en local y en CI |
| `presentation/validators` backend | rama `test/validators-cobertura` | 72 % → 98 % de líneas (89,6 % de ramas), +680 pruebas; 5 correcciones de validators/use cases con su prueba |

Backend: ~8 700 pruebas unitarias. Frontend: ~1 200 pruebas de Vitest.

## Correcciones de la ronda de validators (rama `test/validators-cobertura`)
- Estudiantes: `registerStudentValidator` acepta `null` explícito en los ids opcionales (igual que update); la regla ANTIGUO (gestión y carrera) ya no queda saltada por `optional()` y los use cases de registro y actualización también la exigen; los ids de update usan validación estricta (`'3abc'`, `'1.5'` y `0` se rechazan).
- Asignaciones docentes: `docenteId`, `ofertaCursoId` (y `gestionPlanId` en el alta) son requeridos en `createTeacherAssignmentValidator` y `assignTeacherToCourseValidator`.
- Carreras: `UpdateCarreraUseCase` lanza `ConflictError` si el código ya lo usa otra carrera; el límite de `codigo` pasa de 50 a 20 (VARCHAR(20)).
- Pagos: en registro y edición de cuota, la cuenta de pago y el comprobante exigidos por método (QR, transferencia, depósito) ya no se saltan cuando el campo no viaja.

## Pendiente de aplicar a mano (el token de la sesión automatizada no tiene permiso `workflow`)
`docs/plan/workflows-pendientes/`: `seguridad-ci.patch` (paso `test:seguridad` y job `seguridad` en `ci.yml`), `e2e.yml.txt` y `carga.yml.txt` (copiar a `.github/workflows/`). Mientras no se apliquen, el E2E, la carga y la seguridad no corren en el CI.

## Pendiente de decidir
- `areaConocimiento` de Materia: la tabla `materias` no tiene la columna; guardarla exige DDL (aprobación de diseño de schema).
- Contratos que cambian: asistencia con bimestre inválido 404→400; filtros de id inválidos 400 en vez de ignorarse; `UpdatePeriodoFechas` exige ambas fechas; la auditoría ahora registra al usuario real (`req.user = req.usuario`, PR #66).
- `POST /proyectos-grado/:id/bitacora/:entradaId/confirmar` muta con permiso de lectura (`titulacion.bitacora` + `LISTAR`): confirmar si es intencional. Comentado en `proyectos-grado.routes.js`; no se tocó el permiso.
- Deuda de seguridad no corregida: `/uploads` estático sin autenticación (incluye documentos de estudiantes), SVG servidos desde `/uploads`, `/api-docs` público, `X-Forwarded-For` sin validar; detrás de Nginx definir `TRUST_PROXY=true`.
- Discrepancias entre `matriz-permisos-sistema.md` y lo sembrado (se siguen los seeds).

## Siguiente
- Pruebas de presentación por módulo del frontend (agente en curso).
- Frontend `application`: matrícula (~10 %) y capacitación (~900 líneas sin cubrir) para llegar al 70 %; Providers y hooks de institucional.
- Primera ejecución real de las pruebas de carga cuando se aplique `carga.yml`.

## Límites conocidos
- Los agentes pueden instalar MariaDB 10.11 con apt para validar la integración en local; k6 no se puede instalar (descarga bloqueada).
- Seguimiento académico, Traspasos y Transitabilidad siguen fuera de alcance.
