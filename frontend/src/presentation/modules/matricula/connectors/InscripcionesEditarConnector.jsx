/**
 * Conector: Editar inscripción
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
 * Usa selectedPeriodIds, materiaIdsByPeriod y parallelIdsByPeriod devueltos por la API cuando existen;
 * si no, los deriva de subjectEnrollments (retrocompatibilidad).
 */
function buildEditDataFromInscripcion(inscripcion) {
  if (!inscripcion?.enrollment) return null;

  const enrollment = inscripcion.enrollment;
  const student = inscripcion.student;
  const career = inscripcion.career;
  const subjectEnrollments = inscripcion.subjectEnrollments ?? [];

  const studentId = student?.id ?? enrollment?.estudianteId ?? enrollment?.studentId ?? null;
  const carreraId = career?.id ?? inscripcion.studentAcademicData?.carreraId ?? enrollment?.carreraId ?? null;
  const tipoInscripcion = enrollment?.tipoInscripcion ?? enrollment?.tipo_inscripcion ?? null;
  const tipoAdmision =
    student?.tipoAdmision ??
    inscripcion.studentAcademicData?.tipoAdmision ??
    student?.admissionType ??
    enrollment?.tipoInscripcion ??
    enrollment?.tipo_inscripcion ??
    null;
  const inscripcionId = enrollment?.id ?? null;

  let periodoId = null;
  let paraleloId = null;
  let selectedPeriodIds = inscripcion.selectedPeriodIds ?? null;
  let materiaIdsByPeriod = inscripcion.materiaIdsByPeriod ?? null;
  let parallelIdsByPeriod = inscripcion.parallelIdsByPeriod ?? null;

  if ((!selectedPeriodIds?.length || !materiaIdsByPeriod || !Object.keys(materiaIdsByPeriod).length) && subjectEnrollments.length > 0) {
    const byPeriod = {};
    subjectEnrollments.forEach((item) => {
      const pid = item?.periodoId ?? item?.periodo_id ?? item?.periodId;
      const plid = item?.paraleloId ?? item?.paralelo_id ?? item?.parallelId;
      const mid = item?.materiaId ?? item?.materia_id ?? item?.subjectId;
      if (pid == null || mid == null) return;
      const key = String(pid);
      if (!byPeriod[key]) byPeriod[key] = { materiaIds: [], paraleloId: plid };
      if (!byPeriod[key].materiaIds.includes(mid)) byPeriod[key].materiaIds.push(Number(mid));
      if (plid != null) byPeriod[key].paraleloId = plid;
    });

    if (!selectedPeriodIds?.length) selectedPeriodIds = Object.keys(byPeriod).map(Number);
    if (!materiaIdsByPeriod || !Object.keys(materiaIdsByPeriod).length) {
      materiaIdsByPeriod = {};
      Object.keys(byPeriod).forEach((key) => { materiaIdsByPeriod[key] = byPeriod[key].materiaIds; });
    }
    if (!parallelIdsByPeriod || !Object.keys(parallelIdsByPeriod).length) {
      parallelIdsByPeriod = {};
      Object.keys(byPeriod).forEach((key) => {
        if (byPeriod[key].paraleloId != null) parallelIdsByPeriod[key] = byPeriod[key].paraleloId;
      });
    }

    const first = subjectEnrollments[0];
    periodoId = first?.periodoId ?? first?.periodo_id ?? first?.periodId ?? selectedPeriodIds?.[0] ?? null;
    paraleloId = first?.paraleloId ?? first?.paralelo_id ?? first?.parallelId ?? (selectedPeriodIds?.[0] != null ? parallelIdsByPeriod[String(selectedPeriodIds[0])] : null) ?? null;
  } else if (selectedPeriodIds?.length) {
    periodoId = selectedPeriodIds[0];
    paraleloId = parallelIdsByPeriod?.[String(selectedPeriodIds[0])] ?? null;
  }

  const traspasoAnioCursado =
    student?.traspasoAnioCursado ??
    student?.transfer?.anioCursado ??
    inscripcion.traspasoAnioCursado ??
    null;

  return {
    inscripcionId,
    studentId,
    carreraId,
    periodoId,
    paraleloId,
    tipoInscripcion,
    tipoAdmision,
    traspasoAnioCursado,
    selectedPeriodIds: selectedPeriodIds?.length ? selectedPeriodIds : null,
    materiaIdsByPeriod: materiaIdsByPeriod && Object.keys(materiaIdsByPeriod).length ? materiaIdsByPeriod : null,
    parallelIdsByPeriod: parallelIdsByPeriod && Object.keys(parallelIdsByPeriod).length ? parallelIdsByPeriod : null,
    priorEnrollmentHistories: inscripcion.priorEnrollmentHistories ?? [],
    historialPrevioEstado: inscripcion.historialPrevioEstado ?? null,
    completarSoloHistorialPrevio:
      (inscripcion.historialPrevioEstado === 'PENDIENTE' ||
        inscripcion.requiereHistorialPrevio === true) &&
      (inscripcion.cantidadHistorialPrevio ?? 0) === 0,
  };
}

function InscripcionesEditarContent() {
  const { inscripcion, loading, error } = useInscripcionDetailContext();
  const editData = useMemo(() => buildEditDataFromInscripcion(inscripcion), [inscripcion]);

  if (loading) {
    return (
      <PageTemplate
        header={<PageHeader title="Editar inscripción" breadcrumbItems={[{ title: 'Inicio', href: '/' }, { title: 'Lista de matrículas', href: '/matricula/listar' }, { title: 'Editar inscripción' }]} />}
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
        header={<PageHeader title="Editar inscripción" breadcrumbItems={[{ title: 'Inicio', href: '/' }, { title: 'Lista de matrículas', href: '/matricula/listar' }, { title: 'Editar inscripción' }]} />}
      >
        <Alert type="error" showIcon title="Error al cargar la inscripción" description={error} />
      </PageTemplate>
    );
  }

  if (!inscripcion || !editData) {
    return (
      <PageTemplate
        header={<PageHeader title="Editar inscripción" breadcrumbItems={[{ title: 'Inicio', href: '/' }, { title: 'Lista de matrículas', href: '/matricula/listar' }, { title: 'Editar inscripción' }]} />}
      >
        <Alert type="warning" showIcon title="No se encontró la inscripción" />
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
