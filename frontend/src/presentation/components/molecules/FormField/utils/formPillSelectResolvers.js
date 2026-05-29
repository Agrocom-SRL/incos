/**
 * Resolvers de clase pill para FormPillSelect (config vía field.pillVariant).
 */
import {
  getMateriaClasificacionPillClass,
  getMateriaTipoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';

const DEFAULT_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--default';

export const FORM_PILL_SELECT_RESOLVERS = {
  materiaClasificacion: () => getMateriaClasificacionPillClass(),
  materiaTipo: (value) => getMateriaTipoPillClass(value),
};

export const resolveFormPillClassName = (pillVariant, value) => {
  const resolver = pillVariant ? FORM_PILL_SELECT_RESOLVERS[pillVariant] : null;
  if (resolver) return resolver(value);
  return DEFAULT_PILL_CLASS;
};
