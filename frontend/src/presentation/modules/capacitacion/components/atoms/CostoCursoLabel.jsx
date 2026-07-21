/**
 * Átomo: costo de un curso de capacitación (CAP) — «Bs X» o pill «Gratis» si
 * el curso no tiene costo asociado (costo <= 0). Fuente de la regla:
 * `esCursoGratuito` (capacitacionPills.js). Un solo lugar para este criterio
 * visual, reusado en fichas, tablas y tarjetas de cursos e inscripciones —
 * evita repetir la misma condición `costo > 0 ? ... : ...` en cada pantalla.
 */

import { StatusPill } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import {
  COSTO_GRATUITO_PILL_CLASS,
  esCursoGratuito,
} from '@application-capacitacion/utils/capacitacionPills';

const CostoCursoLabel = ({ costo }) => {
  if (esCursoGratuito(costo)) {
    return <StatusPill label="Gratis" className={COSTO_GRATUITO_PILL_CLASS} />;
  }
  return <>Bs {formatBs(costo)}</>;
};

export default CostoCursoLabel;
