/**
 * Organismo: resumen del estado del aporte del estudiante (Finanzas).
 *
 * Recibe el estado ya mapeado (monto obligatorio, total pagado, saldo pendiente,
 * descuento por beca, gestión). Solo presentación; no llama hooks de fetch.
 */

import { Alert, Spin } from 'antd';
import { StatusPill } from '@atoms';
import { formatBolivianos } from '@finanzas/pagos/config/registrarFormConfig';
import { getSaldoPillClass } from '@application-finanzas/utils/pagosPills';

const EstadoAporteResumen = ({ estado, loading = false, error = null }) => {
  if (loading) {
    return <Spin />;
  }

  if (error) {
    return (
      <Alert type="error" showIcon title="No se pudo obtener el estado del aporte" description={error} />
    );
  }

  if (!estado) {
    return null;
  }

  const gestionLabel =
    estado.gestion?.nombre || (estado.gestion?.anio != null ? `Gestión ${estado.gestion.anio}` : null);

  return (
    <div className="fin-pago-reg-resumen">
      {gestionLabel ? (
        <div className="fin-pago-reg-resumen__item">
          <span className="fin-pago-reg-resumen__label">Gestión</span>
          <span className="fin-pago-reg-resumen__valor">{gestionLabel}</span>
        </div>
      ) : null}

      <div className="fin-pago-reg-resumen__item">
        <span className="fin-pago-reg-resumen__label">Monto obligatorio</span>
        <span className="fin-pago-reg-resumen__valor">{formatBolivianos(estado.montoObligatorio)}</span>
      </div>

      {estado.tieneDescuentoAplicado ? (
        <div className="fin-pago-reg-resumen__item">
          <span className="fin-pago-reg-resumen__label">Descuento por beca</span>
          <span className="fin-pago-reg-resumen__valor">
            {formatBolivianos(estado.descuentoBeca)}{' '}
            <StatusPill label="Aplicado" className="pago-pill pago-pill--cancelado" />
          </span>
        </div>
      ) : null}

      <div className="fin-pago-reg-resumen__item">
        <span className="fin-pago-reg-resumen__label">Total pagado</span>
        <span className="fin-pago-reg-resumen__valor">{formatBolivianos(estado.totalPagado)}</span>
      </div>

      <div className="fin-pago-reg-resumen__item">
        <span className="fin-pago-reg-resumen__label">Saldo pendiente</span>
        <span className="fin-pago-reg-resumen__valor">
          <StatusPill
            label={formatBolivianos(estado.saldoPendiente)}
            className={getSaldoPillClass(estado.saldoPendiente)}
          />
        </span>
      </div>
    </div>
  );
};

export default EstadoAporteResumen;
