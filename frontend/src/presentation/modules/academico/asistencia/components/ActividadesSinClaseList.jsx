/**
 * Lista "por qué estos días no hay clase" (organismo).
 *
 * Muestra las actividades sin clase del bimestre (feriado / receso / vacaciones) con el
 * mismo lenguaje de pills del cronograma institucional (getActividadTipoPillClass), para
 * explicar los días pintados en rojo en el calendario.
 */

import { Empty, Flex, Tag, Typography } from 'antd';
import { CalendarOutlined, StarFilled } from '@ant-design/icons';
import { allColors } from '@theme/tokens';
import { StatusPill } from '@atoms';
import {
  getActividadTipoLabel,
  getActividadTipoPillClass,
} from '@application-institucional/actual/config/actividadPill.js';
import { etiquetaDiaMes } from '@application-academico/asistencia/utils/asistenciaFechas.js';
import '@institucional/actual/styles/cronograma.css';

const { Text } = Typography;

/** 'desde – hasta' o un único día, en formato corto. */
const rangoActividad = (act) => {
  const desde = String(act?.fechaInicio ?? '').slice(0, 10);
  const hasta = String(act?.fechaFin ?? '').slice(0, 10);
  if (!desde) return '—';
  if (!hasta || hasta === desde) return etiquetaDiaMes(desde);
  return `${etiquetaDiaMes(desde)} – ${etiquetaDiaMes(hasta)}`;
};

const ActividadesSinClaseList = ({ actividades = [] }) => {
  if (!actividades.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No hay feriados ni recesos en este bimestre"
      />
    );
  }

  return (
    <Flex vertical gap="small" className="asi-actividades">
      <Flex align="center" gap="small" className="asi-actividades__intro">
        <CalendarOutlined aria-hidden />
        <Text type="secondary">
          Días marcados en rojo en el calendario: no se toma asistencia en estas fechas.
        </Text>
      </Flex>

      <ul className="asi-actividades__lista">
        {actividades.map((act) => (
          <li key={act.id} className="asi-actividades__item">
            <span className="asi-actividades__fecha">{rangoActividad(act)}</span>
            <Flex align="center" gap="small" wrap className="asi-actividades__cuerpo">
              {act.esDestacada ? (
                <StarFilled style={{ color: allColors.colorWarning }} aria-hidden />
              ) : null}
              <Text strong>{act.nombre}</Text>
              <StatusPill
                label={getActividadTipoLabel(act.tipo)}
                className={getActividadTipoPillClass(act.tipo)}
              />
              {act.estado === 'vigente' ? <Tag color="processing">En curso</Tag> : null}
            </Flex>
          </li>
        ))}
      </ul>
    </Flex>
  );
};

export default ActividadesSinClaseList;
