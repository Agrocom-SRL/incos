/**
 * Átomo: concurrencia de un registro de Config. de pagos (pagos registrados /
 * transacciones / pagos recibidos / asignaciones). Mismo mecanismo que
 * `CatalogoUsosCell` (complementarios): líneas apiladas `InfoLinesCell` con
 * icono + "N etiqueta" y, sin referencias (todos los conteos en 0), un
 * `StatusPill` neutro «Sin registros». Los labels los decide cada columna
 * (aquí NO se llama "Usos": es vocabulario propio de finanzas).
 */

import { InfoLinesCell, StatusPill } from '@atoms';

/** Etiqueta con singular/plural correcto ("1 pago" / "2 pagos"). */
const pluralizar = (cantidad, singular, plural) => (cantidad === 1 ? singular : plural);

/**
 * @param {Object} props
 * @param {Array<{key?:string, icon?:React.ReactNode, cantidad:number, singular:string, plural:string}>} props.lineas
 *   Líneas de conteo; las que estén en 0 se omiten.
 */
const ConcurrenciaCell = ({ lineas = [] }) => {
  const visibles = lineas
    .map((linea) => ({ ...linea, cantidad: Number(linea?.cantidad) || 0 }))
    .filter((linea) => linea.cantidad > 0);

  if (visibles.length === 0) {
    return <StatusPill label="Sin registros" className="cfg-materia-pill cfg-materia-pill--default" />;
  }

  return (
    <InfoLinesCell
      lines={visibles.map((linea, indice) => ({
        key: linea.key ?? indice,
        icon: linea.icon,
        label: `${linea.cantidad} ${pluralizar(linea.cantidad, linea.singular, linea.plural)}`,
      }))}
    />
  );
};

export default ConcurrenciaCell;
