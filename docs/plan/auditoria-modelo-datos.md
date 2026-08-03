# Auditoría del modelo de datos — fundamentación documental y coherencia

**Fecha:** 2026-07-27 / 2026-07-28 · **Alcance:** `backend/database/01-schemas` (27 archivos), `02-seeders`, `03-views`, contrastados contra la documentación real del instituto (`/Users/miguel/Documents/incos/`, fuera del repo).

Propósito: dejar respaldo de (1) la renumeración de schemas por orden de dependencias, (2) la fundamentación documental de los dominios de titulación/pasantías/libros/supervisión, y (3) los hallazgos de las auditorías de coherencia, para poder acudir a este documento en el futuro sin re-derivar el análisis.

---

## 1. Renumeración de schemas por dependencias FK (2026-07-28)

Los schemas se ejecutan en orden numérico; toda FK debe apuntar a una tabla creada en un archivo anterior (o el mismo). Un script de barrido sobre los 27 archivos (`CREATE TABLE` vs `REFERENCES`) encontró **2 violaciones**, ambas resueltas:

| Violación | Causa | Resolución |
|---|---|---|
| `tutorias` (ex 22) → `proyectos_grado` (ex 23) | satélites creados antes que su raíz | intercambio 22↔23 |
| `titulos` (ex 24) → `folios_estudiantes` | FK a tabla eliminada en el refactor de libros | títulos movido al 26 + FKs corregidas |

**Numeración final de la cola** (verificada: 0 violaciones en toda la cadena 01→27):

| Archivo | Antes | Contenido |
|---|---|---|
| `22-modalidades-grado.sql` | 23 | `modalidades_grado`, `proyectos_grado` (sin cambios de columnas; backend ya construido) |
| `23-tutorias-acompanamiento.sql` | 22 | 6 satélites de `proyectos_grado` + sesiones de refuerzo |
| `24-pasantias.sql` | 25 | `pasantias_empresas`, `pasantias`, `pasantias_informes`, `pasantias_seguimientos` |
| `25-libros-registro.sql` | 26 | `libros_registro`, `folios_libro`, `folio_estudiantes` |
| `26-titulos-certificados.sql` | 24 | `titulos` (+`pasantia_id`, `folio_estudiante_id`), `certificados` |
| `27-supervision-docente.sql` | nuevo | `fichas_seguimiento_clase` |

Ajustes de integridad aplicados a `26-titulos-certificados.sql` para que la cadena ejecute:
- `pasantia_id` → `pasantias` (la práctica laboral de la R.M. 487/2023 es requisito de titulación paralelo a la modalidad de graduación).
- `folio_estudiante_id` → `folio_estudiantes` (reemplaza al roto `folio_id` → `folios_estudiantes`).

Referencias de numeración actualizadas en: modelos Sequelize (`proyecto_grado.js`, `modalidad_grado.js`), `tutorias.constants.js`, validator y routes de proyectos-grado, vistas 159/161/163, seeder 67, `docs/plan/tutorias-plan-desarrollo.md`, `docs/plan/capacitacion-plan-desarrollo.md`, `.claude/agents/datos.md`.

---

## 2. Fundamentación documental de los schemas 22–27 (2026-07-27)

Los borradores originales de estos dominios fueron propuestas sin base documental. Se reescribieron contra los documentos reales de `/Users/miguel/Documents/incos/pasantia/` y `OtraDocumentacion INCOS.pdf`:

| Schema | Documento fuente | Decisiones clave |
|---|---|---|
| 22-modalidades | FORMULARIO 01 DE MODALIDAD DE GRADUACION (FMDG-1) | Sin cambios; la pasantía NO es modalidad (seeder 67: PSP/PG/PE/TD) |
| 23-tutorías | Planillas de seguimiento/reporte de tutoría | Ya estaba fundamentado; base del módulo TUT existente |
| 24-pasantías | Informe de verificación de empresa · Formato de convalidación · Hoja de seguimiento | R.M. 487/2023: **300–360 h** (no 240). Dos caminos: `PASANTIA` y `CONVALIDACION`. Escala única ALTO/MEDIO/BAJO |
| 25-libros | LIBRO LLENADO SISTEMAS (Excel real) + Historial Académico + fotos del centralizador | Libro **por carrera y por gestión** (secuencia 12→13→14, un número por gestión); folio = página de un paralelo, hasta 10 estudiantes; notas por materia derivadas de la vista 135, no duplicadas |
| 26-títulos | **Sin base documental encontrada** | Solo FKs de integridad; el resto sigue marcado como propuesta |
| 27-supervisión | FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL (plantilla 2026 sellada por Dirección Académica) | Réplica campo a campo; se eliminó `supervisiones_programadas` (sin documento que la respalde) |

Pendiente de modelar (documentado, sin construir): acta de defensa de grado (foto real acta N° 012, "ACTA DE DEFENSA DE GRADO — PROYECTO DE GRADO": número, fecha, hora inicio/fin, tribunal de 3 miembros, calificación final, resultado APRUEBA/REPRUEBA) — candidato a satélite en 23.

---

## 3. Auditoría A — coherencia `01-schemas` → `02-seeders` → `03-views` (2026-07-28)

Barrido programático de 98 tablas y 162 vistas + verificación manual a nivel de columna de las vistas 135 y 156–163 y de los seeders 54/66/67.

### Problema confirmado (preexistente, único) — RESUELTO 2026-07-28

- `03-views/22-vista-base-pago-aporte-info.sql:62` hacía `LEFT JOIN vista_base_estudiante_carrera_reciente`, que se crea recién en el archivo **38**. En una BD limpia, el despliegue de vistas en orden numérico fallaba en el 22 y arrastraba a toda su cadena descendente (35 → 37 → 39 y 35 → 89). No dolió hasta ahora porque en redeploys incrementales la 38 ya existía.
- **Fix aplicado (distinto al propuesto originalmente de mover solo la 22 al 164):** el grafo completo mostró que mover únicamente la 22 rompía a sus consumidores. Renumeración mínima con `git mv` (4 archivos, la cadena 89→90 no se toca):
  - `39-vista-estudiante-busqueda-registro-aporte` → **165** (libera el 39)
  - `22-vista-base-pago-aporte-info` → **39** (queda justo después de su dependencia 38)
  - `35-vista-pago-aporte-listado` → **49** (hueco libre preexistente; se mantiene antes de sus consumidores 89 y 164)
  - `37-vista-base-estudiante-aporte-saldo-resumen` → **164**
  - Cabeceras de 164/165 y comentario de `DashboardRepository.js` actualizados. Verificación programática posterior: **0 violaciones de orden** en los 163 archivos. Los números 22, 35 y 37 quedan como huecos (igual que ya lo era el 49). Falso positivo descartado durante la verificación: la 101 solo hace `DROP VIEW IF EXISTS vista_matricula_listado` de limpieza, no la consume.

### Verificaciones limpias

- Cero referencias vivas a tablas eliminadas/renombradas (`folios_estudiantes`, `pasantias_asignaciones`, `pasantias_evaluaciones`, `fichas_supervision`, `supervisiones_programadas`) en seeders y vistas; solo `DROP IF EXISTS` de limpieza y un comentario documental.
- Vistas 156–163 y 135: correctas a nivel de tabla y de columna contra los schemas actuales (incluida la cadena `configuracion_evaluacion` → umbral `ACOMPANAMIENTO_PEDAGOGICO` del seeder 54).
- Seeders 01→67: todos los INSERT casan con los schemas; el 66 (RBAC TUT) usa acciones y roles existentes.
- Nota menor documental: los COMMENT de `permisos.dominio/modulo` en `04-sistema-seguridad.sql` no mencionaban TUT ni CAP (VARCHAR sin CHECK — no rompía, solo comentario desactualizado). **Corregido 2026-07-28** (agregados CAPACITACION/TUTORIAS y CAP/TUT).

### Huecos esperables (dominios nuevos sin módulo aún)

1. Sin seeds RBAC para pasantías, libros, títulos, supervisión docente (serían seeders 68+ con el patrón por-módulo 57–66).
2. `pasantias_empresas` sin seeder de catálogo (arranca vacío; ya listado en catálogos pendientes de parametrizar).
3. Cero vistas para los dominios nuevos (se crearán con sus módulos de lectura).

---

## 4. Auditoría B — documentación real restante vs schemas legacy (2026-07-28)

Contraste de los formularios/planillas reales aún no revisados contra los schemas 13/15/16/17/18/19.

### Hallazgo duro: RUDE/RUDEAL se pierde en transitabilidad — RESUELTO 2026-07-28

El formulario oficial ANEXO 2 de **transitabilidad** pide el código RUDE/RUDEAL igual que el de traspaso. Solo `traspasos.codigo_rude` existía; el comentario de `18-transitabilidades.sql` afirmaba que el RUDE vive en `estudiantes` (**falso** — la columna no existe) y el de `19-traspasos.sql` lo declaraba exclusivo de traspaso (**falso**). **Fix aplicado (opción mínima, espejo de traspasos):** columna `transitabilidades.codigo_rude VARCHAR(50) NULL` (sin índice, igual que en traspasos), comentarios falsos corregidos en 18 y 19, y campo `codigoRude` agregado en toda la cadena backend existente: modelo Sequelize `transitabilidad.js` (cuya cabecera además referenciaba el número viejo "15"), entidad `Transitability.js` y `TransitabilityMapper.js` (toEntity/toModel/toModelForUpdate — enumeran campos explícitamente, sin esto la columna se perdía en INSERT/UPDATE). Se descartó generalizar a `estudiantes` para no tocar la tabla núcleo (eso queda dentro de la decisión SIE, §6.4).

### Nivelaciones (`16-nivelaciones.sql`) — 3 ajustes con evidencia — RESUELTOS 2026-07-28

Los libros reales de nivelación (3 carreras, gestión 2025) muestran:
1. **`NIVELA ART. 18` es un examen** de nivelación; el schema clasificaba `ARTICULO_18` como decisión administrativa sin fila en `nivelaciones`. **Aplicado:** reclasificado como intento académico (admite fila en `nivelaciones`; `nota_resultante`/`nota_forzada` quedan solo para ABANDONO/RETIRADO). Sin cambio estructural en SQL (solo comentarios/convención); en código, `SubjectEnrollmentHistory.isAcademicAttempt()` ahora incluye ARTICULO_18 e `isAdministrativeGradeState()` lo excluye.
2. **Estados de no-cursado sin ancla**: `VENCIDA`, `CHOQUE_HORARIO`, `PRE_REQUISITO`, `NO_LLEVA_POR_VOLUNTAD` describen materias que el estudiante NO cursa y no tenían dónde anclarse. **Aplicado:** ancla alternativa `inscripcion_id` (FK `inscripciones`) + `asignatura_plan_id` (FK `asignaturas_plan`) en `historial_matricula`, con `matricula_materia_id` NULL en esos casos; convención documentada en la cabecera del schema (exclusión mutua validada en aplicación, sin CHECK, fiel al diseño). Índices `idx_inscripcion_id`, `idx_asignatura_plan_id` e `idx_inscripcion_asignatura`. Modelo, entidad y `SubjectEnrollmentHistoryMapper` sincronizados (`inscripcionId`/`asignaturaPlanId` ↔ `enrollmentId`/`planSubjectId`).
3. Faltaba la categoría **`REINCORPORACION`** (aparece junto a homologación en los libros reales). **Aplicado:** agregada al ENUM `tipo_estado` (schema), a `TIPOS_ESTADO_HISTORIAL_MATRICULA` (constants) y helper `isReincorporation()` en la entidad.

De paso se corrigió la cabecera del 16, que referenciaba archivos con numeración vieja (12-inscripciones/13-evaluaciones → 13/15).

### Cubiertos sin brechas de columna

- **`15-evaluaciones.sql`**: replica exactamente el registro pedagógico real (bloques práctico 70 / teórico 30, actividades de 5 pts y exámenes de 10, estados APROBADO/NO SE PRESENTÓ, estadísticas por sexo derivables). Convención a documentar: celda vacía (sin calificar) ≠ 0 (no se presentó).
- **`17-asistencias-licencias.sql`**: la planilla real P/R/F/L se reproduce con `sesiones_clase` + `asistencias` (RETRASO=TARDANZA, FALTA=AUSENTE) + cruce con licencias aprobadas. Supuesto declarado: licencia cubre rango de fechas de toda la inscripción, no una sola materia.
- **`13-inscripciones.sql`**: el formulario de inscripción 2026 mapea completo a `estudiantes` + `estudiantes_origenes` + documentación (seed 09, ids 1–5). El **año mixto por materia está soportado** (matrícula por `oferta_curso_id` sin amarre de la inscripción a un paralelo) y la práctica real lo exige: estudiantes cursando materias de dos años a la vez, confirmado en los libros de nivelación. Matiz: el "año de referencia" del formulario no se persiste; definir regla de derivación si Reportes lo pide.
- **`18/19-transitabilidad y traspasos`**: mapeo campo a campo correcto salvo el RUDE (arriba). Los 5 documentos de traspaso existen en el seed de documentación.
- **`25-libros-registro.sql`**: el centralizador Excel 2026 de Contaduría no contradice el modelo libro/folio (es la planilla operativa, no el libro encuadernado) y reconfirma el grano de la vista 135 y la matrícula por materia.

### Interoperabilidad estatal (Académico ITT / SIE)

Las fotos del sistema del Ministerio muestran campos que `estudiantes` no tiene: **complemento de C.I.**, **tipo de C.I.** (nacional/extranjero), **libreta militar**, comunidad de nacimiento. Confirman además el código institucional **81981609** usado como `codigo_registro` en libros. Urge solo si se planifica exportación al SIE.

### Ranking de urgencia (schemas legacy)

1. ~~`18-transitabilidades` — pérdida de dato real (RUDE)~~ — **resuelto 2026-07-28**.
2. ~~`16-nivelaciones` — 3 ajustes conceptuales con evidencia~~ — **resuelto 2026-07-28**.
3. `10-estudiantes-parte1` — campos SIE (solo si habrá interoperabilidad).
4. `13-inscripciones` — solo regla blanda de derivación de año.
5. `15-evaluaciones` / `17-asistencias` — sin cambios; solo convenciones de aplicación.

---

## 5. Auditoría C — matriz de permisos del menú vs cobertura real (2026-07-28)

Mapa de las 4 capas (schema → seed RBAC → backend → frontend) por dominio de la matriz. "Seed off" = el seed existe pero el bloque está deshabilitado (`activo=0`) hasta que la pantalla exista.

### Estado por dominio

| Dominio | COMPLETO | PARCIAL | SOLO SCHEMA / SIN CONSTRUIR |
|---|---|---|---|
| MAT (57) | Admisiones, Matrículas, Becas, Aportes | Documentos de estudiante (falta listado) | Pasantías (schema 24, seed off, sin backend/frontend) |
| ACA (58) | Calificaciones, Centralizador, Historial | Asistencia (faltan Consolidado y Clases no dictadas + endpoints) | Nivelaciones, Traspasos, Transitabilidad (solo modelo+repositorio), Avance académico (nada) |
| DOC (59) | Docentes ABM/ficha/portal | — | Licencias docentes (**sin tabla siquiera**), Supervisión (schema 27, frontend borrado), Pasantías docentes |
| FIN (60) | Pagos, Configuración FIN | Reportes (Becas y CxC reales; carrera/estudiante/gestión placeholders) | Adicionales (sin tabla) |
| INST (61) | Gestión actual, Oferta, Horarios, Gestiones pasadas | — | — |
| REP (63) | — | — | Los 8 reportes (7 permisos off, sin backend ni frontend) |
| CAP (65) | Todo en código (20 use cases, 9 páginas) | — | pendiente confirmar siembra en BD |
| TUT (66) | Titulación + Acompañamiento en código | — | pendiente ejecutar schemas 22/23 + seeds 66/67 + vistas 156–163 en BD |
| CFG (62) | Académico, Recursos, Complementarios, Documentación, Actividades | — | Convenios (sin tabla, grupo oculto) |
| SEG + transversales | Usuarios, Roles, Perfil, Dashboard, portales | — | — |

### Schemas huérfanos de menú

- **26-títulos-certificados: cero menciones** en matriz y seeds — huérfano total (coherente con su falta de base documental).
- **25-libros-registro**: lo más cercano son `academico.historial.folio`/`validar` (desactivados); no hay códigos para libros/folios como ABM.
- **24-pasantias**: solo códigos legacy deshabilitados repartidos en MAT/DOC/REP, anteriores al schema nuevo — exige decidir el dueño del ítem de menú antes de construir.
- **27-supervision-docente**: códigos `docentes.supervision.*` existen pero deshabilitados y anteriores al schema; el frontend `modules/supervision` fue borrado.
- **`modalidades_grado`**: sin permiso ni pantalla ABM (solo catálogo de lectura vía `GET /proyectos-grado/modalidades`).
- Catálogos sin pantalla: `instituciones` (18), `personal`/`rectores`/`directores`/`secretarias` (20).

### Lista priorizada de cierre del proyecto

1. **Solo ejecutar/resembrar BD** (código listo; requiere aprobación): TUT (schemas 22+23, seeds 66/67, vistas 156–163) · CAP (confirmar siembra 21/65/154-155) · re-siembras 53/54/60/62.
2. **Falta backend+frontend con base lista** (schema ✔, modelos/repos ya en el container): Nivelaciones, Traspasos, Transitabilidad — rehabilitar bloque off del seed 58 al construir.
3. **Falta backend+frontend + rediseñar seed contra el schema nuevo**: Pasantías (24), Supervisión docente (27), Libros de registro (25).
4. **Falta solo frontend o subpantallas**: Asistencia (Consolidado, Clases no dictadas), FIN reportes carrera/estudiante/gestión, aprobar becas, listado de documentos, validar materias, dashboards raíz de dominio.
5. **Falta todo (incluido schema o fuente de datos)**: Licencias docentes (sin tabla — cambio de schema pendiente de aprobación), Títulos/certificados (validar diseño con documentación real primero), Pagos adicionales FIN (sin tabla), Convenios CFG (evaluar si `pasantias_empresas`/`instituciones` lo cubren), módulo REP completo, Avance académico, "Mi beca" self-service.

**Riesgo transversal**: los bloques `activo=0` de los seeds 57/58/59/60/63 son la compuerta real del menú — al construir cada pantalla hay que rehabilitar exactamente el código correspondiente o el ítem no aparecerá ni para ADMIN_SISTEMA.

---

## 6. Decisiones pendientes de aprobación

| # | Cambio | Archivo | Estado |
|---|---|---|---|
| 1 | Renumerar la cadena de vistas pago-aporte (fix real: 22→39, 35→49, 37→164, 39→165) | `03-views/` | **aplicado en repo 2026-07-28** |
| 2 | Columna RUDE/RUDEAL para transitabilidad (espejo de traspasos) + comentarios falsos de 18/19 | `01-schemas/18-...sql`, `19-...sql` | **aplicado en repo 2026-07-28** |
| 3 | `ARTICULO_18` como examen con fila en `nivelaciones` + ancla de estados de no-cursado (`inscripcion_id`+`asignatura_plan_id`) + `REINCORPORACION` | `01-schemas/16-...sql` | **aplicado en repo 2026-07-28** |
| 4 | Campos SIE en `estudiantes` (complemento C.I., tipo C.I., libreta militar) | `01-schemas/10-...sql` | opcional, solo con interoperabilidad |
| 5 | Ejecución de toda la cadena en BD (schemas 22–27 + vistas 156–163 + seeders 54/66/67 + resembrado RBAC) | BD | esperando aprobación |
| 6 | Tabla `licencias_docentes` (no existe; la exige el ítem DOC-Licencias y el consolidado de Asistencia) | nuevo schema | propuesto |
| 7 | Definir dueño de menú para pasantías (24), libros (25) y supervisión (27) antes de sus seeds RBAC | matriz + seeds | **decidido 2026-07-29**: pasantías→TUT "Titulación", libros→ACA, supervisión→DOC; se amplían los seeds por-módulo (66/58/59), sin seeders 68+. Ver `docs/plan/titulacion-y-dominios-pendientes.md` |

Ningún DDL se ha ejecutado contra la base de datos; todo el trabajo vive en los archivos del repo.

**Nota de aplicación en BD (para cuando se apruebe el punto 5):** los cambios 2 y 3 tocan schemas cuyos archivos son DROP+CREATE (`16`, `18`); si las tablas `historial_matricula`/`transitabilidades` ya existen con datos en la BD de desarrollo, aplicarlos vía `ALTER TABLE` en `05-migrations` (agregar `codigo_rude`, `inscripcion_id`, `asignatura_plan_id`, `REINCORPORACION` al ENUM), no re-ejecutando el schema. Las vistas renumeradas (punto 1) no cambian de nombre lógico ni de SQL: en BD ya desplegada no requieren acción; en despliegue limpio ahora el orden numérico funciona.
