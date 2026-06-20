/**
 * Celda "Saldo" del listado de pagos de aporte. Mismo lenguaje que PagoDescuentoCell
 * pero INVERTIDO: primero dos sublíneas con icono (descripción) y al final el span/pill
 * con el resultado del saldo.
 *
 *   1. Aporte   → monto de la cuota aporte completa (montoBase), con icono.
 *   2. Cubierto → sumatoria de descuento por beca + total pagado, con icono.
 *   3. Resultado→ StatusPill: verde "Cancelado" si está saldado, en otro caso un pill
 *                 (rojo) con lo que aún se debe.
 *
 * Solo presentación; recibe montos ya formateados (strings) y la clase del pill.
 */

import { Typography } from 'antd';
import { WalletOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';

const { Text } = Typography;

const Linea = ({ icon, children }) => (
  <li className="cfg-academico-metricas-list__item">
    <span className="cfg-academico-metricas-list__icon" aria-hidden>
      {icon}
    </span>
    <Text type="secondary" className="cfg-academico-metricas-list__label">
      {children}
    </Text>
  </li>
);

const PagoSaldoCell = ({ aporte, cubierto, saldoLabel, saldoPillClass }) => (
  <div className="pago-saldo-cell">
    <ul className="cfg-academico-metricas-list pago-saldo-cell__lineas">
      <Linea icon={<WalletOutlined />}>{`Aporte: `} <strong>{aporte}</strong> </Linea>
      <Linea icon={<CheckCircleOutlined />}>{`Cubierto: `} <strong>{cubierto}</strong> </Linea>
    </ul>
    <div className="pago-saldo-cell__resultado">
      <StatusPill label={saldoLabel} className={saldoPillClass} />
    </div>
  </div>
);

export default PagoSaldoCell;
