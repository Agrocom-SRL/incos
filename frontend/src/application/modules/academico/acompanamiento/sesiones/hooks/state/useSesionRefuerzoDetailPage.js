/**
 * Hook de pantalla: ficha de una sesión de refuerzo (ACA · DETALLE).
 *
 * Registro RÁPIDO de asistencia y progreso: la tabla de estudiantes se
 * edita en memoria (asistió / progreso / observaciones) y se persiste en un
 * solo batch (A9, sesion·EDITAR). También permite marcar la sesión como
 * REALIZADA/CANCELADA (A7) y navegar a la edición.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useSesionRefuerzoDetailContext } from '@application-academico/acompanamiento/sesiones/hooks/context/useSesionRefuerzoDetailContext';
import { mapFormValuesToSesionPayload } from '@application-academico/acompanamiento/sesiones/mappers/sesionRefuerzoMapper';
import {
  SESIONES_LIST_PATH,
  ACA_SESIONES_MENU_KEY,
  sesionEditarPath,
} from '@application-academico/acompanamiento/config/paths';

export const useSesionRefuerzoDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modal, notification } = App.useApp();

  const {
    sesionId,
    sesion,
    loading,
    error,
    refetch,
    saving,
    registrarEstudiantes,
    guardarSesion,
  } = useSesionRefuerzoDetailContext();

  const returnListPath = location.state?.returnListPath || SESIONES_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? ACA_SESIONES_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Académico' },
      { title: 'Sesiones de refuerzo', href: returnListPath },
      { title: 'Detalle de sesión' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!sesionId) return;
    navigate(sesionEditarPath(sesionId), { state: { returnListPath, menuSidebarKey } });
  }, [navigate, sesionId, returnListPath, menuSidebarKey]);

  // ————— Edición en memoria de estudiantes (batch A9) —————
  const [estudiantes, setEstudiantes] = useState([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setEstudiantes(sesion?.estudiantes ?? []);
    setDirty(false);
  }, [sesion]);

  /** Actualiza un campo de un estudiante en memoria. */
  const setEstudianteCampo = useCallback((estudianteKey, campo, valor) => {
    setEstudiantes((prev) =>
      prev.map((p) =>
        (p.id ?? p.matriculaMateriaId) === estudianteKey ? { ...p, [campo]: valor } : p,
      ),
    );
    setDirty(true);
  }, []);

  const handleGuardarAsistencia = useCallback(async () => {
    if (!sesionId) return;
    const payload = estudiantes.map((p) => ({
      id: p.id ?? undefined,
      matriculaMateriaId: p.matriculaMateriaId,
      asistio: p.asistio,
      progreso: p.progreso,
      observaciones: p.observaciones || null,
    }));
    const result = await registrarEstudiantes(sesionId, payload);
    if (result?.success) {
      notification.success({
        title: 'Asistencia registrada',
        description: 'Se guardó la asistencia y el progreso de los estudiantes.',
      });
      await refetch();
    } else {
      notification.error({
        title: 'No se pudo registrar la asistencia',
        description: result?.error || 'Intente nuevamente en unos instantes.',
      });
    }
  }, [sesionId, estudiantes, registrarEstudiantes, notification, refetch]);

  // ————— Transición de estado de la sesión (A7) —————
  const [procesandoEstado, setProcesandoEstado] = useState(false);

  const cambiarEstadoSesion = useCallback(
    (nuevoEstado) => {
      if (!sesionId || !sesion) return;
      const esCancelar = nuevoEstado === 'CANCELADA';
      modal.confirm({
        title: esCancelar ? 'Cancelar sesión' : 'Marcar sesión como realizada',
        content: esCancelar
          ? 'La sesión quedará como cancelada. ¿Desea continuar?'
          : 'La sesión quedará registrada como realizada. ¿Desea continuar?',
        okText: esCancelar ? 'Cancelar sesión' : 'Marcar realizada',
        okType: esCancelar ? 'danger' : 'primary',
        cancelText: 'Volver',
        onOk: async () => {
          setProcesandoEstado(true);
          try {
            // A7 actualiza los datos de la sesión; se reenvía el estado nuevo.
            const payload = {
              ...mapFormValuesToSesionPayload(
                {
                  asignacionDocenteId: sesion.asignacionDocenteId,
                  modalidad: sesion.modalidad,
                  aulaId: sesion.aulaId,
                  enlaceVirtual: sesion.enlaceVirtual,
                  tema: sesion.tema,
                  observaciones: sesion.observaciones,
                },
                { incluirEstudiantes: false },
              ),
              fecha: sesion.fecha,
              horaInicio: sesion.horaInicio,
              horaFin: sesion.horaFin,
              estado: nuevoEstado,
            };
            const result = await guardarSesion({ id: sesionId, payload });
            if (result?.success) {
              notification.success({
                title: esCancelar ? 'Sesión cancelada' : 'Sesión realizada',
              });
              await refetch();
            } else {
              notification.error({
                title: 'No se pudo actualizar la sesión',
                description: result?.error || 'Intente nuevamente en unos instantes.',
              });
            }
          } finally {
            setProcesandoEstado(false);
          }
        },
      });
    },
    [sesionId, sesion, modal, guardarSesion, notification, refetch],
  );

  return {
    sesionId,
    sesion,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    estudiantes,
    setEstudianteCampo,
    dirty,
    saving,
    handleGuardarAsistencia,
    puedeMarcarRealizada: sesion?.estado === 'PROGRAMADA',
    puedeCancelar: sesion?.estado === 'PROGRAMADA',
    procesandoEstado,
    cambiarEstadoSesion,
  };
};
