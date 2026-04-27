/**
 * Calendario semanal (lunes a sábado, desde las 08:00): fuera de DetailInfoCard, solo sección + grilla.
 */

import { Empty } from 'antd';
import { ScheduleOutlined } from '@ant-design/icons';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';

const countBloques = (courseSchedules) =>
  (courseSchedules || []).reduce((n, c) => n + (c.bloques?.length ?? 0), 0);

const DocenteSchedulesSection = ({ courseSchedules = [] }) => {
  const total = countBloques(courseSchedules);

  return (
    <section className="da-cal-semanal-section" aria-labelledby="da-cal-semanal-section-title">
      <header className="da-cal-semanal-section__head">
        <ScheduleOutlined className="da-cal-semanal-section__icon" aria-hidden />
        <h2 id="da-cal-semanal-section-title" className="da-cal-semanal-section__title">
          Calendario semanal
        </h2>
      </header>
      <p className="da-cal-semanal-section__lede">Franjas según bloques reales del horario (normalmente de 45 min), separando lunes-viernes y sábado cuando tienen parrillas distintas. En cada celda: horario del bloque, curso, aula, turno y paralelo.</p>
      {total === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin bloques de horario vinculados a cursos vigentes" />
      ) : (
        <DocenteHorarioSemanalGrid courseSchedules={courseSchedules} />
      )}
    </section>
  );
};

export default DocenteSchedulesSection;
