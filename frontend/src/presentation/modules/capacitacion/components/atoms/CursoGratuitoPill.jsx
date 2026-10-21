/**
 * Átomo: pill «Curso gratuito» para cursos sin costo ni matrícula (ambos
 * interruptores apagados). Un solo lugar para el rótulo, reusado en listado,
 * ficha y pasos de inscripción.
 */

import { StatusPill } from '@atoms';
import { COSTO_GRATUITO_PILL_CLASS } from '@application-capacitacion/utils/capacitacionPills';

const CursoGratuitoPill = () => (
  <StatusPill label="Curso gratuito" className={COSTO_GRATUITO_PILL_CLASS} />
);

export default CursoGratuitoPill;
