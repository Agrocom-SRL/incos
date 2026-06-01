import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useAuthContext } from '@application-auth';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import docenteRepository from '@implementations/DocenteRepository';
import { useDocenteColorApi } from '../api/useDocenteColorApi';
import { useDocenteDetail } from './useDocenteDetail';

export const useDocentesAsignacionesGestionPage = (docenteIdRaw) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermiso } = useAuthContext();
  const { message } = App.useApp();
  const detail = useDocenteDetail(docenteIdRaw);
  const { updateDocenteColor } = useDocenteColorApi();
  const [savingColor, setSavingColor] = useState(false);
  const {
    docenteId,
    nombreCompleto,
    profile,
    assignments,
    loading,
    error,
    returnListPath,
    handleVolver,
    refetch,
  } = detail;

  const puedeGestionarAsignaciones =
    hasPermiso('docentes.asignar', 'CREAR') ||
    hasPermiso('docentes.asignar', 'EDITAR') ||
    hasPermiso('docentes.asignar', 'ELIMINAR') ||
    hasPermiso('docentes.editar', 'EDITAR');
  const puedeEditarAsignaciones = hasPermiso('docentes.asignar', 'EDITAR');
  const puedeEliminarAsignaciones = hasPermiso('docentes.asignar', 'ELIMINAR');
  const puedeAsignarMaterias = puedeGestionarAsignaciones;
  const puedeEditarColor = hasPermiso('docentes.editar', 'EDITAR');
  const gestionReturnPath = location.state?.gestionReturnPath || returnListPath || '/docentes/listar';

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Docentes', href: returnListPath || '/docentes/listar' },
      { title: 'Materias asignadas' },
    ],
    [returnListPath]
  );

  const handleIrWizardAsignacion = useCallback(() => {
    if (!docenteId) return;
    navigate('/docentes/asignar', {
      state: {
        menuSidebarKey: 'DOC-LIST',
        returnListPath: `/docentes/${docenteId}/asignaciones`,
        gestionReturnPath,
        docenteId,
        docenteNombre: nombreCompleto,
        asignacionFocus: 'cursos',
      },
    });
  }, [docenteId, navigate, gestionReturnPath, nombreCompleto]);

  const handleEditAssignment = useCallback(
    (assignment) => {
      if (!docenteId || !assignment?.id) return;
      navigate('/docentes/asignar', {
        state: {
          menuSidebarKey: 'DOC-LIST',
          returnListPath: `/docentes/${docenteId}/asignaciones`,
          gestionReturnPath,
          docenteId,
          docenteNombre: nombreCompleto,
          asignacionFocus: 'cursos',
          editAssignment: assignment,
        },
      });
    },
    [docenteId, navigate, gestionReturnPath, nombreCompleto]
  );

  const { deleteItem } = useDeleteItem({
    deleteFn: (id) => docenteRepository.eliminarAsignacion(id),
    itemName: 'la asignación',
    onSuccess: async () => {
      await refetch?.();
    },
  });

  const handleDeleteAssignment = useCallback(
    (assignment) => {
      if (!assignment?.id) return;
      deleteItem(assignment.id, `la asignación de ${assignment.materia || 'materia'}`, [
        { label: 'Materia', value: assignment.materia || '—' },
        { label: 'Paralelo', value: assignment.paralelo || '—' },
        { label: 'Turno', value: assignment.turnoParalelo || '—' },
        { label: 'Horas / sem.', value: assignment.cargaHorariaSemanal ?? '—' },
        { label: 'Fecha asignación', value: assignment.fechaAsignacion || '—' },
      ]);
    },
    [deleteItem]
  );

  const handleSaveColor = useCallback(
    async (colorHex) => {
      if (!docenteId) return;
      setSavingColor(true);
      try {
        const res = await updateDocenteColor(docenteId, colorHex);
        if (!res.success) {
          throw new Error(typeof res.error === 'string' ? res.error : 'No se pudo guardar el color');
        }
        await refetch?.();
        message.success('Color del docente actualizado');
      } finally {
        setSavingColor(false);
      }
    },
    [docenteId, refetch, updateDocenteColor, message],
  );

  return {
    docenteId,
    nombreCompleto,
    profile,
    assignments,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    puedeAsignarMaterias,
    puedeEditarAsignaciones,
    puedeEliminarAsignaciones,
    puedeEditarColor,
    savingColor,
    handleSaveColor,
    handleIrWizardAsignacion,
    handleEditAssignment,
    handleDeleteAssignment,
  };
};

