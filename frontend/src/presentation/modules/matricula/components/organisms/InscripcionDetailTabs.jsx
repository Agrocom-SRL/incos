import { useMemo } from 'react';
import { Tabs } from 'antd';
import { BookOutlined, HistoryOutlined, CalendarOutlined } from '@ant-design/icons';
import InscripcionResumenTab from './InscripcionResumenTab';
import InscripcionHistorialPrevioTab from './InscripcionHistorialPrevioTab';
import InscripcionMateriasTab from './InscripcionMateriasTab';
import InscripcionHorariosTab from './InscripcionHorariosTab';

const InscripcionDetailTabs = ({
  student,
  nombreCompleto,
  enrollment,
  studentAcademicData,
  management,
  career,
  subjectEnrollments,
  priorEnrollmentHistories,
  requiereHistorialPrevio,
  historialEstadoInfo,
  cantidadHistorialPrevio,
  courseSchedules,
  gridRangeInscripcion,
  sabadoRangeInscripcion,
  puedeEditarInscripcion,
  canEdit,
  onEditar,
}) => {
  const tabItems = useMemo(
    () => [
      {
        key: 'inscripcion',
        label: (
          <span className="sd-tab-label">
            <BookOutlined /> Inscripción
          </span>
        ),
        children: (
          <InscripcionResumenTab
            student={student}
            nombreCompleto={nombreCompleto}
            enrollment={enrollment}
            studentAcademicData={studentAcademicData}
            management={management}
            career={career}
            subjectEnrollments={subjectEnrollments}
            requiereHistorialPrevio={requiereHistorialPrevio}
            historialEstadoInfo={historialEstadoInfo}
            cantidadHistorialPrevio={cantidadHistorialPrevio}
            priorEnrollmentHistories={priorEnrollmentHistories}
          />
        ),
      },
      {
        key: 'historial-previo',
        label: (
          <span className="sd-tab-label">
            <HistoryOutlined /> Historial previo
          </span>
        ),
        children: (
          <InscripcionHistorialPrevioTab
            requiereHistorialPrevio={requiereHistorialPrevio}
            priorEnrollmentHistories={priorEnrollmentHistories}
            puedeEditarInscripcion={puedeEditarInscripcion}
            canEdit={canEdit}
            onEditar={onEditar}
          />
        ),
      },
      {
        key: 'materias',
        label: (
          <span className="sd-tab-label">
            <BookOutlined /> Materias
          </span>
        ),
        children: <InscripcionMateriasTab subjectEnrollments={subjectEnrollments} />,
      },
      {
        key: 'horarios',
        label: (
          <span className="sd-tab-label">
            <CalendarOutlined /> Horarios
          </span>
        ),
        children: (
          <InscripcionHorariosTab
            courseSchedules={courseSchedules}
            gridRangeInscripcion={gridRangeInscripcion}
            sabadoRangeInscripcion={sabadoRangeInscripcion}
          />
        ),
      },
    ],
    [
      student,
      nombreCompleto,
      enrollment,
      studentAcademicData,
      management,
      career,
      subjectEnrollments,
      priorEnrollmentHistories,
      requiereHistorialPrevio,
      historialEstadoInfo,
      cantidadHistorialPrevio,
      courseSchedules,
      gridRangeInscripcion,
      sabadoRangeInscripcion,
      puedeEditarInscripcion,
      canEdit,
      onEditar,
    ],
  );

  return <Tabs defaultActiveKey="inscripcion" items={tabItems} className="sd-tabs" />;
};

export default InscripcionDetailTabs;
