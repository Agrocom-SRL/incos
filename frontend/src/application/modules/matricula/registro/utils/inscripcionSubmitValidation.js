/**
 * Validaciones previas al POST/PUT de inscripción (sin React).
 */

export const resolveSelectionByPeriod = ({
  tipoAdmision,
  selectedPeriodIds = [],
  selectedMateriaIdsByPeriod = {},
  selectedParalelosByPeriod = {},
}) => {
  const isAntiguo = tipoAdmision !== 'NUEVO';
  const periodIdsToConsider = selectedPeriodIds?.length
    ? selectedPeriodIds
    : Object.keys(selectedMateriaIdsByPeriod || {});

  const periodIdsWithMaterias = periodIdsToConsider.filter(
    (pid) =>
      Array.isArray(selectedMateriaIdsByPeriod?.[pid]) &&
      selectedMateriaIdsByPeriod[pid].length > 0,
  );

  const periodsMissingParallel = periodIdsWithMaterias.filter((pid) => {
    const paralelo = selectedParalelosByPeriod?.[pid];
    const pidVal = paralelo?.id ?? paralelo;
    return pidVal == null || pidVal === '' || Number(pidVal) < 1;
  });

  const hasSelectionByPeriod =
    isAntiguo && periodIdsWithMaterias.length > 0 && periodsMissingParallel.length === 0;

  return {
    isAntiguo,
    periodIdsWithMaterias,
    periodsMissingParallel,
    hasSelectionByPeriod,
  };
};

export const validateInscripcionSubmit = ({
  studentId,
  parallelId,
  selection,
  isEditMode,
  completarSoloHistorialPrevio,
  historialPrevioHasRows,
  validatePriorHistory,
  allowSoloHistorialBypass = false,
}) => {
  const { isAntiguo, periodIdsWithMaterias, periodsMissingParallel, hasSelectionByPeriod } =
    selection;

  if (!studentId) {
    return { valid: false, errorMessage: 'Debe seleccionar un estudiante' };
  }

  if (isAntiguo && periodIdsWithMaterias.length > 0 && periodsMissingParallel.length > 0) {
    const errorMessage =
      periodIdsWithMaterias.length === 1
        ? 'Debe seleccionar un paralelo para el periodo con materias seleccionadas.'
        : `Debe seleccionar un paralelo para cada periodo con materias seleccionadas. Faltan paralelos en ${periodsMissingParallel.length} periodo(s).`;
    return { valid: false, errorMessage };
  }

  const soloHistorial = Boolean(
    allowSoloHistorialBypass &&
      isEditMode &&
      completarSoloHistorialPrevio &&
      historialPrevioHasRows &&
      validatePriorHistory,
  );

  if (!soloHistorial && !hasSelectionByPeriod && !parallelId) {
    return {
      valid: false,
      errorMessage: 'Debe seleccionar un paralelo o completar periodo y materias por periodo',
    };
  }

  if (historialPrevioHasRows && validatePriorHistory) {
    const histValidation = validatePriorHistory();
    if (!histValidation.valid) {
      const errorMessage =
        histValidation.missing > 0
          ? `Complete la nota de las ${histValidation.missing} materia(s) concluida(s) pendiente(s) en historial previo.`
          : histValidation.invalid[0]?.reason ||
            'Revise las notas del historial previo (0–100, mínimo 61 para aprobar).';
      return { valid: false, errorMessage };
    }
  }

  return { valid: true, soloHistorial, hasSelectionByPeriod };
};
