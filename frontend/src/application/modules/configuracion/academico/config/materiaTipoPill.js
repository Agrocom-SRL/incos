import { TIPO_MATERIA_LABEL } from './materiaFormConstants';

/** Clase CSS del pill por tipo pedagógico (distinta a admisión de estudiantes). */
export const getMateriaTipoPillClass = (tipo) => {
  switch (tipo) {
    case 'TEORICA':
      return 'cfg-materia-pill cfg-materia-pill--teorica';
    case 'PRACTICA':
      return 'cfg-materia-pill cfg-materia-pill--practica';
    case 'TEORICA_PRACTICA':
      return 'cfg-materia-pill cfg-materia-pill--mixta';
    default:
      return 'cfg-materia-pill cfg-materia-pill--default';
  }
};

export const getMateriaTipoLabel = (tipo) => TIPO_MATERIA_LABEL[tipo] ?? tipo ?? '—';

export const getMateriaClasificacionPillClass = () =>
  'cfg-materia-pill cfg-materia-pill--clasificacion';

export const getMateriaEstadoPillClass = (activo) =>
  activo !== false
    ? 'cfg-materia-pill cfg-materia-pill--activa'
    : 'cfg-materia-pill cfg-materia-pill--inactiva';

export const getMateriaEstadoLabel = (activo) => (activo !== false ? 'Activa' : 'Inactiva');
