/**
 * Celda de fechas de registro como lista de métricas (patrón `cfg-academico-metricas-list`).
 * Estilos importados por la página de listado.
 */
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Text } = Typography;

const fmtDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-BO');
};

const Linea = ({ icon, etiqueta, valor }) => (
  <li className="cfg-academico-metricas-list__item">
    <span className="cfg-academico-metricas-list__icon" aria-hidden>
      {icon}
    </span>
    <Text type="secondary" className="cfg-academico-metricas-list__label">
      {etiqueta}: {valor}
    </Text>
  </li>
);

const RegistroMetricasCell = ({ creado, actualizado }) => (
  <ul className="cfg-academico-metricas-list">
    <Linea icon={<CalendarOutlined />} etiqueta="Creado" valor={fmtDate(creado)} />
    <Linea icon={<ClockCircleOutlined />} etiqueta="Actualizado" valor={fmtDate(actualizado)} />
  </ul>
);

export default RegistroMetricasCell;
