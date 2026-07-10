/**
 * Resolvers de clase pill para FormPillSelect (config vía field.pillVariant).
 */
import {
  getMateriaClasificacionPillClass,
  getMateriaTipoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';
import { getParaleloTurnoFormPillClass } from '@application-configuracion/recursos/config/paraleloTurnoOptions';
import { getParaleloPeriodoPillClass } from '@application-configuracion/recursos/config/paraleloPeriodoPill';
import { getDocumentacionTipoPillClass } from '@application-configuracion/documentacion/config/documentacionTipoPill';
import { rolPillClass } from '@modules/seguridad/roles/components/atoms/rolColor.js';

const DEFAULT_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--default';

export const FORM_PILL_SELECT_RESOLVERS = {
  materiaClasificacion: () => getMateriaClasificacionPillClass(),
  materiaTipo: (value) => getMateriaTipoPillClass(value),
  paraleloTurno: (value) => getParaleloTurnoFormPillClass(value),
  documentacionTipo: (value) => getDocumentacionTipoPillClass(value),
  rolTipo: (value) => rolPillClass(value),
};

export const resolveFormPillClassName = (pillVariant, value, selectOptions = []) => {
  if (pillVariant === 'paraleloPeriodo') {
    const opt = selectOptions.find((o) => Number(o.value) === Number(value));
    const numero = opt?.numero ?? opt?.periodoNumero;
    return getParaleloPeriodoPillClass(numero);
  }
  const resolver = pillVariant ? FORM_PILL_SELECT_RESOLVERS[pillVariant] : null;
  if (resolver) return resolver(value);
  return DEFAULT_PILL_CLASS;
};
