export const BIMESTRE_TITULOS = [
  'Primer bimestre',
  'Segundo bimestre',
  'Tercer bimestre',
  'Cuarto bimestre',
];

export const tituloBimestre = (numero) =>
  BIMESTRE_TITULOS[Number(numero) - 1] ?? `Bimestre ${numero}`;
