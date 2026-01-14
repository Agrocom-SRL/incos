/**
 * TimetableSchedule - Componente organismo para horario de clases
 * 
 * Single Responsibility: Mostrar horario de clases semanal con vista de calendario
 * 
 * Atomic Design: Organism
 * - Compone múltiples moléculas (TimetableHeader, TimetableCell, TimetableTimeSlot)
 * - Usa hooks personalizados para procesar datos
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * - La lógica de procesamiento está en hooks (useTimetableData)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI del horario
 * - Open/Closed: Extensible mediante props y configuración
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * 
 * Features:
 * - Vista semanal (Lunes a Sábado)
 * - Bloques horarios configurables
 * - Colores por materia/paralelo
 * - Tooltips con información detallada
 * - Detección de conflictos de horario
 * - Responsive design
 */

import React from 'react';
import { Card, Empty } from 'antd';
import { Spinner } from '@atoms';
import { TimetableHeader, TimetableTimeSlot, TimetableCell } from '@molecules';
import { useTimetableData } from './hooks/useTimetableData';

/**
 * Componente principal para mostrar horario de clases
 * 
 * @param {Object} props
 * @param {Array} props.schedule - Array de clases con horarios
 * @param {Object} props.config - Configuración del horario (días, horas, etc.)
 * @param {Function} props.onClassClick - Callback al hacer click en una clase
 * @param {Function} props.onCellClick - Callback al hacer click en celda vacía
 * @param {boolean} props.editable - Si el horario es editable
 * @param {boolean} props.loading - Si está cargando datos
 */
export const TimetableSchedule = ({
  schedule = [],
  config = {},
  onClassClick,
  onCellClick,
  editable = false,
  loading = false,
}) => {
  // Validar que schedule sea un array válido
  const validSchedule = Array.isArray(schedule) ? schedule : [];

  // Hook para procesar y organizar los datos del horario
  const {
    processedSchedule,
    timeSlots,
    days,
    hasConflicts,
  } = useTimetableData(validSchedule, config);

  // Mostrar loading si está cargando
  if (loading) {
    return (
      <Card className="timetable-schedule">
        <div className="timetable-loading">
          <Spinner size="large" text="Cargando horario..." />
        </div>
      </Card>
    );
  }

  // Mostrar mensaje vacío si no hay schedule o está vacío
  if (!validSchedule || validSchedule.length === 0) {
    return (
      <Card className="timetable-schedule">
        <Empty
          description="No hay clases programadas"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card 
      className="timetable-schedule"
    >
      {/* Mostrar advertencia de conflictos si existen */}
      {hasConflicts && (
        <div style={{ marginBottom: 'var(--spacing-base)' }}>
          <span className="timetable-warning">
            ⚠️ Se detectaron conflictos de horario
          </span>
        </div>
      )}
      <div className="timetable-container">
        {/* Header con días de la semana */}
        <TimetableHeader days={days} />

        {/* ✅ Grid con columnas dinámicas */}
        <div className="timetable-grid">
          {timeSlots.map((timeSlot, slotIndex) => {
            // ✅ Calcular número de columnas dinámicamente
            const gridColumns = `80px repeat(${days.length}, 1fr)`;
            
            return (
              <div 
                key={slotIndex} 
                className="timetable-row"
                style={{ gridTemplateColumns: gridColumns }}
              >
                {/* Columna de hora */}
                <TimetableTimeSlot timeSlot={timeSlot} />

                {/* Celdas para cada día */}
                {days.map((day) => {
                  const classData = processedSchedule[day.key]?.[timeSlot.key];
                  
                  return (
                    <TimetableCell
                      key={`${day.key}-${timeSlot.key}`}
                      classData={classData}
                      day={day}
                      timeSlot={timeSlot}
                      editable={editable}
                      onClassClick={onClassClick}
                      onCellClick={onCellClick}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default TimetableSchedule;
