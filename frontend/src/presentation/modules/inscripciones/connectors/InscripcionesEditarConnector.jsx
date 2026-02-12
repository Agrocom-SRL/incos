/**
 * Conector: Editar Inscripción
 *
 * Single Responsibility: Cargar la inscripción por ID y mostrar el formulario en modo edición
 *
 * Patrón (como EditConnector de estudiantes):
 * - InscripcionDetailProvider: carga la inscripción con GetEnrollmentById
 * - Cuando está cargada, construye editData (periodos, materias, paralelos) y pasa a InscripcionesNuevaProvider
 * - InscripcionesNueva muestra el formulario con datos pre-llenados
 */

import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Spin, Alert } from 'antd';
import { InscripcionesProvider, InscripcionDetailProvider, InscripcionesNuevaProvider } from '@application-inscripciones/providers';
import { useInscripcionDetailContext } from '@application-inscripciones/hooks';
import InscripcionesNueva from '@inscripciones/pages/InscripcionesNueva';

/**
 * Construye editData para InscripcionesNuevaProvider a partir de la inscripción cargada por GetEnrollmentById.
 * Incluye selectedPeriodIds, materiaIdsByPeriod, parallelIdsByPeriod para estudiantes ANTIGUO (REINGRESO/CONTINUIDAD).
 */
function buildEditDataFromInscripcion(inscripcion) {
  if (!inscripcion?.enrollment) return null;

  const enrollment = inscripcion.enrollment;
  const student = inscripcion.student;
  const career = inscripcion.career;
  const enrollmentSubjects = inscripcion.enrollmentSubjects ?? [];

  const studentId = student?.id ?? enrollment?.estudianteId ?? enrollment?.studentId ?? null;
  const carreraId = career?.id ?? inscripcion.studentAcademicData?.carreraId ?? enrollment?.carreraId ?? null;
  const tipoInscripcion = enrollment?.tipoInscripcion ?? enrollment?.tipo_inscripcion ?? null;
  const inscripcionId = enrollment?.id ?? null;

  let periodoId = null;
  let paraleloId = null;
  let selectedPeriodIds = null;
  let materiaIdsByPeriod = null;
  let parallelIdsByPeriod = null;

  if (enrollmentSubjects.length > 0) {
    const byPeriod = {};
    enrollmentSubjects.forEach((item) => {
      const pid = item?.periodoId ?? item?.periodo_id ?? item?.periodId;
      const plid = item?.paraleloId ?? item?.paralelo_id ?? item?.parallelId;
      const mid = item?.materiaId ?? item?.materia_id ?? item?.subjectId;
      if (pid == null || mid == null) return;
      const key = String(pid);
      if (!byPeriod[key]) {
        byPeriod[key] = { materiaIds: [], paraleloId: plid };
      }
      if (!byPeriod[key].materiaIds.includes(mid)) byPeriod[key].materiaIds.push(Number(mid));
      if (plid != null) byPeriod[key].paraleloId = plid;
    });

    selectedPeriodIds = Object.keys(byPeriod).map(Number);
    materiaIdsByPeriod = {};
    parallelIdsByPeriod = {};
    Object.keys(byPeriod).forEach((key) => {
      materiaIdsByPeriod[key] = byPeriod[key].materiaIds;
      if (byPeriod[key].paraleloId != null) parallelIdsByPeriod[key] = byPeriod[key].paraleloId;
    });

    const first = enrollmentSubjects[0];
    periodoId = first?.periodoId ?? first?.periodo_id ?? first?.periodId ?? selectedPeriodIds[0] ?? null;
    paraleloId = first?.paraleloId ?? first?.paralelo_id ?? first?.parallelId ?? (parallelIdsByPeriod[String(selectedPeriodIds[0])] ?? null);
  }

  return {
    inscripcionId,
    studentId,
    carreraId,
    periodoId,
    paraleloId,
    tipoInscripcion,
    selectedPeriodIds: selectedPeriodIds?.length ? selectedPeriodIds : null,
    materiaIdsByPeriod: materiaIdsByPeriod && Object.keys(materiaIdsByPeriod).length ? materiaIdsByPeriod : null,
    parallelIdsByPeriod: parallelIdsByPeriod && Object.keys(parallelIdsByPeriod).length ? parallelIdsByPeriod : null,
  };
}

function InscripcionesEditarContent() {
  const { inscripcion, loading, error } = useInscripcionDetailContext();
  const editData = useMemo(() => buildEditDataFromInscripcion(inscripcion), [inscripcion]);

  if (loading) {
    return (
      <PageTemplate
        header={<PageHeader title="Editar Inscripción" breadcrumbItems={[{ title: 'Inicio', href: '/' }, { title: 'Inscripciones', href: '/inscripciones' }, { title: 'Editar Inscripción' }]} />}
      >
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large">
            <div style={{ minHeight: '200px' }}>
              <p>Cargando datos de la inscripción...</p>
            </div>
          </Spin>
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate
        header={<PageHeader title="Editar Inscripción" breadcrumbItems={[{ title: 'Inicio', href: '/' }, { title: 'Inscripciones', href: '/inscripciones' }, { title: 'Editar Inscripción' }]} />}
      >
        <Alert type="error" showIcon message="Error al cargar la inscripción" description={error} />
      </PageTemplate>
    );
  }

  if (!inscripcion || !editData) {
    return (
      <PageTemplate
        header={<PageHeader title="Editar Inscripción" breadcrumbItems={[{ title: 'Inicio', href: '/' }, { title: 'Inscripciones', href: '/inscripciones' }, { title: 'Editar Inscripción' }]} />}
      >
        <Alert type="warning" showIcon message="No se encontró la inscripción" />
      </PageTemplate>
    );
  }

  return (
    <InscripcionesNuevaProvider
      studentId={editData.studentId}
      editData={editData}
      mode="editar"
    >
      <InscripcionesNueva />
    </InscripcionesNuevaProvider>
  );
}

const InscripcionesEditarConnector = () => {
  const { id } = useParams();
  const inscripcionId = id;

  return (
    <InscripcionesProvider>
      <InscripcionDetailProvider inscripcionId={inscripcionId}>
        <InscripcionesEditarContent />
      </InscripcionDetailProvider>
    </InscripcionesProvider>
  );
};

export default InscripcionesEditarConnector;
