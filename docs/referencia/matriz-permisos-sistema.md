# Matriz de Permisos - Instituto INCOS
## Ultima actualizacion: 2026-05-27

Documento de auditoria funcional (frontend + backend + seeds) sobre permisos por accion.

**Arquitectura:** frontend `.cursor/rules/incos-frontend-module.mdc` · backend `.cursor/rules/incos-backend-module.mdc` · guías `docs/guias/implementacion-*` y `checklist-*`.

## ADMIN_SISTEMA (rol_id = 1)

El usuario **admin** inicial (`57-seed-usuarios-admin.sql`) tiene `rol_id = 1`. No tiene filas en `roles_permisos` (seeder **55**); los permisos efectivos salen del catalogo **56** (`permiso_acciones`) via `AuthRepository` / `vista_catalogo_acciones_permisos_activas`.

En **RolPermisosPage**, la grilla usa `vista_grilla_roles_permisos_agrupada`: para `rol_id = 1` el backend marca como asignadas todas las acciones validas del catalogo (misma fuente que login), no las filas vacias de `roles_permisos`.

Tras cambiar `ruta_sidebar` o `grupo_ui` en el seeder **54**, en BD ya existente conviene re-seed de permisos o `UPDATE` manual; en instalación nueva basta con los seeders **53–57** y las vistas **32–33**.

## Criterio canon para nuevas funciones (ABM limpio + seguridad)

Todo alta/baja/modificacion (ABM) o nueva pantalla de un modulo debe cumplir estas restricciones minimas:

1. **Arquitectura limpia por capa** (detalle en `.cursor/rules/incos-frontend-module.mdc`)
   - Carpetas alineadas al **menu lateral** (un directorio por item de menu).
   - `presentation/pages`: UI pura.
   - `application/hooks/api|features|state`: API; listados en tabs (`features`); pantallas (`state`).
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

## Entradas por permisos (patron global de aterrizaje)

Cuando **un mismo item de menu** (`permiso` de **ingreso**, accion **LISTAR**) agrupa **varias pantallas** con permisos distintos (p. ej. coordinacion admin vs mis cursos del docente), la eleccion de pantalla **no depende del codigo de rol** (`DOCENTE`, `RECTOR`, …) sino de **que permisos hijos tiene el usuario** segun seed **55** y catalogo **56**.

### Capas del modelo

| Capa | Seed / artefacto | Responsabilidad |
|------|------------------|-----------------|
| Menu lateral | permiso **ingreso** (ej. id 15 `academico.calificacion.ingreso`) | Visibilidad del item en sidebar (`filterMenuByPermiso` + accion LISTAR) |
| Pantallas hijas | permisos 16–24, rutas hijas en `routes.jsx` | Cada pantalla con `permiso` + `accion`; `PrivateRoute` bloquea URL directa |
| Aterrizaje | `menu.landingStack` en la ruta de ingreso | Orden de preferencia al abrir el modulo (click menu o URL de ingreso) |
| Modo de subpantallas | `viewStack` en la ruta raiz del modulo (misma key que menu) | API / UI segun permiso efectivo (`useRouteViewMode`) |

### Esquema `menu.landingStack`

Declarar en la ruta que tiene `menu` (fuente unica en `routes.jsx`):

```javascript
menu: {
  label: 'Calificaciones',
  module: 'ACA',
  parent: 'ACA',
  order: 1,
  labelByRole: { ESTUDIANTE: 'Mis calificaciones' }, // solo etiqueta visible, no routing
  landingStack: [
    { permiso: 'academico.calificacion.coordinacion', accion: 'LISTAR' },
    { permiso: 'academico.calificacion.mis_cursos', accion: 'LISTAR', redirectTo: '/academico/calificaciones/mis-cursos' },
  ],
},
```

Reglas:

1. **Primera entrada cuyo par permiso+accion el usuario cumple gana** (misma regla en sidebar y en URL de ingreso).
2. Sin `redirectTo` → render **inline** (vista en la ruta de ingreso).
3. Con `redirectTo` → **Navigate** a la ruta hija (docente, estudiante, vista propia, etc.).
4. **`labelByRole`** solo cambia texto del menu; **nunca** sustituye permisos ni paths.
5. Controles de retorno (boton volver) usan **`hasPermiso(..., 'LISTAR')`** del permiso de coordinacion/admin, no comparacion de rol.

### Esquema `viewStack` (subpantallas del modulo)

Declarar **una vez** en la ruta del menu del modulo (propiedad de primer nivel en `routes.jsx`, no dentro de `menu`):

```javascript
import { MODULO_VIEW_STACK } from '@application-.../config/moduloViewStack.js';

{
  key: 'ACA-CAL',
  path: '/academico/calificaciones',
  menu: { /* ... */, landingStack: [ /* entrada */ ] },
  viewStack: MODULO_VIEW_STACK,
}
```

```javascript
export const MODULO_VIEW_STACK = [
  {
    id: 'coordinacion',
    permiso: 'academico.calificacion.coordinacion',
    accion: 'LISTAR',
    persistContext: { stateKey: 'docenteId', nameKey: 'docenteNombre' },
  },
  {
    id: 'propio',
    permiso: 'academico.calificacion.mis_cursos',
    accion: 'LISTAR',
  },
];
```

Reglas:

1. Misma prioridad por permisos que `landingStack` (no por rol).
2. Entrada con `persistContext` solo activa si el usuario tiene ese permiso **y** hay `docenteId` en `location.state` o en `sessionStorage` (`incos:view-context:{moduleKey}`).
3. Sin contexto persistido, cae al siguiente modo (ej. docente → `propio` + `GET /mis-cursos`).
4. En hooks de datos: `const { isView, contextId } = useRouteViewMode('ACA-CAL-MIS-CURSOS')` — resuelve el `viewStack` del ancestro `ACA-CAL`.
5. **No** crear hooks `useXxxVistaContext` por modulo salvo alias fino; la logica vive en `useRouteViewMode`.

| Pieza | Ubicacion |
|-------|-----------|
| `resolveViewStack` | `infrastructure/navigation/utils/resolveViewStack.js` |
| `findViewStackForRoute` | mismo archivo |
| `useRouteViewMode` | `infrastructure/navigation/hooks/useRouteViewMode.js` |

### Componentes frontend (reutilizables)

| Pieza | Ubicacion | Uso |
|-------|-----------|-----|
| `resolveModuleLanding` | `infrastructure/navigation/utils/resolveModuleLanding.js` | Logica pura: stack + hasPermiso → inline \| redirect |
| `resolveEffectiveMenuPath` | mismo archivo | Path al hacer clic en sidebar |
| `getEffectiveRouteFromMenuKey` | `infrastructure/navigation/services/routeMapper.js` | Lee `landingStack` del registry por `menuKey` |
| `ModuleEntryConnector` | `infrastructure/navigation/components/ModuleEntryConnector.jsx` | Conector generico en `element` de la ruta de ingreso |
| `AccessDeniedRedirect` + `notifyAccessDenied` | `infrastructure/navigation/components/AccessDeniedRedirect.jsx` | Notificacion Ant Design (`title` + `description`) y redirect; usado por `ModuleEntryConnector` y `PrivateRoute` |
| Conector del modulo | ej. `CalificacionesEntradaConnector` | Wrapper minimo: `menuKey` + `inlineElement` (pagina admin/coordinacion) |

**Dashboard (vista previa vs detalle):**

| Dato en panel | API | Permiso middleware | Detalle / listado ABM |
|---|---|---|---|
| Carreras, docentes, estudiantes, actividades, conteos | `GET /dashboard/resumen` | `sistema.catalogo.referencia` + LISTAR (105) | Requiere permiso del modulo (`cfg.academico.carreras`, `docentes.ver`, `matricula.admision.ver`, etc.) |
| ABM carreras | `GET /carreras` | `cfg.academico.carreras` + LISTAR | No usar en dashboard; solo administracion |

Frontend: `useDashboardData` carga solo `/dashboard/resumen`. `useDashboardGuardedNavigate` muestra notificacion de acceso denegado si el usuario pulsa "Ver todas", tarjeta o actividad sin permiso de detalle (misma notificacion que `PrivateRoute`).

Ejemplo conector del modulo:

```jsx
import ModuleEntryConnector from '@navigation/components/ModuleEntryConnector.jsx';
import CoordinacionPage from '../pages/CoordinacionPage.jsx';

const CalificacionesEntradaConnector = () => (
  <ModuleEntryConnector menuKey="ACA-CAL" inlineElement={<CoordinacionPage />} />
);
```

### Checklist al agregar un modulo con vistas distintas por perfil

1. **Seed 54**: permiso de **ingreso** (menu) + permisos por pantalla hija (IDs fijos).
2. **Seed 56**: acciones validas por permiso.
3. **Seed 55**: asignar a cada rol solo los permisos que le corresponden (docente **sin** coordinacion si no debe ver listado global).
4. **`routes.jsx`**: ruta de ingreso con `permiso` ingreso; hijas con permisos propios; `landingStack` + `viewStack` (archivo `config/*ViewStack.js` del modulo).
5. **`ModuleEntryConnector`** + pagina inline para la vista admin/coordinacion.
6. **Hooks de datos**: `useRouteViewMode(routeKey)` para elegir API segun `isView('coordinacion'|'propio')` y `contextId`.
7. **UI**: ocultar acciones admin con `PermisoGuard` / `ActionButton`, no con `if (rol === 'DOCENTE')`.
8. **Documentar** fila en esta matriz (permisos, stacks, roles en seed 55).

Referencia implementada: **ACA · Calificaciones** (`ACA-CAL`, seeds 15–24, rol DOCENTE id 7 en seed 55).

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

### ACA - Académico (`/academico/*`)
Submódulos (cada uno con directorio y `routes.jsx` bajo `modules/academico/`):

| Menú | Ruta canónica | Permisos (grupo) |
|------|---------------|------------------|
| Calificaciones | `/academico/calificaciones` | `academico.calificacion.*` |
| Nivelaciones | `/academico/nivelaciones/listar` | `academico.nivelacion.*` |
| Traspasos | `/academico/traspasos/listar` | `academico.trazabilidad.traspaso.*` |
| Transitabilidad | `/academico/transitabilidad/listar` | `academico.trazabilidad.transitabilidad.*` |
| Historial | `/academico/historial/academico` | `academico.historial.*` |
| Licencias estudiantiles | `/academico/licencias/listar` | `academico.licencia.*` |
| Avance académico | `/academico/avance` | `academico.avance` |

Raíz `/academico`: dashboard pendiente (`UnderConstruction`).

### ACA - Calificaciones (detalle rutas)
Permisos: `academico.calificacion.*` — menu: `/academico/calificaciones` (IDs 15–24)

**Aterrizaje (`landingStack` en `ACA-CAL`):** coordinacion (16) inline → mis cursos (17) redirect. Rol DOCENTE (7) solo tiene 15+17+18+21–23 en seed 55 → entra directo a mis cursos. Roles con 16 (RECTOR, DIR_ACADEMICO, SEC_ACADEMICA) ven coordinacion.

**API mis cursos:** DOCENTE usa `GET /calificaciones/mis-cursos` (permiso 17). El backend resuelve el docente por `docentes.usuario_id` o, si falta, por `usuarios.referencia_id` + `tipo_referencia = DOCENTE` (y sincroniza `usuario_id` en docentes). Sin vínculo → 403 con mensaje de contacto a coordinación. Seeder demo: `60-seed-usuario-docente-demo.sql` (usuario `docente`, docente id=1). `GET /calificaciones/coordinacion/docentes/:id/cursos` exige permiso 16; el frontend solo lo llama si `hasPermiso(coordinacion)` y hay `docenteId` en contexto (ver `useCalificacionesVistaContext`).

| Permiso (codigo) | Acciones | Pantalla / comportamiento | Roles |
|---|---|---|---|
| `academico.calificacion.ingreso` | LISTAR | Item menu Calificaciones | REC, DIRA, SECA, DOC, EST |
| `academico.calificacion.coordinacion` | LISTAR | Vista general docentes (inline en ingreso) | REC, DIRA, SECA |
| `academico.calificacion.mis_cursos` | LISTAR, DETALLE | Mis cursos del docente (redirect desde ingreso si no hay 16) | REC, DIRA, SECA, DOC |
| `academico.calificacion.cuaderno` | LISTAR | Cuaderno de notas | REC, DIRA, SECA, DOC |
| `academico.calificacion.politica` | EDITAR (pantalla); LISTAR en ruta de menú | `/academico/calificaciones/politica` (solo edición) | REC, DIRA, SECA |
| `sistema.catalogo.referencia` | LISTAR | **API complemento:** `GET /calificaciones/politica`, `/politica/catalogo`, `/tipos-evaluacion` (cuaderno, drawer, vista previa). Cualquier usuario con rol; no aparece en grilla Seguridad | Todos con rol |
| `academico.calificacion.gestion_bimestres` | LISTAR, EDITAR | `/academico/calificaciones/gestion-bimestres` | REC, DIRA, SECA |
| `academico.calificacion.cuaderno.evaluaciones` | CREAR, EDITAR, ELIMINAR | Evaluaciones (columnas) del cuaderno | REC, DIRA, SECA, DOC |
| `academico.calificacion.cuaderno.notas` | EDITAR | Notas (celdas) del cuaderno | REC, DIRA, SECA, DOC |
| `academico.calificacion.cuaderno.guardar` | EDITAR | Guardar bimestre y recalcular componentes | REC, DIRA, SECA, DOC |
| `academico.calificacion.bimestre.ajuste_admin` | EDITAR | Consolidado bimestre cerrado: habilitación / ajuste administrativo | REC, DIRA, SECA |

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
| `docentes.ver` (45) | LISTAR, DETALLE, EXPORTAR | Listado, ficha, export (cuando exista) |
| `docentes.crear` (42) | CREAR | Alta `/docentes/registrar` |
| `docentes.editar` (96) | EDITAR, ELIMINAR | Formulario edicion ficha; baja (DELETE API pendiente) |
| `docentes.asignar` (43) | CREAR, EDITAR, ELIMINAR | Asignacion docente-curso (`/docentes/asignar`, API `POST /docentes/asignaciones/curso`, modal en armado paralelo) |

| Accion | Descripcion | Roles |
|---|---|---|
| VER | Ver docentes/supervision | ADM, REC, DIRA, DIRM, DOC |
| CREAR | Nuevo docente/licencias/fichas | ADM, REC, DIRA |
| EDITAR | Ajustes supervision | ADM, REC, DIRA |
| APROBAR | Licencias docentes | ADM, REC, DIRA |

**Rol DOCENTE (7) — alcance propio (seed 55):** `docentes.licencia.ver` (48) LISTAR + `docentes.licencia.crear` (49) CREAR (menú Licencias docentes; sin `docentes.ver`). Pasantías docentes: (56) LISTAR + CREAR, (57) EDITAR (menú `/supervision/pasantias`; sin supervisión ni listado de plantilla).

### INST - Institucional (`/institucional/*`)
Permisos: `institucional.*`

Rutas simplificadas vigentes del modulo:
- `/institucional/actual`
- `/institucional/cronogramas`
- `/institucional/oferta` (wizard oferta; redirect desde `/institucional/oferta-academica`)
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

#### Oferta académica (Sprint 3)

| Código (seed) | ID | Acciones (56) | UI |
|---|---|---|---|
| `institucional.oferta.gestion-plan` | 105 | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | Paso 1–2 wizard: gestión vigente, habilitar plan |
| `institucional.oferta.paralelo-gestion` | 106 | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | Paso 3: paralelos_gestion, aula, turno, estado |
| `institucional.oferta.cursos` | 107 | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | Generar/validar oferta_cursos, drawer manual |

| Recurso API | Método | Permiso | Acción |
|-------------|--------|---------|--------|
| `/api/v1/gestiones` | GET | `institucional.gestion.actual` **o** `institucional.oferta.gestion-plan` | LISTAR | Wizard paso 1 (cualquiera de los dos) |
| `/api/v1/gestiones/:id/marcar-vigente` | POST | `institucional.oferta.gestion-plan` | ACTIVAR |
| `/api/v1/gestiones/:id/planes-habilitados` | GET | `institucional.oferta.gestion-plan` | LISTAR |
| `/api/v1/gestiones-planes` | POST | `institucional.oferta.gestion-plan` | CREAR |
| `/api/v1/gestiones-planes/:id/estado` | PUT | `institucional.oferta.gestion-plan` | EDITAR |
| `/api/v1/gestiones-planes/:id/paralelos-gestion` | GET | `institucional.oferta.paralelo-gestion` | LISTAR |
| `/api/v1/gestiones-planes/:id/generar-paralelos-gestion` | POST | `institucional.oferta.paralelo-gestion` | CREAR |
| `/api/v1/paralelos-gestion/:id` | GET/PUT | `institucional.oferta.paralelo-gestion` | DETALLE / EDITAR |
| `/api/v1/paralelos-gestion/:id/cambiar-turno` | PUT | `institucional.oferta.paralelo-gestion` | EDITAR |
| `/api/v1/paralelos-gestion/:id/estado` | PUT | `institucional.oferta.paralelo-gestion` | EDITAR |
| `/api/v1/paralelos-gestion/:id/oferta-cursos` | GET | `institucional.oferta.cursos` | LISTAR |
| `/api/v1/paralelos-gestion/:id/generar-oferta` | POST | `institucional.oferta.cursos` | CREAR |
| `/api/v1/paralelos-gestion/:id/validar-oferta` | GET | `institucional.oferta.cursos` | LISTAR |
| `/api/v1/oferta-cursos` | POST | `institucional.oferta.cursos` | CREAR |
| `/api/v1/oferta-cursos/:id/estado` | PUT | `institucional.oferta.cursos` | EDITAR |
| `/api/v1/oferta-cursos/:id` | DELETE | `institucional.oferta.cursos` | ELIMINAR |
| `/api/v1/aulas/catalogo` | GET | `institucional.oferta.paralelo-gestion` | LISTAR |

**Roles (55):** RECTOR (2) y SEC_ACADEMICA (5) operación completa; DIR_ACADEMICO (3) CREAR/EDITAR/LISTAR/DETALLE sin ACTIVAR masivo.

Rutas retiradas del router (tabla `cursos` ya no existe): `GET/POST /paralelos/:id/cursos-oferta`, `POST /paralelos/:id/cursos`, `GET/PUT /paralelos/:id/schedule`, montaje `/api/v1/cursos`.

#### APIs alineadas (backend)

| Recurso | Metodo | Permiso | Accion | Notas |
|---------|--------|---------|--------|--------|
| `/api/v1/paralelos` | GET | `institucional.gestion.horarios` | LISTAR | Tablero / listado |
| `/api/v1/paralelos/:id/schedule` | GET | `institucional.gestion.horarios` | LISTAR | Cargar plan |
| `/api/v1/paralelos/:id/schedule` | PUT | `institucional.horario.armado` | EDITAR | Persistir bloques (misma regla que ruta armado) |
| _(retiradas)_ `/paralelos/:id/cursos-oferta`, `/paralelos/:id/cursos`, `/cursos/:id` | — | — | — | Usar API oferta (tabla arriba) |
| `/api/v1/docentes/asignaciones/curso` | POST | `docentes.asignar` | EDITAR | Asignar docente a curso (desde modal en armado) |

UI: botones de **Guardar plan / Añadir bloque** usan `ActionButton` con `institucional.horario.armado` + EDITAR; **Asignar docente** usa `docentes.asignar` + EDITAR (listado en tab Cursos del paralelo).

#### Hook `useHorariosOfertaPermisos`

CREAR/EDITAR/ELIMINAR de la tabla de cursos en armado acepta `institucional.gestion.horarios` **o** las mismas acciones sobre `institucional.horario.plantilla` si el rol las tiene en seed (p. ej. plantilla con CREAR).

### CFG - Configuracion (`/configuracion/*`)

**Arquitectura frontend:** `.cursor/rules/incos-frontend-module.mdc`. Seeds: ids **78–93** en `54-seed-permisos.sql`, acciones en **56**, asignacion roles en **55**.

#### Académico — Plan de estudio (menu unico, tabs + subruta)

| Ruta UI | Permiso (codigo) | ID | Acciones tipicas (56) | Uso |
|---------|------------------|-----|----------------------|-----|
| `/configuracion/academico` | Entrada: `permisoAny` 78–80 | — | LISTAR en cada tab visible | Menu "Academico"; tabs filtrados por permiso |
| `?tab=planes` | `configuracion.plan-estudio` | 80 | LISTAR, DETALLE, CREAR, EDITAR, ACTIVAR | Tab planes |
| `?tab=carreras` | `configuracion.carrera` | 78 | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR | Tab carreras |
| `?tab=materias` | `configuracion.materia` | 79 | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR | Tab materias |
| `/configuracion/academico/plan/:planId` | `configuracion.plan-estudio` | 80 | DETALLE (+ EDITAR matriz via 82) | Matriz del plan; prerrequisitos usan 83 |
| (API periodos) | `configuracion.plan-estudio.periodos` | 81 | LISTAR, CREAR, EDITAR, ELIMINAR | Anios del plan |
| (API asignaturas) | `configuracion.plan-estudio.asignaturas` | 82 | LISTAR, CREAR, EDITAR, ELIMINAR | Celdas matriz |
| (API prerrequisitos) | `configuracion.plan-estudio.prerrequisitos` | 83 | LISTAR, DETALLE, CREAR, ELIMINAR | Editor en detalle de plan |

Redirects legacy: `/configuracion/academico/carreras|materias` → tab; no requieren permiso distinto.

**Roles (seed 55):** RECTOR (2), DIR_ACADEMICO (3) y SEC_ACADEMICA (5) tienen bloque amplio 78–83; DIR_ADMIN y SEC_ADMIN sin CFG academico salvo casos puntuales documentados en 55. **Nota:** RECTOR incluye `DETALLE` en 79 (materia); DIR_ACADEMICO incluye `DETALLE` en 80 (plan) para abrir matriz; edicion de celdas sigue requiriendo 82 `EDITAR`.

#### Datos complementarios (tabs)

| Ruta UI canonica | Permiso | ID | Notas |
|------------------|---------|-----|--------|
| `/configuracion/complementarios` | `permisoAny` 88–90 | — | Menu "Datos complementarios" |
| `?tab=discapacidad` | `configuracion.complementario.discapacidad` | 88 | Listado operativo |
| `?tab=apoderados` | `configuracion.complementario.apoderados` | 89 | Placeholder / pendiente ABM |
| `?tab=idiomas` | `configuracion.complementario.idiomas` | 90 | Placeholder / pendiente ABM |

`ruta_sidebar` en seed 54 aun apunta `/configuracion/datos-complementarios`; la app redirige a `/configuracion/complementarios`. Alinear seed en proxima migracion de permisos.

#### Otros items CFG (rutas separadas)

| Menu | Ruta | Permisos (ids) |
|------|------|----------------|
| Documentacion | `/configuracion/documentacion` | 84–87 |
| Convenios | `/configuracion/convenios` | 91 |
| Historial actividades | `/configuracion/historial-actividades` | 93 |
| Pagos config | `/pagos/configuracion` | 92 |

Codigos legacy `cfg.academico.*` **no** deben usarse en codigo nuevo; fueron reemplazados por `configuracion.*`.

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

### Catálogos de referencia (`sistema.catalogo.referencia`, permiso_id **105**, acción **LISTAR**)

**Permiso técnico (transparente para Seguridad).** No tiene `grupo_ui` ni `ruta_sidebar`: **no aparece** en `RolPermisosPage` / `PermisosDominioPicker`. No se guarda en `roles_permisos` (55).

**Quién lo tiene:** cualquier usuario autenticado con `rol_id` asignado (`AuthRepository.tienePermiso` devuelve true para LISTAR). Así un rol con “crear estudiante” no queda sin combos de país, idioma, método de pago, etc.

**Dónde se declara:** no hace falta un permiso por tabla en los schemas SQL (`02`, `03`, `11`, `13`, …). Las tablas son datos; la regla vive en **cada ruta GET** del backend con `listarCatalogoReferencia` (alias `complementoPaginaLectura`). No se monta middleware global en `routes/index.js`: cada router marca qué lectura es catálogo vs operación de módulo.

**Bloquear datos concretos** (una carrera inactiva, un idioma dado) es configuración de negocio en CFG o estado `activo` en tablas, no este toggle.

Middleware: `listarCatalogoReferencia` (`authenticate` + `verificarPermiso`). Catálogo en `permiso_acciones` (56) para validar que la acción existe en el sistema.

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
| `calificaciones.routes.js` | `/api/v1/calificaciones/politica`, `/politica/catalogo`, `/tipos-evaluacion` |

## Hallazgos de la auditoria

- Docentes: permiso dedicado `docentes.editar` (id 96) separa **EDITAR** ficha de **CREAR** alta; **ELIMINAR** en UI queda listo; endpoint `DELETE /docentes/:id` pendiente de implementar.
- Existen `DELETE` activos para estudiantes, becas asignadas, inscripciones, pagos y overrides de usuarios.
- Existen `EXPORTAR` reales en estudiantes (excel) y pagos (recibo PDF).
- `ADMIN_SISTEMA` debe ser inmutable en SEG; se protegio en backend y UI.
- `PUT /api/v1/paralelos/:id/schedule` exige `institucional.horario.armado` + EDITAR (alineado con pantalla armado).

### RBAC en UI (`ActionButton` / `TableActions`)

- `TableActions` sin objeto `permisos` **no muestra** ver/editar/eliminar (fail-closed en `cumplePermisoRef`).
- Tablas con permisos: estudiantes, docentes, becas, pagos, inscripciones (matrícula), roles (seguridad).
- Botones de cabecera y filas en becas, horarios (aulas/armado/publicar), docentes (asignaciones), pagos (registrar), calificaciones y matrícula inscripciones usan `ActionButton` con el permiso+acción del seed.

### Grilla de roles (`grupo_ui` vs rutas)

- Una fila en `PermisosDominioPicker` = un `grupo_ui` (no una fila por cada permiso con distinta `ruta_sidebar`).
- Horarios por etapa: `inst_horarios` (tablero), `inst_horarios_plantilla`, `inst_horarios_armado` (incluye conflictos, perm. 99), `inst_horarios_publicacion`.
- Varias rutas del mismo grupo se muestran concatenadas en la columna de ruta (` · `).
