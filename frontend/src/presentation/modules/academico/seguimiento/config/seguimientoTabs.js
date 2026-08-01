/**
 * Pestañas del contenedor Seguimiento académico (ACA-SEGUIMIENTO).
 *
 * Keys de `?tab=`: `avance` y `desercion` conservan las keys de la página
 * fusionada de Avance (disolución REP) para que los deep links legados
 * `/academico/avance?tab=…` sigan funcionando; las 3 de Acompañamiento usan
 * el nombre de su antiguo ítem de menú.
 *
 * Cada meta declara el permiso (seed 59, sin cambios) que gatea la pestaña y
 * los textos de la cabecera del workspace (patrón AcademicoPage de CFG). La
 * pestaña de alertas tiene variante DOCENTE (rama «Mis alumnos en riesgo» del
 * connector role-aware), resuelta con `getSeguimientoTabMeta`.
 */

import {
  AlertOutlined,
  FallOutlined,
  FundOutlined,
  LineChartOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { AVANCE_PERMISOS } from '@application-academico/avance/utils/avancePermisos.js';
import { ACOMPANAMIENTO_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';

export const TAB_AVANCE = 'avance';
export const TAB_DESERCION = 'desercion';
export const TAB_ALERTAS = 'alertas';
export const TAB_SESIONES = 'sesiones';
export const TAB_PANEL = 'panel';

export const SEGUIMIENTO_TAB_META = {
  [TAB_AVANCE]: {
    permiso: AVANCE_PERMISOS.avance,
    icon: LineChartOutlined,
    shortLabel: 'Avance',
    title: 'Avance académico por estudiante',
    description:
      'Materias avanzadas (aprobadas + convalidadas) sobre el total del plan de estudios de cada estudiante, con su promedio histórico. Reporte de solo lectura.',
  },
  [TAB_DESERCION]: {
    permiso: AVANCE_PERMISOS.desercion,
    icon: FallOutlined,
    shortLabel: 'Deserción',
    title: 'Deserción estudiantil',
    description:
      'Métrica anual de abandono por estados consolidados de matrícula (abandono y retiro), agregada por carrera y gestión, con el detalle de desertores. Reporte de solo lectura.',
  },
  [TAB_ALERTAS]: {
    permiso: ACOMPANAMIENTO_PERMISOS.alerta,
    icon: AlertOutlined,
    shortLabel: 'Alumnos en riesgo',
    title: 'Alertas de riesgo pedagógico',
    description:
      'Estudiantes con nota por debajo del umbral de riesgo en el último bimestre registrado o en el promedio de la gestión vigente. Abra el detalle de una fila para revisar el cuadro completo del estudiante.',
    /** Variante rol DOCENTE (rama «Mis alumnos» del connector role-aware). */
    docente: {
      shortLabel: 'Mis alumnos en riesgo',
      title: 'Alumnos en riesgo de sus cursos',
      description:
        'Estudiantes de sus cursos con nota por debajo del umbral de riesgo en el último bimestre o en el promedio de la gestión. Desde cada fila puede programar una sesión de refuerzo con el alumno ya convocado.',
    },
  },
  [TAB_SESIONES]: {
    permiso: ACOMPANAMIENTO_PERMISOS.sesion,
    icon: ScheduleOutlined,
    shortLabel: 'Sesiones de refuerzo',
    title: 'Sesiones de refuerzo',
    description:
      'Sesiones complementarias programadas por curso para estudiantes con riesgo pedagógico: fecha, horario, modalidad y estudiantes convocados. La asistencia se registra en la ficha de cada sesión.',
  },
  [TAB_PANEL]: {
    permiso: ACOMPANAMIENTO_PERMISOS.panel,
    icon: FundOutlined,
    shortLabel: 'Panel',
    title: 'Panel de acompañamiento',
    description:
      'Indicadores de la gestión vigente: estudiantes en riesgo por carrera, sesiones de refuerzo realizadas, casos críticos y reprobación por materia.',
  },
};

/** Orden de render de las pestañas (mismo orden que tenían en el sidebar). */
export const SEGUIMIENTO_TAB_ORDER = [
  TAB_AVANCE,
  TAB_DESERCION,
  TAB_ALERTAS,
  TAB_SESIONES,
  TAB_PANEL,
];

/** Meta efectiva de una pestaña (aplica la variante docente en alertas). */
export const getSeguimientoTabMeta = (tabKey, { docente = false } = {}) => {
  const base = SEGUIMIENTO_TAB_META[tabKey];
  if (!base) return null;
  if (docente && base.docente) {
    return { ...base, ...base.docente };
  }
  return base;
};
