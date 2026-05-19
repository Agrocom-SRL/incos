/**
 * Generación / descarga de boleta de inscripción.
 */

import { useCallback } from 'react';
import { App } from 'antd';
import { useGenerateBoletaInscripcion } from '../../features/useGenerateBoletaInscripcion';

export const useMatriculaDetailBoleta = (inscripcion) => {
  const { message } = App.useApp();
  const { generateBoletaInscripcion, loading: generatingBoleta } = useGenerateBoletaInscripcion();

  const boletaInscripcion =
    inscripcion?.formularioInscripcion ?? inscripcion?.data?.formularioInscripcion ?? null;
  const studentId = inscripcion?.student?.id || inscripcion?.enrollment?.studentId;

  const handleDownloadOrGenerateBoleta = useCallback(async () => {
    if (!studentId) {
      message.error('No se puede continuar: ID del estudiante no disponible');
      return;
    }

    try {
      const result = await generateBoletaInscripcion(studentId);

      if (result.success) {
        message.success(
          boletaInscripcion
            ? 'Boleta de inscripción descargada correctamente'
            : 'Boleta de inscripción generada y descargada exitosamente',
        );
        if (!boletaInscripcion) {
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        message.error(result.error || 'Error al obtener la boleta de inscripción');
      }
    } catch (err) {
      console.error('Error al obtener la boleta de inscripción:', err);
      message.error(
        'Error al obtener la boleta de inscripción. La operación puede estar tardando más de lo esperado.',
      );
    }
  }, [studentId, generateBoletaInscripcion, boletaInscripcion, message]);

  return {
    generatingBoleta,
    boletaInscripcion,
    studentId,
    handleDownloadOrGenerateBoleta,
  };
};
