/**
 * Tab Horario semanal: color del docente + grilla de lectura.
 */
import { Flex } from 'antd';
import HorariosConflictosPlanSection from '@institucional/horarios/components/organisms/HorariosConflictosPlanSection';
import DocenteAsignacionesColorSection from './DocenteAsignacionesColorSection';

const DocenteAsignacionesHorarioTabSection = ({
  form,
  savingColor,
  onSaveColor,
  schedules,
  horarioSlotIndex,
  turnoLabel,
}) => (
  <Flex vertical gap={24} className="docente-asignaciones-horario-tab">
    <DocenteAsignacionesColorSection form={form} saving={savingColor} onSave={onSaveColor} />
    <HorariosConflictosPlanSection
      schedules={schedules}
      onSchedulesChange={() => {}}
      horarioSlotIndex={horarioSlotIndex}
      editable={false}
      showSave={false}
      turnoLabel={turnoLabel}
      vistaLabel="Horario semanal"
      vistaHint="Vista de lectura de las asignaciones vigentes en la gestión actual."
      headerMinimal
    />
  </Flex>
);

export default DocenteAsignacionesHorarioTabSection;
