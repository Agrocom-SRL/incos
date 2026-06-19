/**
 * Celda de monto del listado de pagos: valor principal (alineado a la derecha) y un
 * subtexto opcional (base/beca o cantidad de pagos). Solo presentación.
 */

const PagoMontoCell = ({ valor, sub = null }) => (
  <div className="pago-monto-cell">
    <span className="pago-monto-cell__valor">{valor}</span>
    {sub ? <span className="pago-monto-cell__sub">{sub}</span> : null}
  </div>
);

export default PagoMontoCell;
