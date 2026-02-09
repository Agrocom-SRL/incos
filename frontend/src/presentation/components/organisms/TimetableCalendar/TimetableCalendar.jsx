/**
 * TimetableCalendar - Componente organismo para horario de clases con React Big Calendar
 * 
 * Single Responsibility: Mostrar horario de clases semanal con vista de calendario usando React Big Calendar
 * 
 * Atomic Design: Organism
 * - Usa React Big Calendar para renderizar el calendario
 * - Reutiliza helpers y enrichers existentes para transformación de datos
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * - La lógica de transformación de datos está en horarioEnrichers.js
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI del horario con React Big Calendar
 * - Open/Closed: Extensible mediante props y configuración
 * - Dependency Inversion: Depende de datos transformados (abstracciones)
 * 
 * Features:
 * - Vista semanal (Lunes a Sábado) usando React Big Calendar
 * - Múltiples vistas (work_week, week, day)
 * - Colores por materia/paralelo
 * - Detección de conflictos de horario
 * - Responsive design
 * - Reutiliza horarioEnrichers.js y timetableHelpers.js
 */

import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/es';
import { Card, Empty, Alert } from 'antd';
import { Spinner } from '@atoms';
import { TimetableCell } from '@molecules';
import './TimetableCalendar.css';

// Configurar moment en español
moment.locale('es');
const localizer = momentLocalizer(moment);

/**
 * Convierte los horarios transformados a eventos de React Big Calendar
 * 
 * @param {Array} schedule - Schedule transformado por horarioEnrichers
 * @returns {Array} Eventos para React Big Calendar
 */
const transformScheduleToEvents = (schedule = []) => {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return [];
  }

  // Mapeo de días a números (React Big Calendar usa fechas reales)
  const dayMap = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 0,
  };

  // Usar la semana actual como base
  const currentWeek = moment().startOf('week');

  return schedule.map((classItem, index) => {
    const dayNumber = dayMap[classItem.day] || 1;
    const eventDate = currentWeek.clone().day(dayNumber);

    // Parsear hora de inicio y fin
    const [startHour, startMin] = classItem.startTime.split(':').map(Number);
    const [endHour, endMin] = classItem.endTime.split(':').map(Number);

    const start = eventDate.clone()
      .hour(startHour)
      .minute(startMin)
      .toDate();

    const end = eventDate.clone()
      .hour(endHour)
      .minute(endMin)
      .toDate();

    return {
      id: classItem.id || index,
      title: classItem.materia,
      start,
      end,
      resource: {
        ...classItem,
        color: classItem.color,
      },
    };
  });
};

/**
 * Componente principal con React Big Calendar
 * 
 * @param {Object} props
 * @param {Array} props.schedule - Array de clases con horarios
 * @param {Object} props.config - Configuración del horario (días, horas, etc.)
 * @param {Function} props.onClassClick - Callback al hacer click en una clase
 * @param {boolean} props.loading - Si está cargando datos
 */
export const TimetableCalendar = ({
  schedule = [],
  config = {},
  onClassClick,
  loading = false,
}) => {
  // Validar schedule
  const validSchedule = Array.isArray(schedule) ? schedule : [];

  // Convertir schedule a eventos
  const events = useMemo(
    () => transformScheduleToEvents(validSchedule),
    [validSchedule]
  );

  // Detectar conflictos (verificando solapamientos de horarios)
  const hasConflicts = useMemo(() => {
    if (validSchedule.length === 0) return false;

    const parseTime = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Agrupar por día
    const scheduleByDay = {};
    validSchedule.forEach((item) => {
      if (!scheduleByDay[item.day]) {
        scheduleByDay[item.day] = [];
      }
      scheduleByDay[item.day].push(item);
    });

    // Verificar solapamientos en cada día
    for (const day in scheduleByDay) {
      const daySchedule = scheduleByDay[day];
      
      for (let i = 0; i < daySchedule.length; i++) {
        for (let j = i + 1; j < daySchedule.length; j++) {
          const item1 = daySchedule[i];
          const item2 = daySchedule[j];
          
          const start1 = parseTime(item1.startTime);
          const end1 = parseTime(item1.endTime);
          const start2 = parseTime(item2.startTime);
          const end2 = parseTime(item2.endTime);
          
          // Verificar si hay solapamiento
          if ((start1 < end2 && end1 > start2)) {
            return true;
          }
        }
      }
    }

    return false;
  }, [validSchedule]);

  // Calcular rango de horas desde el schedule, redondeando a bloques de 45 minutos
  const timeRange = useMemo(() => {
    if (validSchedule.length === 0) {
      // Default: 13:45 - 19:00
      return { 
        min: new Date(0, 0, 0, 13, 45, 0), 
        max: new Date(0, 0, 0, 19, 0, 0) 
      };
    }

    const parseTime = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const allTimes = validSchedule.flatMap(item => [
      parseTime(item.startTime),
      parseTime(item.endTime),
    ]);

    const minMinutes = Math.min(...allTimes);
    const maxMinutes = Math.max(...allTimes);

    // Redondear a bloques de 45 minutos
    const roundToBlock = (minutes, roundDown = true) => {
      const blockSize = 45;
      const blocks = roundDown 
        ? Math.floor(minutes / blockSize) 
        : Math.ceil(minutes / blockSize);
      return blocks * blockSize;
    };

    const adjustedMin = roundToBlock(minMinutes, true);
    const adjustedMax = roundToBlock(maxMinutes, false);

    const minHour = Math.floor(adjustedMin / 60);
    const minMinute = adjustedMin % 60;
    const maxHour = Math.floor(adjustedMax / 60);
    const maxMinute = adjustedMax % 60;

    return {
      min: new Date(0, 0, 0, minHour, minMinute, 0),
      max: new Date(0, 0, 0, maxHour, maxMinute, 0),
    };
  }, [validSchedule]);

  // Días dinámicos desde config o calculados
  const visibleDays = useMemo(() => {
    if (config.days && config.days.length > 0) {
      // Mapear días del config a números
      const dayMap = {
        'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0,
      };
      return config.days.map(day => dayMap[day.key]).filter(d => d !== undefined);
    }

    // Calcular desde schedule
    const uniqueDays = new Set(
      validSchedule.map(item => {
        const dayMap = {
          'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0,
        };
        return dayMap[item.day];
      }).filter(Boolean)
    );

    return Array.from(uniqueDays).sort();
  }, [config.days, validSchedule]);

  // Mostrar loading
  if (loading) {
    return (
      <Card className="timetable-calendar">
        <div className="timetable-loading">
          <Spinner size="large" text="Cargando horario..." />
        </div>
      </Card>
    );
  }

  // Mostrar mensaje vacío
  if (validSchedule.length === 0) {
    return (
      <Card className="timetable-calendar">
        <Empty
          description="No hay clases programadas"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  // Estilos personalizados para eventos
  const eventStyleGetter = (event) => {
    const backgroundColor = event.resource?.color || '#1890ff';
    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor,
        color: '#000',
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
        padding: '4px 8px',
      },
    };
  };

  // Componente personalizado para eventos usando TimetableCell
  // Adapta el evento de React Big Calendar a los props que espera TimetableCell
  const EventComponent = ({ event }) => {
    // Convertir el evento de React Big Calendar a classData para TimetableCell
    const classData = {
      id: event.resource?.id || event.id,
      materia: event.title || event.resource?.materia,
      paralelo: event.resource?.paralelo || null,
      docente: event.resource?.docente || null,
      startTime: event.resource?.startTime || moment(event.start).format('HH:mm'),
      endTime: event.resource?.endTime || moment(event.end).format('HH:mm'),
      aula: event.resource?.aula || null,
      color: event.resource?.color || '#1890ff',
      hasConflict: event.resource?.hasConflict || false,
      cursoId: event.resource?.cursoId || null,
      materiaId: event.resource?.materiaId || null,
      ordenSecuencia: event.resource?.ordenSecuencia || null,
      // React Big Calendar maneja el span automáticamente, no necesitamos spanSlots
      spanSlots: 1,
      isContinuation: false,
    };

    // Wrapper para adaptar el estilo de React Big Calendar al de TimetableCell
    // El padding y estilos se manejan en CSS para mejor integración
    return (
      <TimetableCell
        classData={classData}
        day={null} // No necesario en React Big Calendar
        timeSlot={null} // No necesario en React Big Calendar
        editable={false}
        onClassClick={onClassClick}
        onCellClick={null}
      />
    );
  };

  // Formatos personalizados
  const formats = {
    dayFormat: (date, culture, localizer) =>
      localizer.format(date, 'dddd', culture),
    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, 'HH:mm', culture),
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
  };

  return (
    <Card className="timetable-calendar">
      {hasConflicts && (
        <Alert
          title="⚠️ Se detectaron conflictos de horario"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 650 }}
        defaultView="work_week"
        views={['work_week']} // Solo vista semanal de trabajo
        min={timeRange.min}
        max={timeRange.max}
        step={15} // Incrementos de 15 minutos para precisión
        timeslots={3} // 3 slots de 15 min = 45 minutos por bloque visual
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
          toolbar: () => null, // ✅ Ocultar toolbar completamente
        }}
        formats={formats}
        messages={{
          work_week: 'Semana',
          today: 'Hoy',
          previous: 'Anterior',
          next: 'Siguiente',
          showMore: (total) => `+${total} más`,
        }}
        onSelectEvent={(event) => onClassClick?.(event.resource)}
        date={moment().toDate()}
      />
    </Card>
  );
};

export default TimetableCalendar;
