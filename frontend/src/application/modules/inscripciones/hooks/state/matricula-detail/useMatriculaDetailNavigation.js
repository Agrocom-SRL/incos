/**
 * Navegación y breadcrumb de la ficha de matrícula.
 */

import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useMatriculaDetailNavigation = (inscripcionId, inscripcion) => {
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Lista de matrículas', href: '/matricula/listar' },
      { title: 'Detalle de la inscripción' },
    ],
    [],
  );

  const handleVolverAtras = useCallback(() => {
    const studentIdFromState = location.state?.studentId;
    const studentIdFromData = inscripcion?.student?.id || inscripcion?.enrollment?.studentId;
    const targetStudentId = studentIdFromState || studentIdFromData;

    if (targetStudentId) {
      navigate(`/estudiantes/${targetStudentId}`);
    } else {
      navigate('/matricula/listar');
    }
  }, [navigate, location.state, inscripcion]);

  const handleEditar = useCallback(() => {
    if (!inscripcionId) return;
    navigate(`/inscripciones/${inscripcionId}/editar`);
  }, [navigate, inscripcionId]);

  return { breadcrumbItems, handleVolverAtras, handleEditar };
};
