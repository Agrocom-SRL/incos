/**
 * TimetableCell - Componente molécula para celda del horario
 * 
 * Single Responsibility: Mostrar celda con información de clase o vacía
 * 
 * Atomic Design: Molecule
 * - Componente compuesto de átomos (Text, Tag) y componentes de Ant Design (Tooltip)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de una celda
 * - Open/Closed: Extensible mediante props
 */

import { Tooltip, Tag } from 'antd';
import { 
  BookOutlined, 
  TeamOutlined, 
  UserOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { Text } from '@atoms';

/**
 * Componente para mostrar una celda del horario (con clase o vacía)
 * 
 * @param {Object} props
 * @param {Object} props.classData - Datos de la clase (null si está vacía)
 * @param {Object} props.day - Configuración del día
 * @param {Object} props.timeSlot - Configuración del bloque horario
 * @param {boolean} props.editable - Si la celda es editable
 * @param {Function} props.onClassClick - Callback al hacer click en una clase
 * @param {Function} props.onCellClick - Callback al hacer click en celda vacía
 */
export const TimetableCell = ({
  classData,
  day,
  timeSlot,
  editable,
  onClassClick,
  onCellClick,
}) => {
  // Si no hay clase, mostrar celda vacía
  if (!classData) {
    return (
      <div
        className="timetable-cell timetable-cell-empty"
        onClick={() => editable && onCellClick?.(day, timeSlot)}
      >
        {editable && <span className="timetable-cell-add">+</span>}
      </div>
    );
  }

  // ✅ Si es una continuación, NO renderizar nada (la celda principal ya ocupa este espacio)
  if (classData.isContinuation) {
    return null; // ✅ CAMBIO CLAVE: No renderizar celdas de continuación
  }

  // Si hay conflicto, resaltar
  const cellClassName = `timetable-cell ${
    classData.hasConflict ? 'timetable-cell-conflict' : ''
  } ${classData.spanSlots > 1 ? 'timetable-cell-spans' : ''}`;

  // ✅ Estilos inline para controlar el span
  const cellStyle = {
    backgroundColor: classData.color || 'var(--color-primary)',
    borderLeftColor: classData.color || 'var(--color-primary)',
    ...(classData.spanSlots > 1 && {
      '--span-slots': classData.spanSlots, // CSS variable para grid-row span
    }),
  };

  // Contenido del tooltip
  const tooltipContent = (
    <div className="timetable-tooltip">
      <div className="timetable-tooltip-header">
        <BookOutlined /> <strong>{classData.materia}</strong>
      </div>
      <div className="timetable-tooltip-row">
        <TeamOutlined /> Paralelo: {classData.paralelo}
      </div>
      {classData.docente && (
        <div className="timetable-tooltip-row">
          <UserOutlined /> Docente: {classData.docente}
        </div>
      )}
      <div className="timetable-tooltip-row">
        <ClockCircleOutlined /> {classData.startTime} - {classData.endTime}
      </div>
      {classData.aula && (
        <div className="timetable-tooltip-row">
          📍 Aula: {classData.aula}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="top">
      <div
        className={cellClassName}
        style={cellStyle}
        onClick={() => onClassClick?.(classData)}
      >
        <div className="timetable-cell-content">
          <div className="timetable-cell-title">
            {classData.materia}
          </div>
          <div className="timetable-cell-subtitle">
            {classData.paralelo && (
              <Tag 
                size="small" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.15)', 
                  color: '#000000', 
                  border: 'none',
                  fontWeight: 500,
                }}
              >
                {classData.paralelo}
              </Tag>
            )}
          </div>
          <div className="timetable-cell-time">
            {classData.startTime} - {classData.endTime}
          </div>
          {classData.aula && (
            <div className="timetable-cell-aula">
              📍 {classData.aula}
            </div>
          )}
        </div>
      </div>
    </Tooltip>
  );
};

export default TimetableCell;
