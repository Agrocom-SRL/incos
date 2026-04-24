# Documento 2 — Estructura final del sidebar
## Sistema de Gestión Académica · Instituto INCOS
**Versión:** 2.0
**Fecha:** 2026-04-08

---

## 1. Principios del nuevo modelo de sidebar

### Regla principal
**El sidebar expone funcionalidades, no rutas.** Cada ítem del menú representa un punto de entrada a una capacidad del sistema, no la estructura interna del código.

### Tres tipos de ítem

| Tipo | Descripción | `accion` requerida | Ejemplo |
|---|---|---|---|
| **Grupo de datos** | Abre página de listado. Las acciones internas (detalle, crear, editar) viven dentro de esa página. | `LISTAR` | Admisión, Calificaciones, Usuarios |
| **Acceso rápido** | Abre directamente un formulario de creación. Solo aparece si el rol tiene `CREAR`. | `CREAR` | + Nueva admisión |
| **Ítem con tabs internas** | Una sola página que agrupa múltiples entidades relacionadas. Cada tab se muestra si `hasPermiso`. | `LISTAR` del permiso más básico del grupo | Config. académica |

### Regla de visibilidad
- Un ítem con permiso aparece si `hasPermiso(codigo, accion) === true`
- Un ítem **sin permiso** (contenedor sin hijos) **nunca aparece**
- Un contenedor sin permiso propio aparece si **al menos un hijo** es visible
- Los ítems de **perfil de usuario** no tienen permiso — son accesibles para cualquier usuario autenticado

### Comportamiento por rol estudiante
El mismo sidebar con ítems distintos. El sistema detecta `tipo_referencia = 'ESTUDIANTE'` en el token y:
- Aplica `labelByRole: { ESTUDIANTE: 'Mis calificaciones' }` para mostrar lenguaje en primera persona
- El backend filtra datos automáticamente por `referencia_id` del usuario autenticado
- No es un frontend separado ni rutas distintas — es la misma página con datos distintos

---

## 2. Mapa completo de módulos (9 módulos + perfil)

### Módulo: DASH — Dashboard
| Key | Label | Permiso | Acción | Tipo |
|---|---|---|---|---|
| `DASH` | Dashboard | — | — | sin permiso (acceso universal) |

---

### Módulo: MAT — Matrícula

**Conceptos:** Todo el ciclo de relación formal del estudiante con el instituto — entra por admisión, se mantiene por matrícula, sale por egreso.

| Key | Label | Label (rol estudiante) | Permiso | Acción | Tipo |
|---|---|---|---|---|---|
| `MAT-ADMISION` | Admisión | — (no ve) | `matricula.admision.ver` | `LISTAR` | Grupo de datos |
| `MAT-LISTA` | Matrículas | — (no ve) | `matricula.inscribir` | `LISTAR` | Grupo de datos |
| `MAT-APO-LISTA` | Aportes | Mis aportes | `matricula.pago.aporte.ver` | `LISTAR` | Grupo de datos |
| `MAT-BEC-LISTAR` | Becas | Mi beca | `matricula.beca.ver` | `LISTAR` | Grupo de datos |
| `MAT-PAS-LISTA` | Pasantías | Mi pasantía | `matricula.pasantia.ver` | `LISTAR` | Grupo de datos |
| `MAT-ADM-NUEVA` | + Nueva admisión | — (no ve) | `matricula.admision.ver` | `CREAR` | Acceso rápido |

**Rutas internas (menu: null) — protegidas pero no en sidebar:**
- `/estudiantes/:id` → `DETALLE`
- `/estudiantes/:id/editar` → `EDITAR`
- `/estudiantes/registrar` → `CREAR`
- `/matricula/nueva` → `CREAR`
- `/inscripciones/:id` → `DETALLE`
- `/inscripciones/:id/editar` → `EDITAR`
- `/pagos-aportes/:id` → `DETALLE`
- `/pagos-aportes/:id/editar` → `EDITAR`
- `/pasantias/:id` → `DETALLE`
- `/pasantias/:id/editar` → `EDITAR`
- `/estudiantes/documentos` → `GENERAR_PDF`

---

### Módulo: ACA — Académico

**Conceptos:** Todo lo que modifica o consulta el expediente académico del estudiante durante el cursado activo.

| Key | Label | Label (rol estudiante) | Permiso | Acción | Tipo |
|---|---|---|---|---|---|
| `ACA-CAL` | Calificaciones | Mis calificaciones | `academico.calificacion.curso` | `LISTAR` | Grupo de datos |
| `ACA-NIV` | Nivelaciones | Mi nivelación | `academico.nivelacion.ver` | `LISTAR` | Grupo de datos |
| `ACA-TRASPASOS` | Traspasos | — (no ve) | `academico.trazabilidad.traspaso.ver` | `LISTAR` | Grupo de datos |
| `ACA-TRANSIT` | Transitabilidad | — (no ve) | `academico.trazabilidad.transitabilidad.ver` | `LISTAR` | Grupo de datos |
| `ACA-HIS` | Historial | Mi historial | `academico.historial.academico` | `LISTAR` | Grupo de datos |
| `ACA-AVANCE` | Avance académico | Mi avance | `academico.avance` | `LISTAR` | Grupo de datos |
| `ACA-LIC-EST` | Licencias estudiantiles | — (no aplica en esta fase) | `academico.licencia.ver` | `LISTAR` | Grupo de datos |

**Rutas internas (menu: null):**
- `/calificaciones/registrar/parcial` → `CREAR`
- `/calificaciones/registrar/practico` → `CREAR`
- `/calificaciones/registrar/recuperatorio` → `CREAR`
- `/calificaciones/periodo` → `CREAR` (entregar notas)
- `/calificaciones/modificar` → `EDITAR`
- `/nivelaciones/inscribir` → `CREAR`
- `/nivelaciones/aprobar` → `APROBAR`
- `/transitabilidad/traspasos/solicitar` → `CREAR`
- `/transitabilidad/traspasos/recibir` → `CREAR`
- `/transitabilidad/traspasos/convalidar-notas` → `EDITAR`
- `/transitabilidad/traspasos/aprobar` → `APROBAR`
- `/transitabilidad/transitabilidad/solicitar` → `CREAR`
- `/transitabilidad/transitabilidad/recibir` → `CREAR`
- `/transitabilidad/transitabilidad/convalidar-notas` → `EDITAR`
- `/transitabilidad/transitabilidad/aprobar` → `APROBAR`
- `/historial/folio` → `CREAR` (solo admin/secretaria)
- `/historial/validar` → `APROBAR`

---

### Módulo: DOC — Docentes

**Conceptos:** Todo lo relacionado con el personal docente del instituto. La pasantía docente es de perfeccionamiento del docente (diferente a la pasantía estudiantil de egreso).

| Key | Label | Permiso | Acción | Tipo |
|---|---|---|---|---|
| `DOC-LIST` | Docentes | `docentes.ver` | `LISTAR` | Grupo de datos |
| `DOC-LIC` | Licencias docentes | `docentes.licencia.ver` | `LISTAR` | Grupo de datos |
| `DOC-SUP` | Supervisión | `docentes.supervision.evaluar` | `LISTAR` | Grupo de datos |
| `DOC-PAS` | Pasantías docentes | `docentes.supervision.pasantia.solicitar` | `LISTAR` | Grupo de datos |

**Rutas internas (menu: null):**
- `/docentes/:id` → `DETALLE`
- `/docentes/registrar` → `CREAR`
- `/docentes/:id/editar` → `EDITAR`
- `/docentes/asignar` → `EDITAR`
- `/docentes/licencias/solicitar` → `CREAR`
- `/docentes/licencias/aprobar` → `APROBAR`
- `/supervision/programar` → `CREAR`
- `/supervision/ficha/crear` → `CREAR`
- `/supervision/ficha/editar` → `EDITAR`
- `/supervision/pasantias/:id` → `DETALLE`
- `/supervision/pasantias/seguimiento` → `EDITAR`
- `/supervision/pasantias/evaluar` → `APROBAR`

---

### Módulo: FIN — Finanzas

**Conceptos:** Pagos, cuotas, reportes financieros y configuración de pagos (reubicada desde INST).

| Key | Label | Permiso | Acción | Tipo |
|---|---|---|---|---|
| `PAG-LIST` | Pagos | `finanzas.pago.ver` | `LISTAR` | Grupo de datos |
| `PAG-ADICIONALES` | Pagos adicionales | `finanzas.pago.adicionales` | `LISTAR` | Grupo de datos |
| `PAG-REPORTES` | Reportes de pagos | `finanzas.pago.reporte.carrera` | `LISTAR` | Ítem con tabs internas (por carrera / por estudiante / por gestión) |
| `CFG-PAGOS` | Config. de pagos | `institucional.config.gestionar` | `LISTAR` | Ítem con tabs internas (**reubicado desde INST**) |

**Rutas internas (menu: null):**
- `/pagos/:id` → `DETALLE`
- `/pagos/:id/editar` → `EDITAR`
- `/pagos/registrar` → `CREAR`
- `/pagos/reportes/carrera` → tab interna
- `/pagos/reportes/estudiante` → tab interna
- `/pagos/reportes/gestion` → tab interna

---

### Módulo: INST — Institucional

**Conceptos:** Operaciones de gestión del año académico — cosas que cambian durante el ciclo escolar. Ya NO incluye configuraciones del sistema.

| Key | Label | Permiso | Acción | Tipo |
|---|---|---|---|---|
| `GES-ACTUAL` | Gestión actual | `institucional.gestion.actual` | `LISTAR` | Grupo de datos |
| `GES-ETAPAS` | Cronogramas | `institucional.gestion.cronograma` | `LISTAR` | Grupo de datos |
| `GES-OFERTA` | Oferta académica | `institucional.gestion.oferta` | `LISTAR` | Grupo de datos |
| `GES-HORARIOS-ASIGNAR` | Horarios | `institucional.gestion.horarios` | `LISTAR` | Grupo de datos |
| `GES-LIST` | Gestiones pasadas | `institucional.gestion.pasadas` | `LISTAR` | Grupo de datos |

---

### Módulo: CFG — Configuración *(nuevo módulo, separado de INST)*

**Conceptos:** Catálogos y configuraciones del sistema que raramente cambian. Mantenidos por administradores técnicos o directivos. No son operaciones del día a día.

| Key | Label | Permiso base | Acción | Tipo | Tabs internas |
|---|---|---|---|---|---|
| `CFG-ACADEMICO` | Config. académica | `institucional.config.academico.carreras` | `LISTAR` | Ítem con tabs | Carreras · Materias · Plan de estudios · Cursos · Turnos |
| `CFG-DOCUMENTACION` | Config. documentación | `institucional.config.documentacion.inscripcion` | `LISTAR` | Ítem con tabs | Inscripción · Becas · Pasantías · Traslado |
| `CFG-COMPLEMENTARIO` | Datos complementarios | `institucional.config.complementario.discapacidad` | `LISTAR` | Ítem con tabs | Discapacidad · Apoderados · Idiomas |
| `CFG-CONVENIOS` | Empresas y convenios | `cfg.convenios.ver` | `LISTAR` | Grupo de datos | — |
| `CFG-HISTORIAL-ACTIVIDADES` | Historial de actividades | `institucional.config.historial_actividades` | `LISTAR` | Grupo de datos | — |

**Lógica de tabs internas:** El ítem CFG-ACADEMICO aparece si el usuario tiene `LISTAR` en **al menos uno** de los permisos del grupo. Dentro de la página, cada tab (Carreras, Materias, etc.) se muestra condicionalmente con `hasPermiso(codigo, 'LISTAR')`.

---

### Módulo: REP — Reportes

**Conceptos:** Informes transversales de solo lectura. Los reportes cruzan datos de múltiples módulos operativos — por eso no pertenecen a ninguno en particular.

| Key | Label | Permiso | Acción | Tipo |
|---|---|---|---|---|
| `REP-AVANCE-ACADEMICO` | Avance académico | `reportes.avance_academico` | `LISTAR` | Grupo de datos |
| `REP-ASISTENCIA` | Asistencia | `reportes.asistencia` | `LISTAR` | Grupo de datos |
| `REP-DESERCION` | Deserción | `reportes.desercion` | `LISTAR` | Grupo de datos |
| `REP-SOLICITUDES` | Solicitudes | `reportes.solicitudes.general` | `LISTAR` | Ítem con tabs internas (general / becas / traspaso / pasantía) |

---

### Módulo: SEG — Seguridad

**Conceptos:** Administración de usuarios y roles. Solo accesible para roles de nivel 4+.

| Key | Label | Permiso | Acción | Tipo |
|---|---|---|---|---|
| `SEG-USUARIOS` | Usuarios | `seguridad.usuario.administrar` | `LISTAR` | Grupo de datos |
| `SEG-ROLES` | Roles y permisos | `seguridad.rol.gestionar` | `LISTAR` | Grupo de datos |

**Rutas internas (menu: null):**
- `/seguridad/usuarios/nuevo` → `CREAR`
- `/seguridad/usuarios/:id` → `DETALLE`
- `/seguridad/usuarios/:id/permisos` → `EDITAR`
- `/seguridad/roles/:id/permisos` → `EDITAR`

---

### Módulo: PERFIL — Perfil de usuario *(sin permiso, universal)*

Accesible para cualquier usuario autenticado. No está en el árbol de permisos.

| Key | Label | Permiso | Tipo |
|---|---|---|---|
| `PERFIL` | Mi perfil | — | sin permiso |
| `PERFIL-PASSWORD` | Cambiar contraseña | — | sin permiso |
| `AUTH-LOGOUT` | Cerrar sesión | — | sin permiso |

---

## 3. Cambios en `dominios/routes.jsx`

Se deben agregar dos nuevas entradas de dominio raíz:

```javascript
// Agregar a dominios/routes.jsx
{
  path: '/configuracion-sistema',
  element: null,
  key: 'CFG',
  menu: { label: 'Configuración', module: 'CFG', order: 9 },
},
{
  path: '/perfil',
  element: <PerfilPage />,
  key: 'PERFIL',
  menu: { label: 'Mi perfil', module: 'PERFIL', order: 10 },
},
```

---

## 4. Nuevo campo `accion` en `routes.jsx`

Cada ruta debe declarar el campo `accion` explícito para que `filterMenuByPermiso` y `ProtectedRoute` puedan verificar correctamente sin asumir `LISTAR` por defecto.

```javascript
// Patrón estándar para un grupo de datos
{
  path: '/estudiantes/listar',
  key: 'MAT-ADMISION',
  permiso: 'matricula.admision.ver',
  accion: 'LISTAR',            // ← nuevo campo obligatorio
  menu: { label: 'Admisión', parent: 'MAT', order: 1 },
},

// Patrón para rutas internas (sin ítem de menú)
{
  path: '/estudiantes/:id',
  key: 'MAT-ADM-DETALLE',
  permiso: 'matricula.admision.ver',
  accion: 'DETALLE',           // ← controla el acceso a esta URL
  menu: null,
  breadcrumbParent: 'MAT-ADMISION',
},

// Patrón para acceso rápido
{
  path: '/estudiantes/registrar',
  key: 'MAT-ADM-NUEVA',
  permiso: 'matricula.admision.ver',
  accion: 'CREAR',
  menu: {
    label: '+ Nueva admisión',
    parent: 'MAT',
    order: 6,
    tipo: 'ACCION_DIRECTA',    // ← renderiza diferente en el sidebar
  },
},

// Patrón para ítem con tabs internas (sin permiso propio)
{
  path: '/configuracion/academico',
  key: 'CFG-ACADEMICO',
  permiso: null,               // ← sin permiso propio
  accion: null,
  menu: { label: 'Config. académica', parent: 'CFG', order: 1 },
  // Visible si al menos un hijo tiene permiso
},
```

---

## 5. Campo `labelByRole` para vista del estudiante

```javascript
{
  path: '/calificaciones',
  key: 'ACA-CAL',
  permiso: 'academico.calificacion.curso',
  accion: 'LISTAR',
  menu: {
    label: 'Calificaciones',
    labelByRole: { ESTUDIANTE: 'Mis calificaciones' },  // ← nuevo campo
    parent: 'ACA',
    order: 1,
  },
},
```

El `menuGenerator` aplica `labelByRole[userRole] ?? label` al construir el árbol.

---

## 6. Resumen de ítems por módulo

| Módulo | Ítems en sidebar | Rutas internas (menu: null) |
|---|---|---|
| DASH | 1 | 0 |
| MAT | 6 (5 grupos + 1 acceso rápido) | ~10 |
| ACA | 7 | ~15 |
| DOC | 4 | ~10 |
| FIN | 4 (3 grupos + 1 tabs) | ~5 |
| INST | 5 | ~5 |
| CFG | 5 (3 tabs + 2 grupos) | ~15 (una por entidad de config) |
| REP | 4 (3 grupos + 1 tabs) | ~4 |
| SEG | 2 | ~4 |
| PERFIL | 3 | 0 |
| **Total** | **41** | **~68** |

**Reducción vs diseño legacy:** El diseño anterior tenía ~85 ítems visibles en el sidebar. El nuevo tiene 41, una reducción del 52% en complejidad visual sin perder ninguna funcionalidad.
