# Matriz de Permisos - Instituto INCOS
## Ultima actualizacion: 2026-05-07

Documento de auditoria funcional (frontend + backend + seeds) sobre permisos por accion.

## ADMIN_SISTEMA (rol_id = 1)

El usuario **admin** inicial (`57-seed-usuarios-admin.sql`) tiene `rol_id = 1`. No tiene filas en `roles_permisos`; los permisos efectivos salen del catalogo `permiso_acciones` via `AuthRepository` / vista `vista_catalogo_acciones_permisos_activas` (toda combinacion valida en seeds).

## Criterio canon para nuevas funciones (ABM limpio + seguridad)

Todo alta/baja/modificacion (ABM) o nueva pantalla de un modulo debe cumplir estas restricciones minimas:

1. **Arquitectura limpia por capa**
   - `presentation/pages`: UI pura.
   - `application/hooks/state`: logica de pantalla.
   - `application/providers`: inyeccion de contexto.
   - `presentation/connectors`: composicion Provider + Page.
2. **Permisos coherentes extremo a extremo**
   - misma accion entre `routes.jsx`, `PermisoGuard/ActionButton/TableActions/useAcciones` y `verificarPermiso` backend.
   - El `routerFactory` envuelve cada ruta protegida con `PrivateRoute` usando `permiso` y `accion` del registro de rutas (denegacion directa por URL si falta capacidad RBAC).
3. **Accion correcta segun flujo**
   - listado/menu: `LISTAR`
   - ficha: `DETALLE`
   - alta: `CREAR`
   - edicion: `EDITAR`
   - baja: `ELIMINAR`
   - exportaciones: `EXPORTAR`
4. **Sin bypass en UI**
   - no mostrar CTA de accion si el permiso/accion no existe o no esta asignado al rol.
5. **Trazabilidad de navegacion**
   - cuando exista flujo multi-pantalla, propagar `returnListPath` y ruta de origen (`gestionReturnPath` o equivalente).

## Resumen de roles

| ID | Codigo | Nombre |
|----|--------|--------|
| 1 | ADMIN_SISTEMA | Administrador del Sistema |
| 2 | RECTOR | Rector |
| 3 | DIR_ACADEMICO | Director Academico |
| 4 | DIR_ADMIN | Director Administrativo |
| 5 | SEC_ACADEMICA | Secretaria Academica |
| 6 | SEC_ADMIN | Secretaria Administrativa |
| 7 | DOCENTE | Docente |
| 8 | ESTUDIANTE | Estudiante |

Fuente: `53-seed-roles.sql`.

## Tabla de acciones disponibles por accion HTTP

| Patron backend | Accion RBAC |
|---|---|
| `GET /...` (listado/detalle) | VER |
| `POST /...` (alta/registro) | CREAR |
| `PUT/PATCH /...` | EDITAR |
| `DELETE /...` | ELIMINAR |
| `GET /.../export`, `GET /.../recibo` | EXPORTAR |
| Flujos de aprobacion en UI/negocio | APROBAR |

## Endpoints activos del backend (auditados)

| Archivo | Metodo | Path base real | Accion UI |
|---|---|---|---|
| `auth.routes.js` | POST | `/api/v1/auth/login` | Autenticar |
| `auth.routes.js` | GET | `/api/v1/auth/me` | Perfil + permisos |
| `auth.routes.js` | POST | `/api/v1/auth/logout` | Cerrar sesion |
| `docentes.routes.js` | GET | `/api/v1/docentes` | LISTAR |
| `docentes.routes.js` | GET | `/api/v1/docentes/:id` | DETALLE ficha |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes` | VER listado |
| `estudiantes.routes.js` | POST | `/api/v1/estudiantes` | CREAR |
| `estudiantes.routes.js` | PUT | `/api/v1/estudiantes/:id` | EDITAR |
| `estudiantes.routes.js` | DELETE | `/api/v1/estudiantes/:id` | ELIMINAR |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/:id` | VER detalle |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/search` | VER/consulta |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/export/estadistica-inscritos` | EXPORTAR |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/export/lista-inscritos-por-carrera` | EXPORTAR |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/becas` | VER becas |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/:id/scholarships` | VER becas estudiante |
| `estudiantes.routes.js` | POST | `/api/v1/estudiantes/:id/scholarships` | CREAR asignacion beca |
| `estudiantes.routes.js` | DELETE | `/api/v1/estudiantes/becas/:id` | ELIMINAR asignacion beca |
| `estudiantes.routes.js` | POST | `/api/v1/estudiantes/:id/documentos/acta-compromiso` | CREAR documento |
| `estudiantes.routes.js` | POST | `/api/v1/estudiantes/:id/documentos/declaracion-jurada` | CREAR documento |
| `inscripciones.routes.js` | GET | `/api/v1/inscripciones` | VER listado |
| `inscripciones.routes.js` | POST | `/api/v1/inscripciones` | CREAR |
| `inscripciones.routes.js` | GET | `/api/v1/inscripciones/:id` | VER detalle |
| `inscripciones.routes.js` | PUT | `/api/v1/inscripciones/:id` | EDITAR |
| `inscripciones.routes.js` | DELETE | `/api/v1/inscripciones/:id` | ELIMINAR |
| `inscripciones.routes.js` | POST | `/api/v1/inscripciones/:id/generar-formulario` | CREAR documento (PDF) |
| `pagos-aportes.routes.js` | GET | `/api/v1/pagos-aportes` | VER listado |
| `pagos-aportes.routes.js` | GET | `/api/v1/pagos-aportes/estado-registro` | VER estado |
| `pagos-aportes.routes.js` | POST | `/api/v1/pagos-aportes` | CREAR pago |
| `pagos-aportes.routes.js` | GET | `/api/v1/pagos-aportes/:id` | VER detalle |
| `pagos-aportes.routes.js` | DELETE | `/api/v1/pagos-aportes/:id` | ELIMINAR cuota |
| `pagos-aportes.routes.js` | GET | `/api/v1/pagos-aportes/:id/recibo` | EXPORTAR recibo |
| `usuarios.routes.js` | GET | `/api/v1/usuarios` | VER usuarios |
| `usuarios.routes.js` | POST | `/api/v1/usuarios` | CREAR usuario |
| `usuarios.routes.js` | GET | `/api/v1/usuarios/:id` | VER detalle usuario |
| `usuarios.routes.js` | PUT | `/api/v1/usuarios/:id` | EDITAR usuario |
| `usuarios.routes.js` | PATCH | `/api/v1/usuarios/:id/estado` | EDITAR estado |
| `usuarios.routes.js` | PATCH | `/api/v1/usuarios/:id/password` | EDITAR password |
| `usuarios.routes.js` | GET | `/api/v1/usuarios/:id/permisos` | VER permisos usuario |
| `usuarios.routes.js` | POST | `/api/v1/usuarios/:id/permisos` | EDITAR overrides |
| `usuarios.routes.js` | DELETE | `/api/v1/usuarios/:id/permisos/:overrideId` | ELIMINAR override |
| `roles.routes.js` | GET | `/api/v1/roles` | VER roles |
| `roles.routes.js` | GET | `/api/v1/roles/:id/permisos` | VER permisos rol |
| `roles.routes.js` | PUT | `/api/v1/roles/:id/permisos` | EDITAR permisos rol |
| `permisos.routes.js` | GET | `/api/v1/permisos` | VER catalogo permisos |
| Catalogos de referencia | GET | varios (ver seccion abajo) | `sistema.catalogo.referencia` + **LISTAR** |

## Catalogo global de capacidades (frontend + endpoints)

Este catalogo define las capacidades reales del sistema para evitar ambiguedad entre:
- permisos de menu/ruta (`routes.jsx` con `permiso`)
- controles de UI (`PermisoGuard`, `ActionButton`, `TableActions`)
- operaciones API (`frontend/src/infrastructure/api/endpoints.js`)

### Guardas y componentes de control por accion

| Componente/hook | Funcion |
|---|---|
| `PermisoGuard(codigo, accion)` | habilita/bloquea rutas o bloques de vista |
| `ActionButton(permiso, accion)` | renderiza/oculta botones de accion en headers y formularios |
| `TableActions(permisos, extraActions.permiso/accion)` | muestra/oculta ver, editar, eliminar y acciones extra por fila |
| `useAcciones(codigoPermiso)` | expone `puedeVer/Crear/Editar/Eliminar/Aprobar/Exportar` para una vista |

### Capacidades base por accion (canon RBAC)

| Accion | Capacidad funcional | Fuente tecnica principal |
|---|---|---|
| VER | listar, ver detalle, abrir modulo/menu | `GET` + `PermisoGuard` + filtro sidebar |
| CREAR | alta/registro, generar documento, asignar | `POST` + `ActionButton` |
| EDITAR | actualizacion de datos/estado/password | `PUT/PATCH` + `TableActions` |
| ELIMINAR | bajas/soft-delete/override delete | `DELETE` + `TableActions` |
| APROBAR | pasos de workflow de aprobacion | rutas de aprobacion + botones de flujo |
| EXPORTAR | excel/pdf/recibos | `GET export/recibo` + botones de descarga |

### Catalogo de capacidades por dominio (resumen operativo)

| Dominio | Permisos codigo base | Capacidades reales detectadas |
|---|---|---|
| MATRICULA | `matricula.*` | admision, inscripcion, becas, documentos, aportes |
| ACADEMICO | `academico.*` | calificaciones, nivelacion, trazabilidad, historial, licencias |
| DOCENTES | `docentes.*` | docentes, licencias, supervision, pasantias |
| FINANZAS | `finanzas.*` | pagos, cuotas, reportes, recibos |
| INSTITUCIONAL | `institucional.*` | gestiones, oferta, horarios, configuraciones |
| REPORTES | `reportes.*` | reportes de avance/asistencia/desercion/solicitudes |
| SEGURIDAD | `seguridad.*` | usuarios, roles, permisos, overrides |

### Inventario frontend de permisos en rutas (single source UI)

El barrido de `frontend/src/presentation/modules/**/routes.jsx` confirma que los codigos usados en UI
estan alineados con `54-seed-permisos.sql` (100 permisos; ultimo `institucional.horario.publicacion` id 100) y que la visibilidad del sidebar en v2 depende de accion **LISTAR** (no existe `VER` en `permiso_acciones`).

### Nota de compatibilidad documental

Si algun documento legado usa `VER` como sinonimo de lectura, al implementar nuevas funciones priorizar `LISTAR` y `DETALLE` en frontend, y documentar cualquier excepcion temporal hasta completar la normalizacion.

### Recomendacion de normalizacion (siguiente paso de schema)

Para evitar redundancia en `roles_permisos`:
1. mantener `permisos` como catalogo de codigos
2. agregar tabla `permiso_acciones(permiso_id, accion, activo)` como catalogo de capacidades validas
3. mantener `roles_permisos(rol_id, permiso_id, accion)` solo como asignacion

Con esto:
- no se insertan combinaciones invalidas (ej. `APROBAR` donde no existe flujo)
- `ADMIN_SISTEMA` puede poblarse automaticamente desde `permiso_acciones`
- el documento de matriz se vuelve trazable 1:1 con el schema

## Matriz de permisos por pagina (sidebar)

> Convenciones de roles: `ADM` (8), `REC` (1), `DIRA` (2), `DIRM` (3), `SECA` (4), `SECADM` (5), `DOC` (6), `EST` (7).

### MAT - Admisiones (`/estudiantes/listar`)
Permiso base: `matricula.admision.ver`
Endpoint(s): `GET /estudiantes`, `GET /estudiantes/:id`, `GET /estudiantes/export/...`, `POST/PUT/DELETE /estudiantes`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver listado/detalle de estudiantes | GET | ADM, REC, DIRA, DIRM, SECA, SECADM, EST |
| CREAR | Nuevo estudiante | POST | ADM, REC, DIRA, SECA |
| EDITAR | Editar estudiante | PUT | ADM, REC, DIRA, SECA |
| ELIMINAR | Eliminar estudiante | DELETE | ADM, REC (si se habilita), DIRM (si se habilita) |
| EXPORTAR | Exportar estadisticas/listas | GET `/export/...` | ADM, REC, DIRA, DIRM |

### MAT - Matriculas (`/matricula/listar`, `/matricula/nueva`)
Permisos: `matricula.inscribir`, `matricula.inscripcion.editar`
Endpoint(s): `GET/POST/PUT/DELETE /inscripciones`, `POST /inscripciones/:id/generar-formulario`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver matriculas | GET | ADM, REC, DIRA, SECA |
| CREAR | Registrar matricula | POST | ADM, REC, DIRA, SECA |
| EDITAR | Editar matricula | PUT | ADM, REC, DIRA, SECA |
| ELIMINAR | Eliminar matricula | DELETE | ADM, REC (segun politica), DIRM (si aplica) |

### MAT - Becas (`/estudiantes/becas/listar`, `/estudiantes/becas/asignar`)
Permisos: `matricula.beca.ver`, `matricula.beca.asignar`, `matricula.beca.aprobar`
Endpoint(s): `GET /estudiantes/becas`, `POST/DELETE /estudiantes/:id/scholarships | /estudiantes/becas/:id`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver becas asignadas | GET | ADM, REC, DIRA, SECA |
| CREAR | Asignar beca | POST | ADM, REC, DIRA, SECA |
| ELIMINAR | Eliminar beca asignada | DELETE | ADM, REC (segun politica) |
| APROBAR | Aprobar beca (flujo UI) | proceso | ADM, REC, DIRA |

### MAT/FIN - Aportes/Pagos (`/matricula/aportes/listar`, `/pagos/listar`, `/pagos/:id`)
Permisos: `matricula.pago.aporte.ver`, `finanzas.pago.ver`, `finanzas.pago.registrar`, `finanzas.pago.editar`
Endpoint(s): `GET/POST/DELETE /pagos-aportes`, `GET /pagos-aportes/:id/recibo`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver pagos/aportes | GET | ADM, REC, DIRM, SECADM, EST |
| CREAR | Registrar pago/cuota | POST | ADM, REC, DIRM, SECADM |
| ELIMINAR | Eliminar cuota de pago | DELETE | ADM, REC (si aplica) |
| EXPORTAR | Descargar recibo | GET `/recibo` | ADM, REC, DIRM |

### ACA - Calificaciones (`/calificaciones/...`)
Permisos: `academico.calificacion.*`

| Accion | Descripcion | Roles |
|---|---|---|
| VER | Ver notas/curso | ADM, REC, DIRA, SECA, DOC, EST (solo propio) |
| CREAR | Registrar parcial/practico/recuperatorio | ADM, REC, DIRA, SECA, DOC |
| EDITAR | Modificar calificaciones | ADM, REC, DIRA, SECA, DOC |

### ACA - Nivelaciones, Trazabilidad, Historial, Licencias
Permisos: `academico.nivelacion.*`, `academico.trazabilidad.*`, `academico.historial.*`, `academico.licencia.*`

| Accion | Descripcion | Roles |
|---|---|---|
| VER | Consultas academicas | ADM, REC, DIRA, SECA (y EST en historial propio) |
| CREAR | Solicitudes/registro operativo | ADM, REC, DIRA, SECA |
| EDITAR | Convalidacion/ajustes | ADM, REC, DIRA |
| APROBAR | Aprobaciones formales | ADM, REC, DIRA |

### DOC - Docentes y supervision (`/docentes/*`, `/supervision/*`)
Permisos: `docentes.*`, `docentes.supervision.*`

| Codigo (seed) | Acciones v2 (`permiso_acciones`) | Uso principal (UI) |
|---|---|---|
| `docentes.ver` (41) | LISTAR, DETALLE, EXPORTAR | Listado, ficha, export (cuando exista) |
| `docentes.crear` (42) | CREAR | Alta `/docentes/registrar` |
| `docentes.editar` (96) | EDITAR, ELIMINAR | Formulario edicion ficha; baja (DELETE API pendiente) |
| `docentes.asignar` (43) | CREAR, EDITAR, ELIMINAR | Asignacion docente-curso (`/docentes/asignar`, API `POST /docentes/asignaciones/curso`, modal en armado paralelo) |

| Accion | Descripcion | Roles |
|---|---|---|
| VER | Ver docentes/supervision | ADM, REC, DIRA, DIRM, DOC |
| CREAR | Nuevo docente/licencias/fichas | ADM, REC, DIRA |
| EDITAR | Ajustes supervision | ADM, REC, DIRA |
| APROBAR | Licencias docentes | ADM, REC, DIRA |

### INST - Institucional (`/institucional/*`)
Permisos: `institucional.*`

Rutas simplificadas vigentes del modulo:
- `/institucional/actual`
- `/institucional/cronogramas`
- `/institucional/oferta`
- `/institucional/horarios`
- `/institucional/pasadas`

Subrutas operativas de horarios (definidas en `frontend/.../institucional/routes.jsx`):
- `/institucional/horarios/generar` — `institucional.horario.asignar` + CREAR
- `/institucional/horarios/plantilla` — `institucional.horario.plantilla` + LISTAR
- `/institucional/horarios/paralelo/:id/gestion` — `institucional.gestion.horarios` + LISTAR
- `/institucional/horarios/armado` — `institucional.horario.armado` + EDITAR
- `/institucional/horarios/aulas` — `institucional.gestion.horarios` + LISTAR
- `/institucional/horarios/publicacion` — `institucional.horario.publicacion` + EDITAR

Permisos por etapa (seed `54-seed-permisos.sql`):
- `97` `institucional.horario.plantilla`
- `98` `institucional.horario.armado`
- `99` `institucional.horario.conflictos`
- `100` `institucional.horario.publicacion`

#### APIs alineadas (backend)

| Recurso | Metodo | Permiso | Accion | Notas |
|---------|--------|---------|--------|--------|
| `/api/v1/paralelos` | GET | `institucional.gestion.horarios` | LISTAR | Tablero / listado |
| `/api/v1/paralelos/:id/schedule` | GET | `institucional.gestion.horarios` | LISTAR | Cargar plan |
| `/api/v1/paralelos/:id/schedule` | PUT | `institucional.horario.armado` | EDITAR | Persistir bloques (misma regla que ruta armado) |
| `/api/v1/paralelos/:id/cursos-oferta` | GET | `institucional.gestion.horarios` | LISTAR | Oferta del paralelo |
| `/api/v1/paralelos/:id/cursos` | POST | `institucional.gestion.horarios` | CREAR | Alta curso en paralelo |
| `/api/v1/cursos/:id` | PATCH | `institucional.gestion.horarios` | EDITAR | Editar curso oferta |
| `/api/v1/cursos/:id` | DELETE | `institucional.gestion.horarios` | ELIMINAR | Baja curso oferta |
| `/api/v1/docentes/asignaciones/curso` | POST | `docentes.asignar` | EDITAR | Asignar docente a curso (desde modal en armado) |

UI: botones de **Guardar plan / Añadir bloque** usan `ActionButton` con `institucional.horario.armado` + EDITAR; **Asignar docente** usa `docentes.asignar` + EDITAR (listado en tab Cursos del paralelo).

#### Hook `useHorariosOfertaPermisos`

CREAR/EDITAR/ELIMINAR de la tabla de cursos en armado acepta `institucional.gestion.horarios` **o** las mismas acciones sobre `institucional.horario.plantilla` si el rol las tiene en seed (p. ej. plantilla con CREAR).

### REP - Reportes (`/reportes/*`)
Permisos: `reportes.*`

| Accion | Descripcion | Roles |
|---|---|---|
| VER | Ver reportes y solicitudes | ADM, REC, DIRA, DIRM |

### SEG - Seguridad (`/seguridad/*`)
Permisos: `seguridad.usuario.crear`, `seguridad.usuario.administrar`, `seguridad.rol.gestionar`
Endpoint(s): `GET/POST/PUT/PATCH/DELETE /usuarios`, `GET/PUT /roles/:id/permisos`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver usuarios/roles/permisos | GET | ADM, REC, DIRM |
| CREAR | Crear usuario | POST /usuarios | ADM, REC, DIRM |
| EDITAR | Editar usuario y rol-permisos | PUT/PATCH | ADM, REC |
| ELIMINAR | Eliminar override de permiso | DELETE /usuarios/:id/permisos/:overrideId | ADM, REC |

## Auditoria backend (API Express)

Revision sobre `backend/src/presentation/routes/*.routes.js` y `permisos.middleware.js`.

**Cadena RBAC:** tras `authenticate`, `verificarPermiso(codigo, accion)` llama a `AuthRepository.tienePermiso(usuarioId, codigo, accion)`. Respuesta tipica si falla: **403** con `{ error: 'Acceso denegado', codigo, accion }`. Para `rol_id = 1` (ADMIN_SISTEMA) la vigencia del par se valida contra el catalogo `permiso_acciones` (vista `vista_catalogo_acciones_permisos_activas`); para el resto, contra `vista_usuario_permisos_efectivos` / seed `55-seed-roles-permisos.sql`.

### Modulo Seguridad (`/api/v1/usuarios`, `/roles`, `/permisos`)

| Metodo | Ruta | Permiso | Accion |
|--------|------|---------|--------|
| GET | `/usuarios` | `seguridad.usuario.administrar` | LISTAR |
| POST | `/usuarios` | `seguridad.usuario.crear` | CREAR |
| GET | `/usuarios/alta/buscar-estudiantes`, `/alta/buscar-docentes` | `seguridad.usuario.crear` | CREAR |
| GET | `/usuarios/:id` | `seguridad.usuario.administrar` | DETALLE |
| PUT, PATCH `/:id`, `/:id/estado`, `/:id/password` | | `seguridad.usuario.administrar` | EDITAR |
| GET | `/usuarios/:id/permisos` | `seguridad.rol.gestionar` | LISTAR |
| POST, DELETE | `/usuarios/:id/permisos`, `/:id/permisos/:overrideId` | `seguridad.rol.gestionar` | EDITAR |
| GET | `/roles`, `/roles/:id/permisos`, `/roles/:id/permisos-grilla` | `seguridad.rol.gestionar` | LISTAR |
| PUT | `/roles/:id/permisos` | `seguridad.rol.gestionar` | EDITAR |
| GET | `/permisos` | `seguridad.rol.gestionar` | LISTAR |

Los controladores de seguridad deben mantener reglas de negocio extra (p. ej. inmutabilidad de ADMIN_SISTEMA) ademas del middleware.

### Modulos ya cruzados con seeds y frontend

- **Paralelos / horarios:** `GET` paralelos, schedule, cursos-oferta → `institucional.gestion.horarios` (LISTAR o CREAR segun ruta); `PUT /paralelos/:id/schedule` → `institucional.horario.armado` + **EDITAR**.
- **Cursos oferta:** PATCH/DELETE `/cursos/:id` → EDITAR / ELIMINAR sobre `institucional.gestion.horarios`.
- **Docentes:** listado/detalle/CRUD y asignaciones alineados con `docentes.ver`, `docentes.crear`, `docentes.editar`, `docentes.asignar` (POST asignacion curso con mismo stack que **EDITAR** en `docentes.asignar`, coherente con UI).

### Catálogos de referencia (`sistema.catalogo.referencia`, permiso_id **101**, acción **LISTAR**)

Middleware compartido: `listarCatalogoReferencia` (`authenticate` + `verificarPermiso`). Seeds: `54-seed-permisos.sql`, `56-seed-permiso-acciones.sql`, `55-seed-roles-permisos.sql` (roles **2–8** con LISTAR; rol **1** via catálogo `permiso_acciones`).

| Archivo | GET |
|---------|-----|
| `paises.routes.js` | `/api/v1/paises` |
| `provincias.routes.js` | `/api/v1/provincias` |
| `municipios.routes.js` | `/api/v1/municipios` |
| `departamentos.routes.js` | `/api/v1/departamentos` |
| `idiomas.routes.js` | `/api/v1/idiomas` |
| `tipos-parentesco.routes.js` | `/api/v1/tipos-parentesco` |
| `estados-civiles.routes.js` | `/api/v1/estados-civiles` |
| `discapacidad.routes.js` | `/api/v1/discapacidad` |
| `documentacion.routes.js` | `/api/v1/documentacion` |
| `metodos-pago.routes.js` | `/api/v1/metodos-pago` |
| `bancos-autorizados.routes.js` | `/api/v1/bancos-autorizados` |
| `cuentas-pago.routes.js` | `/api/v1/cuentas-pago` |
| `dashboard.routes.js` | `/api/v1/dashboard/resumen` |

## Hallazgos de la auditoria

- Docentes: permiso dedicado `docentes.editar` (id 96) separa **EDITAR** ficha de **CREAR** alta; **ELIMINAR** en UI queda listo; endpoint `DELETE /docentes/:id` pendiente de implementar.
- Existen `DELETE` activos para estudiantes, becas asignadas, inscripciones, pagos y overrides de usuarios.
- Existen `EXPORTAR` reales en estudiantes (excel) y pagos (recibo PDF).
- `ADMIN_SISTEMA` debe ser inmutable en SEG; se protegio en backend y UI.
- `PUT /api/v1/paralelos/:id/schedule` exige `institucional.horario.armado` + EDITAR (alineado con pantalla armado).
