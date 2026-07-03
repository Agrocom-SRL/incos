/**
 * perfilAccesos — accesos directos del hub "Mi perfil" por rol (data-driven).
 *
 * ÚNICA fuente de las cards de acceso de PerfilPage: mapea `rol.codigo` (catálogo
 * seed 55: ADMIN_SISTEMA, RECTOR, DIR_ACADEMICO, DIR_ADMIN, SEC_ACADEMICA,
 * SEC_ADMIN, DOCENTE, ESTUDIANTE) → lista de accesos ya resueltos para
 * `PerfilAccesosGrid` (`{ key, icon, title, description, actionLabel, path,
 * accent, accentBg, permiso? }`).
 *
 * Reglas:
 *  - `path` = ruta REAL de un routes.jsx (verificada); lenguaje NEUTRO para staff.
 *  - `permiso` opcional `{ codigo|codigo[], accion }` → `PerfilAccesosGrid` oculta
 *    la card si el usuario no lo tiene (fail-closed: un config desactualizado
 *    nunca muestra un link roto). Estudiante/docente mantienen su set aprobado
 *    (rol ya gobierna la rama) con descripciones dinámicas de su resumen.
 *  - Rol sin mapeo → lista vacía (sin sección de accesos, sin romper).
 *  - Pocos y troncales por rol (3-5 cards), según matriz-permisos-sistema.md.
 */

import {
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  DollarOutlined,
  FileProtectOutlined,
  HistoryOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  SettingOutlined,
  SolutionOutlined,
  TableOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { allColors } from '@theme/tokens';
import { formatBsConSimbolo } from '@application/utils/formatters';

/** Une partes de un resumen omitiendo las ausentes; cae a un texto guía. */
export function resumen(partes, fallback) {
  const texto = partes.filter(Boolean).join(' · ');
  return texto || fallback;
}

/** Pares acento/fondo de las cards (tokens del tema, cero hex). */
const ACCENT = {
  primary: { accent: allColors.colorPrimary, accentBg: allColors.colorPrimaryBg },
  info: { accent: allColors.colorInfo, accentBg: allColors.colorInfoBg },
  warning: { accent: allColors.colorWarning, accentBg: allColors.colorWarningBg },
  success: { accent: allColors.colorSuccess, accentBg: allColors.colorSuccessBg },
  accent: { accent: allColors.colorAccent, accentBg: allColors.colorAccentBg },
};

/* ── Portal del ESTUDIANTE (set aprobado; descripciones con su resumen) ── */
const accesosEstudiante = ({ resumenEstudiante }) => [
  {
    key: 'mis-datos',
    icon: <IdcardOutlined />,
    ...ACCENT.primary,
    title: 'Mis datos',
    description: resumen(
      [
        resumenEstudiante?.carrera,
        resumenEstudiante?.codigo && `Cód. ${resumenEstudiante.codigo}`,
        resumenEstudiante?.ci && `C.I. ${resumenEstudiante.ci}`,
      ],
      'Consulta tu ficha personal y académica.',
    ),
    actionLabel: 'Ver mis datos',
    path: '/estudiantes/listar',
  },
  {
    key: 'mi-matricula',
    icon: <SolutionOutlined />,
    ...ACCENT.info,
    title: 'Mi matrícula',
    description: resumen([resumenEstudiante?.carrera], 'Revisa tu inscripción y materias.'),
    actionLabel: 'Ver mi matrícula',
    path: '/matricula/listar',
  },
  {
    key: 'mis-aportes',
    icon: <DollarOutlined />,
    ...(resumenEstudiante?.saldoPendiente > 0 ? ACCENT.warning : ACCENT.success),
    title: 'Mis aportes',
    description:
      resumenEstudiante?.saldoPendiente > 0
        ? `Saldo pendiente: ${formatBsConSimbolo(resumenEstudiante.saldoPendiente)}`
        : 'Sin saldo pendiente.',
    actionLabel: 'Ver mis aportes',
    path: '/matricula/aportes/listar',
  },
  {
    key: 'mi-boletin',
    icon: <BookOutlined />,
    ...ACCENT.primary,
    title: 'Mi boletín',
    description:
      resumenEstudiante?.promedioGeneral != null
        ? `Promedio general: ${resumenEstudiante.promedioGeneral}`
        : 'Consulta tus calificaciones por bimestre y materia.',
    actionLabel: 'Ver mi boletín',
    path: '/academico/mi-boletin',
  },
];

/* ── Portal del DOCENTE (set aprobado; métricas de su carga) ── */
const accesosDocente = ({ resumenDocente }) => [
  {
    key: 'mi-ficha',
    icon: <IdcardOutlined />,
    ...ACCENT.primary,
    title: 'Mi ficha',
    description: 'Consulta tus datos personales, formación y condición laboral.',
    actionLabel: 'Ver mi ficha',
    path: '/docentes/listar',
  },
  {
    key: 'mis-cursos',
    icon: <BookOutlined />,
    ...ACCENT.info,
    title: 'Mis cursos',
    description: resumen(
      [
        resumenDocente?.cursos != null && `${resumenDocente.cursos} cursos`,
        resumenDocente?.horasSemanales != null && `${resumenDocente.horasSemanales} h/semana`,
      ],
      'Cuaderno de calificaciones por curso y bimestre.',
    ),
    actionLabel: 'Ver mis cursos',
    path: '/academico/calificaciones',
  },
  {
    key: 'asistencia',
    icon: <CarryOutOutlined />,
    ...ACCENT.warning,
    title: 'Asistencia',
    description: resumen(
      [resumenDocente?.bimestreNombre],
      'Registra la asistencia diaria de tus cursos.',
    ),
    actionLabel: 'Tomar asistencia',
    path: '/academico/asistencia',
  },
  {
    key: 'mis-estudiantes',
    icon: <TeamOutlined />,
    ...ACCENT.success,
    title: 'Mis estudiantes',
    description: 'Roster de estudiantes inscritos en tus cursos, por carrera y paralelo.',
    actionLabel: 'Ver mis estudiantes',
    path: '/matricula/listar',
  },
  {
    key: 'mi-horario',
    icon: <CalendarOutlined />,
    ...ACCENT.info,
    title: 'Mi horario',
    description: resumen(
      [resumenDocente?.gestion],
      'Tu grilla semanal de clases por curso y aula.',
    ),
    actionLabel: 'Ver mi horario',
    path: '/docentes/mi-horario',
  },
];

/* ── Staff (lenguaje neutro; paths de routes.jsx; fail-closed por permiso) ── */

/** ADMIN_SISTEMA — solo lo troncal de administración del sistema. */
const accesosAdmin = () => [
  {
    key: 'usuarios',
    icon: <TeamOutlined />,
    ...ACCENT.primary,
    title: 'Usuarios del sistema',
    description: 'Cuentas, credenciales y vinculación de personas.',
    actionLabel: 'Administrar usuarios',
    path: '/seguridad/usuarios',
    permiso: { codigo: 'seguridad.usuario.administrar', accion: 'LISTAR' },
  },
  {
    key: 'roles',
    icon: <SafetyCertificateOutlined />,
    ...ACCENT.info,
    title: 'Roles y permisos',
    description: 'Catálogo de roles y su matriz de permisos.',
    actionLabel: 'Ver roles',
    path: '/seguridad/roles',
    permiso: { codigo: 'seguridad.rol.gestionar', accion: 'LISTAR' },
  },
  {
    key: 'cfg-academico',
    icon: <SettingOutlined />,
    ...ACCENT.warning,
    title: 'Configuración académica',
    description: 'Carreras, planes de estudio, materias y paralelos.',
    actionLabel: 'Abrir configuración',
    path: '/configuracion/academico',
    permiso: {
      codigo: [
        'configuracion.plan-estudio',
        'configuracion.carrera',
        'configuracion.materia',
        'configuracion.paralelo',
      ],
      accion: 'LISTAR',
    },
  },
  {
    key: 'gestion-actual',
    icon: <CalendarOutlined />,
    ...ACCENT.success,
    title: 'Gestión actual',
    description: 'Cronograma académico, bimestres y estado de la gestión.',
    actionLabel: 'Ver gestión actual',
    path: '/institucional/actual',
    permiso: { codigo: 'institucional.gestion.actual', accion: 'LISTAR' },
  },
];

/** RECTOR / DIR_ACADEMICO — dirección académica. */
const accesosDireccionAcademica = () => [
  {
    key: 'centralizador',
    icon: <TableOutlined />,
    ...ACCENT.primary,
    title: 'Centralizador de notas',
    description: 'Calificaciones consolidadas por paralelo y bimestre.',
    actionLabel: 'Abrir centralizador',
    path: '/academico/centralizador',
    permiso: { codigo: 'academico.calificacion.centralizador', accion: 'LISTAR' },
  },
  {
    key: 'historial',
    icon: <HistoryOutlined />,
    ...ACCENT.info,
    title: 'Historial académico',
    description: 'Kardex y trayectoria académica por estudiante.',
    actionLabel: 'Ver historial',
    path: '/academico/historial/academico',
    permiso: { codigo: 'academico.historial.academico', accion: 'LISTAR' },
  },
  {
    key: 'gestion-actual',
    icon: <CalendarOutlined />,
    ...ACCENT.warning,
    title: 'Gestión actual',
    description: 'Cronograma académico, bimestres y estado de la gestión.',
    actionLabel: 'Ver gestión actual',
    path: '/institucional/actual',
    permiso: { codigo: 'institucional.gestion.actual', accion: 'LISTAR' },
  },
  {
    key: 'horarios',
    icon: <ScheduleOutlined />,
    ...ACCENT.success,
    title: 'Gestión de horarios',
    description: 'Armado y publicación de horarios por paralelo.',
    actionLabel: 'Ver horarios',
    path: '/institucional/horarios',
    permiso: { codigo: 'institucional.gestion.horarios', accion: 'LISTAR' },
  },
  {
    key: 'docentes',
    icon: <IdcardOutlined />,
    ...ACCENT.accent,
    title: 'Docentes',
    description: 'Plantel docente, fichas y asignaciones.',
    actionLabel: 'Ver docentes',
    path: '/docentes/listar',
    permiso: { codigo: 'docentes.ver', accion: 'LISTAR' },
  },
];

/** SEC_ACADEMICA — operación académica diaria. */
const accesosSecretariaAcademica = () => [
  {
    key: 'matriculas',
    icon: <SolutionOutlined />,
    ...ACCENT.primary,
    title: 'Matrículas',
    description: 'Inscripciones de estudiantes por gestión y carrera.',
    actionLabel: 'Ver matrículas',
    path: '/matricula/listar',
    permiso: { codigo: 'matricula.inscribir', accion: 'LISTAR' },
  },
  {
    key: 'admision',
    icon: <TeamOutlined />,
    ...ACCENT.info,
    title: 'Admisión de estudiantes',
    description: 'Registro y ficha de estudiantes admitidos.',
    actionLabel: 'Ver estudiantes',
    path: '/estudiantes/listar',
    permiso: { codigo: 'matricula.admision.ver', accion: 'LISTAR' },
  },
  {
    key: 'historial',
    icon: <HistoryOutlined />,
    ...ACCENT.warning,
    title: 'Historial académico',
    description: 'Kardex y trayectoria académica por estudiante.',
    actionLabel: 'Ver historial',
    path: '/academico/historial/academico',
    permiso: { codigo: 'academico.historial.academico', accion: 'LISTAR' },
  },
  {
    key: 'licencias-docentes',
    icon: <FileProtectOutlined />,
    ...ACCENT.success,
    title: 'Licencias docentes',
    description: 'Solicitudes y aprobación de licencias del plantel.',
    actionLabel: 'Ver licencias',
    path: '/docentes/licencias/listar',
    permiso: { codigo: 'docentes.licencia.ver', accion: 'LISTAR' },
  },
];

/** DIR_ADMIN — dirección administrativa/financiera. */
const accesosDireccionAdministrativa = () => [
  {
    key: 'pagos',
    icon: <DollarOutlined />,
    ...ACCENT.primary,
    title: 'Pagos y aportes',
    description: 'Registro y seguimiento de pagos de estudiantes.',
    actionLabel: 'Ver pagos',
    path: '/finanzas/pagos',
    permiso: { codigo: 'finanzas.pago.ver', accion: 'LISTAR' },
  },
  {
    key: 'reportes-pagos',
    icon: <BarChartOutlined />,
    ...ACCENT.info,
    title: 'Reportes de pagos',
    description: 'Recaudación por carrera, becas y cuentas por cobrar.',
    actionLabel: 'Ver reportes',
    path: '/finanzas/reportes',
    permiso: { codigo: 'finanzas.pago.reporte.carrera', accion: 'LISTAR' },
  },
  {
    key: 'becas',
    icon: <FileProtectOutlined />,
    ...ACCENT.warning,
    title: 'Becas',
    description: 'Asignaciones de becas y descuentos vigentes.',
    actionLabel: 'Ver becas',
    path: '/estudiantes/becas/listar',
    permiso: { codigo: 'matricula.beca.ver', accion: 'LISTAR' },
  },
  {
    key: 'cfg-pagos',
    icon: <SettingOutlined />,
    ...ACCENT.success,
    title: 'Configuración de pagos',
    description: 'Montos de aportes y parámetros de cobro por gestión.',
    actionLabel: 'Abrir configuración',
    path: '/finanzas/configuracion',
    permiso: { codigo: 'configuracion.pagos', accion: 'LISTAR' },
  },
];

/** SEC_ADMIN — caja y operación administrativa. */
const accesosSecretariaAdministrativa = () => [
  {
    key: 'pagos',
    icon: <DollarOutlined />,
    ...ACCENT.primary,
    title: 'Pagos y aportes',
    description: 'Registro y seguimiento de pagos de estudiantes.',
    actionLabel: 'Ver pagos',
    path: '/finanzas/pagos',
    permiso: { codigo: 'finanzas.pago.ver', accion: 'LISTAR' },
  },
  {
    key: 'pagos-adicionales',
    icon: <BarChartOutlined />,
    ...ACCENT.info,
    title: 'Pagos adicionales',
    description: 'Conceptos adicionales al aporte académico.',
    actionLabel: 'Ver adicionales',
    path: '/finanzas/adicional',
    permiso: { codigo: 'finanzas.pago.adicionales', accion: 'LISTAR' },
  },
  {
    key: 'admision',
    icon: <TeamOutlined />,
    ...ACCENT.warning,
    title: 'Admisión de estudiantes',
    description: 'Registro y ficha de estudiantes admitidos.',
    actionLabel: 'Ver estudiantes',
    path: '/estudiantes/listar',
    permiso: { codigo: 'matricula.admision.ver', accion: 'LISTAR' },
  },
  {
    key: 'becas',
    icon: <FileProtectOutlined />,
    ...ACCENT.success,
    title: 'Becas',
    description: 'Asignaciones de becas y descuentos vigentes.',
    actionLabel: 'Ver becas',
    path: '/estudiantes/becas/listar',
    permiso: { codigo: 'matricula.beca.ver', accion: 'LISTAR' },
  },
];

/** Builder por código de rol (seed 55). Rol sin mapeo → sin accesos. */
const ACCESOS_POR_ROL = {
  ESTUDIANTE: accesosEstudiante,
  DOCENTE: accesosDocente,
  ADMIN_SISTEMA: accesosAdmin,
  RECTOR: accesosDireccionAcademica,
  DIR_ACADEMICO: accesosDireccionAcademica,
  SEC_ACADEMICA: accesosSecretariaAcademica,
  DIR_ADMIN: accesosDireccionAdministrativa,
  SEC_ADMIN: accesosSecretariaAdministrativa,
};

/**
 * Lista de accesos del hub para el rol dado (vacía si el rol no tiene mapeo).
 *
 * @param {string|null|undefined} rolCodigo - `usuario.rol.codigo` (seed 55).
 * @param {{ resumenEstudiante?: object, resumenDocente?: object }} [ctx]
 */
export function buildPerfilAccesos(rolCodigo, ctx = {}) {
  const builder = ACCESOS_POR_ROL[rolCodigo];
  return builder ? builder(ctx) : [];
}

export default buildPerfilAccesos;
