/**
 * Arma el body de inscripción para create/update (dominio inscripción).
 */

export const buildInscripcionPayload = ({
  formValues = {},
  studentId,
  tipoAdmision,
  selectedPeriod,
  selectedPeriodIds = [],
  selectedParalelosByPeriod = {},
  selectedMateriaIdsByPeriod = {},
  hasSelectionByPeriod,
  buildPriorHistory,
  soloHistorial,
  parallelId,
  planEstudioId = null,
}) => {
  const periodoId = selectedPeriod?.id ?? formValues.periodo_id ?? formValues.periodo;
  const enrollmentTypeForApi = formValues.enrollment_type || tipoAdmision || 'NUEVO';

  const inscripcionData = {
    student_id: studentId,
    periodo_id: periodoId ?? undefined,
    enrollment_type: enrollmentTypeForApi,
    observations: formValues.observations || null,
  };

  // Plan efectivo del contexto de matrícula (elección del selector o plan
  // resuelto por el backend). dataKey plan_estudio_id == dataFieldName del
  // validator de create/update (§3 del plan; planes duales RN-3/RN-4).
  if (planEstudioId != null) {
    inscripcionData.plan_estudio_id = Number(planEstudioId);
  }

  if (buildPriorHistory) {
    const priorHistory = buildPriorHistory();
    if (Array.isArray(priorHistory) && priorHistory.length > 0) {
      inscripcionData.prior_history = priorHistory;
    }
  }

  if (hasSelectionByPeriod) {
    const parallelIdsByPeriod = {};
    const materiaIdsByPeriod = {};
    const periodIdsToSend = selectedPeriodIds?.length
      ? selectedPeriodIds
      : Object.keys(selectedMateriaIdsByPeriod || {});

    for (const periodId of periodIdsToSend) {
      const materiaIds = selectedMateriaIdsByPeriod?.[periodId];
      if (!Array.isArray(materiaIds) || materiaIds.length === 0) continue;
      const paralelo = selectedParalelosByPeriod?.[periodId];
      const pid = paralelo?.id ?? paralelo;
      if (pid == null) continue;
      const key = String(periodId);
      parallelIdsByPeriod[key] = Number(pid);
      materiaIdsByPeriod[key] = materiaIds.map(Number);
    }

    if (Object.keys(materiaIdsByPeriod).length > 0) {
      inscripcionData.parallel_ids_by_period = parallelIdsByPeriod;
      inscripcionData.materia_ids_by_period = materiaIdsByPeriod;
    }
  }

  if (!inscripcionData.parallel_ids_by_period && parallelId) {
    inscripcionData.parallel_id = parallelId;
  }

  if (soloHistorial && !hasSelectionByPeriod && !parallelId) {
    delete inscripcionData.parallel_id;
    delete inscripcionData.parallel_ids_by_period;
    delete inscripcionData.materia_ids_by_period;
  }

  return inscripcionData;
};
