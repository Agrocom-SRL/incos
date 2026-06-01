/**
 * Límites de carga horaria del docente: color + máx. h/semana y h/mes.
 */

import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const { Text } = Typography;

const fmtHoras = (valor) => (valor != null && !Number.isNaN(Number(valor)) ? Number(valor) : null);

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

const DocenteCargaHorariaCell = ({ colorHex, maxHorasSemana, maxHorasMes }) => {
  const swatch = sanitizeDocenteColorHex(colorHex);
  const horasSemana = fmtHoras(maxHorasSemana);
  const horasMes = fmtHoras(maxHorasMes);
  const hasLimites = horasSemana != null || horasMes != null;

  if (!swatch && !hasLimites) {
    return <Text type="secondary" className="cfg-academico-metricas-list__label">—</Text>;
  }

  return (
    <div className="doc-carga-cell">
      {swatch ? (
        <span
          className="cfg-carrera-titulo-dot__swatch doc-carga-cell__dot"
          style={{ backgroundColor: swatch }}
          title={swatch}
          aria-label={`Color del docente ${swatch}`}
        />
      ) : null}
      <ul className="cfg-academico-metricas-list">
        {horasSemana != null ? (
          <Linea icon={<ClockCircleOutlined />}>{horasSemana} h / semana</Linea>
        ) : null}
        {horasMes != null ? (
          <Linea icon={<CalendarOutlined />}>{horasMes} h / mes</Linea>
        ) : null}
      </ul>
    </div>
  );
};

export default DocenteCargaHorariaCell;
