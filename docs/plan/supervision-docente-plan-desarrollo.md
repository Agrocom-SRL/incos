# Fase 3 — Supervisión docente (schema 27, ítem de DOC) — plan de desarrollo

> **Estado: implementado — verificado 2026-10-20.** Comprobado contra el código: iteraciones 1 y 2: `/api/v1/supervision-docente` (vista 174, permiso único `docentes.supervision.ficha` en `60-seed-permisos-doc.sql`) y frontend en `docentes/supervision` con portal docente. Falta: confirmar en BD el schema 27 y la vista 174.


> Plan del `planificador` (2026-07-29), persistido para ejecutar por iteraciones.
> **Entrega por partes:** Iteración 1 = datos + RBAC + backend + documentación
> (bloques A, B, C, E). Iteración 2 = frontend + portal docente + verificación
> completa (bloques D, F, G). Nada se ejecuta en BD sin aprobación explícita.
> Prerrequisito duro: Fase 2 (pasantías) integrada en el repo.

## Correcciones de contexto detectadas (leer antes de implementar)

1. **El seeder DOC ya no es el 59.** La numeración de `02-seeders/` cambió al
   entrar `57-seed-titulacion-modalidades.sql`: el bloque RBAC es hoy 58-MAT,
   59-ACA, **60-DOC**, 61-FIN, 62-INST, 63-REP, 64-CAP, 65-TUT, 66-CFG, 67-SEG.
   El archivo a rediseñar es `backend/database/02-seeders/60-seed-permisos-doc.sql`
   (contiene los 5 códigos legacy `docentes.supervision.*` apagados y el
   `grupo_ui doc_supervision` con `activo=0`). El plan
   `titulacion-y-dominios-pendientes.md` y la matriz aún dicen "seed 59" —
   corregir esas referencias al documentar.
2. **Vistas**: el máximo actual es `165`; la Fase 2 (pasantías) consume desde
   166. Los números de esta fase = siguiente libre tras pasantías, a confirmar
   al implementar (previsiblemente ~168).
3. **Cero referencias legacy en código**: `grep docentes.supervision` en
   `backend/src` y `frontend/src` da vacío — solo rediseñar seed + matriz.
4. **Formulario real verificado**:
   `/Users/miguel/Documents/incos/pasantia/WhatsApp Image 2026-07-22 at 19.36.09.jpeg`
   es la «FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL» y coincide campo a campo
   con el schema 27 (cabecera Docente/Asignatura/Carrera/Curso:Paralelo/Fecha,
   check PRESENCIAL, 4 ítems SI/NO de documentación, 2 cantidades, 7 secciones
   de observación en dos columnas «ESTRUCTURA MÍNIMA DE LA CLASE |
   OBSERVACIONES», OTRAS OBSERVACIONES, firma/sello de la Directora Académica).
   Usarla como espejo del PDF.

**Módulos de referencia por capa** (copiar de ahí, no inventar):

| Capa | Referencia |
|---|---|
| Router/permisos backend | `backend/src/presentation/routes/proyectos-grado.routes.js` (estáticas antes de `/:id`, `verificarPermiso` por acción) |
| Container de recurso | `container/modules/tutorias/proyectos-grado.container.js` + `tutorias/index.js` (tokens scoped, diff mínimo) |
| Endpoints self anti-IDOR | `backend/src/presentation/routes/docentes.routes.js` (`/mis-datos`, `/mis-estudiantes`: gate `[authenticate]` + `resolveDocenteIdForUsuario`) |
| PDF | `infrastructure/external/pdf/tutorias/BitacoraMensualTutorPdfGenerator.js` (patrón `IncosPDFLibBase` + DI vía `SERVICIOS_TOKENS`) |
| Frontend listado+ficha+form sobre asignación docente | `tutorias/acompanamiento/sesiones/` (SesionesList / SesionRefuerzoFormPage / SesionRefuerzoDetail + `useAsignacionesCatalogoTutApi`) |
| Portal docente | `MiHorarioConnector` + tab lazy tipo `UsuarioDetailPage` (tab permisos) |

---

## ITERACIÓN 1 — datos + RBAC + backend + documentación ✅ HECHA (2026-07-30, código en repo)

> **Estado:** A1 (vista **174** `174-vista-supervision-fichas-listado.sql`), B1
> (seed 60 rediseñado: permiso único `docentes.supervision.ficha`), C1-C12
> (backend completo montado en `/api/v1/supervision-docente`) y E1 (matriz)
> ejecutados. **Pendiente de aprobación/ejecución del usuario:** A2 (crear la
> vista 174 en BD) y B2 (resiembra del seed 60). Contrato:
> `dataFieldName: 'fichasSeguimiento'` (GET / y GET /mis-fichas) /
> `'fichaSeguimiento'` (GET /:id, POST /, PUT /:id). Router verificado en seco
> (rutas en orden: /, /mis-fichas, POST /, /:id/pdf, /:id, PUT /:id).
> E2 (titulacion-y-dominios-pendientes.md) quedó fuera: el archivo está siendo
> trabajado por otra tarea en paralelo — anotar la vista 174 allí al retomarlo.

### Bloque A — Datos: vista SQL de listado ⛔ ejecución en BD requiere aprobación

- **A1.** Crear `backend/database/03-views/NNN-vista-supervision-fichas-listado.sql`
  (NNN = siguiente libre tras las vistas de pasantías). Una sola vista final
  delgada (patrón 87, sin monolito):
  - Base: `fichas_seguimiento_clase` (solo `activo=1 AND deleted_at IS NULL`)
    JOIN contexto de `asignaciones_docentes` (docente, materia, carrera,
    paralelo/curso, gestión — **reutilizar** la vista base
    `51-vista-base-docente-asignaciones-curso.sql` o equivalente antes de
    duplicar JOINs; verificar columnas con `grep` primero) + JOIN `usuarios`
    para el evaluador (`supervisor_id` → nombre completo, orden APELLIDOS
    NOMBRES criterio `buildFullName`).
  - Columnas: `id`, `fecha_seguimiento`, docente, asignatura, carrera,
    curso/paralelo, evaluador, y **resultado derivado** — el schema no tiene
    columna resultado: exponer `docs_completos` (COUNT de los 4 booleanos
    `tiene_*` en SI, formato «n/4») + `estudiantes_asistentes` /
    `estudiantes_en_planilla`. NO incluir los 9 TEXT de observaciones.
- **A2.** Ejecutar la vista en BD — **solo con aprobación explícita**.

### Bloque B — RBAC: rediseño del bloque supervisión en seed 60 ⛔ resiembra requiere aprobación

- **B1.** Editar `backend/database/02-seeders/60-seed-permisos-doc.sql`
  (rediseñar, NO crear seeder nuevo):
  1. `grupos_ui`: mantener `doc_supervision` («Supervisión», dominio DOCENTES,
     orden 3) y **sacarlo** del UPDATE de deshabilitación final (queda
     `activo=1`; el grupo `doc_licencias` fue retirado del seed al eliminarse las licencias docentes).
  2. Permisos: **eliminar** los 5 códigos legacy (`docentes.supervision.evaluar`,
     `.reporte`, `.programar`, `.ficha.crear`, `.ficha.editar`) y sus filas.
     **Crear un único permiso** `docentes.supervision.ficha` («Supervisión:
     fichas de seguimiento en clase»), `grupo_ui='doc_supervision'`,
     `ruta_sidebar='/docentes/supervision'`, `activo=1`.
  3. `permiso_acciones`: LISTAR, DETALLE, CREAR, EDITAR, EXPORTAR (vocabulario
     cerrado; sin ELIMINAR ni APROBAR — la ficha realizada no se borra).
  4. `roles_permisos`: DIR_ACADEMICO y RECTOR con las 5 acciones. **DOCENTE:
     sin filas** — ve sus fichas por wrapper self. ADMIN_SISTEMA hereda.
  5. Actualizar el comentario del bloque de deshabilitación.
- **B2.** Resembrar el seed 60 en BD — **con aprobación explícita**.

### Bloque C — Backend (monta en `/api/v1/supervision-docente`)

- **C1. Modelo**: `infrastructure/database/models/ficha_seguimiento_clase.js`
  (réplica del schema 27, soft-delete/auditoría) + registro y asociación
  `belongsTo(asignacion_docente)` en `models/index.js`.
- **C2. Interfaces**: `IFichaSeguimientoClaseRepository` (arquetipo A, extiende
  IRepository) · `IFichaSeguimientoListadoViewRepository` (arquetipo B, solo
  lectura, NO extiende IRepository) · `services/IFichaSeguimientoClasePdfGenerator`.
- **C3. Repo CRUD**: `infrastructure/repositories/FichaSeguimientoClaseRepository.js`.
- **C4. Repo de vista**: `repositories/views/FichaSeguimientoListadoViewRepository.js`
  (vista NNN; filtros: `docenteId`, `gestionId`, rango de fechas, búsqueda).
- **C5. Mapper**: `application/mappers/docentes/FichaSeguimientoMapper.js` —
  `toListItem`, `toDetail`, `toPersistence` (`supervisor_id` = `req.usuario.id`,
  jamás del cliente).
- **C6. Use cases** en `application/use-cases/docentes/supervision/`:
  `ListFichasSeguimientoUseCase`, `GetFichaSeguimientoByIdUseCase`,
  `CreateFichaSeguimientoUseCase` (valida asignación vigente; fija supervisor
  de la sesión), `UpdateFichaSeguimientoUseCase`,
  `ListMisFichasSeguimientoDocenteUseCase` (`resolveDocenteIdForUsuario`, 403
  si no es docente), `ExportFichaSeguimientoPdfUseCase`.
- **C7. Controllers** en `presentation/controllers/docentes/supervision/`:
  - `dataFieldName: 'fichasSeguimiento'` → GET `/` y GET `/mis-fichas`.
  - `dataFieldName: 'fichaSeguimiento'` → GET `/:id`, POST `/`, PUT `/:id`.
  - PDF: descarga binaria `ficha-seguimiento-{apellidos}-{fecha}.pdf`.
- **C8. Validators** en `presentation/validators/docentes/` (list/create/update;
  fecha requerida; booleanos SI/NO opcionales; cantidades enteras ≥0).
- **C9. Router**: `presentation/routes/supervision-docente.routes.js`:
  - `GET /` → `verificarPermiso('docentes.supervision.ficha','LISTAR')`
  - `GET /mis-fichas` → **solo `[authenticate]`** (patrón `misDatosDocente`) —
    **ANTES de `/:id`**
  - `POST /` → CREAR · `GET /:id` → DETALLE · `PUT /:id` → EDITAR ·
    `GET /:id/pdf` → EXPORTAR
- **C10. PDF**: `infrastructure/external/pdf/docentes/FichaSeguimientoClasePdfGenerator.js`
  extendiendo `IncosPDFLibBase` — réplica del formulario real (membrete +
  título, grilla de cabecera, check PRESENCIAL, tabla dos columnas con las 9
  secciones, OTRAS OBSERVACIONES, pie «DIRECTORA ACADÉMICA»). Token en
  `servicios.tokens.js` + `services.container.js` (patrón
  `bitacoraMensualTutorPdfGenerator`).
- **C11. DI**: ampliar `container/tokens/docentes.tokens.js` + crear
  `container/modules/docentes/supervision.container.js`, registrado desde
  `container/modules/docentes/index.js`.
- **C12. Rutas**: `presentation/routes/index.js` — montar
  `/supervision-docente` + entrada en el índice de APIs. ⚠️ archivo tocado por
  Fase 2: resolver sobre el estado post-merge.

### Bloque E — Documentación

- **E1.** `docs/referencia/matriz-permisos-sistema.md`: changelog + reescribir
  `### DOC - Docentes y supervision`: permiso único `docentes.supervision.ficha`
  (LISTAR/DETALLE/CREAR/EDITAR/EXPORTAR), ruta `/docentes/supervision`,
  operadores REC/DIRA (+ADM por herencia), nota del wrapper self
  (`/mis-fichas`); retirar los 5 códigos legacy y `docentes.supervision.pasantia`;
  corregir «seed 59» → `60-seed-permisos-doc.sql`. ⚠️ post-merge de Fase 2.
- **E2.** `docs/plan/titulacion-y-dominios-pendientes.md`: marcar avance de
  Fase 3 y anotar el número de vista definitivo.

---

## ITERACIÓN 2 — frontend + portal + verificación completa ✅ HECHA (2026-07-31)

> **Estado:** D1-D5 completos (endpoints, capa `application/modules/docentes/supervision/`
> espejo de sesiones, capa `presentation/modules/docentes/supervision/` con
> List/Form/Detail + `FichaSeguimientoFichaView` compartida, rutas
> `/docentes/supervision*` insertadas ANTES de `/docentes/:id`, tab
> "Supervisión" lazy en `DocentesDetail.jsx`). F1: 3 fichas de prueba creadas
> vía API con un usuario DIR_ACADEMICO (`dir_academico_qa`), 2 de ellas
> vinculadas al docente demo (`docente`/`12345678`, docente_id=1 Camacho
> Ybeth). G: build + lint limpios, `dataKey`==`dataFieldName` verificado contra
> la API real (ambos formatos, aplanado y anidado), RBAC verificado en 3 capas
> (permiso, `PrivateRoute`+menú, backend 403), PDF exportado y comparado contra
> la foto real. **Hallazgo a escalar — RESUELTO 2026-08-07:** el usuario
> decidió dar acceso completo. `ListMisFichasSeguimientoDocenteUseCase` ahora
> batchea la entidad raíz (`fichaSeguimientoClaseRepository.findAll({ ids })`,
> nuevo soporte `ids` en `buildWhereClause` vía `Op.in`, mismo idioma que
> `BimesterEvaluationRepository`/`AttendanceRepository`) por los ids que ya
> resuelve la vista 174 (contexto + anti-IDOR), y los mezcla con
> `FichaSeguimientoMapper.toDetail` (misma función que usa `GET /:id`) — el
> docente lee ahora el feedback textual completo de sus propias fichas, sin
> permiso nuevo. Cero cambio de frontend: `FichaSeguimientoFichaView.jsx` ya
> tenía el flag `tieneDetalleCompleto` construido para esto, ahora se activa
> solo. Verificado: eslint limpio, dry-run del contenedor DI (token resuelve
> con la nueva dependencia inyectada), `vite build` sin errores, smoke test
> aislado con repos mockeados (3 casos: 2 fichas con detalle completo, 0
> fichas sin llamar `findAll` (evita `IN ()` vacío), entidad borrada entre
> queries se omite sin romper). No se tocó BD ni RBAC.

### Bloque D — Frontend (React + AntD 6, módulo DOC + portal docente)

- **D1. Endpoints**: `infrastructure/api/endpoints.js` →
  `SUPERVISION_DOCENTE_ENDPOINTS = { BASE, MIS_FICHAS, BY_ID(id), PDF(id) }`.
- **D2. Capa application** en `application/modules/docentes/supervision/`
  (espejo de `tutorias/acompanamiento/sesiones/`): `config/paths.js`
  (`SUPERVISION_LIST_PATH='/docentes/supervision'`, `DOC_SUPERVISION_MENU_KEY`),
  contexts, hooks api (`useFichasSeguimientoApi`, `useGetFichaSeguimiento`,
  `useFichaSeguimientoMutations`, `useExportarFichaPdf`,
  `useMisFichasSeguimientoApi`, `useAsignacionesCatalogoDocApi` — reutiliza
  `GET /asignaciones-docentes`, degrada sin el permiso INST), mapper con
  **`dataKey: 'fichasSeguimiento'` / `'fichaSeguimiento'`** (== C7), hooks
  state + providers.
- **D3. Capa presentation** en `presentation/modules/docentes/supervision/`:
  `config/fichasSeguimientoTableColumns.jsx` (fecha, docente APELLIDOS NOMBRES,
  asignatura, carrera·paralelo, evaluador, resultado como pill «docs n/4 ·
  asistencia a/p»; `TableActions` con permiso `docentes.supervision.ficha`),
  organismos `FichaSeguimientoFormSections.jsx` (select de curso del catálogo
  de asignaciones + fecha; switches SI/NO; InputNumber; TextAreas) y
  `FichaSeguimientoFichaView.jsx` (lectura campo a campo, **reutilizado** por
  Detail y portal — patrón páginas gemelas), pages
  (List/FormPage/Detail con Exportar PDF gated por EXPORTAR), connectors.
  Textos en «usted»; Alerts con moderación.
- **D4. Rutas y menú**: `presentation/modules/docentes/routes.jsx` — insertar
  **antes de `/docentes/:id`** (crítico): `/docentes/supervision` → key
  `DOC-SUPERVISION`, permiso `docentes.supervision.ficha` LISTAR,
  `menu: { label: 'Supervisión docente', module: 'DOC', parent: 'DOC', order: 3 }`;
  `/registrar` (CREAR), `/:id/editar` (EDITAR), `/:id` (DETALLE) con
  `menu: null`, `breadcrumbParent: 'DOC-SUPERVISION'`. Icono `'DOC-SUPERVISION'`
  en `menuIcons.js` (p.ej. `AuditOutlined`).
- **D5. Portal del docente**: nueva tab «Supervisión» en `DocentesDetail.jsx`,
  visible solo cuando `esMiFicha` (`esDocente(usuario)`), lazy con
  `useMisFichasSeguimientoSection` → `GET /supervision-docente/mis-fichas`;
  tabla simple + vista read-only con `FichaSeguimientoFichaView`. Sin permisos
  nuevos para DOCENTE. `Empty`: «Aún no tiene fichas de seguimiento registradas.»

### Bloque F — Seeds y datos de prueba

- **F1.** Sin seeder transaccional. Datos de prueba: 2–3 fichas vía UI/API con
  DIR_ACADEMICO sobre asignaciones vigentes; al menos una para el docente demo
  (`docente/12345678`) para probar el portal.
- **F2.** Resiembra del seed 60 = paso B2 (gated).

### Bloque G — Verificación final (compuerta `verificador`)

1. Lint backend + lint/build frontend.
2. dataKey == dataFieldName (`fichasSeguimiento`/`fichaSeguimiento`).
3. RBAC 3 capas con DIR_ACADEMICO (menú, listado, crear, editar, detalle, PDF
   contra la foto del formulario).
4. Rol sin permiso: menú ausente, `PrivateRoute` bloquea, API → 403.
5. Docente demo: NO ve menú Supervisión; tab «Mi ficha» con solo SUS fichas;
   `/mis-fichas` con usuario no-docente → 403 (anti-IDOR).
6. `/docentes/supervision*` resuelve antes que `/docentes/:id`.

## Grafo de dependencias y compuertas

- **Prerrequisito duro:** Fase 2 (pasantías) integrada en el repo.
- **Compuertas de aprobación del usuario:** A2 (vista en BD) y B2 (resiembra 60).
- Orden: A1 → C1-C12 (C4 tras A1) → B1 → E → [iteración 2: D1-D5 →
  aprobación A2+B2 → F1 → G].
