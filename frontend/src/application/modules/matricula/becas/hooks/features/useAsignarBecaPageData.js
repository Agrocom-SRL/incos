/**
 * Hook: useAsignarBecaPageData
 *
 * Single Responsibility: Gestionar todos los datos específicos de la página de asignar beca
 *
 * Clean Architecture:
 * - Application Layer: Hook feature que maneja lógica específica de la página
 *
 * Este hook:
 * - Determina el título de la página (puede ser dinámico según parámetros)
 * - Genera los breadcrumb items basándose en el título
 * - Maneja handlers de navegación (handleVolver)
 * - Centraliza toda la lógica específica de la página
 *
 * Usado por: AsignarBecaProvider (para exponer datos vía Context)
 */

import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook para obtener todos los datos específicos de la página de asignar beca
 *
 * @param {Object} options - Opciones para personalizar el comportamiento
 * @param {string} options.studentName - Nombre del estudiante (opcional, para título dinámico)
 * @param {string|number} options.studentId - ID del estudiante (para navegación)
 * @returns {Object} Objeto con todos los datos de la página y handlers
 */
export const useAsignarBecaPageData = (options = {}) => {
  const { studentName, studentId, isEditMode = false } = options;
  const navigate = useNavigate();
  const location = useLocation();

  const returnSelectionPath = location.state?.returnSelectionPath;
  const returnListPath = location.state?.returnListPath;
  const menuSidebarKeyFromState = location.state?.menuSidebarKey;
  // Origen con contexto propio (formulario de registro de pago): volver ahí,
  // con su state completo (studentId incluido, que ese formulario exige).
  const returnTo = location.state?.returnTo;
  const returnState = location.state?.returnState;

  const pageTitle = useMemo(() => {
    if (studentName) {
      return `${isEditMode ? 'Editar asignación de beca' : 'Asignar beca'} - ${studentName}`;
    }
    return isEditMode ? 'Editar asignación de beca' : 'Asignar beca';
  }, [studentName, isEditMode]);

  // Breadcrumb con jerarquía de dominio (patrón de Seguridad/Configuración)
  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Matrícula' },
      { title: 'Becas y descuentos', href: '/estudiantes/becas/listar' },
      { title: isEditMode ? 'Editar asignación de beca' : 'Asignar beca' },
    ],
    [isEditMode]
  );

  const handleVolver = useCallback(() => {
    if (returnTo) {
      navigate(returnTo, { state: returnState || (studentId ? { studentId } : undefined) });
      return;
    }
    const navExtras = menuSidebarKeyFromState ? { menuSidebarKey: menuSidebarKeyFromState } : undefined;
    if (returnSelectionPath) {
      navigate(returnSelectionPath, { state: navExtras });
      return;
    }
    if (returnListPath) {
      navigate(returnListPath, { state: navExtras });
      return;
    }
    if (studentId) {
      navigate(`/estudiantes/${studentId}`);
    } else {
      navigate('/estudiantes/listar');
    }
  }, [navigate, returnTo, returnState, returnSelectionPath, returnListPath, menuSidebarKeyFromState, studentId]);

  return useMemo(() => {
    return {
      pageTitle,
      breadcrumbItems,
      handleVolver,
    };
  }, [pageTitle, breadcrumbItems, handleVolver]);
};
