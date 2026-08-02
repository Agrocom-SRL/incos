# Acta de defensa de grado (modalidad de graduación) — plan de desarrollo

> Plan del `planificador` (2026-08-01), persistido para ejecutar por iteraciones.
> **Entrega por partes (backend-first):** Iteración 1 = datos + backend + RBAC +
> documentación (bloques A, B, C, E). Iteración 2 = frontend + verificación
> completa (bloques D, F, G). **Nada se ejecuta en BD sin aprobación explícita
> del usuario; el DDL de este documento tampoco se traslada a `01-schemas/`
> hasta esa aprobación.**
>
> Documento real espejo:
> `/Users/miguel/.claude/image-cache/0749b0f2-25ac-46c6-98cc-7b80ddd02893/1.png`
> («ACTA DE DEFENSA DE GRADO MODALIDAD DE GRADUACIÓN: PROYECTO DE GRADO»,
> caso real YUCRA VEIZAGA PEDRO, ADM-EMP, 26-nov-2025, foliado rojo **012**).

---

## Estado de la Iteración 1 (backend) — COMPLETADA 2026-08-01

Ejecutada por el agente `backend`. Bloques A, B, C, E cerrados; nada se
ejecutó contra la BD real.

- [x] **Bloque A** — DDL de `actas_defensa` + `tribunal_acta_defensa` añadido
  al final de `backend/database/01-schemas/22-modalidades-grado.sql` (con sus
  DROPs hijas-antes-que-raíz al inicio del archivo). **Corrección del
  usuario (2026-08-01) sobre el plan original:** NO se crea archivo en
  `backend/database/05-migrations/` — el módulo Titulación (y esta
  extensión) todavía no está implantado en ninguna BD real/servidor, así
  que no aplica una migración incremental; `05-migrations/` es solo para
  tablas YA desplegadas con datos que no se pueden resembrar. El usuario
  aplicará el schema completo directo cuando apruebe. Verificado por
  lectura: 0 FKs con `RESTRICT` en el archivo (100% `ON DELETE SET NULL`).
- [x] **Bloque B** — `65-seed-permisos-tit.sql`: texto `nombre` de
  `titulacion.proyecto` ampliado + nota fechada 2026-08-01 en el
  comentario de cabecera. Cero filas nuevas en `permisos`/`permiso_acciones`/
  `roles_permisos`. Resiembra (B2) pendiente de aprobación del usuario.
- [x] **Bloque C** — Backend completo por capas: constantes, modelos
  Sequelize, `IActaDefensaRepository`/`ActaDefensaRepository` (arquetipo A,
  con `createConTribunal` transaccional), `ActaDefensaMapper`,
  `RegistrarActaDefensaUseCase`/`ListActasDefensaProyectoUseCase`/
  `ExportActaDefensaPdfUseCase`, controllers, validators, 3 rutas nuevas bajo
  `/api/v1/proyectos-grado/:id/acta-defensa`, `ActaDefensaPdfGenerator`
  (pdf-lib, patrón FMDG-1) + helper compartido `numberToWords.js`, DI
  registrada y verificada por resolución real del contenedor (sin BD).
  `AnularActaDefensaUseCase` (P8, opcional) **NO se implementó** — diferido
  según lo resuelto.
- [x] **Bloque E** — Este documento actualizado; changelog en
  `docs/referencia/matriz-permisos-sistema.md` y registro en
  `docs/plan/estado-avance-y-proximos-pasos.md`.

**Hallazgos/discrepancias encontrados al implementar (no estaban en las
preguntas P1-P8, se reportan en vez de improvisar silenciosamente):**

1. **§0.7 es incorrecta sobre la tabla `instituciones`**: esa tabla es el
   catálogo de instituciones **DE ORIGEN** para traspasos/transitabilidad
   (UETHP/CEA/otros ITT) — `18-transitabilidades.sql` la documenta así
   explícitamente. NO contiene la identidad propia de INCOS. La cabecera del
   acta (INSTITUTO/CARÁCTER/CIUDAD/DEPARTAMENTO) se implementó con
   constantes locales en `ActaDefensaPdfGenerator.js`, el mismo patrón que
   ya usa `FormularioModalidadGradoPdfGenerator` (hardcodea
   `'INSTITUTO TÉCNICO INCOS SANTA CRUZ'`) — no se inventó una consulta a
   `instituciones`.
2. **C9 asume un "guard de pertenencia" que hoy NO existe** en ningún
   satélite de la ficha (`GET /:id` T6, bitácora T14, dictámenes T22): todos
   solo validan existencia del proyecto (`getProyectoOrFail`), sin
   anti-IDOR por fila; el acceso de ESTUDIANTE se limita al permiso
   `titulacion.proyecto`·DETALLE. `ListActasDefensaProyectoUseCase` sigue
   el MISMO patrón exacto (sin guard nuevo) por consistencia con el resto
   del módulo — no se inventó un guard que no tiene precedente en el
   código real.
3. **Tribunal sin "grado académico" abreviado**: el modelo `docentes` no
   tiene un campo de abreviatura tipo "Lic./Ing." (solo `nivelAcademico`
   ENUM y `tituloProfesional` libre); el snapshot `nombreCompleto` del
   tribunal usa el orden institucional (APELLIDO_PATERNO APELLIDO_MATERNO
   NOMBRES) sin prefijo de grado — el ejemplo "Lic. …" del DDL es
   ilustrativo, no se inventó un mapeo ENUM→abreviatura no especificado.
4. **C10 (PDF) SÍ se implementó en esta iteración** (`ActaDefensaPdfGenerator.js`
   + `ExportActaDefensaPdfUseCase`), confirmando la duda que dejaba abierta
   la instrucción de la tarea ("puede que el PDF también quede para la
   Iteración 2") — el propio Bloque C del plan ya lo incluía como parte de
   esta entrega, así que se construyó junto con el resto del backend.

---

## Estado de la Iteración 2 (frontend) — COMPLETADA 2026-08-02

Ejecutada por el agente `frontend`. Bloques D y D5 (opcional) cerrados;
Bloques F y G quedan **bloqueados** hasta que el usuario apruebe y aplique el
DDL del Bloque A (A3) — sin las tablas en BD real no hay forma de registrar
un acta de prueba ni de correr la compuerta de verificación. Nada se
commiteó; el working tree queda listo para revisión del usuario.

- [x] **D1** — `endpoints.js`: `ACTA_DEFENSA(id)` y `ACTA_DEFENSA_PDF(id, actaId)`.
- [x] **D2** — Capa application: `useActaDefensaApi` (GET, carga lazy),
  `useRegistrarActaDefensa` (POST), `useExportActaDefensaPdf` (blob, patrón
  `useExportFormularioModalidadPdf`); `useProyectoGradoDetailPage` extendido
  con carga lazy de actas, estado del modal y `puedeRegistrarActa`.
- [x] **D3** — `ProyectoActaDefensaSection.jsx` (una `DetailInfoCard` por
  acta, pill de foliado, resultado APRUEBA verde/REPRUEBA ámbar —nunca
  rojo—, tribunal numerado, export gateado EXPORTAR, `Empty` sin `Alert`) +
  `RegistrarActaDefensaModal.jsx` (patrón `AprobarEtapaModal`, tribunal con
  `Select` sobre `useDocentesCatalogoTitApi`, calificación por integrante,
  `numeroActa` opcional) + tab «Acta de defensa» y CTA condicional en
  `ProyectoGradoDetail.jsx`.
- [x] **D4** — Ya resuelto antes de esta iteración: `TRANSICIONES_PROYECTO.DEFENSA`
  reducido a `['CANCELADO']` en `titulacionPills.js` (el registro del acta
  dispara la transición T11, no el modal genérico).
- [x] **D5** (opcional) — `MiProyectoGradoPage.jsx`/`useMiProyectoGradoPage.js`:
  reusa `ProyectoActaDefensaSection` en modo lectura (`puedeRegistrar={false}`,
  sin export — ESTUDIANTE no tiene EXPORTAR).
- [x] **F/G** — desbloqueados 2026-08-02: el usuario aplicó el DDL del
  Bloque A (`actas_defensa`/`tribunal_acta_defensa`) y el seeder
  `57-seed-titulacion-modalidades.sql` (catálogo `modalidades_grado`, que
  estaba vacío — bloqueador previo no relacionado con el acta, ver abajo).
  Detalle en "Estado de los Bloques F y G" más abajo.

**Discrepancias/decisiones reportadas por el agente `frontend` (no
resueltas en silencio):**

1. El campo **cargo** del tribunal se implementó como valor inicial
   editable (no placeholder puro) — lectura más útil de "default".
2. **`observaciones`** del acta: el backend lo acepta (C8/C12) pero D3 no lo
   listaba entre los campos del modal — se omitió a propósito por apego
   literal al plan; trivial de añadir si se pide.
3. **Umbral de aprobación (preview cliente)**: no existe hoy ningún fetch de
   la política de evaluación por gestión desde el dominio Titulación; en vez
   de acoplar Titulación→Académico importando el helper de
   `academico/calificaciones`, se duplicó solo el número de fallback (61)
   como `NOTA_MINIMA_APROBACION_ACTA_PREVIEW` en `titulacionPills.js`,
   documentado como preview no autoritativo — el backend sigue siendo la
   única fuente de verdad del `resultado`.
4. **Nombre/C.I. del estudiante en el acta**: `ActaDefensaMapper` (backend)
   no los devuelve, solo `estudianteId`; se resuelven en
   `ProyectoActaDefensaSection` cruzando contra `proyecto.integrantes` (ya
   cargados por la ficha), igual que `ProyectoIntegrantesSection`.
5. **Duplicados en el tribunal**: sin validación cliente contra elegir el
   mismo docente en dos posiciones (el backend tampoco lo valida en
   `RegistrarActaDefensaUseCase._resolverTribunal`) — posible mejora de UX
   futura, fuera del alcance literal de D3.
6. **Validación cruzada de horas** (`horaConclusion > horaInicio`): no
   duplicada en cliente; el backend la valida y el error fluye por la
   notificación genérica de error.

Verificación técnica: lint limpio (`--max-warnings 0`) en los 11 archivos
tocados y en todo `titulacion/**`; build de producción (`vite build`) OK.
Los 438 errores de lint del repo completo son preexistentes y ajenos a este
módulo (`pagos`, `breadcrumbUtils`, etc.).

---

## Estado de los Bloques F y G — COMPLETADOS 2026-08-02

Ejecutados con backend + frontend levantados en local contra la BD real del
usuario (tablas del Bloque A ya aplicadas). Datos de prueba **persistidos a
propósito** (decisión del usuario: "los datos que uses de prueba lo puedes
persistir para que también los uses como presentación, como es local no
importa esos datos") — sirven como demo funcional del módulo.

**Bloqueador previo no relacionado con el acta**: `modalidades_grado` estaba
vacía (el seeder `57-seed-titulacion-modalidades.sql` — PSP/PG/PE/TD — nunca
se había corrido), lo que impedía crear cualquier proyecto de grado. El
usuario lo aplicó 2026-08-02.

**Datos de prueba creados (vía API, usuario `admin`)**:

| Proyecto | Modalidad | Estudiante(s) | Acta(s) | Resultado |
|---|---|---|---|---|
| 2 | PG (individual) | CHOLIMA ANTELO DIEGO | 001 | REPRUEBA (45 < 61) |
| 3 | PSP (grupal, 2 integrantes) | CUÑANCHIRO PEDRO LUIS (titular) + DREW OSHADY ELKIN | 002 / 003 | APRUEBA (70) / REPRUEBA (55) |
| 4 | PG (individual) | ALARCON RAMIREZ NOEMI | 004 | APRUEBA (85) |
| 5 | PG (individual, prueba de duplicado) | ACAPA PACO BISMARK YAMIL | 005 | APRUEBA (65) |
| 1 | PG (individual) | TAPIA ANA MELIXA | — (bloqueado a propósito, ver hallazgo) | queda en `DEFENSA` sin acta |

**Hallazgo — dato preexistente sucio, no causado por esta extensión**: el
proyecto 1 heredó un `integrantes_proyecto` huérfano (`estudiante_id=21`,
`created_at` 2026-07-29, anterior a esta sesión) ya marcado
ACTIVO/TITULAR, a pesar de que `proyectos_grado` estaba vacía al iniciar.
El AUTO_INCREMENT de `proyectos_grado` reusó el id `1`, y
`RegistrarActaDefensaUseCase._validarCalificaciones` correctamente rechazó
el registro (400: "calificaciones debe incluir exactamente una calificación
por cada integrante ACTIVO") porque no se envió calificación para el
integrante huérfano — el use case funcionó como debía frente a datos sucios.
No se tocó ese registro (fuera del alcance de esta tarea); queda como
evidencia de una inconsistencia de datos preexistente en `integrantes_proyecto`
a limpiar en otra sesión si el usuario lo desea.

### G — checklist de verificación (1-9 del plan)

1. **Lint backend + lint/build frontend**: limpio (backend: `npx eslint` sobre
   los archivos tocados, 0 errores; frontend: confirmado en el cierre del
   Bloque D).
2. **`dataKey == dataFieldName`**: confirmado contra la API real — `actasDefensa`
   en `GET` y `POST /:id/acta-defensa`.
3. **RBAC 3 capas (control total)**: confirmado con `admin` (mismas filas de
   `roles_permisos` que DIR_ACADEMICO/RECTOR — "control total" del seed 65,
   línea 112-121). **No se probó en vivo con una cuenta `DIR_ACADEMICO`
   real** (existe `dir_academico_qa` en la BD pero su contraseña no se
   pudo determinar); la cobertura de permisos es equivalente por fila de
   RBAC, no por identidad de rol.
4. **Rol sin permiso → 403**: confirmado en vivo:
   - DOCENTE (`docente`/`12345678`): `POST /acta-defensa` → 403, `GET .../pdf` → 403.
   - ESTUDIANTE (`13081716`/`13081716`): `POST /acta-defensa` → 403, `GET .../pdf` → 403.
   - Sin token: 401.
   - **SEC_ACADEMICA no se probó en vivo** (contraseña de `sec_academica_qa`
     desconocida); confirmado solo por lectura del seed 65 (tiene EXPORTAR,
     no tiene APROBAR) — mismo mecanismo `verificarPermiso` ya ejercitado
     con DOCENTE/ESTUDIANTE.
5. **ESTUDIANTE — guard anti-IDOR: NO SE CUMPLE, y es un hallazgo real, no
   una regresión.** Prueba en vivo: el estudiante `13081716` (estudiante_id=1,
   sin relación con el proyecto 4) hizo `GET /proyectos-grado/4/acta-defensa`
   y obtuvo **200** (no 403). Esto coincide exactamente con el Hallazgo 2 ya
   documentado al cerrar la Iteración 1 (backend): ningún satélite de la
   ficha (`GET /:id`, bitácora, dictámenes, y ahora acta) valida pertenencia
   por fila — el acceso de ESTUDIANTE se apoya solo en el permiso grueso
   DETALLE, por precedente del resto del módulo. **Vía la UI real esto no es
   explotable** (el frontend de estudiante usa `/mi-proyecto`, que resuelve
   el ID en servidor desde la sesión — nunca deja que el estudiante elija un
   ID arbitrario), pero un ESTUDIANTE que arme la llamada HTTP a mano SÍ
   puede leer el acta de un proyecto ajeno. **Decisión pendiente del
   usuario**: aceptar el riesgo (consistente con el resto del módulo, cambio
   de alcance amplio si se corrige) o añadir `assertIntegranteActivo` en
   `ListActasDefensaProyectoUseCase` (y por coherencia en los demás
   satélites) en una iteración aparte.
6. **Máquina de estados**: confirmado. `POST /acta-defensa` sobre un proyecto
   que ya no está en `DEFENSA` (proyecto 4, ya `APROBADO`) → **409**. Tras
   registrar el acta, `proyectos_grado` queda sincronizado
   (`estado`/`fecha_defensa`/`nota_defensa`/`nota_final`) y se emite el
   dictamen `VIABILIDAD_TECNICA` en la rama APROBADO (verificado en BD:
   proyecto 3, dictamen id 5, `resultado='APROBADO'`); la rama REPROBADO
   (proyecto 2) correctamente **no** emite ese dictamen.
7. **Numeración**: confirmado correlativo **por gestión** (no por proyecto):
   001, 002, 003, 004, 005 consecutivos entre 4 proyectos distintos de la
   misma gestión. `numeroActa` manual duplicado (`2`, ya usado) → **409**.
8. **PDF vs. imagen real**: generado y revisado campo a campo contra §1 —
   folio rojo `004`, membrete, grilla, párrafo de apertura con fecha en
   letras, título del proyecto, tribunal numerado, resolución con
   calificación en número y letras, hora de conclusión, firmas. **Bug real
   encontrado y corregido**: `ActaDefensaPdfGenerator._buildFirmas` no sumaba
   `signatureTemplateFooterHeight` (45pt, la franja verde de contacto
   pre-impresa de `Plantilla.pdf`) al calcular la fila inferior de firmas —
   a diferencia de `FormularioModalidadGradoPdfGenerator._buildFirmas`, que sí
   lo hace. Efecto: las firmas del tribunal/postulante se dibujaban encima
   del pie de página institucional. Corregido replicando el patrón exacto
   del generador de referencia (una línea); PDF regenerado y verificado sin
   solape. Lint limpio tras el cambio.
9. **PSP grupal**: confirmado — proyecto 3 (2 integrantes) generó 2 actas
   (002/003) con el **mismo tribunal** (3 docentes) y números consecutivos,
   una por integrante ACTIVO, con calificación/resultado independientes
   (APRUEBA/REPRUEBA) mientras la transición del proyecto sigue la nota del
   TITULAR.

**Pendiente de decisión del usuario** (no bloquea el cierre del módulo):
(a) punto 5 — añadir guard anti-IDOR en acta/satélites o aceptar el riesgo
por ahora; (b) si quiere profundizar RBAC en vivo con `DIR_ACADEMICO`/
`SEC_ACADEMICA` reales, indicar su contraseña o autorizar un reseteo puntual
de esas 2 cuentas QA.

---

## §0 — Contexto verificado (leído en el repo, no asumir de memoria)

1. **`proyectos_grado` (22-modalidades-grado.sql) ya tiene** `fecha_defensa`,
   `nota_predefensa`, `nota_defensa`, `nota_final`, `documento_defensa_id` y el
   ENUM de estados (`PERFIL → … → DEFENSA → APROBADO|REPROBADO|CANCELADO`).
   **NO modela**: tribunal (3 evaluadores), horas de inicio/conclusión del
   acto, resultado formal del acta (APRUEBA/REPRUEBA como acto administrativo)
   ni numeración correlativa de actas. Confirmado línea a línea.
2. **Máquina de estados**: `AprobarEtapaProyectoUseCase` (T11,
   `backend/src/application/use-cases/titulacion/AprobarEtapaProyectoUseCase.js`)
   aplica `DEFENSA → APROBADO|REPROBADO` vía `TRANSICIONES_PROYECTO_GRADO`
   (`domain/constants/titulacion.constants.js`), fija `fecha_defensa`/
   `nota_defensa`/`nota_final` y, al pasar a APROBADO, **emite el dictamen
   VIABILIDAD_TECNICA con PDF** (guardado en uploads + `dictamenes_proyecto`).
   El registro del acta debe **componer** este use case, no duplicar la
   transición (evita dos fuentes de verdad de nota/fecha/estado).
3. **Patrón PDF espejo (FMDG-1)**: `ExportFormularioModalidadGradoPdfUseCase`
   + `infrastructure/external/pdf/titulacion/FormularioModalidadGradoPdfGenerator.js`
   (extiende `IncosPDFLibBase`, carga la plantilla institucional
   `infrastructure/external/templates/Plantilla.pdf` con membrete real —
   escudo Ministerio + logo INCOS + R.M. 0426/2016 — y retorna Buffer).
   Documento «export»: NO escribe en `dictamenes_proyecto` ni en uploads.
   **Este es el patrón a reusar para el acta.**
4. **Router**: `presentation/routes/proyectos-grado.routes.js`, montado en
   `/api/v1/proyectos-grado`; permisos `titulacion.proyecto` con vocabulario
   v2; `POST /:id/transiciones` y `POST /:id/tutor` usan la acción APROBAR.
5. **RBAC (seed 65 `65-seed-permisos-tit.sql`)**: `titulacion.proyecto` tiene
   LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/APROBAR/EXPORTAR. APROBAR solo lo
   tienen **DIR_ACADEMICO y RECTOR** (ADMIN hereda por vista); SEC_ACADEMICA
   tiene LISTAR/DETALLE/CREAR/EDITAR/EXPORTAR; ESTUDIANTE tiene DETALLE con
   guard de pertenencia en servidor. La extensión 2026-07-31 (FMDG-1,
   reportes) **no creó permisos nuevos** — solo amplió el texto `nombre`.
6. **Numeración/foliado — investigación del «012» rojo del acta**: hoy NO
   existe numeración de actas en el sistema. Antecedentes en el repo:
   - `dictamenes_proyecto.numero_informe` es **texto libre** (ej.
     `INF-DA-015/2026`), sin correlatividad garantizada.
   - El único patrón correlativo real es el de **libros de registro**
     (`25-libros-registro.sql`: `libros_registro.folio_actual`,
     `folios_libro.numero_folio` con `UNIQUE (libro_id, numero_folio)` y
     asignación MAX+1). El «012» del acta corresponde al **foliado del
     talonario/libro físico de actas de defensa** del instituto → sí
     corresponde numerar correlativamente (propuesta en §A; alcance de la
     serie = pregunta abierta P1).
7. **Cabecera institucional (fuentes de datos ya existentes)**:
   `instituciones.dependencia` ENUM('FISCAL','CONVENIO','PRIVADO') +
   `departamento_id` (ciudad/departamento); `carreras.titulo_otorgado`
   («Técnico Superior en …») para derivar el NIVEL; constantes de membrete en
   `infrastructure/external/pdf/IncosPDFBase.js`. La calificación EN LETRAS
   puede reusar `_numberToWords` de `ReciboPagoPdfGenerator.js` (~línea 1092)
   — extraer a helper compartido (C10).
8. **Frontend ficha**: `presentation/modules/titulacion/proyectos-grado/pages/ProyectoGradoDetail.jsx`
   con `DetailTabsPanel` (tabs Datos / Integrantes / Bitácora / Avances /
   Dictámenes) y botón de cabecera «Exportar formulario FMDG-1». Capa
   application en `application/modules/titulacion/proyectos-grado/`
   (hooks api/state, mappers, providers). El acta será una **tab nueva de la
   ficha, sin ítem de menú** (criterio «ítem = proceso completo»; el acta es
   satélite del proyecto).
9. **Vistas SQL**: máximo actual **181** (178-181 de la extensión TUT).
   **Este plan NO crea vistas** — el acta se lee por repositorio Sequelize
   con include del tribunal (no hay listado transversal de actas en v1).
   Si a futuro se pide un listado/libro de actas, la primera vista libre es
   la 182.
10. **Grupalidad (PSP)**: `integrantes_proyecto` permite 1..N estudiantes por
    proyecto (`MODALIDAD_GRUPAL_CODIGO = 'PSP'`). El acta real es **por
    estudiante** (nombre + C.I. individuales) → el modelo debe soportar N
    actas por proyecto (una por integrante ACTIVO). Ver pregunta P3.

**Módulos de referencia por capa** (copiar de ahí, no inventar):

| Capa | Referencia |
|---|---|
| Use case export PDF | `application/use-cases/titulacion/ExportFormularioModalidadGradoPdfUseCase.js` |
| Generador PDF con plantilla | `infrastructure/external/pdf/titulacion/FormularioModalidadGradoPdfGenerator.js` |
| Transición de estado (componer) | `application/use-cases/titulacion/AprobarEtapaProyectoUseCase.js` |
| Tabla satélite con hijos | `integrantes_proyecto` / `dictamenes_proyecto` (schema 23) |
| Correlativo MAX+1 | Lógica de folios de `libros-registro` (Fase 4) |
| Router/validators | `presentation/routes/proyectos-grado.routes.js` + `validators/titulacion/proyectos-grado.validator.js` |
| DI | `container/modules/titulacion/proyectos-grado.container.js` + `container/tokens/titulacion.tokens.js` |
| Tab de ficha + modal | `ProyectoDictamenesSection.jsx` + `AprobarEtapaModal.jsx` (frontend) |

---

## §1 — Espejo del documento real (contenido del acta, campo a campo)

Estructura observada en la imagen (todo debe salir del sistema, nada
hardcodeado salvo los textos fijos del acta):

1. **Foliado** esquina superior derecha, rojo: `012` (correlativo, 3 dígitos
   con ceros a la izquierda) → `actas_defensa.numero_acta`.
2. **Membrete**: escudo + «MINISTERIO DE EDUCACIÓN» (izq.), logo INSTITUTO
   TÉCNICO INCOS Santa Cruz + «R. M. N° 0426/2016» (der.) → ya resuelto por
   `Plantilla.pdf`.
3. **Título** (2 líneas, centrado, negrita):
   «ACTA DE DEFENSA DE GRADO MODALIDAD DE GRADUACIÓN: **{MODALIDAD}**»
   (modalidad dinámica: PROYECTO DE GRADO / la que corresponda del catálogo).
4. **Grilla de cabecera** (2 columnas, etiquetas en negrita):
   - INSTITUTO: INSTITUTO TECNICO INCOS SANTA CRUZ · CARÁCTER: FISCAL
     (`instituciones.nombre` / `.dependencia`)
   - CARRERA: {carrera del proyecto} · NIVEL: TECNICO SUPERIOR
     (derivado de `carreras.titulo_otorgado`; fallback constante)
   - CIUDAD/LOCALIDAD: SANTA CRUZ DE LA SIERRA · DEPARTAMENTO: SANTA CRUZ
     (institución → departamento)
5. **Párrafo de apertura**: «En el departamento de {DEPARTAMENTO} en fecha
   {fecha en letras} a horas {hora_inicio} y en aplicación a lo dispuesto en
   la normativa vigente, el estudiante: **{APELLIDOS NOMBRES}** con C.I.
   {ci}, procedió a la defensa **{MODALIDAD}** titulado:»
   (orden de nombre = criterio `buildFullName`).
6. **Título del proyecto**: entre comillas, negrita, centrado, mayúsculas
   (`proyectos_grado.titulo`).
7. **Tribunal**: «Asistiendo en calidad de miembros del Tribunal Evaluador
   los siguientes profesionales del área de formación:» + lista numerada
   `1.- {nombre}` … con «(Tribunal Evaluador)» alineado a la derecha
   (3 miembros → tabla `tribunal_acta_defensa`).
8. **Párrafo de desarrollo** (texto fijo): instalación del acto, evaluación,
   cuarto intermedio, deliberación reservada, reinstalación, «el Tribunal
   Evaluador resolvió:».
9. **Resolución**: «OTORGAR LA CALIFICACIÓN FINAL DE **{nn} ({EN LETRAS})**
   PUNTOS, A FAVOR DEL ESTUDIANTE, CON LO QUE **({APRUEBA|REPRUEBA})** LA
   MODALIDAD DE GRADUACIÓN EFECTUADA.»
10. **Cierre**: «El presente acto académico concluyó a horas: {hora_conclusion}.»
    + «En señal de conformidad firman al pie del presente.»
11. **Firmas** (4 líneas): 3 × «NOMBRE TRIBUNAL» + 1 × «POSTULANTE»
    (dos columnas, dos filas).

---

## ITERACIÓN 1 — datos + backend + RBAC + documentación

### Bloque A — Modelo de datos ⛔ DDL PENDIENTE DE APROBACIÓN DEL USUARIO — NO EJECUTAR NI CREAR EL .sql AÚN

**Decisión: tabla nueva (2 tablas), NO columnas en `proyectos_grado`.**
Razones: (1) el tribunal son 3 filas repetibles (1NF; mismo argumento que
`integrantes_proyecto`); (2) el acta es un **acto administrativo por
estudiante** — en PSP grupal hay N actas por proyecto, imposible en columnas
de la raíz; (3) la numeración correlativa y una eventual anulación piden
identidad propia; (4) `proyectos_grado` ya guarda el resumen académico
(`fecha_defensa`, `nota_defensa`, `nota_final`, `estado`) que el use case
mantendrá sincronizado — no se duplica, se referencia.

- **A1.** DDL propuesto (destino final: **añadir al final de
  `backend/database/01-schemas/22-modalidades-grado.sql`** — mismo dominio que
  `proyectos_grado`; DROPs de las hijas antes que la raíz — más el script de
  migración correspondiente en `backend/database/05-migrations/` para la BD
  real). **⛔ PENDIENTE DE APROBACIÓN DEL USUARIO — NO EJECUTAR NI CREAR EL
  .sql AÚN; este bloque vive solo en este documento hasta el visto bueno:**

```sql
-- ⛔ PENDIENTE DE APROBACIÓN DEL USUARIO — NO EJECUTAR NI CREAR EL .sql AÚN
-- ============================================
-- TABLA: actas_defensa
-- Acta de defensa de grado (modalidad de graduación). UNA por estudiante
-- integrante: en PSP grupal hay N actas del mismo proyecto. El resumen
-- académico (fecha_defensa, nota_defensa, nota_final, estado) sigue viviendo
-- en proyectos_grado y lo sincroniza el use case vía la transición T11.
-- ============================================

CREATE TABLE actas_defensa (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado defendido (referencia a proyectos_grado)',
    estudiante_id INT NULL COMMENT 'Estudiante que defiende — integrante ACTIVO del proyecto (referencia a estudiantes)',
    gestion_id INT NULL COMMENT 'Gestión del acta, copiada del proyecto al registrar (ancla de la serie correlativa)',

    -- Identidad del acta
    numero_acta INT NOT NULL COMMENT 'Número correlativo del acta dentro de la gestión (foliado rojo del talonario, ej: 12 → se imprime 012). Autoasignado MAX+1, con override manual para empatar el libro físico',

    -- Acto de defensa
    fecha_defensa DATE NOT NULL COMMENT 'Fecha del acto de defensa',
    hora_inicio TIME NOT NULL COMMENT 'Hora de instalación del acto (cabecera "a horas HH:MM")',
    hora_conclusion TIME NULL COMMENT 'Hora de conclusión del acto ("concluyó a horas HH:MM")',

    -- Resolución del tribunal
    calificacion_final DECIMAL(5,2) NOT NULL COMMENT 'Calificación final en puntos (0-100); el PDF la imprime en número y letras',
    resultado ENUM('APRUEBA', 'REPRUEBA') NOT NULL COMMENT 'Resultado del acta; derivado de la calificación contra la nota mínima de configuracion_evaluacion (seed 54, misma fuente que usa el boletín/centralizador) y validado en servidor — sin constante nueva',
    observaciones TEXT NULL COMMENT 'Observaciones del acto (no se imprimen en el acta estándar)',

    -- Ciclo de vida del acta
    estado ENUM('EMITIDA', 'ANULADA') DEFAULT 'EMITIDA' COMMENT 'EMITIDA: acta vigente | ANULADA: dejada sin efecto (conserva su número; la sustituta toma número nuevo)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,

    UNIQUE INDEX uk_gestion_numero (gestion_id, numero_acta) COMMENT 'Serie correlativa única por gestión (alcance a confirmar — pregunta P1)',
    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Actas de un proyecto',
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Acta(s) de un estudiante',
    INDEX idx_proyecto_estudiante (proyecto_grado_id, estudiante_id, estado, activo, deleted_at) COMMENT 'Acta EMITIDA vigente por proyecto+estudiante (unicidad validada en use case, no en BD, por convivir con ANULADA)',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Acta de defensa de grado por estudiante (modalidad de graduación): tribunal, horas del acto, calificación final en puntos y resultado. Espejo del acta física foliada del instituto.';

-- ============================================
-- TABLA: tribunal_acta_defensa
-- Los 3 miembros del Tribunal Evaluador de UN acta. Siempre docentes del
-- instituto (P5: sin profesionales externos) — exigido en el use case/
-- validador (CREAR/EDITAR), NO como NOT NULL de BD: docente_id es NULLable
-- con ON DELETE SET NULL, igual que el resto de FKs de este repo (100% de
-- las FKs en 01-schemas usan SET NULL; RESTRICT está prohibido). nombre_completo
-- queda como snapshot para fidelidad con el documento firmado, sobrevive
-- aunque el docente_id se anule por baja física.
-- ============================================

CREATE TABLE tribunal_acta_defensa (
    id INT AUTO_INCREMENT PRIMARY KEY,

    acta_defensa_id INT NULL COMMENT 'Acta a la que pertenece el miembro (referencia a actas_defensa)',
    orden TINYINT NOT NULL COMMENT 'Posición 1..3 en la lista y en las firmas',
    docente_id INT NULL COMMENT 'Docente del instituto (referencia a docentes). P5: siempre debe venir poblado — exigido por el validador/use case en CREAR, no por NOT NULL (se deja NULLable solo para sobrevivir a ON DELETE SET NULL, patrón único de FKs en este repo)',
    nombre_completo VARCHAR(200) NOT NULL COMMENT 'Nombre como se imprime en el acta (snapshot del docente al momento de registrar, con grado académico: "Lic. …")',
    cargo VARCHAR(80) NULL DEFAULT 'TRIBUNAL EVALUADOR' COMMENT 'Rótulo impreso entre paréntesis (el acta real usa "Tribunal Evaluador" para los 3)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (acta_defensa_id) REFERENCES actas_defensa(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,

    UNIQUE INDEX uk_acta_orden (acta_defensa_id, orden) COMMENT 'Una posición por acta',
    INDEX idx_acta_defensa_id (acta_defensa_id) COMMENT 'Tribunal de un acta',
    INDEX idx_docente_id (docente_id) COMMENT 'Actas donde participó un docente',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Miembros (3) del Tribunal Evaluador de un acta de defensa. Snapshot de nombres para fidelidad con el documento firmado.';
```

  Notas de diseño registradas:
  - **Numeración**: autoasignada `MAX(numero_acta)+1` por `gestion_id` en el
    use case (dentro de la transacción), con `numeroActa` manual opcional en
    el body para empatar el talonario físico (validando el UNIQUE). Impresión
    con padding a 3 dígitos (`012`). Alcance de la serie = **pregunta P1**.
  - **Tribunal por acta (no por «evento defensa»)**: en PSP grupal el tribunal
    se repite en las N actas — se acepta el snapshot duplicado para replicar
    fielmente cada acta física y evitar una tercera tabla de eventos.
  - **Sin vista SQL**: el acta se consume solo desde la ficha del proyecto
    (repositorio + include). Si mañana se pide «libro de actas» transversal,
    vista 182+.
- **A2.** ✅ Hecho (2026-08-01): `22-modalidades-grado.sql` editado (DROPs de
  `tribunal_acta_defensa` y `actas_defensa` antes de `proyectos_grado`, al
  inicio del archivo; CREATE TABLE de ambas al final). **Corrección del
  usuario sobre este ítem:** NO se crea migración en `05-migrations/` — el
  módulo Titulación aún no está implantado en ninguna BD real/servidor, así
  que no hay tabla con datos que preservar; `05-migrations/` no aplica aquí
  (solo para deltas sobre tablas YA desplegadas). Ver "Estado de la
  Iteración 1" al inicio del documento.
- **A3.** Ejecutar en BD — **siempre a cargo del usuario** (regla del repo:
  los agentes preparan y verifican .sql, jamás ejecutan contra la BD real).
  Pendiente: el usuario aplica `22-modalidades-grado.sql` completo cuando
  apruebe.

### Bloque B — RBAC (sin permisos nuevos — opción recomendada) ⛔ resiembra requiere aprobación

**Recomendación (Opción A): NO crear códigos de permiso nuevos.** El acta es
un satélite de la ficha del proyecto y sus 3 operaciones mapean 1:1 al
vocabulario ya sembrado de `titulacion.proyecto`:

| Operación | Acción | Quién la tiene hoy |
|---|---|---|
| Registrar acta (POST) — **acto formal de Dirección Académica** | APROBAR | DIR_ACADEMICO, RECTOR (ADMIN hereda) |
| Anular acta (PATCH, opcional v1) | APROBAR | DIR_ACADEMICO, RECTOR |
| Ver acta en la ficha (GET) | DETALLE | DIRA/RECTOR/SEC_ACADEMICA/DOCENTE/ESTUDIANTE (guard) |
| Exportar PDF del acta | EXPORTAR | DIRA/RECTOR/SEC_ACADEMICA |

Esto respeta (b): **registra Dirección Académica** (y Rectorado), Secretaría
puede imprimir el acta ya registrada pero no emitirla, el tutor (DOCENTE) la
lee, y el estudiante la ve solo en su propio proyecto. Es el mismo criterio
que la extensión 2026-07-31 (FMDG-1/reportes: cero permisos nuevos).

- **B1.** Editar `backend/database/02-seeders/65-seed-permisos-tit.sql`:
  ampliar el texto `nombre` de `titulacion.proyecto` («… aprobar etapas/tutor,
  **registrar acta de defensa** y exportar reportes …») + nota fechada en el
  comentario de cabecera (patrón de las notas 2026-07-31). Sin filas nuevas en
  `permisos`, `permiso_acciones` ni `roles_permisos`.
- **B2.** Resiembra del seed 65 (o UPDATE puntual del `nombre`) en BD —
  **solo con aprobación explícita** (cambio cosmético; puede diferirse a la
  próxima resiembra planificada).

> **Opción B (descartada — P6 resuelto: se confirmó la Opción A):** permiso
> propio `titulacion.acta` (REGISTRAR/DETALLE/EXPORTAR/ANULAR). No se
> implementa.

### Bloque C — Backend (extiende `/api/v1/proyectos-grado`)

- **C1. Constantes**: extender `domain/constants/titulacion.constants.js` —
  `RESULTADOS_ACTA_DEFENSA = { APRUEBA, REPRUEBA }`,
  `ESTADOS_ACTA_DEFENSA = { EMITIDA, ANULADA }`,
  `TRIBUNAL_ACTA_DEFENSA_MIEMBROS = 3`,
  `NOTA_MINIMA_APROBACION_DEFENSA = 51` (⚠️ confirmar umbral — pregunta P2).
- **C2. Modelos**: `infrastructure/database/models/acta_defensa.js` y
  `tribunal_acta_defensa.js` (réplica del DDL, soft-delete/auditoría) +
  asociaciones en `models/index.js` (`actas_defensa.hasMany(tribunal…)`,
  `belongsTo(proyectos_grado / estudiantes / gestiones)`).
- **C3. Interfaces**: `domain/interfaces/repositories` →
  `IActaDefensaRepository` (arquetipo A, extiende IRepository; extras:
  `findByProyectoId(proyectoGradoId)` con tribunal incluido,
  `findEmitidaByProyectoEstudiante(proyectoGradoId, estudianteId)`,
  `maxNumeroActaByGestion(gestionId)`) ·
  `domain/interfaces/services/IActaDefensaPdfGenerator`.
- **C4. Repositorio**: `infrastructure/repositories/ActaDefensaRepository.js`
  (create con tribunal anidado en transacción; includes ordenados por `orden`).
- **C5. Mapper**: `application/mappers/titulacion/ActaDefensaMapper.js` —
  `toDetail` (acta + tribunal camelCase), `toPersistence`. Formato de número
  para UI/PDF: `numeroActaFormateado` = padding 3 dígitos.
- **C6. Use cases** en `application/use-cases/titulacion/`:
  - `RegistrarActaDefensaUseCase` — **momento del flujo: proyecto en estado
    `DEFENSA`** (la fecha programada de defensa ya la fijó la transición
    `APROBADO_PREDEFENSA → DEFENSA`). Pasos: (1) `getProyectoOrFail` +
    validar `estado === DEFENSA`; (2) validar estudiante(s) = integrantes
    ACTIVO sin acta EMITIDA previa; (3) validar tribunal (exactamente 3;
    snapshot de nombre vía `buildFullName` cuando llega `docenteId`);
    (4) validar horas (`hora_conclusion > hora_inicio`) y calificación 0-100;
    (5) derivar `resultado` con el umbral (rechazar si el cliente manda un
    resultado incoherente); (6) asignar `numero_acta` (MAX+1 por gestión u
    override validado); (7) crear acta(s)+tribunal en transacción;
    (8) **delegar la transición** `DEFENSA → APROBADO|REPROBADO` en
    `AprobarEtapaProyectoUseCase` con `nota = calificación del TITULAR` y
    `fecha = fecha_defensa` — así `proyectos_grado` queda sincronizado y el
    dictamen VIABILIDAD_TECNICA se sigue emitiendo como hoy.
  - `ListActasDefensaProyectoUseCase` — actas del proyecto (con tribunal),
    orden por estudiante titular primero.
  - `ExportActaDefensaPdfUseCase` — patrón FMDG-1: compone proyecto
    (`GetProyectoGradoByIdUseCase`), estudiante (`studentRepository`),
    institución (`institutionRepository` → nombre/carácter/ciudad/
    departamento), carrera (nivel desde `titulo_otorgado`), gestión, acta +
    tribunal → `actaDefensaPdfGenerator.generate(...)`. Documento **export**
    (Buffer; NO escribe en uploads ni `dictamenes_proyecto` — el acta ya está
    persistida en su tabla y el PDF es reproducible).
  - `AnularActaDefensaUseCase` (opcional v1 — pregunta P8): pasa a ANULADA
    con motivo en observaciones; NO revierte la transición del proyecto
    (corrección de estado = decisión manual documentada).
- **C7. Controllers** en `presentation/controllers/titulacion/`:
  - `registrar-acta-defensa.controller.js` → `dataFieldName: 'actasDefensa'`
  - `list-actas-defensa.controller.js` → `dataFieldName: 'actasDefensa'`
  - `export-acta-defensa-pdf.controller.js` → descarga binaria
    `acta-defensa-{apellidos}-{numeroActa}.pdf`
- **C8. Validators** en `presentation/validators/titulacion/proyectos-grado.validator.js`:
  `registrarActaDefensaValidator` (fecha requerida; horas `HH:mm`; tribunal
  array exacto de 3 con `nombreCompleto` requerido; `calificaciones` array
  1..N de `{ estudianteId, calificacionFinal 0-100 }`; `numeroActa` entero ≥1
  opcional) + `actaIdValidator`.
- **C9. Router** — 3 rutas nuevas en `proyectos-grado.routes.js` (bajo `/:id`,
  el PDF antes que la genérica `/:id/acta-defensa/:actaId` si se agrega):
  - `GET /:id/acta-defensa` → `verificarPermiso('titulacion.proyecto','DETALLE')`
  - `POST /:id/acta-defensa` → APROBAR
  - `GET /:id/acta-defensa/:actaId/pdf` → EXPORTAR
  - (opcional) `PATCH /:id/acta-defensa/:actaId/anular` → APROBAR
  ⚠️ El GET de acta debe aplicar el **mismo guard de pertenencia** que los
  satélites existentes cuando el usuario es ESTUDIANTE (helpers
  `proyectoTutoriaGuards`) — verificar en implementación cómo lo hace hoy
  `GET /:id` y replicar.
- **C10. PDF**: `infrastructure/external/pdf/titulacion/ActaDefensaPdfGenerator.js`
  extendiendo `IncosPDFLibBase` sobre `Plantilla.pdf` — réplica del §1
  (foliado rojo sup. der., título con modalidad, grilla de cabecera, párrafos
  con negritas inline, título del proyecto entre comillas centrado, lista del
  tribunal, resolución con calificación en número y letras, hora de
  conclusión, 4 firmas). **Calificación en letras**: extraer `_numberToWords`
  de `ReciboPagoPdfGenerator.js` a un helper compartido en
  `infrastructure/external/pdf/` y reusarlo en ambos (si el refactor tocara
  demasiado el recibo, helper local en el generador nuevo con nota TODO de
  unificación).
- **C11. DI**: token `actaDefensaRepository` + `actaDefensaPdfGenerator` +
  use cases + controllers en `container/tokens/titulacion.tokens.js` (y
  `servicios.tokens.js`/`services.container.js` para el generador, patrón
  `formularioModalidadGradoPdfGenerator`) + registro en
  `container/modules/titulacion/proyectos-grado.container.js`.
- **C12. Contrato de endpoints** (fuente de verdad para el frontend):

| Método y ruta | Permiso·Acción | dataFieldName | Notas |
|---|---|---|---|
| `GET /api/v1/proyectos-grado/:id/acta-defensa` | titulacion.proyecto·DETALLE | `actasDefensa` | Array (N actas si PSP); tribunal anidado `tribunal: [{orden, docenteId, nombreCompleto, cargo}]`; guard de pertenencia para ESTUDIANTE |
| `POST /api/v1/proyectos-grado/:id/acta-defensa` | titulacion.proyecto·APROBAR | `actasDefensa` | Body: `{ fechaDefensa, horaInicio, horaConclusion, tribunal[3], calificaciones[{estudianteId, calificacionFinal}], numeroActa?, observaciones? }`. Efecto: crea actas + aplica transición DEFENSA→APROBADO\|REPROBADO |
| `GET /api/v1/proyectos-grado/:id/acta-defensa/:actaId/pdf` | titulacion.proyecto·EXPORTAR | — (binario) | `acta-defensa-{apellidos}-{numeroActa}.pdf`, espejo §1 |
| `PATCH /api/v1/proyectos-grado/:id/acta-defensa/:actaId/anular` (opcional) | titulacion.proyecto·APROBAR | `actaDefensa` | Solo si P8 = sí |

### Bloque E — Documentación

- **E1.** `docs/referencia/matriz-permisos-sistema.md`: changelog + en la
  sección TIT anotar que `titulacion.proyecto` APROBAR/DETALLE/EXPORTAR
  cubren el acta de defensa (rutas nuevas del contrato C12); sin códigos
  nuevos (o la fila `titulacion.acta` si se opta por la Opción B).
- **E2.** `docs/plan/estado-avance-y-proximos-pasos.md`: registrar esta
  extensión TIT (acta de defensa) con su estado por iteración.
- **E3.** Este documento: marcar estado de bloques al cerrar cada iteración
  (patrón del plan de supervisión docente).

---

## ITERACIÓN 2 — frontend + verificación completa

### Bloque D — Frontend (React + AntD 6, ficha del proyecto de grado)

**Ubicación decidida: tab nueva «Acta de defensa» en `ProyectoGradoDetail.jsx`**
(tras «Dictámenes»), sin ruta ni ítem de menú nuevos — el acta es satélite de
la ficha (criterio «ítem de menú = proceso completo»; satélites con
`menu:null`/botones).

- **D1. Endpoints**: `infrastructure/api/endpoints.js` → en
  `PROYECTOS_GRADO_ENDPOINTS` (o equivalente): `ACTA_DEFENSA(id)`,
  `ACTA_DEFENSA_PDF(id, actaId)` (+ `ACTA_DEFENSA_ANULAR(id, actaId)` si P8).
- **D2. Capa application** en
  `application/modules/titulacion/proyectos-grado/`:
  - hooks api: `useActaDefensaApi` (GET, `dataKey: 'actasDefensa'` == C7),
    `useRegistrarActaDefensa` (POST, refresca ficha + actas),
    `useExportActaDefensaPdf` (patrón `useExportFormularioModalidadPdf`).
  - mapper: espejo camelCase del C5 (tribunal ordenado por `orden`,
    `numeroActaFormateado`).
  - state: extender `useProyectoGradoDetailPage` — carga lazy de actas al
    abrir la tab, estado del modal de registro, flags derivados
    (`puedeRegistrarActa = estado === 'DEFENSA' && can(APROBAR)`).
- **D3. Capa presentation** en
  `presentation/modules/titulacion/proyectos-grado/`:
  - `components/organisms/ProyectoActaDefensaSection.jsx`: por acta, vista
    campo a campo espejo del §1 (número de acta como pill `012`, fecha e
    intervalo horario, calificación con resultado APRUEBA en verde /
    REPRUEBA en gris-ámbar — inactivo/negativo nunca rojo puro según sistema,
    tribunal como lista numerada) + botón «Exportar acta (PDF)» gated
    EXPORTAR. `Empty` cuando no hay acta: «Aún no se registró el acta de
    defensa de grado.» — y si el estado es previo a DEFENSA, texto secundario
    explicando el momento del flujo (sin Alert; Alerts con moderación).
  - `components/modals/RegistrarActaDefensaModal.jsx` (patrón
    `AprobarEtapaModal`): DatePicker fecha, TimePickers inicio/conclusión,
    3 filas de tribunal — **Select con búsqueda sobre
    `useDocentesCatalogoTitApi`, sin entrada libre** (P5: tribunal siempre
    docentes del instituto); cargo opcional con default «Tribunal
    Evaluador»), calificación InputNumber 0-100 por estudiante (P3: acta
    individual — en PSP grupal se registra un acta por integrante ACTIVO;
    detalle de UX a resolver en implementación: modal único con una fila de
    nota por integrante, o un registro por integrante), `numeroActa` opcional (ayuda: «Se asigna
    automáticamente el siguiente correlativo de la gestión; indíquelo solo
    para empatar el libro físico.»), resultado mostrado como derivado (no
    editable, contra la nota mínima de `configuracion_evaluacion`). Textos
    en «usted».
  - `ProyectoGradoDetail.jsx`: tab «Acta de defensa» (icono
    `FileDoneOutlined` vía `DetailTabLabel`); cuando `estado === 'DEFENSA'`,
    el CTA principal de la ficha guía a «Registrar acta de defensa»
    (`ActionButton` APROBAR) en lugar de la transición genérica.
- **D4. Interacción con `AprobarEtapaModal`**: en estado DEFENSA, retirar del
  modal genérico las opciones APROBADO/REPROBADO (quedan CANCELADO) y
  enlazar al flujo de acta — la transición ahora la ejecuta el registro del
  acta (el endpoint `/transiciones` sigue permitiéndola en backend, ver P4).
- **D5. Portal del estudiante (opcional, barato)**: `MiProyectoGradoPage`
  reutiliza `ProyectoActaDefensaSection` en modo lectura (DETALLE con guard;
  sin botones de registro; PDF no — ESTUDIANTE no tiene EXPORTAR). Ver P7.

### Bloque F — Seeds y datos de prueba

- **F1.** Sin seeder transaccional. Datos de prueba vía UI/API con un usuario
  DIR_ACADEMICO: llevar un proyecto demo hasta DEFENSA (transiciones T11) y
  registrar su acta (tribunal con 3 docentes del catálogo — P5 resuelta:
  siempre internos, sin externos); un segundo caso REPRUEBA para validar la
  rama.
- **F2.** Resiembra/UPDATE del seed 65 = paso B2 (gated).

### Bloque G — Verificación final (compuerta `verificador`)

1. Lint backend + lint/build frontend.
2. `dataKey == dataFieldName` (`actasDefensa` en GET y POST) contra la API
   real.
3. RBAC 3 capas con DIR_ACADEMICO: tab visible, registrar, exportar PDF; y
   coherencia ruta↔UI↔`verificarPermiso`.
4. **Rol sin permiso**: SEC_ACADEMICA ve el acta y exporta el PDF pero NO ve
   «Registrar acta» y el POST responde 403; DOCENTE (tutor) solo lectura sin
   botón de PDF; usuario sin `titulacion.proyecto` → 403 en los 3 endpoints.
5. ESTUDIANTE: ve su acta solo vía su proyecto (guard anti-IDOR: GET de acta
   de un proyecto ajeno → 403).
6. Máquina de estados: POST de acta con proyecto fuera de DEFENSA → 409;
   tras registrar, `proyectos_grado` quedó con `estado`, `fecha_defensa`,
   `nota_defensa` y `nota_final` sincronizados y el dictamen
   VIABILIDAD_TECNICA emitido (rama APROBADO).
7. Numeración: dos actas seguidas en la misma gestión toman correlativos
   consecutivos; `numeroActa` manual duplicado → 409.
8. PDF comparado lado a lado contra la imagen real (foliado, negritas,
   calificación en letras, 4 firmas).
9. PSP grupal: proyecto con 2 integrantes genera 2 actas con números
   consecutivos y el mismo tribunal.

---

## Grafo de dependencias y compuertas

- **Compuertas de aprobación del usuario:** A1→A2 (trasladar el DDL de este
  doc a `01-schemas/`+`05-migrations/`), A3 (ejecutar en BD, siempre el
  usuario) y B2 (resiembra seed 65). Además, respuestas a P1-P8 antes de
  cerrar C6/C10.
- Orden: **[aprobación DDL] → A2 → C1-C11 → B1 → E → A3 (usuario) →
  [iteración 2: D1-D5 → F1 → G]**.
- Prerrequisito blando: integrar primero los cambios pendientes del working
  tree en `titulacion/` (fixes de menú 2026-08-01) para no pisar
  `ProyectoGradoDetail.jsx` ni `paths.js`.

## Preguntas abiertas al usuario (responder antes de implementar)

- **P1 · Numeración (el «012» rojo) — RESUELTO (provisional 2026-08-01):**
  correlativo **por gestión** (`UNIQUE (gestion_id, numero_acta)`, como se
  propuso). El usuario aclara que esto NO está confirmado institucionalmente
  todavía («no me confirmaron todavía pero creo que es correlativo por
  gestión») — se implementa con este criterio porque el contador vive en una
  columna aislada y es trivial de recalcular/migrar si la confirmación final
  cambia el criterio (histórico o por carrera). No hay libro físico de actas
  que replicar como entidad.
- **P2 · Umbral de aprobación — RESUELTO:** NO se siembra una constante nueva
  `NOTA_MINIMA_APROBACION_DEFENSA`. Se reutiliza la nota mínima YA
  configurada en `configuracion_evaluacion` (seed 54, tabla poblada por el
  seeder 54 — el usuario la referencia como «61» pero el seeder de
  configuración de evaluación es el 54; verificar el código exacto al
  implementar, p. ej. `NOTA_MINIMA_APROBACION` o el que ya consume el
  centralizador/boletín para el estado APROBADO/REPROBADO por asignatura —
  ver `boletinPdfDatos.js` recién tocado por el frente del boletín, que ya
  lee esa política). Mismo criterio que el resto del sistema — sin duplicar
  una segunda fuente de verdad del umbral.
- **P3 · PSP grupal — RESUELTO:** acta **por integrante**, con calificación
  **individual** por estudiante (confirmado: «cada estudiante ingresa a su
  rol y descarga su boletín individual» — el diseño ya propuesto, acta 1:1
  con el estudiante, es el correcto; no hay nota única de grupo).
- **P4 · Transición sin acta — RESUELTO:** **solo se guía por UI en v1**, sin
  bloqueo de servidor. El modal de transición `DEFENSA → APROBADO|REPROBADO`
  sugiere/dirige a registrar el acta primero, pero `POST /:id/transiciones`
  NO lo exige todavía — se puede endurecer en una iteración posterior sin
  romper compatibilidad.
- **P5 · Tribunal — RESUELTO:** **solo docentes del instituto**, sin
  profesionales externos. Simplificar el modelo/UI: quitar el fallback de
  nombre libre sin `docente_id`; los 3 selects del modal de registro son
  siempre un picker de docentes (con su cargo/grado ya en el maestro de
  docentes), no un campo de texto libre.
- **P6 · RBAC — RESUELTO:** Opción A confirmada — reutiliza
  `titulacion.proyecto` (POST/anular = APROBAR, GET = DETALLE, PDF =
  EXPORTAR). Cero permisos nuevos, cero cambios en el seed 65.
- **P7 · Portal del estudiante — RESUELTO:** el estudiante ve calificación y
  resultado del acta en «Mi proyecto», **solo lectura, sin descarga de PDF**
  (el PDF oficial queda para uso administrativo/archivo).
- **P8 · Anulación — RESUELTO:** **se difiere.** El estado `ANULADA` queda
  modelado en el ENUM del DDL (para no migrar el schema después), pero el
  flujo de anular + emitir acta sustituta NO se construye en esta versión —
  un acta emitida queda fija en v1.

**Las 8 preguntas están resueltas — el plan queda listo para implementar en
cuanto el usuario apruebe el DDL del Bloque A** (tablas `actas_defensa` +
`tribunal_acta_defensa`, sin `docente_id` NULL/nombre libre — el tribunal es
siempre un picker de docentes del instituto, ver P5).
