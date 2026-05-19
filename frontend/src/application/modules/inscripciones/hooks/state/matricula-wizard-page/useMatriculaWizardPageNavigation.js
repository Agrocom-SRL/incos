/**
 * Navegación y efectos secundarios de la página de matrícula nueva.
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadFile } from '@application/utils/fileDownload';
import { MENU_SIDEBAR_KEY_MAT_APORTES } from '@navigation-services/routeMapper';

export const useMatriculaWizardPageNavigation = ({
  studentIdFromState,
  inscripcionResult,
  paymentRequiredStudentId,
  clearPaymentRequiredDialog,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (inscripcionResult?.success && inscripcionResult?.data?.formularioInscripcion) {
      const { filePath, fileName } = inscripcionResult.data.formularioInscripcion;
      if (filePath && fileName) {
        setTimeout(() => {
          try {
            downloadFile(filePath, fileName);
          } catch (err) {
            console.error('Error al descargar el formulario de inscripción:', err);
          }
        }, 3000);
      }
    }
  }, [inscripcionResult]);

  const handleGoToRegistrarPago = useCallback(() => {
    if (paymentRequiredStudentId) {
      clearPaymentRequiredDialog();
      navigate('/pagos/registrar', {
        state: {
          studentId: paymentRequiredStudentId,
          menuSidebarKey: MENU_SIDEBAR_KEY_MAT_APORTES,
        },
      });
    }
  }, [paymentRequiredStudentId, clearPaymentRequiredDialog, navigate]);

  const handleVolver = useCallback(() => {
    if (studentIdFromState) {
      navigate(`/estudiantes/${studentIdFromState}`);
    } else {
      navigate('/matricula/listar');
    }
  }, [navigate, studentIdFromState]);

  return { handleGoToRegistrarPago, handleVolver };
};
