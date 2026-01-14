/**
 * TimetableTimeSlot - Componente molécula para bloque de hora
 * 
 * Single Responsibility: Mostrar bloque de hora (columna izquierda)
 * 
 * Atomic Design: Molecule
 * - Componente compuesto de átomos (Text)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI del bloque de hora
 * - Open/Closed: Extensible mediante props
 */

import { Text } from '@atoms';

/**
 * Componente para mostrar un bloque de hora en la columna izquierda
 * 
 * @param {Object} props
 * @param {Object} props.timeSlot - Objeto con startTime y endTime
 */
export const TimetableTimeSlot = ({ timeSlot }) => {
  return (
    <div className="timetable-time-slot">
      <Text className="timetable-time-start" strong>
        {timeSlot.startTime}
      </Text>
      <Text className="timetable-time-end" type="secondary">
        {timeSlot.endTime}
      </Text>
    </div>
  );
};

export default TimetableTimeSlot;
