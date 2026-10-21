/**
 * Átomo: tag de un horario de un grupo (curso de capacitación) con
 * estilo pill (familia `cfg-materia-pill`, mismo lenguaje que `StatusPill`) en
 * vez del tag gris por defecto de Ant Design. Color por `turno` del horario
 * (MAÑANA/TARDE/NOCHE, derivado de la hora de inicio) vía el resolver
 * compartido `getParaleloTurnoFormPillClass` (mismo criterio que Paralelos —
 * no se inventa una clase nueva).
 */
import { Tag } from 'antd';
import { getParaleloTurnoFormPillClass } from '@application-configuracion-recursos/config/paraleloTurnoOptions';

const BloqueHorarioTag = ({ label, closable, onClose, turno }) => (
  <Tag
    closable={closable}
    onClose={onClose}
    onMouseDown={(event) => event.preventDefault()}
    className={getParaleloTurnoFormPillClass(turno)}
    style={{ marginInlineEnd: 4 }}
  >
    {label}
  </Tag>
);

export default BloqueHorarioTag;
