/**
 * TimetableHeader - Componente molécula para encabezado del horario
 * 
 * Single Responsibility: Mostrar encabezado con días de la semana
 * 
 * Atomic Design: Molecule
 * - Componente compuesto de átomos (Text)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI del encabezado
 * - Open/Closed: Extensible mediante props
 */

import { Text } from '@atoms';

/**
 * Componente para mostrar el encabezado del horario con días de la semana
 * 
 * @param {Object} props
 * @param {Array} props.days - Array de configuración de días
 */
export const TimetableHeader = ({ days = [] }) => {
  return (
    <div className="timetable-header">
      {/* Celda vacía para alinear con columna de horas */}
      <div className="timetable-header-time"></div>

      {/* Días de la semana */}
      {days.map((day) => (
        <div key={day.key} className="timetable-header-day">
          <Text strong>{day.label}</Text>
          {day.date && (
            <Text type="secondary" className="timetable-header-date">
              {day.date}
            </Text>
          )}
        </div>
      ))}
    </div>
  );
};

export default TimetableHeader;
