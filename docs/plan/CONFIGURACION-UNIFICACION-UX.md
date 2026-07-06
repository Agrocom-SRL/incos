# Unificación UX/arquitectura de Configuración — plan por fases

> Estado: **En ejecución (orquestador lanzado 2026-07-06)** — Fase 0 completada, iniciando Fase 1.
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
- [ ] **discapacidad**: falta form (create/edit) + detail/ficha en frontend (el listado ya sigue el
      patrón, pero usa componentes viejos — se reescribe con la factory nueva). Backend: habilitar
      POST/PUT/DELETE en `discapacidad.routes.js` (hoy comentados como TODO) + use cases
      Create/Update/GetById/Delete.
- [ ] **idiomas**: todo por construir (hoy es stub `IdiomasTabPanel.jsx`). Backend solo tiene GET
      (`idiomas.routes.js`, `ListIdiomasUseCase.js`) — falta CRUD completo.
- [ ] **apoderados**: CRUD de `tipos_parentesco` (decisión 3, sin schema nuevo). Backend: habilitar
      POST/PUT/DELETE en `tipos-parentesco.routes.js`. Frontend: reemplazar
      `ApoderadosTabPanel.jsx` stub por list/form/detail real.
- [ ] RBAC: completar `permiso_acciones` con `DETALLE`/`ELIMINAR` faltantes para los 3 códigos en
      `62-seed-permisos-cfg.sql` (ya existen `LISTAR/CREAR/EDITAR` parcialmente, ver planificador).
- Permisos ya sembrados en `02-seeders/62-seed-permisos-cfg.sql`:
  `configuracion.complementario.discapacidad|apoderados|idiomas` (reutilizar, solo completar acciones).

### Fase 2 — `configuracion/documentacion`
- [ ] Frontend hoy solo tiene `routes.jsx` con `<UnderConstruction />` — construir 4 listados
      (inscripcion/becas/pasantias/traslado, `tipoDocumento` fijo por página) + 1 form-page compartida
      + selector de `documento_padre_id` filtrado por tipo.
- [ ] Backend: implementar Create/Update/GetById/Delete use cases + descomentar controllers/rutas en
      `documentacion.routes.js`. Resolver permiso por `tipoDocumento` (4 códigos ya sembrados).
- [ ] RBAC: reactivar los 4 permisos `configuracion.documentacion.*` (hoy `activo=0` por
      "deshabilitación temporal" en seed 62) + completar `permiso_acciones` (falta DETALLE/ELIMINAR en
      varios) + alinear `roles_permisos`.
- [ ] Ya consumido en runtime por `estudiantes` (matriculación, `useDocumentacionDinamica.js`) — no
      romper ese consumo de lectura (mismo endpoint GET, no se toca su contrato).

### Fase 3 — `configuracion/actividades` (catálogo maestro, no calendario)
- [ ] Backend: no existe router/controller/use case CRUD para tabla `actividades` — construir
      completo (repositorio `ActivityRepository`/`activityRepository` YA existe y registrado, solo
      falta consumirlo). Router nuevo `actividades.routes.js` (no existe, crear desde cero).
- [ ] Frontend: hoy solo `routes.jsx` con `<UnderConstruction />` — construir list/form/detail
      siguiendo el patrón de `materias`, con `extraColumns` (tipo vía StatusPill, icono como preview
      de texto simple, sin librería de mapeo).
- [ ] RBAC: renombrar `configuracion.historial-actividades` → `configuracion.actividad` (decisión 7),
      ampliar `permiso_acciones` a las 5 acciones, quitar de la sección de deshabilitación en seed 62,
      mantener redirect legacy.

### Fase 4 — `finanzas/configuracion`
- [ ] Sacar la pestaña **Aporte** (`components/AporteTabPanel.jsx`) del tab y crear página nueva
      `finanzas/aportes/` con ruta y permiso propio `finanzas.aporte` (decisión 2 y 8). Requiere
      partir el hook combinado `useConfigPagosPage.js`/`useConfigPagosCatalogsApi.js`/
      `useConfigPagosMutations.js` (quitar la porción de aporte, no duplicar).
- [ ] Backend: `configuracion-aportes.routes.js` migra de `configuracion.pagos` a `finanzas.aporte`.
- [ ] Bancos/cuentas/métodos: **mantener Drawer** (decisión 9), solo repermisar de
      `configuracion.pagos` a `finanzas.configuracion.pago` (3 routers backend + frontend
      `configPagosPermisos.js` + `perfilAccesos.jsx`).
- [ ] RBAC: retirar `configuracion.pagos` de `62-seed-permisos-cfg.sql`, sembrar `finanzas.aporte` y
      `finanzas.configuracion.pago` en `60-seed-permisos-fin.sql` (decisión 8).

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
