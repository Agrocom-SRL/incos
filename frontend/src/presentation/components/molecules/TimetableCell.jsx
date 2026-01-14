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

  // Si es una continuación de otra celda (clase que ocupa múltiples slots)
  // Solo mostrar el color de fondo, sin contenido
  if (classData.isContinuation) {
    const cellClassName = `timetable-cell timetable-cell-continuation ${
      classData.hasConflict ? 'timetable-cell-conflict' : ''
    }`;
    
    return (
      <div
        className={cellClassName}
        style={{ 
          backgroundColor: classData.color || 'var(--color-primary)',
          borderLeftColor: classData.color || 'var(--color-primary)',
        }}
      />
    );
  }

  // Si hay conflicto, resaltar
  const cellClassName = `timetable-cell ${
    classData.hasConflict ? 'timetable-cell-conflict' : ''
  } ${classData.spanSlots > 1 ? 'timetable-cell-spans' : ''}`;

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
        style={{ 
          backgroundColor: classData.color || 'var(--color-primary)',
          borderLeftColor: classData.color || 'var(--color-primary)',
        }}
        onClick={() => onClassClick?.(classData)}
      >
        <div className="timetable-cell-content">
          <div className="timetable-cell-title">
            {classData.materia}
          </div>
          <div className="timetable-cell-subtitle">
            <Tag size="small" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'var(--color-white)', border: 'none' }}>
              {classData.paralelo}
            </Tag>
          </div>
          <div className="timetable-cell-time">
            {classData.startTime}
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default TimetableCell;
