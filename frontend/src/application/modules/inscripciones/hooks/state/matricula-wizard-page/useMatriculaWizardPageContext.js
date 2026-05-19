/**
 * Resuelve editData y flags de tipo de admisión desde contexto + location.
 */

import { useLocation } from 'react-router-dom';
import { useInscripcionesNuevaContext } from '../../context/useInscripcionesNuevaContext';

export const useMatriculaWizardPageContext = () => {
  const location = useLocation();
  const context = useInscripcionesNuevaContext();

  const editData =
    context.editData ?? (location.state?.mode === 'editar' ? location.state : null);
  const studentIdFromState = location.state?.studentId ?? null;

  const tipoAdmision =
    context.studentSearch?.selectedStudent?.tipoAdmision ?? editData?.tipoAdmision ?? null;
  const isNuevoEstudiante = String(tipoAdmision ?? '').toUpperCase() === 'NUEVO';
  const isTraspasoOrTransitabilidad = ['TRASPASO', 'TRANSITABILIDAD'].includes(
    String(tipoAdmision ?? '').toUpperCase(),
  );

  return {
    context,
    editData,
    studentIdFromState,
    isNuevoEstudiante,
    isTraspasoOrTransitabilidad,
  };
};
