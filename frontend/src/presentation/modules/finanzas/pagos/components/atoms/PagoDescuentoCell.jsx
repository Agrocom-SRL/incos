/**
 * Celda "Descuento" del listado de pagos de aporte. Mismo lenguaje que PagoPagadoCell
 * (lista con iconos): arriba un StatusPill con el PORCENTAJE del descuento (teñido por
 * nivel) y, debajo, dos sublíneas con icono = monto equivalente del descuento y nombre
 * de la beca aplicada.
 *
 * Solo presentación; recibe datos ya formateados (monto como string, % como número).
 */

import { Typography } from 'antd';
import { TagOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';

const { Text } = Typography;

const Linea = ({ icon, children, title }) => (
  <li className="cfg-academico-metricas-list__item">
    <span className="cfg-academico-metricas-list__icon" aria-hidden>
      {icon}
    </span>
    <Text type="secondary" className="cfg-academico-metricas-list__label" title={title}>
      {children}
    </Text>
  </li>
);

const PagoDescuentoCell = ({ porcentaje, montoLabel, nombre, nombreCompleto, pillClass }) => {
  const pct = Math.round(Number(porcentaje) || 0);
  return (
    <div className="pago-descuento-cell">
      <div className="pago-descuento-cell__pct">
        <StatusPill label={`${pct}%`} className={pillClass} />
      </div>
      <ul className="cfg-academico-metricas-list pago-descuento-cell__lineas">
        <Linea icon={<TagOutlined />}><strong>{montoLabel}</strong></Linea>
        {nombre ? (
          <Linea icon={<SafetyCertificateOutlined />} title={nombreCompleto || nombre}>
            {nombre}
          </Linea>
        ) : null}
      </ul>
    </div>
  );
};

export default PagoDescuentoCell;
