/**
 * Átomo: celda Titular del listado de cuentas de pago (Config. de pagos ·
 * Finanzas). Gemela de `DocumentacionNombreCell`: `IdentidadCelda` con el
 * nombre del titular y, DEBAJO, el método de pago como dot + etiqueta teñida
 * (`cfg-identidad-substate`, tono info — es categoría, no estado). Nombres
 * largos: clamp a 2 líneas (`cfg-identidad-clamp2`); el nombre completo queda
 * disponible en el title.
 */

import { IdentidadCelda } from '@atoms';

const CuentaTitularCell = ({ titular, metodoNombre }) => (
  <div className="cfg-identidad-clamp2" title={titular || undefined}>
    <IdentidadCelda nombre={(titular || 'Sin titular').toUpperCase()} />
    {metodoNombre ? (
      <span className="cfg-identidad-substate cfg-identidad-substate--info">
        <span className="cfg-identidad-substate__dot" aria-hidden />
        {metodoNombre}
      </span>
    ) : null}
  </div>
);

export default CuentaTitularCell;
