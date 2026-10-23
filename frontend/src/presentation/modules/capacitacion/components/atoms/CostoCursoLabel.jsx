/**
 * Átomo: costo de un curso de capacitación (CAP) — «Bs X» o pill «Gratis» si
 * el curso no tiene costo asociado (costo <= 0). Fuente de la regla:
 * `esCursoGratuito` (capacitacionPills.js). Un solo lugar para este criterio
 * visual, reusado en fichas, tablas y tarjetas de cursos e inscripciones —
 * evita repetir la misma condición `costo > 0 ? ... : ...` en cada pantalla.
 * `aplica=false` rotula un concepto no cobrado («No aplica»).
 * Con `costoMax` mayor a `costo` muestra el rango «Bs X – Y» (matrícula que varía por grupo).
 */

import { StatusPill } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import {
  COSTO_GRATUITO_PILL_CLASS,
  esCursoGratuito,
} from '@application-capacitacion/utils/capacitacionPills';

const CostoCursoLabel = ({ costo, costoMax = null, aplica = true }) => {
  // Concepto no cobrado (interruptor apagado): no se muestra como «Gratis».
  if (!aplica) return <>No aplica</>;
  // Rango con un extremo en 0 (un grupo no cobra y otro sí): «Bs 0 – 250», no «Gratis».
  const esRango = costoMax != null && Number(costoMax) > Number(costo);
  if (esCursoGratuito(costo) && !esRango) {
    return <StatusPill label="Gratis" className={COSTO_GRATUITO_PILL_CLASS} />;
  }
  if (esRango) {
    return <>Bs {formatBs(costo)} – {formatBs(costoMax)}</>;
  }
  return <>Bs {formatBs(costo)}</>;
};

export default CostoCursoLabel;
