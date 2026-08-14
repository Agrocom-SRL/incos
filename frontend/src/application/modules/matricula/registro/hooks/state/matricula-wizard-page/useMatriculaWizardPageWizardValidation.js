/**
 * Validaciones al avanzar pasos del wizard de matrícula.
 */

import { useCallback, useMemo } from 'react';
import { App } from 'antd';

export const useMatriculaWizardPageWizardValidation = ({
  studentSearch,
  editData,
  carrerasData,
  periodosData,
  selectedMateriaIdsByPeriod,
  paralelosData,
  historialPrevioData,
  wizardStepMeta,
}) => {
  const { message } = App.useApp();
  // stepNumbers dinámicos (1-based): «carrera»/«historial» pueden ser null si el
  // paso está excluido; cada regla se guarda con null-check antes de comparar.
  const stepNumbers = useMemo(
    () =>
      wizardStepMeta?.stepNumbers ?? {
        carrera: 2,
        periodo: 3,
        paralelo: 4,
        historial: null,
      },
    [wizardStepMeta?.stepNumbers],
  );

  const handleValidateBeforeNext = useCallback(
    (stepNumber, formInstance) => {
      return new Promise((resolve, reject) => {
        // Paso 1 (Buscar estudiante): no avanzar sin un estudiante seleccionado.
        // En edición (editData) o con estudiante preseleccionado, selectedStudent ya viene poblado.
        if (stepNumber === 1 && !editData && !studentSearch?.selectedStudent) {
          message.error('Seleccione un estudiante de la lista de resultados antes de continuar.');
          reject(new Error('Estudiante no seleccionado'));
          return;
        }

        if (stepNumbers.carrera != null && stepNumber === stepNumbers.carrera) {
          const carreraId =
            formInstance?.getFieldValue('carrera') ?? carrerasData?.selectedCarrera?.id;
          if (!carreraId) {
            message.error('Por favor seleccione una carrera antes de continuar.');
            reject(new Error('Carrera no seleccionada'));
            return;
          }
          resolve();
          return;
        }

        // Paso «Periodo y materias»: los periodos se derivan de las materias
        // marcadas en la planilla, así que basta con exigir ≥1 materia en total.
        if (stepNumber === stepNumbers.periodo) {
          const totalMaterias = Object.values(selectedMateriaIdsByPeriod ?? {}).reduce(
            (acc, ids) => acc + (Array.isArray(ids) ? ids.length : 0),
            0,
          );
          if (totalMaterias === 0) {
            message.error('Marque al menos una materia de la planilla antes de continuar.');
            reject(new Error('Materias no seleccionadas'));
            return;
          }
          resolve();
          return;
        }

        if (stepNumber === stepNumbers.paralelo) {
          const selectedPeriodIds = periodosData?.selectedPeriodIds ?? [];
          const selectedParalelosByPeriod = paralelosData?.selectedParalelosByPeriod ?? {};
          const paralelosLoading = paralelosData?.loading ?? false;
          const paralelosAvailable = (paralelosData?.paralelos ?? []).length > 0;

          if (!selectedPeriodIds.length) {
            message.error('No hay periodos seleccionados. Por favor regrese al paso anterior.');
            reject(new Error('Periodos no seleccionados'));
            return;
          }
          if (paralelosLoading) {
            message.warning('Cargando paralelos disponibles. Por favor espere...');
            reject(new Error('Paralelos cargando'));
            return;
          }
          if (!paralelosAvailable) {
            message.error(
              'No hay paralelos disponibles para los periodos seleccionados. Por favor regrese al paso anterior y seleccione otros periodos.',
            );
            reject(new Error('No hay paralelos disponibles'));
            return;
          }

          const periodosSinParalelo = selectedPeriodIds.filter(
            (periodId) => !selectedParalelosByPeriod[periodId]?.id,
          );
          if (periodosSinParalelo.length > 0) {
            const periodosNombres = periodosSinParalelo
              .map((pid) => {
                const periodo = periodosData?.periodos?.find((p) => p.id === pid);
                return periodo?.nombre ?? `Periodo ${pid}`;
              })
              .join(', ');
            message.error(`Por favor seleccione un paralelo para: ${periodosNombres}`);
            reject(new Error('Paralelos no seleccionados'));
            return;
          }
          resolve();
          return;
        }

        if (stepNumbers.historial != null && stepNumber === stepNumbers.historial) {
          if (historialPrevioData?.hasRows && historialPrevioData?.validate) {
            const histValidation = historialPrevioData.validate();
            if (!histValidation.valid) {
              const msg =
                histValidation.missing > 0
                  ? `Complete la nota de las ${histValidation.missing} materia(s) ya concluida(s) (historial previo).`
                  : histValidation.invalid[0]?.reason || 'Revise las notas del historial previo.';
              message.error(msg);
              reject(new Error('Historial previo incompleto'));
              return;
            }
          }
          resolve();
          return;
        }

        // Pasos sin regla propia (p. ej. "Buscar estudiante"): validar los campos
        // requeridos montados del paso visible. El wizard solo monta los Form.Item del
        // paso actual, por lo que validateFields() sin argumentos valida exactamente
        // ese paso (con estudiante ya seleccionado la sección no tiene requeridos).
        if (formInstance?.validateFields) {
          formInstance.validateFields().then(resolve).catch(reject);
          return;
        }

        resolve();
      });
    },
    [
      stepNumbers,
      studentSearch?.selectedStudent,
      editData,
      carrerasData?.selectedCarrera,
      periodosData,
      selectedMateriaIdsByPeriod,
      paralelosData?.selectedParalelosByPeriod,
      paralelosData?.loading,
      paralelosData?.paralelos,
      historialPrevioData,
      message,
    ],
  );

  return { handleValidateBeforeNext };
};
