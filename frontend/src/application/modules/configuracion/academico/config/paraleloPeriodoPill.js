/**
 * Pills de periodo del plan (color por número de año).
 */

export const getParaleloPeriodoLabel = (record) => {
  if (record?.periodoNombre) return record.periodoNombre;
  if (record?.periodoNumero != null) return `${record.periodoNumero}º año`;
  if (record?.numero != null) return `${record.numero}º año`;
  if (record?.periodoId) return `Periodo #${record.periodoId}`;
  return '—';
};

export const getParaleloPeriodoNumero = (record) =>
  record?.periodoNumero ?? record?.numero ?? null;

export const getParaleloPeriodoPillClass = (numero) => {
  const n = Number(numero);
  if (n === 1) return 'cfg-paralelo-periodo-pill cfg-paralelo-periodo-pill--n1';
  if (n === 2) return 'cfg-paralelo-periodo-pill cfg-paralelo-periodo-pill--n2';
  if (n === 3) return 'cfg-paralelo-periodo-pill cfg-paralelo-periodo-pill--n3';
  if (n >= 4) return 'cfg-paralelo-periodo-pill cfg-paralelo-periodo-pill--n4';
  return 'cfg-paralelo-periodo-pill cfg-paralelo-periodo-pill--default';
};
