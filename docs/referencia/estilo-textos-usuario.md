# Estilo de textos al usuario — registro formal "usted"

> Regla completa (con ejemplos y checklist) en
> `.claude/skills/incos-ui-system/SKILL.md` §4c. Este documento es el
> catálogo vivo de conversiones ya aplicadas — úsalo como referencia rápida
> antes de redactar texto nuevo o al auditar un módulo pendiente.

## Origen

2026-07-16 — un usuario reportó (captura de pantalla) un `Alert` con
"Corregí las celdas en rojo antes de guardar." (primera persona informal).
Una auditoría con 7 agentes en paralelo sobre todo `frontend/src/presentation/
modules/` encontró **~82 textos en ~40 archivos** con voseo rioplatense
("podés", "guardá", "reintentá") y tuteo ("tu", "tienes", "estás") mezclados
con el registro correcto. Causa: copy redactado pantalla por pantalla, sin
regla escrita.

## Regla

Todo texto que el sistema dirige al usuario sobre una acción o procedimiento
va en **segunda persona formal "usted"** (imperativo o indicativo). Nunca
primera persona, nunca tuteo/voseo, nunca tercera persona distante ("el
usuario debe"). Frases ya impersonales ("No hay registros disponibles.")
no se tocan.

Aplica a: `Alert`, `notification.*`, `Modal.confirm/warning/error/success/
info`, `Popconfirm`, `Empty description`, `Spin tip`, `Form.Item
rules[].message`, `placeholder`, párrafos `Typography`/banners.

## Catálogo de conversiones aplicadas (por módulo)

### `academico/` (21 cambios, 12 archivos)

| Archivo | Antes | Después |
|---|---|---|
| `calificaciones/pages/CuadernoPage.jsx:153` | Corregí las celdas en rojo antes de guardar. | Corrija las celdas en rojo antes de guardar. |
| `calificaciones/pages/CuadernoPage.jsx:180,290` | Reintentá en unos segundos. | Reintente en unos segundos. |
| `calificaciones/pages/BimestreConsolidadoPage.jsx:77,117` | Reintentá en unos segundos. | Reintente en unos segundos. |
| `calificaciones/pages/BimestreConsolidadoPage.jsx:133` | ...Deberás cerrarlo nuevamente... | ...Deberá cerrarlo nuevamente... |
| `calificaciones/components/VistaPreviaDrawer.jsx:160` | Completá las celdas vacías... | Complete las celdas vacías... |
| `calificaciones/pages/MiBoletinPage.jsx:86` | No se encontró tu boletín. | No se encontró su boletín. |
| `asistencia/pages/PlanillaAsistenciaSemanalPage.jsx:153` | ...Podrás reabrirla para corregir. | ...Podrá reabrirla para corregir. |
| `asistencia/pages/PlanillaAsistenciaSemanalPage.jsx:290` | ...Probá con otra semana o usá «Ir a fecha». | ...Pruebe con otra semana o utilice «Ir a fecha». |
| `asistencia/pages/CalendarioAsistenciaPage.jsx:171` | ...Reabrila desde la planilla para corregir. | ...Reábrala desde la planilla para corregir. |
| `asistencia/components/FechaEspecialDrawer.jsx:163` | Editá el motivo... o eliminala si la creaste por error. | Edite el motivo... o elimínela si la creó por error. |
| `asistencia/components/FechaEspecialDrawer.jsx:164` | Habilitá un día que no figura... | Habilite un día que no figura... |
| `centralizador/components/CentralizadorExportSection.jsx:104` | Reintentá en unos segundos. | Reintente en unos segundos. |
| `centralizador/pages/CentralizadorMatrizPage.jsx:124` | Reintentá en unos segundos. | Reintente en unos segundos. |
| `centralizador/pages/CentralizadorAnualPage.jsx:75` | Reintentá en unos segundos. | Reintente en unos segundos. |
| `historial/pages/HistorialAcademicoPage.jsx:73,89` | Reintentá en unos segundos. | Reintente en unos segundos. |
| `historial/connectors/HistorialSelectorConnector.jsx:29,30` | No se pudo abrir tu historial / No se encontró tu registro | No se pudo abrir su historial / No se encontró su registro |

### `configuracion/academico/` (6 cambios, 2 archivos)

| Archivo | Antes | Después |
|---|---|---|
| `pages/PlanPeriodoAsignaturasPage.jsx:214` | Si vuelves ahora se perderán los cambios... | Si vuelve ahora se perderán los cambios... |
| `pages/PlanPeriodoAsignaturasPage.jsx:274,395` | Arrastra materias.../ Arrastra aquí una materia | Arrastre materias.../ Arrastre aquí una materia |
| `pages/PlanPeriodoAsignaturasPage.jsx:276` | ...arrastra una materia de un año anterior... | ...arrastre una materia de un año anterior... |
| `pages/PlanPeriodoAsignaturasPage.jsx:436` | Agrega asignaturas al periodo | Agregue asignaturas al periodo |
| `components/molecules/PlanBuilderPrerrequisitoSlot.jsx:63` | Arrastra aquí | Arrastre aquí |

### `finanzas/` (2 cambios, 2 archivos)

| Archivo | Antes | Después |
|---|---|---|
| `reportes/pages/BecasReportePage.jsx:138` | Reintentá en unos segundos. | Reintente en unos segundos. |
| `reportes/pages/CuentasPorCobrarPage.jsx:110` | Reintentá en unos segundos. | Reintente en unos segundos. |

### `institucional/` (13 cambios, 7 archivos — mayoría voseo rioplatense)

| Archivo | Antes | Después |
|---|---|---|
| `actual/components/organisms/CronogramaActividadSelectorModal.jsx:60` | Busca y elige... puedes reutilizarlas... | Busque y elija... puede reutilizarlas... |
| `oferta/connectors/OfertaDashboardConnector.jsx:25,37,38` | Identificando tu registro... / Vuelve a intentarlo o contacta... | Identificando su registro... / Vuelva a intentarlo o contacte... |
| `horarios/components/organisms/DocenteAsignacionCursoModal.jsx:487` | Podés revisar el horario; para guardar cambios pedí acceso... | Puede revisar el horario; para guardar cambios, solicite acceso... |
| `horarios/pages/GestionHorariosConflictosPage.jsx:97` | ...Reubicá un bloque... y guardá para resolver el solape. | ...Reubique un bloque... y guarde para resolver el solape. |
| `horarios/pages/GestionHorariosConflictosPage.jsx:128` | ...abrí una y mové uno de los bloques... | ...abra una y mueva uno de los bloques... |
| `horarios/pages/GestionHorariosConflictosPage.jsx:218-220` | ...mové este bloque..., intercambialo..., o eliminálo; luego guardá. | ...mueva este bloque..., intercámbielo..., o elimínelo; luego guarde. |
| `horarios/pages/GestionHorariosConflictosPage.jsx:306,316` | Abrí esta pantalla... / Podés volver al tablero... | Abra esta pantalla... / Puede volver al tablero... |
| `horarios/components/organisms/ParaleloArmadoPlanSection.jsx:190` | Paralelo publicado: podés reubicar bloques... | Paralelo publicado: puede reubicar bloques... |
| `horarios/components/organisms/ParaleloArmadoPlanSection.jsx:196-197` | Arrastrá los bloques... cuando muevas un bloque. | Arrastre los bloques... cuando mueva un bloque. |
| `horarios/components/organisms/ParaleloCoberturaTabSection.jsx:120` | ...Completá la oferta académica... | ...Complete la oferta académica... |
| `horarios/pages/GestionHorariosArmadoPage.jsx:24` | Revisá la cobertura..., generá horarios..., afiná el plan... | Revise la cobertura..., genere horarios..., afine el plan... |
| `horarios/pages/GestionHorariosArmadoPage.jsx:189` | Abrí esta pantalla... o usá un enlace... | Abra esta pantalla... o use un enlace... |

### `matricula/` + `estudiantes/` (7 cambios, 3 archivos)

| Archivo | Antes | Después |
|---|---|---|
| `matricula/connectors/MatriculaRedirect.jsx:32,36` | No se pudo abrir tu matrícula / Aún no tienes una matrícula... | No se pudo abrir su matrícula / Aún no tiene una matrícula... |
| `matricula/pages/MisEstudiantesDocentePage.jsx:73,82,94` | ...tus cursos / tu lista de estudiantes / Aún no tienes estudiantes... | ...sus cursos / su lista de estudiantes / Aún no tiene estudiantes... |
| `estudiantes/connectors/EstudianteAdmisionRedirect.jsx:42,43` | No se pudieron abrir tus datos / Tu usuario no está vinculado... | No se pudieron abrir sus datos / Su usuario no está vinculado... |

### `docentes/`, `capacitacion/`, `seguridad/`, `dashboard/`, `perfil/` (27 cambios, 11 archivos)

| Archivo | Antes | Después |
|---|---|---|
| `docentes/connectors/DocentesListConnector.jsx` | Abriendo tu ficha… / No se pudo abrir tu ficha / No se encontró tu registro de docente. | Abriendo su ficha… / No se pudo abrir su ficha / No se encontró su registro de docente. |
| `docentes/pages/MiHorarioPage.jsx` | Cargando tu horario… / No se pudo cargar tu horario / Aún no tienes bloques... | Cargando su horario… / No se pudo cargar su horario / Aún no tiene bloques... |
| `seguridad/usuarios/components/modals/AgregarOverrideModal.jsx` | Vas a {acción} este permiso... | Va a {acción} este permiso... |
| `dashboard/pages/EstudianteDashboard.jsx` | Únete a nuestra comunidad... construye tu futuro / Estás cursando... / Revisa tu cuenta.../ Consulta tu(s)... | Únase... construya su futuro / Está cursando... / Revise su cuenta.../ Consulte su(s)... |
| `dashboard/pages/DocenteDashboard.jsx` | Estás dictando clases... / Revisa tu cuenta.../ Registra la asistencia de tus cursos / Consulta tus datos / Tu calendario semanal... | Está dictando clases... / Revise su cuenta.../ Registre la asistencia de sus cursos / Consulte sus datos / Su calendario semanal... |
| `dashboard/components/molecules/DashboardMiSaldoCard.jsx` | Tienes un saldo... / Estás al día con tus aportes. | Tiene un saldo... / Está al día con sus aportes. |
| `dashboard/components/molecules/DashboardWelcomeBanner.jsx` | Únete... construye tu futuro profesional. | Únase... construya su futuro profesional. |
| `dashboard/components/molecules/DashboardDocentesListCard.jsx` | Aún no tienes docentes asignados en tu inscripción... | Aún no tiene docentes asignados en su inscripción... |
| `perfil/pages/PerfilPage.jsx` | No se pudo cargar tu perfil | No se pudo cargar su perfil |
| `perfil/components/organisms/EstudianteFichaSection.jsx` | Cargando tus datos… / No se pudieron cargar tus datos / No se encontró tu ficha... | Cargando sus datos… / No se pudieron cargar sus datos / No se encontró su ficha... |
| `perfil/config/perfilAccesos.jsx` (7 líneas) | Consulta tu ficha... / Revisa tu inscripción... / Consulta tus calificaciones... / Registra la asistencia de tus cursos... / Tu grilla semanal... | Consulte su ficha... / Revise su inscripción... / Consulte sus calificaciones... / Registre la asistencia de sus cursos... / Su grilla semanal... |

### `pagos/` + componentes compartidos (6 cambios, 2 archivos)

| Archivo | Antes | Después |
|---|---|---|
| `pagos/connectors/AportesRedirect.jsx:25,32,46,53,56` | No se pudo cargar tu aporte / Abriendo mis aportes… / No se pudieron abrir tus aportes / Aún no tienes aportes... | No se pudo cargar su aporte / Abriendo sus aportes… / No se pudieron abrir sus aportes / Aún no tiene aportes... |
| `pagos/components/organisms/CompromisoPagoModal.jsx:91` | Elige en cuánto tiempo se compromete el estudiante... | Elija en cuánto tiempo se compromete el estudiante... |

## Continuación 2026-07-16 (segunda pasada, tras corte de sesión)

La sesión "Revisar textos y títulos" se cortó con 117 archivos ya
modificados (quedaron staged). Esta continuación cerró lo restante:

### Restos de voseo/tuteo fuera de `presentation/modules/`

| Archivo | Antes | Después |
|---|---|---|
| `infrastructure/navigation/utils/notifyAccessDenied.js` | No tenés permiso... | No tiene permiso... |
| `infrastructure/navigation/components/ModuleEntryConnector.jsx` | No tenés permiso... | No tiene permiso... |
| `presentation/guards/PrivateRoute.jsx` (×2) | No tenés permiso... | No tiene permiso... |
| `infrastructure/repositories/*.js` (Docente, Asistencia, Estudiante, PagoAporte, Calificacion, Dashboard) | Error al cargar tus cursos / tu boletín / tus aportes / tu resumen... | Error al cargar sus cursos / su boletín / sus aportes / su resumen... |

### Title Case → sentence case (~80 cadenas, ~45 archivos)

Labels de formularios de estudiantes (`Apellido Paterno` → `Apellido
paterno`, `Fecha de Nacimiento` → `Fecha de nacimiento`, etc.), wizard
steps de estudiantes y matrícula (`Datos Generales`, `Buscar Estudiante`,
`Seleccionar Carrera`...), títulos de página y breadcrumbs (`Lista de
Estudiantes`, `Editar Inscripción`, `Asignar Beca`, `Detalle del
Estudiante`...), labels de menú (`Oferta Académica` → `Oferta académica`,
`Gestión Actual`, `Gestiones Pasadas`, `Gestión de Horarios`, `Datos
Complementarios`, `Empresas y Convenios`, `Historial de Actividades`) y
componentes compartidos (`Confirmar Eliminación`, `Finalizar Registro`,
`Guardar y Continuar Después`, `Página en Construcción`, `Sistema de
Gestión Académica`).

**No se tocan** (excluidos a propósito): nombres propios (carreras
«Sistemas Informáticos», instituciones, personas en mocks), términos
oficiales (`Técnico Superior`, `Técnico Medio UETHP/CEA`), literales que
espejan seeders de BD (`BIMESTRE_NOMBRES` en `centralizadorDoc.js`),
identificadores de código, comentarios técnicos.

### API Ant Design 6 detectada de paso

`notification.*({ message: ... })` no existe en antd 6 (es `title`, igual
que `Alert`). Corregido en `useGestionFormPage.js`,
`useOfertaGestionPlanesState.js` y `useRenovarOfertaPage.js`; el campo
interno `gestionContextAlert.message` se renombró a `title` para que no
se confunda con la API v5 en futuras auditorías. El renderer data-driven
(`fieldRenderers.jsx`) ya acepta `field.message || field.title`.

### Pendientes anteriores — cerrados

Los dos focos señalados en la primera pasada (`Form.Item rules[].message`
/ `placeholder` en `academico/` y `description` en
`configuracion/**/config/*FormFields.js`) quedaron cubiertos entre la
sesión interrumpida y esta continuación; los barridos globales de
voseo/tuteo sobre `frontend/src` terminan sin resultados.
