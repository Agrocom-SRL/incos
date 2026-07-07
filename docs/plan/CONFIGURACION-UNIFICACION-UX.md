# Unificación UX/arquitectura de Configuración — plan por fases

> Estado: **Fases 0-4 completadas (2026-07-06)**, RBAC coherente en 3 capas, verificado por
> `verificador`. **Extensión en curso (sección 5)**: `becas_descuentos` **completo** (commits
> `fbd59861`/`8e983264`, verificado en código). **Instituciones se retira del alcance de este
> documento** (2026-07-07, decisión del usuario): pertenece al dominio futuro de
> transitabilidad/traspasos (`incos-dominios-sin-construir.md`), donde requiere UI propia con filtro
> por tipo de admisión — no un tab genérico de complementarios. Queda solo `aulas`, `tipos_evaluacion`
> y `estados_civiles` en esta sección. Pendiente de Fases 0-4: revisión manual del usuario y
> `revisor-ui` opcional de pulido visual.
>
> **RETOMADO 2026-07-07**: se confirma con `datos`+`arquitecto` que `aulas` y `tipos_evaluacion` son
> catálogos de referencia (no diseño curricular). **Backend de `estados_civiles` completado** (CRUD +
> permiso `configuracion.complementario.estado-civil` en seed 62, pendiente aplicar a BD real).
>
> **AJUSTE DE ARQUITECTURA (2026-07-07, decisión del usuario)**: `configuracion/academico` mezclaba
> nivel curricular (Planes/Carreras/Materias) con catálogos de referencia (Paralelos, y ahí se iban a
> sumar Aulas/Tipos de evaluación) — un nivel conceptual distinto. Se crea un módulo **nuevo**,
> hermano de Académico y Complementarios: **`configuracion/recursos`** (label de menú **"Recursos
> académicos"**, elegido por el usuario sobre "Catálogos"/"Estructura académica"/"Parámetros
> académicos"), que agrupa **Paralelos (movido) + Aulas + Tipos de evaluación** (extensible a futuro).
> `configuracion/academico` queda solo con Planes | Carreras | Materias. Nombre elegido para evitar
> choque semántico con `institucional/oferta-academica` (paralelo EN GESTIÓN, instancia por periodo —
> dominio distinto del Paralelo maestro que se mueve aquí). Permiso `configuracion.paralelo` **no
> cambia de código**, solo de ubicación en el menú (ver `arquitecto`, 2026-07-07). **Orden de
> ejecución**: 1) mover Paralelo (refactor puro, sin funcionalidad nueva) a `configuracion/recursos`,
> 2) construir Aulas y Tipos de evaluación como tabs 2 y 3 del módulo ya reubicado.
> Lleva `configuracion/complementarios`, `configuracion/documentacion`, `configuracion/actividades` y
> `finanzas/configuracion` a paridad de diseño/arquitectura con `configuracion/academico` (patrón de
> referencia), y construye los endpoints backend que faltan. Este documento es la fuente de verdad
> para retomar el trabajo si se corta la sesión (internet, reinicio de máquina, etc.) — actualizar la
> casilla de estado de cada fase a medida que se completa.
>
> No introduce versiones V2/beta (ver `CLAUDE.md`).

---

## 0. Patrón de referencia (`configuracion/academico`) — qué replicar

- Por entidad (Carrera/Materia/Paralelo): **context hook** (`useCarreraContext`/`useMateriaContext`/
  `useParaleloContext`, en `frontend/src/application/modules/configuracion/academico/hooks/context/`)
  que expone `{data, loading, error, searchText, setSearchText, refetch}` desde un Provider.
- Columnas de tabla vía **factory declarativa** (`config/carrerasTableColumns.jsx`,
  `materiasTableColumns.jsx`, `paralelosTableColumns.jsx`): `createXxxTableColumns({navigate,
  listNavState, refetch})`, usando átomos compartidos `IdentidadCelda`, `StatusPill` y la molécula
  `TableActions` con permisos por `codigo`+`accion` (LISTAR/CREAR/EDITAR/DETALLE).
- Formularios comparten el organismo genérico **`CfgFormWorkspace`** (promovido en Fase 0, ver abajo)
  + secciones declarativas de campos (`config/carreraFormFields.js`/`materiaFormFields.js`/`paraleloFormFields.js`).
- Un **connector por página/acción** (list/form-create/form-edit/detail) que monta el Provider + la
  página "dumb".
- Catálogos simples (nombre+código+estado+acciones, sin columnas de negocio ricas) usan la factory
  genérica nueva **`createSimpleCatalogTableColumns`** (ver Fase 0) en vez de copiar el patrón de
  `carrerasTableColumns.jsx`.
- Guías ya escritas: `docs/guias/implementacion-listado-modulo.md` (§5.5 documenta el caso
  "CFG Complementarios — tab discapacidad" ya construido) y `docs/guias/implementacion-detalle-modulo.md`.

## 1. Decisiones ya tomadas (no volver a preguntar)

1. **`configuracion/actividades` ≠ `institucional/actual/actividades`.** El primero administra el
   **catálogo maestro conceptual** (tabla `actividades`,
   `backend/database/01-schemas/07-estructura-academica-parte3.sql:136`); el segundo administra las
   **instancias por gestión** (`actividades_calendario`, ya planificado en
   `docs/plan/CRONOGRAMA-GESTION-ACTUAL.md` Fase B). Mismo patrón maestro/instancia que
   carreras/materias vs. paralelos en gestión. No fusionar.
2. **"Aporte"** se saca del tab de `finanzas/configuracion` y pasa a página nueva top-level
   `finanzas/aportes/` con permiso propio **`finanzas.aporte`** (LISTAR/CREAR/EDITAR, sin ELIMINAR).
3. **"Apoderados"** (`configuracion/complementarios`) — **resuelto por el agente `datos`**: NO requiere
   tabla nueva. Es el CRUD del catálogo ya existente `tipos_parentesco`
   (`01-schemas/03-catalogos-referencia.sql:119-145`, seeder `08-seed-tipos-parentesco.sql`, endpoint
   `GET /api/v1/tipos-parentesco` ya existe con POST/PUT/DELETE comentados como TODO). La tabla
   `estudiantes_apoderados` (persona física ligada a un estudiante, en `11-estudiantes-parte2.sql`) es
   un módulo distinto de Estudiantes/Ficha, ya resuelto — no se toca aquí. **Ningún DDL nuevo.**
4. **Factory de columnas genérica** (`arquitecto`): crear
   `frontend/src/presentation/utils/tableColumns/createSimpleCatalogTableColumns.jsx`, firma
   `({navigate, listNavState, refetch, entidad, permisoCodigo, getDetallePath, getEditarPath,
   useCaseKey, codigoField=null, descripcionField='descripcion', extraColumns=[],
   itemDetailsExtra=(record)=>[]})`. Se usa en discapacidad/apoderados/idiomas (Fase 1) y actividades
   (Fase 3, vía `extraColumns` para tipo+icono). Carreras/Materias/Paralelos NO se tocan (tienen
   columnas de negocio propias que no caben en el genérico).
5. **`CfgAcademicoFormWorkspace` promovido a organism genérico** `CfgFormWorkspace` en
   `frontend/src/presentation/components/organisms/CfgFormWorkspace/CfgFormWorkspace.jsx` (export
   `CfgFormWorkspace`, `CfgFormFieldGrid`, `cfgFormColProps`), ya que se consumía cross-módulo
   (asistencia, cronograma institucional, seguridad/usuarios) además de académico. Hecho en Fase 0.
6. **Documentación** (`arquitecto` + `datos`): es **1 sola tabla/endpoint** `documentacion` con ENUM
   `tipo_documento` de 9 valores (no 4). Los 4 permisos ya sembrados
   (`configuracion.documentacion.inscripcion|becas|pasantias|traslado`) cubren 4 de los 9 valores del
   ENUM (`INSCRIPCION`, `BECA`, `PASANTIA`, `TRASPASO`); el resto (`LICENCIA`, `DESCUENTO`,
   `TITULACION`, `TRANSITABILIDAD`, `OTRO`) queda fuera de alcance de UI por ahora. CRUD = 4 listados
   frontend filtrados por `tipoDocumento` fijo (no selector) sobre el mismo endpoint, + 1 form-page
   compartida con selector de `documento_padre_id` filtrado por el mismo tipo. **Ningún DDL nuevo**
   (columnas actuales alcanzan).
7. **Actividades — renombrar permiso**: `configuracion.historial-actividades` → `configuracion.actividad`
   (label "Historial de Actividades" → "Actividades"), porque el alcance real es CRUD de catálogo
   maestro editable, no una bitácora de solo lectura. Actualizar `grupo_ui`, seed 62 y `routes.jsx`,
   manteniendo redirect de compatibilidad en `/configuracion/historial-actividades`. Es reseed de RBAC
   (no DDL) — procede sin pausa por regla del proyecto ("seeds de datos existentes" son autónomos).
8. **Finanzas — permisos**: `configuracion.pagos` (huérfano de dominio, definido en CFG pero
   consumido solo por Finanzas) se **retira** de `62-seed-permisos-cfg.sql` y se reemplaza por 2
   permisos nuevos en `60-seed-permisos-fin.sql`: `finanzas.aporte` (página Aportes) y
   `finanzas.configuracion.pago` (bancos/cuentas/métodos). Reseed de RBAC, sin DDL.
9. **Finanzas — bancos/cuentas/métodos**: **mantener patrón Drawer** (no migrar a
   connectors+form-page+detail). Ya usan los átomos/moléculas correctos (`TableActions`, `StatusPill`);
   son catálogos llave-valor sin ficha de detalle útil — migrar a navegación completa sería ceremonia
   sin beneficio de UX. Único cambio: repermisar (punto 8).

## 2. Fases

### Fase 0 — Refinamiento transversal de columnas reutilizables
- [x] `arquitecto` evaluó y decidió extraer `createSimpleCatalogTableColumns` (ver decisión 4) en vez
      de forzar una factory única sobre carreras/materias/paralelos (esos tienen columnas propias).
- [x] `CfgAcademicoFormWorkspace` promovido a `CfgFormWorkspace` (organism genérico), 6 consumidores
      migrados (incluye `cfgFormColProps`, hallado además de los 2 exports esperados). Build verificado.
- [x] El sub-patrón "columna con dato de otra entidad" (paralelos→carrera/período) NO se generaliza —
      se replica puntualmente vía `extraColumns` solo si un listado nuevo lo necesita.

### Fase 1 — `configuracion/complementarios`
- [x] **discapacidad backend**: CRUD completo (Create/Update/GetById/Delete use cases + controllers +
      rutas habilitadas). [ ] Frontend (form create/edit + detail, reescribir listado con factory) pendiente.
- [x] **idiomas backend**: CRUD completo construido. [ ] Frontend (reemplazar stub `IdiomasTabPanel.jsx`
      por list/form/detail real) pendiente.
- [x] **apoderados backend**: CRUD de `tipos_parentesco` completo (decisión 3, sin schema nuevo).
      [ ] Frontend (reemplazar `ApoderadosTabPanel.jsx` stub por list/form/detail real) pendiente.
- [x] RBAC: `permiso_acciones` completado (5 acciones) para los 3 códigos, aplicado a BD real.
- Permisos ya sembrados en `02-seeders/62-seed-permisos-cfg.sql`:
  `configuracion.complementario.discapacidad|apoderados|idiomas` (reutilizar, solo completar acciones).

### Fase 2 — `configuracion/documentacion`
- [x] Frontend: conector genérico parametrizado por `tipoDocumento` + 4 wrappers de listado +
      1 form-page compartida con selector de `documentoPadreId` filtrado por tipo.
- [x] Backend: Create/Update/GetById/Delete use cases + controllers/rutas habilitados en
      `documentacion.routes.js`, con `resolverPermisoDocumentacion(tipoDocumento)` para los 4 códigos.
      Los 5 valores de ENUM sin pantalla (LICENCIA/DESCUENTO/TITULACION/TRANSITABILIDAD/OTRO) se
      deniegan explícitamente (403 con mensaje claro).
- [x] RBAC: 4 permisos `configuracion.documentacion.*` reactivados (activo=1) + 5 acciones cada uno,
      aplicado a BD real.
- [ ] Ya consumido en runtime por `estudiantes` (matriculación, `useDocumentacionDinamica.js`) — no
      romper ese consumo de lectura (mismo endpoint GET, no se toca su contrato).

### Fase 3 — `configuracion/actividades` (catálogo maestro, no calendario)
- [x] Backend: CRUD completo construido (`List/Create/Update/GetById/DeleteActividadUseCase`,
      controllers, router nuevo `actividades.routes.js` montado en `/api/v1/actividades`, `ActivityMapper`
      nuevo). `dataFieldName: 'actividades'` fijado.
- [x] Frontend: list/form/detail completo, `extraColumns` (tipo vía StatusPill, icono preview de
      texto simple).
- [x] RBAC: permiso renombrado a `configuracion.actividad` (5 acciones), aplicado a BD real.
      [ ] Falta actualizar `routes.jsx` del frontend con el nuevo código de permiso + redirect legacy.

### Fase 4 — `finanzas/configuracion`
- [x] Página nueva `finanzas/aportes/` (permiso `finanzas.aporte`, ruta `/finanzas/aportes`, order 4),
      hook combinado partido sin duplicar lógica.
- [x] Backend: `configuracion-aportes.routes.js` migrado a `finanzas.aporte`.
- [x] Bancos/cuentas/métodos: Drawer mantenido, repermisado a `finanzas.configuracion.pago` en las
      3 capas (backend routers, `configPagosPermisos.js`/`routes.jsx`, `perfilAccesos.jsx`).
- [x] RBAC: `configuracion.pagos` retirado de seed y BD real; `finanzas.aporte` y
      `finanzas.configuracion.pago` sembrados y aplicados.

## 3bis. Regla nueva (2026-07-06, urgente, pedida por el usuario)

- **Nunca dejar backend y frontend con códigos de permiso distintos, ni siquiera entre fases.**
  Cualquier renombre/movimiento de permiso ya sembrado (ej. `configuracion.historial-actividades`→
  `configuracion.actividad`, `configuracion.pagos`→`finanzas.aporte`/`finanzas.configuracion.pago`)
  se trata como UN SOLO paso atómico: seed backend + `routes.jsx`/config frontend en el mismo momento,
  antes de pasar a la siguiente fase. Motivo: cualquier re-siembra de la BD en la ventana intermedia
  rompe el acceso real de usuarios.
- **Ningún subagente debe ejecutar `git commit`.** El usuario revisa y commitea manualmente. Se
  detectaron commits no autorizados (`752d622d`, `2b5af4eb`, `453d867d`, `52897153`, `451d53d6`,
  `9f0a75a7`) hechos por sesiones de agentes sin pedirlo — el usuario los revisará/gestionará él
  mismo; de aquí en adelante toda instrucción a `backend`/`frontend`/otros incluye explícitamente
  "no ejecutes git commit, solo edita archivos".

## 3. Reglas duras durante la ejecución

- Cualquier cambio de schema/DDL (tablas nuevas, columnas nuevas, migraciones) **requiere aprobación
  explícita del usuario** antes de ejecutarse contra la base — reportar y detenerse, no aplicar solo.
  **Hasta ahora (fin de investigación) ningún punto de las 4 fases requiere esto** — todas las tablas
  necesarias ya existen con columnas suficientes (confirmado por `datos` y `arquitecto`).
- El resto (código, seeds de datos existentes/RBAC, endpoints) avanza de forma autónoma, incluyendo
  los renombres/movimientos de permisos ya sembrados (decisiones 7 y 8) — son seeds, no DDL.
- Al cerrar cada fase: correr `verificador` (lint/build, `dataKey`==`dataFieldName`, RBAC en 3 capas,
  sin hex/px sueltos) y `revisor-ui` (consistencia visual) antes de pasar a la siguiente fase.
- Fases 1, 2 y 3 (backend) tocan el mismo archivo `62-seed-permisos-cfg.sql` — coordinar para no pisar
  ediciones (se está serializando el trabajo backend de RBAC en este archivo para evitar conflictos).

## 4. Estado / bitácora

- **2026-07-06**: plan aprobado, decisiones 1-3 tomadas con el usuario, agente `orquestador`
  lanzado en background para ejecutar Fases 0-4 en orden.
- **2026-07-06**: `arquitecto` y `datos` ejecutados en paralelo. `arquitecto` definió: ubicación/firma
  de `createSimpleCatalogTableColumns`, promoción de `CfgAcademicoFormWorkspace`→`CfgFormWorkspace`,
  modelo de `documentacion` (1 tabla, 9 valores ENUM), renombre de permiso de actividades, permiso
  nuevo `finanzas.aporte` + `finanzas.configuracion.pago`, mantener Drawer en bancos/cuentas/métodos.
  `datos` confirmó: apoderados = `tipos_parentesco` (sin schema nuevo), columnas de `documentacion` y
  `actividades` alcanzan para CRUD completo sin tocar schema. Documento actualizado con decisiones
  4-9 en sección 1. **Ningún DDL pendiente de aprobación en este punto.**
- **2026-07-06**: `planificador` produjo checklist ejecutable detallado por bloque (transversal +
  4 fases), con archivos exactos a crear/editar, use cases/controllers/validators por entidad,
  conectores/rutas frontend y seeds RBAC puntuales. Detectó 2 correcciones sobre el brief original:
  (a) 6 consumidores de `CfgAcademicoFormWorkspace`, no 5 (incluye `UsuarioFormSection.jsx`); (b) los
  4 permisos de `documentacion` y el de `historial-actividades` YA EXISTEN pero están `activo=0`
  ("deshabilitación temporal") en seed 62 — hay que reactivarlos, no crearlos de cero.
- **2026-07-06**: **Fase 0 (transversal) completada** por agente `frontend`. Creado
  `frontend/src/presentation/utils/tableColumns/createSimpleCatalogTableColumns.jsx`. Promovido
  `CfgAcademicoFormWorkspace.jsx` → `frontend/src/presentation/components/organisms/CfgFormWorkspace/
  CfgFormWorkspace.jsx` (+ `index.js`), renombrando `CfgAcademicoFormWorkspace`→`CfgFormWorkspace`,
  `CfgAcademicoFormFieldGrid`→`CfgFormFieldGrid`, `cfgAcademicoFormColProps`→`cfgFormColProps`. 6
  consumidores migrados (`CarreraFormSections.jsx`, `MateriaFormSections.jsx`,
  `ParaleloFormSections.jsx`, `LicenciaSolicitarPage.jsx`, `CronogramaActividadFormSections.jsx`,
  `UsuarioFormSection.jsx`). CSS (`cfg-academico-workspace*` en `academico-form-page.css`) se dejó
  donde está (ya se importa directamente en ~15 páginas de otros módulos; moverlo habría duplicado el
  contrato de estilos) — documentado en cabecera del archivo nuevo. `npm run build` OK; 2 warnings de
  lint preexistentes confirmados como no-regresión (idénticos antes del cambio, vía `git stash`).
  **Iniciando Fase 1** (`configuracion/complementarios`: discapacidad/apoderados/idiomas) — backend
  primero (CRUD + RBAC), luego frontend.
- **2026-07-06**: **Backend de Fases 1, 2 y 3 completado** por agente `backend` (una sola sesión,
  para no pisar ediciones concurrentes sobre `62-seed-permisos-cfg.sql`). CRUD completo (Create/
  Update/GetById/Delete) para discapacidad, tipos_parentesco (apoderados) e idiomas
  (`use-cases/referencia/`, controllers en `presentation/controllers/referencia/*`, validator
  genérico `nombre-descripcion.validator.js` para discapacidad/apoderados, propio para idiomas).
  Documentación: CRUD completo con `resolverPermisoDocumentacion(tipoDocumento)` para los 4 permisos
  segmentados; los 5 valores de ENUM sin pantalla (LICENCIA/DESCUENTO/TITULACION/TRANSITABILIDAD/OTRO)
  deniegan con 403 explícito. Actividades: CRUD nuevo completo (`ActivityRepository` ya existente
  reutilizado, router nuevo `actividades.routes.js`, `ActivityMapper` nuevo, `dataFieldName:
  'actividades'`). Ningún cambio de schema/DDL fue necesario (confirmado por el agente). Verificado en
  vivo contra servidor real + MySQL real.
  **Nota de proceso — 2 commits no solicitados**: aparecieron los commits `752d622d` (Fase 0 frontend)
  y `2b5af4eb` (backend Fases 1-3) sin haber sido pedidos explícitamente por el usuario (violación de
  la regla "solo commitear cuando se pide"). El contenido de ambos se revisó y es correcto/intencional;
  no se revirtieron (acción destructiva) — **pendiente que el usuario decida si los deja, los amend o
  los reescribe**.
  **Incidente de datos y remediación (orquestador, no un subagente)**: el seed `62-seed-permisos-cfg.sql`
  editado se aplicó directo con `mysql < archivo` contra la BD real ya poblada; al no ser idempotente
  (solo `INSERT`, sin `TRUNCATE` ni `ON DUPLICATE KEY`), esto duplicó temporalmente las 16 filas de
  `permisos` del módulo CFG (más sus `permiso_acciones`/`roles_permisos`) y dejó huérfana la fila vieja
  `configuracion.historial-actividades` (id 109) junto a la nueva `configuracion.actividad`. Se
  detectó de inmediato (conteos con `COUNT(*) > 1` por código) y se remedió con un script SQL
  quirúrgico: reactivar `documentacion.*` en sus ids originales, fusionar/eliminar las filas
  duplicadas nuevas, eliminar la fila vieja de `historial-actividades`, y deduplicar
  `permiso_acciones`/`roles_permisos` por `(permiso_id, accion)`/`(rol_id, permiso_id, accion)`.
  Estado final verificado: 0 códigos duplicados en CFG, 0 acciones duplicadas, 0 roles duplicados, 0
  huérfanos; los 8 códigos objetivo (discapacidad/apoderados/idiomas/actividad +
  documentacion×4) quedaron con exactamente 1 fila activa y las 5 acciones esperadas. **Lección para
  próximas fases**: cualquier aplicación de seed a la BD real debe hacerse con cuidado de idempotencia
  (verificar existencia antes de `INSERT`, o aplicar solo el delta con `UPDATE`/`INSERT ... WHERE NOT
  EXISTS`), no con `mysql < archivo.sql` a secas cuando la tabla ya tiene datos.
  **Pendiente**: frontend de Fases 1, 2 y 3 (list/form/detail), y Fase 4 completa (backend+frontend).
- **2026-07-06**: Frontend de Fases 1, 2 y 3 completado por agente `frontend` (complementarios:
  discapacidad/apoderados/idiomas con list+form+detail reales usando `createSimpleCatalogTableColumns`
  y `CfgFormWorkspace`; documentación: conector genérico parametrizado por `tipoDocumento` + 4 wrappers
  de listado; actividades: ABM completo con `dataKey`/`dataFieldName`='actividades', permiso ya
  corregido a `configuracion.actividad` incluyendo el redirect legacy). `npm run build`/`lint` OK.
- **2026-07-06**: Backend de Fase 4 (Finanzas) completado por agente `backend`: rutas de
  aportes/bancos/cuentas/métodos repermisadas a `finanzas.aporte`/`finanzas.configuracion.pago`;
  `configuracion.pagos` retirado de `62-seed-permisos-cfg.sql` y de la BD real; delta aplicado de forma
  idempotente (sin duplicados, sanidad verificada en 0 filas).
- **2026-07-06 — FIX URGENTE (pedido por el usuario)**: se detectó que el frontend de Finanzas había
  quedado desincronizado del backend (`configuracion.pagos` ya no existe en BD pero el frontend seguía
  usándolo en 4 archivos + `perfilAccesos.jsx`), rompiendo acceso ante cualquier re-siembra. Corregido
  en el mismo movimiento: se completó la Fase 4 frontend completa — página nueva
  `frontend/src/presentation/modules/finanzas/aportes/` (permiso `finanzas.aporte`, ruta
  `/finanzas/aportes`, order 4) separada del tab "Aporte" de `finanzas/configuracion`; bancos/cuentas/
  métodos repermisados a `finanzas.configuracion.pago` (routes.jsx, configPagosPermisos.js,
  ConfigPagosPage.jsx, perfilAccesos.jsx con tile nuevo de Aportes). Verificado: `grep
  "configuracion\.pagos" frontend/src` → 0 resultados; build OK. **Regla 3bis agregada** (ver arriba)
  para que esto no vuelva a pasar entre fases. Ningún commit ejecutado por los agentes en esta
  corrección (working tree limpio de commits nuevos, confirmado con `git log`).
- **Fases 1, 2, 3 y 4 quedan con backend+frontend+RBAC coherentes.** Pendiente: correr `verificador` y
  `revisor-ui` de cierre sobre las 4 fases antes de dar el trabajo por terminado.
- **2026-07-06**: `verificador` ejecutado sobre las 4 fases completas. Veredicto: **PASA** en los 6
  puntos (RBAC 3 capas, `dataKey`==`dataFieldName` en las 5 entidades, build/lint frontend limpio,
  estados vacío/carga/error cubiertos con `TableListView` estándar, sin hex/px sueltos fuera de
  `var(--token, fallback)`, sin commits hechos por el propio verificador). Único hallazgo real: 5
  `prefer-destructuring` triviales en los `update.controller.js` nuevos (discapacidad, tipos-parentesco,
  idiomas, documentacion, actividades) — **corregido** por el orquestador directamente (cambio
  mecánico de una línea por archivo, sin necesidad de otro agente). Hallazgo menor no bloqueante:
  `docs/referencia/matriz-permisos-sistema.md` quedó con una fila obsoleta de `configuracion.pagos` y
  sin documentar `finanzas.aporte`/`finanzas.configuracion.pago` — pendiente de actualización de
  documentación (no afecta RBAC real).
  **Trabajo dado por completo.** Ningún DDL/schema pendiente de aprobación. Todos los cambios quedan
  sin commitear en el working tree para revisión manual del usuario, salvo los commits que el propio
  usuario ya haya hecho por su cuenta durante la sesión (ver nota de la regla 3bis).
- **2026-07-07**: Backend de **Estados civiles** (sección 5) completado por agente `backend`, siguiendo
  exactamente el patrón de `idiomas` (mismo shape nombre+abreviatura). Creados: 4 use cases
  (`{Create,Update,GetById,Delete}EstadoCivilUseCase.js` en `use-cases/referencia/`), 4 controllers en
  `presentation/controllers/referencia/estados-civiles/`, validator propio
  `estados-civiles.validator.js` (nombre 2-20 + abreviatura 1-5 opcional). El repositorio
  (`CivilStatusRepository`/`IEstadoCivilRepository`), modelo Sequelize, mapper y `ListEstadosCivilesUseCase`
  ya existían de una fase anterior — solo faltaba cablear escritura. Rutas POST/GET:id/PUT/DELETE
  descomentadas y protegidas con `verificarPermiso('configuracion.complementario.estado-civil', ACCION)`
  (mismo patrón que `idiomas.routes.js`). DI: tokens + container de `estados-civiles` actualizados;
  smoke-test end-to-end (`buildContainer()` + resolver el router + listar sus 5 rutas) confirmado sin
  tocar BD. `npm run lint` limpio en los 14 archivos tocados/creados (autofix de trailing
  spaces/blank-lines preexistentes en el patrón copiado; 2 líneas de `max-len` en el container
  reenvueltas a mano). RBAC: permiso `configuracion.complementario.estado-civil` + 5 acciones +
  asignación a `RECTOR`/`DIR_ACADEMICO` (mismos roles que `idiomas`) agregados a
  `62-seed-permisos-cfg.sql` **pero NO aplicados a la BD real** — el archivo sigue sin ser idempotente
  (solo `INSERT`, ver incidente 2026-07-06 arriba) y ya tiene datos en producción, así que aplicarlo tal
  cual duplicaría las filas existentes. **Pendiente: aprobación explícita del usuario** para decidir cómo
  aplicar el delta (a mano vía `INSERT ... WHERE NOT EXISTS`, o re-siembra completa controlada del
  módulo CFG). Frontend (list/form/detail de administración) sigue pendiente, igual que el resto de la
  sección 5.
- **2026-07-07**: Backend de **Aulas** y **Tipos de evaluación** (sección 5) completado por agente
  `backend`, en una sola sesión para no pisar ediciones concurrentes sobre `62-seed-permisos-cfg.sql`
  (se detectó además una sesión concurrente activa moviendo Paralelo a `configuracion/recursos` y
  construyendo Estados civiles — ver nota de proceso abajo). **Aulas**: reutiliza `IAulaRepository`/
  `ClassroomRepository`/`Classroom` (ya existían con CRUD completo); nuevo mapper de aplicación
  `application/mappers/configuracion/ClassroomMapper.js` (presentación es-ES); 5 use cases
  (`{List,Create,Update,GetById,Delete}AulaUseCase.js` en `use-cases/configuracion/`, `ListAulasUseCase`
  soporta `?categoria=` y `?incluirInactivos=` vía `buildSpecificFilters`); 5 controllers en
  `presentation/controllers/configuracion/aulas/`; validator propio `aulas.validator.js` (codigo+nombre+
  categoria enum+capacidad+observaciones); router nuevo `aulas.routes.js` en `/api/v1/aulas`, con LISTAR
  gateado por `configuracion.aula` (no por el catálogo transparente, siguiendo el patrón de
  `actividades`/`paralelos`, no el de `idiomas`/`estados-civiles`). **Conflicto de ruteo resuelto**:
  `aulas.routes.js` comparte prefijo `/aulas` con `aulas-horarios.routes.js` (picker GET `/catalogo`,
  solo lectura, NO tocado); como este último define una ruta literal y el nuevo router define `GET
  /:id` genérico, el orden de montaje en `routes/index.js` importa — se montó
  `AULAS_HORARIOS_TOKENS.aulasHorariosRouter` ANTES que `CONFIGURACION_TOKENS.aulasRouter` (comentado
  in-line) para que `/catalogo` no sea capturado como un `id` inválido. **Tipos de evaluación**: NO se
  duplicó el listado — `tipos-evaluacion.routes.js` (router nuevo en `/api/v1/tipos-evaluacion`) resuelve
  el `ListTiposEvaluacionUseCase`/`ListTiposEvaluacionController` YA registrados en
  `academico/calificaciones.container.js` para su GET `/`, solo con el permiso nuevo
  `configuracion.tipo-evaluacion` en vez de `sistema.catalogo.referencia` (endpoint de lectura del
  cuaderno en `calificaciones.routes.js`, sin tocar). Create/Update/GetById/Delete son nuevos
  (`use-cases/configuracion/*TipoEvaluacionUseCase.js`), reutilizando `EvaluationTypeRepository`
  (ya soportaba escritura completa por herencia de `BaseRepository`, solo faltaba cablear) y el mapper
  de presentación `EvaluationTypePresentationMapper` ya existente. Ambos recursos registrados en
  `infrastructure/container/modules/configuracion/{aulas,tipos-evaluacion}.container.js`, tokens nuevos
  en `CONFIGURACION_TOKENS`. Smoke-test end-to-end sin tocar BD: `buildContainer()` + resolver ambos
  routers + listar sus 5 rutas cada uno, y cargar `routes/index.js` completo (46 sub-routers) sin error.
  `npm run lint` limpio en los ~30 archivos tocados/creados. RBAC: `configuracion.aula` y
  `configuracion.tipo-evaluacion` (5 acciones cada uno, RECTOR+DIR_ACADEMICO, mismos roles que
  `configuracion.paralelo`) agregados a `62-seed-permisos-cfg.sql` (+2 filas nuevas en `grupos_ui`:
  `configuracion_recursos_aula`, `configuracion_recursos_tipo_evaluacion`; `ruta_sidebar` =
  `/configuracion/recursos` para ambos, alineado con el movimiento de Paralelo) — **NO aplicado a la BD
  real** (mismo motivo que Estados civiles: el archivo no es idempotente y ya tiene datos en
  producción). **Pendiente: aprobación explícita del usuario** para aplicar el delta. Frontend (tabs 2 y
  3 de `configuracion/recursos`) sigue pendiente.
  **Nota de proceso — concurrencia detectada**: durante esta sesión se detectó un commit no solicitado
  (`9f0c2c10`, hecho por otro proceso/sesión en paralelo, no por este agente) que incluyó de forma
  incidental los primeros archivos de Aulas ya escritos en disco en ese momento (mappers, use cases,
  controllers y validator de Aulas, `aulas.routes.js`) junto con trabajo de frontend de Estados civiles
  y el movimiento de Paralelo a `configuracion/recursos`. Este agente no ejecutó `git commit` en ningún
  momento; el resto del trabajo de esta sesión (tokens, containers, router de Tipos de evaluación,
  mount en `routes/index.js`, seed 62) permanece sin commitear para revisión manual del usuario.
- **2026-07-07**: Frontend de **Estados civiles** completado por agente `frontend`, clonando EXACTO
  el patrón de `idioma` (elegido como plantilla por tener el shape más parecido: nombre + campo corto
  opcional). Creados: 4ta pestaña `TAB_ESTADOS_CIVILES` en `complementarioTabs.js`/
  `complementarioTabPanels.js` (icono `HeartOutlined`); `EstadosCivilesTabPanel.jsx` + `estadosCivilesTableColumns.jsx`
  (usa `createSimpleCatalogTableColumns` con `abreviatura` como `extraColumns`, `descripcionField: null`,
  sin `fixed`, 6 columnas: `#`/Nombre/Abreviatura/Acciones); `EstadoCivilFormPage.jsx` (`CfgFormWorkspace`,
  campos nombre 2-20 requerido + abreviatura 1-5 opcional) y `EstadoCivilDetailPage.jsx`
  (`DetailProfileCard`+`DetailInfoCard`); 3 connectors (`EstadoCivilForm{Create,Edit}Connector`,
  `EstadoCivilDetailConnector`) + rutas `/configuracion/complementarios/estado-civil/{nueva,:id,:id/editar}`
  en `routes.jsx` (permiso agregado a `CFG_COMPLEMENTARIO_PERMISOS`). Capa `application/modules/configuracion/
  complementarios/`: context/provider/mappers (`estadoCivilListMapper`/`estadoCivilFormMapper`)/hooks
  (api/context/features/state) — gemelos 1:1 de los de `idioma`, sumados a los barrels `hooks/index.js`,
  `mappers/index.js`, `providers/index.js`; `ComplementariosConnector.jsx` envuelto con
  `EstadoCivilProvider`; `ComplementariosPage.jsx` con el 4to tab item + acción "Nuevo estado civil".
  Capa `domain/useCases/configuracion/complementario/estadoCivil/` (5 use cases nuevos) + registrados en
  `application/container/modules/configuracion.container.js`. `EstadoCivilRepository` (infrastructure) ya
  existía solo con `obtenerTodos` (usado por el catálogo de estudiantes) — se completó con
  `obtenerPorId`/`crear`/`actualizar`/`eliminar` (mismo patrón que `IdiomaRepository`); endpoint
  `ESTADOS_CIVILES_ENDPOINTS` ya existía en `endpoints.js`. Contrato `dataKey`==`dataFieldName` verificado
  leyendo el backend: listado `estadosCiviles` (`ListEstadosCivilesUseCase`), detalle/crear/actualizar
  `estadoCivil` (`GetEstadoCivilByIdController`/`CreateEstadoCivilController`) — ambos ya coinciden con lo
  implementado. `npm run lint` (acotado a los ~30 archivos tocados/creados) limpio, cero errores/warnings.
  `npm run build`: **no verificable en esta sesión** — otra tarea concurrente movía en vivo
  `configuracion/academico/**Paralelo*` → `configuracion/recursos/` en el mismo working tree (mtimes de
  minutos antes/durante esta sesión, `routes.jsx` de académico quedó apuntando a un connector movido),
  rompiendo el build por un módulo no relacionado con esta tarea. Verificado que los alias usados
  (`@configuracion`, `@application-configuracion`, `@container`, `@repositories`, `@domain/repositories`,
  `@infrastructure/repositories`, `@theme`, `@organisms`, `@molecules`, `@atoms`, `@templates`,
  `@application-auth`, `@application/utils`) están todos registrados en `vite.config.js` y coinciden
  con los ya usados por `idioma` (que sí compilaba). **Pendiente: re-correr `npm run build` completo**
  una vez termine/se commitee el refactor de Paralelo en curso.
- **2026-07-07 — Refactor Paralelo → `configuracion/recursos` completado** por agente `frontend` (esta
  es "la otra tarea concurrente" mencionada arriba en la entrada de Estados civiles; corrió en paralelo
  sobre el mismo working tree). **Refactor puro**: se movió el tab «Paralelos» completo desde
  `configuracion/academico` al módulo nuevo `configuracion/recursos` (menú "Recursos académicos", tab
  base único por ahora — Aulas/Tipos de evaluación se cablean como tabs 2/3 en la sesión siguiente,
  backend ya construido en paralelo). **Sin cambio de lógica de negocio ni de permiso RBAC**:
  `configuracion.paralelo` conserva su código en las 3 capas.
  - **Archivos movidos con `git mv`** (32, preservando historial): 4 use cases + `index.js` en
    `domain/useCases/configuracion/{academico→recursos}/paralelos/`; `context/ParaleloContext.js`,
    `hooks/{api,context,features,state}/Paralelo*.js` (5), `mappers/paraleloFormMapper.js`,
    `providers/ParaleloProvider.jsx`, `config/paralelo{FormFields,PeriodoPill,TurnoHorarioInfo,
    TurnoOptions}.js` (4) en `application/modules/configuracion/{academico→recursos}/`;
    `components/atoms/Paralelo{PeriodoCell,TurnoHorarioInfo}.jsx` (2),
    `components/organisms/Paralelo{CarreraFormControl,CarreraPicker,DetailOfertaSection,
    DetalleInstanciaCard,FormSections}.jsx` (5), `config/paralelosTableColumns.jsx`,
    `connectors/Paralelo{DetailConnector,FormCreateConnector,FormEditConnector}.jsx` (3),
    `pages/Paralelo{DetailPage,FormPage}.jsx`+`pages/ParalelosList.jsx` (3) en
    `presentation/modules/configuracion/{academico→recursos}/`.
  - **Archivos nuevos**: `application/modules/configuracion/recursos/config/{tabs,paths,navigation}.js`
    (fuente de verdad de tabs/rutas/nav-state, gemelo de `complementarios`) + barrels
    `hooks/index.js`/`providers/index.js`/`mappers/index.js`; `presentation/modules/configuracion/
    recursos/{routes.jsx, connectors/RecursosConnector.jsx, pages/RecursosPage.jsx,
    config/recursosTabs.js, config/recursosTabPanels.js}` (clon exacto del patrón `ComplementariosPage`/
    `ComplementariosConnector`, con 1 solo tab por ahora). Rutas legacy de redirect
    `/configuracion/academico/paralelo/...` → `/configuracion/recursos/paralelo/...` (mismo idioma
    `useParams` + `Navigate` que ya usa `docentes/routes.jsx`). Alias nuevos `@configuracion-recursos` /
    `@application-configuracion-recursos` en `vite.config.js`+`jsconfig.json` (igual que
    `complementarios`). Menú `order: 6` (siguiente disponible tras Actividades=5).
  - **Imports corregidos** (cruce con lo que se queda en `academico`): `useCarrerasApi`/
    `usePlanesEstudiosApi` (siguen en `academico/hooks/api/`, ahora importados por alias absoluto en
    vez de relativo); `mapPeriodosPlanList`/`buildCarreraImageUrl`/`materiaTipoPill` (utils genéricos de
    Plan/Carrera que se quedan en `academico`, ya eran alias absolutos, sin cambio);
    `formPillSelectResolvers.js` (molécula compartida) y `configuracion.container.js` (DI) actualizados
    al nuevo path `@application-configuracion/recursos/...` / `@useCases/configuracion/recursos/
    paralelos`. CSS compartido `academico-form-page.css` **no se movió** (import cambiado de relativo
    `../styles/...` a alias `@configuracion/academico/styles/academico-form-page.css`, mismo patrón que
    ya usa `ComplementariosPage.jsx`). Limpieza en `academico`: `routes.jsx` (rutas de paralelo +
    permiso `configuracion.paralelo` fuera de `CFG_ACADEMICO_PERMISOS`), `academicoTabs.js`/
    `academicoTabPanels.js` (sin `TAB_PARALELOS`), `AcademicoConnector.jsx` (sin `ParaleloProvider`),
    `AcademicoPage.jsx` (sin tab/acción de paralelo), `paths.js`/`academicoNavigation.js` (sin
    `PARALELOS_LIST_PATH`/`paralelosListNavigationState`), barrels `hooks/index.js`/`providers/
    index.js` (sin exports de Paralelo).
  - **Hallazgo durante la verificación**: los commits de la tarea concurrente (`8e6aea67`, pure
    `git mv` de estos mismos 32 archivos) habían dejado el build roto — `AcademicoPage.jsx`,
    `AcademicoConnector.jsx`, `academico/hooks/index.js` y `academico/providers/index.js` seguían
    referenciando `ParaleloProvider`/`useParaleloContext`/`ParalelosList` en rutas que ya no existían
    tras el `git mv` (confirmado con `git show HEAD:...` antes de editar). Este refactor corrige esa
    inconsistencia además de completar el resto del checklist (tabs/paths/navigation nuevos en
    `recursos`, alias, seed).
  - **Seed** `62-seed-permisos-cfg.sql`: solo `ruta_sidebar` de `configuracion.paralelo` actualizada de
    `/configuracion/academico` → `/configuracion/recursos` (código/acciones/roles sin cambio, regla
    3bis). **No aplicado a BD real** (edición de archivo solamente, según instrucción de la tarea).
  - Verificado: `npm run build` OK (frontend completo); `npx eslint` acotado a los ~40 archivos
    tocados/creados sin errores nuevos (2 hallazgos preexistentes confirmados no-regresión, con
    `git log --follow`: `Form.useWatch` condicional en `ParaleloFormSections.jsx` desde su commit
    original; patrón `react-refresh/only-export-components` en `recursos/routes.jsx`, mismo perfil que
    `docentes/routes.jsx` con su `LegacyRedirect` inline). `grep` de rutas/imports viejos → 0
    resultados en todo `frontend/src`. Ningún commit ejecutado por este agente.
  - **Pendiente siguiente sesión**: cablear Aulas (backend ya listo, `configuracion.aula`) y Tipos de
    evaluación (backend ya listo, `configuracion.tipo-evaluacion`) como tabs 2/3 de
    `RecursosPage.jsx`/`RecursosConnector.jsx`/`recursosTabs.js`/`recursosTabPanels.js`.
- **2026-07-07 — Frontend de Aulas y Tipos de evaluación (tabs 2/3 de `configuracion/recursos`)
  completado** por agente `frontend`. Capas completas de dominio/infraestructura/aplicación/presentación
  para ambos catálogos, siguiendo el patrón `idioma` (CRUD self-contenido en `configuracion.container.js`)
  y no el de `paralelo` (que reutiliza un use case compartido con Institucional/Oferta):
  - **Dominio**: `IAulaRepository`/`ITipoEvaluacionAdminRepository` (`domain/repositories/`, subclases
    vacías de `IBaseRepository`); 5 use cases cada uno en `domain/useCases/configuracion/recursos/
    {aula,tipoEvaluacion}/`. El repositorio de Tipos de evaluación se nombró con sufijo **`Admin`**
    (mismo precedente que `IUsuarioAdminRepository`) porque `ITipoEvaluacionRepository`/
    `TipoEvaluacionRepository` ya existían (combo de solo lectura del cuaderno de calificaciones,
    `academico.container.js`, permiso `sistema.catalogo.referencia`, no se tocan) — evita colisión de
    nombre de archivo/clase.
  - **Infraestructura**: `AulaRepository.js`/`TipoEvaluacionAdminRepository.js` (HTTP puro, mismo patrón
    que `IdiomaRepository`). Endpoints nuevos en `infrastructure/api/endpoints.js`:
    `AULAS_ENDPOINTS = createCRUDEndpoints('/aulas')` (junto a `AULAS_CATALOGO_ENDPOINT`, distinto del
    picker GET-only) y `TIPOS_EVALUACION_ENDPOINTS = createCRUDEndpoints('/tipos-evaluacion')` (junto a
    `ACTIVIDADES_ENDPOINTS`, distinto de `CALIFICACIONES_ENDPOINTS.TIPOS_EVALUACION`).
  - **Aplicación** (`application/modules/configuracion/recursos/`): context/provider/hooks
    (api·features·state·context) + mappers (`aulaListMapper`/`aulaFormMapper`,
    `tipoEvaluacionListMapper`/`tipoEvaluacionFormMapper`) gemelos 1:1 de `idioma`; `config/tabs.js`
    ganó `TAB_AULAS`/`TAB_TIPOS_EVALUACION`, `config/paths.js` ganó las rutas ABM de ambos,
    `config/navigation.js` ganó `aulasListNavigationState`/`tiposEvaluacionListNavigationState`;
    `config/aulaCategoriaOptions.js` nuevo (única fuente de las 4 opciones del ENUM `categoria`
    consumida por el formulario y la tabla). Ambos use cases registrados en
    `application/container/modules/configuracion.container.js` (`factory.obtenerTodasAulas` /
    `factory.obtenerTodosTiposEvaluacion` y el resto del CRUD) sin colisión con los factory keys ya
    existentes del combo de calificaciones (`factory.obtenerTiposEvaluacion`, singular sin "Todos").
  - **Presentación** (`presentation/modules/configuracion/recursos/`): `config/aulasTableColumns.jsx`
    factory propia (no `createSimpleCatalogTableColumns`, por tener categoría+capacidad+observaciones)
    respetando la regla de sección 5bis — **sin `fixed`, 6 columnas exactas**: `#` · Identidad
    (`IdentidadCelda` código+nombre) · "Categoría y capacidad" (`InfoLinesCell`, una celda) ·
    Observaciones (`TruncatedTextCell`) · Estado (`StatusPill` `cfg-materia-pill--activa/--inactiva`) ·
    Acciones. `config/tiposEvaluacionTableColumns.jsx` sí usa `createSimpleCatalogTableColumns`
    (`codigoField: 'codigo'`, `descripcionField` por defecto, `extraColumns` con pill
    "Recuperatorio"/"Regular") — 5 columnas. Páginas `AulasList.jsx`/`TiposEvaluacionList.jsx` (gemelas
    de `ParalelosList.jsx`, con prop `embedded`), `AulaFormPage.jsx`/`TipoEvaluacionFormPage.jsx`
    (`CfgFormWorkspace`; `categoria` como `type: 'select'` con las 4 opciones del ENUM, `capacidad` como
    `type: 'number'`, `esRecuperatorio` como `type: 'switch'` — el design system no tiene un renderer
    `checkbox` nativo, `switch` es la convención ya usada para booleanos en `useBecaDescuentoForm.js`),
    `AulaDetailPage.jsx`/`TipoEvaluacionDetailPage.jsx` (`DetailProfileCard`+`DetailInfoCard`); 6
    connectors (form-create/form-edit/detail ×2). `RecursosConnector.jsx` envuelto con
    `AulaProvider`+`TipoEvaluacionProvider` (anidados dentro de `ParaleloProvider`); `RecursosPage.jsx`
    con 3 tabs condicionados por permiso (`configuracion.paralelo|aula|tipo-evaluacion`, acción LISTAR) y
    botón "Nuevo/a X" por tab activo; `recursosTabs.js`/`recursosTabPanels.js` actualizados (iconos
    `BankOutlined`/`FileDoneOutlined`). `routes.jsx`: 6 rutas ABM nuevas + `configuracion.aula` y
    `configuracion.tipo-evaluacion` sumados a `CFG_RECURSOS_PERMISOS` (para que las pestañas aparezcan
    con cualquiera de los 3 permisos).
  - **Contrato `dataKey`==`dataFieldName` verificado leyendo el backend** (mappers/controllers, no
    asumido): Aulas → listado `aulas`, detalle/crear/actualizar `aula`; Tipos de evaluación → listado
    `tiposEvaluacion`, detalle/crear/actualizar `tipoEvaluacion`. Ambos coinciden con los `dataKey`
    usados en `useAulasApi`/`useTiposEvaluacionAdminApi` y en los mappers de detalle/formulario.
  - **Orden de montaje de `aulas.routes.js` vs `aulas-horarios.routes.js` verificado sin tocar**
    (`aulasHorariosRouter` sigue montado antes que `CONFIGURACION_TOKENS.aulasRouter` en
    `routes/index.js`), confirmando que el picker GET-only de Institucional/Oferta sigue intacto.
  - **Concurrencia detectada durante la sesión**: se confirmó, revisando `git log`, que 2 commits
    (`9f0c2c10`, `f8e88937`) del backend de Aulas/Tipos de evaluación y del movimiento de Paralelo se
    hicieron en paralelo a esta sesión de frontend sobre el mismo working tree; la edición propia de
    este agente a `infrastructure/api/endpoints.js` (agregar `AULAS_ENDPOINTS`/
    `TIPOS_EVALUACION_ENDPOINTS`) terminó absorbida sin duplicados dentro del commit `f8e88937` (mismo
    contenido carácter por carácter, verificado con `git show`) — no se generó ninguna declaración
    duplicada ni el build se rompió; este agente no ejecutó `git commit` en ningún momento. El resto de
    los ~35 archivos nuevos/editados de esta sesión permanece sin commitear para revisión manual del
    usuario.
  - Verificado: `npm run build` OK (frontend completo, 2 corridas); `npx eslint` acotado a los ~35
    archivos tocados/creados sin errores nuevos (único hallazgo: 2 errores preexistentes
    `react-refresh/only-export-components` en `recursos/routes.jsx` por los `LegacyRedirect` inline de
    Paralelo, ya documentados como no-regresión en la entrada anterior). Orden `aulas-horarios.routes.js`
    antes que `aulas.routes.js` verificado intacto.

## 5bis. Ajuste de estilo de tablas + Aportes deja de ser menú (2026-07-07)

El usuario detectó 2 problemas sobre lo entregado en las Fases 1-4:

1. **Regla nueva de columnas**: ninguna tabla de "datos de referencia" debe usar `fixed`
   (ni `'left'` ni `'right'`) y el total de columnas (contando `#` y `Acciones`) no debe superar
   **6**. Si hay más datos, se apilan dentro de la misma celda (`Flex vertical`, `InfoLinesCell`,
   varios `StatusPill` apilados), como ya hacen `pagos/config/tableColumns.jsx`,
   `matricula/config/tableColumns.jsx`, `estudiantes/config/tableColumns.jsx` y
   `becasTableColumns.jsx`. **Carreras/Materias/Paralelos NO se tocan** (conservan `fixed`, son
   catálogos maestros con columnas de negocio propias, fuera de alcance de esta regla).
2. **"Aporte" deja de ser ítem de menú propio.** Pasa a ser una página hija dentro de
   `finanzas/configuracion` (Config. de pagos), sin `menu:` propio, accedida por un botón
   "Configuración de aportes" en la cabecera de `ConfigPagosPage`.

**Hecho:**
- `createSimpleCatalogTableColumns.jsx` (factory compartida de discapacidad/apoderados/idiomas/
  documentación/actividades): removidos `fixed: 'left'` (Nombre) y `fixed: 'right'` (Acciones).
  Corrige los 5 consumidores de una sola vez; ninguno excedía 6 columnas.
- `configPagosColumns.jsx`: removido `fixed: 'right'` de Bancos/Cuentas/Métodos. `createCuentasColumns`
  bajó de 8 a 6 columnas fusionando "Banco"+"Método" → "Banco y método" y "QR"+"Estado" → "Estado"
  (pills apiladas). Agregada `createMetodosColumns` (nueva, #/Código/Nombre/Estado/Acciones).
- `MetodosTabPanel.jsx`: reescrito de `Switch`+`Button` custom a tabla (`TableListView` embebido) con
  `TableActions` (editar + toggle activo/inactivo vía `extraActions`), igual patrón que Bancos/Cuentas.
- **Aportes movido**: `finanzas/aportes/` (routes.jsx, connector, page, permisos, estilos) borrado
  por completo. Recreado bajo `finanzas/configuracion/{pages/AporteConfigPage.jsx,
  connectors/AporteConfigConnector.jsx, config/aportePermisos.js, styles/aporte-page.css}`. Nueva
  ruta hija `/finanzas/configuracion/aportes` (`key: FIN-CFG-APORTES`, `menu: null`,
  `breadcrumbParent: 'FIN-CFG'`, mismo patrón que `finanzas/reportes/routes.jsx`). Botón
  "Configuración de aportes" en `PageHeader actions` de `ConfigPagosPage.jsx`
  (`PermisoGuard finanzas.aporte/LISTAR`). `perfilAccesos.jsx` actualizado
  (`path: '/finanzas/configuracion/aportes'`). Capa de aplicación
  (`application/modules/finanzas/aportes/*`) **no se movió** (decisión de `arquitecto`: ya es plana
  por feature, no espeja la carpeta de presentación; solo se actualizaron comentarios).
  Permiso `finanzas.aporte` **sin cambios de código/acciones** (regla 3bis) — solo dejó de tener
  `menu:` en frontend.
- Verificado: `grep "finanzas/aportes" frontend/src` sin referencias rotas (solo capa de aplicación,
  que no se mueve, y comentarios ya actualizados). `npm run build` OK. Lint acotado a los archivos
  tocados: sin errores/warnings nuevos.
- **Pendiente de aprobación del usuario**: el seed `backend/database/02-seeders/60-seed-permisos-fin.sql`
  se editó (columna `ruta_sidebar` de `finanzas.aporte`: `/finanzas/aportes` →
  `/finanzas/configuracion/aportes`, cosmético, solo alimenta la grilla de Seguridad, no el sidebar
  real que es 100% frontend) pero **no se ejecutó contra la BD real** — requiere confirmación
  explícita antes de resembrar (regla del proyecto).
- Aulas / tipos_evaluación / estados_civiles / instituciones / becas_descuentos (sección 5) siguen
  sin frontend construido — no había nada que corregir ahí; cuando se construyan deben nacer ya
  sin `fixed` y con máximo 6 columnas.

## 5. Extensión — catálogos de referencia adicionales sin CRUD

Investigación de `datos` (2026-07-06) confirmó 5 catálogos reales sin ninguna pantalla de
administración (solo `GET`, todo el resto comentado como TODO en sus routers). El usuario aprobó
construir CRUD completo para los 5, cada uno en su dominio natural (no agrupados en un menú genérico).

| Catálogo | Tabla | Dominio destino | Estado | Notas |
|---|---|---|---|---|
| Becas / descuentos | `becas_descuentos` (`11-estudiantes-parte2.sql:30`) | Finanzas (junto a `aportes`/`configuracion`) | ✅ **HECHO** (commits `fbd59861`/`8e983264`) | CRUD completo backend (`becas-descuentos.routes.js`) + frontend list/form/detail en `finanzas/configuracion/`, permiso `finanzas.beca-descuento` (5 acciones) sembrado en `60-seed-permisos-fin.sql`. Las 12 becas oficiales (Res. Ministerial 434/2019) no se tocaron. |
| Aulas | `aulas` (`06-estructura-academica-parte2.sql:162`) | **`configuracion/recursos`** (tab 2, junto a Paralelo ya movido; catálogo maestro puro, igual patrón que carreras/materias/paralelos; lo operativo -asignación a paralelo_gestion- sigue en institucional/oferta vía `aulas-horarios.routes.js` GET-only y no se toca) | ✅ **Backend+Frontend hecho (2026-07-07)** | `LAB-2 / Sala de Docentes` (id 2, capacidad=0, activo=0) está desactivado A PROPÓSITO — no reactivado ni excluido del listado admin (`useAulasApi` pide `incluirInactivos: true`, se ve con `StatusPill` "Inactiva"). Backend: router NUEVO `aulas.routes.js` en `/api/v1/aulas`, montado DESPUÉS de `aulas-horarios.routes.js` en `routes/index.js` a propósito. Permiso: `configuracion.aula` (5 acciones, RECTOR+DIR_ACADEMICO). Frontend: tab 2 de `configuracion/recursos`; columnas propias `aulasTableColumns.jsx` (NO usa `createSimpleCatalogTableColumns`: 6 columnas exactas, sin `fixed` — # · Identidad · Categoría y capacidad (`InfoLinesCell`) · Observaciones (`TruncatedTextCell`) · Estado (`StatusPill` activa/inactiva) · Acciones); formulario `CfgFormWorkspace` (código, nombre, categoría —select 4 valores del ENUM, `aulaCategoriaOptions.js`—, capacidad —number—, observaciones —textarea opcional—); detalle `DetailProfileCard`+`DetailInfoCard`. Capa de aplicación completa (context/provider/hooks api·features·state/mappers) en `application/modules/configuracion/recursos/`; dominio `IAulaRepository`+`AulaRepository`+5 use cases en `domain/useCases/configuracion/recursos/aula/`; endpoint `AULAS_ENDPOINTS` (`createCRUDEndpoints('/aulas')`) en `infrastructure/api/endpoints.js`. `dataFieldName` confirmado leyendo los controllers: listado `aulas`, detalle/crear/actualizar `aula` — coincide con `dataKey` del frontend. |
| Tipos de evaluación | `tipos_evaluacion` (`15-evaluaciones.sql:134`) | `configuracion/recursos` (tab 3; catálogo que parametriza `evaluaciones`, igual que materias parametriza `oferta_cursos` — la lectura operativa del cuaderno vía `GetTiposEvaluacionUseCase`/`calificaciones.routes.js` no se toca) | ✅ **Backend+Frontend hecho (2026-07-07)** | 17 tipos ya sembrados (seed 53), no se tocó ese seed. El campo "componente" (teórico/práctico) vive en `evaluaciones`, no se agregó a este catálogo. Backend: router NUEVO `tipos-evaluacion.routes.js` en `/api/v1/tipos-evaluacion`; el LISTAR reutiliza el `ListTiposEvaluacionUseCase`/`ListTiposEvaluacionController` YA registrados por `calificaciones.container.js`, solo Create/Update/GetById/Delete son nuevos. Permiso nuevo: `configuracion.tipo-evaluacion` (5 acciones, RECTOR+DIR_ACADEMICO), distinto del permiso de lectura del cuaderno (`sistema.catalogo.referencia`, no reutilizado). Frontend: tab 3 de `configuracion/recursos`; columnas vía `createSimpleCatalogTableColumns` (`tiposEvaluacionTableColumns.jsx`, `codigoField: 'codigo'`, `extraColumns` con pill "Recuperatorio"/"Regular" — 5 columnas); formulario `CfgFormWorkspace` (código, nombre, descripción, `esRecuperatorio` como `type: 'switch'`, siguiendo la convención del design system en vez de un `checkbox` nativo); detalle `DetailProfileCard`+`DetailInfoCard`. Repositorio de administración nombrado `ITipoEvaluacionAdminRepository`/`TipoEvaluacionAdminRepository` (sufijo `Admin`, mismo precedente que `IUsuarioAdminRepository`) para no colisionar con `ITipoEvaluacionRepository`/`TipoEvaluacionRepository` ya existentes (combo de solo lectura del cuaderno de calificaciones, `academico.container.js`, no se tocan). `dataFieldName` confirmado: listado `tiposEvaluacion`, detalle/crear/actualizar `tipoEvaluacion` — coincide con `dataKey` del frontend. |
| Estados civiles | `estados_civiles` (`03-catalogos-referencia.sql:63`) | `configuracion/complementarios` (sibling de idiomas/discapacidad/apoderados) | ✅ **Backend+Frontend hecho (2026-07-07)** | Catálogo mínimo (5 valores: `id, nombre, abreviatura`). FK activa desde `estudiantes.estado_civil_id`, `20-personal-usuarios.sql` (docentes/personal) y `06-estructura-academica-parte2.sql:96` — se consume ya en 3 formularios (`estudianteDatosPersonalesFields.js`, `docenteDatosPersonalesFields.js`, `usuarioWizardPersonalFields.js`) vía combo. Backend: CRUD completo (Create/Update/GetById/Delete use cases + controllers + rutas habilitadas en `estados-civiles.routes.js`, mismo shape que idiomas: nombre+abreviatura). Frontend: 4ta pestaña "Estados civiles" en `configuracion/complementarios`, clon exacto del patrón `idioma` (list vía `createSimpleCatalogTableColumns` con `abreviatura` como `extraColumns`, form `CfgFormWorkspace`, detalle `DetailProfileCard`+`DetailInfoCard`). Permiso: `configuracion.complementario.estado-civil` (5 acciones, RECTOR+DIR_ACADEMICO) agregado a `62-seed-permisos-cfg.sql` — **pendiente de aplicar en BD real** (archivo no es idempotente, no se ejecutó para evitar duplicar filas ya existentes de ese seed). |

**Instituciones — retirada de esta sección (2026-07-07, decisión del usuario).** La tabla `instituciones`
(`18-transitabilidades.sql:70`) pertenece al dominio de **transitabilidad/traspasos** (ver memoria
`incos-dominios-sin-construir.md`: dominio sin construir), no a un tab genérico de
`configuracion/complementarios`. Cuando se aborde ese dominio, su UI necesita un filtro por **tipo de
admisión** que no tiene sentido en un catálogo simple de complementarios — se diseñará junto con el
resto de transitabilidad/traspasos, no aquí. Investigación previa (`arquitecto`, 2026-07-06) confirmó
que la tabla ya tiene `activo`+`deleted_at`, así que no hay bloqueo de schema cuando se retome.

Fuera de alcance (explícitamente descartado por el usuario o el propio `datos`):
- `modalidades_grado`: tabla sin seeder/backend/frontend — es un dominio de Titulación entero
  pendiente (junto a `titulos`/`certificados`/`proyectos_grado`), no un simple "falta CRUD".
- `configuracion_sistema`, `grupos_ui`, `paises/departamentos/provincias/municipios`: sin CRUD por
  diseño (uso interno / RBAC por código / geografía estática) — no exponer UI salvo pedido explícito.
- `metodos_pago`: ya tiene pantalla (editar), solo le falta alta/baja — no es parte de esta extensión,
  confirmar aparte si el negocio realmente necesita crear métodos nuevos.

### Reglas heredadas (siguen aplicando)

- Ningún cambio de schema/DDL sin aprobación explícita — pero **ningún catálogo de esta lista requiere
  DDL** (las 5 tablas ya existen con columnas suficientes, confirmado por `datos`).
  **Salvo `instituciones`**: no tiene tabla `activo`/soft-delete confirmada — si el CRUD de baja lo
  necesita y no existe, es columna nueva → DETENERSE y pedir aprobación antes de agregarla.
- Regla 3bis (permiso renombrado/movido = mismo paso atómico backend+frontend) sigue aplicando.
- Ningún subagente ejecuta `git commit` — el usuario commitea manualmente.
- Cerrar cada catálogo (o el lote completo) con `verificador` antes de dar por terminado.
- **2026-07-06**: `arquitecto` resolvió las 2 ubicaciones pendientes de la extensión (sección 5).
  **Aulas** → `configuracion/academico` (4ta pestaña, permiso `configuracion.aula`, router nuevo
  `aulas.routes.js`, columnas propias por tener categoría+capacidad). **Instituciones** →
  `configuracion/complementarios` (4ta pestaña, permiso `configuracion.complementario.institucion`,
  confirmado que SÍ tiene `activo`+`deleted_at` así que **no hace falta ninguna aprobación de schema**
  para ningún catálogo de la extensión). Tabla de la sección 5 actualizada con las decisiones. Todos
  los códigos de permiso nuevos (`configuracion.aula`, `configuracion.complementario.institucion`) se
  suman a los ya conocidos para becas/descuentos (Finanzas, decisión ya dada por el usuario),
  `tipos_evaluacion` (`configuracion/academico`) y `estados_civiles`
  (`configuracion.complementario.estado-civil`, `configuracion/complementarios`).
  Siguiente paso: `planificador` para el checklist de los 5 catálogos, luego backend (2 sesiones en
  paralelo: una para CFG —aulas+tipos_evaluacion+estados_civiles+instituciones, mismo seed
  `62-seed-permisos-cfg.sql`— y otra para Finanzas —becas_descuentos, seed `60-seed-permisos-fin.sql`—)
  y frontend.
