import { useMemo } from 'react';
import { useMatriculaWizardFormInstance } from './useMatriculaWizardFormInstance';
import { useMatriculaInscripcionSubmit } from './useMatriculaInscripcionSubmit';

/**
 * Orquestador: formulario del wizard de matrícula + envío de inscripción.
 */
export const useMatriculaWizardFormHandlers = (mode = 'nuevo', options = {}) => {
  const { form, getFormValues } = useMatriculaWizardFormInstance({
    selectedStudent: options.selectedStudent,
    selectedParalelo: options.selectedParalelo,
    selectedPeriod: options.selectedPeriod,
  });

  const submit = useMatriculaInscripcionSubmit(mode, options, getFormValues);

  return useMemo(
    () => ({
      form,
      getFormValues,
      ...submit,
    }),
    [form, getFormValues, submit],
  );
};
