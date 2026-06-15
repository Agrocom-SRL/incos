/**
 * Ajuste de ponderaciones que deben sumar 100%.
 */

const round1 = (n) => Math.round(Number(n) * 10) / 10;

/** Par complementario: al mover el primero, el segundo = 100 - primero */
export const ajustarParComplementario = (primero, nuevoPrimero) => {
  const a = Math.max(0, Math.min(100, Number(nuevoPrimero) || 0));
  return [round1(a), round1(100 - a)];
};

/**
 * Al cambiar un índice, redistribuye el resto proporcionalmente para mantener suma 100.
 * @param {number[]} pesos
 * @param {number} index
 * @param {number} nuevoValor
 */
export const ajustarPesosMultiples = (pesos, index, nuevoValor) => {
  const n = pesos.length;
  if (n === 0) return [];
  if (n === 1) return [100];

  const clamped = Math.max(0, Math.min(100, Number(nuevoValor) || 0));
  const otros = pesos.filter((_, i) => i !== index);
  const sumaOtros = otros.reduce((s, v) => s + (Number(v) || 0), 0);
  const restante = 100 - clamped;

  if (sumaOtros <= 0) {
    const cada = restante / (n - 1);
    return pesos.map((_, i) => (i === index ? round1(clamped) : round1(cada)));
  }

  const escalados = pesos.map((v, i) => {
    if (i === index) return round1(clamped);
    return round1(((Number(v) || 0) / sumaOtros) * restante);
  });

  const suma = escalados.reduce((s, v) => s + v, 0);
  const diff = round1(100 - suma);
  if (Math.abs(diff) > 0.05) {
    const lastOther = escalados.findIndex((_, i) => i !== index);
    const fixIdx = lastOther >= 0 ? lastOther : 0;
    escalados[fixIdx] = round1(escalados[fixIdx] + diff);
  }
  return escalados;
};

export const sumaPesos = (arr) =>
  (arr ?? []).reduce((acc, p) => acc + (Number(p) || 0), 0);
