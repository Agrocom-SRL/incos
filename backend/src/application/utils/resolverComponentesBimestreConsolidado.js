import { calcularNotaBimestre } from './cuadernoNotasCalculo.js';

const redondear = (v) => (v == null ? null : Math.round(Number(v) * 100) / 100);

const tieneValor = (v) => v != null && Number.isFinite(Number(v));

/**
 * Valores a mostrar en consolidado: nota bimestral → cálculo del cuaderno.
 * nota_bimestre = nota_teorico + nota_practico (sin habilitación).
 */
export function resolverComponentesBimestreConsolidado({
  notaTeorico = null,
  notaPractico = null,
  notaBimestre = null,
  calculado = null,
}) {
  const notaTeo = redondear(notaTeorico);
  const notaPra = redondear(notaPractico);
  const calcTeo = calculado?.teorico != null ? redondear(calculado.teorico) : null;
  const calcPra = calculado?.practico != null ? redondear(calculado.practico) : null;

  const teorico = tieneValor(notaTeo) ? notaTeo : calcTeo ?? 0;
  const practico = tieneValor(notaPra) ? notaPra : calcPra ?? 0;

  const total =
    notaBimestre != null
      ? redondear(notaBimestre)
      : calcularNotaBimestre(teorico, practico) ?? redondear(teorico + practico);

  return { teorico, practico, total };
}
