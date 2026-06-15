/**
 * Envío de inscripción (create/update), mensajes y diálogo de pago requerido.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '@application/utils';
import { useCreateInscripcion } from '../../api/useCreateInscripcion';
import { useUpdateInscripcion } from '../../api/useUpdateInscripcion';
import { useSaveHistorialPrevio } from '../../api/useSaveHistorialPrevio';
import { isPaymentRequiredError } from '@application-inscripciones/utils/inscripcionPaymentErrors';
import {
  resolveSelectionByPeriod,
  validateInscripcionSubmit,
} from '@application-inscripciones/utils/inscripcionSubmitValidation';
import { buildInscripcionPayload } from '@application-inscripciones/utils/buildInscripcionPayload';
import { resolveInscripcionApiUserMessage } from '@application-inscripciones/utils/inscripcionApiErrors';

export const useMatriculaInscripcionSubmit = (mode = 'nuevo', options = {}, getFormValues) => {
  const {
    selectedStudent,
    selectedParalelo,
    selectedPeriod,
    selectedPeriodIds = [],
    selectedParalelosByPeriod = {},
    selectedMateriaIdsByPeriod = {},
    inscripcionId = null,
    buildPriorHistory = null,
    validatePriorHistory = null,
    historialPrevioHasRows = false,
    completarSoloHistorialPrevio = false,
  } = options;

  const isEditMode = Boolean(inscripcionId);
  const showMessage = useMessage();
  const navigate = useNavigate();

  const {
    createInscripcion,
    loading: loadingCreate,
    error: errorCreate,
    validationErrors: validationErrorsCreate,
  } = useCreateInscripcion();
  const {
    updateInscripcion,
    loading: loadingUpdate,
    error: errorUpdate,
    validationErrors: validationErrorsUpdate,
  } = useUpdateInscripcion();
  const { saveHistorialPrevio, loading: loadingHistorial } = useSaveHistorialPrevio();

  const loading = isEditMode ? loadingUpdate || loadingHistorial : loadingCreate;
  const error = isEditMode ? errorUpdate : errorCreate;
  const validationErrors = isEditMode ? validationErrorsUpdate : validationErrorsCreate;

  const [inscripcionResult, setInscripcionResult] = useState(null);
  const [paymentRequiredStudentId, setPaymentRequiredStudentId] = useState(null);
  const [materiasStepInvalid, setMateriasStepInvalid] = useState(false);
  const clearPaymentRequiredDialog = useCallback(() => setPaymentRequiredStudentId(null), []);

  const notifySubmitResult = useCallback(
    (result, successMessage, defaultErrorMessage) => {
      if (result?.success) {
        setMateriasStepInvalid(false);
        showMessage?.('success', successMessage);
        setInscripcionResult(result);
      } else if (result?.error) {
        const rawMsg =
          typeof result.error === 'object'
            ? result.error.message || defaultErrorMessage
            : result.error || defaultErrorMessage;
        const { message: userMsg, field } = resolveInscripcionApiUserMessage(
          rawMsg,
          result.errorDetails ?? (typeof result.error === 'object' ? result.error : null),
        );
        if (field === 'materiasPorPeriodo') {
          setMateriasStepInvalid(true);
        }
        showMessage?.('error', userMsg);
        setInscripcionResult(null);
      }
    },
    [showMessage],
  );

  const runSubmit = useCallback(
    async ({ navigateOnSuccess, successMessage, defaultErrorMessage, allowSoloHistorialBypass }) => {
      setMateriasStepInvalid(false);
      const formValues = getFormValues?.() ?? {};
      const studentId = selectedStudent?.id || formValues.student_id;
      const tipoAdmision =
        selectedStudent?.tipoAdmision ?? formValues.enrollment_type ?? 'NUEVO';
      const parallelId = selectedParalelo?.id || formValues.parallel_id;

      const selection = resolveSelectionByPeriod({
        tipoAdmision,
        selectedPeriodIds,
        selectedMateriaIdsByPeriod,
        selectedParalelosByPeriod,
      });

      const validation = validateInscripcionSubmit({
        studentId,
        parallelId,
        selection,
        isEditMode,
        completarSoloHistorialPrevio,
        historialPrevioHasRows,
        validatePriorHistory,
        allowSoloHistorialBypass,
      });

      if (!validation.valid) {
        showMessage?.('error', validation.errorMessage);
        return { success: false, error: validation.errorMessage };
      }

      if (validation.soloHistorial && isEditMode && inscripcionId && buildPriorHistory) {
        const priorHistory = buildPriorHistory();
        if (!Array.isArray(priorHistory) || priorHistory.length === 0) {
          showMessage?.('error', 'No hay notas de historial previo para guardar.');
          return { success: false, error: 'Historial previo vacío' };
        }
        const result = await saveHistorialPrevio(inscripcionId, priorHistory);
        if (result?.success) {
          showMessage?.('success', successMessage);
          setInscripcionResult(result);
          if (navigateOnSuccess) {
            navigate(`/inscripciones/${inscripcionId}`, { replace: true });
          }
        } else if (result?.error) {
          showMessage?.('error', result.error);
          setInscripcionResult(null);
        }
        return result;
      }

      const inscripcionData = buildInscripcionPayload({
        formValues,
        studentId,
        tipoAdmision,
        selectedPeriod,
        selectedPeriodIds,
        selectedParalelosByPeriod,
        selectedMateriaIdsByPeriod,
        selectedParalelo,
        hasSelectionByPeriod: validation.hasSelectionByPeriod,
        buildPriorHistory,
        soloHistorial: validation.soloHistorial,
        parallelId,
      });

      const result = isEditMode
        ? await updateInscripcion(inscripcionId, inscripcionData)
        : await createInscripcion(inscripcionData);

      if (result?.success) {
        showMessage?.('success', successMessage);
        setInscripcionResult(result);

        if (navigateOnSuccess) {
          const id = result.data?.enrollment?.id ?? result.data?.id ?? inscripcionId;
          if (id) {
            navigate(`/inscripciones/${id}`, { replace: true });
          } else if (!isEditMode) {
            console.warn('⚠️ Inscripción creada pero no se obtuvo ID para navegar');
          }
        }
      } else if (isPaymentRequiredError(result) && studentId) {
        setPaymentRequiredStudentId(Number(studentId));
        setInscripcionResult(null);
      } else {
        notifySubmitResult(result, successMessage, defaultErrorMessage);
      }

      return result;
    },
    [
      getFormValues,
      selectedStudent,
      selectedParalelo,
      selectedPeriod,
      selectedPeriodIds,
      selectedParalelosByPeriod,
      selectedMateriaIdsByPeriod,
      isEditMode,
      inscripcionId,
      completarSoloHistorialPrevio,
      historialPrevioHasRows,
      validatePriorHistory,
      buildPriorHistory,
      saveHistorialPrevio,
      createInscripcion,
      updateInscripcion,
      showMessage,
      navigate,
      notifySubmitResult,
    ],
  );

  const handleFinish = useCallback(
    () =>
      runSubmit({
        navigateOnSuccess: true,
        allowSoloHistorialBypass: true,
        successMessage: isEditMode
          ? 'Inscripción actualizada correctamente'
          : 'Inscripción completada correctamente',
        defaultErrorMessage: isEditMode
          ? 'Error al actualizar la inscripción'
          : 'Error al completar la inscripción',
      }),
    [runSubmit, isEditMode],
  );

  const handleSave = useCallback(
    () =>
      runSubmit({
        navigateOnSuccess: false,
        allowSoloHistorialBypass: false,
        successMessage: 'Datos guardados correctamente. Puede continuar después.',
        defaultErrorMessage: isEditMode
          ? 'Error al actualizar la inscripción'
          : 'Error al guardar los datos',
      }),
    [runSubmit, isEditMode],
  );

  return {
    handleFinish,
    handleSave,
    loading,
    error,
    validationErrors,
    inscripcionResult,
    paymentRequiredStudentId,
    clearPaymentRequiredDialog,
    materiasStepInvalid,
    setMateriasStepInvalid,
  };
};
