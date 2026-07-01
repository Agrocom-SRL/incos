/**
 * InscripcionesDetail — Ficha de matrícula (solo UI).
 */

import { Spin, Alert, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useInscripcionDetailContext } from '@application-inscripciones/hooks';
import { useAuthContext, esEstudiante } from '@application-auth';
import InscripcionProfileSummary from '@inscripciones/components/organisms/InscripcionProfileSummary';
import InscripcionDetailTabs from '@inscripciones/components/organisms/InscripcionDetailTabs';
import '@presentation/styles/pages/detail-page.css';

const InscripcionesDetail = () => {
  const { hasPermiso, usuario } = useAuthContext();
  /** Vista propia del estudiante (reusa esta pantalla como "Mi matrícula"). */
  const esVistaPropiaEstudiante = esEstudiante(usuario);
  const pageTitle = esVistaPropiaEstudiante ? 'Mi matrícula' : 'Detalle de la Inscripción';
  const puedeGenerarBoletaPdf = hasPermiso('matricula.documento.ver', 'GENERAR_PDF');
  const puedeEditarInscripcion = hasPermiso('matricula.inscripcion.editar', 'EDITAR');
  const puedeActivarCursado = hasPermiso('matricula.inscripcion.editar', 'EDITAR');

  const {
    inscripcion,
    loading,
    error,
    generatingBoleta,
    boletaInscripcion,
    studentId,
    handleDownloadOrGenerateBoleta,
    handleVolverAtras,
    handleEditar,
    breadcrumbItems,
    tipoInscripcion,
    canEdit,
    enrollment,
    studentAcademicData,
    management,
    student,
    career,
    subjectEnrollments,
    priorEnrollmentHistories,
    requiereHistorialPrevio,
    cantidadHistorialPrevio,
    historialEstadoInfo,
    nombreCompleto,
    avatarText,
    courseSchedules,
    gridRangeInscripcion,
    sabadoRangeInscripcion,
    estadoCursado,
    puedeActivar,
    activating,
    handleActivarCursado,
  } = useInscripcionDetailContext();

  // En la vista propia del estudiante no hay "Volver" (no viene de un listado admin).
  const headerActions = esVistaPropiaEstudiante ? null : (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolverAtras}>
      <ArrowLeftOutlined /> Volver
    </button>
  );

  const pageHeader = (
    <PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={headerActions} />
  );

  if (loading) {
    return (
      <PageTemplate header={pageHeader}>
        <div className="sd-loading">
          <Spin size="large" />
          <p>Cargando datos de la inscripción…</p>
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate header={pageHeader}>
        <Alert title="Error al cargar la inscripción" description={error} type="error" showIcon />
      </PageTemplate>
    );
  }

  if (!inscripcion?.enrollment) {
    return (
      <PageTemplate header={pageHeader}>
        <Empty description="No se encontró información de la inscripción" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate header={pageHeader}>
      <div className="sd">
        <InscripcionProfileSummary
          avatarText={avatarText}
          nombreCompleto={nombreCompleto}
          tipoInscripcion={tipoInscripcion}
          student={student}
          management={management}
          subjectCount={subjectEnrollments.length}
          historialEstadoInfo={historialEstadoInfo}
          estadoCursado={estadoCursado}
          puedeActivarCursado={puedeActivarCursado && puedeActivar}
          activatingCursado={activating}
          onActivarCursado={handleActivarCursado}
          puedeEditarInscripcion={puedeEditarInscripcion}
          canEdit={canEdit}
          onEditar={handleEditar}
          puedeGenerarBoletaPdf={puedeGenerarBoletaPdf}
          boletaInscripcion={boletaInscripcion}
          generatingBoleta={generatingBoleta}
          studentId={studentId}
          onDownloadOrGenerateBoleta={handleDownloadOrGenerateBoleta}
        />
        <div className="sd-tabs-shell">
          <InscripcionDetailTabs
            student={student}
            nombreCompleto={nombreCompleto}
            enrollment={enrollment}
            studentAcademicData={studentAcademicData}
            management={management}
            career={career}
            subjectEnrollments={subjectEnrollments}
            priorEnrollmentHistories={priorEnrollmentHistories}
            requiereHistorialPrevio={requiereHistorialPrevio}
            historialEstadoInfo={historialEstadoInfo}
            cantidadHistorialPrevio={cantidadHistorialPrevio}
            courseSchedules={courseSchedules}
            gridRangeInscripcion={gridRangeInscripcion}
            sabadoRangeInscripcion={sabadoRangeInscripcion}
            puedeEditarInscripcion={puedeEditarInscripcion}
            canEdit={canEdit}
            onEditar={handleEditar}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default InscripcionesDetail;
