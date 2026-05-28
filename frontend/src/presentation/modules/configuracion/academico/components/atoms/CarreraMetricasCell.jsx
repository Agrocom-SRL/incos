/**
 * Métricas materias + periodos por carrera (patrón coordinación).
 */

import { CalendarOutlined, ReadOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Text } = Typography;

const Linea = ({ icon, valor, etiqueta }) => (
  <li className="cfg-academico-metricas-list__item">
    <span className="cfg-academico-metricas-list__icon" aria-hidden>
      {icon}
    </span>
    <Text type="secondary" className="cfg-academico-metricas-list__label">
      {valor} {etiqueta}
    </Text>
  </li>
);

const CarreraMetricasCell = ({ cantidadMaterias = 0, cantidadPeriodos = 0 }) => (
  <ul className="cfg-academico-metricas-list">
    <Linea icon={<ReadOutlined />} valor={cantidadMaterias} etiqueta="materias" />
    <Linea icon={<CalendarOutlined />} valor={cantidadPeriodos} etiqueta="periodos" />
  </ul>
);

export default CarreraMetricasCell;
