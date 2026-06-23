/**
 * Celda de fechas de una licencia (lista) — patrón multi-línea de CarreraMetricasCell:
 *  - Inicio del periodo.
 *  - "Un solo día" (si fechaFin === fechaInicio) o "Fin: …" en subfila.
 *  - Total de días del periodo.
 */

import { Typography } from 'antd';
import { CalendarOutlined, FieldTimeOutlined, RetweetOutlined } from '@ant-design/icons';
import { etiquetaDiaMesAnio } from '@application-academico/asistencia/utils/asistenciaFechas.js';

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

const LicenciaFechasCell = ({ fechaInicio, fechaFin, totalDias }) => {
  const unDia = !fechaFin || fechaFin === fechaInicio;
  const dias = totalDias ?? (unDia ? 1 : null);

  return (
    <ul className="cfg-academico-metricas-list">
      <Linea icon={<CalendarOutlined />}>Inicio: {etiquetaDiaMesAnio(fechaInicio)}</Linea>
      {unDia ? (
        <Linea icon={<RetweetOutlined />}>Un solo día</Linea>
      ) : (
        <Linea icon={<CalendarOutlined />}>Fin: {etiquetaDiaMesAnio(fechaFin)}</Linea>
      )}
      <Linea icon={<FieldTimeOutlined />}>{dias ?? '—'} día(s)</Linea>
    </ul>
  );
};

export default LicenciaFechasCell;
