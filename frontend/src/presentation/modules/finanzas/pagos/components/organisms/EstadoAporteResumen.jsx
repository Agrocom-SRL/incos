/**
 * Organismo: resumen del estado del aporte del estudiante (Finanzas).
 *
 * Recibe el estado ya mapeado (monto obligatorio, total pagado, saldo pendiente,
 * descuento por beca, gestión). Solo presentación; no llama hooks de fetch.
 */

import { Alert, Spin, Tag } from 'antd';
import { formatBolivianos } from '@finanzas/pagos/config/registrarFormConfig';

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
            <Tag color="success" style={{ margin: 0 }}>
              Aplicado
            </Tag>
          </span>
        </div>
      ) : null}

      <div className="fin-pago-reg-resumen__item">
        <span className="fin-pago-reg-resumen__label">Total pagado</span>
        <span className="fin-pago-reg-resumen__valor">{formatBolivianos(estado.totalPagado)}</span>
      </div>

      <div className="fin-pago-reg-resumen__item">
        <span className="fin-pago-reg-resumen__label">Saldo pendiente</span>
        <span className="fin-pago-reg-resumen__valor fin-pago-reg-resumen__valor--saldo">
          {formatBolivianos(estado.saldoPendiente)}
        </span>
      </div>
    </div>
  );
};

export default EstadoAporteResumen;
