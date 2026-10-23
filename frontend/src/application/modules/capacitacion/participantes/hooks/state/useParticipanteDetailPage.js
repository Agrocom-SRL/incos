/**
 * Hook de pantalla: ficha de un participante de capacitación (CAP · DETALLE).
 *
 * Espejo de `useCursoCapacitacionDetailPage`: orquesta breadcrumbs, volver,
 * editar, eliminar (soft delete en cascada de sus inscripciones y pagos, con confirmación
 * que lo advierte) y abrir una inscripción del historial. La
 * página es "dumb".
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useParticipanteDetailContext } from '@application-capacitacion/participantes/hooks/context/useParticipanteDetailContext';
import { useParticipanteMutations } from '@application-capacitacion/participantes/hooks/api/useParticipanteMutations';
import {
  PARTICIPANTES_CAP_LIST_PATH,
  CAP_PARTICIPANTES_MENU_KEY,
  participanteCapEditarPath,
  inscripcionCapDetallePath,
} from '@application-capacitacion/config/paths';

/** Advertencia de la eliminación en cascada (inscripciones y pagos) antes de confirmar. */
const textoConfirmacionEliminar = (participante) => {
  const nombre = participante?.nombreCompleto ?? 'este participante';
  const total = participante?.inscripciones?.length ?? 0;
  if (total === 0) return `Se eliminará a «${nombre}». ¿Desea continuar?`;
  return `Se eliminará a «${nombre}» junto con sus ${total} inscripción(es) a cursos y todos sus pagos. Los pagos dejarán de figurar en los ingresos de Finanzas. Esta acción no se puede deshacer. ¿Desea continuar?`;
};

export const useParticipanteDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modal, notification } = App.useApp();

  const { participanteId, participante, loading, error, refetch } = useParticipanteDetailContext();
  const { eliminarParticipante } = useParticipanteMutations();
  const [eliminando, setEliminando] = useState(false);

  const returnListPath = location.state?.returnListPath || PARTICIPANTES_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_PARTICIPANTES_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Participantes', href: returnListPath },
      { title: 'Detalle de participante' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!participanteId) return;
    navigate(participanteCapEditarPath(participanteId), { state: { returnListPath, menuSidebarKey } });
  }, [navigate, participanteId, returnListPath, menuSidebarKey]);

  const handleVerInscripcion = useCallback(
    (inscripcion) => {
      navigate(inscripcionCapDetallePath(inscripcion.id), {
        state: { returnListPath: location.pathname, menuSidebarKey },
      });
    },
    [navigate, location.pathname, menuSidebarKey],
  );

  const handleEliminar = useCallback(() => {
    if (!participanteId) return;
    modal.confirm({
      title: 'Eliminar participante',
      content: textoConfirmacionEliminar(participante),
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Volver',
      onOk: async () => {
        setEliminando(true);
        try {
          const result = await eliminarParticipante(participanteId);
          if (result?.success) {
            notification.success({
              title: 'Participante eliminado',
              description: 'El participante fue eliminado.',
            });
            navigate(returnListPath, { state: { menuSidebarKey } });
          } else {
            notification.error({
              title: 'No se pudo eliminar el participante',
              duration: 10,
              description: result?.error || 'Intente nuevamente en unos instantes.',
            });
          }
        } finally {
          setEliminando(false);
        }
      },
    });
  }, [
    participanteId,
    participante,
    modal,
    eliminarParticipante,
    notification,
    navigate,
    returnListPath,
    menuSidebarKey,
  ]);

  return {
    participanteId,
    participante,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    handleEliminar,
    handleVerInscripcion,
    eliminando,
  };
};
