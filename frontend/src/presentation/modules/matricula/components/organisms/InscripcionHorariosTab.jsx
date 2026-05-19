import { Empty } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { SLOT_STEP_INSCRIPCION } from '@application-inscripciones/utils/inscripcionDetailHelpers';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import ParaleloPlanSemanaCell from '@institucional/horarios/components/atoms/ParaleloPlanSemanaCell';

const InscripcionHorariosTab = ({
  courseSchedules = [],
  gridRangeInscripcion,
  sabadoRangeInscripcion,
}) => (
  <div className="sd-tab-body">
    <section className="da-cal-semanal-section" aria-labelledby="inscripcion-horarios-title">
      <header className="da-cal-semanal-section__head">
        <CalendarOutlined className="da-cal-semanal-section__icon" aria-hidden />
        <h2 id="inscripcion-horarios-title" className="da-cal-semanal-section__title">
          Calendario semanal de materias inscritas
        </h2>
      </header>
      <p className="da-cal-semanal-section__lede">
        Cada bloque muestra hora, sigla, nombre de la materia, paralelo, turno, docente y aula para que puedas ubicarte
        en la semana.
      </p>
      {courseSchedules.length > 0 ? (
        <DocenteHorarioSemanalGrid
          courseSchedules={courseSchedules}
          CellComponent={ParaleloPlanSemanaCell}
          gridTimeRange={gridRangeInscripcion}
          saturdayGridTimeRange={sabadoRangeInscripcion}
          slotStepMinutes={SLOT_STEP_INSCRIPCION}
          uniformSlotGrid
          editable={false}
          cellExtraProps={{}}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin horarios asignados en las materias inscritas" />
      )}
    </section>
  </div>
);

export default InscripcionHorariosTab;
