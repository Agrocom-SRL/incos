# Titulación — avance y modalidad de graduación (extensión del módulo TIT) — plan de desarrollo

> NOTA (2026-07-31): este plan se escribió antes del rename `tutorias` →
> `titulacion`; las rutas/códigos ya están actualizados a la nomenclatura
> nueva.
>
> Plan del `planificador` (2026-07-31), persistido para ejecutar por iteraciones.
> **Entrega por partes:** Iteración 1 = datos + RBAC + backend + documentación
> (bloques A–L). Iteración 2 = frontend + verificación completa (bloques M–Q).
> El módulo TIT (backend `titulacion/`, schema 22/23, seed RBAC 65, vistas 156-163)
> ya está completo en código y BD — este documento planifica 3 **extensiones**,
> no un módulo nuevo. Nada se ejecuta en BD sin aprobación explícita, salvo lo
> pre-autorizado para este frente (ver §0.6).
>
> **Fuente de verdad de los 3 requisitos:** dados verbatim por el usuario en
> esta sesión, no están escritos en ningún otro documento. El documento
> `docs/plan/tutorias-plan-desarrollo.md` (histórico, previo al módulo actual)
> usa nombres de tabla VIEJOS (`tutoria_integrantes`, `tutoria_avances`, etc.)
> que NO existen en el schema/código real — no usarlo como referencia de
> nombres, solo como historia. El código/schema actual (22-modalidades-grado.sql,
> 23-tutorias-acompanamiento.sql, `application/use-cases/titulacion/`) es la
> única fuente de verdad.

## 0. Hallazgos de la investigación (leer antes de implementar)

### 0.1 Cómo se determina el "año" académico de un estudiante

No existe una columna `anio_actual` en `estudiantes`. El año (1º/2º/3º) vive en
`periodos` (`05-estructura-academica-parte1.sql`, "1º Año, 2º Año, 3º Año" por
`plan_estudio_id`, columna `numero`), enlazado a la matrícula vigente vía
`asignaturas_plan.periodo_id` → `matriculas_materia.asignatura_plan_id`. La
vista **100** (`vista_base_matricula_inscripcion_paralelo`) ya resuelve el
"periodo representativo" de una inscripción (regla de desempate: mayor
`periodo_numero`, documentada en el propio archivo) y la vista **101**
(`vista_base_matricula_resumen_inscripcion`) expone `periodo_numero` +
`carrera_id` + datos del estudiante por `inscripcion_id`/`estudiante_id`.
`EnrollmentRepository.obtenerListadoMatriculas()`
(`backend/src/infrastructure/repositories/EnrollmentRepository.js`) ya consume
la 101 con filtro `estudiante_id`/`gestion_id` — **reutilizar este repositorio
cross-módulo** (token `REPOSITORIOS_TOKENS.enrollmentRepository`) para
resolver "es de 3er año" en vez de escribir el JOIN de nuevo. "Tercer año" =
`periodo_numero = 3` de la inscripción vigente del estudiante.

### 0.2 Quién crea hoy el proyecto de grado

**Ya es Dirección Académica**, no el estudiante: `POST /proyectos-grado` está
gated por `verificarPermiso('titulacion.proyecto', 'CREAR')`
(`backend/src/presentation/routes/proyectos-grado.routes.js`, ruta T7) y el
seed `65-seed-permisos-tit.sql` **solo** concede la acción `CREAR` de
`titulacion.proyecto` a `DIR_ACADEMICO`, `RECTOR` y `SEC_ACADEMICA`
(`ADMIN_SISTEMA` hereda). `ESTUDIANTE` solo tiene `DETALLE` (ve su proyecto,
no lo crea). `CreateProyectoGradoUseCase.js` NO valida hoy el año del
estudiante ni deriva `carreraId`/`gestionId` de su inscripción — ese es
exactamente el hueco que cierra el Requisito 1.

### 0.3 Documento fuente FMDG-1 (verificado, campo a campo)

`/Users/miguel/Documents/incos/pasantia/FORMULARIO 01 DE MODALIDAD DE GRADUACION OK.docx`
— campos: NOMBRES, APELLIDOS, CÉDULA DE IDENTIDAD (Nº + EXPEDIDO), Nº DE
CELULAR, INSTITUTO (fijo "INSTITUTO TÉCNICO INCOS SANTA CRUZ"), CARRERA,
MODALIDAD DE GRADUACIÓN, NOMBRE/TEMA (título del proyecto), OBJETIVOS
(general + específicos), declaración "Declaro que tengo definido el tema...",
firma del declarante (el ESTUDIANTE, con nombre + C.I.) y lugar/fecha. Todos
los campos existen ya en `estudiantes` (`nombres`, `apellidoPaterno`,
`apellidoMaterno`, `ci`, `expedicion`, `celular`) + `proyectos_grado`
(`titulo`, `objetivos`) + `carreras.nombre` + `modalidades_grado.nombre` — **no
hay hueco de datos**. El formulario es una impresión de lo que Dirección
Académica ya registra al crear el proyecto; el estudiante firma en papel.

### 0.4 Generadores PDF/Excel reutilizables como PATRÓN (no se tocan sus archivos)

| Generador existente | Patrón que aporta |
|---|---|
| `infrastructure/external/pdf/titulacion/DesignacionTutorPdfGenerator.js` | PDF con datos de UN proyecto (label/value) desde `Plantilla.pdf` + `IncosPDFLibBase` — plantilla directa para el FMDG-1 (Requisito 1). |
| `infrastructure/external/pdf/academico/PanelAcompanamientoPdfGenerator.js` | PDF con tabla agregada POR CARRERA (`_addTable`) desde varias vistas — plantilla directa para el reporte por carrera (Requisito 2). |
| `application/use-cases/titulacion/ExportBitacoraMensualTutorPdfUseCase.js` + vista **163** | PDF de reporte "export" que NO persiste nada (no crea fila en `dictamenes_proyecto`) — patrón a seguir en los 3 requisitos: ninguno de los 3 PDF/Excel nuevos se guarda como dictamen. |
| `application/use-cases/titulacion/helpers/dictamenPdfHelpers.js` | Solo aplica a los 2 dictámenes YA existentes (`VIABILIDAD_TECNICA`, `DESIGNACION_OFICIAL`); **no se usa** para el FMDG-1 (ver §0.5.1: decisión de NO tratarlo como dictamen). |
| `infrastructure/external/excel/libro-registro/` (`LibroRegistroExcelBuilder.js` + `LibroRegistroSheetBuilder.js` + `sheet/*`) y `docs/plan/libros-registro-plan-desarrollo.md` | Patrón de **paginación en folios de 10 + hoja de firmas final que NO incrementa folio + cuadro de %** — se REPLICA la estructura para el Requisito 3, en archivos y carpeta propios; **no se importa ni se edita nada de `libro-registro/`** (dominio distinto: calificaciones finales por materia vs. avance de tutoría por bimestre). Ese módulo lo está implementando otro agente en paralelo esta misma sesión (frontend) — no tocar. |
| `infrastructure/external/excel/shared/` (`ExcelSheetComposer.js`, `ExcelTheme.js`) | Toolkit compartido (SÍ se reutiliza, es shared/, no es de un dominio) para el nuevo builder del Requisito 3. |

### 0.5 Decisión Requisito 3 — NO requiere tabla nueva

Razonamiento (sin DDL, no gated):

1. La "planilla de 10 en 10" es un **artefacto de impresión/monitoreo**, no un
   documento legal con folio permanente citado externamente (a diferencia del
   Libro de registro, que sí necesita `folios_libro` persistido porque el
   folio se cita en actas y tiene flujo FIRMADO/ANULADO inmutable). El
   enunciado del usuario no pide firmar-en-sistema ni immutabilidad — pide
   imprimir para firma FÍSICA y archivo.
2. Todos los datos ya existen: roster de estudiantes de 3er año con proyecto
   vigente (integrantes_proyecto + proyectos_grado + matrícula/periodo_numero
   como en §0.1), tutorías del bimestre (`bitacora_proyecto.fecha` +
   `porcentaje_avance` + `observaciones`, resolviendo el bimestre por rango de
   fecha contra `periodos_academicos` `division='BIMESTRE'`, mismo patrón que
   la vista **169** `vista_asistencia_consolidado_bimestre_fila`), y el cuadro
   final de %: `proyectos_grado.estado` (`APROBADO`/`REPROBADO`/`CANCELADO`) +
   `integrantes_proyecto.estado` (`RETIRADO` = abandono de ESE estudiante en
   modalidad grupal PSP) alcanzan para clasificar cada estudiante en
   APROBADO/REPROBADO/ABANDONO/EN PROCESO sin ningún campo nuevo.
3. Los dos xlsx fuente (`PLANILLA DE SEGUIMIENTO DE TUTORIA 2026.xlsx` =
   seguimiento por docente/mes, ya cubierto por la vista 163 + PDF existente;
   `PLANILLA PARA REPORTE DE TUTORIA 2026.xlsx` = bitácora de UN proyecto, ya
   cubierto por `GET /:id/bitacora`) tampoco muestran folios de 10 ni cuadro
   de %: esa estructura es EXCLUSIVA del Libro (patrón a imitar, confirmado
   por el propio enunciado del usuario).

**Conclusión: NO se necesita `⛔ aprobación de schema` para el Requisito 3.**
Si en la iteración de implementación aparece un requisito real de
persistencia (p. ej. firmar-en-sistema o congelar el folio entre reimpresiones),
eso sí sería un cambio de diseño que requeriría volver a esta decisión y, en
ese caso, sí pausar para aprobación de DDL — pero no está pedido hoy.

### 0.6 Hallazgo RBAC — los 3 requisitos reutilizan el permiso existente

Los 3 endpoints de solo-lectura/exportación nuevos son variaciones de
**listar/exportar sobre el mismo recurso** (`proyectos_grado` y sus satélites)
que ya gobierna el permiso `titulacion.proyecto` (acciones LISTAR,
CREAR, EXPORTAR ya sembradas para DIR_ACADEMICO/RECTOR/SEC_ACADEMICA en el
seed 65). **No se necesita ningún permiso ni acción nueva.** El único cambio
sugerido a `65-seed-permisos-tit.sql` es **cosmético** (texto, no lógica):
ampliar el `nombre`/descripción de la fila del permiso
`titulacion.proyecto` (línea ~37) para que mencione también
"formulario de elección de modalidad, reporte de avance por carrera y
planilla de seguimiento por bimestre", de modo que el seed se siga
autodocumentando con precisión. Esto se describe en el Bloque C/F/J de cada
requisito — **no se edita el seeder en este documento**, y si se edita en la
implementación, sigue siendo solo texto (no altera `permiso_acciones` ni
`roles_permisos`, por lo que una resiembra es de bajo riesgo, pero se mantiene
igual bajo la misma disciplina de aprobación que el resto de RBAC).

### 0.7 Correcciones de referencias obsoletas detectadas

1. El comentario de `22-modalidades-grado.sql` dice "El seeder 67 (PSP/PG/PE/TD)":
   el seeder real hoy es **`57-seed-titulacion-modalidades.sql`** (la
   numeración de `02-seeders/` se corrió cuando entró ese archivo; documentado
   también en `supervision-docente-plan-desarrollo.md`). Corregir ese
   comentario cuando se toque el archivo (no bloquea nada).
2. Última vista en disco verificada el 2026-07-31: **`177-vista-base-libro-paralelo-estudiante.sql`**
   (Fase 4/Libros, trabajo en paralelo esta sesión). Los números de vista de
   este plan (**178-181**) parten de ahí — **volver a correr
   `ls backend/database/03-views/` antes de crear los archivos**, puede haber
   subido si Libros agregó más entretanto.
3. `docs/plan/titulacion-y-dominios-pendientes.md` (roadmap de fases 0-5) no
   lista estos 3 requisitos como una "fase" propia: son extensiones sobre
   Fase 2 (titulación, ya integrada). Bloque L de este documento apunta a
   añadir ahí una nota corta, no a reescribirlo.

## Módulos de referencia por capa

| Capa | Referencia (copiar patrón, no inventar) |
|---|---|
| Router/permisos backend | `backend/src/presentation/routes/proyectos-grado.routes.js` (estáticas antes de `/:id`; extender este mismo router, no crear otro) |
| Guard de negocio | `application/use-cases/titulacion/helpers/proyectoTutoriaGuards.js` (patrón `assertEstudianteSinProyectoVigente`) |
| Repositorio cross-módulo (matrícula) | `infrastructure/repositories/EnrollmentRepository.js` (token `REPOSITORIOS_TOKENS.enrollmentRepository`, método `obtenerListadoMatriculas`) |
| Repositorio de vista (arquetipo B) | `infrastructure/repositories/views/ProyectoGradoListadoViewRepository.js` + `domain/interfaces/repositories/IProyectoGradoListadoViewRepository.js` |
| Vista final delgada agregando por carrera | `backend/database/03-views/157-vista-acompanamiento-riesgo-carrera.sql` (agrega 1 sola base, `GROUP BY carrera`) |
| Vista con bimestre resuelto por rango de fecha | `backend/database/03-views/169-vista-asistencia-consolidado-bimestre-fila.sql` (JOIN `periodos_academicos` `division='BIMESTRE'`) |
| PDF label/value de un proyecto | `infrastructure/external/pdf/titulacion/DesignacionTutorPdfGenerator.js` |
| PDF de tabla agregada por carrera | `infrastructure/external/pdf/academico/PanelAcompanamientoPdfGenerator.js` |
| Excel paginado en folios (SOLO patrón, no tocar) | `infrastructure/external/excel/libro-registro/*` + `docs/plan/libros-registro-plan-desarrollo.md` |
| Toolkit Excel compartido | `infrastructure/external/excel/shared/` (`ExcelSheetComposer.js`, `ExcelTheme.js`) |
| Container/DI del recurso | `infrastructure/container/modules/titulacion/proyectos-grado.container.js` + `infrastructure/container/tokens/titulacion.tokens.js` |
| Frontend módulo existente (patrón a extender) | `frontend/src/application/modules/titulacion/proyectos-grado/` + `frontend/src/presentation/modules/titulacion/proyectos-grado/` (hooks `api/`, `state/`, `context/`, `providers/`, componentes `organisms/`, `config/*TableColumns.jsx`) |

---

## ITERACIÓN 1 — datos + RBAC + backend + documentación

### Requisito 1 — Formulario de elección de modalidad de graduación (FMDG-1)

#### Bloque A — Datos: restricción "solo 3er año" y derivación de carrera/gestión

- **A1.** Nuevo guard en `application/use-cases/titulacion/helpers/proyectoTutoriaGuards.js`:
  `assertEstudianteEsTercerAnio({ enrollmentRepository, estudianteId, gestionId })`
  — llama `enrollmentRepository.obtenerListadoMatriculas({}, 1, 1, { estudiante_id: estudianteId, gestion_id: gestionId })`,
  lee `rows[0]` y lanza `ValidationError` si no existe o `periodo_numero !== 3`;
  retorna la fila (trae `carrera_id`, `gestion_id`, `periodo_numero`) para
  reutilizarla como fuente de `carreraId`/`gestionId` derivados.
- **A2.** `CreateProyectoGradoUseCase.js`: en `_validateEstudiantes`, llamar
  `assertEstudianteEsTercerAnio` para **cada** `estudianteId` del array (titular
  Y integrantes PSP grupales — la restricción es de "estudiante que se
  gradúa", no solo del titular). Si `body.carreraId`/`body.gestionId` no
  llegan, derivarlos de la fila devuelta para el titular (no se sobreescribe
  si el llamador ya los mandó explícitos, para no romper el flujo actual).
  Requiere `gestionId` resuelto ANTES de validar 3er año: si no llega en el
  body, resolver la gestión vigente vía
  `REPOSITORIOS_TOKENS.calificacionContextoRepository.obtenerContextoVigente()`
  (mismo patrón que `GetPanelAcompanamientoUseCase.resolverGestion`).
- **A3.** Nueva vista **178** `178-vista-base-tutoria-estudiante-tercer-anio.sql`
  — grano: 1 fila por estudiante de 3er año en una gestión (reutiliza la base
  101 `vista_base_matricula_resumen_inscripcion` filtrando `periodo_numero = 3`,
  LEFT JOIN `integrantes_proyecto` (activo) + `proyectos_grado` +
  `modalidades_grado` + `docentes` para exponer si YA tiene proyecto vigente
  (`proyecto_grado_id` NULL = elegible). Columnas: `estudiante_id`, `ci`,
  `expedicion`, `celular`, `nombres`, `apellido_paterno`, `apellido_materno`,
  `carrera_id`, `carrera_nombre`, `gestion_id`, `periodo_numero`,
  `proyecto_grado_id`, `proyecto_estado`, `modalidad_codigo`, `tutor_nombre`.
  Consumidores: Requisito 1 (filtrado `proyecto_grado_id IS NULL`, endpoint
  "elegibles") y Requisito 3 (filtrado `proyecto_grado_id IS NOT NULL`, roster
  de la planilla). ⛔ **Ejecutar en BD** — pre-autorizado para este frente
  (§0.6 del acuerdo de sesión); no requiere pausa adicional, solo aviso al
  correr el script.

#### Bloque B — RBAC

Ver §0.6: **no se agregan permisos ni acciones**. `GET /proyectos-grado/estudiantes-elegibles`
se gatea con la acción **LISTAR** de `titulacion.proyecto` (mismo
criterio que `GET /modalidades`, ruta T2, que también es un catálogo de apoyo
a la creación). `GET /:id/formulario-modalidad/pdf` se gatea con **EXPORTAR**
de `titulacion.proyecto` (mismo criterio que
`GET /reportes/bitacora-mensual` y `GET /:id/dictamenes/:dictamenId/archivo`).
Actualizar solo el texto descriptivo del permiso en `65-seed-permisos-tit.sql`
(línea ~37) si se re-siembra por otro motivo — no amerita una resiembra por sí
solo.

#### Bloque C — Backend

Contrato de respuesta:

| Endpoint | Acción (`titulacion.proyecto`) | `dataFieldName` | Forma |
|---|---|---|---|
| `GET /proyectos-grado/estudiantes-elegibles?search=&carreraId=&gestionId=` | LISTAR | `estudiantesElegibles` | lista |
| `POST /proyectos-grado` (sin cambio de contrato, solo validación server-side) | CREAR | `proyectoGrado` | objeto |
| `GET /proyectos-grado/:id/formulario-modalidad/pdf` | EXPORTAR | — | binario (`application/pdf`) |

Archivos:

1. **Use case** `application/use-cases/titulacion/ListEstudiantesElegiblesModalidadGradoUseCase.js`
   — lee la vista 178 filtrando `proyecto_grado_id IS NULL`, por `carreraId`
   opcional (si no llega, usa la gestión vigente vía
   `calificacionContextoRepository`) y `search` (nombre/CI, `LIKE`).
2. **Use case** `application/use-cases/titulacion/ExportFormularioModalidadGradoPdfUseCase.js`
   — reutiliza `GetProyectoGradoByIdUseCase` (o la fila cruda de la vista 160)
   + `studentRepository.findById` (del titular) para armar el contexto
   (nombres/apellidos/CI/expedición/celular/carrera/modalidad/título/objetivos)
   y llama al generador. **No escribe en `dictamenes_proyecto`** (patrón
   "export", §0.4).
3. **Interfaz + generador PDF**: `domain/interfaces/services/IFormularioModalidadGradoPdfGenerator.js`
   + `infrastructure/external/pdf/titulacion/FormularioModalidadGradoPdfGenerator.js`
   (extiende `IncosPDFLibBase`, `_loadTemplate('Plantilla.pdf')`,
   `_addDocumentTitle('FORMULARIO DE MODALIDAD DE GRADUACIÓN (FMDG-1)')`,
   `_addBoxedFieldGrid` para NOMBRES/APELLIDOS/CI/CELULAR/INSTITUTO/CARRERA/
   MODALIDAD, `_addParagraph` para NOMBRE/TEMA + OBJETIVOS,
   `_addSignatureBlock` con líneas "Firma de la o el declarante" + nombre del
   estudiante + C.I., y una segunda `_addSignatureBlock` "DIRECCIÓN ACADÉMICA").
   Token `formularioModalidadGradoPdfGenerator` en `servicios.tokens.js` +
   registro en `services.container.js` (patrón `designacionTutorPdfGenerator`).
4. **Guard**: A1/A2 de arriba (`proyectoTutoriaGuards.js`,
   `CreateProyectoGradoUseCase.js`).
5. **Repositorio de vista**: extender `ProyectoGradoListadoViewRepository.js`
   con `findEstudiantesElegibles({ carreraId, gestionId, search })` sobre la
   vista 178 (o, si se prefiere aislar por SRP, nuevo repo
   `infrastructure/repositories/views/TutoriaAvanceViewRepository.js` +
   interfaz `ITutoriaAvanceViewRepository.js` — este mismo repo se reutiliza en
   los Requisitos 2 y 3, ver Bloques E y I; se recomienda esta segunda opción
   para no sobrecargar el repo existente con 3 responsabilidades nuevas).
6. **Mapper**: `application/mappers/titulacion/TutoriaAvanceMapper.js` (nuevo,
   compartido por los 3 requisitos) — `estudianteElegibleRowToPresentation`
   (nombre en orden institucional `buildFullName`).
7. **Controllers**: `presentation/controllers/titulacion/ListEstudiantesElegiblesModalidadGradoController.js`,
   `ExportFormularioModalidadGradoPdfController.js` (descarga binaria
   `formulario-modalidad-{apellidos}-{id}.pdf`).
8. **Validators**: `listEstudiantesElegiblesValidator` (query opcional
   `search`, `carreraId`, `gestionId`) en `presentation/validators/titulacion/proyectos-grado.validator.js`;
   `GET /:id/formulario-modalidad/pdf` reutiliza `idValidator`.
9. **Router**: extender `proyectos-grado.routes.js` — `GET /estudiantes-elegibles`
   como ruta ESTÁTICA (junto a `/modalidades`, ANTES de `/:id`);
   `GET /:id/formulario-modalidad/pdf` junto a las demás rutas `/:id/...`.
10. **DI**: registrar en `container/modules/titulacion/proyectos-grado.container.js`
    (mismo archivo, no uno nuevo); ampliar el factory de
    `createProyectoGradoUseCase` con
    `enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository)`
    y `calificacionContextoRepository: c.resolve(REPOSITORIOS_TOKENS.calificacionContextoRepository)`.
11. Nuevos tokens en `container/tokens/titulacion.tokens.js`:
    `listEstudiantesElegiblesModalidadGradoUseCase`,
    `exportFormularioModalidadGradoPdfUseCase`, + controllers correspondientes,
    + (si se opta por repo aislado) `tutoriaAvanceViewRepository`.

---

### Requisito 2 — Reporte de avance de tutorías por carrera

#### Bloque D — Datos

- **D1.** Ajuste **in-place** (mismo archivo, sin nuevo número) a
  `backend/database/03-views/160-vista-tutoria-proyectos-listado.sql`: añadir
  columna `ultima_observacion` al derivado `bit` (subconsulta ya existente
  sobre `bitacora_proyecto`), con la MISMA técnica que ya usa
  `porcentaje_avance` (`SUBSTRING_INDEX(GROUP_CONCAT(b.observaciones ORDER BY
  b.fecha DESC, b.id DESC), ',', 1)` — cuidado con comas dentro del texto:
  usar un separador improbable, p. ej. `GROUP_CONCAT(... SEPARATOR '␟')`
  o resolver con una subconsulta correlacionada `LIMIT 1` en su lugar, más
  simple y sin riesgo de separador). Consumidores actuales de 160 no se
  rompen (columna aditiva). ⛔ Recrear la vista en BD — pre-autorizado (§0.6).
- **D2.** Nueva vista **179** `179-vista-tutoria-avance-carrera.sql` — vista
  final delgada (patrón 157) que agrega la 160 (ya ajustada por D1)
  `GROUP BY gestion_id, carrera_id, carrera_codigo, carrera_nombre`:
  `total_proyectos`, `AVG(porcentaje_avance)` como `promedio_avance`,
  `SUM(CASE WHEN observaciones_pendientes > 0 THEN 1 ELSE 0 END)` como
  `proyectos_con_observaciones_pendientes`. ⛔ Ejecutar en BD — pre-autorizado.

#### Bloque E — RBAC

Reutiliza `titulacion.proyecto` LISTAR (datos) y EXPORTAR (PDF) —
sin cambios funcionales, igual que Bloque B (ver §0.6).

#### Bloque F — Backend

Contrato de respuesta:

| Endpoint | Acción | `dataFieldName` | Forma |
|---|---|---|---|
| `GET /proyectos-grado/reportes/avance-carrera?gestionId=&carreraId=` | LISTAR | `avanceTutoriaCarrera` | objeto `{ resumenPorCarrera: [...], detalle: [...] }` |
| `GET /proyectos-grado/reportes/avance-carrera/pdf?gestionId=&carreraId=` | EXPORTAR | — | binario (`application/pdf`) |

Archivos:

1. **Use case** `application/use-cases/titulacion/GetAvanceTutoriaCarreraUseCase.js`
   — resuelve gestión vigente si no llega `gestionId` (mismo patrón
   `resolverGestion` de `GetPanelAcompanamientoUseCase`); lee
   `findAvancePorCarrera` (vista 179, resumen) y `findListado` (vista 160, ya
   con `ultimaObservacion`, filtrado por `carreraId` si llega) para el
   `detalle` por proyecto — **reutiliza `proyectoGradoListadoViewRepository.findListado`
   existente**, no duplica esa lectura.
2. **Use case** `application/use-cases/titulacion/ExportAvanceTutoriaCarreraPdfUseCase.js`
   — reutiliza `GetAvanceTutoriaCarreraUseCase.execute` (no relee la BD dos
   veces, patrón `ExportPanelAcompanamientoPdfUseCase`).
3. **Interfaz + generador**: `IAvanceTutoriaCarreraPdfGenerator.js` +
   `infrastructure/external/pdf/titulacion/AvanceTutoriaCarreraPdfGenerator.js`
   (extiende `IncosPDFLibBase`; título "REPORTE DE AVANCE DE TUTORÍAS POR
   CARRERA"; `_addTable` con el resumen por carrera —Carrera/Proyectos/%
   promedio/Con observaciones pendientes— igual que
   `_buildRiesgoPorCarrera` de `PanelAcompanamientoPdfGenerator`; segunda
   tabla de detalle por proyecto —Título/Carrera/Tutor/% avance/Última
   observación—, paginada por `_addTable` estándar).
4. **Repositorio de vista**: método `findAvancePorCarrera({ gestionId, carreraId })`
   sobre la vista 179, en el mismo repo aislado propuesto en Bloque C (o en
   `ProyectoGradoListadoViewRepository` si no se aísla).
5. **Mapper**: `TutoriaAvanceMapper.avanceCarreraRowsToPresentation`.
6. **Controllers**: `GetAvanceTutoriaCarreraController.js`,
   `ExportAvanceTutoriaCarreraPdfController.js`.
7. **Validators**: `avanceTutoriaCarreraValidator` (`gestionId`/`carreraId`
   opcionales, enteros positivos).
8. **Router**: `GET /reportes/avance-carrera` y `GET /reportes/avance-carrera/pdf`
   como rutas estáticas junto a `/reportes/bitacora-mensual`.
9. **DI**: nuevos tokens + registro en `proyectos-grado.container.js` (mismo
   patrón que `exportBitacoraMensualTutorPdfUseCase`).

---

### Requisito 3 — Planilla de avance de tutorías "10 en 10" (bimestral, 3er año)

#### Bloque G — Decisión de diseño (registrada, no gated)

Ver §0.5: **no requiere tabla nueva**. Este bloque documenta la decisión para
que quien implemente no la reabra sin querer; si se decide lo contrario en
implementación, **eso sí exige volver aquí y pedir aprobación de DDL antes de
escribir el `CREATE TABLE`**.

#### Bloque H — Datos

- **H1.** Nueva vista **180** `180-vista-base-tutoria-bitacora-bimestre-fila.sql`
  — grano: 1 fila por entrada de `bitacora_proyecto` con el bimestre resuelto:
  `bitacora_proyecto` JOIN `proyectos_grado` (gestión) JOIN
  `periodos_academicos` `ON b.fecha BETWEEN pa.fecha_inicio AND pa.fecha_fin
  AND pa.gestion_id = p.gestion_id AND pa.division = 'BIMESTRE'` (mismo patrón
  que la vista 169). Columnas: `proyecto_grado_id`, `bimestre` (`pa.numero_orden`),
  `fecha`, `porcentaje_avance`, `observaciones`. Consumidor: vista 181.
  ⛔ Ejecutar en BD — pre-autorizado.
- **H2.** Nueva vista **181** `181-vista-tutoria-planilla-avance-tercer-anio.sql`
  — vista final delgada, ROSTER-driven (no pierde estudiantes sin tutorías en
  el bimestre): base 178 (estudiantes 3er año, filtrado
  `proyecto_grado_id IS NOT NULL`) LEFT JOIN agregado por bimestre de la 180
  (`COUNT(*)` tutorías del bimestre, último `porcentaje_avance`, última
  `observaciones` — mismas técnicas de D1) + columna calculada
  `resultado_tutoria` vía `CASE` (mismo estilo que los `CASE` de la vista 101):
  `'ABANDONO'` si `integrante_estado = 'RETIRADO'` o `proyecto_estado =
  'CANCELADO'`; `'APROBADO'` si `proyecto_estado = 'APROBADO'`; `'REPROBADO'`
  si `proyecto_estado = 'REPROBADO'`; si no, `'EN_PROCESO'`. Filtro por
  `carrera_id`, `gestion_id`, `bimestre`. ⛔ Ejecutar en BD — pre-autorizado.

#### Bloque I — RBAC

Reutiliza `titulacion.proyecto` LISTAR (preview en pantalla) y
EXPORTAR (descarga xlsx) — sin cambios funcionales (ver §0.6). El
"docente sube las tutorías" del enunciado ya está cubierto por
`titulacion.bitacora` CREAR/EDITAR (sembrado para DOCENTE) — sin
cambios.

#### Bloque J — Backend

Contrato de respuesta:

| Endpoint | Acción | `dataFieldName` | Forma |
|---|---|---|---|
| `GET /proyectos-grado/reportes/planilla-avance-tercer-anio?carreraId=&gestionId=&bimestre=` | LISTAR | `planillaAvanceTercerAnio` | objeto `{ cabecera, folios: [ [10 estudiantes], ... ], resumenTutores: [...], tally: { aprobados, reprobados, abandonos, enProceso } }` |
| `GET /proyectos-grado/reportes/planilla-avance-tercer-anio/export?carreraId=&gestionId=&bimestre=` | EXPORTAR | — | binario (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) |

Archivos:

1. **Constantes**: ampliar `domain/constants/titulacion.constants.js` con
   `ESTUDIANTES_POR_FOLIO_TUTORIA = 10` y
   `RESULTADOS_TUTORIA_TERCER_ANIO = { APROBADO, REPROBADO, ABANDONO,
   EN_PROCESO }` (constante propia, NO importar nada de
   `domain/constants/libros.constants.js`).
2. **Use case** `application/use-cases/titulacion/GetPlanillaAvanceTercerAnioUseCase.js`
   — lee la vista 181 filtrada, ordena por apellido (mismo criterio
   institucional `buildFullName`/`ORDER BY apellido_paterno, apellido_materno,
   nombres`), pagina en folios de 10 (`Array.from({length:
   Math.ceil(n/10)})`, patrón de partición ya usado conceptualmente en
   `GenerarFoliosParaleloUseCase` del módulo Libros — SOLO como referencia de
   algoritmo, sin importar ese archivo), arma `resumenTutores` (docentes
   tutores distintos del roster, para la hoja de firmas) y `tally` contando
   `resultado_tutoria`.
3. **Use case** `application/use-cases/titulacion/ExportPlanillaAvanceTercerAnioExcelUseCase.js`
   — reutiliza `GetPlanillaAvanceTercerAnioUseCase.execute` y delega el
   pintado al builder.
4. **Interfaz + builder Excel** (carpeta propia, no depende de `libro-registro/`):
   `domain/interfaces/services/IPlanillaAvanceTutoriaExcelGenerator.js` +
   `infrastructure/external/excel/titulacion-planilla-avance/PlanillaAvanceTutoriaExcelBuilder.js`
   + `PlanillaAvanceTutoriaSheetBuilder.js` + `sheet/planillaAvanceTutoriaSheetConfig.js`
   — usa el toolkit compartido `excel/shared/` (`ExcelSheetComposer`,
   `ExcelTheme`). Estructura por hoja (una por carrera+bimestre exportado):
   folios apilados de 10 filas (N°, NÓMINA apellido-primero, C.I., TUTOR,
   Nº TUTORÍAS DEL BIMESTRE, % AVANCE, OBSERVACIONES), página final de FIRMAS
   DE DOCENTES (una fila por tutor distinto del roster, SIN incrementar
   folio — mismo criterio que la hoja de firmas del Libro) + cuadro con
   `% aprobados / % reprobados / % abandonos` sobre el total del roster.
5. **Repositorio de vista**: `findPlanillaAvanceTercerAnio({ carreraId,
   gestionId, bimestre })` sobre la vista 181, en el repo aislado
   `TutoriaAvanceViewRepository.js` (mismo de Requisitos 1 y 2).
6. **Mapper**: `TutoriaAvanceMapper.planillaRowsToPresentation`.
7. **Controllers**: `GetPlanillaAvanceTercerAnioController.js`,
   `ExportPlanillaAvanceTercerAnioExcelController.js`.
8. **Validators**: `planillaAvanceTercerAnioValidator` (`carreraId` requerido,
   `gestionId` opcional, `bimestre` requerido entero 1-4).
9. **Router**: `GET /reportes/planilla-avance-tercer-anio` y
   `GET /reportes/planilla-avance-tercer-anio/export`, estáticas.
10. **DI**: tokens + registro en `proyectos-grado.container.js`;
    `planillaAvanceTutoriaExcelGenerator` en `servicios.tokens.js` +
    `services.container.js`.

---

### Bloque L — Documentación

1. `docs/referencia/matriz-permisos-sistema.md`: nueva entrada de changelog
   ("## Changelog 2026-07-31 — TIT: formulario de modalidad, reporte de
   avance por carrera y planilla 10-en-10 (extensión, sin permisos nuevos)")
   describiendo los 6 endpoints nuevos y que reutilizan
   `titulacion.proyecto` LISTAR/EXPORTAR — sin tabla `###` nueva (TIT
   se documenta por changelog en este archivo, no tiene sección `###` fija;
   verificado, ver §0 de la investigación).
2. `docs/plan/titulacion-y-dominios-pendientes.md`: nota corta bajo "Fase 2 —
   Pasantías" o al final de "Fuera de este plan" señalando que este documento
   cubre 3 extensiones sobre Fase 2 (titulación), con enlace al archivo.
3. Cabeceras de las 4 vistas nuevas (178, 179, 180, 181) con
   `-- Consumidor:` y `-- Modelo de negocio:` explícitos, mismo estilo que las
   vistas 157/160/163/169 ya existentes.
4. Corregir el comentario de `22-modalidades-grado.sql` que dice "seeder 67"
   → `57-seed-titulacion-modalidades.sql` (§0.7.1).

---

## ITERACIÓN 2 — frontend + verificación completa

> Outline (menor detalle que Iteración 1 por acuerdo de entrega
> backend-first). Base: extender `frontend/src/application/modules/titulacion/proyectos-grado/`
> y `frontend/src/presentation/modules/titulacion/proyectos-grado/` — NO crear un
> módulo de menú nuevo, estos 3 requisitos son acciones/pantallas dentro del
> ítem de menú `TIT-PROYECTOS` ya existente (`/titulacion/proyectos-grado`).

### Bloque M — Requisito 1 (frontend)

- Modal/paso "Elegir estudiante de 3er año" en el flujo de creación de
  proyecto (`ProyectoGradoFormSections.jsx` o un nuevo
  `ElegirEstudianteTercerAnioModal.jsx`): reemplaza el `useBuscarEstudiantesTit`
  genérico por un nuevo hook `useEstudiantesElegiblesModalidadApi` que
  consume `GET /estudiantes-elegibles`, **`dataKey: 'estudiantesElegibles'`**
  (== `dataFieldName` de C1).
- Botón "Imprimir formulario de modalidad" (permiso EXPORTAR) en
  `ProyectoGradoDetail.jsx`, hook `useExportFormularioModalidadPdf` (patrón
  `useExportarFichaPdf` de Supervisión docente).
- Textos en "usted"; `Empty` si no hay estudiantes elegibles ("No hay
  estudiantes de 3er año disponibles para elegir modalidad de graduación en
  esta gestión.").

### Bloque N — Requisito 2 (frontend)

- Nueva página `ReporteAvanceTutoriaCarreraPage.jsx` (bajo
  `titulacion/proyectos-grado/pages/`, ruta `/titulacion/proyectos-grado/reportes/avance-carrera`,
  `menu: null`, breadcrumbParent `TIT-PROYECTOS`), hook state
  `useAvanceTutoriaCarreraPage` + hook api `useAvanceTutoriaCarreraApi`
  (**`dataKey: 'avanceTutoriaCarrera'`**), tarjetas de resumen por carrera +
  tabla de detalle (organismo compartido de tabla, config
  `avanceTutoriaCarreraTableColumns.jsx`), botón "Exportar PDF" (EXPORTAR).
- Enlace desde `ProyectosGradoList.jsx` (botón/acción de cabecera, visible
  solo con el permiso).

### Bloque O — Requisito 3 (frontend)

- Nueva página `PlanillaAvanceTercerAnioPage.jsx` (misma ruta base, p. ej.
  `/titulacion/proyectos-grado/reportes/planilla-tercer-anio`), filtros
  carrera/gestión/bimestre, vista previa en pantalla replicando el folio de
  10 (componente `PlanillaAvanceFolioPreview.jsx`, CSS propio, NO reutilizar
  `styles/libros.css`), botón "Exportar Excel" (EXPORTAR).
- Hook api `usePlanillaAvanceTercerAnioApi` (**`dataKey:
  'planillaAvanceTercerAnio'`**), hook state
  `usePlanillaAvanceTercerAnioPage`.

### Bloque P — Seeds y datos de prueba

- Sin seeder transaccional nuevo (no hay tablas nuevas). Datos de prueba:
  crear 2-3 proyectos de grado vía UI/API con estudiantes reales de 3er año
  (verificar con el agente `datos` o datos ya sembrados de matrícula),
  registrar 3-5 entradas de bitácora con fechas dentro del bimestre vigente
  y `porcentaje_avance` variado, y llevar al menos un proyecto a `APROBADO` y
  otro a `REPROBADO`/`CANCELADO` (transiciones T11 ya existentes) para
  poblar el cuadro de %.
- Ejecutar vistas 178-181 en BD (gated solo por aviso, pre-autorizado §0.6).

### Bloque Q — Verificación final (compuerta `verificador`)

1. Lint backend + lint/build frontend.
2. `dataKey == dataFieldName` en los 3 contratos nuevos
   (`estudiantesElegibles`, `avanceTutoriaCarrera`, `planillaAvanceTercerAnio`).
3. RBAC 3 capas con `DIR_ACADEMICO`/`SEC_ACADEMICA`: los 6 endpoints
   responden 200; menú/botones visibles.
4. Rol SIN el permiso (`DOCENTE`, que no tiene LISTAR/CREAR de
   `titulacion.proyecto` — solo LISTAR/DETALLE): los 6 endpoints
   nuevos → 403; botones/rutas ausentes en UI.
5. Guard de negocio: `POST /proyectos-grado` con un estudiante de 1er/2do año
   → 400 claro ("El estudiante debe estar cursando el 3er año..."); con
   estudiante de 3er año sin `carreraId`/`gestionId` en el body → se
   completan solos y el proyecto se crea.
6. PDF FMDG-1 comparado lado a lado con el `.docx` fuente (campos, orden,
   firma).
7. Planilla Excel: folios de 10 correctos, hoja de firmas al final SIN
   incrementar folio, cuadro de % suma 100% del roster.

## Grafo de dependencias y compuertas de aprobación

```
178 (roster 3er año) ──┬─→ A2/A ( Requisito 1: guard + endpoint elegibles)
                         └─→ 181 (Requisito 3, con 180)
160 (ajuste D1) ────────→ 179 (Requisito 2) ── 181 usa proyecto_estado (no 179)
180 (bitácora×bimestre) ─→ 181 (Requisito 3)

Backend R1 (A-C) ⟶ Backend R2 (D-F) ⟶ Backend R3 (G-J) ⟶ Documentación (L)
   ⟶ [Iteración 2: M-O ⟶ P ⟶ Q]
```

- **Compuertas de aprobación real:** ninguna requiere pausa por sí sola en
  este frente de trabajo — vistas SQL de lectura (178-181, ajuste a 160) y
  seed RBAC (texto en 65, si se toca) están **pre-autorizadas** (ver §0.6 y
  el encargo de la sesión). La ÚNICA compuerta dura sería un `CREATE TABLE`
  para el Requisito 3, y la decisión de este documento (§0.5/Bloque G) es que
  **no hace falta** — si esa conclusión cambia durante la implementación,
  **detenerse y pedir aprobación explícita antes de escribir el DDL**.
- Orden sugerido de implementación: A1-A3 → B → C (Requisito 1 completo y
  probable) → D1-D2 → E → F (Requisito 2) → H1-H2 → I → J (Requisito 3) → L
  (documentación) → Iteración 2 completa → Q.

## Bitácora de cambios

- **2026-08-01 (decisión de alcance):** la bitácora de tutoría NO registrará
  si la sesión fue presencial o virtual — el usuario lo descartó explícitamente
  ("como no lo especificaron, se deja sin implementar"). No agregar el campo a
  `bitacora_proyecto` ni reabrir esta decisión sin pedido nuevo del instituto.
- **2026-08-01 (corrección post-verificación, Iteración 2):** el `verificador`
  detectó que `routes.jsx` había creado 2 ítems de menú de nivel superior para
  los Requisitos 2/3 (desviación de los Bloques N/O, que pedían `menu: null` +
  enlace desde la lista). Corregido según decisión del usuario (volver al plan
  original): ambas rutas ahora con `menu: null` + `breadcrumbLabel` +
  `breadcrumbParent: 'TIT-PROYECTOS'`; acceso por 2 botones de cabecera en
  `ProyectosGradoList.jsx` («Avance por carrera», «Planilla 3er año»,
  `ActionButton` con `titulacion.proyecto` LISTAR) — los docentes-tutores no
  los ven porque el connector los desvía a «Mis tutorados». Retiradas las 2
  entradas de `menuIconMap` y las 2 constantes `*_MENU_KEY` sin uso de
  `paths.js`. Con esto, la observación RBAC del verificador (docente viendo
  reportes institucionales en su sidebar) queda cerrada. Lint y build verdes.
  El resto del veredicto de verificación fue apto: contratos
  `dataKey`==`dataFieldName` correctos, RBAC 3 capas coherente, guard de 3er
  año cableado, estados vacío/carga/error cubiertos.
- **2026-07-31 (planificador):** documento creado. Investigación de campo
  completa: año académico vía `periodos.numero`/vista 100-101, creación de
  proyecto ya restringida a Dirección Académica por RBAC (sin cambios ahí),
  FMDG-1 verificado campo a campo contra el `.docx` fuente, decisión razonada
  de NO tabla nueva para el Requisito 3, y hallazgo de que los 3 requisitos
  se resuelven reutilizando el permiso `titulacion.proyecto`
  existente (sin RBAC nuevo). Vistas asignadas: 178-181 (verificar máximo
  real antes de crear archivos, ver §0.7.2).
- **2026-07-31 (backend) — ITERACIÓN 1 COMPLETA (bloques A-L):** verificado el
  máximo real de vistas antes de crear archivos (177, sin cambios respecto a
  lo asignado por el planificador) — las 4 vistas nuevas se crearon con la
  numeración prevista (178-181) y se ejecutaron en BD (MAMP dev), junto con el
  ajuste aditivo D1 a la 160 (`ultima_observacion`). Sin desviaciones de
  numeración.
  - **Requisito 1:** guard `assertEstudianteEsTercerAnio` en
    `proyectoTutoriaGuards.js` (reutiliza `EnrollmentRepository.obtenerListadoMatriculas`,
    vista 101) + `CreateProyectoGradoUseCase` ahora valida 3er año de TODOS
    los estudiantes y deriva `carreraId`/`gestionId` del titular si el body no
    los manda. `GET /estudiantes-elegibles` (LISTAR, `dataFieldName:
    estudiantesElegibles`, paginado vía `BaseListController`) y `GET
    /:id/formulario-modalidad/pdf` (EXPORTAR) — `FormularioModalidadGradoPdfGenerator`
    con firma en 2 columnas (declarante + Dirección Académica) porque
    `_addSignatureBlock` de la base solo soporta una firma centrada por
    llamada (se replicó el patrón `_addSignatureBlockTwoColumns` de
    `FormularioInscripcionPdfGenerator`, sin tocar la base).
  - **Requisito 2:** D1 en 160 con subconsulta correlacionada `LIMIT 1` (no
    `GROUP_CONCAT`, evita el riesgo de separador con comas en el texto libre).
    `GET /reportes/avance-carrera` y `/pdf` (`dataFieldName:
    avanceTutoriaCarrera`) reutilizan `proyectoGradoListadoViewRepository.findListado`
    para el detalle, sin duplicar esa lectura.
  - **Requisito 3:** confirmado en implementación — **NO hizo falta tabla
    nueva** (según lo previsto en §0.5): vista 181 roster-driven vía `INNER
    JOIN periodos_academicos` (4 bimestres de la gestión) + `LEFT JOIN`
    agregado de la 180, para no perder estudiantes sin tutorías en el
    bimestre. `GET /reportes/planilla-avance-tercer-anio` y `/export`
    (`dataFieldName: planillaAvanceTercerAnio`) con builder Excel propio
    (`excel/titulacion-planilla-avance/`, patrón de `libro-registro/` sin
    importarlo) — folios de 10 apilados + hoja de firmas de docentes (sin
    incrementar folio) + cuadro de % sobre el roster.
  - **Repo/mapper compartidos:** `TutoriaAvanceViewRepository` +
    `ITutoriaAvanceViewRepository` (arquetipo B, aislado del repo existente
    por SRP, opción recomendada del Bloque C.5) + `TutoriaAvanceMapper`
    (compartido por los 3 requisitos).
  - **RBAC:** sin permisos ni acciones nuevos (confirmado §0.6). Único cambio:
    texto (`nombre`) del permiso `titulacion.proyecto` ampliado en
    `65-seed-permisos-tit.sql` y aplicado en BD dev vía `UPDATE` directo (no
    altera `permiso_acciones`/`roles_permisos`, no requirió resiembra
    completa); recortado a 144 caracteres por el límite `VARCHAR(150)` de
    `permisos.nombre` (el texto propuesto en el Bloque B/E/I del plan excedía
    ese límite).
  - **Documentación:** changelog en `matriz-permisos-sistema.md`, nota en
    `titulacion-y-dominios-pendientes.md` (bajo Fase 2), comentario corregido
    en `22-modalidades-grado.sql` ("seeder 67" → `57-seed-titulacion-modalidades.sql`),
    cabeceras `-- Consumidor:`/`-- Modelo de negocio:` en las 4 vistas nuevas.
  - **Verificación:** lint limpio en todos los archivos backend tocados
    (2 líneas de `max-len` en `services.container.js` son preexistentes, no
    parte de este diff); contenedor DI resuelto en seco (15 tokens nuevos +
    router con las 29 rutas esperadas, estáticas antes de `/:id`); las 6
    lecturas SQL, los 3 use cases de lectura y los 3 use cases de exportación
    (PDF/PDF/Excel) se probaron end-to-end contra la BD dev real, incluyendo
    un caso no vacío sintético (2 folios/13 estudiantes) para el Excel de la
    planilla; guard `assertEstudianteEsTercerAnio` verificado en ambos
    sentidos (estudiante de 1er año rechazado, de 3er año aceptado con
    `carreraId`/`gestionId` derivados). Iteración 2 (frontend, bloques M-Q)
    queda pendiente para una sesión aparte.
