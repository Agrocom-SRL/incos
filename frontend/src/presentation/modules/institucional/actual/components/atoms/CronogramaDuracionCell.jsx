/**
 * Átomo: duración de la actividad de calendario en una sola columna, con iconos
 * (mismo patrón que las métricas de carrera). Si no hay fecha de fin, la
 * actividad es de un solo día ("todo el día").
 */

import { CalendarOutlined, FlagOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { formatFechaCorta } from '@application-institucional/actual/utils/bimestresTimeline.js';

const { Text } = Typography;

const Linea = ({ icon, children, muted = false }) => (
  <li className="cfg-academico-metricas-list__item">
    <span className="cfg-academico-metricas-list__icon" aria-hidden>
      {icon}
    </span>
    <Text
      type="secondary"
      className={`cfg-academico-metricas-list__label${muted ? ' cronograma-duracion__todo' : ''}`}
    >
      {children}
    </Text>
  </li>
);

const CronogramaDuracionCell = ({ fechaInicio, fechaFin }) => {
  const unDia = !fechaFin;

  return (
    <ul className="cfg-academico-metricas-list">
      <Linea icon={<CalendarOutlined />}>{formatFechaCorta(fechaInicio)}</Linea>
      {unDia ? (
        <Linea icon={<ClockCircleOutlined />} muted>
          Todo el día
        </Linea>
      ) : (
        <Linea icon={<FlagOutlined />}>{formatFechaCorta(fechaFin)}</Linea>
      )}
    </ul>
  );
};

export default CronogramaDuracionCell;
