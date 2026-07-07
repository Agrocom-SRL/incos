/**
 * Resumen informativo de bloques horarios disponibles por turno (catálogo seed 24).
 */
import { Typography } from 'antd';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { getParaleloTurnoHorarioInfoNormalized } from '@application-configuracion/academico/config/paraleloTurnoHorarioInfo';

const { Text } = Typography;

const ParaleloTurnoHorarioInfo = ({ turno, compact = false, showTitle = true }) => {
  const info = getParaleloTurnoHorarioInfoNormalized(turno);
  if (!info) return null;

  return (
    <div className={`cfg-paralelo-turno-horario${compact ? ' cfg-paralelo-turno-horario--compact' : ''}`}>
      {showTitle ? (
        <div className="cfg-paralelo-turno-horario__head">
          <ClockCircleOutlined className="cfg-paralelo-turno-horario__icon" aria-hidden />
          <Text strong className="cfg-paralelo-turno-horario__titulo">
            Franjas del turno {info.turno}
          </Text>
        </div>
      ) : null}

      <p className="cfg-paralelo-turno-horario__linea">
        <CalendarOutlined aria-hidden className="cfg-paralelo-turno-horario__inline-icon" />
        <span>
          {info.diasLabel}:{' '}
          <Text strong>
            {info.horaInicio} – {info.horaFin}
          </Text>
          {info.bloquesPorDia != null ? (
            <Text type="secondary">
              {' '}
              · {info.bloquesPorDia} bloques × {info.duracionBloqueMin} min
            </Text>
          ) : null}
        </span>
      </p>

      {info.slots.length > 0 ? (
        <p className="cfg-paralelo-turno-horario__slots">
          {info.slots.join(' · ')}
        </p>
      ) : null}

      {info.nota ? (
        <p className="cfg-paralelo-turno-horario__nota">{info.nota}</p>
      ) : null}
    </div>
  );
};

export default ParaleloTurnoHorarioInfo;
