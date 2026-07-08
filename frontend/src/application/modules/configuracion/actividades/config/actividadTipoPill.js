/**
 * Mapeo tipo de actividad → clase de pill (color/label). Plantilla:
 * `academico/config/materiaTipoPill.js`.
 */
import { TIPO_ACTIVIDAD_LABEL, TIPOS_ACTIVIDAD } from './actividadTipoConstants';

const PILL_CLASS_BY_TIPO = {
  [TIPOS_ACTIVIDAD.INSCRIPCION]: 'cfg-materia-pill cfg-materia-pill--activa',
  [TIPOS_ACTIVIDAD.PLANIFICACION]: 'cfg-materia-pill cfg-materia-pill--mixta',
  [TIPOS_ACTIVIDAD.ACADEMICA]: 'cfg-materia-pill cfg-materia-pill--teorica',
  [TIPOS_ACTIVIDAD.EVALUACION]: 'cfg-materia-pill cfg-materia-pill--practica',
  [TIPOS_ACTIVIDAD.ADMINISTRATIVA]: 'cfg-materia-pill cfg-materia-pill--clasificacion',
  [TIPOS_ACTIVIDAD.FERIADO]: 'cfg-materia-pill cfg-materia-pill--inactiva',
  [TIPOS_ACTIVIDAD.EVENTO_INSTITUCIONAL]: 'cfg-materia-pill cfg-materia-pill--mixta',
  [TIPOS_ACTIVIDAD.FERIA]: 'cfg-materia-pill cfg-materia-pill--mixta',
  [TIPOS_ACTIVIDAD.MODALIDAD_GRADO]: 'cfg-materia-pill cfg-materia-pill--teorica',
  [TIPOS_ACTIVIDAD.OTRO]: 'cfg-materia-pill cfg-materia-pill--default',
};

export const getActividadTipoPillClass = (tipo) =>
  PILL_CLASS_BY_TIPO[tipo] ?? 'cfg-materia-pill cfg-materia-pill--default';

export const getActividadTipoLabel = (tipo) => TIPO_ACTIVIDAD_LABEL[tipo] ?? tipo ?? '—';
