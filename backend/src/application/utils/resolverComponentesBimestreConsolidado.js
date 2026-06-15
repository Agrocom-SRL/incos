import {
  calcularNotaBimestre,
  componenteEfectivo,
} from './cuadernoNotasCalculo.js';

const redondear = (v) => (v == null ? null : Math.round(Number(v) * 100) / 100);

const tieneValor = (v) => v != null && Number.isFinite(Number(v));

/**
 * Valores a mostrar en consolidado rápido: habilitación → nota bimestral → cálculo cuaderno.
 */
export function resolverComponentesBimestreConsolidado({
  habilitacionTeorico = null,
  habilitacionPractico = null,
  notaTeorico = null,
  notaPractico = null,
  notaBimestre = null,
  calculado = null,
}) {
  const habTeo = redondear(habilitacionTeorico);
  const habPra = redondear(habilitacionPractico);
  const notaTeo = redondear(notaTeorico);
  const notaPra = redondear(notaPractico);
  const calcTeo = calculado?.teorico != null ? redondear(calculado.teorico) : null;
  const calcPra = calculado?.practico != null ? redondear(calculado.practico) : null;

  const teorico = tieneValor(habTeo)
    ? habTeo
    : tieneValor(notaTeo)
      ? notaTeo
      : calcTeo ?? 0;
  const practico = tieneValor(habPra)
    ? habPra
    : tieneValor(notaPra)
      ? notaPra
      : calcPra ?? 0;

  const teoEfectivo = componenteEfectivo(habTeo, notaTeo ?? calcTeo);
  const praEfectivo = componenteEfectivo(habPra, notaPra ?? calcPra);
  const totalEfectivo =
    notaBimestre != null ? redondear(notaBimestre) : calcularNotaBimestre(teoEfectivo, praEfectivo);

  return {
    teorico,
    practico,
    total: totalEfectivo ?? redondear(teorico + practico),
    habilitacionTeorico: habTeo,
    habilitacionPractico: habPra,
    notaTeorico: notaTeo,
    notaPractico: notaPra,
    calculadoTeorico: calcTeo,
    calculadoPractico: calcPra,
    fuenteTeorico: tieneValor(habTeo) ? 'habilitacion' : tieneValor(notaTeo) ? 'nota' : 'calculado',
    fuentePractico: tieneValor(habPra) ? 'habilitacion' : tieneValor(notaPra) ? 'nota' : 'calculado',
  };
}

/**
 * nota_bimestre cerrada según componentes efectivos (habilitación reemplaza nota de cuaderno).
 */
export function calcularNotaBimestreCerrada({
  habilitacionTeorico,
  habilitacionPractico,
  notaTeorico,
  notaPractico,
}) {
  const teoEf = componenteEfectivo(
    redondear(habilitacionTeorico),
    redondear(notaTeorico),
  );
  const praEf = componenteEfectivo(
    redondear(habilitacionPractico),
    redondear(notaPractico),
  );
  return calcularNotaBimestre(teoEf, praEf);
}
