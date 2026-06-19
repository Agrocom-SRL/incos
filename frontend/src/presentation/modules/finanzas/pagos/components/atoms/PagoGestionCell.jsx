/**
 * Celda de gestión del pago (gemela de LicenciaAcademicoCell): gestión y año en
 * líneas con icono. Solo presentación; recibe datos ya mapeados.
 */

import { Typography } from 'antd';
import { CalendarOutlined, NumberOutlined } from '@ant-design/icons';

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

const PagoGestionCell = ({ gestionLabel, gestionAnio }) => (
  <ul className="cfg-academico-metricas-list">
    <Linea icon={<CalendarOutlined />}>{gestionLabel ?? '—'}</Linea>
    {gestionAnio ? <Linea icon={<NumberOutlined />}>{`Año ${gestionAnio}`}</Linea> : null}
  </ul>
);

export default PagoGestionCell;
