# Plan maestro — Refactor Horarios + Plan de Estudio

**Sistema:** Académico Instituto INCOS  
**Decisión:** Migración limpia. Las tablas `cursos` y `cursos_horarios` no forman parte del schema actual.  
**Documentos:** Este archivo es el **maestro** (`docs/plan/`). Cada sprint: `SPRINT_1.md` … `SPRINT_5.md`. **Temporal:** archivar o eliminar `docs/plan/` cuando el refactor esté estable en producción.

---

## 1. ¿Por qué este refactor?

El modelo anterior mezclaba en una sola cadena el catálogo del plan, la oferta de la gestión y la asignación docente. Los bloques colgaban de `cursos_horarios` en lugar de la asignación docente.

El modelo actual separa los procesos:

```
CFG  → Plan de Estudio       (catálogo reusable, sin gestión)
INST → Oferta Académica      (qué plan se ofrece, con qué paralelos, qué aula)
INST → Horarios              (asignación docente con carga + bloques)
MAT  → Matrícula             (estudiante elige paralelo, puede tomar materias sueltas para nivelar)
```

---

## 2. Decisiones de arquitectura

### 2.1 Las reglas duras del nuevo modelo

1. **`paralelos`** sigue siendo maestro conceptual reutilizable (PRIMERO-A SIS-INF se reusa cada año).
2. **`paralelos_gestion`** es la instancia de un paralelo en una gestión específica. Tiene `aula_id` y `turno` propios (turno se sobreescribe aquí, no en el maestro). Si se cambia el turno, los bloques se reasignan al rango correspondiente.
3. **Color del docente:** `docentes.color_hex` permanente. Unicidad por gestión la valida la aplicación al asignar (no en schema). Sin tabla intermedia.
4. **Máximo de carga docente:** `docentes.max_horas_semana` (default 20) y `docentes.max_horas_mes` (default 80), basado en datos reales del 2026.
5. **Bloques cuelgan de la asignación docente** vía tabla `asignacion_horarios` (no `cursos_horarios`).
6. **Estudiante se matricula a un paralelo** y el sistema genera N `matriculas_materia` automáticamente. Pero el estudiante puede **agregar/quitar matrículas individuales** hacia ofertas de otros paralelos (para nivelar materias atrasadas). Cada matrícula valida prerrequisitos contra `historial_previo` + matrículas aprobadas anteriores.

### 2.2 Cadena canónica

```
estudiante → inscripcion → gestion + paralelo_gestion (sugerido)
paralelo_gestion → oferta_cursos (las materias de ese paralelo esa gestión)
oferta_cursos → asignaciones_docentes (qué docente la dicta)
asignaciones_docentes → asignacion_horarios (qué bloques usa)
matriculas_materia → oferta_cursos (lo que el estudiante cursa)
```

Diferencia esencial: `matriculas_materia.oferta_curso_id` queda **estable** durante toda la gestión aunque cambie el docente.

---

## 3. Mapa del refactor (qué pasa con cada tabla)

| Tabla anterior | Acción | Detalle |
|---|---|---|
| `carreras`, `materias`, `planes_estudios`, `periodos`, `asignaturas_plan`, `prerrequisitos` | **Sin cambios** | Catálogo del Sprint 1 |
| `paralelos` | Sin cambios | Sigue como maestro conceptual |
| `aulas`, `horarios`, `gestiones`, `gestiones_planes` | Sin cambios | |
| `cursos` | **ELIMINAR** | Reemplazado por `oferta_cursos` |
| `cursos_horarios` | **ELIMINAR** | Reemplazado por `asignacion_horarios` |
| `paralelos_gestion` | **NUEVA** | Oferta de paralelo por gestión + aula base + turno |
| `oferta_cursos` | **NUEVA** | Reemplaza `cursos` |
| `asignacion_horarios` | **NUEVA** | Reemplaza `cursos_horarios` |
| `docentes` | **ALTER** | `+ color_hex, + max_horas_semana, + max_horas_mes` |
| `asignaciones_docentes` | **ALTER** | `curso_id` → `oferta_curso_id` |
| `matriculas_materia` | **ALTER** | `asignacion_docente_id` → `oferta_curso_id` |

---

## 4. Plan en 5 Sprints (dos ejes: BD + código)

| Eje | Sprints | Qué se entrega |
|-----|---------|----------------|
| **Base de datos** | 1–2 | Catálogo + DDL + seeders |
| **Aplicación** | 3–5 | API, repos, vistas SQL, UI alineados al schema actual |

Sprint 2 deja la BD **sin** `cursos` / `cursos_horarios`. Los sprints 3–5 migran el código que aún referencia el modelo anterior. Mapa detallado: `MIGRACION_CODIGO.md`.

| Sprint | Foco | Capa | Documento |
|---|---|---|---|
| **1** ✅ | CFG → Plan de Estudio (catálogo) | Código | `SPRINT_1.md` |
| **2** ✅ | Schema — DDL + seeders `27`–`48` | Solo BD | `SPRINT_2.md` |
| **3** ✅ | INST → Oferta + retiro rutas de oferta en paralelos | Código | `SPRINT_3.md` |
| **4** ✅ | Asignación docente + matrícula + calificaciones | Código | `SPRINT_4.md` |
| **5** ✅ | Grilla, conflictos, publicación | Código | `SPRINT_5.md` |
| Bonus | MAT completo + evaluaciones edge cases | Código | (post-5) |

Cada sprint de aplicación deja un **smoke E2E** contra seeders locales, no solo endpoints nuevos encima de legacy.

---

## 5. Arquitectura frontend (convenciones 2026)

Antes de cerrar Sprint 1 o abrir pantallas nuevas en CFG/INST, leer **`.cursor/rules/incos-frontend-module.mdc`**.

Resumen operativo:

1. **Carpetas = ítems de menú** (`configuracion/academico`, `configuracion/complementarios`, `institucional/horarios`), no subcarpetas por entidad salvo ruta URL propia.
2. **Application:** hooks solo en `api/`, `context/`, `features/` (tabs/listados) y `state/` (pantallas o wizards); providers delgados; mappers compartidos exportados para `shared/hooks` de catálogo.
3. **Presentation:** `routes.jsx` + `connectors/` + `pages/` + `config/`; tabs con `?tab=` y permiso por tab; subrutas para flujos transaccionales (p. ej. `/configuracion/academico/plan/:planId`).
4. **Permisos:** códigos `configuracion.*` en seeds **54–56**; coherencia con `routes.jsx` y `verificarPermiso` (ver `docs/referencia/matriz-permisos-sistema.md` § CFG).
5. **Implementación:** listado/detalle → `docs/guias/`; arquitectura → `.cursor/rules/incos-*-module.mdc` y skill correspondiente.

**Estado Sprint 1 (frontend, 2026-05-27):** refactor de menú Académico consolidado (tabs carreras/materias/planes + detalle de plan); Complementarios con mismo patrón (discapacidad operativa). **Cerrado 2026-05-29:** CRUD carreras/materias, modal eliminar, notificaciones `notification.*`.

---

## 6. Cómo usar estos documentos con el agente IA

Cada sprint MD contiene:

- **Objetivo y entregables.**
- **Tablas afectadas con DDL exacto.**
- **Endpoints backend con request/response.**
- **Pantallas frontend con rutas y permisos.**
- **Reglas de validación.**
- **Prompt para el agente IA** (sección final, listo para copiar).

Antes de empezar un sprint:
1. Confirmar que el sprint anterior cerró (sus entregables existen y funcionan).
2. Abrir el MD del sprint actual.
3. Copiar el bloque final "Prompt para agente IA" y pegárselo al agente.
4. Al cerrar el sprint, marcar el bloque "Definition of Done" del MD.

---

## 7. Datos reales que respaldan el diseño

Basado en archivos institucionales 2026 que validamos:

- **Carga docente real:** entre 18 y 20 horas/semana, 72-80 horas/mes por docente. Default schema: `max_horas_semana = 20`, `max_horas_mes = 80`.
- **Aulas existentes:** AULA-1 a AULA-8 (regulares, capacidad 30-45), LAB-1 a LAB-5 (laboratorios, capacidad 25-37).
- **Turnos en operación:** TARDE (bloques 1-6, 14:00-18:30) y NOCHE (bloques 1-5, 18:45-22:30) y SÁBADO (bloques variables).
- **Planes vigentes:** RM 0210/2023 para las 3 carreras (SIS-INF, ADM-EMP, CON-GEN), 3 años cada uno, 30 hrs/semana, 1200 hrs/año.
- **Estructura visible en horario:** cada paralelo-gestión tiene un **aula base** (ej: "2DO A CONTA TARDE" en AULA-2), confirmando que el aula sí puede vivir a nivel de `paralelo_gestion`.

---

## 8. Fuera de alcance (schema); en alcance (código)

**Schema:** evaluaciones, asistencias, licencias, nivelaciones no cambian tablas propias.

**Código:** módulos que leían `cursos` ya migran a `oferta_cursos` / `oferta_curso_id` (ver `MIGRACION_CODIGO.md`). Sprint 5 completa grilla y publicación.

Temas que siguen sin rediseño de negocio:
- Pagos, becas, documentos del estudiante.
- Seguridad RBAC (se agregan permisos nuevos pero no se redefine).
- Reportes históricos sobre gestiones cerradas.

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Refactor de `matriculas_materia.oferta_curso_id` rompe módulo de evaluaciones | Mantener `asignatura_plan_id` como redundancia controlada (ya existe). Las evaluaciones se enlazan vía esa columna estable. |
| Cambio de turno en `paralelo_gestion` deja bloques colgando | Endpoint de cambio de turno debe limpiar/mover bloques en la misma transacción. Documentado en Sprint 3. |
| Color duplicado entre docentes activos | Validación al asignar en módulo de Sprint 4. Picker de color sugiere libres. |
| Sobrecarga docente no detectada | Endpoint `/api/v1/docentes/:id/carga-gestion` con `max_horas_semana` vivo. Parpadeo en UI. |

---

**Estado del plan:** Aprobado. **Sprints 1–5 cerrados en código** (cierre Sprint 5: 2026-06-01 — API grilla `paralelo_gestion`, motor de conflictos, publicación masiva, armado FE con selector `?pg=`, `GET grilla-horario`, `POST bulk` + `POST conflictos/validar`, vistas conflictos y publicación). Ver `MIGRACION_CODIGO.md`, `SPRINT_5.md`. **Post-5 (opcional):** deprecar `PUT /paralelos/:id/schedule`, smoke E2E automatizado, parpadeo CSS en chips del plan semanal, confirmación con contraseña al publicar con conflictos.
