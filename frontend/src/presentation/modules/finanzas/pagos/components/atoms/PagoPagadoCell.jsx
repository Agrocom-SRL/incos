/**
 * Celda "Pagado" del listado de pagos de aporte. Variante del patrón de
 * PagoGestionCell (lista con iconos): valor principal en NEGRITA = total pagado,
 * y sublíneas con icono = cantidad de cuotas y gestión del pago.
 *
 * Solo presentación; recibe datos ya formateados (montos como string).
 */

import { Typography } from 'antd';
import { CalendarOutlined, FileDoneOutlined } from '@ant-design/icons';

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

const PagoPagadoCell = ({ total, cantidadPagos = 0, gestionLabel }) => {
  const cuotasLabel = `${cantidadPagos} ${cantidadPagos === 1 ? 'cuota' : 'cuotas'}`;
  return (
    <div className="pago-pagado-cell">
      <span className="pago-pagado-cell__total">{total}</span>
      <ul className="cfg-academico-metricas-list pago-pagado-cell__lineas">
        <Linea icon={<FileDoneOutlined />}>{cuotasLabel}</Linea>
        {gestionLabel ? <Linea icon={<CalendarOutlined />}>{gestionLabel}</Linea> : null}
      </ul>
    </div>
  );
};

export default PagoPagadoCell;
